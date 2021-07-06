const praser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const types = require('@babel/types')
const template = require('@babel/template')


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



// traverse(ast, {
//     CallExpression(path, state) {
//         const { node } = path;
//         if (types.isMemberExpression(node.callee) &&
//             node.callee.object.name === 'console' &&
//             ['log', 'info', 'warning', 'error', 'debug'].includes(node.callee.property.name)
//         ) {
//             const { line, column } = node.loc.start;
//             node.arguments.unshift(types.stringLiteral(`filePos: [${line}, ${column}]`));
//         }
//     }
// })




// const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
// traverse(ast, {
//     CallExpression(path, state) {
//         const { node } = path;
//         const calleeName = generate(node.callee).code; // path.get('callee').toString()
//         if (targetCalleeName.includes(calleeName)) {
//             const { line, column } = node.loc.start;
//             node.arguments.unshift(types.stringLiteral(`filePos: [${line}, ${column}]`));
//         }
//     }
// })



const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
traverse(ast, {
    CallExpression(path, state) {
        const { node } = path;
        if (node.isNewGen) return;  // 跳过新创建节点的遍历

        const calleeName = generate(node.callee).code; // 就是函数名的字符串 path.get('callee').toString()
        if (targetCalleeName.includes(calleeName)) {
            const { line, column } = node.loc.start;
            const newNode = template.expression(`console.log("filePos: [${line}, ${column}]")`)(); // 这是一个 AST
            newNode.isNewGen = true;
            if (path.findParent(p => p.isJSXElement())) {
                path.replaceWith(types.arrayExpression([newNode, node]));
                path.skip(); // 跳过子节点的遍历
            } else {
                path.insertBefore(newNode);
            }   
        }
    }
})



const { code, sourcemap } = generate(ast)
console.log(code)