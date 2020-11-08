// 力扣（LeetCode）：https://leetcode-cn.com/problems/binary-tree-inorder-traversal

// 给定一个二叉树，返回它的中序 遍历。

// 示例:
// 输入: [1,null,2,3]
//    1
//     \
//      2
//     /
//    3

// 输出: [1,3,2]


/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

//  递归：
// 时间复杂度：O(n)，其中 nn 为二叉树节点的个数。二叉树的遍历中每个节点会被访问一次且只会被访问一次。
// 空间复杂度：O(n)。空间复杂度取决于递归的栈深度，而栈深度在二叉树为一条链的情况下会达到 O(n) 的级别。
/**
 * @param {TreeNode} root
 * @return {number[]}
 */
var inorderTraversal = function(root) {
  let rs = []
  function dfs(root) {
      if (!root) return
      dfs(root.left)
      rs.push(root.val)
      dfs(root.right)
  }
  dfs(root)
  return rs
};
