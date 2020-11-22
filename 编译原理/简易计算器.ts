import lexicalAnalyser from './词法分析'
import { TokenType } from './词法分析'
let ast = null

let tokenList = lexicalAnalyser('2 + 3 * 5')
console.log(tokenList)

let token = tokenList.shift()
console.log(token)

if (token && token.getType() === TokenType.Let) {

}


function Expression(tokens){
  if(tokens[0].type === "AdditiveExpression" && tokens[1] && tokens[1].type === "EOF" ) {
      let node = {
          type:"Expression",
          children:[tokens.shift(), tokens.shift()]
      }
      tokens.unshift(node);
      return node;
  }
  AdditiveExpression(tokens);
  return Expression(tokens);
}


function AdditiveExpression(tokens) {
  if(tokens[0].type === "MultiplicativeExpression") {
    let node = {
      type:"AdditiveExpression",
      children:[tokens[0]]
    }
    tokens[0] = node;
    return node;
  } else if(tokens[0].type === "AdditiveExpression" && tokens[1].type === '+') {
    let node = {
      type:"AdditiveExpression",
      operator:"+",
      children:[tokens.shift(), tokens.shift(), MultiplicativeExpression(tokens)]
    }
    tokens.unshift(node);
  } else if(tokens[0].type === "AdditiveExpression" && tokens[1].type === '-') {
    let node = {
      type:"AdditiveExpression",
      operator:"-",
      children:[tokens.shift(), tokens.shift(), MultiplicativeExpression(tokens)]
    }
    tokens.unshift(node);
  }
}

function MultiplicativeExpression(tokens) {

}

function evaluate(node) { // 计算过程
  let {type, value, operator, children} = node
  if (type === 'Expression') { // 表达式
    return evaluate(children[0])
  } else if (type === 'AdditiveExpression') { // +-
    if (operator === '+') {
      return evaluate(children[0]) + evaluate(children[2])
    } else if (operator === '-') {
      return evaluate(children[0]) - evaluate(children[2])
    }
    return evaluate(children[0])
  } else if (type === 'MultiplicativeExpression') { // */
    if (operator === '*') {
      return evaluate(children[0]) * evaluate(children[2])
    } else if (operator === '/') {
      return evaluate(children[0]) / evaluate(children[2])
    }
    return evaluate(children[0])
  } else if (type === 'Number') { // 纯数字
    return Number(value)
  }
}
