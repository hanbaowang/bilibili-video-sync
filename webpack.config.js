const path = require('path');

module.exports = {
  entry: {
      inject: './src/inject.js',
      addListener: './src/addListener.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'extension'),
  },
};