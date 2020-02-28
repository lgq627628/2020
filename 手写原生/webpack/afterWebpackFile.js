// 这是 webpack 打包之后的文件，最简版

(function(modules) {

	function __webpack_require__(moduleId) { // 传入的是模块名字，这其实就是 require 方法
		var module = {
			exports: {}
		};
		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
		return module.exports;
	}

	return __webpack_require__("./src/index.js");
})
({ // 这就是个模块对象 map，左边为路径，右边为函数
  "./src/index.js": (function(module, exports) {
    eval("\r\nconsole.log('0000')\n\n\n//# sourceURL=webpack:///./src/index.js?");})
});
