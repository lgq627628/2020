const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const IMPORT_TYPE = {
    deconstruct: 'deconstruct',
    default: 'default',
    namespace: 'namespace'
}
const EXPORT_TYPE = {
    all: 'all',
    default: 'default',
    named: 'named'
}

class FileNode {
    constructor(path = '', imports = {}, exports = []) { // path 表示当前模块路径， imports 表示从什么模块引入了什么变量，exports 表示导出了什么变量。
        this.path = path;
        this.imports = imports;
        this.exports = exports;
        this.subModules = {};
    }
}

function isDirectory(filePath) {
    try {
        return fs.statSync(filePath).isDirectory()
    }catch(e) {
        return false;
    }
    return false;
}
function completeModulePath(modulePath) { // 补全文件后缀名
    const EXTS = ['.tsx', '.ts', '.jsx', '.js'];
    if (modulePath.match(/\.[a-zA-Z]+/)) return modulePath;

    function tryCompletePath (resolvePath) {
        for (let i = 0; i < EXTS.length; i ++) {
            let tryPath = resolvePath(EXTS[i]);
            if (fs.existsSync(tryPath)) {
                return tryPath;
            }
        }
    }
    function reportModuleNotFoundError (modulePath) {
        throw 'module not found: ' + modulePath;
    }

    if (isDirectory(modulePath)) { // 如果是目录
        const tryModulePath = tryCompletePath((ext) => path.join(modulePath, 'index' + ext)); // 尝试找到目录下的 index.js 文件
        return tryModulePath || reportModuleNotFoundError(modulePath);
    } else if (!EXTS.some(ext => modulePath.endsWith(ext))) { // 如果是文件但是没有后缀
        const tryModulePath = tryCompletePath((ext) => modulePath + ext);
        return tryModulePath || reportModuleNotFoundError(modulePath);
    }
    return modulePath;
}
function moduleResolver (curModulePath, requirePath) {

    requirePath = path.resolve(path.dirname(curModulePath), requirePath);

    // 过滤掉第三方模块
    if (requirePath.includes('node_modules')) {
        return '';
    }

    requirePath =  completeModulePath(requirePath);

    if (visitedModules.has(requirePath)) {
        return '';
    } else {
        visitedModules.add(requirePath);
    }
    return requirePath;
}
function resolveBabelSyntaxtPlugins(modulePath) {
    const plugins = [];
    if (['.ts', '.tsx'].some(ext => modulePath.endsWith(ext))) plugins.push('ts'); // 如果是 ts 文件
    if (['.jsx', '.tsx'].some(ext => modulePath.endsWith(ext))) plugins.push('jsx'); // 如果是 jsx 文件
    return plugins;
}
function traverseJsModule(curModulePath, fileModule, allModules) {
    // 1、读取文件内容
    // 2、parse 成 AST
    // 3、travese AST 提取模块信息和依赖信息
    // 4、递归遍历依赖（先把路径处理成绝对路径）
    const fileContent = fs.readFileSync(curModulePath, { encoding: 'utf-8' })
    const ast = parser.parse(fileContent, { sourceType: 'unambiguous', plugins: resolveBabelSyntaxtPlugins(curModulePath) })
    traverse(ast, {
        // ImportDeclaration 分为三种：
        // 这种我们叫 deconstruct import（解构引入）
        // import { a, b as bb} from 'aa';
        // 这种我们叫 default import（默认引入）
        // import b from 'b';
        // 这种我们叫 namespace import（命名空间引入）
        // import * as c from 'cc';
        ImportDeclaration(path) {
            // 1、收集import 信息
            // 2、递归处理依赖模块
            const subModulePath = moduleResolver(curModulePath, path.get('source.value').node);
            if (!subModulePath) return; // 处理过的依赖就不需要重复处理了

            const specifierPaths = path.get('specifiers');
            fileModule.imports[subModulePath] = specifierPaths.map(specifierPath => {
                if (specifierPath.isImportSpecifier()) {
                    return {
                        type: IMPORT_TYPE.deconstruct,
                        imported: specifierPath.get('imported').node.name,
                        local: specifierPath.get('local').node.name
                    }
                } else if (specifierPath.isImportDefaultSpecifier()) {
                    return {
                        type: IMPORT_TYPE.default,
                        local: specifierPath.get('local').node.name
                    }
                } else {
                    return {
                        type: IMPORT_TYPE.namespace,
                        local: specifierPath.get('local').node.name
                    }
                }
            });

            const subModule = new FileNode(subModulePath);
            traverseJsModule(subModulePath, subModule, allModules);
            fileModule.subModules[subModule.path] = subModule;
        },
        // export 的信息，也是分为三种类型
        // 命名导出 (named export)
        // export { c as cc };
        // 默认导出 (default export)
        // export default b;
        // 全部导出(all export)
        // export * from 'a';
        ExportDeclaration(path) {
            if (path.isExportNamedDeclaration()) {
                const specifiers = path.get('specifiers');
                fileModule.exports = specifiers.map(specifierPath => ({
                    type: EXPORT_TYPE.named,
                    exported: specifierPath.get('exported').node.name,
                    local: specifierPath.get('local').node.name
                }));
            } else if (path.isExportDefaultDeclaration()) {
                let exportName;
                const declarationPath = path.get('declaration');
                if(declarationPath.isAssignmentExpression()) {
                    exportName = declarationPath.get('left').toString();
                } else {
                    exportName = declarationPath.toString()
                }
                fileModule.exports.push({
                    type: EXPORT_TYPE.default,
                    exported: exportName
                });
            } else {
                fileModule.exports.push({
                    type: EXPORT_TYPE.all,
                    exported: path.get('exported').node.name,
                    source: path.get('source').node.value
                })
            }
        }
    })
    allModules[curModulePath] = fileModule
}


const getDependencyGraph = curModulePath => {
    const dependencyGraph = {
        root: new FileNode(curModulePath),
        allModules: {}
    }
    traverseJsModule(curModulePath, dependencyGraph.root, dependencyGraph.allModules)
    return dependencyGraph
}

const visitedModules = new Set();
const rs = getDependencyGraph(path.resolve(__dirname, './index.js'))
console.log(JSON.stringify(rs, null, 4));