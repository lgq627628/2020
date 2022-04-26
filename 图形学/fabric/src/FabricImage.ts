import { FabricObject } from './FabricObject';
import { Util } from './Util';

export class FabricImage extends FabricObject {
    public type: string = 'image';
    public _element: HTMLImageElement;
    /** 默认通过 img 标签来绘制，因为最终都是要通过该标签绘制的 */
    constructor(element: HTMLImageElement, options) {
        super(options);
        this._initElement(element, options);
    }
    _initElement(element: HTMLImageElement, options) {
        this.setElement(element, options);
    }
    setElement(element: HTMLImageElement, options) {
        this._element = element;
        this._initConfig(options);
        return this;
    }
    _initConfig(options = {}) {
        this.setOptions(options);
        this._setWidthHeight(options);
    }
    /** 设置图像大小 */
    _setWidthHeight(options) {
        this.width = 'width' in options ? options.width : this.getElement() ? this.getElement().width || 0 : 0;
        this.height = 'height' in options ? options.height : this.getElement() ? this.getElement().height || 0 : 0;
    }
    getElement() {
        return this._element;
    }
    /** 直接调用 drawImage 绘制图像 */
    _render(ctx: CanvasRenderingContext2D, noTransform: boolean = false) {
        let x, y, elementToDraw;

        x = noTransform ? this.left : -this.width / 2;
        y = noTransform ? this.top : -this.height / 2;

        elementToDraw = this._element;
        elementToDraw && ctx.drawImage(elementToDraw, x, y, this.width, this.height);
    }
    /** 如果是根据 url 或者本地路径加载图像，本质都是取加载图片完成之后在转成 img 标签 */
    static fromURL(url, callback, imgOptions) {
        Util.loadImage(url).then((img) => {
            callback && callback(new FabricImage(img as HTMLImageElement, imgOptions));
        });
    }
    static async = true;
}
