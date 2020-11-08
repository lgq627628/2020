// 力扣（LeetCode）：https://leetcode-cn.com/problems/unique-paths

// 一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为“Start” ）。
// 机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为“Finish”）。
// 问总共有多少条不同的路径？


// https://leetcode-cn.com/problems/unique-paths/solution/62-bu-tong-lu-jing-pai-lie-zu-he-dong-tai-gui-hua-/
// https://leetcode-cn.com/problems/unique-paths/solution/62-bu-tong-lu-jing-by-alexer-660/
// https://leetcode-cn.com/problems/unique-paths/solution/jsyi-wei-shu-zu-dong-tai-gui-hua-by-hoomjac/

var uniquePaths = function(m, n) {
  if (m <= 1 || n <= 1) return 1
  return uniquePaths(m - 1, n) + uniquePaths(m, n - 1)
};



var uniquePaths = function(m, n) {
  let rs = []
  for(let i = 1; i <= m; i++) {
      rs[i] = []
      for(let j = 1; j <= n; j++) {
          if (i <= 1 || j <= 1) rs[i][j] = 1
          else rs[i][j] = rs[i - 1][j] + rs[i][j - 1]
      }
  }
  return rs[m][n]
};
