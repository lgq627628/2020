import { vec2 } from './math2D';
export enum EInputEventType {
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
	// 基于canvas 坐标系的表示
    public canvasPos: vec2;
	// [ 0：鼠标左键 1：鼠标中键 2 ：鼠标右键 ]
    public button: number;
    // 临时坐标系
    public localPosition: vec2;
	public hasLocalPosition: boolean;
    constructor(canvas: HTMLCanvasElement, canvasPos: vec2, button: number, altKey: boolean = false, ctrlKey: boolean = false, shiftKey: boolean = false, type: EInputEventType) {
        super(altKey, ctrlKey, shiftKey, type);
        this.canvas = canvas;
        this.canvasPos = canvasPos;
        this.button = button;

        this.localPosition = vec2.create();
		this.hasLocalPosition = false;
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
        super(altKey, ctrlKey, shiftKey, type);
        this.key = key;
        this.code = code;
        this.repeat = repeat;
    }
}