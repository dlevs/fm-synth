const path = require('path');
module.exports = (baseConfig, env, config) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
      // The "babel-loader" and options are copy + pasted from "react-scripts"
      // so that story compilation will use the same method as the rest of the
      // app.
      // Some of the modules are not explicitly in package.json - we rely on
      // "react-scripts" to install these.
      {
        loader: require.resolve('babel-loader'),
        options: {
          customize: require.resolve(
            'babel-preset-react-app/webpack-overrides'
          ),
          presets: [require.resolve('babel-preset-react-app')],
        }
      },
      require.resolve('react-docgen-typescript-loader'),
    ]
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};
