import type { Todo } from '@symb-abm/shared';
import { sortByOrder } from '@symb-abm/shared';

export const STORAGE_KEY = 'symb-todos-v1';
const PERSISTENCE_VERSION = 1;

type PersistedPayload = {
  version: number;
  todos: unknown;
};

export function isValidTodo(value: unknown): value is Todo {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const todo = value as Record<string, unknown>;

  return (
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    typeof todo.completed === 'boolean' &&
    typeof todo.createdAt === 'string' &&
    (todo.dueDate === null || typeof todo.dueDate === 'string') &&
    Array.isArray(todo.tags) &&
    todo.tags.every((tag) => typeof tag === 'string') &&
    typeof todo.order === 'number'
  );
}

export function parsePersistedTodos(raw: string | null): Todo[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PersistedPayload;
    if (parsed.version !== PERSISTENCE_VERSION || !Array.isArray(parsed.todos)) {
      return [];
    }

    return sortByOrder(parsed.todos.filter(isValidTodo));
  } catch {
    return [];
  }
}

export function serializePersistedTodos(todos: Todo[]): string {
  const payload: PersistedPayload = {
    version: PERSISTENCE_VERSION,
    todos,
  };
  return JSON.stringify(payload);
}

export const PERSIST_DEBOUNCE_MS = 250;

export function createDebouncedFn(fn: () => void, delayMs: number): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fn();
    }, delayMs);
  };
}

export function readTodosFromStorage(storage: Storage = localStorage): Todo[] {
  return parsePersistedTodos(storage.getItem(STORAGE_KEY));
}

export function writeTodosToStorage(todos: Todo[], storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, serializePersistedTodos(todos));
}
