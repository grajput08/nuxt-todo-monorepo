import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Todo, TodoFilter } from '@symb-abm/shared';
import {
  filterTodos,
  normalizeDueDate,
  normalizeTitle,
  normalizeTags,
  sortByDueThenOrder,
} from '@symb-abm/shared';
import {
  PERSIST_DEBOUNCE_MS,
  createDebouncedFn,
  readTodosFromStorage,
  writeTodosToStorage,
} from '../composables/useLocalStorageSync';

export type AddTodoResult = { ok: true; id: string } | { ok: false; error: string };

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([]);
  const hydrated = ref(false);
  const filter = ref<TodoFilter>('all');

  const sortedTodos = computed(() => sortByDueThenOrder(todos.value));

  const filteredTodos = computed(() => filterTodos(sortedTodos.value, filter.value));

  const counts = computed(() => {
    const total = todos.value.length;
    const completed = todos.value.filter((todo) => todo.completed).length;
    return {
      total,
      active: total - completed,
      completed,
    };
  });

  const schedulePersist = createDebouncedFn(() => {
    if (import.meta.server) {
      return;
    }
    writeTodosToStorage(todos.value);
  }, PERSIST_DEBOUNCE_MS);

  function hydrate(storage?: Storage): void {
    if (import.meta.server) {
      return;
    }

    const target = storage ?? localStorage;
    todos.value = readTodosFromStorage(target);
    hydrated.value = true;
  }

  function nextOrder(): number {
    if (todos.value.length === 0) {
      return 0;
    }
    return Math.max(...todos.value.map((todo) => todo.order)) + 1;
  }

  function addTodo(
    title: string,
    options: { dueDate?: string | null; tags?: string[] } = {},
  ): AddTodoResult {
    const normalized = normalizeTitle(title);
    if (!normalized.ok) {
      return { ok: false, error: normalized.error };
    }

    const todo: Todo = {
      id: crypto.randomUUID(),
      title: normalized.title,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: normalizeDueDate(options.dueDate),
      tags: normalizeTags(options.tags ?? []),
      order: nextOrder(),
    };

    todos.value = sortByDueThenOrder([...todos.value, todo]);
    schedulePersist();

    return { ok: true, id: todo.id };
  }

  function toggleTodo(id: string): void {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    schedulePersist();
  }

  function removeTodo(id: string): void {
    todos.value = todos.value.filter((todo) => todo.id !== id);
    schedulePersist();
  }

  function setFilter(next: TodoFilter): void {
    filter.value = next;
  }

  function clearCompleted(): void {
    todos.value = todos.value.filter((todo) => !todo.completed);
    schedulePersist();
  }

  return {
    todos,
    sortedTodos,
    filteredTodos,
    filter,
    counts,
    hydrated,
    hydrate,
    addTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    clearCompleted,
  };
});
