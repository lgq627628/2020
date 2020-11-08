// 力扣（LeetCode）：https://leetcode-cn.com/problems/perfect-squares

给定正整数 n，找到若干个完全平方数（比如 1, 4, 9, 16, ...）使得它们的和等于 n。你需要让组成和的完全平方数的个数最少。

示例 1:
输入: n = 12
输出: 3
解释: 12 = 4 + 4 + 4.

示例 2:
输入: n = 13
输出: 2
解释: 13 = 4 + 9.

// 动态规划
var numSquares = function(n) {
  let f = [0]
  for (let i = 1; i <= n; i++) {
      f[i] = i
      let j = 1
      while(i - j * j >= 0){
          f[i] = Math.min(f[i], f[i - j * j] + 1)
          j++
      }
  }
  return f[n]
};
