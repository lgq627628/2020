// // const fs = require('fs')

// // const rs = fs.createReadStream('./README.md')

// // let data
// // rs.on('data', chunk => {
// //     data += chunk // data = data.toString() + chunk.toString()
// // })
// // rs.on('end', () => {
// //     console.log(data)
// // })

// const buf = Buffer.from('好')
// console.log(buf.length)

const http = require('http')

// let str = 'a'.repeat(10 * 1024)

// str = Buffer.from(str)
str = 'hello'
http.createServer((req, res) => {
    console.log(req.headers)
    res.writeHead(200)
    res.end(str)
}).listen(3333)


function xx(req, res) {
    let buf = []
    req.on('data', chunk => {
        buf.push(chunk)
    }).on('end', () => {
        let rs = Buffer.concat(buf)
    })
}

// http.request({ url:  }, )