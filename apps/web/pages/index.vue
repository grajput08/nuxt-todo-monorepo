<script setup lang="ts">
import { TITLE_MAX_LENGTH } from '@symb-abm/shared';

const appName = 'Symb Todo';
</script>

<template>
  <main class="container py-5">
    <h1 class="h2">{{ appName }}</h1>
    <p class="text-muted mb-0">Nuxt 3 monorepo shell — task UI arrives in later build tasks.</p>
    <p class="small text-secondary mt-2">
      @symb-abm/shared linked (max title length: {{ TITLE_MAX_LENGTH }} characters).
    </p>
  </main>
</template>
