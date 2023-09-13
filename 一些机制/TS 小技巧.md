## @导入路径的问题
大家在日常开发的时候，可能会经常用到webpack的路径别名，比如: import xxx from '@/path/to/name'，如果编辑器不做任何配置的话，这样写会很尴尬，编译器不会给你任何路径提示，更不会给你语法提示。这里有个小技巧，基于 tsconfig.json 的 baseUrl和paths这两个字段，配置好这两个字段后，.ts文件里不但有了路径提示，还会跟踪到该路径进行语法提示。
可以把 tsconfig.json 重命名成jsconfig.json，.js文件里也能享受到路径别名提示和语法提示了。

## 将 ts 打包成一个 umd 文件
对于 amd 和 system 模块，可以配置 tsconfig.json 中的 outFile 字段，输出为一个 js 文件。如果需要输出成其他模块，例如 umd ，又希望打包成一个单独的文件，需要怎么做？可以使用 rollup 或者 webpack ：
// rollup.config.js
const typescript = require('rollup-plugin-typescript2')

module.exports = {
  input: './index.ts',
  output: {
    name: 'MyBundle',
    file: './dist/bundle.js',
    format: 'umd'
  },
  plugins: [
    typescript()
  ]
}

## 一些常用的 ts 周边库

@typescript-eslint/eslint-plugin、@typescript-eslint/parser - lint 套件
DefinitelyTyped - @types 仓库
ts-loader、rollup-plugin-typescript2 - rollup、webpack 插件
typedoc - ts 项目自动生成 API 文档
typeorm - 一个 ts 支持度非常高的、易用的数据库 orm 库
nest.js、egg.js - 支持 ts 的服务端框架
ts-node - node 端直接运行 ts 文件
utility-types - 一些实用的 ts 类型工具
type-coverage - 静态类型覆盖率检测

## 写法
- 断言一定存在：this.element = document.getElementById('xxx')!
- 收纳：在 get set 的时候 try..catch

## Schema
```ts
export interface Schema {
  type: SchemaType | string // 为什么要加个 string，方便开发者直接写 type: 'number' 而不需要引用 SchemaType
}
```


## 不想学？
简单参考这边文章：https://github.com/biaochenxuying/blog/issues/80