## 如何升级依赖中的 npm 包
- 手动更改，但是无法发现所有需要更新的 package
- 借助命令 `npm outdated` || `npm outdated -l`，发现有待更新的 package
- 推荐一个功能更强大的工具 npm-check-updates，执行 `npx npm-check-updates -u`，可自动将 package.json 中待更新版本号进行重写。升级 minor 小版本号，有可能引起 Break Change，可仅仅升级到最新的 patch 版本，加个参数即可：`npx npm-check-updates --target patch`


## 如何确保所有 npm install 的依赖都是安全的
- 执行 `npm audit` || `yarn audit` 命令即可查看有风险的包
- 查看生产环境的包：`npm audit production` || `yarn audit dependencies`
- 通过 `npm audit fix` 可以自动修复该库的风险，原理就是升级依赖库，升级至已修复了风险的版本号。
- yarn audit 无法自动修复，需要使用 yarn upgrade 手动更新版本号，不够智能。
- synk 是一个高级版的 npm audit，可自动修复，且支持 CICD 集成与多种语言。命令为：`npx snyk wizard`
- 可通过 CI/gitlab/github 中配置机器人，使他们每天轮询一次检查仓库的依赖中是否有风险。


## 如何修复某个 npm 包的紧急 bug
- 在 Github 提交 Pull Request，修复 Bug，等待合并 && 合并 PR 后，等待新版本发包 && 升级项目中的 lodash 依赖
- 本地修改 node_modules/lodash，本地正常运行 && 将修改文件复制到 ${work_dir}/patchs/lodash 中，纳入版本管理
```zsh
# 修改 lodash 的一个小问题
$ vim node_modules/lodash/index.js

# 对 lodash 的修复生成一个 patch 文件，位于 patches/lodash+4.17.21.patch
$ npx patch-package lodash

# 将修复文件提交到版本管理之中
$ git add patches/lodash+4.17.21.patch
$ git commit -m "fix 一点儿小事 in lodash"

# 此后的命令在生产环境或 CI 中执行
# 此后的命令在生产环境或 CI 中执行
# 此后的命令在生产环境或 CI 中执行

# 在生产环境装包
$ npm i

# 为生产环境的 lodash 进行小修复
$ npx patch-package

# 大功告成！
```
patch-package 自动生成的 patch 文件实际上是一个 diff 文件，在生产环境中可自动根据 diff 文件与版本号 (根据 patch 文件名存取) 将修复场景复原！
```bash
$ cat patches/lodash+4.17.21.patch
diff --git a/node_modules/lodash/index.js b/node_modules/lodash/index.js
index 5d063e2..fc6fa33 100644
--- a/node_modules/lodash/index.js
+++ b/node_modules/lodash/index.js
@@ -1 +1,3 @@
+console.log('DEBUG SOMETHING')
+
 module.exports = require('./lodash');
\ No newline at end of file
```