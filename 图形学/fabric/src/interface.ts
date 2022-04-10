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
