# Spec: Nuxt 3 Todo Monorepo

## Confirmed decisions

| Topic | Decision |
|-------|----------|
| **Repository** | New GitHub repository (greenfield; not inside `agent-skills`) |
| **Persistence** | `localStorage` only — no server DB or sync |
| **Authentication** | Out of scope for v1 |
| **Monorepo** | Plain **pnpm workspaces** (no Turborepo) |
| **Bootstrap** | Bootstrap 5 **CSS + JS** (modals, dropdowns, etc.) |
| **E2E** | **Playwright** in MVP CI |
| **Todo extras** | **Due dates**, **tags**, **drag-and-drop reorder** in v1 |
| **Package scope** | **`@symb-abm/*`** (e.g. `@symb-abm/shared`) |

Copy this file into the new repo root when scaffolding.

---

## Objective

Build a **Todo application** as a **Nuxt 3 monorepo** in a **new GitHub repository** that demonstrates production-ready frontend engineering: TypeScript, Bootstrap (CSS + JS), consistent formatting/linting, git hooks, CI (unit + E2E), and Vercel deployment.

### Target users

- Developers evaluating the stack (reference implementation), and
- End users managing a personal task list in the browser (data stays on device).

### Core features (v1)

| Feature | Acceptance criteria |
|--------|---------------------|
| List todos | Empty state and populated list; total / active / completed counts visible |
| Add todo | Title required (trimmed, 1–200 chars); Enter and button submit |
| Toggle complete | Checkbox updates visual state and `localStorage` |
| Edit todo | Bootstrap modal or inline edit; save/cancel; empty title rejected |
| Delete todo | Remove single todo (no confirmation dialog by default) |
| Filter | All / Active / Completed with correct counts |
| Clear completed | Removes all completed items in one action |
| **Due date** | Optional date per todo; date picker in add/edit UI; overdue items visually distinct (e.g. `text-danger`); sort/filter by due optional (sort by due within list is enough for v1) |
| **Tags** | Add/remove string tags per todo (normalized: trim, lowercase, max 30 chars, max 10 tags per todo); display as Bootstrap badges; filter list by selected tag(s) |
| **Reorder** | Drag-and-drop reorder within the list; `order` field persisted; order stable after refresh |
| Persist | Refresh restores todos, tags, due dates, and order from `localStorage` |

### Out of scope (v1)

- Authentication, multi-user accounts, or cloud sync
- Server-side database or Nuxt API persistence
- Native mobile apps
- Attachments, comments, subtasks, priorities (beyond due date)

### Success criteria

- [ ] New GitHub repo created; `SPEC.md` committed at root
- [ ] `pnpm install` at repo root installs all workspaces
- [ ] `pnpm dev` runs Nuxt 3 app with hot reload
- [ ] `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build` pass locally and in CI
- [ ] Husky blocks commits that fail lint-staged checks
- [ ] GitHub Actions passes on PR and `main` (including Playwright)
- [ ] Vercel preview/production deploy succeeds from `apps/web`
- [ ] All v1 feature acceptance criteria met in the browser
- [ ] No secrets committed

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | Nuxt 3 (latest stable) | `apps/web` |
| Language | TypeScript (strict) | `vue-tsc` / Nuxt typecheck |
| UI | Bootstrap 5.3 CSS + JS | Client plugin; modals for edit, dropdowns where needed |
| Drag-and-drop | `vue-draggable-plus` (or `@vueuse/integrations` + Sortable) | List reorder only |
| State | Pinia | Todo store + `localStorage` hydration/sync |
| Monorepo | pnpm workspaces | No Turborepo |
| Shared package | `@symb-abm/shared` | Types, pure utils, validation helpers |
| Lint | ESLint 9 flat config | `@nuxt/eslint` or Nuxt-aligned setup |
| Format | Prettier | `eslint-config-prettier` |
| Git hooks | Husky + lint-staged | Pre-commit on staged files |
| CI | GitHub Actions | Lint, format, typecheck, Vitest, Playwright, build |
| Deploy | Vercel | Root directory `apps/web` |
| Unit/component | Vitest + `@vue/test-utils` | Shared + web app |
| E2E | Playwright (`@nuxt/test-utils` e2e or standalone) | MVP required in CI |

### Version constraints

- Node.js **20 LTS** (`.nvmrc` + `engines` in root `package.json`)
- **pnpm 9+** (`packageManager` in root `package.json`)

