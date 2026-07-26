// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site';

// Astro static-site config.
// Output is plain HTML/CSS/JS in ./dist — the same kind of static bundle
// EdgeOne already serves. `site` powers the generated sitemap + canonical URLs.
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [sitemap()],
});
