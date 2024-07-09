import test from 'node:test'
import assert from 'node:assert'
import { isSocketAddress } from '../src/is-socket-address'

test('isSocketAddress correctly validates Socket API socket address objects', () => {
  assert.strictEqual(isSocketAddress({ hostname: 'localhost', port: 0 }), true)
  assert.strictEqual(
    isSocketAddress({ hostname: 'localhost' }),
    false,
    'missing port'
  )
  assert.strictEqual(isSocketAddress({ port: 0 }), false, 'missing hostname')
  assert.strictEqual(isSocketAddress({}), false, 'empty object')
  assert.strictEqual(isSocketAddress(null), false, 'null')
})
