const { resolve } = require("../../ms");
// 那么实际应用中，一个方法满足这几个条件，可以被promisify化
// 该方法必须包含回调函数
// 回调函数必须执行
// 回到函数第一个参数代表err信息，第二个参数代表成功返回的结果

// 有那么一些场景，是不可以直接使用promisify来进行转换的，有大概这么两种状况：编程
// 没有遵循Error first callback约定的回调函数
// 返回多个参数的回调函数
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, data) => {
        if (err) reject(err)
        resolve(data)
      })
    })
  }
}

// promise 串联，多个图片预加载
const loadImg = urlId => {
  const url = `https://www.image.com/${urlId}`

  return new Promise((resolve, reject) => {
      const img = new Image()
      img.onerror = function() { 
          reject(urlId)
      }

      img.onload = function() { 
          resolve(urlId)
      }
      img.src = url
  })
}

const urlIds = [1, 2, 3, 4, 5]

urlIds.reduce((prevPromise, urlId) => {
    return prevPromise.then(() => loadImg(urlId))
}, Promise.resolve())

const loadImgOneByOne = async () => {
  for (i of urlIds) {
      await loadImg(urlIds[i])
  }
}
loadImgOneByOne()

const promiseArray = urlIds.map(urlId => loadImg(urlId))

Promise.all(promiseArray)
    .then(() => {
        console.log('finish load all')
    })
    .catch(() => {
        console.log('promise all catch')
    })












const loadByLimit = (urlIds, loadImg, limit) => {
const urlIdsCopy = […urlIds]

if (urlIdsCopy.length <= limit) {
  // 如果数组长度小于最大并发数，直接全部请求
  const promiseArray = urlIds.map(urlId => loadImg(urlId))
    return Promise.all(promiseArray)
}

// 注意 splice 方法会改变 urlIdsCopy 数组
const promiseArray = urlIdsCopy.splice(0, limit).map(urlId => loadImg(urlId)) 

urlIdsCopy.reduce(
  (prevPromise, urlId) => 
  prevPromise
    .then(() => Promise.race(promiseArray))
    .catch(error => {console.log(error)})
    .then(resolvedId => {
    // 将 resolvedId 剔除出 promiseArray 数组
    // 这里的删除只是伪代码，具体删除情况要看后端 Api 返回结果
    let resolvedIdPostion = promiseArray.findIndex(id => resolvedId === id)
    promiseArray.splice(resolvedIdPostion, 1)
    promiseArray.push(loadImg(urlId))
    })
  , 
  Promise.resolve()
)
.then(() => Promise.all(promiseArray))
}










// 储存将要请求的 id 数组
let bookIdListToFetch = []

// 储存每个 id 请求 promise 实例的 resolve 和 reject
// key 为 bookId，value 为 resolve 和 reject 方法，如：
// { 123: [{resolve, reject}]}
// 这里之所以使用数组存储 {resolve, reject}，是因为可能存在重复请求同一个 bookId 的情况。其实这里我们进行了滤重，没有必要用数组。在需要支持重复的场景下，记得要用数组存储
let promiseMap = {}

// 用于数组去重
const getUniqueArray = array => Array.from(new Set(array))

// 定时器 id
let timer

const getBooksInfo = bookId => new promise((resolve, reject) => {
    promiseMap[bookId] = promiseMap[bookId] || []
    promiseMap[bookId].push({
        resolve,
        reject
    })

    const clearTask = () => {
        // 清空任务和存储
        bookIdListToFetch = []
        promiseMap = {}
    } 

    if (bookIdListToFetch.length === 0) {
        bookIdListToFetch.push(bookId)

        timer = setTimeout(() => {
            handleFetch(bookIdListToFetch, promiseMap)

            clearTask()
        }, 100)
    }
    else {
        bookIdListToFetch.push(bookId)

        bookIdListToFetch = getUniqueArray(bookIdListToFetch)

        if (bookIdListToFetch.length >= 100) {
            clearTimeout(timer)

            handleFetch(bookIdListToFetch, promiseMap)

            clearTask()
        }
    }
})

const handleFetch = (list, map) => {
    fetchBooksInfo(list).then(resultArray => {
        const resultIdArray = resultArray.map(item => item.id)

        // 处理存在的 bookId
        resultArray.forEach(data => promiseMap[data.id].forEach(item => {
            item.resolve(data)
        }))

        // 处理失败没拿到的 bookId
        let rejectIdArray ＝ []
        bookIdListToFetch.forEach(id => {
            // 返回的数组中，不含有某项 bookId，表示请求失败
            if (!resultIdArray.includes(id)) {
                rejectIdArray.push(id)
            }
        })

        // 对请求失败的数组进行 reject
        rejectIdArray.forEach(id => promiseMap[id].forEach(item => {
            item.reject()
        }))
    }, error => {
        console.log(error)
    })
}