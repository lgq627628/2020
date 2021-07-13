const INIT = 'init';                        // 初始状态
const TAG_START = 'tagStart';               // 解析开始标签 <div
const ATTR_START = 'attrStart';   // 开始解析属性
const ATTR_VALUE = 'attrValue';   // 解析属性值
const ATTR_END = 'attrEnd';       // 解析一个属性结束
const TAG_END = 'tagEnd';                   // 解析开始标签结束 div>
const OPEN_TAG = 'openTag';                 // 打开了一个标签 上一个标签未闭合 <div>xx<div
const CLOSE_TAG = 'closeTag';               // 解析完成一个标签，关闭
const CLOSE_TAG_START = 'closeTagStart';    // 开始解析结束标签  </div
const CLOSE_TAG_END = 'closeTagEnd';        // 解析结束标签结束  /div>

const regMap = {
    isLetter: /[a-zA-Z]/,
    isEmpty: /[\s\n]/,
};

const $reg = {};
Object.keys(regMap).forEach(key => {
    const reg = regMap[key];
    $reg[key] = str => reg.test(str);
});

class Node {
    constructor({ tag }) {
        this.tag = tag;
        this.attrs = {};
        this.text = '';
        this.children = [];
    }
}
class ParseHtml {
    constructor(html) {
        this.html = html;
        this.i = 0;
        this.status = INIT;
        this.tagStack = [];
        this.root = null;
        this.parentNode = null;
        this.curNode = null;
        this.tagName = '';
        this.attrName = '';
        this.attrValue = '';
        this.text = '';
        this.$reg = $reg;
    }
    preHandle() { // 先简单整理下 html，比如合并多余空格 
        this.html = this.html.replace(/\n[ ]+/g, '')
            .replace(/\n/g, '')
            .replace(/[ ]+/g, ' ')
            .replace(/<[\s]+/g, '<')
            .replace(/[\s]+>/g, '>')
            .replace(/[\s]+\/>/g, '/>')
            .replace(/[\s]*=[\s]*"/g, '="');
    }
    parse() {
        this.preHandle()
        while(this.i < this.html.length) {
            const s = this.html[this.i];
            const prev = this.html[this.i - 1];
            const next = this.html[this.i + 1];

            switch (this.status) {
                case INIT:
                    this.parseInit(s, prev, next);
                    break;
                case TAG_START:
                    this.parseTagStart(s, prev, next);
                    break;
                case ATTR_START:
                    this.parseAttrStart(s, prev, next);
                    break;
                case ATTR_VALUE:
                    this.parseAttrValue(s, prev, next);
                    break;
                case ATTR_END:
                    this.parseAttrEnd(s, prev, next);
                    break;
                case TAG_END:
                    this.parseTagEnd(s, prev, next);
                    break;
                case OPEN_TAG:
                    this.parseOpenTag(s, prev, next);
                    break;
                case CLOSE_TAG_START:
                    this.parseCloseTagStart(s, prev, next);
                    break;
                case CLOSE_TAG_END:
                    this.parseCloseTagEnd(s, prev, next);
                    break;
                default: 
                    break;
            }
            this.i++;
        }
        return this.root;
    }
    parseInit(s) {
        if (s === '<') this.status = TAG_START;
    }
    parseTagStart(s, prev, next) {
        const handle = isSelfCloseTag => {
            if (this.root) {
                this.parentNode = this.curNode;
                this.curNode = new Node({ tag: this.tagName });
                this.parentNode.children.push(this.curNode);
            } else {
                this.root = new Node({ tag: this.tagName });
                this.curNode = this.root;
                this.parentNode = null;
            }
            if (isSelfCloseTag) {

            } else {
                this.tagStack.push(this.curNode);
            }
        }
        if (this.$reg.isLetter(s)) {
            this.tagName += s;
        } else if (this.$reg.isEmpty(s) && this.$reg.isLetter(next)) {
            handle();
            this.status = ATTR_START;
        }
        if (next === '>') {
            handle();
            this.status = TAG_END;
        }
    }
    parseAttrStart(s, prev, next) { // 开始解析属性
        if (s !== '=') this.attrName += s
        if ([' ', '>'].includes(next) || (next + this.html[this.i + 2]) === '/>') {
            this.curNode.attrs[this.attrName] = this.attrValue;
            this.attrName = '';
            this.attrValue = '';
        }
        if (next === ' ') {
            this.status = ATTR_END;
        } else if (next === '>' || (next + this.html[this.i + 2]) === '/>') {
            this.status = TAG_END;
        } else if (next === '"') {
            this.status = ATTR_VALUE;
        }
    }
    parseAttrValue(s, prev, next) { // 解析属性值开始
        if (s !== '"') this.attrValue += s;
        if (next === '"') {
            this.curNode.attrs[this.attrName] = this.attrValue;
            this.attrName = '';
            this.attrValue = '';
            this.status = ATTR_END;
        }
    }
    parseAttrEnd(s, prev, next) { // 解析属性结束
        if (this.$reg.isEmpty(s)) {
            this.status = ATTR_START;
        }
        if(next === '>' || (next + this.html[this.i + 2]) === '/>') {
            this.status = TAG_END;
        }
    }
    parseTagEnd(s, prev, next) { // 解析开始标签结束
        if (prev + s === '/>') { // 自闭合标签
            this.status = CLOSE_TAG_END;
            this.i--;

        } else if (s === '>') {
            this.tagName = '';
            this.status = OPEN_TAG;
        }
    }
    parseOpenTag(s, prev, next) { // 打开了一个标签
        if (s === '<') {
            if (next === '/') {
                this.status = CLOSE_TAG_START;
            } else {
                this.status = TAG_START;
            }
        } else {
            this.curNode.text += s;
        }
    }
    parseCloseTagStart(s, prev, next) { // 解析完成一个标签，关闭
        if (this.$reg.isLetter(s)) {
            this.tagName += s;
        } else if (this.$reg.isEmpty(s)) {
            throw new Error('解析闭合标签失败1: ' + this.tagName);
        }
        if (next === '>') {
            this.status = CLOSE_TAG_END;
        }
    }
    parseCloseTagEnd(s, prev, next) { // 解析结束标签结束
        const delEmptyProp = node => {
            if (!node.text) delete node.text;
            if (!node.children.length) delete node.children;
            if (!Object.keys(node.attrs).length) delete node.attrs;
        }
        if (s === '>') {
            const topTag = this.getTopTag();
            if (topTag.tag === this.tagName) {
                delEmptyProp(topTag);
                this.tagStack.pop();
                this.curNode = this.getTopTag();
                this.tagName = '';
                this.status = OPEN_TAG;
            } else {
                throw new Error('解析闭合标签失败2: ' + this.tagName);
            }
        }
    }
    getTopTag() {
        return this.tagStack[this.tagStack.length - 1];
    }
}


const html = `
    <div>
        <div class="text" contentEditable id=  style="color: red;"</div>
        <button class="blue-button" id="countButton">点击我</button>
        <br/>
        <img src="./htmlParser1.png"/>
        <ul>
            <li key="1">list  1</li>
            <li key="2">list 2</li>
        </ul>
    </div>
`;
const parseHtml = new ParseHtml(html);
const ast = parseHtml.parse();
console.log(ast);