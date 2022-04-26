import { FabricObject } from './FabricObject';

export interface Offset {
    top: number;
    left: number;
}
/** 每个控制点又有自己的小正方形 */
export interface Coord {
    x: number;
    y: number;
    corner?: Corner;
}
export interface Pos {
    x: number;
    y: number;
}

export interface Corner {
    tl: Pos;
    tr: Pos;
    br: Pos;
    bl: Pos;
}
export interface Coords {
    /** 左上控制点 */
    tl: Coord;
    /** 右上控制点 */
    tr: Coord;
    /** 右下控制点 */
    br: Coord;
    /** 左下控制点 */
    bl: Coord;
    /** 左中控制点 */
    ml: Coord;
    /** 上中控制点 */
    mt: Coord;
    /** 右中控制点 */
    mr: Coord;
    /** 下中控制点 */
    mb: Coord;
    /** 上中旋转控制点 */
    mtr: Coord;
}

/** 选区的起点和终点，两点构成了一个矩形 */
export interface GroupSelector {
    /** 起始点的坐标 x */
    ex: number;
    /** 起始点的坐标 y */
    ey: number;
    /** 终点的坐标 x */
    top: number;
    /** 终点的坐标 y */
    left: number;
}

export interface Transform {
    angle: number;
    scaleX: number;
    scaleY: number;
    skewX: number;
    skewY: number;
    translateX: number;
    translateY: number;
}

export interface CurrentTransform {
    target: FabricObject;
    /** 当前操作：拖拽 | 旋转 | 缩放 | 拉伸 */
    action: string;
    currentAction?: string;
    /** 物体缩放值 x */
    scaleX: number;
    /** 物体缩放值 y */
    scaleY: number;
    /** 画布偏移 x */
    offsetX: number;
    /** 画布偏移 y */
    offsetY: number;
    /** 物体变换基点 originX */
    originX: string;
    /** 物体变换基点 originY */
    originY: string;
    /** 鼠标点击坐标 ex */
    ex: number;
    /** 鼠标点击坐标 ey */
    ey: number;
    /** 物体参考中心 left */
    left: number;
    /** 物体参考中心 top */
    top: number;
    /** 物体旋转弧度 */
    theta: number;
    /** 物体宽度，需要乘以缩放值 */
    width: number;
    /** x 轴方向拉伸的标志 */
    mouseXSign: number;
    /** y 轴方向拉伸的标志 */
    mouseYSign: number;
    /** 原始的变换 */
    original?: any;
}

export interface IAnimationOption {
    /** 动画初始值 */
    from?: number;
    /** 动画属性初始值 */
    startValue?: number;
    /** 动画相对变化值 */
    byValue?: number;
    /** 动画相对变化值 */
    by?: number;
    /** 动画属性最终值 */
    endValue?: number;
    /** 动画属性最终值 */
    to?: number;
    /** 动画一开始的回调 */
    onStart?: Function;
    /** 属性值改变都会进行的回调 */
    onChange?: Function;
    /** 属性值变化完成进行的回调 */
    onComplete?: Function;
    /** 缓动函数 */
    easing?: Function;
    /** 执行时间 ms */
    duration?: number;
    abort?: Function;
}
