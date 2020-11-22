// 力扣（LeetCode）：https://leetcode-cn.com/problems/minimum-size-subarray-sum

// 给定一个含有 n 个正整数的数组和一个正整数 s ，找出该数组中满足其和 ≥ s 的长度最小的 连续 子数组，并返回其长度。如果不存在符合条件的子数组，返回 0。

// 示例：
// 输入：s = 7, nums = [2,3,1,2,4,3]
// 输出：2
// 解释：子数组 [4,3] 是该条件下的长度最小的子数组。

// 进阶：
// 如果你已经完成了 O(n) 时间复杂度的解法, 请尝试 O(n log n) 时间复杂度的解法。


// 方法一：双指针
var minSubArrayLen = function(s, nums) {
  let left = 0
  let right = 0
  let sum = 0
  let minLen = Infinity

  while(right < nums.length) {
      let num = nums[right]
      sum += num
      while(sum >= s) {
          minLen = Math.min(minLen, right - left + 1)
          sum -= nums[left]
          left++
      }
      right++
  }

  return minLen === Infinity ? 0 : minLen
};




// 方法二：前缀和
// 首先遍历每一项求出前面元素的和，用一个数组保存前缀和
// 继续遍历每个元素，用二分的方式找出右边边界
