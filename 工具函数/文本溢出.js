// 判断文本是否溢出、是否有省略号

// 方法一：
// 对比元素的el.clientWidth和el.scrollWidth，如果scrollWidth较大，说明溢出了，否则没溢出
function isOverflow(el) {
    const { clientWidth, scrollWidth } = el; // offsetWidth 也行
    return clientWidth < scrollWidth;
}
window.addEventListener('resize', () => isOverflow('xxx'))




// 方法二：
// 将div克隆一份但不显示（visibility:hidden）,比较两者的宽度，如果副本的宽度大于元素本身的宽度，则表示溢出，否则未溢出
// 此方案中元素不能为block，因为这样eleCopy的宽度会为父元素的100%，而不是由内容撑开的宽度；也不能为inline，因为这样没有width，无法比较；因此将元素设为inline-block
function isOverflow(el) {
    const elBak = el.cloneNode(true);
    elBak.style.display = 'inline-block';
    elBak.style.visibility = 'hidden';
    return el.clientWidth < elBak.clientWidth
}