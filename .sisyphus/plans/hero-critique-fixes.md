# Hero Critique Fixes

## TL;DR

> **Quick Summary**: Apply 7 design improvements to `hero-visuals-example.html` — fix invisible subtitle/roles bug, fix card clipping, reduce image tint, replace "expand" with terminal idiom, add idle float animation, **fix modal opacity**, and **increase card size variety with better viewport responsiveness**.
>
> **Deliverables**:
> - `hero-visuals-example.html` with all 7 fixes applied
> - Screenshot evidence confirming each fix
>
> **Estimated Effort**: Short
> **Parallel Execution**: NO — all changes are in the same single file, do sequentially
> **Critical Path**: Fix 1 → Fix 2 → Fix 3 → Fix 4 → Fix 5 → Fix 6 → Fix 7 → Screenshot verify

---

## Context

### Original Request
"Yes go ahead" — user approved all 5 Interface Craft critique findings to be implemented in `hero-visuals-example.html`.

### Additional Requests (from screenshot review)
6. **Modal/expanded card opacity too low** — The expanded card modal has a strong blue tint overlay making content barely visible. Need to increase opacity/reduce tint.
7. **Card sizes too small, need more variety** — Current card sizes (sm/md/lg) are all relatively small and don't have enough visual differentiation. Need larger base sizes and more dramatic size differences between variants.

### The 7 Issues
1. **Subtitle/description/roles invisible after typing animation** — CSS `opacity: 0` on base elements overrides `animation-fill-mode: forwards` final state.
2. **Bottom-right card (Design/TUI, card-lg) clipped at viewport edge** — The clamping math passes `heroRect.height + heroRect.top` as the usable height, double-counting the header offset.
3. **Image overlay tint too strong (0.35 opacity)** — The blue overlay on `.tui-content-img-overlay` washes out photos at 35% opacity. Should be 0.12.
4. **"expand" hint text breaks terminal idiom** — Plain English "expand" sits alongside keyboard shortcuts `[o]` and `[esc]`. Should be `[↵]`.
5. **Cards have no idle animation** — No passive motion signal means first-time visitors don't know cards are interactive.
6. **Modal opacity too low** — The expanded card modal has `background-color: rgba(6, 107, 195, 0.8)` which is too transparent, making modal content hard to see against the background.
7. **Card sizes too small with insufficient variety** — Current sizes: sm (160-220px), md (200-280px), lg (240-330px). Need larger cards overall and more dramatic size differences (e.g., 1.5x-2x ratio between smallest and largest).

### Working File
**`/home/jade/Jade/MUIjade/hero-visuals-example.html`** — single file, 963 lines. All changes stay in this file. Do NOT touch `index.html`.

---

## Work Objectives

### Core Objective
Apply all 7 critique fixes to `hero-visuals-example.html` and verify each one visually.

### Concrete Deliverables
- Fixed `hero-visuals-example.html`
- Screenshots at `.sisyphus/evidence/fix-verify-desktop.png` and `.sisyphus/evidence/fix-verify-mobile.png`

### Must NOT Have (Guardrails)
- Do NOT touch `index.html`
- Do NOT add external files or dependencies
- Do NOT change the animation timing constants in `TIMING` object
- Do NOT change card content, structure, or the expand/collapse modal behavior
- Do NOT change the overall layout concept (floating cards + centered text)

---

## Verification Strategy

**No test infrastructure** — manual browser verification via headless Chromium screenshots.

**QA**: After all fixes, take two screenshots (desktop 1440×900, mobile 375×812) using:
```bash
chromium --headless=new --screenshot=.sisyphus/evidence/fix-verify-desktop.png --window-size=1440,900 --no-sandbox --virtual-time-budget=3500 "file:///home/jade/Jade/MUIjade/hero-visuals-example.html"
chromium --headless=new --screenshot=.sisyphus/evidence/fix-verify-mobile.png --window-size=375,812 --no-sandbox --virtual-time-budget=3500 "file:///home/jade/Jade/MUIjade/hero-visuals-example.html"
```
Then read both images and confirm:
- Subtitle "ILLUSTRATOR & UX DESIGNER" is visible
- Description paragraph is visible
- Role tags are visible
- No card is clipped at the viewport edge
- Images look richer (less washed out)
- `[↵]` appears instead of "expand"

