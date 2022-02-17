import { CanvasKeyboardEvent, CanvasMouseEvent, EInputEventType } from './CnavasInputEvent';
import { vec2 } from './math2D';
import { Timer, TimerCallback } from './Timer';
/**
 * 控制主循环
 * 基于时间的更新和重绘
 * 分发事件
 * 计时器功能，应对不用频繁渲染的情况
 * 将不变的部分（更新和渲染的流程）封装起来放在基类中，也就是基类固定了整个行为规范
 * 多态：将可变部分以虚函数的方式公开给具体实现者，基类并不知道每个子类要如何更新，也不知道每个子类如何渲染
 */
export class Application implements EventListenerObject {
    public canvas: HTMLCanvasElement;
    protected isStart: boolean = false;
    // raf 返回的 id 都是大于 0 的
    protected rafId: number = -1;
    // 基于时间的物理更新，! 表示可以延迟赋值
    protected startTime!: number;
    protected lastTime!: number;
    // 当前帧率，这个其实和屏幕刷新频率一致
    protected _fps !: number;
    // 事件相关
    public isSupportMouseMove: boolean;
    // 用来判断拖拽
    public isMouseDown: boolean;
    public timers: Timer[] = [];
    private _timeId: number = -1;
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.isMouseDown = false;
        this.isSupportMouseMove = false;
        // 添加鼠标事件，listener 必须是一个实现了 EventListener 接口的对象（也就是包含 handleEvent 方法的对象，所以第二个参数可以传 this），或者是一个函数
        this.canvas.addEventListener('mousedown', this, false);
        this.canvas.addEventListener('mouseup', this, false);
        this.canvas.addEventListener('mousemove', this, false);
        // 键盘事件不能在 canvas 中触发，但是可以在 window 对象中触发
        window.addEventListener('keypress', this, false);
        window.addEventListener('keyup', this, false);
        window.addEventListener('keydown', this, false);
    }
    start() {
        if (this.isStart) return;
        this.isStart = true;
        this.rafId = -1;
        this.startTime = -1;
        this.lastTime = -1;
        this.rafId = requestAnimationFrame(this.step.bind(this));
    }
    stop() {
        if (!this.isStart) return;
        cancelAnimationFrame(this.rafId);
        this.rafId = -1;
        this.lastTime = -1;
        this.startTime = -1;
        this.isStart = false;
    }
    // 子类在这里写更新逻辑，注意单位是 ms
    update(dt: number, passingTime: number) {
    }
    // 子类可以在这里写渲染逻辑
    render() {

    }
    get fps(): number {
        return this._fps;
    }
    isRunning(): boolean {
        return this.isStart;
    }
    // 基于时间的更新和重绘
    step(timestamp: number) {
        if (this.startTime < 0) this.startTime = timestamp;
        if (this.lastTime < 0) this.lastTime = timestamp;
        // 流逝的时间
        const passingTime: number = timestamp - this.startTime;
        // 两帧间隔时间差
        const dt: number = timestamp - this.lastTime;
        this.lastTime = timestamp;
        if (dt !== 0) this._fps = ~~(1000 / dt);
        // 处理定时器，也可以放在 update 中
        this._handleTimers(dt);
        // 先在 update 里面更新数据
        this.update(dt, passingTime);
        // 再渲染
        this.render();
        this.rafId = requestAnimationFrame(this.step.bind(this));
    }
    // 坐标转换，以 canvas 左上角为原点。注意：canvas 的 border 和 padding 会影响坐标的值
    private viewportToCanvasCoords(e: MouseEvent): vec2 {
        if (!this.canvas) throw new Error('canvas 不能为空');
        const { clientX, clientY, target } = e;
        if (!target) throw new Error('点击事件的 target 为空');
        const rect: DOMRect = this.canvas.getBoundingClientRect();
        // getComputedStyle 返回的值都是字符串，但可能为 null，并且有单位
        const style = window.getComputedStyle(target as HTMLElement);
        let borderLeftWidth: number = 0;
        let borderTopWidth: number = 0;
        let paddingLeft: number = 0;
        let paddingTop: number = 0;
        let strNumber: string | null = style.borderLeftWidth;
        if (strNumber !== null) borderLeftWidth = parseInt(strNumber, 10);
        strNumber = style.borderTopWidth;
        if (strNumber !== null) borderTopWidth = parseInt(strNumber, 10);
        strNumber = style.paddingLeft;
        if (strNumber !== null) paddingLeft = parseInt(strNumber, 10);
        strNumber = style.paddingTop;
        if (strNumber !== null) paddingTop = parseInt(strNumber, 10);

        const x: number = clientX - rect.left - borderLeftWidth - paddingLeft;
        const y: number = clientY - rect.top - borderTopWidth - paddingTop;
        return vec2.create(x, y);
    }
    // 将 dom 事件转换为自定义的 canvas 事件
    private toCanvasMouseEvent(e: Event, type: EInputEventType): CanvasMouseEvent {
        // 向下转型
        const event: MouseEvent = e as MouseEvent;
        const mousePos = this.viewportToCanvasCoords(event);
        const canvasMouseEvent: CanvasMouseEvent = new CanvasMouseEvent(this.canvas, mousePos, event.button, event.altKey, event.ctrlKey, event.shiftKey, type);
        return canvasMouseEvent;
    }
    private toCanvasKeyBoardEvent(e: Event, type: EInputEventType): CanvasKeyboardEvent {
        // 向下转型
        const event: KeyboardEvent = e as KeyboardEvent;
        const canvasKeyboardEvent: CanvasKeyboardEvent = new CanvasKeyboardEvent(event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
        return canvasKeyboardEvent;
    }
    public handleEvent(e: Event): void {
        switch (e.type) {
            case 'mousedown':
                this.isMouseDown = true;
                this.dispatchMouseDown(this.toCanvasMouseEvent(e, EInputEventType.MOUSEDOWN));
                break;
            case 'mouseup':
                this.isMouseDown = false;
                this.dispatchMouseUp(this.toCanvasMouseEvent(e, EInputEventType.MOUSEUP));
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) this.dispatchMouseMove(this.toCanvasMouseEvent(e, EInputEventType.MOUSEMOVE));
                if (this.isMouseDown) this.dispatchMouseDrag(this.toCanvasMouseEvent(e, EInputEventType.MOUSEDOWN));
                break;
            case 'keypress':
                this.dispatchKeyPress(this.toCanvasKeyBoardEvent(e, EInputEventType.KEYPRESS));
                break;
            case 'keyup':
                this.dispatchKeyUp(this.toCanvasKeyBoardEvent(e, EInputEventType.KEYUP));
                break;
            case 'keydown':
                this.dispatchKeyDown(this.toCanvasKeyBoardEvent(e, EInputEventType.KEYDOWN));
                break;
        }
    }
    protected dispatchMouseDown(e: CanvasMouseEvent){}
    protected dispatchMouseUp(e: CanvasMouseEvent){}
    protected dispatchMouseMove(e: CanvasMouseEvent){}
    protected dispatchMouseDrag(e: CanvasMouseEvent){}
    protected dispatchKeyPress(e: CanvasKeyboardEvent){}
    protected dispatchKeyUp(e: CanvasKeyboardEvent){}
    protected dispatchKeyDown(e: CanvasKeyboardEvent){}
    public addTimer(calllback: TimerCallback, timeout: number = 1000, onlyOnce: boolean = false, data: any = undefined): number {
        let timer: Timer;
        const idx = this.timers.findIndex(timer => !timer.enabled);
        if (idx >= 0) {
            timer = this.timers[idx];
        } else {
            timer = new Timer(calllback);
        }
        timer.calllbackData = data;
        timer.timeout = timeout;
        timer.onlyOnce = onlyOnce;
        timer.enabled = true;
        timer.countdown = timeout;
        timer.id = ++this._timeId;
        this.timers.push(timer);
        return timer.id;
    }
    public removeTimer(id: number): boolean {
        const idx = this.timers.findIndex(timer => timer.id === id);
        if (idx >= 0) {
            // 仅仅是将 timer 的 enabled 值设置成 false，避免析构 Timer 的内存，也不会动态调整数组，下次需要新增可以重新利用，避免重新 new
            // 尽量让内存使用与运行效率达到相对平衡
            this.timers[idx].enabled = false;
            return true;
        }
        return false;
    }
    // 注意：只有 start 之后才会开始执行
    private _handleTimers(dt: number) {
        for(let i = 0; i < this.timers.length; i++) {
            const timer: Timer = this.timers[i];
            if (timer.enabled === false) continue;
            timer.countdown -= dt;
            // 实际上 timer 并不精确；比如每次 update 的时间是 160ms，timeout 设置 300ms 一次，则执行的时候是 300 - 320 < 0
            if (timer.countdown < 0) {
                timer.calllback(timer.id, timer.calllbackData);
                if (timer.onlyOnce) {
                    this.removeTimer(timer.id);
                } else {
                    timer.countdown = timer.timeout;
                }
            }
        }
    }
}

