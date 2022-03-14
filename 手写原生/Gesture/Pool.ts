import { Cache } from './Gesture';
import { Utils } from './Util';

export class Pool {
    static _instance = null;
    private localKey: string = 'local-gesture-cache';
    private error = 0.5;

    static getInstance() {
        if (!this._instance) {
            this._instance = new Pool();
        }
        return this._instance;
    }

    public cache: Cache;
    constructor() {
        this.reset();
    }

    reset() {
        this.cache = {};
    }
    // createGesture(points: Point[]) {
    //     const stroke = new Gesture();
    //     stroke.init(points);
    //     return stroke;
    // }
    addGesture(name: string, vector: number[]) {
        this.cache[name] = vector;
    }
    removeGesture(name: string) {
        delete this.cache[name];
    }
    removeAllGesture() {
        this.reset();
    }
    getGesture(name: string) {
        return this.cache[name];
    }
    saveGesture() {
        if (this.cache) localStorage.setItem(this.localKey, JSON.stringify(this.cache));
    }
    loadGesture() {
        const cacheStr = localStorage.getItem(this.localKey);
        if (cacheStr) this.cache = JSON.parse(cacheStr);
    }
    compare(gesture: number[]) {
        let rs = '';
        let min = Infinity;
        Object.entries(this.cache).forEach(([name, vector]) => {
            const cos = Utils.calcCosDistance(gesture, vector);
            if (cos < min) {
                min = cos;
                rs = name;
            }
        });
        if (rs && min <= this.error) return rs;
    }
}
