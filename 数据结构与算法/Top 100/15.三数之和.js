// 力扣（LeetCode）：https://leetcode-cn.com/problems/3sum

// 给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。
// 注意：答案中不可以包含重复的三元组。

// 示例：
// 给定数组 nums = [-1, 0, 1, 2, -1, -4]，
// 满足要求的三元组集合为：
// [
//   [-1, 0, 1],
//   [-1, -1, 2]
// ]

var threeSum = function(nums) {
  let rs = []
  let len = nums.length
  nums.sort((a, b) => a - b);

  let tempVal
  for(let i = 0; i < len - 2; i++) {
      if (tempVal === nums[i]) {
          continue
      } else {
          tempVal = nums[i]
      }
      let left = i + 1
      let right = len - 1
      while(left < right) {
          let sum = nums[i] + nums[left] + nums[right]
          if (sum < 0) {
              left++
          } else if (sum > 0) {
              right--
          } else {
              rs.push([nums[i], nums[left], nums[right]])
              let leftVal = nums[left]
              let rightVal = nums[right]
              left++
              right--
              while(leftVal === nums[left]) {
                  left++
              }
               while(rightVal === nums[right]) {
                  right--
              }
          }
      }
  }

  return rs
};
