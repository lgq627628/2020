var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function instrumentConsole() {
    if (!("console" in window)) {
        return;
    }
    ["debug", "info", "warn", "error", "log", "assert", "trace"].forEach(function (level) {
        if (!(level in window.console)) {
            return;
        }
        var origin = window.console[level];
        window.console[level] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _consoleBreadcrumb({ args: args, level: level });
            // triggerHandlers("console", { args, level });
            origin && origin.apply(window.console, args);
        };
    });
}
function instrumentFetch() {
    var origin = window.fetch;
    window.fetch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log('=====', args);
        var url = args[0], options = args[1];
        var handlerData = {
            args: args,
            fetchData: {
                method: (options === null || options === void 0 ? void 0 : options.method) || 'GET',
                url: url
            },
            startTimestamp: Date.now()
        };
        _fetchBreadcrumb(handlerData);
        //   triggerHandlers('fetch', {
        //     ...handlerData,
        //   });
        // triggerHandlers("console", { args, level });
        return origin.apply(window.fetch, args).then(function (response) {
            _fetchBreadcrumb(__assign(__assign({}, handlerData), { endTimestamp: Date.now(), response: response }));
            // triggerHandlers('fetch', {
            //     ...handlerData,
            //     endTimestamp: Date.now(),
            //     response,
            //   });
            return response;
        }, function (error) {
            _fetchBreadcrumb(__assign(__assign({}, handlerData), { endTimestamp: Date.now(), error: error }));
            // triggerHandlers('fetch', {
            //     ...handlerData,
            //     endTimestamp: Date.now(),
            //     error,
            //   });
            // NOTE: If you are a Sentry user, and you are seeing this stack frame,
            //       it means the sentry.javascript SDK caught an error invoking your application code.
            //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
            throw error;
        });
    };
}
function instrument(type) {
    if (instrumented[type]) {
        return;
    }
    instrumented[type] = true;
    switch (type) {
        case "console":
            instrumentConsole();
            break;
        // case "dom":
        //   instrumentDOM();
        //   break;
        // case "xhr":
        //   instrumentXHR();
        //   break;
        case "fetch":
            instrumentFetch();
            break;
        // case "history":
        //   instrumentHistory();
        //   break;
        // case "error":
        //   instrumentError();
        //   break;
        // case "unhandledrejection":
        //   instrumentUnhandledRejection();
        //   break;
        default:
            // __DEBUG_BUILD__ && logger.warn('unknown instrumentation type:', type);
            return;
    }
}
var handlers = {};
var instrumented = {};
var queue = [];
function addInstrumentationHandler(type, cb) {
    handlers[type] = cb;
    //   instrumented[type] = true;
    instrument(type);
}
var getTimestamp = function () { return Date.now() / 1000; };
var maxBreadcrumbs = 100;
function addBreadcrumb(breadcrumb) {
    var timestamp = getTimestamp();
    var mergedBreadcrumb = __assign({ timestamp: timestamp }, breadcrumb);
    queue.push(mergedBreadcrumb);
    //   const { scope, client } = this.getStackTop();
    //   if (!client) return;
    //   const timestamp = getTimestamp();
    //   const mergedBreadcrumb = { timestamp, ...breadcrumb };
    //   scope.addBreadcrumb(mergedBreadcrumb, maxBreadcrumbs);
}
function _consoleBreadcrumb(data) {
    var args = data.args, level = data.level;
    var breadcrumb = {
        category: "console",
        data: {
            logger: "console",
            arguments: args
        },
        level: level,
        message: args.join(" ")
    };
    addBreadcrumb(breadcrumb);
    //   {
    //     input: args,
    //     level: level,
    //   }
}
function _domBreadcrumb() { }
function _xhrBreadcrumb() { }
function _fetchBreadcrumb(handleData) {
    var startTimestamp = handleData.startTimestamp, endTimestamp = handleData.endTimestamp;
    // We only capture complete fetch requests
    if (!endTimestamp) {
        return;
    }
    if (handleData.error) {
        var data = handleData.fetchData;
        var hint = {
            data: data.error,
            input: data.args,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp
        };
        var breadcrumb = {
            category: "fetch",
            data: data,
            level: "error",
            type: "http"
        };
        addBreadcrumb(breadcrumb);
    }
    else {
        var data = __assign(__assign({}, handleData.fetchData), { status_code: handleData.response && handleData.response.status });
        var hint = {
            input: data.args,
            response: data.response,
            startTimestamp: startTimestamp,
            endTimestamp: endTimestamp
        };
        var breadcrumb = {
            category: "fetch",
            data: data,
            type: "http"
        };
        addBreadcrumb(breadcrumb);
    }
}
function _historyBreadcrumb() { }
function initTrack() {
    addInstrumentationHandler("console", _consoleBreadcrumb);
    //   addInstrumentationHandler("dom", _domBreadcrumb(this.options.dom));
    //   addInstrumentationHandler("xhr", _xhrBreadcrumb);
    addInstrumentationHandler("fetch", _fetchBreadcrumb);
    addInstrumentationHandler("history", _historyBreadcrumb);
}
initTrack();
