# Deployment Guide — Frogs Videography

Every page is a **static build** (plain HTML/CSS/JS in `./dist`). The one
exception is the **contact-form backend** (`/api/contact` + `/admin`), which needs
a host that runs server code. That host is **Netlify**: see
[Netlify setup (backend)](#netlify-setup-backend).

- EdgeOne preview (static pages only; form submissions aren't stored there): **https://frogsvideo.edgeone.dev**
- Production domain (target, not yet connected): **https://www.frogsvideography.com**

> 🛑 **Read the [Email safety](#8-how-to-avoid-disrupting-business-email) section
> before touching DNS.** Changing website DNS incorrectly can silently break the
> company’s email. The old Squarespace site and account should be left running
> until the new site is verified live.

---

## Build settings (EdgeOne Pages)

| Setting            | Value           |
| ------------------ | --------------- |
| Framework preset   | Astro / Static  |
| Install command    | `npm install`   |
| Build command      | `npm run build` |
| Output directory   | `dist`          |
| Node version       | 20 (see `.nvmrc`) |

---

## Netlify setup (backend)

Netlify reads `netlify.toml` (build command `npm run build`, publish `dist`) and
`.nvmrc` (Node 20). The Astro Netlify adapter turns `/api/contact` and `/admin`
into a Netlify Function automatically. There's nothing else to configure.

1. **Create the site.** Netlify → *Add new site* → *Import an existing project*
   → pick this GitHub repo. Accept the detected settings.
2. **Create a Postgres database.** Either:
   - [Neon](https://neon.tech) (free tier): create a project and copy its
     **pooled** connection string (host contains `-pooler`), **or**
   - Netlify DB: enable it for the site. Netlify then sets `NETLIFY_DATABASE_URL`
     for you, so skip `DATABASE_URL` below.
3. **Create the table** once, from your machine:
   ```bash
   DATABASE_URL='postgres://…' npm run db:setup
   ```
4. **Generate the secrets** locally:
   ```bash
   npm run -s secrets:key        # DATA_ENCRYPTION_KEY=…   (do this ONCE, keep a copy)
   npm run -s secrets:password   # ADMIN_PASSWORD_HASH=…   (prompts for the password)
   ```
5. **Add environment variables** in Netlify → *Site configuration* → *Environment
   variables*: `DATABASE_URL` (unless using Netlify DB), `DATA_ENCRYPTION_KEY`,
   `ADMIN_PASSWORD_HASH`. Mark them as secret. Then **redeploy** (*Deploys* →
   *Trigger deploy*) so the function picks them up.
6. **Verify:** submit the contact form on the Netlify URL, then sign in at
   `https://<site>.netlify.app/admin`. The inquiry should be listed. If it isn't,
   check *Logs* → *Functions* for `[api/contact]` errors.

> 🔐 Store `DATA_ENCRYPTION_KEY` in a password manager too. Netlify keeps it, but
> if it's ever deleted or changed, stored inquiries can't be decrypted.

**Custom domain on Netlify:** follow sections 4–6 below, but in Netlify →
*Domain management* instead of the EdgeOne console. Netlify shows the DNS
targets and provisions HTTPS (Let's Encrypt) automatically. The email-safety
rules in section 8 apply unchanged.

---

## 1. How to run the site locally

```bash
npm install     # first time only
npm run dev     # → http://localhost:4321  (hot reload)
```

## 2. How to build it

```bash
npm run build   # runs `astro check` (type-check) then outputs static files to ./dist
npm run preview # optional: serve ./dist locally to verify the production build
```

A successful build ends with `Complete!` and generates `dist/`, including
`sitemap-index.xml`, `robots.txt`, and the favicon set.

## 3. How to deploy updates

**Option A — Git auto-deploy (recommended).**
Connect this repository to EdgeOne Pages once (EdgeOne Console → Pages → *New
project* → import from GitHub). After that, every push to the production branch
triggers an automatic build + deploy using the [build settings](#build-settings-edgeone-pages)
above. This is the intended long-term workflow (see also `.github/workflows/ci.yml`,
which build-checks every push/PR before it ships).

**Option B — CLI / manual upload.**
Build locally (`npm run build`) and upload the contents of `./dist`:

```bash
npm install -g edgeone         # Tencent EdgeOne CLI (one time)
edgeone pages deploy ./dist    # follow prompts to auth + pick the project
```

Or drag-and-drop the `dist` folder in the EdgeOne Pages dashboard.

## 4. How to connect frogsvideography.com

The domain is currently used by the existing **Squarespace** site. Do this only
when you’re ready to switch the website over (email is unaffected if you follow
step 8).

1. In **EdgeOne Console → Pages → (this project) → Custom domains**, add both:
   - `www.frogsvideography.com`
   - `frogsvideography.com` (apex/root)
2. EdgeOne will show you the exact DNS target(s) to create (a CNAME hostname
   and/or an A record IP). **Use the values EdgeOne shows you** — they are
   authoritative over the examples below.
3. Create those records at wherever DNS is managed for the domain (the registrar,
   or Squarespace if DNS is hosted there). See step 5.
4. Set the site’s canonical/root domain. This project already declares
   `https://www.frogsvideography.com` as canonical (`src/config/site.ts` →
   `SITE.url`); if you prefer the apex (`frogsvideography.com`) as primary, change
   that value, rebuild, and set the redirect direction accordingly in EdgeOne.
5. Wait for DNS to propagate (minutes–48 h) and for EdgeOne to issue the TLS cert.

## 5. Which DNS records will likely be required

Only the **website** records change. Typical setup (confirm exact values in the
EdgeOne console):

| Host / Name | Type  | Value (example — use EdgeOne’s actual value) | Purpose            |
| ----------- | ----- | -------------------------------------------- | ------------------ |
| `www`       | CNAME | `<your-project>.edgeone.dev` (as shown)      | www → EdgeOne      |
| `@` (apex)  | A / ALIAS | EdgeOne-provided IP, **or** CNAME-flattening/ALIAS to the EdgeOne host | root → EdgeOne |

Notes:
- Many DNS providers don’t allow a plain `CNAME` on the apex (`@`); use the
  provider’s **ALIAS / ANAME / CNAME-flattening** record, or the **A record IP**
  EdgeOne provides.
- **Remove the old Squarespace website A/CNAME records** for `@` and `www` when you
  add the new ones — but **only those web records**. Do not touch anything else.
- If DNS is currently hosted at Squarespace, you may first need to move DNS to the
  registrar (or keep it at Squarespace and just edit the two web records). Editing
  in place is lower-risk than moving nameservers.

## 6. How to verify HTTPS

1. After adding the custom domain, EdgeOne auto-provisions a TLS certificate
   (can take a few minutes to a few hours).
2. Visit `https://www.frogsvideography.com` and `https://frogsvideography.com` —
   both should load with a valid padlock and **no certificate warning**.
3. Confirm HTTP redirects to HTTPS (enable “Force HTTPS” in EdgeOne if available).
4. Quick checks:
   ```bash
   curl -sI https://www.frogsvideography.com | grep -i 'HTTP/\|location\|strict-transport'
   ```
   Expect a `200` (or a `301` www↔apex redirect) and ideally an HSTS header.
5. Re-test Open Graph/preview with the live URL (e.g. social share debuggers) once
   the domain resolves.

## 7. How to roll back

- **Instant:** EdgeOne Pages keeps previous deployments. In the dashboard, open
  **Deployments**, find the last good build, and **Promote / Roll back** to it.
- **Via Git:** `git revert <bad-commit>` and push — the auto-deploy rebuilds the
  previous state. (`git revert` is safer than force-pushing.)
- **Full fallback:** because the **Squarespace site and DNS are left intact until
  you’re confident**, you can revert the two web DNS records back to Squarespace’s
  values to restore the old site while you investigate. Keep a copy of the original
  Squarespace DNS values before changing anything.

## 8. How to avoid disrupting business email

> ⚠️ **Website DNS and email DNS are different records on the same domain.**
> Pointing the website at EdgeOne means editing **only** the `@` and `www` records
> (types `A` / `CNAME` / `ALIAS`). Everything below controls **email** and must be
> **left exactly as-is**:

- **MX** records — route incoming mail to the mail provider. **Do not delete/edit.**
- **SPF** — a `TXT` record starting with `v=spf1 …`. **Do not delete/edit.**
- **DKIM** — `TXT`/`CNAME` records on selectors like `selector._domainkey`. **Keep.**
- **DMARC** — a `TXT` record at `_dmarc`. **Keep.**
- Any other mail-related records (e.g. `autodiscover`, `_domainconnect`). **Keep.**

**Before changing any DNS:** export or screenshot the current full DNS zone so you
have the exact existing MX/SPF/DKIM/DMARC values. After the website cutover, send a
test email **to** and **from** a company address to confirm mail still flows.

If email is currently handled by Squarespace/Google Workspace/etc., those MX + TXT
records must survive the migration untouched. Deleting them will stop mail delivery.

---

## Guardrails (per project brief)

- ❌ Do **not** make the site live on `frogsvideography.com` until it’s reviewed and approved.
- ❌ Do **not** cancel or delete the Squarespace account or site yet.
- ❌ Do **not** alter MX / SPF / DKIM / DMARC or other email DNS records.
- ❌ Do **not** commit secrets or `.env` files.
- ✅ Keep the EdgeOne preview deployment working throughout.
