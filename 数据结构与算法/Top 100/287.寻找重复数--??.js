// 力扣（LeetCode）：https://leetcode-cn.com/problems/find-the-duplicate-number

// 给定一个包含 n + 1 个整数的数组 nums，其数字都在 1 到 n 之间（包括 1 和 n），可知至少存在一个重复的整数。假设只有一个重复的整数，找出这个重复的数。

// 示例 1:
// 输入: [1,3,4,2,2]
// 输出: 2

// 示例 2:
// 输入: [3,1,3,4,2]
// 输出: 3

// 说明：
// 不能更改原数组（假设数组是只读的）。
// 只能使用额外的 O(1) 的空间。
// 时间复杂度小于 O(n^2) 。
// 数组中只有一个重复的数字，但它可能不止重复出现一次。


// 方法一：二分查找
// 每次二分的时候，统计出比中间数字小的个数是否小于当前中间的下标值，小于取右半边继续，大于取左半边
const findDuplicate = (nums) => {
  let lo = 1;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;  // 求中位数
    let count = 0;
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] <= mid) {
        count++;
      }
    }
    if (count > mid) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
};




// 方法二：环形链表法
const findDuplicate = (nums) => {
  let slow = 0;
  let fast = 0;
  while (true) {
    slow = nums[slow];
    fast = nums[nums[fast]]; // slow跳一步，fast跳两步
    if (slow == fast) {      // 指针首次相遇
      fast = 0;              // 让快指针回到起点
      while (true) {         // 开启新的循环
        if (slow == fast) {  // 如果再次相遇，就肯定是在入口处
          return slow;       // 返回入口，即重复的数
        }
        slow = nums[slow];   // 两个指针每次都进1步
        fast = nums[fast];
      }
    }
  }
};
