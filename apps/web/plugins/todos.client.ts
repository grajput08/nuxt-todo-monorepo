export default defineNuxtPlugin(() => {
  useTodosStore().hydrate();
});
