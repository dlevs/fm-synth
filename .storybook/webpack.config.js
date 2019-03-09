module.exports = async ({ config }) => {
  const babelLoader = config.module.rules.find(({ loader }) => {
		return loader && loader.includes('node_modules/babel-loader/')
	})

	babelLoader.options.presets.push('@emotion/babel-preset-css-prop')
	babelLoader.options.plugins.push('polished')

  return config
}
