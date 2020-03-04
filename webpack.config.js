const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',
  entry: {
    index: path.resolve('./src/index.ts'),
    'cut-pic': path.resolve('./src/CutPic.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.ts$/,
        use: [
          'babel-loader',
          'ts-loader'
        ]
      }
    ]
  },
}

module.exports = config;
