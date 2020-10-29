// 力扣（LeetCode）：https://leetcode-cn.com/problems/subarray-sum-equals-k/
// 给定一个整数数组（可以是负数）和一个整数 k，你需要找到该数组中和为 k 的连续的子数组的个数。
// 示例 1 :
// 输入:nums = [1,1,1], k = 2
// 输出: 2 , [1,1] 与 [1,1] 为两种不同的情况。


// 方法一：暴力
var subarraySum = function(nums, k) {
  let count = 0;
  for(let i = 0; i < nums.length; i++) {
      let sum = 0
      for(let j = i; j < nums.length; j++) {
          sum += nums[j]
          if (sum === k) count++;
      }
  }
  return count
};
// 上面这个时间复杂度为 O(n2)，空间复杂度为 O(1)
let rs = subarraySum([3,4,7,2,-3,1,4,2], 7)
console.log(rs)


// 方法二：前缀和 + 哈希表优化
var subarraySum2 = function(nums, k) {
  let count = 0;
  let pre = [] // 前缀和，pre[max] - pre[min] = nums[min + 1] + nums[min + 2] + nums[min + 3] + ... + nums[max]
  nums.forEach((num, i) => {
    if (i === 0) pre[i] = num
    else pre[i] = pre[i - 1] + num
  })
  console.log('原数组：', nums)
  console.log('前缀和：', pre)
  for(let i = 0; i < nums.length; i++) {
    if (pre[i] === k) count++
    for(let j = i; j < nums.length; j++) {
      if (pre[j] - pre[i] === k) count++
    }
  }
  return count
};
rs = subarraySum2([3,4,7,2,-3,1,4,2], 7)
console.log(rs)
