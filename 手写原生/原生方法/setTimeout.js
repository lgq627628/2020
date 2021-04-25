function setTimeout(fn, delay, ...args) {
  let startTime = +new Date();
  let timer = null;
  function helper() {
    timer = window.requestAnimationFrame(helper);
    if (+new Date() - startTime >= delay) {
      fn.call(this, ...args)
      cancelAnimationFrame(timer)
    }
  }
  window.requestAnimationFrame(helper);
}

function print() {
  console.log('666')
}

setTimeout(print, 2000);
