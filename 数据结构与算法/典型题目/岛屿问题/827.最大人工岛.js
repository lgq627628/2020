// 力扣（LeetCode）：https://leetcode-cn.com/problems/making-a-large-island

// 在二维地图上， 0代表海洋， 1代表陆地，我们最多只能将一格 0 海洋变成 1变成陆地。
// 进行填海之后，地图上最大的岛屿面积是多少？（上、下、左、右四个方向相连的 1 可形成岛屿）

// 示例 1:
// 输入: [[1, 0], [0, 1]]
// 输出: 3
// 解释: 将一格0变成1，最终连通两个小岛得到面积为 3 的岛屿。

// 示例 2:
// 输入: [[1, 1], [1, 0]]
// 输出: 4
// 解释: 将一格0变成1，岛屿的面积扩大为 4。

// 示例 3:
// 输入: [[1, 1], [1, 1]]
// 输出: 4
// 解释: 没有0可以让我们变成1，面积依然为 4。

// 主要思路就是先遍历一遍普通的岛屿面积，并将同一片岛屿区域做上相同的标识（编号），并且用哈希表记录标识面积映射
// 再遍历一遍 0 的岛屿，将其上下左右的面积相加即可，注意排除相同区域
var largestIsland = function(grid) {
  let maxArea = 0

  let row = grid.length
  let col = grid[0].length

  let flagNum = -1;
  let tempArea = 0;
  let areaMap = {}

  let dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]]

  function dfs(i, j) {
      if (i < 0 || j < 0 || j >= col || i >= row) return
      if (grid[i][j] !== 1) return
      grid[i][j] = flagNum
      tempArea++
      dirs.forEach(dir => {
          let x = dir[0] + i
          let y = dir[1] + j
          dfs(x, y)
      })
  }

  for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
          if (grid[i][j] === 1) {
              tempArea = 0;
              dfs(i, j)
              areaMap[flagNum] = tempArea
              flagNum--
              maxArea = Math.max(maxArea, tempArea)
          }
      }
  }
  for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
          if (grid[i][j] === 0) {
              tempArea = 0
              tempArea = 1 + checkAround(i, j)
              maxArea = Math.max(maxArea, tempArea)
          }
      }
  }
  function checkAround(i, j) {
      let sum = 0;
      let obj = {}
      dirs.forEach(dir => {
          let x = dir[0] + i
          let y = dir[1] + j
          if (x < 0 || y < 0 || y >= col || x >= row) return
          let tempFlagNum = grid[x][y]
          if (obj[tempFlagNum]) return
          if (areaMap[tempFlagNum]){
              obj[tempFlagNum] = 1
              sum += areaMap[tempFlagNum]
          }
      })
      return sum
  }

  return maxArea
}
