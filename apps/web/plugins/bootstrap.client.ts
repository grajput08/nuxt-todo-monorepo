import * as bootstrap from 'bootstrap';

export default defineNuxtPlugin(() => {
  if (import.meta.server) {
    return;
  }

  return {
    provide: {
      bootstrap,
    },
  };
});
