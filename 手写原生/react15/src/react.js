import { PREFIX_REACT_ID } from './const'
import { createUnit } from './unit'

function createElement(type, props, ...children) {
    return {
        type,
        props,
        children
    }
}
function render(element, container) {
    console.log(element);
    const html = createUnit(element, 0)
    container.innerHTML = html
}
class Component {
    constructor(props) {
        this.props = props
        this._reactId = props._reactId
        this.state = null
    }
    setState(newState) {
        Object.assign(this.state, newState)
        document.getElementsByClassName([`${PREFIX_REACT_ID}=${this._reactId}`]).innerHTML = createUnit(this.render(), this._reactId)
    }
}

const React = {
    createElement,
    render,
    Component
}

export default React