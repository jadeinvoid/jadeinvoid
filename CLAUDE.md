# CLAUDE.md — AI Assistant Guide for jadeinvoid Portfolio

**Last updated:** 2026-03-02
**Branch:** `claude/claude-md-mm9kzhxrytfgxsbd-khyqO`

---

## Project Overview

Single-file static HTML portfolio for Jade (jadeinvoid). TUI (terminal UI) aesthetic with Korean Obangsaek color palette and Figma-driven content sync. **All markup, styles, and scripts live in `index.html`** (≈3457 lines). No build system, no package manager, no CI/CD.

---

## Repository Structure

```
jadeinvoid/
├── index.html                      # THE file — all HTML/CSS/JS
├── sync-from-figma.js              # Node.js: Figma → HTML content sync
├── fonts/                          # GeistMono WOFF2 (self-hosted)
├── work_design/                    # Design portfolio images
├── work_illustration/              # Illustration portfolio images
├── Logo.png                        # 32×32 site logo
├── AGENTS.md                       # Project knowledge base (older snapshot)
├── SESSION_LOG.md                  # Dev log, CSS var reference, TODOs
├── design-critique.md              # UX/design feedback (Interface Craft)
├── figma-content-spec.md           # Figma component naming spec (Korean)
├── README-figma-workflow.md        # Figma sync workflow guide (Korean)
├── .sisyphus/                      # Agent task planning system
│   ├── boulder.json                # Active plan tracker
│   ├── plans/                      # Task plans (.md)
│   ├── evidence/                   # QA screenshots/logs
│   ├── drafts/                     # WIP notes
│   └── notepads/                   # Session notes
└── .claude/                        # Claude Code config
```

### index.html Internal Sections

| Line Range | Content |
|------------|---------|
| 7–1728 | `<style>` block — all CSS |
| 22–111 | Reset & base styles |
| 163–246 | Navigation |
| 267–499 | Hero section styles |
| 500–1700 | Works, modals, about, contact styles |
| 1700–1728 | Media queries (`@media max-width: 768px`) |
| 1730–2350 | `<body>` markup |
| 2352–3457 | `<script>` block — all JavaScript |

---

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Change any visible content | `index.html` body | Or use Figma sync |
| Edit styles/layout | `index.html` lines 7–1728 | CSS block |
| Edit JS interactions | `index.html` lines 2352–3457 | Script block |
| Sync content from Figma | `sync-from-figma.js` | `node sync-from-figma.js` |
| Figma component naming rules | `figma-content-spec.md` | Korean, path-style |
| CSS variable quick reference | `SESSION_LOG.md` lines 274–283 | Root vars |
| Outstanding TODOs | `SESSION_LOG.md` lines 249–257 | 8 items remain |
| Task plans | `.sisyphus/plans/` | Active plan in `boulder.json` |

---

## Commands

```bash
# Content sync from Figma
node sync-from-figma.js                    # Full sync
node sync-from-figma.js --section nav      # Partial sync (nav, hero, works, about, contact)
node sync-from-figma.js --dry-run          # Preview changes without writing

# No build step — open index.html directly in a browser
# No package.json, no npm install, no test runner
```

---

## Conventions

### File Naming
- HTML/JS files: `kebab-case` — `sync-from-figma.js`
- Asset directories: `snake_case` — `work_design/`, `work_illustration/`
- Docs: `SCREAMING_SNAKE_CASE.md` or `kebab-case.md`

### CSS
- Variables: `--{category}-{name}` — `--color-background`, `--spacing-md`
- Classes: `kebab-case`, BEM-like — `.hero-art-card`, `.tag-group.visible`
- **Responsive: `clamp()` everywhere — never use fixed pixel values for sizing**
- Spacing: 8px base unit (`--spacing-unit: 8px`); multiples: xs=8, sm=16, md=24, lg=40, xl=64
- State via data attributes: `data-index`, `data-tag`, `data-group`, `data-tags`, `data-project`

### CSS Root Variables (source of truth)
```css
:root {
  --color-text-primary: #e8fec5;
  --color-text-secondary: #a8d486;
  --color-background: #066bc3;
  --color-border: rgba(232, 254, 197, 0.3);
  --color-accent-1: #e8fec5;
  --color-accent-2: #ffd700;
  --font-family-body: 'GeistMono', monospace;
  --font-size-base: clamp(13px, 1.1vw + 0.3vh, 16px);
  --header-h: clamp(52px, 7vh, 68px);
  --spacing-unit: 8px;
}
```

### JavaScript
- Single quotes, semicolons required, 2-space indent
- `camelCase` for variables and functions; `SCREAMING_SNAKE_CASE` for constants
- Function declarations (not arrow functions) for main logic
- `requestAnimationFrame` loop pattern for cursor/parallax animations

### Figma Component Naming
- Path-style: `nav/site-name`, `works/card-001/title`
- 3-digit zero-padded indexes: `card-001`, `card-002`, `card-003`
- Slash `/` separator, `kebab-case` segments

