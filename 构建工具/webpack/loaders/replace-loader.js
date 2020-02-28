// 这里不能写成箭头函数，因为需要 this
const loaderUtils = require('loader-utils')
module.exports = function (source) { // source 就是匹配到的文件字符串
  let options = loaderUtils.getOptions(this)
  // this.query.msg 可以拿到用户传进来的 options，但是官方建议用 loader-utils 这个工具
  // return source.replace('666', options.msg) 可以直接这样写，但官方建议写成下面这样
  let result = source.replace('666', options.msg)
  this.callback(null, result) // 第一个是错误信息，第二个是返回结果，第三个是 sourceMap


  // setTimeout(() => { // 异步这样写是不行的，会报错
  //   return source.replace('666', options.msg)
  // }, 1000)

  // 下面是异步的正确写法
  // let cb = this.async()
  // setTimeout(() => {
  //   let result =  source.replace('666', options.msg)
  //   cb(null, result)
  // }, 1000)

  // 应用：异常捕获或者语言替换
  // function() {} => try { function() {} } catch (e) {}
}
