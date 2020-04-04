module.exports = {
	addons: [
		'@storybook/addon-knobs/register',
		'@storybook/addon-actions/register',
		'@storybook/addon-storysource/register'
	],
	webpackFinal: async config => {
		config.module.rules.push({
			test: /\.(ts|tsx)$/,
			use: [
				{
					loader: require.resolve('ts-loader'),
				},
				// // Optional
				// {
				// 	loader: require.resolve('react-docgen-typescript-loader'),
				// }
			]
		})
		config.resolve.extensions.push('.ts', '.tsx')

		return config
	}
}
