# Figma ↔ HTML 동기화 워크플로우

## 전체 흐름

```
Figma에서 컴포넌트 텍스트 수정
        ↓
Claude Code 터미널:  node sync-from-figma.js
        ↓
portfolio-prototype.html 자동 업데이트
```

---

## STEP 1 — Figma 파일 만들기

1. Figma 새 파일 생성 → 이름: `portfolio-minhwa-tui`
2. Pages 3개로 이름 변경: `Content` / `Components` / `Tokens`
3. Content 페이지에 프레임 4개 생성 (`F` 단축키): `nav` / `hero` / `works` / `about`

---

## STEP 2 — 컴포넌트 만들기 (핵심)

텍스트 레이어를 그냥 쓰면 레이어 이름 = 텍스트 내용으로 자동 동기화돼서
이름을 바꿀 수 없어요. **반드시 Component로 감싸야 합니다.**

### 순서
```
① 텍스트 박스 생성 (T 단축키)
② 텍스트 내용 입력 (예: UX Designer · Illustrator)
③ 텍스트 박스 선택 → Cmd+Alt+K (Mac) / Ctrl+Alt+K (Win)
④ 생성된 컴포넌트 이름을 스펙 이름으로 변경 (예: nav/site-name)
```

### 결과 레이어 구조
```
⬡ nav/site-name          ← 컴포넌트 이름 (스크립트가 읽음)
  T  UX Designer · Illustrator  ← 텍스트 내용 (자유롭게 편집)
```

이후 텍스트를 수정할 때는 컴포넌트 안의 텍스트를 더블클릭해서 편집.
컴포넌트 이름은 절대 건드리지 않음.

---

## STEP 3 — FILE_KEY 설정

Figma 파일 URL에서 키 추출:
```
https://figma.com/design/AbCdEf1234/portfolio-minhwa-tui
                         ↑↑↑↑↑↑↑↑↑↑↑↑
                         이게 FILE_KEY
```

`sync-from-figma.js` 6번째 줄 수정:
```js
// 전
const FILE_KEY = 'YOUR_FIGMA_FILE_KEY';

// 후
const FILE_KEY = 'AbCdEf1234';
```

---

## STEP 4 — Claude Code에서 실행

```bash
# 전체 동기화
node sync-from-figma.js

# 섹션별
node sync-from-figma.js --section nav
node sync-from-figma.js --section hero
node sync-from-figma.js --section works
node sync-from-figma.js --section about

# 저장 전 미리보기
node sync-from-figma.js --dry-run
```

### 정상 출력 예시
```
🔄  Figma → HTML sync  |  section: all  |  dry-run: false

📡  Figma 파일 읽는 중...
✅  28개 컴포넌트 발견

  ✏️   nav/site-name          → "UX Designer · Illustrator"
  ✏️   works/card-001/title   → "Terminal Dashboard UI"
  ...

✅  18개 업데이트 완료 → portfolio-prototype.html
```

---

## 일상적인 편집 흐름

```
1. Figma에서 컴포넌트 안 텍스트 더블클릭 → 수정
2. 저장 (Cmd+S)
3. 터미널: node sync-from-figma.js --section works
4. 브라우저에서 portfolio-prototype.html 확인
```

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| `FILE_KEY 설정하세요` | FILE_KEY 미입력 | STEP 3 |
| `Figma 연결 실패` | MCP 미연결 | Claude Code에서 `/mcp` 확인 |
| `못 찾은 컴포넌트` | 이름 불일치 | Figma 레이어 패널에서 컴포넌트 이름 확인 |
| HTML이 안 바뀜 | 텍스트 레이어를 컴포넌트로 안 감쌈 | STEP 2 다시 |

---

## 파일 목록

| 파일 | 역할 |
|---|---|
| `portfolio-prototype.html` | 포트폴리오 본체 |
| `figma-content-spec.md` | 컴포넌트 이름 규칙 전체 목록 |
| `sync-from-figma.js` | 자동 동기화 스크립트 |
| `README-figma-workflow.md` | 이 파일 |
