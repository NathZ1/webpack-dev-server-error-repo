import webpack from 'webpack'
import { relative, resolve } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import ESLintPlugin from 'eslint-webpack-plugin'
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin'
import ReactRefreshTypeScript from 'react-refresh-typescript'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import getPublicUrlOrPath from 'react-dev-utils/getPublicUrlOrPath'
import { WebpackManifestPlugin } from 'webpack-manifest-plugin'

module.exports = (env: { APP_BUILD?: string; FUNCTION_APP?: string }) => {
  //get PUBLIC_URL, which is needed for production builds where process (which is a Node server var), doesn't exist
  const publicUrlOrPath = getPublicUrlOrPath(process.env.NODE_ENV === 'development', undefined, process.env.PUBLIC_URL)

  //set whether are creating source maps with prod builds
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  const genSourceMaps: boolean = true

  const prod = process.env.NODE_ENV === 'production'

  return {
    mode: prod ? 'production' : 'development',
    cache: { type: 'filesystem' },
    infrastructureLogging: { level: 'info' },
    stats: 'normal',
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    devtool: !prod ? (genSourceMaps ? 'source-map' : false) : false, //https://webpack.js.org/configuration/devtool/
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
      clean: true, //clears the output dir prior to building

      // Point sourcemap entries to original disk location (format as URL on Windows)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      devtoolModuleFilenameTemplate: (info: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (prod) return relative('./src', info.absoluteResourcePath).replace(/\\/g, '/')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        else return resolve(info.absoluteResourcePath).replace(/\\/g, '/')
      }
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
        //Handle node_modules packages that contain sourcemaps
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        genSourceMaps && {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|mjs|jsx|ts|tsx|css)$/,
          loader: require.resolve('source-map-loader')
        },

        //Typescript loader
        //NOTE: uses fork-ts-checker-webpack-plugin for TS checking in dev on a separate thread
        {
          test: /\.([cm]?ts|tsx)$/,
          exclude: /node_modules/,
          resolve: {
            extensions: ['.ts', '.tsx', '.js']
          },

          use: [
            {
              loader: require.resolve('ts-loader'),
              options: {
                getCustomTransformers: () => ({
                  before: [!prod && ReactRefreshTypeScript()].filter(Boolean)
                }),
                transpileOnly: !prod
              }
            }
          ]
        },

        //CSS loaders
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            //In prod, MiniCSSExtractPlugin extract CSS to file(s), but in development "style" loader enables hot editing of CSS.
            prod && MiniCssExtractPlugin.loader,

            //style loader turns CSS into JS modules that inject <style> tags
            !prod && require.resolve('style-loader'),

            //css-loader resolves paths in CSS and adds assets as dependencies
            {
              loader: require.resolve('css-loader'),
              options: { sourceMap: genSourceMaps }
            },

            //postcss loader applies autoprefixer to CSS
            {
              loader: require.resolve('postcss-loader'),
              options: { sourceMap: genSourceMaps }
            }
          ].filter(Boolean),
          sideEffects: true //See https://github.com/webpack/webpack/issues/6571
        }
      ].filter(Boolean)
    },
    plugins: [
      //Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({ filename: 'index.html', template: 'index.html' }),

      //Extracts CSS into separate files
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:8].css',
        chunkFilename: '[name].[contenthash:8].chunk.css'
      }),

      //Copies the public directory into the root of build directory
      new CopyWebpackPlugin({ patterns: [{ from: 'public' }] }),

      //Checks code for issues with eslint
      //NOTE: Disabling this initially, as it produces hundreds of errors/warnings for new ESLint rules
      new ESLintPlugin({ extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'] }),

      //Used for TS checking - does the checks on a separate process to the build
      //NOTE: This plugin uses TypeScipt's, not Webpack's modules resolution (i.e. uses tsconfig.json)
      new ForkTsCheckerWebpackPlugin(),

      //Enables new React hot reloading in dev builds
      ...(!prod ? [new ReactRefreshWebpackPlugin()] : []),

      //Makes environment variables available to the build code
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          PUBLIC_URL: JSON.stringify(publicUrlOrPath.slice(0, -1)),
          APP_BUILD: JSON.stringify(env.APP_BUILD),
          FUNCTION_APP: JSON.stringify(env.FUNCTION_APP)
        }
      }),

      // Generate an asset manifest file
      new WebpackManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath: publicUrlOrPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path
            return manifest
          }, seed)

          const entrypointFiles = entrypoints.main.filter(fileName => !fileName.endsWith('.map'))

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles
          }
        }
      })
    ],
    optimization: {
      nodeEnv: false,
      minimizer: [
        //minimise JS
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false
            }
          }
        }),

        //minimise CSS
        new CssMinimizerPlugin()
      ]
    }
  }
}
