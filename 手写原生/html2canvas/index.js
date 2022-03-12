class html2canvas {
    constructor(el) {
        this.el = el;
        this.global = this.formatGlobal(this.el);
        this.root = this.parseTree(this.global, this.el); // 返回的是新对象
        const stack = this.parseStackingContext(this.root); // 返回的是新对象
        this.createCanvas(this.el);
        this.render(stack);
        document.body.appendChild(this.canvas);
        console.log('====== 解析 html 之后的结果 ======');
        console.log(this.root);
        console.log('====== 层叠上下文分组后的结果 ======');
        console.log(stack);
    }
    /**
     * 处理一些全局信息，目前就只处理了整体偏移，也可以在这边合并传进来的一些参数
     * 为什么要处理整体偏移量，因为当页面滚动的时候，假如绘制的时候不加上这个偏移量，top 就会变成负值，导致绘制的时候产生空白
     */
    formatGlobal(el) {
        const { left, top } = el.getBoundingClientRect();
        return {
            offset: { x: left, y: top },
        };
    }
    /**
     * 按照原有的树结构遍历整个 dom，变成我们自己需要的新对象 ElContainer，和构建虚拟 dom 有点类似
     * ElContainer 的属性主要包括坐标位置和大小、样式、子元素等
     */
    parseTree(global, el) {
        const container = this.createContainer(global, el);
        this.parseNodeTree(global, el, container);
        return container;
    }
    parseNodeTree(global, el, parent) {
        [...el.childNodes].map((child) => {
            if (child.nodeType === 3) {
                // 如果是文本节点
                if (child.textContent.trim().length > 0) {
                    // 文本节点不为空
                    const textElContainer = new TextElContainer(child.textContent, parent);
                    parent.textNodes.push(textElContainer);
                }
            } else {
                // 如果是普通节点
                const container = this.createContainer(global, child);

                const { position, zIndex, opacity, transform } = container.styles;
                if ((position !== 'static' && !isNaN(zIndex)) || opacity < 1 || transform !== 'none') { // 需不需要创建层叠上下文的标志，后续会用到
                    container.flags = 1;
                }
                parent.elements.push(container);
                this.parseNodeTree(global, child, container);
            }
        });
    }
    createContainer(global, el) {
        if (el.tagName === 'IMG') {
            return new ImageElContainer(global, el);
        } else if (el.tagName === 'INPUT') {
            return new InputElContainer(global, el);
        } else {
            return new ElContainer(global, el);
        }
    }
    /**
     * 把刚才解析的 root 对象变成按照层级（这里就拿 zIndex 举例）划分的数组
     */
    parseStackingContext(container) {
        const root = new StackingContext(container);
        this.parseStackTree(container, root);
        return root;
    }
    parseStackTree(parent, stackingContext) {
        parent.elements.map((child) => {
            if (child.flags) { // 创建新的层叠上下文的标识
                const stack = new StackingContext(child);
                const zIndex = child.styles.zIndex;
                if (zIndex > 0) {
                    // zIndex 可能是 1、10、100，所以其实不是直接 push，而是要比较之后插入
                    stackingContext.positiveZIndex.push(stack);
                } else if (zIndex < 0) {
                    stackingContext.negativeZIndex.push(stack);
                } else {
                    stackingContext.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                }
                this.parseStackTree(child, stack);
            } else {
                if (child.styles.display.indexOf('inline') >= 0) {
                    stackingContext.inlineLevel.push(child);
                } else {
                    stackingContext.nonInlineLevel.push(child);
                }
                this.parseStackTree(child, stackingContext);
            }
        });
    }
    /**
     * 根据划分的层级数组，一层一层从下往上绘制，并且转换成相对应的 canvas 绘图语句
     */
    render(stack) {
        const { negativeZIndex = [], nonInlineLevel = [], inlineLevel = [], positiveZIndex = [], zeroOrAutoZIndexOrTransformedOrOpacity = [] } = stack;
        this.ctx2d.save();
        // 1、先设置会影响全局的属性，比如 transform 和 opacity
        this.setTransformAndOpacity(stack.container);
        // 2、绘制背景和边框
        this.renderNodeBackgroundAndBorders(stack.container);
        // 3、绘制 zIndex < 0 的元素
        negativeZIndex.map((el) => this.render(el));
        // 4、绘制自身内容
        this.renderNodeContent(stack.container);
        // 5、绘制块状元素
        nonInlineLevel.map((el) => this.renderNode(el));
        // 6、绘制行内元素
        inlineLevel.map((el) => this.renderNode(el));
        // 7、绘制 z-index: auto || 0、transform: none、opacity小于1 的元素
        zeroOrAutoZIndexOrTransformedOrOpacity.map((el) => this.render(el));
        // 8、绘制 zIndex > 0 的元素
        positiveZIndex.map((el) => this.render(el));
        this.ctx2d.restore();
    }
    renderNodeContent(container) {
        if (container.textNodes.length) {
            container.textNodes.map((text) => this.renderText(text, container.styles));
        } else if (container instanceof ImageElContainer) {
            this.renderImg(container);
        } else if (container instanceof InputElContainer) {
            this.renderInput(container);
        }
    }
    renderNode(container) {
        this.renderNodeBackgroundAndBorders(container);
        this.renderNodeContent(container);
    }
    /**
     * 由于 transform 和 opacity 等属性会影响元素自身及其子元素，所以要先处理
     */
    setTransformAndOpacity(container) {
        const { bounds, styles } = container;
        const { ctx2d } = this;
        const { transform, opacity, transformOrigin } = styles;
        if (opacity < 1.0) {
            // 处理透明度
            ctx2d.globalAlpha = opacity;
        }
        if (transform !== 'none') {
            // 处理 transform
            const origin = transformOrigin.split(' ').map((_) => parseInt(_, 10));
            const offsetX = bounds.left + origin[0];
            const offsetY = bounds.top + origin[1];
            const matrix = transform.slice(7, -1).split(', ').map(Number);
            ctx2d.translate(offsetX, offsetY);
            ctx2d.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
            ctx2d.translate(-offsetX, -offsetY);
            container.transform = {
                offsetX,
                offsetY,
                matrix,
            };
        }
    }
    renderNodeBackgroundAndBorders(container) {
        const { bounds, styles } = container;
        const { ctx2d } = this;
        const bg = styles.backgroundColor;
        const borderWidth = parseInt(styles.borderWidth);
        const { top, left, width, height } = bounds;
        let points = [
            [left, top],
            [left + width, top],
            [left + width, top + height],
            [left, top + height],
        ];

        if (container.transform) {
            const { offsetX, offsetY } = container.transform;
            const width = parseInt(styles.width);
            const height = parseInt(styles.height);
            points = [
                [offsetX - width / 2, offsetY - height / 2],
                [offsetX + width / 2, offsetY - height / 2],
                [offsetX + width / 2, offsetY + height / 2],
                [offsetX - width / 2, offsetY + height / 2],
            ];
        }
        // 画背景
        const bgArr = bg.slice(5, -1).split(', ');
        if (bgArr[bgArr.length - 1]) {
            // 如果背景颜色不透明
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
    renderText(text, styles) { // 这里只考虑影响字体的几个因素，并不全面
        const { ctx2d } = this;
        ctx2d.save();
        ctx2d.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
        ctx2d.fillStyle = styles.color;
        ctx2d.fillText(text.text, text.bounds.left, text.bounds.top);
        ctx2d.restore();
    }
    renderImg(container) { // 这里直接用页面中的 img 元素进行绘制，所以得等到图片加载完成，不然就看不见图片。正常写法应该是在 img.onload 的回调中进行绘制
        const { ctx2d } = this;
        const { el, bounds, styles } = container;
        ctx2d.drawImage(el, 0, 0, parseInt(styles.width), parseInt(styles.height), bounds.left, bounds.top, bounds.width, bounds.height);
    }
    renderInput(container) {
        // 渲染输入框其实就是渲染文本
        const { value, bounds, styles } = container;
        const { paddingLeft, paddingTop, fontSize } = styles;
        const text = {
            text: value,
            bounds: {
                ...bounds,
                top: bounds.top + parseInt(paddingTop) + parseInt(fontSize),
                left: bounds.left + parseInt(paddingLeft),
            },
        };
        this.renderText(text, styles);
    }
    drawPathByPoints(points) {
        points.map((point, i) => {
            if (i === 0) {
                this.ctx2d.moveTo(point[0], point[1]);
            } else {
                this.ctx2d.lineTo(point[0], point[1]);
            }
        });
    }
    /**
     * 创建画布，注意 dpr 的影响
     */
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

        this.canvas = canvas;
        this.ctx2d = ctx2d;
        return canvas;
    }
}
/**
 * 计算元素的位置和大小信息
 */
class Bounds {
    constructor(global, el) {
        const { x = 0, y = 0 } = global.offset;
        const { top, left, width, height } = el.getBoundingClientRect();
        this.top = top - y;
        this.left = left - x;
        this.width = width;
        this.height = height;
    }
}

class ElContainer {
    constructor(global, el) {
        // 这里为了方便直接把所有的样式拿过来，其实可以按需过滤一下。这个要写在 bounds 前面，因为 bounds 中会修改样式
        this.styles = window.getComputedStyle(el);
        // 获取位置和大小，这里要注意如果元素用了 transform，我们需要将其先还原，再获取样式，因为我们没有克隆整个 html，所以这里就这样处理
        const transform = this.styles.transform;
        if (transform !== 'none') {
            el.style.transform = 'none';
        }
        this.bounds = new Bounds(global, el);
        if (transform !== 'none') el.style.transform = transform;
        // 子元素
        this.elements = [];
        // 文本节点比较特殊，单独处理
        this.textNodes = [];
        // falgs 标志是否要创建层叠上下文
        this.flags = 0;
        // 元素的引用
        this.el = el;
    }
}

class ImageElContainer extends ElContainer {
    constructor(global, el) {
        super(global, el);
        this.src = el.src;
    }
}

class InputElContainer extends ElContainer {
    constructor(global, el) {
        super(global, el);
        this.type = el.type.toLowerCase();
        this.value = el.value;
    }
}

class TextElContainer {
    constructor(text, parent) {
        this.bounds = this.getTrueBounds(parent);
        this.text = text;
        this.parent = parent;
    }
    getTrueBounds(parent) {
        let { top, left, width, height } = parent.bounds;
        const { paddingLeft, paddingTop, borderWidth, fontSize } = parent.styles;
        top = top + parseInt(paddingTop) + parseInt(borderWidth) + parseInt(fontSize);
        left = left + parseInt(paddingLeft) + parseInt(borderWidth);
        return {
            top,
            left,
            width,
            height,
        };
    }
}

/**
 * 层叠上下文，按照以下顺序分配
 * 1、backgroundAndBorder - 背景和边框
 * 2、negativeZIndex - zIndex为负的元素
 * 3、nonInlineLevel - 块级元素
 * 4、nonPositionedFloats - 未定位的浮动元素
 * 5、nonPositionedInlineLevel - 内联的非定位元素
 * 6、positiveZIndex - z-index大于等于1的元素
 * 7、zeroOrAutoZIndexOrTransformedOrOpacity - 具有 transform、opacity、zIndex 为 auto 或 0 的元素
 */
class StackingContext {
    constructor(container) {
        this.container = container;
        this.negativeZIndex = [];
        this.nonInlineLevel = [];
        this.nonPositionedFloats = [];
        this.inlineLevel = [];
        this.positiveZIndex = [];
        this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
    }
}
