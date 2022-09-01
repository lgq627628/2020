## 实现一个轻量 fabric

## 系列文章
> - [canvas 的动画原理及其推导和实现（九）🏖](https://juejin.cn/post/7126700139858624542)
> - [canvas 中如何扩展物体类和事件派发（八）🏖](https://juejin.cn/post/7121510507411931149)
> - [canvas ~ 开始真正的交互啦（七）🏖](https://juejin.cn/post/7118902284125208612)
> - [canvas 中如何实现物体的框选（六）🏖](https://juejin.cn/post/7116073689669435422)
> - [canvas 中如何实现物体的点选（五）🏖](https://juejin.cn/post/7111245657557434398)
> - [canvas 中物体边框和控制点的实现（四）🏖](https://juejin.cn/post/7108618710859907080)
> - [实现一个轻量 fabric.js 系列三（物体基类）🏖](https://juejin.cn/post/7106023188831666206)
> - [实现一个轻量 fabric.js 系列二（画布初始化）🏖](https://juejin.cn/post/7103457175413981191)
> - [实现一个轻量 fabric.js 系列一（摸透 canvas）💥](https://juejin.cn/post/7100846911657082893)

## 目录说明
- src 目录下是最简版的案例代码，我们看这个目录下的就行

## 实现思路
- 创建两层画布、一个 div 容器、一个缓冲层
- 编写 FabricObject 基类，所有画布上的物体都继承于它，如 Rect
- 添加画布鼠标交互事件
- 添加组类，框选多个物体的时候会用到
- 渲染的时候会从 Canvas 实例中的 _objects 对象开始遍历绘制，先绘制失活物体，再绘制激活物体

## 如何运行
在根目录下运行 npx vite 即可

## 好文
- 缓存：https://www.cnblogs.com/axes/p/3567364.html?utm_source=tuicool
- 判断两个多边形的位置关系算法：https://williamic.github.io/article/algorithm-polygonIntersection/

## 小发现
- 喜欢先校验非空 if(!obj) {} else {}
- 把变量都事先声明

## fabricjs 的坑
- 修改top、left并不会更改点击位置，需要加上object.setCoords()

