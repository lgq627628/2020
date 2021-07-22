const fs = require('fs')
const path = require('path')
const util = require('util')
// const moment = require('moment')
const open = util.promisify(fs.open)
const read = util.promisify(fs.read)


const dir = path.resolve(__dirname, '../../Node')
const rs = fs.readdirSync(dir).map(file => path.resolve(dir, file))
console.log(rs);



// 在认知层面，我们知道它可以在内存里面，申请和存储一段数据就可以了，它的好处是就是帮我们把数据先缓冲起来，用的时候开箱即用，减少 IO 等层面的开销，最重要的是，通过它的缓冲积压，来为流的读写提供一个中间地带，以达到缓冲缓速的作用。


// Buffer 就是缓冲内存
// Buffer 的几种类型
// 发现绝大多数底层都是 FastBuffer 实例，无非是会写入一些数据的初始写入和偏移量管理等，另外就是字符串长度超过 4kb 时候会直接调用 C++ 层面的 createFromString 来创建内存缓冲，而超过剩余空间的就重新申请 8kb 池，


// 1、可以通过 from 创建
// 通过字符串创建
const bufFromStr = Buffer.from('Hello 掘金')
console.log(bufFromStr)
// <Buffer 48 65 6c 6c 6f 20 e6 8e 98 e9 87 91>
// 48 H 0100 1000
// 65 e 0110 0101
// 6c l 0110 1100
// 6c l 0110 1100
// 6f o 0110 1111
// 20 空格 0010 0000
// utf8 编码
// e6 8e 98 掘
// e9 87 91 金


// 2、可以通过 alloc 创建
// 初始化一个八位字节长度的 buffer
const bufFromAlloc = Buffer.alloc(8)
console.log(bufFromAlloc)
// <Buffer 00 00 00 00 00 00 00 00>

// 这个实例化后的 buf，有一个 length 的属性，来表示缓冲区的大小
console.log(buf.length)
// 8

// 通过 alloc 分配的内存区间是有固定长度的，如果写入超过长度，那么超出部分是不会被缓冲的：
const bufFromAll = Buffer.alloc(8)
bufFromAll.write('123456789')
console.log(bufFromAll)
// <Buffer 31 32 33 34 35 36 37 38>
console.log(bufFromAll.toString())
// 12345678


// 缓冲写入 Buffer write
let bufForWrite = Buffer.alloc(32)
bufForWrite.write('Hello 掘金', 0, 9)
console.log(bufForWrite.toString())
// Hello 掘


// 数组截取 Buffer slice
let bufFromArr1 = Buffer.from([1, 2, 3, 4, 5])
// <Buffer 01 02 03 04 05>
let bufFromArr2 = bufFromArr1.slice(2, 4)
// <Buffer 03 04>
// 与 JS 不同的是，如果你修改了 slice 返回的 Buffer 对象中的属性值，那么原来的 Buffer 实例中对应的值，也会被修改，因为 Buffer 中保存的是一个类似指针的东西，指向同一段存储空间，不管以哪一个变量或者指针，都可以修改这段存储空间的值，再通过其他变量或者指针访问该属性时，获取到的也是修改后的值。


// 数组拷贝 Buffer copy
let bufCopy1 = Buffer.from('Hello')
let bufCopy2 = Buffer.alloc(4)
console.log(bufCopy1)
// <Buffer 48 65 6c 6c 6f>

bufCopy1.copy(bufCopy2, 0, 1, 5)
console.log(bufCopy2)
// {/* <Buffer 65 6c 6c 6f> */}
console.log(bufCopy2.toString())
// ello


// 缓冲填充 Buffer fill
const bufForFill = Buffer.alloc(12).fill('11-11 ')
// <Buffer 31 31 2d 31 31 20 31 31 2d 31 31 20>
console.log(bufForFill.toString())
// 11-11 11-11



