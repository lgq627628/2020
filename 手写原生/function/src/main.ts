/**
 * 绘制函数类
 */
export class FnApp {
    public canvas: HTMLCanvasElement;
    public ctx2d: CanvasRenderingContext2D | null;

    public width: number;
    public height: number;
    public halfWidth: number;
    public halfHeight: number;

    /** 最左边表示的 x 值 */
    public leftX: number;
    /** 最右边表示的 x 值 */
    public rightX: number;
    /** x 轴表示的长度，注意不是画布长度 */
    public xLen: number;
    public leftY: number;
    public rightY: number;
    public yLen: number;
    /** 网格数量，注意并不一定是设置了多少就是多少格，而是在这个值的左右波动 */
    public gridCount: number;
    /** 函数采样点间隔（整数），默认值为 1，越大曲线越不平滑，还可能因为曲线值变化太大导致曲线两端是空白 */
    public steps: number;
    /** 每次缩放的量 */
    public scaleSteps: number;
    /** 坐标刻度字体大小 */
    public fontSize: number;
    /** 横纵坐标保留的数值 */
    public fixedCount: number = 0;
    public MAX_DELTA: number = 1e6;
    public MIN_DELTA: number = 1e-6;

    public state: IState = {
        startPos: null,
        endPos: null
    };

    public fnList: Function[] = [];

