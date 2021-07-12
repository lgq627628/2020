const { declare } = require('@babel/helper-plugin-utils');

const base54 = (function(){
    var DIGITS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_";
    return function(num) {
            var ret = "";
            do {
                    ret = DIGITS.charAt(num % 54) + ret;
                    num = Math.floor(num / 54);
            } while (num > 0);
            return ret;
    };
})();

const autoPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('uid', 0);
        },
        visitor: {
            Scopable: {
                exit (path, state) {
                    // 混淆变量名
                    let uid = state.file.get('uid');
                    Object.entries(path.scope.bindings).forEach(([key, binding]) => {
                        if (binding.hasRenamed) return
                        binding.hasRenamed = true
                        const newName = path.scope.generateUid(base54(uid++));
                        binding.path.scope.rename(key, newName); // 混淆变量名
                    })
                    state.file.set('uid', uid);

                    // 删除无用代码
                    Object.entries(path.scope.bindings).forEach(([key, binding]) => {
                        if (binding.referenced) return
    
                        if (binding.path.get('init').isCallExpression()) {
                            const comments = binding.path.get('init').node.leadingComments; // 拿到节点前的注释
                            if(comments && comments[0]) {
                                if (comments[0].value.includes('PURE')) { // 有 PURE 注释就删除
                                    binding.path.remove();
                                    return;
                                }
                            }
                        }
    
                        if (path.scope.isPure(binding.path.node.init)) { // 如果是纯的，就直接删除，否则替换为右边部分
                            binding.path.remove();
                        } else {
                            binding.path.parentPath.replaceWith(api.types.expressionStatement(binding.path.node.init));
                        }
                    })
                }
            },
            BlockStatement(path) {
                const statementPaths = path.get('body');
                let hasReturn = false;
                statementPaths.forEach(state => {
                    if (hasReturn) { // 删除 return 之后的逻辑，除了函数和 var 变量
                        const needRetain = state.isFunctionDeclaration() || state.isVariableDeclaration({ kind: 'var' })
                        if (!needRetain) state.remove()
                    } else if (state.isCompletionStatement()) {
                        hasReturn = true;
                    }
                })
            }
        }
    }
})

module.exports = autoPlugin;