import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

function readWeb(path: string): string {
  return readFileSync(join(webRoot, path), 'utf8');
}

describe('Bootstrap setup', () => {
  it('declares bootstrap and popper dependencies', () => {
    const pkg = JSON.parse(readWeb('package.json'));
    expect(pkg.dependencies.bootstrap).toBeDefined();
    expect(pkg.dependencies['vue-draggable-plus']).toBeDefined();
    expect(pkg.dependencies['@popperjs/core']).toBeDefined();
  });

  it('loads global Bootstrap styles from nuxt config', () => {
    expect(readWeb('nuxt.config.ts')).toMatch(/assets\/scss\/main\.scss/);
  });

  it('provides a client-only bootstrap plugin', () => {
    const plugin = readWeb('plugins/bootstrap.client.ts');
    expect(plugin).toMatch(/import \* as bootstrap from 'bootstrap'/);
    expect(plugin).toMatch(/import\.meta\.server/);
  });

  it('wires the todo CRUD UI on the home page', () => {
    const page = readWeb('pages/index.vue');
    expect(page).toMatch(/TodoForm/);
    expect(page).toMatch(/TodoList/);
    expect(page).toMatch(/TodoEditModal/);
    expect(page).toMatch(/todo-counts/);
  });
});
