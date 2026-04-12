// pith-app.js — PITH slow reading intelligence
// "signal, not noise"
// Light theme — Swiss editorial newsprint grid
// Inspired by Giacomo Dal Pra (land-book.com) — Swiss newspaper grid, dense serif on white
// + HireKit (land-book.com) — data clarity, direct framing
// + NN/G "Outcome-Oriented Design" — adaptive UI, signal vs noise concept

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const CANVAS_W = SCREENS * W + (SCREENS + 1) * GAP;

const BG      = '#F8F5F0';
const SURFACE = '#FFFFFF';
const CARD    = '#F3F0EB';
const RED     = '#C8331A';
const INK     = '#0E0E0E';
const NAVY    = '#1A2E4A';
const RULE    = 'rgba(14,14,14,0.12)';
const MUTED   = 'rgba(14,14,14,0.45)';
const BORDER  = 'rgba(14,14,14,0.10)';
const SAGE    = '#4A7860';

let _id = 1;
const id = () => `node_${_id++}`;

function rect(name, x, y, w, h, fill, opts = {}) {
  return { type: 'RECTANGLE', id: id(), name, x, y, width: w, height: h,
    fill, cornerRadius: opts.r ?? 0, strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 0 };
}

function text(name, x, y, w, content, size, color, opts = {}) {
  return { type: 'TEXT', id: id(), name, x, y, width: w, content, fontSize: size, color,
    fontFamily: opts.font ?? 'IBM Plex Sans', fontWeight: opts.weight ?? 400,
    fontStyle: opts.style ?? 'normal', textAlign: opts.align ?? 'left',
    lineHeight: opts.lh ?? 1.5, letterSpacing: opts.ls ?? 0 };
}

function serif(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color,
    { font: 'Playfair Display', weight: opts.weight ?? 700, style: opts.style ?? 'normal', lh: opts.lh ?? 1.15, ...opts });
}

function mono(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color,
    { font: 'IBM Plex Mono', weight: 400, ls: 0.04, lh: 1.4, ...opts });
}

function statusBar(ox) {
  return [
    rect('sb', ox, 0, W, 44, 'transparent'),
    text('time', ox + 20, 14, 50, '9:41', 12, INK, { font: 'IBM Plex Mono' }),
    text('icons', ox + W - 60, 14, 56, '●●●', 12, INK, { align: 'right', font: 'IBM Plex Mono' }),
  ];
}

function navBar(ox, items) {
  const y = H - 64;
  const nodes = [
    rect('nav-bg', ox, y, W, 64, SURFACE),
    rect('nav-rule', ox, y, W, 1, RULE),
  ];
  items.forEach(({ label: lbl, active }, i) => {
    const x = ox + 12 + i * 70;
    nodes.push(
      rect(`nd-${i}`, x + 27, y + 8, 4, 4, active ? RED : 'transparent', { r: 2 }),
      text(`nl-${i}`, x, y + 18, 68, lbl, 9, active ? INK : MUTED,
        { font: 'IBM Plex Mono', weight: active ? 500 : 400, ls: 0.06, align: 'center' }),
    );
  });
  return nodes;
}

function signalDots(ox, x, y, score) {
  return Array.from({length: 5}, (_, i) =>
    rect(`sig-${ox}-${x}-${i}`, ox + x + i * 9, y, 6, 6, i < score ? RED : RULE, { r: 1 })
  );
}

function thickRule(ox, x, y, w) {
  return rect(`tr-${ox}-${y}`, ox + x, y, w, 3, INK);
}

function thinRule(ox, x, y, w) {
  return rect(`lr-${ox}-${y}`, ox + x, y, w, 1, RULE);
}

function screenX(i) { return GAP + i * (W + GAP); }

