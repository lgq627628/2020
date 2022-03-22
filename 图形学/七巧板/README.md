## 七巧板实现方式

### 七巧板的渲染
图形的渲染采用了svg的渲染方式，具体使用到了`<svg>`标签下的`<polygon>`标签，通过`<polygon>`标签的points属性传入该多边形顶点的坐标，fill属性传入对应的填充色，便可以绘制出对应的巧板图形。
```html
<template>
    <svg
        class="svg-container"
        ref="container"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        height="100%"
        width="100%">
        <!-- 七巧板元素列表 -->
        <g v-for="(el, key) in svgElements" :key="key">
            <polygon
                v-if="el.tag === 'polygon'"
                :class="[el.interactiveType, 'svg-element']"
                :polygon-id="el.id"
                :name="el.name"
                :points="generateSvgPoints(el.points)"
                :style="{
                transformOrigin: `${el.anchor[0]}px ${el.anchor[1]}px`,
                transform: `translate(${el.position[0]}px, ${el.position[1]}px)`,
                ...el.style,
                }"/>
         </g>
    </svg>
</template>
```
```js
//svgElements数据样例
[{
  tag: 'polygon',
  name: 'green-square',
  id: '1001',
  interactiveType: 'board',
  anchor: [27, 27],
  style: {
    fill: '#A7D4A7',
    'stroke-width': '0',
  },
  answeringStyle: {
    fill: '#A7D4A7',
    stroke: '#4FAA4F',
    'stroke-width': '4px',
  },
  points: [
    [0, 0],
    [0, 54],
    [54, 54],
    [54, 0],
  ],
  position: [637, 471],
},
{
  tag: 'polygon',
  name: 'parallelogram',
  id: '1002',
  interactiveType: 'board',
  anchor: [54, 27],
  style: {
    fill: '#99E5E5',
    stroke: '#33CCCC',
    'stroke-width': '0',
  },
  answeringStyle: {
    fill: '#99E5E5',
    stroke: '#33CCCC',
    'stroke-width': '4px',
  },
  points: [
    [0, 0],
    [54, 0],
    [107.46, 54],
    [54, 54],
  ],
  position: [377, 471],
},
...]
```


### 七巧板的旋转
巧板的旋转使用了css中的transform的rotate属性，这里借助的三方的库[SAT.js](https://github.com/jriecken/sat-js)去实现。
```js
rotateBy(target, 45, this.svgElements);
const polygon = getPolygonByEl(event.target, this.svgElements);
polygon.rotate(45 * Math.PI / 180);
```

### 七巧板的拖拽
巧板的拖拽通过给svg容器添加onmousedown、onmousemove、onmouseup这三个事件监听去实现。定义拖拽规则：
  1. 鼠标按下移动，板子可以随着鼠标自由拖动。
  2. 鼠标松开时，如果相邻两块板子距离较近，超过了一定阈值，会自动吸附到一起。
在onmousedown事件中，我们去获得当前选中的多边形target，以及当前的鼠标位置信息event.pageX、event.pageY
```js
onMouseDown(event) {
  if (event.button !== 0) {
    return;
  }
  const target = event.target;
  if (!this.getDraggableEls().includes(target)) {
    return;
  }
  this.dragStart = true;
  this.currentDragEl = target;
  const g = target.parentNode;
  g.parentNode.appendChild(g);
  this.startPos.x = event.pageX;
  this.startPos.y = event.pageY;
  event.stopPropagation();
}
```
随着鼠标移动，在onmousemove事件中，我们可以实时获取当前鼠标的位移，同时通过transform中的translate这个css属性动态地去改变被拖动的多边形位移，实现多边形跟随鼠标一起移动，实现拖拽功能。
```js
onMouseMove(event) {
  //判断鼠标左键
  if (event.button !== 0) {
    return;
  }
  if (
    this.dragStart &&
    this.getDraggableEls().includes(this.currentDragEl)
  ) {
    let { movementX, movementY } = event;
    const [[lx, ly], [rx, ry]] = this.dragRange;
    const polygon = getPolygonByEl(this.currentDragEl, this.svgElements);
    //是否存在某一个点超出边界
    const isOutOfBoundingBox = polygon.points.some((point) => {
      point = convertToWorldPos(polygon, point);
      point = point.clone().add(v2(movementX, movementY));
      return (
        point.x > rx ||
        point.x < lx ||
        point.y > ry ||
        point.y < ly
      );
    });
    if (isOutOfBoundingBox) {
      // 超出范围
      return;
    }
    moveBy(this.currentDragEl, v2(movementX, movementY), this.svgElements);
    // this.throttledDealCollide(this.getDraggableEls());
  }
  event.stopPropagation();
}
```

### 七巧板的吸附
当松开鼠标，即在onmouseup事件中，我们需要判断当前被拖拽的多边形是否满足距离其他的多边形的距离在某个阈值之内，如果满足，则按最短距离向量移动到对应位置：
多边形的最短距离可分为点到点的最短距离和点到边的最短距离（边对边情形等价于点对边的情形）两种情形，两种情形对应两种距离向量以及吸附规则。  
本质就是求点到线的距离，具体方法就是用向量求出投影点。  
在拖拽结束后，遍历当前拖拽图形以及其余图形的所有顶点、边来逐个进行距离向量判断，根据以上定义的吸附规则，便可以求出最终距离向量。