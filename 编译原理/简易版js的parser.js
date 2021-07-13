// 在我们 parser 的过程中,应该换一个角度看待代码,我们平时工作用的代码.本质是就是字符串或者一段文本,它没有任何意义,是 JavaScript 引擎赋予了它意义,所以我们在解析过程中代码只是一段字符串.


// const add = (a, b) => a + b

// 第一步词法分析：
// [
//     { type: "identifier", value: "const" },
//     { type: "whitespace", value: " " },
//     ...
// ]

function tokenizer(str) { // 词法分析
    const tokens = [];
    let i = 0;


    while(i < str.length) {
        let ch = str[i];

        if (['(', ')'].includes(ch)) { // 先处理单字符的语法单元
            tokens.push({
                type: 'parens',
                value: ch
            })
            i++;
            continue;
        }

        if (/[a-zA-Z\$\_]/.test(ch)) { // 处理标识符
            let value = ch;
            i++;
            while (/[a-zA-Z\$\_]/.test(str[i]) && i < str.length) {
                value += str[i];
                i++;
            }
            tokens.push({
                type: 'identifier',
                value
            })
            continue;
        }

        if (/\s/.test(ch)) { // 处理空白
            let value = ch;
            i++;
            while(/\s/.test(str[i]) && i < str.length) {
                value += str[i];
                i++;
            }
            tokens.push({
                type: 'whitespace',
                value
            })
            continue;
        }

        if (/,/.test(ch)) { // 处理逗号
            tokens.push({
                type: 'comma',
                value: ch
            })
            i++;
            continue;
        }


        if (/=|\+|\>/.test(ch)) { // 处理运算符
            let value = ch;
            i++;
            
            while(/=|\+|\>/.test(str[i]) && i < str.length) {
                value += str[i]
                i++
            }

            if (value === '=>') {
                tokens.push({
                    type: 'ArrowFunctionExpression',
                    value,
                });
                continue;
            }

            tokens.push({
                type: 'operator',
                value
            })
            continue;

        }

        // 如果碰到我们词法分析器以外的字符,则报错
        throw new TypeError('这个符号我暂时不会处理: ' + ch);
    }

    return tokens;
}

// 语法分析之所以复杂,是因为要分析各种语法的可能性,需要开发者根据token流(上一节我们生成的 token 数组)提供的信息来分析出代码之间的逻辑关系,只有经过词法分析 token 流才能成为有结构的抽象语法树.

// 语句(Statements): 语句是 JavaScript 中非常常见的语法,我们常见的循环、if 判断、异常处理语句、with 语句等等都属于语句
// // 典型的for 循环语句
// for (var i = 0; i < 7; i++) {
//   console.log(i);
// }

// 表达式(Expressions): 表达式是一组代码的集合，它返回一个值,表达式是另一个十分常见的语法,函数表达式就是一种典型的表达式,如果你不理解什么是表达式, MDN上有很详细的解释.
// // 函数表达式
// var add = function(a, b) {
//   return  a + b
// }

// 声明(Declarations): 声明分为变量声明和函数声明,表达式(Expressions)中的函数表达式的例子用声明的写法就是下面这样.
// // 函数声明
// function add(a, b) {
//   return a + b
// }

