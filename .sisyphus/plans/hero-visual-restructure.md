# Hero Visual Restructuring

## TL;DR

> **Quick Summary**: Transform the static 2x2 hero grid into a dynamic, centered layout with floating TUI screens and typing animations.
> 
> **Deliverables**: 
> - Centered hero text (heading + body) with typing animation
> - Floating TUI screens with random staggered positions (regenerate on refresh)
> - Pop-in entrance animations for TUI screens
> - Blinking cursor that persists after typing finishes
> - Responsive layout maintained for mobile
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - Sequential (CSS → HTML structure → JS animations → Polish)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4

---

## Context

### Original Request
Transform the hero section from a static 2x2 grid into a dynamic, centered layout with floating TUI screens and typing animations.

### Interview Summary
**Key Discussions**:
- **Layout**: Hero text (heading + body) centered in viewport
- **TUI Screens**: Staggered/asymmetric positioning around centered text
- **Dynamic Positions**: Regenerate randomly on every page refresh
- **Typing Animation**: 50ms/char, immediate on load, cursor keeps blinking after finish
- **Subtitle**: Ease in after heading finishes typing
- **TUI Entrance**: Pop in staggered, fast & snappy (200-300ms total)
- **Modal Behavior**: Keep existing expand/collapse functionality
- **Visual Style**: Same content, same TUI aesthetic
- **Mobile**: Keep same floating layout (scaled)

### Test Infrastructure Assessment
- **No test infrastructure exists** in this project
- **No automated tests** required for this visual/interaction work
- **Agent-Executed QA** via Playwright will verify all animations and interactions

---

## Work Objectives

### Core Objective
Restructure the hero section layout from a static 2x2 grid to a dynamic, centered composition with floating TUI screens and typing animations, while preserving all existing content and modal behaviors.

### Concrete Deliverables
1. `hero-visuals-example.html` - Complete restructured hero with:
   - Centered text container with typing animation
   - Floating TUI screens with random positions
   - Entrance animation sequence
   - Preserved modal expand/collapse

### Definition of Done
- [ ] Hero text is centered in viewport
- [ ] TUI screens appear in random staggered positions on each refresh
- [ ] Heading types out at 50ms/char with blinking cursor
- [ ] Subtitle/description fade in after heading completes
- [ ] TUI screens pop in staggered (100-150ms apart)
- [ ] Modal expand/collapse works on all TUI screens
- [ ] Layout is responsive and works on mobile

### Must Have
- Typing animation for heading (50ms/char)
- Blinking cursor that persists after typing
- Random TUI screen positions (regenerate on refresh)
- Staggered entrance animations (fast & snappy)
- Preserved modal expand/collapse behavior
- Same content in all 4 TUI screens

### Must NOT Have (Guardrails)
- No changes to TUI visual style or colors
- No changes to card content (text, images)
- No changes to modal behavior logic
- No new dependencies (keep single-file architecture)
- No human intervention required for testing

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NO
- **Agent-Executed QA**: MANDATORY — Playwright verification for all animations

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/`.

- **Frontend/UI**: Use Playwright — Navigate, verify animations, test interactions, screenshot
- **Each scenario**: exact selectors, timing, expected results, evidence paths

---

## Execution Strategy

### Parallel Execution Waves

This is a **sequential workflow** — each task builds on the previous:

```
Wave 1 (Sequential — CSS foundation):
├── Task 1: CSS structure for centered layout + floating cards

Wave 2 (Sequential — HTML structure):  
├── Task 2: Restructure HTML for centered hero + floating TUI screens

Wave 3 (Sequential — JavaScript animations):
├── Task 3: Implement typing animation with cursor
├── Task 4: Implement TUI screen entrance animations + random positioning

Wave 4 (Sequential — Polish & QA):
├── Task 5: Responsive mobile layout + final QA

