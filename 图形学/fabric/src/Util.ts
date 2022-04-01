import { Point } from './Point';
import { AnimateOptions, Offset } from './interface';
import { PathGroup, Group } from './Path';
import { Observable } from './Observable';
import { Ease } from './Ease';

const PiBy180 = Math.PI / 180;
const emptyFn = () => {};
const elements = {};
// DOM L0 branch
const handlers = {};

/** 所有通用工具类函数都放这里，当然也可以拆开（如细分成数组、对象、样式、计算、事件、请求等模块） */
export class Util {
    static getPointer(event: Event, upperCanvasEl: HTMLCanvasElement) {
        event || (event = window.event);

        let element: HTMLElement = event.target as HTMLElement,
            body = document.body || { scrollLeft: 0, scrollTop: 0 },
            docElement = document.documentElement,
            orgElement = element,
            scrollLeft = 0,
            scrollTop = 0,
            firstFixedAncestor;

        while (element && element.parentNode && !firstFixedAncestor) {
            element = element.parentNode as HTMLElement;
            if (element !== document && Util.getElementPosition(element) === 'fixed') firstFixedAncestor = element;

            if (element !== document && orgElement !== upperCanvasEl && Util.getElementPosition(element) === 'absolute') {
                scrollLeft = 0;
                scrollTop = 0;
            } else if (element === document && orgElement !== upperCanvasEl) {
                scrollLeft = body.scrollLeft || docElement.scrollLeft || 0;
                scrollTop = body.scrollTop || docElement.scrollTop || 0;
            } else {
                scrollLeft += element.scrollLeft || 0;
                scrollTop += element.scrollTop || 0;
            }
        }

        return {
            x: Util.pointerX(event) + scrollLeft,
            y: Util.pointerY(event) + scrollTop,
        };
    }
    static pointerX(event) {
        return event.clientX || 0;
    }
    static pointerY(event) {
        return event.clientY || 0;
    }
    static getUniqueId = (function () {
        let uid = 0;
        return function (element) {
            return element.__uniqueID || (element.__uniqueID = 'uniqueID__' + uid++);
        };
    })();
    /** 从原对象中复制所有可枚举属性到新对象中 */
    static extend(destination: Object, source: Object) {
        for (let property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
    /** 新建一个对象并复制所有可枚举属性到新对象中 */
    static clone(object: Object) {
        return Util.extend({}, object);
    }
    /** 批量调用数组每一项的某个方法 */
    static invoke(array: any[], method: string) {
        let args = [].slice.call(arguments, 2),
            result = [];
        for (let i = 0, len = array.length; i < len; i++) {
            result[i] = args.length ? array[i][method].apply(array[i], args) : array[i][method].call(array[i]);
        }
        return result;
    }
    static setStyle(element: HTMLElement, styles: Object) {
        let elementStyle = element.style;
        if (!elementStyle) {
            return element;
        }
        if (typeof styles === 'string') {
            element.style.cssText += ';' + styles;
            return styles.indexOf('opacity') > -1 ? Util.setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
        }
        for (let property in styles) {
            Util.setOpacity(element, styles[property]);
        }
        return element;
    }

    static setOpacity(element: HTMLElement, value: string) {
        element.style.opacity = value;
        return element;
    }
    static createCanvasElement(canvasEl: HTMLCanvasElement) {
        canvasEl || (canvasEl = document.createElement('canvas'));
        return canvasEl;
    }
    /** 基于 stateProperties 数组，创建类的访问器 (getXXX, setXXX) */
    static createAccessors(klass) {
        let proto = klass.prototype;

        for (let i = proto.stateProperties.length; i--; ) {
            let propName = proto.stateProperties[i],
                capitalizedPropName = propName.charAt(0).toUpperCase() + propName.slice(1),
                setterName = 'set' + capitalizedPropName,
                getterName = 'get' + capitalizedPropName;

            // using `new Function` for better introspection
            if (!proto[getterName]) {
                proto[getterName] = (function (property) {
                    return new Function('return this.get("' + property + '")');
                })(propName);
            }
            if (!proto[setterName]) {
                proto[setterName] = (function (property) {
                    return new Function('value', 'return this.set("' + property + '", value)');
                })(propName);
            }
        }
    }
    static clipContext(receiver, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.beginPath();
        receiver.clipTo(ctx);
        ctx.clip();
    }
    static getElementOffset(element): Offset {
        let valueT = 0,
            valueL = 0;
        do {
            valueT += element.offsetTop || 0;
            valueL += element.offsetLeft || 0;
            element = element.offsetParent;
        } while (element);
        return { left: valueL, top: valueT };
    }
    /**
     * 数组的最小值
     */
    static min(array, byProperty = '') {
        if (!array || array.length === 0) return undefined;

        let i = array.length - 1,
            result = byProperty ? array[i][byProperty] : array[i];

        if (byProperty) {
            while (i--) {
                if (array[i][byProperty] < result) {
                    result = array[i][byProperty];
                }
            }
        } else {
            while (i--) {
                if (array[i] < result) {
                    result = array[i];
                }
            }
        }
        return result;
    }
    /**
     * 数组的最大值
     */
    static max(array, byProperty = '') {
        if (!array || array.length === 0) return undefined;

        let i = array.length - 1,
            result = byProperty ? array[i][byProperty] : array[i];
        if (byProperty) {
            while (i--) {
                if (array[i][byProperty] >= result) {
                    result = array[i][byProperty];
                }
            }
        } else {
            while (i--) {
                if (array[i] >= result) {
                    result = array[i];
                }
            }
        }
        return result;
    }
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    /** 和原生的 toFixed 一样，只不过返回的数字 */
    static toFixed(number: number | string, fractionDigits: number): number {
        return parseFloat(Number(number).toFixed(fractionDigits));
    }
    static removeFromArray(array: any[], value: any) {
        let idx = array.indexOf(value);
        if (idx !== -1) {
            array.splice(idx, 1);
        }
        return array;
    }
    static capitalize(string: string): string {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    static camelize(string: string): string {
        return string.replace(/-+(.)?/g, function (match, character) {
            return character ? character.toUpperCase() : '';
        });
    }
    /** 转义 XML */
    static escapeXml(string) {
        return string.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    static degreesToRadians(degrees: number): number {
        return degrees * PiBy180;
    }
    static radiansToDegrees(radians: number): number {
        return radians / PiBy180;
    }
    /** 根据原始点坐标来旋转 */
    static rotatePoint(point: Point, origin: Point, radians) {
        const sin = Math.sin(radians),
            cos = Math.cos(radians);

        point.subtractEquals(origin);

        const rx = point.x * cos - point.y * sin;
        const ry = point.x * sin + point.y * cos;

        return new Point(rx, ry).addEquals(origin);
    }
    static falseFunction() {
        return false;
    }

    static animate(options: AnimateOptions) {
        let start = +new Date(),
            duration = options.duration || 500,
            finish = start + duration,
            time,
            onChange = options.onChange || function () {},
            abort =
                options.abort ||
                function () {
                    return false;
                },
            easing =
                options.easing ||
                function (t, b, c, d) {
                    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
                },
            startValue = 'startValue' in options ? options.startValue : 0,
            endValue = 'endValue' in options ? options.endValue : 100,
            byValue = options.byValue || endValue - startValue;

        options.onStart && options.onStart();

        (function tick() {
            time = +new Date();
            let currentTime = time > finish ? duration : time - start;
            onChange(easing(currentTime, startValue, byValue, duration));
            if (time > finish || abort()) {
                options.onComplete && options.onComplete();
                return;
            }
            requestAnimationFrame(tick);
        })();
    }

    static loadImage(url: string, callback: Function, context: any) {
        if (url) {
            let img = new Image();
            /** @ignore */
            img.onload = function () {
                callback && callback.call(context, img);
                img = img.onload = null;
            };
            img.src = url;
        } else {
            callback && callback.call(context, url);
        }
    }

    /** 根据对象创建相应的 fabric 示例 */
    static enlivenObjects(objects, callback) {
        /** 获取某个 Shape 对象，如 Rect、Circle */
        function getKlass(type) {
            return fabric[Util.camelize(Util.capitalize(type))];
        }

        function onLoaded() {
            if (++numLoadedObjects === numTotalObjects) {
                if (callback) {
                    callback(enlivenedObjects);
                }
            }
        }

        let enlivenedObjects = [],
            numLoadedObjects = 0,
            numTotalObjects = objects.length;

        objects.forEach(function (o, index) {
            if (!o.type) {
                return;
            }
            let klass = getKlass(o.type);
            if (klass.async) {
                klass.fromObject(o, function (o, error) {
                    if (!error) {
                        enlivenedObjects[index] = o;
                    }
                    onLoaded();
                });
            } else {
                enlivenedObjects[index] = klass.fromObject(o);
                onLoaded();
            }
        });
    }

    static groupSVGElements(elements: SVGElement[], options, path) {
        let object;

        if (elements.length > 1) {
            let hasText = elements.some((el: any) => {
                return el.type === 'text';
            });

            if (hasText) {
                object = new Group([], options);
                elements.reverse().forEach((obj: any) => {
                    if (obj.cx) {
                        obj.left = obj.cx;
                    }
                    if (obj.cy) {
                        obj.top = obj.cy;
                    }
                    object.addWithUpdate(obj);
                });
            } else {
                object = new PathGroup(elements, options);
            }
        } else {
            object = elements[0];
        }

        if (typeof path !== 'undefined') {
            object.setSourcePath(path);
        }
        return object;
    }
    /**
     * 将原对象的部分属性赋值到目标对象
     * @param source 原对象
     * @param destination 目标对象
     * @param properties 要赋值的属性数组
     */
    static populateWithProperties(source: Object, destination: Object, properties: string[]) {
        if (properties && Object.prototype.toString.call(properties) === '[object Array]') {
            for (let i = 0, len = properties.length; i < len; i++) {
                destination[properties[i]] = source[properties[i]];
            }
        }
    }
    /** 非原生方法绘制虚线 */
    static drawDashedLine(ctx: CanvasRenderingContext2D, x: number, y: number, x2: number, y2: number, da: number[]) {
        let dx = x2 - x,
            dy = y2 - y,
            len = Math.sqrt(dx * dx + dy * dy),
            rot = Math.atan2(dy, dx),
            dc = da.length,
            di = 0,
            draw = true;

        ctx.save();
        ctx.translate(x, y);
        ctx.moveTo(0, 0);
        ctx.rotate(rot);

        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) {
                x = len;
            }
            ctx[draw ? 'lineTo' : 'moveTo'](x, 0);
            draw = !draw;
        }

        ctx.restore();
    }

    static addParamToUrl(url: string, param: string) {
        return url + (/\?/.test(url) ? '&' : '?') + param;
    }
    static request(url, options) {
        options || (options = {});

        let method = options.method ? options.method.toUpperCase() : 'GET',
            onComplete = options.onComplete || function () {},
            xhr = new XMLHttpRequest(),
            body;

        /** @ignore */
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                onComplete(xhr);
                xhr.onreadystatechange = emptyFn;
            }
        };

        if (method === 'GET') {
            body = null;
            if (typeof options.parameters === 'string') {
                url = Util.addParamToUrl(url, options.parameters);
            }
        }

        xhr.open(method, url, true);

        if (method === 'POST' || method === 'PUT') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }

