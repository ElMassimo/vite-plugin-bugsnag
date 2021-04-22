import { SourceMapUploaderConfig, BugsnagSourceMapUploaderPlugin } from 'vite-plugin-bugsnag'
import { createFormServer, buildFixture } from './utils'

describe('BugsnagSourceMapUploaderPlugin', () => {
  test('requires an API key', () => {
    expect(() => BugsnagSourceMapUploaderPlugin({} as SourceMapUploaderConfig)).toThrow(/"apiKey" is required/)
    expect(() => BugsnagSourceMapUploaderPlugin({ apiKey: '1.2.3' })).not.toThrow()
  })

  test('sends sourcemaps from successful build', async (done) => {
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
        await buildFixture('d', { port })
      },
    })
  })

  // test('it sends upon successful build (example project #2)', (t) => {
  //   const end = (err) => {
  //     server.close()
  //     if (err) return expect(err.message).toFail()
  //     expect().toEnd()
  //   }

  //   expect(7).toPlan()
  //   const server = http.createServer((req, res) => {
  //     parseFormdata(req, once((err, data) => {
  //       if (err) {
  //         res.end('ERR')
  //         return end(err)
  //       }
  //       expect(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key').toEqual()
  //       expect(data.fields.minifiedUrl, 'https://foobar.com/js/bundle.js', 'body should contain minified url').toEqual()
  //       expect(data.parts.length, 2, 'body should contain 2 uploads').toEqual()
  //       let partsRead = 0
  //       data.parts.forEach((part) => {
  //         part.stream.pipe(concat((data) => {
  //           partsRead++
  //           if (part.name === 'sourceMap') {
  //             expect(part.mimetype, 'application/json').toEqual()
  //             try {
  //               expect(JSON.parse(data), 'sourceMap should be valid json').toOk()
  //             }
  //  catch (e) {
  //               end(e)
  //             }
  //           }
  //           if (part.name === 'minifiedFile') {
  //             expect(part.mimetype, 'application/javascript').toEqual()
  //             expect(data.length, 'js bundle should have length').toOk()
  //           }
  //           if (partsRead === 2) end()
  //         }))
  //       })
  //       res.end('OK')
  //     }))
  //   })
  //   server.listen()
  //   exec(path.join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
  //     env: Object.assign({}, process.env, { PORT: server.address().port }),
  //     cwd: path.join(__dirname, 'fixtures', 'c'),
  //   }, (err) => {
  //     if (err) end(err)
  //   })
  // })

  // if (process.env.WEBPACK_VERSION !== '3') {
  //   test('it’s able to locate the files when source maps are written to a different directory', (t) => {
  //     const end = (err) => {
  //       server.close()
  //       if (err) return expect(err.message).toFail()
  //       expect().toEnd()
  //     }

  //     expect(7).toPlan()
  //     const server = http.createServer((req, res) => {
  //       parseFormdata(req, once((err, data) => {
  //         if (err) {
  //           res.end('ERR')
  //           return end(err)
  //         }
  //         expect(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key').toEqual()
  //         expect(data.fields.minifiedUrl, '*/dist/main.js', 'body should contain minified url').toEqual()
  //         expect(data.parts.length, 2, 'body should contain 2 uploads').toEqual()
  //         let partsRead = 0
  //         data.parts.forEach((part) => {
  //           part.stream.pipe(concat((data) => {
  //             partsRead++
  //             if (part.name === 'sourceMap') {
  //               expect(part.mimetype, 'application/json').toEqual()
  //               try {
  //                 expect(JSON.parse(data), 'sourceMap should be valid json').toOk()
  //               }
  //  catch (e) {
  //                 end(e)
  //               }
  //             }
  //             if (part.name === 'minifiedFile') {
  //               expect(part.mimetype, 'application/javascript').toEqual()
  //               expect(data.length, 'js bundle should have length').toOk()
  //             }
  //             if (partsRead === 2) end()
  //           }))
  //         })
  //         res.end('OK')
  //       }))
  //     })
  //     server.listen()
  //     exec(path.join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
  //       env: Object.assign({}, process.env, { PORT: server.address().port }),
  //       cwd: path.join(__dirname, 'fixtures', 'f'),
  //     }, (err) => {
  //       if (err) end(err)
  //     })

  //     test('it ignores source maps for css files by default', (t) => {
  //       expect(7).toPlan()
  //       expect(3).toPlan()
  //       const requests = []
  //       const end = (err) => {
  //         clearTimeout(timeout)
  //         server.close()
  //         if (err) return expect(err.message).toFail()
  //         expect().toEnd()
  //       }

  //       // prevent test hanging forever
  //       const timeout = setTimeout(end, 10000)

  //       const done = () => {
  //         expect(requests[0].minifiedUrl, '*/dist/main.js').toEqual()
  //         expect(requests[0].parts[0].filename, /main\.js\.map$/).toMatch()
  //         expect(requests[0].parts[1].filename, /main\.js$/).toMatch()
  //         end()
  //       }

  //       const server = http.createServer((req, res) => {
  //         parseFormdata(req, once((err, data) => {
  //           if (err) {
  //             res.end('ERR')
  //             return end(err)
  //           }
  //           requests.push({
  //             apiKey: data.fields.apiKey,
  //             minifiedUrl: data.fields.minifiedUrl,
  //             parts: data.parts.map(p => ({ name: p.name, filename: p.filename })),
  //           })
  //           res.end('OK')
  //           done()
  //         }))
  //       })
  //       server.listen()
  //       exec(path.join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
  //         env: Object.assign({}, process.env, { PORT: server.address().port }),
  //         cwd: path.join(__dirname, 'fixtures', 'e'),
  //       }, (err) => {
  //         if (err) end(err)
  //       })
  //     })
  //   })

  //   test('it uploads css map files if you really want', (t) => {
  //     expect(6).toPlan()
  //     const requests = []
  //     const end = (err) => {
  //       clearTimeout(timeout)
  //       server.close()
  //       if (err) return expect(err.message).toFail()
  //       expect().toEnd()
  //     }

  //     // prevent test hanging forever
  //     const timeout = setTimeout(end, 10000)

  //     const done = () => {
  //       requests.sort((a, b) => a.minifiedUrl < b.minifiedUrl ? -1 : 1)
  //       expect(requests[0].minifiedUrl, '*/dist/main.css').toEqual()
  //       expect(requests[0].parts[0].filename, /main\.css\.map/).toMatch()
  //       expect(requests[0].parts[1].filename, /main\.css/).toMatch()
  //       expect(requests[1].minifiedUrl, '*/dist/main.js').toEqual()
  //       expect(requests[1].parts[0].filename, /main\.js\.map/).toMatch()
  //       expect(requests[1].parts[1].filename, /main\.js/).toMatch()
  //       end()
  //     }

  //     const server = http.createServer((req, res) => {
  //       parseFormdata(req, once((err, data) => {
  //         if (err) {
  //           res.end('ERR')
  //           return end(err)
  //         }
  //         requests.push({
  //           apiKey: data.fields.apiKey,
  //           minifiedUrl: data.fields.minifiedUrl,
  //           parts: data.parts.map(p => ({ name: p.name, filename: p.filename })),
  //         })
  //         res.end('OK')
  //         if (requests.length < 2) return
  //         done()
  //       }))
  //     })
  //     server.listen()
  //     exec(path.join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
  //       env: Object.assign({}, process.env, { PORT: server.address().port, IGNORED_EXTENSIONS: '.php,.exe' }),
  //       cwd: path.join(__dirname, 'fixtures', 'e'),
  //     }, (err) => {
  //       if (err) end(err)
  //     })
  //   })

  //   test('it sends upon successful build (output.futureEmitAssets=true)', (t) => {
  //     const end = (err) => {
  //       server.close()
  //       if (err) return expect(err.message).toFail()
  //       expect().toEnd()
  //     }

  //     expect(7).toPlan()
  //     const server = http.createServer((req, res) => {
  //       parseFormdata(req, once((err, data) => {
  //         if (err) {
  //           res.end('ERR')
  //           return end(err)
  //         }
  //         expect(data.fields.apiKey, 'YOUR_API_KEY', 'body should contain api key').toEqual()
  //         expect(data.fields.minifiedUrl, 'https://foobar.com/js/bundle.js', 'body should contain minified url').toEqual()
  //         expect(data.parts.length, 2, 'body should contain 2 uploads').toEqual()
  //         let partsRead = 0
  //         data.parts.forEach((part) => {
  //           part.stream.pipe(concat((data) => {
  //             partsRead++
  //             if (part.name === 'sourceMap') {
  //               expect(part.mimetype, 'application/json').toEqual()
  //               try {
  //                 expect(JSON.parse(data), 'sourceMap should be valid json').toOk()
  //               }
  //  catch (e) {
  //                 end(e)
  //               }
  //             }
  //             if (part.name === 'minifiedFile') {
  //               expect(part.mimetype, 'application/javascript').toEqual()
  //               expect(data.length, 'js bundle should have length').toOk()
  //             }
  //             if (partsRead === 2) end()
  //           }))
  //         })
  //         res.end('OK')
  //       }))
  //     })
  //     server.listen()
  //     exec(path.join(__dirname, '..', 'node_modules', '.bin', 'webpack'), {
  //       env: Object.assign({}, process.env, { PORT: server.address().port }),
  //       cwd: path.join(__dirname, 'fixtures', 'g'),
  //     }, (err) => {
  //       if (err) end(err)
  //     })
  //   })
  // }
})
