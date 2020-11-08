// 力扣（LeetCode）：https://leetcode-cn.com/problems/validate-binary-search-tree

// 给定一个二叉树，判断其是否是一个有效的二叉搜索树。

// 假设一个二叉搜索树具有如下特征：
// 节点的左子树只包含小于当前节点的数。
// 节点的右子树只包含大于当前节点的数。
// 所有左子树和右子树自身必须也是二叉搜索树。

// 示例 1:
// 输入:
//     2
//    / \
//   1   3
// 输出: true

// 示例 2:
// 输入:
//     5
//    / \
//   1   4
//      / \
//     3   6
// 输出: false
// 解释: 输入为: [5,1,4,null,null,3,6]。
//      根节点的值为 5 ，但是其右子节点值为 4 。


/**
 * Definition for a binary tree node.
 * function TreeNode(val) {
 *     this.val = val;
 *     this.left = this.right = null;
 * }
 */

// 方法一：递归
// 时间和空间复杂度都是 O(n)
// 注意：不是每个节点的右值 > 中值 > 左值就行，是要整个右树 > 中值 > 整个左子树
var isValidBST = function(root) {
  function dfs(root, min, max) {
      if (!root) return true
      if (root.val <= min || root.val >= max) return false
      return dfs(root.left, min, root.val) && dfs(root.right, root.val, max)
  }
  return dfs(root, -Infinity, Infinity)
};




// 方法二：利用中序遍历为顺序
