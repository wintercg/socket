import net from 'node:net'
import { once } from 'node:events'
import { test } from 'node:test'
import assert from 'node:assert'
import { SocketError, connect } from '../src'
import {
  getReaderWriterFromSocket,
  listenAndGetSocketAddress,
  writeAndReadSocket,
} from './utils'

test('Socket connected to tcp server with secureTransport: off', async () => {
  let connectCount = 0
  const message = 'abcde\r\n'

  const server = net.createServer()

  server.on('connection', (c) => {
    connectCount++
    c.setEncoding('utf-8')
    c.on('data', (data) => {
      assert.strictEqual(data, message)
    })
    c.on('end', () => {
      server.close()
    })
    c.pipe(c)
  })

  const address = await listenAndGetSocketAddress(server)
  const socket = connect(address)

  assert.strictEqual(
    await writeAndReadSocket(socket, message),
    message,
    'should pipe message'
  )

  assert.deepStrictEqual(await socket.opened, {
    localAddress: '::1',
    remoteAddress: '::1',
  })

  const close = socket.close()
  assert.strictEqual(
    socket.closed,
    close,
    '`.closed` and `.close()` should be the same object'
  )
  await assert.doesNotReject(close)

  await assert.rejects(
    writeAndReadSocket(socket, message),
    'should fail to pipe after close'
  )

  await once(server, 'close')

  assert.strictEqual(connectCount, 1, 'should connect one time')
})

test('connect method correctly parses address as string', async () => {
  let connectCount = 0
  const message = 'abcde\r\n'

  const server = net.createServer()

  server.on('connection', (c) => {
    connectCount++
    c.setEncoding('utf-8')
    c.on('data', (data) => {
      assert.strictEqual(data, message)
    })
    c.on('end', () => {
      server.close()
    })
  })

  const address = await listenAndGetSocketAddress(server)

  const socket = connect(`localhost:${address.port}`)

  const writer = socket.writable.getWriter()
  await assert.doesNotReject(writer.write(message))
  await assert.doesNotReject(socket.close())
  await once(server, 'close')
  assert.strictEqual(connectCount, 1, 'should connect one time')
})

test('connect on port 443 works', async () => {
  const socket = connect('github.com:443')
  await assert.doesNotReject(socket.close())
})

for (const data of [
  new Uint8Array([0, 1, 2]),
  new Uint16Array([0, 1, 2]),
  new Uint32Array([0, 1, 2]),
  new BigUint64Array([0n, 1n, 2n]),
]) {
  test(`Read & write ${data.constructor.name} from the server`, async () => {
    const message =
      data.constructor.name === 'Uint8Array'
        ? (data as Uint8Array)
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength)

    const server = net.createServer()
    server.on('connection', (c) => {
      c.setEncoding('binary')
      c.on('data', (data) => {
        assert.strictEqual(data, Buffer.from(message.buffer).toString())
        c.write(message)
      })
      c.on('end', () => {
        server.close()
      })
    })

    const address = await listenAndGetSocketAddress(server)

    const socket = connect(`localhost:${address.port}`)
    const { reader, writer } = getReaderWriterFromSocket(socket)

    await assert.doesNotReject(writer.write(message))

    assert.deepStrictEqual(await reader.read(), {
      value: message,
      done: false,
    })

    await assert.doesNotReject(socket.close())

    await once(server, 'close')
  })
}

test('SocketError is thrown on connect failure', async () => {
  const expectedError = new SocketError('connect ECONNREFUSED 127.0.0.1:1234')
  try {
    const socket = connect('127.0.0.1:1234')
    socket.opened.catch((err) => assert.deepStrictEqual(err, expectedError))
    await socket.closed
  } catch (err) {
    assert.deepStrictEqual(err, expectedError)
  }
})
