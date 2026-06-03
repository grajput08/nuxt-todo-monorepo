import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Todo } from './types/todo.js';
import {
  filterTodos,
  isOverdue,
  normalizeTag,
  normalizeTags,
  normalizeTitle,
  reindexOrders,
  sortByOrder,
} from './todo-utils.js';

const baseTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: '1',
  title: 'Task',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  dueDate: null,
  tags: [],
  order: 0,
  ...overrides,
});

describe('normalizeTag', () => {
  it('trims and lowercases a valid tag', () => {
    expect(normalizeTag('  Work  ')).toBe('work');
  });

  it('returns null for empty or whitespace-only tags', () => {
    expect(normalizeTag('')).toBeNull();
    expect(normalizeTag('   ')).toBeNull();
  });

  it('returns null when tag exceeds 30 characters', () => {
    expect(normalizeTag('a'.repeat(31))).toBeNull();
  });

  it('accepts tags exactly 30 characters', () => {
    expect(normalizeTag('a'.repeat(30))).toHaveLength(30);
  });
});

describe('normalizeTags', () => {
  it('normalizes, deduplicates, and caps at 10 tags', () => {
    const input = [' Work ', 'work', 'HOME', '', 'a'.repeat(31)];
    for (let i = 0; i < 12; i++) input.push(`tag${i}`);
    const result = normalizeTags(input);
    expect(result).toEqual([
      'work',
      'home',
      'tag0',
      'tag1',
      'tag2',
      'tag3',
      'tag4',
      'tag5',
      'tag6',
      'tag7',
    ]);
    expect(result).toHaveLength(10);
  });
});

describe('normalizeTitle', () => {
  it('returns trimmed title when valid', () => {
    expect(normalizeTitle('  Buy milk  ')).toEqual({ ok: true, title: 'Buy milk' });
  });

  it('rejects empty titles', () => {
    expect(normalizeTitle('   ')).toEqual({ ok: false, error: 'Title is required' });
  });

  it('rejects titles over 200 characters', () => {
    expect(normalizeTitle('a'.repeat(201))).toEqual({
      ok: false,
      error: 'Title must be at most 200 characters',
    });
  });
});

describe('filterTodos', () => {
  const todos: Todo[] = [
    baseTodo({ id: '1', completed: false, tags: ['work'] }),
    baseTodo({ id: '2', completed: true, tags: ['home'] }),
    baseTodo({ id: '3', completed: false, tags: ['work', 'urgent'] }),
  ];

  it('returns all todos for filter all', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('returns only active todos', () => {
    expect(filterTodos(todos, 'active').map((t) => t.id)).toEqual(['1', '3']);
  });

  it('returns only completed todos', () => {
    expect(filterTodos(todos, 'completed').map((t) => t.id)).toEqual(['2']);
  });

  it('filters by selected tags (must include all selected)', () => {
    expect(filterTodos(todos, 'all', ['work']).map((t) => t.id)).toEqual(['1', '3']);
    expect(filterTodos(todos, 'all', ['work', 'urgent']).map((t) => t.id)).toEqual(['3']);
    expect(filterTodos(todos, 'active', ['home'])).toHaveLength(0);
  });
});

describe('sortByOrder', () => {
  it('sorts todos by ascending order field', () => {
    const todos = [
      baseTodo({ id: 'b', order: 2 }),
      baseTodo({ id: 'a', order: 0 }),
      baseTodo({ id: 'c', order: 1 }),
    ];
    expect(sortByOrder(todos).map((t) => t.id)).toEqual(['a', 'c', 'b']);
  });

  it('does not mutate the input array', () => {
    const todos = [baseTodo({ order: 1 }), baseTodo({ order: 0 })];
    const copy = [...todos];
    sortByOrder(todos);
    expect(todos).toEqual(copy);
  });
});

describe('isOverdue', () => {
  it('is false when no due date, completed, or due date is today/future', () => {
    expect(isOverdue(baseTodo(), '2026-06-02')).toBe(false);
    expect(isOverdue(baseTodo({ dueDate: '2026-06-02' }), '2026-06-02')).toBe(false);
    expect(isOverdue(baseTodo({ dueDate: '2026-06-03' }), '2026-06-02')).toBe(false);
    expect(isOverdue(baseTodo({ dueDate: '2026-06-01', completed: true }), '2026-06-02')).toBe(
      false,
    );
  });

  it('is true when due date is before today and todo is incomplete', () => {
    expect(isOverdue(baseTodo({ dueDate: '2026-06-01' }), '2026-06-02')).toBe(true);
  });

  it('defaults to the current date when today is omitted', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-02T12:00:00.000Z'));
    expect(isOverdue(baseTodo({ dueDate: '2026-06-01' }))).toBe(true);
    vi.useRealTimers();
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('reindexOrders', () => {
  it('assigns contiguous order values sorted by current order', () => {
    const todos = [
      baseTodo({ id: 'b', order: 5 }),
      baseTodo({ id: 'a', order: 1 }),
      baseTodo({ id: 'c', order: 3 }),
    ];
    expect(reindexOrders(todos).map((t) => ({ id: t.id, order: t.order }))).toEqual([
      { id: 'a', order: 0 },
      { id: 'c', order: 1 },
      { id: 'b', order: 2 },
    ]);
  });
});
