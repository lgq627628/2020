import { INSERT, NORMAL_TAG, ROOT_TAG, TEXT_TAG, TEXT_TYPE } from "./const"

let curWork
let fiberHead // fiber 链表的头指针
let effectHead = {} // 有副作用链表的头指针
let prevEffect
function startBuild(rootFiber) {
  fiberHead = rootFiber
  curWork = rootFiber
  window.fiberHead = fiberHead
  window.effectHead = effectHead
}

function taskLoop(deadline) {

  while(curWork && deadline.timeRemaining () > 1) { // 构建 fiber 链，可间断
    curWork = handleWork(curWork) // 执行当前任务并返回新任务
  }

  if (curWork) {
    requestIdleCallback(taskLoop)
  } else {   
    commit() // 将副作用作用于真实 dom，不能停止
    curWork = null
    console.log('ppp')
    // console.log('构建结束', fiberHead)
  }

}

function commit() {
  let effect = effectHead.nextEffect
  while(effect) {
    console.log('1111')
    if (effect.effectTag === INSERT) {
      effect.parent.dom.appendChild(effect.dom)
    }
    effect.effectTag = ''
    effect = effect.nextEffect
  }
}

// fiber: {
//   tag: ROOT_TAG,
//   type: ,
//   dom: container,
//   props: {
//     children: [element]
//   }
// }
function handleWork(fiber) {
  // 创建 dom 元素及其子 fiber
  beginWork(fiber)
  


  // 子 fiber 向下构建，这是递归的 递 部分
  if (fiber.child) return fiber.child



  while(fiber) { // 这里开始是从最底部往上回收的过程，这是递归的 归 部分
    endWork(fiber)
    if (fiber.sibling) return fiber.sibling
    fiber = fiber.parent
  }
}



function beginWork(fiber) {
  const { tag } = fiber
  if (tag === ROOT_TAG) {
    updateRoot(fiber)
  } else if (tag === NORMAL_TAG) {
    updateTag(fiber)
  } else if (tag === TEXT_TAG) {
    updateText(fiber)
  }
}

function endWork(fiber) { // 在回收的过程中构建副作用链表，该链表存放的就是需要新建、更新、删除的 fiber
  if (fiber.effectTag) {
    if (effectHead.nextEffect) { // 其余副作用链条
      prevEffect.nextEffect = fiber
    } else { // 副作用联调首部
      effectHead.nextEffect = fiber
    }
    console.log(fiber.props.id || fiber.props.text)
    prevEffect = fiber
  }
}

function updateRoot(fiber) {
  const children = fiber.props.children
  reconcileChildren(fiber, children)
}
function updateText(fiber) {
  if (!fiber.dom) fiber.dom = createDOM(fiber)
}
function updateTag(fiber) {
  if (!fiber.dom) fiber.dom = createDOM(fiber)
  reconcileChildren(fiber, fiber.props.children)
}
function reconcileChildren(fiber, children) {
  let prevFiber
  children.forEach((child, i) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      tag: type2tag(child),
      dom: null,
      parent: fiber,
      effectTag: INSERT,
      nextEffect: null
    }
    if (i === 0) {
      fiber.child = newFiber
    } else {
      prevFiber.sibling = newFiber
    }
    // reconcileChildren(newFiber, child.props.children)
    prevFiber = newFiber
  })
}

requestIdleCallback(taskLoop)
// requestIdleCallback(taskLoop, { timeout: 500 })

function createDOM(fiber) {
  if (fiber.tag === TEXT_TAG) {
    return document.createTextNode(fiber.props.text)
  } else if (fiber.tag === NORMAL_TAG) {
    const dom = document.createElement(fiber.type)
    updateDOMProps(dom, {}, fiber.props)
    return dom
  }
}
function updateDOMProps(dom, oldProps, newProps) {
  for (const prop in oldProps) {
  }
  for (const prop in newProps) {
    const value = newProps[prop]
    if (prop === 'children') {
    } else if (prop.startsWith('on')) {

    } else if (prop === 'style') {
      for (const key in value) {
        dom.style[key] = value[key]
      }
    } else {
      dom.setAttribute(prop, value)
    }
  }
}
function type2tag(vnode) {
  if (vnode.type === TEXT_TYPE) {
    return TEXT_TAG
  } else if (typeof vnode.type === 'string') {
    return NORMAL_TAG
  }
}

export {
  startBuild
}