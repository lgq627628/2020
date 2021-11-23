// 嵌套 setTimeout，打印最小间隔 4ms
var count = 0

var startVal = +new Date()
console.log("start time", 0, 0)
function func() {
  setTimeout(() => {
    console.log("exec time", ++count, +new Date() - startVal)
    if (count === 50) {
      return
    }
    func()
  }, 0)
}

func()