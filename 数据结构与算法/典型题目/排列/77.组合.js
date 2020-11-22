// 力扣（LeetCode）：https://leetcode-cn.com/problems/combinations

// 给定两个整数 n 和 k，返回 1 ... n 中所有可能的 k 个数的组合。

// 示例:
// 输入: n = 4, k = 2
// 输出:
// [
//   [2,4],
//   [3,4],
//   [2,3],
//   [1,2],
//   [1,3],
//   [1,4],
// ]
var combine = function(n, k) {
  let rs = []
  let path = []
  function dfs(idx) {
      if (path.length === k) {
          rs.push([...path])
          return
      }
      for(let i = idx; i <= n; i++) {
          if (path.includes(i)) continue
          path.push(i)
          dfs(i + 1)
          path.pop()
      }
  }
  dfs(1)
  return rs
};
