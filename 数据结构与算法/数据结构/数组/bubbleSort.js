// 冒泡排序
// 最好时间复杂度：它对应的是数组本身有序这种情况。在这种情况下，我们只需要作比较（n-1 次），而不需要做交换。时间复杂度为 O(n)
// 最坏时间复杂度： 它对应的是数组完全逆序这种情况。在这种情况下，每一轮内层循环都要执行，重复的总次数是 n(n-1)/2 次，因此时间复杂度是 O(n^2)
// 平均时间复杂度：这个东西比较难搞，它涉及到一些概率论的知识。实际面试的时候也不会有面试官摁着你让你算这个，这里记住平均时间复杂度是 O(n^2) 即可。
function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let flag = true; // 加上这个就可以是的最好的时间复杂度为 O(n)
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        flag = false; // 这个地方要加分号啊，不加就会和下面的属性变成同一条语句
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    if (flag) return arr;
  }
  return arr;
}

let list = [1,10,2,8,5,3,1,6,9];
bubbleSort(list);
console.log(list);


