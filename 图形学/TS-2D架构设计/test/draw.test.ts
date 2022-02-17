// 注意：这里绘图 api 都改成了使用 fill 和 stroke 开头，没有使用 draw，这样语义比较分明，一个是填充一个是描边
import { Canvas2DApplication } from '../src/Application';
import { CanvasKeyboardEvent, CanvasMouseEvent } from '../src/CnavasInputEvent';
import { Rectangle, Size, Math2D, vec2, mat2d } from '../src/math2D';
import { CubeBezierCurve, QuadraticBezierCurve } from '../src/QuadraticBezierCurve';
import { Tank } from './Tank';

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
export enum ELayout {
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

export class TestApplication extends Canvas2DApplication {
    private _lineDashOffset: number = 0;
    private _mouseX: number = 0;
    private _mouseY: number = 0;

    private _rotationSunSpeed: number = 50 * 0.0001;        //太阳自转的角速度，以角度为单位
    private _rotationMoonSpeed: number = 100 * 0.0001;      //月球自转的角速度，以角度为单位
    private _revolutionSpeed: number = 60 * 0.0001;         //月球公转的角速度

    private _rotationSun: number = 0;              //太阳自转的角位移
    private _rotationMoon: number = 0;             //月亮自转的角位移
    private _revolution: number = 0;               //月亮围绕太阳公转的角位移

    public _tank: Tank;

    // 线段起点
    public lineStart: vec2 = vec2.create(this.canvas.width / 2, this.canvas.height / 2);
    // 线段终点
    public lineEnd: vec2 = vec2.create(this.canvas.width / 2 + 300, this.canvas.height / 2 + 200);
    // 投影点坐标
    public closePt: vec2 = vec2.create();
    // 鼠标是否在线段起点和重点范围内
    private _isHit: boolean = false;

    private _quadCurve: QuadraticBezierCurve;
    private _cubeCurve: CubeBezierCurve;
    // 由于 Colors 独一无二，没有多个实例，所以可以声明为公开的静态的数组类型
    public static Colors: string[] = [
        'aqua',                   //浅绿色
        'black',                  //黑色
        'blue',                   //蓝色
        'fuchsia',                //紫红色
        'gray',                    //灰色
        'green',                  //绿色
        'lime',                   //绿黄色
        'maroon',                 //褐红色
        'navy',                   //海军蓝
        'olive',                  //橄榄色
        'orange',                 //橙色
        'purple',                 //紫色
        'red',                     //红色
        'silver',                 //银灰色
        'teal',                   //蓝绿色
        'white',                  //白色
        'yellow'                   //黄色
    ];
    constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this.isSupportMouseMove = true;

        this._tank = new Tank();
        this._tank.x = canvas.width / 2;
        this._tank.y = canvas.height / 2;
        this._tank.scaleX = 2;
        this._tank.scaleY = 2;
        this._tank.tankRotation = Math2D.toRadian(30);
        this._tank.turretRotation = Math2D.toRadian(-30);
        this._tank.showCoord = true;

