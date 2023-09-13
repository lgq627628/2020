import { EventEmitter } from 'events';

interface IPlugin {
    /** 插件名字 */
    name: string;
    /** fn 通常也可以叫 apply、exec、handle 等；ctx 是内核的上下文环境 */
    fn(ctx: Core): void;
    destory(): void;
}

/** 内核 Core ：基础功能 + 插件调度器 */
class Core {
    options: Record<string, any> = {};
    plugins: IPlugin[] = [];
    pluginMap: Map<string, IPlugin> = new Map();
    events: EventEmitter = new EventEmitter(); // 也可以叫 hooks，就是发布订阅
    constructor(options = {}) {
        this.options = options;
        // 还可以在这里搞一些环境变量、全局变量，比如 this.global = { platform: 'web', isDev: true }
    }
    init() {
        this.options.beforeCreated && this.options.beforeCreated();
        console.log('实现内核基础功能：文档初始化');
        this.options.afterCreated && this.options.afterCreated();
    }
    /** 插件注册，也可以叫 register，通常以注册表的形式实现，其实就是个对象映射 */
    use(plugin: IPlugin): Core {
        this.plugins.push(plugin);
        this.pluginMap.set(plugin.name, plugin);
        return this;
    }
    /** 插件执行，也可以叫 start、exec */
    run() {
        this.events.emit('beforeAllPlugin');
        this.pluginMap.forEach(plugin => {
            plugin.fn(this);
        });
        this.events.emit('afterAllPlugin');
    }
}

class Plugin1 implements IPlugin {
    name = 'Block1';
    options: Record<string, any>;
    constructor(options = {}) { // 插件也可以有自己的参数
        this.options = options;
    }
    fn(ctx: Core) {
        console.log('扩展文档功能：Block1');
    }
    destory() { } // 插件销毁时可以做点什么
}
class Plugin2 implements IPlugin {
    name = 'Block2';
    options: Record<string, any>;
    constructor(options = {}) {
        this.options = options;
    }
    fn(ctx: Core) {
        console.log('扩展文档功能：Block2');
    }
    destory() { } // 插件销毁时可以做点什么
}

const core = new Core();
core.use(new Plugin1());
core.use(new Plugin2());

core.run();
core.init();