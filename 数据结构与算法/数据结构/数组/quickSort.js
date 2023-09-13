// 快速排序
// 最好时间复杂度：它对应的是这种情况——我们每次选择基准值，都刚好是当前子数组的中间数。这时，可以确保每一次分割都能将数组分为两半，进而只需要递归 log(n) 次。这时，快速排序的时间复杂度分析思路和归并排序相似，最后结果也是 O(nlog(n))。
// 最坏时间复杂度：每次划分取到的都是当前数组中的最大值/最小值。大家可以尝试把这种情况代入快排的思路中，你会发现此时快排已经退化为了冒泡排序，对应的时间复杂度是 O(n^2)。
// 平均时间复杂度： O(nlog(n))

function quickSort(arr) { // 简单版本：取前中后任意一个位参照，划分左右数组，递归下去
  if (arr.length <= 1) return arr;

  let midIdx = ~~(arr.length / 2); // baseIdx = arr.length - 1
  let midVal = arr.splice(midIdx, 1)[0]; // baseVal = arr.pop()
  let left = [];
  let right = [];

  for(let i = 0; i < arr.length; i++) {
    if (arr[i] > midVal) {
      right.push(arr[i]);
    } else {
      left.push(arr[i]);
    }
  }
  return quickSort(left).concat(midVal, quickSort(right));
}
let list = quickSort([1,10,2,8,5,3,1,6,9]);
console.log(list);





function quickSort2(arr, left = 0, right = arr.length - 1) { // 困难版本：在原数组上直接排序，不额外开辟空间
  if (arr.length <= 1) return arr;
  let partIdx = partArr(arr, left, right);
  if (left < partIdx - 1) quickSort2(arr, left, partIdx - 1);
  if (partIdx < right) quickSort2(arr, partIdx, right);
  return arr;
}
function partArr(arr, left, right) { // 一次划分，并返回左指针当作下次划分依据
  let midVal = arr[~~(left + (right - left) / 2)];
  let i = left;
  let j = right;

  while(i <= j) {
    while(arr[i] < midVal) i++; // 左指针所指元素若小于基准值，则左指针右移
    while(arr[j] > midVal) j--; // 右指针所指元素若大于基准值，则右指针左移
    if (i <= j) { // 若i<=j，则意味着基准值 左边存在较大元素 或 右边存在较小元素，交换两个元素确保左右两侧有序
      swap(arr, i, j);
      i++;
      j--;
    }
  }

  return i; // 返回左指针索引作为下一次划分左右子数组的依据
}
function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
let list2 = quickSort2([1,10,2,8,5,3,1,6,9]);
console.log(list2);



function quickSort2(arr, left = 0, right = arr.length - 1, k) { // 困难版本：在原数组上直接排序，不额外开辟空间
  // if (arr.length <= 1) return arr;
  let partIdx = partArr(arr, left, right);
  if (k < partIdx) quickSort2(arr, left, partIdx - 1, k);
  else if (k > partIdx) quickSort2(arr, partIdx + 1, right, k);
  else return arr;
  return arr;
}
function partArr(arr, left, right) { // 一次划分，并返回左指针当作下次划分依据
  let midVal = arr[~~(left + (right - left) / 2)];
  let i = left;
  let j = right;

  while(i <= j) {
    while(arr[i] < midVal) i++; // 左指针所指元素若小于基准值，则左指针右移
    while(arr[j] > midVal) j--; // 右指针所指元素若大于基准值，则右指针左移
    if (i <= j) { // 若i<=j，则意味着基准值 左边存在较大元素 或 右边存在较小元素，交换两个元素确保左右两侧有序
      swap(arr, i, j);
      i++;
      j--;
    }
  }

  return i; // 返回左指针索引作为下一次划分左右子数组的依据
}
function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
let list2 = quickSort2([1,10,2,8,5,3,1,6,9], 5);
console.log(list2);

