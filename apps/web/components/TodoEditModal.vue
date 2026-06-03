<script setup lang="ts">
import { Modal } from 'bootstrap';
import type { Todo } from '@symb-abm/shared';
import { normalizeTitle } from '@symb-abm/shared';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  todo: Todo | null;
}>();

const emit = defineEmits<{
  save: [payload: { id: string; title: string; dueDate: string | null; tags: string[] }];
  closed: [];
}>();

const modalRoot = ref<HTMLElement | null>(null);
const title = ref('');
const dueDate = ref('');
const tags = ref<string[]>([]);
const error = ref('');
let modal: Modal | null = null;

function syncFields(todo: Todo): void {
  title.value = todo.title;
  dueDate.value = todo.dueDate ?? '';
  tags.value = [...todo.tags];
  error.value = '';
}

function submit(): void {
  if (!props.todo) {
    return;
  }

  const normalized = normalizeTitle(title.value);
  if (!normalized.ok) {
    error.value = normalized.error;
    return;
  }

  emit('save', {
    id: props.todo.id,
    title: normalized.title,
    dueDate: dueDate.value || null,
    tags: tags.value,
  });
  modal?.hide();
}

function onHidden(): void {
  emit('closed');
}

watch(
  () => props.todo,
  (todo, previous) => {
    if (!todo) {
      return;
    }
    syncFields(todo);
    if (previous?.id !== todo.id) {
      modal?.show();
    }
  },
);

onMounted(() => {
  if (!modalRoot.value) {
    return;
  }
  modal = new Modal(modalRoot.value, { focus: true });
  modalRoot.value.addEventListener('hidden.bs.modal', onHidden);
  if (props.todo) {
    syncFields(props.todo);
    modal.show();
  }
});

onBeforeUnmount(() => {
  if (modalRoot.value) {
    modalRoot.value.removeEventListener('hidden.bs.modal', onHidden);
  }
  modal?.dispose();
  modal = null;
});
</script>

<template>
  <div
    ref="modalRoot"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="todo-edit-modal-title"
    aria-hidden="true"
    data-testid="todo-edit-modal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="submit">
          <div class="modal-header">
            <h2 id="todo-edit-modal-title" class="modal-title h5">Edit todo</h2>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              data-testid="edit-cancel"
            />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label" for="edit-title-input">Title</label>
              <input
                id="edit-title-input"
                v-model="title"
                type="text"
                class="form-control"
                data-testid="edit-title-input"
                maxlength="200"
                required
              >
            </div>
            <div class="mb-3">
              <label class="form-label" for="edit-due-date-input">Due date (optional)</label>
              <input
                id="edit-due-date-input"
                v-model="dueDate"
                type="date"
                class="form-control"
                data-testid="edit-due-date-input"
              >
            </div>
            <TodoTagInput v-model="tags" />
            <div
              v-if="error"
              class="form-text text-danger mt-2"
              data-testid="edit-form-error"
              role="alert"
            >
              {{ error }}
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              data-bs-dismiss="modal"
              data-testid="edit-dismiss"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" data-testid="edit-save">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
