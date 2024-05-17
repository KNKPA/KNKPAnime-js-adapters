const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const fs = require('fs');

module.exports = {
  mode: 'production', // or 'development' for debugging
  entry: fs.readdirSync(path.resolve(__dirname, 'src'))
  .filter(file => file.endsWith('.js'))
  .reduce((entries, file) => {
    const entryName = path.parse(file).name;
    entries[entryName] = path.resolve(__dirname, 'src', file);
    return entries;
  }, {}),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'compiled_adapters'),
    library: 'adapter',
  },
  module: {
    rules: [
      {
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime'],
          },
        },
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_fnames: true,
        },
      }),
    ],
  },
};