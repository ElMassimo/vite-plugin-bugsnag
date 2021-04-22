/**
 * Describes the build you are reporting to Bugsnag.
 */
export interface Build {
  /**
   *  Your Bugsnag API key [required]
   */
  apiKey: string
  /**
   *  The version of the application you are building [required]
   */
  appVersion: string
  /**
   *  'production', 'staging' etc. Leave blank if this build can be released to different releaseStages.
   */
  releaseStage?: string
  /**
   *  An object describing the source control of the build.
   *
   *  If not specified, the module will attempt to detect source control information from .git, .hg and the nearest package.json
   */
  sourceControl?: object
  /**
   *  The application you are using to manage your source code repository
   */
  provider?: 'github' | 'github-enterprise' | 'gitlab' | 'gitlab-onpremise' | 'bitbucket' | 'bitbucket-server'
  /**
   *  A URL (git/ssh/https) pointing to the repository, or webpage representing the repository
   */
  repository?: string
  /**
   *  The unique identifier for the commit (e.g. git SHA)
   */
  revision?: string
  /**
   *  The name of the person/machine that created this build.
   *
   *  Defaults to the result of the `whoami` command.
   */
  builderName?: string
  /**
   *  Automatically associate this build with any new error events and sessions
   *  that are received for the releaseStage until a subsequent build notification is received.
   *
   *  If this is set to true and no releaseStage is provided the build will be applied to 'production'.
   */
  autoAssignRelease?: boolean
}

export interface ReportBuildOptions {
  /**
   * The minimum severity of log to output.
   * @default 'warn'
   */
  logLevel?: 'debug' | 'info' | 'warn' | 'error'
  /**
   * Provide a different logger object `{ debug, info, warn, error }`.
   */
  logger?: object
  /**
   * The path to search for source control info.
   * @default process.cwd()
   */
  path?: string
  /**
   * Post the build payload to a URL other than the default.
   * @default 'https://build.bugsnag.com'
   */
  endpoint?: string
}

export interface BuildReporterConfig extends Build, ReportBuildOptions {
  /**
   * Whether to send the build information to Bugsnag.
   *
   * @default `true` when building in `production` mode.
   * @default `false` when building in `development` mode.
   */
  sendReport?: boolean
}

/**
 * Describes a sourcemap file for one of the built files.
 */
export interface Sourcemap {
  url: string
  source: string
  map: string
}

export interface SourceMapUploaderConfig {
  /**
   *  Your Bugsnag API key [required]
   */
  apiKey: string
  /**
   *  The path to your bundled assets (as the browser will see them).
   *
   *  This option must either be provided here, or as base in your Vite config.
   */
  base?: string
  /**
   *  The version of the application you are building.
   *
   *  Defaults to the version set in your project's package.json file, if one is specified there.
   */
  appVersion?: string
  /**
   *  The codeBundleId (e.g. for NativeScript projects)
   */
  codeBundleId?: string
  /**
   *  Whether you want to overwrite previously uploaded sourcemaps
   */
  overwrite?: boolean
  /**
   *  Post the build payload to a URL other than the default.
   *  @default 'https://upload.bugsnag.com'
   */
  endpoint?: string
  /**
   * A list of bundle file extensions which shouldn't be uploaded.
   *
   * @default ['.css']
   */
  ignoredBundleExtensions?: string[]
}