// SCREEN 1 — Today's digest
function s1(ox) {
  return [
    rect('bg1', ox, 0, W, H, BG),
    ...statusBar(ox),
    thickRule(ox, 24, 48, 327),
    serif('masthead', ox + 24, 56, 200, 'PITH', 32, INK, { lh: 1 }),
    text('mast-sub', ox + 24, 92, 200, 'Signal, not noise.', 11, MUTED,
      { font: 'IBM Plex Sans', style: 'italic' }),
    mono('mast-date', ox + W - 132, 64, 108, 'FRI · 28 MAR 2026', 9, MUTED, { align: 'right', ls: 0.06 }),
    thinRule(ox, 24, 108, 327),
    mono('digest-lbl', ox + 24, 116, 260, 'YOUR DIGEST · 5 SIGNALS TODAY · 2 UNREAD', 9, RED, { ls: 0.1 }),
    thinRule(ox, 24, 130, 327),

    // Lead story
    mono('s1-cat', ox + 24, 138, 160, 'AI + SOCIETY', 9, RED, { ls: 0.12 }),
    mono('s1-src', ox + W - 90, 138, 66, 'FT · 8 MIN', 9, MUTED, { align: 'right', ls: 0.06 }),
    serif('s1-hl', ox + 24, 154, 327, 'The Quiet Redesign of Everything', 22, INK, { weight: 700, lh: 1.1 }),
    text('s1-lead', ox + 24, 208, 327,
      'How AI systems are rebuilding interfaces around outcomes rather than interactions — and why designers are only just noticing.',
      12, MUTED, { lh: 1.65 }),
    ...signalDots(ox, 24, 276, 5),
    rect('s1-badge', ox + W - 72, 272, 48, 18, RED + '18', { r: 3 }),
    mono('s1-badge-t', ox + W - 68, 276, 42, 'UNREAD', 8, RED, { weight: 500, ls: 0.06 }),
    thinRule(ox, 24, 296, 327),

    // Story 2
    mono('s2-cat', ox + 24, 304, 160, 'DESIGN', 9, RED, { ls: 0.12 }),
    mono('s2-src', ox + W - 90, 304, 66, 'WIRED · 5 MIN', 9, MUTED, { align: 'right', ls: 0.06 }),
    serif('s2-hl', ox + 24, 320, 327, 'Swiss Typography Is Having a Moment', 16, INK, { weight: 700, lh: 1.2 }),
    ...signalDots(ox, 24, 360, 4),
    mono('s2-depth', ox + W - 62, 357, 48, 'SKIMMED', 9, RED, { weight: 500, ls: 0.06 }),
    thinRule(ox, 24, 376, 327),

    // Two-column stories
    mono('s3-cat', ox + 24, 384, 140, 'SCIENCE', 9, RED, { ls: 0.12 }),
    serif('s3-hl', ox + 24, 400, 140, 'Sleep Architecture in the AI Era', 13, INK, { weight: 700, lh: 1.2 }),
    ...signalDots(ox, 24, 444, 4),

    rect('col-rule', ox + 183, 384, 1, 66, RULE),

    mono('s4-cat', ox + 195, 384, 140, 'ECONOMICS', 9, RED, { ls: 0.12 }),
    serif('s4-hl', ox + 195, 400, 140, 'The Independent Worker Index, 2026', 13, INK, { weight: 700, lh: 1.2 }),
    ...signalDots(ox, 195, 444, 3),
    thinRule(ox, 24, 458, 327),

    // Story 5 – tertiary
    mono('s5-cat', ox + 24, 466, 200, 'CULTURE', 9, RED, { ls: 0.12 }),
    serif('s5-hl', ox + 24, 482, 280, 'What Reading Slowly Does to Your Thinking', 14, INK, { weight: 700, lh: 1.2 }),
    mono('s5-src', ox + 24, 516, 260, 'Paris Review · 12 min · ● ● ● ● ●', 10, MUTED),
    thinRule(ox, 24, 534, 327),

    thickRule(ox, 24, 540, 327),
    mono('footer', ox + 24, 548, 327, '5 signals curated · avg signal 4.2/5 · your read time today: 12 min', 9, MUTED, { ls: 0.02 }),

    ...navBar(ox, [
      { label: 'TODAY',   active: true  },
      { label: 'READ',    active: false },
      { label: 'LIBRARY', active: false },
      { label: 'TOPICS',  active: false },
      { label: 'YOU',     active: false },
    ]),
  ];
}

