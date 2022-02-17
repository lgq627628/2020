import { CanvasMouseEvent, EInputEventType } from '../src/CnavasInputEvent';
import { Canvas2DUtil } from '../src/Cavans2DUtil';
import { Inset } from '../src/border';
import { Math2D, vec2 } from '../src/math2D';
import { EOrder, ERenderType, IShape, ISprite } from '../src/ISprite';
import { Scale9Data } from '../src/Shape/Scale9Grid';
import { Sprite2DApplication } from '../src/Sprite2DApplication';
import { SpriteFactory } from '../src/SpriteFactory';

class ShapeDemo {
	// 引用一个 Sprite2DApplication 对象
	private _app: Sprite2DApplication;

	// 对于九宫格缩放的图像对象
	private _image: HTMLImageElement;

	// 将添加到的 IShape 存放在该数组中
	private _shapes: IShape[] = [];
	// 用来追踪添加的 IShape 的索引号
	private _idx: number;
	// 下面的变量用来记录选中的精灵原本的颜色
	private _lastColor: string | CanvasGradient | CanvasPattern;

	public constructor(app: Sprite2DApplication) {
		this._lastColor = 'red';
		this._app = app;
		this._idx = 0;

		// 创建 HTMLImageElement 对象
		this._image = document.createElement('img') as HTMLImageElement;
		// 设置要载入的图片 URL 路径
		this._image.src = '/static/scale9.png';
		this._image.onload = (ev: Event): void => {
			this._createShapes();
			this._createSprites();
			this._app.start();
		};
	}

	// 创建享元类 IShape 接口
	private _createShapes(): void {
		this._shapes = [];
		this._shapes.push(SpriteFactory.createLine(vec2.create(0, 0), vec2.create(100, 0)));
		this._shapes.push(SpriteFactory.createXLine(100, 0.5));
		// 创建不同位置的 Rect
		this._shapes.push(SpriteFactory.createRect(10, 10));
		this._shapes.push(SpriteFactory.createRect(10, 10, 0.5, 0.5));
		this._shapes.push(SpriteFactory.createRect(10, 10, 0.5, 0));
		this._shapes.push(SpriteFactory.createRect(10, 10, 0, 0.5));
		this._shapes.push(SpriteFactory.createRect(10, 10, -0.5, 0.5));
		// 创建圆、椭圆
		this._shapes.push(SpriteFactory.createCircle(10));
		this._shapes.push(SpriteFactory.createEllipse(10, 15));
		let points: vec2[];
		// 创建三角型
		points = [vec2.create(0, 0), vec2.create(20, 0), vec2.create(20, 20)];
		this._shapes.push(SpriteFactory.createPolygon(points));
		// 创建六边形
		points = [vec2.create(20, 0), vec2.create(10, 20), vec2.create(-10, 20), vec2.create(-20, 0), vec2.create(-10, -20), vec2.create(10, -20)];
		this._shapes.push(SpriteFactory.createPolygon(points));
		// 创建九宫缩放 IShape
		let data: Scale9Data = new Scale9Data(this._image, new Inset(30, 30, 30, 30));
		this._shapes.push(SpriteFactory.createScale9Grid(data, 300, 100, 0.5, 0.5));
	}

