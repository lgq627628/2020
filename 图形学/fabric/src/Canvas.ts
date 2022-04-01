import { Util } from './Util';
import { Point } from './Point';
import { Bounding, Offset } from './interface';

const CANVAS_INIT_ERROR = new Error('Could not initialize `canvas` element');

export class StaticCanvas {
    public static activeInstance;
    public lowerCanvasEl: HTMLCanvasElement;
    public width: number;
    public height: number;
    private _offset: Offset;
    private _objects;
    constructor(el: HTMLCanvasElement, opts = {}) {
        this._initStatic(el, opts);
        StaticCanvas.activeInstance = this;
    }
    _initStatic(el: HTMLCanvasElement, opts) {
        this._objects = [];

        this._createLowerCanvas(el);
        this._initOptions(opts);

        this.calcOffset();
    }
    _createLowerCanvas(el: HTMLCanvasElement) {
        this.lowerCanvasEl = el || this._createCanvasElement();
    }
    _createCanvasElement() {
        const element = document.createElement('canvas') as HTMLCanvasElement;
        if (!element) throw CANVAS_INIT_ERROR;
        return element;
    }
    _initOptions(opts) {
        for (let prop in opts) {
            this[prop] = opts[prop];
        }

        this.width = parseInt(String(this.lowerCanvasEl.width), 10) || 0;
        this.height = parseInt(String(this.lowerCanvasEl.height), 10) || 0;

        if (!this.lowerCanvasEl.style) return;

        this.lowerCanvasEl.style.width = this.width + 'px';
        this.lowerCanvasEl.style.height = this.height + 'px';
    }
    calcOffset() {
        this._offset = Util.getElementOffset(this.lowerCanvasEl);
        return this;
    }
}
/**
 * 用 svg 保存手绘的线条路径，并添加到 canvas 中
 */
export class FreeDrawing {
    public canvas: Canvas;
    public _points: Point[];
    public box: Bounding;
    constructor(fabricCanvas: Canvas) {
        this.initialize(fabricCanvas);
    }
    initialize(fabricCanvas) {
        this.canvas = fabricCanvas;
        this._points = [];
    }
    _addPoint(point: Point) {
        this._points.push(point);
    }
    /**
     * 清空坐标点数组并且设置上层 canvas
     */
    _reset() {
        this._points.length = 0;

        const ctx = this.canvas.contextTop;
        // 设置线条参数
        ctx.strokeStyle = this.canvas.freeDrawingColor;
        ctx.lineWidth = this.canvas.freeDrawingLineWidth;
        ctx.lineCap = ctx.lineJoin = 'round';
    }
    _prepareForDrawing(pointer: Point) {
        this.canvas._isCurrentlyDrawing = true;
        this.canvas.discardActiveObject().renderAll();

        const p = new Point(pointer.x, pointer.y);
        this._reset();
        this._addPoint(p);
        this.canvas.contextTop.moveTo(p.x, p.y);
    }
    _captureDrawingPath(pointer: Point) {
        const pointerPoint = new Point(pointer.x, pointer.y);
        this._addPoint(pointerPoint);
    }
    /**
     * 为了让画出来的路径更加平滑，我们用 quadraticCurveTo
     */
    _render() {
        const ctx = this.canvas.contextTop;
        ctx.beginPath();

        let p1 = this._points[0];
        let p2 = this._points[1];

        ctx.moveTo(p1.x, p1.y);

        for (let i = 1, len = this._points.length; i < len; i++) {
            // we pick the point between pi+1 & pi+2 as the end point and p1 as our control point.
            const midPoint = p1.midPointFrom(p2);
            ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);

            p1 = this._points[i];
            p2 = this._points[i + 1];
        }
        // Draw last line as a straight line while
        // we wait for the next point to be able to calculate
        // the bezier control point
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
    }
    /**
     * 返回 svg 路径和路径的包围盒
     */
    _getSVGPathData() {
        this.box = this.getPathBoundingBox(this._points);
        return this.convertPointsToSVGPath(this._points, this.box.minx, this.box.maxx, this.box.miny, this.box.maxy);
    }
    getPathBoundingBox(points: Point[]): Bounding {
        var xBounds = [],
            yBounds = [],
            p1 = points[0],
            p2 = points[1],
            startPoint = p1;

        for (var i = 1, len = points.length; i < len; i++) {
            var midPoint = p1.midPointFrom(p2);
            // with startPoint, p1 as control point, midpoint as end point
            xBounds.push(startPoint.x);
            xBounds.push(midPoint.x);
            yBounds.push(startPoint.y);
            yBounds.push(midPoint.y);

            p1 = points[i];
            p2 = points[i + 1];
            startPoint = midPoint;
        } // end for

        xBounds.push(p1.x);
        yBounds.push(p1.y);

        return {
            minx: Util.min(xBounds),
            miny: Util.min(yBounds),
            maxx: Util.max(xBounds),
            maxy: Util.max(yBounds),
        };
    }
    /**
     * 将坐标点用 svg 路径表示
     */
    convertPointsToSVGPath(points: Point[], minX: number, maxX: number, minY: number, maxY: number) {
        const path = [];
        let p1 = new Point(points[0].x - minX, points[0].y - minY);
        let p2 = new Point(points[1].x - minX, points[1].y - minY);

        path.push('M ', points[0].x - minX, ' ', points[0].y - minY, ' ');
        for (let i = 1, len = points.length; i < len; i++) {
            const midPoint = p1.midPointFrom(p2);
            // p1 is our bezier control point
            // midpoint is our endpoint
            // start point is p(i-1) value.
            path.push('Q ', p1.x, ' ', p1.y, ' ', midPoint.x, ' ', midPoint.y, ' ');
            p1 = new Point(points[i].x - minX, points[i].y - minY);
            if (i + 1 < points.length) {
                p2 = new Point(points[i + 1].x - minX, points[i + 1].y - minY);
            }
        }
        path.push('L ', p1.x, ' ', p1.y, ' ');
        return path;
    }
    /**
     * 创建路径对象并准备添加到 canvas
     */
    createPath(pathData) {
        var path = new Path(pathData);
        path.fill = null;
        path.stroke = this.canvas.freeDrawingColor;
        path.strokeWidth = this.canvas.freeDrawingLineWidth;
        return path;
      },
}
export class Canvas extends StaticCanvas {
    public static activeInstance;
    public contextCache: CanvasRenderingContext2D;
    public cacheCanvasEl: HTMLCanvasElement;
    public freeDrawing;
    private _currentTransform;
    private _groupSelector;
    constructor(el: HTMLCanvasElement, opts = {}) {
        super(el, opts);
        this._initInteractive();
        this._createCacheCanvas();
        Canvas.activeInstance = this;
    }
    _initInteractive() {
        this._currentTransform = null;
        this._groupSelector = null;
        this.freeDrawing = new FreeDrawing(this);
        this._initWrapperElement();
        this._createUpperCanvas();
        this._initEvents();
        this.calcOffset();
    }
    _initWrapperElement() {}
    _createUpperCanvas() {}
    _initEvents() {}
    _createCacheCanvas() {
        this.cacheCanvasEl = this._createCanvasElement();
        this.cacheCanvasEl.setAttribute('width', String(this.width));
        this.cacheCanvasEl.setAttribute('height', String(this.height));
        this.contextCache = this.cacheCanvasEl.getContext('2d');
    }
}
