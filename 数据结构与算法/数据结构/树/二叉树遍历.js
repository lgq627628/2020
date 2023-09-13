// 因为无论是前、中、后序遍历，都是先访问根节点，再访问它的左子树，再访问它的右子树。
// 区别在哪里？比如中序遍历，它是将 do something with root（处理当前节点）放在了访问完它的左子树之后。比方说，打印节点值，就会产生「左根右」的打印顺序。
// 所以，它们的唯一区别是：在什么时间点去处理节点，去拿他做文章

// 二叉树的递归遍历，就是以根元素的位置关系命名
function preorder(root) {
  if(!root) return;

  console.log(root.val);
  preorder(root.left);
  preorder(root.right);
}
function inorder(root) {
  if (!root) return;

  inorder(root.left);
  console.log(root.val);
  inorder(root.right);
}
function postorder(root) {
  if (!root) return;

  postorder(root.left);
  postorder(root.right);
  console.log(root.val);
}

// 二叉树的迭代遍历
function preorderTraversal(root) {
  const res = [];
  if (!root) return res;

  const stack = []
  stack.push(root);
  while(stack.length) {
    let top = stack.pop();
    res.push(top.val);
    top.right && stack.push(top.right);
    top.left && stack.push(top.left);
  }
  console.log(res);
  return res;
}
function postorderTraversal(root) {
  const res = [];
  if (!root) return res;

  const stack = [];
  stack.push(root);
  while(stack.length) {
    let top = stack.pop();
    res.unshift(top.val);
    top.left && stack.push(top.left);
    top.right && stack.push(top.right);
  }
  console.log(res);
  return res;
}
function inorderTraversal(root) {
  const res = [];
  if (!root) return res;

  const stack = [];
  let cur = root; // 用一个 cur 结点充当游标
  while(cur || stack.length) {
    while(cur) { // 这个 while 的作用是把寻找最左叶子结点的过程中，途径的所有结点都记录下来
      stack.push(cur);
      cur = cur.left;
    }
    // 从最左的叶子结点开始，一层层回溯遍历左孩子的父结点和右侧兄弟结点
    let top = stack.pop();
    res.push(top.val);
    cur = top.right;
  }
  console.log(res);
  return res;
}

// 广度优先遍历 || 层序遍历
function bfs(root) {
  const queue = [];
  queue.push(root);

  while(queue.length) { // 每一次 while 循环其实都对应着二叉树的某一层
    let top = queue.shift();
    // 这里可以处理 top 元素
    console.log(top.val);
    top.left && queue.push(top.left);
    top.right && queue.push(top.right);
  }
}
// 层序遍历分层
function levelOrder(root) {
  const rs = [];
  const queue = [];
  queue.push(root);

  while(queue.length) {
    let len = queue.length;
    let level = [];

    for(let i = 0; i < len; i++) {
      let top = queue.shift();
      level.push(top.val);
      top.left && queue.push(top.left);
      top.right && queue.push(top.right);
    }
    rs.push(level);
  }
  console.log(rs);
  return rs;
}

function snakeLevelOrder(root) {
  const rs = [];
  const queue = [];
  queue.push(root);

  while(queue.length) {
    let len = queue.length;
    let level = [];

    for(let i = 0; i < len; i++) {
      let top = queue.shift();
      level.push(top.val);
      top.left && queue.push(top.left);
      top.right && queue.push(top.right);
    }
    if (rs.length % 2 === 0) level.reverse();
    level.forEach(l => console.log(l));
    rs.push(level);
  }
  console.log(rs);
  return rs;
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

bfs(root);
preorderTraversal(root);
postorderTraversal(root);
inorderTraversal(root);
levelOrder(root);
snakeLevelOrder(root);