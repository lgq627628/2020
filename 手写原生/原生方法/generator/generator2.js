function *read() {
  let a = yield 1
  console.log(a)
  let b = yield 2
  console.log(b)
  return 99
}

let it = read()
it.next() // 此时执行到 yield = 1 就停止了，但没有给 a 赋值
it.next('哈哈') // 这里的 哈哈 是当作上次 yield 的返回值传给 a，然后继续向下执行
it.next('嘻嘻')


