function handle(id) {
  let fn = modules[id]
  let exports = {}

  function require(path) {
    // 根据路径去找到相应的函数 + 执行函数 + 返回函数结果
  }
  fn(require, exports)

  return exports
}
