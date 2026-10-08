# E-Cell RSCOE — Local Site Recreation

Local recreation of https://www.ecellrscoe.org/ built from the authorized Firecrawl crawl
(`../rscoe-ecell-reference/`). Source code for the original project was not used.

## Run locally

```bash
npm install        # first time only
npm start          # serves on http://localhost:4173
```

The dev server emulates the site's client-side routing: any unknown path returns
`index.html`, so routes like `/about`, `/events`, `/team`, `/gallery`, `/contact`,
`/e-summit`, `/e-summit/agenda`, `/e-summit/register`, `/blogdetails` work directly.

## Verify against the live site

```bash
npm run compare
```

Uses Playwright (system Chromium) to screenshot every route on the live site and the
local server, then pixel-diffs them into `shots/diff/` and prints a report.

Latest results (1440px viewport, full page):

| Route | Diff |
|---|---|
| / | 0.00% |
| /about | 0.00% |
| /events | 0.00% |
| /team | 0.12% |
| /gallery | ~22% (marquee animation timing — images/layout identical, row offset differs) |
| /contact | 0.00% |
| /e-summit | 0.00% |
| /e-summit/agenda | 0.00% |
| /e-summit/register | 0.00% |
| /blogdetails | 0.00% |

## Structure

- `index.html` — page shell
- `assets/` — CSS, JS bundle, images, logos, favicon (from the crawl)
- `team/` — team member photos served at `/team/<name>` (referenced by the app)
- `serve.js` — static server with SPA fallback
- `compare.js` — screenshot + pixel-diff verification
- `shots/` — live/local screenshots and diffs

## Content & assets

All text, imagery, logos, and styles come from the crawl in
`../rscoe-ecell-reference/` (`pages/*.md` for text, `assets/` for media,
`manifest.md` for the asset→page→URL map, `SITE_MAP.md`, `BRAND.md`, `CRAWL_NOTES.md`).
No content was invented.

## Known differences / not reproducible

- **Gallery marquee**: the gallery strip is an auto-scrolling animation; the horizontal
  offset at screenshot time differs run-to-run. Content, images, and layout are identical.
- **Team page (0.12%)**: minor sub-pixel differences in avatar rendering/scroll position.
- **Register / forms**: front-end renders identically; any real form submission backend
  is not part of the static rebuild and is not contacted.
- **External links** (Instagram, LinkedIn, WhatsApp, mailto/tel) open the live third-party
  sites; they are not mirrored.
- Original build tooling (Vite/React source) was not accessed; this recreation serves the
  production bundle from the crawl until the original source is available.
