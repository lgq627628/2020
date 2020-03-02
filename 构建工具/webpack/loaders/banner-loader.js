// 这个 loader 可以在文件的开头加上你想要的文案等
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils') // 校验属性用的
const fs = require('fs')
module.exports = function(source) {
  this.cacheable(false) // webpack 默认打包的时候会启用缓存，这里我们可以设置 false 不缓存
  let opts = loaderUtils.getOptions(this)
  let cb = this.async()
  let schema = {
    type: 'object',
    properties: {
      text: {
        type: 'string',
      },
      filename: {
        type: 'string'
      }
    }
  }
  validateOptions(schema, opts, 'banner-loader') // 这边如果报错的话会用 banner-loader 这个名字说明是哪个 loader 报错

  if (opts.filename) {
    fs.readFile(opts.filename, 'utf-8', (err, data) => {
      if (err) {
        cb(null, `/**${opts.text}**/ ${source}`)
      } else {
        this.addDependency(opts.filename) // 可以自动添加文件依赖，就是当 webpack 打开 watch 的时候，可以通知该文件变化
        cb(null, `/**${data}**/ ${source}`)
      }
    })
  } else {
    cb(null, `/**${opts.text}**/ ${source}`)
  }
}
