// 特点：稀释操作，一定时间内只执行一次，需要有一个标志位看能否执行
// 比如：搜索框的即时查询

function throttle(fn, delay) {
  let canRun = true
  return function() {
    if (!canRun) return
    canRun = false
    fn.apply(this, arguments) // 这个也可以放在下面的 setTimeout 中，具体看你是要在一开始执行还是结束之后执行
    setTimeout(() => {
      canRun = true
    }, delay)
  }
}

// 下面是利用时间戳的方式
function throttle2(fn, delay) {
  let prev = 0
  return function() {
    let now = Date.now()
    if (now - prev > delay) {
      fn.apply(this)
      prev = now
    }
  }
}

// 当然 setTimeout 可能不准，所以可以用 new Date()
