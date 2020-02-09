const VNODE_TYPE = {
  HTML: 'HTML',
  TEXT: 'TEXT',
  COMPONENT: 'COMPONENT',
  CLASS_COMPONENT: 'CLASS_COMPONENT'
}
const CHILDREN_TYPE = {
  EMPTY: 'EMPTY',
  SINGLE: 'SINGLE',
  MULTIPLE: 'MULTIPLE'
}

function createElement(tag, data, children = null) {
  let flag // vnode 节点类型标记
  if (typeof tag === 'string') {
    flag = VNODE_TYPE.HTML
  } else if (typeof tag === 'function') {
    flag = VNODE_TYPE.COMPONENT
  } else {
    flag = VNODE_TYPE.TEXT
  }
  let childrenFlag
  if (children == null) {
    childrenFlag = CHILDREN_TYPE.EMPTY
  } else if (Array.isArray(children)) {
    let len = children.length
    childrenFlag = len === 0 ? CHILDREN_TYPE.EMPTY : CHILDREN_TYPE.MULTIPLE
  } else {
    childrenFlag = CHILDREN_TYPE.SINGLE
    children = createTextVnode(children)
  }
  return {
    flag,
    tag,
    data,
    children,
    childrenFlag,
    el: null,
    key: data && data.key
  }
}
function createTextVnode(text = '') {
  return {
    flag: VNODE_TYPE.TEXT,
    tag: null, // 文本没有 tag
    data: null,
    children: text,
    childrenFlag: CHILDREN_TYPE.EMPTY,
    el: null
  }
}

function render(vnode, container) {
  // 这里要区分首次渲染和再次渲染
  if (container.vnode) { // diff 操作，为的是高效复用 dom
    patch(container.vnode, vnode, container)
  } else { // 首次
    mount(vnode, container)
    container.vnode = vnode
  }
  return container
}

function mount(vnode, container, flagNode) {
  let flag = vnode.flag
  if (flag === VNODE_TYPE.HTML) {
    mountElement(vnode, container, flagNode)
  } else if (flag === VNODE_TYPE.TEXT) {
    mountText(vnode, container)
  }
}

function mountElement(vnode, container, flagNode) {
  let {tag, data, children, childrenFlag} = vnode
  let dom = document.createElement(tag)
  vnode.el = dom // vnode 上也能找到真实 dom

  // 挂载各种属性
  for(let key in data) {
    patchData(dom, key, null, data[key])
  }
  if (childrenFlag === CHILDREN_TYPE.SINGLE) {
      mount(children, dom)
  } else if (childrenFlag === CHILDREN_TYPE.MULTIPLE) {
    children.forEach(c => {
      if (typeof c === 'string') {
        c = createTextVnode(c)
      }
      mount(c, dom)
    })
  }
  flagNode ? container.insertBefore(dom, flagNode) : container.appendChild(dom)
  return dom
}

function mountText(vnode, container) {
  let dom = document.createTextNode(vnode.children)
  vnode.el = dom
  container.appendChild(dom)
  return dom
}

function patchData(el, key, oldVal, newVal) { // 设置 dom 上的各种属性
  switch (key) {
    case 'style':
      for (let k in newVal) {
        el.style[k] = newVal[k]
      }
      for (let k in oldVal) {
        if (!newVal.hasOwnProperty(k)) {
          el.style[k] = ''
        }
        el.style[k] = newVal[k]
      }
      break
    case 'class':
      el.className = newVal
      break
    case 'value':
      if(el.tagName.toUpperCase() === 'INPUT' || el.tagName.toUpperCase() === 'TEXTAREA') {
        el.value = newVal
      } else {
        el.setAttribute(key, newVal)
      }
      break
    default:
      if (key[0] === '@') {
        if (oldVal) {
          el.removeEventListener(key.slice(1), oldVal)
        }
        if (newVal) {
          el.addEventListener(key.slice(1), newVal)
        }
      } else {
        el.setAttribute(key, newVal)
      }
      break
  }
}

