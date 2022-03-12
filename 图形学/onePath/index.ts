type Point = [number, number];
interface Bounds {
    top: number;
    left: number;
    width: number;
    height: number;
}
interface cache {
    [id: number]: number[];
}
interface canvasCache {
    [id: number]: HTMLCanvasElement;
}
class Utils {
    static getLen(point1: Point, point2: Point): number {
        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    static vectorize(points: Point[]): number[] {
        let vectors: number[] = [];
        let sum = 0;
        points.forEach((point) => {
            const [x, y] = point;
            vectors.push(x, y);
            sum += x * x + y * y;
        });
        sum = Math.sqrt(sum);
        vectors = vectors.map((vector) => {
            return (vector /= sum);
        });
        return vectors;
    }
    static computeAABB(points: Point[] = []): Bounds {
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
    static cosDistance(vectors1: number[], vectors2: number[]): number {
        const base = vectors1.length < vectors2.length ? vectors1 : vectors2;
        const other = base === vectors1 ? vectors2 : vectors1;
        let sum = 0;
        base.forEach((v, i) => {
            sum += v * other[i];
        })
        return Math.cos(sum);
    }
}
export class Gesture {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D;
    public bounds: DOMRect;
    public state: any;
    public points: Point[];
    public sampleCount: number = 50;
    public centerPoint: Point;
    public splitCount: number = 8;
    public radian: number = 0;
    public aabb: number = 300;

    public id: number = 1;
    public cache: cache = {};
    public gestureLib: canvasCache = {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        this.bounds = canvas.getBoundingClientRect();
        this.state = {
            isMove: false,
        };
        this.points = [];
        this.drawSubline();
        this.addEvent();
    }
    /**
     * 重新采样
     */
    resample(inputPoints = this.points, count = this.sampleCount): Point[] {
        const len = this.calcAllLength(inputPoints);
        const unit = len / count;
        const outputPoints: Point[] = [inputPoints[0]];

        let curLen = 0;
        let prevPoint = inputPoints[0];

        for (let i = 1; i < inputPoints.length; i++) {
            const curPoint = inputPoints[i];
            let dx = curPoint[0] - prevPoint[0];
            let dy = curPoint[1] - prevPoint[1];
            let tempLen = Utils.getLen(prevPoint, curPoint);

            while (curLen + tempLen >= unit) {
                const ds = unit - curLen;
                const ratio = ds / tempLen;
                const newPoint: Point = [prevPoint[0] + dx * ratio, prevPoint[1] + dy * ratio];
                outputPoints.push(newPoint);

                curLen = 0;
                prevPoint = newPoint;
                dx = curPoint[0] - prevPoint[0];
                dy = curPoint[1] - prevPoint[1];
                tempLen = Utils.getLen(prevPoint, curPoint);
            }
            prevPoint = curPoint;
            curLen += tempLen;
        }
        outputPoints.push(inputPoints[inputPoints.length - 1]);

        this.clearRect();
        this.drawPoly(inputPoints);
        this.redrawSamplePoint(outputPoints);

        this.centerPoint = this.getCenter(outputPoints);
        this.drawCenter(this.centerPoint);

        return outputPoints;
    }
    redrawSamplePoint(points: Point[] = []) {
        points.forEach((point) => {
            this.drawCircle(point[0], point[1], 6, '#000');
        });
    }
    /**
     * 重新绘制形状
     * @param points 坐标点集
     */
    drawPoly(points: Point[] = []) {
        this.ctx2d.save();
        this.ctx2d.beginPath();
        points.forEach((point, i) => {
            if (i === 0) {
                this.ctx2d.moveTo(point[0], point[1]);
            } else {
                this.ctx2d.lineTo(point[0], point[1]);
            }
        });
        this.ctx2d.lineWidth = 3;
        this.ctx2d.strokeStyle = 'blue';
        this.ctx2d.stroke();
        this.ctx2d.restore();
    }
    getCenter(points: Point[] = []): Point {
        const sum = points.reduce(
            (prev, cur, i) => {
                return [prev[0] + cur[0], prev[1] + cur[1]];
            },
            [0, 0]
        );
        return [sum[0] / points.length, sum[1] / points.length];
    }
    drawCenter(point: Point = [0, 0]) {
        this.drawCircle(point[0], point[1], 10, 'green');
        const startPos = this.points[0];
        this.drawLine(point[0], point[1], startPos[0], startPos[1], 'green', 3);
    }
    /**
     * 平移图形中心点到画布中心
     * @param point 坐标点集
     */
    translateCenter(point: Point = this.centerPoint) {
        const { width, height } = this.canvas;
        const dx = width / 2 - point[0];
        const dy = height / 2 - point[1];
        this.points = this.points.map((point) => {
            return [point[0] + dx, point[1] + dy];
        });
        this.resample();
    }
    rotateGesture() {
        // this.ctx2d.save();
        const p1 = [this.canvas.width / 2, this.canvas.height / 2];
        const p2 = this.points[0];

        const dy = p2[1] - p1[1];
        const dx = p2[0] - p1[0];

        let radian = Math.atan2(dy, dx);
        if (radian < 0) radian += 2 * Math.PI;

        const unitRadian = (2 * Math.PI) / this.splitCount;
        const targetRadian = Math.round(radian / unitRadian) * unitRadian;

        radian -= targetRadian;
        // const deltaRadian = targetRadian - radian;

        const sin = Math.sin(-radian);
        const cos = Math.cos(-radian);

        this.points = this.points.map((point) => {
            let [x, y] = point;
            x -= p1[0];
            y -= p1[1];
            return [x * cos - y * sin + p1[0], x * sin + y * cos + p1[1]];
        });

        this.resample();
        // this.ctx2d.restore();
    }
    scaleGesture() {
        const { aabb } = this;
        const { width, height } = Utils.computeAABB(this.points);

        let scale = 1;
        if (width > height) {
            scale = aabb / width;
        } else {
            scale = aabb / height;
        }

        const centerPoint = [this.canvas.width / 2, this.canvas.height / 2];
        this.points = this.points.map((point) => {
            let [x, y] = point;
            x -= centerPoint[0];
            y -= centerPoint[1];
            return [x * scale + centerPoint[0], y * scale + centerPoint[1]];
        });

        this.resample();
    }
    addGesture() {
        this.cache[this.id] = Utils.vectorize(this.points);

        localStorage.setItem('xx', JSON.stringify(this.cache));
        this.clearRect();
        const canvas = this.createGestureImg(this.points);
        this.gestureLib[this.id] = canvas;
        this.drawImg(canvas, (this.id - 1) * canvas.width + 10, 10);

        this.id++;
    }
    createGestureImg(points: Point[] = [], size = 100): HTMLCanvasElement {
        const aabb = Utils.computeAABB(points);

        const maxSize = Math.max(aabb.width, aabb.height);
        const scale = Math.min(size / maxSize, 1) * 0.7;

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
            const [x, y] = point;
            return [x * scale - cx, y * scale - cy];
        });
        this.drawPoly(newPoints);
        ctx2d.restore();
        return canvas;
    }
    drawImg(canvas: HTMLCanvasElement, x: number, y: number) {
        this.ctx2d.drawImage(canvas, x, y);
    }
    compareGesture() {
        // const newPoints = this.transform(this.points);
        const vectors = Utils.vectorize(this.points);
        const cache: cache = JSON.parse(localStorage.getItem('xx'));
        const error = 0.2;
        Object.entries(cache).forEach(([id, v]) => {
            const rs = Utils.cosDistance(v, vectors);
            console.log(id, rs);
            if (rs <= error) console.log('匹配成功', id);
        });
    }
    transform(point: Point[]): Point[] {
        const newPoint: Point[] = [];
        // 重新采样
        this.resample();
        // 平移
        // 旋转
        // 缩放
        return newPoint;
    }
    /**
     * 计算坐标点连线的总长
     * @param points 一些列坐标点
     */
    calcAllLength(points: Point[] = []): number {
        return points.reduce((prev, cur, i) => {
            if (i === 0) {
                return prev;
            } else {
                return prev + this.calcLength(points[i - 1], points[i]);
            }
        }, 0);
    }
    calcLength(point1: Point, point2: Point): number {
        const dx = point2[0] - point1[0];
        const dy = point2[1] - point1[1];
        return Math.sqrt(dx * dx + dy * dy);
    }
    /**
     * 监听画布事件
     */
    addEvent() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMousedown(e));
        document.addEventListener('mousemove', (e) => this.handleMousemove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseup(e));
    }
    handleMousedown(e: MouseEvent) {
        this.state.isMove = true;
        this.points = [];
        const startPoint = this.getCanvasPos(e);
        this.points.push(startPoint);
    }
    handleMousemove(e: MouseEvent) {
        if (!this.state.isMove) return;
        const curPoint = this.getCanvasPos(e);
        // 超出边界
        if (curPoint[0] < 0 || curPoint[0] > this.canvas.width || curPoint[1] < 0 || curPoint[1] > this.canvas.height) {
            this.state.isMove = false;
            return;
        }
        const lastPoint = this.points[this.points.length - 1];
        this.drawLine(lastPoint[0], lastPoint[1], curPoint[0], curPoint[1], 'blue', 2);
        this.drawCircle(curPoint[0], curPoint[1], 5);
        this.points.push(curPoint);
    }
    handleMouseup(e: MouseEvent) {
        this.state.isMove = false;
        this.resample();
    }
    getCanvasPos(e: MouseEvent): Point {
        return [e.clientX - this.bounds.left, e.clientY - this.bounds.top];
    }
    /**
     * 绘制辅助线
     */
    drawSubline() {
        const { width, height } = this.canvas;

        this.drawLine(0, height / 2, width, height / 2);
        this.drawLine(width / 2, 0, width / 2, height);

        if (width > height) {
            this.drawLine(width / 2 + height / 2, 0, width / 2 - height / 2, height);
            this.drawLine(width / 2 - height / 2, 0, width / 2 + height / 2, height);
        } else {
            this.drawLine(0, height / 2 - width / 2, width, height / 2 + width / 2);
            this.drawLine(0, height / 2 + width / 2, width, height / 2 - width / 2);
        }

        this.ctx2d.beginPath();
        this.ctx2d.rect(width / 2 - this.aabb / 2, height / 2 - this.aabb / 2, this.aabb, this.aabb);
        this.ctx2d.stroke();
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, color = '#000', lineWidth = 1) {
        const { ctx2d } = this;
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.lineWidth = lineWidth;
        ctx2d.strokeStyle = color;
        ctx2d.stroke();
        ctx2d.restore();
    }
    drawCircle(x: number, y: number, r: number, color = 'red') {
        const { ctx2d } = this;
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.fillStyle = color;
        ctx2d.arc(x, y, r, 0, 2 * Math.PI);
        ctx2d.fill();
        ctx2d.closePath();
        ctx2d.restore();
    }
    clearRect() {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSubline();
        Object.values(this.gestureLib).forEach((canvas, i) => {
            this.drawImg(canvas, i * canvas.width + 10, 10);
        })
    }
}
