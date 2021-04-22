import createDebugger from 'debug'
import pLimit from 'p-limit'
import { yellow } from 'chalk'
import { parallelismLimit } from './constants'

export const debug = createDebugger('vite-plugin-bugsnag')

export function warn (message: string) {
  return debug(`${yellow('[warning]')} ${message}`)
}

export const limitParallelism = pLimit(parallelismLimit)
