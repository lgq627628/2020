// https://www.runoob.com/jsref/prop-element-classlist.html
let dom=document.getElementsByClassName("test")[0];
// 添加样式
dom.classList.add("test1");
dom.classList.add("test1", "test2", "test3");
// 移除样式
dom.classList.remove("className1");
dom.classList.remove("className1", "className2", "className3", ..., "classNameN");
// 是否有某个样式
dom.classList.contains('className');
// 交替出现某个样式
dom.classList.toggle('className');



// 修改样式
dom.setAttribute("class","test1");
dom.removeAttribute("class");

// 插入元素
// insertBefore() 某个子节点前面添加
// https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
// appendChild() 末尾添加
node.appendChild(child)
node.insertBefore(child, node.children[0]) // children 非标准，childNodes 才是
node.removeChild(child)
