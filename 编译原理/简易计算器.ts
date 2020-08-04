import lexicalAnalyser from './词法分析'
import { TokenType } from './词法分析'
let ast = null

let tokenList = lexicalAnalyser('2 + 3 * 5')
console.log(tokenList)

let token = tokenList.shift()
console.log(token)

if (token && token.getType() === TokenType.Let) {

}
