# AST
抽象语法树（Abstract Syntax Tree），简称 AST，简单来说就是用对象来描述代码。可以参考这篇文章了解一下：[手把手带你入门 AST 抽象语法树](https://juejin.im/post/5e0a245df265da33cf1aea91)

## 应用场景
- 编辑器的错误提示、代码格式化、代码高亮、代码自动补全
- eslint、pretiier 对代码错误或风格的检查
- webpack 通过 babel 转译 javascript 语法

## 用法
```js
let parser = require('@babel/parser'); // 1、把 js 字符串代码转成 ast
let traverse = require('@babel/traverse'); // 2、遍历 ast
let t = require('@babel/types') // 3、对 ast 进行修改的工具库，类似于 lodash
let generator = require('@babel/generator'); // 4、把新的 ast 生成新的 js 字符串
```

## 例子
可查看当前目录下 demo 里面的例子，这是在 babel 的基础上做的。阅读顺序如下：debugger => let => arrow => console。
