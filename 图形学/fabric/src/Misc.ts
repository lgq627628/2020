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
        return point;
    }
    subtractEquals(point: Point): Point {
        return point;
    }
}
const PiBy180 = Math.PI / 180;
export class Util {
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
