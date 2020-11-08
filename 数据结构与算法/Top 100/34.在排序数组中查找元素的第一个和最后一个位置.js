// 力扣（LeetCode）：https://leetcode-cn.com/problems/find-first-and-last-position-of-element-in-sorted-array

// 给定一个按照升序排列的整数数组 nums，和一个目标值 target。找出给定目标值在数组中的开始位置和结束位置。
// 你的算法时间复杂度必须是 O(log n) 级别。
// 如果数组中不存在目标值，返回 [-1, -1]。

// 示例 1:
// 输入: nums = [5,7,7,8,8,10], target = 8
// 输出: [3,4]

// 示例 2:
// 输入: nums = [5,7,7,8,8,10], target = 6
// 输出: [-1,-1]


var searchRange = function(nums, target) {
  let left = 0
  let right = nums.length - 1

  let rs = -1
  while(left <= right) {
      let mid = (left + right) >> 1
      if (nums[mid] > target) {
          right = mid - 1
      } else if(nums[mid] < target) {
          left = mid + 1
      } else {
          rs = mid
          break
      }
  }
  if (rs === -1) return [rs, rs]

  let start = rs
  let end = rs
  while(nums[start] === target) {
      start--
  }
   while(nums[end] === target) {
      end++
  }
  return [start + 1, end - 1]
};
