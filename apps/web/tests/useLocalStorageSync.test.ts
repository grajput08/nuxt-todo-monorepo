import { describe, expect, it } from 'vitest';
import type { Todo } from '@symb-abm/shared';
import {
  STORAGE_KEY,
  parsePersistedTodos,
  serializePersistedTodos,
} from '../composables/useLocalStorageSync';

const sampleTodo: Todo = {
  id: '1',
  title: 'Test',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  dueDate: null,
  tags: ['work'],
  order: 0,
};

describe('useLocalStorageSync', () => {
  it('uses versioned storage key', () => {
    expect(STORAGE_KEY).toBe('symb-todos-v1');
  });

  it('serializes and parses todos round-trip', () => {
    const raw = serializePersistedTodos([sampleTodo]);
    expect(parsePersistedTodos(raw)).toEqual([sampleTodo]);
  });

  it('returns empty list for null, invalid JSON, or wrong shape', () => {
    expect(parsePersistedTodos(null)).toEqual([]);
    expect(parsePersistedTodos('not-json')).toEqual([]);
    expect(parsePersistedTodos(JSON.stringify({ version: 2, todos: [] }))).toEqual([]);
    expect(parsePersistedTodos(JSON.stringify({ version: 1, todos: 'nope' }))).toEqual([]);
  });

  it('filters out invalid todo entries', () => {
    const raw = serializePersistedTodos([
      sampleTodo,
      { id: 1, title: false } as unknown as Todo,
    ]);
    expect(parsePersistedTodos(raw)).toEqual([sampleTodo]);
  });
});
