import { SourceMapUploaderConfig, BugsnagSourceMapUploaderPlugin } from 'vite-plugin-bugsnag'
import { createFormServer, buildFixture } from './utils'

describe('BugsnagSourceMapUploaderPlugin', () => {
  test('requires an API key', () => {
    expect(() => BugsnagSourceMapUploaderPlugin({} as SourceMapUploaderConfig)).toThrow(/"apiKey" is required/)
    expect(() => BugsnagSourceMapUploaderPlugin({ apiKey: '1.2.3' })).not.toThrow()
  })

  test('sends source maps for files inside folder', async (done) => {
    expect.assertions(5)

    await createFormServer({
      done,
      async withServer ({ port }) {
        await buildFixture('c', { port })
      },
      onRequest ({ fields, parts }) {
        expect(fields.apiKey).toEqual('YOUR_API_KEY')
        expect(fields.minifiedUrl).toMatch(/^https:\/\/foobar.com\/js\/assets\/index\.[\w\d]+\.js$/)
        expect(parts.length).toEqual(2)
      },
      onPart (part, data, partsRead) {
        if (partsRead === 1) expect(part.filename).toMatch(/index\.[\w\d]+\.js\.map$/)
        if (partsRead === 2) expect(part.filename).toMatch(/index\.[\w\d]+\.js$/)
        return partsRead === 2
      },
    })
  })

  test('it ignores source maps if you want', async (done) => {
    expect.assertions(0)

    await createFormServer({
      done,
      async withServer ({ port }) {
        await buildFixture('d', { port })
      },
    })
  })

  test('sends sourcemaps from successful build along with bundle id', async (done) => {
    expect.assertions(7)

    await createFormServer({
      done,
      onRequest ({ fields, parts }) {
        expect(fields.apiKey).toEqual('YOUR_API_KEY')
        expect(fields.codeBundleId).toEqual('1.0.0-b12')
        expect(fields.minifiedUrl).toMatch(/^https:\/\/foobar.com\/js\/assets\/app\.[\w\d]+\.js$/)
        expect(parts.length).toEqual(2)
      },
      onPart (part, data, partsRead) {
        if (part.name === 'sourceMap') {
          expect(part.mimetype).toEqual('application/json')
          expect(() => JSON.parse(data)).not.toThrow()
        }
        else if (part.name === 'minifiedFile') {
          expect(part.mimetype).toEqual('application/javascript')
        }
        return partsRead === 2
      },
      async withServer ({ port }) {
        await buildFixture('e', { port })
      },
    })
  })
})
