# Minerva Site Deployment Guide

## Overview

Minerva Holding B.V. website built with Astro 5 (static output) + Directus CMS (shared with Belinus) + Cloudflare Pages.

**Build:** 16 pages in ~11s

## Directus Setup

The Minerva site shares Directus with Belinus at `https://directus.belinus.net`.

### Required Collections

Run the setup script to create Minerva-specific collections:

```bash
cd minerva-site
DIRECTUS_URL=https://directus.belinus.net DIRECTUS_TOKEN=<admin-token> node scripts/setup-directus.js
```

**Or create these collections manually in Directus Data Studio:**

| Collection | Purpose |
|---|---|
| `pages` | Main content pages with translations |
| `site_settings` | Singleton for nav, footer, GDPR text |
| `product_reveals` | Aegis & Sovereign countdown data |
| `news_articles` | News items with translations |
| `team_vacancies` | Job listings with translations |
| `history_events` | Timeline events (1897-2027) |
| `gallery_images` | Page images via Directus Files |
| `legal_documents` | Privacy/Terms content with translations |
| `gdpr_consents` | Server-side consent logging |

### Access Policy

Set **Public** read access on all Minerva collections in:
**Settings → Access Policies → Public**

## Cloudflare Pages Deployment

### 1. Connect Repository

1. Push to GitHub: `git init && git add . && git commit -m "Minerva site" && git remote add origin https://github.com/yourusername/minerva-site.git`
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git

### 2. Build Settings

| Setting | Value |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js version | `20.x` |

### 3. Environment Variables

```
DIRECTUS_URL = https://directus.belinus.net
```

### 4. Auto-Rebuild on Content Change

1. Cloudflare Pages → Project → Settings → Deploy hooks → Create hook
2. Copy the deploy hook URL
3. Directus Data Studio → Settings → Flows → Create flow
   - Trigger: Item create/update/delete on `pages`, `news_articles`, `product_reveals`
   - Action: HTTP POST to deploy hook URL

## Project Structure

```
minerva-site/
├── src/
│   ├── components/
│   │   ├── CountdownTimer.astro  # Client-side countdown
│   │   ├── Footer.astro          # Directus-powered footer
│   │   ├── GalleryImage.astro     # Directus image with transforms
│   │   ├── GdprBanner.astro      # Cookie consent
│   │   └── Nav.astro             # Directus-powered nav
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   └── directus.ts           # Unified CMS client
│   └── pages/
│       ├── index.astro           # /
│       ├── [slug].astro          # /about, /history, etc.
│       ├── aegis.astro          # /aegis
│       ├── sovereign.astro        # /sovereign
│       ├── history.astro          # /history (Directus events)
│       ├── news.astro            # /news (Directus articles)
│       ├── team.astro            # /team (Directus vacancies)
│       ├── login.astro
│       ├── privacy.astro
│       ├── terms.astro
│       ├── api/consent.ts        # GDPR logging
│       ├── api/subscribe.ts      # Newsletter
│       ├── api/register.ts       # Interest form
│       └── [lang]/
│           ├── index.astro        # /nl, /fr, /de, etc.
│           └── [slug].astro       # Localized pages
├── public/
│   ├── assets/                   # minerva.css, minerva.js
│   └── uploads/                  # Static images
├── scripts/
│   └── setup-directus.js
├── astro.config.mjs
└── DEPLOYMENT.md
```

## Pages Built

| Route | Description |
|---|---|
| `/` | Homepage |
| `/about` | About (from Directus) |
| `/history` | Timeline (from Directus) |
| `/aegis` | Countdown page |
| `/sovereign` | Countdown page |
| `/news` | News listing |
| `/team` | Careers/vacancies |
| `/login` | Login form |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/nl`, `/fr`, `/de`, `/it`, `/es`, `/zh`, `/ja` | Localized homepages |
| `/nl/[slug]`, etc. | Localized pages |

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/consent` | POST | Log GDPR consent |
| `/api/subscribe` | POST | Newsletter signup |
| `/api/register` | POST | Register interest |

## Troubleshooting

**Build fails with `locales is not defined`:**
- Ensure `locales` array is inside `getStaticPaths()` function, not at module scope

**Content not loading from Directus:**
- Verify `DIRECTUS_URL` is correct and accessible
- Check CORS settings in Directus allow your Cloudflare domain
- Ensure Public read access is enabled on collections

**Images not displaying:**
- Upload images to Directus Files module
- Populate `gallery_images` collection with file IDs and `page_slug`
