// 防止多次执行，最终在一定的时间间隔内只执行一次，比如拖拽窗口
// 特点：无限延迟，就像照相，什么时候手不抖了就执行
// 比如：下拉触底加载下一页

function debounce(fn, wait=300, immediate=false) {
  let timer, result
  let d =  function(...args) {
    timer && clearTimeout(timer) // 这个只会清掉定时器，但是 timer 还是有值的
    if (immediate) { // 是否要立即执行
      let callNow = !timer
      timer = setTimeout(() => {
        timer = null
      }, wait)
      if (callNow) result = fn.apply(this, args) // 即便里面报错也会延缓执行
    } else {
      timer = setTimeout(() => {
        fn.apply(this, args) // 这是为了防止改变 this 指向
      }, wait)
    }
    return result // 这个只有在立即执行才有意义
  }
  d.cancel = function() {
    clearTimeout(timer)
  }
  return d
}

function betterDebounce(fn, delay=300, maxTime) { // 如果一直抖动就会一直不执行感觉像是卡顿，所以可以设置一个 maxTime
  let last = +new Date()
  let timer = null
  return function() {
    let now = +new Date()
    timer && clearTimeout(timer)
    if (now - last < maxTime) {
      timer = setTimeout(() => {
        fn.apply(this, arguments)
        last = now
      }, delay);
    } else {
      fn.apply(this, arguments)
      last = now
    }
  }
}
