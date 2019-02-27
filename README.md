An FM synth built with react and the Web Audio API.

[View the component library.](https://adoring-wescoff-e8b9ad.netlify.com/)

## Dependencies

This project was bootstrapped with:
- [`create-react-app`](https://github.com/facebookincubator/create-react-app) for the main app compilation. It has a single devDependency: `react-scripts`.
- [`@storybook/cli`](https://www.npmjs.com/package/@storybook/cli) for showcasing and testing the component library in isolation. It has a few dependencies prefixed with `@storybook` (like `@storybook/addon-info`), and two non-prefixed dependencies: `@babel/core` and `babel-loader`.

### `react-scripts` preflight checks

`react-scripts` throws an error when it detects that one of its dependencies has been installed manually. See this issue:
https://github.com/facebook/create-react-app/issues/1795

Due to this...

- `webpack` is a devDependency in package.json, even though it is not used explicitly in this project. `react-scripts` doesn't like the version of `webpack` used by storybook, so we manually install the one it wants.
- `babel-loader` is pegged to a specific version for the same reason.

🤮

## TODO

- Add useRedux when implemented https://github.com/reduxjs/react-redux/issues/1063
- Check tsconfig.json to see if can be tidied more
