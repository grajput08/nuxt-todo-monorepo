<template>
  <div class="d-flex min-vh-100 flex-column">
    <header class="navbar navbar-expand-lg border-bottom bg-body-tertiary">
      <div class="container">
        <span class="navbar-brand mb-0 h1">Symb Todo</span>
      </div>
    </header>
    <NuxtPage />
    <footer class="mt-auto border-top py-3">
      <div class="container">
        <p class="mb-0 small text-muted">Todos stay in your browser (localStorage).</p>
      </div>
    </footer>
  </div>
</template>
