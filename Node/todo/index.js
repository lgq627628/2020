// 这里要获取 home 变量而不是 home 目录，因为 windows 下不会去环境变量找
const homedir = require('os').homedir()
const home = process.env.HOME || homedir
const path = require('path')
const db = require('./db')
const inquirer = require('inquirer');
let dbPath = path.join(home, '.todo')

function done(list, idx) {
  list[idx].done = true
  db.write(dbPath, list)
}

function undone(list, idx) {
  list[idx].done = false
  db.write(dbPath, list)
}

function rename(list, idx) {
  inquirer.prompt({
    type: 'input',
    name: 'taskName',
    message: '请输入新的任务名称',
    default: list[idx].taskName
  }).then(answer1 => {
    if (answer1.taskName) {
      list[idx].taskName = answer1
      db.write(dbPath, list)
    }
  })
}

function del(list, idx) {
  list.splice(idx, 1)
  db.write(dbPath, list)
}

module.exports.add = async (taskName) => {
  // 1、读取之前的任务
  let list = await db.read(dbPath)
  // 2、往里面添加新任务
  list.push({taskName, done: false})
  // 3、存储任务到文件
  await db.write(dbPath, list)
}

module.exports.clear = async () => {
  await db.write(dbPath, [])
}

module.exports.showList = async () => {
  let list = await db.read(dbPath)
  printTasks(list)
}


function printTasks(list) {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'index',
        message: '请选择你要更改的任务',
        choices: list.map((l, i) => {
          return {name: `${l.done ? '[x]' : '[_]'} ${i + 1}、${l.taskName}`, value: i.toString()} // 这个 value 得是字符串，不然可能报错
        }).concat({name: '创建任务', value: '-2'}, {name: '退出', value: '-1'})
      }
    ])
    .then(answers => {
      let idx = +answers.index
      if (idx >= 0) {
        askForAction(list, idx)
      } else if (idx === -2) {
        askForCreateTask(list)
      }
    });
}

function askForAction(list, idx) {
  let actionMap = {
    undone,
    done,
    rename,
    del
  }
  inquirer.prompt({
    type: 'list',
    name: 'action',
    message: '请选择操作',
    choices: [
      {name: '标记为未完成', value: 'undone'},
      {name: '标记为已完成', value: 'done'},
      {name: '修改任务名称', value: 'rename'},
      {name: '删除', value: 'del'},
      {name: '退出', value: 'exit'}
    ]
  }).then(answer => {
    let fn = actionMap[answer.action]
    fn && fn(list, idx)
  })
}

function askForCreateTask(list) {
  inquirer.prompt({
    type: 'input',
    name: 'taskName',
    message: '请输入新的任务名称',
  }).then(answer2 => {
    if (answer2.taskName) {
      list.push({taskName: answer2.taskName, done: false})
      db.write(dbPath, list)
    }
  })
}