Wave FINAL (Parallel review):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Visual/interaction QA (unspecified-high + playwright)
```

### Agent Dispatch Summary

- **Wave 1**: `visual-engineering` — Task 1 (CSS structure)
- **Wave 2**: `visual-engineering` — Task 2 (HTML restructure)  
- **Wave 3**: `unspecified-high` — Task 3 + 4 (JS animations)
- **Wave 4**: `visual-engineering` — Task 5 (responsive + polish)
- **FINAL**: `oracle` + `unspecified-high` — F1 + F2 (review)

---

## TODOs

- [ ] 1. CSS Structure for Centered Layout + Floating Cards

  **What to do**:
  - Add CSS for centered hero text container
  - Add CSS for absolutely positioned TUI screens with random placement capability
  - Add CSS variables for animation timing (--typing-speed: 50ms, --pop-in-delay: 150ms, etc.)
  - Add CSS animations for: pop-in, fade-in, typing cursor blink
  - Ensure z-index layering works correctly (text above cards or vice versa?)
  - Keep existing TUI frame styling (colors, borders, etc.)

  **Must NOT do**:
  - Do NOT change TUI visual style (colors, borders, fonts)
  - Do NOT add external CSS files — keep single-file architecture
  - Do NOT modify HTML structure yet (CSS only)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS layout, positioning, and animation work
  - **Skills**: `playwright` (for QA screenshots)
    - `playwright`: Verify layout renders correctly in browser

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential dependency chain)
  - **Parallel Group**: Wave 1 (first task)
  - **Blocks**: Task 2 (HTML structure depends on CSS classes)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `hero-visuals-example.html` lines 42-302 - Current CSS structure
  - `index.html` lines 267-606 - Existing hero CSS (for reference on TUI styling)
  - Key patterns to follow: `.tui-frame`, `.hero-art-card`, `.tui-top-bar`, `.tui-content`, `.tui-bottom-bar`

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: CSS loads without errors
    Tool: Playwright
    Preconditions: hero-visuals-example.html has new CSS added
    Steps:
      1. Open hero-visuals-example.html in browser
      2. Open DevTools → Elements → Styles
      3. Verify no red error lines in CSS
    Expected Result: Zero CSS parsing errors
    Evidence: .sisyphus/evidence/task-1-css-loads.png

  Scenario: Centered text container CSS exists
    Tool: Playwright
    Preconditions: CSS from this task added
    Steps:
      1. Open page
      2. Inspect hero section
      3. Verify centered container class exists with: display:flex, justify-content:center, align-items:center
    Expected Result: CSS class for centered layout exists
    Evidence: .sisyphus/evidence/task-1-centered-css.png
  ```

  **Evidence to Capture**:
  - Screenshot of DevTools showing new CSS classes
  - Screenshot of page layout (even if content not restructured yet)

  **Commit**: NO (groups with final wave)

---

