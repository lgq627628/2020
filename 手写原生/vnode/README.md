## vnode 也叫虚拟 dom
使用 js 中的对象来模拟真实 dom，然后在更新页面之前进行新旧 vnode 的 diff，达到最少操作 dom 树的效果。其简要结构如下：
```js
let vnode = {
  tag: 'div',
  data: { class: 'box' },
  children: [
    {tag: 'p', data: {}, key: 1},
    {tag: 'p', data: {}, key: 2},
  ]
}
```

## diff 核心
其实本质就是找出两棵树的不同，然后做相应的操作。难的是 vnode.children 里面的比较算法，因为新旧 vnode 的 children 都是个数组，要判断的情况很多，各个框架的具体实现也有所差别。


## vue 中的 vnode
因为在 vue1 中使用 Object.defineProperty 是比较耗性能的，因为 wathcer 太多了，颗粒度太细了，所以到了 vue2 引入了 vnode，在 vue2 中 wathcer 的级别变成了组件级别，也就是数据改变只通知到组件，具体组件里面怎么变则通过 diff 算法来实现。

- vue 中的 vnode 如何创建？

  我们写的 template 会被编译成创建 vnode 的函数（经过 Vue 中的 compile 模块解析成 render 函数，然后把 render 当作参数传进去）
  ```js
    // 具体可查看 https://github.com/vuejs/vue/tree/dev/test/unit/modules/compiler
    const ast = parse(template.trim(), options)
    if (options.optimize !== false) {
      optimize(ast, options)
    }
    const code = generate(ast, options)
    // 比如说 <div><p v-if="show">hello</p><p v-else>world</p></div> 会变编译成下面这样：
    // `with(this){return _c('div',[(show)?_c('p',[_v("hello")]):_c('p',[_v("world")])])}`
  ```
- 如何 diff 及优化策略
  - 一般我们不会对 dom 进行跨级操作，所以这里我们只进行平级比较
  - 先序深度优先遍历
  - 基于 web 业务的特点（新增、删除、倒序），vue 定义四个游标，进行三个操作的猜测（这个很重要），也就是先比较两个数组的排头 key 值；或者比较两个数组的末尾 key 值；或者比较排头和末尾的 key 值；最后如果都没有猜中，还是要乖乖进行新旧 vnode 遍历的。

- 具体打补丁规则 patch
  - 当节点类型相同时，比较一下属性是否相同，产生一个属性的补丁包：`{ type: 'ATTRS', attrs: { class: 'box' }}`
  - 旧的有节点新的没有则删除：`{ type: 'REMOVE', key: 1 }`
  - 节点类型不相同直接替换：`{ type: 'REPLACE', newNode: newNode }`
  - 如果是文本节点的值变了：`{ type: 'TEXT', text: text }`

## react 中的 diff
- 简单点的版本
  遍历树的时候会有个全局 index，记录每个元素，然后同级比较，产生一个补丁包，然后从儿子开始往上更新 dom，如果增删元素这个方法就废了。

- 中等点的版本
  需要加 key 值来比较
  - 1、首先把老数组在新数组中没有的元素移除掉（通过key值看有没有）
  - 2、遍历新数组，和老数组对应的 index 进行比较（oldIndex 和 newIndex）
    - a、如果和老数组的值不相等就插入新数组的这个值，让后 index++ 继续向下比较
    - b、如果和老数组的值相等就两边都 index++
  - 3、删除多余的老数组末尾剩下的所有元素
  - 4、经过上述步骤后会有一个补丁包 `patches = [{ type: 'REMOVE', index }, { type: 'INSERT', index, newNode }]`
  - 开始几个优化方案：
    - [abcd] 和 [bcda] 的优化：对上面 2 的 步骤 a 进行优化：如果两个值不相等的时候顺便和老的下一个元素进行比较，如果相等则移除老数组的上一个
    - 在打补丁的时候，如果是 INSERT 的话，可以先把旧的 key 和 这个 key 所对应的 dom 做一个映射，在插入的时候先判断插入的 key 在映射中能不能找到，如果能就移动复用，不能的话才创建，省的删除又创建
