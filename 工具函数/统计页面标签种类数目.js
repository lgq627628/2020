// 如何统计当前网页出现过多少种html标签

new Set([...document.getElementsByTagName('*')].map(ele => ele.tagName)).size
