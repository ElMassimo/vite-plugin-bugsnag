import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'

const getPortFile = (dir: string) => join(dir, '.port')

export function writeServerPort (dir: string, port: any) {
  writeFileSync(getPortFile(dir), String(port))
}

export function getEndpoint (dir: string) {
  const port = readFileSync(getPortFile(dir))
  return `http://localhost:${port}`
}
