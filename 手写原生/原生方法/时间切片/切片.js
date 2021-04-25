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
