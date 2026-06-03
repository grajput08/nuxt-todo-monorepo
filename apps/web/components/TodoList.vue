<script setup lang="ts">
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();

function onToggle(id: string): void {
  store.toggleTodo(id);
}

function onRemove(id: string): void {
  store.removeTodo(id);
}
</script>

<template>
  <div>
    <ul
      v-if="store.filteredTodos.length > 0"
      class="list-group list-group-flush border rounded"
      data-testid="todo-list"
    >
      <TodoItem
        v-for="todo in store.filteredTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="onToggle"
        @remove="onRemove"
      />
    </ul>
    <p
      v-else-if="store.todos.length === 0"
      class="text-muted mb-0 py-4 text-center"
      data-testid="todo-empty-state"
    >
      No todos yet. Add one above.
    </p>
    <p v-else class="text-muted mb-0 py-4 text-center" data-testid="todo-filter-empty-state">
      No todos match this filter.
    </p>
  </div>
</template>
