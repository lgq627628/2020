export class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    /** 返回一个新的点，值为两个点的最小x、y值 */
    min(otherPoint: Point) {
        return new Point(Math.min(this.x, otherPoint.x), Math.min(this.y, otherPoint.y));
    }
    /** 返回一个新的点，值为两个点的最大x、y值 */
    max(otherPoint: Point) {
        return new Point(Math.max(this.x, otherPoint.x), Math.max(this.y, otherPoint.y));
    }

    /** += 的意思，会改变自身的值 */
    addEquals(point: Point): Point {
        this.x += point.x;
        this.y += point.y;
        return this;
    }
    /** -= 的意思，会改变自身的值 */
    subtractEquals(point: Point): Point {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }
}
