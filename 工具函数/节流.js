function throttle(fn, time) {
  let timeId = null
  return function() {
    clearTimeout(timeId)
    timeId = setTimeout(fn, time)
  }
}
