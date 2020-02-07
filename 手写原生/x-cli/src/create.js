const axios = require('axios')
const ora = require('ora')
const Inquirer = require('inquirer');

const fetchRepoList = async () => {
  let { data } = await axios.get('https://api.github.com/orgs/zhu-cli/repos');
  return data;
};

module.exports = async function (projectName, ...args) {
  // 拉取 github 手册：https://developer.github.com/v3/interactions/repos/
  // 用法：https://api.github.com/repos/lgq627628/2020 或 https://api.github.com/orgs/zhu-cli/repos
  console.log('准备创建', projectName)

  // 第一步：获取项目列表
  const spinner = ora('拉取远程模板中...')
  spinner.start()
  let repos = await fetchRepoList()
  spinner.succeed()
  repos = repos.map(r => r.name)
  const { repo } = await Inquirer.prompt({
    name: 'repo', // 这个和前面解构名是一样的
    type: 'list', // 可以是单选、多选
    choices: repos,
    message: '请选择一个模板'
  })
  console.log(repo)
}
