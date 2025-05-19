# AniMessnager 

A modern web application built with Nuxt 3, featuring a complete authentication system, user management, and SurrealDB integration.

## Technologies

- **Frontend**: Nuxt 3, Vue 3, TailwindCSS
- **Backend**: Nuxt API routes, SurrealDB
- **Authentication**: Custom token-based auth with secure HTTP-only cookies
- **State Management**: Pinia with persistence

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [pnpm](https://pnpm.io/) package manager
- [SurrealDB](https://surrealdb.com/) (for database)

## Getting Started

This project requires two terminal windows to run:

### First Terminal - Database Server

Start the SurrealDB database:

```bash
surreal start --user admin --pass admin --bind 0.0.0.0:8000 rocksdb://server/db/data/
```

### Second Terminal - Nuxt Development Server

Start the Nuxt development server:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