// SCREEN 2 — Reading view
function s2(ox) {
  return [
    rect('bg2', ox, 0, W, H, SURFACE),
    ...statusBar(ox),

    text('back', ox + 24, 52, 60, '← Back', 12, MUTED, { font: 'IBM Plex Mono', ls: 0.02 }),
    rect('prog-track', ox + 24, 66, 327, 3, RULE, { r: 1 }),
    rect('prog-fill', ox + 24, 66, 196, 3, RED, { r: 1 }),
    mono('prog-pct', ox + W - 48, 60, 44, '60%', 9, RED, { align: 'right', weight: 500 }),

    thickRule(ox, 24, 80, 327),
    mono('art-cat', ox + 24, 90, 200, 'AI + SOCIETY', 9, RED, { ls: 0.12 }),
    mono('art-src', ox + W - 90, 90, 66, 'Financial Times', 9, MUTED, { align: 'right' }),
    serif('art-title', ox + 24, 106, 327, 'The Quiet Redesign of Everything', 24, INK, { weight: 700, lh: 1.1 }),
    text('art-byline', ox + 24, 172, 327, 'By Priya Nair  ·  28 March 2026  ·  8 min read', 11, MUTED,
      { font: 'IBM Plex Sans', style: 'italic' }),
    thinRule(ox, 24, 194, 327),

    // Pith summary block
    rect('pith-sum', ox + 24, 202, 327, 88, RED + '0D', { r: 4, stroke: RED + '30', sw: 1 }),
    mono('pith-sum-lbl', ox + 36, 212, 200, 'PITH SUMMARY · 3 KEY SIGNALS', 9, RED, { ls: 0.1, weight: 500 }),
    thinRule(ox, 36, 224, 303),
    text('ps1', ox + 36, 230, 295, '→ Outcome UI removes navigation in favour of direct goal completion', 11, INK, { lh: 1.6 }),
    text('ps2', ox + 36, 250, 295, '→ Designers now define frameworks, not screens', 11, INK, { lh: 1.6 }),
    text('ps3', ox + 36, 270, 295, '→ GenUI adoption fastest in health and finance apps', 11, INK, { lh: 1.6 }),

    text('body-1', ox + 24, 300, 327,
      'The first sign was subtle. In late 2025, several popular fintech apps quietly removed their navigation bars. Not as a design statement — because with AI routing context, users were arriving at the right place before they even thought to tap.',
      13, INK, { lh: 1.75 }),

    rect('hl-bg', ox + 24, 394, 327, 54, 'rgba(200,51,26,0.07)', { r: 3 }),
    rect('hl-bar', ox + 24, 394, 3, 54, RED, { r: 1 }),
    text('hl-text', ox + 36, 400, 302,
      '"Interfaces are increasingly answering the question you were about to ask, rather than presenting options."',
      12, INK, { lh: 1.65, style: 'italic' }),

    text('body-2', ox + 24, 458, 327,
      'Researchers at NN/G found GenUI achieves 40% faster task completion versus conventional navigation — but at the cost of user understanding of the underlying system.',
      13, INK, { lh: 1.75 }),

    thinRule(ox, 24, 548, 327),
    text('ann-lbl', ox + 24, 556, 120, 'Your annotations', 11, MUTED, { font: 'IBM Plex Sans', style: 'italic' }),
    mono('ann-ct', ox + 24, 572, 100, '2 highlights', 9, RED, { weight: 500, ls: 0.06 }),

    ...navBar(ox, [
      { label: 'TODAY',   active: false },
      { label: 'READ',    active: true  },
      { label: 'LIBRARY', active: false },
      { label: 'TOPICS',  active: false },
      { label: 'YOU',     active: false },
    ]),
  ];
}

