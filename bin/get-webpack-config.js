const webpack = require('webpack');
const fs = require('fs');
const path = require('path');

const nodeExternals = require('webpack-node-externals');

const extensions = ['.js', '.jsx'];

const isFile = source => (!fs.lstatSync(source).isDirectory());
const isValidEntry = source => extensions.indexOf(path.extname(source)) !== -1;

/**
 * Getter for webpack config for all the different kind of builds there is in this repo
 * @param  {Object} options        Passed from building, starting and testing the application
 * @return {Object}                Webpack config object
 */
module.exports = ({
  bail = true,
} = {}) => {
  const rootPath = path.resolve(__dirname, '..');

  const propTypesPlugin = [
    [
      'transform-react-remove-prop-types',
      {
        /*
    If npm build, wrap the the propTypes, if not, just remove them
    Component.propTypes = process.env.NODE_ENV !== "production" ? {
      // ...
    } : {};
      */
        mode: 'wrap',
        ignoreFilenames: ['node_modules'],
      },
    ],
  ];

  const modulesFolder = path.resolve(rootPath, 'src', 'module');
  const entries = fs.readdirSync(modulesFolder)
    .map(name => path.resolve(modulesFolder, name))
    .filter(isFile)
    .filter(isValidEntry);

  return ({
    bail,
    devtool: 'source-map',
    entry: entries.reduce((obj, entryPath) => Object.assign({}, obj, {
      [path.basename(entryPath, path.extname(entryPath))]: entryPath,
    }), {}),
    output: {
      path: path.resolve(rootPath, 'lib'),
      filename: '[name].js',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: 'process.env !== \'production\'',
      }),
    ],
    module: {
      rules: []
        .concat([
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['es2015', 'stage-2'],
                  plugins: ['transform-decorators-legacy'],
                },
              },
            ],
          },
          {
            test: /\.jsx$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['es2015', 'stage-2', 'react'],
                  plugins: ['transform-decorators-legacy']
                    .concat(propTypesPlugin),
                },
              },
            ],
          },
        ]),
    },
    resolve: {
      extensions: []
        .concat(extensions),
      modules: [
        rootPath,
        path.join(rootPath, 'node_modules'),
      ],
    },
    externals: []
      .concat(nodeExternals({
        modulesDir: path.join(rootPath, 'node_modules'),
      })),
  });
};
