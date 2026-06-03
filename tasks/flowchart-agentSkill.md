# Task Process Flowcharts

Visual guide for executing work using agent-skills slash commands and skills.

**Related artifacts:**

- [SPEC.md](../SPEC.md) — requirements and acceptance criteria
- [plan.md](./plan.md) — detailed task breakdown
- [todo.md](./todo.md) — checklist to track progress

For mid-task skill selection (UI, API, debugging, etc.), see the skill-discovery tree in [using-agent-skills](../skills/using-agent-skills/SKILL.md).

---

## 1. End-to-end lifecycle

User-driven pipeline from idea to shipped code. Human approval gates after spec and plan prevent wrong-direction work early.

```mermaid
flowchart TD
    start([New work arrives]) --> underspecified{Requirements clear?}
    underspecified -->|No| interview["/spec or interview-me / idea-refine"]
    underspecified -->|Yes| spec["/spec — spec-driven-development"]
    interview --> spec

    spec --> specOut["Output: SPEC.md"]
    specOut --> humanSpec{Human approves spec?}
    humanSpec -->|No| spec
    humanSpec -->|Yes| plan["/plan — planning-and-task-breakdown"]
    plan --> planOut["Output: tasks/plan.md + tasks/todo.md"]
    planOut --> humanPlan{Human approves plan?}
    humanPlan -->|No| plan
    humanPlan -->|Yes| buildLoop["/build — incremental-implementation + TDD"]

    buildLoop --> moreTasks{More pending tasks?}
    moreTasks -->|Yes| buildLoop
    moreTasks -->|No| test["/test — test-driven-development"]
    test --> review["/review — code-review-and-quality"]
    review --> simplify{Needs simplification?}
    simplify -->|Yes| codeSimplify["/code-simplify — code-simplification"]
    codeSimplify --> review
    simplify -->|No| ship["/ship — shipping-and-launch"]
    ship --> fanOut["Parallel: code-reviewer + security-auditor + test-engineer"]
    fanOut --> decision{GO or NO-GO?}
    decision -->|NO-GO| buildLoop
    decision -->|GO| done([Shipped])
```

**Notes:**

- `/build` repeats until all tasks in [todo.md](./todo.md) are checked off.
- Domain skills auto-activate during build (e.g. `frontend-ui-engineering`, `api-and-interface-design`).
- `/ship` runs a parallel fan-out of three personas; skip only for trivial changes (≤2 files, <50 lines, no auth/payments/data/config).

---

## 2. Per-task build loop

Inner loop for each task from [todo.md](./todo.md). Follow Red-Green-Refactor, verify acceptance criteria, commit, then move on.

```mermaid
flowchart TD
    pick([Pick next pending task from tasks/todo.md]) --> readAC[Read acceptance criteria from tasks/plan.md]
    readAC --> context[Load context: existing code, patterns, types]
    context --> red["RED: Write failing test"]
    red --> green["GREEN: Minimum code to pass"]
    green --> suite[Run full test suite]
    suite --> suiteOk{All tests pass?}
    suiteOk -->|No| debug["debugging-and-error-recovery"]
    debug --> green
    suiteOk -->|Yes| build[Run build / typecheck]
    build --> buildOk{Build passes?}
    buildOk -->|No| debug
    buildOk -->|Yes| verify[Verify acceptance criteria]
    verify --> verifyOk{Criteria met?}
    verifyOk -->|No| green
    verifyOk -->|Yes| commit[Commit with descriptive message]
    commit --> mark[Mark task complete in tasks/todo.md]
    mark --> checkpoint{Phase checkpoint?}
    checkpoint -->|Yes| humanCP{Human sign-off?}
    humanCP -->|No| pick
    humanCP -->|Yes| pick
    checkpoint -->|No| moreTasks{More tasks in phase?}
    moreTasks -->|Yes| pick
    moreTasks -->|No| phaseDone([Phase complete — proceed to /test or next phase])
```

**Phase checkpoints** (from [todo.md](./todo.md)):

| Phase                 | Checkpoint                                     |
| --------------------- | ---------------------------------------------- |
| 1 — Foundation        | Dev server runs; shared tests pass; hooks work |
| 2 — Core todos        | CRUD + filter + persist after refresh          |
| 3 — Enhanced features | All SPEC v1 features in browser                |
| 4 — E2E and CI        | Full pipeline green on `main`                  |
| 5 — Ship              | All SPEC success criteria met                  |

---

## Quick reference

| Phase    | Command          | Primary skill(s)                                       | Artifact                         |
| -------- | ---------------- | ------------------------------------------------------ | -------------------------------- |
| Define   | `/spec`          | spec-driven-development                                | `SPEC.md`                        |
| Plan     | `/plan`          | planning-and-task-breakdown                            | `tasks/plan.md`, `tasks/todo.md` |
| Build    | `/build`         | incremental-implementation, test-driven-development    | commits per task                 |
| Verify   | `/test`          | test-driven-development, browser-testing-with-devtools | passing tests                    |
| Review   | `/review`        | code-review-and-quality                                | review report                    |
| Simplify | `/code-simplify` | code-simplification                                    | cleaner diff                     |
| Ship     | `/ship`          | shipping-and-launch + 3 personas                       | GO/NO-GO + rollback plan         |
