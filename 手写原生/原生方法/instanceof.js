// x会一直沿着隐式原型链__proto__向上查找直到x.__proto__.__proto__......===y.prototype为止，如果找到则返回true，也就是x为y的一个实例。否则返回false，x不是y的实例。
function instanceof(x) {
  while(x.__proto__!==null) {
    if(x.__proto__===y.prototype) {
        return true;
    }
    x.__proto__ = x.__proto__.proto__;
  }
  if(x.__proto__==null) {return false;}
}
