/**
 *@author:
 *cyhello（cyhello@gmail.com）
 *seven (remember2015@gmail.com)
 *rank（ranklau@gmail.com）
 */
(function(){
  /**
   * @method	_marmotGetParam
   * 获取url参数
   */
  var _marmot_js_href = null;
  function _marmotGetParam(param) {
    if (!_marmot_js_href) {
      var js = document.getElementsByTagName('script');
      for (var i = 0, len = js.lenth; i < len; i++) {
        if (js[i].getAttribute('marmot') == 'true') {
          _marmot_js_href = js[i].src;
          break;
        }
      }
      if (!_marmot_js_href)
        _marmot_js_href = js[js.length - 1].src;
    }
    var match = _marmot_js_href.match(new RegExp(param+'=([^\?\#\&\=]*)','i'));
    if (match) return match[1];
    return null;
  }
  /**
   * 处理采样率
   */
  var _ratio = _marmotGetParam('ratio');
  if(_ratio !== null) {
    var _rnd = _ratio * Math.random();
    if (_rnd > 1) return;
  }

  /**
   * @class	Marmot
   * Marmot静态类
   */
  window.Marmot = Marmot = {
    _pageID: _marmotGetParam('id'),
    //用户行为数据的真实容器，储存数据
    _logData: [],
    //采样网格边长
    _grid: 7,
    _align: _marmotGetParam('align') || 'middle',
    //最大采集数据量，达到此数据量，自动提交
    _maxEvt: 50,
    //上一个事件，用于处理表单域的点击自动触发focus事件情况
    _preEvt: {t:'f',path:[]},
    //refer的最大长度
    _maxRef: 100,
    //log发送地址
    _logUrl: "http://www.marmotu.com/resource/marmot.gif",

    //获取页面大小
    _getPageWidth: function () {
      var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

      return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
    },
    //log函数
    log: function(arg) {

      //数据量达到最大值，自动提交
      if (Marmot._logData.length >= Marmot._maxEvt) {
        Marmot.pushLog();
        Marmot.pushLog = function(){};
        return ;
      }
      //数据点进行网格装换
      if (arg.x != '') {
        var midLine = (Marmot._align == 'middle') ? parseInt(Marmot._getPageWidth() / 2) : 0;
        arg.x = arg.x - midLine != 0 ? arg.x - midLine : 1;
        arg.x = parseInt(arg.x / Marmot._grid) * Marmot._grid + (arg.x / Math.abs(arg.x)) * (parseInt(Marmot._grid / 2) + 1);
        arg.y = parseInt(arg.y / Marmot._grid) * Marmot._grid + (parseInt(Marmot._grid / 2) + 1);
      }
      //console.log(Marmot._preEvt.t, arg.t, Marmot._preEvt.path.join(''), arg.path.join(''))
      //处理表单域的点击事件与focus事件重复
      if (arg.t == 'c' && Marmot._preEvt !== null && Marmot._preEvt.t == 'f' && arg.path.join('') == Marmot._preEvt.path.join('')) {
        //console.log('pop')
        Marmot._logData.pop();
      }
      Marmot._logData.push(arg.x + '*' + arg.y + '*' + arg.path.join(''));
      Marmot._preEvt = arg;
    },
    stop: function() {
      Marmot.pushLog = function(){};
    },
    //将用户点击数据发送到服务端
    pushLog: function() {
      var data = Marmot._logData.join('!');
      var refer = document.referrer;
      if (refer.length > 100) {
        refer = refer.split('?')[0];
      }
      var img= document.createElement('img');
      img.src = Marmot._logUrl + '?mid=' + encodeURIComponent(this._pageID) + '&data=' + data + '&ref=' + encodeURIComponent(refer.substr(0, this._maxRef)) + '&px=' + window.screen.width + '*' + window.screen.height;
      document.body.appendChild(img);
    },
    //开启数据检测功能，捕获用户行为
    inspect: function() {
      //返回事件的target
      function getTarget(e) {
        return e.target || e.srcElement;
      };
      //返回事件对象
      function getEvent(event, element) {
        if (event) {
          return event;
        } else if (element) {
          if (element.document) return element.document.parentWindow.event;
          if (element.parentWindow) return element.parentWindow.event;
        }
        return window.event || null;
      };
      //侦听事件
      var listen = function () {
        if (document.addEventListener) {
          return function (element, name, handler) {
            element.addEventListener(name, handler, true);
          };
        } else if (document.attachEvent) {
          return function (element, name, handler) {
            element.attachEvent('on' + name, handler);
          };
        }
      }();
      function getDoc(evt) {
        var target = getTarget(evt), doc = document;
        if (target) {
          doc = target.document || target.ownerDocument || (target.window || target.defaultView) && target || document;
        }
        return doc;
      };
      //返回事件的触发坐标
      function getXY(evt) {
        var e = evt, doc = getDoc(evt);
        var x = ('pageX' in e) ? e.pageX : (e.clientX + (doc.documentElement.scrollLeft || doc.body.scrollLeft) - 2);
        var y = ('pageY' in e) ? e.pageY : (e.clientY + (doc.documentElement.scrollTop || doc.body.scrollTop) - 2);
        return {
          x: x,
          y: y
        }
      };
      //返回元素的绝对坐标
      function getPos(el) {
        var x = el.offsetTop;
        var y = el.offsetLeft;
        while (el = el.offsetParent) {
          x += el.offsetTop;
          y += el.offsetLeft;
        }
        return {
          x: x,
          y: y
        };
      };
      try {
        listen(document, 'mousedown', function(e) {
          var evt = getEvent(e, this);
          var target = getTarget(evt);
          var path = Marmot.getPath(target);
          var pos = getXY(evt);
          // debugger
          Marmot.log({
            x: pos.x,
            y: pos.y,
            path: path,
            t: 'c'
          })
        });
        listen(document, 'focus', function(e) {
          var evt = getEvent(e, this);
          var target = getTarget(evt);
          if (target.tagName) {
            var tag = target.tagName.toUpperCase();
            if (tag == 'INPUT' || tag == 'TEXTAREA' || tag == 'BUTTON' || tag == 'SELECT' || tag == 'OBJECT' || tag == 'EMBED') {
              var path = Marmot.getPath(target);
              var pos = getPos(target);
              Marmot.log({
                x: pos.x,
                y: pos.y,
                path: path,
                t: 'f'
              })
            } else {
              return;
            }
          }
        });
        listen(window, 'beforeunload', function(e) {
          Marmot.pushLog();
        });
      } catch(e) {};
    },
    //返回元素的MDP路径
    getPath: function(node, path) {
      path = path || [];
      if (node == document.body || (node.tagName && node.tagName.toUpperCase() == "HTML")) {
        return path;
      };
      if (node.getAttribute && node.getAttribute('id') != '' && node.getAttribute('id') != null) {
        path.push(node.nodeName.toLowerCase() + '.' + node.getAttribute('id'));
        return path;
      };
      if (node.parentNode && node.parentNode.tagName.toUpperCase() !="BODY") {
        path = Marmot.getPath(node.parentNode, path);
      }
      if(node.previousSibling) {
        var count = 1;
        var sibling = node.previousSibling
        do {
          //if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
          if(sibling.nodeType == 1 && sibling.nodeName == node.nodeName) {
            count++;
          }
          sibling = sibling.previousSibling;
        } while(sibling);
      }
      if(node.nodeType == 1) {
        path.push('~' + (count > 1 ? count : 1) + node.nodeName.toLowerCase());
      }
      return path;
    }
  }

  /**
   * 启动Marmot
   */
  Marmot.inspect();
})();
