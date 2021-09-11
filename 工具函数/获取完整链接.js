// 获取完整链接
export const urlReg = /^https?:\/\/.*/;

export const getWholeUrl = (url) => {
    if (!url) return url;
    if (urlReg.test(url)) return url;
  
    const helperDom = window.document.createElement('a');
    helperDom.href = url; // 利用超链接的 href，获取完整的 url，url 可能是：/xx、//xxxx、../xxxxx 等多种格式
    return helperDom.href;
  }


// 跳转页面会丢失 query 参数，可以拦截了所有可能的跳转逻辑
// a 标签超链接跳转
// window.open 打开新页面的跳转
// history.pushState / history.replaceState 跳转
// location.href / location.replace 跳转