//引入shelljs
var shell = require('shelljs');

// shell.which(command) 在环境变量PATH中寻找指定命令的地址，判断该命令是否可执行，返回该命令的绝对地址。
//检查控制台是否以运行`git `开头的命令
if (!shell.which('git')) {
    //在控制台输出内容
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

shell.rm('-rf', 'out/Release'); //强制递归删除`out/Release目录`
shell.cp('-R', 'stuff/', 'out/Release'); //将`stuff/`中所有内容拷贝至`out/Release`目录

shell.cd('lib'); //进入`lib`目录
//找出所有的扩展名为js的文件，并遍历进行操作
shell.ls('*.js').forEach(function (file) {
    /* 这是第一个难点：sed流编辑器,建议专题学习，-i表示直接作用源文件 */
    //将build_version字段替换为'v0.1.2'
    shell.sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
    //将包含`REMOVE_THIS_LINE`字符串的行删除
    shell.sed('-i', /^.*REMOVE_THIS_LINE.*$/, '', file);
    //将包含`REPLACE_LINE_WITH_MACRO`字符串的行替换为`macro.js`中的内容
    shell.sed(
        '-i',
        /.*REPLACE_LINE_WITH_MACRO.*\n/,
        shell.cat('macro.js'),
        file
    );
});

//返回上一级目录
shell.cd('..');

//run external tool synchronously
//即同步运行外部工具
if (shell.exec('git commit -am "Auto-commit"').code !== 0) {
    shell.echo('Error: Git commit failed');
    shell.exit(1);
}
