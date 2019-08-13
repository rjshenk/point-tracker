const RollbarSourceMapPlugin = require('rollbar-sourcemap-webpack-plugin')
const PUBLIC_PATH = 'https://points.live/'

module.exports = {
  configureWebpack: {
    entry: 'index',
    ignoreErrors: false,
    publicPath: PUBLIC_PATH,
    output: {
      path: 'dist',
      filename: 'index-[hash].js'
    },
    plugins: [new RollbarSourceMapPlugin({
      accessToken: 'c28199817cb14361b39b960f5b69df86',
      version: 'version 1',
      publicPath: PUBLIC_PATH
    })],
    silent: false,
  },
  devServer: {
    port: '3000',
    public: '0.0.0.0',
    disableHostCheck: true,
  },
}
