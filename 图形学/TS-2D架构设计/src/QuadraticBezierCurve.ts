import { TestApplication } from "../test/draw.test";
import { CanvasMouseEvent } from "./CnavasInputEvent";
import { Math2D, vec2 } from "./math2D";

enum ECurveHitType {
    NONE,                     // 没有选中
    START_POINT,              // 选中起点
    END_POINT,                // 选中终点
    CONTROL_POINT0,           // 选中控制点0
    CONTROL_POINT1            // 选中控制点1，针对三次贝塞尔曲线而言
}

export class QuadraticBezierCurve {
    // 起点，相当于p0点
    protected _startAnchorPoint: vec2;
    // 终点，相当于p2点
    protected _endAnchorPoint: vec2;
    // 控制点，相当于p1点
    protected _controlPoint0: vec2;

    // 是否要绘制连线，方块表示的锚点和原点表示的控制点
    protected _drawLine: boolean;
    // 绘制线段的颜色
    protected _lineColor: string;
    // 绘制的线宽
    protected _lineWidth: number;
    // 方块表示的锚点和原点表示的控制点的大小
    protected _radiusOrLen: number;

    // 增加如下成员变量，用来插值点相关操作
    // 需要多个插值点，默认为30个
    protected _drawSteps: number = 30;
    // 计算出来的插值点存储在_points数组中
    protected _points !: Array<vec2>;
    // 是否显示所有插值点，默认显示
    protected _showCurvePt: boolean = true;
    // 标记变量，用来指明是否要重新计算所有插值点
    protected _dirty: boolean = true;

    // 拖拽点标识，初始化时没选中
    protected _hitType: ECurveHitType = ECurveHitType.NONE;

    protected _iter: IBezierEnumerator; // 迭代器

    public constructor(start: vec2, control: vec2, end: vec2, steps: number = 30) {
        // 初始化控制点
        this._startAnchorPoint = start;
        this._endAnchorPoint = end;
        this._controlPoint0 = control;
        this._drawSteps = steps;
        // 初始化渲染属性
        this._drawLine = true;
        this._lineColor = 'black';
        this._lineWidth = 1;
        this._radiusOrLen = 5;

        this._iter = Math2D.createQuadraticBezierEnumerator(start, control, end, this._drawSteps);
    }

