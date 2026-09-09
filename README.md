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

The production build is written to `dist/`. Client-side routes fall back to `index.html` through the generated `_redirects` file.
