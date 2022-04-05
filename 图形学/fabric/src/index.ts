import { Observable } from './Observable';
import { Util, Offset } from './Misc';
import { FabricObject, Rect } from './FabricObject';
class Canvas extends Observable {
    static activeInstance: Canvas;
    public wrapperEl: HTMLElement;
    public lowerCanvasEl: HTMLCanvasElement;
    public upperCanvasEl: HTMLCanvasElement;
    public cacheCanvasEl: HTMLCanvasElement;
    /** 上层画布环境 */
    public contextTop: CanvasRenderingContext2D;
    /** 下层画布环境 */
    public contextContainer: CanvasRenderingContext2D;
    /** 缓冲层画布环境 */
    public contextCache: CanvasRenderingContext2D;
    public containerClass: string = 'canvas-container';
    public width: number;
    public height: number;
    public interactive: boolean = true;
    public stateful: boolean = true;
    public renderOnAddition: boolean = true;
    public backgroundColor;
    public selection: boolean = true;
    public controlsAboveOverlay: boolean = false;
    public lastRenderedObjectWithControlsAboveOverlay;
    private _objects: FabricObject[];
    private _offset: Offset;
    constructor(el: HTMLCanvasElement, options) {
        super();
        // 初始化 _objects、lower-canvas 宽高、options 赋值
        this._initStatic(el, options);
        // 初始化交互层，也就是 upper-canvas
        this._initInteractive();
        this._createCacheCanvas();
        Canvas.activeInstance = this;
    }
    _initStatic(el: HTMLCanvasElement, options) {
        this._objects = [];

        this._createLowerCanvas(el);
        this._initOptions(options);

        this.calcOffset();
    }
    _initOptions(options) {
        for (let prop in options) {
            this[prop] = options[prop];
        }

        this.width = +this.lowerCanvasEl.width || 0;
        this.height = +this.lowerCanvasEl.height || 0;

        if (!this.lowerCanvasEl.style) return;

        this.lowerCanvasEl.style.width = this.width + 'px';
        this.lowerCanvasEl.style.height = this.height + 'px';
    }
    _initInteractive() {
        // this._currentTransform = null;
        // this._groupSelector = null;
        // this.freeDrawing = fabric.FreeDrawing && new fabric.FreeDrawing(this);
        this._initWrapperElement();
        this._createUpperCanvas();
        this._initEvents();
        this.calcOffset();
    }
    _initWrapperElement() {
        this.wrapperEl = Util.wrapElement(this.lowerCanvasEl, 'div', {
            class: this.containerClass,
        });
        Util.setStyle(this.wrapperEl, {
            width: this.width + 'px',
            height: this.height + 'px',
            position: 'relative',
        });
        // 设置 css 的 userSelect 样式为 none
        Util.makeElementUnselectable(this.wrapperEl);
    }
    _createCacheCanvas() {
        this.cacheCanvasEl = Util.createCanvasElement();
        this.cacheCanvasEl.setAttribute('width', String(this.width));
        this.cacheCanvasEl.setAttribute('height', String(this.height));
        this.contextCache = this.cacheCanvasEl.getContext('2d');
    }
    _createUpperCanvas() {
        this.upperCanvasEl = Util.createCanvasElement();
        this.upperCanvasEl.className = 'upper-canvas';

        this.wrapperEl.appendChild(this.upperCanvasEl);
        this._applyCanvasStyle(this.upperCanvasEl);
        this.contextTop = this.upperCanvasEl.getContext('2d');
    }
    _createLowerCanvas(el: HTMLCanvasElement) {
        this.lowerCanvasEl = el || Util.createCanvasElement();
        Util.addClass(this.lowerCanvasEl, 'lower-canvas');
        if (this.interactive) {
            this._applyCanvasStyle(this.lowerCanvasEl);
        }
        this.contextContainer = this.lowerCanvasEl.getContext('2d');
    }
    _applyCanvasStyle(el: HTMLCanvasElement) {
        let width = this.width || el.width;
        let height = this.height || el.height;
        Util.setStyle(el, {
            position: 'absolute',
            width: width + 'px',
            height: height + 'px',
            left: 0,
            top: 0,
        });
        el.width = width;
        el.height = height;
        Util.makeElementUnselectable(el);
    }
    _initEvents() {
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onResize = this._onResize.bind(this);

        Util.addListener(window, 'resize', this._onResize);
        Util.addListener(this.upperCanvasEl, 'mousedown', this._onMouseDown);
        Util.addListener(this.upperCanvasEl, 'mousemove', this._onMouseMove);
    }
    _onMouseDown(e: MouseEvent) {
        this.__onMouseDown(e);
        Util.addListener(document, 'mouseup', this._onMouseUp);
        Util.addListener(document, 'mousemove', this._onMouseMove);
        Util.removeListener(this.upperCanvasEl, 'mousemove', this._onMouseMove);
    }
    _onMouseMove(e: MouseEvent) {
        e.preventDefault && e.preventDefault();
        this.__onMouseMove(e);
    }
    _onMouseUp(e: MouseEvent) {
        this.__onMouseUp(e);
        Util.removeListener(document, 'mouseup', this._onMouseUp);
        Util.removeListener(document, 'mousemove', this._onMouseMove);
        Util.addListener(this.upperCanvasEl, 'mousemove', this._onMouseMove);
    }
    _onResize() {
        this.calcOffset();
    }
    __onMouseUp(e: MouseEvent) {
        let target;
        this.renderAll();

        this.fire('mouse:up', { target, e });
        target && target.fire('mouseup', { e: e });
    }
    __onMouseDown(e: MouseEvent) {
        let pointer, target;
        this.renderAll();
        this.fire('mouse:down', { target, e });
        target && target.fire('mousedown', { e });
    }
    __onMouseMove(e: MouseEvent) {
        let target, pointer;
        this.fire('mouse:move', { target, e });
        target && target.fire('mousemove', { e });
    }
    renderAll(allOnTop: boolean = false): Canvas {
        let canvasToDrawOn = this[allOnTop === true && this.interactive ? 'contextTop' : 'contextContainer'];

        if (this.contextTop && this.selection) {
            this.clearContext(this.contextTop);
        }

        if (!allOnTop) {
            this.clearContext(canvasToDrawOn);
        }

        this.fire('before:render');

        if (this.backgroundColor) {
            canvasToDrawOn.fillStyle = this.backgroundColor;
            canvasToDrawOn.fillRect(0, 0, this.width, this.height);
        }

        let activeGroup = this.getActiveGroup();
        for (let i = 0, length = this._objects.length; i < length; ++i) {
            if (!activeGroup || (activeGroup && this._objects[i] && !activeGroup.contains(this._objects[i]))) {
                this._draw(canvasToDrawOn, this._objects[i]);
            }
        }

        // delegate rendering to group selection (if one exists)
        if (activeGroup) {
            //Store objects in group preserving order, then replace
            let sortedObjects = [];
            this.forEachObject((object) => {
                if (activeGroup.contains(object)) {
                    sortedObjects.push(object);
                }
            });
            activeGroup._set('objects', sortedObjects);
            this._draw(canvasToDrawOn, activeGroup);
        }

        if (this.controlsAboveOverlay) {
            this.drawControls(canvasToDrawOn);
        }

        this.fire('after:render');

        return this;
    }
    forEachObject(callback: Function) {
        let objects = this._objects,
            i = objects.length;
        while (i--) {
            callback.call(this, objects[i], i, objects);
        }
    }
    getActiveGroup() {
        return null;
    }
    drawControls(ctx: CanvasRenderingContext2D) {
        let activeGroup = this.getActiveGroup();
        if (activeGroup) {
            // ctx.save();
            // Group.prototype.transform.call(activeGroup, ctx);
            // activeGroup.drawBorders(ctx).drawControls(ctx);
            // ctx.restore();
        } else {
            for (let i = 0, len = this._objects.length; i < len; ++i) {
                if (!this._objects[i] || !this._objects[i].active) continue;

                ctx.save();
                FabricObject.prototype.transform.call(this._objects[i], ctx);
                this._objects[i].drawBorders(ctx).drawControls(ctx);
                ctx.restore();

                this.lastRenderedObjectWithControlsAboveOverlay = this._objects[i];
            }
        }
    }
    _draw(ctx: CanvasRenderingContext2D, object: FabricObject) {
        if (!object) return;

        if (this.controlsAboveOverlay) {
            let hasBorders = object.hasBorders,
                hasControls = object.hasControls;
            object.hasBorders = object.hasControls = false;
            object.render(ctx);
            object.hasBorders = hasBorders;
            object.hasControls = hasControls;
        } else {
            object.render(ctx);
        }
    }
    calcOffset(): Canvas {
        this._offset = Util.getElementOffset(this.lowerCanvasEl);
        return this;
    }
    add() {
        this._objects.push.apply(this._objects, arguments);
        for (let i = arguments.length; i--; ) {
            this._initObject(arguments[i]);
        }
        this.renderOnAddition && this.renderAll();
        return this;
    }
    _initObject(obj: FabricObject) {
        this.stateful && obj.setupState();
        obj.setCoords();
        obj.canvas = this;
        this.fire('object:added', { target: obj });
        obj.fire('added');
    }
    clearContext(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }
    clear() {}
    dispose() {
        this.clear();
        if (this.interactive) {
            Util.removeListener(this.upperCanvasEl, 'mousedown', this._onMouseDown);
            Util.removeListener(this.upperCanvasEl, 'mousemove', this._onMouseMove);
            Util.removeListener(window, 'resize', this._onResize);
        }
        return this;
    }
}

export class fabric {
    static Canvas = Canvas;
    static FabricObject = FabricObject;
    static Rect = Rect;
}
