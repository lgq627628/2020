const os = require('os');

function getLocalIp() {
  let interfaces = os.networkInterfaces();
  let ipArr = []
  for (let devName in interfaces) {
    let iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      let alias = iface[i];
      if (alias.family == 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          ipArr.push(alias.address)
      }
    }
  }
  return ipArr
}

function getWlanIp() {
  let interfaces = os.networkInterfaces().WLAN
  let WlanIp = ''
  if (!interfaces) return ''
  for(let ip of interfaces){
      if(ip.family=='IPv4'){
          WlanIp = ip.address
      }
  }
  return WlanIp
}

module.exports = {
  getLocalIp,
  getWlanIp
}
