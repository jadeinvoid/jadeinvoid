# About Section Text Update

## TL;DR

> **Quick Summary**: About 섹션의 skill tags 5개를 순서/텍스트 변경하고, 이메일 주소를 2곳에서 업데이트한다.
>
> **Deliverables**:
> - Skill tags 5개 교체 (순서 + 텍스트 + all-caps)
> - 이메일 2곳: `contact@email.com` → `yjcho0602@gmail.com`
>
> **Estimated Effort**: Quick
> **Parallel Execution**: NO
> **Critical Path**: Task 1 (single edit, all changes in one shot)

---

## Context

### Original Request
About 섹션 skill tags를 순서 포함해서 변경, 이메일도 업데이트.

### Current State (index.html lines 2209–2215, 2229)

**Skill tags (lines 2209–2213):**
```html
<span class="skill-item"> TUI / Terminal UI Design</span>
<span class="skill-item"> Editorial Illustration</span>
<span class="skill-item"> UX Research</span>
<span class="skill-item"> Animation</span>
<span class="skill-item"> Design-to-Code Prototyping</span>
```

**Footer label (line 2215):**
```html
<p class="about-label"> Available for freelance · contact@email.com</p>
```

**Contact section email (line 2229):**
```html
<p>Email: <a href="mailto:contact@email.com">contact@email.com</a></p>
```

### Target State

**Skill tags — new order and text (all-caps):**
1. `UX DESIGN`
2. `TUI DESIGN`
3. `ILLUSTRATION`
4. `DESIGN-TO-CODE PROTOTYPING`
5. `ANIMATION`

**Email:** `yjcho0602@gmail.com` (both locations)

---

## Work Objectives

### Must Have
- Skill tags 정확히 위 순서대로 5개 (leading space 유지: `" UX DESIGN"`)
- All-caps 적용
- `contact@email.com` → `yjcho0602@gmail.com` (두 곳 모두: about-label + contact section href + text)

### Must NOT Have
- 다른 HTML 변경 없음
- CSS 변경 없음
- 구조 변경 없음

---

## TODOs

- [ ] 1. Update skill tags and email in index.html

  **What to do**:
  - `index.html` lines 2209–2213: Replace all 5 skill-item spans with new order/text
  - `index.html` line 2215: Replace `contact@email.com` with `yjcho0602@gmail.com` in about-label
  - `index.html` line 2229: Replace `contact@email.com` (both href and text) with `yjcho0602@gmail.com`

  **Exact replacements**:

  Line 2209: `<span class="skill-item"> TUI / Terminal UI Design</span>`
  → `<span class="skill-item"> UX DESIGN</span>`

  Line 2210: `<span class="skill-item"> Editorial Illustration</span>`
  → `<span class="skill-item"> TUI DESIGN</span>`

  Line 2211: `<span class="skill-item"> UX Research</span>`
  → `<span class="skill-item"> ILLUSTRATION</span>`

  Line 2212: `<span class="skill-item"> Animation</span>`
  → `<span class="skill-item"> DESIGN-TO-CODE PROTOTYPING</span>`

  Line 2213: `<span class="skill-item"> Design-to-Code Prototyping</span>`
  → `<span class="skill-item"> ANIMATION</span>`

  Line 2215: `contact@email.com` → `yjcho0602@gmail.com`

  Line 2229: `href="mailto:contact@email.com"` → `href="mailto:yjcho0602@gmail.com"`
  and text `contact@email.com` → `yjcho0602@gmail.com`

  **Must NOT do**:
  - 다른 라인 건드리지 않기
  - CSS class 변경 없음

  **Recommended Agent Profile**:
  - **Category**: `quick`

  **References**:
  - `index.html:2209–2215` — skill tags + about-label
  - `index.html:2229` — contact section email

  **QA Scenarios**:

  ```
  Scenario: Skill tags 순서/텍스트 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "skill-item" index.html
    Expected Result: 순서대로 UX DESIGN, TUI DESIGN, ILLUSTRATION, DESIGN-TO-CODE PROTOTYPING, ANIMATION
    Evidence: .sisyphus/evidence/task-1-skills.txt

  Scenario: 이메일 업데이트 확인
    Tool: Bash (grep)
    Steps:
      1. grep -n "contact@email.com" index.html
    Expected Result: 결과 없음 (모두 교체됨)
    Evidence: .sisyphus/evidence/task-1-email.txt
  ```

  **Commit**: YES
  - Message: `content(about): update skill tags order and email address`
  - Files: `index.html`

---

## Success Criteria

```bash
grep -n "skill-item" index.html
# Expected: UX DESIGN, TUI DESIGN, ILLUSTRATION, DESIGN-TO-CODE PROTOTYPING, ANIMATION (in order)

grep -c "contact@email.com" index.html
# Expected: 0
```
