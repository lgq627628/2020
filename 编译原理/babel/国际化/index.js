const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core');
const fs = require('fs')
const path = require('path')
const autoTranslatePlugin = require('./auto-translate-plugin');

const source = fs.readFileSync(path.join(__dirname, './source.js'), {
    encoding: 'utf-8'
});

const ast = parser.parse(source, {
    sourceType: 'unambiguous',
    plugins: ['jsx']
});
const { code } = transformFromAstSync(ast, source, {
    plugins: [
        [autoTranslatePlugin, { outputDir: path.resolve(__dirname, './output') }]
    ]
});

console.log(code);


