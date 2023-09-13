# XVue
手写一个自己的小型 Vue

## vue 的基本思路
Vue 的本质上是使用 HTML 的字符串作为模板的，然后转成 AST，再转换成 VNode（模板字符串 => AST => vNode => 真实dom），其中最消耗性能的是第一个步骤：模板 => AST。
而我们自己这里实现的 vue 则少了 AST 和 vnode 的部分，主要分为简单编译和数据劫持两部分，不然理解起来头大。

## 页面什么时候需要渲染？
1、页面一开始加载需要渲染
2、每一个属性（响应式）数据在发生变化的时候要渲染
3、watch, computed 等等也要渲染
而我们所写的简易 Vue 在每次需要渲染的时候, 模板都会被解析一次（注意：这里我们简化了解析方法，和真正的 Vue 是不一样的）。

## 模板转换为 AST 需要执行几次?
事实上只需要最开始执行一次即可，一个项目运行的时候模板是不会变的, 就表示 AST 是不会变的。

## 为什么要用 AST 而不是直接使用 vnode？
1、要处理 v-if 和 v-for、slot 等结构型指令
2、提供了做插件的机会，在真正 dom 操作之前能做一些自己的事情
3、可优化

## 在 Vue 中每一个标签可以是真正的 html 标签, 也可以是自定义组件, 问怎么区分？
在 Vue 源码中其实将所有可以用的 html 标签已经存起来了。
假设这里只考虑几个标签: let tags = 'div,p,a,img,ul,li'.split(',');
此时需要一个函数, 判断一个标签名是否为内置的标签
```js
function isHtmlTag( tagName ) {
  tagName = tagName.toLowerCase();
  if ( tags.indexOf( tagName ) > -1 ) return true;
  return false;
}
```

## 页面的 dom 和 vnode 是一一对应的
每次数据改变的时候，vue 都会生成一个新的 vNode（实实在在新数据的 vnode），然后和旧有的 vnode 进行 diff（同层级比较可减少复杂度） 比较。我们可以将代码进行优化, 将 vnode 缓存起来, 生成一个函数, 而这个函数只需要传入数据就可以得到真正的 DOM。

## 为什么要用柯里化？
为了提升性能，使用它可以缓存一部分能力

## vue3 源码
http://www.zhufengpeixun.com/jg-vue