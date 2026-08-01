# 4K IPTV — Premium SEO Website

A production-ready, multilingual (EN / FR / BR), SEO-first static website for a premium 4K IPTV service.
Built with semantic HTML5, a custom dark design system (CSS), and vanilla JavaScript — no build step, no dependencies.
All links are relative, so it works both when you double-click `index.html` locally and when deployed to a web host.

## What's included

- **44 HTML pages** — English (primary), French (`/fr/`) and Brazilian Portuguese (`/br/`), fully localized (metadata, headings, URLs, structured data, FAQ, content — not machine-translated).
- **13 English SEO landing pages** — `/4k-iptv/`, `/iptv-4k/`, `/iptv-with-4k/`, `/4k-iptv-app/`, `/4k-iptv-provider/`, `/best-4k-iptv/`, `/4k-firestick/`, `/4k-smart-tv/`, `/4k-android-tv/`, `/4k-apple-tv/`, `/4k-mag-box/`, `/4k-channels/`, plus core pages (pricing, devices, channels, 4K content, FAQ, contact).
- **French landing pages** — `/fr/4k-iptv/`, `/fr/iptv-4k/`, `/fr/iptv-avec-4k/`, `/fr/abonnement-iptv-4k/`, `/fr/boitier-iptv-4k/`, `/fr/acheter-iptv-4k/`, `/fr/contact/`.
- **Brazilian Portuguese landing pages** — `/br/4k-iptv/`, `/br/iptv-4k/`, `/br/iptv-com-4k/`, `/br/aplicativo-iptv-4k/`, `/br/assinar-iptv/`, `/br/teste-iptv/`, `/br/melhor-iptv-4k/`, `/br/contato/`.
- **Blog** — index + 6 long-tail SEO articles.
- **Trending films strip** on each homepage, powered by the TMDb API (see below).
- **SEO infrastructure** — `sitemap.xml` (with hreflang), `robots.txt`, `site.webmanifest`, custom `404.html`.

## SEO features (on every page)

Semantic HTML5 · unique title/description/keywords · canonical URLs · hreflang alternates (en / fr / pt-BR / x-default) · Open Graph + Twitter Cards · JSON-LD (Organization, Product, Service, FAQPage, BreadcrumbList, BlogPosting, WebSite) · breadcrumbs · lazy-loaded images · preconnect/preload fonts · deferred JS · single CSS file — Core-Web-Vitals friendly.

## ⚠️ Before you launch — replace the placeholders

| Placeholder | Where | Replace with |
|---|---|---|
| `https://4k-iptv.online` | canonical URLs, sitemap, JSON-LD, OG tags | your real domain |
| `15550000000` | every WhatsApp CTA (`wa.me/…`) | your WhatsApp number (digits only, incl. country code) |
| `support@4k-iptv.online` | contact pages, footer, JSON-LD | your support email |
| `t.me/get4kiptv` / `twitter.com/get4kiptv` | footer + contact | your social links |
| `eb88f8554c5c594b1b82a59672ee98f4` | `assets/js/main.js` (TMDb key) | your own TMDb key (optional) |

Fastest method: a global find-and-replace across the folder (e.g. in VS Code) for each value.
Prices are standard tiers ($14.99 / $29.99 / $44.99 / $64.99) — edit them in the pricing sections if needed.

## Trending films strip (TMDb)

Each homepage (EN / FR / BR) shows a "Trending movies now in 4K" strip that pulls live posters from
The Movie Database (TMDb) using the key in `assets/js/main.js`. It fetches in the visitor's browser on
page load, localized per language. If the request fails (offline preview or rate limit), tasteful
fallback cards are shown instead, so the section is never empty. Because this is a static site, the TMDb
key is visible in the client JavaScript — that's normal and safe for TMDb's read-only public data, but you
can swap in your own key. (The key provided is a **TMDb** key; IMDb has no equivalent public API.)

## Deploy to Vercel

A `vercel.json` is included (trailing-slash URLs to match canonicals, long-lived asset caching, security headers; your `404.html` is served automatically). Two ways:

1. **Drag & drop** — install the CLI (`npm i -g vercel`), then from this folder run `vercel --prod`. Point it at your `4k-iptv.online` domain in the Vercel dashboard.
2. **Git** — push this folder to a GitHub repo and "Import Project" in Vercel. Framework preset: **Other** (no build command, output directory `.`).

No build step is required — it's a static site.

## Deploy anywhere else

Static site — host it anywhere: **Netlify / Vercel / Cloudflare Pages** (drag-and-drop the folder),
any web host / VPS (upload to your web root), or **GitHub Pages**. No server or database required.

## After launch

1. Add the site to **Google Search Console** and submit `sitemap.xml`.
2. Verify the OG image (`/assets/img/og-cover.png`) with the Facebook & Twitter debuggers.
3. Confirm the films strip loads live posters once the site is online.
