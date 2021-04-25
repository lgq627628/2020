// 多个不同的 axios 可以有多个不同的对象，比如多个接口地址
// 全局配置、实例配置、请求配置
// 适配器模块，希望可以用于 node，所以就要借助 http 模块
const defaultConfig = {
  baseUrl: '',
  url: '',
  methods: 'POST'
}

class InterceptorMgr {
  constructor() {
    this.handles = []
  }
  use(resolveFn, rejectFn) {
    this.handles.push({ resolveFn, rejectFn })
  }
}
class Axios {
  constructor(config) {
    this.defaults = Object.assign(JSON.parse(JSON.stringify(defaultConfig)), config); // 这里要深拷贝
    this.interceptors = {
      request: new InterceptorMgr()
      response: new InterceptorMgr()
    };
  }

  request( config) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {

      }
      xhr.open(config.methods, config.url)
      xhr.send()
    })
  }

  get(url, config) {
    let configs = JSON.parse(JSON.stringify(config));
    configs.url = this.config.baseUrl + url;

   let promise = Promise.resolve(configs);
   this.interceptors.request.handles.map(handle => {
     promise = promise.then(handle.resolveFn, handle.rejectFn)
   })

   promise = promise.then(this.request, null);
   this.interceptors.response.handles.map(handle => {
    promise = promise.then(handle.resolveFn, handle.rejectFn)
  })
   return promise;
  }
}
