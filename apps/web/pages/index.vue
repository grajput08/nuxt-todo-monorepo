<script setup lang="ts">
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();
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
    <TodoList />
  </main>
</template>
