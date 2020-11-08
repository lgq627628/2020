// 力扣（LeetCode）：https://leetcode-cn.com/problems/maximum-product-subarray

// 给你一个整数数组 nums ，请你找出数组中乘积最大的连续子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。

// 示例 1:
// 输入: [2,3,-2,4]
// 输出: 6
// 解释: 子数组 [2,3] 有最大乘积 6。

// 示例 2:
// 输入: [-2,0,-1]
// 输出: 0
// 解释: 结果不能为 2, 因为 [-2,-1] 不是子数组。



// 方法一：暴力穷举
var maxProduct = function(nums) {
  let max = -Infinity
  for(let i = 0; i < nums.length; i++) {
      max = Math.max(max, nums[i])
      let temp = nums[i]
      if (temp === 0) continue
      for(let j = i + 1; j < nums.length; j++) {
          temp *= nums[j]
          max = Math.max(max, temp)
          if (temp === 0) break
      }
  }
  return max
};



// 方法二：动态规划
// 时间复杂度：O(N)
// 空间复杂度：O(N)
var maxProduct = function(nums) {
  let max = nums[0]
  let dpMax = [max]
  let dpMin = [max]

  for(let i = 1; i < nums.length; i++) {
      dpMax[i] = Math.max(nums[i], dpMax[i - 1] * nums[i], dpMin[i - 1] * nums[i])
      dpMin[i] = Math.min(nums[i], dpMax[i - 1] * nums[i], dpMin[i - 1] * nums[i])
      max = Math.max(max, dpMax[i])
  }
  return max
};


// 方法三：动态规划优化之滚动数组（滚动变量）
// 时间复杂度：O(N)
// 空间复杂度：O(1)
var maxProduct = function(nums) {
  let max = nums[0]
  let preMax = max
  let preMin = max
  let curMax = max
  let curMin = max

  for(let i = 1; i < nums.length; i++) {
      curMax = Math.max(nums[i], preMax * nums[i], preMin * nums[i])
      curMin = Math.min(nums[i], preMax * nums[i], preMin * nums[i])
      max = Math.max(max, curMax)
      preMax = curMax
      preMin = curMin
  }
  return max
};


// 方法四：可以对 0 的情况进行优化
