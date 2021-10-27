import { PREFIX_REACT_ID } from './const'

const datasetId = PREFIX_REACT_ID.split('-').slice(1).map((_, i) => i === 0 ? _ : _.slice(0, 1).toUpperCase() + _.slice(1)).join('')


function createUnit(element, id) {
    
    if (typeof element === 'string' || typeof element === 'number') {
        return createTextUnit(element, id)
    } else if (element.type && typeof element.type === 'function') {
        return createClassUnit(element, id)
    } else {
        return createJsxUnit(element, id)
    }
}

function createTextUnit(element, id) {
    return `<span ${PREFIX_REACT_ID}=${id}>${element}</span>`
}

function createClassUnit(element, id) {
    const { type: klass, props = {} } = element;
    console.log('走了')
    const instance = new klass({props, _reactId: id})
    const component = instance.render()
    console.log(component)
    return createUnit(component, id)
}
function createJsxUnit(element, id) {
    const { type, props = {}, children = [] } = element;
    const startTag = `<${type} ${PREFIX_REACT_ID}=${id}`
    const endTag = `</${type}>`
    let propsStr = ''
    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('on')) {
            const eventName = key.slice(2).toLowerCase()
            const fn = value
            if (!fn) return
            document.addEventListener(eventName, e => {
                const clickReactId = e.target.dataset[datasetId]
                if (String(clickReactId) !== String(id)) return
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
    const childrenStr = children.map((c, i) => createUnit(c, id + '.' + i)).join('')
    return startTag + propsStr + '>' + childrenStr + endTag
}
export {
    createUnit
}