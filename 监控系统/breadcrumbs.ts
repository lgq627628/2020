// interface BreadcrumbsOptions {
//   console: boolean;
//   dom:
//     | boolean
//     | {
//         serializeAttribute?: string | string[];
//         maxStringLength?: number;
//       };
//   fetch: boolean;
//   history: boolean;
//   sentry: boolean;
//   xhr: boolean;
// }
type InstrumentHandlerType =
  | "console"
  | "dom"
  | "fetch"
  | "history"
  | "sentry"
  | "xhr"
  | "error"
  | "unhandledrejection";

function htmlTreeAsString(elem) {
  try {
    let currentElem = elem;
    const MAX_TRAVERSE_HEIGHT = 5;
    const maxStringLength = 100;
    const out: string[] = [];
    let height = 0;
    let len = 0;
    const separator = " > ";
    const sepLength = separator.length;
    let nextStr;
    // const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
    // const maxStringLength = (!Array.isArray(options) && options.maxStringLength) || DEFAULT_MAX_STRING_LENGTH;

    while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
      nextStr = _htmlElementAsString(currentElem);
      // bail out if
      // - nextStr is the 'html' element
      // - the length of the string that would be created exceeds maxStringLength
      //   (ignore this limit if we are on the first iteration)
      if (
        nextStr === "html" ||
        (height > 1 &&
          len + out.length * sepLength + nextStr.length >= maxStringLength)
      ) {
        break;
      }

      out.push(nextStr);

      len += nextStr.length;
      currentElem = currentElem.parentNode;
    }

    return out.reverse().join(separator);
  } catch (_oO) {
    return "<unknown>";
  }
}
function _htmlElementAsString(el: unknown): string {
  const elem = el as {
    tagName?: string;
    id?: string;
    className?: string;
    getAttribute(key: string): string;
  };

  const out: string[] = [];
  let className;
  let classes;
  let key;
  let attr;
  let i;

  if (!elem || !elem.tagName) {
    return "";
  }

  out.push(elem.tagName.toLowerCase());

  if (elem.id) {
    out.push(`#${elem.id}`);
  }

  className = elem.className || "";
  classes = className.split(/\s+/);
  for (i = 0; i < classes.length; i++) {
    out.push(`.${classes[i]}`);
  }
  const allowedAttrs = ["aria-label", "type", "name", "title", "alt"];
  for (i = 0; i < allowedAttrs.length; i++) {
    key = allowedAttrs[i];
    attr = elem.getAttribute(key);
    if (attr) {
      out.push(`[${key}="${attr}"]`);
    }
  }
  return out.join("");
}
function instrumentConsole() {
  if (!("console" in window)) {
    return;
  }

  ["debug", "info", "warn", "error", "log", "assert", "trace"].forEach(
    (level: string) => {
      if (!(level in window.console)) {
        return;
      }

      const origin = window.console[level];

      window.console[level] = (...args) => {
        _consoleBreadcrumb({ args, level });
        // triggerHandlers("console", { args, level });

        origin && origin.apply(window.console, args);
      };
    }
  );
}
function instrumentFetch() {
  const origin = window.fetch;

  window.fetch = (...args) => {
    console.log("=====", args);
    const [url, options] = args;

    const handlerData = {
      args,
      fetchData: {
        method: options?.method || "GET",
        url,
      },
      startTimestamp: Date.now(),
    };

    _fetchBreadcrumb(handlerData);
    //   triggerHandlers('fetch', {
    //     ...handlerData,
    //   });
    // triggerHandlers("console", { args, level });

    return origin.apply(window.fetch, args).then(
      (response) => {
        _fetchBreadcrumb({
          ...handlerData,
          endTimestamp: Date.now(),
          response,
        });

        // triggerHandlers('fetch', {
        //     ...handlerData,
        //     endTimestamp: Date.now(),
        //     response,
        //   });
        return response;
      },
      (error) => {
        _fetchBreadcrumb({
          ...handlerData,
          endTimestamp: Date.now(),
          error,
        });

        // triggerHandlers('fetch', {
        //     ...handlerData,
        //     endTimestamp: Date.now(),
        //     error,
        //   });
        // NOTE: If you are a Sentry user, and you are seeing this stack frame,
        //       it means the sentry.javascript SDK caught an error invoking your application code.
        //       This is expected behavior and NOT indicative of a bug with sentry.javascript.
        throw error;
      }
    );
  };
}
let lastHref = "";
function instrumentHistory() {
  const origin = window.pushState;

  window.pushState = (...args) => {
    const url = args.length > 2 ? args[2] : undefined;
    if (url) {
      // coerce to string (this is what pushState does)
      const from = lastHref;
      const to = String(url);
      // keep track of the current URL state, as we always receive only the updated state
      lastHref = to;
      _historyBreadcrumb({
        from,
        to,
      });
      //   triggerHandlers("history", {
      //     from,
      //     to,
      //   });
    }
    return origin.apply(this, args);
  };
}
function instrumentDOM() {
  //   window.document.addEventListener("click", globalDOMEventHandler, false);
  //   window.document.addEventListener("keypress", globalDOMEventHandler, false);

  const origin = EventTarget.prototype.addEventListener;

  return function (this, type, listener, options) {
    if (type === "click" || type == "keypress") {
      try {
        const el = this;
        const handlers = (el.__sentry_instrumentation_handlers__ =
          el.__sentry_instrumentation_handlers__ || {});
        const handlerForType = (handlers[type] = handlers[type] || {
          refCount: 0,
        });

        if (!handlerForType.handler) {
          const handler = _domBreadcrumb({
            event: this,
            name: this.type === "keypress" ? "input" : this.type,
            // global: globalListener,
          });
          handlerForType.handler = handler;
          origin.call(this, type, handler, options);
        }

        handlerForType.refCount++;
      } catch (e) {
        // Accessing dom properties is always fragile.
        // Also allows us to skip `addEventListenrs` calls with no proper `this` context.
      }
    }
    return origin.call(this, type, listener, options);
  };
}
function instrument(type: InstrumentHandlerType) {
  if (instrumented[type]) {
    return;
  }

  instrumented[type] = true;

  switch (type) {
    case "console":
      instrumentConsole();
      break;
    case "dom":
      instrumentDOM();
    //   break;
    // case "xhr":
    //   instrumentXHR();
    //   break;
    case "fetch":
      instrumentFetch();
      break;
    case "history":
      instrumentHistory();
      break;
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

const handlers = {};
const instrumented = {};
const queue: any[] = [];

function addInstrumentationHandler(type, cb) {
  handlers[type] = cb;
  //   instrumented[type] = true;
  instrument(type);
}
type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

interface Breadcrumb {
  type?: string;
  level?: SeverityLevel;
  event_id?: string;
  category?: string;
  message?: string;
  data?: { [key: string]: any };
  timestamp?: number;
}
const getTimestamp = () => Date.now() / 1000;
const maxBreadcrumbs = 100;
function addBreadcrumb(breadcrumb: any) {
  const timestamp = getTimestamp();
  const mergedBreadcrumb = { timestamp, ...breadcrumb };
  queue.push(mergedBreadcrumb);
  //   const { scope, client } = this.getStackTop();

  //   if (!client) return;

  //   const timestamp = getTimestamp();
  //   const mergedBreadcrumb = { timestamp, ...breadcrumb };

  //   scope.addBreadcrumb(mergedBreadcrumb, maxBreadcrumbs);
}

function _consoleBreadcrumb(data) {
  const { args, level } = data;
  const breadcrumb = {
    category: "console",
    data: {
      logger: "console",
      arguments: args,
    },
    level,
    message: args.join(" "),
  };

  addBreadcrumb(breadcrumb);
  //   {
  //     input: args,
  //     level: level,
  //   }
}
function _domBreadcrumb(handlerData) {
  let target;

  try {
    const event = handlerData.event;
    target = htmlTreeAsString(event?.target || event);
  } catch (e) {
    target = "<unknown>";
  }

  if (target.length === 0) {
    return;
  }
  const breadcrumb = {
    category: `ui.${handlerData.name}`,
    message: target,
  };

  addBreadcrumb(breadcrumb);
  //   getCurrentHub().addBreadcrumb(
  //     {
  //       category: `ui.${handlerData.name}`,
  //       message: target,
  //     },
  //     {
  //       event: handlerData.event,
  //       name: handlerData.name,
  //       global: handlerData.global,
  //     },
  //   );
}
function _xhrBreadcrumb() {}
function _fetchBreadcrumb(handleData) {
  const { startTimestamp, endTimestamp } = handleData;

  // We only capture complete fetch requests
  if (!endTimestamp) {
    return;
  }

  if (handleData.error) {
    const data = handleData.fetchData;
    const hint = {
      data: data.error,
      input: data.args,
      startTimestamp,
      endTimestamp,
    };
    const breadcrumb = {
      category: "fetch",
      data,
      level: "error",
      type: "http",
    };
    addBreadcrumb(breadcrumb);
  } else {
    const data = {
      ...handleData.fetchData,
      status_code: handleData.response && handleData.response.status,
    };
    const hint = {
      input: data.args,
      response: data.response,
      startTimestamp,
      endTimestamp,
    };
    const breadcrumb = {
      category: "fetch",
      data,
      type: "http",
    };
    addBreadcrumb(breadcrumb);
  }
}
function _historyBreadcrumb(data) {
  const { from, to } = data;
  const breadcrumb = {
    category: "navigation",
    data: {
      from,
      to,
    },
  };

  addBreadcrumb(breadcrumb);
}

function initTrack() {
  addInstrumentationHandler("console", _consoleBreadcrumb);
  addInstrumentationHandler("dom", _domBreadcrumb);
  //   addInstrumentationHandler("xhr", _xhrBreadcrumb);
  addInstrumentationHandler("fetch", _fetchBreadcrumb);
  addInstrumentationHandler("history", _historyBreadcrumb);
}

initTrack();
