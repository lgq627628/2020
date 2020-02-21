## flow
- flow 是一个静态类型的检查工具
- 也就是给 js 增加了类型
- 在文件开头加上 @flow 注释标识即可


## 使用命令行的方法
- 安装 `npm i flow-bin flow-remove-types -D`
- npx flow init （初始化配置）
- npx flow || npx flow check（执行检查）
- npx flow-remove-types 源文件 -d 生成的文件
- npx 是 node 的工具，是为了使用当前目录下的 node_modules 中可执行程序的工具，当然也可以写在 package.json 中

## 借助 IDE
- VSCode 中安装 Flow Language Support 插件即可
