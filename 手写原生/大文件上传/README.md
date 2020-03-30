## 前端：先切片
- js 在 es6 之后多了 file 的 api，以及 node 的 file 和 stream，文件处理能力增强
- 任何文件都是二进制，可分割成 blob（start，end）
- 到时候并发请求 n 个切片，就是发送 n 个请求，因为 http 就有并发性，速度就会更快
- 切片方法就是利用 file.slice(0, 102400) 这个 api，返回的是一个 blob 二进制文件对象，这个 blob 协议可以提前预览，传统的 es5 只能上传到服务器等它返回一个远程地址，我们才能本地预览，因为到 es6 才提供了操纵文件的能力

## 前端：http 上传


## 服务器端：合并切片
- 以源文件作为文件夹的名字，把切片（以文件名+index命名）都放在这个目录下
- 排序并循环创建可写、读流使之流向可写流
- 删除中转文件和目录

## 如何避免文件丢失、超时
- 怎样知道丢失呢？就是根据内容算出 hash 值，前端算一个，传到后端，后端也算一个，如果两个 hash 不同就要重传
```js
async function calcHash(fileList) {
  return new Promise(resolve => {
    const worker = new Worker('/hash.js)
    worker.postMessage({fileList})
    worker.onMessage(e => {
      console.log(e.data)
    })
  })
}
```
