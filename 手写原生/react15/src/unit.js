import { EE } from './common'
import { PREFIX_REACT_ID } from './const'
import { Element } from './react'

const diffQueue = []
const datasetId = PREFIX_REACT_ID.split('-').slice(1).map((_, i) => i === 0 ? _ : _.slice(0, 1).toUpperCase() + _.slice(1)).join('')

const id2EventMap = {}

function createUnit(element) {
    if (typeof element === 'string' || typeof element === 'number') { // 普通文本
        return new TextUnit(element)
    } else if (element instanceof Element && typeof element.type === 'function') { // 类式组件
        return new ClassUnit(element)
    } else if (element instanceof Element && typeof element.type === 'string') { // 标签组件
        return new TagUnit(element)
    }
}

class Unit {
    constructor(element) {
        this._element = element
    }
    getHTMLString() {
        throw new Error('具体子类自己实现')
    }
}
class TextUnit extends Unit {
    getHTMLString(reactId) {
        this._reactId = reactId
        return `<span ${PREFIX_REACT_ID}=${reactId}>${this._element}</span>`
    }
    update(newElement) {
        if (this._element === newElement) return
        this._element = newElement
        const targetElement = document.querySelector(`[${PREFIX_REACT_ID}="${this._reactId}"]`)
        targetElement.innerHTML = newElement
    }
}
class TagUnit extends Unit {
    getHTMLString(reactId) {
        this._reactId = reactId
        this._unitChildren = []
        const { type, props = {}, children = [] } = this._element;
        const startTag = `<${type} ${PREFIX_REACT_ID}=${reactId}`
        const endTag = `</${type}>`
        let propsStr = ''
        Object.entries(props).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                const eventName = key.slice(2).toLowerCase()
                const fn = value
                if (!fn) return
                if (!id2EventMap[datasetId]) id2EventMap[datasetId] = []
                if (id2EventMap[datasetId].includes(eventName)) return
                id2EventMap[datasetId].push(eventName) // 临时处理多事件重复监听
                document.addEventListener(eventName, e => {
                    const clickReactId = e.target.dataset[datasetId]
                    if (String(clickReactId) !== String(reactId)) return
                    fn()
                })
            } else if (key === 'style') {
                let styleStr = ` style="`
                Object.entries(value).forEach(([p, v]) => {
                    styleStr += `${p}:${v};`
                })
                styleStr += `"`
                propsStr += styleStr
            } else {
                propsStr += ` ${key}="${value}"`
            }
        })
        const childrenStr = children.map((c, i) => {
            const unit = createUnit(c)
            this._unitChildren.push(unit)
            return unit.getHTMLString(reactId + '.' + i)
        }).join('')
        return startTag + propsStr + '>' + childrenStr + endTag
    }
    update(newElement) {
        const newProps = newElement.props
        const oldProps = this._element.props
        this.updateProps(newProps, oldProps)
        this.updateChildren(diffQueue, newElement.children)
    }
    updateProps(newProps = {}, oldProps = {}) {
        const targetElement = document.querySelector(`[${PREFIX_REACT_ID}="${this._reactId}"]`)
        Object.keys(oldProps).forEach(oldProp => {
            if (!newProps.hasOwnProperty(oldProp)) {
                targetElement.removeAttribute(oldProp)
            }
        })
        Object.keys(newProps).forEach(newProp => {
            if (newProp === 'style') {
                const style = newProps[newProp]
                Object.keys(style).forEach(css => {
                    targetElement.style[css] = style[css]
                })
            } else if (newProp === 'className') {
            } else {
                targetElement.setAttribute(newProp, newProps[newProp])
            }
        })
    }
    updateChildren(diffQueue, newElementChildren) {
        this.diff(diffQueue, newElementChildren)
    }
    diff(diffQueue, newElementChildren = []) {
        const oldUnitChildrenMap = this.getOldUnitChildrenMap()
        const newChildren = this.getNewChildren(oldUnitChildrenMap, newElementChildren)
        this._unitChildren = newChildren
        
    }
    getNewChildren(oldUnitChildrenMap, newElementChildren) {
        const newChildren = []
        newElementChildren.forEach((newElement, i) => {
            const newKey = newElement?.props?.key || String(i)
            const oldUnit = oldUnitChildrenMap[newKey]
            const oldElement = oldUnit && oldUnit._element
            if (shouldDeepCompare(newElement, oldElement)) {
                oldUnit.update(newElement)
                newChildren.push(oldUnit)
            } else {
                const newUnit = createUnit(newElement)
                newChildren.push(newUnit)
                const htmlString = newUnit.getHTMLString(this._reactId)
                const targetElement = document.querySelector(`[${PREFIX_REACT_ID}="${this._reactId}"]`)
                targetElement.replaceWith(string2dom(htmlString))
            }
        })
        return newChildren
    }
    getOldUnitChildrenMap() {
        const map = {}
        this._unitChildren.forEach((unit, i) => {
            const key = unit?.props?.key || String(i)
            map[key] = unit
        })
        return map
    }
}

class ClassUnit extends Unit {
    getHTMLString(reactId) {
        this._reactId = reactId
        const { type: klass, props = {} } = this._element;
        const instance = this._instance = new klass({...props})
        const renderElement = instance.render()
        instance._unit = this
        instance.componentWillMount && instance.componentWillMount()
        const renderInstance = this._renderInstance = createUnit(renderElement)
        const htmlString = renderInstance.getHTMLString(reactId)
        EE.on('mounted', () => {
            instance.componentDidMount && instance.componentDidMount()
        })
        return htmlString
    }
    update(newElement, partState) {
        this._element = newElement || this._element
        const newState = this._instance.state = Object.assign(this._instance.state, partState)
        const newProps = this._element.props
        if (!this._instance.shouldComponentUpdate(newProps, newState)) return
        const prevRenderElement = this._renderInstance._element
        const newRenderElement = this._instance.render()

        if (shouldDeepCompare(newRenderElement, prevRenderElement)) {
            this._renderInstance.update(newRenderElement)
            this._instance.componentDidUpdate()
        } else {
            const renderInstance = this._renderInstance = createUnit(newRenderElement)
            const htmlString = renderInstance.getHTMLString(this._reactId)
            const targetElement = document.querySelector(`[${PREFIX_REACT_ID}="${this._reactId}"]`)
            targetElement.replaceWith(string2dom(htmlString))
        }
    }
}

function shouldDeepCompare(newElement, oldElement) {
    // if (!newElement || !oldElement) return false // 这样写如果是文本数字 0 就会出现 bug
    if (newElement == null || oldElement == null) return false
    const oldType = typeof oldElement
    const newType = typeof newElement
    if ((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) return true
    if (oldElement instanceof Element && newElement instanceof Element) return oldElement.type === newElement.type
    return false
}

function string2dom(htmlString) {
    return document.createRange().createContextualFragment(htmlString)
}
export {
    createUnit,
    id2EventMap
}