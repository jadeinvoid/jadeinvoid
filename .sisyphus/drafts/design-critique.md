# Design Critique — jadeinvoid.github.io
**Date**: 2026-03-02
**Reviewer**: Interface Craft methodology (Josh Puckett)
**Scope**: Hierarchy, layout, user experience — full site

---

## Context
This is a portfolio site for Jade, an illustrator and UX designer. The target audience is potential clients and collaborators who need to quickly assess her style, capabilities, and personality. The emotional context is low-stakes browsing — someone curious, casually deciding whether to reach out.

---

## First Impressions

The site has a strong, distinctive visual identity. The saturated cobalt blue, monospace font, and TUI chrome (card headers with `[a]`, `[s]`, `[d]`, `[f]` key labels) is a coherent, opinionated aesthetic choice that immediately communicates who this designer is. That part works. What doesn't work is that the page feels like it was designed from the left side outward — the card grid dominates visually (60% width), while the actual introduction — the text where a visitor decides whether to care — is pushed into a narrow right column where it almost disappears. The typing animation was caught mid-render (`Desi_`), which exposes a second issue: the page relies on animation to deliver core content, which is risky. The full-page screenshot reveals the most serious problem: the hero card grid scrolls to a massive height because the images inside aren't constrained, making the cards hundreds of pixels taller than the viewport. That layout bug is structural.

---

## Visual Design

**Hierarchy inversion in the hero** — The hero section gives 60% of the width to four preview cards and 40% to the introduction text. But the introduction text is what communicates Jade's identity, value, and voice. The cards are supporting content — interesting visuals, but context-setters, not the main message. The visual weight is allocated in reverse of semantic importance. The title "Designing at the edge of terminal and canvas" should be the loudest thing on screen; instead it's rendered in a mid-size typeface in a narrow column competing with four busy image panels.

**Title size is too conservative** — The `hero-title` renders at `clamp(1.6em, 3.5vw + 0.5vh, 2.5em)`, which at 1440px wide comes to roughly 2.5em (~40px). For a portfolio hero headline this is timid. The best-in-class designer portfolios (Rauno, Paco Coursey, Emil Kowalski) use headlines at 4–6em because the headline *is* the pitch. At 2.5em it reads as a subheading, not a statement.

**Card [a] "Design / TUI" is nearly empty** — Card A shows a TUI ASCII mock-up in the top quarter and two-thirds of empty blue space. Compared to cards [s] and [d] which have rich images filling the frame, card [a] looks unfinished. The content disparity across the four cards creates uneven visual density: two cards feel full, one feels sparse, one is almost entirely empty (Misc / Process). This inconsistency reads as placeholder content, not intentional design.

**Role tag badges are redundant** — "TUI / UX," "ILLUSTRATION," "GRAPHIC DESIGN" repeat information already stated in the subtitle "ILLUSTRATOR & UX DESIGNER" immediately above them. The same three disciplines appear twice within ~150px. One instance should go.

**Description text line length is too short** — The `max-width: 38ch` on `.hero-description` is a good instinct for readability, but in the narrow right column it forces very short lines that break the text into awkward fragments visually. The left border accent (`border-left: 2px solid`) is a nice detail but draws attention to how compressed the whole column is.

**Mobile order is wrong** — On 390px, the hero cards appear before the introduction text. A visitor on mobile sees four art cards before they know whose work they're looking at or why they should care. The introduction should come first on mobile.

---

## Interface Design

**We're missing an opportunity to make the hero cards discoverable** — The four hero cards have keyboard shortcuts `[a]`, `[s]`, `[d]`, `[f]`, but there's no hint that these are interactive or expandable. A first-time visitor has no reason to press those keys or click. The `↑↓ scroll` hint on card [f] is the only affordance signal, but it only appears on one card and refers to scrolling, not expanding. A subtle "press to expand" or hover-visible instruction would make the interactivity discoverable.

