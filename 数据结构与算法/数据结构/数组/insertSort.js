// 插入排序
// 最好时间复杂度：它对应的数组本身就有序这种情况。此时内层循环只走一次，整体复杂度取决于外层循环，时间复杂度就是一层循环对应的 O(n)。
// 最坏时间复杂度：它对应的是数组完全逆序这种情况。此时内层循环每次都要移动有序序列里的所有元素，因此时间复杂度对应的就是两层循环的 O(n^2)
// 平均时间复杂度：O(n^2)
function insertSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    let tempVal = arr[i];
    while(j > 0 && arr[j-1] > tempVal) {
      arr[j] = arr[j-1];
      j--;
    }
    arr[j] = tempVal;
  }
  return arr;
}

let list = [1,10,2,8,5,3,1,6,9];
insertSort(list);
console.log(list);
