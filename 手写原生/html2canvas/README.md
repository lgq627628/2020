## html2canvas 原理解析
- 1、把 html 递归克隆一份，避免修改到页面
- 2、递归遍历 html，也就是 parseTree，返回 ElContainer（类似于虚拟 dom 的一个对象）
- 3、遍历上一步生成的新对象，根据层叠规则生成层叠新对象 StackingContext
- 4、创建画布，根据上一步生成的层叠对象递归渲染

## 另一种方法 html2svg2canvas
- 1、把 html 递归克隆一份，避免修改到页面
- 2、遍历 html 把样式都转成行内样式
- 3、序列化包含行内样式的 html 并拼装成 svg 元素
- 4、svg 是可以支持转 canvas 的

## 对比
- 性能：
如果文本多，节点少，svg foreignObject的方式往往性能更高；
文本少，节点多的时候，canvas反而性能更高。
- 准确性：
纯canvas方式往往更准确的还原dom的表现；
svg foreignObject在比较复杂的情况下会出现截图不准确的问题。
综上所述，建议使用纯canvas方式，但是注意要对文本进行限流！
