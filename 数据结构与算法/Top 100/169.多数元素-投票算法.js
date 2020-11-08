// 力扣（LeetCode）：https://leetcode-cn.com/problems/majority-element

// 给定一个大小为 n 的数组，找到其中的多数元素。多数元素是指在数组中出现次数大于 ⌊ n/2 ⌋ 的元素。
// 你可以假设数组是非空的，并且给定的数组总是存在多数元素。

// 示例 1:
// 输入: [3,2,3]
// 输出: 3

// 示例 2:
// 输入: [2,2,1,1,1,2,2]
// 输出: 2


// 方法一：排序取中间值，因为众数超过一半一定是中位数

// 方法二：分治

// 方法三：哈希表
var majorityElement = function(nums) {
  let obj = {}
  let halfLen = nums.length >> 1
  for(let i = 0; i < nums.length; i++) {
      let num = nums[i]
      if (!obj[num]) obj[num] = 0
      obj[num]++
      if (obj[num] > halfLen) return num
  }
};

// 方法四：投票算法
// 两个不同的票和为 0
var majorityElement = function(nums) {
  let rs = nums[0]
  let count = 1

  for(let i = 1; i < nums.length; i++) {
      if (count === 0) rs = nums[i]
      if (rs === nums[i]) {
          count++
      } else {
          count--
      }
  }

  return rs
};
