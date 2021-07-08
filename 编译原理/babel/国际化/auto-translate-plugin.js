const { declare } = require('@babel/helper-plugin-utils');
const fse = require('fs-extra');
const path = require('path');

const INTL = 'intl';
let intlIndex = 0;

const autoTranslatePlugin = declare((api, options, dirname) => {
    if (!options.outputDir) throw new Error('outputDir in empty');

    api.assertVersion(7);
    function getReplaceExpression(path, value, intlUid) {
        let replaceExpression = api.template.ast(`${intlUid}.t('${value}')`).expression;
        if (path.findParent(p => p.isJSXAttribute()) && !path.findParent(p=> p.isJSXExpressionContainer())) {
            replaceExpression = api.types.JSXExpressionContainer(replaceExpression);
        }
        return replaceExpression;
    }
    function nextIntlKey() {
        ++intlIndex;
        return `intl${intlIndex}`;
    }
    function save(file, key, value) {
        const allText = file.get('allText');
        allText.push({
            key, value
        });
        file.set('allText', allText);
    }
    return {
        pre(file) {
            file.set('allText', []);
        },
        visitor: {
            Program: {
                enter(path, state) {
                    let isImport;
                    path.traverse({
                        ImportDeclaration(path2) { // 检查是否 import 语言包
                            const importName = path2.node.source.value;
                            if (importName === INTL) isImport = true;
                        }
                    })
                    if (!isImport) {
                        const importUid = path.scope.generateUid(INTL);
                        const importAst = api.template.ast(`import ${importUid} from '${INTL}'`);
                        path.node.body.unshift(importAst);
                        state.intlUid = importUid;
                    }

                    path.traverse({
                        'StringLiteral|TemplateLiteral'(path) { // 事先检测不需要翻译的地方
                            if (path.node.leadingComments) {
                                path.node.leadingComments = path.node.leadingComments.filter((comment, i) => {
                                    if (comment.value.includes('i18n-disable')) {
                                        path.node.skipTranslate = true; // 不需要翻译的地方标注跳过
                                        return false;
                                    }
                                    return true;
                                });
                            }
                            if(path.findParent(p => p.isImportDeclaration())) {
                                path.node.skipTranslate = true;
                            }
                        }
                    })
                }
            },
            StringLiteral(path, state) {
                if (path.node.skipTranslate) return;

                let key = nextIntlKey();
                save(state.file, key, path.node.value);
            
                const replaceExpression = getReplaceExpression(path, key, state.intlUid);
                path.replaceWith(replaceExpression);

                path.skip();
            },
            TemplateLiteral(path, state) {
                if (path.node.skipTranslate) return;

                path.get('quasis').forEach(templateElementPath => {
                    const value = templateElementPath.node.value.raw;
                    if(value) {
                        let key = nextIntlKey();
                        save(state.file, key, value);
            
                        const replaceExpression = getReplaceExpression(templateElementPath, key, state.intlUid);
                        templateElementPath.replaceWith(replaceExpression);
                    }
                });
                path.skip();
            }
        },
        post(file) {
            const allText = file.get('allText');
            const intlData = allText.reduce((obj, item) => {
                obj[item.key] = item.value;
                return obj;
            }, {});

            const content = `const resource = ${JSON.stringify(intlData, null, 4)};\nexport default resource;`;
            fse.ensureDirSync(options.outputDir);
            fse.writeFileSync(path.join(options.outputDir, 'zh_CN.js'), content);
            fse.writeFileSync(path.join(options.outputDir, 'en_US.js'), content);
        }
    }
})

module.exports = autoTranslatePlugin;