    /**
     * 绘制贝塞尔曲线，虚拟方法，子类需要override
     * @param app 
     * @param useMyCurveDrawFunc useMyCurveDrawFunc为true，使用自己实现的绘制贝塞尔方法，否则用Canvas2D内置方法
     * @returns 
     */
    public draw(app: TestApplication, useMyCurveDrawFunc: boolean = true) {
        const ctx2D: CanvasRenderingContext2D | null = app.ctx2D;
        if (!ctx2D) return;

        ctx2D.save();
        // 设置线段的渲染属性
        ctx2D.lineWidth = this._lineWidth;
        ctx2D.strokeStyle = this._lineColor;

        // 二次贝塞尔曲线绘制的代码
        ctx2D.beginPath();
        ctx2D.moveTo(this._startAnchorPoint.x, this._startAnchorPoint.y);
        if (useMyCurveDrawFunc) {
            // 只需要将计算出来的插值点使用lineTo方法连接起来就能绘制出自己的曲线
            // 所以曲线的光滑度取决于drawSteps的数量，数量越多，越光滑
            for (let i = 1; i < this._points.length; i++) {
                ctx2D.lineTo(this._points[i].x, this._points[i].y);
            }
        } else {
            ctx2D.quadraticCurveTo(this._controlPoint0.x, this._controlPoint0.y, this._endAnchorPoint.x, this._endAnchorPoint.y);
        }
        ctx2D.stroke();

        // 增加显示已经计算出来的所有插值点
        if (this._showCurvePt) {
            for (let i = 0; i < this._points.length; i++) {
                app.fillCircle(this._points[i].x, this._points[i].y, 2, 'yellow');
            }
        }

        // 绘制辅助的信息
        if (this._drawLine) {
            // 绘制起点p0到控制点p1的连线
            app.strokeLine(this._startAnchorPoint.x, this._startAnchorPoint.y, this._controlPoint0.x, this._controlPoint0.y);
            // 绘制终点p2到控制点p1的连线
            app.strokeLine(this._endAnchorPoint.x, this._endAnchorPoint.y, this._controlPoint0.x, this._controlPoint0.y);

            // 绘制绿色的正方形表示起点p0
            app.fillRect(
                this._startAnchorPoint.x - (this._radiusOrLen + 5) * 0.5,
                this._startAnchorPoint.y - (this._radiusOrLen + 5) * 0.5,
                this._radiusOrLen + 5,
                this._radiusOrLen + 5,
                'green'
            );
            // 绘制蓝色的正方形表示终点p2
            app.fillRect(
                this._endAnchorPoint.x - (this._radiusOrLen + 5) * 0.5,
                this._endAnchorPoint.y - (this._radiusOrLen + 5) * 0.5,
                this._radiusOrLen + 5,
                this._radiusOrLen + 5,
                'blue'
            );
            // 绘制红色的原点表示控制点p1
            app.fillCircle(this._controlPoint0.x, this._controlPoint0.y, this._radiusOrLen, 'red');
        }

        // 绘制三个点的坐标信息，显示出当前p0、p1和p2的坐标信息
        // 有override vec2的toString方法
        app.drawCoordInfo('p0:' + this._startAnchorPoint.toString(), this._startAnchorPoint.x, this._startAnchorPoint.y - 10);
        app.drawCoordInfo('p1:' + this._controlPoint0.toString(), this._controlPoint0.x, this._controlPoint0.y - 10);
        app.drawCoordInfo('p2:' + this._endAnchorPoint.toString(), this._endAnchorPoint.x, this._endAnchorPoint.y - 10);
        ctx2D.restore();
    }
    /**
     * 返回t = [ 0 , 1 ]之间的位置向量，继承的子类需要覆写（override）该方法
     * @param t 
     * @returns 
     */
    protected getPosition(t: number): vec2 {
        if (t < 0 || t > 1.0) {
            throw new Error(" t的取值范围必须是[ 0 , 1 ]之间 ");
        }
        // 调用推导出来的二次贝塞尔多项式的向量版本
        // 子类（CubicBezierCurve）需要override本方法，调用对应的三次贝塞尔多项式版本
        return Math2D.getQuadraticBezierVector(this._startAnchorPoint, this._controlPoint0, this._endAnchorPoint, t);
    }
    /**
     * 如果_dirty为true，才重新计算所有插值点
     * @returns 
     */
    private _calcDrawPoints(): void {
        if (!this._dirty) return;
        // 清空插值点数组
        this._points = [];
        // 第一个是起点
        this._points.push(this._startAnchorPoint);

        this._iter.reset();
        while (this._iter.moveNext()) {
            this._points.push(this._iter.current!);
        }
        // 原始算法的写法如下
        // let s: number = 1.0 / (this._drawSteps);
        // // 计算除第一个和最后一个锚点之外的所有插值点，将其存储到数组中去
        // for (let i = 1; i < this._drawSteps - 1; i++) {
        //     // 调用虚方法getPosition
        //     let pt: vec2 = this.getPosition(s * i);
        //     // 将计算出来的插值点放入数组中去
        //     this._points.push(pt);
        // }
        // this._points.push(this._endAnchorPoint); // 最后一个是终点
        // 将_dirty标记设置为false
        this._dirty = false;
    }
    /**
     * 鼠标是否在起点、终点、控制点上，子类(CubicBezierCurve需要覆写以增加控制点1是否选中的情况)
     * @param pt 
     * @returns 
     */
    protected hitTest(pt: vec2): ECurveHitType {
        if (Math2D.isPointInCircle(pt, this._controlPoint0, this._radiusOrLen)) {
            // 选中控制点0
            return ECurveHitType.CONTROL_POINT0;
        } else if (Math2D.isPointInRect(pt.x, pt.y, this._startAnchorPoint.x - (this._radiusOrLen + 5) * 0.5, this._startAnchorPoint.y - (this._radiusOrLen + 5) * 0.5, this._radiusOrLen + 5, this._radiusOrLen + 5)) {
            // 选中起点
            return ECurveHitType.START_POINT;
        } else if (Math2D.isPointInRect(pt.x, pt.y, this._endAnchorPoint.x - (this._radiusOrLen + 5) * 0.5, this._endAnchorPoint.y - (this._radiusOrLen + 5) * 0.5, this._radiusOrLen + 5, this._radiusOrLen + 5)) {
            // 选中终点
            return ECurveHitType.END_POINT;
        } else {
            // 什么都没选中
            return ECurveHitType.NONE;
        }
    }
    /**
     * 每次mouseDown时调用hitTest进行碰撞检测测试，并将检测到的结果记录下来
     * @param evt 
     */
    public onMouseDown(evt: CanvasMouseEvent): void {
        this._hitType = this.hitTest(evt.canvasPos);
    }
    /**
     * 每次mouseUp时，将_hitType清空为NONE
     * @param evt 
     */
    public onMouseUp(evt: CanvasMouseEvent): void {
        this._hitType = ECurveHitType.NONE;
    }
    /**
     * 如果有选中的控制点，则处理相应的点拖拽事件
     * 子类CubicBezierCurve需要override这个事件检测函数，需要增加CONTROL_POINT1的处理代码
     * @param evt 
     * @returns 
     */
    public onMouseMove(evt: CanvasMouseEvent): void {
        if (this._hitType === ECurveHitType.NONE) return;
        switch (this._hitType) {
            case ECurveHitType.CONTROL_POINT0:
                // 更新控制点的位置
                this._controlPoint0.x = evt.canvasPos.x;
                this._controlPoint0.y = evt.canvasPos.y;
                this._dirty = true;
                // 标记_dirty，需要在update时重新计算插值点
                break;

            case ECurveHitType.START_POINT:
                this._startAnchorPoint.x = evt.canvasPos.x;
                this._startAnchorPoint.y = evt.canvasPos.y;
                this._dirty = true;
                break;

            case ECurveHitType.END_POINT:
                this._endAnchorPoint.x = evt.canvasPos.x;
                this._endAnchorPoint.y = evt.canvasPos.y;
                this._dirty = true;
                break;
        }
    }
    /**
     * 让动画回调中一直调用update函数，而update函数内部调用_calcDrawPoints方法，该方法会根据_dirty标记决定是否重新计算插值点
     * @param dt 
     */
    public update(dt: number): void {
        this._calcDrawPoints();
    }
}

