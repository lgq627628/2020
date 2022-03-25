https://juejin.cn/post/7072926133859123236?utm_source=gold_browser_extension


1. 计算DOM遮罩大小和坐标
编辑态其实类似一种 Modality。需要用户的 Focus，在编辑时需要阻断和底部表格的交互。所以我们需要挂载一个 DOM 遮罩容器节点，大小和 Canvas 保持一致，用于放置 TextArea。元素的定位使用到了目前的窗口滚动的 Offset 和 Canvas 容器的坐标值。

const EditableMask = () => {
  const { left, top, width, height } = useMemo(() => {
    const rect = (spreadsheet?.container.cfg.container as HTMLElement).getBoundingClientRect();
    const modified = {
      left: window.scrollX + rect.left,
      top: window.scrollY + rect.top,
      width: rect.width,
      height: rect.height,
    };

    return modified;
  }, [spreadsheet?.container.cfg.container]);
  return (
      <div
        className="editable-mask"
        style={{
          zIndex: 500,
          position: 'absolute',
          left,
          top,
          width,
          height,
        }}
      />
  );
};



2. 注册事件并渲染 TextArea 元素
编辑操作一般会由双击来触发，而 S2 为我们提供了 DATA_CELL_DOUBLE_CLICK 事件。然后来看看 TextArea 的渲染逻辑，我们需要拿到单元格的定位和当前数据值。在触发事件时，从被双击的 DataCell 对象中可以拿到 x/y/width/height/value 这几个核心数据。需要注意，这里的 x 和 y 针对的是整个表格，而不是当前的 ViewPort，因此我们需要使用 spreadsheet.facet.getScrollOffset() 获取表格内部的滚动状态并对 x/y 做针对性的修改
// 从事件回调拿到 Cell 对象
const cell: S2Cell = event.target.cfg.parent;

// 计算定位和宽高
const {
  x: cellLeft,
  y: cellTop,
  width: cellWidth,
  height: cellHeight,
} = useMemo(() => {
  const scroll = spreadsheet.facet.getScrollOffset();

  const cellMeta = _.pick(cell.getMeta(), ['x', 'y', 'width', 'height']);

  // 减去滚动值，获取相对于 ViewPort 的定位
  cellMeta.x -= scroll.scrollX || 0;
  cellMeta.y -=
    (scroll.scrollY || 0) -
    (spreadsheet.getColumnNodes()[0] || { height: 0 }).height;

  return cellMeta;
}, [cell, spreadsheet]);

// 获取当前单元格数值并存到 state 中
const [inputVal, setinputVal] = useState(cell.getMeta().fieldValue);






StartBrushPoint 刷选开始点。MouseDown 事件时记录。
EndBrushPoint 刷选结束点。MouseMove 事件时更新。
BrushRange 刷选范围。包含了开始点的行列 Index 和结束点的行列 Index。




比如在滚动中，每个格子的宽和高都有可能是不同的，如果滚动的距离是一个恒定的值，那在遇到很高或者很宽的格子时，就会出现龟速滚动几次才能滚完一个格子的情况。所以每次滚动的距离，必须是一个动态的值。实际落地的方案是这样的：拿向右滚动举例，滚动的 Offset 会定位到下一个格子的右侧边缘。比如这样：
在循环滚动时，滚动的频率也是一个需要注意的细节。不同的用户对于滚动频率有不同的诉求。所以滚动频率也不应该是恒定的。一种方案是将滚动速度和滚动离开画布的距离关联起来。往下面拉的越多，滚动就越快，直到一个最大值。
const MAX_SCROLL_DURATION = 300;
const MIN_SCROLL_DURATION = 16;
let ratio = 3;
// x 轴滚动速度慢
if (config.x.scroll) {
  ratio = 1;
}
this.spreadsheet.facet.scrollWithAnimation(
  offsetCfg,
  Math.max(MIN_SCROLL_DURATION, MAX_SCROLL_DURATION - this.mouseMoveDistanceFromCanvas * ratio),
  this.onScrollAnimationComplete,
);







第一步：计算可视区坐标范围，得出可视区内的格子列表

首先根据行列信息和当前滚动 Offset 计算出可视区的范围，获得一个数组，包括 [xMin, xMax, yMin, yMax]。也就是行和列的 index 范围。如下图所示：


作者：数据可视化
链接：https://juejin.cn/post/7072926133859123236
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。