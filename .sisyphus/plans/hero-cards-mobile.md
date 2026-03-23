# Hero Cards Mobile Simplification (hero-visuals-example.html)

## TL;DR
> On mobile/tablet, randomly cycle which 3 cards show — instead of always hiding the same 2 fixed cards.

## Context
- **Original request**: User wants fewer hero cards on smaller screens
- **Target file**: `hero-visuals-example.html` (not index.html)
- **Current state**: 5 cards (h, a, s, d, f) shown on all screen sizes
- **Target**: 3 cards on mobile/tablet — randomly selected from all 5 on each page load
- **New approach**: Instead of CSS hiding fixed cards, use JS to randomly pick 3 cards

---

## TODOs

- [ ] 1. Modify JS to randomly select 3 cards on mobile

  **What to do**:
  - In the JavaScript `placeCards()` function, detect mobile viewport (≤768px)
  - Before placing cards, randomly select only 3 cards from the 5 available
  - Hide/discard the other 2 cards (set `display: none` or remove from DOM)
  - Each page load will show a different combination

  **References**:
  - `hero-visuals-example.html:864-1010` — `placeCards()` function where cards are processed
  - `hero-visuals-example.html:871` — where cards are collected: `var cards = Array.prototype.slice.call(pool.querySelectorAll('.hero-art-card'));`
  - `hero-visuals-example.html:799` — `isMobile` already defined in `getCardPositions()`

  **Logic**:
  ```javascript
  // After collecting cards, if mobile:
  if (isMobile) {
      // Shuffle and pick 3
      cards.sort(() => Math.random() - 0.5);
      cards.slice(3).forEach(c => c.style.display = 'none');
      cards = cards.slice(0, 3);
  }
  ```

  **Acceptance Criteria**:
  - [ ] Mobile (≤768px) shows exactly 3 cards
  - [ ] Different combinations on each page reload
  - [ ] Desktop still shows all 5 cards

  **Commit**: NO
