// 力扣（LeetCode）：https://leetcode-cn.com/problems/number-of-islands

// 给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
// 岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。
// 此外，你可以假设该网格的四条边均被水包围。

// 示例 1：
// 输入：grid = [
//   ["1","1","1","1","0"],
//   ["1","1","0","1","0"],
//   ["1","1","0","0","0"],
//   ["0","0","0","0","0"]
// ]
// 输出：1

// 示例 2：
// 输入：grid = [
//   ["1","1","0","0","0"],
//   ["1","1","0","0","0"],
//   ["0","0","1","0","0"],
//   ["0","0","0","1","1"]
// ]
// 输出：3


// 方法一：深度优先搜索
// 时间复杂度：O(MN)，其中 MM 和 NN 分别为行数和列数。
// 空间复杂度：O(MN)，在最坏情况下，整个网格均为陆地，深度优先搜索的深度达到 O(MN)。

var numIslands = function(grid) {
  let row = grid.length
  let col = grid[0].length
  let dir = [[-1, 0], [1, 0], [0, 1], [0, -1]]
  let num = 0
  function dfs(x, y) {
      if (x < 0 || x >= row || y < 0 || y >= col || grid[x][y] === '0') return
      grid[x][y] = '0'
      dir.forEach(d => {
          dfs(x + d[0], y + d[1])
      })
  }

  for(let i = 0; i < row; i++) {
      for(let j = 0; j < col; j++) {
          if (grid[i][j] === '1') {
              dfs(i, j)
              num++
          }
      }
  }

  dfs(0, 0)

  return num
};
