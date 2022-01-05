export const Utils = {
    initGridData(row, col) {
        const data = [];
        for(let i = 0; i < row; i++) {
            data[i] = [];
            for(let j = 0; j < col; j++) {
                data[i][j] = null;
            }
        }
        return data;
    },
    setCellData(x, y, data) {
        return {
            x,
            y,
            ...data
        }
    },
    drawMain(ctx, width, height) {

    }
}