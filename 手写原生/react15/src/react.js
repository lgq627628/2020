import { PREFIX_REACT_ID } from './const'
import { createUnit } from './unit'

class Element {
    constructor(type, props, children) {
        this.type = type
        this.props = props
        this.children = children
    }
}
function createElement(type, props, ...children) {
    return new Element(type, props, children)
}
function render(element, container) {
    const unit = createUnit(element)
    const htmlString = unit.getHTMLString(0)
    container.innerHTML = htmlString
}
class Component {
    constructor(props) {
        this.props = props
        this._reactId = props._reactId
        this.state = null
    }
    componentWillMount() {}
    shouldUpdateComponent(prevState, curState) {
        return true
    }
    setState(newState) {
        Object.assign(this.state, newState)
        const newJsx = this.render()
        const shouldUpdateComponent = this.shouldUpdateComponent(newJsx, this.curDom)
        shouldUpdateComponent && this.update(newJsx)
    }
    update(newJsx) {
        const element = document.querySelector(`[${PREFIX_REACT_ID}="${this._reactId}"]`)
        element.innerHTML = createUnit(newJsx).getHTMLString(this._reactId)
    }
}

const React = {
    createElement,
    render,
    Component
}

export default React
export {
    Element,
    Component
}