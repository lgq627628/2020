import './index.css'
import './main.less'
import pic from './avatar.jpeg'

class Person {
  constructor() {}
  say() {}
}

let div = document.createElement('div')
div.classList.add('box')
div.innerHTML = '哈哈哈'
document.getElementById('app').appendChild(div)

let img = document.createElement('img')
img.src = pic
document.getElementById('app').appendChild(img)

console.log('666')
