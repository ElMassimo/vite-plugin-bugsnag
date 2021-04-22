import createDebugger from 'debug'
import type { OutputAsset, OutputChunk } from 'rollup'
import { yellow } from 'chalk'

export const debug = createDebugger('vite-plugin-bugsnag')

export function warn (message: string) {
  return debug(`${yellow('[warning]')} ${message}`)
}