    /**
     * @param canvas canvas 画布元素
     * @param opts 绘制函数的一些可选参数，leftX 和 rightX 是需要配对传进来的
     */
    constructor(canvas: HTMLCanvasElement, opts: IConfig = {}) {
        this.canvas = canvas;
        this.ctx2d = canvas.getContext('2d');

        this.width = canvas.width;
        this.height = canvas.height;
        this.halfWidth = canvas.width / 2;
        this.halfHeight = canvas.height / 2;

        // 因为一般 canvas 宽高都是几百，所以这里默认值就简单的 / 100，此外还要主要我们的坐标是 1:1 的，如果 x 和 y 表示的值不一样，则下面的 leftY 和 rightY 不能这样简单的赋值
        this.leftX = opts.leftX || -this.halfWidth / 100;
        this.rightX = opts.rightX || this.halfWidth / 100;
        this.xLen = this.rightX - this.leftX;
        // 初始化时，y 的取值默认和 x 值一样，因为他们代表的值一样，不然 leftY，rightY 也要当做参数传进来
        this.leftY = this.leftX;
        this.rightY = this.rightX;
        this.yLen = this.xLen;

        this.gridCount = opts.gridCount || 10;
        this.steps = opts.steps || 1;
        this.scaleSteps = opts.scaleSteps || 0.05;
        this.fontSize = opts.fontSize || 14;

        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this), false);
        document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
        document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
        this.canvas.addEventListener('mousewheel', this.handleMouseWheel.bind(this), false);
    }
    handleMouseDown(e: MouseEvent) {
        const canvasPos: Point = this.viewportToCanvasPosition(e);
        this.state.startPos = canvasPos;
    }
    handleMouseMove(e: MouseEvent) {
        const canvasPos: Point = this.viewportToCanvasPosition(e);
        if (!this.state.startPos) {
            this.drawSubLine(canvasPos);
            return;
        }
        document.body.style.cursor = 'move';
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
        document.body.style.cursor = 'auto';
    }
    handleMouseWheel(e: Event) {
        e.preventDefault();
        const event: WheelEvent = e as WheelEvent;
        const canvasPos: Point = this.viewportToCanvasPosition(event);
        const { deltaY } = event;
        const { leftX, rightX, leftY, rightY, scaleSteps } = this;
        let scale: number;
        if (deltaY > 0) {
            // 缩小
            scale = 1 + scaleSteps;
        } else {
            // 放大
            scale = 1 - scaleSteps;
        }
        if (this.isInvalidVal(scale)) return;
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
    viewportToCanvasPosition(e: MouseEvent): Point {
        const { clientX, clientY } = e;
        const { top, left } = this.canvas.getBoundingClientRect();
        return new Point(clientX - top, clientY - left);
    }
    canvasPosToFnVal(canvasPos: Point): Point {
        const { width, height, leftX, leftY, xLen, yLen } = this;
        const x = leftX + canvasPos.x / width * xLen;
        const y = leftY + canvasPos.y / height * yLen;
        return new Point(x, y);
    }
    fnValToCanvasPos(fnVal: Point): Point {
        const { width, height, leftX, leftY, xLen, yLen } = this;
        const x = (fnVal.x - leftX) / xLen * width;
        const y = (fnVal.y - leftY) / yLen * height;
        return new Point(x, height - y);
    }
    /** 缩放过大过小都没啥意义，所以设置下边界值 */
    isInvalidVal(ratio: number): boolean {
        const { xLen, yLen, MIN_DELTA, MAX_DELTA } = this;
        if (ratio > 1 && (xLen > MAX_DELTA || yLen > MAX_DELTA)) return true;
        if (ratio < 1 && (xLen < MIN_DELTA || yLen < MIN_DELTA)) return true;
        // 上面的判断为什么不直接 （xLen > MAX_DELTA || yLen > MAX_DELTA || xLen < MIN_DELTA || yLen < MIN_DELTA）这样判断呢？
        // 因为如果这样判断你会发现缩放到最大和最小的时候，再继续操作都是无效的。
        return false;
    }
    /** 重新绘制 */
    draw() {
        this.ctx2d?.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        this.drawFn();
    }
    drawGrid() {
        const { width, height, leftX, rightX, leftY, rightY, xLen, yLen, gridCount, ctx2d } = this;
        ctx2d?.save();

        // 注意这里我们并没有将背景网格的宽高大小做成配置项，而是将网格数作为配置项，不然会和 leftX、rightX 冲突，
        // 比如 x 的值从 [-1, 1]，但是网格大小设置成 [50, 50]，那么页面就是近乎空白，所以我们这里设置大概网格数即可
        const [gridWidth, gridHeight] = this.calcGridSize(xLen, gridCount);
        // 由于计算会产生浮点数偏差，所以要控制下小数点后面的数字个数
        if (gridWidth < 1) this.fixedCount = gridWidth.toString().split('.')[1].length;
        
        // 最左边的竖线下标
        let i = Math.floor(leftX / gridWidth);
        // 从左到右绘制竖线
        for (; i * gridWidth < rightX; i++) {
            // 绘制像素点 / 整个画布宽度 = 实际 x 值 / 实际表示的 x 轴长度
            const x = (i * gridWidth - leftX) / xLen * width;
            const color = i ? '#ddd' : '#000';
            this.drawLine(x, 0, x, height, color)
            this.fillText(String(this.formatNum(i * gridWidth, this.fixedCount)), x, height, this.fontSize, 'center');
        }
        // 绘制横线也是和上面一样的方法，就是要注意画布的 y 轴向下，需要用 height 剪一下，或者用 scale(1, -1);
        let j = Math.floor(leftY / gridHeight);
        for (; j * gridHeight < rightY; j++) {
            let y = (j * gridWidth - leftY) / yLen * height;
            y = height - y;
            const color = j ? '#ddd' : '#000';
            this.drawLine(0, y, width, y, color);
            this.fillText(String(this.formatNum(j * gridHeight, this.fixedCount)), 0, y + this.fontSize / 2, this.fontSize);
        }
        ctx2d?.restore();
    }
    /**
     * 计算每一个网格的宽高大小，注意并不是 gridCount 是多少就会有多少网格
     * 因为我们的坐标刻度通常都是 10、5、1、0.5、0.1 这个样子，大部分都是以 2、5、10 的倍数
     * @param len x 轴或 y 轴代表的长度
     * @param gridCount 网格个数
     */
    calcGridSize(len: number, gridCount: number): number[] {
        let gridWidth = 1;
        // 事实上，要是图方便的话，你也可以直接用 unitX 来当做网格大小，不过记得要取整
        // 而这里呢，我们需要找到离 unitX 最近的（稍微偏整数的）值
        let unitX = len / gridCount;
        while (gridWidth < unitX) {
            gridWidth *= 10
        }
        while (gridWidth / 10 > unitX) {
            gridWidth /= 10
        }
        if (gridWidth / 5 > unitX) {
            gridWidth /= 5;
        } else if (gridWidth / 2 > unitX) {
            gridWidth /= 2;
        }
        // 因为 x 轴长度和 y 轴的长度是一样的，所以可以这样赋值
        return [gridWidth, gridWidth];
    }
    /** 绘制函数曲线，就是用一段段直线连起来 */
    drawFn() {
        const { width, height, leftX, leftY, xLen, yLen, steps, ctx2d } = this;
        if (!ctx2d) return;
        ctx2d.save();
        this.fnList.forEach(fn => {
            ctx2d.strokeStyle = (fn as any).color;
            ctx2d.beginPath();
            for (let i = 0; i < width; i += steps) {
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
    /** 绘制辅助线 */
    drawSubLine(canvasPos: Point) {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        const { width, height } = this;
        const { x, y } = canvasPos;
        let subLineVisible = true;
        if (x <= 0 || x >= width || y <= 0 || y >= height) subLineVisible = false;
        this.draw();
        if (!subLineVisible) return;
        ctx2d.save();
        this.drawLine(x, 0, x, height, '#999',true);
        this.drawLine(0, y, width, y, '#999', true);
        ctx2d.restore();
        const centerRectLen: number = 8;
        ctx2d.strokeRect(x - centerRectLen / 2, y - centerRectLen / 2, centerRectLen, centerRectLen);
        const actualPos = this.canvasPosToFnVal(canvasPos);
        // 绘制鼠标坐标点
        // this.fillText(`[${actualPos.x}, ${-actualPos.y}]`, x, y);
        this.handleCrosspoint(actualPos.x);
    }
    handleCrosspoint(x: number) {
        const pointList: Point[] = this.checkCrosspoint(x);
        pointList.forEach(point => {
            const { x, y } = this.fnValToCanvasPos(point);
            this.fillCircle(x, y, 5, 'red');
            
            this.fillText(`[${this.formatNum(point.x, this.fixedCount + 1)}, ${this.formatNum(point.y, this.fixedCount + 1)}]`, x, y);
        });
    }
    drawLine(x1: number, y1: number, x2: number, y2: number, strokeStyle: string | CanvasGradient | CanvasPattern = '#000', isDashLine: boolean = false) {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.strokeStyle = strokeStyle;
        if (isDashLine) ctx2d.setLineDash([6, 6]);
        ctx2d.beginPath();
        ctx2d.moveTo(x1, y1);
        ctx2d.lineTo(x2, y2);
        ctx2d.stroke();
    }
    fillText(text: string, x: number, y: number, fontSize: number = 16, textAlign: TextAlign = 'left') {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.save();
        ctx2d.font = `${fontSize}px sans-serif`;
        if (textAlign === 'center') {
            const w = ctx2d.measureText(text).width;
            x = x - w / 2;
        }
        ctx2d.fillText(text, x, y);
        ctx2d.restore();
    }
    fillCircle(x: number, y: number, radius: number, fillStyle: string | CanvasGradient | CanvasPattern = '#000') {
        const ctx2d: CanvasRenderingContext2D | null = this.ctx2d;
        if (!ctx2d) return;
        ctx2d.save();
        ctx2d.fillStyle = fillStyle;
        ctx2d.beginPath();
        ctx2d.arc(x, y, radius, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
    }
    addFn(fn: Function) {
        (fn as any).color = '#' + Math.random().toString(16).slice(2, 8);
        this.fnList.push(fn);
    }
    checkCrosspoint(x: number) {
        const { leftX, rightX, leftY, rightY } = this;
        const rs: Point[] = [];
        this.fnList.forEach(fn => {
            const y = fn(x);
            if (leftX <= x && x <= rightX && y >= leftY && y <= rightY) {
                rs.push(new Point(x, y));
            }
        });
        return rs;
    }
    /**
     * 保留 fixedCount 位小数，整数不补零
     * @param num 
     * @param fixedCount 
     * @returns
     */
    formatNum(num: number, fixedCount: number): number {
        return parseFloat(num.toFixed(fixedCount));
    }
}

type TextAlign = 'left' | 'center';

interface IState {
    startPos: Point | null,
    endPos: Point | null
}

/** 绘制函数的一些配置项 */
interface IConfig {
    leftX?: number,
    rightX?: number,
    leftY?: number,
    rightY?: number,
    gridCount?: number,
    steps?: number,
    scaleSteps?: number,
    fontSize?: number
}

export class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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
