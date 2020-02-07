# 脚手架示例

## 所需模块依赖
- commander 参数解析
- inquirer 交互式命令行
- download-git-repo 下载模板
- chalk 有颜色输出
- metalsmith 读取所有文件，实现模板渲染
- consolidate 统一模板引擎
- ora 用来显隐loading

## 步骤
1、定个规范
```
npm i eslint -D
npx eslint --init
在 vscode 中设置
```

2、默认会执行 bin 目录下的 www 文件，然后可以直接看 src/main.js 的具体文件操作
