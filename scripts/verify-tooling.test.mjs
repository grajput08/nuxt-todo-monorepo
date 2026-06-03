import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

test('root package scripts wire lint, format, and husky prepare', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.doesNotMatch(pkg.scripts.lint, /configured in Task 4/);
  assert.doesNotMatch(pkg.scripts.format, /configured in Task 4/);
  assert.doesNotMatch(pkg.scripts.prepare, /configured in Task 4/);
  assert.equal(pkg.scripts['format:check'], 'prettier --check .');
  assert.match(pkg.scripts['lint:fix'], /eslint \. --fix/);
  assert.match(pkg.scripts.lint, /pnpm --filter web lint/);
});

test('eslint, prettier, husky, and lint-staged config files exist', () => {
  for (const file of [
    'eslint.config.mjs',
    '.prettierrc',
    '.prettierignore',
    'lint-staged.config.mjs',
    '.husky/pre-commit',
    'apps/web/eslint.config.mjs',
  ]) {
    assert.ok(existsSync(join(root, file)), `missing ${file}`);
  }
});

test('Nuxt app registers @nuxt/eslint module', () => {
  const config = read('apps/web/nuxt.config.ts');
  assert.match(config, /@nuxt\/eslint/);
});
