// 简单工厂模式（功能单一）：批量制造一堆相同属性的对象
function makeCoffee(bean, water) {
  let obj = {}
  obj.bean = bean
  obj.water = water
  obj.ratio = bean / (water + bean)
  return obj
}


// 复杂工厂模式