        this._quadCurve = new QuadraticBezierCurve(
            vec2.create(400, 100),
			vec2.create(550, 200),
			vec2.create(400, 300),
        );
        this._cubeCurve = new CubeBezierCurve(
            vec2.create(60, 100),
			vec2.create(240, 100),
			vec2.create(60, 300),
			vec2.create(240, 300)
        );
    }
    start() {
        // 更新虚线偏移位置，也可以写在 update 里面
        this.addTimer(this.timeCallback.bind(this), 50);
        super.start();
    }
    update(dt: number, passingTime: number): void {
        // 角位移公式：s = v * t ;
        // this._rotationMoon += this._rotationMoonSpeed * dt;
        // this._rotationSun += this._rotationSunSpeed * dt;
        // this._revolution += this._revolutionSpeed * dt;
        this._tank.update(dt);

        this._quadCurve.update(dt);
		this._cubeCurve.update(dt);
    }
    render() {
        if (!this.ctx2D) return;
        // 清屏
        this.ctx2D.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // 具体绘制
        // this.drawRect(0, 0, this.canvas.width / 2, this.canvas.height / 2);
        this.drawGrid();
        this.draw4Quadrant();
        this.strokeLine(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
        this.strokeLine(this.canvas.width / 2, 0, this.canvas.width / 2, this.canvas.height);
        this.fillCircle(this.canvas.width / 2, this.canvas.height / 2, 5);
        // this.fillText('尤水就下', 50, 50);
        // this.loadAndDrawImage('https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/github.46c47564.png');

        // const xx = document.createElement('img');
        // xx.onload = () => {
        //     this.drawImage(xx, Rectangle.create(400, 400, 300, 300), Rectangle.create(0, 0, 100, 100), EImageFillType.REPEAT);
        // }
        // xx.src = 'https://lf-cdn-tos.bytescm.com/obj/static/xitu_extension/static/github.46c47564.png';

        // const colorOfflineCanvas = this.getColorCanvas();
        // this.drawImage(colorOfflineCanvas, Rectangle.create(300, 50, colorOfflineCanvas.width, colorOfflineCanvas.height));

        // this.testChangePartCanvasImageData();

        // 下面是坐标系变换测试：平移、旋转
        // this.strokeCircle(0, 0, this.distance(0, 0, this.canvas.width / 2, this.canvas.height / 2));
        // this.drawCanvasCoordCenter();
        // this.drawCoordInfo(`${this._mouseX},${this._mouseY}`, this._mouseX, this._mouseY);
        // this.doTransform(100, 50, -30);
        // this.doTransform(100, 50, -20, ELayout.LEFT_TOP);
        // this.doTransform(100, 50, -5, ELayout.LEFT_BOTTOM);
        // this.doTransform(100, 50, 10, ELayout.RIGHT_TOP);
        // this.doTransform(100, 50, 30, ELayout.RIGHT_BOTTOM);
        // this.doTransform(100, 50, 45, ELayout.CENTER_BOTTOM);

        // this.doLocalTransform();

        // 下面是自转公转案例
        // this.rotationAndRevolutionSimulation();

        // 下面是坦克案例
        // this.drawTank();
        // const x = (this._mouseX - this._tank.x).toFixed(2);
        // const y = (this._mouseY - this._tank.y).toFixed(2);
        // const angle = Math2D.toDegree(this._tank.tankRotation).toFixed(2);
        // this.drawCoordInfo(`坐标：[${x}, ${y}]；角度：${angle}`, this._mouseX, this._mouseY);

        // 下面是向量案例
        // const v1 = new vec2(this.canvas.width / 2, this.canvas.height / 2);
        // const v2 = new vec2(this.canvas.width / 2 + 200, this.canvas.height / + 200);
        // this.drawVecFromLine(v1, v2);
        // this.drawMouseLineProjection();

        // 下面碰撞检测案例
        // this.drawMouseLineHitTest(); // 点线碰撞
        // this.drawCoordInfo('[' + (this._mouseX).toFixed(2) + ', ' + (this._mouseY).toFixed(2) + " ]", this._mouseX, this._mouseY);

        // // 下面是多边形绘制案例
        // this.ctx2D.save();
        // this.ctx2D.translate(-250, 150);
        // // 绘制凸多边形并进行三角扇形化显示
        // app.drawPolygon([vec2.create(-100, -50),
        // vec2.create(0, -100),
        // vec2.create(100, -50),
        // vec2.create(100, 50),
        // vec2.create(0, 100),
        // vec2.create(-100, 50)], 400, 300, true);
        // this.ctx2D.restore();
        // // 绘制凹多边形，不进行扇形化显示
        // this.ctx2D.save();
        // this.ctx2D.translate(150, 200);
        // app.drawPolygon([
        //     vec2.create(0, 0),
        //     vec2.create(100, -100),
        //     vec2.create(100, 50),
        //     vec2.create(-100, 50),
        //     vec2.create(-100, -100)
        // ], 0, 0);
        // this.ctx2D.restore();

        // 下面是贝塞尔曲线案例
        this.drawQuadraticBezierCurve();
    }
    drawQuadraticBezierCurve() {
        this._quadCurve.draw(this);
        this._cubeCurve.draw(this);
    }
    drawMouseLineHitTest() {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        // 鼠标位置在线段范围外的绘制效果
        if (this._isHit) {
            // let mousePt: vec2 = vec2.create(this._mouseX, this._mouseY);
            ctx2D.save();
            // 绘制原向量
            this.drawVecFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 3, false, true);
            // 绘制投影点
            this.fillCircle(this.closePt.x, this.closePt.y, 5);
            ctx2D.restore();
        } else {
            this.drawVecFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 1, false, true);
        }
    }
    /**
     * 沿着局部坐标系x轴的正方向，绘制长度为len的向量
     * @param len 要绘制的向量的长度，例如291.55
     * @param arrowLen 要绘制的向量的箭头长度
     * @param beginText 表示向量尾部和头部的信息，例如[ 150 , 150 ]和[ 400 , 300 ]
     * @param endText 表示向量尾部和头部的信息，例如[ 150 , 150 ]和[ 400 , 300 ]
     * @param lineWidth 用来加粗显示向量
     * @param isLineDash 是否以虚线方式显示向量
     * @param showInfo 是否显示向量的长度
     * @param alpha 是否以半透明方式显示向量
     * @returns 
     */
    drawVec(
        len: number,
        arrowLen: number = 10,
        beginText: string = '',
        endText = '',
        lineWidth: number = 1,
        isLineDash: boolean = false,
        showInfo: boolean = true,
        alpha: boolean = false
    ) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        // 当绘制向量的负向量时，len是负数
        // 此时如果不做如下处理，会导致向量的箭头绘制错误
        if (len < 0) arrowLen = -arrowLen;
        ctx2D.save();
        // 设置线宽
        ctx2D.lineWidth = lineWidth;
        // 设置是否虚线绘制
        if (isLineDash) ctx2D.setLineDash([2, 2]);

        // 绘制向量的起点圆圈，如果加粗显示，那么向量的起点也要加大
        if (lineWidth > 1) {
            this.fillCircle(0, 0, 5);
        } else {
            this.fillCircle(0, 0, 3);
        }

        // 绘制向量和箭头
        ctx2D.save();
        // 设置是否半透明显示向量
        if (alpha) {
            ctx2D.strokeStyle = 'rgba( 0 , 0 , 0 , 0.3 )';
        }

        // 绘制长度为len的线段表示向量
        this.strokeLine(0, 0, len, 0);

        // 绘制箭头的上半部分
        ctx2D.save();
        this.strokeLine(len, 0, len - arrowLen, arrowLen);
        ctx2D.restore();
        // 绘制箭头的下半部分
        ctx2D.save();
        this.strokeLine(len, 0, len - arrowLen, -arrowLen);
        ctx2D.restore();
        ctx2D.restore();
        // 绘制线段的起点，终点信息
        let font: FontType = "15px sans-serif";
        if (beginText && beginText.length !== 0) {
            if (len > 0) {
                this.fillText(beginText, 0, 0, 'black', 'right', 'bottom', font);
            } else {
                this.fillText(beginText, 0, 0, 'black', 'left', 'bottom', font);
            }
        }
        len = parseFloat(len.toFixed(2));
        if (beginText && endText.length !== 0) {
            if (len > 0) {
                this.fillText(endText, len, 0, 'black', 'left', 'bottom', font);
            } else {
                this.fillText(endText, len, 0, 'black', 'right', 'bottom', font);
            }
        }
        // 绘制向量的长度信息
        if (showInfo) {
            this.fillText(Math.abs(len).toString(), len * 0.5, 0, 'black', 'center', 'bottom', font);
        }
        ctx2D.restore();
    }
    // 一个更常用的绘制向量的方法
    // 从两个点计算出一个向量，然后调用drawVec绘制该向量
    // 返回值：当前向量与x正方向的夹角，以弧度表示
    drawVecFromLine(
        start: vec2,
        end: vec2,
        arrowLen: number = 10,
        beginText: string = '',
        endText = '',
        lineWidth: number = 1,
        isLineDash: boolean = false,
        showInfo: boolean = false,
        alpha: boolean = false
    ): number {
        let angle: number = vec2.getOrientation(start, end, true);
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return angle;
        // 获取从start-end形成的向量与x轴正方向[0 , 1]之间以弧度表示的夹角
        // 计算出向量之间的差，注意方向
        let diff: vec2 = vec2.difference(end, start);
        // 计算出向量的大小
        let len: number = diff.length;
        ctx2D.save();
        // 局部坐标系原点变换到start
        ctx2D.translate(start.x, start.y);
        // 局部坐标系旋转angle弧度
        ctx2D.rotate(angle);
        // 调用drawVec方法
        this.drawVec(len, arrowLen, beginText, endText, lineWidth, isLineDash, showInfo, alpha);
        ctx2D.restore();
        return angle;
    }
    // 画向量和投影
    drawMouseLineProjection() {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        if (this._isHit) { // 鼠标位置在线段范围内
            let angle: number = 0;
            let mousePt: vec2 = vec2.create(this._mouseX, this._mouseY);
            ctx2D.save();
            // 绘制原向量
            angle = this.drawVecFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 3, false, true);
            // 绘制投影点
            this.fillCircle(this.closePt.x, this.closePt.y, 5);
            // 绘制线段起点到鼠标点向量
            this.drawVecFromLine(this.lineStart, mousePt, 10, '', '', 1, true, true, false);
            // 绘制鼠标点到投影点的线段
            this.drawVecFromLine(mousePt, this.closePt, 10, '', '', 1, true, true, false);
            ctx2D.restore();
            // 绘制投影点的坐标信息（相对左上角的表示）
            ctx2D.save();
            ctx2D.translate(this.closePt.x, this.closePt.y);
            ctx2D.rotate(angle);
            this.drawCoordInfo('[' + (this.closePt.x).toFixed(2) + '  ,  ' + (this.closePt.y).toFixed(2) + " ]", 0, 0);
            ctx2D.restore();
            // 计算出线段与鼠标之间的夹角，以弧度表示
            angle = vec2.getAngle(vec2.difference(this.lineEnd, this.lineStart), vec2.difference(mousePt, this.lineStart), false);
            // 绘制出夹角信息
            this.drawCoordInfo(angle.toFixed(2) + '°', this.lineStart.x + 10, this.lineStart.y + 10);
        } else { // 鼠标位置在线段范围外的绘制效果
            this.drawVecFromLine(this.lineStart, this.lineEnd, 10, this.lineStart.toString(), this.lineEnd.toString(), 1, false, true);
        }
    }
    drawTank() {
        this._tank.draw(this);
    }
    // 公转自转模拟
    public rotationAndRevolutionSimulation(radius: number = 220): void {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        // 将自转rotation转换为弧度表示
        let rotationMoon: number = Math2D.toRadian(this._rotationMoon);
        let rotationSun: number = Math2D.toRadian(this._rotationSun);
        // 将公转revolution转换为弧度表示
        let revolution: number = Math2D.toRadian(this._revolution);
        // 记录当前渲染状态
        ctx2D.save();
        // 将局部坐标系平移到画布中心
        ctx2D.translate(this.canvas.width * 0.5, this.canvas.height * 0.5);
        ctx2D.save();
        // 绘制矩形在画布中心自转
        ctx2D.rotate(rotationSun);
        // 绕局部坐标系原点自转
        this.fillLocalRectWithTitleUV(100, 100, '自转', 0.5, 0.5);
        ctx2D.restore();
        // 公转 + 自转，注意顺序：
        ctx2D.save();
        // 先公转
        ctx2D.rotate(revolution);
        //然后沿着当前的x轴平移radius个单位，radius半径形成圆路径
        ctx2D.translate(radius, 0);
        // 一旦平移到圆的路径上，开始绕局部坐标系原点进行自转
        ctx2D.rotate(rotationMoon);
        this.fillLocalRectWithTitleUV(80, 80, '自转 + 公转', 0.5, 0.5);
        ctx2D.restore();
        // 恢复上一次记录的渲染状态
        ctx2D.restore();
    }
    doLocalTransform() {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        let width: number = 100;            // 在局部坐标系中显示的rect的width
        let height: number = 60;            // 在局部坐标系中显示的rect的height
        let coordWidth: number = width * 1.5;          // 局部坐标系x轴的长度
        let coordHeight: number = height * 1.5;       // 局部坐标系y轴的长度
        let radius: number = 5;             // 绘制原点时使用的半径
        ctx2D.save();

        ctx2D.translate(this.canvas.width / 2, 50);
        this.strokeCoords(0, 0, coordWidth, coordHeight);
        this.fillCircle(0, 0, radius);
        this.fillLocalRectWithTitle(width, height, '尤水就下');

        ctx2D.restore();
    }
    doTransform(width: number = 200, height: number = 100, degree: number = 0, layout: ELayout = ELayout.CENTER_MIDDLE, rotateFirst: boolean = true, isClockwise: boolean = true) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        const radians = Math2D.toRadian(degree) * (isClockwise ? 1 : -1);
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        // 画圆做参考
        ctx2D.save();
        // 变换顺序对结果是有显著影响的
        if (rotateFirst) {
            // 顺时针旋转
            ctx2D.rotate(radians);
            ctx2D.translate(halfWidth, halfHeight);
        } else {
            ctx2D.translate(halfWidth, halfHeight);
            ctx2D.rotate(radians);
        }
        this.fillLocalRectWithTitle(width, height, '', 'rgba(0, 0, 0, 0.3)', layout);
        ctx2D.restore();
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
        this.fillCircle(x, y, 10);
        ctx2D.restore();
    }
    strokeRect(x: number, y: number, w: number, h: number, strokeStyle: string = '#000') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.strokeStyle = strokeStyle;
        ctx2D.rect(x, y, w, h);
        ctx2D.stroke();
        ctx2D.restore();
    }
    fillRect(x: number, y: number, w: number, h: number, fillStyle: string = '#000') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.fillStyle = fillStyle;
        ctx2D.beginPath(); // 切记要 beginPath，否则绘制状态会沿用上一次
        ctx2D.rect(x, y, w, h);
        ctx2D.fill();
        ctx2D.restore();
    }
    /**
     * local版本增加了坐标的9种原点变换，以及取消了x和y坐标参数，强制让局部坐标系原点位于[0, 0]处，这样可以通过内置的translate、rotate和scale方法进行局部坐标变换，这样更加方便、强大。后续会有很多比较复杂的例子来演示基于局部坐标系的变换操作。
     * @param width 要绘制的矩形宽度
     * @param height 要绘制的矩形高度
     * @param title 矩形中显示的字符串
     * @param color 要绘制矩形的填充颜色
     * @param referencePt 坐标系原点位置，默认居中
     * @param layout 文字框位置，默认居中绘制文本
     * @param showCoord 是否显示局部坐标系，默认为显示局部坐标系
     */
    fillLocalRectWithTitle(width: number, height: number, title: string = '', color: string = '#000', referencePt: ELayout = ELayout.LEFT_TOP, layout: ELayout = ELayout.CENTER_MIDDLE, showCoord: boolean = false) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        let x: number = 0;
        let y: number = 0;
        // 首先根据referencePt的值计算原点相对左上角的偏移量
        // Canvas2D中，左上角是默认的坐标系原点，所有原点变换都是相对左上角的偏移
        switch (referencePt) {
            case ELayout.LEFT_TOP:      //Canvas2D中，默认是左上角为坐标系原点
                x = 0;
                y = 0;
                break;
            case ELayout.LEFT_MIDDLE:                //左中为原点
                x = 0;
                y = - height * 0.5;
                break;
            case ELayout.LEFT_BOTTOM:               //左下为原点
                x = 0;
                y = - height;
                break;
            case ELayout.RIGHT_TOP:                  //右上为原点
                x = - width;
                y = 0;
                break;
            case ELayout.RIGHT_MIDDLE:               //右中为原点
                x = - width;
                y = - height * 0.5;
                break;
            case ELayout.RIGHT_BOTTOM:               //右下为原点
                x = - width;
                y = - height;
                break;
            case ELayout.CENTER_TOP:                //中上为原点
                x = - width * 0.5;
                y = 0;
                break;
            case ELayout.CENTER_MIDDLE:              //中中为原点
                x = - width * 0.5;
                y = - height * 0.5;
                break;
            case ELayout.CENTER_BOTTOM:             //中下为原点
                x = - width * 0.5;
                y = - height;
                break;
        }
        // 下面的代码和上一章实现的fillRectWithTitle一样
        ctx2D.save();
        // 1. 绘制矩形
        ctx2D.fillStyle = color;
        ctx2D.beginPath();
        ctx2D.rect(x, y, width, height);
        ctx2D.fill();
        // 如果有文字，先根据枚举值计算x, y坐标
        if (title.length) {
            // 2. 绘制文字信息
            // 在矩形的左上角绘制出相关文字信息，使用的是10px大小的文字
            let rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height);
            // // 绘制文本
            this.fillText(title, x + rect.origin.x, y + rect.origin.y, 'white', 'left', 'top');
            // // 绘制文本框
            this.strokeRect(x + rect.origin.x, y + rect.origin.y, rect.size.width, rect.size.height, 'rgba(0, 0, 0, 0.5)');
            // // 绘制文本框左上角坐标（相对父矩形表示）
            this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2);
        }
        // // 3. 绘制变换的局部坐标系，局部坐标原点总是为[ 0 , 0 ]
        // // 附加一个坐标，x轴和y轴比矩形的width和height多20像素
        // // 并且绘制3像素的原点
        if (showCoord) {
            this.strokeCoords(0, 0, width + 20, height + 20);
            this.fillCircle(0, 0, 3);
        }
        ctx2D.restore();
    }
    public fillLocalRectWithTitleUV(
        width: number, height: number,                     //矩形尺寸
        title: string = '',                                     //矩形显示的文字内容
        u: number = 0,
        v: number = 0,
        //这里使用u和v参数代替原来的ELayout枚举
        layout: ELayout = ELayout.CENTER_MIDDLE,         //文字框的对齐方式
        color: string = 'grey',                                //矩形填充颜色
        showCoord: boolean = true       // 是否显示局部坐标系，默认显示
    ) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        let x: number = - width * u;
        let y: number = - height * v;
        // 和fillLocalRectWithTitle中的绘制代码一样
        // 首先根据referencePt的值计算原点相对左上角的偏移量
        // Canvas2D中，左上角是默认的坐标系原点，所有原点变换都是相对左上角的偏移
        ctx2D.save();
        // 1. 绘制矩形
        ctx2D.fillStyle = color;
        ctx2D.beginPath();
        ctx2D.rect(x, y, width, height);
        ctx2D.fill();
        // 如果有文字，先根据枚举值计算x, y坐标
        if (title.length) {
            // 2. 绘制文字信息
            // 在矩形的左上角绘制出相关文字信息，使用的是10px大小的文字
            let rect: Rectangle = this.calcLocalTextRectangle(layout, title, width, height);
            // // 绘制文本
            this.fillText(title, x + rect.origin.x, y + rect.origin.y, 'white', 'left', 'top');
            // // 绘制文本框
            this.strokeRect(x + rect.origin.x, y + rect.origin.y, rect.size.width, rect.size.height, 'rgba(0, 0, 0, 0.5)');
            // // 绘制文本框左上角坐标（相对父矩形表示）
            this.fillCircle(x + rect.origin.x, y + rect.origin.y, 2);
        }
        // // 3. 绘制变换的局部坐标系，局部坐标原点总是为[ 0 , 0 ]
        // // 附加一个坐标，x轴和y轴比矩形的width和height多20像素
        // // 并且绘制3像素的原点
        if (showCoord) {
            this.strokeCoords(0, 0, width + 20, height + 20);
            this.fillCircle(0, 0, 3);
        }
        ctx2D.restore();
    }
    fillCircle(x: number, y: number, radius: number, fillStyle: string | CanvasGradient | CanvasPattern = '#000') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.fillStyle = fillStyle;
        ctx2D.beginPath();
        ctx2D.arc(x, y, radius, 0, Math.PI * 2);
        ctx2D.fill();
        ctx2D.restore();
    }
    strokeCircle(x: number, y: number, radius: number, strokeStyle: string | CanvasGradient | CanvasPattern = '#000') {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.strokeStyle = strokeStyle;
        ctx2D.beginPath();
        ctx2D.arc(x, y, radius, 0, Math.PI * 2);
        ctx2D.stroke();
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
    strokeLine(x1: number, y1: number, x2: number, y2: number) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.beginPath();
        ctx2D.moveTo(x1, y1);
        ctx2D.lineTo(x2, y2);
        ctx2D.stroke();
    }
    fillLine(x1: number, y1: number, x2: number, y2: number) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.beginPath();
        ctx2D.moveTo(x1, y1);
        ctx2D.lineTo(x2, y2);
        ctx2D.fill();
    }
    strokeCoord(originX: number, originY: number, width: number, height: number) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        this.drawLine(originX, originY, originX + width, originY);
        this.drawLine(originX, originY, originX, originY + height);
        ctx2D.restore();
    }
    strokeCoords(originX: number, originY: number, width: number, height: number) {
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
        for (let i = interval + 0.5; i < this.canvas.width; i += interval) {
            this.drawLine(i, 0, i, this.canvas.height);
        }
        // 从上到下画水平线
        for (let i = interval + 0.5; i < this.canvas.height; i += interval) {
            this.drawLine(0, i, this.canvas.width, i);
        }
        ctx2D.restore();
        // 绘制全局坐标系，左上角为原点，x 轴向右，y 轴向下，特别适合用来观察坐标变换
        this.fillCircle(0, 0, 5, '#000');
        this.strokeCoords(0, 0, this.canvas.width, this.canvas.height);
    }
    fillText(text: string, x: number, y: number, color: string = '#000', align: TextAlign = 'left', basline: TextBaseline = 'top', font: FontType = '20px sans-serif') {
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
    // parentWidth / parentHeight是父矩形的尺寸
    // 函数返回类型是Rectangle，表示9个文本子矩形之一
    // 这些子矩形是相对父矩形坐标系的表示
    // 这意味着父矩形原点为[0 , 0]，所以参数是父矩形的width和height，而没有x和y坐标
    calcLocalTextRectangle(layout: ELayout, text: string, parentWidth: number, parentHeight: number): Rectangle {
        // 首先计算出要绘制的文本的尺寸（width / hegiht）
        let s: Size = this.calcTextSize(text);
        // 创建一个二维向量
        let o: vec2 = vec2.create();
        // 计算出当前文本子矩形左上角相对父矩形空间中的3个关键点（左上、中心、右下）坐标
        // 1．当前文本子矩形左上角相对父矩形左上角坐标，由于局部表示，所以为[ 0 , 0 ]
        let left: number = 0;
        let top: number = 0;
        // 2．当前文本子矩形左上角相对父矩形右下角坐标
        let right: number = parentWidth - s.width;
        let bottom: number = parentHeight - s.height;
        // 3．当前文本子矩形左上角相对父矩形中心点坐标
        let center: number = right * 0.5;
        let middle: number = bottom * 0.5;
        // 根据ELayout的值来匹配这3个点的分量
        // 计算子矩形相对父矩形原点[ 0 , 0 ]偏移量
        switch (layout) {
            case ELayout.LEFT_TOP:
                o.x = left;
                o.y = top;
                break;
            case ELayout.RIGHT_TOP:
                o.x = right;
                o.y = top;
                break;
            case ELayout.RIGHT_BOTTOM:
                o.x = right;
                o.y = bottom;
                break;
            case ELayout.LEFT_BOTTOM:
                o.x = left;
                o.y = bottom;
                break;
            case ELayout.CENTER_MIDDLE:
                o.x = center;
                o.y = middle;
                break;
            case ELayout.CENTER_TOP:
                o.x = center;
                o.y = 0;
                break;
            case ELayout.RIGHT_MIDDLE:
                o.x = right;
                o.y = middle;
                break;
            case ELayout.CENTER_BOTTOM:
                o.x = center;
                o.y = bottom;
                break;
            case ELayout.LEFT_MIDDLE:
                o.x = left;
                o.y = middle;
                break;
        }
        // 返回子矩形
        return new Rectangle(o, s);
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
    drawImage(img: HTMLImageElement | HTMLCanvasElement, destRect: Rectangle, srcRect: Rectangle = Rectangle.create(0, 0, img.width, img.height), fillType: EImageFillType = EImageFillType.STRETCH): boolean {
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

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    // 计算第 i 行第 j 列的坐标
                    left = destRect.origin.x + i * srcRect.size.width;
                    top = destRect.origin.y + j * srcRect.size.height;
                    width = srcRect.size.width;
                    height = srcRect.size.height;
                    right = left + width;
                    bottom = top + height;

                    if (right > destRight) {
                        width = srcRect.size.width - (right - destRight);
                    }
                    if (bottom > destBottom) {
                        height = srcRect.size.height - (bottom - destBottom);
                    }
                    this.ctx2D.drawImage(img, srcRect.origin.x, srcRect.origin.y, width, height, left, top, width, height);
                }
            }
        }
        return true;
    }
    // 获取 4 * 4 = 16 种基本颜色的离屏画布
    getColorCanvas(amount: number = 32): HTMLCanvasElement {
        let step: number = 4;
        // 第1步，使用createElement方法，提供tagName为"canvas"关键字创建一个离屏
        let canvas: HTMLCanvasElement = document.createElement('canvas') as HTMLCanvasElement;
        // 第2步，设置该画布的尺寸
        canvas.width = amount * step;
        canvas.height = amount * step;
        // 第3步，从离屏画布中获取渲染上下文对象
        let context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (context === null) {
            alert('离屏Canvas获取渲染上下文失败！');
            throw new Error('离屏Canvas获取渲染上下文失败！');
        }

        for (let i: number = 0; i < step; i++) {
            for (let j: number = 0; j < step; j++) {
                // 将二维索引转换成一维索引，用来在静态的Colors数组中寻址
                let idx: number = step * i + j;
                // 第4步，使用渲染上下文对象绘图
                context.save();
                // 使用其中16种颜色（由于背景是白色，17种颜色包含白色，所以去除白色）
                context.fillStyle = TestApplication.Colors[idx];
                context.fillRect(i * amount, j * amount, amount, amount);
                context.restore();
            }
        }
        return canvas;
    }
    // 参数rRow / rColum表示要替换（replace）的颜色的行列索引，默认情况下，将第3行，第1列的蓝色子矩形替换为红色
    // 参数cRow / cColum表示要改变（change）的颜色的行列索引，默认情况下，将第2行，第1列的黑色子矩形反转为白色
    testChangePartCanvasImageData(rRow: number = 2, rColum: number = 0, cRow: number = 1, cColum: number = 0, size: number = 32) {
        // 调用getColorCanvas方法生成16种标准色块离屏画布
        let colorCanvas: HTMLCanvasElement = this.getColorCanvas(size);
        // 获取离屏画布的上下文渲染对象
        let context: CanvasRenderingContext2D | null = colorCanvas.getContext("2d");
        if (context === null) {
            alert('Canvas获取渲染上下文失败！');
            throw new Error('Canvas获取渲染上下文失败！');
        }
        // 显示未修改时的离屏画布的效果
        // this.drawImage(colorCanvas, Rectangle.create(500, 50, colorCanvas.width, colorCanvas.height));

        // 接上面的代码继续往下来替换颜色
        //使用creatImageData方法，大小为size * size个像素
        // 每个像素又有4个分量[ r , g , b , a ]
        let imgData: ImageData = context.createImageData(size, size);
        // imgData有3个属性，其中data属性存储的是一个Uint8ClampedArray类型数组对象
        // 该数组中存储方式为： [ r , g , b , a , r , g , b , a , ........ ]
        // 所以imgData.data.length = size * size * 4 ;
        let data: Uint8ClampedArray = imgData.data;
        // 上面也提到过，imgData.data.length表示的是所有分量的个数
        // 而为了方便寻址，希望使用像素个数进行遍历，因此要除以4（一个像素由r、g、b、a这4个分量组成）
        let rbgaCount: number = data.length / 4;
        for (let i = 0; i < rbgaCount; i++) {
            // 注意下面索引的计算方式
            data[i * 4 + 0] = 255;        //红色的rbga = [ 255 , 0 , 0 , 255 ]
            data[i * 4 + 1] = 0;
            data[i * 4 + 2] = 0;
            data[i * 4 + 3] = 255;        // alpha这里设置为255，全不透明
        }

        // 一定要调用putImageData方法来替换context中的像素数据
        // 参数imgData表示要替换的像素数据
        // 参数[ size * rColum  , size * rRow ]表示要绘制到context中的哪个位置
        // 参数[ 0 , 0 , size , size ]表示从imgData哪个位置获取多少像素
        context.putImageData(imgData, size * rColum, size * rRow, 0, 0, size, size);

        // 获取离屏画布中位于[ size * cColum , size * cRow ] 处，尺寸为[ size , size ]大小的像素数据
        // imgData = context.getImageData(size * cColum, size * cRow, size, size);
        // data = imgData.data;
        // let component: number = 0;
        // // 下面使用imgData的width和height属性，二维方式表示像素
        // for (let i: number = 0; i < imgData.width; i++) {
        //     for (let j: number = 0; j < imgData.height; j++) {
        //         // 由于每个像素有包含4个分量，[ r g b a ] 因此三重循环
        //         for (let k: number = 0; k < 4; k++) {
        //             // 因为data是一维数组表示，而使用三重循环，因此需要下面算法
        //             // 将三维数组表示的索引转换为一维数组表示的索引，该算法很重要
        //             let idx: number = (i * imgData .height  + j ) * 4 + k;
        //             component = data[idx];
        //             // 在data数组中，idx % 4 为3时，说明是alpha值
        //             // 需求是alpha总是保持不变，因此需要下面判断代码，切记
        //             if (idx % 4! == 3) {
        //                 data[idx] = 255 - component; //反转rgb，但是alpha 不变，仍旧是255
        //             }
        //         }
        //     }
        // }
        // // 使用putImageData更新像素数据
        // context.putImageData(imgData, size * cColum, size * cRow, 0, 0, size, size);
        // 将修改后的结果绘制显示出来
        this.setShadowState();
        this.drawImage(colorCanvas, Rectangle.create(500, 50, colorCanvas.width, colorCanvas.height));
    }
    // 阴影的使用非常简单，但是阴影的绘制非常耗时，除非必要，否则尽量不要使用阴影技术。另外阴影属于全局绘制对象，它影响到矢量图形、图像及文本的绘制效果
    setShadowState(shadowBlur: number = 5, shadowColor: string = 'rgba( 127 , 127 , 127 , 0.5 )', shadowOffsetX: number = 10, shadowOffsetY: number = 10) {
        if (!this.ctx2D) return;
        this.ctx2D.shadowBlur = shadowBlur;
        this.ctx2D.shadowColor = shadowColor;
        this.ctx2D.shadowOffsetX = shadowOffsetX;
        this.ctx2D.shadowOffsetY = shadowOffsetY;
    }
    drawCanvasCoordCenter() {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        ctx2D.save();
        ctx2D.lineWidth = 2;
        ctx2D.strokeStyle = 'red';
        this.drawLine(0, halfHeight, this.canvas.width, halfHeight);
        this.drawLine(halfWidth, 0, halfWidth, this.canvas.height);
        this.fillCircle(halfWidth, halfHeight, 5);
        ctx2D.restore();
    }
    drawCoordInfo(info: string, x: number = 0, y: number = 0) {
        this.fillText(info, x, y, '#000', 'center', 'middle');
    }
    draw4Quadrant() {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        this.fillText('第一象限', this.canvas.width, this.canvas.height, 'red', 'right', 'bottom');
        this.fillText('第二象限', 0, this.canvas.height, 'red', 'left', 'bottom');
        this.fillText('第三象限', 0, 0, 'red', 'left', 'top');
        this.fillText('第四象限', this.canvas.width, 0, 'red', 'right', 'top');
        ctx2D.restore();
    }
    // 绘制三角形
    drawTriangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, stroke: boolean = true) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.lineWidth = 3;
        ctx2D.strokeStyle = 'rgba( 0 , 0 , 0 , 0.5 )';
        ctx2D.beginPath();
        ctx2D.lineTo(x1, y1);
        ctx2D.lineTo(x2, y2);
        ctx2D.moveTo(x3, y3);
        ctx2D.closePath();

        if (stroke) {
            ctx2D.stroke();
        } else {
            ctx2D.fill();
        }

        this.fillCircle(x3, y3, 5);
        ctx2D.restore();
    }
    drawPolygon(points: vec2[], ptX: number, ptY: number, drawSubTriangle: boolean = false) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.save();
        ctx2D.strokeStyle = 'rgba( 0, 0, 0, 0.5 )';
        ctx2D.lineWidth = 3;
        ctx2D.translate(ptX, ptY);
        // 绘制多边形
        ctx2D.beginPath();
        ctx2D.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx2D.lineTo(points[i].x, points[i].y);
        }
        ctx2D.closePath();
        ctx2D.stroke();
        // 绘制虚线，形成子三角形
        if (drawSubTriangle) {
            ctx2D.lineWidth = 2;
            ctx2D.setLineDash([3, 3]);
            for (let i: number = 1; i < points.length - 1; i++) {
                this.strokeLine(points[0].x, points[0].y, points[i].x, points[i].y);
            }
        }
        this.fillCircle(points[0].x, points[0].y, 5, 'red');
        ctx2D.restore();
    }
    distance(x1: number, y1: number, x2: number, y2: number): number {
        const diffX: number = x2 - x1;
        const diffY: number = y2 - y1;
        return Math.sqrt(diffX * diffX + diffY * diffY);
    }
    /**
     * 将我们自己实现的mat2d矩阵传递给canvasRederingContext2D上下文渲染对象，亦即将当前栈顶矩阵乘以参数矩阵，因此会累积上一次的变换。
     * @param mat 
     * @returns 
     */
    transform(mat: mat2d) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.transform(
            mat.values[0],
            mat.values[1],
            mat.values[2],
            mat.values[3],
            mat.values[4],
            mat.values[5]);
    }
    /**
     * setTransform方法的作用和MatrixStack的loadMatrix一致，是将参数矩阵中各个元素的值直接复制到CanvasRenderingContext2D上下文渲染对像所持有的矩阵堆栈的栈顶矩阵中
     * @param mat 
     * @returns 
     */
    setTransform(mat: mat2d) {
        const ctx2D: CanvasRenderingContext2D | null = this.ctx2D;
        if (!ctx2D) return;
        ctx2D.setTransform(
            mat.values[0],
            mat.values[1],
            mat.values[2],
            mat.values[3],
            mat.values[4],
            mat.values[5]);
    }
    protected dispatchMouseDown(e: CanvasMouseEvent): void {
        this._quadCurve.onMouseDown(e);
        this._cubeCurve.onMouseDown(e);
    }
    protected dispatchMouseUp(e: CanvasMouseEvent): void {
        this._quadCurve.onMouseUp(e);
        this._cubeCurve.onMouseUp(e);
    }
    protected dispatchMouseMove(e: CanvasMouseEvent) {
        // 必须要设置 this.isSupportMouseMove = true 才能处理moveMove事件
        this._mouseX = e.canvasPos.x;
        this._mouseY = e.canvasPos.y;

        this._tank.onMouseMove(e);

        // this._isHit = Math2D.projectPointOnLineSegment(vec2.create(this._mouseX, this._mouseY), this.lineStart, this.lineEnd, this.closePt);
        this._isHit = Math2D.isPointOnLineSegment(vec2.create(this._mouseX, this._mouseY), this.lineStart, this.lineEnd, this.closePt, 1);

        this._quadCurve.onMouseMove(e);
        this._cubeCurve.onMouseMove(e);
    }
    protected dispatchKeyPress(e: CanvasKeyboardEvent) {
        this._tank.onKeyPress(e);
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
app.start();

const startBtn: HTMLButtonElement = document.getElementById('start') as HTMLButtonElement;
const stopBtn: HTMLButtonElement = document.getElementById('stop') as HTMLButtonElement;

startBtn.addEventListener('click', (e: MouseEvent) => {
    app.start();
});
stopBtn.addEventListener('click', (e: MouseEvent) => {
    app.stop();
});