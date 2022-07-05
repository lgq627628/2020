## babel

## 用途
- 将某种语法转换成另一种语法，将高版本代码转换成低版本代码
- 函数插桩（自动埋点）
- 自动国际化
- default import 转 named import 
- 小程序转译工具 taro
- 代码的静态分析（linter、api 文档自动生成工具、type checker、压缩混淆工具、js 解释器）

## 编译器和转译器
编译器 Compiler：高级语言 => 低级语言 的转换工具
转译器 Transpiler：高级语言 => 高级语言 的转换工具

## babel 的编译流程
babel 是 source to source 的转换，整体编译流程分为三步：

parse：通过 parser 把源码转成抽象语法树（AST）
transform：遍历 AST，调用各种 transform 插件对 AST 进行增删改
generate：把转换后的 AST 打印成目标代码，并生成 sourcemap

## 为什么要 parse
为了让计算机理解代码需要先对源码字符串进行 parse，生成 AST，把对代码的修改转为对 AST 的增删改，转换完 AST 之后再打印成目标代码字符串。
源码是一串按照语法格式来组织的字符串，人能够认识，但是计算机并不认识，想让计算机认识就要转成一种数据结构，通过不同的对象来保存不同的数据，并且按照依赖关系组织起来，这种数据结构就是抽象语法树（abstract syntax tree）。之所以叫抽象语法树是因为数据结构中省略掉了一些无具体意义的分隔符比如 ; { } 等。有了 AST，计算机就能理解源码字符串的意思，而理解是能够转换的前提，所以编译的第一步需要把源码 parse 成 AST。

## 常见的 AST 节点
### Literal:
- '123'        StirngLiteral
- 123          NumbericLiteral
- `water`      TemplateLiteral
- /[0-9]/      RegExpLiteral
- true         BooleanLiteral
- 1.222n       BigintLiteral
- null         NullLiteral
### Identifier:
Identifer 是标识符的意思，变量名、属性名、参数名等各种声明和引用的名字，都是Identifer。
```js
const name = 'guang'; // name 是 Identifer
function say(name) { // say、name 是 Identifer
  console.log(name); // console、log、name 是 Identifer
}
const obj = { // obj 是 Identifer
  name: 'guang' // name 是 Identifer
}
```
### Statement:
statement 是语句，它是可以独立执行的单位，比如 break、continue、debugger、return 或者 if 语句、while 语句、for 语句，还有声明语句，表达式语句等。我们写的每一条可以独立执行的代码都是语句。语句末尾一般会加一个分号分隔，或者用换行分隔。
下面这些我们经常写的代码，每一行都是一个 Statement：
```js
break;                                  BreakStatement
continue;                               ContinueStatement
return;                                 ReturnStatement
debugger;                               DebuggerStatement
throw Error();                          ThrowStatement
{}                                      BlockStatement
try {} catch(e) {} finally{}            TtyStatement
for (let key in obj) {}                 ForInStatement
for (let i = 0;i < 10;i ++) {}          ForStatement
while (true) {}                         WhileStatement
do {} while (true)                      DoWhileStatement
switch (v){case 1: break;default:;}     SwitchStatement
label: console.log();                   LabeledStatement
with (a){}                              WithStatement
```
语句是代码执行的最小单位，可以说，代码是由语句（Statement）构成的。
### Declaration:
声明语句是一种特殊的语句，它执行的逻辑是在作用域内声明一个变量、函数、class、import、export 等。
```js
const a = 1;            VariableDeclration         
function b(){}          FunctionDeclration
class C {}              ClassDeclration

import d from 'e';      ImportDeclration

export default e = 1;   ExportDefaultDeclration
export {e};             ExportNamedDeclration
export * from 'e';      ExportAllDeclration
```
### Expression:
expression 是表达式，特点是执行完以后有返回值，这是和语句 (statement) 的区别。
```js
[1,2,3]                 ArrayExpression
a = 1                   AssignmentExpression
1 + 2;                  BinaryExpression
-1;                     UnaryExpression
function(){};           FunctionExpression
() => {};               ArrowFunctionExpression
class{};                ClassExpression
a;                      Identifier
this;                   ThisExpression
super;                  Super
a::b;                   BindExpression
console.log             MemberExpression
```
### Class:
class 的语法比较特殊，有专门的 AST 节点来表示。
```js
class Guang extends Person{     ClassDeclration -> ClassBody
    name = 'guang';             ClassProperty
    constructor() {}            ClassMethod(kind="constrouctor")
    eat() {}                    ClassMethod(kind="method")
}
```
### Modules
es module 是语法级别的模块规范，所以也有专门的 AST 节点。
```js
import {c, d} from 'c';         ImportDeclaration -> ImportSpicifier {c,d}
import a from 'a';              ImportDeclaration -> ImportDefaultSpecifier a
import * as b from 'b';         ImportDeclaration -> ImportNamespaceSpcifier * as b

export { b, d};                 ExportNamedDeclaration -> ExportSpicifier
export default a;               ExportDefaultDeclaration
export * from 'c';              ExportAllDeclaration
```
### Program & Directive:
program 是代表整个程序的节点，它有 body 属性代表程序体，存放 statement 数组，就是具体执行的语句的集合。还有 directives 属性，存放Directive 节点，比如"use strict" 这种指令会使用 Directive 节点表示。

### File & Comment
babel 的 AST 最外层节点是 File，它有 program、comments、tokens 等属性，分别存放 Program 程序体、注释、token 等，是最外层节点。

