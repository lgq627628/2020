export type TimerCallback = (id: number, data: any) => void;
// Timer 不需要暴露给外部，外部通过 id 来操作 Timer 类即可
export class Timer {
    public id: number = -1;
    public enabled: boolean = false;
    public calllback: TimerCallback; 
    public calllbackData: any = undefined;
    public countdown: number = 0;
    // timeout 就是 setinterval、setTimeout 的毫秒数
    public timeout: number = 0;
    public onlyOnce: boolean = false;
    constructor(calllback: TimerCallback) {
        this.calllback = calllback;
    }
}