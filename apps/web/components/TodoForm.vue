<script setup lang="ts">
import { ref } from 'vue';
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();
const title = ref('');
const error = ref('');

function submit(): void {
  const result = store.addTodo(title.value);
  if (!result.ok) {
    error.value = result.error;
    return;
  }
  title.value = '';
  error.value = '';
}
</script>

<template>
  <form class="row g-2 align-items-start" @submit.prevent="submit">
    <div class="col">
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
      <div v-if="error" class="form-text text-danger" data-testid="todo-form-error" role="alert">
        {{ error }}
      </div>
    </div>
    <div class="col-auto">
      <button type="submit" class="btn btn-primary" data-testid="todo-add-button">Add</button>
    </div>
  </form>
</template>