### Git Commit Style
```
type(scope): description

type: feat, fix, content, refactor
scope: hero, works, about, contact, cursor, modal, font, etc.

Examples:
  feat(hero): card entrance animation
  fix(contact): reduce gap between body text and email
  content(works): update project card descriptions
```

---

## Anti-Patterns — DO NOT Do These

| Anti-pattern | Why |
|---|---|
| Add external CSS/JS files | Single-file architecture is intentional |
| Use fixed `px` values for layout sizing | Use `clamp()` for responsive scaling |
| Edit `wireframe.html` | Read-only reference file |
| Modify Figma Components/Tokens frames | Only edit the "Content" frame in Figma |
| Skip Component wrapping in Figma | Text must be in Components (Ctrl+Alt+K) or sync breaks |
| Remove `cursor: none !important` | Custom ASCII cursor (`▸`) requires this |
| Add build tools or package.json | No build system is a design decision |

---

## Design System

### TUI Aesthetic
- Monospace font throughout (GeistMono, self-hosted)
- Bracketed navigation: `[Projects]`, `[About]`, `[Contact]`
- Terminal "traffic light" window frames (`.tui-frame`, `.tui-top-bar`, `.tui-bottom-bar`)
- ASCII art in hero cards (file trees, decorative blocks)
- Status indicators: `●`, `·`, `↓`, `→`

### Obangsaek Color System (Korean traditional palette)
| Name | CSS Var | Hex | Use |
|------|---------|-----|-----|
| Primary text | `--color-text-primary` | `#e8fec5` | Headings, links |
| Secondary text | `--color-text-secondary` | `#a8d486` | Body, muted text |
| Background | `--color-background` | `#066bc3` | Page bg (cobalt blue) |
| Accent 1 | `--color-accent-1` | `#e8fec5` | Brush stroke |
| Accent 2 | `--color-accent-2` | `#ffd700` | Gold highlights |
| Border | `--color-border` | `rgba(232,254,197,0.3)` | Grid lines |

---

## Interactive Features

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `[1]` | Filter: Designs |
| `[2]` | Filter: Illustrations |
| `[3]` | Filter: Others |
| `[a]` `[s]` `[d]` `[f]` | Open hero cards 1–4 |
| `[Esc]` | Close expanded card / modal |
| `[←]` `[→]` | Cycle modal image carousel |

### Feature Summary
1. **Custom ASCII Cursor** (desktop only) — `▸` symbol with colorful trail; hidden on touch devices via `cursor: none !important`
2. **Hero Card Expansion** — FLIP clip/scale animation; fills viewport; keys `[a][s][d][f]` or click
3. **Tag Filtering** — `[1][2][3]` switch category groups; individual tag buttons filter within group; default shows all
4. **ASCII Canvas** (About section) — mouse movement draws fading blocks (`█` → `▓` → `░` → fade over 10s)
5. **Project Modal Carousel** — arrow key nav, thumbnail click to switch image
6. **First-visit hint toast** — shown once via `localStorage`

---

## Figma Content Sync Workflow

1. Edit text in Figma (double-click inside a Component)
2. Save (Cmd+S)
3. Run `node sync-from-figma.js [--section X] [--dry-run]`
4. Script reads `NODE_MAP` (Figma path → HTML selector) and patches `index.html` via regex
5. Verify in browser

**Figma file key:** `EiHpsaOmcMFDSIRTV1qCY1` (hardcoded in sync script line 7)
**Connection:** Primary via Claude MCP; fallback via `FIGMA_TOKEN` env var

---

## Sisyphus Task System

The `.sisyphus/` directory is an agent task-planning system used instead of CI/CD:

- **`boulder.json`** — tracks active plan and session ID
- **`plans/`** — markdown files with task specs, objectives, and step-by-step TODOs
- **`evidence/`** — QA screenshots and logs from Playwright-based verification
- **`drafts/`** and **`notepads/`** — WIP scratch space

When resuming work, check `boulder.json` for the active plan before starting new tasks.

---

## Outstanding TODOs (from SESSION_LOG.md)

1. Project cards — replace placeholder content with real case studies
2. Contact section — update email/LinkedIn from placeholders
3. Footer — replace placeholder copyright text
4. Hero TUI cards — ASCII art polish
5. About section body text — review and edit
6. Skills list — verify accuracy
7. Mobile nav — verify all interactions work on touch
8. Performance — test with actual high-res artwork images

---

## Technical Notes

- **Git remote:** `http://local_proxy@127.0.0.1:18660/git/jadeinvoid/jadeinvoid`
- **Upstream:** `https://github.com/jadeinvoid/jadeinvoid.git` (GitHub Pages deployment)
- **No build system** — no bundler, no package.json, no CI/CD
- **No test infrastructure** — manual browser verification + Sisyphus evidence
- **Sections navigate via anchors:** `#works`, `#about`, `#contact`
- **Accessibility:** `aria-label`, `aria-expanded`, `.sr-only` skip links
- **Touch detection:** `.not-touch` class on `<html>` (JS-added on non-touch devices)
- **Font loading:** GeistMono WOFF2 files in `fonts/` dir, declared in `@font-face`
