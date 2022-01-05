import createDebugger from 'debug'
import pLimit from 'p-limit'
import colors from 'picocolors'
import { parallelismLimit } from './constants'

export const debug = createDebugger('vite-plugin-bugsnag')

export function warn (message: string) {
  return debug(`${colors.yellow('[warning]')} ${message}`)
}

export const limitParallelism = pLimit(parallelismLimit)
