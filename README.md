## Goal

The goal of this project is to gain experience working with websockets (socket.io), React components, and Turborepo in a single project.

To do this I merged concepts/logic from two previous projects:

- NestJS based basic chat app (websockets)
- NextJS based single player tic-tac-toe (React)

into a multiplayer tic-tac-toe game (Turborepo)

## Preview

https://github.com/user-attachments/assets/a0fd5b21-53e5-48a5-9d9e-dad2fa269006

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `api`: a NestJS app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by `web` application
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Build

To build all apps and packages, run the following command:

```
cd local-multiplayer-tic-tac-toe

# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

### Develop

To develop all apps and packages, run the following command:

```
cd local-multiplayer-tic-tac-toe
# With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```
