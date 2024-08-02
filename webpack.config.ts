import webpack from 'webpack'
import { resolve } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath'

module.exports = (env: { APP_BUILD?: string; FUNCTION_APP?: string }) => {
  //get PUBLIC_URL, which is needed for production builds where process (which is a Node server var), doesn't exist
  const publicUrlOrPath = getPublicUrlOrPath(process.env.NODE_ENV === 'development', undefined, process.env.PUBLIC_URL)

  const prod = process.env.NODE_ENV === 'production'

  return {
    mode: prod ? 'production' : 'development',
    cache: { type: 'filesystem' },
    infrastructureLogging: { level: 'info' },
    stats: 'normal',
    devtool: false,
    bail: true,
    resolve: {
      modules: [resolve(__dirname, 'node_modules'), resolve(__dirname, './src')]
    },
    entry: './src/index.tsx',
    output: {
      path: resolve(__dirname, 'build'),
      publicPath: publicUrlOrPath,
      filename: prod ? '[name].[contenthash:8].js' : undefined,
      chunkFilename: prod ? '[name].[contenthash:8].chunk.js' : undefined,
      assetModuleFilename: 'media/[name].[hash][ext]',
      clean: true //clears the output dir prior to building
    },
    devServer: {
      port: '3000',
      static: ['./public'],
      open: true,
      hot: true,
      historyApiFallback: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
          runtimeErrors: true
        }
      }
    },
    module: {
      rules: [
        //Typescript loader
        {
          test: /\.([cm]?ts|tsx)$/,
          exclude: /node_modules/,
          resolve: {
            extensions: ['.ts', '.tsx']
          },

          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {}
            }
          ]
        }
      ].filter(Boolean)
    },
    plugins: [
      //Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({ filename: 'index.html', template: 'index.html' }),

      //Copies the public directory into the root of build directory
      new CopyWebpackPlugin({ patterns: [{ from: 'public' }] }),

      //Makes environment variables available to the build code
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          PUBLIC_URL: JSON.stringify(publicUrlOrPath.slice(0, -1)),
          APP_BUILD: JSON.stringify(env.APP_BUILD),
          FUNCTION_APP: JSON.stringify(env.FUNCTION_APP)
        }
      })
    ]
  }
}
