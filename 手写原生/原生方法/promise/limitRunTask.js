function limitRunTask(allTasks, limitNum) {
  let loop = 0
  let rs = []

  function run(task) {
    if (!task.length) return Promise.resolve(rs)
    return Promise.all(task).then(res => {
      rs.push(...res)
      loop++
      run(allTasks.slice(loop * limitNum, loop * limitNum + limitNum))
    })
  }

  return run(allTasks.slice(loop * limitNum, loop * limitNum + limitNum))
}

limitRunTask(tasks, 2).then(console.log) // 实现并发数为 n 的调用
