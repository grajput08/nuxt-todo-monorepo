<script setup lang="ts">
import { TITLE_MAX_LENGTH } from '@symb-abm/shared';

const appName = 'Symb Todo';
</script>

<template>
  <main class="container py-5">
    <h2 class="h3 mb-3">{{ appName }}</h2>
    <p class="text-muted mb-4">
      Nuxt 3 monorepo shell — full task UI arrives in Task 7+.
    </p>
    <p class="small text-secondary">
      @symb-abm/shared linked (max title length: {{ TITLE_MAX_LENGTH }} characters).
    </p>

    <section class="mt-5" aria-label="Bootstrap component smoke test">
      <h3 class="h5">Bootstrap check</h3>
      <p class="text-muted small">
        Confirm dropdown and modal work (client-only Bootstrap JS).
      </p>
      <div class="d-flex flex-wrap gap-2">
        <div class="dropdown">
          <button
            id="bootstrapSmokeDropdown"
            type="button"
            class="btn btn-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Test dropdown
          </button>
          <ul class="dropdown-menu" aria-labelledby="bootstrapSmokeDropdown">
            <li>
              <span class="dropdown-item-text">Bootstrap dropdown is active</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#bootstrapSmokeModal"
        >
          Test modal
        </button>
      </div>

      <div
        id="bootstrapSmokeModal"
        class="modal fade"
        tabindex="-1"
        aria-labelledby="bootstrapSmokeModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="bootstrapSmokeModalLabel" class="modal-title fs-5">Bootstrap modal</h2>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div class="modal-body">Bootstrap JS loaded successfully.</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
