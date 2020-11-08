// 题目描述：给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。
// leetcode 42 题

// 先遍历一遍找出每一格的左右最大值
// 每一格的节水量 = Math.min(该格子左边的最大值, 该格子右边的最大值) - 该格的值

// 大体思想：找到数组最大值，一分为2，分别计算左半边和右半边能接多少雨水
// 计算方式，比如左侧，从左开始遍历，记录当前最大值，并减去当前左值即每一项的雨水量

// 最优算法：双指针
// 次之算法：栈：遇到凹字形（转折点）就出栈计算当前凹字形水量
function getRain(arr) {
  let pointLeft = 0
  let pointRight = arr.length - 1
  let leftMax = 0
  let rightMax = 0
  let rain = 0
  while(pointLeft < pointRight) {
    let leftVal = arr[pointLeft]
    let rightVal = arr[pointRight]
    leftMax = Math.max(leftMax, leftVal) // 这个放下面也可以
    rightMax = Math.max(rightMax, rightVal)

    if (leftMax < rightMax) {
      // leftMax = Math.max(leftMax, leftVal)
      rain += (leftMax - leftVal)
      pointLeft++
    } else {
      // rightMax = Math.max(rightMax, rightVal)
      rain += (rightMax - rightVal)
      pointRight--
    }
  }
  return rain
}

let rs = getRain([0,1,0,2,1,0,1,3,2,1,2,1])
console.log(rs);
