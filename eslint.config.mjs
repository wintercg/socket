import neostandard, { plugins } from 'neostandard'

export default [
  { ignores: ['dist/*', 'node_modules/*', 'package-lock.json'] },
  ...neostandard(),
  ...plugins['typescript-eslint'].configs.recommended,
]
