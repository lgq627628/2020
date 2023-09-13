enum TaskStatus {
  INIT = "INIT",
  READY = "READY",
  RUNNIGN = "RUNNIGN",
  SUCCESS = "SUCCESS",
  FAIL = "FAIL",
  DESTORY = "DESTORY",
}

enum QUEUE_STATUS {
  WORKING = "WORKING", // 工作中
  PAUSE = "PAUSE", // 暂停
  IDLE = "IDLE", // 空闲
  SHUTDOWN = "SHUTDOWN", // 关停
}

interface ICommonTask {
  /** 任务执行前准备工作，并返回判断任务是否继续执行 */
  onReady(): Promise<boolean>;
  /** 任务执行中 */
  onRun(): Promise<CommonTask[] | void>;
  /** 任务执行完毕，即将销毁 */
  onDestroy(): Promise<void>;
}

abstract class CommonTask implements ICommonTask {
  /** 生命周期钩子 **/
  abstract onReady: () => Promise<boolean>;
  abstract onRun: () => Promise<CommonTask[] | void>;
  abstract onDestroy: () => Promise<void>;
  /** 重置任务，会返回任务本身，该任务应该是被重置过的最初状态 **/
  abstract reset(): CommonTask;

  /** 执行任务 **/
  public async execute(): Promise<CommonTask[] | void> {
    // step 1 准备任务
    if (!(await this.onReady())) {
      // 任务准备校验不通过，直接没必要执行了
      return this.onDestroy();
    }
    // step 2 执行任务
    const runResult = await this.onRun();
    if (runResult) {
      // 若分裂出新的任务，返回并不再继续执行了
      return runResult;
    }
    // step 3 销毁任务
    this.onDestroy();
  }
}

class OtherTask implements ICommonTask {
  // 其他省略
  async onRun() {
    if (needATask) {
      return [new ATask(), this.resetTask()];
    }
    // 其他正常执行任务逻辑
  }
}

class ApiTask implements ICommonTask {
  async onReady() {
    const rs: any = await Promise.resolve();
    return rs?.isSuccess ? true : false;
  }
  async onRun() {}
  public reset() {
    // 销毁当前任务
    this.destroy();
    // 并返回一个重置后的新任务
    return new ATask();
  }
}

/** 任务管理器 */
class TaskManager {
  status: QUEUE_STATUS = QUEUE_STATUS.IDLE;
  // 暂停任务管理器
  public pause() {
    this.status = QUEUE_STATUS.PAUSE;
    // 当前正在运行的任务需要处理
  }
  // 恢复任务管理器
  public resume() {
    // 如果被关停了，则不能恢复啦
    if (isShutDown) {
      return;
    }
    this.status = QUEUE_STATUS.WORKING;
    this.work();
  }
  // 关停任务管理器
  public resume() {
    this.status = QUEUE_STATUS.SHUTDOWN;
  }
  // 任务管理器工作
  private async work() {
    if (!isWorking && hasNextTask) {
      // 如果满足条件，会继续执行下一个任务
      currentTask = getNextTask();
      const resultTask = await currentTask.execute().catch((error) => {
        // 异常处理
      });
      // 判断是否有分裂的新任务
      if (resultTask) {
        // 如果有，就塞回到任务队列的头部，需要优先处理
        taskList.unshift(resultTask);
      }
      // 继续执行下一个任务
      checkContinueWork();
    }
  }
  // 暂停任务管理器
  public pause() {
    this.status = QUEUE_STATUS.PAUSE;
    // 将当前任务重置，并扔回任务队列头部
    taskList.unshift(currentTask.reset());
  }
}
