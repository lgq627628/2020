- [从撤销 rebase 谈谈 git 原理
](https://juejin.cn/post/6844903554067464200)
- [git 实操手册和提交流程](http://blog.hu77.top/others/Git/01.html)
- git rebase 流程
  - 合并 commit 数目 `git rebase -i HEAD~18`
    - 将第一项改成 pick
    - 将其余项改成 fixup
  - 再强推一次 `git push origin 分支名 -f`
  - 合并 master `git rebase origin/master`
  - 强推 `git push origin 分支名 -f`

- 修改分支名 修改分支名  git branch -m 分支名
- git subtree pull 引用其他仓库 https://webfe.kujiale.com/git-subtree-de-shi-yong/


## git 合并操作
```bash
// 普通 merge，会包含所有 dev 提交记录并且多出一条合并的记录
git checkout master
git merge dev

// 把 dev 的提交记录压缩成一条后 merge，也不会多出一条合并记录，但是需要在主分支上手动提交，提交者变了
git checkout master
git merge --squash dev


// 先 rebase 再 merge
git checkout dev
git rebase -i master
git checkout master
git merge dev
```
- https://www.jianshu.com/p/684a8ae9dcf1
- https://www.jianshu.com/p/ff1877c5864e
- https://bbs.huaweicloud.com/blogs/332925

## 不常用命令
- git revert 用新的 commit 回滚之前的 commit，新的 commit 内容和旧的 commit 内容相反，刚好能够抵消。HEAD 是继续向前走的，不改变历史。
- git reset 则是 HEAD 向后移一个 commit。撤销(revert)被设计为撤销公开的提交(比如已经push)的安全方式，git reset被设计为重设本地更改
- 将代码从一个分支转移到另一个分支：这时分两种情况。一种情况是，你需要另一个分支的所有代码变动，那么就采用合并（git merge）。另一种情况是，你只需要部分代码变动（某几个提交），这时可以采用 Cherry pick。可参考 https://www.ruanyifeng.com/blog/2020/04/git-cherry-pick.html
- 先转移到要应用的分支：git checkout newBranch，然后执行：git cherry-pick (oldBranch||commitId commitId2 commitId3)，git cherry-pick命令的参数，不一定是提交的哈希值，分支名也是可以的，表示转移该分支的最新提交。如果想要转移一系列的连续提交，可以使用下面的简便语法。git cherry-pick A..B 
- 转移到另一个代码库:
```
git remote add target git://gitUrl
git fetch target
git log target/master
git cherry-pick <commitHash>
```
- 如果有冲突想还原某个文件和远程的一致可以这样：git fetch && git checkout origin/master -- 目录名/文件名



## pr || mr || 工作流 || fork || pull request || merge request
如果经常用 Github，一定十分了解 Pull Request。
如果经常用 Gitlab，一定十分了解 Merge Request。
其实  Merge Request 和 Pull Request 是同一个东西，仅仅只是名字不一样。只不过：
Github 选择了第一个命令来命名，叫 Pull Request。
Gitlab 选择了最后一个命令来命名，叫 Merge Request。
- Github 一般是公开库，当然没有人愿意别人直接在自己的仓库上面修改代码。所以我们如果要给别人的仓库贡献代码，一般是要 fork 一个仓库，在自己的仓库改完后，给原仓库提交 PR 请求，请求原仓库主人把你的代码拉（pull）回去。
- Gitlab 一般是私有库，一个团队维护一个仓库，通常大家会新建自己的分支，开发完成后，请求合并回主干分支。


## monorepo 工作流
- feature branch 功能分支
  - 适用场景：多个独立 app 单独开发
  - 命令较为常用
  - 合并周期长，易冲突
  - 回滚不易，一般是改 bug 上线
  - 发布：dev 分支开发，master 分支上线
- trunk based 小步迭代
  - 适用场景：一个 app 多人开发，如在线文档，班车模式迭代
  - 命令较为不常用
  - 合并周期短，commit 多
  - 回滚成本低
  - 发布：rc 分支测试发版和上线，测试有问题从 master 分支重拉一个。
  - 如果一个大功能被拆分成几个小功能，先后发版怎么办？我们需要加一个独立的开关控制系统，线上的代码通过读取开关配置来决定是否启用新功能，等待所有功能稳定并且上线后再删除相关开关代码

部署：定时部署 || 持续部署
