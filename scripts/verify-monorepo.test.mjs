import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

test('package.json defines a private pnpm monorepo root', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.private, true);
  assert.match(pkg.packageManager, /^pnpm@(9|10)\./);
  assert.ok(pkg.engines?.node?.includes('20'));
});

test('pnpm-workspace.yaml includes apps and packages globs', () => {
  const workspace = read('pnpm-workspace.yaml');
  assert.match(workspace, /apps\/\*/);
  assert.match(workspace, /packages\/\*/);
});

test('.nvmrc pins Node 20', () => {
  assert.equal(read('.nvmrc').trim(), '20');
});

test('.gitignore covers build and test artifacts', () => {
  const gitignore = read('.gitignore');
  for (const entry of ['node_modules', '.nuxt', 'dist', 'playwright-report', 'test-results']) {
    assert.match(gitignore, new RegExp(entry));
  }
});

test('SPEC.md exists at repository root', () => {
  assert.ok(existsSync(join(root, 'SPEC.md')));
});
