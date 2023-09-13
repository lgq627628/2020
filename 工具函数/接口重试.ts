// 工具函数，用于延迟一段时间
const sleep = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

// 工具函数，用于包裹 try - catch 逻辑
const awaitErrorWrap = async <T, U = any>(
  promise: Promise<T>
): Promise<[U | null, T | null]> => {
  try {
    const data = await promise;
    return [null, data];
  } catch (err: any) {
    return [err, null];
  }
};

// 重试函数
export const retryRequest = async <T>(
  promise: () => Promise<T>,
  retryTimes: number = 3,
  retryInterval: number = 500
) => {
  let output: [any, T | null] = [null, null];

  for (let a = 0; a < retryTimes; a++) {
    output = await awaitErrorWrap(promise());

    if (output[1]) {
      break;
    }

    console.log(`retry ${a + 1} times, error: ${output[0]}`);
    await sleep(retryInterval);
  }

  return output;
};



// import { retryRequest } from "xxxx";
// import axios from "axios";

// const request = (url: string) => {
//   return axios.get(url);
// };

// const [err, data] = await retryRequest(request("https://request_url"), 3, 500);



export const retryDecorator = (
  retryTimes: number = 3,
  retryInterval: number = 500
): MethodDecorator => {
  return (_: any, __: string | symbol, descriptor: any) => {
    const fn = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      // 这里的 retryRequest 就是刚才的重试函数
      return retryRequest(fn.apply(this, args), retryTimes, retryInterval);
    };
  };
};

// import { retryRequest } from "xxxx";
// import axios from "axios";

// class RequestClass {
//   @retryDecorator(3, 500)
//   static async getUrl(url: string) {
//     return axios.get(url);
//   }
// }

// const [err, data] = await RequestClass.getUrl("https://request_url");




// 重试函数
export const retryRequest = async <T>(
  promise: () => Promise<T>,
  retryTimes: number = 3,
  retryInterval: number = 500
) => {
  let output: [any, T | null] = [null, null];

  for (let a = 0; a < retryTimes; a++) {
    output = await awaitErrorWrap(promise());

    if (output[1]) {
      break;
    }

    console.log(`retry ${a + 1} times, error: ${output[0]}`);
    await sleep(retryInterval);
  }

  if (output[0]) {
    throw output[0];
  }

  return output[1];
};


// import { retryRequest } from "xxxx";
// import axios from "axios";

// const request = (url: string) => {
//   return axios.get(url);
// };

// try {
//   const res = await retryRequest(request("https://request_url"), 3, 500);
// } catch (err) {
//   console.error(res);
// }