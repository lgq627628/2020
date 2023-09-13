# 极速搭建npm私有仓库

## 为什么要搭建 npm 私有仓库
- 安全性：把公用组件放到私有npm库中，只有内网可以访问，这样可以避免敏感代码泄露；
- 下载速度：使用内部的地址，能够在开发下载 npm 包的同时，将包和其依赖包缓存到 npm 私有仓库服务器中，从而使后续的下载速度更快；

## npm 私有仓库的原理
![npm私有仓库原理图]('./npm私有仓库原理.jpg')

- 用户通过 install 向私有 npm 发起请求，
- 服务器首先会查询所请求的这个模块是否是我们自己的私有模块或已经缓存过的公共模块，
- 如果是则直接返回给用户
- 如果请求的是一个还没有被缓存的公共模块，那么则会向上游源请求模块并进行缓存后返回给用户。
- 上游的源可以是 npm 官方源，也可以是淘宝镜像源。


## npm 私有仓库框架选型
- Nexus: **[https://www.sonatype.com/nexus-repository-oss](https://www.sonatype.com/nexus-repository-oss)**
- cnpm: **[https://cnpmjs.org](https://cnpmjs.org/)**
- Verdaccio: **[https://verdaccio.org](https://verdaccio.org/)**


## Verdaccio介绍
> Verdaccio 是一个 Node.js 创建的轻量的私有 npm proxy registry。具有**零配置/轻量化**的特性，不需要额外配置数据库，它的内部自带小型的数据库。

- 基于 Node.js 的网页应用程序
- 私有 npm registry
- 本地网络 proxy
- 可插入式应用程序
- 易安装和使用
- 提供 Docker 和 Kubernetes 支持
- 与 yarn, npm 100% 兼容


## 具体步骤
- 在自己服务器上安装 nvm、nrm、pm2、node
- 安装 Verdaccio，并修改其中配置（上游镜像源、对外暴露的端口、需要改下防火墙以支持端口访问）
- pm2 start verdaccio
- 一开始没有账户，需要 npm login，也没有包所以可以 npm publish 自己的包
- 实际开发用 nrm 将 npm 源切换到自己的服务器，之后一切操作正常


## 代码没变，npm 安装或运行老是出问题
- 重新打开运行
- 切换 node 版本
- 修改安装包版本


## pnpm
- 相同包不同版本只会保存不同的文件。pnpm 自身有索引系统并重命名
- 软链加硬链：不是所有磁盘能建立硬链的，跨磁盘就不行，比如机械硬盘和固态硬盘、mac 就不会，没有磁盘区分
- pnpm store path
- pnpm 里面的硬链接越来越多怎么办？怎么清空？pnpm store prune 这个命令可以清除未被引用的包

- 幻影依赖
- 单例模式