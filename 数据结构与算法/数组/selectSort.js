// 选择排序
// 在时间复杂度这方面，选择排序没有那么多弯弯绕绕：最好情况也好，最坏情况也罢，两者之间的区别仅仅在于元素交换的次数不同，但都是要走内层循环作比较的。因此选择排序的三个时间复杂度都对应两层循环消耗的时间量级： O(n^2)。
function selectSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let minIdx = i;
    let minVal = arr[i];
    for (let j = i; j < len; j++) {
      if (arr[j] < minVal) {
        minIdx = j;
        minVal = arr[j];
      }
    }
    if (minIdx !== i) [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
  return arr;
}

let list = [1,10,2,8,5,3,1,6,9];
selectSort(list);
console.log(list);
