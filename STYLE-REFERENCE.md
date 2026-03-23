# Style Reference — jadeinvoid portfolio

Generated from `index.html` (current build). Use this as a design token reference when building a new layout.

---

## 1. Color Palette

### Core Tokens

| CSS Variable | Value | Use |
|---|---|---|
| `--color-text-primary` | `#e8fec5` | Headings, links, active states, CTA text |
| `--color-text-secondary` | `#a8d486` | Body text, labels, muted UI, card tags |
| `--color-background` | `#066bc3` | Page background (saturated cobalt blue) |
| `--color-border` | `rgba(232, 254, 197, 0.3)` | Grid lines, dividers, all frame borders |
| `--color-accent-1` | `#e8fec5` | Same hex as `--color-text-primary` — used explicitly for hover highlights, active key labels, CTA |
| `--color-accent-2` | `#ffd700` | Gold — TUI art color, active thumbnail border |

> Note: `--color-accent-1` and `--color-text-primary` share the same hex `#e8fec5`. They are semantically distinct tokens (accent vs. text) but currently identical in value.

---

### Derived / One-off Values

These appear as inline values throughout the CSS and HTML. Collected here for reference.

#### Text-primary tints (rgba of `#e8fec5`)

| Value | Alpha | Used For |
|---|---|---|
| `rgba(232, 254, 197, 0.03)` | 3% | Card hover background |
| `rgba(232, 254, 197, 0.07)` | 7% | Active shortcut tab background (mobile) |
| `rgba(232, 254, 197, 0.08)` | 8% | Active tag button background |
| `rgba(232, 254, 197, 0.1)` | 10% | Active shortcut button background, skill item hover |
| `rgba(232, 254, 197, 0.2)` | 20% | Dark mode border override |
| `rgba(232, 254, 197, 0.35)` | 35% | Active shortcut button outline |
| `rgba(232, 254, 197, 0.5)` | 50% | Highlight-fade box-shadow on work card |
| `rgba(232, 254, 197, 0.05)` | 5% | Carousel main background |

#### Black overlays

| Value | Used For |
|---|---|
| `rgba(0, 0, 0, 0.1)` | Mobile shortcut tab bar background |
| `rgba(0, 0, 0, 0.12)` | Hint toast background |
| `rgba(0, 0, 0, 0.15)` | Section header background, keyboard bar background |
| `rgba(0, 0, 0, 0.3)` | Modal content box-shadow color |
| `rgba(0, 0, 0, 0.5)` | Expanded hero card box-shadow |
| `rgba(0, 0, 0, 0.6)` | Work detail backdrop |

#### Background-derived

| Value | Used For |
|---|---|
| `rgba(6, 107, 195, 0.8)` | Hero card overlay backdrop |
| `rgba(6, 107, 195, 0.85)` | Work modal overlay |

---

### Cursor Trail Colors

These 6 values are used exclusively by the cursor trail effect. They are **not** part of the main palette — they are neon/pop colors that diverge from the rest of the design.

```
#ff69b4   hot pink
#00ffff   cyan
#ccff00   yellow-green
#ffd700   gold (same as --color-accent-2)
#ff1493   deep pink
#00ffaa   teal-green
```

---

### Dark Mode Overrides

Defined in `body.dark-mode` — currently not wired to any UI toggle, exists as dead CSS.

| Variable | Dark Value |
|---|---|
| `--color-background` | `#044a85` |
| `--color-border` | `rgba(232, 254, 197, 0.2)` |

`--color-text-primary` and `--color-text-secondary` are unchanged in dark mode.

---

## 2. Typography

### Font Stack

```css
font-family: 'GeistMono', 'geist/font/mono', monospace;
```

Applied to both `--font-family-body` and `--font-family-heading` — a single typeface throughout.

**Loading:** Variable font via `@font-face` from local `./fonts/GeistMono[wght].woff2` (weight range `100–900`), with a static `GeistMono-Regular.woff2` fallback at weight `400`. Both use `font-display: swap`.

---

### Base Size

```css
--font-size-base: clamp(13px, 1.1vw + 0.3vh, 16px);
```

Minimum `13px`, maximum `16px`, scales with viewport between those bounds.

---

### Type Scale

All sizes are `em`-relative to `--font-size-base`.