---

## Commands

All commands run from **repository root** unless noted.

```bash
# Install
pnpm install

# Development
pnpm dev                              # Nuxt app (apps/web)

# Build & preview
pnpm build
pnpm --filter web build
pnpm --filter web preview

# Quality
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test                             # vitest (unit + component)
pnpm test:watch
pnpm test:e2e                         # playwright
pnpm test:e2e:ui                      # playwright UI (local only)

# Husky (after clone)
pnpm prepare

# Workspace filters
pnpm --filter web dev
pnpm --filter @symb-abm/shared test
```

**CI (GitHub Actions)**

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

**Vercel**

- Framework preset: Nuxt.js
- Root directory: `apps/web`
- Install from monorepo root when required (document exact commands in README)

---

## Project Structure

```
<github-repo>/                   # New GitHub repo (e.g. nuxt-todo-monorepo)
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── apps/web/
│   ├── nuxt.config.ts
│   ├── package.json             # depends on @symb-abm/shared
│   ├── assets/scss/             # Bootstrap variables/overrides
│   ├── components/
│   │   ├── TodoForm.vue
│   │   ├── TodoList.vue         # wraps draggable list
│   │   ├── TodoItem.vue
│   │   ├── TodoFilters.vue
│   │   ├── TodoTagInput.vue
│   │   └── TodoEditModal.vue    # Bootstrap modal + JS
│   ├── composables/
│   │   └── useLocalStorageSync.ts
│   ├── plugins/bootstrap.client.ts
│   ├── stores/todos.ts
│   ├── pages/index.vue
│   ├── tests/
│   │   ├── unit/
│   │   └── components/
│   └── e2e/
│       ├── todo-crud.spec.ts
│       ├── todo-tags.spec.ts
│       └── todo-reorder.spec.ts
├── packages/shared/
│   ├── package.json             # name: @symb-abm/shared
│   └── src/
│       ├── types/todo.ts
│       ├── todo-utils.ts        # filter, sort, tag normalize
│       └── index.ts
├── eslint.config.mjs
├── lint-staged.config.mjs
├── package.json
├── pnpm-workspace.yaml
├── SPEC.md
└── README.md
```

**Responsibilities**

- `apps/web` — UI, Pinia, Bootstrap CSS/JS, DnD, `localStorage`, Vercel target, Playwright e2e
- `packages/shared` (`@symb-abm/shared`) — `Todo` type, tag/due-date validation, pure filter/sort helpers
- Root — Husky, shared ESLint/Prettier, CI, workspace scripts

---

## Code Style

### Conventions

- **Files:** Vue SFCs PascalCase; composables `useX.ts`; stores `todos.ts`
- **Components:** Multi-word names (`TodoList`, not `List`)
- **TypeScript:** Explicit return types on exported functions; no `any` without comment
- **Imports:** Nuxt auto-imports for Vue/Pinia; `@symb-abm/shared` for types and pure utils
- **CSS:** Bootstrap utilities first; scoped SCSS only when needed
- **Bootstrap JS:** Initialize in `plugins/bootstrap.client.ts`; dispose on unmount where applicable (modals/tooltips)

### Data model

```typescript
// packages/shared/src/types/todo.ts
export type TodoId = string;

export interface Todo {
  id: TodoId;
  title: string;
  completed: boolean;
  createdAt: string;       // ISO 8601
  dueDate: string | null;  // ISO date (YYYY-MM-DD) or null
  tags: string[];          // normalized lowercase strings
  order: number;           // integer, lower = higher in list
}

export type TodoFilter = 'all' | 'active' | 'completed';
```

### Example component

