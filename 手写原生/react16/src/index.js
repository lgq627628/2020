import React from './react';
import ReactDOM from './react-dom';
const style = {
  border: '2px solid red',
  padding: '5px',
  margin: '5px'
}
let app = (
  <div id="A" style={style}>
    A1
    <div id="A2" style={style}>
      <div id="B1" style={style}>B1</div>
      <div id="B2" style={style}>B2</div>
    </div>
    <div id="A3" style={style}>
      <div id="B3" style={style}>B3</div>
      <div id="B4" style={style}>B4</div>
    </div>
  </div>
)
app = React.createElement("div", {
  id: "A",
  style: style
}, "A1", /*#__PURE__*/React.createElement("div", {
  id: "A2",
  style: style
}, /*#__PURE__*/React.createElement("div", {
  id: "B1",
  style: style
}, "B1"), /*#__PURE__*/React.createElement("div", {
  id: "B2",
  style: style
}, "B2")), /*#__PURE__*/React.createElement("div", {
  id: "A3",
  style: style
}, /*#__PURE__*/React.createElement("div", {
  id: "B3",
  style: style
}, "B3"), /*#__PURE__*/React.createElement("div", {
  id: "B4",
  style: style
}, "B4")));
ReactDOM.render(app, document.getElementById('root'))