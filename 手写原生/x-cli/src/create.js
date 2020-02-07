const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer')
const fs = require('fs')
const path = require('path');
const {promisify} = require('util') // 把异步的 api 转换成 promise
let downloadGitRepo = require('download-git-repo'); // 它返回的不是一个 promise
let ncp = require('ncp'); // 它返回的不是一个 promise
const {downloadDir} = require('./const')
const MetalSmith = require('metalsmith')
let {render} = require('consolidate').ejs

downloadGitRepo = promisify(downloadGitRepo)
ncp = promisify(ncp)
render = promisify(render);

const fetchRepoList = async () => { // 获取项目列表
  // 拉取 github 手册：https://developer.github.com/v3/interactions/repos/
  // 用法：https://api.github.com/repos/lgq627628/2020 或 https://api.github.com/orgs/zhu-cli/repos
  let { data } = await axios.get('https://api.github.com/orgs/zhu-cli/repos');
  return data;
};
const fetchTagList = async (repo) => { // 获取对应版本号
  let { data } = await axios.get(`https://api.github.com/repos/zhu-cli/${repo}/tags`);
  return data;
};
const download = async (repo, tag) => {
  let api = `zhu-cli/${repo}`
  tag ? api += `#${tag}` : null
  let dest = `${downloadDir}/${repo}`
  await downloadGitRepo(api, dest)
  return dest
}
const loadingFn = (fn, msg) => async(...args) =>{
  const spinner = ora(msg)
  spinner.start()
  let res = await fn(...args)
  spinner.succeed()
  return res
}
module.exports = async function (projectName, ...args) {
  console.log('准备创建', projectName)

  let repos = await loadingFn(fetchRepoList, '拉取远程模板中...')()
  repos = repos.map(r => r.name)
  const { repo } = await Inquirer.prompt({
    name: 'repo', // 这个和前面解构名是一样的
    type: 'list', // 可以是单选、多选
    choices: repos,
    message: '请选择一个模板'
  })

  // 获取对应版本号
  let tags = await loadingFn(fetchTagList, '获取版本号中...')(repo)
  tags = tags.map(t => t.name)
  const { tag } = await Inquirer.prompt({
    name: 'tag', // 这个和前面解构名是一样的
    type: 'list', // 可以是单选、多选
    choices: tags,
    message: '请选择对应的版本'
  })
  console.log(repo, tag)

  // 把模板临时存储起来
  let dest = await loadingFn(download, '下载中...')(repo, tag)
  console.log(dest)

  let bool = fs.existsSync(path.join(dest, 'ask.js')); // 判断有没有某个文件
  if (bool) {
    // 复杂模板，需要读配置写文件，这里选择 vue-template
    await new Promise((resolve, reject) => {
      MetalSmith(__dirname) // 传入路径默认会遍历当前目录下的 src 文件
      .source(dest)
      .destination(path.resolve(projectName))
      .use(async (files, metal, done) => {
        let args = require(path.join(dest, 'ask.js'))
        let userData = await Inquirer.prompt(args)
        const meta = metal.metadata()
        Object.assign(meta, userData); // 传给下一个 use
        delete files['ask.js']
        done()
      })
      .use((files, metal, done) => {
        const userData = metal.metadata()
        Reflect.ownKeys(files).forEach(async (file) => {
          if (file.includes('js') || file.includes('json')) {
            // 处理 ejs 模板
            let content = files[file].contents.toString()
            if(content.includes('<%')) {
              content = await render(content, userData)
              files[file].contents = Buffer.from(content)
            }
          }
        });
        done()
      })
      .build(err => {
        if (err) reject()
        resolve();
      })
    })
  } else {
    // 静态模板：直接 copy 文件，这里选择 vue-simple-template
    await ncp(dest, path.resolve(projectName))
  }
}
