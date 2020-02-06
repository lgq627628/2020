/**
 * 二次封装 axios
*/

import axios from 'axios';
import qs from 'qs';

// 在 script 脚本中设置一下环境变量，windows 去掉 set 和 &&，把 && 用空格替代
switch (process.env.NODE_ENV) {
  case 'production':
    axios.defaults.baseURL = 'http://api.baidu.com'
    break
  case 'test':
    axios.defaults.baseURL = 'http://192.168.20.12:8080'
    break
  default:
    axios.defaults.baseURL = 'http://127.0.0.1:3000'
}

// 设置超时时间和跨域下是否允许携带凭证
axios.defaults.timeout = 10000
axios.defaults.withCredentials = true

// 设置请求传递数据的格式（看服务器要求什么格式）
axios.defaults.headers['Content-type'] = 'application/x-www-form-urlencoded'
axios.defaults.transformRequest = data => qs.stringify(data) // 把对象编程 a=1&b=2 这种格式

// 设置请求拦截器
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  token && (config.headers.Authorization = token)
  return config
}, err => {
  return Promise.reject(err)
})

// 设置响应拦截器
axios.interceptors.response.use(res => { // 2 开头的状态码才算成功，可以设置 axios.defaults.validateStatus
  return res.data
}, err => {
  let { response } = err
  if (response) {
    // 服务器最起码返回结果了
    switch(response.status) {
      case 401: // 没权限
        break
      case 403: // token 过期，服务器拒绝执行
        break
      case 404:
        break
    }
  } else {
    if (!window.navigator.onLine) {
      // 断网处理，可以跳转到断网页面，并把当前页面传过去
      return
    }
    return Promise.reject(err);

  }
})

export default axios
