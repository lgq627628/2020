export interface Offset {
    top: number;
    left: number;
}

export interface Bounding {
    minx: number;
    miny: number;
    maxx: number;
    maxy: number;
}

export interface AnimateOptions {
    onStart: Function;
    onChange: Function;
    onComplete: Function;
    startValue: number;
    endValue: number;
    byValue: number;
    easing: Function;
    duration: number;
    abort: Function;
}
