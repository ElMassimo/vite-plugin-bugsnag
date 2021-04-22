import * as http from 'http'
import type { AddressInfo } from 'net'
import { join } from 'path'
import { build } from 'vite'
import parseFormdata from 'parse-formdata'
import once from 'once'
import concat from 'concat-stream'
import type { Readable } from 'node:stream'
import { writeServerPort } from './fixtures/support'

type Fixture = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

export interface Options {
  port: any
}

export interface FormDataPart {
  name: string
  stream: Readable
  mimetype: string
}

export interface FormData {
  fields: any
  parts: FormDataPart[]
}

export async function buildFixture (name: Fixture, { port }: Options) {
  const root = join(__dirname, 'fixtures', name)
  writeServerPort(root, port)
  await build({ root })
}

interface CreateServerOptions {
  done: jest.DoneCallback
  onRequest?: (body: string) => void
  handleRequest?: (req: http.IncomingMessage, res: http.ServerResponse) => void
  withServer: (options: Options) => Promise<void>
}

export async function createServer ({ done, handleRequest, onRequest, withServer }: CreateServerOptions) {
  const server = http.createServer((req, res) => {
    if (!handleRequest) {
      handleRequest = () => {
        let body = ''
        req.on('data', (d) => { body += d })
        req.on('end', () => {
          try {
            res.end('ok')
            onRequest(body)
          }
          catch (error) {
            res.end(error.message)
            done.fail(error)
          }
        })
      }
    }
    handleRequest(req, res)
  })
  server.listen()
  try {
    await withServer({ port: (server.address() as AddressInfo).port })
  }
  finally {
    server.close()
    done()
  }
}

interface CreateFormServerOptions {
  done: jest.DoneCallback
  onRequest: (data: FormData) => void
  onPart: (part: FormDataPart, data: string, partsRead: number) => boolean
  withServer: (options: Options) => Promise<void>
}

export async function createFormServer ({ done, withServer, onRequest, onPart }: CreateFormServerOptions) {
  await createServer({
    done,
    withServer,
    handleRequest (req, res) {
      parseFormdata(req, once((error: Error | undefined, data: FormData) => {
        if (error) {
          res.end(error.message)
          done.fail(error)
        }
        try {
          onRequest(data)
          let partsRead = 0
          let bail = false
          data.parts.forEach((part) => {
            if (bail) return
            part.stream.pipe(concat((data: string) => {
              partsRead++
              bail = onPart(part, data, partsRead) === false
            }))
          })
          res.end('OK')
        }
        catch (error) {
          res.end(error.message)
          done.fail(error)
        }
      }))
    },
  })
}
