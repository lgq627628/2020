// 通过内容计算md5值
self.importScripts('/spark-md5.min.js')

self.onmessage = e => {
  // self.postMessage({
  //   "msg": "你好"
  // })
  const { fileList } = e.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  let percentage = 0;
  let count = 0;
  // 计算出hash
  const loadNext = index => {

    const reader = new FileReader(); //文件阅读对象
    reader.readAsArrayBuffer(fileList[index].file);
    reader.onload = e => { //事件
      count++;
      spark.append(e.target.result);
      if (count === fileList.length) {
        self.postMessage({
          percentage: 100,
          hash: spark.end()
        });
        self.close();
      } else {
        //还没读完
        percentage += 100/fileList.length; // 这个是用来存进度条的
        self.postMessage ({
          percentage
        });
        loadNext(count);
      }
    }
  }
  loadNext(0)
} // this 当前的线程