| Element / Token | `em` value | Approx px (at 16px base) |
|---|---|---|
| `h1` | `2.8em` | ~45px |
| `h2` | `2.2em` | ~35px |
| `h3` | `1.8em` | ~29px |
| `h4` | `1.4em` | ~22px |
| `h5` | `1.2em` | ~19px |
| `h6` / body | `1em` | ~16px |
| Hero title | `3.5em` | ~56px |
| About tagline | `2em` | ~32px |
| About title | `1.8em` | ~29px |
| Hero description | `clamp(0.8em, 1.2vw, 1em)` | ~13–16px |
| Section title | `1em` (in 0.85em context) | ~14px |
| Info modal title | `clamp(1.2em, 2.5vw, 1.6em)` | ~19–26px |
| Nav links | `0.9em` | ~14px |
| Tag / shortcut buttons | `0.8em` – `1em` | ~13–16px |
| TUI top/bottom bars | `0.85em` | ~14px |
| Keyboard bar | `0.72em` | ~12px |
| Card number | `0.7em` | ~11px |
| Placeholder / small labels | `0.75em` – `0.8em` | ~12–13px |
| About TUI art | `0.7em` | ~11px |
| Vertical text accent | `1.2em` | ~19px |

---

### Line Heights

| Context | Value |
|---|---|
| Base body | `1.6` |
| Headings (`h1`–`h6`) | `1.2` |
| Hero title | `1.1` |
| Hero description | `1.8` |
| About body | `1.9` |
| TUI ASCII pre | `1` – `1.25` |
| Placeholder content | `2` |

---

### Letter Spacing

| Context | Value |
|---|---|
| Hero subtitle | `0.25em` |
| Section title | `0.15em` |
| Nav links | `0.12em` |
| About label | `0.1em` |
| Tag buttons | `0.08em` |
| Shortcut buttons | `0.06em` |
| Keyboard bar | `0.06em` |
| Skill items | `0.08em` |
| Card tags | `0.08em` |

---

### Font Weights

| Context | Weight |
|---|---|
| Hero title | `bold` (700) |
| About tagline / title | `bold` (700) |
| Header logo | `700` |
| Hero subtitle | `600` |
| Section title | `600` |
| Keyboard bar keys | `600` |
| TUI key spans (`.tui-btn-key`, `.shortcut-key`) | `bold` |
| Body / secondary text | `400` |

---

### Special Text Treatments

**Blinking cursor** — `.cursor` is an inline `<span>` appended to the hero title with a CSS blink animation:
```css
animation: blink 1s step-end infinite;
/* at 50%: opacity: 0 */
```

**Monospace pre / ASCII art** — `white-space: pre`, `line-height: 1` or `1.25`, `font-size: 0.72em`, color `--color-text-secondary` or `--color-border`.

**Vertical text accent** — `writing-mode: vertical-rl; text-orientation: mixed` — references `'Noto Sans KR', sans-serif` which is **not loaded** (no `@font-face` or external link), so it falls back to system sans-serif. Hidden on mobile.

---

## 3. Spacing System

Base unit: `8px`

| Token | Formula | Computed Value |
|---|---|---|
| `--spacing-unit` | `8px` | 8px |
| `--spacing-xs` | `var(--spacing-unit)` | 8px |
| `--spacing-sm` | `calc(8px * 2)` | 16px |
| `--spacing-md` | `calc(8px * 3)` | 24px |
| `--spacing-lg` | `calc(8px * 5)` | 40px |
| `--spacing-xl` | `calc(8px * 8)` | 64px |

**Header height:**
```css
--header-h: clamp(52px, 7vh, 68px);
```
Minimum `52px`, maximum `68px`, scales with viewport height.

---

## 4. Borders & Surfaces

### Border Style

All borders use one pattern: `1px solid var(--color-border)` — which is `1px solid rgba(232, 254, 197, 0.3)`.

No border-radius is used anywhere except:
- `.tui-frame`: `border-radius: 4px`
- `.placeholder-line`: `border-radius: 2px`
- `.carousel-thumbs::-webkit-scrollbar-thumb`: `border-radius: 2px`
- Hero card at `max-width: 480px` when expanded: `border-radius: 0` (explicitly reset)

One exception — `.card-thumb` uses `border: 1px dashed var(--color-border)` (dashed, not solid).

---

