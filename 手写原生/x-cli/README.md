# 脚手架示例
主要思路就是拉取模板，需要的话可以读取用户输入来修改模板文件。
这篇挺好： https://juejin.cn/post/6932610749906812935?utm_source=gold_browser_extension

## 所需模块依赖
- commander 参数解析
- inquirer 交互式命令行
- download-git-repo 下载模板
- chalk 有颜色输出
- metalsmith 遍历文件夹看需不要渲染
- consolidate 统一了所有的模板引擎
- ora 用来显隐loading
- ncp 拷贝文件
- ejs 模板引擎

## 步骤
1、定个规范
```
npm i eslint -D
npx eslint --init
在 vscode 中设置
```

2、默认会执行 bin 目录下的 www 文件，然后可以直接看 src/main.js 的具体文件操作
