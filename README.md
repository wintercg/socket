# @arrowood.dev/socket

A Node.js Implementation of `connect()`, the [TCP Socket API](https://github.com/wintercg/proposal-sockets-api) proposed within WinterCG, and implemented in [Cloudflare Workers](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/).

You can use this to provide the `connect()` API in a Node.js environment.

If you need to provide an interface similar to `net.connect()` or `tls.connect()` from Node.js, from an environment, where only the proposed Socket API is available, [`pg-cloudflare`](https://github.com/brianc/node-postgres/blob/master/packages/pg-cloudflare/README.md) provides such an interface.

## Installation

```
npm i @arrowood.dev/socket
```

## Contributing

Requirements:

- Node.js v20.x

### Building

This project uses [TypeScript](https://www.typescriptlang.org/) for building. This must be manually executed using:

```sh
npm run build
```

Output will be in the `dist` folder.

### Linting

This project uses [eslint](https://eslint.org/) for linting. Code is linted automatically when you commit, and you can run the linter manually using:

```sh
npm run lint
```

ESLint is configured by [eslint.config.mjs](./eslint.config.mjs).

### Testing

This project uses the Node.js [Test Runner](https://nodejs.org/docs/latest-v20.x/api/test.html) for testing. Run tests using:

```sh
npm run test
```

Only test files matching the pattern `test/*.test.ts` will be executed.

Testing utility functions should be stored in `test/utils.ts` and be well documented.

### Type Checking

To manually type-check the repo without producing a build, use:

```sh
npm run type-check
```

This project uses [TypeScript](https://www.typescriptlang.org/). There exists multiple TypeScript config files; each serves a different purpose.

- [tsconfig.base.json](./tsconfig.base.json)
  - The base configuration, itself based on [@tsconfig/node20](https://github.com/tsconfig/bases/blob/main/bases/node20.json).
  - It does **not** _include_ any files as it is meant to be extended from.
- [tsconfig.json](./tsconfig.json)
  - The default configuration.
  - Used by various tools such as [eslint](#linting), the [`test` command](#testing), and the `type-check`` command.
  - Includes all TypeScript files in the repo.
  - Does **not** output anything.
- [tsconfig.build.json](./tsconfig.build.json)
  - The build configuration.
  - Only includes the `src` directory
  - Used by the [`build` command](#building) to output JavaScript
