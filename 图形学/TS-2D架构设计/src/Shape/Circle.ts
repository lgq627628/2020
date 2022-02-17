import { Math2D, vec2 } from '../math2D';
import { IRenderState, ITransformable } from '../ISprite';
import { BaseShape2D } from './BaseShape2D';

/**
 * 圆
 */
export class Circle extends BaseShape2D {
	public radius: number;

	public constructor(radius: number = 1) {
		super();
		this.radius = radius;
	}

	public get type(): string {
		return 'Circle';
	}

	public hitTest(localPt: vec2, transform: ITransformable) {
		return Math2D.isPointInCircle(localPt, vec2.create(0, 0), this.radius);
	}

	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		context.beginPath();
		context.arc(0, 0, this.radius, 0, Math.PI * 2.0, true);
		super.draw(transformable, state, context);
	}
}
