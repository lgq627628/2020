function fibonacci(i) {
  if (i < 2) return 1
  return fibonacci(i - 1) + fibonacci(i - 2)
}

let fibonacci = (function() {
  let caches = [1, 1] // 也可以是对象 {0: 1, 1: 1}
  return function(i) {
    if (!cache[i]) cache[i] = fibonacci(i - 1) + fibonacci(i - 2)
    return cache[i]
  }
})()





// 另外一种就是从前向后循环，抛弃递归，从小到大的思想，又名递推法，也称为动态规划（从小到大放入表中）
function fibonacci(n) {
  const aFi = new Array(n+1);
  aFi[0] = 0; aFi[1] = 1;
  for(let i=2; i<= n; i++){
      aFi[i] = aFi[i-1] + aFi[i-2];
  }
  return aFi[n];
}
// 上面我们定义了一个数组来容纳所有的计算结果，但是实际上，我们仅仅需要f(n-1)和f(n-2)两个值，因此我们可以用两个变量存储这两个值来减少内存开销。
function fibonacci(n) {
  let current = 0;
  let next = 1;
  let temp;
  for(let i = 0; i < n; i++){
      temp = current;
      current = next;
      next += temp;
  }
  return current;
}




let rs = fibonacci(0)
console.log(rs)
rs = fibonacci(2)
console.log(rs)
rs = fibonacci(1)
console.log(rs)





// 尾递归，函数的最后一步只能是函数调用
function fibonacci(count) {
  function fn(count, curr = 1, next = 1) {
    if (count == 0) {
      return curr;
    } else {
      return fn(count - 1, next, curr + next);
    }
  };
  return fn(count);
}

function fibonacci(n, cur = 1, next = 1) {
  if(n<= 1) return next;
  return fibonacci(n - 1, next, cur + next);
}
