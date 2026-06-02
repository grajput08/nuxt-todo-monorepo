import { describe, expect, it } from 'vitest';
import { normalizeTitle, TITLE_MAX_LENGTH } from '@symb-abm/shared';

describe('Nuxt app workspace link to @symb-abm/shared', () => {
  it('imports shared utilities from the monorepo package', () => {
    expect(TITLE_MAX_LENGTH).toBe(200);
    expect(normalizeTitle('  Hello  ')).toEqual({ ok: true, title: 'Hello' });
  });
});
