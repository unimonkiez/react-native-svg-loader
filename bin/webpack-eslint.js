const getWebpackConfig = require('./get-webpack-config');

module.exports = {
  extends: 'airbnb',
  globals: {
    __DEV__: false,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: getWebpackConfig(),
      },
    },
  },
};
