#!/usr/bin/env node
/**
 * sync-from-figma.js
 * ─────────────────────────────────────────────────────────────────────
 * Claude Code + Figma MCP 연동 스크립트.
 *
 * ⚠️  Figma 구조 규칙:
 *   텍스트를 Component로 감싸서 사용 (Ctrl/Cmd+Alt+K).
 *   컴포넌트 이름(예: nav/site-name)으로 식별하고,
 *   내부 TEXT 노드의 characters를 값으로 읽음.
 *   → 레이어 이름 = 텍스트 내용으로 자동 동기화되는 Figma 버그 해결.
 *
 * 사용법:
 *   node sync-from-figma.js                  # 전체 동기화
 *   node sync-from-figma.js --section nav
 *   node sync-from-figma.js --section works
 *   node sync-from-figma.js --section hero
 *   node sync-from-figma.js --section about
 *   node sync-from-figma.js --dry-run        # 저장 없이 미리보기
 * ─────────────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

// ── CONFIG ────────────────────────────────────────────────────────────
const FILE_KEY  = 'EiHpsaOmcMFDSIRTV1qCY1'; // ← Figma URL에서 추출해서 교체
const HTML_PATH = path.join(__dirname, 'portfolio-prototype.html');
const SECTION   = process.argv.includes('--section')
  ? process.argv[process.argv.indexOf('--section') + 1]
  : 'all';
const DRY_RUN = process.argv.includes('--dry-run');

// ── COMPONENT NAME → HTML SELECTOR MAP ───────────────────────────────
/**
 * key   = Figma 컴포넌트 이름 (Cmd+Alt+K 로 만든 컴포넌트의 이름)
 * value = { selector, attr?, special?, section }
 *
 * 스크립트는 COMPONENT 노드 이름으로 찾은 뒤,
 * 그 안의 첫 번째 TEXT 노드 characters를 값으로 읽음.
 * 텍스트 레이어 자체 이름은 무시.
 */
const NODE_MAP = {

  // ── NAV ────────────────────────────────────────────────────────
  'nav/site-name':    { selector: '.nav-brand span',    section: 'nav' },
  'nav/link-works':   { selector: 'a[href="#works"]',   section: 'nav' },
  'nav/link-about':   { selector: 'a[href="#about"]',   section: 'nav' },
  'nav/link-contact': { selector: 'a[href="#contact"]', section: 'nav' },
  'nav/status':       { selector: '.nav-status',        section: 'nav' },

  // ── HERO ────────────────────────────────────────────────────────
  'hero/label':        { selector: '.hero-label',   section: 'hero' },
  'hero/description':  { selector: '.hero-desc',    section: 'hero' },
  'hero/caption':      { selector: '.hero-caption', section: 'hero' },

  // 타이틀 3줄 — 마지막 줄에서 한번에 처리
  'hero/title-line-1': { selector: null, special: 'hero-title', section: 'hero' },
  'hero/title-line-2': { selector: null, special: 'hero-title', section: 'hero' },
  'hero/title-line-3': { selector: null, special: 'hero-title', section: 'hero' },

  // 히어로 아트워크 카드 레이블
  'hero/card-a/label': { selector: '.hero-art-card:nth-child(1) .hac-label', section: 'hero' },
  'hero/card-b/label': { selector: '.hero-art-card:nth-child(2) .hac-label', section: 'hero' },
  'hero/card-c/label': { selector: '.hero-art-card:nth-child(3) .hac-label', section: 'hero' },
  'hero/card-d/label': { selector: '.hero-art-card:nth-child(4) .hac-label', section: 'hero' },

  // ── WORKS ────────────────────────────────────────────────────────
  ...buildWorkCardMap(),

  // ── ABOUT ────────────────────────────────────────────────────────
  'about/tagline':   { selector: '.about-tagline',                section: 'about' },
  'about/bio':       { selector: '.about-bio',                    section: 'about' },
  'about/skill-1':   { selector: '.about-skills li:nth-child(1)', section: 'about' },
  'about/skill-2':   { selector: '.about-skills li:nth-child(2)', section: 'about' },
  'about/skill-3':   { selector: '.about-skills li:nth-child(3)', section: 'about' },
  'about/skill-4':   { selector: '.about-skills li:nth-child(4)', section: 'about' },
  'about/skill-5':   { selector: '.about-skills li:nth-child(5)', section: 'about' },
  'about/available': { selector: '.about-available',              section: 'about' },
  'about/email':     { selector: '.about-email',                  section: 'about' },
};

