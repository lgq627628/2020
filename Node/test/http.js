const http = require('http')
const axios = require('axios')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')

const hostname = '127.0.0.1'
const port = 3333
const url = `http://${hostname}:${port}`
const url2 = `https://nodejs.org/en/docs/`;

const request = url => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let data = ''
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', () => {
                resolve(data.toString())
            })
        }).on('error', err => {
            reject(err)
        })
    })
}

http.createServer((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/json')
    const data = {
        a: 1,
        b: 2,
        c: {
            d: 3
        }
    }
    res.end(JSON.stringify(data))
}).listen(port, hostname, () => {
    console.log(`Server is running at: ${url}`)
})


request(url).then(res => {
    console.log(res)
})


axios(url).then(res => {
    console.log(res.data)
})

// cheerio
async function run() {
    const { data: html } = await axios.get(url2)
    const $ = cheerio.load(html)
    const titles = $('nav a')
    console.log(titles)
}

// run()


async function runAsync(url) {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(url)
    // await page.goto(url, {waitUntil: 'networkidle2'})
    await page.setViewport({ width: 1000, height: 100 })
    await page.screenshot({ path: +new Date() + '.png' })
    await browser.close()
    return 'done'
}

runAsync(url2).then(res => {
    console.log('结果', res)
})