import tls from 'node:tls'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import assert from 'node:assert'
import { SocketError, connect } from '../src'
import { listenAndGetSocketAddress, writeAndReadSocket } from './utils'

function getTLSServer (): tls.Server {
  const server = tls.createServer({
    key: fs.readFileSync(path.join(__dirname, '/certs/server/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '/certs/server/server.crt')),
    ca: fs.readFileSync(path.join(__dirname, '/certs/ca/ca.crt')),
    rejectUnauthorized: false,
  })

  return server
}

test('Socket `connect` with TLS', async (t) => {
  t.before(() => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  })

  await t.test('with `secureTransport: "on"`', async (t) => {
    await t.test('should connect securely, write, and read data', async () => {
      let connectCount = 0
      const message = 'abcde\r\n'
      const server = getTLSServer()
      server.on('connection', () => {
        connectCount++
      })
      server.on('secureConnection', (c) => {
        connectCount++
        c.pipe(c)
      })
      const address = await listenAndGetSocketAddress(server)
      const socket = connect(address, { secureTransport: 'on' })
      const result = await writeAndReadSocket(socket, message)
      assert.strictEqual(connectCount, 2, 'should connect two times')
      assert.strictEqual(result, message, 'should pipe message')
      await socket.close()
      server.close()
    })

    await t.test('should not be able to call `.startTls()`', async () => {
      const server = getTLSServer()
      const address = await listenAndGetSocketAddress(server)
      const socket = connect(address, { secureTransport: 'on' })
      assert.throws(
        () => {
          socket.startTls()
        },
        new SocketError("secureTransport must be set to 'starttls'"),
        'calling .startTls() throws an error'
      )
      await socket.close()
      server.close()
    })
  })

  await t.test('with `secureTransport: "starttls"`', async (t) => {
    await t.test(
      'should connect securely (on demand), write, and read data',
      async () => {
        let connectCount = 0
        const message = 'abcde\r\n'
        const server = getTLSServer()
        server.on('connection', () => {
          connectCount++
        })
        server.on('secureConnection', (c) => {
          connectCount++
          c.pipe(c)
        })
        const address = await listenAndGetSocketAddress(server)
        const socket = connect(address, { secureTransport: 'starttls' })
        const secureSocket = socket.startTls()
        const result = await writeAndReadSocket(secureSocket, message)
        assert.strictEqual(connectCount, 2, 'should connect two times')
        assert.strictEqual(result, message, 'should pipe message')
        await socket.close()
        await secureSocket.close()
        server.close()
      }
    )

    await t.test('should only be able to call startTls once', async () => {
      const server = getTLSServer()
      const address = await listenAndGetSocketAddress(server)
      const socket = connect(address, { secureTransport: 'starttls' })
      const secureSocket = socket.startTls()
      assert.throws(
        () => {
          socket.startTls()
        },
        new SocketError('can only call startTls once'),
        'second call to .startTls() throws an error'
      )
      await socket.close()
      await secureSocket.close()
      server.close()
    })
  })
})
