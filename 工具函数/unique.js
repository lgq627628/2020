// 生成唯一标识符

// 简单点
let unique1 = symbol()
// 复杂点
let unique2 = (Math.random() + new Date().getTime()).toString(32).slice(0, 8)
