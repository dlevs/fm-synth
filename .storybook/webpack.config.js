module.exports = async ({ config }) => {
	config.module.rules.push({
		test: /\.stories\.(js|ts)x?$/,
		loaders: [
			{
				loader: require.resolve('@storybook/addon-storysource/loader'),
				options: { parser: 'typescript' }
			}
		],
		enforce: 'pre',
	})

	const babelLoader = config.module.rules.find(({ loader }) => {
		return loader && loader.includes('node_modules/babel-loader/')
	})

	babelLoader.options.presets.push('@emotion/babel-preset-css-prop')
	babelLoader.options.plugins.push('polished')

	return config
}
