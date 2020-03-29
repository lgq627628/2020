const Koa = require('koa');
const router = require('koa-router')();
const koaBody = require('koa-body')({
  multipart: true,  // 允许上传多个文件
});
const fse = require('fs-extra');
const path = require('path');
const app = new Koa();

app.use(koaBody);

router.get('/', async (ctx, next) => {
  ctx.response.body = 'xxx';
});
router.post('/upload', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  // 文件和其他数据是分开的
  const file = ctx.request.files.file; // 获取上传文件
  let filename = ctx.request.body.filename
  let dirname = filename.split('-')[0]
  let filePath = path.resolve(__dirname, 'upload', dirname)
  if (!fse.existsSync(filePath)) {
    await fse.mkdirs(filePath)
  }
  // file.path 是上传到服务器临时存储的地方
  await fse.move(file.path, `${filePath}/${filename}`)
  ctx.response.body = 'ok'
});
router.post('/merge', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', '*');
  ctx.response.body = 'ok'

});
router.get('*', async (ctx, next) => {
  ctx.response.body = '没有路由的接口哦';
})
app.use(router.routes());

app.listen(3000);
