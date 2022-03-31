// 工厂模式其实就是将创建对象的过程单独封装。工厂模式的目的，就是为了实现无脑传参，就是为了爽！
// 它的应用场景也非常容易识别：有构造函数的地方，我们就应该想到简单工厂；在写了大量构造函数、调用了大量的 new、自觉非常不爽的情况下，我们就应该思考是不是可以掏出工厂模式重构我们的代码了。

// 简单工厂模式（功能单一）：批量制造一堆相同属性的对象
function makeObj(opts) {
    let obj = {};
    Object.assign(obj, opts);
    return obj;
}

function Factory(type, opts) {
    switch (type) {
        case 1:
            return new makeStaffA();
            break;
        case 2:
            return new makeStaffB();
            break;
        case 3:
            return new makeStaffC();
            break;
        default:
            break;
    }
}

// 复杂工厂模式、抽象工厂模式，就是抽象出一个基类，大家都有，但实现方式不同，基于一个基类创建 n 种类型，比如 shape 到多边形
// 上述的简单工厂容易产生 bug，比如给每个员工加个权限；每次都要修改 Factory，增加各种判断，最后变得异常庞大，庞大到没人敢动
// 根本原因：没有遵守开放封闭原则。

// 抽象工厂不干活，具体工厂（ConcreteFactory）来干活！
class MobilePhoneFactory {
    // 提供操作系统的接口
    createOS() {
        throw new Error('抽象工厂方法不允许直接调用，你需要将我重写！');
    }
    // 提供硬件的接口
    createHardWare() {
        throw new Error('抽象工厂方法不允许直接调用，你需要将我重写！');
    }
}
// 具体工厂继承自抽象工厂
// 具体产品类往往不会孤立存在，不同的具体产品类往往有着共同的功能，比如安卓系统类和苹果系统类，它们都是操作系统，都有着可以操控手机硬件系统这样一个最基本的功能。因此我们可以用一个抽象产品（AbstractProduct）类来声明这一类产品应该具有的基本功能
class FakeStarFactory extends MobilePhoneFactory {
    createOS() {
        // 提供安卓系统实例
        return new AndroidOS();
    }
    createHardWare() {
        // 提供高通硬件实例
        return new QualcommHardWare();
    }
}

// 定义操作系统这类产品的抽象产品类
class OS {
    controlHardWare() {
        throw new Error('抽象产品方法不允许直接调用，你需要将我重写！');
    }
}

// 定义具体操作系统的具体产品类
class AndroidOS extends OS {
    controlHardWare() {
        console.log('我会用安卓的方式去操作硬件');
    }
}

class AppleOS extends OS {
    controlHardWare() {
        console.log('我会用🍎的方式去操作硬件');
    }
}

// 定义手机硬件这类产品的抽象产品类
class HardWare {
    // 手机硬件的共性方法，这里提取了“根据命令运转”这个共性
    operateByOrder() {
        throw new Error('抽象产品方法不允许直接调用，你需要将我重写！');
    }
}

// 定义具体硬件的具体产品类
class QualcommHardWare extends HardWare {
    operateByOrder() {
        console.log('我会用高通的方式去运转');
    }
}

class MiWare extends HardWare {
    operateByOrder() {
        console.log('我会用小米的方式去运转');
    }
}
// 关键的时刻来了——假如有一天，FakeStar过气了，我们需要产出一款新机投入市场，这时候怎么办？我们是不是不需要对抽象工厂MobilePhoneFactory做任何修改，只需要拓展它的种类：
class newStarFactory extends MobilePhoneFactory {
    createOS() {
        // 操作系统实现代码
    }
    createHardWare() {
        // 硬件实现代码
    }
}
