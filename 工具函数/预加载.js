const { resolve } = require("path")
const { rejects } = require("assert")

const preloadImg = src => {
  return new Promise(resolve, reject) {
    let img = new Image()
    img.onload = () => {
      resolve()
    }
    img.src = src;
  }
}

let imgList = []
Promise.all(imgList.map(img => preloadImg)).then(res => {

})
