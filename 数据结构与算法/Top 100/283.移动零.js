// 力扣（LeetCode）：https://leetcode-cn.com/problems/move-zeroes

// 给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。

// 示例:
// 输入: [0,1,0,3,12]
// 输出: [1,3,12,0,0]
// 说明:

// 必须在原数组上操作，不能拷贝额外的数组。
// 尽量减少操作次数。


// 方法一：覆盖法
var moveZeroes = function(nums) {
  let start = 0
  for(let i = 0; i < nums.length; i++) {
      if (nums[i] !== 0) {
          nums[start] = nums[i]
          start++
      }
  }
  for(let i = start; i < nums.length; i++) {
      nums[i] = 0
  }
  return nums
};



// 方法二：交换
var moveZeroes = function(nums) {
  let start = 0
  for(let i = 0; i < nums.length; i++) {
      if (nums[i] !== 0) {
          [nums[i], nums[start]] = [nums[start], nums[i]]
          start++
      }
  }

  return nums
};
