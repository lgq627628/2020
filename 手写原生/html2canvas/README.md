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

## 关于图片跨域的的解决方法
可参考：https://mp.weixin.qq.com/s?__biz=MzIzNjcwNzA2Mw==&mid=2247485913&idx=1&sn=32ec96e6a6017370f62976d4e02b5790&chksm=e8d28441dfa50d57fe42e7f73cd6e728b25f0aac8c8f1489cab6e16d353426d14e9050e42953#rd
我先将微信头像赋值给一个img对象的src，并开启该img对象的crossOrigin为允许跨域，然后绘制改img对象到canvas中，再将绘制的canvas的dataURL插入到我们最终要合并的头像的img元素中，再去调用html2canvas进行绘制，就能解决这个问题了。而手Q头像由于他们服务器对跨域资源的设置问题，目前使用同样的方案，还是无法绘制。
1、在 html2canvas 中加配置 useCORS: true；然后在图片服务器端设置允许跨域
2、如果不是自己的图片，需要用 nodejs 做一层中间代理来转发图片，就像下面这样：
```js
// nodejs 服务端
const router = require('express').Router();
const coWrap = require('../utils/coWrap');
var request = require('request');

router.get('/transferImage', coWrap(function* (req, res) {
  var path = req.query && req.query.path;
  return request.get(path).pipe(res);
}));

// 前端这样写图片链接
<img src="http://yourserver/prcImage/transferImage?path=https://yourimg.png">
```
3、转成 base64，太长是个问题，较慢
```js

// 转为base64图片
getBase64Image(img) {
    let canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    let ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    let dataURL = canvas.toDataURL('image/png') // 可选其他值 image/jpeg
    return dataURL
},
// 生成海报
getPoster() {
    let htmlContainer = this.$refs.creatPoster // 需要截图的包裹的（原生的）DOM 对象
    let width = htmlContainer.offsetWidth // 获取dom 宽度
    let height = htmlContainer.offsetHeight // 获取dom 高度
    let canvas = document.createElement('canvas') // 创建一个canvas节点
    let scale = 2 // 定义任意放大倍数 支持小数

    canvas.width = width * scale // 定义canvas 宽度 * 缩放
    canvas.height = height * scale // 定义canvas高度 *缩放
    canvas.getContext('2d').scale(scale, scale) // 获取context,设置scale

    let imgs = htmlContainer.querySelectorAll('img')
    let count = 0 // 计数用

    // 排除base64图片，因为base64图片不会有跨域问题
    imgs = Array.from(imgs).filter(elem => {
    return !/^data:image\/png;base64/.test(elem.src)
    })

    // 将会跨域的图片转为支持跨域base64图片，最后再执行html2canvas
    imgs.forEach((elem, index, arr) => {
    let image = new Image()

    image.crossOrigin = '*' // 支持跨域图片
    image.src = elem.src
    image.onload = () => {
        elem.src = this.getBase64Image(image)
        count++

        // 全部图片加载完毕
        if (count === arr.length) {
        // http://html2canvas.hertzen.com/configuration/   配置设置地址
        let opts = {
            scale: scale, // 添加的scale 参数
            canvas: canvas, // 自定义 canvas
            // logging: true, // 日志开关，便于查看html2canvas的内部执行流程
            width: width, // dom原始宽度
            height: height,
            useCORS: true, // 【重要】开启跨域配置
            allowTaint: true, // 【重要】开启画布污染
            backgroundColor: '#fff'
        }

        html2canvas(htmlContainer, opts).then(canvas => {
            let context = canvas.getContext('2d')

            // 关闭抗锯齿
            context.mozImageSmoothingEnabled = false
            context.webkitImageSmoothingEnabled = false
            context.msImageSmoothingEnabled = false
            context.imageSmoothingEnabled = false
            // 默认转化的格式为png，也可设置为其他格式
            this.posterUrl = canvas.toDataURL('image/jpeg')
        })
        }
    }
    })
},
```