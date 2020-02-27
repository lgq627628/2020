const path = require('path')
const CopyrightPlugin = require('./pulgins/copyright-plugin.js')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        // use: [path.resolve(__dirname, 'loaders/replace-loader.js')] // 简单点的写法
        use: [
          {
            loader: path.resolve(__dirname, 'loaders/replace-loader.js'),
            options: { // 这里可以传自定义的参数
              msg: '0000'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyrightPlugin({name: '尤水就下'})
  ]
}
