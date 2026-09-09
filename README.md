# Jade Cho Portfolio

The production portfolio for [choja.design](https://choja.design), built with React and Vite.

The authoring Studio and source asset library live in [choja-asset-motion-sandbox](https://github.com/jadeinvoid/choja-asset-motion-sandbox). Studio exports a versioned release into this repository; the public app reads only the checked-in release in `src/site/publishedRelease.json` and the curated assets in `public/`.

## Development

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm test
npm run build
```

The production build is written to `dist/`. Client-side navigation routes fall back to `index.html` through Cloudflare's native single-page application routing.

## Cloudflare deployment

`choja.design` uses the existing `jadeinvoid` Workers Static Assets deployment. Run `npm run deploy` with an authenticated Wrangler session to build and publish it.

The build losslessly recompresses legacy PNGs, preserves the published content-hashed assets, and includes Cloudflare `_headers` rules for year-long immutable caching of hashed JavaScript, CSS, and published media. HTML and unversioned assets retain Cloudflare's default revalidation policy. The same `dist/` asset output is compatible with Cloudflare Pages.
