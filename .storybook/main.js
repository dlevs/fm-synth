const path = require('path')
const webpack = require('webpack')
const srcDir = path.resolve(__dirname, '../src')

module.exports = {
	stories: [
		'../src/**/*.stories.(tsx|ts|jsx|js)'
	],
	addons: [
		'@storybook/addon-knobs/register',
		'@storybook/addon-actions/register',
		'@storybook/addon-storysource/register'
	],
	webpackFinal: async (config, ...rest) => {
		config.module.rules.push({
			test: /\.tsx?$/,
			exclude: /node_modules/,
			use: [
				{
					loader: require.resolve('babel-loader')
				},
				// require.resolve('react-docgen-typescript-loader')
			]
		});

		config.resolve.extensions = Array.from(
			new Set([
				...config.resolve.extensions,
				'.ts', '.tsx', '.js', '.json'
			])
		)
		config.plugins.push(
			// Strip ".js" extensions from TypeScript file imports.
			//
			// Web browsers expect imports to end with ".js" - extensionless
			// imports don't work in the browser. Due to this, all imports
			// are written with ".js" extensions.
			//
			// But the Storybook build fails due to the mismatch between ".js"
			// in the import, and the ".ts" file it is to be matched to.
			//
			// This hack feels unnecessary. Hopefully there's a better way...
			new webpack.NormalModuleReplacementPlugin(/\.js$/, (resource) => {
				if (!resource.contextInfo) return

				const { issuer } = resource.contextInfo

				if (
					issuer &&
					(issuer.endsWith('.tsx') || issuer.endsWith('.ts')) &&
					resource.context.startsWith(srcDir)
				) {
					resource.request = resource.request.replace('.js', '')
				}
			}),
			// Another hack to prevent resolving dependencies to snowpack's
			// "web_modules" directory.
			// TODO: See if this can be achieved via babelrc config.
			new webpack.NormalModuleReplacementPlugin(/^\/web_modules\//, (resource) => {
				resource.request = resource.request.replace('/web_modules/', '')
			})
		)

		return config
	}
}
