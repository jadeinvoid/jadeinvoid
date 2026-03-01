# Projects 모달 추가 개선사항

## TL;DR
> **요약**: 4가지 UI 버그/개선 작업
> 
> **Deliverables**:
> - Click forwarding 원래대로 복원
> - 이미지 로딩/표시 버그 수정  
> - Carousel + info-section 모달 높이 꽉 채우기
> - Projects 모달 [esc]에 커서 흡수 효과 적용
> 
> **Estimated Effort**: Small
> **Parallel Execution**: NO - 순차 수정

---

## Context

### 현재 상황
- 이전 수정 후 4가지 새로운 이슈 발생
- 사용자 테스트 결과 개선 필요

### 개선사항 목록
1. **Click forwarding**: 모달 열릴 때 커서가 사라짐 - 내가 추가한 체크 로직 원래대로 복원
2. **이미지 버그**: 썸네일 이미지 일부 안 보임 (Process 1, 2, 3 텍스트만 보임)
3. **레이아웃**: Carousel과 info-section이 모달 높이를 꽉 채우지 않음 (아래 빈 공간)
4. **커서 효과**: Landing page 모달 [esc] hover 시 커서가 [esc]로 바뀌는데, Projects 모달에도 적용 필요

---

## Work Objectives

### Core Objective
Projects 모달 UX 개선 - 이미지 정상 표시, 레이아웃 최적화, 커서 상호작용 일관성

### Concrete Deliverables
1. JS: click forwarding에서 모달 체크 제거 (line 2321)
2. CSS: 이미지 로딩/표시 버그 원인 찾아 수정
3. CSS: carousel-section과 info-section이 flex container를 꽉 채우도록 수정
4. JS: Projects 모달의 `.tui-close-btn`에도 `mouseenter/leave` 핸들러 추가하여 커서 흡수 효과 적용

---

## TODOs

- [ ] 1. Click forwarding 원래대로 복원

  **What to do**:
  - Line 2321: `if (document.querySelector('.work-detail-modal.active')) return;` 제거
  
  **Changes**:
  ```javascript
  // FROM:
  document.addEventListener('click', (e) => {
      if (forwardingClick) return;
      if (document.querySelector('.work-detail-modal.active')) return; // Don't forward when modal open
      if (hoveredInteractive && !hoveredInteractive.contains(e.target)) {
          forwardingClick = true;
          hoveredInteractive.click();
          forwardingClick = false;
      }
  });
  
  // TO:
  document.addEventListener('click', (e) => {
      if (forwardingClick) return;
      if (hoveredInteractive && !hoveredInteractive.contains(e.target)) {
          forwardingClick = true;
          hoveredInteractive.click();
          forwardingClick = false;
      }
  });
  ```

  **Acceptance Criteria**:
  - [ ] 모달 열린 상태에서도 click forwarding 동작 (커서 [esc] 표시 유지)
  
  **Commit**: `fix(js): restore click forwarding behavior`

- [ ] 2. 이미지 로딩/표시 버그 수정

  **What to do**:
  - 썸네일 이미지가 안 보이는 원인 파악 및 수정
  - `.carousel-thumbs .thumb` 또는 `.carousel-main img` CSS 확인
  
  **Investigation Points**:
  - `.carousel-thumbs .thumb`가 `display: block`인지 확인
  - 이미지 경로가 올바른지 확인 (data-full-src 속성)
  - CSS에서 이미지 크기 제한이 있는지 확인
  
  **Acceptance Criteria**:
  - [ ] 모든 썸네일 이미지 정상 표시
  - [ ] 메인 이미지 전환 정상 동작
  
  **Commit**: `fix(css): fix thumbnail image display`

- [ ] 3. Carousel + info-section 모달 높이 꽉 채우기

  **What to do**:
  - `.modal-body`의 flex layout 수정하여 남은 공간 모두 사용
  - `.carousel-section`과 `.info-section`이 flex: 1로 늘어나도록 수정
  - `.tui-content`가 flex: 1로 늘어나도록 확인
  
  **Changes** (CSS around line 1370-1420):
  ```css
  .modal-body {
      flex: 1;
      min-height: 0;
      display: flex;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
      overflow: hidden;
  }
  
  .carousel-section {
      flex: 1;  /* 1.2 → 1로 변경하여 균등 분배 */
      display: flex;
      flex-direction: column;
      min-height: 0;
      gap: var(--spacing-sm);
  }
  
  .carousel-main {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      /* ... */
  }
  
  .info-section {
      flex: 1;  /* 0.8 → 1로 변경 */
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow-y: auto;
      /* ... */
  }
  ```

  **Acceptance Criteria**:
  - [ ] Carousel과 info-section이 모달 body 높이를 꽉 채움
  - [ ] 아래쪽 빈 공간 없음
  
  **Commit**: `fix(css): make carousel and info fill modal height`

- [ ] 4. Projects 모달 [esc]에 커서 흡수 효과 적용

  **What to do**:
  - Landing page 모달(hero-art-card expanded)처럼 Projects 모달의 [esc] 버튼에도 커서 흡수 효과 추가
  - `.tui-close-btn`에 `mouseenter`/`mouseleave` 이벤트 리스너 추가
  
  **Changes** (JS after line 2923 where backdrop click handler is):
  ```javascript
  // Backdrop click to close all modals
  const backdrop = document.querySelector('.work-detail-backdrop');
  if (backdrop) {
      backdrop.addEventListener('click', closeAllModals);
  }
  
  // Add cursor esc absorption for modal close buttons (like hero cards)
  modals.forEach(modal => {
      const closeBtn = modal.querySelector('.tui-close-btn');
      if (closeBtn) {
          closeBtn.addEventListener('mouseenter', () => {
              if (typeof activateInteractive === 'function') {
                  activateInteractive(closeBtn);
              }
          });
          closeBtn.addEventListener('mouseleave', () => {
              if (typeof deactivateInteractive === 'function') {
                  deactivateInteractive(closeBtn);
              }
          });
      }
  });
  ```

  **Acceptance Criteria**:
  - [ ] Projects 모달 [esc] 버튼 hover 시 커서가 [esc] 텍스트로 변경됨
  - [ ] 마우스 떠나면 커서 원래대로 돌아옴
  
  **Commit**: `feat(js): add cursor esc absorption to project modals`

- [ ] 5. 최종 검증

  **What to do**:
  - 모든 6개 모달 열어보고 테스트
  - 이미지 정상 표시 확인
  - 레이아웃 꽉 참 확인
  - 커서 효과 확인
  
  **Acceptance Criteria**:
  - [ ] 모든 테스트 통과
  
  **Commit**: `chore: verify all fixes`

---

## Success Criteria

### Final Checklist
- [ ] Click forwarding 원래대로 복원됨
- [ ] 썸네일 이미지 모두 정상 표시됨
- [ ] Carousel + info-section이 모달 높이 꽉 참
- [ ] Projects 모달 [esc]에 커서 흡수 효과 적용됨
