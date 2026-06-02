# Implementation Plan: Nuxt 3 Todo Monorepo

## Overview

Scaffold a **new GitHub repository** with a **pnpm monorepo**: `@symb-abm/shared` (types + pure logic) and `apps/web` (Nuxt 3 + TypeScript + Bootstrap CSS/JS + Pinia + `localStorage`). Deliver v1 features vertically—basic todos first, then due dates, tags, edit modal, and drag-and-drop—then Playwright E2E, GitHub Actions CI, and Vercel deployment docs.

**Source of truth:** [SPEC.md](../SPEC.md) (approved 2026-06-02).

**Target:** New repo (e.g. `nuxt-todo-monorepo` under your GitHub org)—not `agent-skills`.

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **pnpm workspaces, no Turborepo** | Spec requirement; sufficient for two packages |
| **`@symb-abm/shared` first** | App imports types/utils; enables TDD on pure logic before UI |
| **Pinia + versioned `localStorage` key (`symb-todos-v1`)** | Single persistence boundary; migration path later |
| **Bootstrap JS via client-only Nuxt plugin** | Modals/dropdowns for edit; avoid SSR hydration issues |
| **`vue-draggable-plus` for reorder** | Spec-listed; Vue 3–friendly list DnD |
| **Playwright after core UI exists** | E2E needs stable selectors and flows |
| **Vertical slices over layers** | Each feature slice is shippable and testable before the next |

---

## Dependency Graph

```
[GitHub repo + monorepo root]
         │
         ├──► [@symb-abm/shared: types, utils, unit tests]
         │              │
         │              ▼
         ├──► [apps/web: Nuxt scaffold + Bootstrap + Pinia]
         │              │
         │              ├──► Slice A: CRUD + persist + list UI
         │              ├──► Slice B: Filters + clear completed
         │              ├──► Slice C: Due dates
         │              ├──► Slice D: Tags + tag filter
         │              ├──► Slice E: Edit modal (Bootstrap JS)
         │              └──► Slice F: Drag-and-drop reorder
         │                        │
         │                        ▼
         ├──► [Playwright e2e] ◄──┘
         │
         ├──► [ESLint / Prettier / Husky] (early, Task 2)
         └──► [GitHub Actions CI] → [Vercel + README]
```

**Order rule:** Shared package → Nuxt shell → persistence/store → UI slices (A→F) → E2E → CI → deploy docs.

---

## Task List

### Phase 0: Repository bootstrap

#### Task 1: Initialize monorepo and GitHub repository

**Description:** Create the new GitHub repo, root workspace config, copy `SPEC.md`, and baseline README with setup commands.

**Acceptance criteria:**
- [ ] Empty-ish repo exists on GitHub with `main` branch
- [ ] Root `package.json` with `private: true`, workspace scripts stubs, `packageManager` (pnpm 9+), `engines.node >= 20`
- [ ] `pnpm-workspace.yaml` includes `apps/*` and `packages/*`
- [ ] `.nvmrc` set to `20`
- [ ] `.gitignore` covers `node_modules`, `.nuxt`, `dist`, Playwright report artifacts
- [ ] `SPEC.md` at repo root (copy from planning artifact)

**Verification:**
- [ ] `pnpm install` succeeds (may be minimal until Task 3–4)
- [ ] `git clone` + `pnpm install` documented in README

**Dependencies:** None

