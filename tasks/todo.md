# Task List: Nuxt 3 Todo Monorepo

Track implementation in the **new GitHub repo**. Full detail: [plan.md](./plan.md).

**Spec:** [SPEC.md](../SPEC.md)

---

## Phase 0: Bootstrap

- [x] **Task 1:** Initialize monorepo + GitHub repository
  - **Accept:** `pnpm-workspace.yaml`, root `package.json`, `.nvmrc`, `SPEC.md`, README
  - **Verify:** `pnpm install` succeeds; https://github.com/grajput08/nuxt-todo-monorepo

---

## Phase 1: Foundation

- [x] **Task 2:** `@symb-abm/shared` — types, utils, Vitest (≥90% on pure fns)
  - **Verify:** `pnpm --filter @symb-abm/shared test`

- [ ] **Task 3:** Nuxt 3 app shell (`apps/web`) + Pinia + shared link
  - **Verify:** `pnpm dev`, `pnpm --filter web build`

- [ ] **Task 4:** ESLint, Prettier, Husky, lint-staged
  - **Verify:** `pnpm lint`; bad commit blocked

### Checkpoint: Foundation
- [ ] Dev server runs; shared tests pass; hooks work
- [ ] Human sign-off

---

## Phase 2: Core todos

- [ ] **Task 5:** Pinia store + `localStorage` (`symb-todos-v1`)
  - **Verify:** `pnpm test` (store tests)

- [ ] **Task 6:** Bootstrap CSS + JS client plugin
  - **Verify:** Styled page; modal/dropdown smoke test

- [ ] **Task 7:** Slice A — CRUD UI (form, list, item)
  - **Verify:** Manual add/toggle/delete; component tests

- [ ] **Task 8:** Slice B — Filters + clear completed
  - **Verify:** Manual filter flow; getter tests

### Checkpoint: Core flow
- [ ] CRUD + filter + persist after refresh
- [ ] Human sign-off

---

## Phase 3: Enhanced features

- [ ] **Task 9:** Slice C — Due dates + overdue styling
  - **Verify:** Manual overdue UI; tests pass

- [ ] **Task 10:** Slice D — Tags + tag filter
  - **Verify:** Tags persist; filter by tag works

- [ ] **Task 11:** Slice E — Edit modal (Bootstrap JS)
  - **Verify:** Edit title/due/tags via modal

- [ ] **Task 12:** Slice F — Drag-and-drop reorder
  - **Verify:** Reorder survives reload

### Checkpoint: Feature complete
- [ ] All SPEC v1 features in browser
- [ ] `pnpm lint` + `pnpm typecheck` + `pnpm test` green
- [ ] Human sign-off

---

## Phase 4: E2E & CI

- [ ] **Task 13:** Playwright — 4 E2E scenarios + `data-testid`s
  - **Verify:** `pnpm test:e2e`

- [ ] **Task 14:** GitHub Actions `ci.yml`
  - **Verify:** Actions green on push

### Checkpoint: CI
- [ ] Full pipeline green on `main`
- [ ] Human sign-off

---

## Phase 5: Ship

- [ ] **Task 15:** Vercel + README deploy docs
  - **Verify:** Preview/production URL loads

- [ ] **Task 16:** Accessibility + polish pass
  - **Verify:** Keyboard smoke test; SPEC checklist done

### Checkpoint: Complete
- [ ] All SPEC success criteria met
- [ ] Ready for production use / review

---

## Quick reference — verify all

```bash
pnpm install
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test && pnpm test:e2e && pnpm build
pnpm dev
```
