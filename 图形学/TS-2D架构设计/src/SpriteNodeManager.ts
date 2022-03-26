import { CanvasKeyboardEvent, CanvasMouseEvent, EInputEventType } from './CnavasInputEvent';
import { ERenderType, IDispatcher, ISprite, ISpriteContainer } from './ISprite';
import { SpriteFactory } from './SpriteFactory';
import { SpriteNode } from './SpriteNode';
import { TreeNode } from './TreeNode';

export class SpriteNodeManager implements IDispatcher {
	private _rootNode: SpriteNode;
	// 所有鼠标拖动事件都发送到该精灵上
	private _dragSprite: ISprite | undefined = undefined;

	// 对于 _rootNode, 让它 直接挂接一个grid类型的精灵

	public constructor(width: number, height: number) {
		let spr: ISprite = SpriteFactory.createSprite(SpriteFactory.createGrid(width, height));
		spr.name = 'root';
		spr.strokeStyle = 'black';
		spr.fillStyle = 'white';
		spr.renderType = ERenderType.STROKE_FILL;
		// 无父节点， 是根节点
		this._rootNode = new SpriteNode(spr, undefined, spr.name);
		spr.owner = this._rootNode;
	}

	public get container(): ISpriteContainer {
		return this._rootNode;
	}

	public dispatchMouseEvent(evt: CanvasMouseEvent): void {
		if (evt.type === EInputEventType.MOUSEUP) {
			this._dragSprite = undefined;
		} else if (evt.type === EInputEventType.MOUSEDRAG) {
			if (this._dragSprite !== undefined) {
				if (this._dragSprite.mouseEvent !== null) {
					this._dragSprite.mouseEvent(this._dragSprite, evt);
					// 处理后直接退出
					return;
				}
			}
		}

		let spr: ISprite | undefined = this._rootNode.findSprite(evt.canvasPos, evt.localPosition);
		if (spr !== undefined) {
			evt.hasLocalPosition = true;
			if (evt.button === 0 && evt.type === EInputEventType.MOUSEDOWN) {
				this._dragSprite = spr;
			}
			if (evt.type === EInputEventType.MOUSEDRAG) {
				return;
			}
			if (spr.mouseEvent) {
				spr.mouseEvent(spr, evt);
				return;
			}
		} else {
			evt.hasLocalPosition = false;
		}
	}

	// 键盘触发最简单处理方式，遍历整个场景图，让每个场景图中具有键盘事件处理函数的精灵都触发一次键盘事件
	public dispatchKeyEvent(evt: CanvasKeyboardEvent): void {
		this._rootNode.visit((node: TreeNode<ISprite>): void => {
			if (node.data !== undefined) {
				if (node.data.keyEvent !== null) {
					node.data.keyEvent(node.data, evt);
				}
			}
		});
	}

	public dispatchUpdate(msec: number, diffSec: number): void {
		this._rootNode.update(msec, diffSec);
	}

	public dispatchDraw(context: CanvasRenderingContext2D): void {
		this._rootNode.draw(context);
	}
}