### Background Tints

| Element | Background |
|---|---|
| Page body | `--color-background` (`#066bc3`) |
| Hero art cards | `--color-background` (same as page) |
| Hero art card (hover) | `rgba(232, 254, 197, 0.03)` |
| Section headers | `rgba(0, 0, 0, 0.15)` |
| Tag bar | `--color-background` |
| Keyboard bar | `rgba(0, 0, 0, 0.15)` + `backdrop-filter: blur(4px)` |
| Works hint toast | `rgba(0, 0, 0, 0.12)` |
| Mobile shortcut tab bar | `rgba(0, 0, 0, 0.1)` |
| Carousel main image area | `rgba(232, 254, 197, 0.05)` |
| Expanded hero card | `--color-background` |
| Work detail modal content | `--color-background` |

---

### Grain Texture Overlay

Applied via `body::before` — a full-viewport fixed pseudo-element sitting above all content.

```css
position: fixed;
inset: 0;
background-image: url("data:image/svg+xml, ...fractalNoise...");
/* SVG filter: feTurbulence, type fractalNoise, baseFrequency 0.9, numOctaves 3, stitchTiles stitch */
opacity: 0.035;
pointer-events: none;
z-index: 10003;
mix-blend-mode: overlay;
```

The SVG renders a 400×400 fractal noise pattern, tiled by `stitchTiles`. Extremely subtle — `3.5%` opacity with `overlay` blend mode adds slight film grain to the blue background.

---

### Box Shadows

| Element | Shadow |
|---|---|
| Expanded hero card (`.hero-art-card.expanded`) | `0 0 50px rgba(0, 0, 0, 0.5)` |
| Work detail modal content (`.modal-content`) | `0 4px 20px rgba(0, 0, 0, 0.3)` |

No other box-shadows are used. The design relies on borders and background contrast instead of elevation shadows.

---

## 5. Cursor System

### Base Cursor

- All elements globally: `cursor: none !important` (applied on `*, *::before, *::after`)
- Touch devices: `cursor: auto !important` on `*`, `cursor: pointer !important` on `a, button` — custom cursor hidden

The visible cursor is a custom DOM element `<span id="custom-cursor">▸</span>`.

```css
position: fixed;
pointer-events: none;
z-index: 10002;
font-family: var(--font-family-body);
font-size: 40px;
color: transparent;        /* glyph invisible by default */
transform: translate(-50%, -50%);
opacity: 0;
transition: opacity 0.3s ease, color 0.15s ease;
user-select: none;
```

Fades in 500ms after page load via `.visible` class (sets `opacity: 1`, color stays transparent).

**Smooth following** — the cursor position lerps toward the mouse at `factor: 0.2` (updated every `requestAnimationFrame`):
```js
cursorX += (targetX - cursorX) * 0.2;
cursorY += (targetY - cursorY) * 0.2;
```

---

### Absorbed State (`.show-esc`)

When the cursor enters a proximity zone around an interactive element, it switches to "absorbed" mode — the cursor becomes the element's text label:

```css
color: var(--color-text-secondary);   /* #a8d486 */
font-size: 14px;
font-weight: 600;
```

The lerp factor slows to `0.5` (from `0.2`) while in absorbed state — the cursor tracks the mouse more tightly when showing text.

---

### Trail Effect

A new `<span>` is spawned on every `mousemove` event (skipped when in absorbed state).

**Character set** (chosen randomly):
```js
['·', '✦', '░', '╮', '◈', '○', '◉', '◇']
```

**Color set** (chosen randomly — 6 values, neon palette):
```js
['#ff69b4', '#00ffff', '#ccff00', '#ffd700', '#ff1493', '#00ffaa']
```

**Per-trail styles:**
```js
position: fixed
pointer-events: none
z-index: 10003
font-family: monospace
font-size: random 16–24px   // Math.random() * 8 + 16
text-shadow: `0 0 8px ${color}, 0 0 16px ${color}`   // double-layer glow
transform: translate(-50%, -50%) rotate(random -90° to 90°)
transition: opacity 1.5s ease-out, transform 1.5s ease-out
initial opacity: 0.9
spawn offset: cursor position + 20px down (top = e.clientY + 20px)
```

**Lifetime:**
```
spawn        → opacity 0.9
+30ms        → opacity 0 (fade begins), scale 0.3, random rotation change
+1530ms      → element removed from DOM
```

