/** 内核 Core ：基础功能 + 插件调度器 */
var Core = /** @class */ (function () {
    function Core() {
        this.pluginMap = new Map();
        console.log('实现内核基础功能：文档初始化');
    }
    /** 插件注册，也可以叫 register，通常以注册表的形式实现，其实就是个对象映射 */
    Core.prototype.use = function (plugin) {
        this.pluginMap.set(plugin.name, plugin);
        return this; // 方便链式调用
    };
    /** 插件执行 */
    Core.prototype.run = function () {
        this.pluginMap.forEach(function (plugin) {
            plugin.fn();
        });
    };
    return Core;
}());
var Plugin1 = /** @class */ (function () {
    function Plugin1() {
        this.name = 'Block1';
    }
    Plugin1.prototype.fn = function () {
        console.log('扩展文档功能：Block1');
    };
    return Plugin1;
}());
var Plugin2 = /** @class */ (function () {
    function Plugin2() {
        this.name = 'Block2';
    }
    Plugin2.prototype.fn = function () {
        console.log('扩展文档功能：Block2');
    };
    return Plugin2;
}());
var core = new Core();
core.use(new Plugin1());
core.use(new Plugin2());
core.run();
