const TOKEN_TYPE = ['NUMBER', 'VARIABLE', 'SYMBOL', 'EQUAL']
const reg = /([0-9]+)|([a-zA-Z]+)|([\+\-\*\/])|([=])/g;

class Tokenizer {
    constructor(code) {
        this.tokens = [];
        this.code = code;
        this.start();
    }
    start() {
        this.code.replace(reg, (val, ...args) => {
            const idx = args.slice(0, -1).findIndex(item => item);
            this.tokens.push(new Token(TOKEN_TYPE[idx], val))
        })
    }
}

class Token {
    constructor(type, val) {
        this.type = type;
        this.val = val;
    }
}

const code = 'const a = 1'
// debugger;
const tokens = new Tokenizer(code).tokens;
console.log(JSON.stringify(tokens, null, 4));