import { vec2 } from './math2D';
import { IShape, ISprite } from './ISprite';
import { Circle } from './Shape/Circle';
import { ConvexPolygon } from './Shape/ConvexPolygon';
import { Ellipse } from './Shape/Ellipse';
import { Grid } from './Shape/Grid';
import { Line } from './Shape/Line';
import { Rect } from './Shape/Rect';
import { Bone } from './Shape/Bone';
import { Scale9Data, Scale9Grid } from './Shape/Scale9Grid';
import { Sprite2D } from './Sprite2D';

export class SpriteFactory {
	public static createSprite(shape: IShape, name: string = ''): ISprite {
		let spr: ISprite = new Sprite2D(shape, name);
		return spr;
	}

	// 通过两点获取的一条直线
	public static createLine(start: vec2, end: vec2): IShape {
		let line: Line = new Line();
		line.start = start;
		line.end = end;
		return line;
	}

	//  通过线段长度和[ 0 , 1 ] 之间的 t 获得一条与 x 轴方向平行的、原点在该线段任意一点的直线
	public static createXLine(len: number = 10, t: number = 0): IShape {
		return new Line(len, t);
	}

	public static createGrid(w: number, h: number, xStep: number = 10, yStep: number = 10): IShape {
		return new Grid(w, h, xStep, yStep);
	}

	public static create9Grid(w: number, h: number, xStep: number = 10, yStep: number = 10): IShape {
		return new Grid(w, h, xStep, yStep);
	}

	public static createCircle(radius: number): IShape {
		return new Circle(radius);
	}

	public static createRect(w: number, h: number, u: number = 0, v: number = 0): IShape {
		return new Rect(w, h, u, v);
	}

	public static createEllipse(radiusX: number, radiusY: number): IShape {
		return new Ellipse(radiusX, radiusY);
	}

	public static createPolygon(points: vec2[]): IShape {
		if (points.length < 3) {
			throw new Error('多边形顶点必须大于等于 3');
		}
		return new ConvexPolygon(points);
	}

	public static createScale9Grid(data: Scale9Data, width: number, height: number, u: number = 0, v: number = 0): IShape {
		return new Scale9Grid(data, width, height, u, v);
	}

	public static createBone(len: number = 10, t: number = 0): IShape {
		return new Bone(len, t);
	}
}
