// 给定一个二叉树，判断它是否是高度平衡的二叉树
function isBalance(root) {
  let flag = true // 立一个flag，只要有一个高度差绝对值大于1，这个flag就会被置为false
  function dfs(root) {
    if (!root || !flag) return 0;

    let leftDeep = dfs(root.left);
    let rightDeep = dfs(root.right);
    if (Math.abs(leftDeep - rightDeep) > 1) {
      flag = false;
      return 0; // 后面再发生什么已经不重要了，返回一个不影响回溯计算的值
    }
    return Math.max(leftDeep, rightDeep) + 1;
  }

  dfs(root);
  return flag;
}


// 给你一棵二叉搜索树，请你返回一棵平衡后的二叉搜索树
// 中序遍历求出有序数组 + 逐个将二分出来的数组子序列“提”起来变成二叉搜索树
