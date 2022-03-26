import { mat2d } from '../math2D';
import { IRenderState, ITransformable } from '../ISprite';
import { Line } from './Line';

export class Bone extends Line {
	/** @override */
	public get type(): string {
		return 'Bone';
	}

	/** @override  */
	public endDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		super.endDraw(transformable, state, context);
		context.save();
		let mat: mat2d = transformable.getWorldMatrix();
		context.setTransform(1, 0, 0, 1, mat.values[4], mat.values[5]);
		context.beginPath();
		context.fillStyle = 'blue';
		context.arc(this.start.x, this.start.y, 5, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}

    
}
