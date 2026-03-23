# Draft: Hero Visual Restructuring

## Confirmed Requirements

### Changes (Experiment in hero-visuals-example.html)
1. **Layout**: Hero text heading & body centered in the viewport
2. **Pop-up TUI Screens**: Multiple TUI windows around the centered text displaying work
   - Staggered/asymmetric positioning (different sizes)
   - Positions regenerated randomly on every page refresh
   - Animated entrance sequence on page load
   - Keep modal expand/collapse behavior
3. **Typing Animation**: Hero text heading types out when user enters website
   - 50ms per character
   - Blinking cursor remains after typing finishes
   - Subtitle & description ease in after heading finishes

### What Stays the Same
- Content (card content, text, images)
- Visual style (colors, TUI aesthetic, typography)
- Modal expand/collapse behavior

### Animation Details (Final)
- **TUI Entrance**: Pop in staggered, fast & snappy (200-300ms total)
- **Typing**: 50ms/char, immediate on load, cursor keeps blinking
- **Subtitle**: Ease in after heading finishes typing
- **Mobile**: Same floating layout (scaled)

## Technical Approach

### Layout Strategy
- Use absolute positioning for TUI screens
- Random positions within safe bounds around centered text
- Different sizes for visual interest
- Z-index layering for depth

### Random Position Algorithm
```
Constraints:
- Minimum distance from centered text
- Minimum distance from viewport edges
- Minimum distance from other TUI screens
- Varying sizes (some larger "focus" cards, some smaller)
```

### Animation Sequence
1. Page load → Typing starts immediately (50ms/char)
2. After heading complete → Subtitle/description fade in (ease)
3. Concurrently/TUI screens pop in staggered (100-150ms apart)

### Files to Modify
- `hero-visuals-example.html`: Complete restructuring
- Later: Port to `index.html` if approved

## Post-Planning Step
- Consult `/interface-craft` for design critique after plan is ready