- [ ] 2. Restructure HTML for Centered Hero + Floating TUI Screens

  **What to do**:
  - Restructure hero section HTML: wrap text in centered container
  - Convert 4 cards from grid layout to absolutely positioned elements
  - Add data attributes for content (keep same content: Design/TUI, Illustration, Korean/Print, Process/Misc)
  - Ensure semantic structure (screen readers can understand the layout)
  - Keep all existing card content (text, images, captions)
  - Keep all existing buttons ([esc], [o] open)

  **Must NOT do**:
  - Do NOT change card content (text, images)
  - Do NOT remove modal expand/collapse buttons
  - Do NOT change TUI frame structure (must keep .tui-frame, .tui-top-bar, etc.)
  - Do NOT add new HTML files

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: HTML structure and layout
  - **Skills**: `playwright` (for QA)
    - `playwright`: Verify HTML structure is correct

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 3 (typing animation depends on heading element existing)
  - **Blocked By**: Task 1 (CSS classes must exist first)

  **References**:
  - `hero-visuals-example.html` lines 309-423 - Current card HTML structure
  - `index.html` lines 1747-1874 - Original hero HTML (for content reference)
  - Current card content to preserve: Card 1 (Design/TUI), Card 2 (Illustration), Card 3 (Korean/Print), Card 4 (Process/Misc)

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: All 4 cards exist in HTML
    Tool: Playwright
    Preconditions: HTML restructured
    Steps:
      1. Open page
      2. Run document.querySelectorAll('.hero-art-card')
      3. Verify length === 4
    Expected Result: 4 cards exist
    Evidence: .sisyphus/evidence/task-2-card-count.png

  Scenario: Centered text container exists
    Tool: Playwright
    Preconditions: HTML restructured
    Steps:
      1. Inspect hero section
      2. Verify centered container exists with heading, subtitle, description
      3. Check heading text matches: "Designing at the edge of terminal and canvas."
    Expected Result: Centered container exists with correct content
    Evidence: .sisyphus/evidence/task-2-centered-container.png

  Scenario: Cards have absolute positioning capability
    Tool: Playwright
    Preconditions: HTML restructured, CSS from Task 1 applied
    Steps:
      1. Inspect card elements
      2. Verify they can be absolutely positioned (have position class or inline style capability)
    Expected Result: Cards ready for random positioning
    Evidence: .sisyphus/evidence/task-2-positioning-ready.png
  ```

  **Evidence to Capture**:
  - Screenshot showing all 4 cards in DOM
  - Screenshot showing centered text container
  - Screenshot of DevTools showing card structure preserved

  **Commit**: NO (groups with final wave)

---

- [ ] 3. Implement Typing Animation with Cursor

  **What to do**:
  - Implement typing animation for hero heading
  - Speed: 50ms per character
  - Trigger: immediately on page load
  - Cursor: blinking `|` that persists after typing finishes
  - Heading text: "Designing at the edge of terminal and canvas."
  - After typing completes: trigger subtitle/description fade-in
  - Use JavaScript (not CSS typing animation) for precise control
  - Handle edge case: if user leaves page and returns, animation should not restart mid-way (or should it?)

  **Must NOT do**:
  - Do NOT use CSS-only typing animation (no control over timing per character)
  - Do NOT remove cursor after typing (must keep blinking)
  - Do NOT animate subtitle or description during typing (they wait)
  - Do NOT use external libraries

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: JavaScript animation logic
  - **Skills**: `playwright`, `interface-craft`
    - `playwright`: Verify animation timing and cursor behavior
    - `interface-craft`: For animation timing consultation if needed

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 4 (TUI entrance should wait for typing, or run concurrently? - concurrent is fine)
  - **Blocked By**: Task 2 (heading element must exist)

  **References**:
  - Current cursor animation in index.html: lines 625-634 (CSS blink keyframes)
  - Text content from index.html line 1855-1858: "Designing at the edge of terminal and canvas."

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Typing animation reveals heading character by character
    Tool: Playwright
    Preconditions: Page loaded, JS from this task added
    Steps:
      1. Navigate to hero-visuals-example.html
      2. Wait for page load
      3. Observe heading text appears one character at a time
      4. Count characters: "Designing at the edge of terminal and canvas." = ~46 chars
      5. At 50ms/char, total time ~2.3 seconds
    Expected Result: Heading types out over ~2.3 seconds
    Evidence: .sisyphus/evidence/task-3-typing-animation.gif (screen recording)

  Scenario: Blinking cursor persists after typing finishes
    Tool: Playwright
    Preconditions: Typing animation completed
    Steps:
      1. Wait for typing to complete (~2.5 seconds)
      2. Observe cursor at end of heading
      3. Wait 2 more seconds
      4. Verify cursor is still blinking
    Expected Result: Cursor continues blinking indefinitely
    Evidence: .sisyphus/evidence/task-3-cursor-persists.gif

  Scenario: Subtitle fades in after heading completes
    Tool: Playwright
    Preconditions: Typing animation in progress or complete
    Steps:
      1. Observe subtitle during typing - should be hidden or opacity 0
      2. Wait for typing to complete
      3. Observe subtitle fades in (opacity transition)
    Expected Result: Subtitle appears after heading finishes typing
    Evidence: .sisyphus/evidence/task-3-subtitle-fade.gif

  Scenario: Animation timing is 50ms per character
    Tool: Playwright
    Preconditions: Animation running
    Steps:
      1. Record screen for 3 seconds from load
      2. Count characters revealed in first second (should be ~20 chars at 50ms each)
    Expected Result: ~20 characters visible after 1 second
    Evidence: .sisyphus/evidence/task-3-timing-check.gif
  ```

  **Evidence to Capture**:
  - Screen recording (gif) of typing animation
  - Screenshot of cursor blinking after completion
  - Screen recording of subtitle fade-in

  **Commit**: NO (groups with final wave)

---

