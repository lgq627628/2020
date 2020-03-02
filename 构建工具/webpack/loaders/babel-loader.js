const babel = require('@babel/core')
const loaderUtils = require('loader-utils')

module.exports = function(source) {
  let opts = loaderUtils.getOptions(this)
  let cb = this.async()
  let filename = this.resourcePath.split('/').pop()
  babel.transform(source, {
    // presets: opts.presets
    ...opts,
    sourceMap: true,
    filename // map 文件的名字
  }, (err, result) => {
    cb(err, result.code, result.map)
  })
}
