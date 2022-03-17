import { Point, Bounds } from './Gesture';
export class GeoUtils {
    static translate(points: Point[], dx: number, dy: number) {
        points.forEach((p) => {
            p[0] += dx;
            p[1] += dy;
        });
    }
    static rotate(points: Point[], radian: number, center: Point = [0, 0]) {
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);
        points.forEach((p) => {
            let [x, y] = p;
            x -= center[0];
            y -= center[1];
            p[0] = cos * x - sin * y + center[0];
            p[1] = sin * x + cos * y + center[1];
        });
    }
    static scale(points: Point[], scaleX: number, scaleY: number, center: Point = [0, 0]) {
        points.forEach((p) => {
            let [x, y] = p;
            x -= center[0];
            y -= center[1];
            p[0] = x * scaleX + center[0];
            p[1] = y * scaleY + center[1];
        });
    }
    static getLength(points: Point[]): number {
        let length = 0;
        let prev: Point = points[0];
        let cur: Point;
        for (let i = 1; i < points.length; i++) {
            cur = points[i];
            const dx = cur[0] - prev[0];
            const dy = cur[1] - prev[1];
            length += Math.sqrt(dx * dx + dy * dy);
            prev = cur;
        }
        return length;
    }
    static calcCenter(points: Point[]): Point {
        let x = 0;
        let y = 0;
        const count = points.length;
        for (let i = 0; i < count; i++) {
            const p = points[i];
            x += p[0];
            y += p[1];
        }
        x /= count;
        y /= count;
        return [x, y];
    }
    static resample(inputPoints: Point[], sampleCount: number): Point[] {
        const len = GeoUtils.getLength(inputPoints);
        const unit = len / (sampleCount - 1);
        const outputPoints: Point[] = [[...inputPoints[0]]];

        let curLen = 0;
        let prevPoint = inputPoints[0];

        for (let i = 1; i < inputPoints.length; i++) {
            const curPoint = inputPoints[i];
            let dx = curPoint[0] - prevPoint[0];
            let dy = curPoint[1] - prevPoint[1];
            let tempLen = GeoUtils.getLength([prevPoint, curPoint]);

            while (curLen + tempLen >= unit) {
                const ds = unit - curLen;
                const ratio = ds / tempLen;
                const newPoint: Point = [prevPoint[0] + dx * ratio, prevPoint[1] + dy * ratio];
                outputPoints.push(newPoint);

                curLen = 0;
                prevPoint = newPoint;
                dx = curPoint[0] - prevPoint[0];
                dy = curPoint[1] - prevPoint[1];
                tempLen = GeoUtils.getLength([prevPoint, curPoint]);
            }
            prevPoint = curPoint;
            curLen += tempLen;
        }
        while (outputPoints.length < sampleCount) {
            outputPoints.push([...prevPoint]);
        }
        return outputPoints;
    }
    static vectorize(points: Point[], sampleCount: number): number[] {
        let vector: number[] = [];
        let len = 0;
        for (let i = 0; i < sampleCount; i++) {
            const [x, y] = points[i];
            vector.push(x, y);
            len += x * x + y * y;
        }
        len = Math.sqrt(len);
        for (let i = 0; i < 2 * sampleCount; i++) {
            vector[i] /= len;
        }
        return vector;
    }
    static computeAABB(points: Point[]): Bounds {
        const xArr = points.map((point) => point[0]);
        const yArr = points.map((point) => point[1]);

        const minX = Math.min(...xArr);
        const maxX = Math.max(...xArr);
        const minY = Math.min(...yArr);
        const maxY = Math.max(...yArr);
        return {
            top: minY,
            left: minX,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
    static computeScale(bounds: Bounds, w: number, h: number) {
        // 把一个包围盒放入一个矩形中
        const { width, height } = bounds;
        let scale = 1;
        if (width > height) {
            scale = w / width;
        } else {
            scale = h / height;
        }
        return [scale, scale];
    }
    /**
     * 计算余弦相似度
     * @param vector1 向量一
     * @param vector2 向量二
     * @returns
     */
    static calcCosDistance(vector1: number[], vector2: number[]): number {
        let sum = 0;
        vector1.forEach((v1, i) => {
            const v2 = vector2[i];
            sum += v1 * v2;
        });
        // console.log('相似度', sum); // -1~1
        return sum;
        // return Math.acos(sum); // 也可用 acos，则判断就变成 ≤ 0.2
    }
    /**
     * 计算欧氏距离
     * @param points1 点集1
     * @param points2 点集2
     * @returns
     */
    static calcSquareDistance(points1: Point[], points2: Point[]) {
        let sum = 0;
        points1.forEach((p1, i) => {
            const p2 = points2[i];
            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            sum += dx * dx + dy * dy;
        });
        return sum;
    }
    static computeCovarianceMatrix(points: Point[]): number[][] {
        // 协方差
        const array: number[][] = [
            [0, 0],
            [0, 0],
        ];
        const count = points.length;
        for (let i = 0; i < count; i += 1) {
            const x = points[i][0];
            const y = points[i][1];
            array[0][0] += x * x;
            array[0][1] += x * y;
            // array[1][0] = array[0][1]
            array[1][1] += y * y;
        }
        array[1][0] = array[0][1];

        array[0][0] /= count;
        array[0][1] /= count;
        array[1][0] /= count;
        array[1][1] /= count;
        return array;
    }
}

export class CanvasUtils {
    static drawLine(ctx2d: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color = '#aaa', lineWidth = 1) {
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.lineWidth = lineWidth;
        ctx2d.strokeStyle = color;
        ctx2d.stroke();
        ctx2d.restore();
    }
    static drawCircle(ctx2d: CanvasRenderingContext2D, x: number, y: number, r: number, color = 'red') {
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.fillStyle = color;
        ctx2d.arc(x, y, r, 0, 2 * Math.PI);
        ctx2d.fill();
        ctx2d.closePath();
        ctx2d.restore();
    }
    /**
     * 连接多个点成一条线
     * @param points 坐标点集
     */
    static drawPoly(ctx2d: CanvasRenderingContext2D, points: Point[]) {
        ctx2d.save();
        ctx2d.beginPath();
        points.forEach((point, i) => {
            if (i === 0) {
                ctx2d.moveTo(point[0], point[1]);
            } else {
                ctx2d.lineTo(point[0], point[1]);
            }
        });
        ctx2d.lineWidth = 4;
        ctx2d.strokeStyle = 'blue';
        ctx2d.stroke();
        ctx2d.restore();
    }
    static drawCanvasImg(ctx2d: CanvasRenderingContext2D, canvas: HTMLCanvasElement, x: number, y: number) {
        ctx2d.drawImage(canvas, x, y);
    }
    /**
     * 创建缩略图
     * @param points 点集
     * @param center 原画布中心
     * @param size 缩略图画布中心
     * @param isMatch 图形是否匹配
     * @returns
     */
    static createGestureImg(points: Point[], size: number, isMatch: boolean): HTMLCanvasElement {
        const aabb = GeoUtils.computeAABB(points);

        const maxSize = Math.max(aabb.width, aabb.height);
        // 这个 scale 简单理解就是把缩略图里面的手势再缩小一点
        const scale = Math.min(size / maxSize, 1) * 0.7;

        const cx = size / 2;
        const cy = size / 2;

        const canvas = document.createElement('canvas');
        const ctx2d = canvas.getContext('2d');
        canvas.width = canvas.height = size;

        // 绘制缩略图边框
        ctx2d.rect(0, 0, size, size);
        ctx2d.save();
        ctx2d.translate(cx, cy);
        if (isMatch) {
            ctx2d.strokeStyle = 'red';
            ctx2d.lineWidth = 15;
        } else {
            ctx2d.strokeStyle = '#000';
        }
        ctx2d.stroke();

        const newPoints: Point[] = points.map((p) => {
            return [p[0] * scale, p[1] * scale];
        });
        CanvasUtils.drawPoly(ctx2d, newPoints);
        ctx2d.restore();
        return canvas;
    }
}
