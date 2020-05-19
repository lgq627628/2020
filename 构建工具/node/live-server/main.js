gconst http = require('http');
const fs = require('fs');
const path = require('path');
const IP = require('./lib/ip')
const {F, getType} = require('./lib/file')
const exec = require('child_process').exec;
const root = process.cwd() // 当前目录
const port = Math.floor(Math.random () * 1000) + 8000;
let localIP = IP.getLocalIp()
let wlanIp = IP.getWlanIp() || localIP[0]
const INJECTED_CODE = fs.readFileSync(path.join(__dirname, 'injected.html'), 'utf8')

console.log(INJECTED_CODE)

function setHttpServer() {
  setConsoleInfo()
  fs.exists('index.html', exists => {
    let url = `http://${wlanIp}:${port}`
    if (exists) url += '/index.html'
    openDefaultBrowser(url)
  })
}

function openDefaultBrowser(url) {
  switch (process.platform) {
    case 'darwin':
      exec('open ' + url);
      break;
    case 'win32':
      exec('start ' + url);
      break;
    case '':
      exec('xdg-open', [url]);
      break;
  }
}

function setConsoleInfo(){
  let info = 'The default service has been opened in the browser!'
  console.log('\033[42;30m DONE \033[;32m' + info + '\033[0m')
  for(let dev of localIP) console.log(`http://${dev}:${port}`)
}

function escape(html) {
  return String(html).replace(/&(?!\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}


function inject(stream) {
  if (injectTag) {
    // We need to modify the length given to browser
    var len = INJECTED_CODE.length + res.getHeader('Content-Length');
    res.setHeader('Content-Length', len);
    var originalPipe = stream.pipe;
    stream.pipe = function(resp) {
      originalPipe.call(stream, es.replace(new RegExp(injectTag, "i"), INJECTED_CODE + injectTag)).pipe(resp);
    };
  }
}


setHttpServer()

http.createServer((req, res) => {
  if (req.url === '/favicon.ico') return
  let url = req.url;
  let file = root + url;
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html;charset="utf-8"' })
      res.write('<h1>404页面</h1><p><h2>当前路径没有 index.html 文件</h2>')
      res.end()
    } else {
      let type = getType(url)
      res.writeHead(200, {
        'Content-Type': `text/${type};charset="utf-8"`
      })
      res.write(data)
      res.end()
    }
  })
}).listen(port)

