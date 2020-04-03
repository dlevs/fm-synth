# FM Synth

An FM synth built with react and the Web Audio API.

## Links

- [CI build](https://fm-synth.netlify.com/) [![Netlify Status](https://api.netlify.com/api/v1/badges/eac856ef-4db3-45df-98a0-2dff601e3d04/deploy-status)](https://app.netlify.com/sites/fm-synth/deploys)
- [Component library](https://fm-synth-storybook.netlify.com/) [![Netlify Status](https://api.netlify.com/api/v1/badges/a1d50549-fbb4-43d6-b61b-5b670325b21f/deploy-status)](https://app.netlify.com/sites/fm-synth-storybook/deploys)

## Getting started

Install [Node.js](https://nodejs.org/en/), then run in the root of this repository:

```bash
npm install
npm start
```

See [package.json](./package.json) for all available commands.

## Dependencies

This project was bootstrapped with:

- [`@storybook/cli`](https://www.npmjs.com/package/@storybook/cli) for showcasing and testing the component library in isolation. It has a few dependencies prefixed with `@storybook` (like `@storybook/addon-info`), and two non-prefixed dependencies: `@babel/core` and `babel-loader`.

## TODO

- Add useRedux when implemented https://github.com/reduxjs/react-redux/issues/1063
- Check tsconfig.json to see if can be tidied more
- "servor" should have ability to have no fallback for non-root paths. Maybe raise a PR.
