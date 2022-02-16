import { Canvas2DApplication } from "./Application";
import { CanvasKeyboardEvent, CanvasMouseEvent } from "./CnavasInputEvent";
import { IDispatcher, ISpriteContainer } from "./ISprite";
import { Sprite2DManager } from "./Sprite2DManager";

export class Sprite2DApplication extends Canvas2DApplication {
    /**
     * 不断地通过 IDispatcher 分发更新、渲染命令，以及鼠标和键盘事件
     */
    protected _dispatcher: IDispatcher;

    public constructor(canvas: HTMLCanvasElement) {
        super(canvas);
        this._dispatcher = new Sprite2DManager();
    }

    // 一个方便的只读属性，返回ISpriteContainer容器接口
    // 可以通过该方法，和ISprite进行交互
    public get rootContainer(): ISpriteContainer {
        return this._dispatcher.container;
    }

    public update(msec: number, diff: number): void {
        this._dispatcher.dispatchUpdate(msec, diff);
    }
    public render(): void {
        if (this.ctx2D) {
            // 每次都先将整个画布内容清空
            this.ctx2D.clearRect(0, 0, this.ctx2D.canvas.width, this.ctx2D.canvas.height);
            this._dispatcher.dispatchDraw(this.ctx2D);
        }
    }

    protected dispatchMouseDown(evt: CanvasMouseEvent): void {
        // 调用基类的同名方法
        super.dispatchMouseDown(evt);
        // 事件分发
        this._dispatcher.dispatchMouseEvent(evt);
    }
    protected dispatchMouseUp(evt: CanvasMouseEvent): void {
        super.dispatchMouseUp(evt);
        this._dispatcher.dispatchMouseEvent(evt);
    }

    protected dispatchMouseMove(evt: CanvasMouseEvent): void {
        super.dispatchMouseMove(evt);
        this._dispatcher.dispatchMouseEvent(evt);
    }

    protected dispatchMouseDrag(evt: CanvasMouseEvent): void {
        super.dispatchMouseDrag(evt);
        this._dispatcher.dispatchMouseEvent(evt);
    }

    protected dispatchKeyDown(evt: CanvasKeyboardEvent): void {
        super.dispatchKeyDown(evt);
        this._dispatcher.dispatchKeyEvent(evt);
    }
    protected dispatchKeyUp(evt: CanvasKeyboardEvent): void {
        super.dispatchKeyUp(evt);
        this._dispatcher.dispatchKeyEvent(evt);
    }

    protected dispatchKeyPress(evt: CanvasKeyboardEvent): void {
        super.dispatchKeyPress(evt);
        this._dispatcher.dispatchKeyEvent(evt);
    }
}