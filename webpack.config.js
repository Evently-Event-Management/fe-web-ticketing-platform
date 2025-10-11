const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Use our mocks
      '@/lib/keycloak': path.resolve(__dirname, './cypress/support/mocks/keycloak.ts'),
      '@/providers/AuthProvider': path.resolve(__dirname, './cypress/support/mocks/AuthProvider.tsx'),
      '@/providers/OrganizationProvider': path.resolve(__dirname, './cypress/support/mocks/OrganizationProvider.tsx')
    },
    fallback: {
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    // Provide polyfills for Node.js globals/modules
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({}),
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.browser': true,
    }),
  ]
};