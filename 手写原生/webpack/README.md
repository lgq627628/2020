## webpack 流程

- compiler 项目实例，webpack 编译器实体，只在项目启动时创建一次
- compilation 编译产物，随着输入源的改变而更新
- ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c897d8015834f588c2036b4c9c14ff9~tplv-k3u1fbpfcp-watermark.image?)
- ![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03a6af950bce40889bf9d7a3d9f93554~tplv-k3u1fbpfcp-watermark.image?)
- 先执行 loader 再执行 plugin；但是 plugin 装载的时候很早
- 通过 hooks 可以看出 webpakc 的生命周期（通过compiler hooks可以窥得,plugin的装载其实时机很靠前，只是plugin的执行稍晚，于 loader之后。）