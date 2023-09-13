// interface IPlugin {
//     /** 插件名字 */
//     name: string;
//     /** 插件能力，通常是个函数，也可以叫 apply、exec、handle */
//     fn: Function;
// }


// /** 内核 Core ：基础功能 + 插件调度器 */
// class Core {
//     pluginMap: Map<string, IPlugin> = new Map();
//     constructor() {
//         console.log('实现内核基础功能：文档初始化');
//     }
//     /** 插件注册，也可以叫 register，通常以注册表的形式实现，其实就是个对象映射 */
//     use(plugin: IPlugin): Core {
//         this.pluginMap.set(plugin.name, plugin);
//         return this; // 方便链式调用
//     }
//     /** 插件执行，也可以叫 start、exec */
//     run() {
//         this.pluginMap.forEach(plugin => {
//             plugin.fn();
//         });
//     }
// }
// class Plugin1 implements IPlugin {
//     name = 'Block1';
//     fn() {
//         console.log('扩展文档功能：Block1');
//     }
// }
// class Plugin2 implements IPlugin {
//     name = 'Block2';
//     fn() {
//         console.log('扩展文档功能：Block2');
//     }
// }

// const core = new Core();
// core.use(new Plugin1());
// core.use(new Plugin2());
// core.run();