// 获取 2d 渲染上下文对象，具体渲染由子类继承实现
export class Canvas2DApplication extends Application {
    public ctx2D: CanvasRenderingContext2D | null;
    constructor(canvas: HTMLCanvasElement, opts?: CanvasRenderingContext2DSettings) {
        super(canvas);
        this.ctx2D = this.canvas.getContext('2d', opts);
        // this.adaptDPR();
    }
    // 根据 dpr 把 canvas 的 width、height 属性都放大，css 大小不变
    // canvas 会自己把画布缩小到适应 css 的大小，于是放大和缩小的效果就抵消了，这样做的原因是为了解决高清屏的模糊问题
    adaptDPR() {
        if (!this.ctx2D) return;
        const dpr = window.devicePixelRatio;
        const { width, height } = this.canvas;
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.canvas.style.width = width + 'px';
        this.canvas.style.height = height + 'px';
        this.ctx2D.scale(dpr, dpr);
    }
}

// 获取 3d 渲染上下文对象，具体渲染由子类继承实现
export class WebGLApplication extends Application {
    public ctx3D: WebGLRenderingContext | null;
    constructor(canvas: HTMLCanvasElement, opts: WebGLContextAttributes) {
        super(canvas);
        this.ctx3D = this.canvas.getContext('webgl', opts);
        if (!this.ctx3D) throw new Error('无法创建 webgl 上下文对象');
    }
}