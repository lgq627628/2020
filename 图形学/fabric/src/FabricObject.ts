import { Util } from './Util';
import { Point } from './Point';
import { Intersection } from './Intersection';
import { Offset, Coords, Corner } from './interface';

/** 物体基类，有一些共同属性和方法 */
export class FabricObject {
    /** 物体类型标识 */
    public type: string = 'object';
    /** 是否处于激活态，也就是是否被选中 */
    public active: boolean = false;
    /** 是否可见 */
    public visible: boolean = true;
    /** 默认水平变换位置 left | right | center */
    public originX: string = 'center';
    /** 默认垂直变换位置 top | bottom | center */
    public originY: string = 'center';
    /** 物体变换后的中心点 top 值 */
    public top: number = 0;
    /** 物体宾欢后的中心点 left 值 */
    public left: number = 0;
    /** 物体原始宽度 */
    public width: number = 0;
    /** 物体原始高度 */
    public height: number = 0;
    /** 物体当前的缩放倍数 x */
    public scaleX: number = 1;
    /** 物体当前的缩放倍数 y */
    public scaleY: number = 1;
    /** 物体的旋转角度 */
    public angle: number = 0;
    /** 选中态物体和边框之间的距离 */
    public padding: number = 4;
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
    public borderScaleFactor: number = 0.5;
    /** 物体控制点用 stroke 还是 fill */
    public transparentCorners: boolean = true;
    /** 物体控制点大小，单位 px */
    public cornerSize: number = 12;
    /** 通过像素来检测物体而不是通过包围盒 */
    // public perPixelTargetFind: boolean = false;
    /** 物体缩放之后的控制点位置 */
    public oCoords: Coords;
    /** 物体所在的 canvas 画布 */
    public canvas;
    /** 物体执行变换之前的状态 */
    public originalState;
    /** 物体所属的组 */
    public group;
    public stateProperties: string[] = ('top left width height scaleX scaleY ' + 'angle cornerSize fill originX originY ' + 'stroke strokeWidth ' + 'borderScaleFactor transformMatrix visible').split(' ');
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
        ctx.translate(center.x, center.y);
        ctx.rotate(Util.degreesToRadians(this.angle));
        ctx.scale(this.scaleX, this.scaleY);
    }
    /** 绘制激活物体边框 */
    drawBorders(ctx: CanvasRenderingContext2D): FabricObject {
        let padding = this.padding,
            padding2 = padding * 2,
            strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0;

        ctx.save();

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = this.borderColor;

        let scaleX = 1 / this.scaleX,
            scaleY = 1 / this.scaleY;
        // let scaleX = 1 / this._constrainScale(this.scaleX),
        //     scaleY = 1 / this._constrainScale(this.scaleY);

        ctx.lineWidth = 1 / this.borderScaleFactor;

        /** 画边框的时候需要把 transform 变换中的 scale 效果抵消，这样才能画出原始大小的线条 */
        ctx.scale(scaleX, scaleY);

        let w = this.getWidth(),
            h = this.getHeight();
        // 画物体激活时候的边框，也就是包围盒，~~就是取整的意思
        ctx.strokeRect(
            ~~(-(w / 2) - padding - (strokeWidth / 2) * this.scaleX) + 0.5, // 0.5 的便宜是为了让曲线更加尖锐
            ~~(-(h / 2) - padding - (strokeWidth / 2) * this.scaleY) + 0.5,
            ~~(w + padding2 + strokeWidth * this.scaleX),
            ~~(h + padding2 + strokeWidth * this.scaleY)
        );

        // 画旋转控制点的那条线
        if (this.hasRotatingPoint && this.hasControls) {
            let rotateHeight = (-h - strokeWidth * this.scaleY - padding * 2) / 2;

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
            methodName = this.transparentCorners ? 'strokeRect' : 'fillRect';

        ctx.save();

        ctx.lineWidth = 1 / Math.max(this.scaleX, this.scaleY);

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
    setupState() {
        this.originalState = {};
        this.saveState();
    }
    saveState(): FabricObject {
        this.stateProperties.forEach((prop) => {
            this.originalState[prop] = this[prop];
        });
        console.log(this.originalState);
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

        // Apply the reverse rotation to the point (it's already scaled properly)
        return Util.rotatePoint(new Point(cx, cy), point, Util.degreesToRadians(this.angle));
    }
    /**
     * 平移坐标系到中心点
     * @param center
     * @param {string} originX  left | center | right
     * @param {string} originY  top | center | bottom
     * @returns
     */
    translateToOriginPoint(center: Point, originX: string, originY: string) {
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
    /** Helper method to determine how many cross points are between the 4 image edges and the horizontal line determined by the position of our mouse when clicked on canvas */
    _findCrossPoints(ex: number, ey: number, oCoords): number {
        let b1,
            b2,
            a1,
            a2,
            xi,
            yi,
            xcount = 0,
            iLine;

        for (let lineKey in oCoords) {
            iLine = oCoords[lineKey];
            // optimisation 1: line below dot. no cross
            if (iLine.o.y < ey && iLine.d.y < ey) {
                continue;
            }
            // optimisation 2: line above dot. no cross
            if (iLine.o.y >= ey && iLine.d.y >= ey) {
                continue;
            }
            // optimisation 3: vertical line case
            if (iLine.o.x === iLine.d.x && iLine.o.x >= ex) {
                xi = iLine.o.x;
                yi = ey;
            }
            // calculate the intersection point
            else {
                b1 = 0;
                b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
                a1 = ey - b1 * ex;
                a2 = iLine.o.y - b2 * iLine.o.x;

                xi = -(a1 - a2) / (b1 - b2);
                yi = a1 + b1 * xi;
            }
            // dont count xi < ex cases
            if (xi >= ex) {
                xcount += 1;
            }
            // optimisation 4: specific for square images
            if (xcount === 2) {
                break;
            }
        }
        return xcount;
    }
    setActive(active: boolean): FabricObject {
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
        this.set('left', position.x);
        this.set('top', position.y);
    }
    /**
     * @param to left, center, right 中的一个
     */
    adjustPosition(to: string) {
        let angle = Util.degreesToRadians(this.angle);

        let hypotHalf = this.width / 2;
        let xHalf = Math.cos(angle) * hypotHalf;
        let yHalf = Math.sin(angle) * hypotHalf;

        let hypotFull = this.width;
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
    /** 框选区域 */
    intersectsWithRect(selectionTL, selectionBR) {
        let oCoords = this.oCoords,
            tl = new Point(oCoords.tl.x, oCoords.tl.y),
            tr = new Point(oCoords.tr.x, oCoords.tr.y),
            bl = new Point(oCoords.bl.x, oCoords.bl.y),
            br = new Point(oCoords.br.x, oCoords.br.y);

        let intersection = Intersection.intersectPolygonRectangle([tl, tr, br, bl], selectionTL, selectionBR);
        return intersection.status === 'Intersection';
    }
    isContainedWithinObject(other) {
        return this.isContainedWithinRect(other.oCoords.tl, other.oCoords.br);
    }
    isContainedWithinRect(selectionTL, selectionBR) {
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
    /** 在缩放、旋转期间设置拖拽盒子的坐标系 */
    setCoords() {
        let strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0,
            padding = this.padding,
            theta = Util.degreesToRadians(this.angle);

        this.currentWidth = (this.width + strokeWidth) * this.scaleX + padding * 2;
        this.currentHeight = (this.height + strokeWidth) * this.scaleY + padding * 2;

        // If width is negative, make postive. Fixes path selection issue
        if (this.currentWidth < 0) {
            this.currentWidth = Math.abs(this.currentWidth);
        }

        let _hypotenuse = Math.sqrt(Math.pow(this.currentWidth / 2, 2) + Math.pow(this.currentHeight / 2, 2));

        let _angle = Math.atan(this.currentHeight / this.currentWidth);

        // offset added for rotate and scale actions
        let offsetX = Math.cos(_angle + theta) * _hypotenuse,
            offsetY = Math.sin(_angle + theta) * _hypotenuse,
            sinTh = Math.sin(theta),
            cosTh = Math.cos(theta);

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
    _setCornerCoords() {
        let coords = this.oCoords,
            theta = Util.degreesToRadians(this.angle),
            newTheta = Util.degreesToRadians(45 - this.angle),
            cornerHypotenuse = Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2,
            cosHalfOffset = cornerHypotenuse * Math.cos(newTheta),
            sinHalfOffset = cornerHypotenuse * Math.sin(newTheta),
            sinTh = Math.sin(theta),
            cosTh = Math.cos(theta);

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
        this[key] = value;
        return this;
    }
    getWidth(): number {
        return this.width * this.scaleX;
    }
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
