# Design Critique — index.html

**Generated:** 2026-03-17
**Version:** 1.0
**Commit:** 164780b
**Reviewed by:** Interface Craft / Design Critique (Josh Puckett methodology)

---

## Mobile Layout & Hierarchy Review

**Added:** 2026-03-20

### Context

A single-page portfolio for Jade Yejin Cho — illustrator and UX designer. The audience is creative directors, recruiters, and collaborators making a first judgment call: is this person worth reaching out to? The emotional context is casual browsing with a sharp decision at the end. Every second of friction is a vote against.

### First Impressions

The TUI aesthetic is committed and distinctive — the cobalt blue, GeistMono, the bracketed labels, the ASCII fish all form a coherent voice that stands out from template portfolios. But on mobile, the layout is working against the content rather than for it. The hero pushes the cards below the fold without making that relationship clear. The about section makes you scroll through a decorative fish canvas before reaching the bio. The contact section is so sparse it feels abandoned. The page has strong visual style but the information hierarchy on mobile is out of order — the most persuasive content isn't where it needs to be.

### Visual Design

**Title-to-subtitle size gap** — The hero subtitle ("ILLUSTRATOR & UX DESIGNER") is set at `1em` (~14px) while the title renders at ~32px at 390px viewport — a 2.3× jump. This is a strong hierarchy, which works. But both sit in `--color-text-secondary` (subtitle) and `--color-text-primary` (title) with no intermediate weight. The description body text below the title is also `--color-text-secondary` at a small size, so it visually blurs with the subtitle above it. Three levels of information (label → headline → body) are rendered in two distinct visual registers.

**Decorative dots carry no meaning** — The footer `● ● ● ● ●` are presented as five equal, identical dots with no label, no interaction, no differentiation. They represent the Obangsaek palette internally, but to a visitor they read as a loading indicator or an error. Five silent dots in a stacked footer on mobile waste a full content row.

**SVG social icons break the aesthetic** — The contact section has four SVG icons (LinkedIn, GitHub, ArtStation, itch.io) that are generic web icons — stroked, geometric, completely foreign to the monospace TUI language used everywhere else. Every other interactive element on the page is text-based. These four icons are the only place that breaks the system.

**About fish canvas: 200px of visual silence** — On mobile, `.about-left` has `min-height: 200px` and sits above the bio text. The fish is delightful but 200px of mostly empty canvas is the first thing a mobile user sees when they scroll into About. It communicates nothing about Jade and delays the bio and skills by one full screen-height of decorative content.

### Interface Design

**The hero CTA is ambiguous** — "View works ↓" sits at the bottom of the text block, with the card carousel immediately below it inside the same hero section. The arrow points down, but the cards are right there — does ↓ mean "these cards" or "the Works section further down the page"? A user tapping it is taken to the Works section, but a user who doesn't tap it might already try to interact with the carousel thinking they've arrived. Two destinations, one pointer.

**The About fish delays the biography** — On mobile, the page order is: fish canvas → bio text → skills. The fish is purely ambient. A visitor arriving at the About section on mobile has to scroll past 200px of animation to reach "Based in Montréal, rooted in Korea" — the most human and differentiating copy on the page. The decorative element is front-loaded ahead of the informational one.

**Sub-tag filtering is entirely absent on mobile** — The tag bar simplifies to three category buttons (Designs / Illustrations / Others) with all sub-tags hidden. This is fine for first-pass filtering, but there's no path to finer filtering on mobile. A recruiter interested specifically in UX work can't narrow to `/tui` or `/ux` — they get all Designs at once. This is information architecture loss, not simplification.

**The contact section is structurally thin** — On mobile it contains: one paragraph of copy, one email address prefixed with the redundant label "Email:", and four social icons. `padding: 64px 24px` at the top creates significant empty space before any content appears. The section reads as an afterthought rather than a destination.

### Consistency & Conventions

**"Email:" label is redundant** — In the contact section, the email is presented as `Email: yjcho0602@gmail.com`. The label adds no information — it's the contact section, it's clearly an email address. Every other piece of labeled content on the page uses the TUI convention (bracketed, or prefixed with `/`). This one uses a plain English colon label that doesn't match the system.

**Social icons are the only non-text interactive elements** — Every button, link, and label on the page is typographic — `[Projects]`, `/tui`, `↓`, `[>]`. The four social SVGs are the only icon-based elements. They work functionally but feel imported from a different design system. Text equivalents (`[linkedin]`, `[github]`) or bracketed labels would maintain consistency.

### User Context

A visitor hitting this portfolio on mobile is likely doing a quick first pass — probably in a coffee shop or on transit, with 60 seconds of attention to decide if this is worth bookmarking. They need to get to portfolio work fast, understand who Jade is faster, and find a contact path with zero friction. Right now, the mobile page makes them scroll through a fish canvas to learn about Jade, navigate ambiguous CTA semantics in the hero, and encounter a contact section that doesn't feel like an invitation.

