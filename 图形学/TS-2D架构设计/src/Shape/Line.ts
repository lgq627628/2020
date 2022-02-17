import { IRenderState, IShape, ITransformable } from "../ISprite";
import { mat2d, Math2D, vec2 } from "../math2D";

// Line类直接实现了IShape接口，而其他类都是从BaseShape2D类继承而来的。这是因为在几何中，我们可以分为点、线、面、体等基础形体表示，其中我们设计的BaseShape2D类表示面的概念，其特点是第一个顶点和最后一个顶点重合，从而形成一个封闭性的面（能计算出面积），最小的面是三角形，需要3个顶点表示。而两点就可以确定一条直线了，与我们BaseShape2D类的设计目的不同
export class Line implements IShape {
    // 线段起点和终点
    public start: vec2;
    public end: vec2;
    public data: any;
    // t的取值范围在0～1之间，用来控制线段的原点位于线段上某一处
    public constructor(len: number = 10, t: number = 0) {
        if (t < 0.0 || t > 1.0) {
            alert("参数t必须处于 [ 0 , 1 ]之间！! ");
            throw new Error("参数t必须处于 [ 0 , 1 ]之间！! ");
        }
        this.start = vec2.create(-len * t, 0);
        this.end = vec2.create(len * (1.0 - t), 0);
        this.data = undefined;
    }
    // overide IHittable接口的hitTest方法
    public hitTest(localPt: vec2, transform: ITransformable): boolean {
        return Math2D.isPointOnLineSegment(localPt, this.start, this.end);
    }
    // 做3件事，画之前 + 画画 + 画之后
    public beginDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
        // 1. 渲染状态进栈
        context.save();
        // 2. 设置当前渲染状态
        context.lineWidth = state.lineWidth;
        context.strokeStyle = state.strokeStyle;
        // 3. 设置当前变换矩阵
        let mat: mat2d = transformable.getWorldMatrix();
        context.setTransform(mat.values[0], mat.values[1], mat.values[2], mat.values[3], mat.values[4], mat.values[5]);
    }
    public draw(transformable: ITransformable, state: IRenderState,context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.end.x, this.end.y);
        context.stroke();
    }
    // 恢复渲染状态堆栈
    public endDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void {
        context.restore();
    }
    //子类必须覆写（override）type属性，返回当前子类的实际类型
    public get type(): string {
        return 'Line';
    }
    // 通过两个点获得一条直线
    public static createLine(start: vec2, end: vec2): IShape {
        let line: Line = new Line();
        line.start = start;
        line.end = end;
        return line;
    }
    // 通过线段长度和[0 , 1]之间的t获得一条与x轴方向平行的、原点在该线段任意一点的直线
    public static createXLine(len: number = 10, t: number = 0): IShape {
        return new Line(len, t);
    }
}