
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
    public leftY: number;
    public rightY: number;
    /** 背景网格的宽高大小 */
    public gridSize: Size;

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

        this.gridSize = opts.gridSize || new Size(~~(this.halfWidth / 10), ~~(this.halfHeight / 10));

    }
    /** 更新数据 */
    update() {
    }
    /** 重新绘制 */
    draw() {
        this.drawGrid();
        this.drawFn();
    }
    drawGrid() {
        const { width, height, leftX, rightX, leftY, rightY, gridSize, ctx2d } = this;
        ctx2d?.save();
        // 实际表示的 x 轴长度
        const xLen = rightX - leftX;
        const yLen = rightY - leftY;
        // 最左边的竖线下标
        let i = Math.floor(leftX / gridSize.w);
        //从左到右绘制竖线
        for(++i; i * gridSize.w < rightX; i++) {
            // 绘制像素点 / 整个画布宽度 = 实际 x 值 / 实际表示的 x 轴长度
            const x = (i * gridSize.w - leftX) / xLen * width;
            const color = i ? '#ddd' : '#000';
            this.drawLine(x, 0, x, height, color);
            this.fillText(String(i * gridSize.w), x, height, 'center');
        }
        // 绘制横线也是和上面一样的方法，就是要注意画布的 y 轴向下，需要用 height 剪一下，或者用 scale(1, -1);
        let j = Math.floor(leftY / gridSize.h);
        for(++j; j * gridSize.h < rightY; j++) {
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
        const { width, height, leftX, rightX, leftY, rightY, ctx2d } = this;
        if (!ctx2d) return;
        ctx2d?.save();
        ctx2d.strokeStyle = 'red';
        ctx2d.beginPath();
        // 实际表示的 x 轴长度
        const xLen = rightX - leftX;
        const yLen = rightY - leftY;
        this.fnList.forEach(fn => {
            for(let i = 0; i < width; i++) {
                // 像素点 / 画布宽 = x / 实际表示的 x 轴长度
                const x = i * xLen / width;
                let y = fn(x);
                // 换算到具体绘制点
                y = height - y / height * yLen;
                if (i === 0) {
                    ctx2d.moveTo(x, y);
                } else {
                    ctx2d.lineTo(x, y);
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
    startPos: vec2,
    endPos: vec2,
    startX: number,
    endX: number
}

interface IConfig {
    leftX?: number,
    rightX?: number,
    leftY?: number,
    rightY?: number,
    gridSize?: Size,
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