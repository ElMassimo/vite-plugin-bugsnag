declare module 'bugsnag-build-reporter' {
  import type { Build, BuildReporterOptions } from './types'

  const reportBuild: (build: Build, options: BuildReporterOptions) => Promise
  export default reportBuild
}
