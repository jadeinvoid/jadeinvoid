# Projects 섹션 Details Modal 구현

## TL;DR

> **요약**: index.html의 Projects 섹션 artwork 카드 클릭 시 80% 화면을 차지하는 TUI 모달을 추가합니다.
>
> **Deliverables**:
> - 프로젝트마다 hidden details container (6개)
> - 썸네일→메인 교체식 이미지 캐러셀 (가변 갯수 지원)
> - [esc] 버튼 닫기 (TUI 일관성)
> - FLIP 애니메이션 (hero 카드와 동일한 패턴)
>
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - 단일 파일 수정만 가능
> **Critical Path**: CSS → HTML containers → JavaScript logic → QA

---

## Context

### Original Request
Projects 섹션 artwork 클릭 시 details 페이지를 새 HTML 없이 구현하고 싶음

### Interview Summary
**Key Discussions**:
- **모달 방식**: 화면 80% 차지하는 modal/overlay (Option A)
- **콘텐츠**: 제목+번호, 대표 이미지, 설명, 프로세스 캐러셀, 기술 태그 목록
- **캐러셀**: 썸네일→메인 교체 방식 (썸네일 그리드, 클릭 시 메인 이미지 교체)
- **이미지 갯수**: 프로젝트별 가변 (A는 3장, B는 6장 등)
- **닫기 UX**: [esc] 버튼 (TUI 일관성)
- **애니메이션**: Hero 카드 FLIP 애니메이션과 유사하게
- **데이터**: HTML에 하드코딩 (가장 간단한 방식)
- **기술적 제약**: 디자이너 친화적, 파일/커맨드 충돌 없게

### Metis Review
**Identified Gaps (all addressed)**:
- 캐러셀 방식 명확화: 썸네일→메인 교체 방식 선택
- 이미지 갯수 정책: 가변 갯수 지원 (data attributes로 처리)
- 닫기 UX 확정: [esc] 버튼 (hero 카드와 동일한 패턴)

---

## Work Objectives

### Core Objective
Projects 섹션의 6개 artwork 카드 클릭 시 TUI 스타일 모달 열리고, 프로젝트 세부 정보 표시

### Concrete Deliverables
1. CSS: `.work-detail-modal` 및 관련 클래스 (index.html 내 CSS 블록)
2. HTML: 각 프로젝트별 hidden details container (6개)
3. JS: 모달 열기/닫기, 캐러셀 교체, FLIP 애니메이션
4. 테스트: 모든 6개 프로젝트 모달 정상 작동 확인

### Definition of Done
- [ ] 카드 클릭 시 모달 열림 (Playwright 스크린샷 증거)
- [ ] [esc] 버튼/배경 클릭/ESC 키로 닫힘
- [ ] 썸네일 클릭 시 메인 이미지 교체
- [ ] 모바일에서도 정상 작동 (반응형)
- [ ] FLIP 애니메이션 적용

### Must Have
- 80% 화면 크기의 모달
- 썸네일→메인 교체 캐러셀
- [esc] 버튼 닫기
- 가변 이미지 갯수 지원
- FLIP 애니메이션
- 모바일 호환

### Must NOT Have (Guardrails)
- **새 HTML 파일 생성 금지** - 단일 파일 아키텍처 유지
- **라이브러리 추가 금지** (jQuery, Bootstrap 등) - Vanilla JS만 사용
- **URL hash 변경 금지** - 단순한 modal 동작 유지
- **이미지 lazy loading 금지** (이 단계에서는) - 캐러셀 preload로 처리
- **복잡한 상태 관리 금지** - 단순 open/close만 구현

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (no test framework)
- **Automated tests**: NO
- **Agent-Executed QA**: YES - Playwright로 모든 시나리오 검증

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.png`.

---

## Execution Strategy

### Sequential Execution (Single File Constraint)

이 프로젝트는 **단일 파일(index.html)** 아키텍처를 사용합니다. 병렬 실행이 불가능하므로 순차적으로 진행합니다.

```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5
  ↓
CSS foundation
  ↓
HTML containers
  ↓
JavaScript logic
  ↓
Integration & animation
  ↓
