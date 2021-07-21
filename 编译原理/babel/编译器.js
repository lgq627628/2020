const parser = require('@babel/parser');
const { codeFrameColumns } = require('@babel/code-frame');
const chalk = require('chalk');

// 我们解释执行了 AST，实现了一个简单的 JS 解释器，可以定义函数、变量，有作用域链，可以注入全局 api。
// v8 最早的实现方式也是直接解释执行 AST，但是现在多了一层，会先转成字节码，然后再解释执行。但是解释执行的思路和 AST 的方式类似。
// 我们是用 js 解释的 js，所以 funciton 的 apply 方法、全局 api 等都可以直接用，实际上一般 js 引擎都是 c++ 写的，没有这些东西，所有的都要自己去实现，包括内存分配（堆、调用栈）、全局 api等。

class Scope {
    constructor(parentScope) {
        this.parent = parentScope
        this.scopeObj = {}
    }
    set(name, value) {
        this.scopeObj[name] = value
    }
    getLocal(name) {
        return this.scopeObj[name]
    }
    get(name) {
        let rs = this.getLocal(name)
        while (!rs && this.parent) {
            rs = this.parent.get(name)
        }
        return rs
    }
    has(name) {
        return !!this.getLocal(name)
    }
}

const sourceCode = `
    const c = 1 + 2;
    console.log(c);

    function add(a, b) {
        return a + b
    }
    console.log(add(3, 3))
`;

const ast = parser.parse(sourceCode, {
    sourceType: 'unambiguous'
});

const evaluator = (function() {
    const handleNode = {
        Program(node, scope) {
            node.body.forEach(item => {
                evaluate(item, scope)
            });
        },
        VariableDeclaration(node, scope) {
            node.declarations.forEach((item) => {
                evaluate(item, scope);
            });
        },
        FunctionDeclaration(node, scope) {
            const fnName = evaluate(node.id);
            if (scope.get(fnName)) {
                throw Error('duplicate declare fn：' + fnName);
            } else {
                scope.set(fnName, function(...args) {
                    const fnScope = new Scope(scope) // 新的函数作用域

                    node.params.forEach((item, index) => { // 形参赋值
                        fnScope.set(item.name, args[index]);
                    });
                    fnScope.set('this', this);
                    return evaluate(node.body, fnScope);
                })
            }
        },
        VariableDeclarator(node, scope) {
            const varName = evaluate(node.id);
            // if (scope[varName]) {
            if (scope.get(varName)) {
                throw Error('duplicate declare variable：' + varName);
            } else {
                // scope[varName] = evaluate(node.init, scope);
                scope.set(varName, evaluate(node.init, scope))
            }
        },
        ExpressionStatement(node, scope) {
            return evaluate(node.expression, scope);
        },
        BinaryExpression(node, scope) {
            const { left, operator, right } = node
            const leftVal = getIdentifierValue(left, scope)
            const rightVal = getIdentifierValue(right, scope)
            let rs
            switch (operator) {
                case '+':
                    rs = leftVal + rightVal
                    break;
                case '-':
                    rs = leftVal - rightVal
                    break;
                case '*':
                    rs = leftVal * rightVal
                    break;
                case '/':
                    rs = leftVal / rightVal
                    break;
                case '%':
                    rs = leftVal % rightVal
                    break;
                default:
                    throw Error('upsupported operator：' + operator);
            }
            return rs;
        },
        CallExpression(node, scope) {
            const args = node.arguments.map(item => {
                if (item.type === 'Identifier') { // 如果参数是变量，就去取值
                    return scope.get(item.name);
                }
                return evaluate(item, scope);
            });
            if(node.callee.type === 'MemberExpression') { // 如果是这样调用 a.b.c()，再例如 console.log 是一个 MemberExpression
                const fn = evaluate(node.callee, scope) // 获取函数名
                const obj = evaluate(node.callee.object, scope);
                return fn.apply(obj, args);
            } else {
                const fnName = evaluate(node.callee, scope) // 获取函数名
                const fn = scope.get(fnName)
                return fn.apply(null, args);
            }
        },
        ReturnStatement(node, scope) {
            return evaluate(node.argument, scope);
        },
        BlockStatement(node, scope) { // 函数体
            for (let i = 0; i< node.body.length; i++) {
                const curBody = node.body[i];
                if (curBody.type === 'ReturnStatement') {
                    return evaluate(curBody, scope);
                }
                evaluate(curBody, scope);
            }
        },
        MemberExpression(node, scope) { // 取值
            const obj = scope.get(evaluate(node.object));
            return obj[evaluate(node.property)]
        },
        Identifier(node) {
            return node.name
        },
        NumericLiteral(node) {
            return node.value
        }
    }

    const evaluate = (node, scope) => {
        try {
            return handleNode[node.type](node, scope)
        } catch (e) {
            if (e && e.message && e.message.indexOf('astInterpreters[node.type] is not a function') != -1) {
                console.error('unsupported ast type: ' + node.type);
                console.error(codeFrameColumns(sourceCode, node.loc, {
                    highlightCode: true
                }));
            } else {
                console.error(e.message);
                console.error(codeFrameColumns(sourceCode, node.loc, {
                    highlightCode: true
                }));                
            }
        }
    }

    function getIdentifierValue(node, scope) {
        if (node.type === 'Identifier') {
            return scope.get(node.name);
        } else {
            return evaluate(node, scope);
        }
    }
    
    return {
        evaluate
    }
})();

const globalScope = new Scope()
globalScope.set('console', { // 注入全局变量
    log: function (...args) {
        console.log(chalk.green(...args));
    },
    error: function (...args) {
        console.log(chalk.red(...args));
    },
    warn: function (...args) {
        console.log(chalk.orange(...args));
    },
});

evaluator.evaluate(ast.program, globalScope)
console.log(globalScope)


// 对每个节点做不同的解释，Declaration 就是在 scope 中放一个变量，Expression 是解释后返回一个值。再就是最开始要注入一些 api 到 globalScope
// - 向 globalScope 中注入 [Native Code] 层 API，剩下的所有 JS 层代码都最终转换为 [Native Code] 层调用的封装，并且缓存到相应层级的 Scope 中。
// - 将所有的 Declaration 添加至对应层级中去（遇到同层 Identifier 重复的直接抛错，真实情况是 EnvironmentRecord 区分 VarEnv 和 LexEnv，对 var 定义的同名变量进行覆盖，const 和 let 定义的直接抛错）。
// - 将过程中所有的 Expression 定义转换成 scope 中可执行的代码（最终与 [Native Code] 层 API 直接或间接关联）。在 CallExpression 中拿到 Scope 中对应 Expression 的执行结果。
// - 如果 traverse 过程中出现 scope.get(xxx) 返回 undefined 时候，直接抛错。


// tsc 就是 ts 写的，自己编译自己，这种叫做自举。
// 其实 js 解释器一般都是用 c++ 写，那样的话所有的 js 特性都要用 c ++ 实现，用 js 解释 js 则不用实现函数上下文、闭包、对象的内容分配、原型链等等 。 而且一般的解释器都会先转成字节码，然后解释执行字节码，解释执行 AST 的解释器少一些。我们直接解释执行 AST 是为了简单，方便理解。

// 本质就是从 cpu 的指令集封装出了对字节码的支持，那么直接执行字节码就行了啊，没必要再翻译一次。 JIT 才会把字节码翻译成机器码，为了提升性能。解释执行 + JIT 编译执行。