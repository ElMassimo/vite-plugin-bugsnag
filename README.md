<h2 align='center'><samp>vite-plugin-bugsnag</samp></h2>

<p align='center'>Report builds and upload source maps to <samp>bugsnag</samp></p>

<p align='center'>
  <a href='https://www.npmjs.com/package/vite-plugin-bugsnag'>
    <img src='https://img.shields.io/npm/v/vite-plugin-bugsnag?color=222&style=flat-square'>
  </a>
  <a href='https://github.com/ElMassimo/vite-plugin-bugsnag/blob/main/LICENSE.txt'>
    <img src='https://img.shields.io/badge/license-MIT-blue.svg'>
  </a>
</p>

<br>

[vite-plugin-bugsnag]: https://github.com/ElMassimo/vite-plugin-bugsnag
[migration]: https://vite-ruby.netlify.app/guide/migration.html#migrating-to-vite
[vite.js]: http://vitejs.dev/
[Bugsnag]: http://bugsnag.com/
[webpack-bugsnag-plugins]: https://github.com/bugsnag/webpack-bugsnag-plugins
[sourcemap]: https://vitejs.dev/config/#build-sourcemap
[Vite Ruby]: https://vite-ruby.netlify.app/config/#source-maps-%F0%9F%97%BA

## Why? 🤔

There is no official plugin from [Bugsnag] for [Vite.js].

This plugin provides the same functionality as <kbd>[webpack-bugsnag-plugins]</kbd> in [Vite.js].

The API is similar to simplify the [migration] when moving away from Webpack.

## Features ⚡️

- 🔒 Written in TypeScript
- 🚀 Quick setup with Vite plugins
- 📖 Config options are fully documented in JSDoc

## Installation 💿

Install the package as a development dependency:

```bash
npm i -D vite-plugin-bugsnag # yarn add -D vite-plugin-bugsnag
```

## Usage 🚀

Two plugins are provided, one to report build information, and another one to upload sourcemaps.

Both plugins accept `apiKey`, `appVersion`, and `endpoint`, so you can share a config object.

For example:

```js
import { defineConfig } from 'vite'
import { BugsnagBuildReporterPlugin, BugsnagSourceMapUploaderPlugin } from 'vite-plugin-bugsnag'

const isDistEnv = process.env.RAILS_ENV === 'production'

const bugsnagOptions = {
  apiKey: process.env.BUGSNAG_API_KEY,
  appVersion: process.env.APP_VERSION,
}

export default defineConfig({
  plugins: [
    isDistEnv && BugsnagBuildReporterPlugin({ ...bugsnagOptions, releaseStage: process.env.RAILS_ENV }),
    isDistEnv && BugsnagSourceMapUploaderPlugin({ ...bugsnagOptions, overwrite: true }),
  ],
})
```


### `BugsnagBuildReporterPlugin (options)`

Use this plugin to report your application's build to Bugsnag.

```js
import { defineConfig } from 'vite'
import { BugsnagBuildReporterPlugin } from 'vite-plugin-bugsnag'

export default defineConfig({
  plugins: [
    BugsnagBuildReporterPlugin({
      apiKey: 'YOUR_API_KEY',
      appVersion: '1.2.3',
    }),
  ],
})
```

- It can auto detect source control from `.git`, `.hg` and `package.json`
- Hooks into `writeBundle` to upload the information once the build is finished
- If the build fails, the build report will not be sent

### `BugsnagSourceMapUploaderPlugin (options)`

Use this plugin to upload your application's sourcemaps to Bugsnag.

```js
import { defineConfig } from 'vite'
import { BugsnagSourceMapUploaderPlugin } from 'vite-plugin-bugsnag'

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      appVersion: '1.2.3',
      publicPath: 'https://your-app.xyz/assets/',
    }),
  ],
})
```

- The plugin will enable [`build.sourcemap`][sourcemap] in order for Vite to [generate sourcemaps][Vite Ruby]
- It will upload any generated sourcemaps to Bugsnag

## License

This library is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
