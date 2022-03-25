export class Utils {
    static getRandomColor() {
        // return '#' + Math.random().toString().slice(3,9);
        return '#' +
            (function xx(color) {
                return (color += '0123456789abcdef'[Math.floor(Math.random() * 16)])
                    && (color.length == 6) ? color : xx(color);
            })('');
    }
    static getRandom(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}