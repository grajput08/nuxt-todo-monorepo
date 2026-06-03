export default {
  'packages/shared/**/*.{js,mjs,cjs,ts}': ['eslint --fix'],
  'scripts/**/*.{js,mjs,cjs}': ['eslint --fix'],
  'apps/web/**/*.{js,mjs,cjs,ts,vue}': (files) => {
    const relative = files.map((file) => file.replace(/^apps\/web\//, '')).join(' ');
    return [`pnpm --filter web exec nuxt prepare`, `pnpm --filter web exec eslint --fix ${relative}`];
  },
  '*.{json,md,yml,yaml,css,scss}': ['prettier --write'],
};
