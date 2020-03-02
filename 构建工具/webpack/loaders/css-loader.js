module.exports = function(source) {
  let result = source.replace(/url\((.+?)\)/g, (...args) => {
    return `url('require(${args[1]})')`
  })
  return result
}
