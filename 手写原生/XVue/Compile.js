// 遍历模板 => 处理里面的插值表达式 + 处理 v- 和 @ 开头等指令
class Compile {
  constructor(el, vm) {
    this.$vm = vm
    this.$el = this.isHtmlNode(el) ? el : document.querySelector(el)
    if (!this.$el) return

    // 1、把 $el 里面的内容搬到 fragment 里面，提升效率
    let fragment = this.node2Fragment(this.$el)
    // 2、编译 fragment
    this.compile(fragment)
    // 3、将编译结果追加到宿主中
    this.$el.appendChild(fragment)
    fragment = null // 释放内存
  }

  // 核心方法
  node2Fragment(el) {
    // 因为文档片段存在于内存中，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）
    let fragment = document.createDocumentFragment()
    let firstChild
    while (firstChild = el.firstChild) { // 这个是移动操作，一个节点只能有一个父亲
      fragment.appendChild(firstChild)
    }
    return fragment
  }
  compile(el) {
    [...el.childNodes].forEach(child => {
      if (this.isHtmlNode(child)) { // 如果是元素节点
        this.compileElement(child)
        child.childNodes && child.childNodes.length && this.compile(child) // 元素节点才需要递归
      } else if (this.isTextNode(child)) { // 如果是文本节点
        this.compileText(child)
      }
    })
  }
  compileElement(node) {
    let attrs = node.attributes;
    [...attrs].forEach(attr => {
      // 获取属性名称和值 v-text="name" <=> v-text + name
      let {name: attrName, value: expr} = attr
      if (this.isDirective(attrName)) { // 处理 v- 开头的指令
        let [, directive] = attrName.split('-');
        let [directiveName, eventName] = directive.split(':'); // attrName.subString(2) || attrName.slice(2) directiveName 的值就为 text、model、html 等
        CompileUtil[directiveName] && CompileUtil[directiveName](node, this.$vm, expr, eventName)
        node.removeAttribute(attrName);
      } else if (this.isBindDirective(attrName)) {
        let bindName = attrName.slice(1);
        CompileUtil['bind'](node, this.$vm, expr, bindName);
        node.removeAttribute(`:${bindName}`);
      } else if (this.isEventDirective(attrName)) { // 处理 @ 开头的指令
        let eventName = attrName.slice(1);
        CompileUtil['on'](node, this.$vm, expr, eventName)
        node.removeAttribute(`@${eventName}`);
      }
    })
  }
  compileText(node) { // 文本节点的更新需要重新获取整条数据
    let text = node.textContent // 假设为 {{ person.name }}--{{ msg }}
    let fn = CompileUtil.updater.textUpdater
    if (!this.hasCurlyBraces(text)) return
    let value = text.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      // .表示任意字符；+表示一次或多次；?表示非贪婪匹配
      let expr = args[1].trim()
      new Watcher(this.$vm, expr, () => {
        fn(node, CompileUtil.getTextValue(text, this.$vm))
      })
      return CompileUtil.getValue(this.$vm, expr)
    })
    fn(node, value)
  }

  // 以下都是一些辅助函数
  isDirective(str) {
    return str.startsWith('v-') // str.indexOf('v-) === 0 || str.includes('v-')
  }
  isBindDirective(str) {
    return str.startsWith(':')
  }
  isEventDirective(str) {
    return str.startsWith('@')
  }
  isHtmlNode(node) { // 如果是元素节点，形如 <div></div>
    return node.nodeType === 1
  }
  isTextNode(node) { // 如果是文本节点，形如 {{xxx}}xxx
    return node.nodeType === 3
  }
  hasCurlyBraces(text) {
    return /\{\{(.+?)\}\}/.test(text)
  }
}

CompileUtil = { // 各种指令对应的处理方法
  text(node, vm, expr) {
    let fn = this.updater['textUpdater']
    let value = this.getValue(vm, expr)
    new Watcher(vm, expr, () => { // 这个放在前后都可以，因为 watcher 里面已经自己获取值了
      fn(node, this.getValue(vm, expr))
    })
    fn(node, value)
  },
  html(node, vm, expr) {
    let fn = this.updater['htmlUpdater']
    let value = this.getValue(vm, expr)
    new Watcher(vm, expr, newValue => {
      fn(node, newValue)
    })
    fn(node, value)
  },
  bind(node, vm, expr, bindName) {
    let fn = this.updater['bindUpdater']
    let value = this.getValue(vm, expr)
    new Watcher(vm, expr, newValue => {
      fn(node, newValue, bindName)
    });
    fn(node, value, bindName)
  },
  on(node, vm, expr, eventName) {
    let fn = vm.$options.methods[expr]
    fn && node.addEventListener(eventName, fn.bind(vm), false) // 先判断再监听，相比于下面注释中的写法较好
    // node.addEventListener(eventName, function () {
    //   vm.$options.methods[expr] && vm.$options.methods[expr].call(vm)
    // })
  },
  model(node, vm, expr) {
    let fn = this.updater['modelUpdater']
    let value = this.getValue(vm, expr)
    new Watcher(vm, expr, newValue => {
      fn(node, newValue)
    })
    // 1、数据 => 界面
    fn(node, value)
    // 2、界面 => 数据
    node.addEventListener('input', (e) => {
      this.setValue(vm, expr, e.target.value)
    })
  },
  updater: {
    textUpdater(node, value) {
      node.textContent = value
    },
    htmlUpdater(node, value) {
      node.innerHTML = value
    },
    modelUpdater(node, value) {
      node.value = value
    },
    bindUpdater(node, value, bindName) {
      node.setAttribute(bindName, value)
    }
  },
  getValue(vm, expr) {
    expr = expr.split('.')
    return expr.reduce((pre, cur) => {
      return pre[cur]
    }, vm.$data)
  },
  setValue(vm, expr, newValue) {
    expr = expr.split('.')
    return expr.reduce((pre, cur, i) => {
      if (i === expr.length - 1) return pre[cur] = newValue
      return pre[cur]
    }, vm.$data)
  },
  getTextValue(text, vm) { // 文本节点的更新需要重新获取整条数据，假设为 {{ person.name }}--{{ msg }}
    return text.replace(/\{\{([^}]+)\}\}/g, (...args) => {
      // .表示任意字符；+表示一次或多次；?表示非贪婪匹配
      let expr = args[1].trim()
      return this.getValue(vm, expr)
    })
  }
}
