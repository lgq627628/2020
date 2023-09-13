// 获取到 document 的距离
export function offset(el) {
    let left = 0
    let top = 0

    while (el) {
        left += el.offsetLeft
        top += el.offsetTop
        el = el.offsetParent
    }

    return {
        left,
        top
    }
}


// 获取元素 top 值
function getElementTop(element){
    let actualTop = element.offsetTop;
    let current = element.offsetParent;

    while (current !== null){
        actualTop += current.offsetTop;
        current = current.offsetParent;
    }

    return actualTop;
}