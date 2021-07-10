const { declare } = require('@babel/helper-plugin-utils');


// 禁止函数重新赋值
// 要处理的是赋值表达式，对应的 AST 是 AssignmentExpression（赋值表达式可以独立作为语句，构成表达式语句 ExpressionStatement），要判断 left 属性是否引用的是一个函数。
// 获取变量的引用需要用 path.scope.getBinding 的 api，从作用域中查找 binding，然后判断声明的节点是否是一个 FunctionDeclaration 或 FunctionExpression。如果是，说明对函数进行了重新赋值，就报错。

// function xx(){}   // FunctionDeclaration
// const xx = function () {} // FunctionExpression

const autoPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('errors', []);
         },
        visitor: {
            ForStatement (path, state) {
                const testOperator = path.node.test.operator
                const udpateOperator = path.node.update.operator

                let sholdUpdateOperator;
                if (['>', '>='].includes(testOperator)) {
                    sholdUpdateOperator = '--'
                } else if (['<', '<='].includes(testOperator)) {
                    sholdUpdateOperator = '++'
                }

                if (sholdUpdateOperator && sholdUpdateOperator !== udpateOperator) {
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    state.file.get('errors').push(path.get('update').buildCodeFrameError("这样子的 for 会死循环的", Error));
                    Error.stackTraceLimit = tmp;
                }
            },
            AssignmentExpression(path, state) { // 检查函数是否被重新赋值
                const assignTarget = path.get('left').toString(); // 获取赋值的左侧变量名
                const binding = path.scope.getBinding(assignTarget); // 获取作用域

                if(binding) {
                    if (binding.path.isFunctionDeclaration() || binding.path.isFunctionExpression()) {
                        const tmp = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0;
                        state.file.get('errors').push(path.buildCodeFrameError("函数不能重新赋值撒", Error));
                        Error.stackTraceLimit = tmp;
                    }
                }
            },
            BinaryExpression(path, state) {
               const { left, right, operator } = path.node
               if (left.type !== right.type && ['==', '!='].includes(operator)) {
                    const tmp = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0;
                    state.file.get('errors').push(path.buildCodeFrameError("建议用 ===", Error));
                    Error.stackTraceLimit = tmp;

                    // 如果要自动修复
                    if (state.opts.fix) {
                        path.node.operator = operator + '=';
                    }
               }
            }
        },
        post(file) {
            console.log(file.get('errors'));
        },
    }
})

module.exports = autoPlugin;



// 补充：比如下面一段代码
// function foo() {return true;}
// 在函数体的大括号内侧没有空格，规范的格式应该是要有空格。

// 看看 eslint 是怎么做的：
// 拿到函数体的左括号的 token
// 拿到左括号后的第一个 token
// 对比下两个 token 的位置，如果不在同一行，或者之间有空格就是符合规范的。

// 但是，babel 并没有获取 AST 关联的 token 的 api，只能获取关联的 comments，通过 leadingComments、tailingComments、innerComments 这三个属性。
// 所以，babel 无法做这种校验。
// 我们在 js parser 的历史那一节讲过 eslint 有自己的 parser：espree，espree 就做了 AST 和对应的 comments、token 的关联，
// 它做代码格式的检查需要这样的能力，而 babel 只提供了关联 comments 的能力，
// 我们可以通过 path.addComment('leading', '@__PURE__', false) 来在节点前添加一个块注释，
// 因为 babel 转译的结果可能还要交给 terser 来压缩，可以通过这样的方式来标识一个函数是无副作用的，如果没有用到就可以放心的删除。