**We're missing an opportunity to surface the Works keyboard navigation** — The "PROJECTS · 6 works" bar with `[1] Designs [2] Illustrations [3] Others` is a strong, compact navigation pattern that fits the TUI identity perfectly. But it only appears as a thin strip at the very bottom of the viewport on initial scroll — users who don't scroll far enough never discover it.

**The typing animation is load-bearing** — The hero title `#typing-text` span starts empty. Until the animation completes (~1.3 seconds at 30ms × 44 chars), the most important text on the page shows either nothing or a truncated fragment ("Desi_"). Text content is structural information, not decoration. A better approach: show the text immediately, then animate a secondary element (underline, highlight, cursor reveal) rather than gating the text itself behind the animation.

**The "View works ↓" CTA disappears on hover** — The `.hero-cta:hover` rule sets `opacity: 0`. This is the only call-to-action on the page directing users to the next step. Making it invisible on hover is a conceptual pun (the "absorption" effect), but it works against the user: hovering on the most important action removes it from view exactly when the user is about to click.

**No scroll indicator on page load** — The site is section-based and scroll-driven, but nothing communicates this on first load. Users who don't scroll see the hero and nothing else. There's no visual suggestion that content continues — no partial next-section peek, no "↓ scroll" hint visible in the viewport.

---

## Consistency & Conventions

**Card border treatment is fragmented** — The hero cards have `border: none` on the `.hero-art-card` container, while the TUI frame inside has `border: 1px solid var(--color-border)`. The bottom bars ("TUI · UX · Systems") are outside the frame, floating in the card container without a clear visual boundary. Header and footer belong to different visual containers, making the card feel like three separate pieces rather than one component.

**Card [f] "Misc / Process" is conspicuously sparse** — Three cards have meaningful content (ASCII mock, illustration photo, Korean print art). Card [f] shows a 3×4 ASCII pixel block in the top-left corner of an otherwise empty field. It reads as either a placeholder or an outlier. If intentional emptiness, it needs a clearer visual rationale to feel purposeful rather than unfinished.

**Hero section has no ID anchor** — Every other section has `id="works"`, `id="about"`, `id="contact"`. The hero is `<section class="hero">` with no ID. The `scroll-margin-top` rule on `section[id]` applies only to sections with IDs — so the hero is excluded. The logo also can't link back to `#top` cleanly.

---

## User Context

A visitor landing on this portfolio is assessing within the first 5–10 seconds whether this designer's work is relevant to them. They're not confused or anxious — they're in filter mode. The question they're answering is: *"Is this person worth 5 more minutes of my attention?"*

Right now the site answers that question slowly. The typing animation delays the headline for 1.3 seconds. The text is in a narrow column competing visually with the card grid. The cards are intriguing but their interactivity is invisible. By the time a visitor has oriented themselves, they may have already moved on.

What "uncommon care" would look like here: the hero text arriving instantly with the cards animating in around it — text as anchor, visuals as atmosphere. The title at a scale that commands the room. Cards that wink at their interactivity without screaming it — a faint `[click to expand]` that fades in on hover. And a "View works ↓" link that *stays visible* when you go to click it.

---

## Top Opportunities (Ranked)

| # | Opportunity | Impact |
|---|-------------|--------|
| 1 | **Flip the hero layout priority** — Give introduction text more space (50/50 or 45/55 text/cards) and make the headline significantly larger (≥3.5em). Text-first, visuals as support. | Structural |
| 2 | **Fix hero card image height** — Cards expand to match their image content's natural height, making the hero section enormously tall. Cards need a fixed or max-height constraint so the grid stays within the viewport. | Structural |
| 3 | **Don't gate headline text behind the typing animation** — Show the full title immediately; animate a cursor or underline effect instead of the text itself. | Behavioral |
| 4 | **Fix mobile order** — Introduction text should appear before the card grid on small screens. Swap DOM order or use `order` in flexbox. | Behavioral |
| 5 | **Make "View works ↓" stay visible on hover** — Remove `opacity: 0` on hover, or replace it with a color/underline change that signals interactivity without disappearing. | Behavioral |
