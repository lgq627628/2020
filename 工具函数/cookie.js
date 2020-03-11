function setCookie(key, value, days, domain, path) { // 设置 cookie 的时候会要注意有域名的区别，默认当前域名
  let d = new Date();
  d.setDate(d.getDate() + days);
  window.document.cookie = `${key}=${value}; expires=${days ? d.toUTCString() : ''}; domain=${domain || ''}; path=${path || ''}`;
}

function getCookie(key) { // 获取 cookie 的时候会先从自身域名查找，没有的话就往根域名找
  var name = key + '=';
  var cookies = window.document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var c = cookies[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

function removeCookie(key, domain, path) { // 移除 cookie 也有域名的区别，默认删除当前域名下的 cookie
  setCookie(key, null, -1, domain, path);
}
