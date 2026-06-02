export default defineNuxtConfig({
  compatibilityDate: '2025-06-02',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt'],
  typescript: {
    strict: true,
    typeCheck: false,
  },
  vite: {
    optimizeDeps: {
      include: ['@symb-abm/shared'],
    },
  },
});