### 公共属性
- type： AST 节点的类型
- start、end、loc：start 和 end 代表该节点对应的源码字符串的开始和结束下标，不区分行列。而 loc 属性是一个对象，有 line 和 column 属性分别记录开始和结束行列号。
- leadingComments、innerComments、trailingComments： 表示开始的注释、中间的注释、结尾的注释，因为每个AST 节点中都可能存在注释，而且可能在开始、中间、结束这三种位置，通过这三个属性来记录和 Comment 的关联。
- extra：记录一些额外的信息，用于处理一些特殊情况。

## 重点学习
@babel/parser，@babel/traverse，@babel/generate，@babel/types，@babel/template 这五个包的 api 的使用
### @babel/parser
babel parser 叫 babylon，是基于 acorn 实现的，扩展了很多语法，可以支持 es next（现在支持到 es2020）、jsx、flow、typescript 等语法的解析，其中 jsx、flow、typescript 这些非标准的语法的解析需要指定语法插件。

- @babel/parser 对源码进行 parse，可以通过 plugins、sourceType 等来指定 parse 语法
- @babel/traverse 通过 visitor 函数对遍历到的 ast 进行处理，分为 enter 和 exit 两个阶段，具体操作 AST 使用 path 的 api，还可以通过 state 来在遍历过程中传递一些数据
- @babel/types 用于创建、判断 AST 节点，提供了 xxx、isXxx、assertXxx 的 api
- @babel/template 用于批量创建节点
- @babel/code-frame 可以创建友好的报错信息
- @babel/generator 打印 AST 成目标代码字符串，支持 comments、minified、sourceMaps 等选项。
- @babel/core 基于上面的包来完成 babel 的编译流程，可以从源码字符串、源码文件、AST 开始。

### path
```js
path {
    // 属性：
    node 
    parent
    parentPath
    scope
    hub
    container
    key
    listKey
    
    // 方法
    get(key) 
    set(key, node)
    inList()
    getSibling(key) 
    getNextSibling()
    getPrevSibling()
    getAllPrevSiblings()
    getAllNextSiblings()
    isXxx(opts)
    assertXxx(opts)
    
    insertBefore(nodes)
    insertAfter(nodes)
    replaceWith(replacement)
    replaceWithMultiple(nodes)
    replaceWithSourceString(replacement)
    remove()
    
    traverse(visitor, state)
    skip()
    stop()
}

path.scope {
    bindings
    block
    parent
    parentBlock
    path
    references
 
    dump()
    parentBlock()
    getAllBindings()
    getBinding(name)
    hasBinding(name)
    getOwnBinding(name)
    parentHasBinding(name)
    removeBinding(name)
    moveBindingTo(name, scope)
    generateUid(name)
}

// 能形成 scope 的有这些节点，这些节点也叫 block 节点。
export type Scopable =
  | BlockStatement
  | CatchClause
  | DoWhileStatement
  | ForInStatement
  | ForStatement
  | FunctionDeclaration         function guang(){}
  | FunctionExpression          const ssh = function () {}
  | Program
  | ObjectMethod
  | SwitchStatement
  | WhileStatement
  | ArrowFunctionExpression
  | ClassExpression
  | ClassDeclaration
  | ForOfStatement
  | ClassMethod
  | ClassPrivateMethod
  | StaticBlock
  | TSModuleBlock;

state {
    file
    opts
}
```

plugin 是单个转换功能的实现，当 plugin 比较多或者 plugin 的 options 比较多的时候就会导致使用成本升高。这时候可以封装成一个 preset，用户可以通过 preset 来批量引入 plugin 并进行一些配置。preset 就是对 babel 配置的一层封装。

preset 和 plugin 从形式上差不多，但是应用顺序不同。
babel 会按照如下顺序处理插件和 preset：
先应用 plugin，再应用 preset
plugin 从前到后，preset 从后到前
这个顺序是 babel 的规定。


我们基于 plugin 和 preset 已经能够完成 esnext 等代码转目标环境 js 代码的功能，但是还不完美。

@babel/preset-env，它基于每种特性的在不同环境的最低支持版本的数据和配置的 targets 来过滤插件，这样能减少很多没必要的转换和 polyfill。

如果希望把一些公共的 helper、core-js、regenerator 等注入的 runtime 函数抽离出来，并且以模块化的方式引入，那么需要用 @babel/plugin-transform-runtime 这个包。

@babel/plugin-transform-runtime 不支持根据 targets 的过滤，和 @babel/preset-env 配合时有问题，这个在 babel8 中得到了解决。babel8 在 @babel/polyfills 包中支持了 polyfill provider 的配置，而且还可以选择注入方式。不再需要 @babel/plugin-transform-runtime 插件了。


## babel 的测试
- 测试转换后的 AST，是否符合预期
- 测试转换后生成的代码，是否符合预期（如果代码比较多，可以存成快照，进行快照对比）
- 转换后的代码执行一下，测试是否符合预期
一般还是第二种方式用的比较多，babel 也是封装了这种方式，提供了 babel-plugin-tester 包。
babel-plugin-tester 就是对比生成的代码的方式，有三种对比方式：直接对比字符串、指定输入和输出的代码文件和实际执行结果对比、生成快照对比快照。
babel plugin tester 还是得用 jest 来跑，只是做了一层封装，简化了书写方式，但运行的话还是用 jest


## 不错的文章
- 聊聊Babel开发的那些事：https://jelly.jd.com/article/5f573dd85e6e88014d42f3d9