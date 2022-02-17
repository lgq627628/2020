import { Math2D, vec2 } from '../math2D';
import { IRenderState, ITransformable } from '../ISprite';
import { BaseShape2D } from './BaseShape2D';

/**
 * 椭圆
 */
export class Ellipse extends BaseShape2D {
	public radiusX: number;
	public radiusY: number;
	// 椭圆圆心在局部坐标系的 [ 0 , 0 ] 位置处
	public constructor(radiusX: number = 10, radiusY: number = 10) {
		super();
		this.radiusX = radiusX;
		this.radiusY = radiusY;
	}

	public get type(): string {
		return 'Ellipse';
	}

	public hitTest(localPt: vec2, transform: ITransformable) {
		let isHitted: boolean = Math2D.isPointInEllipse(localPt.x, localPt.y, 0, 0, this.radiusX, this.radiusY);
		return isHitted;
	}

	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		context.beginPath();
		context.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2.0);
		super.draw(transformable, state, context);
	}
}
