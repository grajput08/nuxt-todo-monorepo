<script setup lang="ts">
import type { Todo } from '@symb-abm/shared';
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();

const emit = defineEmits<{
  edit: [id: string];
}>();

const draggableTodos = computed({
  get: (): Todo[] => store.filteredTodos,
  set: (next: Todo[]) => {
    store.reorder(next.map((todo) => todo.id));
  },
});

function onToggle(id: string): void {
  store.toggleTodo(id);
}

function onRemove(id: string): void {
  store.removeTodo(id);
}
</script>

<template>
  <div>
    <ClientOnly>
      <VueDraggable
        v-if="store.filteredTodos.length > 0"
        v-model="draggableTodos"
        tag="ul"
        class="list-group list-group-flush border rounded"
        handle=".drag-handle"
        :animation="150"
        data-testid="todo-list"
      >
        <TodoItem
          v-for="todo in draggableTodos"
          :key="todo.id"
          :todo="todo"
          @toggle="onToggle"
          @edit="emit('edit', $event)"
          @remove="onRemove"
        />
      </VueDraggable>
      <template #fallback>
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
            @edit="emit('edit', $event)"
            @remove="onRemove"
          />
        </ul>
      </template>
    </ClientOnly>
    <p
      v-if="store.filteredTodos.length === 0 && store.todos.length === 0"
      class="text-muted mb-0 py-4 text-center"
      data-testid="todo-empty-state"
    >
      No todos yet. Add one above.
    </p>
    <p
      v-else-if="store.filteredTodos.length === 0"
      class="text-muted mb-0 py-4 text-center"
      data-testid="todo-filter-empty-state"
    >
      No todos match this filter.
    </p>
  </div>
</template>