// SCREEN 3 — Library
function s3(ox) {
  function libCard(y, title, source, topic, time, score, depth) {
    const dcolor = depth === 'read' ? SAGE : depth === 'skimmed' ? RED : MUTED;
    const dbg    = depth === 'read' ? SAGE + '20' : depth === 'skimmed' ? RED + '14' : CARD;
    return [
      mono(`lc-cat-${y}`, ox + 24, y, 200, topic.toUpperCase(), 9, RED, { ls: 0.12 }),
      mono(`lc-src-${y}`, ox + W - 90, y, 66, `${source} · ${time}`, 9, MUTED, { align: 'right' }),
      serif(`lc-hl-${y}`, ox + 24, y + 16, 280, title, 14, INK, { weight: 700, lh: 1.2 }),
      ...signalDots(ox, 24, y + 50, score),
      rect(`lc-d-bg-${y}`, ox + W - 72, y + 46, 48, 18, dbg, { r: 3 }),
      mono(`lc-d-${y}`, ox + W - 68, y + 50, 42, depth ? depth.toUpperCase() : 'NEW', 8, dcolor, { ls: 0.06, weight: 500 }),
      thinRule(ox, 24, y + 70, 327),
    ];
  }

  return [
    rect('bg3', ox, 0, W, H, BG),
    ...statusBar(ox),
    thickRule(ox, 24, 48, 327),
    serif('lib-title', ox + 24, 56, 200, 'Library', 26, INK),
    mono('lib-count', ox + 24, 86, 200, '47 PIECES · MARCH 2026', 9, MUTED, { ls: 0.1 }),
    thinRule(ox, 24, 100, 327),

    // Filter chips
    ...['ALL', 'UNREAD', 'HIGHLIGHTS', 'DONE'].reduce((acc, lbl, i) => {
      const fx = ox + 24 + i * 84;
      const active = i === 0;
      acc.push(
        rect(`fc-${lbl}`, fx, 108, 80, 22, active ? INK : 'transparent', { r: 2, stroke: active ? 'transparent' : BORDER, sw: 1 }),
        mono(`ft-${lbl}`, fx, 114, 80, lbl, 9, active ? SURFACE : MUTED, { align: 'center', ls: 0.08, weight: active ? 500 : 400 }),
      );
      return acc;
    }, []),
    thinRule(ox, 24, 136, 327),

    ...libCard(144, 'The Quiet Redesign of Everything', 'FT', 'AI + SOCIETY', '8 min', 5, 'skimmed'),
    ...libCard(224, 'Swiss Typography Is Having a Moment', 'WIRED', 'DESIGN', '5 min', 4, 'read'),
    ...libCard(304, 'Sleep Architecture in the AI Era', 'Nature', 'SCIENCE', '14 min', 4, 'read'),
    ...libCard(384, 'What Reading Slowly Does to Your Thinking', 'Paris Review', 'CULTURE', '12 min', 5, 'skimmed'),
    ...libCard(464, 'The Independent Worker Index, 2026', 'Economist', 'ECONOMICS', '7 min', 3, ''),

    ...navBar(ox, [
      { label: 'TODAY',   active: false },
      { label: 'READ',    active: false },
      { label: 'LIBRARY', active: true  },
      { label: 'TOPICS',  active: false },
      { label: 'YOU',     active: false },
    ]),
  ];
}

