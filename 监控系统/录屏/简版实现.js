(function(global) {
  const ACTION_TYPE_ATTRIBUTE = 1;    //动作类型 修改元素属性

  /**
   * dom和actions可JSON.stringify()序列化后传递到后台
   */
  function JSVideo() {
      this.id = 1;
      this.idMap = new Map();         //唯一标识和元素之间的映射
      this.dom = this.serialization(document.documentElement);
      console.log("序列化", this.dom);
      console.log("map", this.idMap);
      this.actions = [];              //动作日志
      this.observer();
      this.observerInput();
  }
  JSVideo.prototype = {
      /**
       * DOM序列化
       */
      serialization(parent) {
          let element = this.parseElement(parent);
          if(parent.children.length == 0) {
              parent.textContent && (element.textContent = parent.textContent);
              return element;
          }
          Array.from(parent.children, child => {
              element.children.push(this.serialization(child));
          });
          return element;
      },
      /**
       * 将元素解析成可序列化的对象
       */
      parseElement(element, id) {
          let attributes = {};
          for (const { name, value } of Array.from(element.attributes)) {
              attributes[name] = value;
          }
          if(!id) {   //解析新元素才做映射
              id = this.getID();
              this.idMap.set(element, id);    //元素为键，ID为值
          }
          return {
              children: [],
              id: id,
              tagName: element.tagName.toLowerCase(),
              attributes: attributes
          };
      },
      /**
       * DOM反序列化
       */
      deserialization(obj) {
          let element = this.createElement(obj);
          if(obj.children.length == 0) {
              return element;
          }
          obj.children.forEach(child => {
              element.appendChild(this.deserialization(child));
          });
          return element;
      },
      /**
       * 将对象解析成元素
       */
      createElement(obj) {
          let element = document.createElement(obj.tagName);
          if(obj.id) {
              this.idMap.set(obj.id, element);        //ID为键，元素为值
          }
          for (const name in obj.attributes) {
              element.setAttribute(name, obj.attributes[name]);
          }
          obj.textContent && (element.textContent = obj.textContent);
          return element;
      },
      /**
       * 唯一标识
       */
      getID() {
          return this.id++;
      },
      /**
       * 序列化后的DOM
       */
      getDOM() {
          return this.dom;
      },
      /**
       * 监控元素变化
       */
      observer() {
          const ob = new MutationObserver(mutations => {
              console.log(mutations);
              mutations.forEach(mutation => {
                  const { type, target, oldValue, attributeName} = mutation;
                  switch (type) {
                      case 'attributes':
                          const value = target.getAttribute(attributeName);
                          console.log("attributes", value);
                          this.setAttributeAction(target);
                  }
              });
          });
          ob.observe(document, {
              attributes: true,           //监控目标属性的改变
              attributeOldValue: true,    //记录改变前的目标属性值
              subtree: true,              //目标以及目标的后代改变都会监控
              //characterData: true,        //监控目标数据的改变
              //characterDataOldValue: true,
              //childList: true,
          });
          //ob.disconnect();
      },
      /**
       * 监控文本框的变化
       */
      observerInput() {
          const original = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value"),
              _this = this;
          //监控通过代码更新的value属性
          Object.defineProperty(HTMLInputElement.prototype, "value", {
                  set(value) {
                      console.log("defineProperty", value);
                      setTimeout(() => {
                          _this.setAttributeAction(this);     //异步调用，避免阻塞页面
                      }, 0);
                      original.set.call(this, value);         //执行原来的set逻辑
                  }
              }
          );
          //捕获input事件
          document.addEventListener("input", (event) => {
              const { target } = event;
              let text = target.value;
              console.log("input", text);
              this.setAttributeAction(target);
          }, {
              capture: true      //捕获
          });
      },
      /**
       * 配置修改属性的动作
       */
      setAttributeAction(element) {
          let attributes = {
              type: ACTION_TYPE_ATTRIBUTE
          };
          element.value && (attributes.value = element.value);
          this.setAction(element, attributes);
      },
      /**
       * 配置修改动作
       */
      setAction(element, otherParam = {}) {
          //由于element是对象，因此Map中的key会自动更新
          const id = this.idMap.get(element);
          console.log("idMap", id, element);
          const action = Object.assign(
              this.parseElement(element, id),
              { timestamp: Date.now() },
              otherParam
          );
          this.actions.push(action);
          console.log("actions", this.actions);
      },
      getActions() {
          return this.actions;
      },
      /**
       * 回放
       */
      replay() {
          if(this.actions.length == 0)
              return;
          console.log("new idMap", this.idMap, this.actions);
          const timeOffset = 16.7;                    //一帧的时间间隔大概为16.7ms
          let startTime = this.actions[0].timestamp;  //开始时间戳
          const state = () => {
              const action = this.actions[0];
              let element = this.idMap.get(action.id);
              if(!element) {      //取不到的元素直接停止动画
                  return;
              }
              //console.log("state action", action, this.actions.length);
              if(startTime >= action.timestamp) {
                  this.actions.shift();
                  switch (action.type) {
                      case ACTION_TYPE_ATTRIBUTE:
                          console.log("replay", action.id, element);
                          for (const name in action.attributes) {             //更新属性
                              element.setAttribute(name, action.attributes[name]);
                          }
                          //触发defineProperty拦截，拆分成两个插件会避免该问题
                          action.value && (element.value = action.value);
                          break;
                  }
              }
              startTime += timeOffset;        //最大程度的模拟真实的时间差
              console.log(this.actions.length, action.id, startTime);
              if(this.actions.length > 0)     //当还有动作时，继续调用requestAnimationFrame()
                  requestAnimationFrame(state);
          };
          state();
      },
      /**
       * 创建iframe还原页面
       */
      createIframe() {
          let iframe = document.createElement("iframe");
          iframe.setAttribute('sandbox', 'allow-same-origin');
          iframe.setAttribute('scrolling', 'no');
          iframe.setAttribute('style', 'pointer-events:none; border:0;');
          iframe.width = `${window.innerWidth}px`;
          iframe.height = `${document.documentElement.scrollHeight}px`;
          iframe.onload = () => {
              const doc = iframe.contentDocument,
                  root = doc.documentElement,
                  html = this.deserialization(this.dom);      //反序列化
              //根元素属性附加
              for (const { name, value } of Array.from(html.attributes)) {
                  root.setAttribute(name, value);
              }
              root.removeChild(root.firstElementChild);       //移除head
              root.removeChild(root.firstElementChild);       //移除body
              Array.from(html.children).forEach(child => {
                  root.appendChild(child);
              });
              //加个定时器只是为了查看方便
              setTimeout(() => {
                  this.replay();
              }, 5000);
          };
          document.body.appendChild(iframe);
      }
  };
  global.JSVideo = JSVideo;
})(window);

const video = new JSVideo();