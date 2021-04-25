(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var perf = {
    init: cb => {
      if (cb) cb(); // 过滤无效数据；

      function filterTime(a, b) {
        return a > 0 && b > 0 && a - b >= 0 ? a - b : undefined;
      }

      let Util = {
        getPerfData: timing => {
          let data = {
            // 网络建连，找运维
            pervPage: filterTime(timing.fetchStart, timing.navigationStart),
            // 上一个页面
            redirect: filterTime(timing.responseEnd, timing.redirectStart),
            // 页面重定向时间
            dns: filterTime(timing.domainLookupEnd, timing.domainLookupStart),
            // DNS查找时间
            connect: filterTime(timing.connectEnd, timing.connectStart),
            // TCP建连时间
            network: filterTime(timing.connectEnd, timing.navigationStart),
            // 网络总耗时
            // 网络接收，找运维和后端
            send: filterTime(timing.responseStart, timing.requestStart),
            // 前端从发送到接收到后端第一个返回
            receive: filterTime(timing.responseEnd, timing.responseStart),
            // 接受页面时间
            request: filterTime(timing.responseEnd, timing.requestStart),
            // 请求页面总时间
            // 前端渲染
            dom: filterTime(timing.domComplete, timing.domLoading),
            // dom解析时间
            loadEvent: filterTime(timing.loadEventEnd, timing.loadEventStart),
            // loadEvent时间   可能有问题
            frontend: filterTime(timing.loadEventEnd, timing.domLoading),
            // 前端总时间   可能有问题
            // 关键阶段
            load: filterTime(timing.loadEventEnd, timing.navigationStart),
            // 页面完全加载总时间   可能有问题
            domReady: filterTime(timing.domContentLoadedEventStart, timing.navigationStart),
            // dom准备时间
            interactive: filterTime(timing.domInteractive, timing.navigationStart),
            // 可操作时间
            ttfb: filterTime(timing.responseStart, timing.navigationStart) // 首字节时间

          };
          return data;
        }
      };
      let performance = window.performance;
      window.addEventListener('load', () => {
        setTimeout(() => {
          let data = Util.getPerfData(performance.timing);
          console.log(data);
        }, 0); // 会出现负值，对应可能有问题; 因为我们在load事件中写的，此时loadEventEnd会出问题为0<DOMContentLoaded，DOMContentLoaded也是一样的道理
      });
    }
  };

  var errCatch = {
    init: cb => {
      cb();
    }
  };

  console.log('222222');
  perf.init();
  errCatch.init(() => console.log('66666'));

}));
//# sourceMappingURL=bundle.umd.js.map