function parser(tokens) {
    let i = -1
    let curToken = tokens[i]
    let tempIdxs = []
    const next = () => { // 指针后移
        i++;
        curToken = tokens[i] || { type: 'eof', value: '' }
        while(curToken.type === 'whitespace') {
            i++
            curToken = tokens[i] || { type: 'eof', value: '' }
        }
        // do {
        //     i++
        //     curToken = tokens[i] || { type: 'eof', value: '' }
        // } while (curToken.type === 'whitespace')
    }

    const addTempIdx = () => { // 指针暂存的函数
        tempIdxs.push(i);
    }

    const backTempIdx = () => {
        i = tempIdxs.pop();
        curToken = tokens[i]
    }
    const parseDeclarations = () => {
        addTempIdx()
        next()

        if (curToken.type === 'identifier' && curToken.value === 'const') {
            const declarations = {
                type: 'VariableDeclaration',
                kind: curToken.value
            };
            next()
            if (curToken.type !== 'identifier') { // 如果 const 后面跟的不是变量名
                throw new Error('Expected Variable after const');
            }
            declarations.identifierName = curToken.value; // 变量名赋值
            next()
            if (curToken.type === 'operator' || curToken.value === '=') { // 如果是 = 号，后面应该跟着一个表达式
                declarations.init = parseFunctionExpression();
            }

            return declarations;
        }

    }
    const parseFunctionExpression = () => {
        next()

        let init
        if ((curToken.type === 'parens' && curToken.value === '(') || curToken.type === 'identifier') { // 如果 '=' 后面跟着括号或者字符那基本判断是一个表达式
            addTempIdx()
            next()
            while (curToken.type === 'identifier' || curToken.type === 'comma') {
                next()
            }
            if (curToken.type === 'parens' || curToken.value === ')') {
                next()
                if (curToken.type === 'ArrowFunctionExpression') {
                    init = {
                        type: 'ArrowFunctionExpression',
                        params: [],
                        body: {}
                    }
                    //检测到是箭头函数就先往前找参数
                    backTempIdx()
                    init.params = parseFunctionParams()
                    init.body = parseFunctionBody();
                }
            }
        }

        return init
    }
    const parseFunctionParams = () => {
        const params = [];
        if (curToken.type === 'parens' && curToken.value === '(') {
            next();
            while(!(curToken.type === 'parens' && curToken.value === ')')) {
                if (curToken.type === 'identifier') {
                    params.push({
                        type: 'identifier',
                        identifierName: curToken.value
                    })
                }
                next()
            }
        }
        return params
    }
    const parseFunctionBody = () => {
        next();
        while (curToken.type === 'ArrowFunctionExpression') {
            next();
        }
        if (curToken.type === 'identifier') { // 这里就直接默认用二院表达式来解析
            const body = {
                type: 'BinaryExpression',
                left: {
                    type: 'identifier',
                    identifierName: curToken.value
                },
                operator: '',
                right: {
                    type: '',
                    identifierName: ''
                }
            };
            next();
            if (curToken.type === 'operator') {
                body.operator = curToken.value
            }
            next();
            if (curToken.type === 'identifier') {
                body.right = {
                    type: 'identifier',
                    identifierName: curToken.value
                }
            }
            return body;
        }
    }
    const ast = {
        type: 'Program',
        body: []
    }

    while(i < tokens.length) {
        const statement = parseDeclarations();
        if (!statement) break;
        ast.body.push(statement);
    }

    return ast;
}

const traverse = (ast, vistor) => {
    const traverseArray = (array, parent) => {
        array.forEach(arr => {
            traverseNode(arr, parent)
        })
    }
    const traverseNode = (node, parent) => {
        const fn = vistor[node.type]
        fn && fn(node, parent)

        switch (node.type) {
            case 'Program':
                traverseArray(node.body, node);
                break;
            case 'VariableDeclaration':
                traverseArray(node.init.params, node.init);
                break;
            case 'identifier':
                break;
            default:
                throw new TypeError(node.type);

        }
    }
    traverseNode(ast, null)
}

const transformer = ast => {
    // 新 ast
    const newAst = {
        type: 'Program',
        body: []
    };
    // 在老 ast 上加一个指针指向新 ast
    ast._newContnet = newAst.body;

    traverse(ast, {
        VariableDeclaration: (node, parent) => {
            const functionDeclaration = {
                params: []
            };
            if (node.init.type === 'ArrowFunctionExpression') {
                functionDeclaration.type = 'FunctionDeclaration';
                functionDeclaration.identifierName = node.identifierName;
            }
            if (node.init.body.type === 'BinaryExpression') {
                functionDeclaration.body = {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ReturnStatement',
                        argument: node.init.body
                    }]
                };
            }
            parent._newContnet.push(functionDeclaration);
        },
        identifier: (node, parent) => {
            if (parent.type === 'ArrowFunctionExpression') {
                ast._newContnet[0].params.push({
                    type: 'identifier',
                    identifierName: node.identifierName
                });
            }
        }
    })
    return newAst
}

const generator = node => {
    switch (node.type) {
        case 'Program': // 如果是 `Program` 结点，那么我们会遍历它的 `body` 属性中的每一个结点，并且递归地，对这些结点再次调用 codeGenerator，再把结果打印进入新的一行中。
            return node.body.map(generator).join('\n');
        case 'FunctionDeclaration': // 如果是FunctionDeclaration我们分别遍历调用其参数数组以及调用其 body 的属性
            return 'function' + ' ' + node.identifierName + '(' + node.params.map(generator) + ')' + ' ' + generator(node.body);
        case 'identifier': // 对于 `Identifier` 我们只是返回 `node` 的 identifierName
            return node.identifierName;
        case 'BlockStatement': // 如果是BlockStatement我们遍历调用其body数组
            return '{' + node.body.map(generator) + '}';
        case 'ReturnStatement': // 如果是ReturnStatement我们调用其 argument 的属性
            return 'return ' + generator(node.argument);
        case 'BinaryExpression': // 如果是ReturnStatement我们调用其左右节点并拼接
            return generator(node.left) + ' ' + node.operator + ' ' + generator(node.right);
        default: // 没有符合的则报错
            throw new TypeError(node.type);
    }
}
const startBabel = str => {
    const tokens = tokenizer(str)
    const ast = parser(tokens);
    const newAst = transformer(ast);
    const rs = generator(newAst);
    console.log(tokens, '\r\n', ast, '\r\n', newAst, '\r\n', rs);
    return rs;
}
startBabel('const add = (a, b) => a + b');


