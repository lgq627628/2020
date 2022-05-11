import { Util } from './Util';
import { Point } from './Point';
import { Intersection } from './Intersection';
import { Offset, Coords, Corner, IAnimationOption } from './interface';

/** 物体基类，有一些共同属性和方法 */
export class FabricObject {
    /** 物体类型标识 */
    public type: string = 'object';
    /** 是否处于激活态，也就是是否被选中 */
    public active: boolean = false;
    /** 是否可见 */
    public visible: boolean = true;
    /** 默认水平变换中心 left | right | center */
    public originX: string = 'center';
    /** 默认垂直变换中心 top | bottom | center */
    public originY: string = 'center';
    /** 物体位置 top 值 */
    public top: number = 0;
    /** 物体位置 left 值 */
    public left: number = 0;
    /** 物体原始宽度 */
    public width: number = 0;
    /** 物体原始高度 */
    public height: number = 0;
    /** 物体当前的缩放倍数 x */
    public scaleX: number = 1;
    /** 物体当前的缩放倍数 y */
    public scaleY: number = 1;
    /** 物体当前的旋转角度 */
    public angle: number = 0;
    /** 左右镜像，比如反向拉伸控制点 */
    public flipX: boolean = false;
    /** 上下镜像，比如反向拉伸控制点 */
    public flipY: boolean = false;
    /** 选中态物体和边框之间的距离 */
    public padding: number = 0;
    /** 物体缩放后的宽度 */
    public currentWidth: number = 0;
    /** 物体缩放后的高度 */
    public currentHeight: number = 0;
    /** 激活态边框颜色 */
    public borderColor: string = 'red';
    /** 激活态控制点颜色 */
    public cornerColor: string = 'red';
    /** 物体默认填充颜色 */
    public fill: string = 'rgb(0,0,0)';
    /** 混合模式 globalCompositeOperation */
    // public fillRule: string = 'source-over';
    /** 物体默认描边颜色，默认无 */
    public stroke: string;
    /** 物体默认描边宽度 */
    public strokeWidth: number = 1;
    /** 矩阵变换 */
    // public transformMatrix: number[];
    /** 最小缩放值 */
    // public minScaleLimit: number = 0.01;
    /** 是否有控制点 */
    public hasControls: boolean = true;
    /** 是否有旋转控制点 */
    public hasRotatingPoint: boolean = true;
    /** 旋转控制点偏移量 */
    public rotatingPointOffset: number = 40;
    /** 移动的时候边框透明度 */
    public borderOpacityWhenMoving: number = 0.4;
    /** 物体是否在移动中 */
    public isMoving: boolean = false;
    /** 选中态的边框宽度 */
    public borderWidth: number = 1;
    /** 物体控制点用 stroke 还是 fill */
    public transparentCorners: boolean = false;
    /** 物体控制点大小，单位 px */
    public cornerSize: number = 12;
    /** 通过像素来检测物体而不是通过包围盒 */
    // public perPixelTargetFind: boolean = false;
    /** 物体控制点位置，随时变化 */
    public oCoords: Coords;
    /** 物体所在的 canvas 画布 */
    public canvas;
    /** 物体执行变换之前的状态 */
    public originalState;
    /** 物体所属的组 */
    public group;
    /** 物体被拖蓝选区保存的时候需要临时保存下 hasControls 的值 */
    public orignHasControls: boolean = true;
    public stateProperties: string[] = ('top left width height scaleX scaleY ' + 'flipX flipY angle cornerSize fill originX originY ' + 'stroke strokeWidth ' + 'borderWidth transformMatrix visible').split(' ');
    constructor(options) {
        // super();
        this.initialize(options);
    }
    initialize(options) {
        options && this.setOptions(options);
    }
    setOptions(options) {
        for (let prop in options) {
            this[prop] = options[prop];
        }
    }
    /** 渲染物体，默认用 fill 填充 */
    render(ctx: CanvasRenderingContext2D, noTransform: boolean = false) {
        if (this.width === 0 || this.height === 0 || !this.visible) return;

        ctx.save();

        // let m = this.transformMatrix;
        // if (m && !this.group) {
        //     ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // }

        if (!noTransform) {
            this.transform(ctx);
        }

        if (this.stroke) {
            ctx.lineWidth = this.strokeWidth;
            ctx.strokeStyle = this.stroke;
        }

        if (this.fill) {
            ctx.fillStyle = this.fill;
        }

        // if (m && this.group) {
        //     ctx.translate(-this.group.width / 2, -this.group.height / 2);
        //     ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        // }

        // 绘制物体
        this._render(ctx);

        if (this.active && !noTransform) {
            // 绘制激活物体边框
            this.drawBorders(ctx);
            // 绘制激活物体四周的控制点
            this.drawControls(ctx);
        }

        // 画自身坐标系
        this.drawAxis(ctx);

        ctx.restore();
    }
    /** 由子类实现，就是由具体物体类来实现 */
    _render(ctx: CanvasRenderingContext2D) {}
    /** 绘制前需要进行各种变换（包括平移、旋转、缩放）
     * 注意变换顺序很重要，顺序不一样会导致不一样的结果，所以一个框架一旦定下来了，后面大概率是不能更改的
     * 我们采用的顺序是：平移 -> 旋转 -> 缩放，这样可以减少些计算量，如果我们先旋转，点的坐标值一般就不是整数，那么后面的变换基于非整数来计算
     */
    transform(ctx: CanvasRenderingContext2D) {
        let center = this.getCenterPoint();
        // ctx.translate(center.x, center.y);
        // ctx.rotate(Util.degreesToRadians(this.angle));
        // ctx.scale(this.scaleX, this.scaleY);
        // ctx.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
        const m = Util.composeMatrix({
            angle: this.angle,
            translateX: center.x,
            translateY: center.y,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            flipX: this.flipX,
            flipY: this.flipY,
        });
        console.log(this.top, this.left, '??');
        // const radian = Util.degreesToRadians(this.angle);
        // const cos = Math.cos(radian);
        // const sin = Math.sin(radian);
        // const m = [cos * this.scaleX, sin * this.scaleX, -sin * this.scaleY, cos * this.scaleY, center.x, center.y];
        ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }
    /** 绘制激活物体边框 */
    drawBorders(ctx: CanvasRenderingContext2D): FabricObject {
        let padding = this.padding,
            padding2 = padding * 2,
            strokeWidth = this.borderWidth;

        ctx.save();

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = strokeWidth;

        /** 画边框的时候需要把 transform 变换中的 scale 效果抵消，这样才能画出原始大小的线条 */
        ctx.scale(1 / this.scaleX, 1 / this.scaleY);

        let w = this.getWidth(),
            h = this.getHeight();
        // 画物体激活时候的边框，也就是包围盒，~~就是取整的意思
        ctx.strokeRect(-(w / 2) - padding - strokeWidth / 2, -(h / 2) - padding - strokeWidth / 2, w + padding2 + strokeWidth, h + padding2 + strokeWidth);

        // 画旋转控制点的那条线
        if (this.hasRotatingPoint && this.hasControls) {
            let rotateHeight = (-h - strokeWidth - padding * 2) / 2;

            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight - this.rotatingPointOffset);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
        return this;
    }
    /** 绘制包围盒模型的控制点 */
    drawControls(ctx: CanvasRenderingContext2D): FabricObject {
        if (!this.hasControls) return;
        // 因为画布已经经过变换，所以大部分数值需要除以 scale 来抵消变换
        let size = this.cornerSize,
            size2 = size / 2,
            strokeWidth2 = this.strokeWidth / 2,
            // top 和 left 值为物体左上角的点
            left = -(this.width / 2),
            top = -(this.height / 2),
            _left,
            _top,
            sizeX = size / this.scaleX,
            sizeY = size / this.scaleY,
            paddingX = this.padding / this.scaleX,
            paddingY = this.padding / this.scaleY,
            scaleOffsetY = size2 / this.scaleY,
            scaleOffsetX = size2 / this.scaleX,
            scaleOffsetSizeX = (size2 - size) / this.scaleX,
            scaleOffsetSizeY = (size2 - size) / this.scaleY,
            height = this.height,
            width = this.width,
            // 控制点是实心还是空心
            methodName = this.transparentCorners ? 'strokeRect' : 'fillRect';

        ctx.save();

        ctx.lineWidth = this.borderWidth / Math.max(this.scaleX, this.scaleY);

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = ctx.fillStyle = this.cornerColor;

        // top-left
        _left = left - scaleOffsetX - strokeWidth2 - paddingX;
        _top = top - scaleOffsetY - strokeWidth2 - paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // top-right
        _left = left + width - scaleOffsetX + strokeWidth2 + paddingX;
        _top = top - scaleOffsetY - strokeWidth2 - paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // bottom-left
        _left = left - scaleOffsetX - strokeWidth2 - paddingX;
        _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // bottom-right
        _left = left + width + scaleOffsetSizeX + strokeWidth2 + paddingX;
        _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // middle-top
        _left = left + width / 2 - scaleOffsetX;
        _top = top - scaleOffsetY - strokeWidth2 - paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // middle-bottom
        _left = left + width / 2 - scaleOffsetX;
        _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // middle-right
        _left = left + width + scaleOffsetSizeX + strokeWidth2 + paddingX;
        _top = top + height / 2 - scaleOffsetY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // middle-left
        _left = left - scaleOffsetX - strokeWidth2 - paddingX;
        _top = top + height / 2 - scaleOffsetY;
        ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);

