export class FnApp {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D | null;
    public width: number;
    public height: number;
    public halfWidth: number;
    public halfHeight: number;
    /** 每个网格的大小 */
    public gridSize: Size = new Size(20, 20);
    public arrowLen: number = 10;
    public steps: number = 1;
    public isMouseDown: boolean = false;
    public isSupportMouseMove: boolean = false;

    public startPos!: vec2;
    public endPos!: vec2;

    public fnList: Function[] = [];
    public pointList: vec2[][] = [];

    
    public sampleCount: number = 300;
   
   
    public ratio: number = 2;
    public gridCount: number = 10;

    public config: IConfig = {
        startX: -200,
        endX: 200,
        xLength: 0,
        yLength: 0,
        startY: 0,
        endY: 0,
        steps: 1,
        scaleSteps: 0.1,
        fontSize: 8,
    };
    public state: IState = {
        startPos: null,
        endPos: null,
        translateX: 0,
        translateY: 0,
        scale: 1,
    };

    constructor(canvas: HTMLCanvasElement, opts: any) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.halfWidth = canvas.width / 2;
        this.halfHeight = canvas.height / 2;
        this.config.xLength = this.config.endX - this.config.startX;
        this.config.startY = -(this.config.xLength) * this.height / this.width / 2;
        this.config.endY = -this.config.startY;
        this.config.yLength = this.config.endY - this.config.startY;


        this.state.translateX = this.halfWidth;
        this.state.translateY = this.halfHeight;
        this.state.scale = this.width / this.config.xLength;
    
