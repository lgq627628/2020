// 设计前后端通用库的时候
(function() {
    const root = this;
    const _ = function() {}
    if (module && module.exports && exports) { // 如果是 node
        exports._ = _;
    } else if (define && define.amd) { // amd 规范
        define('underscore', function() {
            return _;
        })
    } else { // 如果是浏览器中
        root['_'] = _;
    }
}).call(this)