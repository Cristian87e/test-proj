const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CONFIG = require('./webpack.base')

const { CLIENT_ENTRY, CLIENT_OUTPUT, PUBLIC_PATH } = CONFIG

module.exports = {
  devtool: 'eval',
  entry: {
    main: [
      'webpack/hot/only-dev-server',
      'webpack-hot-middleware/client',
      CLIENT_ENTRY
    ],
    // vendor: [
    //   'react',
    //   'react-dom',
    //   'react-router',
    //   'redux',
    //   'react-redux',
    // ]
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
    path: CLIENT_OUTPUT
  },
  module: {
    // preLoaders: [
    //   {
    //     // set up standard-loader as a preloader
    //     test: /\.jsx?$/,
    //     loader: 'standard',
    //     exclude: /(node_modules)/
    //   }
    // ],
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /(node_modules|server)/,
        query: {
          cacheDirectory: true,
          presets: ["es2015", "react", "stage-0"]
        }
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css'),
        include: CLIENT_ENTRY,
        // ExtractTextPlugin.extract({
        //   fallbackLoader: "style-loader",
        //   loader: "css-loader"
        // })
      },
    ]
  },
  resolve: {
    root: path.resolve(__dirname),
    extensions: ['', '.js', '.jsx', '.css'],
    alias: {
      src: CLIENT_ENTRY,
      npm: 'node_modules',
    }
  },
  standard: {
    // config options to be passed through to standard e.g.
    parser: 'babel-eslint'
  },
  plugins: [
    new ExtractTextPlugin("[name].css", {
      allChunks : true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      '__DEV__': true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js', 2),
    new webpack.NoErrorsPlugin()
  ],
}
