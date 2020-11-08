// 力扣（LeetCode）：https://leetcode-cn.com/problems/product-of-array-except-self

// 给你一个长度为 n 的整数数组 nums，其中 n > 1，返回输出数组 output ，其中 output[i] 等于 nums 中除 nums[i] 之外其余各元素的乘积。

// 示例:
// 输入: [1,2,3,4]
// 输出: [24,12,8,6]
//  
// 提示：题目数据保证数组之中任意元素的全部前缀元素和后缀（甚至是整个数组）的乘积都在 32 位整数范围内。
// 说明: 请不要使用除法，且在 O(n) 时间复杂度内完成此题。
// 进阶：你可以在常数空间复杂度内完成这个题目吗？（ 出于对空间复杂度分析的目的，输出数组不被视为额外空间。）

// 方法一：除法，不过只能是整数不能为 0
var productExceptSelf = function(nums) {
  let multiSum = 1
  nums.forEach(num => multiSum *= num)
  return nums.map(num => multiSum / num)
};


// 方法二：左右列表乘积
var productExceptSelf = function(nums) {
  let left = []
  let right = []
  let rs = []
  let i = 0;
  let len = nums.length
  while(i < len) {
      left[i] = left[i - 1] === undefined ? nums[i] : left[i - 1] * nums[i]
      right[len - 1 - i] = right[len - i] === undefined ? nums[len - i - 1] : right[len - i] * nums[len - i - 1]
      i++
  }
  i = 0
  while(i < len) {
      let l = left[i - 1] === undefined ? 1 : left[i - 1]
      let r = right[i + 1] === undefined ? 1 : right[i + 1]
      rs[i] =  l * r
      i++
  }
  return rs
};

// 方法三：左右列表乘积优化一
// 就是用 answer 存储左列表的值，从而省去做列表的空间

// 方法二：左右列表乘积优化二
// 用 answer 存储左列表的值，之后再用 answer 倒序存储右列表的值
