# Learnings - Projects Details Modal

## Task 5: Modal Open/Close Testing (2026-02-26)

### Findings
- All 6 modals (modal-001 through modal-006) open and close correctly
- Modals use `.active` class to toggle visibility (display: flex, opacity: 1)
- Close button `.tui-close-btn` inside each modal works correctly via click
- Cards 4-6 are below viewport fold - need scroll before click in automated tests
- Using `element.click()` via JS evaluate is more reliable than Playwright's native click for elements needing scroll

### Modal Content Verified
- modal-001: "Design Work #1" - tags: /tui, /casestudy, /design
- modal-002: "Illustration Work #1" - tags: /conceptart, /illustration, /editorial (has actual illustration image)
- modal-003: "Design Work #2" - tags: /graphic, /research, /typography
- modal-004: "Design Work #3" - tags: /branding, /identity, /system
- modal-005: "Illustration Work #2" - tags: /poster, /print, /typography
- modal-006: "Illustration Work #3" - tags: /animation, /motion, /experimental

### Technical Notes
- Playwright MCP server hardcodes Chrome path `/opt/google/chrome/chrome` - not available on this Arch system
- Workaround: Use standalone Playwright script with `executablePath: '/usr/bin/chromium'`
- System Chromium at `/usr/bin/chromium` version 145.0.7632.116 works perfectly
- NODE_PATH to npx cache needed: `/home/jade/.npm/_npx/9833c18b2d85bc59/node_modules`
- Viewport 1440x900 shows first 3 cards; cards 4-6 need scrollIntoView()
