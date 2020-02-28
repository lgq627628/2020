class CopyrightPlugin { // 在打包之后的 build 目录下新建一个 copyright.txt 文件
  constructor(options) {
    console.log(options)
  }
  apply(complier) { // 可以看作是 webpack 实例，里面存储着打包过程
    complier.hooks.emit.tapAsync('CopyrightPlugin', (compliation, cb) => { // compliation 一个跟打包后的 build 有关的的东西
      // debugger 在脚本里面有命令可以打开调试
      compliation.assets['copyright.txt'] = {
        source: function() {
          return '这是后期加入的插件内容'
        },
        size: function() { // 一个中文两个字符
          return 22
        }
      }
      cb() // 因为是异步的，得加上这个，不然会报错
    })
  }
}

module.exports = CopyrightPlugin // 插件得写成一个类的形式导出来
