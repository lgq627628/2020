// 力扣（LeetCode）：https://leetcode-cn.com/problems/add-two-numbers

// 给出两个 非空 的链表用来表示两个非负的整数。其中，它们各自的位数是按照 逆序 的方式存储的，并且它们的每个节点只能存储 一位 数字。
// 如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。
// 您可以假设除了数字 0 之外，这两个数都不会以 0 开头。
// 著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。

// 示例：
// 输入：(2 -> 4 -> 3) + (5 -> 6 -> 4)
// 输出：7 -> 0 -> 8
// 原因：342 + 465 = 807

function ListNode(val) {
    this.val = val;
    this.next = null;
}
var addTwoNumbers = function(l1, l2) {
  let dummy = new ListNode()
  cur =  dummy
  let needOne = 0
  while(l1 || l2) {
      let sum = (l1 && l1.val || 0) + (l2 && l2.val || 0) + needOne
      if (sum >= 10) {
          needOne = 1
          sum = sum - 10
      } else {
          needOne = 0
      }
      cur.next = new ListNode(sum)
      cur = cur.next
      if (l1) l1 = l1.next
      if (l2) l2 = l2.next
  }
  if (needOne) cur.next = new ListNode(1)
  return dummy.next
};


const l1 = { val: 2, next: {val: 4, next: { val: 3 }} }
const l2 = { val: 5, next: {val: 6, next: { val: 4 }} }
const rs = addTwoNumbers(l1, l2);
console.log(rs);