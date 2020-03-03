const path = require('path')
const CopyrightPlugin = require('./pulgins/copyright-plugin.js')
const DonePlugin = require('./pulgins/done-plugin.js')
const AsyncPlugin = require('./pulgins/async-plugin.js')
const OutputMapPlugin = require('./pulgins/output-map-plugin')
const UploadPlugin = require('./pulgins/upload-plugin')
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
            loader: 'banner-loader',
            options: {
              text: '尤水就下',
              filename: path.resolve(__dirname, 'banner.js')
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
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      },
      // {
      //   test: /\.jpeg$/,
      //   use: ['file-loader'] // 目的就是根据图片生成一个 md5 发射到输出目录下，并且该 loader 还会返回当前的图片路径
      // }
      {
        test: /\.jpeg$/,
        use: [
          {
            loader: 'url-loader', // 里面会调用 file-loader
            options: {
              limit: 200*1024
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CopyrightPlugin({name: '尤水就下'}),
    new DonePlugin(),
    new AsyncPlugin(),
    new OutputMapPlugin({
      filename: 'outputMap.md'
    }),
    new UploadPlugin({ // 去腾讯云上拿对应的值即可
      bucket: 'xxx',
      domain: 'https://xxx.com',
      secretId: 'xxx',
      secretKey: 'xxx'
    })
  ]
}
