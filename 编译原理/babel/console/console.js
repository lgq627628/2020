const praser = require('@babel/parser')
const { transformFromAst } = require('@babel/core')
const consolePlugin =  require('./consolePlugin');


const sourceCode = `
console.log(1);

function func() {
    console.info(2);
}

export default class Test {
    say() {
        console.debug(3);
    }
    render() {
        return <div>{console.error(4)}</div>
    }
}
`

const ast = praser.parse(sourceCode, {
    sourceType: 'unambiguous', // parser 需要指定代码是不是包含 import、export 等，需要设置 moduleType 为 module 或者 script，我们干脆设置为 unambiguous，让它根据内容是否包含 import、export 来自动设置 moduleType。
    plugins: ['jsx']
})
const { code } = transformFromAst(ast, sourceCode, {
    plugins: [consolePlugin]
});
console.log(code);
