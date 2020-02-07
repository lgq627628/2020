// 核心逻辑写这里
const program = require('commander')
const path = require('path')
const { version } =  require('./const')

const actionsMap = {
  create: {
    alias: 'c',
    description: 'create a project',
    examples: [
      'x-cli create <project-name>'
    ]
  },
  config: {
    alias: 'conf',
    description: 'config project variable',
    examples: [
      'x-cli config set <key> <val>',
      'x-cli config get <key>'
    ]
  },
  '*': {
    alias: '',
    description: 'command not found',
    examples: []
  }
}

Reflect.ownKeys(actionsMap).forEach(key => {
  let action = actionsMap[key]
  program
    .command(key)
    .alias(action.alias)
    .description(action.description)
    .action(() => {
      if (key === '*') {
        console.log(action.description)
      } else {
        require(path.resolve(__dirname, key))(...process.argv.slice(3))
      }
    })
})
program.on('--help', () => {
  console.log('\nExamples: ')
  Reflect.ownKeys(actionsMap).forEach(key => {
    let examples = actionsMap[key].examples
    examples.forEach(e => console.log(e))
  })

})
program.version(version).parse(process.argv);
