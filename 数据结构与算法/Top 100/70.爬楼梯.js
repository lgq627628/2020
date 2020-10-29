// 力扣（LeetCode）：https://leetcode-cn.com/problems/climbing-stairs

// 假设你正在爬楼梯。需要 n 阶你才能到达楼顶。
// 每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
// 注意：给定 n 是一个正整数。

// 示例 1：
// 输入： 2
// 输出： 2
// 解释： 有两种方法可以爬到楼顶。
// 1.  1 阶 + 1 阶
// 2.  2 阶

// 示例 2：
// 输入： 3
// 输出： 3
// 解释： 有三种方法可以爬到楼顶。
// 1.  1 阶 + 1 阶 + 1 阶
// 2.  1 阶 + 2 阶
// 3.  2 阶 + 1 阶

// 方法一：递归
// 时间复杂度：也就是执行的次数 O(2^n)
// 空间复杂度：也就是树的深度 O(n)
// 下面这样子看比较容易理解复杂度
//       5
//    4     3       2^1
//   3 2   2 1      2^2
//  2 1             2^3
// 问题是重复计算，如果加个缓存，就能保证每个台阶只被计算一次，时间复杂度就变成 O(n)
var climbStairs = function(n) {
  if (n <= 2) return n
  return climbStairs(n-1) + climbStairs(n-2)
};
var climbStairs = function(n, caches) {
  caches = caches || { 1: 1, 2: 2 }
  if (caches[n]) return caches[n]
  caches[n] = climbStairs(n-1, caches) + climbStairs(n-2, caches)
  return caches[n]
};



// 方法二：动态规划
// 时间和空间复杂度都是 O(n)
// 事实上和缓存后的递归异曲同工
var climbStairs = function(n) {
  if (n <= 2) return n
  let rs = [0, 1, 2]
  for (let i = 3; i <= n; i++) {
      rs.push(rs[i - 1] + rs[i - 2]);
  }
  return rs[rs.length - 1]
};
// 利用滚动数组优化，因为其实只需要保存两个值即可，这样就可以将空间复杂度降为 O(1)
var climbStairs = function(n) {
  if (n <= 2) return n
  let first = 1
  let second = 2
  for (let i = 3; i <= n; i++) {
      let cur = first + second
      first = second
      second = cur
  }
  return second
};


// 方法三：矩阵，这个有点难
// 方法四：推导出通项公式
// 时间复杂度：OO(logn)，pow 方法将会用去 O(logn) 的时间。
// 空间复杂度：O(1)。
// https://leetcode-cn.com/problems/climbing-stairs/solution/hua-jie-suan-fa-70-pa-lou-ti-by-guanpengchn/
