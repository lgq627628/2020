import { Utils } from './Util';
import { Pool } from './Pool';
import { Point, Gesture } from './Gesture';

interface Iconfig {
    /** 采样数量 */
    sampleCount: number;
    /** 归一化单元格大小 */
    unitSize: number;
}
export class App {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D;
    public bounds: DOMRect;
    public isMove: boolean = false;

    public metaPoints: Point[] = [];

    public config: Iconfig = {
        sampleCount: 32,
        unitSize: 300,
    };
    public curGesture: Gesture;

    public pool: Pool;
    public id: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        this.bounds = canvas.getBoundingClientRect();
        this.pool = Pool.getInstance();
        this.clearRect();
        this.addEvent();
    }
    async auto() {
        if (!this.metaPoints.length) return;
        this.resample();
        await this.sleep();
        this.translateGesture();
        await this.sleep();
        this.rotateGesture();
        await this.sleep();
        this.scaleGesture();
        await this.sleep();
        this.addGesture();
    }
    resample() {
        if (!this.metaPoints.length) return;
        this.curGesture.resample();
        this.redraw();
    }
    translateGesture() {
        if (!this.metaPoints.length) return;
        const { width, height } =  this.canvas;
        this.curGesture.translaste([width / 2, height / 2]);
        this.redraw();
    }
    rotateGesture() {
        if (!this.metaPoints.length) return;
        this.curGesture.rotate();
        this.redraw();
    }
    scaleGesture() {
        if (!this.metaPoints.length) return;
        this.curGesture.scale();
        this.redraw();
    }
    addGesture() {
        this.clear();
        this.curGesture.vectorize();
        const canvas = this.curGesture.createGestureImg();
        this.pool.addGesture(String(this.id++), this.curGesture.vector);
        this.drawImg(canvas, (this.id - 1) * canvas.width + 10, 10);
    }
    deleteGesture() {}
    compareGesture() {}
    clear() {
        this.clearRect();
    }
    redraw() {
        this.clearRect();
        const { points, inputPoints, center } = this.curGesture;
        // 绘制原来线条
        this.drawPoly(inputPoints);
        // 绘制采样点
        points.forEach((point) => {
            this.drawCircle(point[0], point[1], 6, '#000');
        });
        // 绘制中心点与起始点连线
        if (center) this.drawCenter(center, points[0]);
    }
    /**
     * 重新绘制形状
     * @param points 坐标点集
     */
    drawPoly(points: Point[]) {
        const { ctx2d } = this;
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
    drawCenter(centerPoint: Point, startPoint: Point) {
        this.drawCircle(centerPoint[0], centerPoint[1], 10, 'green');
        this.drawLine(centerPoint[0], centerPoint[1], startPoint[0], startPoint[1], 'green', 3);
    }
    // addGesture() {
    //     this.cache[this.id] = Utils.vectorize(this.points);

    //     localStorage.setItem('xx', JSON.stringify(this.cache));
    //     this.clearRect();
    //     const canvas = this.createGestureImg(this.points);
    //     this.gestureLib[this.id] = canvas;
    //     this.drawImg(canvas, (this.id - 1) * canvas.width + 10, 10);

    //     this.id++;
    // }
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
    // compareGesture() {
    //     // const newPoints = this.transform(this.points);
    //     const vectors = Utils.vectorize(this.points);
    //     const cache: cache = JSON.parse(localStorage.getItem('xx'));
    //     const error = 0.4;
    //     Object.entries(cache).forEach(([id, v]) => {
    //         const rs = Utils.cosDistance(v, vectors);
    //         console.log(id, rs);
    //         if (rs <= error) console.log('匹配成功', id);
    //     });
    // }
    /**
     * 监听画布事件
     */
    addEvent() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMousedown(e));
        document.addEventListener('mousemove', (e) => this.handleMousemove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseup(e));
    }
    handleMousedown(e: MouseEvent) {
        this.clearRect();
        this.isMove = true;
        this.metaPoints = [];
        const startPoint = this.getCanvasPos(e);
        this.metaPoints.push(startPoint);
    }
    handleMousemove(e: MouseEvent) {
        if (!this.isMove) return;
        const curPoint = this.getCanvasPos(e);
        // 超出边界
        if (curPoint[0] < 0 || curPoint[0] > this.canvas.width || curPoint[1] < 0 || curPoint[1] > this.canvas.height) {
            this.isMove = false;
            return;
        }
        const lastPoint = this.metaPoints[this.metaPoints.length - 1];
        this.drawLine(lastPoint[0], lastPoint[1], curPoint[0], curPoint[1], 'blue', 2);
        this.drawCircle(curPoint[0], curPoint[1], 5);
        this.metaPoints.push(curPoint);
    }
    handleMouseup(e: MouseEvent) {
        if (this.isMove) this.curGesture = new Gesture(this.metaPoints);
        this.isMove = false;
    }
    getCanvasPos(e: MouseEvent): Point {
        return [e.clientX - this.bounds.left, e.clientY - this.bounds.top];
    }
    /**
     * 绘制辅助线
     */
    drawBg() {
        const { width, height } = this.canvas;
        const { ctx2d, config } = this;

        this.drawLine(0, height / 2, width, height / 2);
        this.drawLine(width / 2, 0, width / 2, height);

        if (width > height) {
            this.drawLine(width / 2 + height / 2, 0, width / 2 - height / 2, height);
            this.drawLine(width / 2 - height / 2, 0, width / 2 + height / 2, height);
        } else {
            this.drawLine(0, height / 2 - width / 2, width, height / 2 + width / 2);
            this.drawLine(0, height / 2 + width / 2, width, height / 2 - width / 2);
        }

        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.setLineDash([8, 8]);
        ctx2d.rect(width / 2 - config.unitSize / 2, height / 2 - config.unitSize / 2, config.unitSize, config.unitSize);
        ctx2d.stroke();
        ctx2d.restore();
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
        this.drawBg();
        // Object.values(this.gestureLib).forEach((canvas, i) => {
        //     this.drawImg(canvas, i * canvas.width + 10, 10);
        // });
    }
    sleep() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, 500);
        })
    }
}
