export function interact(questions) {
  // questions 是一个数组，内容如 {text, value}
  process.stdin.setEncoding('utf8');

  return new Promise((resolve) => {
    const answers = [];
    let i = 0;
    let {text, value} = questions[i++];
    console.log(`${text}(${value})`);
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read().slice(0, -1);
      answers.push(chunk || value); // 保存用户的输入，如果用户输入为空，则使用缺省值
      const nextQuestion = questions[i++];
      if(nextQuestion) { //如果问题还未结束，继续监听用户输入
        process.stdin.read();
        text = nextQuestion.text;
        value = nextQuestion.value;
        console.log(`${text}(${value})`);
      } else { // 如果问题结束了，结束readable监听事件
        resolve(answers);
      }
    });
  });
}