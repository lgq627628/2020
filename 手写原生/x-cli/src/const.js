const { version } = require('../package.json')

const downloadDir = `${process.env[process.platform === 'darwin' ? 'HOME' : 'USERPROFILE']}/.template` // 一般放在根路径下的新文件夹下

module.exports = {
  version,
  downloadDir
}
