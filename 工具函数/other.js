// 最小 1 * 1 像素的透明 gif 图片
let minImgUrl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// 可以看出，我们主要通过 document.querySelector 方法来判断该 CSS 是否被使用到，如果该 CSS 选择器能够选择上元素，说明该 CSS 样式是有用的，保留。如果没有选择上元素，说明该 CSS 样式没有用到，所以移除。
