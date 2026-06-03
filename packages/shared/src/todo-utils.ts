import type { Todo, TodoFilter } from './types/todo.js';

export const TAG_MAX_LENGTH = 30;
export const TAG_MAX_COUNT = 10;
export const TITLE_MAX_LENGTH = 200;

export type NormalizeTitleResult = { ok: true; title: string } | { ok: false; error: string };

export function normalizeTag(tag: string): string | null {
  const normalized = tag.trim().toLowerCase();
  if (!normalized || normalized.length > TAG_MAX_LENGTH) {
    return null;
  }
  return normalized;
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= TAG_MAX_COUNT) {
      break;
    }
  }

  return result;
}

export function normalizeTitle(title: string): NormalizeTitleResult {
  const trimmed = title.trim();
  if (!trimmed) {
    return { ok: false, error: 'Title is required' };
  }
  if (trimmed.length > TITLE_MAX_LENGTH) {
    return { ok: false, error: 'Title must be at most 200 characters' };
  }
  return { ok: true, title: trimmed };
}

export function filterTodos(
  todos: Todo[],
  filter: TodoFilter,
  selectedTags: string[] = [],
): Todo[] {
  const normalizedSelected = normalizeTags(selectedTags);

  return todos.filter((todo) => {
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    if (normalizedSelected.length === 0) return true;
    return normalizedSelected.every((tag) => todo.tags.includes(tag));
  });
}

export function sortByOrder(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => a.order - b.order);
}

export function normalizeDueDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed || !/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

/** Sort by due date ascending (dated items first), then by manual order. */
export function sortByDueThenOrder(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate && !b.dueDate) {
      return -1;
    }
    if (!a.dueDate && b.dueDate) {
      return 1;
    }
    return a.order - b.order;
  });
}

export function isOverdue(todo: Todo, todayIsoDate: string = todayDateString()): boolean {
  if (!todo.dueDate || todo.completed) {
    return false;
  }
  return todo.dueDate < todayIsoDate;
}

export function reindexOrders(todos: Todo[]): Todo[] {
  return sortByOrder(todos).map((todo, index) => ({
    ...todo,
    order: index,
  }));
}

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}
