import { Utils } from './Util';

export type Point = [number, number];

export interface Bounds {
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface Cache {
    [name: string]: number[];
}
export interface canvasCache {
    [id: string]: HTMLCanvasElement;
}
export const TWO_PI = 2 * Math.PI;

export class Gesture {
    public sampleCount = 32;
    public unitSize = 300; // 归一化的大小
    public demoSize = 100; // 归一化的大小

    public id: string = null;
    /** 原始数据点 */
    public inputPoints: Point[];
    /** 采样点 */
    public points: Point[];
    public center: Point; // 所有点的中心
    public sublineCount: number = 8; // 几等分辅助线

    public aabb: Bounds;
    public vector: number[]; // 特征向量

    constructor(inputPoints: Point[]) {
        this.inputPoints = inputPoints;
    }
    resample() {
        const inputPoints = this.inputPoints;
        this.points = Utils.resample(inputPoints, this.sampleCount);
        this.center = Utils.calcCenter(this.points);
    }
    translaste(target: Point) {
        const dx = target[0] - this.center[0];
        const dy = target[1] - this.center[1];
        Utils.translate(this.inputPoints, dx, dy);
        Utils.translate(this.points, dx, dy);
        this.center = [...target];
    }
    rotate() {
        const radian = this.computeRadianToSubline(this.center, this.points[0], this.sublineCount);
        Utils.rotate(this.inputPoints, radian, this.center);
        Utils.rotate(this.points, radian, this.center);
    }
    scale() {
        this.aabb = Utils.computeAABB(this.points);
        const [scaleX, scaleY] = Utils.computeScale(this.aabb, this.unitSize, this.unitSize);
        Utils.scale(this.inputPoints, scaleX, scaleY, this.center);
        Utils.scale(this.points, scaleX, scaleY, this.center);
    }
    vectorize() {
        this.vector = Utils.vectorize(this.points, this.sampleCount);
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
        return targetRadian - radian;
    }
    createGestureImg(points = this.inputPoints, center = this.center, size = this.demoSize): HTMLCanvasElement {
        const aabb = Utils.computeAABB(points);

        const maxSize = Math.max(aabb.width, aabb.height);
        const scale = Math.min(size / maxSize, 1) * 0.7;

        console.log('sssss', scale);
        const cx = size / 2;
        const cy = size / 2;

        const canvas = document.createElement('canvas');
        const ctx2d = canvas.getContext('2d');
        canvas.width = canvas.height = size;

        ctx2d.save();
        ctx2d.rect(0, 0, size, size);
        ctx2d.strokeStyle = '#000';
        ctx2d.stroke();

        const newPoints: Point[] = points.map((point) => {
            let [x, y] = point;
            x -= center[0];
            y -= center[1];
            return [x * scale + cx, y * scale + cy];
        });
        this.drawPoly(ctx2d, newPoints);
        ctx2d.restore();
        return canvas;
    }
     /**
     * 重新绘制形状
     * @param points 坐标点集
     */
      drawPoly(ctx2d: CanvasRenderingContext2D, points: Point[]) {
        ctx2d.save();
        ctx2d.beginPath();
        points.forEach((point, i) => {
            if (i === 0) {
                ctx2d.moveTo(point[0], point[1]);
            } else {
                ctx2d.lineTo(point[0], point[1]);
            }
        });
        ctx2d.lineWidth = 3;
        ctx2d.strokeStyle = 'blue';
        ctx2d.stroke();
        ctx2d.restore();
    }
}
