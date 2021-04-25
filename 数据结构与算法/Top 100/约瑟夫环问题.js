// 数组，也可以直接删除元素
function getLastRing(n, m) {
  if (n <= 1 || m <= 1) return
  let flagArr = new Array(n).fill(1)
  let outNum = 0
  let count = 0
  let idx = 0
  while(outNum < n - 1) {
    if (flagArr[idx]) {
      count++
      if (count === m) {
        count = 0
        flagArr[idx] = 0
        outNum++
      }
    }
    idx++
    idx = idx % n // if (idx >= n) idx = 0
  }
  return flagArr.findIndex(flag => flag === 1) + 1
}

// 使用队列
function getLastRing(n, m) {
  const queue = new Array(n).fill(1).map((item, i) => i)
  while(queue.length > 1) {
    for (let i = 0; i < m - 1; i++) {
      queue.push(queue.shift())
    }
    queue.shift()
  }
  return queue[0] + 1
}

let rs = getLastRing(10000, 3)
console.log(rs)

// 使用循环链表

// 使用递归
