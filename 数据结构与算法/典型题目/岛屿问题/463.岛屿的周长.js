// 力扣（LeetCode）：https://leetcode-cn.com/problems/island-perimeter

// 给定一个包含 0 和 1 的二维网格地图，其中 1 表示陆地 0 表示水域。
// 网格中的格子水平和垂直方向相连（对角线方向不相连）。整个网格被水完全包围，但其中恰好有一个岛屿（或者说，一个或多个表示陆地的格子相连组成的岛屿）。
// 岛屿中没有“湖”（“湖” 指水域在岛屿内部且不和岛屿周围的水相连）。格子是边长为 1 的正方形。网格为长方形，且宽度和高度均不超过 100 。计算这个岛屿的周长。

// 示例 :
// 输入:
// [[0,1,0,0],
//  [1,1,1,0],
//  [0,1,0,0],
//  [1,1,0,0]]
// 输出: 16


var islandPerimeter = function(grid) {
    let l = 0
    let row = grid.length
    let col = grid[0].length
    let dirs = [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}]
    function dfs(i, j) {
        let count = 4
        dirs.forEach(dir => {
            let tempI = dir.x + i
            let tempJ = dir.y + j
            let isInArea = tempI >= 0 && tempJ >= 0 && tempI < row && tempJ < col;
            if (isInArea && grid[tempI][tempJ] === 1) {
                count--
            }
        });
        l += count
    }

    for(let i = 0; i < row; i++) {
        for(let j = 0; j < col; j++) {
            if (grid[i][j] === 1) {
                dfs(i, j)
            }
        }
    }

    return l
};
