import { Point } from './Point';
import { IAnimationOption, Offset, Transform } from './interface';

const PiBy180 = Math.PI / 180; // 写在这里相当于缓存，因为会频繁调用
export class Util {
    static loadImage(url, options: any = {}) {
        return new Promise(function (resolve, reject) {
            let img = document.createElement('img');
            let done = () => {
                img.onload = img.onerror = null;
                resolve(img);
            };
            if (url) {
                img.onload = done;
                img.onerror = () => {
                    reject(new Error('Error loading ' + img.src));
                };
                options && options.crossOrigin && (img.crossOrigin = options.crossOrigin);
                img.src = url;
            } else {
                done();
            }
        });
    }
    static clone(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        let temp = new obj.constructor();
        for (let key in obj) {
            if (!obj[key] || typeof obj[key] !== 'object') {
                temp[key] = obj[key];
            } else {
                temp[key] = Util.clone(obj[key]);
            }
        }
        return temp;
    }
    static animate(options: IAnimationOption) {
        window.requestAnimationFrame((timestamp: number) => {
            let start = timestamp || +new Date(),
                duration = options.duration || 500,
                finish = start + duration,
                time,
                onChange = options.onChange || (() => {}),
                abort = options.abort || (() => false),
                easing = options.easing || ((t, b, c, d) => -c * Math.cos((t / d) * (Math.PI / 2)) + c + b),
                startValue = options.startValue || 0,
                endValue = options.endValue || 100,
                byValue = options.byValue || endValue - startValue;

            function tick(ticktime: number) {
                time = ticktime || +new Date();
                let currentTime = time > finish ? duration : time - start;
                if (abort()) {
                    options.onComplete && options.onComplete();
                    return;
                }
                onChange(easing(currentTime, startValue, byValue, duration)); // 其实 animate 函数只是根据 easing 函数计算出了某个值，然后传给调用者而已
                if (time > finish) {
                    options.onComplete && options.onComplete();
                    return;
                }
                window.requestAnimationFrame(tick);
            }

            options.onStart && options.onStart(); // 动画开始前的回调
            tick(start);
        });
    }
    /** 从数组中溢出某个元素 */
    static removeFromArray(array: any[], value: any) {
        let idx = array.indexOf(value);
        if (idx !== -1) {
            array.splice(idx, 1);
        }
        return array;
    }
    /**
     * 数组的最小值
     */
    static min(array: any[], byProperty = '') {
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
    static max(array: any[], byProperty = '') {
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
    /** 和原生的 toFixed 一样，只不过返回的数字 */
    static toFixed(number: number | string, fractionDigits: number): number {
        return parseFloat(Number(number).toFixed(fractionDigits));
    }
    /** 获取鼠标的点击坐标，相对于页面左上角，注意不是画布的左上角，到时候会减掉 offset */
    static getPointer(event: Event, upperCanvasEl: HTMLCanvasElement) {
        event || (event = window.event);

        let element: HTMLElement | Document = event.target as Document | HTMLElement,
            body = document.body || { scrollLeft: 0, scrollTop: 0 },
            docElement = document.documentElement,
            orgElement = element,
            scrollLeft = 0,
            scrollTop = 0,
            firstFixedAncestor;

        while (element && element.parentNode && !firstFixedAncestor) {
            element = element.parentNode as Document | HTMLElement;
            if (element !== document && Util.getElementPosition(element as HTMLElement) === 'fixed') firstFixedAncestor = element;

            if (element !== document && orgElement !== upperCanvasEl && Util.getElementPosition(element as HTMLElement) === 'absolute') {
                scrollLeft = 0;
                scrollTop = 0;
            } else if (element === document && orgElement !== upperCanvasEl) {
                scrollLeft = body.scrollLeft || docElement.scrollLeft || 0;
                scrollTop = body.scrollTop || docElement.scrollTop || 0;
            } else {
                scrollLeft += (element as HTMLElement).scrollLeft || 0;
                scrollTop += (element as HTMLElement).scrollTop || 0;
            }
        }

        return {
            x: Util.pointerX(event) + scrollLeft,
            y: Util.pointerY(event) + scrollTop,
        };
    }
    /** 根据矩阵反推出具体变换数值 */
    static qrDecompose(m: number[]): Transform {
        let angle = Math.atan2(m[1], m[0]),
            denom = Math.pow(m[0], 2) + Math.pow(m[1], 2),
            scaleX = Math.sqrt(denom),
            scaleY = (m[0] * m[3] - m[2] * m[1]) / scaleX,
            skewX = Math.atan2(m[0] * m[2] + m[1] * m[3], denom);
        return {
            angle: angle / PiBy180,
            scaleX: scaleX,
            scaleY: scaleY,
            skewX: skewX / PiBy180,
            skewY: 0,
            translateX: m[4],
            translateY: m[5],
        };
    }
    static invertTransform(t) {
        let a = 1 / (t[0] * t[3] - t[1] * t[2]),
            r = [a * t[3], -a * t[1], -a * t[2], a * t[0]],
            o = Util.transformPoint({ x: t[4], y: t[5] }, r, true);
        r[4] = -o.x;
        r[5] = -o.y;
        return r;
    }
    static transformPoint(p, t, ignoreOffset: boolean = false) {
        if (ignoreOffset) {
            return new Point(t[0] * p.x + t[2] * p.y, t[1] * p.x + t[3] * p.y);
        }
        return new Point(t[0] * p.x + t[2] * p.y + t[4], t[1] * p.x + t[3] * p.y + t[5]);
    }
    static multiplyTransformMatrices(a, b, is2x2) {
        // Matrix multiply a * b
        return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], is2x2 ? 0 : a[0] * b[4] + a[2] * b[5] + a[4], is2x2 ? 0 : a[1] * b[4] + a[3] * b[5] + a[5]];
    }
    static makeBoundingBoxFromPoints(points) {
        let xPoints = [points[0].x, points[1].x, points[2].x, points[3].x],
            minX = Util.min(xPoints),
            maxX = Util.max(xPoints),
            width = Math.abs(minX - maxX),
            yPoints = [points[0].y, points[1].y, points[2].y, points[3].y],
            minY = Util.min(yPoints),
            maxY = Util.max(yPoints),
            height = Math.abs(minY - maxY);

        return {
            left: minX,
            top: minY,
            width: width,
            height: height,
        };
    }
    static pointerX(event) {
        return event.clientX || 0;
    }
    static pointerY(event) {
        return event.clientY || 0;
    }
    /** 获取元素位置 */
    static getElementPosition(element: HTMLElement) {
        return window.getComputedStyle(element, null).position;
    }
    /** 角度转弧度，注意 canvas 中用的都是弧度，但是角度对我们来说比较直观 */
    static degreesToRadians(degrees: number): number {
        return degrees * PiBy180;
    }
    /** 弧度转角度，注意 canvas 中用的都是弧度，但是角度对我们来说比较直观 */
    static radiansToDegrees(radians: number): number {
        return radians / PiBy180;
    }
    /**
     * 将 point 绕 origin 旋转 radians 弧度
     * @param {Point} point 要旋转的点
     * @param {Point} origin 旋转中心点
     * @param {number} radians 注意 canvas 中用的都是弧度
     * @returns
     */
    static rotatePoint(point: Point, origin: Point, radians: number): Point {
        const sin = Math.sin(radians),
            cos = Math.cos(radians);

        point.subtractEquals(origin);

        const rx = point.x * cos - point.y * sin;
        const ry = point.x * sin + point.y * cos;

        return new Point(rx, ry).addEquals(origin);
    }
    /** 单纯的创建一个新的 canvas 元素 */
    static createCanvasElement() {
        const canvas = document.createElement('canvas');
        return canvas;
    }
    /** 给元素添加类名 */
    static addClass(element: HTMLElement, className: string) {
        if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
            element.className += (element.className ? ' ' : '') + className;
        }
    }
    /** 计算元素偏移值 */
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
    /** 包裹元素并替换 */
    static wrapElement(element: HTMLElement, wrapper: HTMLElement | string, attributes) {
        if (typeof wrapper === 'string') {
            wrapper = Util.makeElement(wrapper, attributes);
        }
        if (element.parentNode) {
            element.parentNode.replaceChild(wrapper, element);
        }
        wrapper.appendChild(element);
        return wrapper;
    }
    /** 新建元素并添加相应属性 */
    static makeElement(tagName: string, attributes) {
        let el = document.createElement(tagName);
        for (let prop in attributes) {
            if (prop === 'class') {
                el.className = attributes[prop];
            } else {
                el.setAttribute(prop, attributes[prop]);
            }
        }
        return el;
    }
    /** 给元素设置样式 */
    static setStyle(element: HTMLElement, styles) {
        let elementStyle = element.style;

        if (typeof styles === 'string') {
            element.style.cssText += ';' + styles;
            return styles.indexOf('opacity') > -1 ? Util.setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
        }
        for (let property in styles) {
            if (property === 'opacity') {
                Util.setOpacity(element, styles[property]);
            } else {
                elementStyle[property] = styles[property];
            }
        }
        return element;
    }
    /** 设置元素透明度 */
    static setOpacity(element: HTMLElement, value: string) {
        element.style.opacity = value;
        return element;
    }
    static falseFunction() {
        return false;
    }
    /** 设置 css 的 userSelect 样式为 none，也就是不可选中的状态 */
    static makeElementUnselectable(element: HTMLElement): HTMLElement {
        element.style.userSelect = 'none';
        return element;
    }
    static addListener(element, eventName, handler) {
        element.addEventListener(eventName, handler, false);
    }
    static removeListener(element, eventName, handler) {
        element.removeEventListener(eventName, handler, false);
    }
}
