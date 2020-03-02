const less = require('less')

function loader (source) {
  let css = ''
  less.render(source, function(err, result) {
    css = result.css.replace(/\n/g, '')
  })
  this.callback(null, css)
}
module.exports = loader
