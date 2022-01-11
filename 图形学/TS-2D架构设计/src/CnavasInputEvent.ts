import { vec2 } from './math2D';
enum EInputEventType {
    MOUSEEVENT,
    MOUSEDOWN,
    MOUSEUP,
    MOUSEMOVE,
    MOUSEDRAG,
    KEYBORADEVENT,
    KEYUP,
    KEYDOWN,
    KEYPRESS
}

export class CnavasInputEvent {
    public altKey: boolean;
    public ctrlKey: boolean;
    public shiftKey: boolean;
    // 当前事件类型
    public type: EInputEventType;
    constructor(altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false, type: EInputEventType = EInputEventType.MOUSEEVENT) {
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.type = type;
    }
}

export class CanvasMouseEvent extends CnavasInputEvent {
    public canvas: HTMLCanvasElement;
    public canvasPos: vec2;
    public button: number;
    constructor(canvas: HTMLCanvasElement, canvasPos: vec2, button: number, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false) {
        super(altKey, ctrlKey, shiftKey);
        this.canvas = canvas;
        this.canvasPos = canvasPos;
        this.button = button;
    }
}

export class CanvasKeyboardEvent extends CnavasInputEvent {
    // ASCII 字符
    public key: string;
    // ASCII 码，keyCode: number 已弃用，所以这里用 code，但是有兼容性问题
    public code: string;
    // 是否不停触发
    public repeat: boolean;
    constructor(key: string, code: string, repeat: boolean , altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false, type: EInputEventType = EInputEventType.KEYBORADEVENT) {
        super(altKey, ctrlKey, shiftKey);
        this.key = key;
        this.code = code;
        this.repeat = repeat;
    }
}