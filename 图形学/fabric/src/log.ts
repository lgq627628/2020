import { fabric } from './index';

fabric.log = (...args) => {
    console.log.call(console, ...args);
}
fabric.warn = (...args) => {
    console.warn.call(console, ...args);
}