The TUI aesthetic signals craft, intentionality, and a specific kind of nerd-confidence. That's earned and distinctive. What would "uncommon care" look like? A contact section that feels like a genuine invitation — not a sparse form. An About section where the bio is the first thing, and the fish is the reward for reading it. And social links that speak the same visual language as the rest of the page.

### Top Opportunities

1. **Reorder About on mobile** — Move the bio (`about-right`) above the fish canvas (`about-left`), or reduce `min-height` on the canvas so it doesn't dominate the scroll before reaching the copy.
2. **Clarify the hero CTA** — Either rename "View works ↓" to something that points to the section (not the immediate carousel), or remove it and let the carousel serve as the natural entry point into works.
3. **Replace SVG social icons with TUI-consistent text links** — `[linkedin]` `[github]` `[artstation]` `[itch.io]` — maintains the visual language and is actually more readable on mobile.
4. **Give the Obangsaek dots meaning or remove them** — Either label them (a micro color legend, or names) or replace with a single thematic separator that doesn't read as a loading state.
5. **Add at minimum one sub-tag filter on mobile** — Even a simple "all / featured" toggle within each category would restore some browsing control without cluttering the tab bar.

---

## Works / Projects Section Review

**Added:** 2026-03-18

### What's Working Well

**The grid structure is sound.** Three-column layout, 1px border gap creating a newspaper-style grid, cards with consistent structure (thumbnail → number → title → tags) — this is a clean, disciplined system that scales well as cards are added.

**The animated SVG border on hover** is a genuinely distinctive interaction. A glowing polyline tracing the card perimeter is unusual, memorable, and fits the TUI aesthetic without feeling gimmicky.

**The `[e] expand / collapse` button** is well-placed and well-labeled. The staggered animation on card reveal is polished.

### Issues

**1. The section header is disconnected from the filter bar** — The `section-header` (`Projects · — works`) and the `tag-bar` below it are two separate horizontal stripes. But they're conceptually one unit — the header names the section, the filter bar operates on it. Visually they read as two independent rows with nothing tying them together except proximity. The `44px` fixed-height header sits above the tag bar with a full-width `border-bottom`, then the tag bar has its own `border-bottom`, creating a double-line effect that adds visual noise. Either combine them into a single row (title left, filters right, centered) or remove the section header's `border-bottom` and let the tag bar serve as the section's bottom edge.

**2. Card 003 is still placeholder content** — "Design Work #2" with "Thumbnail / Illustration" as the `.card-thumb` content is visible in the grid. This damages credibility more than a hidden card would. It should be hidden with `style="display:none"` until real content exists.

**3. The `card-num` (001, 002 …) serves no function** — The three-digit card number appears in the top-left of each card's meta section at `0.7em` in secondary text color. It's never referenced anywhere else in the UI — not in the modal, not in the filter system, not in keyboard shortcuts. In TUI systems, numbers imply keyboard access. Here they're inert. Either make them functional (keyboard navigation: press `001` → open that card) or remove them and give that space to the tags which are more useful.

**4. The `→` arrow is redundant and misaligned** — Every card has a `→` arrow (`card-arrow`) positioned `absolute` at `bottom: spacing-sm, right: spacing-md`. It adds no information, and on hover it shifts `+5px right` and turns green. Two hover signals (arrow shift + animated SVG border) compete for attention without either one clearly winning. Consider removing the arrow and letting the animated border carry the "this is interactive" signal, or realign the arrow inline with the card title.

**5. Card thumbnail treatment is inconsistent** — `.card-thumb` uses `clamp(160px, 22vw, 320px)` for consistent heights, but images have wildly different aspect ratios. With `object-fit: cover`, portrait images lose most of their content to cropping, and the blurred background technique is applied to some cards but not others. The current mix reads as inconsistent rather than intentional. Establish a uniform treatment: either apply the blurred background to all cards, or remove it from all and use straight `object-fit: cover`.

**6. The expand button has no persistent affordance when cards are hidden** — In `/featured` mode (2 cards), the `[e] expand` button is hidden because `visibleCards.length < 4`. A visitor in `/featured` mode has no indication that 13 more projects exist. The count shows "2 works" which implies the total is 2. Consider showing `2 of 15 works` — this communicates that `/featured` is a curated subset and there's more to discover.

**7. Tag bar may wrap at mid-sized viewports** — With `flex-wrap: wrap` and `justify-content: center`, when a group is active the sub-tags may wrap to a second row at ~900px viewport width. This creates a two-row tag bar that takes significantly more vertical space and breaks the visual rhythm of the section. Test at 900–1100px and adjust tag font sizes or padding, or allow horizontal scroll (`overflow-x: auto`, `flex-wrap: nowrap`) as a deliberate TUI pattern.

