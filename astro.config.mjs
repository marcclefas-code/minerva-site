// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'fr', 'de', 'it', 'es', 'zh', 'ja'],
    routing: { prefixDefaultLocale: false }
  },
  build: {
    assets: 'assets'
  }
});
