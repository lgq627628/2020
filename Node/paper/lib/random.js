/**
 * randomInt 函数返回一个大于等于 min，小于 max 的随机整数
 * 返回一定范围内的整数，用来控制随机生成的文章和段落的长度范围
 * @param {*} min 
 * @param {*} max 
 * @returns 
 */
export function randomInt(min, max) {
  const p = Math.random();
  return Math.floor(min * (1 - p) + max * p);
}


// 随机选出数组中的一个元素，并且避免和上次选择做判断，避免重复
// 虽然说在语料样本很大的情况下，连续选择重复的概率很小，但这样实现还是感觉不够优雅。实际上我们可以改进一下这个算法，用一个小技巧来避免连续两次选择到同样的元素
// 我们将随机取数的范围从数组长度更改为数组长度减一，这样我们就不会取到数组最后一位的元素。然后我们把每次取到的元素都和数组最后一位的元素进行交换，这样每次取过的元素下一次就在数组最后一位了，下一次也就不能取到它了，而下一次取到的数又会将它换出来，那么再一次就又能取到它了。
// 但是这样会有两个问题：
// - 初始在数组末位的那个元素，第一次肯定不会被取到，破坏了随机性；
// - 每次取完内容有个交换数组元素的操作，改变了数组本身，如果我们要用这个数组做其他操作，就可能会影响到别的操作的结果。
// createRandomPicker 根据传入的数组返回一个 randomPick 函数。在这里面，我们操作的是数组的副本而不是数组本身，这样就不会改变原数组。另外，我们取随机元素的时候，抛弃掉第一次选取的结果，这样就可以避免原本数组末位的那个元素在第一次随机取时永远取不到的问题。
// 用高阶函数的方式还有一个重要原因是，我们的语料库只需要在初始化时加载一次，而随机语料的获取操作要进行许多次。那么我们直接用高阶函数在 createRandomPicker 的时候，通过函数闭包将语料库的数组绑定到返回的 randomPick 过程里，就不用在每次随机获取的时候都传入数组参数了，使用上更方便。
// 其实就是用闭包的方式把数组存起来了
// 最后一个元素出现在第一个位置的概率是1/(n-1)，第1到n-1个元素，第一次有1/(n-1)的概率被换出，所以出现在第一个位置的概率是 (n-2)/(n-1) * 1/(n-1) = (n-2) / (n-1)^2，在n很大的时候，约等于1/(n-1)，两者概率差别恨小，所以算是一种解法。

export function createRandomPicker(arr) {
  arr = [...arr]; // copy 数组，以免修改原始数据
  function randomPick() {
    const len = arr.length - 1;
    const index = randomInt(0, len);
    const picked = arr[index];
    [arr[index], arr[len]] = [arr[len], arr[index]];
    return picked;
  }
  randomPick(); // 抛弃第一次选择结果
  return randomPick;
}
/**
 * 这是小技巧改良版
 * @param {*} arr 
 * @returns 
 */
export function randomPick(arr) {
  const len = arr.length - 1;
  const index = randomInt(0, len);
  [arr[index], arr[len]] = [arr[len], arr[index]];
  return arr[index];
}
// 下面是正常逻辑版本
let lastPicked = null;
function randomPickBak(arr) {
  let picked = null;
  do {
    const index = randomInt(0, arr.length);
    picked = arr[index];
  } while(picked === lastPicked);
  lastPicked = picked;
  return picked;
}