Total visible duration: ~1.5 seconds.

---

### Proximity Absorption Zones

Two interactive elements use proximity detection instead of standard `mouseenter` — because they sit inside `overflow: hidden` containers.

| Selector | Buffer (hero expanded) | Buffer (work modal) |
|---|---|---|
| `.tui-close-btn` | `32px` all sides | `56px` right/top/bottom, `0px` left |
| `.tui-open-btn` | `32px` all sides | `56px` all sides |
| `.carousel-key-hint` | `32px` all sides | `56px` all sides |

The left-side buffer of `.tui-close-btn` inside the work modal is `0` to prevent bleed-over from the `.carousel-key-hint` element that sits to its left.

Detection runs on every `mousemove` — elements outside expanded/active contexts are always cleared regardless of proximity.

---

### Click Forwarding

When the cursor is in absorbed state and the user clicks anywhere, the click is forwarded to the absorbed element:
```js
if (hoveredInteractive && !hoveredInteractive.contains(e.target)) {
    hoveredInteractive.click();
}
```
A `forwardingClick` boolean guard prevents recursive firing.

---

## 6. Interactive State Styles

### Links (`<a>`)

```css
color: var(--color-text-primary);
text-decoration: none;
transition: color 0.2s;

/* hover/focus */
color: var(--color-accent-1);   /* same hex, but token-distinct */

/* hover/focus (excluding .nav-link, .hero-cta, .header-logo) */
outline: 2px dotted var(--color-accent-1);
outline-offset: 2px;
```

---

### Navigation Links (`.nav-link`)

Bracket reveal via `::before` / `::after` pseudo-elements:

```css
/* default */
::before content: "["   opacity: 0
::after  content: "]"   opacity: 0
transition: opacity 0.2s ease

/* hover / focus / active */
::before, ::after opacity: 1
color: var(--color-accent-1)
```

The brackets are absolutely positioned at `left: 0` and `right: 0` respectively. Nav link padding is `4px 12px` to make room.

---

### Hero CTA (`.hero-cta`)

Default: text color `--color-accent-1`, no background.

```css
/* hover — inner <span> inverts */
background-color: var(--color-accent-1);
color: var(--color-background);
transition: background-color 0.15s ease, color 0.15s ease;
```

---

### Hero Art Cards (`.hero-art-card`)

```css
/* hover */
background-color: rgba(232, 254, 197, 0.03);
.tui-frame border-color: var(--color-accent-1);
.tui-top-bar border-color, color: var(--color-accent-1);
.tui-top-bar ::before, ::after, .tui-divider: color var(--color-accent-1);
.tui-bottom-bar border-color, color: var(--color-accent-1);
```

All transitions are instant (no `transition` on hover color changes for the frame).

---

### Work Cards (`.work-card`)

```css
/* hover */
.card-thumb: transform scale(1.02), border-color var(--color-accent-1)
transition: transform 0.3s ease, border-color 0.3s ease

.card-arrow: translateX(5px), color var(--color-accent-1)
transition: transform 0.2s

/* focus-within */
outline: 2px solid var(--color-accent-1);
outline-offset: -2px;
```

Work card highlight (when navigated to from hero `[o]` button):
```css
animation: highlight-fade 2s ease forwards
/* 0%:   outline-color var(--color-accent-1), box-shadow 0 0 16px rgba(232,254,197,0.5) */
/* 100%: outline-color transparent, box-shadow none */
```

---

### Shortcut Buttons (`.shortcut-btn`)

```css
/* default */
color: var(--color-text-secondary);
background: none;
border: none;

/* active */
color: var(--color-accent-1);
background-color: rgba(232, 254, 197, 0.1);
outline: 1px solid rgba(232, 254, 197, 0.35);
outline-offset: -1px;

/* hover — inner .shortcut-label inverts */
background-color: var(--color-accent-1);
color: var(--color-background);
transition: background-color 0.15s ease, color 0.15s ease;
/* .shortcut-key also changes to --color-background on hover */
```

Mobile active state adds: `border-top: 2px solid var(--color-accent-1)`.

---

### Tag Buttons (`.tag-btn`)

