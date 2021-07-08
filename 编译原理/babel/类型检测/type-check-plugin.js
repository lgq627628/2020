const { declare } = require('@babel/helper-plugin-utils');
const importModule = require('@babel/helper-module-imports');

function resolveType(targetType, referenceTypesMap = {}) {
    const tsTypeAnnotationMap = {
        TSStringKeyword: 'string',
        TSNumberKeyword: 'number'
    }
    switch (targetType.type) {
        case 'TSTypeAnnotation':
            if (targetType.typeAnnotation.type === 'TSTypeReference') {
                return referenceTypesMap[targetType.typeAnnotation.typeName.name]
            }
            return tsTypeAnnotationMap[targetType.typeAnnotation.type];
        case 'StringTypeAnnotation':
            return 'string';
        case 'NumberTypeAnnotation': 
            return 'number';
        case 'TSNumberKeyword':
            return 'number';
    }
}

const autoPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('errs', []);
        },
        visitor: {
            Program: {
                enter (path, state) {
                }
            },
            CallExpression (path, state) { // 函数执行参数类型校验
                const errs = state.file.get('errs');
                 // 先拿到类型参数的值，也就是真实类型
                const realTypes = path.node.typeParameters && path.node.typeParameters.params && path.node.typeParameters.params.map(item => {
                    return resolveType(item);
                });
                // 调用参数的类型，实参的类型
                const argumentsTypes = path.get('arguments').map(item => {
                    return resolveType(item.getTypeAnnotation());
                });
                const calleeName = path.get('callee').toString();
                // 根据 callee 查找函数声明
                const functionDeclarePath = path.scope.getBinding(calleeName).path;
                const realTypeMap = {};
                // 把类型参数的值赋值给函数声明语句的泛型参数
                functionDeclarePath.node.typeParameters && functionDeclarePath.node.typeParameters.params && functionDeclarePath.node.typeParameters.params.map((item, index) => {
                    realTypeMap[item.name] = realTypes[index];
                });
                // 拿到声明时参数的类型
                const declareParamsTypes = functionDeclarePath.get('params').map(item => {
                    return resolveType(item.getTypeAnnotation(), realTypeMap);
                })
                console.log(realTypeMap);

                argumentsTypes.forEach((item, index) => {
                    if (item !== declareParamsTypes[index]) {
                        // 类型不一致，报错
                        const stackTraceLimit = Error.stackTraceLimit;
                        Error.stackTraceLimit = 0; // 去掉错误堆栈
                        // 高亮某一段代码
                        const err = path.get(`arguments.${index}`).buildCodeFrameError(`The prrmas of ${calleeName} must to be ${declareParamsTypes[index]}, not ${item}`, Error);
                        errs.push(err);
                        Error.stackTraceLimit = stackTraceLimit; // 还原堆栈
                    }
                });
            },
            AssignmentExpression(path, state) { // 赋值表达式类型校验
                const errs = state.file.get('errs');
                const rightType = resolveType(path.get('right').getTypeAnnotation());
                const leftBinding = path.scope.getBinding(path.get('left'));
                const leftType = resolveType(leftBinding.path.get('id').getTypeAnnotation());// 左边的值声明的类型
                if (leftType !== rightType) {
                    const stackTraceLimit = Error.stackTraceLimit;
                    Error.stackTraceLimit = 0; // 去掉错误堆栈
                    const err = path.get('right').buildCodeFrameError(`${rightType} can not assign to ${leftType}`, Error);
                    errs.push(err);
                    Error.stackTraceLimit = stackTraceLimit; // 还原堆栈
                    // throw new SyntaxError('语法错误')
                }
            }
        },
        post(file) {
            console.log(file.get('errs'));
        },
    }
})

module.exports = autoPlugin;