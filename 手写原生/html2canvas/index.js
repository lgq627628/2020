const FLAG_MAP = {
    NORMAL: 0,
    TEXT: 1,
    IMG: 2,
    INPUT: 3
};
class html2canvas {
    constructor(el) {
        this.el = el;
        const { left, top } = this.el.getBoundingClientRect();
        this.globalOffset = { x: left, y: top };
        this.vdom = this.parseTree(this.el);
        this.canvas = this.createCanvas(this.el);
        this.ctx2d = this.canvas.getContext('2d');
        this.parseZIndex(this.vdom, this.vdom);
        this.render(this.vdom);
        console.log(this.vdom);
        document.body.appendChild(this.canvas);
    }
    /**
     * 把 dom 元素变成一棵树结构有父子关系， 然后有bounds信息，列出坐标位置，还有样式和虚拟 dom 有点类似
     */
    parseTree(el) {
        // 里面包含了每一层节点的：
        // bounds - 位置信息（宽/高、横/纵坐标）
        // elements - 子元素信息
        // flags - 用来决定如何渲染的标志
        // styles - 样式描述信息
        // textNodes - 文本节点信息
        const styles = window.getComputedStyle(el);
        const bound = el.getBoundingClientRect();
        const { x, y } = this.globalOffset;
        const bounds = new Bounds(bound.top - y, bound.left - x, bound.width, bound.height);
        const obj = {
            bounds,
            styles: styles,
            elements: [],
            flags: FLAG_MAP.NORMAL,
            textNodes: [],
            tag: el.tagName,
            className: el.className,
            el,
        };
        if (el.tagName === 'IMG') {
            obj.url = el.src;
            obj.flags = FLAG_MAP.IMG;
            console.log(el.src);
        }
        [...el.childNodes].map((child) => {
            if (child.nodeType === 3) {
                if (child.textContent.trim().length > 0) {
                    // 如果是文本节点
                    const textObj = {
                        text: el.textContent,
                        bounds: bounds,
                    };
                    obj.textNodes.push(textObj);
                    obj.flags = FLAG_MAP.TEXT;
                }
            } else {
                obj.elements.push(this.parseTree(child));
            }
        });
        return obj;
    }
    /**
     * 把刚才解析的 dom 树节点变成按照层级（如 zIndex）划分的数组
     */
    parseZIndex(vdom) {
        // inlineLevel - 内联元素
        // negativeZIndex - zIndex为负的元素
        // nonInlineLevel - 非内联元素
        // nonPositionedFloats - 未定位的浮动元素
        // nonPositionedInlineLevel - 内联的非定位元素，包含内联表和内联块
        // positiveZIndex - z-index大于等于1的元素
        // zeroOrAutoZIndexOrTransformedOrOpacity
        const zIndexObj = {
            negativeZIndex: [],
            normalZIndex: [],
            positiveZIndex: [],
        };
        Object.assign(vdom, zIndexObj);
        vdom.elements.map((child) => {
            const zIndex = child.styles.zIndex;
            if (zIndex > 0) {
                // zIndex 可能是 1、10、100，所以其实不是直接 push，而是要比较之后插入
                vdom.positiveZIndex.push(child);
            } else if (zIndex < 0) {
                vdom.negativeZIndex.push(child);
            } else {
                vdom.normalZIndex.push(child);
            }
            this.parseZIndex(child);
        });
    }
    /**
     * 根据划分的层级数组，一层一层从下往上绘制，并且转换成相对应的 canvas 绘图语句
     */
    render(level) {
        // 图片就 this.ctx.drawImage
        // 文案就 this.ctx.fillText
        // 输入框
        const { negativeZIndex = [], normalZIndex = [], positiveZIndex = [] } = level;
        this.ctx2d.save();
        this.setTransformAndOpacity(level);
        this.renderBgAndBorder(level);
        negativeZIndex.map((el) => this.render(el));
        normalZIndex.map((el) => this.render(el));
        this.renderContent(level);
        positiveZIndex.map((el) => this.render(el));
        this.ctx2d.restore();
    }
    setTransformAndOpacity (level) {
        const { bounds, styles } = level;
        const { transform, opacity, transformOrigin } = styles;
        if (transform !== 'none') {
            level.hasTransform = true;
            const centerPos = [ bounds.left + bounds.width / 2, bounds.top + bounds.height / 2]
            const matrix = transform.slice(7, -1).split(', ').map(Number);
            const origin = transformOrigin.split(' ').map(_ => parseInt(_, 10));
            level.centerPos = centerPos;
            level.origin = origin;
            this.ctx2d.translate(centerPos[0], centerPos[1]);
            this.ctx2d.transform(
                matrix[0],
                matrix[1],
                matrix[2],
                matrix[3],
                matrix[4],
                matrix[5]
            );
            this.ctx2d.translate(-centerPos[0], -centerPos[1]);
        }
        if (opacity < 1.0) {
            this.ctx2d.globalAlpha = opacity;
        }
    }
    renderBgAndBorder(level) {
        const { bounds, styles } = level;
        const { ctx2d } = this;
        const bg = styles.backgroundColor;
        const borderWidth = parseInt(styles.borderWidth);
        const { top, left, width, height } = bounds;
        let points = [[left, top], [left + width, top], [left + width, top + height], [left, top + height]]
        
        if (level.hasTransform) {
            const centerPos = level.centerPos;
            const width = parseInt(styles.width);
            const height = parseInt(styles.height);
            points = [
                [centerPos[0] - width / 2, centerPos[1] - height / 2],
                [centerPos[0] + width / 2, centerPos[1] - height / 2],
                [centerPos[0] + width / 2, centerPos[1] + height / 2],
                [centerPos[0] - width / 2, centerPos[1] + height / 2]
            ]
        }
        // 画背景
        const bgArr = bg.slice(5, -1).split(', ');
        if (bgArr[bgArr.length - 1] !== 0) {
            console.log('画背景', level.className);
            ctx2d.save();
            ctx2d.beginPath();
            this.drawPathByPoints(points);
            ctx2d.closePath();
            ctx2d.fillStyle = bg;
            ctx2d.fill();
            ctx2d.restore();
        }
        // 画边框
        if (borderWidth) {
            ctx2d.save();
            ctx2d.beginPath();
            this.drawPathByPoints(points);
            ctx2d.closePath();
            ctx2d.lineWidth = borderWidth;
            ctx2d.strokeStyle = styles.borderColor;
            ctx2d.stroke();
            ctx2d.restore();
        }
    }
    async renderContent(level) {
        const { ctx2d } = this;
        const { flags, textNodes, styles, bounds } = level;
        if (flags === FLAG_MAP.TEXT) {
            console.log('画文本', level.className);
            textNodes.map(text => {
                ctx2d.save();
                ctx2d.font = styles.fontWeight + ' ' + styles.fontSize + ' ' + styles.fontFamily;
                ctx2d.fillStyle = styles.color;
                ctx2d.fillText(text.text, text.bounds.left, text.bounds.top + parseInt(styles.fontSize));
                ctx2d.restore();
            })
        } else if (flags === FLAG_MAP.IMG) {
            // const imgEle = await new Promise((resolve, reject) => {
            //     const img = new Image();
            //     img.onload = () => {
            //         console.log('画图片', level.className);
            //         resolve(img);
            //     }
            //     img.onerror = (e) => {
            //         reject(e)
            //     }
            //     img.src = level.url;
            // });
            this.ctx2d.drawImage(level.el, 0, 0, parseInt(styles.width), parseInt(styles.height), bounds.left, bounds.top, bounds.width, bounds.height);
        } else if (flags === FLAG_MAP.INPUT) {

        }
    }
    drawPathByPoints(points) {
        points.map((point, i) => {
            if (i === 0) {
                this.ctx2d.moveTo(point[0], point[1]);
            } else {
                this.ctx2d.lineTo(point[0], point[1]);
            }
        })
    }
    createCanvas(el) {
        const { width, height } = el.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        const ctx2d = canvas.getContext('2d');
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        ctx2d.scale(dpr, dpr);
        return canvas;
    }
}

class Bounds {
    constructor(top, left, width, height) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
    }
}
