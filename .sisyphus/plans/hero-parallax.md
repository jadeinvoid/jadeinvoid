# Hero Mouse-Move Parallax

## TL;DR

> **Quick Summary**: 4개의 hero art card에 mouse-move 기반 parallax depth 효과를 추가한다. 마우스가 `.hero-visuals`를 가로지를 때 각 카드가 서로 다른 속도로 이동해 Z-depth 레이어 감각을 만든다. 기존 expand/collapse 시스템과 완전히 안전하게 통합된다.
>
> **Deliverables**:
> - `.hero-art-card` 4개에 depth multiplier 기반 mouse-move parallax
> - Lerp(easing) 방식, 커서 애니메이션과 동일한 RAF 패턴
> - 마우스 이탈 시 smooth ease-back to center
> - `expandCard()` 진입 전 parallax offset 자동 초기화
> - 애니메이션 중 parallax 일시 정지 (collapse 220ms 포함)
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO — sequential (하나의 파일, 의존성 있음)
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task F1

---

## Context

### Original Request
hero image container에 parallax를 넣고 싶다. overall website aesthetics에 맞는 느낌인지 확인 후 진행.

### Interview Summary
**Key Discussions**:
- Parallax 타입: Mouse-move (scroll-based 아님) — 기존 cursor trail, proximity hover와 동일한 "마우스 반응" 언어
- 스타일: Depth layers — 카드마다 다른 Z-depth 배율로 앞 카드가 더 많이 이동
- 이동 방식: Lerp (easing) — 기존 ASCII 커서가 lerp 0.2 사용, 사이트 언어 통일
- 마우스 이탈: Smooth ease back to center (lerp으로 0까지 fade)
- 모바일: `isTouch` 가드로 완전 비활성화

**Research Findings**:
- Metis가 `expandCard()` 내 `getBoundingClientRect()` 호출 전 parallax offset 잔존 문제 발견
- `collapseCard()`의 220ms `scale(0.9)` 애니메이션 window 동안 parallax 가 transform을 덮어쓰면 시각적 충돌 발생
- `resetCardSize()`가 `card.style.transform = ''`으로 초기화 → collapse 완료 후 재활성화 필요
- `prefers-reduced-motion`이 이미 codebase에서 감지됨 (line 2959) → parallax도 존중해야 함

### Metis Review
**Identified Gaps** (addressed):
- `expandCard()` 내 `getBoundingClientRect()` 전 parallax offset 초기화 필수 → Task 3에서 처리
- collapse animation 220ms window 동안 parallax 일시 정지 → `isAnimating` 플래그로 처리
- `will-change: transform` CSS 누락 → Task 1에서 추가
- `prefers-reduced-motion` 존중 → Task 2에서 가드 추가
- mouse-leave smooth reset → Task 2에서 처리

---

## Work Objectives

### Core Objective
`.hero-visuals` 안의 4개 카드에 mouse-move parallax를 추가한다. 각 카드는 고유한 depth multiplier를 가지며 부드러운 lerp 이동으로 Z-depth 감각을 만든다. 기존 expand/collapse, 커서 시스템과 충돌하지 않는다.

### Concrete Deliverables
- `index.html` CSS: `.hero-art-card`에 `will-change: transform` 추가
- `index.html` JS: 새 parallax 블록 (RAf lerp 루프, mousemove/mouseleave, 가드)
- `index.html` JS: `expandCard()` 내 parallax offset 초기화 hook (2줄)
- `index.html` JS: `collapseCard()`/`resetCardSize()` 후 재활성화 hook

### Definition of Done
- [ ] 4개 카드가 마우스 이동 시 각각 다른 속도로 이동 (depth 차이 확인 가능)
- [ ] 마우스가 `.hero-visuals`를 벗어나면 카드가 부드럽게 중립 위치로 복귀
- [ ] 카드 expand 클릭 시 시각적 jump 없음 (offset 사전 초기화)
- [ ] expand/collapse 완료 후 parallax 정상 재개
- [ ] touch 기기에서 parallax 비활성화
- [ ] `prefers-reduced-motion` 설정 시 parallax 비활성화
- [ ] 기존 hover, cursor trail 동작 이상 없음

