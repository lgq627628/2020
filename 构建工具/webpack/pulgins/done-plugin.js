class DonePlugin {
  constructor(options) {

  }
  apply(complier) {
    complier.hooks.done.tap('DonePlugin', (stats) => {
      console.log('这是一个提示 ==> 编译完成啦')
    })
  }
}

module.exports = DonePlugin