**Files likely touched:**
- `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `.gitignore`, `README.md`, `SPEC.md`

**Estimated scope:** S (4–6 config files)

---

### Phase 1: Foundation

#### Task 2: Shared package `@symb-abm/shared`

**Description:** Implement `Todo` model, validation/normalize helpers (title, tags), filter/sort/overdue/reorder utilities with Vitest coverage.

**Acceptance criteria:**
- [ ] `packages/shared/package.json` name `@symb-abm/shared`, exports types and utils
- [ ] `Todo`, `TodoFilter`, `TodoId` types match SPEC
- [ ] Helpers: `normalizeTag`, `normalizeTags`, `filterTodos`, `sortByOrder`, `isOverdue`, `reindexOrders`
- [ ] Vitest tests; ≥ 90% coverage on pure functions
- [ ] Root script `pnpm --filter @symb-abm/shared test` works

**Verification:**
- [ ] `pnpm --filter @symb-abm/shared test` passes
- [ ] `pnpm typecheck` (or package `tsc --noEmit`) passes for shared

**Dependencies:** Task 1

**Files likely touched:**
- `packages/shared/src/types/todo.ts`
- `packages/shared/src/todo-utils.ts`
- `packages/shared/src/index.ts`
- `packages/shared/**/*.test.ts`
- `packages/shared/package.json`, `tsconfig.json`

**Estimated scope:** M (5–8 files)

---

#### Task 3: Nuxt 3 app shell in `apps/web`

**Description:** Scaffold Nuxt 3 + TypeScript app, wire workspace dependency on `@symb-abm/shared`, Pinia module, minimal `pages/index.vue`.

**Acceptance criteria:**
- [ ] `apps/web` runs via `pnpm dev` from root
- [ ] `nuxt.config.ts` transpiles/links `@symb-abm/shared`
- [ ] Pinia installed and registered
- [ ] Placeholder home page renders

**Verification:**
- [ ] `pnpm dev` — app loads at localhost without console errors
- [ ] `pnpm --filter web build` succeeds

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `apps/web/package.json`, `nuxt.config.ts`, `app.vue`, `pages/index.vue`

**Estimated scope:** M (4–6 files)

---

#### Task 4: ESLint, Prettier, Husky, lint-staged

**Description:** Root flat ESLint config (Vue + TS), Prettier integration, Husky pre-commit running lint-staged on staged files.

**Acceptance criteria:**
- [ ] `pnpm lint`, `pnpm lint:fix`, `pnpm format`, `pnpm format:check` work from root
- [ ] `pnpm prepare` installs Husky; pre-commit runs ESLint + Prettier on staged files
- [ ] `@nuxt/eslint` or equivalent covers `apps/web`

**Verification:**
- [ ] Introduce intentional lint issue on staged file → commit blocked
- [ ] `pnpm lint` clean on scaffold

**Dependencies:** Task 3

**Files likely touched:**
- `eslint.config.mjs`, `.prettierrc`, `lint-staged.config.mjs`, `.husky/pre-commit`, root `package.json` scripts

**Estimated scope:** M (5 files)

---

### Checkpoint: Foundation (after Tasks 1–4)

- [ ] Monorepo installs and `pnpm dev` runs
- [ ] Shared package tests pass
- [ ] Lint/format/husky operational
- [ ] **Human review** before feature slices

---

### Phase 2: Core todo vertical slices

#### Task 5: Pinia store + `localStorage` persistence

**Description:** `stores/todos.ts` with hydrate/debounce-save to `symb-todos-v1`; actions for add, toggle, remove; initial `order` assignment.

**Acceptance criteria:**
- [ ] Store loads from `localStorage` on client mount
- [ ] Mutations persist after debounced write
- [ ] Invalid/corrupt storage falls back to empty list (no crash)
- [ ] Vitest tests for store actions and serialization

**Verification:**
- [ ] `pnpm test` — store tests pass
- [ ] Manual: add todo in devtools store → refresh → data remains (once UI wired in Task 6)

**Dependencies:** Task 2, Task 3

**Files likely touched:**
- `apps/web/stores/todos.ts`
- `apps/web/composables/useLocalStorageSync.ts` (if extracted)
- `apps/web/stores/todos.test.ts`

**Estimated scope:** M (3–4 files)

---

#### Task 6: Bootstrap CSS + JS plugin and base layout

**Description:** Import Bootstrap SCSS/CSS; client plugin for Bootstrap JS; accessible page chrome on `index.vue`.

**Acceptance criteria:**
- [ ] `plugins/bootstrap.client.ts` loads Bootstrap JS once (client-only)
- [ ] Bootstrap styles applied globally
- [ ] No SSR hydration warnings from Bootstrap JS

**Verification:**
- [ ] `pnpm dev` — page styled with Bootstrap
- [ ] Manual: open/close a test modal or dropdown on index (smoke test)

**Dependencies:** Task 3

**Files likely touched:**
- `apps/web/plugins/bootstrap.client.ts`
- `apps/web/assets/scss/main.scss`
- `apps/web/nuxt.config.ts`

**Estimated scope:** S–M (3–4 files)

---

#### Task 7: Slice A — CRUD list UI (add, list, toggle, delete)

**Description:** `TodoForm`, `TodoList`, `TodoItem`; wire to Pinia; empty state; item counts in header.

**Acceptance criteria:**
- [ ] Add todo: title 1–200 chars, Enter + button
- [ ] List shows todos sorted by `order`
- [ ] Toggle complete updates UI + storage
- [ ] Delete removes item
- [ ] Empty state when no todos

**Verification:**
- [ ] Manual full CRUD flow in browser
- [ ] Component tests for `TodoForm` / `TodoItem` emit behavior

**Dependencies:** Task 5, Task 6

**Files likely touched:**
- `apps/web/components/TodoForm.vue`, `TodoList.vue`, `TodoItem.vue`
- `apps/web/pages/index.vue`
- `apps/web/tests/components/*.test.ts`

**Estimated scope:** M (5 files)

---

#### Task 8: Slice B — Filters and clear completed

**Description:** `TodoFilters` component; store getters for filtered lists and counts; clear completed action.

**Acceptance criteria:**
- [ ] Filters: All / Active / Completed with correct counts
- [ ] Clear completed removes only completed todos
- [ ] Filter state does not break persistence

**Verification:**
- [ ] Manual: complete items → Active filter → clear completed
- [ ] Store/getter unit tests for filter counts

**Dependencies:** Task 7

**Files likely touched:**
- `apps/web/components/TodoFilters.vue`
- `apps/web/stores/todos.ts` (getters/actions)
- `apps/web/stores/todos.test.ts`

**Estimated scope:** S–M (3–4 files)

---

### Checkpoint: Core flow (after Tasks 5–8)

- [ ] User can add, complete, delete, filter, and clear completed todos
- [ ] Data survives browser refresh
- [ ] `pnpm test` passes
- [ ] **Human review** before enhanced features

---

### Phase 3: Enhanced features (vertical slices)

#### Task 9: Slice C — Due dates

**Description:** Optional due date on add/edit; overdue styling via `@symb-abm/shared` `isOverdue`; sort display by due within list (optional sort in getter).

**Acceptance criteria:**
- [ ] Date input on `TodoForm` (optional)
- [ ] `TodoItem` shows due date; overdue incomplete todos use danger styling
- [ ] Due dates persist in `localStorage`
- [ ] Shared + store tests updated

**Verification:**
- [ ] Manual: set past due date → red styling; complete → styling clears
- [ ] `pnpm test` passes

**Dependencies:** Task 7, Task 2

**Files likely touched:**
- `apps/web/components/TodoForm.vue`, `TodoItem.vue`
- `apps/web/stores/todos.ts`

**Estimated scope:** M (3–5 files)

---

#### Task 10: Slice D — Tags and tag filter

**Description:** `TodoTagInput`; normalize tags on save; badges on items; filter UI by one or more tags.

**Acceptance criteria:**
- [ ] Tags: trim, lowercase, max 30 chars, max 10 per todo
- [ ] Badges render on `TodoItem`
- [ ] Tag filter narrows list; combinable with status filter
- [ ] Tests for normalize + filter-by-tag

**Verification:**
- [ ] Manual: add tags, filter by tag, reload persists tags
- [ ] `pnpm test` passes

**Dependencies:** Task 8, Task 2

**Files likely touched:**
- `apps/web/components/TodoTagInput.vue`, `TodoFilters.vue`, `TodoItem.vue`
- `apps/web/stores/todos.ts`

**Estimated scope:** M (4–5 files)

---

#### Task 11: Slice E — Edit modal (Bootstrap JS)

**Description:** `TodoEditModal` using Bootstrap Modal API; edit title, due date, tags; validation on save.

**Acceptance criteria:**
- [ ] Edit opens modal with current values
- [ ] Save updates store; cancel discards
- [ ] Empty title rejected
- [ ] Modal accessible (focus trap per Bootstrap)
- [ ] Modal disposed cleanly on unmount

**Verification:**
- [ ] Manual edit flow from list
- [ ] Component test: emit save with payload

**Dependencies:** Task 9, Task 10, Task 6

**Files likely touched:**
- `apps/web/components/TodoEditModal.vue`
- `apps/web/pages/index.vue`

**Estimated scope:** M (3–4 files)

---

#### Task 12: Slice F — Drag-and-drop reorder

**Description:** Integrate `vue-draggable-plus` in `TodoList`; `reorder` store action; persist `order`; drag handle on `TodoItem`.

**Acceptance criteria:**
- [ ] Drag handle reorders list visually
- [ ] `order` fields updated and persisted
- [ ] Reload preserves order
- [ ] Store test for reorder

**Verification:**
- [ ] Manual reorder + refresh
- [ ] `pnpm test` passes

**Dependencies:** Task 7, Task 5

**Files likely touched:**
- `apps/web/components/TodoList.vue`, `TodoItem.vue`
- `apps/web/stores/todos.ts`
- `apps/web/package.json` (dependency)

**Estimated scope:** M (4 files)

---

### Checkpoint: Feature complete (after Tasks 9–12)

- [ ] All SPEC v1 features work in browser
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` pass
- [ ] **Human review** before E2E/CI

---

### Phase 4: E2E and CI

#### Task 13: Playwright E2E suite

**Description:** Configure Playwright for `apps/web`; implement four SPEC scenarios; root `pnpm test:e2e`.

**Acceptance criteria:**
- [ ] `playwright.config.ts` targets Nuxt dev server or `nuxt preview`
- [ ] Specs: `todo-crud.spec.ts`, `todo-tags.spec.ts`, `todo-reorder.spec.ts` (CRUD spec covers create+reload+filter+modal)
- [ ] Stable `data-testid` attributes on key controls
- [ ] `pnpm test:e2e` passes locally (chromium)

**Verification:**
- [ ] `pnpm exec playwright install chromium` then `pnpm test:e2e` green
- [ ] Scenarios match SPEC minimum E2E list

**Dependencies:** Tasks 7–12

**Files likely touched:**
- `apps/web/playwright.config.ts`
- `apps/web/e2e/*.spec.ts`
- Root `package.json` scripts

**Estimated scope:** M (4–5 files)

---

#### Task 14: GitHub Actions CI

**Description:** `.github/workflows/ci.yml` running lint, format check, typecheck, vitest, playwright, build on PR and `main`.

**Acceptance criteria:**
- [ ] Workflow matches SPEC command sequence
- [ ] Playwright browsers installed in CI (`--with-deps chromium`)
- [ ] pnpm cache configured
- [ ] Failing step blocks merge

**Verification:**
- [ ] Push branch → Actions green
- [ ] Intentionally break test → Actions red

**Dependencies:** Tasks 4, 13

**Files likely touched:**
- `.github/workflows/ci.yml`

**Estimated scope:** S (1 file)

---

### Checkpoint: CI green (after Tasks 13–14)

- [ ] Full CI pipeline passes on `main`
- [ ] **Human review** before deploy docs

---

### Phase 5: Ship

#### Task 15: Vercel deployment and README

**Description:** Document monorepo install/build for Vercel; optional `vercel.json`; README with clone, dev, test, deploy steps.

**Acceptance criteria:**
- [ ] README: prerequisites, scripts table, project structure
- [ ] Vercel: root directory `apps/web`, install from monorepo root documented
- [ ] Preview deploy instructions
- [ ] No secrets in repo

**Verification:**
- [ ] Vercel project connected → preview URL loads app
- [ ] Production deploy on `main` succeeds

**Dependencies:** Task 14

**Files likely touched:**
- `README.md`, `apps/web/vercel.json` (optional)

**Estimated scope:** S (1–2 files)

---

#### Task 16: Accessibility and polish pass

**Description:** Audit aria labels, keyboard modal, focus order; empty/error states; align with SPEC success criteria checklist.

**Acceptance criteria:**
- [ ] All interactive controls labeled
- [ ] Filter buttons and tag chips keyboard-usable
- [ ] SPEC success criteria checklist complete in README or PR

**Verification:**
- [ ] Manual keyboard-only smoke test
- [ ] Optional: axe in Playwright or lint plugin (if low cost)

**Dependencies:** Tasks 7–12

**Files likely touched:**
- Various `components/*.vue`

**Estimated scope:** S–M (touch many, small edits)

---

### Checkpoint: Complete (after Task 16)

- [ ] All SPEC success criteria met
- [ ] CI green; Vercel deployed
- [ ] Ready for `/build` or implementation PR review

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Monorepo + Vercel install path wrong | High | Document root install in README early; test preview in Task 15 |
| Bootstrap JS SSR/hydration errors | Medium | Client-only plugin; no modal markup in SSR-critical path |
| Playwright flaky DnD tests | Medium | Use `data-testid` + `dragTo` with retries; run against `preview` build |
| `localStorage` schema drift | Medium | Version key `symb-todos-v1`; migration helper stub in store |
| Shared package not resolved in Nuxt build | Medium | Verify `nuxt.config` `transpile` + workspace protocol in Task 3 |
| Scope creep (auth, API) | Low | Boundaries in SPEC; defer to v2 |

---

## Parallelization Opportunities

| Can run in parallel (after deps) | Must stay sequential |
|----------------------------------|----------------------|
| Task 4 (tooling) overlapping late Task 3 | Task 1 → 2 → 3 |
| Task 9 (due dates) vs Task 10 (tags) after Task 8 | Store (5) before UI (7) |
| Component tests written alongside each slice | Playwright (13) after UI |
| README drafts during CI work | CI (14) after e2e exists |

---

## Open Questions

1. **Exact GitHub repo name** — e.g. `SYMB-ABM/nuxt-todo-monorepo`? (Task 1)
2. **Default branch** — `main` assumed
3. **DnD library** — Confirm `vue-draggable-plus` at implementation time (SPEC allows alternative)

---

## Human Review

**Status:** Draft plan — awaiting approval before `/build` or implementation.

Approve this plan to start Task 1 in the **new GitHub repository** (copy `tasks/plan.md`, `tasks/todo.md`, and `SPEC.md` into that repo, or implement directly there).