### Must Have
- Depth multipliers: card[a]=1.0, card[s]=0.6, card[d]=0.4, card[f]=0.7 (앞/뒤 차이 명확)
- 최대 offset: ±6px (컨테이너 엣지에서)
- Lerp factor: 기존 커서와 동일하게 0.15~0.2 범위
- `isTouch` 가드: 기존 line 2332 패턴과 동일 방식
- `prefersReducedMotion` 가드: 기존 line 2959 변수 재사용
- RAF 루프: 기존 `updateCursor()` 패턴 (lines 2348–2356) 동일하게
- `mouseleave` 핸들러: target offset을 0으로 설정, lerp으로 부드럽게 복귀
- `expandCard()` hook: `getBoundingClientRect()` 호출 전 모든 카드 transform 초기화
- `isAnimating` 플래그: expand/collapse 220ms window 동안 parallax write 차단

### Must NOT Have (Guardrails)
- CSS `transition` on `transform` — parallax를 laggy하게 만들고 collapse scale 애니메이션 충돌
- `rotateX`, `rotateY`, `perspective` — translate()만, 3D tilt 없음
- `.works-grid` 등 hero 외부 요소에 parallax — `.hero-visuals` 컨테이너 스코프만
- 기존 mousemove 리스너(lines 2342, 2362, 2430) 수정 — 새 리스너만 추가
- `expandCard()`, `collapseCard()`, `resetCardSize()` 리팩토링 — 최소한의 hook만
- 별도 JS 파일 생성 — 단일 파일 아키텍처 준수
- 스프링/물리 엔진 — 단순 lerp만
- 모바일에서 parallax — `isTouch` 완전 차단

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (프로젝트 컨벤션 — no test runner)
- **Framework**: N/A
- **Agent-Executed QA**: Playwright (브라우저 직접 검증)

### QA Policy
모든 task는 Playwright 시나리오로 검증. 증거는 `.sisyphus/evidence/`에 저장.

---

## Execution Strategy

### Parallel Execution

단일 파일 (index.html), 순차 의존성 존재 → 순차 실행.

```
Sequential:
Task 1: CSS will-change 추가
  ↓
Task 2: Parallax JS 블록 구현
  ↓
Task 3: expandCard/collapseCard hook 통합
  ↓
Task F1: 최종 QA (Playwright)
```

### Agent Dispatch Summary

- **Task 1**: `quick` — CSS 1줄 추가
- **Task 2**: `visual-engineering` + `frontend-ui-ux` — 핵심 parallax 로직 (RAF, lerp, 가드)
- **Task 3**: `quick` — 기존 함수에 최소 hook 삽입
- **Task F1**: `unspecified-high` + `playwright` — 브라우저 검증

---

## TODOs

