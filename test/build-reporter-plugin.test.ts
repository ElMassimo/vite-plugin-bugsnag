import { describe, test, expect } from 'vitest'
import { createServer, buildFixture } from './utils'

describe('BugsnagBuildReporterPlugin', () => {
  test('sends upon successful build', async (done) => {
    expect.assertions(3)
    await createServer({
      done,
      onRequest (body) {
        const build = JSON.parse(body)
        expect(build).toBeDefined()
        expect(build.appVersion).toEqual('1.2.3')
        expect(build.apiKey).toEqual('YOUR_API_KEY')
      },
      async withServer ({ port }) {
        await buildFixture('a', { port })
      },
    })
  })

  test('doesn’t send upon unsuccessful build', async (done) => {
    await createServer({
      done,
      onRequest (body) {
        done(`received unexpected request:\n\n${body}`)
      },
      async withServer ({ port }) {
        try {
          await buildFixture('b', { port })
        }
        catch (error) {
          expect(error.message).toMatch('Unexpected token (2:23)')
        }
      },
    })
  })
})
