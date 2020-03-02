import './index.css'
import './main.less'

class Person {
  constructor() {}
  say() {}
}

let div = document.createElement('div')
div.classList.add('box')
div.innerHTML = '哈哈哈'
document.getElementById('app').appendChild(div)

console.log('666')
