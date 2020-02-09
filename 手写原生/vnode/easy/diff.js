const PATCH_TYPE = {
  ATTRS: 'ATTRS',
  REPLACE: 'REPLACE',
  REMOVE: 'REMOVE',
  TEXT: 'TEXT'
}
let gVnodeLayer = 0 // 这个表示树的层级（其实是某个元素，就是先序深度优先遍历），平级比较，从根节点开始，全局唯一

function render(vnode, container) {
  let dom = createDom(vnode) // vnode 转成真实 dom
  container.appendChild(dom)
  return dom
}

function createDom(vnode) {
  let {tag, data, children} = vnode
  if (tag) {
    vnode.dom = document.createElement(tag) // 建立 vnode 和真实 dom 的关系，方便后面从 vnode 中取值更新 dom
    if (children) {
      children.forEach(child => {
        render(child, vnode.dom)
      })
    }
    Object.keys(data).forEach(key => {
      setAttributes(vnode.dom, key, data[key])
    })
  } else {
    vnode.dom = document.createTextNode(children)
  }
  return vnode.dom
}

function walkVnode(oldVnode={}, newVnode={}, layer, patches) {
  let {data: newData, tag: newTag, children: newChildren} = newVnode
  let {data: oldData, tag: oldTag, children: oldChildren} = oldVnode

  let curPatch = []
  if (!Object.keys(newVnode).length) { // 如果没有新节点
    curPatch.push({type: PATCH_TYPE.REMOVE, layer})
  } else if (typeof oldChildren === 'string' && typeof newChildren === 'string') { // 如果新旧都是文本
    if (oldChildren !== newChildren) {
      curPatch.push({type: PATCH_TYPE.TEXT, text: newChildren})
    }
  } else if (newTag === oldTag) { // 如果新旧标签一致
    let attrs = diffAttr(oldData, newData)
    if (Object.keys(attrs).length > 0) {
      curPatch.push({type: PATCH_TYPE.ATTRS, attrs})
    }
    diffChildren(oldChildren, newChildren, patches)
  } else {
      curPatch.push({type: PATCH_TYPE.REPLACE, newVnode})
  }

  if (curPatch.length > 0) patches[layer] = curPatch
}

function diff(oldVnode, newVnode) {
  let patches = {}
  walkVnode(oldVnode, newVnode, gVnodeLayer, patches)
  return patches
}

function diffAttr(oldAttrs={}, newAttrs={}) {
  let patch = {}
  for(let attr in oldAttrs) { // 修改属性
    if (oldAttrs[attr] !== newAttrs[attr]) patch[attr] = newAttrs[attr] // 注意有可能是 undefined，意味着删除
  }
  for (let attr in newAttrs) { // 新增属性
    if (!oldAttrs.hasOwnProperty(attr)) patch[attr] = newAttrs[attr]
  }
  return patch
}

function diffChildren(oldChildren, newChildren, patches) {
  oldChildren.forEach((child, i) => {
    walkVnode(child, newChildren[i], ++gVnodeLayer, patches)
  })
}

function setAttributes(dom, key, value = '') {
  switch (key) {
    case 'style':
      for (let v in value) {
        dom.style[v] = value[v]
      }
      break
    case 'class':
      dom.className = value
      break
    case 'value':
      if (dom.tagName.toUpperCase() === 'INPUT' || dom.tagName.toUpperCase() === 'TEXTAREA') {
        dom.value = value
      } else {
        dom.setAttribute(key, value)
      }
      break
    default:
      if (key[0] === '@') {
        value && dom.addEventListener(key.slice(1), value)
      } else {
        dom.setAttribute(key, value)
      }
      break
  }
}
