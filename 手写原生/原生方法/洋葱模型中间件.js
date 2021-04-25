class Middleware {
  constructor() {
      this.middlewares = [];
  }
  use(fn) {
      if(typeof fn !== 'function') {
          throw new Error('Middleware must be function, but get ' + typeof fn);
      }
      this.middlewares.push(fn);
      return this;
  }
  run() {
      function dispatch(index) {
        const curMiddleware = middlewares[index];
        if (!curMiddleware) return
        try{
            const ctx = {};
            const result = curMiddleware(ctx, dispatch.bind(null, index + 1));
            return Promise.resolve(result);
        } catch(err) {
            return Promise.reject(err);
        }
      }

      const middlewares = this.middlewares;
      return dispatch(0);

  }
}

// 使用
const middleware = new Middleware();
middleware.use(async (ctx, next) => {
  console.log(1);
  await next();
  console.log(2);
});
middleware.use(async (ctx, next) => {
  console.log(3);
  await next();
  console.log(4);
});
middleware.run();// 1 3 4 2

