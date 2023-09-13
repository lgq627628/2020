## webpack 专题

可以参考这篇文章：https://imweb.io/topic/5baca58079ddc80f36592f1a
https://zhuanlan.zhihu.com/p/104205895

webpack 默认只识别 .js 和 .json 结尾的，其后缀名文件得借助 loader

- 手写 loader，处理 css、vue 文件等
- 手写 plugins，自动化构建打包后的 html，或者说在打包过程中你想做的一些事情


## 依赖的 hash 问题
假设有两个文件: index.js 和 lib.js，且 index 依赖于 lib，其内容如下：
```js
// index.js
import("./lib").then((o) => console.log(o));
// lib.js
export const a = 3;
```
由 webpack 等打包器打包后将会生生两个 chunk (为了方便讲解，以下 aaaaaa 为 hash 值)
index.aaaaaa.js
lib.aaaaaa.js
问: 假设 lib.js 文件内容发生变更，index.js 由于引用了 lib.js，可能包含其文件名，那么它的 hash 是否会发生变动?
答: 不一定。打包后的 index.js 中引用 lib 时并不会包含 lib.aaaaaa.js，而是采用 chunkId 的形式，如果 chunkId 是固定的话，则不会发生变更。
```js
// 打包前
import("./lib");

// 打包后，201 为固定的 chunkId (chunkIds = deterministic 时)
__webpack_require__.e(/* import() | lib */ 201);
```
在 webpack 中，通过 optimization.chunkIds 可设置确定的 chunId，来增强 Long Term Cache 能力。
```js
{
  optimization: {
    chunkIds: 'deterministic'
  }
}
```
设置该选项且 lib.js 内容发生变更后，打包 chunk 如下，仅仅 lib.js 路径发生了变更。
index.aaaaaa.js
lib.bbbbbb.js



## 为什么需要分包？
https://q.shanyue.tech/engineering/761.html
- 一行代码将导致整个 bundle.js 的缓存失效
- 一个页面仅仅需要 bundle.js 中 1/N 的代码，剩下代码属于其它页面，完全没有必要加载

### 高频库
https://q.shanyue.tech/engineering/761.html
一个模块被 N(2 个以上) 个 Chunk 引用，可称为公共模块，可把公共模块给抽离出来，形成 vendor.js。

问：那如果一个模块被用了多次 (2 次以上)，但是该模块体积过大(1MB)，每个页面都会加载它(但是无必要，因为不是每个页面都依赖它)，导致性能变差，此时如何分包？
答：如果一个模块虽是公共模块，但是该模块体积过大，可直接 import() 引入，异步加载，单独分包，比如 echarts 等

问：如果公共模块数量多，导致 vendor.js 体积过大(1MB)，每个页面都会加载它，导致性能变差，此时如何分包
答：有以下两个思路
思路一: 可对 vendor.js 改变策略，比如被引用了十次以上，被当做公共模块抽离成 verdor-A.js，五次的抽离为 vendor-B.js，两次的抽离为 vendor-C.js
思路二: 控制 vendor.js 的体积，当大于 100KB 时，再次进行分包，多分几个 vendor-XXX.js，但每个 vendor.js 都不超过 100KB

在 webpack 中可以使用 SplitChunksPlugin (opens new window)进行分包，它需要满足三个条件:
minChunks: 一个模块是否最少被 minChunks 个 chunk 所引用
maxInitialRequests/maxAsyncRequests: 最多只能有 maxInitialRequests/maxAsyncRequests 个 chunk 需要同时加载 (如一个 Chunk 依赖 VendorChunk 才可正常工作，此时同时加载 chunk 数为 2)
minSize/maxSize: chunk 的体积必须介于 (minSize, maxSize) 之间