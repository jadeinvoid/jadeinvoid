# Portfolio — Figma Content Spec
> Claude Code + Figma MCP 연동용.
> 이 스펙대로 Figma를 구성하면 `sync-from-figma.js`가 자동으로 HTML에 반영합니다.

---

## ⚠️ 핵심 규칙 — Component로 감싸기

Figma에서 텍스트 레이어 이름을 바꾸면 텍스트 내용도 같이 바뀝니다.
이 문제를 피하려면 텍스트를 **Component로 감싸서** 컴포넌트 이름으로 식별합니다.

### 방법 (한 번만 하면 됨)
1. 텍스트 박스 선택
2. `Cmd+Alt+K` (Mac) / `Ctrl+Alt+K` (Windows) → Component 생성
3. 레이어 패널에서 **컴포넌트 이름**을 아래 표의 이름으로 변경
4. 텍스트 내용은 캔버스에서 더블클릭해서 자유롭게 편집

```
레이어 패널                       캔버스
─────────────────────────        ──────────────────────────────
⬡ nav/site-name         →        UX Designer · Illustrator
  T  (이름은 뭐든 상관없음)              ↑ 이걸 자유롭게 편집
```

---

## 파일 구조

```
📄 Content      ← 여기서만 편집
📄 Components   ← 건드리지 않음
📄 Tokens       ← 건드리지 않음
```

---

## Content 페이지 구성

### ❶ Frame: `nav`

| 컴포넌트 이름 | 텍스트 내용 (기본값) | 설명 |
|---|---|---|
| `nav/site-name` | `UX Designer · Illustrator` | 좌측 상단 이름 |
| `nav/link-works` | `Works` | 네비 링크 |
| `nav/link-about` | `About` | 네비 링크 |
| `nav/link-contact` | `Contact` | 네비 링크 |
| `nav/status` | `Available for projects` | 우측 상단 상태 |

---

### ❷ Frame: `hero`

| 컴포넌트 이름 | 텍스트 내용 (기본값) |
|---|---|
| `hero/label` | `UX Designer & Illustrator` |
| `hero/title-line-1` | `Designing at the` |
| `hero/title-line-2` | `edge of terminal` |
| `hero/title-line-3` | `and canvas.` |
| `hero/description` | `I work at the intersection of TUI systems...` |
| `hero/caption` | `TUI · Illustration · 2024` |
| `hero/card-a/label` | `Design / TUI` |
| `hero/card-b/label` | `Illustration` |
| `hero/card-c/label` | `Korean / Print` |
| `hero/card-d/label` | `Illustration / Layout` |

> `hero/title-line-2` 의 텍스트에서 `edge of` 와 `and canvas` 사이 단어가
> HTML에서 자동으로 이탤릭 처리됩니다. (예: `terminal`)

---

### ❸ Frame: `works`

카드 6개, 각각 아래 컴포넌트 패턴 반복.
`001` → `002` → ... → `006` 순서로 만들기.

| 컴포넌트 이름 | 텍스트 내용 예시 | 비고 |
|---|---|---|
| `works/card-001/num` | `001` | |
| `works/card-001/title` | `Terminal Dashboard UI` | |
| `works/card-001/category` | `Design` | 아래 색상 표 참고 |
| `works/card-001/tag-1` | `TUI` | |
| `works/card-001/tag-2` | `Research` | |
| `works/card-001/tags` | `design tui research` | 필터용, 소문자 공백 구분 |

**category 값 → HTML 색상 자동 매핑:**

| category 텍스트 | 색상 |
|---|---|
| `Design` | 청 `#2a5070` |
| `Illustration` | 적 `#b83232` |
| `Research` | 황 `#c9922a` |
| `Misc` | 흑 `#1c1a18` |

---

### ❹ Frame: `about`

| 컴포넌트 이름 | 텍스트 내용 (기본값) |
|---|---|
| `about/tagline` | `Lean tools, expressive craft.` |
| `about/bio` | `UX designer and illustrator working at...` |
| `about/skill-1` | `TUI / Terminal UX` |
| `about/skill-2` | `Editorial Illustration` |
| `about/skill-3` | `UX Research` |
| `about/skill-4` | `Korean Visual Heritage` |
| `about/skill-5` | `Figma / Prototyping` |
| `about/available` | `Available for freelance` |
| `about/email` | `hello@example.com` |

---

## 전체 컴포넌트 목록 (빠른 참조)

```
nav/site-name
nav/link-works
nav/link-about
nav/link-contact
nav/status

hero/label
hero/title-line-1
hero/title-line-2
hero/title-line-3
hero/description
hero/caption
hero/card-a/label
hero/card-b/label
hero/card-c/label
hero/card-d/label

works/card-001/num        works/card-002/num        ... works/card-006/num
works/card-001/title      works/card-002/title      ... works/card-006/title
works/card-001/category   works/card-002/category   ... works/card-006/category
works/card-001/tag-1      works/card-002/tag-1      ... works/card-006/tag-1
works/card-001/tag-2      works/card-002/tag-2      ... works/card-006/tag-2
works/card-001/tags       works/card-002/tags       ... works/card-006/tags

about/tagline
about/bio
about/skill-1 ~ skill-5
about/available
about/email
```
