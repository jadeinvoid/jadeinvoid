# Hero Section Entrance Animations

## TL;DR

> **Quick Summary**: Add entrance animations to hero section - character-by-character typing for the title AND fade+scale animation for all 4 hero cards, both triggering simultaneously on page load.
> 
> **Deliverables**: 
> - Modified hero title HTML with empty span for typing
> - CSS transitions for hero cards (initial hidden → visible)
> - JavaScript typing animation function
> - JavaScript hero cards reveal function
> - Coordinated page load initialization with accessibility support
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 → Task 2 → Tasks 3-5 → Tasks 6-8

---

## Context

### Original Request
User wants to add a typing animation to the hero title text "Designing at the edge of terminal and canvas." AND fade-in animation for the 4 hero cards when users open the website.

### Interview Summary
**Key Discussions**:
- Title typing: Character-by-character at 30ms per character, terminal aesthetic
- Cards animation: Fade + Scale up from center, 300-400ms duration
- Both trigger: On page load, simultaneously
- Both play: Once, no loop
- Accessibility: Must respect `prefers-reduced-motion` preference

**Research Findings**:
- Hero title at lines 1855-1858 in `index.html`
- Hero cards at lines 1754-1850 (4 cards in `.hero-visuals-inner` grid)
- Current HTML has `<h1 class="hero-title">` with text, `<br>` tags, and existing `<span class="cursor">_</span>`
- Cursor already has blink animation in CSS (lines 625-634)
- Cards have class `.hero-art-card` with `data-index` attributes (a, s, d, f)
- Single-file architecture - all changes in `index.html`
- No test infrastructure - manual browser verification required

### Technical Constraints
- Single-file architecture: All HTML/CSS/JS in `index.html`
- Must preserve existing cursor blink animation
- Must handle `<br>` tags correctly during typing
- Must respect user's motion preferences for BOTH animations
- Both animations should feel coordinated, starting at the same time

---

## Work Objectives

### Core Objective
Implement coordinated entrance animations for the hero section: progressive typing for the title and smooth fade+scale for all hero cards, creating a cohesive first-impression experience.

### Concrete Deliverables
- Modified `.hero-title` HTML structure in `index.html`
- CSS initial state and transitions for `.hero-art-card`
- `typeWriter()` function in JavaScript section
- `revealHeroCards()` function in JavaScript section
- Coordinated initialization code on page load

### Definition of Done
- [ ] Hero title types out character-by-character on page load
- [ ] Hero cards fade and scale up simultaneously with typing
- [ ] Animation speeds match specifications (30ms for typing, 300-400ms for cards)
- [ ] Animations play only once, do not loop
- [ ] Text respects line breaks (`<br>` tags)
- [ ] Existing cursor blink continues after typing completes
- [ ] Both animations skipped if user prefers reduced motion
- [ ] Timing feels coordinated and polished

### Must Have
- Character-by-character title reveal at 30ms
- Fade+scale card animation at 300-400ms
- Simultaneous trigger on page load for both
- Single execution (no loop) for both
- Accessibility support for reduced motion for both

### Must NOT Have (Guardrails)
- Do NOT modify other hero text elements (subtitle, description)
- Do NOT change existing cursor styling
- Do NOT add infinite loop to either animation
- Do NOT trigger on scroll (only on page load)
- Do NOT skip accessibility check
- Do NOT add staggered delays between cards
- Do NOT animate cards independently

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (no test framework)
- **Framework**: N/A
- **Agent-Executed QA**: ALWAYS (mandatory for all tasks)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **Verification**: Browser-based testing of both animations' timing, coordination, and behavior

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — HTML/CSS preparation):
├── Task 1: Update hero title HTML structure [quick]
└── Task 2: Add CSS transitions for hero cards [quick]

Wave 2 (After Wave 1 — JavaScript implementation, MAX PARALLEL):
├── Task 3: Implement typing animation function [quick]
├── Task 4: Implement hero cards reveal function [quick]
└── Task 5: Initialize both on page load with accessibility [quick]

