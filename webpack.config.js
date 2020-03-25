const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode: 'production',
  context: path.resolve(__dirname, 'rt_dashboard'),
  entry: {
    app: ['./javascript/app.js']
  },
  output: {
    path: path.resolve(__dirname, 'rt_dashboard/static'),
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules\//,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(jpg|jpeg|png|gif|svg|eot|ttf|woff|woff2)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'css/fonts/',
            publicPath: 'fonts'
          }
        }]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    })
  ],
  devtool: 'source-map',
  target: 'web',
  devServer: {
    proxy: {
      '/api': 'http://localhost:3000'
    },
    contentBase: path.join(__dirname, 'rt_dashboard/static'),
    historyApiFallback: true,
    hot: true,
    https: false,
    noInfo: true
  }
}