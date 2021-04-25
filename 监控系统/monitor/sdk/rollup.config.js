import babel from 'rollup-plugin-babel';

let isDev = process.env.NODE_ENV === 'develop';
export default {
  input: 'index.js',
  output: {
    file: isDev ? '../website/client/script/eagle-monitor/bundle.umd.js' : '../dist/bundle.umd.js',
    name: 'EagleMonitor',
    format: 'umd',
    sourcemap: true
  },
  plugins: [
    babel()
  ],
  watch: {
    exclude: 'node_modules/**'
  }
}
