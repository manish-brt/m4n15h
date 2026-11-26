# Portfolio — static site

Plain HTML/CSS/JS, no build step. Everything is self-hosted (fonts, Lenis 1.1.13, icons) — no third-party requests, strict CSP.

## Run locally
```bash
python3 -m http.server 5280 --directory site
```

## Deploy
- **GitHub Pages** (current URL `https://manish-brt.github.io/m4n15h/`): publish the contents of `site/`.
  The chat uses its built-in resume engine there (no server needed).
- **Vercel** (optional, adds the Claude-powered chat): import the repo with `site` as the root directory and set
  `ANTHROPIC_API_KEY` in Project → Settings → Environment Variables. `api/chat.js` becomes `/api/chat`
  and the widget uses it automatically; if it fails, the widget falls back to the built-in engine.
  If the domain changes, update the canonical/OG URLs in `index.html`, `robots.txt` and `sitemap.xml`.

## Content
All content comes from the resume. Links in the page were checked on 2026-11-26. Store listings that
returned 404 (Univox, Let's Laundry, Pashuchikitsa, Carzeva, Spark Educorp) are listed without links.
