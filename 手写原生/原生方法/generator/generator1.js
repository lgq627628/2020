function *read() {
  yield 1
  yield 2
  yield 3
  return 99
}

let it = read() // 返回一个迭代器对象
console.log(it)

r = it.next() // 向下执行一次，直到遇到 yield 停止，返回的结果是一个对象 { value, done }
console.log(r)

r = it.next()
console.log(r)

r = it.next()
console.log(r)

r = it.next()
console.log(r)

r = it.next()
console.log(r)

r = it.next()
console.log(r)
