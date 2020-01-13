const path = require('path');

module.exports = {
  entry: {
      addListener: './src/addListener.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, ''),
  },
};