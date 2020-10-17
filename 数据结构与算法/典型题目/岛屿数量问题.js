// 岛屿数量问题：典型的网格型递归
// 题目描述：给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
// 岛屿总是被水包围，并且每座岛屿只能由水平方向或竖直方向上相邻的陆地连接形成。
// 此外，你可以假设该网格的四条边均被水包围。
// [[1,1,1,1,0],
//  [1,1,0,1,0],
//  [1,1,0,0,0]
//  [0,0,0,0,0]] // 输出 1
// [[1,1,0,0,0],
//  [1,1,0,0,0],
//  [0,0,1,0,0],
//  [0,0,0,1,1]] // 输出 3
function calcIslandNum(arr) {
  const dirs = [{i: 0, j: 1}, {i: 0, j: -1}, {i: -1, j: 0}, {i: 1, j: 0}]
  let row = arr.length;
  let col = arr[0].length;
  let sum = 0;
  function dfs(i, j) {
    if (i < 0 || i >= row || j < 0 && j >= col || !arr[i][j]) return
    arr[i][j] = 0
    dirs.forEach(dir => {
      let x = i + dir.i
      let y = j + dir.j
      dfs(x, y)
    })
  }

  for(let i = 0; i < row; i++) {
    for(let j = 0; j < col; j++) {
      if (arr[i][j]) {
        dfs(i, j)
        sum++
      }
    }
  }
  return sum
}

let rs = calcIslandNum([
  [1,1,1,1,0],
  [1,1,0,1,0],
  [1,1,0,0,0]
  [0,0,0,0,0]])
console.log(rs) // 1
rs = calcIslandNum([
  [1,1,0,0,0],
  [1,1,0,0,0],
  [0,0,1,0,0],
  [0,0,0,1,1]])
console.log(rs) // 3
