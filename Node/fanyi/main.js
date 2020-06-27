const http = require('http')
const querystring = require('querystring')

module.exports.translate = word => {
  return new Promise((resolve, reject) => {
    let query = querystring.stringify({doctype: 'json', type: 'AUTO', i: word})
    http.get({
      hostname: 'fanyi.youdao.com',
      path: `/translate?${query}`
    }, res => {
      let rs = ''
      res.on('data', chunk => {
        rs += chunk
      })
      res.on("end", () => {
        rs = JSON.parse(rs)
        try {
          resolve(rs.translateResult[0][0].tgt)
        } catch (error) {
          resolve('翻译出错，请重试')
        }
      })
    });
  })
}
