class OutputMapPlugin { // 添加一个输出文件的列表，展示大小名字等信息
  constructor({filename}) {
    this.filename = filename
  }
  apply(complier) {
    complier.hooks.emit.tap('OutputMapPlugin', compliation => { // 可同步可异步
      let assets = compliation.assets
      let content = '##  文件名        资源大小\r\n'
      Object.entries(assets).forEach(([filename, info]) => {
        content += `-  ${filename}        ${info.size()}\r\n`
      })
      assets[this.filename] = {
        source() {
          return content
        },
        size() {
          return content.length
        }
      }
    })
  }
}

module.exports = OutputMapPlugin
