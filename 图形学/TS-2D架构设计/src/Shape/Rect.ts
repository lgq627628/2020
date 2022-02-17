import { Math2D, vec2 } from '../math2D';
import { IRenderState, ITransformable } from '../ISprite';
import { BaseShape2D } from './BaseShape2D';

/**
 * 矩形
 */
export class Rect extends BaseShape2D {
	public width: number;
	public height: number;
	public x: number;
	public y: number;
	// 使用 u、v 控制矩形的原点偏移，其中 u、v 的取值范围为 [ 0, 1 ] 之间，表示原点相对矩形左上角的偏移比例
	public constructor(w: number = 1, h: number = 1, u: number = 0, v: number = 0) {
		super();
		this.width = w;
		this.height = h;
		this.x = -this.width * u;
		this.y = -this.height * v;
	}

	public get right(): number {
		return this.x + this.width;
	}

	public get bottom(): number {
		return this.y + this.height;
	}

	public get type(): string {
		return 'Rect';
	}

	public hitTest(localPt: vec2, transform: ITransformable) {
		return Math2D.isPointInRect(localPt.x, localPt.y, this.x, this.y, this.width, this.height);
	}

	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		// 使用 moveTo ， lineTo 及 closePath 渲染命令生成封闭的路径
		context.beginPath();
		context.moveTo(this.x, this.y);
		context.lineTo(this.x + this.width, this.y);
		context.lineTo(this.x + this.width, this.y + this.height);
		context.lineTo(this.x, this.y + this.height);
		context.closePath();
		super.draw(transformable, state, context);
	}
}
