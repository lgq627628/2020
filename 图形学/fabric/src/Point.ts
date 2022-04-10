export class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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
