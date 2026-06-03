<script setup lang="ts">
import { ref } from 'vue';
import { TAG_MAX_COUNT, normalizeTag } from '@symb-abm/shared';

const tags = defineModel<string[]>({ default: () => [] });
const draft = ref('');
const error = ref('');

function addTag(raw: string): void {
  const normalized = normalizeTag(raw);
  if (!normalized) {
    return;
  }
  if (tags.value.includes(normalized)) {
    error.value = 'Tag already added';
    return;
  }
  if (tags.value.length >= TAG_MAX_COUNT) {
    error.value = `Maximum ${TAG_MAX_COUNT} tags per todo`;
    return;
  }
  tags.value = [...tags.value, normalized];
  error.value = '';
}

function commitDraft(): void {
  const parts = draft.value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of parts) {
    addTag(part);
  }
  draft.value = '';
}

function removeTag(tag: string): void {
  tags.value = tags.value.filter((value) => value !== tag);
  error.value = '';
}
</script>

<template>
  <div>
    <label class="form-label" for="tag-input">Tags (optional)</label>
    <div class="input-group">
      <input
        id="tag-input"
        v-model="draft"
        type="text"
        class="form-control"
        data-testid="tag-input"
        placeholder="Add tag and press Enter"
        maxlength="30"
        @keydown.enter.prevent="commitDraft"
      >
      <button type="button" class="btn btn-outline-secondary" data-testid="tag-add-button" @click="commitDraft">
        Add tag
      </button>
    </div>
    <div v-if="tags.length > 0" class="d-flex flex-wrap gap-1 mt-2">
      <span
        v-for="tag in tags"
        :key="tag"
        class="badge bg-secondary d-inline-flex align-items-center gap-1"
      >
        {{ tag }}
        <button
          type="button"
          class="btn-close btn-close-white btn-sm"
          :aria-label="`Remove tag ${tag}`"
          :data-testid="`remove-tag-${tag}`"
          @click="removeTag(tag)"
        />
      </span>
    </div>
    <div v-if="error" class="form-text text-danger" data-testid="tag-input-error" role="alert">
      {{ error }}
    </div>
  </div>
</template>
