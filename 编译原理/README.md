## 参考文章
方便操作 AST 的库，jscodeshift 的使用 ：https://jelly.jd.com/article/60a623e40801420171d9b090

## 最简单的编译原理库
https://github.com/jamiebuilds/the-super-tiny-compiler/blob/master/the-super-tiny-compiler.js

## 答疑
babel 内部为了提高效率，正是采用 merge visitors 的方式：
// ...
// 插件合并
const visitor = traverse.visitors.merge(
  visitors,
  passes,
  file.opts.wrapPluginVisitorMethod,
);
// 一次性执行插件 visitor 中定义的方法
traverse(file.ast, visitor, file.scope);
// ...
合并的原则是对于相同类型的节点，将处理方法组合成一个数组，当遇到该类型节点的时候，一次执行处理方法，合并的数据结构类似如下：
{
  ArrowFunctionExpression: {
    enter: [...]
  },
  BlockStatement: {
    enter: [...],
    exit: [...]
  },
  DoWhileStatement: {
    enter: [...]
  }
}
比如 Babel，他的核心功能是将一种语言的代码转化为另一种语言的代码，他面临的问题就是，他无法在设计时就穷举语法类型，也不了解应该如何去转换一种新的语法，因此需要提供相应的扩展方式。为此，他将自己的整体流程抽象成了 parse、transform、generate 三个步骤，并主要面向 parse 和 transform 提供了插件方式做扩展性支持。在 parse 这层，他核心要解决的问题是怎么去做分词，怎么去做词义语法的理解。在 transform 这层要做的则是，针对特定的语法树结构，应该如何转换成已知的语法树结构。很明显，babel 他很清楚地定义了 parse 和 transform 两层的插件要完成的事情。