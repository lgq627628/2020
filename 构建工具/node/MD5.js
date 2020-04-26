var crypto = require('crypto');
var fs = require('fs');

//从文件创建一个可读流
var stream = fs.createReadStream('./mscode_setup.exe');
var fsHash = crypto.createHash('md5');

stream.on('data', function(d) {
    fsHash.update(d);
});

stream.on('end', function() {
    var md5 = fsHash.digest('hex');
    console.log("文件的MD5是：%s", md5);
});
