const { declare } = require('@babel/helper-plugin-utils');
const fse = require('fs-extra');
const path = require('path');
const doctrine = require('doctrine');
const renderer = require('./renderer');

function resolveType(tsType) { // 处理类型转换
    const typeAnnotation = tsType.typeAnnotation;
    if (!typeAnnotation) {
        return;
    }
    switch (typeAnnotation.type) {
        case 'TSStringKeyword': 
            return 'string';
        case 'TSNumberKeyword':
            return 'number';
        case 'TSBooleanKeyword':
            return 'boolean';
    }
}

function parseComment(commentStr) { // 处理注释
    if (!commentStr) {
        return;
    }
    return doctrine.parse(commentStr, {
        unwrap: true
    });
}

function generate(docs, format = 'json') {
    if (format === 'markdown') {
        return {
            ext: '.md',
            content: renderer.markdown(docs)
        }
    } else if (format === 'html') {
        return {
            ext: '.html',
            content: renderer.html(docs)
        }
    } else {
        return {
            ext: '.json',
            content: renderer.json(docs)
        }        
    }
}

const autoPlugin = declare((api, options, dirname) => {
    api.assertVersion(7);

    return {
        pre(file) {
            file.set('docs', []);
        },
        visitor: {
            FunctionDeclaration(path, state) {
                // 函数名： path.get('id').toString()
                // 参数： path.get('params')
                // 返回值类型： path.get('returnType').getTypeAnnotation()
                // 注释信息：path.node.leadingComments
                const docs = state.file.get('docs');
                const doc = {
                    type: 'function',
                    name: path.get('id').toString(), // 函数名
                    params: path.get('params').map(paramPath=> {
                        return {
                            name: paramPath.toString(),
                            type: resolveType(paramPath.getTypeAnnotation())
                        }
                    }),
                    return: resolveType(path.get('returnType').getTypeAnnotation()),
                    doc: path.node.leadingComments && parseComment(path.node.leadingComments[0].value)
                };
                docs.push(doc);
                state.file.set('docs', docs);
            },
            ClassDeclaration (path, state) {
                // 类名：path.get('id').toString()
                // 方法：travese ClassMethod 节点取信息（包括 constructor 和 method）
                // 属性： traverse ClassProperty 节点取信息
                // 注释信息： path.node.leadingComments
                const docs = state.file.get('docs');
                const classInfo = {
                    type: 'class',
                    name: path.get('id').toString(),
                    constructorInfo: {},
                    methodsInfo: [],
                    propertiesInfo: []
                };
                path.traverse({
                    ClassProperty(path) {
                        classInfo.propertiesInfo.push({
                            name: path.get('key').toString(),
                            type: resolveType(path.getTypeAnnotation()),
                            doc: [path.node.leadingComments, path.node.trailingComments].filter(Boolean).map(comment => {
                                return parseComment(comment.value);
                            }).filter(Boolean)
                        })
                    },
                    ClassMethod(path) {
                        if (path.node.kind === 'constructor') {
                            classInfo.constructorInfo = {
                                params: path.get('params').map(paramPath=> {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation()),
                                        doc: parseComment(path.node.leadingComments[0].value)
                                    }
                                })
                            }
                        } else {
                            classInfo.methodsInfo.push({
                                name: path.get('key').toString(),
                                doc: parseComment(path.node.leadingComments[0].value),
                                params: path.get('params').map(paramPath=> {
                                    return {
                                        name: paramPath.toString(),
                                        type: resolveType(paramPath.getTypeAnnotation())
                                    }
                                }),
                                return: resolveType(path.getTypeAnnotation())
                            })
                        }
                    }
                });
                if (path.node.leadingComments) {
                    classInfo.doc = parseComment(path.node.leadingComments[0].value);
                }
                docs.push(classInfo);
                state.file.set('docs', docs);
            }
        },
        post(file) {
            const docs = file.get('docs');
            console.log(docs);
            const res = generate(docs, options.format);
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, 'docs' + res.ext), res.content);
        },
    }
})

module.exports = autoPlugin;