```css
/* default */
color: var(--color-text-secondary);
background: none;
border-left: 1px solid var(--color-border);  /* separator */

/* hover / focus */
color: var(--color-accent-1);
outline: none;
transition: opacity 0.15s ease, background-color 0.15s ease;

/* active */
color: var(--color-accent-1);
background-color: rgba(232, 254, 197, 0.08);
```

`.tag-btn.tag-all` has `opacity: 1 !important` — never dims regardless of filter state.

---

### TUI Close / Open Buttons

```css
/* hover */
opacity: 0.7;
transform: scale(1.05);
.tui-btn-key color: var(--color-accent-2);   /* gold */
transition: opacity 0.15s ease;

/* in-zone (proximity absorption active) */
opacity: 0;   /* button becomes invisible — cursor has absorbed its label */
```

---

### Skill Items (`.skill-item`)

```css
/* hover */
color: var(--color-accent-1);
background-color: rgba(232, 254, 197, 0.1);
transition: all 0.2s ease;
```

---

### Social Links

```css
/* default */
color: var(--color-text-primary);
opacity: 0.6;
transition: opacity 0.15s ease, transform 0.15s ease;

/* hover */
opacity: 1;
transform: translateY(-2px);
```

---

### Scrollbar (`.tui-content`, `.carousel-thumbs`)

```css
/* track */      background: transparent
/* thumb */      background: var(--color-border);  border-radius: 0
/* thumb hover */ background: var(--color-accent-1)
width: 6px (vertical), height: 4px (horizontal)
```

---

## 7. Animation & Motion

### Card Entrance (`.hero-art-card`)

Cards start hidden and animate in on load:

```css
/* initial state */
opacity: 0;
transform: scale(0.95);

/* .visible state */
opacity: 1;
transform: scale(1);
transition: opacity 350ms ease-out, transform 350ms ease-out;
```

---

### Hero Card Expand / Collapse

On click, the card takes a `position: fixed` snapshot of its current bounding rect, then animates to a centered `80vw × 80vh` modal (`95vw × 70vh` on mobile, `100vw × 80vh` at `max-width: 480px`).

```css
/* .animating class (applied during transition) */
transition: left 0.25s ease-out, top 0.25s ease-out,
            width 0.25s ease-out, height 0.25s ease-out;

/* .expanded state */
position: fixed;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
width: 80vw;
height: 80vh;
z-index: 10000;
box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
```

Collapse reverses: animates back to the stored original rect, then removes `position: fixed`.

---

### Hero Parallax

Cards in the hero visuals panel shift on `mousemove`, each at a different depth:

| Card | `data-index` | Depth multiplier |
|---|---|---|
| Design / TUI | `a` | `1.0` |
| Korean / Print | `d` | `0.4` |
| Illustration | `s` | `0.6` |
| Process / Misc | `f` | `0.7` |

```js
const PARALLAX_MAX  = 6;     // max px offset at viewport edge
const PARALLAX_LERP = 0.15;  // interpolation factor per frame

// Per frame:
currentX += (targetX - currentX) * PARALLAX_LERP;
currentY += (targetY - currentY) * PARALLAX_LERP;

// Per card:
transform: translate(currentX * depth + "px", currentY * depth + "px")
```

Disabled when any card is expanded, when `prefers-reduced-motion: reduce` is set, and on touch devices.

On mouse leave, `targetX` and `targetY` reset to `0` — cards smoothly return to resting position.

---

### Work Card Expand Reveal (`.work-card.expanding`)

Cards that appear when the `[e]` expand button is clicked:

```css
animation: card-expand-in 0.3s ease-out forwards;

@keyframes card-expand-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

### Work Detail Modal

```css
/* --modal-timing: 300ms */
/* --modal-easing: cubic-bezier(0.4, 0, 0.2, 1) */

/* initial (display: none) */
opacity: 0;
transform: scale(0.95);

/* .active */
display: flex;
opacity: 1;
transform: scale(1);
transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1),
            transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

Backdrop fades in separately:
```css
/* initial */ opacity: 0; display: none;
/* .active */ opacity: 1; display: block;
transition: opacity 0.3s ease;
backdrop-filter: blur(4px);
background: rgba(0, 0, 0, 0.6);
```

---

### Tag Group Reveal