export class CubeBezierCurve extends QuadraticBezierCurve {
    protected _controlPoint1: vec2;
    public constructor(start: vec2, control0: vec2, control1: vec2, end: vec2) {
        super(start, control0, end);
        this._controlPoint1 = control1;
        this._iter = Math2D.createCubicBezierEnumerator(start, control0, control1, end, this._drawSteps);
    }
    /**
     * 返回三次贝塞尔曲线 t = [ 0 , 1 ]之间的位置向量
     * @param t 
     * @returns 
     */
    protected getPosition(t: number): vec2 {
        if (t < 0 || t > 1.0) {
            throw new Error(" t的取值范围必须是[ 0 , 1 ]之间 ");
        }
        // 调用推导出来的三次贝塞尔多项式的向量版本
        return Math2D.getCubicBezierVector(this._startAnchorPoint, this._controlPoint0, this._controlPoint1, this._endAnchorPoint, t);
    }
    public draw(app: TestApplication, useMyCurveDrawFunc: boolean = true) {
        const ctx2D: CanvasRenderingContext2D | null = app.ctx2D;
        if (!ctx2D) return;

        ctx2D.save();
        // 设置线段的渲染属性
        ctx2D.lineWidth = this._lineWidth;
        ctx2D.strokeStyle = this._lineColor;

        // 三次贝塞尔曲线绘制的代码
        ctx2D.beginPath();
        ctx2D.moveTo(this._startAnchorPoint.x, this._startAnchorPoint.y);
        if (useMyCurveDrawFunc) {
            // 只需要将计算出来的插值点使用lineTo方法连接起来就能绘制出自己的曲线
            // 所以曲线的光滑度取决于drawSteps的数量，数量越多，越光滑
            for (let i = 1; i < this._points.length; i++) {
                ctx2D.lineTo(this._points[i].x, this._points[i].y);
            }
        } else {
            ctx2D.bezierCurveTo(this._controlPoint0.x, this._controlPoint0.y, this._controlPoint1.x, this._controlPoint1.y, this._endAnchorPoint.x, this._endAnchorPoint.y);
        }
        ctx2D.stroke();

        // 增加显示已经计算出来的所有插值点
        if (this._showCurvePt) {
            for (let i = 0; i < this._points.length; i++) {
                app.fillCircle(this._points[i].x, this._points[i].y, 2, 'yellow');
            }
        }

        // 绘制辅助的信息
        if (this._drawLine) {
            // 绘制起点p0到控制点p1的连线
            app.strokeLine(this._startAnchorPoint.x, this._startAnchorPoint.y, this._controlPoint0.x, this._controlPoint0.y);
            // 绘制终点p2到控制点p1的连线
            app.strokeLine(this._endAnchorPoint.x, this._endAnchorPoint.y, this._controlPoint0.x, this._controlPoint0.y);
            // 绘制起点p0到控制点p2的连线
            app.strokeLine(this._startAnchorPoint.x, this._startAnchorPoint.y, this._controlPoint1.x, this._controlPoint1.y);
            // 绘制终点p2到控制点p3的连线
            app.strokeLine(this._controlPoint1.x, this._controlPoint1.y, this._endAnchorPoint.x, this._endAnchorPoint.y);

            // 绘制绿色的正方形表示起点p0
            app.fillRect(
                this._startAnchorPoint.x - (this._radiusOrLen + 5) * 0.5,
                this._startAnchorPoint.y - (this._radiusOrLen + 5) * 0.5,
                this._radiusOrLen + 5,
                this._radiusOrLen + 5,
                'green'
            );
            // 绘制蓝色的正方形表示终点p2
            app.fillRect(
                this._endAnchorPoint.x - (this._radiusOrLen + 5) * 0.5,
                this._endAnchorPoint.y - (this._radiusOrLen + 5) * 0.5,
                this._radiusOrLen + 5,
                this._radiusOrLen + 5,
                'blue'
            );
            // 绘制红色的原点表示控制点p1
            app.fillCircle(this._controlPoint0.x, this._controlPoint0.y, this._radiusOrLen, 'red');
            app.fillCircle(this._controlPoint1.x, this._controlPoint1.y, this._radiusOrLen, 'red');
        }

        // 绘制三个点的坐标信息，显示出当前p0、p1和p2的坐标信息
        // 有override vec2的toString方法
        app.drawCoordInfo('p0:' + this._startAnchorPoint.toString(), this._startAnchorPoint.x, this._startAnchorPoint.y - 10);
        app.drawCoordInfo('p1:' + this._controlPoint0.toString(), this._controlPoint0.x, this._controlPoint0.y - 10);
        app.drawCoordInfo('p2:' + this._controlPoint1.toString(), this._controlPoint1.x, this._controlPoint1.y - 10);
        app.drawCoordInfo('p3:' + this._endAnchorPoint.toString(), this._endAnchorPoint.x, this._endAnchorPoint.y - 10);
        ctx2D.restore();
    }
    /**
     * 鼠标是否在起点、终点、控制点上
     * @param pt 
     * @returns 
     */
    protected hitTest(pt: vec2): ECurveHitType {
        if (Math2D.isPointInCircle(pt, this._controlPoint0, this._radiusOrLen)) {
            // 选中控制点0
            return ECurveHitType.CONTROL_POINT0;
        } else if (Math2D.isPointInCircle(pt, this._controlPoint1, this._radiusOrLen)) {
            // 选中控制点1
            return ECurveHitType.CONTROL_POINT1;
        } else if (Math2D.isPointInRect(pt.x, pt.y, this._startAnchorPoint.x - (this._radiusOrLen + 5) * 0.5, this._startAnchorPoint.y - (this._radiusOrLen + 5) * 0.5, this._radiusOrLen + 5, this._radiusOrLen + 5)) {
            // 选中起点
            return ECurveHitType.START_POINT;
        } else if (Math2D.isPointInRect(pt.x, pt.y, this._endAnchorPoint.x - (this._radiusOrLen + 5) * 0.5, this._endAnchorPoint.y - (this._radiusOrLen + 5) * 0.5, this._radiusOrLen + 5, this._radiusOrLen + 5)) {
            // 选中终点
            return ECurveHitType.END_POINT;
        } else {
            // 什么都没选中
            return ECurveHitType.NONE;
        }
    }
    /**
     * 如果有选中的控制点，则处理相应的点拖拽事件
     * 子类CubicBezierCurve需要override这个事件检测函数，需要增加CONTROL_POINT1的处理代码
     * @param evt 
     * @returns 
     */
    public onMouseMove(evt: CanvasMouseEvent): void {
        if (this._hitType === ECurveHitType.NONE) return;
        switch (this._hitType) {
            case ECurveHitType.CONTROL_POINT0:
                // 更新控制点的位置
                this._controlPoint0.x = evt.canvasPos.x;
                this._controlPoint0.y = evt.canvasPos.y;
                this._dirty = true;
                // 标记_dirty，需要在update时重新计算插值点
                break;

            case ECurveHitType.CONTROL_POINT1:
                // 更新控制点的位置
                this._controlPoint1.x = evt.canvasPos.x;
                this._controlPoint1.y = evt.canvasPos.y;
                this._dirty = true;
                // 标记_dirty，需要在update时重新计算插值点
                break;

            case ECurveHitType.START_POINT:
                this._startAnchorPoint.x = evt.canvasPos.x;
                this._startAnchorPoint.y = evt.canvasPos.y;
                this._dirty = true;
                break;

            case ECurveHitType.END_POINT:
                this._endAnchorPoint.x = evt.canvasPos.x;
                this._endAnchorPoint.y = evt.canvasPos.y;
                this._dirty = true;
                break;
        }
    }
}

