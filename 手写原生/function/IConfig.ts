import { vec2 } from "./main";

export interface IConfig {
    /** x 轴最左边的值 */
    startX: number,
    /** x 轴右左边的值 */
    endX: number,
    xLength: number,
    yLength: number,
    startY: number,
    endY: number,
    steps: number,
    fontSize: number,
    scaleSteps: number
}

export interface IState {
    startPos: vec2 | null,
    endPos: vec2 | null,
    translateX: number,
    translateY: number,
    scale: number
}