```vue
<!-- apps/web/components/TodoItem.vue -->
<script setup lang="ts">
import type { Todo } from '@symb-abm/shared';

defineProps<{ todo: Todo }>();

defineEmits<{
  toggle: [id: string];
  remove: [id: string];
  edit: [id: string];
}>();

function isOverdue(todo: Todo): boolean {
  if (!todo.dueDate || todo.completed) return false;
  return todo.dueDate < new Date().toISOString().slice(0, 10);
}
</script>

<template>
  <li class="list-group-item d-flex align-items-center gap-2">
    <span class="text-muted" aria-hidden="true">⠿</span>
    <input
      class="form-check-input"
      type="checkbox"
      :checked="todo.completed"
      :aria-label="`Mark ${todo.title} complete`"
      @change="$emit('toggle', todo.id)"
    />
    <div class="flex-grow-1">
      <span :class="{ 'text-decoration-line-through text-muted': todo.completed, 'text-danger': isOverdue(todo) }">
        {{ todo.title }}
      </span>
      <small v-if="todo.dueDate" class="d-block text-muted">{{ todo.dueDate }}</small>
      <span v-for="tag in todo.tags" :key="tag" class="badge bg-secondary me-1">{{ tag }}</span>
    </div>
    <button type="button" class="btn btn-sm btn-outline-primary" @click="$emit('edit', todo.id)">
      Edit
    </button>
    <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('remove', todo.id)">
      Delete
    </button>
  </li>
</template>
```

### Formatting

- Prettier: `singleQuote: true`, `semi: true`
- ESLint: Vue 3 + TypeScript recommended; unused vars error

---

## Testing Strategy

| Level | Tool | Location | What to cover |
|-------|------|----------|----------------|
| Unit | Vitest | `packages/shared/**/*.test.ts` | Tag normalize, filter/sort, overdue helper, reorder merge |
| Component | Vitest + `@vue/test-utils` | `apps/web/tests/components/` | Tags, due date display, filter bar |
| Store | Vitest | `apps/web/stores/*.test.ts` | CRUD, reorder, tag add/remove, persistence serialization |
| E2E | Playwright | `apps/web/e2e/` | Add/edit/complete/delete; tag filter; drag reorder persists after reload |

**Coverage expectations**

- `@symb-abm/shared`: **≥ 90%** on pure functions
- `apps/web`: store + critical components covered
- **CI must run** `pnpm test` and `pnpm test:e2e`; both block merge

**E2E scenarios (minimum)**

1. Create todo with title, due date, and tag → visible in list → survives reload
2. Toggle complete → filter “Active” hides it
3. Drag item to new position → reload → order unchanged
4. Edit via modal → title/tags/due date updated

---

## Boundaries

### Always

- Run `pnpm lint`, `pnpm test`, and `pnpm test:e2e` before pushing; Husky on staged files
- TypeScript strict; no silent `any`
- Import types/utils from `@symb-abm/shared` only — no duplicated `Todo` in `apps/web`
- Accessible controls (`aria-*`, labels, keyboard-usable modals per Bootstrap docs)
- Persist entire app state to `localStorage` with versioned schema key (e.g. `symb-todos-v1`) for future migrations
- Update `SPEC.md` when scope changes
- Conventional Commits

### Ask first

- Dependencies beyond: Bootstrap, Pinia, Vitest, Playwright, vue-draggable-plus (or chosen DnD lib), ESLint/Prettier toolchain
- Database, API routes with persistence, or authentication
- Turborepo or extra apps/packages
- Changing CI/Vercel configuration
- Weakening or skipping E2E in CI
- Storage other than `localStorage`

### Never

- Commit secrets (`.env`, tokens)
- Disable lint/test/hooks to pass CI
- Remove failing tests without approval
- Edit `node_modules`
- Deploy broken `main` without sign-off

---

## CI/CD & Deployment

### GitHub Actions (`ci.yml`)

**Triggers:** `push` and `pull_request` to `main`

**Job `quality`** (`ubuntu-latest`):

1. Checkout
2. Node 20 + pnpm (cached)
3. `pnpm install --frozen-lockfile`
4. `pnpm exec playwright install --with-deps chromium`
5. `pnpm lint` → `pnpm format:check` → `pnpm typecheck`
6. `pnpm test` → `pnpm test:e2e` → `pnpm build`

### Vercel

- GitHub integration on new repo
- Root directory: `apps/web`
- Preview on PRs; production on `main`
- No env vars required for v1

### Husky + lint-staged

```json
{
  "*.{js,ts,vue,mjs,cjs}": ["eslint --fix"],
  "*.{json,md,yml,yaml,css,scss}": ["prettier --write"]
}
```

---

## Approval

**Status:** Approved — decisions recorded above (2026-06-02).

**Next steps**

1. **`/plan`** — implementation order, risks, checkpoints
2. **Tasks** — scaffold repo, workspaces, features in dependency order
3. **Implement** — create GitHub repo and build per spec

Implementation should target the **new GitHub repository**, not `agent-skills`.
