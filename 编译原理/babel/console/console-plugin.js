const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
module.exports = function(api, options) {
    const { types, template } = api;
    return {
        visitor: {
            CallExpression(path, state) {
                const { node } = path;
                if (node.isNewGen) return;
        
                const calleeName = path.get('callee').toString(); // 就是函数名的字符串 generator.generate(node.callee).code
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
        }
    }
}