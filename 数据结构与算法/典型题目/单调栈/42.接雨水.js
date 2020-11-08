// 力扣（LeetCode）：https://leetcode-cn.com/problems/trapping-rain-water

// 给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。输入：height = [0,1,0,2,1,0,1,3,2,1,2,1]
// 输出：6
// 解释：上面是由数组 [0,1,0,2,1,0,1,3,2,1,2,1] 表示的高度图，在这种情况下，可以接 6 个单位的雨水（蓝色部分表示雨水）。

// 输入：height = [4,2,0,3,2,5]
// 输出：9

var trap = function(height) {
  let left = 0
  let right = height.length - 1
  let leftMax = 0
  let rightMax = 0
  let rain = 0
  while(left < right) {
      let leftVal = height[left]
      let rightVal = height[right]
      leftMax = Math.max(leftMax, leftVal)
      rightMax = Math.max(rightMax, rightVal)
      if (leftMax < rightMax) {
          rain += (leftMax - leftVal)
          left++
      } else {
          rain += (rightMax - rightVal)
          right--
      }
  }
  return rain
};
