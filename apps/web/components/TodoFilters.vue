<script setup lang="ts">
import type { TodoFilter } from '@symb-abm/shared';
import { useTodosStore } from '~/stores/todos';

const store = useTodosStore();

const filterOptions: { value: TodoFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function countFor(value: TodoFilter): number {
  if (value === 'all') return store.counts.total;
  if (value === 'active') return store.counts.active;
  return store.counts.completed;
}
</script>

<template>
  <div class="mb-3">
    <div class="d-flex flex-wrap align-items-center gap-2">
      <div class="btn-group" role="group" aria-label="Filter todos">
        <button
          v-for="option in filterOptions"
          :key="option.value"
          type="button"
          class="btn btn-outline-secondary"
          :class="{ active: store.filter === option.value }"
          :data-testid="`filter-${option.value}`"
          :aria-pressed="store.filter === option.value"
          @click="store.setFilter(option.value)"
        >
          {{ option.label }} ({{ countFor(option.value) }})
        </button>
      </div>
      <button
        v-if="store.counts.completed > 0"
        type="button"
        class="btn btn-outline-danger"
        data-testid="clear-completed"
        @click="store.clearCompleted"
      >
        Clear completed
      </button>
    </div>

    <div
      v-if="store.availableTags.length > 0"
      class="d-flex flex-wrap align-items-center gap-1 mt-2"
      role="group"
      aria-label="Filter by tag"
    >
      <span class="small text-muted me-1">Tags:</span>
      <button
        v-for="tag in store.availableTags"
        :key="tag"
        type="button"
        class="btn btn-sm"
        :class="store.selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline-secondary'"
        :data-testid="`filter-tag-${tag}`"
        :aria-pressed="store.selectedTags.includes(tag)"
        @click="store.toggleSelectedTag(tag)"
      >
        {{ tag }}
      </button>
      <button
        v-if="store.selectedTags.length > 0"
        type="button"
        class="btn btn-sm btn-link"
        data-testid="clear-tag-filters"
        @click="store.clearSelectedTags"
      >
        Clear tag filters
      </button>
    </div>
  </div>
</template>
