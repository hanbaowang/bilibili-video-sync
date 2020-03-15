const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: {
    inject: './src/inject.js',
    addListener: './src/addListener.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'extension'),
  },
  module: {
    rules: [{
      test: /\.(html)$/,
      use: {
        loader: 'html-loader',
      }
    }]
  },
  plugins: [
    // new webpack.NoEmitOnErrorsPlugin(),
  ]
};