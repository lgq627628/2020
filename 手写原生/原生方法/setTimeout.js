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


// 用 postMessage 模拟 setTimeout 实现 0 延时
(function() {
  var timeouts = [];
  var messageName = "zero-timeout-message";

  // Like setTimeout, but only takes a function argument.  There's
  // no time argument (always zero) and no arguments (you have to
  // use a closure).
  function setZeroTimeout(fn) {
      timeouts.push(fn);
      window.postMessage(messageName, "*");
  }

  function handleMessage(event) {
      if (event.source == window && event.data == messageName) {
          event.stopPropagation();
          if (timeouts.length > 0) {
              var fn = timeouts.shift();
              fn();
          }
      }
  }

  window.addEventListener("message", handleMessage, true);

  // Add the one thing we want added to the window object.
  window.setZeroTimeout = setZeroTimeout;
})();
