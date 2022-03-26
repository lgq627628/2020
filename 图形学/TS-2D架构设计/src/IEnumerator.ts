export interface IEnumerator<T> {
	// 将迭代器重置为初始位置
	reset(): void;

	// 如果没越界，moveNext将current设置为下一个元素，并返回true
	// 如果已越界，moveNext返回false
	moveNext(): boolean;

	// 获取当前的元素
	readonly current: T | undefined;
}

// 容器对象如果要支持迭代器模式，需要实现IEnumerable < T > 泛型接口
export interface IEnumerable<T> {
	getEnumerator(): IEnumerator<T>;
}
