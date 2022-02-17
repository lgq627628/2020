import { ERenderType, IRenderState, IShape, ITransformable } from '../ISprite';
import { mat2d, vec2 } from '../math2D';

// 在 class 之前使用 abstract 关键字表示当前抽象类
export abstract class BaseShape2D implements IShape {
	// 属性前使用 abstract 关键字表示一个抽象属性
	// 子类必须 override，返回当前子类的实际抽象属性
	public abstract get type(): string;

	public abstract hitTest(localPt: vec2, transform: ITransformable): boolean;
	// 2D 局部坐标的绘制
	public axisXStyle: string | CanvasGradient | CanvasPattern;
	public axisYStyle: string | CanvasGradient | CanvasPattern;
	public axisLineWidth: number;
	public axisLength: number;

	public data: any;
	public constructor() {
		this.axisXStyle = 'rgba(255, 0, 0, 128)';
		this.axisYStyle = 'rgba(0, 255, 0, 128)';
		this.axisLength = 100;
		this.axisLineWidth = 1;
		this.data = undefined;
	}

	protected drawLine(ctx: CanvasRenderingContext2D, style: string | CanvasGradient | CanvasPattern, isAxisX: boolean = true): void {
		ctx.save();
		ctx.strokeStyle = style;
		ctx.lineWidth = this.axisLineWidth;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		if (isAxisX) {
			ctx.lineTo(this.axisLength, 0);
		} else {
			ctx.lineTo(0, this.axisLength);
		}

		ctx.stroke();
		ctx.restore();
	}

	public beginDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		context.save();

		context.lineWidth = state.lineWidth;
		context.strokeStyle = state.strokeStyle;
		context.fillStyle = state.fillStyle;
		// 通过 ITransformable 接口获得当前 IShape 的全局矩阵
		// 然后设置变换矩阵
		let mat: mat2d = transformable.getWorldMatrix();
		context.setTransform(mat.values[0], mat.values[1], mat.values[2], mat.values[3], mat.values[4], mat.values[5]);
	}

	// 子类必须覆写 draw 方法，有必要的情况下调用基类的 super.draw()
	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		if (state.renderType === ERenderType.STROKE) {
			context.stroke();
		} else if (state.renderType === ERenderType.FILL) {
			context.fill();
		} else if (state.renderType === ERenderType.STROKE_FILL) {
			context.stroke();
			context.fill();
		} else if (state.renderType === ERenderType.CLIP) {
			context.clip();
		}
	}

	public endDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		// 非裁剪模式下，并且 showCoordSystem 为 true 的情况下，绘制出坐标系
		if (state.renderType !== ERenderType.CLIP) {
			if (state.showCoordSystem) {
				this.drawLine(context, this.axisXStyle, true);
				this.drawLine(context, this.axisYStyle, false);
			}
		}
		context.restore();
	}
}