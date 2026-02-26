# Jade's Portfolio — Session Log

**Date:** 2025-02-25  
**Session Focus:** Landing page responsive scaling, Projects section tag filtering overhaul, UX signifiers

---

## 1. Landing Page (Hero Section) Responsive Scaling

### Problem
Browser zoom/resize caused content to overflow and cards to get cut off.

### Solution
**CSS Changes:**
```css
/* Base font size now responsive */
--font-size-base: clamp(13px, 1.1vw + 0.3vh, 16px);

/* Header height as CSS variable */
--header-h: clamp(52px, 7vh, 68px);

/* Hero fixed to viewport minus header */
.hero {
    height: calc(100svh - var(--header-h));
    margin-top: var(--header-h);
}

/* Hero title scales with viewport */
.hero-title {
    font-size: clamp(1.6em, 3.5vw + 0.5vh, 2.5em);
}

/* Work cards use min-height instead of aspect-ratio */
.work-card {
    min-height: clamp(280px, 35vw, 480px);
    /* aspect-ratio: 3/4 removed */
}

/* Panels scroll independently if content overflows */
.hero-visuals { overflow-y: auto; }
.hero-content { overflow-y: auto; }
```

**Key Principle:** Use `clamp()` everywhere — font sizes, padding, gaps, heights all respond to viewport dimensions.

---

## 2. Projects Section Header Improvements

### Changes Made

**Height increase:**
```css
.section-header {
    height: 44px; /* was 36px */
}
```

**Count styling fixed:**
```css
.section-count {
    color: var(--color-text-primary);
    opacity: 0.45; /* removed double-dimming via text-secondary + opacity */
}
```

**Added separator:**
```html
<span class="section-sep">·</span> between title and count
```

**Added status strings for empty headers:**
- About: `── Montréal · Seoul ──`
- Contact: `── open to work ──`

---

## 3. Tag Filtering System Overhaul

### New Structure

**HTML:**
```html
<div class="tag-bar">
    <button class="tag-btn tag-all active" data-tag="all">/all</button>
    <span class="tag-hint">← tap to filter</span>  <!-- mobile only -->
    
    <div class="tag-group" data-group="design">
        <button class="tag-btn" data-tag="tui">/tui</button>
        <button class="tag-btn" data-tag="ux">/ux</button>
        <button class="tag-btn" data-tag="graphic">/graphic</button>
    </div>
    
    <div class="tag-group" data-group="illustration">
        <button class="tag-btn" data-tag="conceptart">/conceptart</button>
        <button class="tag-btn" data-tag="animation">/animation</button>
    </div>
    
    <div class="tag-group" data-group="misc">
        <button class="tag-btn" data-tag="casestudy">/casestudy</button>
        <button class="tag-btn" data-tag="research">/research</button>
        <button class="tag-btn" data-tag="misc.">/misc.</button>
    </div>
</div>
```

**Interaction Model:**
1. Click `[1] Designs` → design tag-group slides in, `/all` auto-selected
2. Click `[2] Illustrations` → illustration group replaces design group
3. Click individual tag → filter cards within that category
4. Click `/all` → show all cards in active category (or all 6 if no category)

**CSS for Group Transitions:**
```css
.tag-group {
    display: flex;
    max-width: 0;
    opacity: 0;
    transition: max-width 0.3s ease, opacity 0.25s ease;
}

.tag-group.visible {
    max-width: 600px;
    opacity: 1;
}
```

**Work Card Tags Updated:**
```html
<!-- Example -->
<article data-tags="design tui casestudy">
    <span class="card-tag">/tui</span>
    <span class="card-tag">/casestudy</span>
</article>
```

---

## 4. Shortcut Tab Bar — Desktop vs Mobile

### Desktop
```html
<div class="shortcut-tab-bar">
    <button data-filter="Design"><span class="shortcut-key">[1]</span> Designs</button>
    <button data-filter="Illustration"><span class="shortcut-key">[2]</span> Illustrations</button>
    <button data-filter="Misc"><span class="shortcut-key">[3]</span> Misc</button>
</div>
```

