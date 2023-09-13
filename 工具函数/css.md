## 单行文本省略
```css
.text-ellipsis {
  overflow: hidden,
  text-overflow: ellipsis,
  white-space: nowrap,
}
```

## 多行文本省略
  1. webkit 内核（chrome）
```css
.multi-text-ellipsis {
  overflow: hidden,
  text-overflow: ellipsis,
  display: -webkit-box, // 设置成弹性伸缩盒子
  -webkit-box-orient: vertical, // 子元素排列方式
  -webkit-box-clamp: 5, // 行数
}
```
  2. 兼容css（firefox）
```css
.multi-text-ellipsis {
  height: 3em, // 这里可以设置成变量或者写成枚举，n 行就是 n * line-height
  line-height: 1.5em, // 单行行高
  overflow: hidden,
  position: relative, // 给省略号定位用
}
```

另外，用这种方式的话会少了省略号，需要的话在文本后需要添加一个伪元素，用相对定位比较简单
```css
p::after {
  content: '...',
  position: absolute,
  bottom: 0,
  right: 0,
}
```

## 多行末尾展开收起
```html
<div class="text-container">
    <div class="text">
      <button class="btn">展开</button>
      <p class="text-value">测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。测试一段很长很长的文本。</p>
    </div>
</div>

<style scoped>
.text-container {
  display: flex;
}
.text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  text-overflow: ellipsis;
  overflow: hidden;
}
.text::before {
  content: '';
  float: right;
  width: 0;
  height: calc(100% - 24.5px);
  background: red;
}
.btn {
  float: right;
  clear: both;
}
.text-value {
  margin: 0 auto;
  line-height: 24.5px;
}
</style>
```