let COS = require('cos-nodejs-sdk-v5'); // 详情请看腾讯云的对象存储
let fs = require('fs')
let path = require('path')

class UploadPlugin {
  constructor(options) {
    let {bucket, domain, secretId, secretKey} = options
    this.bucket = bucket
    this.cos = new COS({
      SecretId: secretId,
      SecretKey: secretKey
    });
  }
  apply(complier) {
    complier.hooks.afterEmit.tapPromise('UploadPlugin', (compliation) => {
      let assets = compliation.assets
      let promise = []
      Object.keys(assets).forEach(filename => {
        promise.push(this.upload(filename))
      })
      return Promise.all(promise)
    })
  }
  upload(filename) {
    return new Promise((resolve, reject) => {
      let filePath = path.resolve(__dirname, '../build', filename)
      this.cos.putObject({
        Bucket: this.bucket,        /* 必须 */
        Region: 'ap-guangzhou',     /* 必须 */
        Key: filename,              /* 必须 */
        StorageClass: 'STANDARD',
        Body: fs.createReadStream(filePath), // 上传文件对象
        onProgress: function(progressData) {
            console.log(JSON.stringify(progressData));
            console.log(`上传${filename}中`)
        }
      }, function(err, data) {
        if (err) reject(err)
        resolve(data)
      });
    })
  }
}

module.exports = UploadPlugin
