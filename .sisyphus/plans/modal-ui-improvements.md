# Projects Modal UI 개선사항

## TL;DR
> **요약**: Projects 섹션 모달의 4가지 UI 개선 작업
> 
> **Deliverables**:
> - 이미지 크기 축소로 스크롤 제거
> - 배경 backdrop/shadow 추가
> - 모달 외부 클릭 시 닫기 + 중첩 방지
> - [esc] 버튼 hover 효과
> 
> **Estimated Effort**: Small
> **Parallel Execution**: NO - 단일 파일 수정

---

## Context

### 현재 상황
- Projects 섹션에 6개 모달이 TUI frame 구조로 구현됨
- 모달 열기/닫기, 캐러셀, FLIP 애니메이션 모두 작동함
- 사용자가 브라우저 테스트 후 4가지 UI 개선 요청

### 개선사항 목록
1. **이미지 크기**: `.carousel-main`이 너무 커서 스크롤 필요
2. **배경 shadow**: landing page 모달처럼 어두운 배경 필요
3. **외부 클릭**: 모달 바깥 클릭 시 닫기 + 다른 프로젝트 클릭 시 중첩 방지
4. **hover 효과**: [esc] 버튼에 hover 시 시각적 피드백 필요

---

## Work Objectives

### Core Objective
Projects 모달의 UX 개선 - 스크롤 제거, 일관된 배경,直覺적인 닫기 동작

### Concrete Deliverables
1. CSS: `.carousel-main` height 축소 (45vh)
2. CSS: `.work-detail-backdrop` 추가 (어두운 배경)
3. CSS: `.tui-close-btn:hover` 스타일 추가
4. HTML: `<div class="work-detail-backdrop">` 요소 추가
5. JS: `openModal()`에 `closeAllModals()` 호출 추가
6. JS: backdrop 클릭 이벤트 핸들러 추가

### Must NOT Have
- 새 HTML 파일 생성 금지
- 외부 라이브러리 추가 금지
- 기존 TUI frame 구조 변경 금지
- FLIP 애니메이션 깨지면 안됨

---

## Execution Strategy

### 순차 실행 (단일 파일)

```
Task 1 (CSS) → Task 2 (HTML) → Task 3 (CSS) → Task 4 (JS)
   ↓              ↓                ↓              ↓
Backdrop CSS   Backdrop HTML   [esc] hover    JS 로직
+ carousel                      스타일        업데이트
height fix
```

---

## TODOs

- [ ] 1. Backdrop CSS 및 Carousel Height 수정

  **What to do**:
  - `.work-detail-backdrop` 클래스 추가 (CSS line ~1298)
  - `.carousel-main`을 `flex: 0 0 45vh; max-height: 45vh;`로 변경 (CSS line ~1357)
  
  **Changes**:
  ```css
  /* After .work-detail-modal.active, add: */
  .work-detail-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
  }
  .work-detail-backdrop.active {
      display: block;
      opacity: 1;
  }
  
  /* Change .carousel-main from flex: 1 to: */
  .carousel-main {
      flex: 0 0 45vh;
      max-height: 45vh;
      /* ... rest unchanged ... */
  }
  ```

  **Acceptance Criteria**:
  - [ ] `.work-detail-backdrop` CSS 존재
  - [ ] `.carousel-main`에 `max-height: 45vh` 적용됨
  
  **Commit**: `fix(css): add backdrop and reduce carousel height`

- [ ] 2. Backdrop HTML 요소 추가

  **What to do**:
  - 6개 모달 앞에 `<div class="work-detail-backdrop"></div>` 추가 (HTML line ~1779)
  
  **Changes**:
  ```html
  <!-- Before Modal 001 -->
  <div class="work-detail-backdrop"></div>
  ```

  **Acceptance Criteria**:
  - [ ] `<div class="work-detail-backdrop">`가 모달들 앞에 존재
  
  **Commit**: `fix(html): add backdrop element`

- [ ] 3. [esc] 버튼 Hover 스타일 추가

  **What to do**:
  - `.tui-close-btn`에 hover 스타일 추가 (CSS line ~363)
  
  **Changes**:
  ```css
  /* After .tui-close-btn, add: */
  .tui-close-btn:hover {
      opacity: 0.7;
      transform: scale(1.05);
  }
  .tui-close-btn:hover .tui-btn-key {
      color: var(--color-accent-2);
  }
  ```

  **Acceptance Criteria**:
  - [ ] `.tui-close-btn:hover` 스타일 존재
  - [ ] `.tui-close-btn:hover .tui-btn-key` 색상 변경 존재
  
  **Commit**: `fix(css): add esc button hover effect`

- [ ] 4. JavaScript 로직 업데이트 (Backdrop 및 중첩 방지)

  **What to do**:
  - `openModal()` 함수 수정: `closeAllModals()` 호출 추가, backdrop 활성화
  - `closeModal()` 함수 수정: backdrop 비활성화 추가
  - backdrop 클릭 이벤트 핸들러 추가
  
  **Changes**:
  ```javascript
  // In openModal() function:
  function openModal(projectNum, card) {
      closeAllModals();  // Add this line first
      const modal = document.getElementById(`modal-${projectNum}`);
      const backdrop = document.querySelector('.work-detail-backdrop');
      if (modal) {
          lastClickedCard = card;
          if (backdrop) backdrop.classList.add('active');
          animateModalOpen(card, modal);
          document.body.style.overflow = 'hidden';
      }
  }
  
  // In closeModal() function:
  function closeModal(modal) {
      const backdrop = document.querySelector('.work-detail-backdrop');
      if (backdrop) backdrop.classList.remove('active');
      // ... rest of function
  }
  
  // Add after modals.forEach loop:
  const backdrop = document.querySelector('.work-detail-backdrop');
  if (backdrop) {
      backdrop.addEventListener('click', closeAllModals);
  }
  ```

  **Acceptance Criteria**:
  - [ ] `openModal()`이 `closeAllModals()`를 먼저 호출함
  - [ ] `openModal()`이 backdrop을 활성화함
  - [ ] `closeModal()`이 backdrop을 비활성화함
  - [ ] backdrop 클릭 시 `closeAllModals()` 호출됨
  
  **Commit**: `fix(js): update modal logic for backdrop and stacking prevention`

- [ ] 5. 최종 QA 및 검증

  **What to do**:
  - 모든 6개 모달 열기/닫기 테스트
  - backdrop 클릭으로 닫히는지 확인
  - 다른 프로젝트 클릭 시 중첩되지 않는지 확인
  - [esc] 버튼 hover 효과 확인
  - 이미지가 스크롤 없이 표시되는지 확인
  
  **Acceptance Criteria**:
  - [ ] 모든 6개 모달 정상 열림/닫힘
  - [ ] backdrop 클릭 시 모달 닫힘
  - [ ] 다른 프로젝트 클릭 시 기존 모달 닫히고 새 모달 열림
  - [ ] [esc] 버튼 hover 시 색상/크기 변화
  - [ ] 모달 내 스크롤 없이 이미지 표시
  
  **Commit**: `chore: verify UI improvements`

---

## Success Criteria

### Final Checklist
- [ ] 이미지 크기 축소로 스크롤 제거됨
- [ ] 배경 backdrop/shadow 추가됨
- [ ] 모달 외부 클릭 시 닫힘
- [ ] 다른 프로젝트 클릭 시 중첩되지 않음
- [ ] [esc] 버튼 hover 효과 적용됨
- [ ] FLIP 애니메이션 계속 작동함
- [ ] prefers-reduced-motion 지원 유지됨