QA & verification
```

**Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5

---

## TODOs


- [ ] 1. CSS Foundation - Modal & Carousel Styling

  **What to do**:
  - CSS 블록에 `.work-detail-modal` 클래스 추가 (index.html ~line 1260, `</style>` 직전)
  - 모달: `position: fixed`, `inset: 5%` (80% 크기), `z-index: 10000`
  - TUI frame 스타일: `border`, `background`, `box-shadow` (hero 카드의 `.tui-frame` 참조)
  - 캐러셀: 메인 이미지 영역 (60% 높이), 썸네일 그리드 (flex, gap: 8px)
  - 썸네일: `width: 80px`, `height: 80px`, `object-fit: cover`, `cursor: pointer`
  - 활성 썸네일: `border: 2px solid var(--color-accent-2)`
  - 반응형: `@media (max-width: 768px)`에서 모달 `inset: 2%`
  - 애니메이션: `.modal-overlay` (opacity 0→1, 0.3s), `.modal-content` (scale 0.95→1, 0.3s)

  **Must NOT do**:
  - CSS-in-JS 금지 (inline styles만 가능하나, class 기반 스타일링 권장)
  - 별도 CSS 파일 생성 금지 (단일 파일 아키텍처)
  - complex grid layouts 금지 (flexbox만 사용)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: CSS/TUI 스타일링, 모달 디자인 구현
  - **Skills**: `frontend-ui-ux`
    - TUI aesthetic 적용, 반응형 디자인, CSS custom properties 활용

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 2, Task 3, Task 4, Task 5
  - **Blocked By**: None

  **References**:
  - `index.html:299-480` - Hero 카드 `.tui-frame` 스타일 (border, shadow 패턴)
  - `index.html:14-37` - CSS custom properties (색상 변수 참조)
  - `index.html:1260` - CSS 블록 끝 (새 스타일 삽입 위치)

  **Acceptance Criteria**:
  - [ ] CSS 블록에 `.work-detail-modal` 클래스 존재
  - [ ] `.work-detail-modal { inset: 5%; }` - 80% 크기 설정
  - [ ] `.carousel-main { height: 60%; }` - 메인 이미지 영역
  - [ ] `.carousel-thumbs { display: flex; gap: 8px; }` - 썸네일 그리드
  - [ ] `@media (max-width: 768px)` 쿼리 존재

  **QA Scenarios**:

  ```
  Scenario: CSS classes exist and have correct properties
    Tool: Read
    Preconditions: index.html 파일에 CSS 블록 존재
    Steps:
      1. Read index.html lines 1260-1350 (CSS 삽입 예상 영역)
      2. Verify `.work-detail-modal` class exists
      3. Verify `inset: 5%` or equivalent sizing
      4. Verify `.carousel-thumbs` with flex layout
    Expected Result: All 4 CSS selectors exist with correct properties
    Evidence: .sisyphus/evidence/task-1-css-exists.png
  ```

  **Commit**: YES
  - Message: `feat(css): add project detail modal styles`
  - Files: `index.html`
  - Pre-commit: None (CSS only)
- [ ] 2. HTML Containers - 6 Project Detail Sections

  **What to do**:
  - Projects 섹션 끝(~line 1570, `</section>` 직전)에 6개 details container 추가
  - 각 container: `<div class="work-detail-modal" id="modal-001" data-project="001">`
  - Container 내부 구조:
    1. `.modal-overlay` - 배경 클릭 닫기용
    2. `.modal-content` - TUI frame wrapper
       - `.tui-top-bar` - `[esc]` 닫기 버튼 + 프로젝트 번호
       - `.modal-body` - 2열 레이아웃 (flex)
         - Left: `.carousel-section` - 메인 이미지 + 썸네일 그리드
         - Right: `.info-section` - 제목, 설명, 태그 목록
  - data attributes 설정:
    - `data-images="3"` - 이미지 갯수
    - `data-main-image="work_design/project1_main.jpg"` - 대표 이미지
    - `data-process-images="work_design/p1_1.jpg,work_design/p1_2.jpg,work_design/p1_3.jpg"` - 캐러셀 이미지
  - Placeholder 콘텐츠 사용 (실제 이미지 경로는 나중에 교체)

  **Must NOT do**:
  - JavaScript로 동적 생성 금지 (이 단계에서는)
  - 별도 HTML 파일 include 금지
  - 복잡한 nesting (>3 depth) 금지

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: HTML 마크업 추가, 구조적 작업
  - **Skills**: `frontend-ui-ux`
    - Semantic HTML, 접근성 고려, TUI 프레임 구조 복제

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 3, Task 4, Task 5
  - **Blocked By**: Task 1

  **References**:
  - `index.html:1569` - Projects 섹션 끝 (container 삽입 위치)
  - `index.html:1301-1347` - Hero 카드 `.tui-frame` 구조 (복제 대상)
  - `index.html:1473-1561` - work-card 구조 (data-tags 참조)

  **Acceptance Criteria**:
  - [ ] 6개 `.work-detail-modal` div 존재 (id: modal-001 ~ modal-006)
  - [ ] 각 modal에 `.tui-top-bar` + `[esc]` 버튼
  - [ ] `.carousel-section` + `.info-section` 2열 구조
  - [ ] `data-images`, `data-main-image`, `data-process-images` attributes 존재

  **QA Scenarios**:

  ```
  Scenario: All 6 modal containers exist with correct structure
    Tool: Read
    Preconditions: Task 1 CSS 완료, index.html 수정 가능
    Steps:
      1. Read index.html lines 1560-1650 (modal 삽입 예상 영역)
      2. Verify #modal-001 through #modal-006 exist
      3. Verify each has .tui-top-bar with [esc] button
      4. Verify .carousel-section and .info-section exist
    Expected Result: All 6 modals with correct TUI structure
    Evidence: .sisyphus/evidence/task-2-html-containers.png
  ```

  **Commit**: YES
  - Message: `feat(html): add 6 project detail modal containers`
  - Files: `index.html`
  - Pre-commit: None
- [ ] 3. JavaScript Logic - Open/Close & Carousel

  **What to do**:
  - JS 블록 끝(~line 2297)에 모달 관리 코드 추가
  - **Open logic**:
    - `work-card` 클릭 이벤트 리스너 추가 (event delegation 권장)
    - 클릭된 카드의 `data-tags` 또는 구조에서 프로젝트 번호 추출
    - 해당 `#modal-XXX` 찾아서 `classList.add('active')`
    - `document.body.style.overflow = 'hidden'` (배경 스크롤 방지)
  - **Close logic**:
    - `[esc]` 버튼 클릭 → `closeModal()`
    - `.modal-overlay` 클릭 → `closeModal()`
    - `Escape` 키 누름 → `closeModal()`
    - `closeModal()`: `classList.remove('active')`, `body.overflow = ''`
  - **Carousel logic**:
    - 썸네일 클릭 시: `data-full-src` 속성에서 이미지 경로 읽기
    - `.carousel-main img`의 `src` 교체
    - 클릭된 썸네일에 `active` 클래스 추가, 나머지 제거
    - 이미지 전환 시 fade transition (opacity 0→1, 0.2s)

  **Must NOT do**:
  - jQuery 사용 금지
  - 복잡한 state machine 금지 (단순 open/close만)
  - setInterval 사용 금지 (자동 슬라이드 불필요)
  - dynamic import 사용 금지

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: JavaScript 이벤트 핸들링, DOM 조작, carousel 로직
  - **Skills**: None (Vanilla JS만 사용, 외부 라이브러리 불필요)

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 4, Task 5
  - **Blocked By**: Task 2

  **References**:
  - `index.html:1628-2297` - 기존 JS 블록 (hero 카드 FLIP 참조)
  - `index.html:1473` - work-card 구조 (event delegation target)
  - `index.html:1628-1650` - Tag filtering JS (event delegation 패턴 참조)

  **Acceptance Criteria**:
  - [ ] 카드 클릭 시 모달 열림 (console.log 확인)
  - [ ] [esc] 버튼/배경/ESC 키로 닫힘
  - [ ] 썸네일 클릭 시 메인 이미지 src 교체
  - [ ] 활성 썸네일 border 스타일 변경

  **QA Scenarios**:

  ```
  Scenario: Modal opens when clicking work card
    Tool: skill_mcp with playwright
    Preconditions: HTTP server running on localhost:8080
    Steps:
      1. Navigate to http://localhost:8080/index.html#works
      2. Click first work-card (data-tags="design tui casestudy")
      3. Wait 300ms for animation
      4. Screenshot .work-detail-modal.active element
      5. Verify modal is visible (opacity > 0, display: block)
    Expected Result: #modal-001 is visible with opacity near 1
    Evidence: .sisyphus/evidence/task-3-modal-opens.png

  Scenario: Carousel image swap works
    Tool: skill_mcp with playwright
    Preconditions: Modal is open
    Steps:
      1. Get initial main image src
      2. Click second thumbnail
      3. Wait 200ms for fade
      4. Get new main image src
      5. Verify src changed
    Expected Result: Main image src changed to thumbnail's data-full-src
    Evidence: .sisyphus/evidence/task-3-carousel-swap.png
  ```

  **Commit**: YES
  - Message: `feat(js): add modal open/close and carousel logic`
  - Files: `index.html`
  - Pre-commit: None
