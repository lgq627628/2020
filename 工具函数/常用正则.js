// 常用正则表达式，不错的网站 https://ihateregex.io/
// https://regexr.com/
// http://regexper.com/
// 以下是一些正则实操

// reg.test(str) // 返回布尔值
// str.match(reg) // 获取匹配结果，未匹配返回 null
// 如果我们的正则表达式尾部有 g 标志，match()会返回与完整正则表达式匹配的所有结果，但不会返回捕获组
// 如果我们没有使用g标志，match()就会返回第一个完整匹配（作为数组的第0项）及其相关的捕获组（作为数组的第1及第1+项）。

// 做正则题目的步骤：
// 1、是否用 test
// 2、是否是全局 g

// 字符串转数字
// 示例 1:
// 输入: "42"
// 输出: 42
// 示例 2:
// 输入: " -42"
// 输出: -42
// 示例 3: 输入: "4193 with words"
// 输出: 4193
// 示例 4: 输入: "words and 987"
// 输出: 0
let reg = /\s*([-\+]?[0-9]+).*/g;
let str = ' -42';
let rs = str.match(reg);
console.log(rs);

export class Utils {
    /** 是否是中文、英文、数字组成 */
    static isWord(str: string): boolean {
        return /[a-zA-Z0-9\u4e00-\u9fa5]/.test(str);
    }
    /** 是否都是英文 */
    static isEnglish(str: string): boolean {
        return /[a-zA-Z]/.test(str);
    }
    /** 是否都是中文 */
    static isChinese(str: string): boolean {
        return /[\u4e00-\u9fa5]/.test(str);
    }
    /** 是否都是数字 */
    static isNumber(str: string): boolean {
        return /[0-9]/.test(str);
    }
    /** 是否是标点符号 */
    static isSign(str: string): boolean {
        return Utils.isEnglishSign(str) || Utils.isChineseSign(str);
    }
    static isEnglishSign(str: string): boolean {
        return /[\\~!@#$%^&*()-+=_`|[\]{};:"='?/><.,——\x21-\x2f\x3a-\x40\x5b-\x60\x7B-\x7F]/.test(str);
    }
    /** 是否是中文标点符号，比如 。；，：“”（）、？《》！【】￥ */
    static isChineseSign(str: string): boolean {
        return /[’|」「\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\u3010\u3011\uffe5]/.test(str);
    }
}

// 替换 script 标签里面的内容
''.replace(/(?<=<script data-inject>).*?(?=<\/script>)/, 'xxxx')

// 替换 title 标签里面的内容
''.replace(/(?<=<title>).*?(?=<\/title>)/, 'xxxx')

// 替换注释里面的内容
''.replace(/(?<=<!-- remote-script-inject-start -->).*?(?=<!-- remote-script-inject-end -->)/, 'xxxx')