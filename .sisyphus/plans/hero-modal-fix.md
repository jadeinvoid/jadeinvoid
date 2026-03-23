# Hero Modal Fix

## TL;DR

> **Quick Summary**: Fix two issues with the expanded card modal in `hero-visuals-example.html` — off-center positioning caused by a CSS specificity conflict, and an invisible blue-on-blue tint.
>
> **Deliverables**: Fixed `hero-visuals-example.html`, screenshot confirming centered, visible modal
> **Estimated Effort**: Quick (2 CSS changes)
> **Parallel Execution**: NO — same file, sequential

---

## Context

### The 2 Bugs

**Bug 1 — Modal off-center**
The `.hero-art-card.expanded` rule sets `transform: translate(-50%, -50%) !important` to center the modal. But the `.hero-art-card.floating` rule (declared *later* in the stylesheet) sets `transform: scale(1)`. Since `.floating` is lower in the CSS with equal specificity, its `transform` wins and stomps the centering translation. The card's top-left corner anchors at 50%/50% without being shifted back, so it appears in the right half of the screen.

Fix: add a combined selector that re-asserts the centering when BOTH `.expanded` and `.floating` are present:
```css
.hero-art-card.floating.expanded {
    transform: translate(-50%, -50%) !important;
    animation: none; /* stop float while expanded */
}
```

**Bug 2 — Blue-on-blue tint**
The `.hero-art-card-overlay` uses `background-color: rgba(6, 107, 195, 0.95)` — nearly the same hue as `--color-background` (`#066bc3`). The expanded card's own background is also `var(--color-background)`. Everything is blue on blue; the card is invisible against the overlay.

Fix: change the overlay to a dark neutral scrim:
```css
.hero-art-card-overlay {
    background-color: rgba(0, 0, 0, 0.72);
}
```

### Working File
`/home/jade/Jade/MUIjade/hero-visuals-example.html` — single file, ~993 lines. Do NOT touch `index.html`.

---

## Work Objectives

### Must NOT Have
- Do NOT change anything other than the two CSS rules described
- Do NOT touch `index.html`
- Do NOT change card sizes, animation timing, or layout

---

## TODOs

- [ ] 1. Fix modal centering (floating.expanded transform conflict)

  **What to do**:
  Add a new CSS rule immediately after `.hero-art-card.floating` and its nth-child rules (~line 264), before the hover rules:

  ```css
  /* When a floating card is expanded, stop the float and restore centering */
  .hero-art-card.floating.expanded {
      transform: translate(-50%, -50%) !important;
      animation: none;
  }
  ```

  The `animation: none` stops the card-float while expanded so it doesn't jitter. The `transform: translate(-50%, -50%) !important` re-asserts centering, overriding the `.floating` rule's `transform: scale(1)` despite lower source order.

  **References**:
  - `hero-visuals-example.html` lines 255–263 — `.hero-art-card.floating` rules (add new rule right after line 263)
  - `hero-visuals-example.html` lines 273–285 — `.hero-art-card.expanded` (for context; do not change)

  **Acceptance Criteria**:
  - [ ] `.hero-art-card.floating.expanded` rule exists with `transform: translate(-50%, -50%) !important`
  - [ ] Screenshot shows expanded modal visually centered in viewport

  **Recommended Agent Profile**: `quick`, no skills

---

- [ ] 2. Fix overlay tint (blue-on-blue scrim)

  **What to do**:
  Find `.hero-art-card-overlay` (~line 288) and change `background-color`:

  ```css
  /* BEFORE */
  background-color: rgba(6, 107, 195, 0.95);

  /* AFTER */
  background-color: rgba(0, 0, 0, 0.72);
  ```

  This replaces the nearly-opaque blue (same hue as the background) with a neutral dark scrim. The expanded card — which has `background-color: var(--color-background)` (the blue) — will now contrast clearly against the dark overlay.

  **References**:
  - `hero-visuals-example.html` lines 287–295 — `.hero-art-card-overlay` rule

  **Acceptance Criteria**:
  - [ ] `.hero-art-card-overlay` has `background-color: rgba(0, 0, 0, 0.72)`
  - [ ] Screenshot shows expanded modal with clearly visible content (not washed out in blue)

  **Recommended Agent Profile**: `quick`, no skills

---

- [ ] 3. Screenshot verify and commit

  **What to do**:
  Take a screenshot with virtual time to capture the post-animation state, then click a card to trigger the expanded modal state. Since headless can't click interactively, verify the CSS is correct by reading the file, then take a normal screenshot to confirm the hero renders correctly.

  ```bash
  chromium --headless=new --screenshot=.sisyphus/evidence/modal-fix-verify.png --window-size=1440,900 --no-sandbox --virtual-time-budget=3500 "file:///home/jade/Jade/MUIjade/hero-visuals-example.html"
  ```

  Visually confirm:
  - [ ] `.hero-art-card.floating.expanded` rule is present in the file
  - [ ] `.hero-art-card-overlay` has `rgba(0, 0, 0, 0.72)` not a blue color
  - [ ] Hero screenshot looks correct (cards visible, not clipped)

  Then commit:
  ```bash
  git add hero-visuals-example.html
  git commit -m "fix(hero): modal off-center and blue-on-blue overlay

  - Add .floating.expanded rule to restore centering transform
    (.floating transform:scale(1) was overriding translate(-50%,-50%))
  - Change overlay from rgba(6,107,195,0.95) to rgba(0,0,0,0.72)
    so expanded card contrasts against a dark scrim instead of blending
    into the same blue as the background"
  ```

  **Recommended Agent Profile**: `quick`, no skills

---

## Success Criteria

- Expanded modal is centered in viewport
- Expanded modal content is clearly visible (dark scrim behind it, not blue)
- Float animation stops while card is expanded
