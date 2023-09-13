import {randomInt, createRandomPicker} from './random.js';
export function sentence(pick, replacer) {
  let ret = pick(); // 返回一个句子文本
  for(const key in replacer) { // replacer是一个对象，存放替换占位符的规则
    // 如果 replacer[key] 是一个 pick 函数，那么执行它随机取一条替换占位符，否则将它直接替换占位符
    ret = ret.replace(new RegExp(`{{${key}}}`, 'g'),
      typeof replacer[key] === 'function' ? replacer[key]() : replacer[key]);
  }
  return ret;
}

export function generate(title, {
  corpus,
  min = 6000, // 文章最少字数
  max = 10000, // 文章最多字数
} = {}) {
  // 将文章长度设置为 min 到 max之间的随机数
  const articleLength = randomInt(min, max);

  const {famous, bosh_before, bosh, said, conclude} = corpus;
  const [pickFamous, pickBoshBefore, pickBosh, pickSaid, pickConclude] = [famous, bosh_before, bosh, said, conclude].map((item) => {
    return createRandomPicker(item);
});

const article = [];
let totalLength = 0;

while(totalLength < articleLength) {
  // 如果文章内容的字数未超过文章总字数
  let section = ''; // 添加段落
  const sectionLength = randomInt(200, 500); // 将段落长度设为200到500字之间
  // 如果当前段落字数小于段落长度，或者当前段落不是以句号。和问号？结尾
  while(section.length < sectionLength || !/[。？]$/.test(section)) {
    // 取一个 0~100 的随机数
    const n = randomInt(0, 100);
    if(n < 20) { // 如果 n 小于 20，生成一条名人名言，也就是文章中有百分之二十的句子是名人名言
      section += sentence(pickFamous, {said: pickSaid, conclude: pickConclude});
    } else if(n < 50) {
      // 如果 n 小于 50，生成一个带有前置从句的废话
      section += sentence(pickBoshBefore, {title}) + sentence(pickBosh, {title});
    } else {
      // 否则生成一个不带有前置从句的废话
      section += sentence(pickBosh, {title});
    }
  }
  // 段落结束，更新总长度
  totalLength += section.length;
  // 将段落存放到文章列表中
  article.push(section);
}

// 将文章返回，文章是段落数组形式
return article;
}