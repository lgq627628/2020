// 力扣（LeetCode）：https://leetcode-cn.com/problems/container-with-most-water

// 给你 n 个非负整数 a1，a2，...，an，每个数代表坐标中的一个点 (i, ai) 。在坐标内画 n 条垂直线，垂直线 i 的两个端点分别为 (i, ai) 和 (i, 0)。找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。
// 说明：你不能倾斜容器，且 n 的值至少为 2。

// 示例：
// 输入：[1,8,6,2,5,4,8,3,7]
// 输出：49


// 思路：
// 1、相同情况下左右两边距离越远越好，想想暴力循环的方式是都从左边开始，事实上我们只要固定左边，然后从右边开始计算就能省去中间的步骤
// 2、区域面积受制于较短边

var maxArea = function(height) {
  let left = 0;
  let right = height.length - 1;
  let max = -Infinity;
  while(left < right) {
      let leftVal = height[left]
      let rightVal = height[right]

      if (leftVal < rightVal) {
          max = Math.max(max, (right - left) * leftVal)
          left++
      } else {
          max = Math.max(max, (right - left) * rightVal)
          right--
      }
  }
  return max
};
