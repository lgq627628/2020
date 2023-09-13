"use strict";
exports.__esModule = true;
var events_1 = require("events");
/**
 * 内核
 * 功能1：自身基础功能
 * 功能2：插件调度器
 */
var Core = /** @class */ (function () {
    // presets = [];
    function Core(opts) {
        this.plugins = [];
        this.pluginMap = new Map();
        this.events = new events_1.EventEmitter(); // 也可以叫 hooks，就是发布订阅
        opts === null || opts === void 0 ? void 0 : opts.beforeCreated();
        this.init();
        opts === null || opts === void 0 ? void 0 : opts.afterCreated();
    }
    Core.prototype.init = function () {
        console.log('实现内核基础功能');
    };
    Core.prototype.use = function (plugin) {
        this.plugins.push(plugin);
        this.pluginMap.set(plugin.name, plugin);
        return this;
    };
    Core.prototype.run = function () {
        var _this = this;
        // this.events.emit('执行所有插件前');
        console.log('执行所有插件前');
        this.pluginMap.forEach(function (plugin) {
            plugin.fn(_this);
        });
        console.log('执行所有插件后');
        // this.events.emit('执行所有插件后');
    };
    return Core;
}());
var Plugin1 = /** @class */ (function () {
    function Plugin1(options) {
        if (options === void 0) { options = {}; }
        this.name = 'Plugin1';
        this.options = options;
    }
    Plugin1.prototype.fn = function (ctx) {
        console.log('执行第一个插件');
    };
    Plugin1.prototype.destory = function () { };
    return Plugin1;
}());
var Plugin2 = /** @class */ (function () {
    function Plugin2(options) {
        if (options === void 0) { options = {}; }
        this.name = 'Plugin2';
        this.options = options;
    }
    Plugin2.prototype.fn = function (ctx) {
        console.log('执行第二个插件');
    };
    Plugin2.prototype.destory = function () { };
    return Plugin2;
}());
var core = new Core();
core.use(new Plugin1());
core.use(new Plugin2());
core.run();
