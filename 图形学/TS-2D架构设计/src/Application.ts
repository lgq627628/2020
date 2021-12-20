import { CnavasKeyboardEvent, CnavasMouseEvent } from './CnavasInputEvent.ts';
import { v2 } from './v2.ts';
/**
 * 控制主循环
 * 分发事件
 * 将不变的部分（更新和渲染的流程）封装起来放在基类中，也就是基类固定了整个行为规范
 * 多态：将可变部分以虚函数的方式公开给具体实现者，基类并不知道每个子类要如何更新，也不知道每个子类如何渲染
 */
export class Application implements EventListenerObject {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D | null;
    protected isStart: boolean = false;
    // raf 返回的 id 都是大于 0 的
    protected rafId: number = -1;
    // 基于时间的物理更新，! 表示可以延迟赋值
    protected startTIme!: number;
    protected lastTime!: number;
    // 当前帧率
    protected fps !: number;
    // 事件相关
    public isSupportMouseMove: boolean;
    // 用来判断拖拽
    public isMouseDown: boolean;
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
        this.ctx = this.canvas.getContext('2d');
        if (this.ctx) {
            this.ctx.fillStyle = 'lightgreen';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    start() {
        if (this.isStart) return;
        this.isStart = true;
        this.rafId = -1;
        this.startTIme = -1;
        this.lastTime = -1;
        this.rafId = requestAnimationFrame(this.step.bind(this));
    }
    stop() {
        if (!this.isStart) return;
        cancelAnimationFrame(this.rafId);
        this.rafId = -1;
        this.lastTime = -1;
        this.startTIme = -1;
        this.isStart = false;
    }
    // 子类在这里写更新逻辑
    update(dt: number, passingTime: number) {
    }
    // 子类可以在这里写渲染逻辑
    render() {

    }
    showFPS(): number {
        return this.fps;
    }
    isRunning(): boolean {
        return this.isStart;
    }
    step(timestamp: number) {
        if (this.startTIme < 0) this.startTIme = timestamp;
        if (this.lastTime < 0) this.lastTime = timestamp;
        // 流逝的时间
        const passingTime: number = timestamp - this.startTIme;
        // 两帧间隔时间差
        const dt: number = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.fps = ~~(1000 / dt);
        // 先在 update 里面更新数据
        this.update(dt, passingTime);
        // 再渲染
        this.render();
        this.rafId = requestAnimationFrame(this.step.bind(this))
    }
    // 坐标转换，以 canvas 左上角为原点。注意：canvas 的 border 和 padding 会影响坐标的值
    private viewportToCanvasCoords(e: MouseEvent): v2 {
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
        return new v2(x, y);
    }
    // 将 dom 事件转换为自定义的 canvas 事件
    private toCanvasMouseEvent(e: Event): CnavasMouseEvent {
        // 向下转型
        const event: MouseEvent = e as MouseEvent;
        const mousePos = this.viewportToCanvasCoords(event);
        const canvasMouseEvent: CnavasMouseEvent = new CnavasMouseEvent(this.canvas, mousePos, event.button, event.altKey, event.ctrlKey, event.shiftKey);
        return canvasMouseEvent;
    }
    private toCanvasKeyBoardEvent(e: Event): CnavasKeyboardEvent {
        // 向下转型
        const event: KeyboardEvent = e as KeyboardEvent;
        const cnavasKeyboardEvent: CnavasKeyboardEvent = new CnavasKeyboardEvent(event.key, event.code, event.repeat, event.altKey, event.ctrlKey, event.shiftKey);
        return cnavasKeyboardEvent;
    }
    public handleEvent(e: Event): void {
        switch (e.type) {
            case 'mousedown':
                this.isMouseDown = true;
                this.dispatchMouseDown(this.toCanvasMouseEvent(e));
                break;
            case 'mouseup':
                this.isMouseDown = false;
                this.dispatchMouseUp(this.toCanvasMouseEvent(e));
                break;
            case 'mousemove':
                if (this.isSupportMouseMove) this.dispatchMouseMove(this.toCanvasMouseEvent(e));
                if (this.isMouseDown) this.dispatchMouseDrag(this.toCanvasMouseEvent(e));
                break;
            case 'keypress':
                this.dispatchKeyPress(this.toCanvasKeyBoardEvent(e));
                break;
            case 'keyup':
                this.dispatchKeyUp(this.toCanvasKeyBoardEvent(e));
                break;
            case 'keydown':
                this.dispatchKeyDown(this.toCanvasKeyBoardEvent(e));
                break;
        }
    }
    protected dispatchMouseDown(e: CnavasMouseEvent){}
    protected dispatchMouseUp(e: CnavasMouseEvent){}
    protected dispatchMouseMove(e: CnavasMouseEvent){}
    protected dispatchMouseDrag(e: CnavasMouseEvent){}
    protected dispatchKeyPress(e: CnavasKeyboardEvent){}
    protected dispatchKeyUp(e: CnavasKeyboardEvent){}
    protected dispatchKeyDown(e: CnavasKeyboardEvent){}
}

// 获取 2d 渲染上下文对象，具体渲染由子类继承实现
export class Canvas2DApplication extends Application {
    public ctx2D: CanvasRenderingContext2D | null;
    constructor(canvas: HTMLCanvasElement, opts: CanvasRenderingContext2DSettings) {
        super(canvas);
        this.ctx2D = this.canvas.getContext('2d', opts);
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