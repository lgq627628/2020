// 读取某个目录下的文件名列表
const glob = require("glob");

function makeList() {
  const list = {};
  const listPaths = glob.sync("./packages/components/**/index.js");
  listPaths.forEach((path) => {
    const entryKey = path.match(/packages\/components\/(.*)\/index.js/);
    console.log(entryKey);
  });
  return list;
}
const entryList = makeList();
