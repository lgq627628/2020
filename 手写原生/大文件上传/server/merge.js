const fse = require('fs-extra');
const path = require('path');

const uploadPath = path.resolve(__dirname, '.', 'upload')
const filename = 'bigImg'
const filePath = path.resolve(uploadPath, '..', `${filename}.jpg`) // 最终放置目标

const pipeToTarget = (path, writeStream) => { // bigImg/bigImg-0, 可写流文件位置
  return new Promise(resolve => {
    const readStream = fse.createReadStream(path);
    readStream.on('end', () => {
      fse.unlinkSync(path) // 顺便删除原来的地址
      resolve()
    })
    readStream.pipe(writeStream)
  })
}

const mergeFileChunk = async (filePath, filename, size) => {
  const chunkDir = path.resolve(uploadPath, filename) // bigImg
  const chunkDirNames = await fse.readdir(chunkDir) // 获取所有文件名 [ 'bigImg-0','bigImg-1'...]
  chunkDirNames.sort((name1, name2) => name1.split('-')[1] - name2.split('-')[1])
  console.log(chunkDirNames)
  // 把每个部分写入最后的文件
  await Promise.all(
    chunkDirNames.map((name, i) => {
      return pipeToTarget(
        path.resolve(chunkDir, name), // bigImg/bigImg-0
        fse.createWriteStream(filePath, { // 创建可写流，好比教室分座位
          start: i * size,
          end: (i + 1) * size,
        })
      )
    })
  )
  fse.rmdirSync(chunkDir) // 移除目录
  console.log('文件合并成功啦')
}


mergeFileChunk(filePath, filename, 1024 * 1024)
