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

let div2 = document.createElement('div')
div2.classList.add('wrap')
document.getElementById('app').appendChild(div2)

let img = document.createElement('img')
img.src = pic
img.width = 150
img.height = 200
document.getElementById('app').appendChild(img)

console.log('666', pic)
