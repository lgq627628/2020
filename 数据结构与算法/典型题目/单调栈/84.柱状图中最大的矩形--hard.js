// https://leetcode-cn.com/problems/largest-rectangle-in-histogram/

// 题目描述：给定 n 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。
// 求在该柱状图中，能够勾勒出来的矩形的最大面积。

// 解法一
// 大众想法
// 以当前柱子为基准，向左向右扩散
// 若下一个柱子比当前柱子高，则持续扩散以当前柱子为高度的矩形宽度（扩展矩形的右边界）；否则停止扩散，“回头看”寻找左边界，进而计算总宽度。
function maxRect(arr) {
  let max = 0
  for(let i = 0; i < arr.length; i++) {
    let w = 1
    let h = arr[i]
    let left = i
    let right = i
    while(++right < arr.length && arr[right] >= h) {
      w++
    }
    while(--left >= 0 && arr[left] >= h) {
      w++
    }
    max = Math.max(max, w * h)
  }
  return max
}



// 解法二
// 借助栈来模拟矩形宽度的探索过程
// 当柱子高度递增时，我们不做特殊处理（此时只需要入栈）。只有当发现柱子的高度回落时，才会开始“弹出”前面柱子对应的结果（出栈）。所以我们在编码层面的一个基本思路，就是去维护一个单调递增栈。
// 我们入栈的是下标，下标之差就是宽
// https://www.bilibili.com/video/BV16D4y1D7ed?from=search&seid=3316905252801137033
function maxRect2(arr) {
  if (arr.length === 0) return 0
  if (arr.length === 1) return arr[0]

  arr.push(0) // 因为如果整个都是单调递增，就没有一个触发计算的时机，这样可以避免头尾的判断
  arr.unshift(0)
  let area = 0
  let stack = [0]
  for(let i = 1; i < arr.length; i++) {
    while (arr[stack[stack.length - 1]] > arr[i]) {
      let h = arr[stack.pop()]
      let w = i - stack[stack.length - 1] - 1 // 宽度就是右侧元素和当前新栈顶元素之差
      area = Math.max(area, w * h)
    }
    stack.push(i);
  }
  return area
}

let rs = maxRect([2,1,5,6,2,3])
console.log(rs)
rs = maxRect([])
console.log(rs)
rs = maxRect2([2,1,5,6,2,3])
console.log(rs)
