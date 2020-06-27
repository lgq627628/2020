#!/usr/bin/env node

const { translate } = require('./main')
const program = require('commander')

program.version('0.0.1').name('fy').usage('<word>') // 控制命令行的展示参数
  .arguments('<Word>')
  .action(word => {
    translate(word).then(rs => {
      console.log(rs)
      process.exit(0)
    })
  })

program.parse(process.argv)
