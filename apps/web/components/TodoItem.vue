<script setup lang="ts">
import type { Todo } from '@symb-abm/shared';
import { isOverdue } from '@symb-abm/shared';

defineProps<{
  todo: Todo;
}>();

defineEmits<{
  toggle: [id: string];
  remove: [id: string];
}>();
</script>

<template>
  <li class="list-group-item d-flex align-items-center gap-2">
    <input
      class="form-check-input flex-shrink-0"
      type="checkbox"
      data-testid="todo-toggle"
      :checked="todo.completed"
      :aria-label="`Mark ${todo.title} complete`"
      @change="$emit('toggle', todo.id)"
    >
    <div class="flex-grow-1 min-w-0">
      <span
        data-testid="todo-title"
        class="d-block text-truncate"
        :class="{
          'text-decoration-line-through text-muted': todo.completed,
          'text-danger': isOverdue(todo),
        }"
      >
        {{ todo.title }}
      </span>
      <small v-if="todo.dueDate" class="d-block text-muted">{{ todo.dueDate }}</small>
      <span v-for="tag in todo.tags" :key="tag" class="badge bg-secondary me-1">{{ tag }}</span>
    </div>
    <button
      type="button"
      class="btn btn-sm btn-outline-danger flex-shrink-0"
      data-testid="todo-delete"
      @click="$emit('remove', todo.id)"
    >
      Delete
    </button>
  </li>
</template>
