import { TEXT_TYPE } from "./const"

function createElement(type, props, ...children) {
  return {
    type: type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object' ? child : createTextVnode(child)
      })
    }
  }
}

function createTextVnode(text) {
  return {
    type: TEXT_TYPE,
    props: {
      text,
      children: []
    }
  }
}

const React = {
  createElement
}
export default React