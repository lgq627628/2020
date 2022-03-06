## html2canvas 原理解析
- 1.把要截图的dom克隆一份，过程中把getComputedStyle附上style
- 2.把克隆的dom转成类似VirtualDom的对象
- 3.递归这个对象，根据父子关系、层叠关系来计算出一个renderQueue
- 4.每个renderQueue Item都是一个虚拟dom对象，根据之前getComputedStyle得到的style信息，调用ctx的各种方法


1、是先解析dom元素，抽取关键信息，如样式，位置信息等，形成父子关系的树
2、遍历第一步的树，形成一个stack 里面分别装着7种情况的dom树
3、生成一个render渲染器， 根据stack 7种情况，用canvas去渲染这7种情况
4、返回这个离屏canvas即可。


总结：
性能：如果文本多，节点少，svg foreignObject的方式往往性能更高；文本少，节点多的时候，canvas反而性能更高
准确性：纯canvas方式往往更准确的还原dom的表现；svg foreignObject在比较复杂的情况下会出现截图不准确的问题
综上所述，建议使用纯canvas方式，但是注意要对文本进行限流！


```js
const renderElement = async (element: HTMLElement, opts: Partial<Options>): Promise<HTMLCanvasElement> => {
    const renderOptions = {...defaultOptions, ...opts}; // 合并默认配置和用户配置
    const root = parseTree(element); // 解析用户传入的DOM元素（为了不影响原始的DOM，实际上会克隆一个新的DOM元素），获取节点信息
    const renderer = new CanvasRenderer(renderOptions); // 根据渲染的配置数据生成canvasRenderer实例
    return await renderer.render(root); // canvasRenderer实例会根据解析到的节点信息，依据浏览器渲染层叠内容的规则，将DOM元素内容渲染到离屏canvas中
};
```
