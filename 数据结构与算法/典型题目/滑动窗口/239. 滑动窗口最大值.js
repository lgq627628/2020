// 来源：力扣（LeetCode）：https://leetcode-cn.com/problems/sliding-window-maximum

// 给定一个数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。
// 返回滑动窗口中的最大值。

// 进阶：你能在线性时间复杂度内解决此题吗？

// 示例:
// 输入: nums = [1,3,-1,-3,5,3,6,7], 和 k = 3
// 输出: [3,3,5,5,6,7]
// 解释:

//   滑动窗口的位置                最大值
// ---------------               -----
// [1  3  -1] -3  5  3  6  7       3
//  1 [3  -1  -3] 5  3  6  7       3
//  1  3 [-1  -3  5] 3  6  7       5
//  1  3  -1 [-3  5  3] 6  7       5
//  1  3  -1  -3 [5  3  6] 7       6
//  1  3  -1  -3  5 [3  6  7]      7

// 方法一：单调递减栈，可以存下标也可以存值
var maxSlidingWindow = function(nums, k) {
  let stack = []
  let rs = []
  let i = 0
  while(i < nums.length) {
    if (i >= k - 1) {
        if (stack[0] === nums[i - k]) stack.shift()
    }
    let num = nums[i]
    while(stack.length && stack[stack.length - 1] < num) stack.pop()
    stack.push(num)
    if (i >= k - 1) rs.push(stack[0])
    i++
  }
  return rs
}
