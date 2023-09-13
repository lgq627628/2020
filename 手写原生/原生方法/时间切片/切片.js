// https://github.com/berwin/Blog/issues/38
// 使用时间切片的缺点是，任务运行的总时间变长了，这是因为它每处理完一个小任务后，主线程会空闲出来，并且在下一个小任务开始处理之前有一小段延迟。但是为了避免卡死浏览器，这种取舍是很有必要的。
// 使用yield来切割任务非常方便，但如果切割的粒度特别细，反而效率不高。

//首先我们封装一个时间切片执行器
function timeSlice(gen) {
  if (typeof gen !== "function")
      throw new Error("TypeError: the param expect a generator function");
  var g = gen();
  if (!g || typeof g.next !== "function")
      return;
  return function next() {
      var start = performance.now();
      var res = null;
      do {
          res = g.next();
      } while (res.done !== true && performance.now() - start < 25);
      if (res.done)
          return;
      window.requestIdleCallback(next);
  };
}

//然后把长任务变成generator函数，交由时间切片执行器来控制执行
const add = function(i){
          let item = document.createElement("li");
              item.innerText = `第${i++}条`;
              listDom.appendChild(item);
      }
function* gen(){
  let i=0;
  while(i<100000){
      yield add(i);
      i++
  }
}
//使用时间切片来插入10W条数据
function bigInsert(){
  timeSlice(gen)()
}


function multistep(steps,args,callback){
    var tasks = steps.concat();

    setTimeout(function(){
        var task = tasks.shift();
        task.apply(null, args || []);   //调用Apply参数必须是数组

        if(tasks.length > 0){
            setTimeout(arguments.callee, 25);
        }else{
            callback();
        }
    },25);
}



// 任务分片、任务切片，参考：https://web.dev/optimize-long-tasks/?utm_source=devtools
function yieldToMain () {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
}
async function saveSettings () {
    // A task queue of functions
    const tasks = [
      validateForm,
      showSpinner,
      saveToDatabase,
      updateUI,
      sendAnalytics
    ];
    
    while (tasks.length > 0) {
      // Yield to a pending user input:
      if (navigator.scheduling.isInputPending()) {
        // There's a pending user input. Yield here:
        await yieldToMain();
      } else {
        // Shift the task out of the queue:
        const task = tasks.shift();
  
        // Run the task:
        task();
      }
    }
}
async function saveSettings () {
    // A task queue of functions
    const tasks = [
      validateForm,
      showSpinner,
      saveToDatabase,
      updateUI,
      sendAnalytics
    ];
    
    let deadline = performance.now() + 50;
  
    while (tasks.length > 0) {
      // Optional chaining operator used here helps to avoid
      // errors in browsers that don't support `isInputPending`:
      if (navigator.scheduling?.isInputPending() || performance.now() >= deadline) {
        // There's a pending user input, or the
        // deadline has been reached. Yield here:
        await yieldToMain();
  
        // Extend the deadline:
        deadline = performance.now() + 50;
  
        // Stop the execution of the current loop and
        // move onto the next iteration:
        continue;
      }
  
      // Shift the task out of the queue:
      const task = tasks.shift();
  
      // Run the task:
      task();
    }
}