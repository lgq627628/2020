const Tween = {
    /**
     * 
     * @param {*} t curTime
     * @param {*} b startVal 
     * @param {*} c deltaVal 
     * @param {*} d duration
     * @returns 
     */
    linear: (t, b, c, d) => {
        return c * t / d + b;
    },
    easeIn: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOut: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }
}

export default Tween;