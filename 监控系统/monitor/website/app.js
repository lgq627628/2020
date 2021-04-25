const Koa = require('koa');
const app = new Koa();
const port = 3003;
const serve = require('koa-static');
// const cors = require('kcors');
// const sleep = require('./middleware/sleep');
// const api = require('./middleware/api');

// app.use(cors());
// app.use(sleep);
// app.use(api);
// app.use(res => {
//   res.body = 123;
// })
app.use(serve(__dirname + '/client'));

app.listen(port, () => {
  console.log(`listen port ${port}`);
});
