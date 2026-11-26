# Portfolio — static site

Plain HTML/CSS/JS, no build step. Everything is self-hosted (fonts, Lenis 1.1.13, icons) — no third-party requests, strict CSP.

## Run locally
```bash
python3 -m http.server 5280 --directory site
```

## Deploy (automatic)
Push to `main`. Both hosts redeploy on their own when anything in `site/` changes.

- **GitHub Pages** — https://manish-brt.github.io/m4n15h/
  `.github/workflows/pages.yml` copies `site/` (minus server-only files) to the `gh-pages` branch.
  The chat uses its built-in resume engine there.
- **Vercel** — https://manishagrawal.vercel.app
  Git-connected project `manish-agrawal-portfolio`, Root Directory `site`, production branch `main`.
  Other branches get preview URLs; pushes that don't touch `site/` are skipped (`ignoreCommand`).
  Set `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables to switch the chat to Claude
  (`api/chat.js` → `/api/chat`); without it the widget falls back to the built-in engine.

Manual fallback: `npx vercel deploy --prod` from `site/`, or run the Pages workflow from the Actions tab.
If the domain changes, update the canonical/OG URLs in `index.html`, `robots.txt` and `sitemap.xml`.

## Content
All content comes from the resume. Links in the page were checked on 2026-11-26. Store listings that
returned 404 (Univox, Let's Laundry, Pashuchikitsa, Carzeva, Spark Educorp) are listed without links.
