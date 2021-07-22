export class FetchMonitor implements IMonitor {
    public name: string = 'FetchMonitor';
    private _callback;
  
    public setup = callback => {
      if (!supportsFetch()) {
        return;
      }
      this._callback = callback;
      this._start();
    };
  
    private _start = () => {
      if (!supportsFetch()) {
        return;
      }
      this._hookFetch();
    };
  
    private _hookFetch = () => {
      const _this = this;
      const _fetch = window.fetch;
  
      const wrapFetch: any = (req: RequestInfo, options?: RequestInit) => {
        options = options || {};
        const start: number = Date.now();
        let params = {
          ev_type: 'ajax'
        } as ISendParams;
  
        const url: string = this._getFetchUrl(req);
        const method: string = this._getFetchMethod(req);
        params.ax_type = (options.method || method).toLowerCase();
        params = {
          ...params,
          ...getAjaxUrlParams(url)
        };
  
        return _fetch(req, options).then(
          // 成功
          res => {
            params.ax_status = (res.status || 0).toString();
            params.ax_duration = Date.now() - start;
            params.ax_response_header = _this._getAllResponseHeaders(res);
            params.ax_request_header = _this._getFetchHeaders(req, options);
  
            if (
              res.headers &&
              isFunction(res.headers.has) &&
              res.headers.has('content-length')
            ) {
              params.ax_size = Number(res.headers.get('content-length')) || 0;
            } else {
              params.ax_size = 0;
            }
  
            if (isFunction(_this._callback)) {
              _this._callback({
                name: _this.name,
                type: 'get',
                event: params
              });
            }
  
            return res;
          },
          // 失败
          res => {
            // 请求失败,或被拦截
            params.ax_status = '0';
            params.ax_size = 0;
            params.ax_duration = Date.now() - start;
  
            if (isFunction(_this._callback)) {
              _this._callback({
                name: _this.name,
                type: 'get',
                event: params
              });
            }
            return Promise.reject(res);
          }
        );
      };
      window.fetch = wrapFetch;
    };
  
    private _getFetchUrl = (req: Request | string) => {
      let url = '';
      if (req instanceof Request) {
        url = req.url;
      } else {
        url = req;
      }
      url = isString(url) ? url.split('?')[0] : url;
      return url;
    };
  
    private _getFetchMethod = (req: Request | string) => {
      let method = 'get';
      if (req instanceof Request) {
        method = req.method;
      }
      return method;
    };
  
    private _getFetchHeaders = (req: Request | string, options?: RequestInit) => {
      let headers = '';
      if (req instanceof Request) {
        headers = this._getAllResponseHeaders(req);
        return headers;
      }
  
      if (options && options.headers) {
        if (options.headers instanceof Headers) {
          headers = this._getAllResponseHeaders(options);
          return headers;
        }
  
        if (options.headers instanceof Array) {
          headers = formatHttpHeaders(options.headers);
          return headers;
        }
  
        if (options.headers instanceof Object) {
          const _headers = [] as string[][];
          for (const _header in options.headers) {
            if (Object.prototype.hasOwnProperty.call(options.headers, _header)) {
              _headers.push([_header, options.headers[_header]]);
            }
          }
  
          headers = formatHttpHeaders(_headers);
          return headers;
        }
      }
  
      return headers;
    };
  
    private _getAllResponseHeaders = res => {
      if (!res || !res.headers || typeof res.headers.forEach !== 'function') {
        return '';
      }
  
      const _headers: string[][] = [];
  
      res.headers.forEach((value: string, key: string) => {
        _headers.push([key, value]);
      });
      return formatHttpHeaders(_headers);
    };
  }
  