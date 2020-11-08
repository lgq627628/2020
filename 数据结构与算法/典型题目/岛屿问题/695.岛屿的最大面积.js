// 力扣（LeetCode）：https://leetcode-cn.com/problems/max-area-of-island

// 给定一个包含了一些 0 和 1 的非空二维数组 grid 。
// 一个 岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 必须在水平或者竖直方向上相邻。你可以假设 grid 的四个边缘都被 0（代表水）包围着。
// 找到给定的二维数组中最大的岛屿面积。(如果没有岛屿，则返回面积为 0 。)

// 示例 1:
// [[0,0,1,0,0,0,0,1,0,0,0,0,0],
//  [0,0,0,0,0,0,0,1,1,1,0,0,0],
//  [0,1,1,0,1,0,0,0,0,0,0,0,0],
//  [0,1,0,0,1,1,0,0,1,0,1,0,0],
//  [0,1,0,0,1,1,0,0,1,1,1,0,0],
//  [0,0,0,0,0,0,0,0,0,0,1,0,0],
//  [0,0,0,0,0,0,0,1,1,1,0,0,0],
//  [0,0,0,0,0,0,0,1,1,0,0,0,0]]
// 对于上面这个给定矩阵应返回 6。注意答案不应该是 11 ，因为岛屿只能包含水平或垂直的四个方向的 1 。

// 示例 2:
// [[0,0,0,0,0,0,0,0]]
// 对于上面这个给定的矩阵, 返回 0。

// 注意: 给定的矩阵 grid 的长度和宽度都不超过 50。


// 时间复杂度：O(R∗C)。其中 R 是给定网格中的行数，C 是列数。我们访问每个网格最多一次。
// 空间复杂度：O(R∗C)，递归的深度最大可能是整个网格的大小，因此最大可能使用 O(R∗C) 的栈空间。

var maxAreaOfIsland = function(grid) {
  let maxArea = 0
  let row = grid.length
  let col = grid[0].length

  let tempArea = 0
  function dfs(i, j) {
      if (i < 0 || j < 0 || i >= row || j >= col) return
      if (grid[i][j] !== 1) return
      grid[i][j] = 0
      tempArea++;
      let dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]
      dirs.forEach(dir => {
          let x = dir[0] + i
          let y = dir[1] + j
          dfs(x, y)
      })
  }

  for(let i = 0; i < row; i++) {
      for(let j = 0; j < col; j++) {
          tempArea = 0;
          dfs(i, j)
          maxArea = Math.max(maxArea, tempArea);
      }
  }

  return maxArea
};
