## FileReader
FileReader接口提供了读取文件的方法和包含读取结果的事件模型。

var reader = new FileReader();
- abort 中止读取操作
- readAsArrayBuffer 异步按字节读取文件内容，结果用 ArrayBuffer 对象表示
- readAsBinaryString 异步按字节读取文件内容，结果为文件的二进制串
- readAsDataURL 异步读取文件内容，结果用 data:url 的字符串形式表示
- readAsText 异步按字符读取文件内容，结果用字符串形式表示
