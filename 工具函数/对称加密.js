// 其实，服务端和客户端用对称加密之前，协商的过程就是确定算法（比如下述过程就是一种算法）以及key的过程

function encrpt(msg, key) {
    // 补充代码
    const secretMsg = [];
    for (let i = 0; i < msg.length; i++) {
      secretMsg[i] = msg[i].charCodeAt() + key;
    }
  
    return secretMsg.join('\n');
}
  
function decrypt(msg, key) {
    // 补充代码
    const secretMsg = msg.split('\n')
    const ret = [];
    for (let i = 0; i < secretMsg.length; i++) {
      ret[i] = String.fromCharCode(secretMsg[i] - key);
    }
  
    return ret.join("");
}
  
const msg = "hello";
const key = 3;

const secretMsg = encrpt(msg, key);

const bool = decrypt(secretMsg, key) === msg;

console.log(secretMsg);  // secretMsg !== msg

console.log(bool);  // true