const loaderUtils = require('loader-utils')

function loader(source) {
  let filename = loaderUtils.interpolateName(this, '[hash].[ext]', { // 这个会生成一个 md5
    content: source
  })
  this.emitFile(filename, source)
  return `module.exports="${filename}"` // 注意要加上双引号
}
loader.raw = true // 是否为二进制，因为是图片所以需要

module.exports = loader
