# Projects 모달 키보드 네비게이션 추가

## TL;DR
> **요약**: Projects 섹션 모달(001-006)에서 화살표 키로 이미지 캐러셀 네비게이션 추가
> 
> **Deliverables**:
> - ArrowLeft/ArrowRight 키로 썸네일 간 이동
> - 활성 모달에서만 동작 (다른 키와 충돌 방지)
> - 시각적 피드백 (active 썸네일 하이라이트)
> - 순환 네비게이션 (마지막→첫번째, 첫번째→마지막)
> 
> **Estimated Effort**: Small

---

## Context

### 요청사항
- TUI aesthetic를 유지하며 키보드 단축키 추가
- 화살표 키 (←/→)로 이미지 간 이동
- 다른 키와 충돌하지 않도록 modal이 활성화된 상태에서만 동작

### 기술적 제약
- 기존 캐러셀 클릭 로직 재사용
- `.active` 클래스로 시각적 피드백 유지

---

## Work Objectives

### Core Objective
Projects 모달에서 키보드로 이미지 탐색 가능하도록 구현

### Concrete Deliverables
1. JS: document keydown 이벤트 리스너 추가
2. JS: 활성 모달 체크 (`document.querySelector('.work-detail-modal.active')`)
3. JS: 화살표 키 핸들링 (ArrowLeft/ArrowRight)
4. JS: 순환 네비게이션 (wrap-around)
5. JS: 기존 썸네일 클릭 로직과 동일한 이미지 전환

### Must NOT Have
- 입력 필드(input/textarea)에서 동작하지 않음
- 모달이 비활성화 상태에서는 동작하지 않음
- 다른 기존 키보드 단축키와 충돌

---

## TODOs

- [ ] 1. 키보드 네비게이션 코드 추가

  **What to do**:
  - Projects 모달 IIFE 내에 keydown 이벤트 리스너 추가
  - backdrop click handler 아래, cursor esc absorption 위에 삽입
  
  **Changes**:
  ```javascript
  // Keyboard navigation for carousel (Arrow keys with modal scope)
  document.addEventListener('keydown', (e) => {
      // Only handle arrow keys when a modal is active
      const activeModal = document.querySelector('.work-detail-modal.active');
      if (!activeModal) return;
      
      // Don't interfere if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      const thumbs = activeModal.querySelectorAll('.carousel-thumbs .thumb');
      const mainImg = activeModal.querySelector('.carousel-main img');
      if (thumbs.length === 0 || !mainImg) return;
      
      // Find current active index
      let currentIndex = Array.from(thumbs).findIndex(t => t.classList.contains('active'));
      if (currentIndex === -1) currentIndex = 0;
      
      let newIndex = currentIndex;
      
      if (e.key === 'ArrowLeft') {
          newIndex = currentIndex - 1;
          if (newIndex < 0) newIndex = thumbs.length - 1; // Wrap to last
      } else if (e.key === 'ArrowRight') {
          newIndex = currentIndex + 1;
          if (newIndex >= thumbs.length) newIndex = 0; // Wrap to first
      } else {
          return; // Not an arrow key, exit
      }
      
      // Trigger the same behavior as clicking the thumbnail
      const targetThumb = thumbs[newIndex];
      const fullSrc = targetThumb.getAttribute('data-full-src');
      
      if (fullSrc) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
              mainImg.src = fullSrc;
              mainImg.style.opacity = '1';
          }, 200);
      }
      
      // Update active state (visual feedback)
      thumbs.forEach(t => t.classList.remove('active'));
      targetThumb.classList.add('active');
  });
  ```

  **Acceptance Criteria**:
  - [ ] 화살표 키로 이미지 간 이동 가능
  - [ ] 활성 모달에서만 동작
  - [ ] 순환 네비게이션 (wrap-around) 동작
  - [ ] 썸네일에 active 클래스 적용 (시각적 피드백)
  - [ ] 입력 필드에서는 동작하지 않음
  
  **Commit**: `feat(js): add keyboard navigation to project modals`

- [ ] 2. 최종 테스트

  **Acceptance Criteria**:
  - [ ] 모든 6개 모달에서 화살표 키 동작 확인
  - [ ] 순환 네비게이션 확인
  - [ ] ESC 키로 닫기 여전히 동작
  
  **Commit**: `chore: verify keyboard navigation`

---

## Success Criteria

### Final Checklist
- [ ] ArrowLeft로 이전 이미지
- [ ] ArrowRight로 다음 이미지
- [ ] 마지막 이미지에서 → 누르면 첫번째로 순환
- [ ] 첫번째 이미지에서 ← 누르면 마지막으로 순환
- [ ] 모달 비활성 상태에서는 화살표 키 무시
- [ ] 입력 필드에서는 화살표 키 무시
- [ ] active 썸네일 하이라이트 표시
