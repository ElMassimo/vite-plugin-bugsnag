import reportBuild from 'bugsnag-build-reporter'

import type { Plugin } from 'vite'
import { red } from 'chalk'
import type { BuildReporterConfig, ReportBuildOptions } from './types'
import { warn } from './utils'

export default function BugsnagBuildReporterPlugin (config: BuildReporterConfig): Plugin {
  // eslint-disable-next-line prefer-const
  let { sendReport, logLevel = 'warn', logger, path, endpoint, ..._build } = config
  const build = { buildTool: 'vite-plugin-bugsnag', ..._build }
  const options: ReportBuildOptions = { logLevel, logger, path, endpoint }

  return {
    name: 'bugsnag-build-reporter',
    apply: 'build',
    configResolved (config) {
      if (sendReport === undefined) sendReport = config.mode === 'production'
    },
    buildEnd (error) {
      if (error) sendReport = false
    },
    async writeBundle () {
      try {
        if (sendReport) await reportBuild(build, options)
      }
      catch (error) {
        // A failure to notify Bugsnag shouldn't fail the build.
        warn(`unable to report build\n${red(error.message)}`)
      }
    },
  }
}
