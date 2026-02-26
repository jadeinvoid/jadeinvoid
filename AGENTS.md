# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-26
**Commit:** 377a10d
**Branch:** master

## OVERVIEW

Static HTML/CSS/JS portfolio for Jade (jadeinvoid). Single-file architecture — all markup, styles, and scripts live in `index.html` (2299 lines). TUI (terminal UI) aesthetic with Korean Obangsaek color palette. Figma-driven content sync workflow.

## STRUCTURE

```
MUIjade/
├── index.html                      # THE file — all HTML/CSS/JS (2299 lines)
├── sync-from-figma.js              # Node.js: Figma MCP → HTML content sync (411 lines)
├── figma-content-spec.md           # Figma component naming rules
├── README-figma-workflow.md        # Figma sync workflow docs (Korean)
├── SESSION_LOG.md                  # Dev log, CSS var reference, TODOs
├── wireframe.html                  # Original layout reference (READ-ONLY)
├── portfolio-prototype.html        # Legacy prototype (Figma sync target)
├── portfolio-prototype (8).html    # Korean-themed variant/backup
├── Logo.png                        # Site logo
├── work_design/                    # Design portfolio images
├── work_illustration/              # Illustration portfolio images
└── work_others/                    # (empty)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Change any visible content | `index.html` | Or use Figma sync workflow |
| Edit styles/layout | `index.html` lines 7–1266 | CSS block with custom properties |
| Edit interactions/JS | `index.html` lines 1628–2297 | Tag filtering, cursor, ASCII canvas |
| Sync content from Figma | `sync-from-figma.js` | `node sync-from-figma.js [--section X] [--dry-run]` |
| Figma component naming | `figma-content-spec.md` | Path-style: `section/element` |
| CSS variable reference | `SESSION_LOG.md` lines 274–282 | Quick restart values |
| Original layout intent | `wireframe.html` | Read-only reference |

## CONVENTIONS

### File Naming
- HTML/JS: `kebab-case` — `sync-from-figma.js`
- Asset dirs: `snake_case` — `work_design/`, `work_illustration/`
- Docs: `SCREAMING_SNAKE_CASE.md` or `kebab-case.md`

### CSS
- Variables: `--{category}-{name}` — `--color-background`, `--spacing-md`
- Classes: `kebab-case`, BEM-like — `.hero-art-card`, `.tag-group.visible`
- Responsive: `clamp()` everywhere — no fixed pixel values for sizing
- Spacing: 8px base unit (`--spacing-unit: 8px`)
- Colors: Korean names for category colors — `--cheong` (blue), `--jeok` (red), `--hwang` (yellow), `--ink` (black)

### JS (inline in index.html)
- Single quotes, semicolons required, 2-space indent
- `camelCase` variables, `SCREAMING_SNAKE_CASE` constants
- Function declarations (not arrow) for main logic

### Figma Component Naming
- Path-style hierarchy: `nav/site-name`, `works/card-001/title`
- 3-digit zero-padded indexes: `card-001`, `card-002`
- Slash `/` separator, `kebab-case` segments

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT add external CSS/JS files** — single-file architecture is intentional
- **DO NOT use fixed pixel values for layout** — use `clamp()` for responsive scaling
- **DO NOT edit `wireframe.html`** — read-only reference
- **DO NOT modify Figma Components/Tokens frames** — only edit "Content" frame
- **DO NOT skip Component wrapping in Figma** — text MUST be wrapped in Components (Ctrl+Alt+K) or layer names auto-sync to text content, breaking the sync script
- **Cursor: `cursor: none !important`** on all elements — custom ASCII cursor (`▸`) handles pointer display

## UNIQUE STYLES

### TUI Aesthetic
- Monospace font throughout (`geist/font/mono`)
- Bracketed navigation: `[Projects]`, `[About]`, `[Contact]`
- Terminal-style window frames with "traffic light" dots
- ASCII art in hero cards

### Obangsaek Color System (Korean traditional)
| Name | CSS Var | Hex | Use |
|------|---------|-----|-----|
| Primary text | `--color-text-primary` | `#e8fec5` | Headings, links |
| Secondary text | `--color-text-secondary` | `#a8d486` | Body, muted |
| Background | `--color-background` | `#066bc3` | Page bg |
| Accent | `--color-accent-2` | `#ffd700` | Highlights |
| Border | `--color-border` | `rgba(232,254,197,0.3)` | Grid lines |

### Interactive Features
- Custom cursor with trail effect (desktop only)
- Tag filtering with keyboard shortcuts `[1]` `[2]` `[3]`
- Hero card FLIP expansion animation
- ASCII canvas drawing in About section (mouse-driven, fading squares)
- First-visit hint toast via `localStorage`

## COMMANDS

```bash
# Content sync from Figma
node sync-from-figma.js                    # Full sync
node sync-from-figma.js --section nav      # Partial sync
node sync-from-figma.js --dry-run          # Preview only

# No build step — open index.html directly
# No package.json, no npm, no test runner
```

## NOTES

- **Git remote**: `https://github.com/jadeinvoid/jadeinvoid.git` (GitHub Pages likely)
- **No build system** — no bundler, no package.json, no CI/CD
- **No test infrastructure** — all testing is manual browser verification
- **Figma file key**: `EiHpsaOmcMFDSIRTV1qCY1` (hardcoded in sync script)
- **Figma connection**: Primary via Claude MCP, fallback via `FIGMA_TOKEN` env var
- **index.html sections**: `#works`, `#about`, `#contact` (anchor-based SPA navigation)
- **Data attributes for filtering**: `data-tags` on `<article>`, `data-group` on `.tag-group`, `data-tag` on `.tag-btn`
- **8 TODOs remain** — placeholder content in cards, contact, footer; mobile nav and performance untested (see `SESSION_LOG.md` lines 249–257)
