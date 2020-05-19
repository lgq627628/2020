const http = require('http')

http.createServer((req, res) => {
  if(req.url === '/favicon.ico') return
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('哈哈哈哈或嗝')
}).listen(7777)
