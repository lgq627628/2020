// 翻转二叉树
function invertTree(root) {
  if (!root) return;
  let { left, right } = root;
  root.left = right;
  root.right = left;
  invertTree(root.left);
  invertTree(root.right);
  // let right = invertTree(root.right);
  // let left = invertTree(root.left);
  // root.left = right;
  // root.right = left;
  return root;
}
const root = {
  val: "A",
  left: {
    val: "B",
    left: {
      val: "D"
    },
    right: {
      val: "E"
    }
  },
  right: {
    val: "C",
    right: {
      val: "F"
    }
  }
};


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
