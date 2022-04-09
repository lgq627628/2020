import { FabricObject } from './FabricObject';
import { Util } from './Misc';

const _lockProperties = {
    lockMovementX: true,
    lockMovementY: true,
    // lockRotation: true,
    // lockScalingX: true,
    // lockScalingY: true,
    // lockUniScaling: true,
};
export class Group extends FabricObject {
    public type: string = 'group';
    public objects: FabricObject[];
    public originalState;
    public delegatedProperties = {
        fill: true,
        // opacity: true,
        fontFamily: true,
        fontWeight: true,
        fontSize: true,
        fontStyle: true,
        lineHeight: true,
        textDecoration: true,
        textShadow: true,
        textAlign: true,
        backgroundColor: true,
    };
    public _originalTop;
    public _originalLeft;
    public canvas;
    constructor(objects: FabricObject[], options: any = {}) {
        super(options);

        this.objects = objects || [];
        this.originalState = {};

        this._calcBounds();
        this._updateObjectsCoords();

        this.setCoords();
        this.saveCoords();
    }
    /** 更新所有物体坐标系 */
    _updateObjectsCoords() {
        var groupDeltaX = this.left,
            groupDeltaY = this.top;

        this.forEachObject((object) => {
            var objectLeft = object.get('left'),
                objectTop = object.get('top');

            object.set('originalLeft', objectLeft);
            object.set('originalTop', objectTop);

            object.set('left', objectLeft - groupDeltaX);
            object.set('top', objectTop - groupDeltaY);

            object.setCoords();

            // do not display corners of objects enclosed in a group
            object.__origHasControls = object.hasControls;
            object.hasControls = false;
        });
    }
    getObjects(): FabricObject[] {
        return this.objects;
    }
    /** 将物体添加到 group 中，并重新计算位置尺寸等 */
    addWithUpdate(object: FabricObject): Group {
        this._restoreObjectsState();
        this.objects.push(object);
        this._calcBounds();
        this._updateObjectsCoords();
        return this;
    }
    /** 将物体添加到 group 中 */
    add(object: FabricObject) {
        this.objects.push(object);
        return this;
    }
    /** 将物体从 group 中移除 */
    remove(object: FabricObject) {
        Util.removeFromArray(this.objects, object);
        return this;
    }
    /** 将物体从组中溢移除，并重新计算组的大小位置 */
    removeWithUpdate(object: FabricObject) {
        this._restoreObjectsState();
        Util.removeFromArray(this.objects, object);
        object.setActive(false);
        this._calcBounds();
        this._updateObjectsCoords();
        return this;
    }
    /** 物体是否在 group 中 */
    contains(object: FabricObject) {
        return this.objects.indexOf(object) > -1;
    }
    /** 获取 group 尺寸 */
    size() {
        return this.getObjects().length;
    }

    render(ctx: CanvasRenderingContext2D, noTransform: boolean = false) {
        ctx.save();
        this.transform(ctx);

        var groupScaleFactor = Math.max(this.scaleX, this.scaleY);

        //The array is now sorted in order of highest first, so start from end.
        for (var i = this.objects.length; i > 0; i--) {
            var object = this.objects[i - 1],
                originalScaleFactor = object.borderScaleFactor,
                originalHasRotatingPoint = object.hasRotatingPoint;

            object.borderScaleFactor = groupScaleFactor;
            object.hasRotatingPoint = false;

            object.render(ctx);

            object.borderScaleFactor = originalScaleFactor;
            object.hasRotatingPoint = originalHasRotatingPoint;
        }

        if (!noTransform && this.active) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
        this.setCoords();
    }
    /** 根据 index 获取 group 中的某个物体 */
    item(index: number): FabricObject {
        return this.getObjects()[index];
    }
    forEachObject(callback: Function) {
        let objects = this.objects,
            i = objects.length;
        while (i--) {
            callback.call(this, objects[i], i, objects);
        }
    }
    /** 还原创建 group 之前的状态 */
    _restoreObjectsState(): Group {
        this.objects.forEach(this._restoreObjectState, this);
        return this;
    }
    /** 还原 group 中某个物体的初始状态 */
    _restoreObjectState(object): Group {
        var groupLeft = this.get('left'),
            groupTop = this.get('top'),
            groupAngle = this.getAngle() * (Math.PI / 180),
            rotatedTop = Math.cos(groupAngle) * object.get('top') + Math.sin(groupAngle) * object.get('left'),
            rotatedLeft = -Math.sin(groupAngle) * object.get('top') + Math.cos(groupAngle) * object.get('left');

        object.setAngle(object.getAngle() + this.getAngle());

        object.set('left', groupLeft + rotatedLeft * this.get('scaleX'));
        object.set('top', groupTop + rotatedTop * this.get('scaleY'));

        object.set('scaleX', object.get('scaleX') * this.get('scaleX'));
        object.set('scaleY', object.get('scaleY') * this.get('scaleY'));

        object.setCoords();
        object.hasControls = object.__origHasControls;
        delete object.__origHasControls;
        object.setActive(false);
        object.setCoords();

        return this;
    }
    destroy() {
        return this._restoreObjectsState();
    }
    saveCoords(): Group {
        this._originalLeft = this.get('left');
        this._originalTop = this.get('top');
        return this;
    }
    hasMoved() {
        return this._originalLeft !== this.get('left') || this._originalTop !== this.get('top');
    }
    setObjectsCoords(): Group {
        this.forEachObject(object => {
            object.setCoords();
        });
        return this;
    }
    /** 激活所有 group 中的物体 */
    activateAllObjects(): Group {
        this.forEachObject(function (object) {
            object.setActive();
        });
        return this;
    }
    /** 计算组的包围盒 */
    _calcBounds() {
        let aX: any[] = [],
            aY: any[] = [],
            minX,
            minY,
            maxX,
            maxY,
            o,
            width,
            height,
            i = 0,
            len = this.objects.length;

        for (; i < len; ++i) {
            o = this.objects[i];
            o.setCoords();
            for (let prop in o.oCoords) {
                aX.push(o.oCoords[prop].x);
                aY.push(o.oCoords[prop].y);
            }
        }

        minX = Util.min(aX);
        maxX = Util.max(aX);
        minY = Util.min(aY);
        maxY = Util.max(aY);

        width = maxX - minX || 0;
        height = maxY - minY || 0;

        this.width = width;
        this.height = height;

        this.left = minX + width / 2 || 0;
        this.top = minY + height / 2 || 0;
    }

    /** 检查点是都在 group 中 */
    containsPoint(point) {
        var halfWidth = this.get('width') / 2,
            halfHeight = this.get('height') / 2,
            centerX = this.get('left'),
            centerY = this.get('top');

        return centerX - halfWidth < point.x && centerX + halfWidth > point.x && centerY - halfHeight < point.y && centerY + halfHeight > point.y;
    }

    get(prop) {
        if (prop in _lockProperties) {
            if (this[prop]) {
                return this[prop];
            } else {
                for (var i = 0, len = this.objects.length; i < len; i++) {
                    if (this.objects[i][prop]) {
                        return true;
                    }
                }
                return false;
            }
        } else {
            if (prop in this.delegatedProperties) {
                return this.objects[0] && this.objects[0][prop];
            }
            return this[prop];
        }
    }
    _set(key: string, value): Group {
        if (key in this.delegatedProperties) {
            var i = this.objects.length;
            this[key] = value;
            while (i--) {
                this.objects[i].set(key, value);
            }
        } else {
            this[key] = value;
        }
        return this;
    }
    static async = true;
}