- [ ] 4. FLIP Animation Integration

  **What to do**:
  - Hero 카드의 FLIP 애니메이션 패턴 분석 (~line 1800-1900)
  - First: 카드의 초기 위치/크기 저장 (`getBoundingClientRect`)
  - Last: 모달의 최종 위치/크기 계산
  - Invert: transform/opacity로 차이 보정
  - Play: `requestAnimationFrame`으로 애니메이션 실행
  - 모달 닫을 때 역방향 FLIP (모달→카드 위치로 축소)
  - `prefers-reduced-motion` 미디어 쿼리 체크 (접근성)

  **Must NOT do**:
  - CSS-only animation 금지 (FLIP은 JS 필수)
  - 복잡한 bezier curves 금지 (simple ease-out만)
  - 모든 카드에 적용 금지 (성능 고려, 필요시에만)

  **Recommended Agent Profile**:
  - **Category**: `artistry`
    - Reason: FLIP 애니메이션은 비교적 복잡한 DOM 애니메이션 패턴
  - **Skills**: `interface-craft`
    - Animation timing, FLIP pattern implementation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - `index.html:1800-1900` - Hero 카드 FLIP 애니메이션 구현
  - `index.html:1628-1650` - Custom cursor animation (transform 패턴 참조)
  - Web: FLIP animation technique by Paul Lewis

  **Acceptance Criteria**:
  - [ ] 카드 클릭 시 FLIP 애니메이션으로 모달 확장
  - [ ] 닫기 시 역방향 FLIP 애니메이션
  - [ ] `prefers-reduced-motion` 체크 (미디어 쿼리 또는 JS)
  - [ ] 60fps 유지 (jank 없음)

  **QA Scenarios**:

  ```
  Scenario: FLIP animation works smoothly
    Tool: skill_mcp with playwright
    Preconditions: Modal JS 완료
    Steps:
      1. Record performance metrics (FPS)
      2. Click work-card
      3. Capture 1-second animation sequence
      4. Verify no frame drops (consistent 60fps)
      5. Screenshot start and end states
    Expected Result: Smooth animation without jank
    Evidence: .sisyphus/evidence/task-4-flip-animation.gif

  Scenario: Reduced motion preference respected
    Tool: Bash
    Preconditions: Browser supports prefers-reduced-motion
    Steps:
      1. Emulate prefers-reduced-motion: reduce
      2. Click work-card
      3. Verify modal opens instantly without animation
    Expected Result: Animation duration is 0 or skipped
    Evidence: .sisyphus/evidence/task-4-reduced-motion.txt
  ```

  **Commit**: YES
  - Message: `feat(animation): add FLIP transition for modal open/close`
  - Files: `index.html`
  - Pre-commit: None
