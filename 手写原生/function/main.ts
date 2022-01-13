export class FnApp {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D | null;
    public width: number;
    public height: number;
    public halfWidth: number;
    public halfHeight: number;
    public gridLen: number = 50;
    public arrowLen: number = 10;
    public steps: number;
    public isMouseDown: boolean = false;
    public isSupportMouseMove: boolean = false;

    public startPos!: vec2;
    public endPos!: vec2;

    public fnList: Function[] = [];
    public pointList: vec2[][] = [];
    
    constructor(canvas: HTMLCanvasElement, opts: any) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.halfWidth = canvas.width / 2;
        this.halfHeight = canvas.height / 2;
        this.steps = 1;

        this.canvas.addEventListener('mousedown', this, false);
        document.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);
        this.canvas.addEventListener('mousewheel', this, false);

        this.drawGrid();
        this.drawAxis();
        this.drawUnitXY();
    }
    addFn(fn: Function) {
        this.fnList.push(fn);
        // this.ctx2d?.translate(this.halfHeight, this.halfHeight);
        const points = this._calcPoints(fn);
        points && this.pointList.push(points);
    }
    drawAxis() {
        const { width, height, halfWidth, halfHeight, arrowLen } = this;
        // 绘制 x 轴
        this.drawLine(0, halfHeight, width, halfHeight);
        // 绘制 x 轴箭头
        this.drawLine(width, halfHeight, width - arrowLen, halfHeight - arrowLen);
        this.drawLine(width, halfHeight, width - arrowLen, halfHeight + arrowLen);
        // 绘制 y 轴
        this.drawLine(halfWidth, 0, halfWidth, height);
        // 绘制 y 轴箭头
        this.drawLine(halfWidth, 0, halfWidth - arrowLen, arrowLen);
        this.drawLine(halfWidth, 0, halfWidth + arrowLen, arrowLen);
    }
    drawGrid() {
        this.ctx2d?.save();
        this.ctx2d?.setTransform(1, 0, 0, 1, 0, 0);
        const { width, height, gridLen } = this;
        // 绘制横线
        for(let i = 0; i <= height; i += gridLen) {
            this.drawLine(0, i, width, i, '#eee');
        }
        // 绘制竖线
        for(let i = 0; i < width; i += gridLen) {
            this.drawLine(i, 0, i, height, '#eee');
        }
        this.ctx2d?.restore();
    }
    drawUnitXY() {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        const fontSize: number = 14;
        const xCount = this.width / this.gridLen;
        const yCount = this.height / this.gridLen;
        ctx2d.font = `${fontSize}px sans-serif`;
        for (let i = 1; i < xCount; i++) {
            const label: string = String(i * this.gridLen - this.halfWidth);
            ctx2d.fillText(label, i * this.gridLen - ctx2d.measureText(label).width / 2, this.halfHeight + fontSize);
        }
        for (let i = 1; i < yCount; i++) {
            const label: string = String(i * this.gridLen - this.halfHeight);
            ctx2d.fillText(label, this.halfWidth - ctx2d.measureText(label).width, i * this.gridLen + fontSize / 2);
        }
    }
    draw() {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.save();
        ctx2d.translate(this.width / 2, this.height / 2);
        ctx2d.scale(1, -1);
        this.fnList.forEach((_, i) => {
            this.drawFn(this.pointList[i]);
        });
        ctx2d.restore();
    }
    drawFn(points: vec2[]) {
        const color = '#' + Math.random().toString(16).slice(2, 8);
        for (let i = 1; i < points.length; i++) {
            const prevePoint = points[i - 1];
            const curPoint = points[i];
            this.drawLine(prevePoint.x, prevePoint.y, curPoint.x, curPoint.y, color);
        }
    }
    _calcPoints(fn: Function) {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        const matrix: DOMMatrix = ctx2d.getTransform();
        // const x: number = matrix.e;
        // const y: number = matrix.f;
        // const scaleX: number = 1 || matrix.a;
        // const scaleY: number = 1000 || matrix.d;
        // console.log(matrix, x, y);
        const scaleX: number = 1;
        const scaleY: number = 1;
        const { halfWidth, steps } = this;
        const points: vec2[] = [];
        for(let x = -halfWidth; x <= halfWidth; x += steps) {
            const y = fn(x) * scaleY;
            points.push(new vec2(x, y));
        }
        console.log(points);
        return points;
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, color: string = '#000') {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.strokeStyle = color;
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
    }
    drawFnAnimation() {
    }
    redraw() {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawAxis();
        this.drawUnitXY();
        this.draw();
    }
    dispatchMouseDown(e: MouseEvent, mousePos: vec2) {
        this.startPos = mousePos;
        console.log('鼠标按下');
    }
    // dispatchMouseMove(e: Event, mousePos: vec2) {
    //     console.log('鼠标移动');
    // }
    dispatchMouseDrag(e: MouseEvent, mousePos: vec2) {
        this.endPos = mousePos;
        const diff = vec2.diff(this.startPos, this.endPos);
        console.log('鼠标拖拽', diff);
        this.ctx2d?.translate(diff.x, diff.y);
        // this.ctx2d?.setTransform(1, 0, 0, 1, diff.x, diff.y);
        this.redraw();
        this.startPos = this.endPos;
    }
    dispatchMouseUp(e: MouseEvent, mousePos: vec2) {
        console.log('鼠标抬起');
    }
    dispatchMouseWheel(e: WheelEvent, mousePos: vec2) {
        console.log('鼠标滑动', e.deltaY);
        const { deltaY } = e;
        let ratio: number = 1;
        if (deltaY > 0) {
            ratio = -1 / 1.1;
        } else if (deltaY < 0) {
            ratio = 1.1;
        }
        this.ctx2d?.scale(ratio, ratio);
        this.redraw();
    }
    public handleEvent(e: Event): void {
        switch (e.type) {
            case 'mousedown':
                this.isMouseDown = true;
                this.dispatchMouseDown(e as MouseEvent, this.getMousePos(e));
                break;
            case 'mouseup':
                this.isMouseDown = false;
                this.dispatchMouseUp(e as MouseEvent, this.getMousePos(e));
                break;
            case 'mousemove':
                // if (this.isSupportMouseMove) this.dispatchMouseMove(e, this.getMousePos(e));
                if (this.isMouseDown) this.dispatchMouseDrag(e as MouseEvent, this.getMousePos(e));
                break;
            case 'mousewheel':
                this.dispatchMouseWheel(e as WheelEvent, this.getMousePos(e));
        }
    }
    getMousePos(e: Event) {
        return this.viewportToCanvasCoords(e as MouseEvent);
    }
    private viewportToCanvasCoords(e: MouseEvent): vec2 {
        if (!this.canvas) throw new Error('canvas 不能为空');
        const { clientX, clientY, target } = e;
        if (!target) throw new Error('点击事件的 target 为空');

        const rect: DOMRect = this.canvas.getBoundingClientRect();
        const x: number = clientX - rect.left;
        const y: number = clientY - rect.top;
        return new vec2(x, y);
    }
}

class vec2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    static diff(v1: vec2, v2: vec2) {
        return new vec2(v2.x - v1.x, v2.y - v1.y);
    }
}