// 动态加载组件有两种方式：

// 1、import()
// 2、<script> 标签

// 第一种方法：
const name = 'v-text' // 组件名称
const component = await import('https://xxx.xxx/bundile.js')
Vue.component(name, component)


// 第二种方法：
function loadjs(url) {
  return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.onload = resolve
      script.onerror = reject
  })
}
const name = 'v-text' // 组件名称
await loadjs('https://xxx.xxx/bundile.js')
// 这种方式加载组件，会直接将组件挂载在全局变量 window 下，所以 window[name] 取值后就是组件
Vue.component(name, window[name])


// 为了同时支持这两种加载方式，在加载组件时需要判断一下浏览器是否支持 ES6。如果支持就用第一种方式，如果不支持就用第二种方式：
function isSupportES6() {
  try {
      new Function('const fn = () => {};')
  } catch (error) {
      return false
  }

  return true
}


// 同时导出组件和把组件挂在 window 下。