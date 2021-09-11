// 禁止打开控制台，写死循环
(() => {
    function block() {
        if (
            window.outerHeight - window.innerHeight > 200 ||
            window.outerWidth - window.innerWidth > 200
        ) {
            document.body.innerHTML =
                "检测到非法调试,请关闭后刷新重试!";
        }
        setInterval(() => {
            (function () {
                return false;
            }
                ["constructor"]("debugger")
                ["call"]());
        }, 50);
    }
    try {
        block();
    } catch (err) {}
})();
