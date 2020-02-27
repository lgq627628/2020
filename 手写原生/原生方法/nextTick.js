let cbs = []
let pending = false // 压入微任务或者宏任务的标志位，pending 的存在保证连续多次调用 nextTick 的时候只调用一次

function nextTick(cb) {
  cbs.push(cb)
  if (!pending) {
    pending = true
    if ('Promise' in window) {
      Promise.resolve().then(() => {
        flushCbs()
      })
    } else {
      setTimeout(flushCbs, 0);
    }
  }
}

function flushCbs() {
  pending = false
  const copies = cbs.slice(0);
  cbs.length = 0;
  copies.forEach(cb => cb())
}
