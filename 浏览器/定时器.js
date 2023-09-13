// 定义定时器类
class CustomTimer {
  constructor(callback, interval) {
    this.callback = callback;
    this.interval = interval;
    this.startTime = null;
    this.rafId = null;
  }

  // 启动定时器
  start() {
    this.startTime = performance.now();
    this.loop(this.startTime);
  }

  // 停止定时器
  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // 循环调用
  loop(currentTime) {
    if (currentTime - this.startTime >= this.interval) {
      this.callback();
      this.startTime = currentTime;
    }

    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
}

// 使用示例
const timerCallback = () => {
  console.log('Hello, world!');
};

const timer = new CustomTimer(timerCallback, 1000); // 每隔 1000ms（1s） 输出 "Hello, world!"
timer.start(); // 启动定时器

// 停止定时器
// timer.stop();