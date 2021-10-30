import { createUnit } from './unit'
import { EE } from './common';

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
    const htmlString = unit.getHTMLString('0')
    container.innerHTML = htmlString
    EE.fire('mounted')
}
class Component {
    constructor(props) {
        this.props = props
    }
    componentWillMount() {
        console.log(this._unit._reactId, '准备挂载')
    }
    componentDidMount() {
        console.log(this._unit._reactId, '挂载了')
    }
    shouldComponentUpdate(newProps, newState) {
        return true
    }
    setState(partState) {
        this._unit.update(null, partState)
    }
    componentDidUpdate() {
        console.log(this._unit._reactId, '更新完成')
    }
    render() {
        throw new Error('render 函数必须有返回值')
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