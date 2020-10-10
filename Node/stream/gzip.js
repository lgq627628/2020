const fs = require('fs')
const zlib = require('zlib')
const crypto = require('crypto')
const { Transform } = require('stream')
const file = process.argv[2]

const reportProgress = new Transform({
    transform(chunk, encoding, cb) {
        // 这里就可以对从 chunk 做一些自定义处理
        process.stdout.write('.')
        cb(null, chunk)
    }
})

fs.createReadStream(file)
    .pipe(crypto.createCipher('aes192', '123456')) // 先加密再压缩
    .pipe(zlib.createGzip())
    // .on('data', () => process.stdout.write('.'))
    .pipe(reportProgress)
    .pipe(fs.createWriteStream(`${file}.gz`))
    .on('finish', () => console.log('压缩完成'))

// vue-loader => sass-loader => css-loader => postcss-loader => style-loader 这个变化流的原理就是上面所写的