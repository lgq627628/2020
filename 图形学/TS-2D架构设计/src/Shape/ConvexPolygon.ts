import { Math2D, vec2 } from '../math2D';
import { IRenderState, ITransformable } from '../ISprite';
import { BaseShape2D } from './BaseShape2D';

/**
 * 凸多边形
 */
export class ConvexPolygon extends BaseShape2D {
	public points: vec2[];

	public constructor(points: vec2[]) {
		super();
		if (points.length < 3) {
			throw new Error('多边形定点必须大于等于 3 ！！');
		}
		if (Math2D.isConvex(points) === false) {
			throw new Error('当前多边形不是凸多边形');
		}
		this.points = points;
	}

	public get type(): string {
		return 'Polygon';
	}

	public hitTest(localPt: vec2, transform: ITransformable) {
		// for (let i = 2; i < this.points.length; i++) {
		// 	if (Math2D.isPointInTriangle(localPt, this.points[0], this.points[1], this.points[2])) {
		// 		return true;
		// 	}
		// }
		// return false;
		return Math2D.isPointInPolygon(localPt, this.points);
	}

	public draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
		// 使用 moveTo ， lineTo 及 closePath 渲染命令生成封闭的路径
		context.beginPath();
		context.moveTo(this.points[0].x, this.points[0].y);
		for (let i = 1; i < this.points.length; i++) {
			context.lineTo(this.points[i].x, this.points[i].y);
		}
		context.closePath();
		super.draw(transformable, state, context);
	}
}
