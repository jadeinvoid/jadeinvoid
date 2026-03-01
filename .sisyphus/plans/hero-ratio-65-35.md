# Hero Layout Adjustment: 65/35 Ratio with Card Grid Constraint

## Objective
Adjust the hero section layout from 50/50 to 65/35 ratio, while preventing the art cards from stretching too wide by adding a max-width constraint to the left column.

## Context
The hero section currently uses a 2-column grid with equal width (1fr 1fr). The user wants to give more visual weight to the left side (art cards) at 65%, while keeping the text area at 35%. However, concern is that the 2×2 card grid would stretch horizontally and look too long/wide.

## Implementation

### File to Modify
- `/home/jade/Jade/MUIjade/index.html`

### CSS Changes Required

**Change 1: Adjust Hero Grid Ratio**
```css
.hero {
    /* existing code stays the same */
    grid-template-columns: 65fr 35fr;  /* changed from: 1fr 1fr */
    /* rest stays same */
}
```

**Change 2: Add Max-Width Constraint to Card Grid**
```css
.hero-visuals {
    /* existing code stays the same */
    max-width: 800px;        /* NEW - prevents cards from stretching too wide */
    justify-self: center;    /* NEW - centers the constrained grid in the 65% column */
    /* rest stays same */
}
```

### Expected Result
- Left column (cards): Gets 65% of the viewport width
- Card grid: Constrained to max 800px, centered within that 65%
- Cards maintain proportional square-ish appearance
- Right column (text): Gets 35% of the viewport width
- Text column feels more appropriately sized relative to the visual weight

### Verification Steps
1. Open `index.html` in browser
2. Check that left column takes ~65% of screen width
3. Verify cards don't stretch beyond ~800px width total
4. Confirm cards look proportional (not too wide/squat)
5. Check right text column is ~35% width
6. Verify layout still works on mobile (≤768px should stack)

## Success Criteria
- [ ] Hero grid is 65/35 split
- [ ] Card grid has max-width constraint
- [ ] Cards remain proportional and visually balanced
- [ ] Mobile responsive layout still works

## Single Edit Location
Lines ~263 and ~268-276 in index.html CSS block