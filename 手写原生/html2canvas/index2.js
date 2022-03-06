// 1、获取 dom，遍历 dom。因为绘制 DOM 到 canvas 上，必然意味着把所有元素的样式也一并绘制上。
// 非递归、深度优先遍历
const DFSDomTraversal = (root) => {
    if (!root) return;

    const arr = [],
        queue = [root];
    let node = queue.shift();

    while (node) {
        arr.push(node);
        if (node.children.length) {
            for (let i = node.children.length - 1; i >= 0; i--) {
                queue.unshift(node.children[i]);
            }
        }

        node = queue.shift();
    }

    return arr;
};

// 2、获取行内样式，需要一种方法将 计算样式（Computed Style） 复制到 行内样式（Inline Style），这里的计算样式是在 <style> 中书写的，经过浏览器渲染引擎计算得到的样式结果。
// 凡是要复制的样式，都写在这
const CSSRules = ['color', 'border', 'width', 'margin-right'];
const copyStyle = (element) => {
    const styles = getComputedStyle(element);

    CSSRules.forEach((rule) => {
        element.style.setProperty(rule, styles.getPropertyValue(rule));
    });
};

// 3、处理图像资源。除了处理样式问题，子元素中的 <img> 元素的 src 资源也需被替换成 base64，否则在 dataURL 中是无效的资源地址。
const img2base64 = (element) => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        // 处理 canvas 受污染的情况
        img.crossOrigin = 'anonymous';

        img.onerror = reject;
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            ctx.drawImage(this, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.src = element.src;
    });
};

const dom2base64 = async (root, dpr = window.devicePixelRatio) => {
    DFSDomTraversal(root).forEach(copyStyle);

    const imgElements = [...root.querySelectorAll('img')];

    const base64Result = await Promise.all(imgElements.map(img2base64));

    const width = root.offsetWidth;
    const height = root.offsetHeight;
    let XHTML = new XMLSerializer().serializeToString(root);

    imgElements.forEach((element, index) => {
        XHTML = XHTML.replace(element.src, base64Result[index]);
    });

    const SVGDomElement = `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${width}">
                              <foreignObject height="100%" width="100%">${XHTML}</foreignObject>
                          </svg>`;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const img = new Image();

    img.onload = function () {
        ctx.scale(dpr, dpr);
        ctx.drawImage(this, 0, 0);
        document.body.appendChild(canvas);
    };

    img.src = `data:image/svg+xml,${SVGDomElement}`;

    // var img = new Image();
    // var svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    // var url = DOMURL.createObjectURL(svg);

    // img.onload = function () {
    //     ctx.drawImage(img, 0, 0);
    //     DOMURL.revokeObjectURL(url);
    // };

    // img.src = url;
};



/**
 * 递归遍历所有子节点
 * @param element Document Element 要计算的元素
 * @param isTop Boolean 是否是最外层元素
**/
function renderDom (element, isTop) {
    let tag = element.tagName.toLowerCase()
    let str = `<${tag} `
    // 最外层的节点,需要加 xmlns 命名空间
    isTop && (str += `xmlns="http://www.w3.org/1999/xhtml" `)
    str += ` style="${getElementStyles(element)}">\n`

    if (element.children.length) {
        // 递归子元素
        for (let el of element.children) {
            str += renderDom(el)
        }
    } else {
        str += element.innerHTML
    }
    str += `</${tag}>\n`
    return str
}


// 计算每个 dom 的样式
// 这里本来应该直接用 Object.keys + forEach 遍历取出的
// 但是不知道为什么,遍历取出的,会渲染不出来,应该是某些属性有问题
// 暂时没空去排查那些有问题,所以目前先把常用的直接写死.
function getElementStyles (el) {
    let css = window.getComputedStyle(el)
    let style = ''
    // 尺寸相关
    style += `width:${css.width};`
    style += `height: ${css.height};`
    style += `line-height: ${css.lineHeight};`
    style += `max-height: ${css.maxHeight};`
    style += `min-height: ${css.minHeight};`
    style += `max-width: ${css.maxWidth};`
    style += `min-width: ${css.minWidth};`

    style += `font-size: ${css.fontSize};`
    // 颜色相关
    style += `color: ${css.color};`
    style += `background: ${css.background};`
    // 边框相关
    style += `border: ${css.border};`
    style += `box-sizing: ${css.boxSizing};`
    // 位置相关
    style += `margin: ${css.margin};`
    style += `padding: ${css.padding};`
    style += `position: ${css.position};`
    style += `left: ${css.left};`
    style += `right: ${css.right};`
    style += `top: ${css.top};`
    style += `bottom: ${css.bottom};`
    // 布局相关
    style += `display: ${css.display};`
    style += `flex: ${css.flex};`
    return style
}


// 主入口函数
function shotScreen () {
    let target = document.querySelector('.content')
    let data = getSvgDomString(target)

    let DOMURL = window.URL || window.webkitURL || window;

    let img = new Image();
    let svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    let url = DOMURL.createObjectURL(svg);

    img.src = url;
    document.body.appendChild(img)
}

// 计算 svg 的字符串
function getSvgDomString (element) {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">\n
       <foreignObject width="100%" height="100%">\n
          ${renderDom(element, 1)}
       </foreignObject>\n
   </svg>`
}


//  如果想画到 canvas 里面
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let img = new Image();

img.onload = function () {
   ctx.drawImage(img, 0, 0);
   DOMURL.revokeObjectURL(url);
}
