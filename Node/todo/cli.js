#!/usr/bin/env node
const program = require('commander')
const api = require('./index')

// 下面的 option 可以看作是一个有无该参数的开关
program
  .option('-x, --xxx', 'this is xxx')

// 上面的是参数，下面的是执行命令
program
  .command('add')
  .description('add a new task if want')
  .action(cmd => {
    let task = cmd.args.join(' ')
    api.add(task)
  });
program
  .command('clear')
  .description('clear all task if happend')
  .action(cmd => {
    api.clear()
  });

if (process.argv.length === 2) {
  api.showList()
}
// program.parse(process.argv)

// console.log(program.xxx) 是否有参数，返回 true 或 undefined
