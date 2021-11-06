import React from './react';
import ReactDOM from './react-dom';
const style = {
  display: 'block',
  border: '2px solid red',
  padding: '5px',
  margin: '5px'
}
let app = (
  <div id="A" style={style}>
    A
    <div id="A1" style={style}>
      A1
      <span id="B1" style={style}>B1</span>
      <span id="B2" style={style}>B2</span>
    </div>
    <div id="A2" style={style}>
      A2
      <span id="C1" style={style}>C1</span>
      <span id="C2" style={style}>C2</span>
    </div>
  </div>
)
app = React.createElement("div", {
  id: "A",
  style: style
}, "A", /*#__PURE__*/React.createElement("div", {
  id: "A1",
  style: style
}, "A1", /*#__PURE__*/React.createElement("span", {
  id: "B1",
  style: style
}, "B1"), /*#__PURE__*/React.createElement("span", {
  id: "B2",
  style: style
}, "B2")), /*#__PURE__*/React.createElement("div", {
  id: "A2",
  style: style
}, "A2", /*#__PURE__*/React.createElement("span", {
  id: "C1",
  style: style
}, "C1"), /*#__PURE__*/React.createElement("span", {
  id: "C2",
  style: style
}, "C2")));
ReactDOM.render(app, document.getElementById('root'))