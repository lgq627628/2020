// 检测是否移动端及浏览器内核
var browser = {
  versions: function () {
    var u = navigator.userAgent;
    return {
      trident: u.indexOf('Trident') > -1, //IE内核
      presto: u.indexOf('Presto') > -1, //opera内核
      webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
      gecko: u.indexOf('Firefox') > -1, //火狐内核Gecko
      mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否移动终端
      ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios
      android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android
      iPhone: u.indexOf('iPhone') > -1, //iPhone
      iPad: u.indexOf('iPad') > -1, //iPad
      webApp: u.indexOf('Safari') > -1 //Safari
    };
  }
}

if (browser.versions.mobile() || browser.versions.ios() || browser.versions.android() || browser.versions.iPhone() || browser.versions.iPad()) {
  alert('移动端');
}


// 检测浏览器是否支持canvas
function isSupportCanvas() {
  if (document.createElement('canvas').getContext) {
    return true;
  } else {
    return false;
  }
}
console.log(isSupportCanvas());


// 检测是否是微信浏览器
function isWeiXinClient() {
  var ua = navigator.userAgent.toLowerCase();
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    return true;
  } else {
    return false;
  }
}
alert(isWeiXinClient());
