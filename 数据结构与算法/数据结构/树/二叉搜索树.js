// 又名二叉查找树、排序二叉树
function TreeNode(val) {
  this.val = val;
  this.left = this.right = null;
}

function search(root, n) {
  if (!root) return;

  let val = root.val;
  if (val > n) {
    search(root.left, n)
  } else if (val < n) {
    search(root.right, n)
  } else {
    return root;
  }
}

// leetcode 701 题 => https://leetcode-cn.com/problems/insert-into-a-binary-search-tree/
function insert(root, n) {
  if (!root) {
    root = new TreeNode(n);
    return root;
  }
  let val = root.val;
  if (val > n) {
    root.left = insert(root.left, n);
  } else if (val < n) {
    root.right = insert(root.right, n);
  }
  return root;
}
// leetcode 450 题 => https://leetcode-cn.com/problems/delete-node-in-a-bst/
function deleteNode(root, n) {
  if (!root) return root;

  let val = root.val;
  if (val < n) {
    root.right = deleteNode(root.right, n);
  } else if (val > n) {
    root.left = deleteNode(root.left, n);
  } else { // 开始删除，一直删除左侧会导致二叉树的左右子树高度不平衡，如果题目中要求我们顾及二叉树的平衡度，那么我们就可以在删除的过程中记录子树的高度，每次选择高度较高的子树作为查找目标，用这个子树里的结点去覆盖需要删除的目标结点。也就是 findMax 和 findMin 里面多加个 deep 计数标识
    if (root.left) { // 去左子树里寻找小于目标结点值的最大结点，用这个结点覆盖掉目标结点，删除原有的 maxLeft 节点
      let maxLeft = findMax(root.left);
      root.val = maxLeft.val;
      root.left = deleteNode(root.left, maxLeft.val);
    } else if (root.right) { // 去右子树里寻找大于目标结点值的最小结点，用这个结点覆盖掉目标结点，删除原有的 minRight 节点
      let minRight = findMin(root.right);
      root.val = minRight.val;
      root.right = deleteNode(root.right, minRight.val);
    } else { // 没有子节点，直接删除
      root = null;
    }
  }

  return root;
}
function findMax(root) {
  while(root.right) root = root.right;
  return root;
}
function findMin(root) {
  while(root.left) root = root.left;
  return root;
}


function isValidBST(root) { // 在递归式中，如果单独维护一段逻辑，用于判定当前是左孩子还是右孩子，进而决定是进行大于判定还是小于判定，也是没问题的。但是在上面的编码中我们采取了一种更简洁的手法，
  function dfs(root, min, max) {
    if (!root) return true;
    let val = root.val;
    return val < max && val > min && dfs(root.left, min, val) && dfs(root.right, val, max)
  }
  return dfs(root, -Infinity, Infinity);
}

function isValidBST(root) { // 看起来是错的
  if (!root) return true;
  let leftBool = root.left ? root.left.val < root.val : true;
  let rightBool = root.right ? root.right.val > root.val : true;
  return leftBool && rightBool && isValidBST(root.left) && isValidBST(root.right);
}

const root = {
  val: 6,
  left: {
    val: 3,
    left: {
      val: 1
    },
    right: {
      val: 4
    }
  },
  right: {
    val: 8,
    left: {
      val: 10
    },
    right: {
      val: 9
    }
  }
};

let rs = isValidBST(root);
console.log(rs);

// 将排序数组转化为二叉搜索树
function sortedArr2BST(arr) {
  if (!arr.length) return null;
  let midIdx = ~~(arr.length / 2);
  let tempNode = new TreeNode(arr[midIdx]);
  tempNode.left = sortedArr2BST(arr.slice(0, midIdx));
  tempNode.right = sortedArr2BST(arr.slice(midIdx + 1));
  return tempNode;
}

let rs2 = sortedArr2BST([-10,-3,0,5,9]);
console.log(rs2);