	// 创建 grid 及初始化
	private _createSprites(): void {
		// 创建与画布想听尺寸的grid 形体和精灵
		let grid: IShape = SpriteFactory.create9Grid(this._app.canvas.width, this._app.canvas.height);
		let gridSprite: ISprite = SpriteFactory.createSprite(grid, 'gird');
		// 白色填充，黑色网格线
		gridSprite.fillStyle = 'white';
		gridSprite.strokeStyle = '#eee';
		// 将精灵添加到 ISpriteContainer
		this._app.rootContainer.addSprite(gridSprite);
		// 设置精灵的鼠标事件处理函数
        console.log(gridSprite);
		gridSprite.mouseEvent = (s: ISprite, evt: CanvasMouseEvent): void => {
            console.log('???');
			if (this._shapes.length === 0) return;
            console.log('1111');
			// girdSprite 仅对鼠标右键单击做出响应，不响应鼠标中键和左键
			if (evt.button === 2) {
                console.log('2222', evt, evt.type);
				if (evt.type === EInputEventType.MOUSEUP) {
                    console.log('3333');
					// 使用 %取模操作，获得周期性的索引 [ 0, 1, 2, ...., 0, 1, 2 ]
					this._idx = this._idx % this._shapes.length;
					// 然后生成使用 IShape 的精灵
					let sprite: ISprite = SpriteFactory.createSprite(this._shapes[this._idx]);
					// 让精灵位于鼠标单击的位置
					sprite.x = evt.canvasPos.x;
					sprite.y = evt.canvasPos.y;
					// 对于非 ScaleGrid 类型的 IShape 对象，则随机获得 - 180 ~ 180° 之间的方位
					if (sprite.shape.type !== 'Scale9Grid') {
						sprite.rotation = Math2D.random(-180, 180);
					}
					// default 情况下，设置精灵的渲染类型为 FILL
					sprite.renderType = ERenderType.FILL;
					// 线段类型不用每次都旋转
					if (this._shapes[this._idx].type === 'Line') {
						sprite.renderType = ERenderType.STROKE;
						sprite.scaleX = Math2D.random(1, 2);
						// 随机描边颜色
						sprite.strokeStyle = Canvas2DUtil.Colors[Math.floor(Math2D.random(3, Canvas2DUtil.Colors.length - 1))];
					} else {
						sprite.fillStyle = Canvas2DUtil.Colors[Math.floor(Math2D.random(3, Canvas2DUtil.Colors.length - 1))];
						// 随机颜色
						// 圆圈类型，等比缩放，否则大部分情况下变椭圆
						if (this._shapes[this._idx].type === 'Circle') {
							let scale: number = Math2D.random(1, 3);
							sprite.scaleX = scale;
							sprite.scaleY = scale;
						} else if (this._shapes[this._idx].type !== 'Scale9Grid') {
							// 非 Scale9Grid 随机等比缩放 1 ~ 3
							sprite.scaleX = Math2D.random(1, 3);
							sprite.scaleY = Math2D.random(1, 3);
						}
					}
					// 对于精灵，挂载两个事件回调函数
					sprite.mouseEvent = this.mouseEventHandler.bind(this);
					sprite.updateEvent = this.updateEventHandler.bind(this);

					this._app.rootContainer.addSprite(sprite);
					this._idx++;
                    console.log('4444');
				}
			}
		};
	}

	private updateEventHandler(s: ISprite, msec: number, diffSec: number, order: EOrder): void {
		// update 分发，从前到后，然后从后到前，触发两次 update 事件
		if (order === EOrder.POSTORDER) {
			return;
		}
		if (s.shape.type !== 'Circle' && s.shape.type !== 'Line' && s.shape.type !== 'Scale9Grid') {
			s.rotation += 100 * diffSec;
		}
	}

	private mouseEventHandler(s: ISprite, evt: CanvasMouseEvent) {
        console.log('666');
		if (evt.button === 0) {
			if (evt.type === EInputEventType.MOUSEDOWN) {
				if (s.shape.type === 'Line') {
					this._lastColor = s.strokeStyle;
					s.strokeStyle = 'red';
					s.lineWidth = 10;
				} else {
					this._lastColor = s.fillStyle;
					s.fillStyle = 'red';
				}
			} else if (evt.type === EInputEventType.MOUSEUP) {
				if (s.shape.type === 'Line') {
					s.lineWidth = 1;
					s.strokeStyle = this._lastColor;
				} else {
					s.fillStyle = this._lastColor;
				}
			} else if (evt.type === EInputEventType.MOUSEDRAG) {
				s.x = evt.canvasPos.x;
				s.y = evt.canvasPos.y;
			}
		}
	}
}

document.oncontextmenu = function (event) {
    event.preventDefault();
};

const canvas: HTMLCanvasElement | null = document.getElementById('canvas') as HTMLCanvasElement;
const app: Sprite2DApplication = new Sprite2DApplication(canvas);
const shapes = new ShapeDemo(app);

(window as any).shapes = shapes;