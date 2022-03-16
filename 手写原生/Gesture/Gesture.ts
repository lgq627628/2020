import { GeoUtils } from './Util';

export type Point = [number, number];

export interface Bounds {
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface Cache {
    [name: string]: Gesture;
}
export const TWO_PI = 2 * Math.PI;

export class Gesture {
    /** 归一化大小 */
    static unitSize = 300;
    /** 缩略图大小 */
    static demoSize = 100;
    /**  八等分坐标轴作为参考线 */
    static sublineCount: number = 8;
    /** 样本数量 */
    public sampleCount = 32;
    /** 缩略图 */
    public canvas: HTMLCanvasElement;

    /** 原始数据点 */
    public inputPoints: Point[];
    /** 采样点 */
    public points: Point[];
    /** 采样点的大致中心点 */
    public center: Point;

    /** 采样点的包围盒 */
    public aabb: Bounds;
    /** 采样点的特征向量 */
    public vector: number[];
    /** 是否匹配 */
    public isMatch: boolean = false;

    constructor(inputPoints: Point[]) {
        this.inputPoints = inputPoints;
    }
    resample() {
        const inputPoints = this.inputPoints;
        this.points = GeoUtils.resample(inputPoints, this.sampleCount);
        this.center = GeoUtils.calcCenter(this.points);
    }
    translaste() {
        const [dx, dy] = this.center;
        GeoUtils.translate(this.inputPoints, -dx, -dy);
        GeoUtils.translate(this.points, -dx, -dy);
    }
    rotate() {
        const radian = this.computeRadianToSubline([0, 0], this.points[0], Gesture.sublineCount);
        GeoUtils.rotate(this.inputPoints, -radian);
        GeoUtils.rotate(this.points, -radian);
    }
    scale() {
        this.aabb = GeoUtils.computeAABB(this.points);
        const [scaleX, scaleY] = GeoUtils.computeScale(this.aabb, Gesture.unitSize, Gesture.unitSize);
        GeoUtils.scale(this.inputPoints, scaleX, scaleY);
        GeoUtils.scale(this.points, scaleX, scaleY);
    }
    vectorize() {
        this.vector = GeoUtils.vectorize(this.points, this.sampleCount);
    }
    /**
     * 计算需要旋转到最近辅助线的弧度
     * @param center 中心点
     * @param startPoint 手势起始点
     * @param sublineCount 坐标等分数量
     * @returns
     */
    computeRadianToSubline(center: Point, startPoint: Point, sublineCount: number): number {
        const dy = startPoint[1] - center[1];
        const dx = startPoint[0] - center[0];

        let radian = Math.atan2(dy, dx);
        if (radian < 0) radian += TWO_PI;

        const unitRadian = TWO_PI / sublineCount;
        const targetRadian = Math.round(radian / unitRadian) * unitRadian;
        radian -= targetRadian;
        return radian;
    }
}
