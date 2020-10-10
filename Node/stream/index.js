const fs = require('fs')
const stream = fs.createWriteStream('./xx.txt')
for(let i = 0; i < 100000; i++) {
    stream.write(`这是第${i+1}行\n`)
}
stream.end()
console.log('done')