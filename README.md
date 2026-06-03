# Nuxt Todo Monorepo

Nuxt 3 + TypeScript todo app with `@symb-abm/shared`, Bootstrap, Pinia, `localStorage`, Playwright E2E, and Vercel deployment.

**Specification:** [SPEC.md](./SPEC.md)  
**Implementation plan:** [tasks/plan.md](./tasks/plan.md)

## Prerequisites

- Node.js **20** (see `.nvmrc`)
- [pnpm](https://pnpm.io/) **9+** (Corepack: `corepack enable`)

## Setup

```bash
git clone https://github.com/grajput08/nuxt-todo-monorepo.git
cd nuxt-todo-monorepo
corepack enable
pnpm install
```

## Scripts

| Command          | Description                                    |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Start Nuxt dev server (`apps/web`, Task 3+)    |
| `pnpm build`     | Build all workspaces                           |
| `pnpm test`      | Workspace verification + unit tests (as added) |
| `pnpm lint`      | ESLint (Task 4+)                               |
| `pnpm typecheck` | TypeScript check (Task 3+)                     |

## Repository layout

```
apps/web/           # Nuxt 3 application (Vercel root)
packages/shared/    # @symb-abm/shared types and utilities
```

## GitHub

Create the remote repository (if not already created), then:

```bash
Remote: `https://github.com/grajput08/nuxt-todo-monorepo`
```

## Status

- [x] Task 1: Monorepo bootstrap
- [x] Task 2: `@symb-abm/shared` package
- [x] Task 3: Nuxt 3 app shell (`apps/web`)
- [x] Task 4: ESLint, Prettier, Husky, lint-staged
- [x] Task 5: Pinia store + localStorage persistence
- [x] Task 6: Bootstrap CSS + JS
- [x] Task 7: Todo CRUD UI
- [x] Task 8: Filters + clear completed
- [x] Task 9: Due dates + overdue styling
- [x] Task 10: Tags + tag filter
- [x] Task 11: Edit modal (Bootstrap JS)
- [ ] Task 12+: See [tasks/todo.md](./tasks/todo.md)
