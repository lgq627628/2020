import { Point, Bounds } from './Gesture';
export class Utils {
    static translate(points: Point[], dx: number, dy: number, outputPoints?: Point[]) {
        if (outputPoints) {
            points.forEach((p, i) => {
                outputPoints[i] = [p[0] + dx, p[1] + dy];
            });
        } else {
            points.forEach((p) => {
                p[0] += dx;
                p[1] += dy;
            });
        }
    }
    static rotate(points: Point[], radian: number, center: Point) {
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
    static scale(points: Point[], scaleX: number, scaleY: number, center: Point) {
        points.forEach((p) => {
            let [x, y] = p;
            x -= center[0];
            y -= center[1];
            p[0] = x * scaleX + center[0];
            p[1] = y *scaleY + center[1];
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
        const len = Utils.getLength(inputPoints);
        const unit = len / (sampleCount - 1);
        const outputPoints: Point[] = [[...inputPoints[0]]];

        let curLen = 0;
        let prevPoint = inputPoints[0];

        for (let i = 1; i < inputPoints.length; i++) {
            const curPoint = inputPoints[i];
            let dx = curPoint[0] - prevPoint[0];
            let dy = curPoint[1] - prevPoint[1];
            let tempLen = Utils.getLength([prevPoint, curPoint]);

            while (curLen + tempLen >= unit) {
                const ds = unit - curLen;
                const ratio = ds / tempLen;
                const newPoint: Point = [prevPoint[0] + dx * ratio, prevPoint[1] + dy * ratio];
                outputPoints.push(newPoint);

                curLen = 0;
                prevPoint = newPoint;
                dx = curPoint[0] - prevPoint[0];
                dy = curPoint[1] - prevPoint[1];
                tempLen = Utils.getLength([prevPoint, curPoint]);
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
        let sum = 0;
        for (let i = 0; i < sampleCount; i++) {
            const [x, y] = points[i]
            vector.push(x, y)
            sum += (x * x + y * y)
        }
        sum = Math.sqrt(sum);
        for (let i = 0; i < sampleCount; i++) {
            vector[i] /= sum
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
        console.log(Math.acos(sum));
        return Math.acos(sum);
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
