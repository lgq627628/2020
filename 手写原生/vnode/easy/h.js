function createElement(tag, data={}, children = null) { // createElement 的别名就是 h
  let key
  if (data.key) { // 这个 key 是不需要出现在属性里的
    key = data.key
    delete data.key
  }
  if (typeof children === 'string') {
    children = [vnode(null, null, null, children)]
  } else if (Array.isArray(children)) {
    children = children.map(child => {
      return typeof child === 'string' ? vnode(null, null, null, child) : child
    })
  }
  return vnode(tag, key, data, children)
}

function vnode(tag, key, data, children) {
  return {
    tag,
    key,
    data,
    children
  }
}
