const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core');
const fs = require('fs')
const path = require('path')
const autoPlugin = require('./auto-plugin');

// 混淆就是把代码变得难以阅读，让怀有恶意目的的人很难通过代码理清逻辑，但是不能改变执行的结果。要做等价转换。

// 这种转换包括两方面：
// 名字转换。变量名、函数名这些我们会注意命名要有含义，但是编译后的代码就不需要了，可以把各种 identifier 的 name 重命名为没有含义的 abcd，这个可以通过 path.scope.rename 的 api 来做到。
// 逻辑转换。if 的逻辑可以用 switch 来代替，for 的逻辑可以用 while 来代替，这都是等价的，把一种方式实现的代码转成另一种等价的形式就可以达到混淆的目的。做混淆工具主要是要找到这种等价的变化，而且后者一定要特别复杂难以分析，然后实现这种转换，就达到了混淆的目的。

const source = fs.readFileSync(path.join(__dirname, './source.js'), {
    encoding: 'utf-8'
});

const ast = parser.parse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx']

});
const { code } = transformFromAstSync(ast, source, {
    plugins: [
        [autoPlugin]
    ],
    generatorOpts: {
        comments: false,
        compact: true // 去空格压缩
    }
});

console.log(code);


