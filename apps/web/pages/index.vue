<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();
const editingId = ref<string | null>(null);

const editingTodo = computed(() => {
  if (!editingId.value) {
    return null;
  }
  return store.todos.find((todo) => todo.id === editingId.value) ?? null;
});

function openEdit(id: string): void {
  editingId.value = id;
}

function closeEdit(): void {
  editingId.value = null;
}

function onSave(payload: {
  id: string;
  title: string;
  dueDate: string | null;
  tags: string[];
}): void {
  const result = store.updateTodo(payload.id, {
    title: payload.title,
    dueDate: payload.dueDate,
    tags: payload.tags,
  });
  if (result.ok) {
    closeEdit();
  }
}
</script>

<template>
  <main class="container py-5">
    <header class="mb-4">
      <h2 class="h3 mb-2">Your todos</h2>
      <p class="text-muted mb-0" data-testid="todo-counts">
        <span>{{ store.counts.total }} total</span>
        <span class="mx-1" aria-hidden="true">·</span>
        <span>{{ store.counts.active }} active</span>
        <span class="mx-1" aria-hidden="true">·</span>
        <span>{{ store.counts.completed }} completed</span>
      </p>
    </header>

    <TodoForm class="mb-4" />
    <TodoFilters />
    <TodoList @edit="openEdit" />
    <TodoEditModal :todo="editingTodo" @save="onSave" @closed="closeEdit" />
  </main>
</template>
