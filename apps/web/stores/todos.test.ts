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

  it('filters todos by active and completed', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Active one');
    store.addTodo('Done one');
    store.toggleTodo(store.todos.find((t) => t.title === 'Done one')!.id);

    store.setFilter('active');
    expect(store.filteredTodos.map((t) => t.title)).toEqual(['Active one']);

    store.setFilter('completed');
    expect(store.filteredTodos.map((t) => t.title)).toEqual(['Done one']);

    store.setFilter('all');
    expect(store.filteredTodos).toHaveLength(2);
  });

  it('clearCompleted removes only completed todos and persists', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Keep');
    store.addTodo('Remove');
    store.toggleTodo(store.todos.find((t) => t.title === 'Remove')!.id);

    store.clearCompleted();
    expect(store.todos.map((t) => t.title)).toEqual(['Keep']);

    vi.advanceTimersByTime(300);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.todos).toHaveLength(1);
    expect(saved.todos[0].title).toBe('Keep');
  });

  it('does not persist filter state to localStorage', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('A');
    store.setFilter('active');
    vi.advanceTimersByTime(300);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.filter).toBeUndefined();
    expect(store.filter).toBe('active');
  });

  it('filters by selected tags combined with status filter', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Work task', { tags: ['work'] });
    store.addTodo('Home task', { tags: ['home'] });
    store.addTodo('Both', { tags: ['work', 'urgent'] });
    store.toggleTodo(store.todos.find((t) => t.title === 'Home task')!.id);

    store.setFilter('active');
    store.toggleSelectedTag('work');

    expect(store.filteredTodos.map((t) => t.title)).toEqual(['Work task', 'Both']);
  });

  it('persists tags in localStorage', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Tagged', { tags: ['work', 'urgent'] });

    vi.advanceTimersByTime(300);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.todos[0].tags).toEqual(['work', 'urgent']);
  });

  it('persists due dates in localStorage', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Due soon', { dueDate: '2026-07-01' });

    vi.advanceTimersByTime(300);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.todos[0].dueDate).toBe('2026-07-01');
  });

  it('updates title, due date, and tags', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Original', { dueDate: '2026-06-01', tags: ['work'] });
    const id = store.todos[0]!.id;

    const result = store.updateTodo(id, {
      title: '  Updated  ',
      dueDate: '2026-07-01',
      tags: ['home', 'urgent'],
    });

    expect(result.ok).toBe(true);
    expect(store.todos[0]).toMatchObject({
      title: 'Updated',
      dueDate: '2026-07-01',
      tags: ['home', 'urgent'],
    });

    vi.advanceTimersByTime(300);
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(saved.todos[0].title).toBe('Updated');
  });

  it('rejects invalid titles on update', () => {
    const store = useTodosStore();
    store.hydrate();
    store.addTodo('Keep');
    const id = store.todos[0]!.id;

    const result = store.updateTodo(id, { title: '   ' });
    expect(result.ok).toBe(false);
    expect(store.todos[0]?.title).toBe('Keep');
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
