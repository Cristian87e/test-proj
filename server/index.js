import path from 'path'
import http from 'http'
import express from 'express'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import compression from 'compression'
import hpp from 'hpp'
import throng from 'throng'

import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

import DefaultServerConfig from './config'
import webpackConfig from '../tools/webpack.client.dev'
import { compileDev, startDev } from '../tools/dx'

export const createServer = (config) => {
  const __PROD__ = config.nodeEnv === 'production'
  const __TEST__ = config.nodeEnv === 'test'

  const app = express()
  let assets = null
  app.disable('x-powered-by')
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  if (__PROD__ || __TEST__) {

  } else {
    app.use(morgan('dev'))
    const compiler = compileDev((webpack(webpackConfig)), config.port)
    app.use(webpackDevMiddleware(compiler, {
      quiet: true,
      watchOptions: {
        ignored: /node_modules/
      }
    }))
    app.use(webpackHotMiddleware(compiler, { log: console.log }))
  }

  app.use(express.static('public'))
  // app.use('/api/v0/posts', require('./api/posts'))

  // ***************
  // A lot of things
  // ***************

  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charSet="utf-8">
          <meta httpEquiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root"></div>
          <script src="${ __PROD__ ? assets.vendor.js : '/vendor.js' }"></script>
          <script async src="${ __PROD__ ? assets.main.js : '/main.js' }" ></script>
        </body>
      </html>
      `)
  })

  // ***************
  // A lot of things
  // ***************

  const server = http.createServer(app)

  // TODO: Review if this lines below are needed
  // Heroku dynos automatically timeout after 30s. Set our
  // own timeout here to force sockets to close before that.
  // https://devcenter.heroku.com/articles/request-timeout
  // if (config.timeout) {
  //   server.setTimeout(config.timeout, (socket) => {
  //     const message = `Timeout of ${config.timeout}ms exceeded`
  //
  //     socket.end([
  //       'HTTP/1.1 503 Service Unavailable',
  //       `Date: ${(new Date).toGMTString()}`,  // eslint-disable-line
  //       'Content-Type: text/plain',
  //       `Content-Length: ${message.length}`,
  //       'Connection: close',
  //       '',
  //       message
  //     ].join(`\r\n`))
  //   })
  // }

  return server
}

export const startServer = (serverConfig) => {
  const config =  {...DefaultServerConfig, ...serverConfig}
  const server = createServer(config)
  server.listen(config.port, (err) => {
    if (config.nodeEnv === 'production' || config.nodeEnv === 'test') {
      if (err) console.log(err)
      console.log(`server ${config.id} listening on port ${config.port}`)
    } else {
      startDev(config.port, err)
    }
  })
}
// TODO: Remove when necesary
console.log('OK - The Server')

if (require.main === module) {
  throng({
    start: (id) => startServer({ id }),
    workers: process.env.WEB_CONCURRENCY || 1,
    lifetime: Infinity
  })
}
