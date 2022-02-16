import { CanvasKeyboardEvent, CanvasMouseEvent } from "./CnavasInputEvent";
import { mat2d, vec2 } from "./math2D";

export enum ERenderType {
    CUSTOM, // 自定义
    STROKE, // 线框渲染模式
    FILL, // 填充模式
    STROKE_FILL, // 线框 + 填充模式
    CLIP, // 裁剪模式
}

export enum EImageFillType {
    NONE, // 没有任何效果
    STRETCH, // 拉伸模式
    REPEAT, // x 和 y 重复填充模式
    REPEAT_X, // x 方向重复填充模式
    REPEAT_Y, // y 方向重复填充模式
}

export enum EOrder {
    PREORDER,
    POSTORDER,
}

// 事件回调函数签名
export type UpdateEventHandler = (spr: ISprite, mesc: number, diffSec: number, travelOrder: EOrder) => void;
export type MouseEventHandler = (spr: ISprite, evt: CanvasMouseEvent) => void;
export type KeyboardEventHandler = (spr: ISprite, evt: CanvasKeyboardEvent) => void;
export type RenderEventHandler = (spr: ISprite, context: CanvasRenderingContext2D, renderOrder: EOrder) => void;

// Canvas2D中包括更多的渲染状态，例如是否虚线绘制，以及是否有阴影等，有需要自行添加
export interface IRenderState {
    isVisible: boolean; // 是否可见
    showCoordSystem: boolean; // 是否显示坐标系统
    lineWidth: number;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    renderType: ERenderType; // 渲染枚举类型
}

export interface ITransformable {
    x: number;
    y: number;
    rotation: number;
    scaleX: number;
    scaleY: number;

    getWorldMatrix(): mat2d; // 获取全局坐标系矩阵
    getLocalMatrix(): mat2d; // 获取局部坐标矩阵
}

// IDrawable 所有接口方法依赖 ITransformable、IRenderState 和 CanvasRenderingContext2D 这三个参数进行绘制
export interface IDrawable {
    // 用于 draw 之前的操作，例如 渲染状态进栈，设置各个渲染状态值及设置当前变换矩阵
    beginDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void;
    // 用户形体的绘制操作
    draw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void;
    // 绘制后的操作，例如渲染状态恢复操作等
    endDraw(transformable: ITransformable, state: IRenderState, context: CanvasRenderingContext2D): void;
}

// 用于点与 IShape 的精确碰撞检查操作
// 如果选中就返回 true，否则返回 false
export interface IHittable {
    // 参数 localPt 点是相对于 IShape 所在的坐标系对的偏移 offset
    // 这意味着 localPt = transform. getLocalMatrix * worldPt
    // 某系情况下可能需要获取 worldPt, 可以做如下操作
    // worldPt = transform.getWorldMatrix * localPt
    // 其中 * 表示 Math2D.transform 方法
    hitTest(localPt: vec2, transformable: ITransformable): boolean;
}

export interface IShape extends IDrawable, IHittable {
    readonly type: string; // 例如 Rect、Circle 等具有唯一性表示的字符串
    data: any;
}

// 接口可以扩展多个接口
// 而类只能扩展一个类
export interface ISprite extends ITransformable, IRenderState {
    name: string; // 当前精灵名称
    shape: IShape; // IShape 引用一个 IShape 接口， 如 draw 和 hitTest 都调用 IShape 对应的同名方法
    owner: ISpriteContainer; // 双向关联， 通过 owner 找到容器对象
    data: any; // 为了方便，有时需要添加一些不知道数据类型的额外数据
    hitTest(localPt: vec2): boolean; // 点选碰撞检测
    update(msec: number, diff: number, orer: EOrder): void; // 更新
    draw(context: CanvasRenderingContext2D): void; // 绘制

    // 事件处理
    mouseEvent: MouseEventHandler | null;
    keyEvent: KeyboardEventHandler | null;
    updateEvent: UpdateEventHandler | null;
    renderEvent: RenderEventHandler | null;
}

/**
 * 精灵系统数据结构定义
 */

export interface ISpriteContainer {
    name: string;
    // 添加一个精灵到容器中
    addSprite(sprite: ISprite): ISpriteContainer;
    // 从一容器中删除一个精灵
    removeSprite(sprite: ISprite): boolean;
    // 清空整个容器
    removeAll(includeThis: boolean): void;
    // 根据精灵获取索引号，如果没有精灵，返回 -1
    getSpriteIndex(sprite: ISprite): number;
    // 根据索引号，从容器中获取精灵
    getSprite(idx: number): ISprite;
    // 获取容器中精灵的数量
    getSpriteCount(): number;
}

// 进行事件、更新、绘制命令的分发接口
// 接受到分发命令的精灵都存储在 ISpriteContainer 容器中
export interface IDispatcher {
    // 只读的类型为 ISpriteContainer 的成员变量
    // 本接口中所有的 dispatch 开头的方法都是针对 ISpriteContainer 接口进行遍历操作
    readonly container: ISpriteContainer;
    // 遍历 ISpriteContainer 容器， 进行精灵的 update 分发
    dispatchUpdate(msec: number, diff: number): void;
    // 遍历 ISpriteContainer 容器， 进行精灵的 render 分发
    dispatchDraw(context: CanvasRenderingContext2D): void;
    // 遍历 ISpriteContainer 容器， 进行精灵的 鼠标事件 分发
    dispatchMouseEvent(evt: CanvasMouseEvent): void;
    // 遍历 ISpriteContainer 容器， 进行精灵的 键盘事件 分发
    dispatchKeyEvent(evt: CanvasKeyboardEvent): void;
}