import { ROOT_TAG } from "./const";
import { startBuild } from "./schedule";

function render(element, container) {
  const rootFiber = {
    tag: ROOT_TAG,
    dom: container,
    props: {
      children: [element]
    }
  }
  startBuild(rootFiber) // scheduleRoot
}

const ReactDOM = {
  render
}
export default ReactDOM