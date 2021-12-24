import { Canvas2DApplication } from '../src/Application';
import { Rectangle } from '../src/math2D';

type TextAlign = 'start' | 'left' | 'center' | 'right' | 'end';
type TextBaseline = 'alphabetic' | 'hanging' | 'top' | 'middle' | 'bottom';
type FontType = '10px sans-serif' | '15px sans-serif' | '20px sans-serif' | '25px sans-serif';
type FontStyle = 'normal' | 'italic' | 'oblique';
type FontWeight = 'normal' | 'blod' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type FontVariant = 'normal' | 'small-caps';
type FontSize = '10px' | '12px' | '16px' | '18px' | '24px' | '50%' | '75%'
    | '100%' | '125%' | '150%' | 'xx-small' | 'x-small' | 'small' | 'medium'
    | 'large' | 'x-large' | 'xx-large';
type FontFamily = 'sans-serif' | 'serif' | 'courier' | 'fantasy' | 'monospace';
export enum ETextLayout {
    LEFT_TOP,
    RIGHT_TOP,
    CENTER_TOP,
    LEFT_MIDDLE,
    RIGHT_MIDDLE,
    CENTER_MIDDLE,
    LEFT_BOTTOM,
    RIGHT_BOTTOM,
    CENTER_BOTTOM
}
enum EImageFillType {
    STRETCH,
    REPEAT,
    REPEAT_X,
    REPEAT_Y,
}

