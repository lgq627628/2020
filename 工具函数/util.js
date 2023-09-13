// 金钱加分号
const thousand = num => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const money = thousand(19941112);

// '3423534634634'.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
// money => "19,941,112"

// 生成随机ID
const randomId = len =>
  Math.random()
    .toString(36)
    .substr(3, len);
const id = randomId(10);
// id => "jg7zpgiqva"

// 生成随机HEX色值
const randomColor = () =>
  '#' +
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padEnd(6, '0');
const color = randomColor();
// color => "#f03665"

// 生成星级评分
const startScore = rate => '★★★★★☆☆☆☆☆'.slice(5 - rate, 10 - rate);
const start = startScore(3);
// start => "★★★"

// 操作URL查询参数
const params = new URLSearchParams(location.search); // location.search = "?name=yajun&sex=female"
params.has('yajun'); // true
params.get('sex'); // "female"

// 补零
const fillZero = (num, len) => num.toString().padStart(len, '0');
const num = fillZero(169, 5);
// num => "00169"
// 骚操作补零 `00${mins}`.slice(-2),

// 精确小数
const round = (num, decimal) => Math.round(num * 10 ** decimal) / 10 ** decimal;
const num = round(1.69, 1);
// num => 1.7

// 取最小最大值
const arr = [0, 1, 2];
const min = Math.min(...arr);
const max = Math.max(...arr);
// min max => 0 2

// 是否为空数组
const arr = [];
const flag = Array.isArray(arr) && !arr.length;
// flag => true

// 是否为空对象
const obj = {};
const flag =
  !Array.isArray(obj) &&
  Object.prototype.toString.call(obj) &&
  !Object.keys(obj).length;
// flag => true

// 克隆数组
const _arr = [0, 1, 2];
const arr = [..._arr];
// arr => [0, 1, 2]

// 合并数组
const arr1 = [0, 1, 2];
const arr2 = [3, 4, 5];
const arr = [...arr1, ...arr2];
// arr => [0, 1, 2, 3, 4, 5];

// 去重数组
const arr = [...new Set([0, 1, 1, null, null])];
// arr => [0, 1, null]

// 混淆数组，打乱数组，数组乱序
const arr = [0, 1, 2, 3, 4, 5].slice().sort(() => Math.random() - 0.5);
// arr => [3, 4, 0, 5, 1, 2]

// 统计元素个数
const arr = [0, 1, 1, 2, 2, 2];
const count = arr.reduce((t, c) => {
  t[c] = t[c] ? ++t[c] : 1;
  return t;
}, {});
// count => { 0: 1, 1: 2, 2: 3 }

// 创建指定长度且值相等的数组
const arr = [...new Array(3).keys()].fill(0);
// arr => [0, 0, 0]

// 对象字面量：获取环境变量时必用此方法
const env = 'prod';
const link = {
  dev: 'Development Address',
  test: 'Testing Address',
  prod: 'Production Address'
}[env];
// env => "Production Address"

// 创建纯空对象
const obj = Object.create(null);
Object.prototype.a = 0;
// obj => {}

// 删除无用属性
const obj = {
  a: 0,
  b: 1,
  c: 2
}; // 只想拿b和c
const { a, ...rest } = obj;
// rest => { b: 1, c: 2 }

// 一次性函数：适用于运行一些只需执行一次的初始化代码
function Func() {
  console.log('x');
  Func = function() {
    console.log('y');
  };
}

// 惰性载入函数：函数内判断分支较多较复杂时可大大节约资源开销
function Func() {
  if (a === b) {
    console.log('x');
  } else {
    console.log('y');
  }
}
// 换成
function Func() {
  if (a === b) {
    Func = function() {
      console.log('x');
    };
  } else {
    Func = function() {
      console.log('y');
    };
  }
  return Func();
}

// 检测非空参数
function IsRequired() {
  throw new Error('param is required');
}

function Func(name = IsRequired()) {
  console.log('I Love ' + name);
}
Func(); // "param is required"
Func('you'); // "I Love you"

// 字符串创建函数
const Func = new Function('name', 'console.log("I Love " + name)');

// 优雅处理错误信息
try {
  Func();
} catch (e) {
  location.href = 'https://stackoverflow.com/search?q=[js]+' + e.message;
}

// 显示全部DOM边框：调试页面元素边界时使用
[].forEach.call($$('*'), dom => {
  dom.style.outline =
    '1px solid #' + (~~(Math.random() * (1 << 24))).toString(16);
});

// 自适应页面：页面基于一张设计图但需做多款机型自适应，元素尺寸使用rem进行设置
function AutoResponse(width = 750) {
  const target = document.documentElement;
  target.clientWidth >= 600
    ? (target.style.fontSize = '80px')
    : (target.style.fontSize = (target.clientWidth / width) * 100 + 'px');
}

// 调起键盘
(_ =>
  [..."`1234567890-=~~QWERTYUIOP[]\\~ASDFGHJKL;'~~ZXCVBNM,./~"].map(
    x =>
      ((o += `/${(b = '_'.repeat(
        (w =
          x < y
            ? 2
            : ' 667699'[
                ((x = ['Bs', 'Tab', 'Caps', 'Enter'][p++] || 'Shift'), p)
              ])
      ))}\\|`),
      (m += y + (x + '    ').slice(0, w) + y + y),
      (n += y + b + y + y),
      (l += ' __' + b))[73] && (k.push(l, m, n, o), (l = ''), (m = n = o = y)),
    (m = n = o = y = '|'),
    (p = l = k = [])
  ) &&
  k.join`
`)();

// 加 url 前缀
function staticSource(source, width, height) {
  if (!source) return;
  const src = source.trim();
  if (!source) return '';
  if (
    src.startsWith('data') ||
    src.startsWith('base64') ||
    src.startsWith('http')
  ) {
    return src;
  }
  return (
    STATIC_URL +
    src +
    (width && height
      ? `?x-oss-process=image/resize,m_fill,h_${height},w_${width}`
      : '')
  );
}

// 时间转换器
function dateFilter(time, type) {
  let format = value => {
    return value >= 10 ? value : '0' + value;
  };
  if (time === 0) {
    return '-';
  }
  let date = new Date(time * 1000);
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let second = date.getSeconds();
  let result;
  switch (type) {
    case 0: // 01-05
      result = `${format(month)}-${format(day)}`;
      break;
    case 1: // 11:12
      result = `${format(hours)}-${format(minutes)}`;
      break;
    case 2: // 2015-01-05
      result = `${year}-${format(month)}-${format(day)}`;
      break;
    case 3: // 2015-01-05 11:12
      result = `${year}-${format(month)}-${format(day)}  ${format(
        hours
      )}:${format(minutes)}`;
      break;
    case 4: // 2015-01-05 11:12:06
      result = `${year}-${format(month)}-${format(day)}  ${format(
        hours
      )}:${format(minutes)}:${format(second)}`;
      break;
    case 5: // h小时m分钟
      result = `${format(hours)}小时${format(minutes)}分钟`;
      break;
    case 6: // 2017年08月29日
      result = `${year}年${format(month)}月${format(day)}日`;
      break;
    default:
      result = `${year}-${format(month)}-${format(day)}  ${format(
        hours
      )}:${format(minutes)}`;
      break;
  }
  return result;
}
