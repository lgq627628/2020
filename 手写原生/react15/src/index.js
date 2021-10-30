import React from './react'


// 方式一：普通字符串渲染
// React.render('哈哈哈', document.getElementById('root'))


// 方式二：jsx 渲染
// function handleClick() {
//     alert('1111')
// }
// const jsx = React.createElement("div", {
//     class: "xx",
//     style:  { background: 'yellow' },
//     onClick: handleClick
//   }, "hello", React.createElement("span", {
//     style:  {color: 'red', background: 'lightgreen'}
//   }, " water!"));
// React.render(jsx, document.getElementById('root'))



// // 方式三：类式组件渲染
// class BoxItem extends React.Component {
//   render() {
//     return `组件 id 为${this._reactId}`
//   }
// }
// class Box extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       num: 0
//     }
//   }
//   handleAdd = () => {
//     this.setState({ num: this.state.num + 1 })
//   }
//   render() {
//     return React.createElement('div', {
//       class: 'xx',
//       style:  { background: 'yellow' },
//       onClick: this.handleAdd
//     },
//     'hello',
//     React.createElement("span", {
//       style:  { color: 'red', background: 'lightgreen'}
//     }, ' water!'),
//     'name: ' + this.props.name,
//     'num: ' + this.state.num,
//     React.createElement(BoxItem, null, '六六六', React.createElement(BoxItem), React.createElement(BoxItem)))
//   }
// }
// React.render(React.createElement(Box, {name: '哦ono'}), document.getElementById('root'))



// setState 案例
class Box extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0
    }
  }
  componentDidMount() {
    setInterval(() => {
      this.setState({ num: this.state.num + 1 })
    }, 1000);
  }
  render() {
    return React.createElement('div', {
      class: 'xx',
      style:  { background:this.state.num % 2 === 0 ? 'red' : 'green' },
    },
    'hello',
    this.props.name,
    React.createElement("span", {
      style:  { color: 'red', background: 'yellow'}
    }, this.state.num))
  }
}
React.render(React.createElement(Box, {name: '哦ono'}), document.getElementById('root'))