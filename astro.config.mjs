// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site';

// Every page is still pre-rendered to plain HTML/CSS/JS in ./dist. Only the two
// routes that opt out with `export const prerender = false` run on the server
// (as a Netlify Function):
//   • src/pages/api/contact.ts — stores contact-form inquiries in Postgres
//   • src/pages/admin.astro    — password-protected inbox for those inquiries
// `site` powers the generated sitemap + canonical URLs.
//
// The Netlify adapter is skipped in `astro dev`: Astro's own dev server runs the
// two server routes (it logs a harmless "no adapter is installed … fine for
// development" warning). The site uses no Netlify-only runtime features, and the
// adapter's dev emulator (Netlify Edge Functions on Deno) crashes on startup
// with Deno 2.9+, so skipping it keeps local development clean.
// (`npm run preview` uses `vite preview`, because the Netlify adapter doesn't
// support `astro preview`.)
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  adapter: isDev
    ? undefined
    : netlify({
        // The site doesn't use astro:assets; keep image URLs exactly as authored.
        imageCDN: false,
      }),
  build: {
    inlineStylesheets: 'auto',
  },
  // Server-only secrets, read at runtime (never bundled into client JS).
  // Set them in Netlify → Site configuration → Environment variables, or in a
  // local .env file for development. See README.md → "Contact form & backend".
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Set automatically if the site uses Netlify DB instead of its own Postgres.
      NETLIFY_DATABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      DATA_ENCRYPTION_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD_HASH: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/admin') })],
});
