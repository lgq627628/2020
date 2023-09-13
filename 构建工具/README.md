## 常用构建脚本

### 一般三种风格
- web版本
- Guide风格命令行
- git风格命令行

### cli 小工具
- shell.js 跨平台脚本
- chokidar，监听文件变化
    因为 fs.watch 和 fs.watchFile 存在以下问题：
    OS X 系统环境不报告文件名变化
    OS X 系统中使用Sublime等编辑器时，不报告任何事件
    经常会报告两次事件
    多数事件通知为 rename
    还有其他大量的问题
    不能够简单地递归监控文件树

- chalk，多彩的粉笔
- inquirer.js
    ```js
        const questions = [];
        inquirer  
            .prompt(
                /* Pass your questions in here */
                [{
                    type: 'confirm',
                    name: 'toBeDelivered',
                    message: 'Is this for delivery?',
                    default: false
                }]
            )
            .then(answers => {
                // Use user feedback for... whatever!!
            });
    ```
- commander.js，git风格命令行，是指通过主指令+子指令+参数的模式运行命令实现功能
    ```js
        program.version('0.0.1')
        .description('An application for pizzas ordering')
        .option('-p, --peppers', 'Add peppers')
        .option('-P, --pineapple', 'Add pineapple')
        .option('-b, --bbq', 'Add bbq sauce')
        .option('-c, --cheese <type>', 'Add the specified type of cheese [marble]')
        .option('-C, --no-cheese', 'You do not want any cheese')
        .parse(process.argv);
    ```
- listr2 是一个用于在终端中展示任务列表和进度的 Node.js 库
- fast-glob 是一个非常快速和可靠的文件搜索库
- boxen 是一个用于在终端中生成带边框的文本框的 Node.js 模块

### 脚手架 || 插件化脚手架
- https://jelly.jd.com/article/5f447fc70186880153ccdbd4
- https://juejin.cn/post/7115206210701230088

### 本地开发测试
- 开发版本：开发版本的程序，可以在代码根目录中使用npm link将其注册为全局安装，当开发完毕正式发布后，使用npm unlink去除连接即可。
- 发布版本 ：node包开发完成并使用publish命令正式发布以后，即可通过npm install -g XXX或yarn global add XXX直接从npm上下载并全局安装，然后即可全局使用。

## git 好文
- 修改历史记录 git rebase -i commitId https://developer.huawei.com/consumer/cn/forum/topic/0201454010956490762