import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { STORAGE_KEY } from '../composables/useLocalStorageSync';
import { useTodosStore } from './todos';

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
  };
}

describe('useTodosStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    vi.stubGlobal('localStorage', createStorage());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('hydrates from localStorage on the client', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        todos: [
          {
            id: 'saved-1',
            title: 'Saved',
            completed: true,
            createdAt: '2026-01-01T00:00:00.000Z',
            dueDate: null,
            tags: [],
            order: 0,
          },
        ],
      }),
    );

    const store = useTodosStore();
    store.hydrate();

    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]?.title).toBe('Saved');
    expect(store.hydrated).toBe(true);
  });

  it('falls back to empty list when storage is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');

    const store = useTodosStore();
    store.hydrate();

    expect(store.todos).toEqual([]);
  });

  it('adds a todo with order and persists after debounce', () => {
    const store = useTodosStore();
    store.hydrate();

    const result = store.addTodo('  Buy milk  ');
    expect(result.ok).toBe(true);
    expect(store.todos).toHaveLength(1);
    expect(store.todos[0]?.title).toBe('Buy milk');
    expect(store.todos[0]?.order).toBe(0);

    vi.advanceTimersByTime(300);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.todos).toHaveLength(1);
    expect(saved.todos[0].title).toBe('Buy milk');
  });

  it('rejects invalid titles', () => {
    const store = useTodosStore();
    store.hydrate();

    const result = store.addTodo('   ');
    expect(result.ok).toBe(false);
    expect(store.todos).toHaveLength(0);
  });

  it('toggles and removes todos', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('One');
    const id = store.todos[0]!.id;

    store.toggleTodo(id);
    expect(store.todos[0]?.completed).toBe(true);

    store.removeTodo(id);
    expect(store.todos).toHaveLength(0);

    vi.advanceTimersByTime(300);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '').todos).toEqual([]);
  });
});
