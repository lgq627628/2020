const path = require('path')
const CopyrightPlugin = require('./pulgins/copyright-plugin.js')
module.exports = {
  mode: 'development',
  resolveLoader: {
    // modules: ['node_modules', './loaders'] // 这样子在引入 loader 的时候就不用写路径了
    modules: ['node_modules', path.resolve(__dirname, 'loaders')]
    // alias: {
    //   styleLoader: path.resolve(__dirname, 'loaders', 'style-loader')
    // }
  },
  devtool: 'source-map',
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
        // use: [path.resolve(__dirname, 'loaders', 'replace-loader.js')] // 简单点的写法
        use: [ // 多个 loader 从后往前执行
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          },
          {
            // loader: path.resolve(__dirname, './loaders/replace-loader.js'),
            loader: 'replace-loader',
            options: { // 这里可以传自定义的参数
              msg: '0000'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'less-loader']
      }
    ]
  },
  plugins: [
    new CopyrightPlugin({name: '尤水就下'})
  ]
}
