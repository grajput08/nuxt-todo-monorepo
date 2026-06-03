import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ciPath = '.github/workflows/ci.yml';

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

test('GitHub Actions ci.yml exists', () => {
  assert.ok(existsSync(join(root, ciPath)), `missing ${ciPath}`);
});

test('ci.yml triggers on push and pull_request to main', () => {
  const workflow = read(ciPath);
  assert.match(workflow, /pull_request:\s*\n\s*branches:\s*\n\s*-\s*main/);
  assert.match(workflow, /push:\s*\n\s*branches:\s*\n\s*-\s*main/);
});

test('ci.yml defines a quality job on ubuntu-latest', () => {
  const workflow = read(ciPath);
  assert.match(workflow, /quality:/);
  assert.match(workflow, /runs-on:\s*ubuntu-latest/);
});

test('ci.yml configures pnpm with cache and frozen lockfile install', () => {
  const workflow = read(ciPath);
  assert.match(workflow, /pnpm\/action-setup/);
  assert.match(workflow, /cache:\s*pnpm/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
});

test('ci.yml installs Playwright chromium with system deps', () => {
  const workflow = read(ciPath);
  assert.match(workflow, /playwright install --with-deps chromium/);
});

test('ci.yml runs SPEC quality gates in order', () => {
  const workflow = read(ciPath);
  const lint = workflow.indexOf('pnpm lint');
  const format = workflow.indexOf('pnpm format:check');
  const typecheck = workflow.indexOf('pnpm typecheck');
  const unit = workflow.indexOf('pnpm test');
  const e2e = workflow.indexOf('pnpm test:e2e');
  const build = workflow.indexOf('pnpm build');

  for (const [name, index] of [
    ['lint', lint],
    ['format:check', format],
    ['typecheck', typecheck],
    ['test', unit],
    ['test:e2e', e2e],
    ['build', build],
  ]) {
    assert.ok(index >= 0, `missing pnpm ${name}`);
  }

  assert.ok(lint < format, 'lint before format:check');
  assert.ok(format < typecheck, 'format:check before typecheck');
  assert.ok(typecheck < unit, 'typecheck before test');
  assert.ok(unit < e2e, 'test before test:e2e');
  assert.ok(e2e < build, 'test:e2e before build');
});
