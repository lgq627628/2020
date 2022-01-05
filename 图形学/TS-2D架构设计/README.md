## Vite + TS 实现 2D 渲染引擎

- 第一步：编写应用入口 Application 类
- 第二步：添加定时器 Timer 类
- 第三步：封装常用绘制图形方法


### 优化策略
- 一般来说，60fps的帧率，如果每帧需要执行2000次以上，也就是十万次以上才考虑优化
- 当执行太多的函数调用后，你会发现性能变得很慢。每当我减少一些函数调用（把函数中的代码直接拷贝到当前调用位置），性能都会有提升。
    ```js
    // 如果在主循环中有如下代码
    // bad ❌
    matrix1.append(matrix2)

    // good ✅
    matrix1.a = matrix2.a * matrix1.a + matrix2.b * matrix1.c;
    // ...
    ```
- 减少作用域链的查询；多次访问对象属性（甚至循环调用），建议先把该属性保存到一个局部变量中，再使用
    ```js
    // bad ❌
    var array = [];
    function getName() {
        array[0] = 0;
        array[1] = 0;
        array[2] = 0;
        array[3] = 0;
        // ...
    }

    // good ✅
    var array = [];
    function getName() {
        var array = array;
        array[0] = 0;
        array[1] = 0;
        array[2] = 0;
        array[3] = 0;
        // ...
    }

    ```
- js的四则运算中，除法是最慢的，乘法其次。Math封装的数学函数中，sin与cos函数执行是最慢的。
    ```js 
    // a 在大部分情况下为0
    
    // bad ❌
    c = a * b;
    f = a * e;

    // good ✅
    if(a == 0) {
        c = 0;
        f = 0;
    } else {
        c = a * b;
        f = a * e;
    }
    ```
    尽量避免不必要的乘除运算，可能的情况下，缓存sin和cos运算结果。pixi.js中，显示对象的旋转要用到三角函数计算，引擎内部进行了标脏处理。egret中，对全局的三角函数计算方法进行了查表优化。

总结来看，这些所谓的性能优化点，大部分都是js语言在运行过程中的弱点，在其它语言中未必会重现。例如，上文提到的函数调用，在c++等语言中并不会对性能造成明显影响。
    
