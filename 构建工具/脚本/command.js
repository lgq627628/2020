#! /usr/bin/env node 

const program = require('commander')
const inquirer = require('inquirer')
const _ = require('lodash')
const chalk = require('chalk')

program
    .command('module')
    .alias('m')
    .description('创建新的模块')
    .option('--name [moduleName]')
    .option('--sass', '启用sass')
    .option('--less', '启用less')
    .action(option => {
        var config = _.assign({
            moduleName: null,
            description: '',
            sass: false,
            less: false
        }, option)
        var promps = []

        if(config.moduleName !== 'string') {
              promps.push({
                type: 'input',
                name: 'moduleName',
                message: '请输入模块名称',
                validate: function (input){
                    if(!input) {
                        return '不能为空'
                    }
                    return true
                }
              })
        } 

        if(config.description !== 'string') {
            promps.push({
                type: 'input',
                name: 'moduleDescription',
                message: '请输入模块描述'
            })
        }

        if(config.sass === false && config.less === false) {
          promps.push({
            type: 'list',
            name: 'cssPretreatment',
            message: '想用什么css预处理器呢',
            choices: [
              {
                name: 'Sass/Compass',
                value: 'sass'
              },
              {
                name: 'Less',
                value: 'less'
              }
            ]
          })
        }

        inquirer.prompt(promps).then(function (answers) {
            console.log(answers)
        })
    })
    .on('--help', function() {
        console.log('  Examples:')
        console.log('')
        console.log('$ app module moduleName')
        console.log('$ app m moduleName')
    }) 

program.parse(process.argv)