// SCREEN 4 — Topics
function s4(ox) {
  function topicBlock(x, y, w, h, name, count, score, dark) {
    return [
      rect(`tb-${name}`, ox + x, y, w, h, dark ? INK : CARD, { r: 4 }),
      mono(`tb-n-${name}`, ox + x + 10, y + 10, w - 20, name.toUpperCase(), 9, dark ? SURFACE : INK, { ls: 0.1, weight: 500 }),
      mono(`tb-c-${name}`, ox + x + 10, y + h - 20, w - 20, `${count} pieces`, 8, dark ? 'rgba(255,255,255,0.5)' : MUTED),
      ...Array.from({length: Math.min(score, 5)}, (_, i) =>
        rect(`td-${name}-${i}`, ox + x + 10 + i * 9, y + h - 10, 6, 4, dark ? 'rgba(255,255,255,0.3)' : RULE, { r: 1 })
      ),
    ];
  }

  return [
    rect('bg4', ox, 0, W, H, BG),
    ...statusBar(ox),
    thickRule(ox, 24, 48, 327),
    serif('top-title', ox + 24, 56, 280, 'Your topics', 26, INK),
    mono('top-sub', ox + 24, 86, 260, '6 INTERESTS · 47 PIECES THIS MONTH', 9, MUTED, { ls: 0.08 }),
    thinRule(ox, 24, 100, 327),
    mono('sig-map', ox + 24, 108, 200, 'SIGNAL MAP', 9, RED, { ls: 0.12 }),

    ...topicBlock(24,  120, 200, 96, 'AI + SOCIETY', 18, 5, true),
    ...topicBlock(232, 120, 119, 96, 'DESIGN',       12, 4, false),
    ...topicBlock(24,  224, 119, 76, 'SCIENCE',       8, 4, false),
    ...topicBlock(151, 224, 200, 76, 'ECONOMICS',     5, 3, false),
    ...topicBlock(24,  308, 327, 68, 'CULTURE',       4, 4, false),

    thinRule(ox, 24, 384, 327),
    mono('trend-lbl', ox + 24, 392, 260, 'TRENDING IN YOUR INTERESTS', 9, RED, { ls: 0.12 }),

    serif('tr1', ox + 24, 408, 327, 'GenUI Systems Replace 60% of Traditional Navigation', 14, INK, { weight: 700, lh: 1.2 }),
    mono('tr1-m', ox + 24, 442, 260, 'VERGE · 4 min  ●●●●●', 9, MUTED),
    thinRule(ox, 24, 458, 327),

    serif('tr2', ox + 24, 466, 327, 'The Typography Renaissance in Digital Product', 14, INK, { weight: 700, lh: 1.2 }),
    mono('tr2-m', ox + 24, 500, 260, 'DESIGN WEEK · 6 min  ●●●●○', 9, MUTED),
    thinRule(ox, 24, 516, 327),

    serif('tr3', ox + 24, 524, 327, 'Why Independent Workers Earn More in 2026', 14, INK, { weight: 700, lh: 1.2 }),
    mono('tr3-m', ox + 24, 558, 260, 'ECONOMIST · 7 min  ●●●○○', 9, MUTED),

    ...navBar(ox, [
      { label: 'TODAY',   active: false },
      { label: 'READ',    active: false },
      { label: 'LIBRARY', active: false },
      { label: 'TOPICS',  active: true  },
      { label: 'YOU',     active: false },
    ]),
  ];
}

