function Expression(source){
  if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "EOF" ) {
      let node = {
          type:"Expression",
          children:[source.shift(), source.shift()]
      }
      source.unshift(node);
      return node;
  }
  AdditiveExpression(source);
  return Expression(source);
}
function AdditiveExpression(source){
  if(source[0].type === "MultiplicativeExpression") {
      let node = {
          type:"AdditiveExpression",
          children:[source[0]]
      }
      source[0] = node;
      return AdditiveExpression(source);
  }
  if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "+") {
      let node = {
          type:"AdditiveExpression",
          operator:"+",
          children:[]
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      MultiplicativeExpression(source);
      node.children.push(source.shift());
      source.unshift(node);
      return AdditiveExpression(source);
  }
  if(source[0].type === "AdditiveExpression" && source[1] && source[1].type === "-") {
      let node = {
          type:"AdditiveExpression",
          operator:"-",
          children:[]
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      MultiplicativeExpression(source);
      node.children.push(source.shift());
      source.unshift(node);
      return AdditiveExpression(source);
  }
  if(source[0].type === "AdditiveExpression")
      return source[0];
  MultiplicativeExpression(source);
  return AdditiveExpression(source);
}
function MultiplicativeExpression(source){
  if(source[0].type === "Number") {
      let node = {
          type:"MultiplicativeExpression",
          children:[source[0]]
      }
      source[0] = node;
      return MultiplicativeExpression(source);
  }
  if(source[0].type === "MultiplicativeExpression" && source[1] && source[1].type === "*") {
      let node = {
          type:"MultiplicativeExpression",
          operator:"*",
          children:[]
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      node.children.push(source.shift());
      source.unshift(node);
      return MultiplicativeExpression(source);
  }
  if(source[0].type === "MultiplicativeExpression"&& source[1] && source[1].type === "/") {
      let node = {
          type:"MultiplicativeExpression",
          operator:"/",
          children:[]
      }
      node.children.push(source.shift());
      node.children.push(source.shift());
      node.children.push(source.shift());
      source.unshift(node);
      return MultiplicativeExpression(source);
  }
  if(source[0].type === "MultiplicativeExpression")
      return source[0];

  return MultiplicativeExpression(source);
};

var source = [{
  type:"Number",
  value: "3"
}, {
  type:"*",
  value: "*"
}, {
  type:"Number",
  value: "300"
}, {
  type:"+",
  value: "+"
}, {
  type:"Number",
  value: "2"
}, {
  type:"*",
  value: "*"
}, {
  type:"Number",
  value: "256"
}, {
  type:"EOF"
}];
var ast = Expression(source);

console.log(JSON.stringify(ast, null, 4));