- [ ] 5. QA & Cross-Browser Verification

  **What to do**:
  - **Functionality test**: 모든 6개 프로젝트 모달 열기/닫기
  - **Carousel test**: 각 모달의 썸네일 클릭 및 이미지 교체
  - **Responsive test**: 320px, 768px, 1024px, 1440px viewport
  - **Keyboard test**: Tab, Enter, Escape 키 동작
  - **Browser test**: Chrome, Firefox, Safari (Chromium 기반 Playwright로 대체 가능)
  - **Mobile test**: iOS Safari, Android Chrome (emulation)
  - **Accessibility check**: Focus trap, ARIA labels, screen reader
  - **Performance check**: Lighthouse performance score (목표 90+)
  - **Evidence capture**: 모든 테스트 스크린샷 저장

  **Must NOT do**:
  - manual testing only 금지 (모든 테스트는 Playwright로 자동화)
  - production deployment 없이 real device testing 금지 (emulation 사용)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 종합적인 QA, 크로스 브라우저 테스트
  - **Skills**: `playwright`, `frontend-ui-ux`
    - 자동화된 브라우저 테스트, UI 검증

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: None
  - **Blocked By**: Task 4

  **References**:
  - `.sisyphus/evidence/` - 모든 QA evidence 저장 위치
  - `index.html:1269-1290` - Skip link, ARIA attributes (접근성 참조)
  - Playwright docs: https://playwright.dev/docs/screenshots

  **Acceptance Criteria**:
  - [ ] 6개 모달 모두 정상 열림/닫힘
  - [ ] 모든 썸네일 클릭 시 이미지 교체
  - [ ] 320px-1440px viewport에서 레이아웃 깨짐 없음
  - [ ] Keyboard navigation 완벽 동작
  - [ ] Lighthouse Performance >= 90
  - [ ] All evidence files exist

  **QA Scenarios**:

  ```
  Scenario: All 6 modals open and close correctly
    Tool: skill_mcp with playwright
    Preconditions: All previous tasks complete
    Steps:
      1. For each project ID (001-006):
         a. Click corresponding work-card
         b. Verify modal opens (screenshot)
         c. Click [esc] button
         d. Verify modal closes
      2. Save 6 open screenshots + 6 close confirmations
    Expected Result: All 12 assertions pass
    Evidence: .sisyphus/evidence/task-5-all-modals-*.png (12 files)

  Scenario: Responsive layout works
    Tool: skill_mcp with playwright
    Preconditions: Modal open
    Steps:
      1. Set viewport: 320x568 (iPhone SE)
      2. Screenshot modal
      3. Set viewport: 768x1024 (iPad)
      4. Screenshot modal
      5. Set viewport: 1440x900 (Desktop)
      6. Screenshot modal
      7. Verify no horizontal scroll, no clipped content
    Expected Result: 3 screenshots show properly scaled layouts
    Evidence: .sisyphus/evidence/task-5-responsive-*.png

  Scenario: Keyboard accessibility
    Tool: skill_mcp with playwright
    Preconditions: Page loaded
    Steps:
      1. Press Tab until work-card focused
      2. Press Enter to open modal
      3. Verify modal opens
      4. Press Escape
      5. Verify modal closes
      6. Verify focus returns to work-card
    Expected Result: Full keyboard workflow works
    Evidence: .sisyphus/evidence/task-5-keyboard.txt
  ```

  **Commit**: YES
  - Message: `chore: QA verification and evidence capture`
  - Files: `index.html`, `.sisyphus/evidence/`
  - Pre-commit: None

