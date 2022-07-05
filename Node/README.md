## node 执行流程

1. Node 源码有一坨依赖，大部分是 C/C++ 底层
2. Node 启动入口是 node_main.cc 的 main 函数
3. 入口函数找到 node.cc 的 3 个 Start，依次调用
4. node.cc 的第一个 Start 初始化了 v8，调用第二个 Start
5. 第二个 Start 让 v8 准备了引擎实例，调用第三个 Start
6. 第三个 Start
    6.1 首先准备了 v8 的上下文 Context
    6.2 其次准备了 Node 的启动环境，对各种需要的变量做整理
    6.3 再把 Node 原生模块和我们的 JS 代码都加载进来运行
    6.4 最后把主持人 libuv 请上场，执行 JS 里的各种任务
7. libuv 没活干了，就一层层来退出进程、收拾场地，退出程序

## 参考文章
- https://github.com/theanarkh/understand-nodejs
- https://zhuanlan.zhihu.com/p/375276722