- [x] 1. CSS: `.hero-art-card`에 `will-change: transform` 추가

  **What to do**:
  - `index.html` 내 `.hero-art-card` CSS 규칙 (lines 285–295)에 `will-change: transform;` 한 줄 추가
  - GPU 가속 활성화 — parallax 성능 기반

  **Must NOT do**:
  - `transition: transform ...` 추가 금지 — parallax laggy + collapse animation 충돌
  - 다른 CSS 변경 없음

  **Recommended Agent Profile**:
  > 단일 CSS 속성 추가, 1줄 변경
  - **Category**: `quick`
    - Reason: 명확한 단일 파일, 단일 속성 추가
  - **Skills**: 없음
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: CSS 1줄에 불필요

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential Step 1
  - **Blocks**: Task 2 (parallax가 will-change 필요)
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `index.html:285–295` — `.hero-art-card` CSS 규칙 블록, 여기에 `will-change: transform;` 삽입

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: will-change 속성 확인
    Tool: Bash (node/bun REPL 또는 grep)
    Steps:
      1. grep -n "will-change" index.html
    Expected Result: .hero-art-card 규칙 안에 "will-change: transform" 포함 라인 출력
    Failure Indicators: 결과 없음, 또는 다른 위치에 있음
    Evidence: .sisyphus/evidence/task-1-will-change.txt
  ```

  **Commit**: YES (Task 2와 묶어도 됨)
  - Message: `feat(hero): add parallax depth effect to hero cards`
  - Files: `index.html`

---

- [x] 2. JS: Parallax 핵심 구현 (RAF lerp 루프, 가드, mouseleave reset)

  **What to do**:
  - `if (!isTouch) { ... }` 블록 안 (line 2494 이전)에 새 parallax 초기화 코드 추가
  - Depth multipliers 정의:
    ```js
    const PARALLAX_CARDS = [
      { selector: '[data-index="a"]', depth: 1.0 },
      { selector: '[data-index="s"]', depth: 0.6 },
      { selector: '[data-index="d"]', depth: 0.4 },
      { selector: '[data-index="f"]', depth: 0.7 },
    ];
    const PARALLAX_MAX = 6; // px
    const PARALLAX_LERP = 0.15;
    ```
  - 상태 변수: `let px = { targetX: 0, targetY: 0, currentX: 0, currentY: 0, active: false, animating: false };`
  - `window.parallaxState = px;` — expandCard/collapseCard에서 접근 가능하도록
  - `.hero-visuals`에 `mousemove` 리스너 추가:
    - 마우스 위치를 컨테이너 중심 기준 -1 ~ +1 정규화
    - `px.targetX`, `px.targetY` 업데이트
    - `px.active = true`
  - `.hero-visuals`에 `mouseleave` 리스너 추가:
    - `px.targetX = 0; px.targetY = 0;` (lerp으로 부드럽게 0으로 복귀)
    - `px.active = true;` 유지 (lerp loop가 0에 수렴할 때까지 계속 업데이트)
  - RAF 루프 `updateParallax()` 구현:
    ```js
    function updateParallax() {
      requestAnimationFrame(updateParallax);
      if (px.animating) return; // expand/collapse 중 skip
      // 어떤 카드라도 expanded면 skip
      if (document.querySelector('.hero-art-card.expanded')) return;
      
      px.currentX += (px.targetX - px.currentX) * PARALLAX_LERP;
      px.currentY += (px.targetY - px.currentY) * PARALLAX_LERP;
      
      // 수렴 완료 시 (threshold 0.05px) 정확히 0으로 snap
      const atRest = Math.abs(px.currentX) < 0.05 && Math.abs(px.currentY) < 0.05
                     && px.targetX === 0 && px.targetY === 0;
      
      PARALLAX_CARDS.forEach(({ selector, depth }) => {
        const card = document.querySelector(selector);
        if (!card || card.classList.contains('expanded')) return;
        if (atRest) {
          card.style.transform = '';
        } else {
          const x = px.currentX * depth;
          const y = px.currentY * depth;
          card.style.transform = `translate(${x}px, ${y}px)`;
        }
      });
    }
    updateParallax();
    ```
  - `prefersReducedMotion` 가드: 기존 변수(line 2959) 사용. 리스너와 RAF를 `if (!prefersReducedMotion)` 안에 래핑

  **Must NOT do**:
  - 기존 mousemove 리스너(document 레벨, lines 2342/2362/2430) 수정 금지
  - `isTouch` 블록 밖에 코드 추가 금지
  - `rotateX`, `rotateY`, `perspective` 사용 금지
  - CSS transition on transform 추가 금지
  - `.works-grid` 등 다른 컨테이너에 parallax 적용 금지

  **Recommended Agent Profile**:
  > RAF 루프, lerp, 이벤트 리스너, 기존 코드 패턴 통합 — 프론트엔드 인터랙션 핵심
  - **Category**: `visual-engineering`
    - Reason: 브라우저 애니메이션, 성능 최적화, 기존 interaction 언어와의 통합
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: 기존 코드 컨벤션 (단일 따옴표, 세미콜론, 2-space indent) 준수
  - **Skills Evaluated but Omitted**:
    - `playwright`: Task F1에서 사용

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential Step 2
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:

  **Pattern References**:
  - `index.html:2326–2356` — `isTouch` 가드 패턴 + `updateCursor()` RAF lerp 루프. 이 패턴을 parallax에도 동일하게 적용
  - `index.html:2494` — `} // end if (!isTouch)` 주석. 이 줄 바로 앞에 parallax 코드 삽입
  - `index.html:2959` — `prefersReducedMotion` 변수 선언. 재사용, 재선언 금지
  - `index.html:1668–1771` — `.hero-visuals` 컨테이너와 4개 카드 HTML 구조

  **API/Type References**:
  - `data-index` 속성: `a`, `s`, `d`, `f` — 카드 셀렉터용

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Parallax depth 차이 확인 (happy path)
    Tool: Playwright
    Preconditions: index.html 로컬 서버로 열기, desktop viewport (1440x900)
    Steps:
      1. Navigate to file:///home/jade/Jade/MUIjade/index.html
      2. Wait for .hero-visuals to be visible
      3. Move mouse to center of .hero-visuals (getBoundingClientRect center)
      4. Move mouse to top-left corner of .hero-visuals (left+20, top+20)
      5. Wait 500ms for lerp to settle
      6. Read computed style of [data-index="a"]: getComputedStyle transform
      7. Read computed style of [data-index="d"]: getComputedStyle transform
      8. Assert: [data-index="a"]의 transform translate 값이 [data-index="d"]보다 큼 (depth 1.0 > 0.4)
    Expected Result: card[a] offset > card[d] offset, both non-zero
    Failure Indicators: 두 카드의 transform이 같거나 모두 'none'
    Evidence: .sisyphus/evidence/task-2-parallax-depth.png (screenshot)

  Scenario: Mouseleave smooth reset
    Tool: Playwright
    Preconditions: 위와 동일, mouse already in .hero-visuals
    Steps:
      1. Move mouse to center of .hero-visuals
      2. Wait 300ms
      3. Move mouse outside .hero-visuals entirely (0, 0)
      4. Wait 800ms (lerp 수렴 시간)
      5. Assert: All 4 .hero-art-card computed transform === 'none' or translate(0px, 0px)
    Expected Result: 카드들이 중립 위치로 복귀
    Failure Indicators: 카드에 남은 offset 존재
    Evidence: .sisyphus/evidence/task-2-mouseleave-reset.png

  Scenario: prefers-reduced-motion 가드
    Tool: Playwright
    Preconditions: prefers-reduced-motion: reduce 에뮬레이션
    Steps:
      1. page.emulateMedia({ reducedMotion: 'reduce' })
      2. Navigate to index.html
      3. Move mouse across .hero-visuals
      4. Assert: All cards transform === 'none' (parallax 비활성)
    Expected Result: 모션 감소 설정 시 parallax 없음
    Failure Indicators: 카드에 transform 적용됨
    Evidence: .sisyphus/evidence/task-2-reduced-motion.png
  ```

  **Commit**: YES (Task 1과 묶음)
  - Message: `feat(hero): add parallax depth effect to hero cards`
  - Files: `index.html`

---

- [x] 3. JS: `expandCard()` / `collapseCard()` 통합 hook

  **What to do**:
  - `expandCard()` 함수 내에서 `getBoundingClientRect()` 호출 직전 (line 2790):
    ```js
    // Clear parallax transforms before layout capture
    if (window.parallaxState) {
      window.parallaxState.animating = true;
      document.querySelectorAll('.hero-art-card').forEach(c => { c.style.transform = ''; });
    }
    ```
  - `collapseCard()` 내 setTimeout callback에서 `resetCardSize(c)` 호출 직후:
    ```js
    if (window.parallaxState) window.parallaxState.animating = false;
    ```
  - 이게 전부. 총 추가 코드 ~6줄.

  **Must NOT do**:
  - `expandCard()`, `collapseCard()`, `resetCardSize()` 함수 리팩토링 금지
  - `animating` 플래그 외 다른 상태 추가 금지
  - 기존 transform 로직 변경 금지

  **Recommended Agent Profile**:
  > 기존 함수에 최소한의 hook 삽입, 2개 위치에 각 3줄
  - **Category**: `quick`
    - Reason: 명확한 위치 2곳, 총 ~6줄 삽입
  - **Skills**: 없음
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: 이미 위치와 코드가 명확히 지정됨

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential Step 3
  - **Blocks**: Task F1
  - **Blocked By**: Task 2

  **References**:

  **Pattern References**:
  - `index.html:2790` — `expandCard()` 내 `getBoundingClientRect()` 호출 지점. 바로 앞에 parallax 초기화 삽입
  - `index.html:2861–2872` — `collapseCard()` 내 220ms setTimeout. callback 내 `resetCardSize()` 호출 후에 `animating = false` 삽입
  - `index.html:2775` — `resetCardSize()` 함수 — transform 초기화 방식 참고

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Expand 시 visual jump 없음 (critical)
    Tool: Playwright
    Preconditions: index.html 로드, desktop viewport
    Steps:
      1. Move mouse to top-left of .hero-visuals (parallax offset 최대화)
      2. Wait 500ms
      3. Start recording: page.evaluate(() => performance.mark('expand-start'))
      4. Click [data-index="s"] card
      5. Wait for card to have class 'expanded'
      6. Screenshot the expanded card position
      7. Assert: expanded card is centered at viewport (left ~10%, top ~10%)
      8. Assert: card position is NOT offset by parallax amount (±6px 이내 허용)
    Expected Result: 카드가 뷰포트 정중앙에서 expand, parallax offset 없음
    Failure Indicators: 카드가 중앙에서 6px 이상 벗어난 위치에서 expand
    Evidence: .sisyphus/evidence/task-3-expand-no-jump.png

  Scenario: Collapse 후 parallax 재개
    Tool: Playwright
    Preconditions: 위 시나리오 이후 상태
    Steps:
      1. Press Escape to collapse the expanded card
      2. Wait 400ms (220ms animation + buffer)
      3. Move mouse across .hero-visuals
      4. Wait 300ms
      5. Assert: At least one .hero-art-card has non-zero transform translate
    Expected Result: collapse 완료 후 parallax 정상 재개
    Failure Indicators: 모든 카드 transform === 'none' (parallax stuck disabled)
    Evidence: .sisyphus/evidence/task-3-collapse-resume.png

  Scenario: Keyboard expand (a/s/d/f) 시 parallax 차단
    Tool: Playwright
    Preconditions: index.html 로드, mouse in .hero-visuals
    Steps:
      1. Move mouse to edge of .hero-visuals for maximum offset
      2. Wait 300ms
      3. Press 's' key to expand card[s]
      4. Assert: card[s] has class 'expanded'
      5. Assert: parallaxState.animating === true (via page.evaluate)
    Expected Result: 키보드 expand 시에도 parallax 차단됨
    Failure Indicators: parallaxState.animating === false while card is expanded
    Evidence: .sisyphus/evidence/task-3-keyboard-expand.txt
  ```

  **Commit**: YES (개별 커밋)
  - Message: `feat(hero): integrate parallax with expand/collapse system`
  - Files: `index.html`
  - Pre-commit: browser open + manual expand test