---

## Final Verification Wave (MANDATORY)

> 4 review agents run sequentially (단일 파일이라 병렬 불가). ALL must APPROVE.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. Verify:
  - CSS classes: `.work-detail-modal`, `.carousel-main`, `.carousel-thumbs` exist
  - HTML containers: 6 modals with correct IDs exist
  - JS logic: open/close/carousel functions exist
  - Animation: FLIP pattern implemented
  - Evidence: `.sisyphus/evidence/` has 15+ files
  - Check "Must NOT Have": no new HTML files, no libraries
  Output: `CSS [Y/N] | HTML [Y/N] | JS [Y/N] | Animation [Y/N] | Evidence [N/N] | VERDICT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Check index.html for:
  - No `console.log` in production code (테스트용 제외)
  - No inline `style="..."` (CSS classes만 사용)
  - Proper event delegation (not individual listeners per card)
  - No memory leaks (event listeners properly removed)
  - `const`/`let` 사용 (var 금지)
  Output: `Quality [PASS/FAIL] | Issues [N] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` + `playwright`
  Execute EVERY QA scenario from Tasks 1-5:
  - All 6 modals open/close
  - All carousel interactions
  - Responsive breakpoints
  - Keyboard navigation
  Save final evidence to `.sisyphus/evidence/final-qa/`
  Output: `Scenarios [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git diff HEAD).
  Verify 1:1 match - nothing missing, nothing added beyond spec.
  Check "Must NOT do" compliance.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

- **1**: `feat(css): add project detail modal styles`
- **2**: `feat(html): add 6 project detail modal containers`
- **3**: `feat(js): add modal open/close and carousel logic`
- **4**: `feat(animation): add FLIP transition for modal open/close`
- **5**: `chore: QA verification and evidence capture`

---

## Success Criteria

### Verification Commands
```bash
# Start local server
python3 -m http.server 8080 &

# Run Playwright tests (via skill)
skill_mcp with playwright to verify all scenarios
```

### Final Checklist
- [ ] All 6 project modals open/close correctly
- [ ] Thumbnail→main image swap works for all carousels
- [ ] FLIP animation smooth (60fps)
- [ ] Responsive on 320px-1440px
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] No new HTML files created
- [ ] No external libraries added
- [ ] All evidence captured (15+ files)
- [ ] Lighthouse Performance >= 90
