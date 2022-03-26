import { IEnumerator } from './IEnumerator';
import { Math2D, mat2d, vec2 } from './math2D';
import { EOrder, ISprite, ISpriteContainer } from './ISprite';
import { NodeEnumeratorFactory, TreeNode } from './TreeNode';

export class SpriteNode extends TreeNode<ISprite> implements ISpriteContainer {
	public constructor(sprite: ISprite, parent: SpriteNode | undefined, name: string = 'spriteNode') {
		// 调用 TreeNode 基类构造函数，依附那个精灵、是否将该精灵添加到父节点中，以及是否要名字
		super(sprite, parent);
	}

	// 添加儿子精灵
	public addSprite(sprite: ISprite): ISpriteContainer {
		let node: SpriteNode = new SpriteNode(sprite, this, sprite.name);
		return node;
	}

	// 移除儿子精灵
	public removeSprite(sprite: ISprite): boolean {
		let idx: number = this.getSpriteIndex(sprite);
		if (idx === -1) {
			return false;
		}
		if (this.removeChildAt(idx) === undefined) {
			return false;
		} else {
			return true;
		}
	}

	// 删除整颗树
	public removeAll(includeThis: boolean): void {
		// 删除树节点，要以底向上，深度优先为顺序
		let iter: IEnumerator<TreeNode<ISprite>> = NodeEnumeratorFactory.create_bf_r2l_b2t_iter(this);
		let current: TreeNode<ISprite> | undefined = undefined;
		while (iter.moveNext()) {
			current = iter.current;
			if (current !== undefined) {
				if (current.data !== undefined) {
					if (current === this) {
						if (includeThis === true) {
							current.data = undefined;
							current = current.remove();
						}
					} else {
						current.data = undefined;
						current = current.remove();
					}
				}
			}
		}
	}

	// 获取索引号为 idx 的子精灵
	public getSprite(idx: number): ISprite {
		if (idx < 0 || idx > this.childCount - 1) {
			throw new Error('参数 idx 越界！');
		}
		let spr: ISprite | undefined = (this.getChildAt(idx) as SpriteNode).sprite;
		if (spr === undefined) {
			throw new Error('sprite 为 undefined, 请检查原因');
		}
		return spr;
	}

	// 获取父精灵
	public getParentSprite(): ISprite | undefined {
		let parent: SpriteNode | undefined = this.parent as SpriteNode;
		if (parent !== undefined) {
			return parent.sprite;
		} else {
			return undefined;
		}
	}

	// 获取儿子数量
	public getSpriteCount(): number {
		return this.childCount;
	}

	// 查询参数精灵在子精灵列表中的索引号
	public getSpriteIndex(sprite: ISprite): number {
		for (let i: number = 0; i < this.childCount; i++) {
			let child: SpriteNode = this.getChildAt(i) as SpriteNode;
			if (child !== undefined) {
				if (child.sprite !== undefined) {
					if (child.sprite === sprite) {
						return i;
					}
				}
			}
		}
		return -1;
	}

	// 很重要的一个函数，override 基类方法
	public addChildAt(child: TreeNode<ISprite>, index: number): TreeNode<ISprite> | undefined {
		// 调用基类方法，这样就能添加 child 子节点
		let ret: TreeNode<ISprite> | undefined = super.addChildAt(child, index);
		// 如果成功
		if (ret !== undefined) {
			// 并且儿子附有精灵
			if (ret.data) {
				// 设置儿子附加的精灵 owner
				// 这样能从 SpriteNode. data 找到 精灵对象
				// 而且也能从精灵对象找到其所依附的节点
				ret.data.owner = ret as SpriteNode;
			}
		}

		return ret;
	}

	public get sprite(): ISprite | undefined {
		return this.data;
	}

	// 数学系统支持的方法
	// 给定一个点，查找该点最先发生碰撞的那个精灵
	// 并且如果 localPoint 参数不为null ，且选中精灵时，返回 src 在该精灵坐标系局部表示的点坐标
	public findSprite(src: vec2, localPt: vec2 | null = null): ISprite | undefined {
		let iter: IEnumerator<TreeNode<ISprite>> = NodeEnumeratorFactory.create_bf_r2l_b2t_iter(this.root);
		let current: TreeNode<ISprite> | undefined = undefined;
		let mat: mat2d;
		let dest: vec2 = vec2.create();
		while (iter.moveNext()) {
			current = iter.current;
			if (current !== undefined) {
				if (current.data !== undefined) {
					mat = current.data.getLocalMatrix();
					// 将全局表示的点变换到当前的精灵所在的坐标系
					Math2D.transform(mat, src, dest);
					// 进行碰撞检测
					if (current.data.hitTest(dest)) {
						// 如果碰撞检测成功
						if (localPt !== null) {
							// 输出局部表示的点坐标
							localPt.x = dest.x;
							localPt.y = dest.y;
						}
						return current.data;
					}
				}
			}
		}
		// 到这里说明没有找到碰撞的精灵，返回 undefined
		return undefined;
	}

	// update
	public update(msec: number, diffSec: number): void {
		if (this.sprite !== undefined) {
			this.sprite.update(msec, diffSec, EOrder.PREORDER);
			this._updateChildren(msec, diffSec);
			this.sprite.update(msec, diffSec, EOrder.POSTORDER);
		}
	}

	protected _updateChildren(msec: number, diffSec: number): void {
		for (let i = 0; i < this.childCount; i++) {
			let child: TreeNode<ISprite> | undefined = this.getChildAt(i);
			if (child !== undefined) {
				let spriteNode: SpriteNode = child as SpriteNode;
				spriteNode.update(msec, diffSec);
			}
		}
	}

	public draw(context: CanvasRenderingContext2D): void {
		if (this.sprite !== undefined) {
			this.sprite.draw(context);
			this._drawChildren(context);
		}
	}

	protected _drawChildren(context: CanvasRenderingContext2D): void {
		// 深度优先，从 上到下，从左到右递归遍历
		for (let i: number = 0; i < this.childCount; i++) {
			let child: TreeNode<ISprite> | undefined = this.getChildAt(i);
			if (child !== undefined) {
				let spriteNode: SpriteNode = child as SpriteNode;
				spriteNode.draw(context);
			}
		}
	}
}
