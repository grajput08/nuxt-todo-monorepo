<script setup lang="ts">
import { ref } from 'vue';
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();
const title = ref('');
const dueDate = ref('');
const error = ref('');

function submit(): void {
  const result = store.addTodo(title.value, {
    dueDate: dueDate.value || null,
  });
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  title.value = '';
  dueDate.value = '';
  error.value = '';
}
</script>

<template>
  <form class="row g-2 align-items-end" @submit.prevent="submit">
    <div class="col-md-6">
      <label class="form-label visually-hidden" for="todo-title-input">New todo</label>
      <input
        id="todo-title-input"
        v-model="title"
        type="text"
        class="form-control"
        data-testid="todo-title-input"
        placeholder="What needs to be done?"
        maxlength="200"
        autocomplete="off"
        @keydown.enter.prevent="submit"
      >
    </div>
    <div class="col-md-3">
      <label class="form-label" for="todo-due-date-input">Due date (optional)</label>
      <input
        id="todo-due-date-input"
        v-model="dueDate"
        type="date"
        class="form-control"
        data-testid="todo-due-date-input"
      >
    </div>
    <div class="col-md-3 col-auto">
      <button type="submit" class="btn btn-primary w-100" data-testid="todo-add-button">
        Add
      </button>
    </div>
    <div v-if="error" class="col-12">
      <div class="form-text text-danger" data-testid="todo-form-error" role="alert">
        {{ error }}
      </div>
    </div>
  </form>
</template>
