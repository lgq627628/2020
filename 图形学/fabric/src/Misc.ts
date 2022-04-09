export interface Offset {
    top: number;
    left: number;
}
export class Point {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    addEquals(point: Point): Point {
        this.x += point.x;
        this.y += point.y;
        return this;
    }
    subtractEquals(point: Point): Point {
        this.x -= point.x;
        this.y -= point.y;
        return this;
    }
}
const PiBy180 = Math.PI / 180;
export class Util {
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
    static pointerX(event) {
        return event.clientX || 0;
    }
    static pointerY(event) {
        return event.clientY || 0;
    }
    static getElementPosition(element: HTMLElement) {
        return window.getComputedStyle(element, null).position;
    }
    static degreesToRadians(degrees: number): number {
        return degrees * PiBy180;
    }
    static radiansToDegrees(radians: number): number {
        return radians / PiBy180;
    }
    /** 根据原始点坐标来旋转 */
    static rotatePoint(point: Point, origin: Point, radians): Point {
        const sin = Math.sin(radians),
            cos = Math.cos(radians);

        point.subtractEquals(origin);

        const rx = point.x * cos - point.y * sin;
        const ry = point.x * sin + point.y * cos;

        return new Point(rx, ry).addEquals(origin);
    }
    static createCanvasElement() {
        const canvas = document.createElement('canvas');
        return canvas;
    }
    static addClass(element: HTMLElement, className: string) {
        if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
            element.className += (element.className ? ' ' : '') + className;
        }
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
            } else if (prop === 'for') {
                (el as HTMLLabelElement).htmlFor = attributes[prop];
            } else {
                el.setAttribute(prop, attributes[prop]);
            }
        }
        return el;
    }
    static setStyle(element: HTMLElement, styles) {
        let elementStyle = element.style;
        if (!elementStyle) {
            return element;
        }
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
    static setOpacity(element: HTMLElement, value: string) {
        element.style.opacity = value;
        return element;
    }
    static falseFunction() {
        return false;
    }
    static makeElementUnselectable(element: HTMLElement) {
        if (typeof element.onselectstart !== 'undefined') {
            element.onselectstart = Util.falseFunction;
        }
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
