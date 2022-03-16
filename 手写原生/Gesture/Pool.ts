import { Cache, Gesture } from './Gesture';
import { GeoUtils } from './Util';

export class Pool {
    /** 资源池，单例模式 */
    static _instance = null;
    /** 本地保存的 key 值 */
    private localKey: string = 'local-gesture-cache';
    /** 准确度 */
    private accuracy = 0.85;

    static getInstance() {
        if (!this._instance) {
            this._instance = new Pool();
        }
        return this._instance;
    }

    public cache: Cache;
    constructor() {
        this.reset();
        this.loadGesture();
    }

    reset() {
        this.cache = {};
    }
    addGesture(name: string, gesture: Gesture) {
        this.cache[name] = gesture;
    }
    removeGesture(name: string) {
        delete this.cache[name];
    }
    removeAllGesture() {
        this.reset();
        this.saveGesture();
    }
    getGesture(name: string) {
        return this.cache[name];
    }
    getGestureCount(): number {
        return Object.keys(this.cache).length;
    }
    saveGesture() {
        if (this.cache) localStorage.setItem(this.localKey, JSON.stringify(this.cache));
    }
    loadGesture() {
        const cacheStr = localStorage.getItem(this.localKey);
        if (cacheStr) this.cache = JSON.parse(cacheStr);
    }
    cancelMatch() {
        Object.values(this.cache).forEach((gesture) => (gesture.isMatch = false));
    }
    /** 手势比较 */
    compare(curGesture: Gesture) {
        let rs = '';
        let max = -Infinity;
        Object.entries(this.cache).forEach(([name, gesture]) => {
            const cos = GeoUtils.calcCosDistance(curGesture.vector, gesture.vector);
            if (cos > max) {
                max = cos;
                rs = name;
            }
        });
        // 当手势存在并且精度值高于某个阈值才算匹配
        if (rs && max >= this.accuracy) {
            this.cache[rs].isMatch = true;
            return rs;
        }
    }
}
