import { resolve } from 'path'
import { defineConfig } from 'vite'
import { BugsnagBuildReporterPlugin } from 'vite-plugin-bugsnag'
import { getEndpoint } from '../support'

export default defineConfig({
  build: {
    rollupOptions: {
      input: [resolve(__dirname, './app.js')],
    },
  },
  plugins: [
    BugsnagBuildReporterPlugin({
      apiKey: 'YOUR_API_KEY',
      appVersion: '1.2.3',
      endpoint: getEndpoint(__dirname),
    }),
  ],
})
