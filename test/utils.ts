import * as http from 'http'
import type { AddressInfo } from 'net'
import { join } from 'path'
import type { Readable } from 'node:stream'
import { promisify } from 'util'
import { build } from 'vite'
import parseFormdataWithCallback from 'parse-formdata'
import concat from 'concat-stream'
import { writeServerPort } from './fixtures/support'

type Fixture = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

export interface Options {
  port: any
}

export interface FormDataPart {
  name: string
  filename: string
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
  onRequest?: (body: string) => void
  handleRequest?: (req: http.IncomingMessage, res: http.ServerResponse) => void
  withServer: (options: Options) => Promise<void>
}

const parseFormdata = promisify(parseFormdataWithCallback)

export async function createServer ({ handleRequest, onRequest, withServer }: CreateServerOptions) {
  return new Promise(async (resolve, reject) => {
    const server = http.createServer(async (req, res) => {
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
              reject(error)
            }
          })
        }
      }
      await handleRequest(req, res)
    })
    server.listen()
    try {
      resolve(await withServer({ port: (server.address() as AddressInfo).port }))
    }
    catch (error) {
      reject(error)
    }
    finally {
      server.close()
    }
  })
}

interface CreateFormServerOptions {
  onRequest?: (data: FormData) => void
  onPart?: (part: FormDataPart, data: string, partsRead: number) => boolean
  withServer: (options: Options) => Promise<void>
}

export async function createFormServer ({ withServer, onRequest, onPart }: CreateFormServerOptions) {
  return createServer({
    withServer,
    async handleRequest (req, res) {
      try {
        const data = await parseFormdata(req)
        try {
          onRequest(data)
          let partsRead = 0
          let bail = false
          onPart && data.parts.forEach((part) => {
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
          throw error
        }
      }
      catch (error) {
        if (error) {
          res.end(error.message)
          throw error
        }
      }
    },
  })
}
