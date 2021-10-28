import { PREFIX_REACT_ID } from './const'
import { Element, Component } from './react'

const datasetId = PREFIX_REACT_ID.split('-').slice(1).map((_, i) => i === 0 ? _ : _.slice(0, 1).toUpperCase() + _.slice(1)).join('')

const id2EventMap = {}

function createUnit(element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return new TextUnit(element)
    } else if (element instanceof Element && typeof element.type === 'function') {
        return new ClassUnit(element)
    } else {
        return new TagUnit(element)
    }
}

class Unit {
    constructor(element) {
        this.element = element
    }
    getHTMLString() {
        throw new Error('具体子类自己实现')
    }
}
class TextUnit extends Unit {
    getHTMLString(reactId) {
        return `<span ${PREFIX_REACT_ID}=${reactId}>${this.element}</span>`
    }
}
class TagUnit extends Unit {
    getHTMLString(reactId) {
        const { type, props = {}, children = [] } = this.element;
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
        const childrenStr = children.map((c, i) => createUnit(c).getHTMLString(reactId + '.' + i)).join('')
        return startTag + propsStr + '>' + childrenStr + endTag
    }
}

class ClassUnit extends Unit {
    getHTMLString(reactId) {
        const { type: klass, props = {} } = this.element;
        const instance = new klass({...props, _reactId: reactId})
        const component = instance.render()
        instance.componentWillMount && instance.componentWillMount()
        return createUnit(component).getHTMLString(reactId)
    }
}

export {
    createUnit,
    id2EventMap
}