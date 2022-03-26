import { IEnumerator } from './IEnumerator';

export type Indexer = (len: number, idx: number) => number;

export function IndexerL2R(len: number, idx: number): number {
	return idx;
}

export function IndexerR2L(len: number, idx: number): number {
	return len - idx - 1;
}

export type NodeCallback<T> = (node: TreeNode<T>) => void;

export interface IAdapter<T> {
	// 推入队列或栈
	add(t: T): void;
	// 弹出队列或栈
	remove(): T | undefined;
	// 清空队列或栈
	clear(): void;
	// 判断当前队列或栈的元素个数
	length: number;
	// 判断当前队列或栈是否为空
	isEmpty: boolean;
}

export abstract class AdapterBase<T> implements IAdapter<T> {
	protected _arr: Array<T>;

	public constructor() {
		this._arr = new Array<T>();
	}

	public add(t: T): void {
		this._arr.push(t);
	}

	public abstract remove(): T | undefined;

	public get length(): number {
		return this._arr.length;
	}

	public get isEmpty(): boolean {
		return this._arr.length <= 0;
	}

	public clear(): void {
		this._arr = new Array<T>();
	}

	public toString(): string {
		return this._arr.toString();
	}
}

export class Stack<T> extends AdapterBase<T> {
	public remove(): T | undefined {
		if (this._arr.length > 0) return this._arr.pop();
		else return undefined;
	}
}

export class Queue<T> extends AdapterBase<T> {
	public remove(): T | undefined {
		if (this._arr.length > 0) return this._arr.shift();
		else return undefined;
	}
}

export class TreeNode<T> {
	// 某个节点往上为深度，往下为高度
	/*
								  树数据结构
			-------------------------root--------------------
		   /                         |                      \
		node1                       node2                  node3
	  /   |   \                    /      \                  |
 node4  node5 node6              node7   node8             node9
	|                            |         |
  node10                        node11  node12
										   |
										 node13
	*/
	public constructor(data: T | undefined = undefined, parent: TreeNode<T> | undefined = undefined, name: string = '') {
		this._parent = parent;
		this._children = undefined;
		this.name = name;
		this.data = data;
		if (this._parent !== undefined) {
			this._parent.addChild(this);
		}
	}

	public addChildAt(child: TreeNode<T>, index: number): TreeNode<T> | undefined {
		if (this.isDescendantOf(child)) {
			return undefined;
		}

		if (this._children === undefined) {
			this._children = [];
			//this._children = new Array<TreeNode<T>>();
		}

		if (index >= 0 && index <= this._children.length) {
			if (child._parent) {
				child._parent.removeChild(child);
			}
			child._parent = this;
			this._children.splice(index, 0, child);
			return child;
		} else {
			return undefined;
		}
	}

	public addChild(child: TreeNode<T>): TreeNode<T> | undefined {
		if (this._children === undefined) {
			this._children = [];
		}
		return this.addChildAt(child, this._children.length);
	}

	public removeChildAt(index: number): TreeNode<T> | undefined {
		if (this._children === undefined) return undefined;

		let child: TreeNode<T> | undefined = this.getChildAt(index);

		if (child === undefined) {
			return undefined;
		}

		this._children.splice(index, 1); // 从子节点列表中移除掉
		child._parent = undefined; // 将子节点的父亲节点设置为undefined
		return child;
	}

	public removeChild(child: TreeNode<T> | undefined): TreeNode<T> | undefined {
		if (child == undefined) {
			return undefined;
		}

		if (this._children === undefined) {
			return undefined;
		}

		let index: number = -1;
		for (let i = 0; i < this._children.length; i++) {
			if (this.getChildAt(i) === child) {
				index = i;
				break;
			}
		}

		if (index === -1) {
			return undefined;
		}

		return this.removeChildAt(index);
	}

	public remove(): TreeNode<T> | undefined {
		if (this._parent !== undefined) {
			return this._parent.removeChild(this);
		}
		return undefined;
	}

	public getChildAt(index: number): TreeNode<T> | undefined {
		if (this._children === undefined) return undefined;
		if (index < 0 || index >= this._children.length) return undefined;
		return this._children[index];
	}