function patch(oldNode, newNode, container) {
  let oldFlag = oldNode.flag
  let newFlag = newNode.flag
  if (oldFlag !== newFlag) {
    replaceVnode(oldNode, newNode, container)
  } else if (newFlag === VNODE_TYPE.HTML) {
    patchElement(oldNode, newNode, container)
  } else if (newFlag === VNODE_TYPE.TEXT) {
    patchText(oldNode, newNode)
  }
}

function replaceVnode(oldNode, newNode, container) {
  container.removeChild(oldNode.el)
  mount(newNode, container)
}

function patchText(oldNode, newNode) {
  let el = oldNode.el
  newNode.el = el
  if (oldNode.children !== newNode.children) {
    el.nodeValue = newNode.children
  }
}

function patchElement(oldNode, newNode, container) {
  if (oldNode.tag !== newNode.tag) {
    replaceVnode(oldNode, newNode, container)
    return
  }
  let el = newNode.el = oldNode.el
  // 开始更新 data
  let oldData = oldNode.data
  let newData = newNode.data
  if (newData) { // 更新和新建
    for(let key in newData) {
      let oldVal = oldData[key]
      let newVal = newData[key]
      patchData(el, key, oldVal, newVal)
    }
  }
  if (oldData) { // 删除
    for (let key in oldData) {
      let oldVal = oldData[key]
      if (oldVal && !newNode.hasOwnProperty(key)) {
        patchData(el, key, oldVal, null)
      }
    }
  }
  // 接下来更新子元素
  patchChildren(oldNode.childrenFlag, newNode.childrenFlag, oldNode.children, newNode.children, el)
}

function patchChildren(oldChildrenFlag, newChildrenFlag, oldChildren, newChildren, container) {
  // diff 算法的难度就在这，3*3，最难的是多对多的修改
  // 老的是空的
  // 老的有一个
  // 老的有多个
  switch (oldChildrenFlag) {
    case CHILDREN_TYPE.EMPTY:
      switch (newChildrenFlag) {
        case CHILDREN_TYPE.EMPTY:
          break
        case CHILDREN_TYPE.SINGLE:
          mount(newChildren, container)
          break
        case CHILDREN_TYPE.MULTIPLE:
          newChildren.forEach(n => mount(n, container))
          break
      }
      break
    case CHILDREN_TYPE.SINGLE:
      switch (newChildrenFlag) {
        case CHILDREN_TYPE.EMPTY:
          container.removeChild(oldChildren.el)
          break
        case CHILDREN_TYPE.SINGLE:
          patch(oldChildren, newChildren, container)
          break
        case CHILDREN_TYPE.MULTIPLE:
          container.removeChild(oldChildren.el)
          newChildren.forEach(n => mount(n, container))
          break
      }
      break
    case CHILDREN_TYPE.MULTIPLE:
      switch (newChildrenFlag) {
        case CHILDREN_TYPE.EMPTY:
          oldChildren.forEach(o => container.removeChild(o.el))
          break
        case CHILDREN_TYPE.SINGLE:
          oldChildren.forEach(o => container.removeChild(o.el))
          mount(newChildren, container)
          break
        case CHILDREN_TYPE.MULTIPLE:
          // 这里就是 dom-diff 的核心，每个框架的大佬优化策略都不一样
          // TODO
          // [abc]
          // [cab] 如果相对顺序不变，则不需要修改，否则需要
          // let lastIndex = 0
          // newChildren.forEach((n, i) => {
          //   oldChildren.forEach((o, j) => {
          //
          //   })
          // })
          break
      }
      break
  }
  // 新的是空的
  // 新的有一个
  // 新的有多个
  switch (newChildrenFlag) {
    case CHILDREN_TYPE.EMPTY:
      break
    case CHILDREN_TYPE.SINGLE:
      break
    case CHILDREN_TYPE.MULTIPLE:
      break
  }
}