- [ ] 4. Implement TUI Screen Entrance Animations + Random Positioning

  **What to do**:
  - Implement random position generation for 4 TUI screens on each refresh
  - Positions must be: 
    - Around centered text (not overlapping)
    - Within viewport bounds (with padding from edges)
    - Staggered/asymmetric (different sizes: 2 larger "focus", 2 smaller)
    - Different z-index for depth
  - Animation: pop-in staggered, 100-150ms apart
  - Total animation: fast & snappy (200-300ms per card)
  - Animation style: scale + opacity (0→1, 0.8→1 scale)
  - Ensure positions don't overlap with each other or centered text
  - Regenerate positions on every page load (no persistence)

  **Must NOT do**:
  - Do NOT hardcode positions (must be random)
  - Do NOT allow overlapping cards
  - Do NOT change card content
  - Do NOT break modal expand/collapse

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex JS animation + positioning logic
  - **Skills**: `playwright`, `interface-craft`
    - `playwright`: Verify animations and positions
    - `interface-craft`: For animation timing refinement

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 3 for timing coordination, but can run concurrently with typing)
  - **Parallel Group**: Wave 3 (runs concurrently with Task 3)
  - **Blocks**: Task 5 (responsive testing)
  - **Blocked By**: Task 2 (cards must exist)

  **References**:
  - Card expansion animation in index.html: lines 313-316
  - Modal animation: lines 1376-1410
  - Positioning approach: absolute positioning with % or vw/vh units

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: TUI screens appear in different positions on refresh
    Tool: Playwright
    Preconditions: Page loaded once
    Steps:
      1. Record positions of 4 cards (screenshot with coordinates)
      2. Refresh page
      3. Record new positions
      4. Compare - positions should be different
    Expected Result: Different positions on each refresh
    Evidence: .sisyphus/evidence/task-4-positions-1.png, task-4-positions-2.png

  Scenario: Cards don't overlap centered text
    Tool: Playwright
    Preconditions: Page loaded, cards positioned
    Steps:
      1. Take screenshot with all cards visible
      2. Visually verify no card overlaps the centered text area
    Expected Result: Text remains readable, cards positioned around it
    Evidence: .sisyphus/evidence/task-4-no-overlap.png

  Scenario: Entrance animation is staggered pop-in
    Tool: Playwright
    Preconditions: Page load
    Steps:
      1. Record screen from load for 1 second
      2. Verify cards appear one after another (not all at once)
      3. Verify animation is fast (~200-300ms per card)
    Expected Result: Staggered pop-in animation
    Evidence: .sisyphus/evidence/task-4-entrance-animation.gif

  Scenario: 4 cards exist with different sizes
    Tool: Playwright
    Preconditions: Animation complete
    Steps:
      1. Measure sizes of 4 cards
      2. Verify at least 2 different sizes (e.g., 2 larger, 2 smaller)
    Expected Result: Visual variety in card sizes
    Evidence: .sisyphus/evidence/task-4-sizes.png

  Scenario: Modal expand still works on positioned cards
    Tool: Playwright
    Preconditions: Cards positioned and animated in
    Steps:
      1. Click on each card
      2. Verify expand modal appears
      3. Click overlay or [esc] to close
    Expected Result: All 4 cards can expand/collapse
    Evidence: .sisyphus/evidence/task-4-modal-works.gif
  ```

  **Evidence to Capture**:
  - Screenshots showing different positions on multiple refreshes
  - Screen recording of entrance animation
  - Screenshot showing card size variety
  - Screen recording of modal working on positioned cards

  **Commit**: NO (groups with final wave)

---

- [ ] 5. Responsive Mobile Layout + Final Polish

  **What to do**:
  - Ensure layout works on mobile (max-width: 768px, 480px)
  - Scale down TUI screen sizes for mobile
  - Adjust random positioning algorithm for smaller viewports
  - Ensure centered text is readable on small screens
  - Test typing animation on mobile viewport
  - Test modal expand/collapse on mobile
  - Add any final polish: hover states, transitions, accessibility
  - Ensure `cursor: none` is preserved (from index.html)

  **Must NOT do**:
  - Do NOT remove cursor hiding (must keep `cursor: none !important`)
  - Do NOT create separate mobile layout (keep floating design)
  - Do NOT remove any functionality

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Responsive design and polish
  - **Skills**: `playwright`
    - `playwright`: Test at multiple viewport sizes

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: FINAL wave (must complete first)
  - **Blocked By**: Task 3 + 4 (animations must work)

  **References**:
  - Mobile styles in index.html: lines 1194-1360
  - Responsive patterns: grid changes, font scaling, padding adjustments

  **Acceptance Criteria**:

  **QA Scenarios:**
  ```
  Scenario: Layout works at 768px width
    Tool: Playwright
    Preconditions: All tasks complete
    Steps:
      1. Set viewport to 768x1024
      2. Refresh page
      3. Verify text is centered and readable
      4. Verify cards are positioned (may be fewer/smaller)
      5. Verify no horizontal scroll
    Expected Result: Layout adapts to tablet size
    Evidence: .sisyphus/evidence/task-5-768px.png

  Scenario: Layout works at 375px width (iPhone)
    Tool: Playwright
    Preconditions: All tasks complete
    Steps:
      1. Set viewport to 375x812
      2. Refresh page
      3. Verify text is centered
      4. Verify cards visible and not overlapping text
      5. Test modal expand/collapse
    Expected Result: Mobile layout works
    Evidence: .sisyphus/evidence/task-5-mobile.png

  Scenario: Typing animation works on mobile
    Tool: Playwright
    Preconditions: Mobile viewport
    Steps:
      1. Load page at 375px width
      2. Verify typing animation plays
      3. Verify cursor persists
    Expected Result: Animation works on mobile
    Evidence: .sisyphus/evidence/task-5-mobile-typing.gif

  Scenario: Cursor is hidden (desktop)
    Tool: Playwright
    Preconditions: Desktop viewport
    Steps:
      1. Load page
      2. Verify `cursor: none !important` applied to body
      3. Verify custom cursor or no cursor visible
    Expected Result: Cursor hidden as per design
    Evidence: .sisyphus/evidence/task-5-cursor-hidden.png
  ```

  **Evidence to Capture**:
  - Screenshots at 768px, 480px, 375px widths
  - Screen recording of mobile typing animation
  - Screenshot showing cursor styling

  **Commit**: YES
  - Message: `feat(hero): dynamic centered layout with floating TUI screens and typing animation`
  - Files: `hero-visuals-example.html`

---
## Final Verification Wave (after ALL implementation tasks)

> 2 review agents run in PARALLEL. ALL must APPROVE.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify:
  - All 4 TUI cards exist with original content
  - Centered text layout implemented
  - Typing animation at 50ms/char
  - Random positioning on each refresh
  - Modal expand/collapse preserved
  - Check evidence files exist in .sisyphus/evidence/.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Visual/Interaction QA** — `unspecified-high` + `playwright` skill
  Execute ALL QA scenarios from EVERY task — follow exact steps, capture evidence.
  Test cross-browser consistency:
  - Chrome/Edge: full functionality
  - Safari: verify animations work
  - Firefox: verify positioning works
  Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Browsers [N/N] | VERDICT`