        xhr.send(body);
        return xhr;
    }
    static getScript(url: string, callback: Function) {
        let headEl = document.getElementsByTagName('head')[0],
            scriptEl = document.createElement('script'),
            loading = true;

        scriptEl.type = 'text/javascript';
        scriptEl.setAttribute('runat', 'server');

        /** @ignore */
        scriptEl.onload = function (e: Event) {
            if (loading) {
                // if (typeof this.readyState === 'string' && this.readyState !== 'loaded' && this.readyState !== 'complete') return;
                loading = false;
                callback(e || window.event);
                scriptEl = scriptEl.onload = null;
            }
        };
        scriptEl.src = url;
        headEl.appendChild(scriptEl);
    }
    static getById(id) {
        return typeof id === 'string' ? document.getElementById(id) : id;
    }
    /** 新建元素并添加相应属性 */
    static makeElement(tagName: string, attributes: Object) {
        let el = document.createElement(tagName);
        for (let prop in attributes) {
            if (prop === 'class') {
                el.className = attributes[prop];
            } else if (prop === 'for') {
                (el as HTMLLabelElement).htmlFor = attributes[prop];
            } else {
                el.setAttribute(prop, attributes[prop]);
            }
        }
        return el;
    }
    static addClass(element: HTMLElement, className: string) {
        if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
            element.className += (element.className ? ' ' : '') + className;
        }
    }
    /** 包裹元素并替换 */
    static wrapElement(element: HTMLElement, wrapper: HTMLElement | string, attributes: Object) {
        if (typeof wrapper === 'string') {
            wrapper = Util.makeElement(wrapper, attributes);
        }
        if (element.parentNode) {
            element.parentNode.replaceChild(wrapper, element);
        }
        wrapper.appendChild(element);
        return wrapper;
    }
    static getElementPosition(element: HTMLElement) {
        return window.getComputedStyle(element, null).position;
    }
    static makeElementUnselectable(element: HTMLElement) {
        if (typeof element.onselectstart !== 'undefined') {
            element.onselectstart = Util.falseFunction;
        }
        element.style.userSelect = 'none';
        return element;
    }
    static makeElementSelectable(element: HTMLElement) {
        if (typeof element.onselectstart !== 'undefined') {
            element.onselectstart = null;
        }
        element.style.userSelect = '';
        return element;
    }
    static createListener(uid, handler) {
        return {
            handler: handler,
            wrappedHandler: Util.createWrappedHandler(uid, handler),
        };
    }

    static createWrappedHandler(uid, handler) {
        return function (e) {
            handler.call(Util.getElement(uid), e || window.event);
        };
    }

    static createDispatcher(uid, eventName) {
        return function (e) {
            if (handlers[uid] && handlers[uid][eventName]) {
                let handlersForEvent = handlers[uid][eventName];
                for (let i = 0, len = handlersForEvent.length; i < len; i++) {
                    handlersForEvent[i].call(this, e || window.event);
                }
            }
        };
    }

    static getElement(uid) {
        return elements[uid];
    }
    static setElement(uid, element) {
        elements[uid] = element;
    }
    static addListener(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
    }
    static removeListener(element, eventName, handler) {
        element.removeEventListener(eventName, handler, false);
    }

    static ease = Ease;
    static Observable = Observable;
}