```css
/* hidden */
max-width: 0;
opacity: 0;
pointer-events: none;
transition: max-width 0.3s ease, opacity 0.25s ease;

/* .visible */
max-width: 600px;
opacity: 1;
pointer-events: auto;
```

---

### Mobile Nav Menu

```css
/* closed */
transform: translateY(-100%);
opacity: 0;
pointer-events: none;
transition: transform 0.3s ease-out, opacity 0.3s ease-out;

/* .open */
transform: translateY(0);
opacity: 1;
pointer-events: auto;
```

---

### ASCII Canvas (About Section)

On `mousemove` inside `.about-left`, a `<span>` with `█` is spawned at cursor coordinates.

```css
.ascii-square {
  position: absolute;
  font-size: 0.9em;
  color: var(--color-accent-1);   /* #e8fec5 */
  opacity: 0;
  transition: opacity 3s ease-out, transform 3s ease-out;
  pointer-events: none;
  user-select: none;
}
```

**Lifecycle:**
```
spawn (opacity 0)
  → next rAF: opacity 1, transform translate(random ±2px, random ±2px)
  → +5000ms:  innerHTML → '▓'
  → +7500ms:  innerHTML → '░'
  → +10000ms: opacity 0 (CSS transition 3s ease-out begins)
  → transitionend: element removed
```

Total lifetime: ~13 seconds (10s + 3s fade).

---

### Recurring Animations

**Blinking cursor (`_` in hero title):**
```css
animation: blink 1s step-end infinite;
@keyframes blink { 50% { opacity: 0; } }
```

**Status dot pulse (header `●`):**
```css
animation: pulse 3s ease-in-out infinite;
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50%       { opacity: 1; }
}
```

**Work card highlight (on scroll-to from hero):**
```css
animation: highlight-fade 2s ease forwards;
@keyframes highlight-fade {
  0%   { outline-color: var(--color-accent-1); box-shadow: 0 0 16px rgba(232,254,197,0.5); }
  100% { outline-color: transparent; box-shadow: none; }
}
```

---

## 8. Responsive Breakpoints

Two breakpoints. No intermediate steps.

### `max-width: 768px`

- Header padding reduced to `--spacing-xs --spacing-sm`
- Nav collapses to hamburger (`nav-toggle-btn` shown, `nav-status` hidden)
- Nav list becomes a dropdown (slide from top, `translateY(-100%)` → `0`)
- Hero switches from `55fr 45fr` two-column to single column; hero content moves above visuals (`order: -1`)
- Hero height: `min-height: calc(100svh - var(--header-h))` instead of fixed `height`
- Works grid: `repeat(3, 1fr)` → `repeat(2, 1fr)`
- About section: `1fr 2fr` → `1fr` (stacked)
- `about-left` border-right removed, border-bottom added
- Vertical text accent hidden
- Expanded hero card: `95vw × 70vh`
- Section header: `flex-wrap: wrap`, shortcut tab bar drops to full-width second row
- Shortcut buttons: full-width tabs with `border-bottom` indicator
- Hint toast hidden (`display: none !important`)
- Tag hint shown (`display: inline`)
- Keyboard bar hidden

### `max-width: 480px`

- Works grid: `repeat(2, 1fr)` → `1fr` (single column)
- Expanded hero card: `100vw × 80vh`, `top: 0; left: 0; transform: none; border-radius: 0`

### Touch devices (`pointer: coarse`)

- All `cursor: none` rules overridden: `cursor: auto`, links/buttons get `cursor: pointer`
- `#custom-cursor`: `display: none !important`
- Card expand uses CSS `position: fixed` directly (no JS animation — `isMobileExpand()` check skips the rect-snapshot animation)
- Keyboard bar hidden
- Parallax disabled
- Cursor trail not initialized

---

## 9. Z-index Stack

| Layer | Z-index | Element |
|---|---|---|
| Grain overlay | `10003` | `body::before`, cursor trail spans |
| Custom cursor | `10002` | `#custom-cursor` |
| Expanded hero card | `10000` | `.hero-art-card.expanded` |
| Work detail modal | `10000` | `.work-detail-modal` |
| Work detail backdrop | `9999` | `.work-detail-backdrop` |
| Hero card overlay | `9999` | `.hero-art-card-overlay` |
| Keyboard bar | `150` | `#kb-bar` |
| Header | `100` | `.header-main` |

---

*End of style reference.*
