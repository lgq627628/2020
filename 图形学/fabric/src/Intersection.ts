import { Util } from './Util';
import { Point } from './Point';

/** 框选交互类，也就是拖蓝选择区域 */
export class Intersection {
    public status;
    public points: Point[];
    constructor(status) {
        this.init(status);
    }
    init(status) {
        this.status = status;
        this.points = [];
    }
    appendPoint(point: Point) {
        this.points.push(point);
    }
    appendPoints(points: Point[]) {
        this.points = this.points.concat(points);
    }

    static intersectLineLine(a1, a2, b1, b2) {
        let result,
            ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
            ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
            u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (u_b !== 0) {
            let ua = ua_t / u_b,
                ub = ub_t / u_b;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                result = new Intersection('Intersection');
                result.points.push(new Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = new Intersection('No Intersection');
            }
        } else {
            if (ua_t === 0 || ub_t === 0) {
                result = new Intersection('Coincident');
            } else {
                result = new Intersection('Parallel');
            }
        }
        return result;
    }
    static intersectLinePolygon(a1, a2, points) {
        let result = new Intersection('No Intersection'),
            length = points.length;

        for (let i = 0; i < length; i++) {
            let b1 = points[i],
                b2 = points[(i + 1) % length],
                inter = Intersection.intersectLineLine(a1, a2, b1, b2);

            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = 'Intersection';
        }
        return result;
    }
    static intersectPolygonPolygon(points1, points2) {
        let result = new Intersection('No Intersection'),
            length = points1.length;

        for (let i = 0; i < length; i++) {
            let a1 = points1[i],
                a2 = points1[(i + 1) % length],
                inter = Intersection.intersectLinePolygon(a1, a2, points2);

            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = 'Intersection';
        }
        return result;
    }
    static intersectPolygonRectangle(points: Point[], r1: number, r2: number) {
        let min = Util.min([r1, r2]),
            max = Util.max([r1, r2]),
            topRight = new Point(max.x, min.y),
            bottomLeft = new Point(min.x, max.y),
            inter1 = Intersection.intersectLinePolygon(min, topRight, points),
            inter2 = Intersection.intersectLinePolygon(topRight, max, points),
            inter3 = Intersection.intersectLinePolygon(max, bottomLeft, points),
            inter4 = Intersection.intersectLinePolygon(bottomLeft, min, points),
            result = new Intersection('No Intersection');

        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);

        if (result.points.length > 0) {
            result.status = 'Intersection';
        }
        return result;
    }
}