	public get childCount(): number {
		if (this._children !== undefined) {
			return this._children.length;
		} else {
			return 0;
		}
	}

	public hasChild(): boolean {
		return this._children !== undefined && this._children.length > 0;
	}

	public isDescendantOf(ancestor: TreeNode<T> | undefined): boolean {
		if (ancestor === undefined) return false;
		for (let node: TreeNode<T> | undefined = this._parent; node !== undefined; node = node._parent) {
			if (node === ancestor) return true;
		}
		return false;
		// if (!ancestor) return false;
		// let parent: TreeNode<T> | undefined = this._parent;
		// while(parent) {
		//     if (parent === ancestor) return true;
		//     parent = parent._parent;
		// }
		// return false;
	}

	public get children(): Array<TreeNode<T>> | undefined {
		return this._children;
	}

	public get parent(): TreeNode<T> | undefined {
		return this._parent;
	}

	public get root(): TreeNode<T> | undefined {
		let curr: TreeNode<T> | undefined = this;
		while (curr !== undefined && curr.parent !== undefined) {
			curr = curr.parent;
		}

		return curr;
	}

	public get depth(): number {
		let curr: TreeNode<T> | undefined = this;
		let level: number = 0;
		while (curr !== undefined && curr.parent !== undefined) {
			curr = curr.parent;
			level++;
		}
		return level;
	}

	public repeatString(target: string, n: number): string {
		let total: string = '';
		for (let i = 0; i < n; i++) {
			total += target;
		}
		return total;
	}

	public visit(preOrderFunc: NodeCallback<T> | null = null, postOrderFunc: NodeCallback<T> | null = null, indexFunc: Indexer = IndexerL2R): void {
		if (preOrderFunc !== null) {
			preOrderFunc(this);
		}

		let arr: Array<TreeNode<T>> | undefined = this._children;
		if (arr !== undefined) {
			for (let i: number = 0; i < arr.length; i++) {
				let child: TreeNode<T> | undefined = this.getChildAt(indexFunc(arr.length, i));
				if (child !== undefined) {
					child.visit(preOrderFunc, postOrderFunc, indexFunc);
				}
			}
		}

		if (postOrderFunc !== null) {
			postOrderFunc(this);
		}
	}

	public visitForward(preOrderFunc: NodeCallback<T> | null = null, postOrderFunc: NodeCallback<T> | null = null): void {
		if (preOrderFunc) {
			preOrderFunc(this);
		}
		let node: TreeNode<T> | undefined = this.firstChild;
		while (node !== undefined) {
			node.visitForward(preOrderFunc, postOrderFunc);
			node = node.nextSibling;
		}
		if (postOrderFunc) {
			postOrderFunc(this);
		}
	}

	public visitBackward(preOrderFunc: NodeCallback<T> | null = null, postOrderFunc: NodeCallback<T> | null = null): void {
		if (preOrderFunc) {
			preOrderFunc(this);
		}
		let node: TreeNode<T> | undefined = this.lastChild;
		while (node !== undefined) {
			node.visitBackward(preOrderFunc, postOrderFunc);
			node = node.prevSibling;
		}
		if (postOrderFunc) {
			postOrderFunc(this);
		}
	}

	public printLevelInfo(idx: number = 0): void {
		let str: string = this.repeatString(' ', idx * 4);
		let arr: Array<TreeNode<T>> | undefined = this._children;
		if (arr !== undefined) {
			for (let i: number = 0; i < arr.length; i++) {
				let child: TreeNode<T> | undefined = this.getChildAt(i);
				if (child !== undefined) {
					child.printLevelInfo(idx + 1);
				}
			}
		}
		console.log('后根：' + str + this.name);
	}

	public printInfo(idx: number = 0): void {
		let str: string = this.repeatString(' ', idx * 4);
		console.log('先根：' + str + this.name);
		let node: TreeNode<T> | undefined = this.firstChild;
		while (node !== undefined) {
			node.printInfo(idx + 1);
			node = node.nextSibling;
		}
	}