### Priority Order

| # | Issue | Effort | Impact |
|---|---|---|---|
| 1 | Hide card 003 | Trivial | High — credibility |
| 2 | Show `X of Y works` count | Small | High — discoverability |
| 3 | Remove or reposition `→` arrow | Small | Medium — visual clarity |
| 4 | Uniform thumbnail treatment | Medium | Medium — consistency |
| 5 | Section header / tag bar connection | Medium | Medium — visual hierarchy |
| 6 | Tag bar single-row at mid-viewport | Small | Low — edge case |
| 7 | Card numbers functional or removed | Medium | Low — TUI completeness |

---

## Context

A portfolio for Jade (Yejin) Cho — illustrator and UX designer. The target audience is potential clients and employers in design, illustration, and game studios. The emotional context is casual discovery: someone browsing work, forming an impression of the designer's taste and range. The stakes are moderate-to-high — this is a professional first impression.

---

## First Impressions

The aesthetic is genuinely distinctive. An electric blue (`#066bc3`) background with a phosphor-green (`#e8fec5`) text palette, monospace type throughout, and terminal UI chrome (brackets, numbered cards, TUI window frames) creates a cohesive world that immediately communicates the designer's sensibility. This isn't a template — it's opinionated. That's the right instinct. But the execution has gaps that undercut the vision: the About section is nearly empty, several cards contain placeholder titles ("Design Work #2"), the contact section is functional but sparse, and the interactive system — while clever — communicates its rules poorly to new visitors.

---

## Visual Design

**Depth and elevation are absent** — Every element sits on the same flat plane. The cards, nav, modals, footer, and keyboard bar all use the same `#066bc3` background with no luminosity variation. In a dark-on-dark UI this flattens everything. The `rgba(0,0,0,0.15)` tint used on `.section-header` and `.hero-strip` is the right idea but applied too subtly — 15% opacity reads as noise rather than hierarchy. The keyboard bar at the bottom uses `backdrop-filter: blur(4px)` but the body behind it is a solid color, so it has no visible effect.

**The blurred background technique on card thumbnails is overused** — Cards 001, 005, 006, 007, and the hero cards all use the same blurred-image-with-scale(1.15)-behind-a-darkened-overlay pattern. The first time it reads as intentional art direction. By the fifth card it reads as a template applied mechanically. Cards like 002 (Lionfish) and 009 (Starburst) display their images directly without the blur — and those cards feel more honest. Consider either applying the blur technique only where the image truly needs a letterbox treatment, or removing it entirely and embracing straight thumbnails.

**Two separate type hierarchies coexist without resolution** — The TUI chrome (section headers, tag bars, top bars) uses 0.8em–0.85em monospace in uppercase. The content layer (hero title at 3.5em, `about-tagline` at 2em, `about-title` at 1.8em, `card-title` at 1.3em) uses a separate scale. These two scales don't visually reference each other — the transitions between chrome and content feel arbitrary. The `h2` heading is defined at `2.2em` but is used inside `.section-title` which resets it to `1em` uppercase — meaning `<h2>` is both semantically correct and visually meaningless here.

**The gold accent (`#ffd700`) is used inconsistently** — It appears on: featured card outlines, active tag borders, active thumbnail borders, the TUI art in About, and scattered hover states. But the primary interactive accent is `--color-accent-1` (the same green as primary text). Two accent colors with overlapping roles create ambiguity. Gold reads as "featured/special" in the card grid context, then as "active" in the thumbnail carousel, then as decorative ASCII art. Pick one role for gold.

**Spacing is consistent within components but breaks between sections** — The About section uses `--spacing-xl` (64px) padding top and bottom inside `.about-left` and `.about-right`, but `.about-left` is nearly empty (only the ASCII canvas placeholder, no visible content). This creates a large empty region that reads as broken rather than intentional whitespace.

---

## Interface Design

**The hero card interaction has no discoverable entry point** — Four TUI cards sit in the left panel with no affordance that they're interactive. They have `cursor: none !important` globally, a custom cursor with no hover state change on the cards themselves (the frame border highlights on hover, which is subtle), and no visible label or instruction. The keyboard bar at the bottom says `[a][s][d][f] cards` — but this is a 0.72em line at the bottom of the screen that most visitors won't read before they've already decided whether to engage. On mobile, there's no equivalent hint at all.

**The "Projects" section count is wrong at load time** — `section-count` reads "6 works" in the HTML but the grid contains 15 cards. The count is updated by JS via `applyTagFilter('featured')` on load, which correctly counts 2 featured cards — but if JS is slow or fails, the count is misleading. Minor, but worth noting since the count is a prominent piece of UI chrome.

