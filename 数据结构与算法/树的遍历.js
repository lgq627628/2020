function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}


function preOrder(node) {
  if (!node) return

  preOrder(node.left)
  preOrder(node.right)
}


function tree2Arr(node) { // 中序遍历
  return node ? tree2Arr(node.left).concat(node.val, tree2Arr(node.right)) : []
}

// 求二叉树的最大深度
var maxDepth = function(root) {
  if (!root) return 0
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
};

// 求二叉树的最小深度
var minDepth = function(root) {
    if (!root) return 0
    let deep = 0
    if (!root.left || !root.right) {
        deep = Math.max(minDepth(root.left), minDepth(root.right)) + 1
    } else {
        deep = Math.min(minDepth(root.left), minDepth(root.right)) + 1
    }
    return  deep
};
