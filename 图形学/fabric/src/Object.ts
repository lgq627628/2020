import { Util } from './Util';
import { Shadow } from './Shadow';
import { fabric } from './index';
export class FabricObject {
    /** 物体的标识，比如 rect, circle, path */
    public type: string = 'object';
    /** Horizontal origin of transformation of an object (one of "left", "right", "center") */
    public originX: string = 'center';
    /** Vertical origin of transformation of an object (one of "top", "bottom", "center") */
    public originY: string = 'center';
    public top: number = 0;
    public left: number = 0;
    public width: number = 0;
    public height: number = 0;
    public scaleX: number = 1;
    public scaleY: number = 1;
    public angle: number = 0;
    public opacity: number = 1;
    /** When true, an object is rendered as flipped horizontally */
    public flipX: boolean = false;
    /** When true, an object is rendered as flipped vertically */
    public flipY: boolean = false;
    /** Size of object's corners (in pixels) */
    public cornerSize: number = 12;
    /** When true, object's corners are rendered as transparent inside (i.e. stroke instead of fill) */
    public transparentCorners: boolean = true;
    public padding: number = 0;
    public borderColor: string = 'rgba(102,153,255,0.75)';
    public cornerColor: string = 'rgba(102,153,255,0.75)';
    public fill: string = 'rgb(0,0,0)';
    /** Overlay fill (takes precedence over fill value) */
    public fillRule: string = 'source-over';
    public overlayFill: string;
    public stroke: string;
    public strokeWidth: number = 1;
    public strokeDashArray: any[];
    public shadow: Shadow;
    public borderOpacityWhenMoving: number = 0.4;
    public borderScaleFactor: number = 1;
    public transformMatrix: number[];
    public minScaleLimit: number = 0.01;
    public selectable: boolean = true;
    public visible: boolean = true;
    public hasControls: boolean = true;
    public hasBorders: boolean = true;
    public hasRotatingPoint: boolean = true;
    public rotatingPointOffset: number = 40;
    /** When set to `true`, objects are "found" on canvas on per-pixel basis rather than according to bounding box */
    public perPixelTargetFind: boolean = false;
    /** Function that determines clipping of an object (context is passed as a first argument) */
    public includeDefaultValues: boolean = true;
    public clipTo: Function;
    public originalState: null;
    /**
     * List of properties to consider when checking if state of an object is changed (fabric.Object#hasStateChanged);
     * as well as for history (undo/redo) purposes
     */
    public stateProperties: string[] = ('top left width height scaleX scaleY flipX flipY ' + 'angle opacity cornerSize fill overlayFill originX originY ' + 'stroke strokeWidth strokeDashArray fillRule ' + 'borderScaleFactor transformMatrix selectable shadow visible').split(' ');
    // ('top left width height scaleX scaleY flipX flipY ' +
    // 'theta angle opacity cornersize fill overlayFill ' +
    // 'stroke strokeWidth strokeDashArray fillRule ' +
    // 'borderScaleFactor transformMatrix selectable').split(' ')

    constructor(options) {
        this.initialize(options);
    }
    initialize(options) {
        options && this.setOptions(options);
    }
    setOptions(options) {
        for (let prop in options) {
            this.set(prop, options[prop]);
        }
        this._initGradient(options);
        this._initPattern(options);
        this._initShadow(options);
    }
    _initGradient(options) {}
    _initPattern(options) {}
    _initShadow(options) {}
    get(property) {
        return this[property];
    }
    set(key, value) {
        if (typeof key === 'object') {
            for (var prop in key) {
                this._set(prop, key[prop]);
            }
        } else {
            if (typeof value === 'function') {
                this._set(key, value(this.get(key)));
            } else {
                this._set(key, value);
            }
        }
        return this;
    }
    _set(key, value) {
        var shouldConstrainValue = key === 'scaleX' || key === 'scaleY';

        if (shouldConstrainValue) {
            value = this._constrainScale(value);
        }
        if (key === 'scaleX' && value < 0) {
            this.flipX = !this.flipX;
            value *= -1;
        } else if (key === 'scaleY' && value < 0) {
            this.flipY = !this.flipY;
            value *= -1;
        } else if (key === 'width' || key === 'height') {
            this.minScaleLimit = Util.toFixed(Math.min(0.1, 1 / Math.max(this.width, this.height)), 2);
        }

        this[key] = value;

        return this;
    }
    hasStateChanged() {
        return this.stateProperties.some(function (prop) {
            return this[prop] !== this.originalState[prop];
        }, this);
    }
    saveState() {
        this.stateProperties.forEach(function (prop) {
            this.originalState[prop] = this.get(prop);
        }, this);
        return this;
    }
    setupState() {
        this.originalState = {};
        this.saveState();
    }
}

fabric.Object = FabricObject;
