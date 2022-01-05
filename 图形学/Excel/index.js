import { Utils } from './Utils'
class Sheet {
    constructor(opts) {
        console.log('111');
        this.canvas = document.getElementById(opts.container);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.getBoundingClientRect().width;
        this.height = this.canvas.getBoundingClientRect().height;
        this.defaultSetting = {
            borderWidth: 1,
            row: 20,
            col: 20,
            rowHeight: 16,
            colWidth: 66
        };
        Object.assign(this.defaultSetting, opts);
        this.create();
    }
    create() {
        const data = this.buildGridData(this.defaultSetting);
        const { widthList, heightList } = this.calcCellSize(this.defaultSetting);
        console.log(widthList, heightList);
        this.drawSheet();
    }
    buildGridData(file) {
        const { row, column, cellData } = file;
        const data = Utils.initGridData(row, column);
        cellData.forEach(cell => {
            const { x, y, value } = cell;
            if (value) data[x][y] = Utils.setCellData(x, y, value)
        })
    }
    calcCellSize({row, col, rowHeight, colWidth, borderWidth}) {
        const widthList = [];
        const heightList = [];
        for (let i = 0; i < row; i++) {
            heightList.push((i + 1) * (rowHeight + 2 * borderWidth))
        }
        for (let j = 0; j < col; j++) {
            widthList.push((j + 1) * (colWidth + 2 * borderWidth))
        }
        return { widthList, heightList };
    }
    drawSheet() {
        Utils.drawMain(this.ctx, this.width, this.height);
    }
}

window.Sheet = Sheet;
