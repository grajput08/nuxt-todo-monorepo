export default defineNuxtConfig({
  compatibilityDate: '2025-06-02',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@pinia/nuxt'],
  css: ['~/assets/scss/main.scss'],
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
