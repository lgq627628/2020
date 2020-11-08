function LinkNode(value) {
  this.value = value;
  this.next = null;
}

// leetcode-21、合并两个有序链表：新建一个链表节点，依次比较两个链表取最小值，和合并两个有序数组有异曲同工之妙
function mergeLinkNode(l1, l2) {
  let head = new LinkNode();
  let cur = head;
  while(l1 && l2) {
    let value1 = l1.value;
    let value2 = l2.value;
    if (value1 <= value2) {
      cur.next = l1;
      l1 = l1.next;
    } else {
      cur.next = l2;
      l2 = l2.next;
    }
    cur = cur.next;
  }
  if (l1) cur.next = l1;
  if (l2) cur.next = l2;
  return head.next;
}
function mergeLinkNode2(l1, l2) { // 递归
  if (!l1) {
    return l2
  } else if (!l2) {
    return l1
  } else if (l1.value <= l2.value) {
    l1.next = mergeLinkNode2(l1.next, l2)
    return l1
  } else {
    l2.next = mergeLinkNode2(l1, l2.next)
    return l2
  }
}

let link1 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 4
    }
  }
}
let link2 = {
  value: 1,
  next: {
    value: 3,
    next: {
      value: 4
    }
  }
}
let rs = mergeLinkNode2(link1, link2);
console.log(JSON.stringify(rs, null, 4));



// xx、删除有序链表的重复项
function uniqueLink(l) {
  let cur = l;
  while(cur && cur.next) {
    if (cur.value === cur.next.value) {
      cur.next = cur.next.next;
    } else {
      cur = cur.next;
    }
  }
  return l
}

let link3 = {
  value: 1,
  next: {
    value: 1,
    next: {
      value: 2,
      next: {
        value: 3,
        next: {
          value: 3
        }
      }
    }
  }
}
let rs3 = uniqueLink(link3);
console.log(JSON.stringify(rs3, null, 4));



// xx、删除有序链表的所有重复项
// 如果继续沿用刚才的思路，我们会发现完全走不通。因为我们的 cur 指针就是从图中第一个结点出发开始遍历的，无法定位到第一个结点的前驱结点，删除便无法完成
function uniqueAllLink(l) {
  if (!l || !l.next) return l;

  let dummy = new LinkNode();
  dummy.next = l;
  let cur = dummy;
  while(cur.next && cur.next.next) {
    if(cur.next.value === cur.next.next.value) {
      let tempValue = cur.next.value;
      while(cur.next && cur.next.value === tempValue) {
        cur.next = cur.next.next;
      }
    } else {
      cur = cur.next;
    }
  }
  return dummy.next;
}

let link4 = {
  value: 1,
  next: {
    value: 1,
    next: {
      value: 2,
      next: {
        value: 3,
        next: {
          value: 3
        }
      }
    }
  }
}

let rs4 = uniqueAllLink(link4);
console.log(JSON.stringify(rs4, null, 4));



// xx、删除链表的倒数第 N 个结点
function delLinkItem(l, n) {
  if (!l || !l.next || n < 1) return;

  let slow = l;
  let fast = l;
  n++
  while(n--) fast = fast.next;

  while(fast) {
    slow = slow.next
    fast = fast.next
  }
  slow.next = slow.next.next;
  return l;
}

let link5 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5
        }
      }
    }
  }
}
let rs5 = delLinkItem(link5, 2);
console.log(JSON.stringify(rs5, null, 4));



// xx、反转链表
function revertLink(l) {
  let pre = null;
  let cur = l;

  while(cur) {
    let next = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }
  return pre;
}

let link6 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5
        }
      }
    }
  }
}
let rs6 = revertLink(link6);
console.log(JSON.stringify(rs6, null, 4));



// xx、反转从位置 m 到 n 的链表
function revertPartLink(l, m, n) {
  let dummy = new LinkNode();
  dummy.next = l;

  let point = dummy;
  for(let i = 0; i < m - 1; i++) point = point.next;
  let leftHand = point;
  let start = leftHand.next

  let pre = point.next;
  let cur = pre.next;
  for (let i = m; i < n; i++) {
    let next = cur.next;
    cur.next = pre;
    pre = cur;
    cur = next;
  }

  leftHand.next = pre;
  start.next = cur;

  return dummy.next;
}

let link7 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5
        }
      }
    }
  }
}
let rs7 = revertPartLink(link7, 2, 4);
console.log(JSON.stringify(rs7, null, 4));


// xx、是否有环
function isCircleLink(l) {
  while(l) {
    if (l.flag) {
      return true;
      // return head; // 如果要返回第一个环元素
    } else {
      l.flag = true;
      l = l.next;
    }
  }
  return false
}
let link8 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5
        }
      }
    }
  }
}
let rs8 = isCircleLink(link8);
console.log(JSON.stringify(rs8, null, 4));






// xx、K个一组翻转链表
// 题目描述：给你一个链表，每 k 个节点一组进行翻转，请你返回翻转后的链表。
// k 是一个正整数，它的值小于或等于链表的长度。
// 如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。
function reverseKLink(l, k) {

}
let link9 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: {
          value: 5
        }
      }
    }
  }
}
let rs9 = reverseKLink(link9);
console.log(JSON.stringify(rs9, null, 4));




// xx、复制带随机指针的链表
// 思路：先复制普通链表，同时建立新旧链表的映射关系；再循环一遍原始链表复制随机的值



// xx、相交链表
// 链表 A 走完走 B，链表 B 走完走 A，也就是他们移动相同的距离（A + B）
var getIntersectionNode = function(headA, headB) {
  let pA =  headA
  let pB =  headB

  while(pA || pB) {
      if (pA === pB) return pA
      pA = pA ? pA.next : headB
      pB = pB ? pB.next : headA
  }

  return null
};
