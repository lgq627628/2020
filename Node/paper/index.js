import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, resolve} from 'path';
import moment from 'moment';
import commandLineArgs from 'command-line-args'; // 方便处理命令行参数，包括重复错误的参数
import commandLineUsage from 'command-line-usage'; // 方便书写 help 帮助文档
import {generate} from './lib/generator.js';
import {createRandomPicker} from './lib/random.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadCorpus(src) {
  const path = resolve(__dirname, src);
  const data = readFileSync(path, {encoding: 'utf-8'});
  return JSON.parse(data);
}
function saveToFile(title, article) {
  const outputDir = resolve(__dirname, 'output');
  const time = moment().format('-YYYY-MM-DD-HH:mm:ss');
  const outputFile = resolve(outputDir, `${title}${time}.md`);

  // 检查outputDir是否存在，没有则创建一个
  if(!existsSync(outputDir)) {
    mkdirSync(outputDir);
  }

  const text = `${title}\n\n    ${article.join('\n    ')}`;
  writeFileSync(outputFile, text); // 将text写入outputFile文件中

  return outputFile;
}
function parseOptions(options = {}) {
  const argv = process.argv;
  for(let i = 2; i < argv.length; i++) {
    const cmd = argv[i - 1];
    const value = argv[i];
    if(cmd === '--title') {
      options.title = value;
    } else if(cmd === '--min') {
      options.min = Number(value);
    } else if(cmd === '--max') {
      options.max = Number(value);
    }
  }
  return options;
}

// 定义帮助的内容
const sections = [
  {
    header: '狗屁不通文章生成器',
    content: '生成随机的文章段落用于测试',
  },
  {
    header: 'Options',
    optionList: [
      {
        name: 'title',
        typeLabel: '{underline string}',
        description: '文章的主题。',
      },
      {
        name: 'min',
        typeLabel: '{underline number}',
        description: '文章最小字数。',
      },
      {
        name: 'max',
        typeLabel: '{underline number}',
        description: '文章最大字数。',
      },
    ],
  },
];
const usage = commandLineUsage(sections); // 生成帮助文本
// 配置我们的命令行参数
const optionDefinitions = [
  {name: 'help'}, // help命令配置
  {name: 'title', alias: 't', type: String},
  {name: 'min', type: Number},
  {name: 'max', type: Number},
];
const corpus = loadCorpus('corpus/data.json');
const options = commandLineArgs(optionDefinitions); // 获取命令行的输入
// const options = parseOptions();
if('help' in options) { // 如果输入的是help，就打印帮助文本
  console.log(usage);
} else {
  const title = options.title || createRandomPicker(corpus.title)();
  const article = generate(title, {corpus, ...options});
  const output = saveToFile(title, article);
  
  console.log(`🚀《${title}》文章已经成功生成，保存在：
🎉 ${output}`);
}