import { resolve } from 'path'
import { defineConfig } from 'vite'
import { BugsnagSourceMapUploaderPlugin } from 'vite-plugin-bugsnag'
import { getEndpoint } from '../support'

export default defineConfig({
  base: 'https://foobar.com/js/',
  build: {
    rollupOptions: {
      input: [resolve(__dirname, './app.js')],
    },
  },
  plugins: [
    BugsnagSourceMapUploaderPlugin({
      apiKey: 'YOUR_API_KEY',
      codeBundleId: '1.0.0-b12',
      endpoint: getEndpoint(__dirname),
    }),
  ],
})