class Size {
    public width: number = 0;
    public height: number = 0;
}
class TestApplication extends Canvas2DApplication {
    private _lineDashOffset: number = 0;
    // 由于 Colors 独一无二，没有多个实例，所以可以声明为公开的静态的数组类型
    public static Colors : string[] = [
        'aqua' ,                   //浅绿色
        'black' ,                  //黑色
        'blue' ,                   //蓝色
        'fuchsia' ,                //紫红色
        'gray',                    //灰色
        'green' ,                  //绿色
        'lime' ,                   //绿黄色
        'maroon' ,                 //褐红色
        'navy' ,                   //海军蓝
        'olive' ,                  //橄榄色
        'orange' ,                 //橙色
        'purple' ,                 //紫色
        'red',                     //红色
        'silver' ,                 //银灰色
        'teal' ,                   //蓝绿色
        'white' ,                  //白色
        'yellow'                   //黄色
    ];
    start() {
        // 更新虚线偏移位置，也可以写在 update 里面
        this.addTimer(this.timeCallback.bind(this), 50);
        super.start();
    }
    render() {
        if (!this.ctx2D) return;
        // 清屏
        this.ctx2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 具体绘制
        this.drawRect(0, 0, this.canvas.width / 2, this.canvas.height / 2);
        this.drawGrid();
        this.drawText('尤水就下', 50, 50);
        this.loadAndDrawImage('https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/github.46c47564.png');

        const xx = document.createElement('img');
        xx.onload = () => {
            this.drawImage(xx, Rectangle.create(400, 400, 300, 300), Rectangle.create(0, 0, 100, 100), EImageFillType.REPEAT);
        }
        xx.src = 'https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/github.46c47564.png';
    }
    drawRect(x: number, y: number, w: number, h: number) {
        // save -> paint -> restore 经典的渲染状态机模式
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.fillStyle = 'yellow';
        ctx2D.strokeStyle = 'red';
        ctx2D.lineWidth = 10;
        // 虚线的宽为 30px，间隔为 15px
        ctx2D.setLineDash([30, 15]);
        ctx2D.lineDashOffset = this._lineDashOffset;
        ctx2D.beginPath();
        ctx2D.moveTo(x, y);
        ctx2D.lineTo(x + w, y);
        ctx2D.lineTo(x + w, y + h);
        ctx2D.lineTo(x, y + h);
        ctx2D.closePath();
        // 填充
        ctx2D.fill();
        // 描边
        ctx2D.stroke();
        ctx2D.restore();
    }
    drawCircle(x: number, y: number, radius: number, fillStyle: string | CanvasGradient | CanvasPattern = '#000') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.fillStyle = fillStyle;
        ctx2D.beginPath();
        ctx2D.arc(x, y, radius, 0, Math.PI * 2);
        ctx2D.fill();
        ctx2D.restore();
    }
    // 这里画线并没有使用 save 和 restore，因为这个方法一般会被调用多次，所以由开发者进行状态管理和设置
    drawLine(x1: number, y1: number, x2: number, y2: number) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.beginPath();
        ctx2D.moveTo(x1, y1);
        ctx2D.lineTo(x2, y2);
        ctx2D.stroke();
    }
    drawCoords(originX: number, originY: number, width: number, height: number) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        this.drawLine(originX, originY, originX + width, originY);
        this.drawLine(originX, originY, originX, originY + height);
        ctx2D.restore();
    }
    drawGrid(color: string = '#000', interval: number = 10) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.strokeStyle = color;
        ctx2D.lineWidth = 0.5;
        // 从左到右画垂直线
        for(let i = interval + 0.5; i < this.canvas.width; i += interval) {
            this.drawLine(i, 0, i, this.canvas.height);
        }
        // 从上到下画水平线
        for(let i = interval + 0.5; i < this.canvas.height; i += interval) {
            this.drawLine(0, i, this.canvas.width, i);
        }
        ctx2D.restore();
        // 绘制全局坐标系，左上角为原点，x 轴向右，y 轴向下，特别适合用来观察坐标变换
        this.drawCircle(0, 0, 5, '#000');
        this.drawCoords(0, 0, this.canvas.width, this.canvas.height);
    }
    drawText(text: string, x: number, y: number, color: string = '#000', align: TextAlign = 'left', basline: TextBaseline = 'top', font: FontType = '20px sans-serif') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.textAlign = align;
        ctx2D.textBaseline = basline;
        ctx2D.font = font;
        ctx2D.fillStyle = color;
        ctx2D.fillText(text, x, y);
        ctx2D.restore();
    }
    // font 属性设定后会影响 Canvas2D 中的 measureText 方法计算文本的宽度值，因为 measureText 方法是基于当前的 font 值来计算文本的宽度。
    calcTextSize(text: string, char: string = 'W', scale: number = 0.5): Size {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) throw new Error('canvas 上下文环境不能为空');
        const size: Size = new Size();
        size.width = ctx2D.measureText(text).width;
        const w: number = ctx2D.measureText(char).width;
        // 此高度只是粗略估计，并且针对 sans-serif 字体，你可以理解为经验值
        size.height = w + w * scale;
        return size;
    }
    // 由于设置 font 属性时，font 字符串必须要按照 font-style font-variant font-weightfont-size font-family 的顺序来设置相关的值，如果顺序不正确，会导致 font 属性不起作用。
    // 如果大家在 makeFontString 中用不同的字体（FontFamily）来测试，会发现自己实现的 calcTextSize 方法返回的高度也不是很精确，需要自行测试和调整，以获取最佳的 scale 比例值。
    static makeFontString(size: FontSize = '16px', weight: FontWeight = 'normal', style: FontStyle = 'normal', variant: FontVariant = 'normal', family: FontFamily = 'sans-serif'): string {
        const strs: string[] = [];
        strs.push(style);
        strs.push(variant);
        strs.push(weight);
        strs.push(size);
        strs.push(family);
        return strs.join(' ');
    }
    // 在 Canvas2D 中，repeat、repeat_x 和 repeat_y 这种重复填充模式仅支持使用图案对象（CanvasPattern）来填充路径对象（矢量图形），而 drawImage 使用的是图像对象（HTMLImageElement）来填充目标矩形区域，并且仅支持拉伸缩放（Stretch）的模式，本节目的就是让 drawImage 也能支持 repeat、repeat_x 和 repeat_y 这种图像重复填充模式。
    loadAndDrawImage(url: string) {
        const img: HTMLImageElement = document.createElement('img') as HTMLImageElement;
        img.onload = (e: Event) => {
            if (!this.ctx2D) return;
            console.log('url 的图片尺寸为', `[${img.width}, ${img.height}]`);
            // drawImage 的3个重载方法，可以选择将一幅源图像的全部或部分区域绘制到 Canvas 画布中指定的目标区域内。在绘制过程中，drawImage 会根据目标区域大小的不同，自动应用拉伸缩放（Stretch）效果
            this.ctx2D.drawImage(img, 100, 100);
            this.ctx2D.drawImage(img, 200, 200, 100, 200);
            this.ctx2D.drawImage(img, 50, 50, 100, 100, 300, 300, 350, 350);
        }
        img.src = url;
    }
    drawImage(img: HTMLImageElement, destRect: Rectangle, srcRect: Rectangle = Rectangle.create(0, 0, img.width, img.height), fillType: EImageFillType = EImageFillType.STRETCH): boolean {
        if (!this.ctx2D) return false;
        if (!srcRect) return false;
        if (!destRect) return false;
        if (fillType === EImageFillType.STRETCH) {
            this.ctx2D.drawImage(img, srcRect.origin.x, srcRect.origin.y, srcRect.size.width, srcRect.size.height, destRect.origin.x, destRect.origin.y, destRect.size.width, destRect.size.height)
        } else {
            let rows: number = Math.ceil(destRect.size.width / srcRect.size.width);
            let cols: number = Math.ceil(destRect.size.height / srcRect.size.height);

            let top: number = 0;
            let left: number = 0;
            let right: number = 0;
            let bottom: number = 0;
            let width: number = 0;
            let height: number = 0;

            let destRight: number = destRect.origin.x + destRect.size.width;
            let destBottom: number = destRect.origin.y + destRect.size.height;

            if (fillType === EImageFillType.REPEAT_X) {
                cols = 1;
            } else if (fillType === EImageFillType.REPEAT_Y) {
                rows = 1;
            }

            for(let i = 0; i < rows; i++) {
                for(let j = 0; j < cols; j++) {
                    // 计算第 i 行第 j 列的坐标
                    left = destRect.origin.x + i * srcRect.size.width;
                    top = destRect.origin.y + j * srcRect.size.height;
                    width = srcRect.size.width;
                    height = srcRect.size.height;
                    right = left + width;
                    bottom = top + height;

                    if ( right > destRight) {
                        width = srcRect.size.width - ( right - destRight);
                    }
                    if ( bottom > destBottom) {
                      height = srcRect.size.height - ( bottom - destBottom);
                    }
                    this.ctx2D.drawImage(img, srcRect.origin.x, srcRect.origin.y, width, height, left, top, width, height);
                }
            }
        }
        return true;
    }
    timeCallback(id: number, data: any) {
        if (!this.ctx2D) return;
        this.updateLineDashOffset();
        this.drawRect(20, 20, this.ctx2D.canvas.width / 2, this.ctx2D.canvas.height / 2);
    }
    private updateLineDashOffset() {
        this._lineDashOffset++;
        if (this._lineDashOffset > 1000) {
            this._lineDashOffset = 0;
        }
    }
}

// 测试主流程
const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement;
const app: TestApplication = new TestApplication(canvas);
app.render();
const startBtn: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement;
const stopBtn: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement;

startBtn.addEventListener('click', (e: MouseEvent) => {
    app.start();
});
stopBtn.addEventListener('click', (e: MouseEvent) => {
    app.stop();
});