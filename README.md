# Frogs Videography — Website

Marketing site for **Frogs Videography**, a Massachusetts & Rhode Island video
production company. Built with [Astro](https://astro.build) as a **static site**
(plain HTML/CSS/JS output) so it stays fast, cheap to host, and easy to deploy to
EdgeOne (or any static host).

Live preview: https://frogsvideo.edgeone.dev
Target production domain: https://www.frogsvideography.com _(not yet pointed — see [DEPLOYMENT.md](./DEPLOYMENT.md))_

---

## Quick start

```bash
npm install      # install dependencies (first time only)
npm run dev      # local dev server → http://localhost:4321
npm run build    # type-check + produce static site in ./dist
npm run preview  # serve the built ./dist locally to sanity-check
```

Requires **Node 18.14+** (Node 20 recommended — see `.nvmrc`).

### All scripts

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `npm run dev`    | Dev server with hot reload                              |
| `npm run build`  | `astro check` (type-check) **then** build to `./dist`   |
| `npm run preview`| Preview the production build locally                    |
| `npm run check`  | Type-check only                                         |
| `npm run lint`   | ESLint over `.js` / `.ts` / `.astro`                    |
| `npm run format` | Prettier auto-format                                    |

---

## Project structure

```
FrogsWebsite/
├─ public/                 # served as-is at the site root
│  ├─ images/              # logo + about photos (replace these to swap images)
│  ├─ favicon.svg / .ico   # browser tab icons
│  ├─ apple-touch-icon.png
│  └─ robots.txt
├─ src/
│  ├─ config/
│  │  ├─ site.ts           # ★ ALL text, links, business info, portfolio items
│  │  └─ sections.ts       # ★ turn sections on/off (true/false)
│  ├─ layouts/
│  │  └─ BaseLayout.astro  # <head>: SEO, Open Graph, schema.org, favicon
│  ├─ components/          # one file per section (Hero, Services, Portfolio…)
│  ├─ scripts/
│  │  ├─ main.js           # loader, animations, video embeds, ROI calculator
│  │  └─ contact.js        # contact-form handling (see “Contact form” below)
│  ├─ styles/
│  │  └─ global.css        # the full design system / all styling
│  └─ pages/
│     └─ index.astro       # assembles the homepage from the sections above
├─ astro.config.mjs        # Astro + sitemap config (reads the production URL)
└─ DEPLOYMENT.md           # how to deploy & connect the custom domain
```

The homepage is **broken into small, reusable components** — there is no single
giant file. `index.astro` just imports each section and shows it if its toggle is on.

---

## How to edit content

### ✏️ Edit text

Almost all copy lives in **[`src/config/site.ts`](./src/config/site.ts)**, grouped by
section (`HERO`, `SERVICES`, `PROCESS`, `ABOUT`, `FOOTER`, …). Change the strings there
and the site updates — you rarely need to touch the components.

### 🖼️ Replace images

Images live in **`public/images/`**. To swap one, replace the file (keep the same
name) or add a new file and update its path in `src/config/site.ts`:

- `logo.png` — nav / loader / footer logo
- `about-david.jpg`, `about-mike.jpg` — founder portraits (`ABOUT.portraits`)

Portfolio/reel “images” are pulled automatically from YouTube thumbnails — you only
provide the video ID (see below).

### 🔗 Update links & business info

In `src/config/site.ts`:

- `LINKS.calendly` — the booking link used by **every** “Book” button
- `LINKS.googleReviews` — the Google reviews link
- `LINKS.social` — Instagram/YouTube/etc. (empty = hidden)
- `BUSINESS.email` / `BUSINESS.phone` — **currently blank.** Fill these in and the
  Contact section automatically shows them. Leave blank to hide.
- `SITE.url`, `SITE.title`, `SITE.description` — SEO + canonical + sitemap

### 🎬 Add a portfolio item

In `src/config/site.ts`, add an entry to `PORTFOLIO.items` (or `REELS.items`):

```ts
{ id: 'YOUTUBE_VIDEO_ID', tag: 'Mini Documentary', title: 'Client Name' },
```

`id` is the part after `watch?v=` in a YouTube URL. The thumbnail, hover state,
lazy-loaded player, and accessible alt text are all generated for you.

### 🔀 Enable / disable a section

Edit **[`src/config/sections.ts`](./src/config/sections.ts)** and flip any value:

```ts
export const SECTIONS = {
  hero: true,
  services: true,
  portfolio: true,
  trust: true,       // testimonials / social-proof block
  about: true,
  process: true,
  contact: true,
  footer: true,
  // …
};
```

Setting one to `false` removes it from the page **without deleting any code**.

---

## Contact form

The contact form UI is complete, but **no backend/email service is connected yet.**
Until one is, `src/scripts/contact.js` degrades gracefully:

- If `BUSINESS.email` is set → the form opens a pre-filled email draft (`mailto:`).
- Otherwise → it points visitors to the Calendly booking link.

**To make submissions deliver to an inbox,** pick one service and set the form’s
`action` in `src/components/Contact.astro` (a comment there lists the options):

- **Formspree** – `<form action="https://formspree.io/f/XXXX" method="POST">`
- **Web3Forms / Basin** – similar single-URL POST endpoint
- **EdgeOne Pages Function** – host a small serverless handler

No API keys are committed anywhere; add them only in the chosen service’s dashboard.

---

## Testing & deploying changes

1. `npm run dev` and check your change in the browser (resize to test mobile).
2. `npm run build` — must finish with **0 errors** (it runs type-checking too).
3. Commit to Git and push. If GitHub → EdgeOne auto-deploy is set up, the site
   redeploys automatically. Otherwise upload `./dist` (see **[DEPLOYMENT.md](./DEPLOYMENT.md)**).

> ⚠️ Do **not** commit secrets or `.env` files (already git-ignored). Do **not**
> change production DNS/email records as part of a normal content update.

---

## Notes for the next developer

- Design system (colors, type scale, spacing) is all in `src/styles/global.css`
  via CSS variables at the top (`:root`).
- Responsive breakpoints: 1080px, 760px, 440px (bottom of `global.css`).
- Animations respect `prefers-reduced-motion`.
- The original single-file site was recovered to `current-site.html` (git-ignored)
  purely as a reference snapshot; it is not used by the build.