        this.canvas.addEventListener('mousedown', this, false);
        document.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);
        this.canvas.addEventListener('mousewheel', this, false);

        this.redraw();
    }
    addFn(fn: Function) {
        this.fnList.push(fn);
    }
    drawAxis() {
        this.ctx2d?.save();
        const { config: { startX, endX, startY, endY }, arrowLen } = this;
        // 绘制 x 轴
        this.drawLine(startX, 0, endX, 0);
        this.drawLine(20, 20, 100, 0);
        // 绘制 x 轴箭头
        // this.drawLine(endX, 0, endX - arrowLen, -arrowLen);
        // this.drawLine(endX, 0, endX - arrowLen, arrowLen);
        // 绘制 y 轴
        this.drawLine(0, startY, 0, endY);
        // 绘制 y 轴箭头
        // this.drawLine(0, startY, -arrowLen, -endY + arrowLen);
        // this.drawLine(0, startY, arrowLen, -endY + arrowLen);
        this.ctx2d?.restore();
    }
    drawAxisLabel() {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        const { gridSize, config: { fontSize, startX, endX, startY, endY } } = this;

        ctx2d.save();
        ctx2d.font = `${fontSize}px sans-serif`;

        const unitX = gridSize.w;
        const unitY = gridSize.h;
        // 绘制 x 正半轴刻度
        for(let i = 0; i * unitX < endX; i++) {
            const label: string = String(i * unitX);
            ctx2d.fillText(label, i * gridSize.w - ctx2d.measureText(label).width / 2, fontSize);
        }
        // 绘制 x 负半轴刻度
        for(let i = 0; i * unitX > startX; i--) {
            const label: string = String(i * unitX);
            ctx2d.fillText(label, i * gridSize.w - ctx2d.measureText(label).width / 2, fontSize);
        }
        // 绘制 y 正半轴刻度
        for(let i = 0; i * unitY < endY; i++) {
            const label: string = String(-i * unitY);
            ctx2d.fillText(label, -ctx2d.measureText(label).width, i * gridSize.h + fontSize / 2);
        }
        // 绘制 y 负半轴刻度
        for(let i = 0; i * unitY > startY; i--) {
            const label: string = String(-i * unitY);
            ctx2d.fillText(label, -ctx2d.measureText(label).width, i * gridSize.h + fontSize / 2);
        }
        ctx2d.restore();
    }
    drawGrid() {
        this.ctx2d?.save();
        const { halfWidth, halfHeight, gridSize, config: { startX, startY, endX, endY } } = this;
        // 绘制横线，从中心点开始向上向下画
        for(let i = 0; i < endY; i += gridSize.h) {
            this.drawLine(startX, i, endX, i, '#eee');
        }
        for(let i = 0; i > startY; i -= gridSize.h) {
            this.drawLine(startX, i, endX, i, '#eee');
        }
        // 绘制竖线，从中心点开始向左向右画
        for(let i = 0; i < endX; i += gridSize.w) {
            this.drawLine(i, startY, i, endY, '#eee');
        }
        for(let i = 0; i > startX; i -= gridSize.w) {
            this.drawLine(i, startY, i, endY, '#eee');
        }
        this.ctx2d?.restore();
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
        this.ctx2d?.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx2d?.clearRect(0, 0, this.width, this.height);
        // 变换坐标系
        const { scale, translateX, translateY } = this.state;
        this.ctx2d?.setTransform(scale, 0, 0, scale, translateX, translateY);
        this.drawGrid();
        this.drawAxis();
        this.drawAxisLabel();
        this.draw();
    }
    draw() {
        const { scale, translateX, translateY } = this.state;
        this.ctx2d?.setTransform(scale, 0, 0, -scale, translateX, translateY);
        this.fnList.forEach(fn => {
            this.drawFn(fn);
        });
    }
    drawFn(fn: Function) {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;

        const { width, height, gridSize } = this;
        const { startX, endX, steps } = this.config;

        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.strokeStyle = '#' + Math.random().toString(16).slice(2, 8);
        for(let x = startX; x <= endX; x += steps) {
            const y = fn(x);
            if (x === startX) {
                ctx2d.moveTo(x, y);
            } else {
                ctx2d.lineTo(x, y);
            }
        }
        ctx2d.stroke();
        ctx2d.restore();
    }
    dispatchMouseDown(e: MouseEvent, mousePos: vec2) {
        this.startPos = mousePos;
    }
    // dispatchMouseMove(e: Event, mousePos: vec2) {
    // }
    dispatchMouseDrag(e: MouseEvent, mousePos: vec2) {
        this.endPos = mousePos;
        const diff = vec2.diff(this.endPos, this.startPos);
         // 往右边移动坐标系是往左的
        this.state.translateX -= diff.x;
        this.state.translateY -= diff.y;

        diff.multi(1/this.state.scale);
        this.config.startX += diff.x;
        this.config.endX += diff.x;
        this.config.startY += diff.y;
        this.config.endY += diff.y;

        // 重新渲染
        this.redraw();
        this.startPos = this.endPos;
    }
    dispatchMouseUp(e: MouseEvent, mousePos: vec2) {
        this.state.startPos = null;
        this.state.endPos = null;
    }
    dispatchMouseWheel(e: WheelEvent, mousePos: vec2) {
        e.preventDefault();
        
        let { config: { scaleSteps }, state: { scale } } = this;
        const { deltaY } = e;
        if (deltaY > 0) {
            scale -= scaleSteps;
        } else if (deltaY < 0) {
            scale += scaleSteps;
        }
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

export class vec2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    multi(scale: number) {
        this.x = this.x * scale;
        this.y = this.y * scale;
    }
    static diff(v1: vec2, v2: vec2) {
        return new vec2(v2.x - v1.x, v2.y - v1.y);
    }
}

export class Size {
    public w: number;
    public h: number;
    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
    }
}

export interface IConfig {
    /** x 轴最左边的值 */
    startX: number,
    /** x 轴右左边的值 */
    endX: number,
    xLength: number,
    yLength: number,
    startY: number,
    endY: number,
    steps: number,
    fontSize: number,
    scaleSteps: number
}

export interface IState {
    startPos: vec2 | null,
    endPos: vec2 | null,
    translateX: number,
    translateY: number,
    scale: number
}