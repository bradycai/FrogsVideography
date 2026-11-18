// @ts-check
import { defineConfig, envField } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config/site';

/** A server-only secret, read at runtime and never bundled into client JS. */
const secret = () => envField.string({ context: 'server', access: 'secret', optional: true });

// Every page is still pre-rendered to plain HTML/CSS/JS in ./dist. Only the two
// routes that opt out with `export const prerender = false` run on the server
// (as a Netlify Function):
//   • src/pages/api/contact.ts — stores contact-form inquiries in Postgres
//   • src/pages/admin.astro    — password-protected inbox for those inquiries
// `site` powers the generated sitemap + canonical URLs.
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'ignore',
  adapter: netlify({
    // The site doesn't use astro:assets; keep image URLs exactly as authored.
    imageCDN: false,
    // Local `astro dev` needs none of Netlify's emulated features. Edge Functions
    // emulation in particular starts a Deno server, which fails with Deno 2.9+.
    devFeatures: { edgeFunctions: false, images: false, environmentVariables: false },
  }),
  build: {
    inlineStylesheets: 'auto',
  },
  // Set these in Netlify → Site configuration → Environment variables, or in a
  // local .env file for development. See README.md → "Contact form & backend".
  env: {
    schema: {
      DATABASE_URL: secret(),
      // Set automatically if the site uses Netlify DB instead of its own Postgres.
      NETLIFY_DATABASE_URL: secret(),
      DATA_ENCRYPTION_KEY: secret(),
      ADMIN_PASSWORD_HASH: secret(),
    },
  },
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/admin') })],
});