Wave 3 (After Wave 2 — verification):
├── Task 6: Browser QA - verify both animations [unspecified-high]
├── Task 7: Timing coordination verification [unspecified-high]
└── Task 8: Accessibility verification [unspecified-high]
```

### Dependency Matrix

- **1**: — — 3, 5
- **2**: — — 4, 5
- **3**: 1 — 6, 7
- **4**: 2 — 6, 7
- **5**: 1, 2 — 6, 7, 8
- **6**: 3, 4, 5 — F1
- **7**: 3, 4, 5 — F1
- **8**: 5 — F1

### Agent Dispatch Summary

- **1**: **2** — T1 → `quick`, T2 → `quick`
- **2**: **3** — T3 → `quick`, T4 → `quick`, T5 → `quick`
- **3**: **3** — T6 → `unspecified-high`, T7 → `unspecified-high`, T8 → `unspecified-high`

---

## TODOs

- [ ] 1. **Update Hero Title HTML Structure**

  **What to do**:
  - Replace static text in `.hero-title` with empty `#typing-text` span
  - Keep existing `<span class="cursor">_</span>` element intact
  - Store the target text "Designing at the edge of terminal and canvas." for JavaScript reference
  - Preserve all `<br>` tag positions for line breaks

  **Must NOT do**:
  - Do NOT remove or modify the cursor span
  - Do NOT change any other hero text elements
  - Do NOT modify the `<h1>` wrapper or classes

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single HTML element modification, straightforward change
  - **Skills**: []
    - No specialized skills needed - simple HTML edit

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Task 2)
  - **Blocks**: Tasks 3, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:1855-1858` - Current hero title structure with cursor span

  **WHY Each Reference Matters**:
  - `index.html:1855-1858` - Shows current structure that needs to be modified while preserving cursor

  **Acceptance Criteria**:
  - [ ] Hero title contains empty `#typing-text` span
  - [ ] Cursor span remains unchanged
  - [ ] No other hero elements modified

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: HTML structure updated correctly
    Tool: Bash (grep)
    Preconditions: index.html exists
    Steps:
      1. grep -n 'id="typing-text"' index.html
      2. grep -n 'class="cursor"' index.html
    Expected Result: Both grep commands return exactly 1 match each
    Failure Indicators: Missing typing-text span or duplicate cursor spans
    Evidence: .sisyphus/evidence/task-1-html-structure.txt
  ```

  **Commit**: NO
  - Will commit with group after Task 8

---

- [ ] 2. **Add CSS Transitions for Hero Cards**

  **What to do**:
  - Add initial hidden state for `.hero-art-card`: `opacity: 0; transform: scale(0.95);`
  - Add CSS transition: `transition: opacity 350ms ease-out, transform 350ms ease-out;`
  - Add `.hero-art-card.visible` class: `opacity: 1; transform: scale(1);`
  - Place these rules in the CSS section (around line 299-310 where `.hero-art-card` is defined)

  **Must NOT do**:
  - Do NOT add transition to other elements
  - Do NOT change existing `.hero-art-card` positioning or layout
  - Do NOT create separate animation keyframes (use transitions)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Adding a few CSS rules to existing selector
  - **Skills**: []
    - No specialized skills needed - simple CSS addition

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (with Task 1)
  - **Blocks**: Tasks 4, 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:299-310` - Base `.hero-art-card` selector where new rules should be added

  **WHY Each Reference Matters**:
  - `index.html:299-310` - Shows the base card styling context; new transitions should be added here

  **Acceptance Criteria**:
  - [ ] Hero cards have initial `opacity: 0` and `transform: scale(0.95)`
  - [ ] CSS transition duration is 350ms (within 300-400ms range)
  - [ ] `.hero-art-card.visible` class sets opacity to 1 and scale to 1

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CSS transitions added correctly
    Tool: Bash (grep)
    Preconditions: index.html exists
    Steps:
      1. grep -A 3 '\.hero-art-card {' index.html | grep -E 'opacity|transform|transition'
      2. grep '\.hero-art-card\.visible' index.html
    Expected Result: Initial state has opacity:0 scale(0.95), visible class has opacity:1 scale(1)
    Failure Indicators: Missing initial state, missing visible class, or wrong values
    Evidence: .sisyphus/evidence/task-2-css-transitions.txt
  ```

  **Commit**: NO
  - Will commit with group after Task 8

---

- [ ] 3. **Implement Typing Animation Function**

  **What to do**:
  - Create `typeWriter()` function in JavaScript section (around line 2500)
  - Function should accept target element and text to type
  - Handle `<br>` tags by typing them as a single unit
  - Use `setTimeout` with 30ms delay per character
  - Use `innerHTML` to properly insert `<br>` tags
  - Return a Promise that resolves when typing is complete
  - Function signature: `function typeWriter(element, html, speed = 30)`

  **Must NOT do**:
  - Do NOT use `setInterval` (use `setTimeout` for better control)
  - Do NOT modify DOM outside the target element
  - Do NOT hardcode the text (should accept as parameter)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure function implementation, straightforward logic
  - **Skills**: []
    - No specialized skills needed - standard JavaScript

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 1 (needs HTML structure)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:2504-2519` - Example function declarations in the script section

  **WHY Each Reference Matters**:
  - `index.html:2504-2519` - Shows the coding style and function declaration pattern used in this codebase

  **Acceptance Criteria**:
  - [ ] `typeWriter()` function exists and is callable
  - [ ] Function types characters at 30ms intervals
  - [ ] Function handles `<br>` tags correctly
  - [ ] Function returns a Promise

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Typing function works correctly
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with index.html loaded
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Wait for 2 seconds
      3. Check if #typing-text contains the full text after animation
      4. Screenshot the hero section
    Expected Result: #typing-text contains "Designing at the\nedge of terminal\nand canvas." (with line breaks)
    Failure Indicators: #typing-text is empty or has partial text
    Evidence: .sisyphus/evidence/task-3-typing-function.png
  ```

  **Commit**: NO
  - Will commit with group after Task 8

---

- [ ] 4. **Implement Hero Cards Reveal Function**

  **What to do**:
  - Create `revealHeroCards()` function in JavaScript section
  - Select all `.hero-art-card` elements
  - Add `.visible` class to all cards simultaneously
  - Function should be simple: `document.querySelectorAll('.hero-art-card').forEach(card => card.classList.add('visible'))`

  **Must NOT do**:
  - Do NOT add delays between cards (all should animate together)
  - Do NOT animate cards one by one
  - Do NOT use animation libraries (use CSS transitions)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple DOM manipulation, one-liner function
  - **Skills**: []
    - No specialized skills needed - basic DOM API

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 3, 5)
  - **Blocks**: Tasks 6, 7
  - **Blocked By**: Task 2 (needs CSS transitions)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:2891` - Example of `querySelectorAll` usage on hero cards

  **WHY Each Reference Matters**:
  - `index.html:2891` - Shows the existing pattern for selecting hero cards in this codebase

  **Acceptance Criteria**:
  - [ ] `revealHeroCards()` function exists
  - [ ] Function adds `.visible` class to all hero cards
  - [ ] All 4 cards get the class simultaneously

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Cards reveal function works correctly
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with index.html loaded
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Wait for 1 second
      3. Check if all .hero-art-card elements have .visible class
      4. Check if all cards have opacity: 1 (visible)
    Expected Result: All 4 cards have .visible class and are fully visible
    Failure Indicators: Cards missing .visible class or still at opacity: 0
    Evidence: .sisyphus/evidence/task-4-cards-reveal.png
  ```

  **Commit**: NO
  - Will commit with group after Task 8

---

- [ ] 5. **Initialize Both Animations on Page Load**

  **What to do**:
  - Add `DOMContentLoaded` event listener
  - Check for `prefers-reduced-motion` media query
  - If reduced motion is preferred: show text immediately, add visible class to cards
  - If motion is OK: call `typeWriter()` AND `revealHeroCards()` simultaneously
  - Target text: "Designing at the<br>edge of terminal<br>and canvas."
  - Place this initialization code near the end of the script section (before line 3433)

  **Must NOT do**:
  - Do NOT add delays between the two animations
  - Do NOT wait for typing to finish before revealing cards
  - Do NOT skip the reduced motion check

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Event listener setup and conditional logic
  - **Skills**: []
    - No specialized skills needed - standard JS event handling

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 3, 4)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2 (needs HTML structure and CSS)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:2612` - Example of page load initialization and media query check

  **WHY Each Reference Matters**:
  - `index.html:2612` - Shows the pattern for page load logic and prefers-reduced-motion check

  **Acceptance Criteria**:
  - [ ] `DOMContentLoaded` listener is registered
  - [ ] Reduced motion check is performed
  - [ ] Both animations trigger simultaneously on page load
  - [ ] Text visible immediately if reduced motion is preferred

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Both animations trigger on page load
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with index.html loaded
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Start timer
      3. Wait for animations to complete (~2 seconds)
      4. Check if title has full text AND cards are visible
    Expected Result: Title text is fully typed, all cards are visible (opacity: 1)
    Failure Indicators: Text missing or cards still hidden after 2 seconds
    Evidence: .sisyphus/evidence/task-5-animations-trigger.png

  Scenario: Reduced motion preference is respected
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with prefers-reduced-motion enabled
    Steps:
      1. Emulate prefers-reduced-motion: reduce
      2. Navigate to file:///home/jade/Jade/MUIjade/index.html
      3. Check if text appears immediately (within 100ms)
      4. Check if cards are visible immediately
    Expected Result: Text and cards visible immediately without animation
    Failure Indicators: Text takes time to appear or cards animate in
    Evidence: .sisyphus/evidence/task-5-reduced-motion.png
  ```

  **Commit**: NO
  - Will commit with group after Task 8

---

- [ ] 6. **Browser QA - Verify Both Animations**

  **What to do**:
  - Open `index.html` in browser
  - Verify title typing animation plays on page load
  - Verify cards fade+scale animation plays simultaneously
  - Take screenshots before, during, and after animations
  - Verify visual quality of both animations

  **Must NOT do**:
  - Do NOT modify any code
  - Do NOT skip the visual verification
  - Do NOT test on only one browser

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Thorough manual verification requiring attention to detail
  - **Skills**: [`playwright`]
    - `playwright`: Needed for browser automation and screenshots

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Final Verification
  - **Blocked By**: Tasks 3, 4, 5 (needs both animations implemented)

  **References**:

  **Pattern References** (existing code to follow):
  - N/A - This is verification only

  **Acceptance Criteria**:
  - [ ] Title typing animation visible in browser
  - [ ] Cards fade+scale animation visible
  - [ ] Screenshots captured at 3 stages
  - [ ] Visual quality is acceptable

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Visual verification of animations
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with index.html loaded
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Take screenshot at 0ms (immediate)
      3. Take screenshot at 500ms (during animation)
      4. Take screenshot at 2500ms (after completion)
      5. Verify title has full text in final screenshot
      6. Verify cards are visible in final screenshot
    Expected Result: Progression of animations visible across screenshots
    Failure Indicators: No change between screenshots or animations missing
    Evidence: .sisyphus/evidence/task-6-animation-stages/
  ```

  **Commit**: NO
  - Verification only

