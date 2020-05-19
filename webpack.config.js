const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  context: path.resolve(__dirname, 'rt_dashboard'),
  entry: {
    app: ['./javascript/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'rt_dashboard/static'),
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules\//,
        loader: 'babel-loader',
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
        options: {
          attributes: {
            list: [{
              tag: 'link',
              attribute: 'href',
              type: 'src',
              filter: (tag, attribute, attributes) => {
                return false
              },
            }],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|eot|ttf|woff|woff2)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'css/fonts/',
            publicPath: 'fonts',
          },
        }],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
  ],
  devtool: 'source-map',
  target: 'web',
  devServer: {
    before: (app, server, compiler) => {
      app.get('/admin/rt_dashboard/inner/queues.json', (req, res) => {
        res.json({
          queues: [
            { name: '[test]', count: 0, url: '/admin/rt_dashboard/inner/test' },
            { name: '[running]', count: 1, url: '/admin/rt_dashboard/inner/running' },
          ],
        })
      })
      app.get('/admin/rt_dashboard/inner/workers.json', (req, res) => {
        res.json({
          workers: [{
            state: 'pause',
            name: 'v-yf.2193',
            queues: ['default', 'low_prio_queue'],
          }, {
            state: 'busy',
            name: 'v-yf.2192',
            queues: ['empty', 'high_prio_queue'],
          }],
        })
      })
    },
    proxy: {
      '/admin': 'https://172.16.0.5/admin/',
    },
    contentBase: path.join(__dirname, 'rt_dashboard/static'),
    historyApiFallback: true,
    hot: true,
    https: false,
    noInfo: true,
  },
}
