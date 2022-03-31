## shell 常用命令行
不错的ppt：https://cntchen.github.io/command-line-keynote/

- XXX --help

- 跳转目录
cd (change directory)
cd ./floder/path
cd ../
cd ~
cd /
pwd (print working directory)
cd - 跳转到上一个pwd


- autojump（a faster way to navigate your filesystem）
j part-of-your-path-name
jc
jo, jco


- 创建删除
touch 创建文件
mkdir 创建文件夹
rm -rf 删除文件夹,不用确定
mv 移动或重命名
cp -r 拷贝文件夹
cp -s target softlink 创建软链接
$ sudo rm -rf ./ tmp


- 查看查找
ls -al 全部文件和文件属性
which 寻找可执行文件位置
whereis $PATH 范围内的文件
locate 全文查找,在文件索引数据库中查找,快,先运行 sudo updatedb
du -sh, du -ah


- 查看查找 -- find
find -name PATTERN 查找模式匹配的文件名
find -wholename PATTERN 查找带路径的模式匹配的文件名
通配符号
* 0到多个字符
? 匹配任意字符
[list] list中任一字符
...
$ find -name '*.tpl'
$ find -wholename '\*apply/\*.tpl' # \*表示`*`


- 查看查找
grep (global regular expression print)
grep -rin 查找当前目录的文件内容,遍历,忽略大小写,显示匹配行编号
grep -rin3 显示匹配的文件行上下3行的内容,3可以替换为其他数字
Regexp
$ grep -rin 'webpack.'
$ find -wholename '*.tpl' | xargs grep -rin 'else if'

- 文本处理
sed
终端中的文本处理工具
增删改
$ sed -i "s#ajaxStart#AjaxStart#g" ./src/pages/f7.js


- 进程管理
ps aux 查看进程,所有,有效用户,忽略终端进程
kill -9 pid 杀死进程
top 动态查看进程变化
free 查看内存

- 网络管理
ping
netstat -lanp 监听中,所有,端口号,进程pid
lsof -i PORT (list open files)
$ ping www.mucfc.com
PING www.mucfc.com (127.0.0.1) 56(84) bytes of data.
Error: listen EADDRINUSE 0.0.0.0:8080
$ netstat -lanp | grep '8080'
$ lsof -i :8080


- alias 别名
git
rm
vscode


rm 别名,避免误删除
# rm -rf hack
alias rm=trash
alias rrm="/bin/rm"

trash(){
 /bin/rm -rf ~/.trash/$(echo $@ | sed -e "s/^.*\///")
 mv -f $@ ~/.trash/
}


快捷键
set -o emacs/vi
编辑导航
jobs



zsh / oh-my-zsh
强大的自动补全 (Command-line completion)
友好的提示 Prompt Sign
Theme and Plugin



- Shell 脚本
if 逻辑
# 指定动态链接库,用于构建 jpeg
if [ $LD_LIBRARY_PATH ]; then
 export LD_LIBRARY_PATH=/opt/glibc-2.14/lib:$LD_LIBRARY_PATH
else
 export LD_LIBRARY_PATH=/opt/glibc-2.14/lib
fi


多重命令与回传码
cmd1 ## cmd2
|| 命令或
&& 命令与
; 连续执行命令



多重命令实例
if build
then 
  send_log_to_git success || exit 0
else 
  send_log_to_git fail && exit 127
fi
const shellCommands = [
  `cd ${pathHere}`,
  `git add ./`,
  `git commit -m "${msg}"`,
  `git push`
  ].join(' && ');
$ cd no-eixt-folder; rm -rf ./
cd: no such file or directory: no-exit-folder
......
......
......^C



重定向
1> stdout 覆盖输出到文件
1>> stdout 累加输出到文件
2> stderr 覆盖输出到文件
2>> stderr 累加输出到文件
&>, &>>
< 使用文件代替键盘输入
node server.js >> log.txt



管道操作
$ ps aux | grep node
$ netstat -lanp | grep '8080'
$ find -wholename '*.tpl' | xargs grep 'elesif'



循环
for i in $(ls ../muapp)
do
  echo $i
  git clone ssh://git@git.xxx.com:10022/muapp/${i}.git
  gco master
  gcb fix-ajax-bug
done
for i in $(ls ./)
do
  echo $i
  cd $i
  sed -i "s#ajaxStart#AjaxStart#g" ./src/pages/f7.js
  ga ./src/pages/f7.js
  git commit -m 'fixbug: ajax start hook bug'
  # git push -u origin fix-ajax-bug
  cd ..
done