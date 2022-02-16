import { CanvasKeyboardEvent, CanvasMouseEvent, EInputEventType } from './CnavasInputEvent';
import { Math2D, mat2d } from './math2D';
import { EOrder, IDispatcher, ISprite, ISpriteContainer } from './ISprite';

export class Sprite2DManager implements ISpriteContainer, IDispatcher {
	public name: string = 'sprite2dManager';
	private _sprites: ISprite[] = []; // 数组存放 ISprite 接口实例对象
	public addSprite(sprite: ISprite): ISpriteContainer {
		sprite.owner = this;
		this._sprites.push(sprite);
		return this;
	}

	public removeSpriteAt(idx: number): void {
		// 数组的 splice 的方法： 从 idx 开始删除 1 个元素
		this._sprites.splice(idx, 1);
	}

	public removeSprite(sprite: ISprite): boolean {
		// 根据sprite 查找索引号
		let idx = this.getSpriteIndex(sprite);
		if (idx !== -1) {
			// 如果找到，就删除，并返回 true
			this.removeSpriteAt(idx);
			return true;
		}
		// 如果没有找到，返回false
		return false;
	}

	public removeAll(): void {
		// 我们有 4 种数组情况的方法，具体来看一下

		// 第一种： 调用实现的 removeSpriteAt 方法
		// for (let i = this._sprites.length - 1; i >= 0; i--) {
		// 	this.removeSpriteAt(i);
		// }

		// 第二种：调用 pop 方法
		// for (let i = this._sprites.length - 1; i >= 0; i--) {
		// 	this._sprites.pop();
		// }

		// 第三种：直接将数组的length 至为 0
		// this._sprites.length = 0;

		// 第四种：重新生成一个新的数组赋值给 this._sprites 变量
		this._sprites = [];
	}

	public getSprite(idx: number): ISprite {
		if (idx < 0 || idx > this._sprites.length - 1) {
			throw new Error('参数 idx 越界');
		}

		return this._sprites[idx];
	}

	public getSpriteCount(): number {
		return this._sprites.length;
	}

	public getSpriteIndex(sprite: ISprite): number {
		for (let i = 0; i < this._sprites.length; i++) {
			if (this._sprites[i] === sprite) {
				return i;
			}
		}
		return -1;
	}

	// IDispatch 接口实现
	// 由 _dragSprite 接受 drag 事件的处理
	// 也就是说，drag 事件都是发送到 _dragSprite 精灵的
	private _dragSprite: ISprite | undefined = undefined;

	public get container(): ISpriteContainer {
		return this;
	}

	// 分发 update 事件
	public dispatchUpdate(msec: number, diff: number): void {
		// 从前到后遍历精灵数组，触发 PREORDER updateEvent
		for (let i = 0; i < this._sprites.length; i++) {
			this._sprites[i].update(msec, diff, EOrder.PREORDER);
		}
		// 从后到前遍历经理数组，触发 POSTORDER updateEvent
		for (let i = this._sprites.length - 1; i >= 0; i--) {
			this._sprites[i].update(msec, diff, EOrder.POSTORDER);
		}
	}

	// 分发 draw 命令
	public dispatchDraw(context: CanvasRenderingContext2D): void {
		// 从前到后遍历精灵数组，调用 draw 方法
		// 从绘制的顺序先添加精灵的绘制，后添加的精灵后绘制
		for (let i = 0; i < this._sprites.length; i++) {
			this._sprites[i].draw(context);
		}
	}

	// 分发键盘事件，采用最简单的方式
	public dispatchKeyEvent(evt: CanvasKeyboardEvent): void {
		// 遍历精灵，凡是有键盘处理事件的都触发该事件
		for (let i = 0; i < this._sprites.length; i++) {
			let spr = this._sprites[i];
			if (spr.keyEvent) {
				spr.keyEvent(spr, evt);
			}
		}
	}

	// 分发鼠标事件，采用最简单的方式
	public dispatchMouseEvent(evt: CanvasMouseEvent): void {
		// 每次按下鼠标时，将_dragSprite 设置为当前鼠标指针下面的那个精灵
		// 每次释放精灵时，将_dragSprite 设置为 undefined
		if (evt.type === EInputEventType.MOUSEUP) {
			this._dragSprite = undefined;
		} else if (evt.type === EInputEventType.MOUSEDRAG) {
			// 触发 drag 事件， 由 dragSprite 接受并处理
			if (this._dragSprite !== undefined) {
				if (this._dragSprite.mouseEvent !== null) {
					this._dragSprite.mouseEvent(this._dragSprite, evt);
					return;
				}
			}
		}
		let spr: ISprite;
		// 遍历精灵数组，注意从后向前的遍历顺序
		// 绘制的时候，以由前往后的方式遍历，这样可以保证绘制的深度正确性
		for (let i = this._sprites.length - 1; i >= 0; i--) {
			spr = this._sprites[i];
			// 获取当前的局部矩阵
			let mat: mat2d | null = spr.getLocalMatrix();
			// 将全局表示的 canvasPosition 点变换到相对当前精灵局部坐标系表示：localPosition
			Math2D.transform(mat, evt.canvasPos, evt.canvasPos);
			// 要测试的点和精灵必须在同一个坐标系中，切记
			// 如果碰撞检测成功，说明选中该精灵
			if (spr.hitTest(evt.canvasPos)) {
				evt.hasLocalPosition = true;
				// 鼠标按下并且点选选中精灵时，记录下来
				// 后续的 drag 事件都是发送到该精灵上的
				if (evt.type === EInputEventType.MOUSEDOWN) {
					this._dragSprite = spr;
				}
				if (evt.type === EInputEventType.MOUSEDRAG) {
					return;
				}
				// 如果有选中的精灵，并且有事件处理程序，则立刻触发该事件处理程序
				if (spr.mouseEvent) {
					spr.mouseEvent(spr, evt);
					return;
				}
			}
		}
	}
}