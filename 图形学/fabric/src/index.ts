import { Observable } from './Observable';
import { Util, Offset, Point } from './Misc';
import { FabricObject, Rect, Pos } from './FabricObject';

const STROKE_OFFSET = 0.5;
const cursorMap = {
    tr: 'ne-resize',
    br: 'se-resize',
    bl: 'sw-resize',
    tl: 'nw-resize',
    ml: 'w-resize',
    mt: 'n-resize',
    mr: 'e-resize',
    mb: 's-resize',
};
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
    /** 表示物体的状态是否需要保存 */
    public stateful: boolean = true;
    public renderOnAddition: boolean = true;
    public backgroundColor;
    public selection: boolean = true;
    public controlsAboveOverlay: boolean = false;
    public lastRenderedObjectWithControlsAboveOverlay;
    /** When true, objects can be transformed by one side (unproportionally) */
    public uniScaleTransform: boolean = false;
    public centerTransform;
    /** 检测物体的时候允许有几个像素的误差 */
    public targetFindTolerance: number = 0;
    /** 通过像素来检测物体而不是通过包围盒 */
    public perPixelTargetFind: boolean = false;
    public relatedTarget;
    public defaultCursor: string = 'default';
    public hoverCursor: string = 'move';
    public moveCursor: string = 'move';
    public rotationCursor: string = 'crosshair';
    private _currentTransform;
    private _activeObject;
    private _previousOriginX;
    /** 左键拖拽的选择框 */
    private _groupSelector;
    /** 选择框的背景颜色 */
    public selectionColor: string = 'rgba(100, 100, 255, 0.3)';
    /** 选择框的边框颜色 */
    public selectionBorderColor: string = 'rgba(255, 255, 255, 0.3)';
    /** 选择组或者物体的边框大小 */
    public selectionLineWidth: number = 1;
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
        this._currentTransform = null;
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
        var target;

        // if (this.isDrawingMode && this._isCurrentlyDrawing) {
        //   this.freeDrawing._finalizeAndAddPath();
        //   this.fire('mouse:up', { e: e });
        //   return;
        // }

        if (this._currentTransform) {
            var transform = this._currentTransform;

            target = transform.target;
            if (target._scaling) {
                target._scaling = false;
            }

            // determine the new coords everytime the image changes its position
            var i = this._objects.length;
            while (i--) {
                this._objects[i].setCoords();
            }

            target.isMoving = false;

            // only fire :modified event if target coordinates were changed during mousedown-mouseup
            if (this.stateful && target.hasStateChanged()) {
                this.fire('object:modified', { target: target });
                target.fire('modified');
            }

            if (this._previousOriginX) {
                this._currentTransform.target.adjustPosition(this._previousOriginX);
                this._previousOriginX = null;
            }
        }

        this._currentTransform = null;

        if (this._groupSelector) {
            // group selection was completed, determine its bounds
            this._findSelectedObjects(e);
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            activeGroup.setObjectsCoords();
            activeGroup.set('isMoving', false);
            this._setCursor(this.defaultCursor);
        }

        // clear selection
        this._groupSelector = null;
        this.renderAll();

        this._setCursorFromEvent(e, target);

        // fix for FF
        this._setCursor('');

        var _this = this;
        setTimeout(function () {
            _this._setCursorFromEvent(e, target);
        }, 50);

        if (target) {
            const { top, left, currentWidth, currentHeight, width, height, angle, scaleX, scaleY, originX, originY } = target;
            const obj = {
                top,
                left,
                currentWidth,
                currentHeight,
                width,
                height,
                angle,
                scaleX,
                scaleY,
                originX,
                originY,
            };
            console.log(JSON.stringify(obj, null, 4));
        }
        this.fire('mouse:up', { target, e });
        target && target.fire('mouseup', { e });
    }
    __onMouseDown(e: MouseEvent) {
        let pointer;
        // 只处理左键点击
        let isLeftClick = 'which' in e ? e.which === 1 : e.button === 1;
        if (!isLeftClick) return;

        // if (this.isDrawingMode) { // 如果是手绘涂鸦模式
        //     pointer = this.getPointer(e);
        //     this.freeDrawing._prepareForDrawing(pointer);

        //     // capture coordinates immediately;
        //     // this allows to draw dots (when movement never occurs)
        //     this.freeDrawing._captureDrawingPath(pointer);

        //     this.fire('mouse:down', { e: e });
        //     return;
        // }

        // ignore if some object is being transformed at this moment
        if (this._currentTransform) return;

        let target = this.findTarget(e),
            corner;
        pointer = this.getPointer(e);

        if (this._shouldClearSelection(e)) {
            this._groupSelector = {
                ex: pointer.x,
                ey: pointer.y,
                top: 0,
                left: 0,
            };
            this.deactivateAllWithDispatch();
        } else {
            // 如果是拖拽或旋转
            this.stateful && target.saveState();

            if ((corner = target._findTargetCorner(e, this._offset))) {
                this.onBeforeScaleRotate(target);
            }
            if (this._shouldHandleGroupLogic(e, target)) {
                this._handleGroupLogic(e, target);
                target = this.getActiveGroup();
            } else {
                if (target !== this.getActiveGroup()) {
                    this.deactivateAll();
                }
                this.setActiveObject(target, e);
            }

            this._setupCurrentTransform(e, target);
        }
        // 我们必须重新渲染把当前激活的物体置于上层画布
        this.renderAll();

        this.fire('mouse:down', { target, e });
        target && target.fire('mousedown', { e });

        if (corner === 'mtr') {
            // 如果点击的是上方的控制点，也就是旋转操作
            this._previousOriginX = this._currentTransform.target.originX;
            this._currentTransform.target.adjustPosition('center');
            this._currentTransform.left = this._currentTransform.target.left;
            this._currentTransform.top = this._currentTransform.target.top;
        }
    }
    /** 处理鼠标 hover 事件
     * 如果是涂鸦模式，只绘制 upper-canvas
     * 如果是图片变换，只有 upper-canvas 会被渲染 */
    __onMouseMove(e: MouseEvent) {
        let target, pointer;

        // if (this.isDrawingMode) {
        //   if (this._isCurrentlyDrawing) {
        //     pointer = this.getPointer(e);
        //     this.freeDrawing._captureDrawingPath(pointer);

        //     // redraw curve
        //     // clear top canvas
        //     this.clearContext(this.contextTop);
        //     this.freeDrawing._render(this.contextTop);
        //   }
        //   this.upperCanvasEl.style.cursor = this.freeDrawingCursor;
        //   this.fire('mouse:move', { e: e });
        //   return;
        // }

        var groupSelector = this._groupSelector;

        if (groupSelector) {
            // 如果是拖拽框选
            pointer = Util.getPointer(e, this.upperCanvasEl);

            groupSelector.left = pointer.x - this._offset.left - groupSelector.ex;
            groupSelector.top = pointer.y - this._offset.top - groupSelector.ey;
            this.renderTop();
        } else if (!this._currentTransform) {
            // 如果是 hover
            // 减少不必要的查找
            var style = this.upperCanvasEl.style;
            // 这里我们只改变鼠标样式并不会重新渲染
            target = this.findTarget(e);

            if (!target) {
                // image/text was hovered-out from, we remove its borders
                for (var i = this._objects.length; i--; ) {
                    if (this._objects[i] && !this._objects[i].active) {
                        this._objects[i].setActive(false);
                    }
                }
                style.cursor = this.defaultCursor;
            } else {
                this._setCursorFromEvent(e, target);
            }
        } else {
            // 如果是旋转、缩放、平移等操作
            pointer = Util.getPointer(e, this.upperCanvasEl);

            var x = pointer.x,
                y = pointer.y;

            this._currentTransform.target.isMoving = true;

            var t = this._currentTransform,
                reset = false;
            if (
                (t.action === 'scale' || t.action === 'scaleX' || t.action === 'scaleY') &&
                // Switch from a normal resize to center-based
                ((e.altKey && (t.originX !== 'center' || t.originY !== 'center')) ||
                    // Switch from center-based resize to normal one
                    (!e.altKey && t.originX === 'center' && t.originY === 'center'))
            ) {
                this._resetCurrentTransform(e);
                reset = true;
            }

            if (this._currentTransform.action === 'rotate') {
                this._rotateObject(x, y);

                this.fire('object:rotating', {
                    target: this._currentTransform.target,
                    e,
                });
                this._currentTransform.target.fire('rotating');
            } else if (this._currentTransform.action === 'scale') {
                if (e.shiftKey || this.uniScaleTransform) {
                    this._currentTransform.currentAction = 'scale';
                    this._scaleObject(x, y);
                } else {
                    if (!reset && t.currentAction === 'scale') {
                        // Switch from a normal resize to proportional
                        this._resetCurrentTransform(e);
                    }

                    this._currentTransform.currentAction = 'scaleEqually';
                    this._scaleObject(x, y, 'equally');
                }

                this.fire('object:scaling', {
                    target: this._currentTransform.target,
                    e,
                });
            } else if (this._currentTransform.action === 'scaleX') {
                this._scaleObject(x, y, 'x');

                this.fire('object:scaling', {
                    target: this._currentTransform.target,
                    e,
                });
                this._currentTransform.target.fire('scaling', { e });
            } else if (this._currentTransform.action === 'scaleY') {
                this._scaleObject(x, y, 'y');

                this.fire('object:scaling', {
                    target: this._currentTransform.target,
                    e,
                });
                this._currentTransform.target.fire('scaling', { e });
            } else {
                this._translateObject(x, y);

                this.fire('object:moving', {
                    target: this._currentTransform.target,
                    e: e,
                });

                this._setCursor(this.moveCursor);

                this._currentTransform.target.fire('moving', { e: e });
            }

            this.renderAll();
        }
        this.fire('mouse:move', { target, e });
        target && target.fire('mousemove', { e });
    }
    /** 使所有元素失活 */
    deactivateAllWithDispatch() {
        var activeObject = this.getActiveGroup() || this.getActiveObject();
        if (activeObject) {
            this.fire('before:selection:cleared', { target: activeObject });
        }
        this.deactivateAll();
        if (activeObject) {
            this.fire('selection:cleared');
        }
        return this;
    }
    getActiveObject() {
        return this._activeObject;
    }
    _translateObject(x: number, y: number) {
        var target = this._currentTransform.target;

        if (!target.get('lockMovementX')) {
            target.set('left', x - this._currentTransform.offsetX);
        }
        if (!target.get('lockMovementY')) {
            target.set('top', y - this._currentTransform.offsetY);
        }
    }
    /**
     * 缩放某个物体
     * @param x
     * @param y
     * @param by 是否等比缩放，x | y | equally
     * @returns
     */
    _scaleObject(x: number, y: number, by = '') {
        // debugger;
        var t = this._currentTransform,
            offset = this._offset,
            target: FabricObject = t.target;

        var lockScalingX = target.lockScalingX,
            lockScalingY = target.lockScalingY;

        if (lockScalingX && lockScalingY) return;

        // Get the constraint point
        var constraintPosition = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);
        var localMouse = target.toLocalPoint(new Point(x - offset.left, y - offset.top), t.originX, t.originY);

        if (t.originX === 'right') {
            localMouse.x *= -1;
        } else if (t.originX === 'center') {
            localMouse.x *= t.mouseXSign * 2;

            if (localMouse.x < 0) {
                t.mouseXSign = -t.mouseXSign;
            }
        }

        if (t.originY === 'bottom') {
            localMouse.y *= -1;
        } else if (t.originY === 'center') {
            localMouse.y *= t.mouseYSign * 2;

            if (localMouse.y < 0) {
                t.mouseYSign = -t.mouseYSign;
            }
        }

        // Actually scale the object
        var newScaleX = target.scaleX,
            newScaleY = target.scaleY;
        if (by === 'equally' && !lockScalingX && !lockScalingY) {
            var dist = localMouse.y + localMouse.x;
            var lastDist = target.height * t.original.scaleY + target.width * t.original.scaleX + target.padding * 2 - target.strokeWidth * 2 + 1; /* additional offset needed probably due to subpixel rendering, and avoids jerk when scaling an object */

            // We use t.scaleX/Y instead of target.scaleX/Y because the object may have a min scale and we'll loose the proportions
            newScaleX = (t.original.scaleX * dist) / lastDist;
            newScaleY = (t.original.scaleY * dist) / lastDist;

            target.set('scaleX', newScaleX);
            target.set('scaleY', newScaleY);
        } else if (!by) {
            newScaleX = localMouse.x / (target.width + target.padding);
            newScaleY = localMouse.y / (target.height + target.padding);

            lockScalingX || target.set('scaleX', newScaleX);
            lockScalingY || target.set('scaleY', newScaleY);
        } else if (by === 'x' && !target.get('lockUniScaling')) {
            newScaleX = localMouse.x / (target.width + target.padding);
            lockScalingX || target.set('scaleX', newScaleX);
        } else if (by === 'y' && !target.get('lockUniScaling')) {
            newScaleY = localMouse.y / (target.height + target.padding);
            lockScalingY || target.set('scaleY', newScaleY);
        }
        // Check if we flipped
        if (newScaleX < 0) {
            if (t.originX === 'left') t.originX = 'right';
            else if (t.originX === 'right') t.originX = 'left';
        }

        if (newScaleY < 0) {
            if (t.originY === 'top') t.originY = 'bottom';
            else if (t.originY === 'bottom') t.originY = 'top';
        }

        // Make sure the constraints apply
        target.setPositionByOrigin(constraintPosition, t.originX, t.originY);
    }
    _rotateObject(x: number, y: number) {
        var t = this._currentTransform,
            o = this._offset;

        if (t.target.lockRotation) return;

        var lastAngle = Math.atan2(t.ey - t.top - o.top, t.ex - t.left - o.left),
            curAngle = Math.atan2(y - t.top - o.top, x - t.left - o.left);

        t.target.angle = Util.radiansToDegrees(curAngle - lastAngle + t.theta);
    }
    _setCursor(value: string) {
        this.upperCanvasEl.style.cursor = value;
    }
    _setCursorFromEvent(e: MouseEvent, target: FabricObject): boolean {
        var s = this.upperCanvasEl.style;
        if (!target) {
            s.cursor = this.defaultCursor;
            return false;
        } else {
            var activeGroup = this.getActiveGroup();
            // only show proper corner when group selection is not active
            var corner = target._findTargetCorner && (!activeGroup || !activeGroup.contains(target)) && target._findTargetCorner(e, this._offset);

            if (!corner) {
                s.cursor = this.hoverCursor;
            } else {
                if (corner in cursorMap) {
                    s.cursor = cursorMap[corner];
                } else if (corner === 'mtr' && target.hasRotatingPoint) {
                    s.cursor = this.rotationCursor;
                } else {
                    s.cursor = this.defaultCursor;
                    return false;
                }
            }
        }
        return true;
    }
    _findSelectedObjects(e: MouseEvent) {
        var group = [],
            x1 = this._groupSelector.ex,
            y1 = this._groupSelector.ey,
            x2 = x1 + this._groupSelector.left,
            y2 = y1 + this._groupSelector.top,
            currentObject,
            selectionX1Y1 = new Point(Math.min(x1, x2), Math.min(y1, y2)),
            selectionX2Y2 = new Point(Math.max(x1, x2), Math.max(y1, y2));

        for (var i = 0, len = this._objects.length; i < len; ++i) {
            currentObject = this._objects[i];

            if (!currentObject) continue;

            if (currentObject.intersectsWithRect(selectionX1Y1, selectionX2Y2) || currentObject.isContainedWithinRect(selectionX1Y1, selectionX2Y2)) {
                if (this.selection && currentObject.selectable) {
                    currentObject.setActive(true);
                    group.push(currentObject);
                }
            }
        }

        // do not create group for 1 element only
        if (group.length === 1) {
            this.setActiveObject(group[0], e);
        } else if (group.length > 1) {
            // group = new Group(group);
            // this.setActiveGroup(group);
            // group.saveCoords();
            this.fire('selection:created', { target: group });
        }

        this.renderAll();
    }
    /** 渲染 upper-canvas，还用于渲染组选择框。*/
    renderTop(): Canvas {
        var ctx = this.contextTop || this.contextContainer;
        this.clearContext(ctx);

        // we render the top context - last object
        if (this.selection && this._groupSelector) {
            this._drawSelection();
        }

        // delegate rendering to group selection if one exists
        // used for drawing selection borders/controls
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            activeGroup.render(ctx);
        }

        this.fire('after:render');

        return this;
    }
    /** 绘制框选区域 */
    _drawSelection() {
        var ctx = this.contextTop,
            groupSelector = this._groupSelector,
            left = groupSelector.left,
            top = groupSelector.top,
            aleft = Math.abs(left),
            atop = Math.abs(top);

        ctx.fillStyle = this.selectionColor;

        ctx.fillRect(groupSelector.ex - (left > 0 ? 0 : -left), groupSelector.ey - (top > 0 ? 0 : -top), aleft, atop);

        ctx.lineWidth = this.selectionLineWidth;
        ctx.strokeStyle = this.selectionBorderColor;

        ctx.strokeRect(groupSelector.ex + STROKE_OFFSET - (left > 0 ? 0 : aleft), groupSelector.ey + STROKE_OFFSET - (top > 0 ? 0 : atop), aleft, atop);
    }
    setActiveObject(object: FabricObject, e: MouseEvent) {
        if (this._activeObject) {
            this._activeObject.setActive(false);
        }
        this._activeObject = object;
        object.setActive(true);

        this.renderAll();

        this.fire('object:selected', { target: object, e });
        object.fire('selected', { e });
        return this;
    }
    /** 设置当前物体的变换数值 */
    _setupCurrentTransform(e: MouseEvent, target: FabricObject) {
        var action = 'drag',
            corner,
            pointer = Util.getPointer(e, target.canvas.upperCanvasEl);

        corner = target._findTargetCorner(e, this._offset);
        if (corner) {
            action = corner === 'ml' || corner === 'mr' ? 'scaleX' : corner === 'mt' || corner === 'mb' ? 'scaleY' : corner === 'mtr' ? 'rotate' : 'scale';
        }

        var originX = 'center',
            originY = 'center';

        if (corner === 'ml' || corner === 'tl' || corner === 'bl') {
            originX = 'right';
        } else if (corner === 'mr' || corner === 'tr' || corner === 'br') {
            originX = 'left';
        }

        if (corner === 'tl' || corner === 'mt' || corner === 'tr') {
            originY = 'bottom';
        } else if (corner === 'bl' || corner === 'mb' || corner === 'br') {
            originY = 'top';
        }

        if (corner === 'mtr') {
            originX = 'center';
            originY = 'center';
        }

        // var center = target.getCenterPoint();
        this._currentTransform = {
            target: target,
            action: action,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            offsetX: pointer.x - target.left,
            offsetY: pointer.y - target.top,
            originX: originX,
            originY: originY,
            ex: pointer.x,
            ey: pointer.y,
            left: target.left,
            top: target.top,
            theta: Util.degreesToRadians(target.angle),
            width: target.width * target.scaleX,
            mouseXSign: 1,
            mouseYSign: 1,
        };
        // 记录物体原始的 original 变换参数
        this._currentTransform.original = {
            left: target.left,
            top: target.top,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            originX: originX,
            originY: originY,
        };
        let { target: pp, ...other } = this._currentTransform;
        console.log(JSON.stringify(other, null, 4));

        this._resetCurrentTransform(e);
    }
    /** 重置当前 transform 状态为 original，并设置 resizing 的基点 */
    _resetCurrentTransform(e: MouseEvent) {
        var t = this._currentTransform;

        t.target.scaleX = t.original.scaleX;
        t.target.scaleY = t.original.scaleY;
        t.target.left = t.original.left;
        t.target.top = t.original.top;

        if (e.altKey || this.centerTransform) {
            if (t.originX !== 'center') {
                if (t.originX === 'right') {
                    t.mouseXSign = -1;
                } else {
                    t.mouseXSign = 1;
                }
            }
            if (t.originY !== 'center') {
                if (t.originY === 'bottom') {
                    t.mouseYSign = -1;
                } else {
                    t.mouseYSign = 1;
                }
            }

            t.originX = 'center';
            t.originY = 'center';
        } else {
            t.originX = t.original.originX;
            t.originY = t.original.originY;
        }
    }
    /** 将所有物体设置成未激活态 */
    deactivateAll() {
        var allObjects = this._objects,
            i = 0,
            len = allObjects.length;
        for (; i < len; i++) {
            allObjects[i].setActive(false);
        }
        // this.discardActiveGroup();
        this.discardActiveObject();
        return this;
    }
    /** 清空所有激活物体 */
    discardActiveObject() {
        if (this._activeObject) {
            this._activeObject.setActive(false);
        }
        this._activeObject = null;
        return this;
    }
    _handleGroupLogic(e, target) {
        // if (target === this.getActiveGroup()) {
        //     // if it's a group, find target again, this time skipping group
        //     target = this.findTarget(e, true);
        //     // if even object is not found, bail out
        //     if (!target || target.isType('group')) {
        //         return;
        //     }
        // }
        // var activeGroup = this.getActiveGroup();
        // if (activeGroup) {
        //     if (activeGroup.contains(target)) {
        //         activeGroup.removeWithUpdate(target);
        //         this._resetObjectTransform(activeGroup);
        //         target.setActive(false);
        //         if (activeGroup.size() === 1) {
        //             // remove group alltogether if after removal it only contains 1 object
        //             this.discardActiveGroup();
        //         }
        //     } else {
        //         activeGroup.addWithUpdate(target);
        //         this._resetObjectTransform(activeGroup);
        //     }
        //     this.fire('selection:created', { target: activeGroup, e: e });
        //     activeGroup.setActive(true);
        // } else {
        //     // group does not exist
        //     if (this._activeObject) {
        //         // only if there's an active object
        //         if (target !== this._activeObject) {
        //             // and that object is not the actual target
        //             var group = new fabric.Group([this._activeObject, target]);
        //             this.setActiveGroup(group);
        //             activeGroup = this.getActiveGroup();
        //         }
        //     }
        //     // activate target object in any case
        //     target.setActive(true);
        // }
        // if (activeGroup) {
        //     activeGroup.saveCoords();
        // }
    }
    _shouldHandleGroupLogic(e, target) {
        var activeObject = this._activeObject;
        return e.shiftKey && (this.getActiveGroup() || (activeObject && activeObject !== target)) && this.selection;
    }
    onBeforeScaleRotate(object: FabricObject) {}
    _shouldClearSelection(e: MouseEvent) {
        var target = this.findTarget(e),
            activeGroup = this.getActiveGroup();
        return !target || (target && activeGroup && !activeGroup.contains(target) && activeGroup !== target && !e.shiftKey);
    }
    getPointer(e: MouseEvent): Pos {
        var pointer = Util.getPointer(e, this.upperCanvasEl);
        return {
            x: pointer.x - this._offset.left,
            y: pointer.y - this._offset.top,
        };
    }
    /** 根据鼠标的位置查找是否有选中的元素 */
    findTarget(e: MouseEvent, skipGroup: boolean = false): FabricObject {
        var target,
            pointer = this.getPointer(e);

        if (this.controlsAboveOverlay && this.lastRenderedObjectWithControlsAboveOverlay && this.containsPoint(e, this.lastRenderedObjectWithControlsAboveOverlay) && this.lastRenderedObjectWithControlsAboveOverlay._findTargetCorner(e, this._offset)) {
            target = this.lastRenderedObjectWithControlsAboveOverlay;
            return target;
        }

        // first check current group (if one exists)
        var activeGroup = this.getActiveGroup();
        if (activeGroup && !skipGroup && this.containsPoint(e, activeGroup)) {
            target = activeGroup;
            return target;
        }

        // then check all of the objects on canvas
        // Cache all targets where their bounding box contains point.
        var possibleTargets = [];
        for (var i = this._objects.length; i--; ) {
            if (this._objects[i] && this.containsPoint(e, this._objects[i])) {
                if (this.perPixelTargetFind || this._objects[i].perPixelTargetFind) {
                    possibleTargets[possibleTargets.length] = this._objects[i];
                } else {
                    target = this._objects[i];
                    this.relatedTarget = target;
                    break;
                }
            }
        }
        for (var j = 0, len = possibleTargets.length; j < len; j++) {
            pointer = this.getPointer(e);
            var isTransparent = this._isTargetTransparent(possibleTargets[j], pointer.x, pointer.y);
            if (!isTransparent) {
                target = possibleTargets[j];
                this.relatedTarget = target;
                break;
            }
        }
        if (target && target.selectable) {
            return target;
        }
    }
    /** 判断物体是否透明 */
    _isTargetTransparent(target, x, y) {
        var cacheContext = this.contextCache;

        var hasBorders = target.hasBorders,
            transparentCorners = target.transparentCorners;
        target.hasBorders = target.transparentCorners = false;

        this._draw(cacheContext, target);

        target.hasBorders = hasBorders;
        target.transparentCorners = transparentCorners;

        // If tolerance is > 0 adjust start coords to take into account. If moves off Canvas fix to 0
        if (this.targetFindTolerance > 0) {
            if (x > this.targetFindTolerance) {
                x -= this.targetFindTolerance;
            } else {
                x = 0;
            }
            if (y > this.targetFindTolerance) {
                y -= this.targetFindTolerance;
            } else {
                y = 0;
            }
        }

        var isTransparent = true;
        var imageData = cacheContext.getImageData(x, y, this.targetFindTolerance * 2 || 1, this.targetFindTolerance * 2 || 1);

        // Split image data - for tolerance > 1, pixelDataSize = 4;
        for (var i = 3; i < imageData.data.length; i += 4) {
            var temp = imageData.data[i];
            isTransparent = temp <= 0;
            if (isTransparent === false) break; //Stop if colour found
        }

        imageData = null;
        this.clearContext(cacheContext);
        return isTransparent;
    }
    containsPoint(e: MouseEvent, target: FabricObject): boolean {
        var pointer = this.getPointer(e),
            xy = this._normalizePointer(target, pointer),
            x = xy.x,
            y = xy.y;

        // http://www.geog.ubc.ca/courses/klink/gis.notes/ncgia/u32.html
        // http://idav.ucdavis.edu/~okreylos/TAship/Spring2000/PointInPolygon.html

        // we iterate through each object. If target found, return it.
        var iLines = target._getImageLines(target.oCoords),
            xpoints = target._findCrossPoints(x, y, iLines);

        // if xcount is odd then we clicked inside the object
        // For the specific case of square images xcount === 1 in all true cases
        if ((xpoints && xpoints % 2 === 1) || target._findTargetCorner(e, this._offset)) {
            return true;
        }
        return false;
    }
    _normalizePointer(object: FabricObject, pointer: Pos) {
        var activeGroup = this.getActiveGroup(),
            x = pointer.x,
            y = pointer.y;

        var isObjectInGroup = activeGroup && object.type !== 'group' && activeGroup.contains(object);

        if (isObjectInGroup) {
            x -= activeGroup.left;
            y -= activeGroup.top;
        }
        return { x, y };
    }
    /** 大部分是在 lower-canvas 上先画未激活物体，再画激活物体 */
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
        // if (activeGroup) {
        //     //Store objects in group preserving order, then replace
        //     let sortedObjects = [];
        //     this.forEachObject((object) => {
        //         if (activeGroup.contains(object)) {
        //             sortedObjects.push(object);
        //         }
        //     });
        //     activeGroup._set('objects', sortedObjects);
        //     this._draw(canvasToDrawOn, activeGroup);
        // }

        // if (this.controlsAboveOverlay) {
        //     this.drawControls(canvasToDrawOn);
        // }

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

        // if (this.controlsAboveOverlay) {
        //     let hasBorders = object.hasBorders,
        //         hasControls = object.hasControls;
        //     object.hasBorders = object.hasControls = false;
        //     object.render(ctx);
        //     object.hasBorders = hasBorders;
        //     object.hasControls = hasControls;
        // } else {
        //     object.render(ctx);
        // }
        object.render(ctx);
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
