// https://www.maizhiying.me/posts/2017/03/01/webpack-babel-ie8-support.html
const path = require('path')
const moment = require('moment')
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const rules = require('./webpack.rules')
module.exports = {
  mode:'production',
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'main.js',
    chunkFilename: '[name].[hash].js'
  },
  resolve: {
    modules: ['node_modules', 'src']
  },
  // devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ie8: true,
          warnings: false,
          output: {
            ascii_only: true,
            quote_keys: true
          },
          compress: {
            drop_console: true,
            properties: false
          }        
        }
      }),
      new webpack.BannerPlugin(`${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    ]
  },
  module: {
    rules: rules.concat([{
        test: /\.jsx?$/,
        loader: ['babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              modules: true,
              localIdentName: '[hash:base64]'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'config/postcss.config.js'
              }
            }
          }
        ]
      },
      {
        test: /\.less$/,
        exclude: /(node_modules|antd)/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              modules: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'config/postcss.config.js'
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              relativeUrls: false,
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /antd\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              minimize: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'config/postcss.config.js'
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'url-loader',
        options: {
          // Inline files smaller than 10 kB (10240 bytes)
          limit: 10 * 1024,
          name: 'image/[hash].[ext]'
        },
      },
      {
        test: /\.(jpe?g|png|gif)$/,
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            quality: 80
          },
          // optipng.enabled: false will disable optipng
          optipng: {
            enabled: false
          },
          pngquant: {
            quality: '65-90',
            speed: 4
          }
        },
        // This will apply the loader before the other ones
        enforce: 'pre'
      }
    ])
  },
  plugins: [
    new WebpackCleanupPlugin({
      exclude: ['vendor.js']
    }),
    new webpack.DllReferencePlugin({
      manifest: require('../tmp/manifest.json')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('daily'),
      API_SERVER_PORTAL_PLACEHOLDER: JSON.stringify('http://123.206.136.110:7776'),
      API_SERVER_ACCOUNT_PLACEHOLDER: JSON.stringify('http://10.1.2.9:6767'),
      API_SERVER_CONSOLE_PLACEHOLDER: JSON.stringify('http://10.1.2.9:6767'), 
      API_SERVER_CHECK_PLACEHOLDER: JSON.stringify('http://10.1.2.9:6767')   
    }),
    new webpack.ProvidePlugin({
      'React': 'react'
    }),
    new MiniCssExtractPlugin({
      chunkFilename: '[name].[hash].css',
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: 'template/index.daily.html',
      hash: true,
      random: Math.random().toString().slice(2)
    })
  ]
}
