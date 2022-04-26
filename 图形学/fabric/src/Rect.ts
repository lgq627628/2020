import { FabricObject } from './FabricObject';

/** 矩形类 */
export class Rect extends FabricObject {
    public type: string = 'rect';
    /** 圆角 rx */
    public rx: number = 0;
    /** 圆角 ry */
    public ry: number = 0;
    constructor(options) {
        super(options);
        this._initStateProperties();
        this._initRxRy(options);
    }
    _initStateProperties() {
        this.stateProperties = this.stateProperties.concat(['rx', 'ry']);
    }
    /** 初始化圆角 */
    _initRxRy(options) {
        this.rx = options.rx || 0;
        this.ry = options.ry || 0;
        /** 如果 rx 或者 ry 只传了一个，默认二者相等 */
        if (this.rx && !this.ry) {
            this.ry = this.rx;
        } else if (this.ry && !this.rx) {
            this.rx = this.ry;
        }
    }
    _render(ctx: CanvasRenderingContext2D) {
        let rx = this.rx || 0,
            ry = this.ry || 0,
            x = -this.width / 2,
            y = -this.height / 2,
            w = this.width,
            h = this.height;

        // 绘制一个新的东西，大部分情况下都要开启一个新路径，要养成习惯
        ctx.beginPath();

        // if (this.transformMatrix && this.group) {
        //     ctx.translate(this.width / 2, this.height / 2);
        // }
        // if (!this.transformMatrix && this.group) {
        //     ctx.translate(-this.group.width / 2 + this.width / 2, -this.group.height / 2 + this.height / 2);
        // }
        if (this.group) ctx.translate(-this.group.width / 2 + this.width / 2, -this.group.height / 2 + this.height / 2);

        // 从左上角开始顺时针画矩形，这里就是单纯的绘制一个规规矩矩的矩形，不考虑旋转缩放啥的，因为旋转缩放会在调用 _render 函数之前处理
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + w - rx, y);
        ctx.bezierCurveTo(x + w, y, x + w, y + ry, x + w, y + ry);
        ctx.lineTo(x + w, y + h - ry);
        ctx.bezierCurveTo(x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
        ctx.lineTo(x + rx, y + h);
        ctx.bezierCurveTo(x, y + h, x, y + h - ry, x, y + h - ry);
        ctx.lineTo(x, y + ry);
        ctx.bezierCurveTo(x, y, x + rx, y, x + rx, y);
        ctx.closePath();

        if (this.fill) ctx.fill();

        if (this.stroke) ctx.stroke();
    }
}