---

## Execution Strategy

All 7 tasks touch the same file. Run them sequentially in one agent session.

---

## TODOs

- [ ] 1. Fix subtitle/description/roles opacity bug

  **What to do**:
  Add `opacity: 1` to each `.visible` CSS rule so the final state is explicitly declared regardless of animation fill-mode behavior. The three rules to update are:

  ```css
  /* BEFORE */
  .hero-subtitle.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
  }
  .hero-description.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
      animation-delay: 80ms;
  }
  .hero-roles.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
      animation-delay: 160ms;
      pointer-events: auto;
  }

  /* AFTER — add opacity: 1 to each */
  .hero-subtitle.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
      opacity: 1;
  }
  .hero-description.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
      animation-delay: 80ms;
      opacity: 1;
  }
  .hero-roles.visible {
      animation: fade-up var(--subtitle-fade-duration) ease-out forwards;
      animation-delay: 160ms;
      pointer-events: auto;
      opacity: 1;
  }
  ```

  Also update the `@media (prefers-reduced-motion: reduce)` block — the JS already sets `opacity: '1'` inline for reduced motion, so that path is fine. No change needed there.

  **Must NOT do**: Don't remove `opacity: 0` from the base element rules — that's intentional (hides them before animation starts). Just add `opacity: 1` on the `.visible` variants.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (same file)
  - **Blocks**: Task 6 (screenshot verify)
  - **Blocked By**: None

  **References**:
  - `hero-visuals-example.html` lines 141–202 — the three `.visible` CSS rules to update
  - `hero-visuals-example.html` lines 422–440 — reduced-motion block (verify no change needed)

  **Acceptance Criteria**:
  - [ ] `.hero-subtitle.visible`, `.hero-description.visible`, `.hero-roles.visible` each have `opacity: 1` in CSS
  - [ ] Screenshot at 3500ms virtual time shows subtitle text "ILLUSTRATOR & UX DESIGNER" visible on screen

  **Commit**: YES (groups with all 5 fixes in one commit at the end)

---

- [ ] 2. Fix card clamping — bottom-right card clipped

  **What to do**:
  The bug is in `placeCards()` at line ~831:
  ```js
  // BUGGY — double-counts header
  var positions = getCardPositions(cards, heroRect.width, heroRect.height + heroRect.top);
  ```

  `heroRect.height` is already the height of the hero div (viewport minus header). Adding `heroRect.top` (which equals the header height, ~52px) inflates the usable height incorrectly, making `getCardPositions` think there's 52px more room at the bottom than there actually is.

  Fix:
  ```js
  // CORRECT — hero height is already the right usable height
  var positions = getCardPositions(cards, heroRect.width, heroRect.height);
  ```

  Also update `getCardPositions` to remove the internal `headerH` subtraction since the caller now passes the already-correct height:
  ```js
  // BEFORE (inside getCardPositions):
  var headerH  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 52;
  var usableH  = vh - headerH;

  // AFTER — vh is already the usable height (heroRect.height), no subtraction needed:
  var usableH  = vh;
  // (remove the headerH line entirely)
  ```

  **Must NOT do**: Don't change zone percentages or edge padding logic.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 1

  **References**:
  - `hero-visuals-example.html` lines 742–807 — `getCardPositions` function
  - `hero-visuals-example.html` lines 810–845 — `placeCards` function, specifically line ~831

  **Acceptance Criteria**:
  - [ ] `placeCards()` passes `heroRect.height` (not `heroRect.height + heroRect.top`) to `getCardPositions`
  - [ ] `getCardPositions` uses `var usableH = vh` (no header subtraction)
  - [ ] Screenshot shows all 4 cards fully within the viewport with no clipping

  **Commit**: YES (groups with all fixes)

---

