# Frogs Videography — Website

Marketing site for **Frogs Videography**, a Massachusetts & Rhode Island video
production company. Built with [Astro](https://astro.build). Every page is
pre-rendered to **static HTML/CSS/JS**, so it stays fast and cheap to host. The
only server code is a small **contact-form backend**: inquiries are encrypted and
stored in Postgres, and owners read them at `/admin`. It runs as a Netlify
Function (see [Contact form & backend](#contact-form--backend)).

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

Requires **Node 22.23.4+** (Node 24 recommended — see `.nvmrc`).

### All scripts

| Command          | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `npm run dev`    | Dev server with hot reload                              |
| `npm run build`  | `astro check` (type-check) **then** build to `./dist`   |
| `npm run preview`| Serve the built `./dist` locally (static pages; uses `vite preview`, since the Netlify adapter doesn't support `astro preview`) |
| `npm run check`  | Type-check only                                         |
| `npm run lint`   | ESLint over `.js` / `.mjs` / `.ts` / `.astro` (`eslint.config.js`) |
| `npm run format` | Prettier auto-format                                    |
| `npm run db:setup` | Create/update the `inquiries` table in Postgres (safe to re-run) |
| `npm run secrets:key` | Generate `DATA_ENCRYPTION_KEY` (**once**; keep a copy)   |
| `npm run secrets:password` | Hash a new `/admin` password → `ADMIN_PASSWORD_HASH` |

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
│  │  └─ contact.js        # contact-form handling (see “Contact form & backend”)
│  ├─ lib/                 # server-only backend code
│  │  ├─ crypto.ts         # field encryption, keyed hashes, admin password + sessions
│  │  ├─ db.ts             # Postgres connection
│  │  └─ inquiries.ts      # validate / save / list inquiries
│  ├─ styles/
│  │  └─ global.css        # the full design system / all styling
│  └─ pages/
│     ├─ index.astro       # assembles the homepage from the sections above
│     ├─ api/contact.ts    # POST /api/contact — stores an inquiry (server route)
│     └─ admin.astro       # /admin — password-protected inquiry inbox (server route)
├─ db/schema.sql           # the inquiries table
├─ scripts/                # db-setup.mjs, secrets.mjs (see “All scripts”)
├─ .env.example            # the backend's environment variables
├─ netlify.toml            # Netlify build settings
├─ astro.config.mjs        # Astro + Netlify adapter + sitemap + env-var schema
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

## Contact form & backend

When a visitor submits the contact form, `src/scripts/contact.js`:

1. **Saves the inquiry** in the background: `POST /api/contact` encrypts it and
   stores it in Postgres.
2. **Then does exactly what it always did.** If `BUSINESS.email` is set, it opens
   a pre-filled email draft (`mailto:`). Otherwise it points visitors to the
   Calendly booking link.

Step 1 never blocks or changes step 2. If the backend is down or not configured,
or the site is served from a static-only host such as the EdgeOne preview,
visitors see no difference. The submission just isn't stored.

Owners read inquiries at **`/admin`** (password-protected, newest first, with a
note when the same person has written more than once).

### What's stored, and how it's kept private

| Data | Stored as |
| ---- | --------- |
| Name, email, organization, message | **Encrypted** (AES-256-GCM) before it reaches the database |
| Project type, timestamp | Plain text (fixed options; used for sorting) |
| Email, visitor IP | **Keyed hash only** (HMAC-SHA256), used to spot repeat senders and rate-limit spam. The IP is never stored readably |
| Admin password | Never stored. Only a scrypt hash, in an environment variable |

Someone with a copy of the database or a backup sees only ciphertext. Decryption
happens only on `/admin`, using `DATA_ENCRYPTION_KEY`, which lives in Netlify's
environment variables and never in the database or the repo.

Spam protection: a hidden "honeypot" field, server-side validation that mirrors
the form's rules, and a limit of 5 submissions per IP per hour.

> ⚠️ **Back up `DATA_ENCRYPTION_KEY`** (e.g. in a password manager). If it's lost
> or replaced, inquiries already stored can never be decrypted.

### Environment variables

| Variable | Where it comes from |
| -------- | ------------------- |
| `DATABASE_URL` | Your Postgres provider (e.g. [Neon](https://neon.tech), free tier). If you use Netlify DB instead, it sets `NETLIFY_DATABASE_URL` automatically and that works too |
| `DATA_ENCRYPTION_KEY` | `npm run secrets:key`, generated **once** |
| `ADMIN_PASSWORD_HASH` | `npm run secrets:password` (prompts for the password and prints its hash) |

All three are server-only secrets (declared in `astro.config.mjs` → `env.schema`)
and are never sent to the browser. See [DEPLOYMENT.md](./DEPLOYMENT.md#netlify-setup-backend)
for production setup.

### Running the backend locally

```bash
cp .env.example .env          # then fill in the three values:
npm run -s secrets:key        #   → paste DATA_ENCRYPTION_KEY=… into .env
npm run -s secrets:password   #   → paste ADMIN_PASSWORD_HASH=… into .env
createdb frogs_inquiries      #   any local Postgres works; set DATABASE_URL to match
npm run db:setup              # creates the inquiries table
npm run dev                   # form → saved; inquiries at http://localhost:4321/admin
```

**To change the admin password:** run `npm run secrets:password` and replace
`ADMIN_PASSWORD_HASH` in Netlify. Everyone signed in is signed out.

**Retention:** there's no automatic deletion. Agree with the business how long
to keep inquiries, and mention the form's data storage in the site's privacy
policy.

---

## Testing & deploying changes

1. `npm run dev` and check your change in the browser (resize to test mobile).
2. `npm run build` — must finish with **0 errors** (it runs type-checking too).
3. Commit to Git and push. If GitHub → Netlify (or EdgeOne) auto-deploy is set
   up, the site redeploys automatically (see **[DEPLOYMENT.md](./DEPLOYMENT.md)**).
   Only Netlify runs the contact-form backend; a static-only host serves the
   pages, but submissions aren't stored there.

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
