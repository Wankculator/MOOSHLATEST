const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      // Main entry point
      main: './public/js/moosh-wallet-modular.js',
      
      // Separate bundles for heavy features
      ordinals: './public/js/modules/features/ordinals-manager.js',
      swap: './public/js/modules/modals/SwapModal.js',
      
      // Core modules bundle
      core: [
        './public/js/modules/core/element-factory.js',
        './public/js/modules/core/state-manager.js',
        './public/js/modules/core/api-service.js',
        './public/js/modules/core/router.js',
        './public/js/modules/core/component.js'
      ],
      
      // UI bundle
      ui: [
        './public/js/modules/ui/button.js',
        './public/js/modules/ui/terminal.js',
        './public/js/modules/ui/header.js',
        './public/js/modules/ui/transaction-history.js'
      ]
    },
    
    output: {
      path: path.resolve(__dirname, 'dist/js'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
      publicPath: '/js/'
    },
    
    optimization: {
      minimize: isProduction,
      
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 10,
            reuseExistingChunk: true
          },
          
          // Core modules used everywhere
          core: {
            test: /[\\/]modules[\\/]core[\\/]/,
            name: 'core',
            priority: 9,
            minChunks: 2,
            reuseExistingChunk: true
          },
          
          // UI components
          ui: {
            test: /[\\/]modules[\\/](ui|pages)[\\/]/,
            name: 'ui',
            priority: 8,
            minChunks: 2,
            reuseExistingChunk: true
          },
          
          // Modal components (lazy loadable)
          modals: {
            test: /[\\/]modules[\\/]modals[\\/]/,
            name: 'modals',
            priority: 7,
            minChunks: 1,
            reuseExistingChunk: true
          },
          
          // Utilities
          utils: {
            test: /[\\/]modules[\\/]utils[\\/]/,
            name: 'utils',
            priority: 6,
            minChunks: 3,
            reuseExistingChunk: true
          },
          
          // Default chunk for remaining code
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      },
      
      // Create a runtime chunk
      runtimeChunk: 'single',
      
      // Module IDs
      moduleIds: isProduction ? 'deterministic' : 'named',
      
      // Use content hash for better caching
      realContentHash: true
    },
    
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: [
                      '>0.25%',
                      'not dead',
                      'not IE 11'
                    ]
                  },
                  modules: false,
                  useBuiltIns: 'usage',
                  corejs: 3
                }]
              ]
            }
          }
        }
      ]
    },
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'public/js'),
        '@modules': path.resolve(__dirname, 'public/js/modules'),
        '@core': path.resolve(__dirname, 'public/js/modules/core'),
        '@ui': path.resolve(__dirname, 'public/js/modules/ui'),
        '@utils': path.resolve(__dirname, 'public/js/modules/utils')
      }
    },
    
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 250000,
      maxAssetSize: 250000
    },
    
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    
    stats: {
      children: false,
      chunks: false,
      chunkModules: false,
      modules: false,
      reasons: false
    }
  };
};