// xx、给定一个没有重复数字的序列，返回其所有可能的全排列

function pailie(nums) {
  let rs = [];
  let cur = [];
  let visited = {}; // 避免使用相同的数字
  let len = nums.length;

  function dfs(n) {
    if (n === len) {
      rs.push(cur.slice());
      return;
    }

    for(let i = 0; i < len; i++) {
      // 检查手里剩下的重复数字
      if (!visited[nums[i]]) { // 每次从第一个未被使用的数字开始循环
        visited[nums[i]] = true;
        cur.push(nums[i]);
        dfs(n + 1);

        cur.pop();
        visited[nums[i]] = false;
      }

    }
  }
  dfs(0);
  return rs;
}

let arr = [1,2,3];
let rs = pailie(arr);
console.log(rs);
