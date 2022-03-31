"use strict";

var _class;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function doSth(target) {
    target.aa = 1;
    return target;
}

var Hello = doSth(_class = function Hello() {
    _classCallCheck(this, Hello);
}) || _class;

console.log(Hello.aa);