- [ ] 3. Reduce image overlay tint

  **What to do**:
  Find `.tui-content-img-overlay` in CSS (~line 393) and change `opacity: 0.35` to `opacity: 0.12`.

  ```css
  /* BEFORE */
  .tui-content-img-overlay {
      ...
      opacity: 0.35;
      ...
  }

  /* AFTER */
  .tui-content-img-overlay {
      ...
      opacity: 0.12;
      ...
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 2

  **References**:
  - `hero-visuals-example.html` lines 392–399 — `.tui-content-img-overlay` rule

  **Acceptance Criteria**:
  - [ ] `.tui-content-img-overlay` has `opacity: 0.12`
  - [ ] Screenshot shows the illustration and Korean/Print card images are clearly visible (not washed out in blue)

  **Commit**: YES (groups with all fixes)

---

- [ ] 4. Replace "expand" hint with terminal idiom `[↵]`

  **What to do**:
  There are 4 cards in the HTML. Each non-open card has:
  ```html
  <span class="tui-action-hint">expand</span>
  ```
  Card 2 (Illustration, `has-open`) has:
  ```html
  <span class="tui-expand-hint tui-action-hint">expand</span>
  ```

  Replace ALL instances of the text content `expand` inside `.tui-action-hint` spans with `[↵]`:

  Cards 1, 3, 4 (no `[o] open` button):
  ```html
  <!-- BEFORE -->
  <span class="tui-action-hint">expand</span>
  <!-- AFTER -->
  <span class="tui-action-hint">[↵]</span>
  ```

  Card 2 (has `[o] open`):
  ```html
  <!-- BEFORE -->
  <span class="tui-expand-hint tui-action-hint">expand</span>
  <!-- AFTER -->
  <span class="tui-expand-hint tui-action-hint">[↵]</span>
  ```

  That's 4 replacements total. Use replaceAll or do them individually — doesn't matter as long as all 4 are caught.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 3

  **References**:
  - `hero-visuals-example.html` lines 515–620 — all 4 card HTML blocks, each containing a `.tui-action-hint` span

  **Acceptance Criteria**:
  - [ ] Zero instances of `>expand<` remain in the file
  - [ ] All 4 `.tui-action-hint` spans contain `[↵]`

  **Commit**: YES (groups with all fixes)

---

- [ ] 5. Add idle float animation to cards

  **What to do**:
  Add a CSS keyframe animation that makes each card gently float up and down. Each card gets a slightly different duration and delay so they move independently (not in sync).

  **Step A — Add the keyframe** (in the `/* ── KEYFRAMES ──` block, after the existing `blink` keyframe):
  ```css
  /* Gentle idle float for TUI cards */
  @keyframes card-float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-5px); }
  }
  ```

  **Step B — Apply to `.hero-art-card.popped-in`** (so it only starts after the card has appeared):
  ```css
  /* BEFORE */
  .hero-art-card.popped-in {
      animation: pop-in var(--card-pop-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  ```

  After `pop-in` completes, apply the float. Use `animation-delay` on the float to start after pop-in finishes. The cleanest approach without JS is to chain via CSS custom properties. Instead, use a small JS addition: after each card gets `popped-in`, schedule a second class `floating` to be added after the pop-in duration (300ms):

  In JS, inside `animateCardsIn()`, after `card.classList.add('popped-in')`, add:
  ```js
  // Schedule float start after pop-in completes
  var floatDelay = TIMING.cardPopStart + i * TIMING.cardPopStagger + 300; // pop-in duration = 300ms
  setTimeout(function (c, idx) {
      c.classList.add('floating');
  }.bind(null, card, i), floatDelay);
  ```

  And the CSS for `.floating`:
  ```css
  .hero-art-card.floating {
      animation: card-float 4s ease-in-out infinite;
  }
  /* Each card gets a different phase via nth-child offsets */
  .hero-art-card:nth-child(2).floating { animation-duration: 4.5s; animation-delay: -1.2s; }
  .hero-art-card:nth-child(3).floating { animation-duration: 3.8s; animation-delay: -2.5s; }
  .hero-art-card:nth-child(4).floating { animation-duration: 5s;   animation-delay: -0.7s; }
  ```

  Note: `animation-delay` with negative values starts the animation mid-cycle immediately, so all cards are already in different float phases the moment `.floating` is applied — no waiting for the first cycle.

  **Note on animation conflict**: When `.popped-in` is on the element, it has `animation: pop-in ...`. Once `.floating` is added, the CSS cascade means both `.popped-in` and `.floating` rules apply — but since `.floating` is declared later in the stylesheet and has equal specificity, it will override `.popped-in`'s animation property. This is the desired behavior since by the time `.floating` is added, pop-in has already completed (forwards fill holds opacity: 1, transform: scale(1)). To be safe, explicitly set `opacity: 1; transform: scale(1)` on `.floating` as the base so the visual state is preserved even as the float animation takes over.

  **Reduced motion**: In the existing `@media (prefers-reduced-motion: reduce)` block, add:
  ```css
  .hero-art-card.floating {
      animation: none;
  }
  ```

  **Must NOT do**: Don't apply float directly to `.hero-art-card.popped-in` via CSS animation chaining — it will interfere with the pop-in transform. The JS-scheduled `.floating` class approach keeps them cleanly separated.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:
  - `hero-visuals-example.html` lines 97–116 — existing keyframes block (add `card-float` here)
  - `hero-visuals-example.html` lines 241–244 — `.hero-art-card.popped-in` CSS rule
  - `hero-visuals-example.html` lines 847–858 — `animateCardsIn()` JS function (add float scheduling here)
  - `hero-visuals-example.html` lines 422–440 — reduced-motion block (add `.floating { animation: none }`)

  **Acceptance Criteria**:
  - [ ] `@keyframes card-float` exists in CSS
  - [ ] `.hero-art-card.floating` CSS rule exists with `animation: card-float 4s ease-in-out infinite`
  - [ ] `nth-child` offset rules exist for cards 2, 3, 4
  - [ ] `animateCardsIn()` schedules `.floating` class addition after pop-in completes
  - [ ] Reduced motion block disables float animation
  - [ ] Screenshot shows cards visually distinct from the static pre-fix version (cards appear alive)

  **Commit**: YES (groups with all fixes)

---

- [ ] 6. Fix modal/expanded card opacity

  **What to do**:
  The expanded card modal overlay (`.hero-art-card-overlay`) and the expanded card itself have opacity issues making content hard to see. Looking at the screenshot, the modal appears very washed out.

  Current CSS:
  ```css
  .hero-art-card-overlay {
      background-color: rgba(6, 107, 195, 0.8);  /* 80% opacity blue - too transparent */
  }
  ```

  The overlay at 0.8 opacity still lets too much of the background show through. Increase to 0.95 for better contrast:
  ```css
  .hero-art-card-overlay {
      background-color: rgba(6, 107, 195, 0.95);
  }
  ```

  Also check the expanded card's box-shadow for better depth perception:
  ```css
  .hero-art-card.expanded {
      box-shadow: 0 0 80px rgba(0, 0, 0, 0.7);  /* increase from 60px/0.55 to 80px/0.7 */
  }
  ```

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 8
  - **Blocked By**: Task 5

  **References**:
  - `hero-visuals-example.html` lines 269–277 — `.hero-art-card-overlay` CSS
  - `hero-visuals-example.html` lines 255–266 — `.hero-art-card.expanded` CSS

  **Acceptance Criteria**:
  - [ ] `.hero-art-card-overlay` has `background-color: rgba(6, 107, 195, 0.95)`
  - [ ] `.hero-art-card.expanded` has stronger box-shadow
  - [ ] Screenshot of expanded modal shows clearly readable content

  **Commit**: YES (groups with all fixes)

---

- [ ] 7. Increase card size variety and viewport responsiveness

  **What to do**:
  Current card sizes are too small and don't have enough differentiation:
  ```css
  .card-sm  { width: clamp(160px, 18vw, 220px); height: clamp(130px, 15vh, 190px); }
  .card-md  { width: clamp(200px, 22vw, 280px); height: clamp(170px, 20vh, 250px); }
  .card-lg  { width: clamp(240px, 26vw, 330px); height: clamp(200px, 24vh, 300px); }
  ```

  New sizes with more dramatic variety and better viewport scaling:
  ```css
  .card-sm  { width: clamp(200px, 22vw, 280px); height: clamp(160px, 18vh, 240px); }
  .card-md  { width: clamp(260px, 28vw, 360px); height: clamp(210px, 24vh, 320px); }
  .card-lg  { width: clamp(320px, 34vw, 440px); height: clamp(260px, 30vh, 400px); }
  ```

  This gives us:
  - ~1.6x width ratio between sm and lg (was ~1.5x)
  - ~1.7x height ratio between sm and lg (was ~1.5x)
  - Larger absolute sizes for better visibility
  - Stronger viewport scaling (vw/vh percentages increased)

  Also update mobile sizes proportionally:
  ```css
  @media (max-width: 768px) {
      .card-sm  { width: clamp(140px, 38vw, 200px); height: clamp(115px, 22vh, 180px); }
      .card-md  { width: clamp(170px, 46vw, 240px); height: clamp(140px, 26vh, 220px); }
      .card-lg  { width: clamp(200px, 52vw, 280px); height: clamp(165px, 30vh, 260px); }
  }
  ```

  **Must NOT do**: Don't change the card structure or content. Only update size CSS.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 8
  - **Blocked By**: Task 6

  **References**:
  - `hero-visuals-example.html` lines 237–239 — desktop card size classes
  - `hero-visuals-example.html` lines 444–446 — mobile card size classes

  **Acceptance Criteria**:
  - [ ] Desktop card sizes increased with more dramatic sm/md/lg differentiation
  - [ ] Mobile card sizes proportionally increased
  - [ ] Screenshot shows larger, more visually distinct cards

  **Commit**: YES (groups with all fixes)

---

- [ ] 8. Screenshot verify and commit

  **What to do**:
  Take two screenshots after all fixes are applied:
  ```bash
  chromium --headless=new --screenshot=.sisyphus/evidence/fix-verify-desktop.png --window-size=1440,900 --no-sandbox --virtual-time-budget=3500 "file:///home/jade/Jade/MUIjade/hero-visuals-example.html"
  chromium --headless=new --screenshot=.sisyphus/evidence/fix-verify-mobile.png --window-size=375,812 --no-sandbox --virtual-time-budget=3500 "file:///home/jade/Jade/MUIjade/hero-visuals-example.html"
  ```

  Read both images and verify the following checklist visually:
  - [ ] "ILLUSTRATOR & UX DESIGNER" subtitle is visible (not invisible)
  - [ ] Description paragraph is visible
  - [ ] Role tags (TUI / UX, Illustration, Graphic Design) are visible
  - [ ] All 4 cards are fully within viewport bounds (no clipping)
  - [ ] Illustration card and Korean/Print card images are clearly visible (not washed out)
  - [ ] `[↵]` appears in card top bars instead of "expand"
  - [ ] Cards are noticeably larger than before with clear size differentiation
  - [ ] Expanded modal content is clearly readable (not washed out)
  - [ ] (Float animation cannot be verified in a static screenshot — confirm JS code is present instead)

  If any check fails, fix the relevant issue before committing.

  Once all checks pass, commit:
  ```bash
  git add hero-visuals-example.html
  git commit -m "feat(hero): apply Interface Craft critique fixes + user feedback

  - Fix subtitle/description/roles opacity (add opacity:1 to .visible rules)
  - Fix card clamping bug (heroRect.height was double-counting header offset)
  - Reduce image overlay tint from 0.35 to 0.12
  - Replace 'expand' hints with terminal idiom [↵]
  - Add idle card-float animation (staggered phases, reduced-motion safe)
  - Increase modal overlay opacity for better readability (0.8 → 0.95)
  - Increase card sizes with more dramatic sm/md/lg variety"

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: Tasks 1–5

---

## Final Verification Wave

*(Skipped — this is a single-file playground change, not a production deploy. Visual screenshot review in Task 6 is sufficient.)*

---

## Commit Strategy

Single commit covering all 5 fixes (see Task 6 for message).

---

## Success Criteria

```bash
# All checks pass in screenshot review:
# ✓ Subtitle visible
# ✓ Description visible
# ✓ Cards not clipped
# ✓ Images less tinted
# ✓ [↵] in card bars
# ✓ Cards larger with size variety
# ✓ Modal content clearly readable
# ✓ float animation code present in file
```