---

## Commit Strategy

- **Single commit** after all tasks complete (Wave 4)
- Commit message: `feat(hero): dynamic centered layout with floating TUI screens and typing animation`
- Files: `hero-visuals-example.html`

---

## Success Criteria

### Verification Commands
```bash
# No build step - open file directly
open hero-visuals-example.html  # macOS
# OR
xdg-open hero-visuals-example.html  # Linux
```

### Final Checklist
- [ ] Hero text is centered in viewport
- [ ] Heading types out at 50ms/char
- [ ] Cursor blinks and persists after typing
- [ ] Subtitle fades in after heading completes
- [ ] 4 TUI screens appear with random positions on each refresh
- [ ] TUI entrance animation is staggered pop-in (fast)
- [ ] Modal expand/collapse works on all cards
- [ ] Layout is responsive (works on mobile)
- [ ] Cursor hiding preserved
- [ ] All original content preserved

---

## Design Critique (Post-Planning)

**Next Step**: Consult `/interface-craft` skill for animation timing and interaction refinement recommendations.

The interface-craft skill provides:
- **Storyboard Animation**: Human-readable animation DSL with stage-driven sequencing
- **DialKit**: Live control panels for tuning animation values  
- **Design Critique**: Systematic UI review based on Josh Puckett's methodology

This will be invoked after the plan is finalized to refine:
- Typing animation easing
- TUI entrance timing
- Pop-in animation physics
- Cursor blink timing