**Position:** Inside `.section-header`, pushed right with `margin-left: auto`

### Mobile
**Same HTML**, but CSS transforms it:

```css
@media (max-width: 768px) {
    .section-header {
        flex-wrap: wrap;
        height: auto;
    }
    
    .shortcut-tab-bar {
        width: 100%;
        margin-left: 0;
        border-bottom: 1px solid var(--color-border);
    }
    
    .shortcut-btn {
        flex: 1; /* equal width tabs */
        text-align: center;
    }
}
```

---

## 5. UX Signifiers — First-time User Guidance

### Desktop Hint Toast
**Shown once per browser (localStorage):**
```javascript
const HINT_KEY = 'works-hint-seen';

if (!localStorage.getItem(HINT_KEY)) {
    IntersectionObserver.observe(#works);
    // Show: ── press [1] [2] [3] to filter · /all to reset ──
    // After 4s: fade out → localStorage.setItem(HINT_KEY, '1')
}
```

**CSS:**
```css
.works-hint-toast {
    display: none; /* shown via JS */
    opacity: 0;
    transition: opacity 0.4s ease;
}
.works-hint-toast.visible { display: block; opacity: 1; }
```

### Mobile Tag Hint
**Shown until first interaction:**
```html
<span class="tag-hint">← tap to filter</span>
```

**Behavior:**
- First shortcut click → fade out → remove from DOM
- `localStorage.setItem('tag-hint-seen', '1')`

---

## 6. Shortcut Button Styling

### Final State
```css
.shortcut-btn {
    font-size: 0.8em;
    background: none;
    border: none;
    padding: 3px 8px;
    white-space: nowrap;
}

.shortcut-btn.active {
    color: var(--color-accent-1);
    background-color: rgba(232, 254, 197, 0.1);
    outline: 1px solid rgba(232, 254, 197, 0.35);
    outline-offset: -1px; /* outline doesn't affect layout */
}
```

**Removed:**
- ~~dashed underline~~
- ~~hover ▸ arrow~~
- ~~solid border on active~~ → replaced with outline

---

## Current Issues & TODO

### Completed Today
- ✅ Landing page responsive scaling
- ✅ Header components (logo alignment, section headers)
- ✅ Tag filtering with groups
- ✅ Desktop/mobile adaptive shortcut bar
- ✅ First-time user hints (toast + tag hint)

### Still TODO
1. **Project cards need real content** — currently placeholders
2. **Contact section** — update email/LinkedIn from placeholder
3. **Footer** — placeholder copyright text
4. **Hero TUI cards** — ASCII art is in place, but could use polish
5. **About section body text** — may need editing
6. **Skills list** — verify accuracy
7. **Mobile nav** — verify all interactions work
8. **Performance** — test with actual artwork images

---

## File Reference

**Primary file:** `/home/jade/Jade/MUIjade/index.html`  
**Logo asset:** `/home/jade/Jade/MUIjade/Logo.png`  
**Reference:** `/home/jade/Jade/MUIjade/wireframe.html` (original layout, read-only)

---

## Quick Restart Commands

If session is lost, here are the key CSS variable values to verify:

```css
:root {
    --color-text-primary: #e8fec5;
    --color-text-secondary: #a8d486;
    --color-background: #066bc3;
    --color-border: rgba(232, 254, 197, 0.3);
    --color-accent-1: #e8fec5;
    --font-size-base: clamp(13px, 1.1vw + 0.3vh, 16px);
    --header-h: clamp(52px, 7vh, 68px);
}
```

---

## Notes for Next Session

**Priority 1:** Fill in real project content (images, descriptions, actual case studies)
**Priority 2:** Test all filter combinations thoroughly
**Priority 3:** Verify mobile experience (especially tag-group slide transitions)
**Priority 4:** Consider adding lazy loading for project thumbnails
