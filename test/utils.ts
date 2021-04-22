import * as http from 'http'
import { writeFileSync, rmSync } from 'fs'
import type { AddressInfo } from 'net'
import { join } from 'path'
import { build } from 'vite'
import { writeServerPort } from './fixtures/support'

type Fixture = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

export interface Options {
  port: any
}

export async function buildFixture (name: Fixture, { port }: Options) {
  const root = join(__dirname, 'fixtures', name)
  writeServerPort(root, port)
  await build({ root })
}

interface CreateServerOptions {
  done: jest.DoneCallback
  onResponse: (body: string) => void
  withServer: (options: Options) => Promise<void>
}

export async function createServer ({ done, onResponse, withServer }: CreateServerOptions) {
  const server = http.createServer((req, res) => {
    let body = ''
    req.on('data', (d) => { body += d })
    req.on('end', () => {
      try {
        res.end('ok')
        onResponse(body)
      }
      catch (error) {
        res.end(error.message)
        done.fail(error)
      }
    })
  })
  server.listen()
  try {
    console.log({ withServerPort: (server.address() as any).port })
    await withServer({ port: (server.address() as AddressInfo).port })
  }
  finally {
    server.close()
    done()
  }
}