---

- [ ] 7. **Timing Coordination Verification**

  **What to do**:
  - Measure actual typing speed (should be ~30ms per character)
  - Measure actual cards animation duration (should be 300-400ms)
  - Verify both animations start at the same time (within 50ms)
  - Document actual timings for acceptance criteria validation

  **Must NOT do**:
  - Do NOT modify animation timing
  - Do NOT add timing instrumentation to code

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires precise timing measurement
  - **Skills**: [`playwright`]
    - `playwright`: Needed for timing measurement with page evaluation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 6, 8)
  - **Blocks**: Final Verification
  - **Blocked By**: Tasks 3, 4, 5 (needs both animations running)

  **References**:

  **Pattern References** (existing code to follow):
  - N/A - This is timing measurement only

  **Acceptance Criteria**:
  - [ ] Typing speed is approximately 30ms per character (±10ms)
  - [ ] Cards animation duration is 300-400ms
  - [ ] Both animations start within 50ms of each other

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Timing measurements are correct
    Tool: Playwright (with playwright skill)
    Preconditions: Browser with index.html loaded
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Record start time when DOMContentLoaded fires
      3. Record time when typing completes
      4. Calculate typing speed (duration / number of characters)
      5. Record time when cards reach opacity: 1
      6. Calculate cards animation duration
    Expected Result: Typing ~30ms/char, cards ~350ms, both start simultaneously
    Failure Indicators: Wrong speeds or staggered starts
    Evidence: .sisyphus/evidence/task-7-timing-measurements.json
  ```

  **Commit**: NO
  - Verification only

---

- [ ] 8. **Accessibility Verification**

  **What to do**:
  - Test with `prefers-reduced-motion: reduce` enabled
  - Verify both animations are skipped
  - Verify text appears immediately
  - Verify cards appear immediately
  - Document accessibility behavior

  **Must NOT do**:
  - Do NOT modify accessibility logic
  - Do NOT skip this verification

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Accessibility testing requires careful verification
  - **Skills**: [`playwright`]
    - `playwright`: Needed for emulating reduced motion preference

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (with Tasks 6, 7)
  - **Blocks**: Final Verification
  - **Blocked By**: Task 5 (needs accessibility logic implemented)

  **References**:

  **Pattern References** (existing code to follow):
  - `index.html:2612` - Shows existing prefers-reduced-motion pattern

  **Acceptance Criteria**:
  - [ ] Animations skipped when reduced motion is preferred
  - [ ] Text visible immediately in reduced motion mode
  - [ ] Cards visible immediately in reduced motion mode

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Reduced motion preference is respected
    Tool: Playwright (with playwright skill)
    Preconditions: Browser supporting prefers-reduced-motion
    Steps:
      1. Emulate prefers-reduced-motion: reduce
      2. Navigate to file:///home/jade/Jade/MUIjade/index.html
      3. Check if title text is fully visible within 100ms
      4. Check if all cards are fully visible within 100ms
      5. Take screenshot showing immediate visibility
    Expected Result: Both title and cards visible instantly, no animation
    Failure Indicators: Animation plays or content takes time to appear
    Evidence: .sisyphus/evidence/task-8-accessibility.png
  ```

  **Commit**: NO
  - Verification only

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify both animations exist and work. Check for forbidden modifications.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Browser QA Verification** — `unspecified-high` (+ `playwright` skill)
  Open index.html in browser. Verify both animations play on load. Check timing, coordination, cursor behavior, and accessibility.
  Output: `Title Animation [PASS/FAIL] | Cards Animation [PASS/FAIL] | Coordination [PASS/FAIL] | Accessibility [PASS/FAIL] | VERDICT`

---

## Commit Strategy

- **1**: Single commit after all tasks complete
- Message: `feat(hero): add entrance animations for title and cards`
- Files: `index.html`

---

## Success Criteria

### Verification Commands
```bash
# Open in browser and verify:
# - Title typing animation plays on page load
# - Cards fade+scale animation plays simultaneously
# - Timing: ~30ms per character, 300-400ms for cards
# - No looping for either
# - Works with prefers-reduced-motion
# - Both feel coordinated
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Both animations work in browser
- [ ] Animations feel coordinated
- [ ] Accessibility check passes
