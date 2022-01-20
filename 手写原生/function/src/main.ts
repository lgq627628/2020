
export class FnApp {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D | null;

    public width: number;
    public height: number;
    public halfWidth: number;
    public halfHeight: number;

    /** 最左边的 x 值 */
    public leftX: number;
    /** 最右边的 x 值 */
    public rightX: number;
    public xLen: number;
    public leftY: number;
    public rightY: number;
    public yLen: number;
    /** 背景网格的宽高大小 */
    public gridSize: Size;
    public steps: number;
    public scaleSteps: number;

    public state: IState = {
        startPos: null,
        endPos: null
    };

    public fnList: Function[] = [];

    constructor(canvas: HTMLCanvasElement, opts: IConfig = {}) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');

        this.width = canvas.width;
        this.height = canvas.height;
        this.halfWidth = canvas.width / 2;
        this.halfHeight = canvas.height / 2;

        this.leftX = opts.leftX || -this.halfWidth;
        this.rightX = opts.rightX || this.halfWidth;
        this.leftY = opts.leftY || -this.halfHeight;
        this.rightY = opts.rightY || this.halfHeight;
        this.xLen = this.rightX - this.leftX;
        this.yLen = this.rightY - this.leftY;

        this.gridSize = opts.gridSize || new Size(~~(this.halfWidth / 10), ~~(this.halfHeight / 10));
        this.steps = opts.steps || 1;
        this.scaleSteps = opts.scaleSteps || 0.05;

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        this.canvas.addEventListener('mousewheel', this.handleMouseWheel.bind(this), false);
    }
    handleMouseDown(e: MouseEvent) {
        const canvasPos: vec2 = this.viewportToCanvasPosition(e);
        this.state.startPos = canvasPos;
    }
    handleMouseMove(e: MouseEvent) {
        if (!this.state.startPos) return;
        const canvasPos: vec2 = this.viewportToCanvasPosition(e);
        this.state.endPos = canvasPos;
        const { width, height, xLen, yLen, state: { startPos, endPos } } = this;
        const dx = -(endPos.x - startPos.x) / width * xLen;
        const dy = -(endPos.y - startPos.y) / height * yLen;
        this.leftX += dx;
        this.rightX += dx;
        this.leftY -= dy;
        this.rightY -= dy;
        this.xLen = this.rightX - this.leftX;
        this.yLen = this.rightY - this.leftY;
        this.draw();
        this.state.startPos = canvasPos;
    }
    handleMouseUp(e: MouseEvent) {
        this.state.startPos = null;
        this.state.endPos = null;
    }
    handleMouseWheel(e: Event) {
        e.preventDefault();
        const event: WheelEvent = e as WheelEvent;
        const canvasPos: vec2 = this.viewportToCanvasPosition(event);
        const { deltaY } = event;
        const { leftX, rightX, leftY, rightY, scaleSteps } = this;
        let scale: number;
        if (deltaY > 0) {
            // 放大
            scale = 1 + scaleSteps;
        } else {
            // 缩小
            scale = 1 - scaleSteps;
        }
        const { x, y } = this.canvasPosToFnVal(canvasPos);
        // 注意缩放和拖拽不一样，left 的左右两边一边是加一边是减
        this.leftX = x - (x - leftX) * scale;
        this.rightX = x + (rightX - x) * scale;
        this.leftY = y - (y - leftY) * scale;
        this.rightY = y + (rightY - y) * scale;
        this.xLen = this.rightX - this.leftX;
        this.yLen = this.rightY - this.leftY;
        this.draw();
    }
    viewportToCanvasPosition(e: MouseEvent): vec2 {
        const { clientX, clientY } = e;
        const { top, left } = this.canvas.getBoundingClientRect();
        return new vec2(clientX - top, clientY - left);
    }
    canvasPosToFnVal(canvasPos: vec2): vec2 {
        const { width, height, leftX, leftY, xLen, yLen } = this;
        const x = leftX + canvasPos.x / width * xLen;
        const y = leftY + canvasPos.y / height * yLen;
        return new vec2(x, y);
    }
    /** 重新绘制 */
    draw() {
        this.ctx2d?.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawFn();
    }
    drawGrid() {
        const { width, height, leftX, rightX, leftY, rightY, xLen, yLen, gridSize, ctx2d } = this;
        ctx2d?.save();
        // 最左边的竖线下标
        let i = Math.floor(leftX / gridSize.w);
        //从左到右绘制竖线
        for (++i; i * gridSize.w < rightX; i++) {
            // 绘制像素点 / 整个画布宽度 = 实际 x 值 / 实际表示的 x 轴长度
            const x = (i * gridSize.w - leftX) / xLen * width;
            const color = i ? '#ddd' : '#000';
            this.drawLine(x, 0, x, height, color);
            this.fillText(String(i * gridSize.w), x, height, 'center');
        }
        // 绘制横线也是和上面一样的方法，就是要注意画布的 y 轴向下，需要用 height 剪一下，或者用 scale(1, -1);
        let j = Math.floor(leftY / gridSize.h);
        for (++j; j * gridSize.h < rightY; j++) {
            let y = (j * gridSize.w - leftY) / yLen * height;
            y = height - y;
            const color = j ? '#ddd' : '#000';
            this.drawLine(0, y, width, y, color);
            this.fillText(String(j * gridSize.h), 0, y);
        }
        ctx2d?.restore();
    }
    /** 绘制函数曲线，就是用一段段直线连起来 */
    drawFn() {
        const { width, height, leftX, leftY, xLen, yLen, ctx2d } = this;
        if (!ctx2d) return;
        ctx2d?.save();
        ctx2d.strokeStyle = 'red';
        ctx2d.beginPath();
        this.fnList.forEach(fn => {
            for (let i = 0; i < width; i++) {
                // 像素点 / 画布宽 = x / 实际表示的 x 轴长度
                const x = i / width * xLen + leftX;
                let y = fn(x);
                // 换算到具体绘制点
                y = height - (y - leftY) / yLen * height;
                if (i === 0) {
                    ctx2d.moveTo(i, y);
                } else {
                    ctx2d.lineTo(i, y);
                }
            }
            ctx2d.stroke();
        });
        ctx2d?.restore();
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, strokeStyle: string | CanvasGradient | CanvasPattern = '#000') {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.strokeStyle = strokeStyle;
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
    }
    fillText(text: string, x: number, y: number, textAlign: TextAlign = 'left') {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.save();
        if (textAlign === 'center') {
            const w = ctx2d.measureText(text).width;
            x = x - w / 2;
        }
        ctx2d.fillText(text, x, y);
        ctx2d.restore();
    }
    addFn(fn: Function) {
        this.fnList.push(fn);
    }
}

type TextAlign = 'left' | 'center';

interface IState {
    startPos: vec2 | null,
    endPos: vec2 | null
}

interface IConfig {
    leftX?: number,
    rightX?: number,
    leftY?: number,
    rightY?: number,
    gridSize?: Size,
    steps?: number,
    scaleSteps?: number
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
        return this;
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