// SCREEN 5 — You
function s5(ox) {
  function miniBar(x, y, day, pct, active) {
    const mh = 44, bh = Math.round(mh * pct);
    return [
      rect(`mb-t-${day}`, ox + x, y, 22, mh, CARD, { r: 2 }),
      rect(`mb-f-${day}`, ox + x, y + mh - bh, 22, bh, active ? RED : RULE, { r: 2 }),
      mono(`mb-l-${day}`, ox + x, y + mh + 5, 22, day, 8, MUTED, { align: 'center' }),
    ];
  }

  return [
    rect('bg5', ox, 0, W, H, BG),
    ...statusBar(ox),
    thickRule(ox, 24, 48, 327),
    serif('you-title', ox + 24, 56, 280, 'Your reading', 26, INK),
    mono('you-date', ox + 24, 86, 280, 'MARCH 2026 · WEEK 5 OF PITH', 9, MUTED, { ls: 0.08 }),
    thinRule(ox, 24, 100, 327),

    mono('month-lbl', ox + 24, 108, 200, 'THIS MONTH', 9, RED, { ls: 0.12 }),
    rect('st1', ox + 24,  122, 98, 58, SURFACE, { r: 4, stroke: BORDER, sw: 1 }),
    serif('st1v', ox + 24, 130, 98, '47', 28, INK, { weight: 700, align: 'center' }),
    mono('st1l', ox + 24, 162, 98, 'PIECES', 8, MUTED, { align: 'center', ls: 0.06 }),
    rect('st2', ox + 130, 122, 98, 58, SURFACE, { r: 4, stroke: BORDER, sw: 1 }),
    serif('st2v', ox + 130, 130, 98, '22', 28, INK, { weight: 700, align: 'center' }),
    mono('st2l', ox + 130, 162, 98, 'FULLY READ', 8, MUTED, { align: 'center', ls: 0.06 }),
    rect('st3', ox + 236, 122, 115, 58, SURFACE, { r: 4, stroke: BORDER, sw: 1 }),
    serif('st3v', ox + 236, 130, 115, '4.2h', 28, INK, { weight: 700, align: 'center' }),
    mono('st3l', ox + 236, 162, 115, 'TIME READ', 8, MUTED, { align: 'center', ls: 0.06 }),

    thinRule(ox, 24, 188, 327),
    mono('days-lbl', ox + 24, 196, 200, 'READING DAYS · MARCH', 9, RED, { ls: 0.12 }),
    ...miniBar(24,  212, 'M', 0.65, false),
    ...miniBar(54,  212, 'T', 0.90, false),
    ...miniBar(84,  212, 'W', 0.45, false),
    ...miniBar(114, 212, 'T', 0.80, false),
    ...miniBar(144, 212, 'F', 1.00, true),
    ...miniBar(174, 212, 'S', 0.30, false),
    ...miniBar(204, 212, 'S', 0.55, false),
    mono('days-avg', ox + 250, 232, 100, 'avg 7.2 min/day', 9, MUTED),

    thinRule(ox, 24, 272, 327),
    mono('bal-lbl', ox + 24, 280, 200, 'TOPIC BALANCE', 9, RED, { ls: 0.12 }),
    ...[
      ['AI + SOCIETY', 0.38, RED],
      ['DESIGN',       0.26, NAVY],
      ['SCIENCE',      0.17, SAGE],
      ['CULTURE',      0.11, '#8B4A2A'],
      ['ECONOMICS',    0.08, MUTED],
    ].flatMap(([lbl, pct, color], i) => {
      const y = 296 + i * 26;
      return [
        mono(`bl-${lbl}`, ox + 24, y, 100, lbl, 9, INK, { ls: 0.02 }),
        rect(`bt-${lbl}`, ox + 130, y + 2, 160, 8, CARD, { r: 2 }),
        rect(`bf-${lbl}`, ox + 130, y + 2, Math.round(160 * pct), 8, color, { r: 2 }),
        mono(`bp-${lbl}`, ox + 298, y, 30, `${Math.round(pct * 100)}%`, 9, MUTED, { align: 'right' }),
      ];
    }),

    thinRule(ox, 24, 430, 327),
    mono('streak-lbl', ox + 24, 438, 260, 'READING STREAK · 14 DAYS STRAIGHT', 9, RED, { ls: 0.1, weight: 500 }),
    text('streak-d', ox + 24, 454, 327,
      'Your longest streak. Every day since March 14.', 12, MUTED, { lh: 1.65, style: 'italic' }),

    thinRule(ox, 24, 488, 327),
    mono('score-lbl', ox + 24, 496, 200, 'YOUR PITH SCORE', 9, RED, { ls: 0.12 }),
    serif('score-val', ox + 24, 510, 120, '84', 44, INK, { weight: 700 }),
    text('score-desc', ox + 86, 524, 240,
      'Deep reader.\nHigh signal preference.\nBroad across 5 topics.',
      11, MUTED, { lh: 1.65 }),

    ...navBar(ox, [
      { label: 'TODAY',   active: false },
      { label: 'READ',    active: false },
      { label: 'LIBRARY', active: false },
      { label: 'TOPICS',  active: false },
      { label: 'YOU',     active: true  },
    ]),
  ];
}

const children = [
  ...s1(screenX(0)),
  ...s2(screenX(1)),
  ...s3(screenX(2)),
  ...s4(screenX(3)),
  ...s5(screenX(4)),
];

const pen = {
  version: '2.8',
  name: 'PITH — signal, not noise',
  width: CANVAS_W,
  height: H,
  fill: '#EDE9E4',
  children,
};

fs.writeFileSync('pith.pen', JSON.stringify(pen, null, 2));
console.log(`✅ pith.pen — ${children.length} nodes, ${SCREENS} screens, ${CANVAS_W}×${H}`);
