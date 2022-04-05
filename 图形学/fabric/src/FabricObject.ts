import { Observable } from './Observable';
import { Util, Point } from './Misc';

export class FabricObject extends Observable {
    public type: string = 'object';
    public active: boolean = false;
    /** Horizontal origin of transformation of an object (one of "left", "right", "center") */
    public originX: string = 'center';
    /** Vertical origin of transformation of an object (one of "top", "bottom", "center") */
    public originY: string = 'center';
    public x: number = 0;
    public y: number = 0;
    public top: number = 0;
    public left: number = 0;
    public width: number = 0;
    public height: number = 0;
    public scaleX: number = 1;
    public scaleY: number = 1;
    public angle: number = 0;
    public opacity: number = 1;
    public padding: number = 0;
    public currentWidth: number = 0;
    public currentHeight: number = 0;
    public borderColor: string = 'rgba(102,153,255,0.75)';
    public cornerColor: string = 'rgba(102,153,255,0.5)';
    public fill: string = 'rgb(0,0,0)';
    /** Overlay fill (takes precedence over fill value) */
    public fillRule: string = 'source-over';
    public stroke: string;
    public strokeWidth: number = 1;
    /** 矩阵变换 */
    public transformMatrix: number[];
    /** 水平翻转 */
    public flipX: boolean = false;
    /** 垂直翻转 */
    public flipY: boolean = false;
    public minScaleLimit: number = 0.01;
    public selectable: boolean = true;
    public visible: boolean = true;
    public hasControls: boolean = true;
    public hasBorders: boolean = true;
    public hasRotatingPoint: boolean = true;
    public rotatingPointOffset: number = 40;
    public borderOpacityWhenMoving: number = 0.4;
    public isMoving: boolean = false;
    public borderScaleFactor: number = 1;
    public lockRotation: boolean = false;
    public lockUniScaling: boolean = false;
    /** 物体控制点用 stroke 还是 fill */
    public transparentCorners: boolean = true;
    /** 物体控制点大小，单位 px */
    public cornerSize: number = 12;
    public oCoords;
    public canvas;
    public originalState;
    public group;
    public stateProperties: string[] = ('top left width height scaleX scaleY flipX flipY ' + 'angle opacity cornerSize fill overlayFill originX originY ' + 'stroke strokeWidth strokeDashArray fillRule ' + 'borderScaleFactor transformMatrix selectable shadow visible').split(' ');
    constructor(options) {
        super();
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
    render(ctx: CanvasRenderingContext2D, noTransform: boolean = false) {
        if (this.width === 0 || this.height === 0 || !this.visible) return;

        ctx.save();

        var m = this.transformMatrix;
        if (m && !this.group) {
            ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

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

        if (m && this.group) {
            ctx.translate(-this.group.width / 2, -this.group.height / 2);
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }

        // this._setShadow(ctx);
        // this.clipTo && Util.clipContext(this, ctx);
        this._render(ctx);
        // this.clipTo && ctx.restore();
        // this._removeShadow(ctx);

        if (this.active && !noTransform) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }
    _render(ctx: CanvasRenderingContext2D) {}
    transform(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.opacity;

        let center = this.getCenterPoint();
        ctx.translate(center.x, center.y);
        ctx.rotate(Util.degreesToRadians(this.angle));
        ctx.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
    }
    drawBorders(ctx: CanvasRenderingContext2D): FabricObject {
        if (!this.hasBorders) return;

        var padding = this.padding,
            padding2 = padding * 2,
            strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0;

        ctx.save();

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = this.borderColor;

        var scaleX = 1 / this._constrainScale(this.scaleX),
            scaleY = 1 / this._constrainScale(this.scaleY);

        ctx.lineWidth = 1 / this.borderScaleFactor;

        ctx.scale(scaleX, scaleY);

        var w = this.width,
            h = this.height;

        ctx.strokeRect(
            ~~(-(w / 2) - padding - (strokeWidth / 2) * this.scaleX) + 0.5, // offset needed to make lines look sharper
            ~~(-(h / 2) - padding - (strokeWidth / 2) * this.scaleY) + 0.5,
            ~~(w + padding2 + strokeWidth * this.scaleX),
            ~~(h + padding2 + strokeWidth * this.scaleY)
        );

        if (this.hasRotatingPoint && !this.lockRotation && this.hasControls) {
            var rotateHeight = (this.flipY ? h + strokeWidth * this.scaleY + padding * 2 : -h - strokeWidth * this.scaleY - padding * 2) / 2;

            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight + (this.flipY ? this.rotatingPointOffset : -this.rotatingPointOffset));
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
        return this;
    }
    /** 绘制包围盒模型的控制点 */
    drawControls(ctx: CanvasRenderingContext2D): FabricObject {
        if (!this.hasControls) return;

        var size = this.cornerSize,
            size2 = size / 2,
            strokeWidth2 = this.strokeWidth / 2,
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

        if (!this.lockUniScaling) {
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
        }

        // middle-top-rotate
        if (this.hasRotatingPoint) {
            _left = left + width / 2 - scaleOffsetX;
            _top = this.flipY ? top + height + this.rotatingPointOffset / this.scaleY - sizeY / 2 + strokeWidth2 + paddingY : top - this.rotatingPointOffset / this.scaleY - sizeY / 2 - strokeWidth2 - paddingY;

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
        return this;
    }
    getCenterPoint() {
        return this.translateToCenterPoint(new Point(this.left, this.top), this.originX, this.originY);
    }
    translateToCenterPoint(point: Point, originX: string, originY: string): Point {
        var cx = point.x,
            cy = point.y;

        if (originX === 'left') {
            cx = point.x + this.width / 2;
        } else if (originX === 'right') {
            cx = point.x - this.width / 2;
        }

        if (originY === 'top') {
            cy = point.y + this.height / 2;
        } else if (originY === 'bottom') {
            cy = point.y - this.height / 2;
        }

        // Apply the reverse rotation to the point (it's already scaled properly)
        return Util.rotatePoint(new Point(cx, cy), point, Util.degreesToRadians(this.angle));
    }
    /** 确保缩放值有效 */
    _constrainScale(value: number): number {
        if (Math.abs(value) < this.minScaleLimit) {
            if (value < 0) return -this.minScaleLimit;
            else return this.minScaleLimit;
        }

        return value;
    }
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

        var _hypotenuse = Math.sqrt(Math.pow(this.currentWidth / 2, 2) + Math.pow(this.currentHeight / 2, 2));

        var _angle = Math.atan(this.currentHeight / this.currentWidth);

        // offset added for rotate and scale actions
        var offsetX = Math.cos(_angle + theta) * _hypotenuse,
            offsetY = Math.sin(_angle + theta) * _hypotenuse,
            sinTh = Math.sin(theta),
            cosTh = Math.cos(theta);

        var coords = this.getCenterPoint();
        var tl = {
            x: coords.x - offsetX,
            y: coords.y - offsetY,
        };
        var tr = {
            x: tl.x + this.currentWidth * cosTh,
            y: tl.y + this.currentWidth * sinTh,
        };
        var br = {
            x: tr.x - this.currentHeight * sinTh,
            y: tr.y + this.currentHeight * cosTh,
        };
        var bl = {
            x: tl.x - this.currentHeight * sinTh,
            y: tl.y + this.currentHeight * cosTh,
        };
        var ml = {
            x: tl.x - (this.currentHeight / 2) * sinTh,
            y: tl.y + (this.currentHeight / 2) * cosTh,
        };
        var mt = {
            x: tl.x + (this.currentWidth / 2) * cosTh,
            y: tl.y + (this.currentWidth / 2) * sinTh,
        };
        var mr = {
            x: tr.x - (this.currentHeight / 2) * sinTh,
            y: tr.y + (this.currentHeight / 2) * cosTh,
        };
        var mb = {
            x: bl.x + (this.currentWidth / 2) * cosTh,
            y: bl.y + (this.currentWidth / 2) * sinTh,
        };
        var mtr = {
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
        var coords = this.oCoords,
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
}
export class Rect extends FabricObject {
    public rx: number = 0;
    public ry: number = 0;
    constructor(options) {
        super(options);

        this._initStateProperties();
        this._initRxRy();

        this.x = 0;
        this.y = 0;
    }
    _initStateProperties() {
        this.stateProperties = this.stateProperties.concat(['rx', 'ry']);
    }
    _initRxRy() {
        if (this.rx && !this.ry) {
            this.ry = this.rx;
        } else if (this.ry && !this.rx) {
            this.rx = this.ry;
        }
    }
    _render(ctx: CanvasRenderingContext2D) {
        var rx = this.rx || 0,
            ry = this.ry || 0,
            x = -this.width / 2,
            y = -this.height / 2,
            w = this.width,
            h = this.height;

        ctx.beginPath();
        ctx.globalAlpha = this.group ? ctx.globalAlpha * this.opacity : this.opacity;

        if (this.transformMatrix && this.group) {
            ctx.translate(this.width / 2 + this.x, this.height / 2 + this.y);
        }
        if (!this.transformMatrix && this.group) {
            ctx.translate(-this.group.width / 2 + this.width / 2 + this.x, -this.group.height / 2 + this.height / 2 + this.y);
        }

        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + w - rx, y);
        ctx.bezierCurveTo(x + w, y, x + w, y + ry, x + w, y + ry);
        // ctx.quadraticCurveTo(x + w, y, x + w, y + ry, x + w, y + ry);
        ctx.lineTo(x + w, y + h - ry);
        ctx.bezierCurveTo(x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
        // ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
        ctx.lineTo(x + rx, y + h);
        ctx.bezierCurveTo(x, y + h, x, y + h - ry, x, y + h - ry);
        // ctx.quadraticCurveTo(x, y + h, x, y + h - ry, x, y + h - ry);
        ctx.lineTo(x, y + ry);
        ctx.bezierCurveTo(x, y, x + rx, y, x + rx, y);
        // ctx.quadraticCurveTo(x, y, x + rx, y, x + rx, y);
        ctx.closePath();

        if (this.fill) {
            ctx.fill();
        }

        // this._removeShadow(ctx);

        if (this.stroke) {
            ctx.stroke();
        }
    }
}
