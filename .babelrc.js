module.exports = (api) => {
	api.cache(true)

	return {
		presets: [
			'@emotion/babel-preset-css-prop'
		]
	}
}
