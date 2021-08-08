const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: './[name].bundle.js'
  },
  cache: {type: "filesystem"},
  target:'web',
  resolve: {
    extensions: ['.js', '.json', '.wasm'],
    fallback: { 
      "https": require.resolve("https-browserify"),
      "http":  require.resolve("stream-http"),
      "path": require.resolve("path-browserify"),
      "assert": require.resolve("assert/"),
      "fs": false,
      "readline": require.resolve("readline"),
      "url": require.resolve("url/") 
    }
  },
  node: {
    global: true,
    __dirname: true,
    __filename: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              "@babel/preset-env",
              {
                "modules": false,
                "useBuiltIns": "usage",
                "corejs":  3,
                "targets": {
                  "browsers": "> 0.25%, not dead"
                }
              }
            ]],
            plugins: ['@babel/plugin-transform-runtime']
          }
        },
        include: path.resolve(__dirname, 'src')
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        type: 'asset/resource',
        generator: {
            // [ext]前面自带"."
            filename: 'assets/[hash:8].[name][ext]',
        },
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true, 
        exclude: /node_modules/
      })
    ],
    splitChunks: {
      chunks: 'all',
    },
  }
};