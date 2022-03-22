function compile(code) {
    // 1. 代码转换成ast
    const ast = parser.parse(code, {
      sourceType: "unambiguous",
    });
  
    // 2. traverse 进行改造
    traverse.default(ast, {
      ImportDeclaration(path) {
        const node = path.node
        if(node.specifiers.length === 0){
          return;
        }
  
        const oldSpecifier = node.specifiers[0]?.local.name;
        const newSpecifier =  t.importDefaultSpecifier(t.identifier('Button'))
        node.specifiers = [newSpecifier]
  
        const newImportPath = t.stringLiteral(`antd/es/${oldSpecifier.toLocaleLowerCase()}`)
        node.source = newImportPath
  
        const cssImportDeclaration = t.importDeclaration([],t.stringLiteral(`antd/es/${oldSpecifier}/style`))
        path.insertAfter(cssImportDeclaration)
      },
    });
  
    // 3. generator 将 ast 转回成代码
    return generator.default(ast, {}, code);
  }
  
  const code = `
  import { button } from 'antd'
  `;
  const gen = compile(code);