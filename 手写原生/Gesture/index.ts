import { CanvasUtils, GeoUtils } from './Util';
import { Pool } from './Pool';
import { Point, Gesture } from './Gesture';
export class App {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D;
    public bounds: DOMRect;
    public isMove: boolean = false;

    /** 原始数据点 */
    public metaPoints: Point[] = [];
    /** 当前手势 */
    public curGesture: Gesture;
    /** 手势库 */
    public pool: Pool;
    /** 手势唯一标识 */
    public id: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        this.bounds = canvas.getBoundingClientRect();
        this.pool = Pool.getInstance();
        this.id = this.pool.getGestureCount() + 1;
        this.clear();
        this.addEvent();
        this.drawGestureLib();
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
    }
    resample() {
        if (!this.metaPoints.length) return;
        this.curGesture.resample();
        this.redraw();
    }
    translateGesture() {
        if (!this.metaPoints.length) return;
        const { width, height } = this.canvas;
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
        this.curGesture.vectorize();
        this.redraw();
    }
    addGesture() {
        this.clear();
        this.pool.addGesture(String(this.id), this.curGesture);
        this.pool.saveGesture();
        this.drawGestureLib();
        this.id++;
    }
    deleteGesture() {
        this.pool.removeAllGesture();
        this.clear();
    }
    compareGesture() {
        const rs = this.pool.compare(this.curGesture);
        console.log(rs ? `命中第${rs}个` : '暂无匹配');
        this.clear();
        this.drawGestureLib();
    }
    clear() {
        this.clearRect();
    }
    redraw() {
        this.clear();
        this.drawGestureLib();
        const { points, inputPoints, center } = this.curGesture;
        // 绘制原来线条
        CanvasUtils.drawPoly(this.ctx2d, inputPoints);
        // 绘制采样点
        points.forEach((point) => {
            CanvasUtils.drawCircle(this.ctx2d, point[0], point[1], 6, '#000');
        });
        // 绘制中心点与起始点连线
        if (center) this.drawCenter(center, points[0]);
    }
    /** 绘制手势库，也就是手势缩略图 */
    drawGestureLib() {
        Object.entries(this.pool.cache).forEach(([name, gesture]) => {
            const canvas = CanvasUtils.createGestureImg(gesture.inputPoints, gesture.center, Gesture.demoSize, gesture.isMatch);
            CanvasUtils.drawCanvasImg(this.ctx2d, canvas, (Number(name) - 1) * canvas.width + 10, 10);
        });
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
        this.clear();
        this.pool.cancelMatch();
        this.drawGestureLib();
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
            this.afterMouseEvent();
            return;
        }
        const lastPoint = this.metaPoints[this.metaPoints.length - 1];
        CanvasUtils.drawLine(this.ctx2d, lastPoint[0], lastPoint[1], curPoint[0], curPoint[1], 'blue', 2);
        CanvasUtils.drawCircle(this.ctx2d, curPoint[0], curPoint[1], 5);
        this.metaPoints.push(curPoint);
    }
    handleMouseup(e: MouseEvent) {
        this.afterMouseEvent()
    }
    afterMouseEvent() {
        if (this.isMove) this.curGesture = new Gesture(this.metaPoints);
        this.isMove = false;
    }
    getCanvasPos(e: MouseEvent): Point {
        return [e.clientX - this.bounds.left, e.clientY - this.bounds.top];
    }
    /** 绘制手势中心点与起始点的连线 */
    drawCenter(centerPoint: Point, startPoint: Point) {
        CanvasUtils.drawCircle(this.ctx2d, centerPoint[0], centerPoint[1], 10, 'green');
        CanvasUtils.drawLine(this.ctx2d, centerPoint[0], centerPoint[1], startPoint[0], startPoint[1], 'green', 3);
    }
    /**
     * 绘制辅助线
     */
    drawBg() {
        const { width, height } = this.canvas;
        const { ctx2d } = this;
        const unitSize = Gesture.unitSize

        CanvasUtils.drawLine(this.ctx2d, 0, height / 2, width, height / 2);
        CanvasUtils.drawLine(this.ctx2d, width / 2, 0, width / 2, height);

        if (width > height) {
            CanvasUtils.drawLine(this.ctx2d, width / 2 + height / 2, 0, width / 2 - height / 2, height);
            CanvasUtils.drawLine(this.ctx2d, width / 2 - height / 2, 0, width / 2 + height / 2, height);
        } else {
            CanvasUtils.drawLine(this.ctx2d, 0, height / 2 - width / 2, width, height / 2 + width / 2);
            CanvasUtils.drawLine(this.ctx2d, 0, height / 2 + width / 2, width, height / 2 - width / 2);
        }

        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.setLineDash([8, 8]);
        ctx2d.rect(width / 2 - unitSize / 2, height / 2 - unitSize / 2, unitSize, unitSize);
        ctx2d.stroke();
        ctx2d.restore();
    }
    clearRect() {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBg();
    }
    sleep() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('');
            }, 500);
        });
    }
}