export interface IEnumerator<T> {
    reset(): void;
    moveNext(): boolean;
    readonly current: T | undefined;
}
export interface IEnumerable<T> {
    getEnumerator(): IEnumerator<T>;
}
export interface IBezierEnumerator extends IEnumerator<vec2> {
    steps: number;
}

/**
 * BezierEnumerator类根据构造函数是否有control2，来判断当前是二次还是三次贝塞尔曲线，用迭代器模式
 */
export class BezierEnumerator implements IBezierEnumerator {
    private _steps: number;
    // 1.0 / (this . _steps)，表示每次t的增量在[0 , 1]之间
    private _i: number;
    private _startAnchorPoint: vec2;
    private _endAnchorPoint: vec2;
    private _controlPoint0: vec2;
    //如果_controlPoint1不为null，则说明是三次贝塞尔曲线
    private _controlPoint1: vec2 | null;
    // 用来标明当前迭代到哪一步
    private _currentIdx: number;

    public constructor(start: vec2, end: vec2, control0: vec2, control1: vec2 | null = null, steps: number = 30) {
        this._startAnchorPoint = start;
        this._endAnchorPoint = end;
        this._controlPoint0 = control0;
        this._controlPoint1 = control1;
        this._steps = steps;
        this._i = 1.0 / (this._steps);
        this._currentIdx = -1;
    }

    public reset(): void {
        this._currentIdx = -1;
    }
    public get current(): vec2 {
        // 通过this._currentIdx * this._i计算出当前的t的数值
        if (this._controlPoint1) {  //调用三次贝塞尔求值函数
            return Math2D.getCubicBezierVector(this._startAnchorPoint, this._controlPoint0, this._controlPoint1, this._endAnchorPoint, this._currentIdx * this._i);
        } else { // 调用二次贝塞尔求值函数
            return Math2D.getQuadraticBezierVector(this._startAnchorPoint, this._controlPoint0, this._endAnchorPoint, this._currentIdx * this._i);
        }
    }

    public moveNext(): boolean {
        this._currentIdx++;
        return this._currentIdx < this._steps;
    }
    public get steps(): number {
        this._i = 1.0 / (this._steps);
        return this._steps;
    }

    // 当每次设置steps后，都需要重新计算所有的插值点
    public set steps(steps: number) {
        this._steps = steps;
        this.reset();
    }
}

