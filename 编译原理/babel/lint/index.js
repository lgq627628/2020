const parser = require('@babel/parser')
const { transformFromAstSync } = require('@babel/core');
const fs = require('fs')
const path = require('path')
const autoPlugin = require('./auto-plugin');

const source = fs.readFileSync(path.join(__dirname, './source.js'), {
    encoding: 'utf-8'
});

const ast = parser.parse(source, {
    sourceType: 'unambiguous',
    plugins: ['typescript', 'jsx']

});
const { code } = transformFromAstSync(ast, source, {
    plugins: [
        [autoPlugin, { fix: true }]
    ]
});

console.log(code);


