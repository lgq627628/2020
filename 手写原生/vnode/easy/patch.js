let gDomlayer = 0
let allPatches
function patch(oldDom, patches) {
  allPatches = patches
  walkDom(oldDom)
}

function walkDom(dom) {
  let curPatch = allPatches[gDomlayer++]
  // 注意：这里打补丁是从后往前的，后序
  let childNodes = dom.childNodes
  childNodes.forEach(child => walkDom(child))
  if (curPatch && curPatch.length) {
    handlePatch(dom, curPatch)
  }
}

function handlePatch(dom, patches) {
  patches.forEach(patch => {
    switch (patch.type) {
      case PATCH_TYPE.ATTRS:
        let attrs = patch.attrs
        for (let attr in attrs) {
          setAttributes(dom, attr, attrs[attr])
        }
        break
      case PATCH_TYPE.TEXT:
        dom.textContent = patch.text
        break
      case PATCH_TYPE.REPLACE:
        let newVnode = patch.newVnode
        let newDom = render(newVnode, dom) // todo 这个地方不应自动挂载，render 里面加个 mount
        dom.parentNode.replaceChild(newDom, dom)
        break
      case PATCH_TYPE.REMOVE:
        dom.parentNode.removeChild(dom)
        break
      default:
        break
    }
  })
}