**The works filter system requires three separate interactions to get to a specific tag** — To see `/tui` cards, a user must: (1) click `[1] Designs` to open the design group, (2) notice the tag bar has updated, (3) click `/tui`. The shortcut labels `[1] Designs / [2] Illustrations / [3] Others` look like tabs, not group toggles. Users who expect tab behavior will be confused when clicking `[1]` doesn't filter to Design — it opens a sub-filter layer they didn't know existed. The `/all` and `/featured` tags alongside group-specific tags in the same bar compounds the ambiguity.

**The About section is nearly empty** — `.about-left` contains only the ASCII canvas interactive area (which itself is invisible until the user moves their mouse over a specific region). There's no bio image, no personal statement, no visual anchor. The section heading "Where the terminal meets the brush" and the body paragraph in `.about-right` are the only substantive content, and they're brief. For a portfolio targeting potential employers, this is the section where trust and personality are established. It's currently a missed opportunity.

**The [e] expand / collapse button has no persistent affordance** — Cards 4–15 are hidden behind an `[e] expand` control. But the button only appears when there are 4+ visible cards. First-time visitors in `/featured` mode (2 cards) never see it and may not realize 13 more projects exist. The "6 works" counter (or the post-JS "2 works") doesn't communicate the total project count either.

---

## Consistency & Conventions

**Hero card labels use keyboard letters (`a`, `s`, `d`, `f`) but numbered TUI format (`[001]`) appears everywhere else** — The four hero card indices use QWERTY keyboard positions as labels. This is clever as a shortcut system but creates a visual inconsistency: the rest of the UI uses the `[001]` format exclusively. A visitor reading `[a]` in the card top bar and `[001]` in the works grid sees two different numbering systems with no explained relationship.

**Close buttons appear in three slightly different interaction models** — The hero card close button (`[esc]`), the modal close button (`[esc]`), and the expand card close button share the same HTML structure but are conditionally shown/hidden via different CSS rules. There's also a proximity-zone visibility system on top of this. The proximity zone code has a buffer of 32–56px where buttons become `opacity: 0`. This means a user moving their cursor *toward* the close button will watch it disappear as they approach it.

**Card 003 ("Design Work #2") is placeholder content** — The thumbnail shows the text "Thumbnail / Illustration" (a raw string in `<div class="card-thumb">`), and the title "Design Work #2" is clearly a placeholder. This appears in the visible grid. Placeholder content in a live portfolio damages credibility more than a missing card would.

**`body.dark-mode` CSS is defined (lines 108–113) but there is no toggle UI anywhere in the page** — Dead code unless there's a planned feature. Adds ~8 lines to the stylesheet for no current purpose.

---

## User Context

A hiring manager or creative director landing on this portfolio is in browse mode: forming a rapid impression, looking for signal on taste, range, and competence. The TUI aesthetic immediately signals taste — that's good. But the user's immediate questions are: *What kind of work does this person do? Can I see examples quickly? Who is this person?*

The current design answers question 1 weakly (the `/featured` default shows 2 cards, then requires expansion), question 2 only after several interactions, and question 3 with a single short paragraph in the About section.

The experience asks the user to invest in learning the interaction model (keyboard shortcuts, TUI card system, expand/collapse logic) before they get to the work. For a designer audience, this can feel charming. For a broader client or employer audience, it risks reading as obtuse.

**What "uncommon care" would look like here:** The four hero cards could animate their titles in on page load, one by one, 100ms staggered — giving the impression the terminal is "booting." The About section's empty left panel is a canvas for the designer's personality (a self-portrait in ASCII, a process sketch, a scrolling log of recent work). The cursor trail's random colors (`#ff69b4`, `#00ffff`, etc.) are vibrant and fun but clash with the restrained Obangsaek palette — aligning the trail colors to the site palette would make the entire interaction feel more considered.

---

## Top Opportunities

1. **Fill the About left panel** — It's the largest empty space on the page and the section most employers read carefully. Even placeholder ASCII art would be better than a blank column.

2. **Remove or replace placeholder card 003** — "Design Work #2" with "Thumbnail / Illustration" as the image is the most credibility-damaging element on the page. Hide it until real content exists.

3. **Make the hero cards' interactive nature visible on load** — A single line of text ("click a card to explore") or a subtle entrance animation on the cards would dramatically increase engagement with the most distinctive part of the design.

4. **Clarify the works filter system** — The three shortcut buttons should either function as direct filters (tab behavior, single click = filtered view) or be relabeled to communicate they're group toggles. The current gap between the affordance (looks like tabs) and the behavior (opens a sub-filter layer) is the single most confusing interaction on the page.

5. **Align cursor trail colors to the site palette** — The trail currently spawns in `#ff69b4`, `#00ffff`, and `#00ffaa` — none of which appear anywhere else in the design. Replacing these with `--color-accent-1` (phosphor green), `--color-accent-2` (gold), and `--color-text-secondary` would make the cursor feel like it belongs to this world.
