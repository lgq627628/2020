import { Cache, Gesture } from './Gesture';
import { Utils } from './Util';

export class Pool {
    static _instance = null;
    private localKey: string = 'local-gesture-cache';
    private error = 0.15;

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
        Object.values(this.cache).forEach(gesture => gesture.isMatch = false)
    }
    compare(curGesture: Gesture) {
        let rs = '';
        let min = Infinity;
        Object.entries(this.cache).forEach(([name, gesture]) => {
            const cos = Utils.calcCosDistance(curGesture.vector, gesture.vector);
            if (cos < min) {
                min = cos;
                rs = name;
            }
        });
        console.log('误差', min);
        if (rs && min <= this.error) {
            this.cache[rs].isMatch = true;
            return rs;
        }
    }
}