---

## Final Verification Wave

- [x] F1. **Full QA — Playwright** — `unspecified-high` + `playwright` skill

  index.html을 로컬에서 열고 모든 QA 시나리오 실행. 통합 시나리오 포함:
  1. 4개 카드 depth 차이 확인 (card[a] > card[f] > card[s] > card[d])
  2. Mouseleave smooth reset (800ms 후 모두 0)
  3. Expand 시 jump 없음 (마우스 오프셋 상태에서 클릭)
  4. Collapse 후 parallax 재개
  5. 키보드 expand (s 키) 후 parallax 차단/재개
  6. prefers-reduced-motion 에뮬레이션 시 비활성
  7. 기존 hover (border color 변화) 정상 동작
  8. 기존 cursor trail 정상 동작 (parallax와 충돌 없음)
  9. 기존 [esc] proximity behavior 정상 동작

  증거: `.sisyphus/evidence/final-qa/` 폴더에 스크린샷 + 결과 텍스트

  Output: `Scenarios [N/N pass] | VERDICT: APPROVE/REJECT`

---

## Commit Strategy

- **Task 1+2**: `feat(hero): add parallax depth effect to hero cards`
- **Task 3**: `feat(hero): integrate parallax with expand/collapse system`

---

## Success Criteria

### Verification Commands
```bash
# will-change 확인
grep -n "will-change" index.html
# Expected: .hero-art-card 블록 안에 "will-change: transform" 라인

# parallax 코드 확인
grep -n "parallaxState\|updateParallax\|PARALLAX" index.html
# Expected: 관련 변수/함수 라인들 출력
```

### Final Checklist
- [x] 4개 카드 각각 다른 depth multiplier로 이동
- [x] Lerp smooth — 커서 trail처럼 부드러운 이동
- [x] Mouseleave 시 부드럽게 중립 복귀
- [x] Expand 시 jump 없음
- [x] Collapse 후 parallax 재개
- [x] isTouch 기기에서 비활성화
- [x] prefers-reduced-motion 존중
- [x] 기존 hover, cursor trail, proximity [esc] 정상
