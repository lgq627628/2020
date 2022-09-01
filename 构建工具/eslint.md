## eslint + vscode 格式化
第一步：
  下载 eslint
第二步：  
  ```js
  "eslint.format.enable": true, // 使得 eslint 可用
  "eslint.validate": ["javascript","vue","html"], // 哪些文件需要格式化
  "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true, // 是否需要再保存的自动格式化
  }
  ```

## eslint 的正确使用方式

- 安装 npm install eslint --save-dev
- 初始化 npx eslint --init 或者 新建.eslintrc.js文件
- 配置命令，打开package.json文件，并且新增script命令
  ```js
  "scripts": {
    "eslint": "eslint src"
  },
  ```
- 在 src 下新建一个 js 文件，并运行 npm run eslint 检测是否正常
- 如果脚本设置了 --fix 参数，则会自动修复，但是只能修复部分，具体参考 https://eslint.org/docs/rules/object-property-newline#-fix
  ```js
  "scripts": {
    "eslint": "eslint src --fix"
  },
  ```
- 具体规则配置，就是 rules，可参考官网 https://eslint.org/docs/user-guide/migrating-to-1.0.0
  ```js
  'rules': {
    indent: ['error', 2], //缩进为2个空格
    'no-alert': 'error', //禁止alert
    'no-console': 'warn', //警告console
    'semi': [ 'error', 'never'], // 禁止每行结尾带;分号
    'quotes': ['error', 'single'], //字符串必须单引号
    'no-shadow': 'error', // 禁止局部变量和全局变量重名
    'prefer-const': 'error' // 无需重新赋值的变量转成const定义
  }
  // 上面rules中的warn或者error，会影响到ESLint校验的级别。具体设置如下：
  // "off" 或 0 - 关闭规则
  // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
  // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
  ```
- 如果你想要在写代码的时候就有提示，则需要配合编辑器的插件使用，比如 vscode 就需要安装 ESLint 插件

## 参考文章
- https://jelly.jd.com/article/5f641d4a6729c6015293bf46
- https://zhuanlan.zhihu.com/p/53680918