        // 绘制旋转控制点
        if (this.hasRotatingPoint) {
            _left = left + width / 2 - scaleOffsetX;
            _top = top - this.rotatingPointOffset / this.scaleY - sizeY / 2 - strokeWidth2 - paddingY;

            ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
        }

        ctx.restore();

        return this;
    }
    drawAxis(ctx: CanvasRenderingContext2D) {
        ctx.save();
        const lengthRatio = 1.5;
        const w = this.getWidth();
        const h = this.getHeight();
        ctx.lineWidth = this.borderWidth;
        ctx.setLineDash([4 * lengthRatio, 3 * lengthRatio]);
        /** 画坐标轴的时候需要把 transform 变换中的 scale 效果抵消，这样才能画出原始大小的线条 */
        ctx.scale(1 / this.scaleX, 1 / this.scaleY);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo((w / 2) * lengthRatio, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, (h / 2) * lengthRatio);
        ctx.stroke();
        ctx.restore();
    }
    setupState() {
        this.originalState = {};
        this.saveState();
    }
    /** 保存物体当前的状态到 originalState 中 */
    saveState(): FabricObject {
        this.stateProperties.forEach((prop) => {
            this.originalState[prop] = this[prop];
        });
        return this;
    }
    /** 获取物体中心点 */
    getCenterPoint() {
        return this.translateToCenterPoint(new Point(this.left, this.top), this.originX, this.originY);
    }
    /** 将中心点移到变换基点 */
    translateToCenterPoint(point: Point, originX: string, originY: string): Point {
        let cx = point.x,
            cy = point.y;

        if (originX === 'left') {
            cx = point.x + this.getWidth() / 2;
        } else if (originX === 'right') {
            cx = point.x - this.getWidth() / 2;
        }

        if (originY === 'top') {
            cy = point.y + this.getHeight() / 2;
        } else if (originY === 'bottom') {
            cy = point.y - this.getHeight() / 2;
        }
        const p = new Point(cx, cy);
        if (this.angle) {
            return Util.rotatePoint(p, point, Util.degreesToRadians(this.angle));
        } else {
            return p;
        }
    }
    /**
     * 平移坐标系到中心点
     * @param center
     * @param {string} originX  left | center | right
     * @param {string} originY  top | center | bottom
     * @returns
     */
    translateToOriginPoint(center: Point, originX: string, originY: string): Point {
        let x = center.x,
            y = center.y;

        // Get the point coordinates
        if (originX === 'left') {
            x = center.x - this.getWidth() / 2;
        } else if (originX === 'right') {
            x = center.x + this.getWidth() / 2;
        }
        if (originY === 'top') {
            y = center.y - this.getHeight() / 2;
        } else if (originY === 'bottom') {
            y = center.y + this.getHeight() / 2;
        }

        // Apply the rotation to the point (it's already scaled properly)
        return Util.rotatePoint(new Point(x, y), center, Util.degreesToRadians(this.angle));
    }
    /** 转换成本地坐标 */
    toLocalPoint(point: Point, originX: string, originY: string): Point {
        let center = this.getCenterPoint();

        let x, y;
        if (originX !== undefined && originY !== undefined) {
            if (originX === 'left') {
                x = center.x - this.getWidth() / 2;
            } else if (originX === 'right') {
                x = center.x + this.getWidth() / 2;
            } else {
                x = center.x;
            }

            if (originY === 'top') {
                y = center.y - this.getHeight() / 2;
            } else if (originY === 'bottom') {
                y = center.y + this.getHeight() / 2;
            } else {
                y = center.y;
            }
        } else {
            x = this.left;
            y = this.top;
        }

        return Util.rotatePoint(new Point(point.x, point.y), center, -Util.degreesToRadians(this.angle)).subtractEquals(new Point(x, y));
    }
    /** 检测哪个控制点被点击了 */
    _findTargetCorner(e: MouseEvent, offset: Offset): boolean | string {
        if (!this.hasControls || !this.active) return false;

        let pointer = Util.getPointer(e, this.canvas.upperCanvasEl),
            ex = pointer.x - offset.left,
            ey = pointer.y - offset.top,
            xpoints,
            lines;

        for (let i in this.oCoords) {
            if (i === 'mtr' && !this.hasRotatingPoint) {
                continue;
            }

            lines = this._getImageLines(this.oCoords[i].corner);

            // debugger 绘制物体控制点的四个顶点
            // this.canvas.contextTop.fillRect(lines.bottomline.d.x, lines.bottomline.d.y, 2, 2);
            // this.canvas.contextTop.fillRect(lines.bottomline.o.x, lines.bottomline.o.y, 2, 2);

            // this.canvas.contextTop.fillRect(lines.leftline.d.x, lines.leftline.d.y, 2, 2);
            // this.canvas.contextTop.fillRect(lines.leftline.o.x, lines.leftline.o.y, 2, 2);

            // this.canvas.contextTop.fillRect(lines.topline.d.x, lines.topline.d.y, 2, 2);
            // this.canvas.contextTop.fillRect(lines.topline.o.x, lines.topline.o.y, 2, 2);

            // this.canvas.contextTop.fillRect(lines.rightline.d.x, lines.rightline.d.y, 2, 2);
            // this.canvas.contextTop.fillRect(lines.rightline.o.x, lines.rightline.o.y, 2, 2);

            xpoints = this._findCrossPoints(ex, ey, lines);
            if (xpoints % 2 === 1 && xpoints !== 0) {
                return i;
            }
        }
        return false;
    }
    /** 获取包围盒的四条边 */
    _getImageLines(corner: Corner) {
        return {
            topline: {
                o: corner.tl,
                d: corner.tr,
            },
            rightline: {
                o: corner.tr,
                d: corner.br,
            },
            bottomline: {
                o: corner.br,
                d: corner.bl,
            },
            leftline: {
                o: corner.bl,
                d: corner.tl,
            },
        };
    }
    /**
     * 射线检测法：以鼠标坐标点为参照，水平向右做一条射线，求坐标点与多条边的交点个数
     * 如果和物体相交的个数为偶数点则点在物体外部；如果为奇数点则点在内部
     * 不过 fabric 的点选多边形都是用于包围盒，也就是矩形，所以该方法是专门针对矩形的，并且针对矩形做了一些优化
     */
    _findCrossPoints(ex: number, ey: number, lines): number {
        let b1, // 射线的斜率
            b2, // 边的斜率
            a1,
            a2,
            xi, // 射线与边的交点
            // yi, // 射线与边的交点
            xcount = 0,
            iLine; // 当前边

        // 遍历包围盒的四条边
        for (let lineKey in lines) {
            iLine = lines[lineKey];

            // 优化1：如果边的两个端点的 y 值都小于鼠标点的 y 值，则跳过
            if (iLine.o.y < ey && iLine.d.y < ey) continue;
            // 优化2：如果边的两个端点的 y 值都大于鼠标点的 y 值，则跳过
            if (iLine.o.y >= ey && iLine.d.y >= ey) continue;

            // 优化3：如果边是一条垂线
            if (iLine.o.x === iLine.d.x && iLine.o.x >= ex) {
                xi = iLine.o.x;
                // yi = ey;
            } else {
                // 简单计算下射线与边的交点，看式子容易晕，建议自己手动算一下
                b1 = 0;
                b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
                a1 = ey - b1 * ex;
                a2 = iLine.o.y - b2 * iLine.o.x;

                xi = -(a1 - a2) / (b1 - b2);
                // yi = a1 + b1 * xi;
            }
            // 只需要计数 xi >= ex 的情况
            if (xi >= ex) {
                xcount += 1;
            }
            // 优化4：因为 fabric 中的多边形只需要用到矩形，所以根据矩形的特质，顶多只有两个交点，所以我们可以提前结束循环
            if (xcount === 2) {
                break;
            }
        }
        return xcount;
    }
    /** 物体动画 */
    animate(props, animateOptions: IAnimationOption): FabricObject {
        let propsToAnimate = [];
        for (let prop in props) {
            propsToAnimate.push(prop);
        }
        const len = propsToAnimate.length;
        propsToAnimate.forEach((prop, i) => {
            const skipCallbacks = i !== len - 1;
            this._animate(prop, props[prop], animateOptions, skipCallbacks);
        });
        return this;
    }
    /**
     * 让物体真正动起来
     * @param property 物体需要动画的属性
     * @param to 物体属性的最终值
     * @param options 一些动画选项
     * @param skipCallbacks 是否跳过绘制
     */
    _animate(property, to, options: IAnimationOption = {}, skipCallbacks) {
        options = Util.clone(options);

        let currentValue = this.get(property);

        if (!options.from) options.from = currentValue;
        to = to.toString();
        if (~to.indexOf('=')) {
            to = currentValue + parseFloat(to.replace('=', ''));
        } else {
            to = parseFloat(to);
        }

        Util.animate({
            startValue: options.from,
            endValue: to,
            byValue: options.by,
            easing: options.easing,
            duration: options.duration,
            abort: options.abort && (() => options.abort.call(this)),
            onChange: (value) => {
                this.set(property, value);
                if (skipCallbacks) {
                    return;
                }
                options.onChange && options.onChange();
            },
            onComplete: () => {
                if (skipCallbacks) {
                    return;
                }
                this.setCoords();
                options.onComplete && options.onComplete();
            },
        });
    }
    setActive(active: boolean = false): FabricObject {
        this.active = !!active;
        return this;
    }
    /**
     * 根据物体的 origin 来设置物体的位置
     * @method setPositionByOrigin
     * @param {Point} pos
     * @param {string} originX left | center | right
     * @param {string} originY top | center | bottom
     */
    setPositionByOrigin(pos: Point, originX: string, originY: string) {
        let center = this.translateToCenterPoint(pos, originX, originY);
        let position = this.translateToOriginPoint(center, this.originX, this.originY);
        // console.log(`更新缩放的物体位置:[${position.x}，${position.y}]`);
        this.set('left', position.x);
        this.set('top', position.y);
    }
    /**
     * @param to left, center, right 中的一个
     */
    adjustPosition(to: string) {
        let angle = Util.degreesToRadians(this.angle);

        let hypotHalf = this.getWidth() / 2;
        let xHalf = Math.cos(angle) * hypotHalf;
        let yHalf = Math.sin(angle) * hypotHalf;

        let hypotFull = this.getWidth();
        let xFull = Math.cos(angle) * hypotFull;
        let yFull = Math.sin(angle) * hypotFull;

        if ((this.originX === 'center' && to === 'left') || (this.originX === 'right' && to === 'center')) {
            // move half left
            this.left -= xHalf;
            this.top -= yHalf;
        } else if ((this.originX === 'left' && to === 'center') || (this.originX === 'center' && to === 'right')) {
            // move half right
            this.left += xHalf;
            this.top += yHalf;
        } else if (this.originX === 'left' && to === 'right') {
            // move full right
            this.left += xFull;
            this.top += yFull;
        } else if (this.originX === 'right' && to === 'left') {
            // move full left
            this.left -= xFull;
            this.top -= yFull;
        }

        this.setCoords();
        this.originX = to;
    }
    hasStateChanged(): boolean {
        return this.stateProperties.some(function (prop) {
            return this[prop] !== this.originalState[prop];
        }, this);
    }
    /**
     * 物体与框选区域是否相交，用框选区域的四条边分别与物体的四条边求交
     * @param {Point} selectionTL 拖蓝框选区域左上角的点
     * @param {Point} selectionBR 拖蓝框选区域右下角的点
     * @returns {boolean}
     */
    intersectsWithRect(selectionTL: Point, selectionBR: Point): boolean {
        let oCoords = this.oCoords,
            tl = new Point(oCoords.tl.x, oCoords.tl.y),
            tr = new Point(oCoords.tr.x, oCoords.tr.y),
            bl = new Point(oCoords.bl.x, oCoords.bl.y),
            br = new Point(oCoords.br.x, oCoords.br.y);

        let intersection = Intersection.intersectPolygonRectangle([tl, tr, br, bl], selectionTL, selectionBR);
        return intersection.status === 'Intersection';
    }
    // isContainedWithinObject(other) {
    //     return this.isContainedWithinRect(other.oCoords.tl, other.oCoords.br);
    // }
    /**
     * 物体是否被框选区域包含
     * @param {Point} selectionTL 拖蓝框选区域左上角的点
     * @param {Point} selectionBR 拖蓝框选区域右下角的点
     * @returns {boolean}
     */
    isContainedWithinRect(selectionTL: Point, selectionBR: Point): boolean {
        let oCoords = this.oCoords,
            tl = new Point(oCoords.tl.x, oCoords.tl.y),
            tr = new Point(oCoords.tr.x, oCoords.tr.y),
            bl = new Point(oCoords.bl.x, oCoords.bl.y);

        return tl.x > selectionTL.x && tr.x < selectionBR.x && tl.y > selectionTL.y && bl.y < selectionBR.y;
    }
    /** 确保缩放值有效，有意义 */
    // _constrainScale(value: number): number {
    //     if (Math.abs(value) < this.minScaleLimit) {
    //         if (value < 0) {
    //             return -this.minScaleLimit;
    //         } else {
    //             return this.minScaleLimit;
    //         }
    //     }
    //     return value;
    // }
    getViewportTransform() {
        if (this.canvas && this.canvas.viewportTransform) {
            return this.canvas.viewportTransform;
        }
        return [1, 0, 0, 1, 0, 0];
    }
    _calculateCurrentDimensions() {
        let vpt = this.getViewportTransform(),
            dim = this._getTransformedDimensions(),
            w = dim.x,
            h = dim.y;

        w += 2 * this.padding;
        h += 2 * this.padding;

        return Util.transformPoint(new Point(w, h), vpt, true);
    }
    _getNonTransformedDimensions() {
        let strokeWidth = this.strokeWidth,
            w = this.width,
            h = this.height,
            addStrokeToW = true,
            addStrokeToH = true;

        // if (this.type === 'line' && this.strokeLineCap === 'butt') {
        //     addStrokeToH = w;
        //     addStrokeToW = h;
        // }

        if (addStrokeToH) {
            h += h < 0 ? -strokeWidth : strokeWidth;
        }

        if (addStrokeToW) {
            w += w < 0 ? -strokeWidth : strokeWidth;
        }

        return { x: w, y: h };
    }
    _getTransformedDimensions(skewX = 0, skewY = 0) {
        // if (typeof skewX === 'undefined') {
        //     skewX = this.skewX;
        // }
        // if (typeof skewY === 'undefined') {
        //     skewY = this.skewY;
        // }
        let dimensions = this._getNonTransformedDimensions(),
            dimX = dimensions.x / 2,
            dimY = dimensions.y / 2,
            points = [
                {
                    x: -dimX,
                    y: -dimY,
                },
                {
                    x: dimX,
                    y: -dimY,
                },
                {
                    x: -dimX,
                    y: dimY,
                },
                {
                    x: dimX,
                    y: dimY,
                },
            ],
            i,
            transformMatrix = this._calcDimensionsTransformMatrix(skewX, skewY, false),
            bbox;
        for (i = 0; i < points.length; i++) {
            points[i] = Util.transformPoint(points[i], transformMatrix);
        }
        bbox = Util.makeBoundingBoxFromPoints(points);
        return { x: bbox.width, y: bbox.height };
    }

    _calcDimensionsTransformMatrix(skewX, skewY, flipping) {
        let skewMatrixX = [1, 0, Math.tan(Util.degreesToRadians(skewX)), 1],
            skewMatrixY = [1, Math.tan(Util.degreesToRadians(skewY)), 0, 1],
            scaleX = this.scaleX,
            scaleY = this.scaleY,
            scaleMatrix = [scaleX, 0, 0, scaleY],
            m = Util.multiplyTransformMatrices(scaleMatrix, skewMatrixX, true);
        return Util.multiplyTransformMatrices(m, skewMatrixY, true);
    }
    // setCoords() {
    //     let theta = Util.degreesToRadians(this.angle),
    //         vpt = this.getViewportTransform(),
    //         dim = this._calculateCurrentDimensions(),
    //         currentWidth = dim.x,
    //         currentHeight = dim.y;

    //     // If width is negative, make postive. Fixes path selection issue
    //     // if (currentWidth < 0) {
    //     //     currentWidth = Math.abs(currentWidth);
    //     // }

    //     let sinTh = Math.sin(theta),
    //         cosTh = Math.cos(theta),
    //         _angle = currentWidth > 0 ? Math.atan(currentHeight / currentWidth) : 0,
    //         _hypotenuse = currentWidth / Math.cos(_angle) / 2,
    //         offsetX = Math.cos(_angle + theta) * _hypotenuse,
    //         offsetY = Math.sin(_angle + theta) * _hypotenuse,
    //         // offset added for rotate and scale actions
    //         coords = Util.transformPoint(this.getCenterPoint(), vpt),
    //         tl = new Point(coords.x - offsetX, coords.y - offsetY),
    //         tr = new Point(tl.x + currentWidth * cosTh, tl.y + currentWidth * sinTh),
    //         bl = new Point(tl.x - currentHeight * sinTh, tl.y + currentHeight * cosTh),
    //         br = new Point(coords.x + offsetX, coords.y + offsetY),
    //         ml = new Point((tl.x + bl.x) / 2, (tl.y + bl.y) / 2),
    //         mt = new Point((tr.x + tl.x) / 2, (tr.y + tl.y) / 2),
    //         mr = new Point((br.x + tr.x) / 2, (br.y + tr.y) / 2),
    //         mb = new Point((br.x + bl.x) / 2, (br.y + bl.y) / 2),
    //         mtr = new Point(mt.x + sinTh * this.rotatingPointOffset, mt.y - cosTh * this.rotatingPointOffset);
    //     console.log(sinTh, cosTh, mt, mtr);
    //     // let mtr = {
    //     //             x: tl.x + (this.currentWidth / 2) * cosTh,
    //     //             y: tl.y + (this.currentWidth / 2) * sinTh,
    //     //         };
    //     // debugging

    //     /* setTimeout(function() {
    //        canvas.contextTop.fillStyle = 'green';
    //        canvas.contextTop.fillRect(mb.x, mb.y, 3, 3);
    //        canvas.contextTop.fillRect(bl.x, bl.y, 3, 3);
    //        canvas.contextTop.fillRect(br.x, br.y, 3, 3);
    //        canvas.contextTop.fillRect(tl.x, tl.y, 3, 3);
    //        canvas.contextTop.fillRect(tr.x, tr.y, 3, 3);
    //        canvas.contextTop.fillRect(ml.x, ml.y, 3, 3);
    //        canvas.contextTop.fillRect(mr.x, mr.y, 3, 3);
    //        canvas.contextTop.fillRect(mt.x, mt.y, 3, 3);
    //        canvas.contextTop.fillRect(mtr.x, mtr.y, 3, 3);
    //      }, 50); */

    //     this.oCoords = {
    //         // corners
    //         tl,
    //         tr,
    //         br,
    //         bl,
    //         // middle
    //         ml,
    //         mt,
    //         mr,
    //         mb,
    //         // rotating point
    //         mtr,
    //     };

    //     // set coordinates of the draggable boxes in the corners used to scale/rotate the image
    //     this._setCornerCoords && this._setCornerCoords();

    //     return this;
    // }
    /** 重新设置物体包围盒的边框和各个控制点，包括位置和大小 */
    setCoords(): FabricObject {
        let strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0,
            padding = this.padding,
            radian = Util.degreesToRadians(this.angle);

        this.currentWidth = (this.width + strokeWidth) * this.scaleX + padding * 2;
        this.currentHeight = (this.height + strokeWidth) * this.scaleY + padding * 2;

        // If width is negative, make postive. Fixes path selection issue
        // if (this.currentWidth < 0) {
        //     this.currentWidth = Math.abs(this.currentWidth);
        // }

        // 物体中心点到顶点的斜边长度
        let _hypotenuse = Math.sqrt(Math.pow(this.currentWidth / 2, 2) + Math.pow(this.currentHeight / 2, 2));
        let _angle = Math.atan(this.currentHeight / this.currentWidth);

        // offset added for rotate and scale actions
        let offsetX = Math.cos(_angle + radian) * _hypotenuse,
            offsetY = Math.sin(_angle + radian) * _hypotenuse,
            sinTh = Math.sin(radian),
            cosTh = Math.cos(radian);

        let coords = this.getCenterPoint();
        let tl = {
            x: coords.x - offsetX,
            y: coords.y - offsetY,
        };
        let tr = {
            x: tl.x + this.currentWidth * cosTh,
            y: tl.y + this.currentWidth * sinTh,
        };
        let br = {
            x: tr.x - this.currentHeight * sinTh,
            y: tr.y + this.currentHeight * cosTh,
        };
        let bl = {
            x: tl.x - this.currentHeight * sinTh,
            y: tl.y + this.currentHeight * cosTh,
        };
        let ml = {
            x: tl.x - (this.currentHeight / 2) * sinTh,
            y: tl.y + (this.currentHeight / 2) * cosTh,
        };
        let mt = {
            x: tl.x + (this.currentWidth / 2) * cosTh,
            y: tl.y + (this.currentWidth / 2) * sinTh,
        };
        let mr = {
            x: tr.x - (this.currentHeight / 2) * sinTh,
            y: tr.y + (this.currentHeight / 2) * cosTh,
        };
        let mb = {
            x: bl.x + (this.currentWidth / 2) * cosTh,
            y: bl.y + (this.currentWidth / 2) * sinTh,
        };
        let mtr = {
            x: tl.x + (this.currentWidth / 2) * cosTh,
            y: tl.y + (this.currentWidth / 2) * sinTh,
        };

        // clockwise
        this.oCoords = { tl, tr, br, bl, ml, mt, mr, mb, mtr };

        // set coordinates of the draggable boxes in the corners used to scale/rotate the image
        this._setCornerCoords();

        return this;
    }
    /** 重新设置物体的每个控制点，包括位置和大小 */
    _setCornerCoords() {
        let coords = this.oCoords,
            radian = Util.degreesToRadians(this.angle),
            newTheta = Util.degreesToRadians(45 - this.angle),
            cornerHypotenuse = Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2,
            cosHalfOffset = cornerHypotenuse * Math.cos(newTheta),
            sinHalfOffset = cornerHypotenuse * Math.sin(newTheta),
            sinTh = Math.sin(radian),
            cosTh = Math.cos(radian);

        coords.tl.corner = {
            tl: {
                x: coords.tl.x - sinHalfOffset,
                y: coords.tl.y - cosHalfOffset,
            },
            tr: {
                x: coords.tl.x + cosHalfOffset,
                y: coords.tl.y - sinHalfOffset,
            },
            bl: {
                x: coords.tl.x - cosHalfOffset,
                y: coords.tl.y + sinHalfOffset,
            },
            br: {
                x: coords.tl.x + sinHalfOffset,
                y: coords.tl.y + cosHalfOffset,
            },
        };

        coords.tr.corner = {
            tl: {
                x: coords.tr.x - sinHalfOffset,
                y: coords.tr.y - cosHalfOffset,
            },
            tr: {
                x: coords.tr.x + cosHalfOffset,
                y: coords.tr.y - sinHalfOffset,
            },
            br: {
                x: coords.tr.x + sinHalfOffset,
                y: coords.tr.y + cosHalfOffset,
            },
            bl: {
                x: coords.tr.x - cosHalfOffset,
                y: coords.tr.y + sinHalfOffset,
            },
        };

        coords.bl.corner = {
            tl: {
                x: coords.bl.x - sinHalfOffset,
                y: coords.bl.y - cosHalfOffset,
            },
            bl: {
                x: coords.bl.x - cosHalfOffset,
                y: coords.bl.y + sinHalfOffset,
            },
            br: {
                x: coords.bl.x + sinHalfOffset,
                y: coords.bl.y + cosHalfOffset,
            },
            tr: {
                x: coords.bl.x + cosHalfOffset,
                y: coords.bl.y - sinHalfOffset,
            },
        };

        coords.br.corner = {
            tr: {
                x: coords.br.x + cosHalfOffset,
                y: coords.br.y - sinHalfOffset,
            },
            bl: {
                x: coords.br.x - cosHalfOffset,
                y: coords.br.y + sinHalfOffset,
            },
            br: {
                x: coords.br.x + sinHalfOffset,
                y: coords.br.y + cosHalfOffset,
            },
            tl: {
                x: coords.br.x - sinHalfOffset,
                y: coords.br.y - cosHalfOffset,
            },
        };

        coords.ml.corner = {
            tl: {
                x: coords.ml.x - sinHalfOffset,
                y: coords.ml.y - cosHalfOffset,
            },
            tr: {
                x: coords.ml.x + cosHalfOffset,
                y: coords.ml.y - sinHalfOffset,
            },
            bl: {
                x: coords.ml.x - cosHalfOffset,
                y: coords.ml.y + sinHalfOffset,
            },
            br: {
                x: coords.ml.x + sinHalfOffset,
                y: coords.ml.y + cosHalfOffset,
            },
        };

        coords.mt.corner = {
            tl: {
                x: coords.mt.x - sinHalfOffset,
                y: coords.mt.y - cosHalfOffset,
            },
            tr: {
                x: coords.mt.x + cosHalfOffset,
                y: coords.mt.y - sinHalfOffset,
            },
            bl: {
                x: coords.mt.x - cosHalfOffset,
                y: coords.mt.y + sinHalfOffset,
            },
            br: {
                x: coords.mt.x + sinHalfOffset,
                y: coords.mt.y + cosHalfOffset,
            },
        };

        coords.mr.corner = {
            tl: {
                x: coords.mr.x - sinHalfOffset,
                y: coords.mr.y - cosHalfOffset,
            },
            tr: {
                x: coords.mr.x + cosHalfOffset,
                y: coords.mr.y - sinHalfOffset,
            },
            bl: {
                x: coords.mr.x - cosHalfOffset,
                y: coords.mr.y + sinHalfOffset,
            },
            br: {
                x: coords.mr.x + sinHalfOffset,
                y: coords.mr.y + cosHalfOffset,
            },
        };

        coords.mb.corner = {
            tl: {
                x: coords.mb.x - sinHalfOffset,
                y: coords.mb.y - cosHalfOffset,
            },
            tr: {
                x: coords.mb.x + cosHalfOffset,
                y: coords.mb.y - sinHalfOffset,
            },
            bl: {
                x: coords.mb.x - cosHalfOffset,
                y: coords.mb.y + sinHalfOffset,
            },
            br: {
                x: coords.mb.x + sinHalfOffset,
                y: coords.mb.y + cosHalfOffset,
            },
        };

        coords.mtr.corner = {
            tl: {
                x: coords.mtr.x - sinHalfOffset + sinTh * this.rotatingPointOffset,
                y: coords.mtr.y - cosHalfOffset - cosTh * this.rotatingPointOffset,
            },
            tr: {
                x: coords.mtr.x + cosHalfOffset + sinTh * this.rotatingPointOffset,
                y: coords.mtr.y - sinHalfOffset - cosTh * this.rotatingPointOffset,
            },
            bl: {
                x: coords.mtr.x - cosHalfOffset + sinTh * this.rotatingPointOffset,
                y: coords.mtr.y + sinHalfOffset - cosTh * this.rotatingPointOffset,
            },
            br: {
                x: coords.mtr.x + sinHalfOffset + sinTh * this.rotatingPointOffset,
                y: coords.mtr.y + cosHalfOffset - cosTh * this.rotatingPointOffset,
            },
        };
    }
    get(key: string) {
        return this[key];
    }
    set(key: string, value): FabricObject {
        // if (typeof value === 'function') value = value(this.get(key));
        // if (key === 'scaleX' || key === 'scaleY') {
        //     value = this._constrainScale(value);
        // }
        // if (key === 'width' || key === 'height') {
        //     this.minScaleLimit = Util.toFixed(Math.min(0.1, 1 / Math.max(this.width, this.height)), 2);
        // }
        if (key === 'scaleX' && value < 0) {
            this.flipX = !this.flipX;
            value *= -1;
        } else if (key === 'scaleY' && value < 0) {
            this.flipY = !this.flipY;
            value *= -1;
        }
        this[key] = value;
        return this;
    }
    /** 获取当前大小，包含缩放效果 */
    getWidth(): number {
        return this.width * this.scaleX;
    }
    /** 获取当前大小，包含缩放效果 */
    getHeight(): number {
        return this.height * this.scaleY;
    }
    getAngle(): number {
        return this.angle;
    }
    setAngle(angle: number) {
        this.angle = angle;
    }
}
