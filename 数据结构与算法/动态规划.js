// 从结果倒推关系式，递归转迭代，自下而上
// 遇到最值问题，一定要在可能的解题方案中给动态优化留下一席之地
function coinChange(coins, money) {
  let moneyMap = {};
  moneyMap[0] = 0;

  for(let curMoney = 1; curMoney <= money; curMoney++) { // 一块钱一块钱的迭代
    // 假设当前的 curMoney 初始值为无穷大
    moneyMap[curMoney] = Infinity;
    // 基于上面的每一块钱都要遍历一次 coins，并从中取出最小值
    // 因为每一块钱都可以基于每个硬币来组合
    for(let i = 0; i < coins.length; i++) {
      let coin = coins[i];
      if (coin <= curMoney) moneyMap[curMoney] = Math.min(moneyMap[curMoney], moneyMap[curMoney - coin] + 1);
    }
  }

  return moneyMap[money] === Infinity ? -1 : moneyMap[money];
}

let coins = [1, 2, 5];
let amount = 11;
let rs = coinChange(coins, amount);
console.log(rs);

coins = [2];
amount = 3;
rs = coinChange(coins, amount);
console.log(rs);
