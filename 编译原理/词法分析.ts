
// DFA （Deterministic Finite Automaton）有限自动机
import Utils from './utils'

// let a = 10
export default function lexicalAnalyser(code) {
  const tokenList: Token[] = []

  let token = new Token('')
  for (let ch of code) {
    switch (token.state) {
      case DfaState.Initial:
        token = newToken(token, ch)
        break
      case DfaState.Identifier:
        if (Utils.isAlpha(ch) || Utils.isDigit(ch)) {
          token.appendText(ch)
        } else {
          token = newToken(token, ch)
        }
        break
      case DfaState.Let1:
        if (ch === 'e') {
          token.state = DfaState.Let2
          token.appendText(ch)
        } else if (Utils.isAlpha(ch) || Utils.isDigit(ch))  {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token.appendText(ch)
        } else {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token = newToken(token, ch)
        }
        break
      case DfaState.Let2:
        if (ch === 't') {
          token.state = DfaState.Let
          token.appendText(ch)
        } else if (Utils.isAlpha(ch) || Utils.isDigit(ch))  {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token.appendText(ch)
        } else {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token = newToken(token, ch)
        }
        break
      case DfaState.Let:
        if (Utils.isAlpha(ch) || Utils.isDigit(ch))  {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token.appendText(ch)
        } else {
          token = newToken(token, ch)
        }
        break
      case DfaState.Number:
        if (Utils.isDigit(ch))  {
          token.appendText(ch)
        } else if (Utils.isAlpha(ch)) {
          token.type = TokenType.Identifier
          token.state = DfaState.Identifier
          token.appendText(ch)
        } else {
          token = newToken(token, ch)
        }
        break
      case DfaState.GT:
        if (ch === '=') {
          token.type = TokenType.GE
          token.state = DfaState.GE
          token.appendText(ch)
        } else {
          token = newToken(token, ch)
        }
        break
      case DfaState.Equal:
        token = newToken(token, ch)
        break
      case DfaState.Plus:
        token = newToken(token, ch)
        break
      case DfaState.Minus:
        token = newToken(token, ch)
        break
      case DfaState.Multi:
        token = newToken(token, ch)
        break
      case DfaState.Divide:
        token = newToken(token, ch)
        break
      default:
        token = newToken(token, ch)
    }
  }

  tokenList.push(token)
  return tokenList

  function newToken(token: Token, ch: string) {
    if (token.type !== TokenType.None) tokenList.push(token)
    return new Token(ch)
  }
}

class Token {
  state: DfaState
  type: TokenType
  text: string = ''

  constructor(firstChar: string) {
    this.text = firstChar
    this.guessTypeAndState(firstChar)
  }
  guessTypeAndState(firstChar: string) {
    if (Utils.isAlpha(firstChar)) {
      if (firstChar === 'l') {
        this.type = TokenType.Let
        this.state = DfaState.Let1
      } else if (firstChar === 'c') {
        this.type = TokenType.Const
        this.state = DfaState.Const
      } else {
        this.type = TokenType.Identifier
        this.state = DfaState.Identifier
      }
    } else if (Utils.isDigit(firstChar)) {
      this.type = TokenType.Number
      this.state = DfaState.Number
    } else if (firstChar === '>') {
      this.type = TokenType.GT
      this.state = DfaState.GT
    } else if (firstChar === '=') {
      this.type = TokenType.Equal
      this.state = DfaState.Equal
    } else if (firstChar === '+') {
      this.type = TokenType.Plus
      this.state = DfaState.Plus
    } else if (firstChar === '-') {
      this.type = TokenType.Minus
      this.state = DfaState.Minus
    } else if (firstChar === '*') {
      this.type = TokenType.Multi
      this.state = DfaState.Multi
    } else if (firstChar === '/') {
      this.type = TokenType.Divide
      this.state = DfaState.Divide
    } else {
      this.type = TokenType.None
      this.state = DfaState.Initial
    }
  }
  appendText(ch: string) {
    this.text += ch
  }
  getType() {
    return this.type
  }
}

// enum TokenType { // 最终的 token 状态
//   None,
//   // 关键字
//   Let,
//   Const,
//   Identifier, // 变量名标识符
//   Number,
//   // 操作符
//   RelOp, // 比较操作符
//   GT,
//   Equal,
//   Plus,
//   Minus,
//   Multi,
//   Divide,
//   EOL, // end of line 表示换行符
//   EOF // end of file 表示程序结束
// }
export enum TokenType { // 最终的 token 状态
  None,
  // 关键字
  Let = '变量声明',
  Const = '常量声明',
  Identifier = '变量名', // 变量名标识符
  Number = '数字',
  RelOp = '比较操作符', // 比较操作符
  GT = '大于',
  GE = '大于等于',
  Equal = '等于',
  Plus = '加',
  Minus = '减',
  Multi = '乘',
  Divide = '除'
}

export enum DfaState { // 自动机的状态
  Initial,
  Let,
  Let1,
  Let2,
  Const,
  Identifier,
  Number,
  GT,
  GE,
  Equal,
  Plus,
  Minus,
  Multi,
  Divide
}

// let rs = lexicalAnalyser('let a = 10')
// let rs1 = lexicalAnalyser('leta >= 10')
// let rs2 = lexicalAnalyser('2 + 3 * 5')
// console.log(rs)
// console.log(rs1)
// console.log(rs2)
