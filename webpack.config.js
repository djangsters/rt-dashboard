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
            { name: 'default', count: 0, url: '/admin/rt_dashboard/inner/default' }
          ]
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

      const generateTask = (id, error, status) => ({
        id,
        description: 'feeds.tasks.generate_feed_from_db(1113)',
        origin: 'unnatural',
        worker: status === 'running' ? 'v-yf.21' : null,
        status,
        error_message: error,
        enqueued_at: new Date().getTime(),
        started_at: new Date().getTime(),
        ended_at: new Date().getTime()
      })
      const getJobsHandler = (pagination) => (req, res) => {
        res.json({
          jobs: [
            generateTask('fa02bf65-0527-40d0-acae-9f3c041f3fdd', 'General error', 'failed'),
            generateTask('fa02bf65-0527-40d0-acae-9f3c041f3EEE', null, 'finished'),
            generateTask('fa02bf65-0527-40d0-acae-9f3c041f3EEE', null, 'finished'),
            generateTask('fa02bf65-0527-40d0-BBBB-9f3c041f3fdd', null, 'running')
          ],
          pagination
        })
      }
      app.get('/admin/rt_dashboard/inner/jobs/%5Btest%5D/1.json',
        getJobsHandler({ pages_in_window: 2, next_page: 2, prev_page: null }))
      app.get('/admin/rt_dashboard/inner/jobs/%5Btest%5D/2.json',
        getJobsHandler({ pages_in_window: 2, next_page: null, prev_page: 1 }))
      app.get('admin/rt_dashboard/inner/jobs/%5Brunning%5D/1.json',
        getJobsHandler({ pages_in_window: 2, next_page: null, prev_page: 1 }))
      app.get('admin/rt_dashboard/inner/jobs/default/1.json',
        getJobsHandler({ pages_in_window: 1, next_page: null, prev_page: null }))
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