function buildWorkCardMap() {
  const map = {};
  for (let i = 1; i <= 6; i++) {
    const n    = String(i).padStart(3, '0');
    const base = `.work-card:nth-child(${i})`;
    map[`works/card-${n}/num`]      = { selector: `${base} .card-num`,              section: 'works' };
    map[`works/card-${n}/title`]    = { selector: `${base} .card-title`,            section: 'works' };
    map[`works/card-${n}/category`] = { selector: `${base} .card-type`, special: 'category', cardIndex: i, section: 'works' };
    map[`works/card-${n}/tag-1`]    = { selector: `${base} .card-tag:nth-child(1)`, section: 'works', special: 'tag' };
    map[`works/card-${n}/tag-2`]    = { selector: `${base} .card-tag:nth-child(2)`, section: 'works', special: 'tag' };
    map[`works/card-${n}/tags`]     = { selector: base, attr: 'data-tags',          section: 'works' };
  }
  return map;
}

// ── FIGMA API ─────────────────────────────────────────────────────────
async function fetchFigmaFile(fileKey) {
  // Claude Code 내 Figma MCP 경로
  if (typeof mcp !== 'undefined' && mcp?.figma) {
    return mcp.figma.getFile({ fileKey });
  }
  // Fallback: 환경변수 토큰 + REST API
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    throw new Error(
      'Figma 연결 방법 2가지:\n' +
      '  1) Claude Code 안에서 실행 (MCP 자동 연결됨)\n' +
      '  2) export FIGMA_TOKEN=your_personal_token 후 실행'
    );
  }
  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── NODE TRAVERSAL ────────────────────────────────────────────────────
/**
 * Figma 트리에서 컴포넌트를 찾아 맵 생성.
 *
 * COMPONENT 또는 FRAME 노드를 이름으로 인덱싱하고
 * 내부 첫 TEXT 노드의 characters를 값으로 저장.
 * 텍스트 레이어 이름은 무시 → 자동 동기화 문제 해결.
 */
function buildContentMap(node, result = {}) {
  const isContainer = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'FRAME', 'GROUP'].includes(node.type);

  if (isContainer && node.name) {
    const text = findFirstText(node);
    if (text !== null) {
      result[node.name] = text;
    }
    // fill 색상도 저장 (category-color 등에 사용)
    if (node.fills?.length > 0 && node.fills[0].type === 'SOLID') {
      const { r, g, b } = node.fills[0].color;
      result[`${node.name}/__fill`] = '#' + [r, g, b]
        .map(v => Math.round(v * 255).toString(16).padStart(2, '0'))
        .join('');
    }
  }

  if (node.children) {
    for (const child of node.children) buildContentMap(child, result);
  }
  return result;
}

function findFirstText(node) {
  if (node.type === 'TEXT') return node.characters || '';
  if (node.children) {
    for (const child of node.children) {
      const v = findFirstText(child);
      if (v !== null) return v;
    }
  }
  return null;
}