	public printInfo2(idx: number = 0): void {
		let str: string = this.repeatString(' ', idx * 4);
		console.log('先根：' + str + this.name);
		let node: TreeNode<T> | undefined = this.lastChild;
		while (node !== undefined) {
			node.printInfo(idx + 1);
			node = node.prevSibling;
		}
	}

	public get firstChild(): TreeNode<T> | undefined {
		if (this._children !== undefined && this._children.length > 0) {
			return this._children[0];
		} else {
			return undefined;
		}
	}

	public get lastChild(): TreeNode<T> | undefined {
		if (this._children !== undefined && this._children.length > 0) {
			return this._children[this._children.length - 1];
		} else {
			return undefined;
		}
	}

	public get nextSibling(): TreeNode<T> | undefined {
		if (this._parent === undefined) {
			return undefined;
		}
		if (this._parent._children !== undefined && this._parent._children.length > 1) {
			let idx: number = -1;
			for (let i = 0; i < this._parent._children.length; i++) {
				if (this === this._parent._children[i]) {
					idx = i;
					break;
				}
			}
			if (idx !== this._parent._children.length - 1) {
				return this._parent._children[idx + 1];
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	}

	public get prevSibling(): TreeNode<T> | undefined {
		if (this._parent === undefined) {
			return undefined;
		}
		if (this._parent._children !== undefined && this._parent._children.length > 1) {
			let idx: number = -1;
			for (let i = 0; i < this._parent._children.length; i++) {
				if (this === this._parent._children[i]) {
					idx = i;
					break;
				}
			}
			if (idx !== 0) {
				return this._parent._children[idx - 1];
			} else {
				return undefined;
			}
		} else {
			return undefined;
		}
	}

	public get mostRight(): TreeNode<T> | undefined {
		let node: TreeNode<T> | undefined = this;
		while (true) {
			let subNode: TreeNode<T> | undefined = undefined;
			if (node !== undefined) {
				subNode = node.lastChild;
			}
			if (subNode === undefined) {
				break;
			}
			node = subNode;
		}
		return node;
	}

	public get mostLeft(): TreeNode<T> | undefined {
		let node: TreeNode<T> | undefined = this;
		while (true) {
			let subNode: TreeNode<T> | undefined = undefined;
			if (node !== undefined) {
				subNode = node.firstChild;
			}
			if (subNode === undefined) {
				break;
			}
			node = subNode;
		}
		return node;
	}

	public moveNext(): TreeNode<T> | undefined {
		let ret: TreeNode<T> | undefined = this.firstChild;
		if (ret !== undefined) {
			return ret;
		}
		ret = this.nextSibling;
		if (ret !== undefined) {
			return ret;
		}
		ret = this;
		while (ret !== undefined && ret.nextSibling === undefined) {
			ret = ret.parent;
		}
		if (ret !== undefined) {
			return ret.nextSibling;
		}
		return undefined;
	}

	public movePrev(): TreeNode<T> | undefined {
		let ret: TreeNode<T> | undefined = this.lastChild;
		if (ret !== undefined) {
			return ret;
		}
		ret = this.prevSibling;
		if (ret !== undefined) {
			return ret;
		}
		ret = this;
		while (ret !== undefined && ret.prevSibling === undefined) {
			ret = ret.parent;
		}
		if (ret !== undefined) {
			return ret.prevSibling;
		}
		return undefined;
	}

	public moveNextPost(): TreeNode<T> | undefined {
		let next: TreeNode<T> | undefined = this.nextSibling;
		if (next === undefined) {
			return this.parent;
		}

		let first: TreeNode<T> | undefined = undefined;
		while (next !== undefined && (first = next.firstChild)) {
			next = first;
		}

		return next;
	}

	public movePrevPost(): TreeNode<T> | undefined {
		let prev: TreeNode<T> | undefined = this.prevSibling;
		if (prev === undefined) {
			return this.parent;
		}
		let last: TreeNode<T> | undefined = undefined;
		while (prev !== undefined && (last = prev.lastChild)) {
			prev = last;
		}
		return prev;
	}

	private _parent: TreeNode<T> | undefined;
	private _children: Array<TreeNode<T>> | undefined;

	public name: string;
	public data: T | undefined;
}

export class LinkTreeNode<T> {
	private _parent: LinkTreeNode<T> | undefined;
	private _firstChild: LinkTreeNode<T> | undefined;
	private _lastChild: LinkTreeNode<T> | undefined;
	private _nextSibling: LinkTreeNode<T> | undefined;
	private _prevSibling: LinkTreeNode<T> | undefined;

	public name: string = '';
	public data: T | undefined;
}

export class NodeT2BEnumerator<T, IdxFunc extends Indexer, Adapter extends IAdapter<TreeNode<T>>> implements IEnumerator<TreeNode<T>> {
	private _node: TreeNode<T> | undefined;
	private _adapter!: IAdapter<TreeNode<T>>;
	private _currNode!: TreeNode<T> | undefined;
	private _indexer!: IdxFunc;

	public constructor(node: TreeNode<T> | undefined, func: IdxFunc, adapter: new () => Adapter) {
		if (node === undefined) {
			return;
		}
		this._node = node;
		this._indexer = func;
		this._adapter = new adapter();

		this._adapter.add(this._node);
		this._currNode = undefined;
	}

	public reset(): void {
		if (this._node === undefined) {
			return;
		}
		this._currNode = undefined;
		this._adapter.clear();
		this._adapter.add(this._node);
	}

	public moveNext(): boolean {
		if (this._adapter.isEmpty) {
			return false;
		}

		this._currNode = this._adapter.remove();
		if (this._currNode != undefined) {
			let len: number = this._currNode.childCount;
			for (let i = 0; i < len; i++) {
				let childIdx: number = this._indexer(len, i);
				let child: TreeNode<T> | undefined = this._currNode.getChildAt(childIdx);
				if (child !== undefined) {
					this._adapter.add(child);
				}
			}
		}
		return true;
	}

	public get current(): TreeNode<T> | undefined {
		return this._currNode;
	}
}

export class NodeB2TEnumerator<T> implements IEnumerator<TreeNode<T>> {
	private _iter: IEnumerator<TreeNode<T>>;
	private _arr!: Array<TreeNode<T> | undefined>;
	private _arrIdx!: number;
	public constructor(iter: IEnumerator<TreeNode<T>>) {
		this._iter = iter;
		this.reset();
	}

	public reset(): void {
		this._arr = [];
		while (this._iter.moveNext()) {
			this._arr.push(this._iter.current);
		}
		this._arrIdx = this._arr.length;
	}

	public get current(): TreeNode<T> | undefined {
		if (this._arrIdx >= this._arr.length) {
			return undefined;
		} else {
			return this._arr[this._arrIdx];
		}
	}

	public moveNext(): boolean {
		this._arrIdx--;
		return this._arrIdx >= 0 && this._arrIdx < this._arr.length;
	}
}

export type NIter<T> = NodeT2BEnumerator<T, Indexer, IAdapter<TreeNode<T>>>;

export class NodeEnumeratorFactory {
	public static create_df_l2r_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(node, IndexerR2L, Stack);
		return iter;
	}

	public static create_df_r2l_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(node, IndexerL2R, Stack);
		return iter;
	}

