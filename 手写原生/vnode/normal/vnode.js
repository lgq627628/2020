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

          // 我们先遍历两个数组(while语句), 维护四个变量
          // 遍历oldCh的头索引 - oldStartIdx
          // 遍历oldCh的尾索引 - oldEndIdx
          // 遍历newCh的头索引 - newStartIdx
          // 遍历newCh的尾索引 - newEndIdx
          // 当oldStartIdx > oldEndIdx或者newStartIdx > newOldStartIdx的时候停止遍历

          // 一种说法
          // 如果是oldStartIdx和newEndIdx匹配上了，那么真实dom中的第一个节点会移到最后
          // 如果是oldEndIdx和newStartIdx匹配上了，那么真实dom中的最后一个节点会移到最前，匹配上的两个指针向中间移动
          // 如果四种匹配没有一对是成功的，那么遍历oldChild，newStartIdx挨个和他们匹配，匹配成功就在真实dom中将成功的节点移到最前面，如果依旧没有成功的，那么将newStartIdx对应的节点插入到dom中对应的oldStartIdx位置，oldStartIdx和newStartIdx指针向中间移动
          // 如果以上情况均不符合，则通过createKeyToOldIdx会得到一个oldKeyToIdx，里面存放了一个key为旧的VNode，value为对应index序列的哈希表。从这个哈希表中可以找到是否有与newStartVnode一致key的旧的VNode节点
          // 如果同时满足sameVnode，patchVnode的同时会将这个真实DOM移动到oldStartVnode对应的真实DOM的前面
          // 当然也有可能newStartVnode在旧的VNode节点找不到一致的key，或者是即便key相同却不是sameVnode，这个时候会调用createElm创建一个新的DOM节点。
          // oldStartIdx > oldEndIdx表示oldChildren先遍历完，那么就将多余的newChildren根据index添加到dom中去（此时调用addVnodes（批量调用createElm的接口将这些节点加入到真实DOM中去））
          // newStartIdx > newEndIdx表示newChildren先遍历完，那么就在真实dom中将区间为[oldStartIdx, oldEndIdx]的多余节点删掉

          // 换种说法
          // 遍历过程中有五种比较
          // oldStartVnode和newStartVnode, 两者elm相对位置不变, 若值得(sameVnode)比较, 这patch这两个vnode
          // oldEndVnode和newEndVnode, 同上, elm相对位置不变, 做相同patch检测
          // oldStartVnode和newEndVnode, 如果oldStartVnode和newEndVnode值得比较, 说明oldCh中的这 - - oldStartVnode.elm向右移动了。那么执行api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm))调整它的位置
          // oldEndVnode和newStartVnode, 同上, 但这是oldVnode.elm向左移, 需要调整它的位置

          // 最后一种比较
          // 利用vnode.key, 在ul > li * n的结构里, 我们很有可能使用key来标志li的唯一性, 那么我们就会来到最后一种情况。这个时候, 我们先产生一个index - key表(createKeyToOldIdx), 然后根据这个表来进行更改。
          // 如果newVnode.key不在表中, 那么这个newVnode就是新的vnode, 将其插入
          // 如果newVnode.key在表中, 那么对应的oldVnode存在, 我们需要patch这两个vnode, 并在patch之后, 将这个oldVnode置为undefined(oldCh[idxInOld] = undefined), 同时将oldVnode.elm位置变换到当前oldStartIdx之前, 以免影响接下来的遍历
          // 遍历结束后, 检查四个变量, 对移除剩余的oldCh或添加剩余的newCh

          // 不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom
          // key的作用主要是为了高效的更新虚拟DOM。另外vue中在使用相同标签名元素的过渡切换时，也会使用到key属性，其目的也是为了让vue可以区分它们，否则vue只会替换其内部属性而不会触发过渡效果
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

