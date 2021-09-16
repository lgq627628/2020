// 手写增强版 JSON.stringify
function serialize(obj, name) {
    var result = "";
    function getInstanceType(o) {
      const typeStr = Object.prototype.toString.call(o);
      let type = /(?<=\s).+(?=\])/.exec(typeStr)[0];
      return type || "";
    }
    function getInstanceValue(o) {
      let val = "()";
      if (o instanceof Set) {
        val = "(['" + Array.from(o).toString() + "'])";
      } else if (o instanceof Map) {
      }
      return val;
    }
    function serializeInternal(o, path) {
      for (p in o) {
        var value = o[p];
        if (typeof value != "object") {
          if (typeof value == "string") {
            result +=
              "\n" +
              path +
              "[" +
              (isNaN(p) ? '"' + p + '"' : p) +
              "] = " +
              '"' +
              value.replace(/\"/g, '\\"') +
              '"' +
              ";";
          } else {
            result +=
              "\n" +
              path +
              "[" +
              (isNaN(p) ? '"' + p + '"' : p) +
              "] = " +
              value +
              ";";
          }
        } else {
          if (value === null) {
            result +=
              "\n" +
              path +
              "[" +
              (isNaN(p) ? '"' + p + '"' : p) +
              "]" +
              "=" +
              "null";
          } else if (value instanceof Array) {
            result +=
              "\n" +
              path +
              "[" +
              (isNaN(p) ? '"' + p + '"' : p) +
              "]" +
              "=" +
              "new Array();";
            serializeInternal(
              value,
              path + "[" + (isNaN(p) ? '"' + p + '"' : p) + "]"
            );
          } else {
            let type = getInstanceType(value);
            if (["Set", "Map", "Date", "RegExp", "Error"].includes(type)) {
              let oldVal = getInstanceValue(value);
              result +=
                "\n" +
                path +
                "[" +
                (isNaN(p) ? '"' + p + '"' : p) +
                "]" +
                "=" +
                `new ${type}${oldVal};`;
            } else {
              result +=
                "\n" +
                path +
                "[" +
                (isNaN(p) ? '"' + p + '"' : p) +
                "]" +
                "=" +
                "new Object();";
              serializeInternal(
                value,
                path + "[" + (isNaN(p) ? '"' + p + '"' : p) + "]"
              );
            }
          }
        }
      }
    }
    serializeInternal(obj, name);
    return result;
  }
  
  function A() {
    this.name = "A";
    this.num = 1;
    this.str = "这是一个字符串";
    this.bool = true;
    this.nul = null;
    this.undef = undefined;
    //   this.syb = Symbol("syb");
    this.nan = NaN;
    this.infinity = Infinity;
    this.negativeInfinity = -Infinity;
    this.obj = new Object();
    this.func = function (para) {
      this.arr[this.arr.length] = para;
    };
    this.date = new Date();
    this.arr = new Array();
    this.set = new Set(["key"]);
    this.map = new Map([["key", 1]]);
    this.reg = new RegExp("[0-9]+");
    this.error = new Error("this is error");
  }
  
  let a = new A();
  let aa = serialize(a, "AA");
  // console.log(aa);
  let AA = new Object();
  eval(aa);
  console.table(AA);
  console.log("序列化反序列化后值：", AA);
  