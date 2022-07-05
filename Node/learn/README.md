## 请求多文件：采用流优化而不是并行优化

发送请求       等待服务端响应         接收响应
---------+----------------------+------------->
         --                                        解析请求
           ------                                  读取a.js
                 ------                            读取b.js
                       ------                      读取c.js
                             --                    合并数据
                               --                  输出响应

可以看到，第一版代码依次把请求的文件读取到内存中之后，再合并数据和输出响应。这会导致以下两个问题：

当请求的文件比较多比较大时，串行读取文件会比较耗时，从而拉长了服务端响应等待时间。

由于每次响应输出的数据都需要先完整地缓存在内存里，当服务器请求并发数较大时，会有较大的内存开销。

对于第一个问题，很容易想到把读取文件的方式从串行改为并行。但是别这样做，因为对于机械磁盘而言，因为只有一个磁头，尝试并行读取文件只会造成磁头频繁抖动，反而降低IO效率。而对于固态硬盘，虽然的确存在多个并行IO通道，但是对于服务器并行处理的多个请求而言，硬盘已经在做并行IO了，对单个请求采用并行IO无异于拆东墙补西墙。因此，正确的做法不是改用并行IO，而是一边读取文件一边输出响应，把响应输出时机提前至读取第一个文件的时刻。这样调整后，整个请求处理过程变成下边这样。

发送请求 等待服务端响应 接收响应
---------+----+------------------------------->
         --                                        解析请求
           --                                      检查文件是否存在
             --                                    输出响应头
               ------                              读取和输出a.js
                     ------                        读取和输出b.js
                           ------                  读取和输出c.js
按上述方式解决第一个问题后，因为服务器不需要完整地缓存每个请求的输出数据了，第二个问题也迎刃而解。可以看到，第二版代码在检查了请求的所有文件是否有效之后，立即就输出了响应头，并接着一边按顺序读取文件一边输出响应内容。并且，在读取文件时，第二版代码直接使用了只读数据流来简化代码。

```js
// 优化前
function combineFiles(pathnames, callback) {
    var output = [];

    (function next(i, len) {
        if (i < len) {
            fs.readFile(pathnames[i], function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    output.push(data);
                    next(i + 1, len);
                }
            });
        } else {
            callback(null, Buffer.concat(output));
        }
    }(0, pathnames.length));
}
// 优化后
function outputFiles(pathnames, writer) {
    (function next(i, len) {
        if (i < len) {
            var reader = fs.createReadStream(pathnames[i]);

            reader.pipe(writer, { end: false });
            reader.on('end', function() {
                next(i + 1, len);
            });
        } else {
            writer.end();
        }
    }(0, pathnames.length));
}
```

## 服务器自身的稳定性保障：守护进程
从工程角度上讲，没有绝对可靠的系统。即使第二次迭代的代码经过反复检查后能确保没有bug，也很难说是否会因为NodeJS本身，或者是操作系统本身，甚至是硬件本身导致我们的服务器程序在某一天挂掉。因此一般生产环境下的服务器程序都配有一个守护进程，在服务挂掉的时候立即重启服务。一般守护进程的代码会远比服务进程的代码简单，从概率上可以保证守护进程更难挂掉。如果再做得严谨一些，甚至守护进程自身可以在自己挂掉时重启自己，从而实现双保险。

因此在本次迭代时，我们先利用NodeJS的进程管理机制，将守护进程作为父进程，将服务器程序作为子进程，并让父进程监控子进程的运行状态，在其异常退出时重启子进程。
```js
var cp = require('child_process');

var worker;

function spawn(server, config) {
    worker = cp.spawn('node', [ server, config ]);
    worker.on('exit', function (code) {
        if (code !== 0) {
            spawn(server, config);
        }
    });
}

function main(argv) {
    spawn('server.js', argv[0]);
    process.on('SIGTERM', function () { // 收到信号之后
        worker.kill();
        process.exit(0);
    });
}

main(process.argv.slice(2));
```


## 部署
一般而言，程序在服务器上有一个固定的部署目录，每次程序有更新后，都重新发布到部署目录里。而一旦完成部署后，一般也可以通过固定的服务控制脚本启动和停止服务。因此我们的服务器程序部署目录可以做如下设计。

- deploy/
    - bin/  服务控制脚本
        startws.sh
        killws.sh
    + conf/  配置文件
        config.json
    + lib/  服务器代码
        daemon.js
        server.js

```js
// start.sh
#!/bin/sh
if [ ! -f "pid" ]
then
    node ../lib/daemon.js ../conf/config.json &
    echo $! > pid
fi

// killws.sh
#!/bin/sh
if [ -f "pid" ]
then
    kill $(tr -d '\r\n' < pid)
    rm pid
fi
```
