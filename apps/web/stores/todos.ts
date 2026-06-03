import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Todo, TodoFilter } from '@symb-abm/shared';
import {
  filterTodos,
  normalizeDueDate,
  normalizeTitle,
  normalizeTags,
  sortByDueThenOrder,
  sortByOrder,
} from '@symb-abm/shared';
import {
  PERSIST_DEBOUNCE_MS,
  createDebouncedFn,
  readTodosFromStorage,
  writeTodosToStorage,
} from '../composables/useLocalStorageSync';

export type AddTodoResult = { ok: true; id: string } | { ok: false; error: string };
export type UpdateTodoResult = { ok: true } | { ok: false; error: string };

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([]);
  const hydrated = ref(false);
  const filter = ref<TodoFilter>('all');
  const selectedTags = ref<string[]>([]);

  const sortedTodos = computed(() => sortByDueThenOrder(todos.value));

  const filteredTodos = computed(() =>
    filterTodos(sortedTodos.value, filter.value, selectedTags.value),
  );

  const availableTags = computed(() => {
    const tags = new Set<string>();
    for (const todo of todos.value) {
      for (const tag of todo.tags) {
        tags.add(tag);
      }
    }
    return [...tags].sort();
  });

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

  function updateTodo(
    id: string,
    patch: { title: string; dueDate?: string | null; tags?: string[] },
  ): UpdateTodoResult {
    const normalized = normalizeTitle(patch.title);
    if (!normalized.ok) {
      return { ok: false, error: normalized.error };
    }

    const exists = todos.value.some((todo) => todo.id === id);
    if (!exists) {
      return { ok: false, error: 'Todo not found' };
    }

    todos.value = sortByDueThenOrder(
      todos.value.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: normalized.title,
              dueDate: normalizeDueDate(patch.dueDate ?? todo.dueDate),
              tags: normalizeTags(patch.tags ?? todo.tags),
            }
          : todo,
      ),
    );
    schedulePersist();

    return { ok: true };
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

  function reorder(orderedIds: string[]): void {
    if (orderedIds.length === 0) {
      return;
    }

    const byId = new Map(todos.value.map((todo) => [todo.id, todo]));
    const reordered = orderedIds
      .map((id) => byId.get(id))
      .filter((todo): todo is Todo => todo !== undefined);

    if (reordered.length !== orderedIds.length) {
      return;
    }

    const idSet = new Set(orderedIds);
    const remaining = sortByOrder(todos.value.filter((todo) => !idSet.has(todo.id)));

    todos.value = [
      ...reordered.map((todo, index) => ({ ...todo, order: index })),
      ...remaining.map((todo, index) => ({
        ...todo,
        order: reordered.length + index,
      })),
    ];
    schedulePersist();
  }

  function toggleSelectedTag(tag: string): void {
    if (selectedTags.value.includes(tag)) {
      selectedTags.value = selectedTags.value.filter((value) => value !== tag);
      return;
    }
    selectedTags.value = [...selectedTags.value, tag];
  }

  function clearSelectedTags(): void {
    selectedTags.value = [];
  }

  return {
    todos,
    sortedTodos,
    filteredTodos,
    filter,
    selectedTags,
    availableTags,
    counts,
    hydrated,
    hydrate,
    addTodo,
    updateTodo,
    toggleTodo,
    removeTodo,
    setFilter,
    clearCompleted,
    reorder,
    toggleSelectedTag,
    clearSelectedTags,
  };
});