// ── HTML PATCHING ─────────────────────────────────────────────────────
function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function patchHTML(html, selector, newValue, attr) {
  const cls = selector.trim().split(/\s+/).pop().replace(/^[.#]/, '');

  if (!attr || attr === 'innerHTML') {
    return html.replace(
      new RegExp(`(<[^>]+class="[^"]*\\b${escRe(cls)}\\b[^"]*"[^>]*>)([\\s\\S]*?)(<\\/\\w+>)`, 'g'),
      (_, open, _old, close) => `${open}${newValue}${close}`
    );
  }

  if (attr === 'data-tags') {
    return html.replace(
      new RegExp(`(<div[^>]+class="[^"]*\\bwork-card\\b[^"]*"[^>]*?)data-tags="[^"]*"`, 'g'),
      (m, prefix) => {
        // nth-child 매칭 없이 모든 카드에 적용되므로
        // 개별 카드 처리는 special: 'category' 핸들러에서 함께 처리
        return m; // 직접 패치 안 하고 skip (category 핸들러에서 처리)
      }
    );
  }

  return html;
}

// ── SPECIAL HANDLERS ──────────────────────────────────────────────────
function applyHeroTitle(html, l1, l2, l3) {
  const keyword = l2
    .replace(/^edge of\s*/i, '')
    .replace(/\s*and canvas\.?$/i, '')
    .trim() || 'terminal';

  const newInner = [
    `      ${l1}<br>`,
    `      edge of <em>${keyword}</em><br>`,
    `      ${l3}`,
  ].join('\n');

  return html.replace(
    /(<h1 class="hero-title">)([\s\S]*?)(<\/h1>)/,
    `$1\n${newInner}\n    $3`
  );
}

function applyTag(html, cardNthChild, tagNth, newTagText) {
  // nth-child 기반 정규식으로 특정 카드의 특정 태그만 교체
  // 태그 안: <span class="b-glyph">...</span>텍스트</span>
  // 텍스트 부분만 교체하고 b-glyph는 유지
  let count = 0;
  return html.replace(
    /(<span class="card-tag">)([\s\S]*?)(<\/span>)/g,
    (match, open, inner, close) => {
      count++;
      // cardNthChild, tagNth 로 몇 번째 카드의 몇 번째 태그인지 판별은
      // 정규식만으로 불가 → 순서 카운팅으로 대체
      return match; // 기본: 변경 없음 (아래 별도 처리)
    }
  );
}

const CATEGORY_COLOR = {
  'Design':        'var(--cheong)',
  'Illustration':  'var(--jeok)',
  'Research':      'var(--hwang)',
  'Misc':          'var(--ink)',
};

function applyCategory(html, cardIndex, categoryText) {
  const cssVar = CATEGORY_COLOR[categoryText] || 'var(--ink)';
  const numStr = String(cardIndex).padStart(3, '0');

  // card-num으로 해당 카드 블록 위치를 찾고 card-type 교체
  html = html.replace(
    new RegExp(`(class="card-num">${escRe(numStr)}<\\/div>[\\s\\S]{0,300}?class="card-type">)[^<]*(</div>)`),
    `$1${categoryText}$2`
  );

  // 같은 카드의 botanic-icon 색상 교체
  html = html.replace(
    new RegExp(`(class="card-num">${escRe(numStr)}<\\/div>[\\s\\S]{0,500}?card-botanic-icon" style="color:)var\\(--[^)]+\\)`),
    `$1${cssVar}`
  );

  // 같은 카드의 card-corners 색상 교체
  html = html.replace(
    new RegExp(`(class="card-num">${escRe(numStr)}<\\/div>[\\s\\S]{0,700}?card-corners" style="color:)var\\(--[^)]+\\)`),
    `$1${cssVar}`
  );

  return html;
}

function applyDataTags(html, cardIndex, tagsText) {
  const numStr  = String(cardIndex).padStart(3, '0');
  // card-num으로 카드 위치 찾기 → 그 카드 div의 data-tags 속성 교체
  // card div는 card-num보다 앞에 있으므로 역방향 탐색이 필요 → split 방식 사용
  const marker  = `class="card-num">${numStr}</div>`;
  const idx     = html.indexOf(marker);
  if (idx === -1) return html;

  // marker 앞쪽에서 가장 가까운 work-card div를 찾음
  const before  = html.slice(0, idx);
  const lastDiv = before.lastIndexOf('class="work-card');
  if (lastDiv === -1) return html;

  const chunk   = html.slice(lastDiv, lastDiv + 200);
  const patched = chunk.replace(/data-tags="[^"]*"/, `data-tags="${tagsText}"`);
  return html.slice(0, lastDiv) + patched + html.slice(lastDiv + 200);
}

// ── MAIN ──────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔄  Figma → HTML sync  |  section: ${SECTION}  |  dry-run: ${DRY_RUN}\n`);

  if (FILE_KEY === 'YOUR_FIGMA_FILE_KEY') {
    console.error('❌  FILE_KEY를 설정하세요.');
    console.error('    Figma 파일 URL: https://figma.com/design/XXXXXX/...');
    console.error('    → sync-from-figma.js 상단 FILE_KEY 상수에 XXXXXX 입력\n');
    process.exit(1);
  }

  // ① Figma 파일 읽기
  console.log('📡  Figma 파일 읽는 중...');
  let figmaFile;
  try {
    figmaFile = await fetchFigmaFile(FILE_KEY);
  } catch (e) {
    console.error('❌  Figma 연결 실패\n   ', e.message);
    process.exit(1);
  }

  // ② 컴포넌트 맵 구축
  const contentMap = buildContentMap(figmaFile.document);
  const compCount  = Object.keys(contentMap).filter(k => !k.endsWith('/__fill')).length;
  console.log(`✅  ${compCount}개 컴포넌트 발견\n`);

  // ③ HTML 읽기
  let html      = fs.readFileSync(HTML_PATH, 'utf8');
  let changes   = 0;
  const missing = [];

  // ④ NODE_MAP 순회 → 패치
  for (const [compName, config] of Object.entries(NODE_MAP)) {
    if (SECTION !== 'all' && config.section !== SECTION) continue;

    const value = contentMap[compName];
    if (value === undefined) { missing.push(compName); continue; }

    // hero-title 특수 처리 (3줄 모인 후 한번에)
    if (config.special === 'hero-title') {
      if (compName === 'hero/title-line-3') {
        html = applyHeroTitle(
          html,
          contentMap['hero/title-line-1'] || 'Designing at the',
          contentMap['hero/title-line-2'] || 'edge of terminal',
          contentMap['hero/title-line-3'] || 'and canvas.'
        );
        log('hero/title', '3줄 업데이트');
        changes++;
      }
      continue;
    }

    // category 특수 처리 (텍스트 + 색상 + data-tags 같이)
    if (config.special === 'category') {
      html = applyCategory(html, config.cardIndex, value);
      // data-tags도 같이 처리
      const tagsKey = `works/card-${String(config.cardIndex).padStart(3,'0')}/tags`;
      const tagsVal = contentMap[tagsKey];
      if (tagsVal) html = applyDataTags(html, config.cardIndex, tagsVal);
      log(compName, value);
      changes++;
      continue;
    }

    // tag 특수 처리 (b-glyph 유지하고 텍스트만 교체)
    if (config.special === 'tag') {
      // 카드 인덱스 추출: works/card-001/tag-1 → 1
      const match = compName.match(/card-(\d+)\/tag-(\d+)/);
      if (match) {
        const [, cardN, tagN] = match;
        const numStr = String(parseInt(cardN)).padStart(3, '0');
        const marker = `class="card-num">${numStr}</div>`;
        const cardStart = html.indexOf(marker);
        if (cardStart !== -1) {
          // 이 카드 블록 안에서 tagN번째 .card-tag를 찾아 교체
          const cardEnd = html.indexOf('</div>\n    </div>', cardStart);
          const cardBlock = html.slice(cardStart, cardEnd);
          let tagCount = 0;
          const patchedBlock = cardBlock.replace(
            /(<span class="card-tag">)([\s\S]*?)(<\/span>)/g,
            (m, open, inner, close) => {
              tagCount++;
              if (tagCount === parseInt(tagN)) {
                // b-glyph 유지하고 뒤 텍스트만 교체
                const glyphMatch = inner.match(/(<span class="b-glyph">[\s\S]*?<\/span>)/);
                const glyph = glyphMatch ? glyphMatch[1] : '';
                return `${open}${glyph}${value}${close}`;
              }
              return m;
            }
          );
          html = html.slice(0, cardStart) + patchedBlock + html.slice(cardEnd);
          log(compName, value);
          changes++;
        }
      }
      continue;
    }

    // 일반 텍스트 패치
    if (config.selector) {
      html = patchHTML(html, config.selector, value, config.attr);
      log(compName, value);
      changes++;
    }
  }

  // ⑤ 결과
  console.log('');
  if (missing.length) {
    console.log(`⚠️   Figma에서 못 찾은 컴포넌트 (${missing.length}개):`);
    missing.forEach(n => console.log(`     • ${n}`));
    console.log('    → figma-content-spec.md 컴포넌트 이름 확인\n');
  }

  if (changes === 0) {
    console.log('⚠️   변경사항 없음');
    return;
  }

  if (DRY_RUN) {
    console.log(`✅  [dry-run] ${changes}개 변경 예정 (파일 저장 안 함)`);
  } else {
    fs.writeFileSync(HTML_PATH, html, 'utf8');
    console.log(`✅  ${changes}개 업데이트 완료 → ${path.basename(HTML_PATH)}`);
  }
}

function log(name, value) {
  const v = String(value);
  console.log(`  ✏️   ${name.padEnd(34)} → "${v.length > 46 ? v.slice(0, 46) + '…' : v}"`);
}

main().catch(err => {
  console.error('\n❌  오류:', err.message);
  process.exit(1);
});