	public static create_bf_l2r_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(node, IndexerL2R, Queue);
		return iter;
	}
	public static create_bf_r2l_t2b_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeT2BEnumerator(node, IndexerR2L, Queue);
		return iter;
	}

	public static create_df_l2r_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator<T>(NodeEnumeratorFactory.create_df_r2l_t2b_iter(node));
		return iter;
	}

	public static create_df_r2l_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator<T>(NodeEnumeratorFactory.create_df_l2r_t2b_iter(node));
		return iter;
	}

	public static create_bf_l2r_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator<T>(NodeEnumeratorFactory.create_bf_r2l_t2b_iter(node));
		return iter;
	}

	public static create_bf_r2l_b2t_iter<T>(node: TreeNode<T> | undefined): IEnumerator<TreeNode<T>> {
		let iter: IEnumerator<TreeNode<T>> = new NodeB2TEnumerator<T>(NodeEnumeratorFactory.create_bf_l2r_t2b_iter(node));
		return iter;
	}
}


// 如何最小序列化存储内容，并且解决循环引用的问题呢？
// 1、分离内存表示的树节点和序列化存储表示的树节点，例如现在需要将树节点的层次关系（必须）和节点名称（可选）序列化成JSON字符串，那么可以定义如下序列化存储结构
export class NodeData {
	// 节点的父亲索引号，节点必须要序列化的成员变量，否则无法表示出树节点的层次性
	// parentIdx的数据类型是number，这样就能正确地序列化成JSON字符串
	public parentIdx: number;
	public name: string;  // 节点名称，可选的成员变量
	public constructor(name: string, parentIdx: number) {
		this.name = name;
		this.parentIdx = parentIdx;
	}
	// 2、以深度优先，从上到下（先根前序）的方式将树节点输出到数组中，并且以相应的顺序构建NodeData数组，设定NodeData的名称，初始化时，将parentIdx设定为-1，表示无父亲节点。
	public static convertTreeToJsonString<T>(node: TreeNode<T>): string {
		let nodes: Array<TreeNode<T>> = [];
		// 深度优先、从上到下（先根前序）保存树节点
		let datas: Array<NodeData> = [];
		for (let n: TreeNode<T> | undefined = node; n !== undefined; n =
			n.moveNext()) {
			// NodeData和node在数组中的顺序是一一对应的，此时可以确定存储名称，但是层次关系还不正确，需要后续处理，因此设定为 - 1
			datas.push(new NodeData(n.name, -1));
			nodes.push(n);
		}
		// 扫描节点数组，查询当前节点的父亲节点在深度优先、从上到下（先根前序）顺序存储的数组中的索引号，将该索引号赋值给对应位置的NodeData对象的parentIdx属性。
		for (let i: number = 0; i < datas.length; i++) {
			// 获取当前节点的parent
			let parent: TreeNode<T> | undefined = nodes[i].parent;
			// 如果当前节点的父亲节点为undefined，则肯定是根节点，根节点的父亲节点为-1
			if (parent === undefined) {
				datas[i].parentIdx = -1;
			} else {
				// 查找当前节点的parent在深度优先的数组中的索引号
				for (let j: number = 0; j < datas.length; j++) {
					// 也可以用名称比较，更好的方式用地址比较
					// if ( parent . name === nodes [ j ] . name )
					if (parent === nodes[j]) {
						datas[i].parentIdx = j;
					}
				}
			}
		}
		// 使用stringify方法进行object到string的序列化操作
		// 因为使用NodeData存储树节点的层次关系，而且parentIdx是number类型，指向的是深度优先、从上到下（先根前序）顺序方式存储的数组中，因此解决了自引用的问题
		return JSON.stringify(datas);
	}
	public static convertJsonStringToTree<T>(json: string): TreeNode<T> | undefined {
		// 首先使用JSON . parse方法，将json字符串反序列化成Array对象（datas）
		let datas: [] = JSON.parse(json);
		let data !: NodeData;
		let nodes: TreeNode<T>[] = [];
		// 根据NodeData列表生成节点数组
		for (let i: number = 0; i < datas.length; i++) {
			// 将datas中每个元素都转型为NodeData对象
			data = datas[i] as NodeData;
			// 如果当前的NodeData的parentidx为-1，表示根节点
			// 实际上，datas是深度优先，从上到下（先根前序）顺序存储的
			// 因此datas [ 0 ]肯定是根节点
			if (data.parentIdx === -1) {
				nodes.push(new TreeNode<T>(undefined, undefined, data.
					name));
			}
			else {  // 不是-1，说明有父亲节点
				// 利用了深度优先，从上到下（先根前序）顺序存储的nodes数组的特点
				// 当前节点的父亲节点总是已经存在nodes中了
				// 在先根存储的数组中，父亲节点总是在儿子节点的前面，因此序列化如果是后根遍历存储，那么下面的代码就会崩溃，因为后根存储的数组最大特点是，儿子节点在父亲节点的前面，此时nodes[data.parentIdx] 返回的是undefined，在形成树结构遍历时，导致程序崩溃
				nodes.push(new TreeNode<T>(undefined, nodes[data.
					parentIdx], data.name));
			}
		}
		// 返回反序列化中的根节点
		return nodes[0];
	}
}
