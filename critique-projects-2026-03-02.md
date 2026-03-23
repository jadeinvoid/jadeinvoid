# Design Critique — Projects Section
**Date:** 2026-03-02

---

## Context

The Projects section is where potential clients and employers evaluate Jade's work. They've come from the hero with curiosity already established — now they're deciding whether the work justifies the positioning. They're in fast-scan mode: looking for relevant work, assessing range and quality.

---

## First Impressions

The structural design is good — the section header, filter bar, and 3-column grid form a coherent system. The interaction model (keyboard shortcuts, tag filtering, modal detail) is sophisticated. But 5 of the 6 cards are placeholders: "Design Work #1", "Thumbnail / Illustration". The one real card (002, the illustration) makes the placeholders more obvious by contrast. No design decision can compensate for 83% of the portfolio having no real work shown. That's the most critical issue, and it should be addressed before anything else.

---

## Visual Design

**Card tags and filter tags speak different visual languages** — The filter bar uses path-style labels (`/tui`, `/graphic`) as borderless buttons with left-separator dividers. The card tags (`.card-tag`) are small bordered pills with `border: 1px solid var(--color-border)` and `2px 6px` padding. Both represent the same taxonomy on the same page, styled as if they came from different design systems. The card tags should mirror the filter tag style to create a coherent visual thread between filtering and the cards being filtered.

**`card-type` is redundant with `card-tags`** — Each card shows a type label ("Design", "Illustration") and tags (`/tui`, `/casestudy`). The type label duplicates what the tags already communicate more specifically. "Design" adds nothing that "/tui /casestudy" doesn't already say. It adds a line of text that flattens the card hierarchy without adding information.

**The `→` arrow is positioned outside the layout flow** — `.card-arrow` is `position: absolute; bottom: 24px; right: 24px`, but it lives inside `.card-meta` in the markup. It's visually detached from its semantic parent and can overlap card tags at shorter card heights. An absolutely positioned element inside a flex container is a structural mismatch that creates fragility when content changes.

**Dashed border on empty thumbnails** — `border: 1px dashed var(--color-border)` on `.card-thumb` is appropriate as a placeholder signal but should be suppressed when a real image fills the container. Card 002 is hiding it with the image, but the border is technically still there. When real images are added across cards, the dashed border will need explicit handling.

---

## Interface Design

**The section count "6 works" never updates** — The section header reads "6 works" regardless of the active filter. When filtering to Designs (3 cards), it still says "6 works." This isn't just an inaccuracy — it breaks the mental model of the filter. The count should reflect the visible set.

**Filter state change has no card-level feedback** — When a filter activates, cards disappear and appear but don't animate. The shortcut button gets an active outline and the tag group slides in — those transitions exist — but the cards themselves don't respond. Cards appearing after a filter change are indistinguishable from the initial load. A stagger entrance on filtered-in cards would make the system feel alive and confirm the filter worked.

**No empty state** — If a tag filter returns zero matching cards, the grid silently empties. No message, no feedback. In a TUI aesthetic, even a one-liner — `> no results for /animation` — would be on-brand and informative.

**Missed opportunity: connect filter tags to card tags** — The visitor sees `/tui` in the filter bar and `/tui` on a card. They're the same token but feel unrelated because they're styled differently. Making them visually identical would create a direct feedback loop: "I pressed /tui, and these are the cards tagged /tui."

---

## Consistency & Conventions

**Shortcut buttons still use the absorption hover (`opacity: 0`)** — `[1] Designs`, `[2] Illustrations`, `[3] Others` all fade to invisible on hover. These are the primary filter controls for the section — the most important interactive elements on this page. Making them disappear when hovered removes their label at the moment of decision. The same issue was identified and fixed on the hero CTA. The shortcut buttons deserve the same treatment — reverse video or a simple colour shift.

**Card number, title, type, and tags all share the same visual weight** — `card-num` (0.8em, secondary colour), `card-title` (1.1em, bold), `card-type` (0.8em, secondary, uppercase), `card-tags` (0.7em, bordered). Four metadata levels with no clear dominant element. The title is technically largest but the type label and tags crowd it. With `card-type` removed, the hierarchy becomes: number → title → tags, which is cleaner.

---

## User Context

The visitor has engaged with the hero and scrolled down with intent. They're now asking: "does the work match the confidence?" Placeholder cards answer that question negatively before they've seen a single piece of real work. The interaction model is built for a populated portfolio — keyboard shortcuts, filter groups, modal carousels — all of this infrastructure signals quality, but it only pays off when there's real content inside it. Right now the infrastructure is more impressive than what it holds.

---

## Top Opportunities

1. **Fill in real content** — placeholder cards are the single highest-impact change. Every other improvement is decorative until this is done.
2. **Update "6 works" dynamically** — one JS change, immediately makes the filter feel correct.
3. **Fix shortcut button hover** — remove the absorption effect on `[1][2][3]`; these are primary controls, not decorative links.
4. **Unify card tags with filter tags visually** — path-style, no border pill, consistent with the filter bar vocabulary.
5. **Remove `card-type` label** — redundant with tags, cleans up card hierarchy.
