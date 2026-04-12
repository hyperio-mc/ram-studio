'use strict';
// diff-app.js — DIFF: AI Pull Request Intelligence (Dark Theme)
// Inspired by:
//   • Linear / Codex (darkmodedesign.com) — AI agent activity shown inline with code context
//   • Relace (lapa.ninja) — "purpose-built AI for coding agents, ultra-fast code workflows"
//   • Evervault customers (godly.website) — deep security-focused dark UI, monospace data aesthetic

const fs   = require('fs');
const path = require('path');

// ─── Palette ───────────────────────────────────────────────────────────────
const P = {
  bg:        '#0C0D12',
  surface:   '#14151D',
  surface2:  '#1C1D28',
  surface3:  '#22243A',
  border:    '#242638',
  border2:   '#2E2F48',
  text:      '#E2E4F0',
  textDim:   '#8E90A8',
  muted:     '#5C5E7A',
  accent:    '#7C6DFA',  // electric violet
  accentLt:  '#9B8FFB',
  accentBg:  '#1A1833',
  accentBg2: '#252150',
  teal:      '#00D4A8',  // diff additions / success
  tealBg:    '#0A2520',
  tealBg2:   '#0D3028',
  red:       '#FF5F6D',  // deletions / danger
  redBg:     '#2A1420',
  redBg2:    '#3A1828',
  amber:     '#F4A233',  // warnings
  amberBg:   '#221A0A',
  amberBg2:  '#2E2010',
  divider:   '#1A1C2A',
  navBg:     '#0F1018',
  online:    '#3DD68C',
  codeBg:    '#0A0B10',
};

let _id = 0;
const uid = () => `d${++_id}`;

// ─── Primitives ─────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.text,
  textAlign: opts.align || 'left',
  letterSpacing: opts.ls || 0,
  ...(opts.lh ? { lineHeight: opts.lh } : {}),
  fontFamily: opts.mono ? 'JetBrains Mono' : 'Inter',
});

const R = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const Div = (x, y, w, col) => R(x, y, w, 1, col || P.divider);

const SCREEN_W  = 390;
const SCREEN_H  = 844;
const NAV_H     = 78;
const TOP_H     = 54;
const PAD       = 18;
const COL       = SCREEN_W - PAD * 2;
const OFFSET_X  = 0;  // screens stacked horizontally

// ─── Nav ────────────────────────────────────────────────────────────────────
function makeNav(active) {
  const items = ['Feed','Review','Insights','Team','Rules'];
  const icons = ['⊞','◈','∿','◎','⊛'];
  const iw = SCREEN_W / items.length;
  const ch = [
    R(0, 0, SCREEN_W, NAV_H, P.navBg),
    R(0, 0, SCREEN_W, 1, P.border),
  ];
  items.forEach((label, i) => {
    const x = i * iw;
    const isActive = i === active;
    if (isActive) {
      ch.push(R(x + iw/2 - 16, 8, 32, 32, P.accentBg2, { r: 10 }));
    }
    ch.push(T(icons[i], x, 10, iw, 20, {
      size: 16, align: 'center',
      fill: isActive ? P.accentLt : P.muted,
    }));
    ch.push(T(label, x, 34, iw, 14, {
      size: 10, align: 'center', weight: isActive ? 600 : 400,
      fill: isActive ? P.accentLt : P.muted,
    }));
  });
  return F(0, SCREEN_H - NAV_H, SCREEN_W, NAV_H, P.navBg, { ch });
}

// ─── Top Bar ─────────────────────────────────────────────────────────────────
function makeTopBar(title, sub, right) {
  const ch = [
    R(0, 0, SCREEN_W, TOP_H, P.bg),
    R(0, TOP_H - 1, SCREEN_W, 1, P.border),
    T(title, PAD, 14, 200, 18, { size: 16, weight: 700 }),
    ...(sub ? [T(sub, PAD, 34, 200, 13, { size: 11, fill: P.muted })] : []),
  ];
  if (right) {
    right.forEach(el => ch.push(el));
  }
  return F(0, 0, SCREEN_W, TOP_H, P.bg, { ch });
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge(text, x, y, col, bg) {
  const w = text.length * 6.5 + 12;
  return F(x, y, w, 18, bg || P.accentBg, {
    r: 9,
    ch: [T(text, 0, 2, w, 14, { size: 10, weight: 600, fill: col || P.accentLt, align: 'center' })],
  });
}

// ─── Dot ─────────────────────────────────────────────────────────────────────
function Dot(x, y, col) {
  return R(x, y, 7, 7, col, { r: 4 });
}

// ─── Screen 1: Feed ──────────────────────────────────────────────────────────
function makeFeed() {
  const ch = [];
  const SX = 0 * SCREEN_W;

  // Top bar
  ch.push(makeTopBar('DIFF', 'pr intelligence', [
    R(SCREEN_W - 42, 14, 32, 26, P.surface2, { r: 8,
      ch: [T('⊕', 0, 3, 32, 20, { size: 14, fill: P.accent, align: 'center' })] }),
  ]));

  let y = TOP_H + 12;

  // Stats row
  const stats = [
    { n: '14', l: 'Open PRs', c: P.text },
    { n: '3', l: 'Needs review', c: P.amber },
    { n: '2', l: 'Failing checks', c: P.red },
    { n: '91%', l: 'Pass rate', c: P.teal },
  ];
  const sw = (COL - 12) / 4;
  stats.forEach((s, i) => {
    const sx = PAD + i * (sw + 4);
    ch.push(F(sx, y, sw, 52, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T(s.n, 0, 8, sw, 20, { size: 18, weight: 700, fill: s.c, align: 'center' }),
      T(s.l, 0, 30, sw, 14, { size: 9, fill: P.muted, align: 'center', lh: 1.3 }),
    ]}));
  });
  y += 64;

  // AI Agent Activity Banner
  ch.push(F(PAD, y, COL, 40, P.accentBg, { r: 10, stroke: P.accentBg2, sw: 1, ch: [
    R(10, 14, 6, 6, P.accent, { r: 3 }),  // pulse dot
    T('diff-agent is reviewing 3 PRs', 22, 12, 200, 16, { size: 11, weight: 500, fill: P.accentLt }),
    T('active', COL - 60, 13, 46, 14, {
      size: 10, weight: 600, fill: P.teal, align: 'right',
    }),
  ]}));
  y += 52;

  // Section label
  ch.push(T('Open Pull Requests', PAD, y, 160, 14, { size: 11, weight: 600, fill: P.muted, ls: 0.3 }));
  ch.push(T('sorted by AI risk score', SCREEN_W - PAD - 120, y, 120, 14, { size: 10, fill: P.muted, align: 'right' }));
  y += 22;

  // PR cards
  const prs = [
    {
      title: 'feat: add OAuth token refresh',
      branch: 'auth/token-refresh → main',
      author: 'KL',
      score: 92,
      scoreColor: P.teal,
      scoreBg: P.tealBg,
      tags: ['Auth','Security'],
      tagColors: [P.teal, P.amber],
      tagBgs: [P.tealBg, P.amberBg],
      changed: '+182 −44',
      changedColor: P.teal,
      checks: '✓',
      checksColor: P.teal,
      note: 'Token expiry logic looks correct. One concern: missing rate limit on refresh endpoint.',
    },
    {
      title: 'refactor: migrate DB layer to ORM',
      branch: 'db/orm-migration → staging',
      author: 'MR',
      score: 71,
      scoreColor: P.amber,
      scoreBg: P.amberBg,
      tags: ['DB','Breaking'],
      tagColors: [P.textDim, P.red],
      tagBgs: [P.surface3, P.redBg],
      changed: '+841 −620',
      changedColor: P.amber,
      checks: '⚠',
      checksColor: P.amber,
      note: 'Large surface area. 3 N+1 queries detected in UserRepository.',
    },
    {
      title: 'fix: race condition in job queue',
      branch: 'bugfix/queue-race → main',
      author: 'DP',
      score: 88,
      scoreColor: P.teal,
      scoreBg: P.tealBg,
      tags: ['Bugfix','Perf'],
      tagColors: [P.teal, P.accentLt],
      tagBgs: [P.tealBg, P.accentBg],
      changed: '+29 −7',
      changedColor: P.teal,
      checks: '✓',
      checksColor: P.teal,
      note: 'Mutex approach is correct. LGTM.',
    },
  ];

  prs.forEach(pr => {
    const cardH = 104;
    const card = F(PAD, y, COL, cardH, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [] });
    const cc = card.children;

    // Score pill (right side)
    cc.push(F(COL - 44, 12, 36, 22, pr.scoreBg, { r: 11, ch: [
      T(String(pr.score), 0, 4, 36, 14, { size: 11, weight: 700, fill: pr.scoreColor, align: 'center' }),
    ]}));

    // Title + author
    cc.push(F(10, 8, 26, 26, P.accentBg2, { r: 13, ch: [
      T(pr.author, 0, 6, 26, 14, { size: 9, weight: 700, fill: P.accentLt, align: 'center' }),
    ]}));
    cc.push(T(pr.title, 42, 10, COL - 98, 16, { size: 12, weight: 600 }));
    cc.push(T(pr.branch, 42, 28, COL - 98, 13, { size: 10, fill: P.muted }));

    // Tags
    let tx = 10;
    pr.tags.forEach((tag, i) => {
      const tw = tag.length * 6 + 12;
      cc.push(F(tx, 50, tw, 18, pr.tagBgs[i], { r: 9, ch: [
        T(tag, 0, 2, tw, 14, { size: 9, weight: 600, fill: pr.tagColors[i], align: 'center' }),
      ]}));
      tx += tw + 5;
    });

    // Changed
    cc.push(T(pr.changed, tx + 4, 51, 80, 14, { size: 10, fill: pr.changedColor }));

    // AI note
    cc.push(Div(10, 74, COL - 20, P.border));
    cc.push(T('✦  ' + pr.note, 10, 80, COL - 20, 20, {
      size: 10, fill: P.textDim, lh: 1.4,
    }));

    ch.push(card);
    y += cardH + 10;
  });

  ch.push(makeNav(0));

  return {
    id: uid(), type: 'frame',
    x: SX, y: 0,
    width: SCREEN_W, height: SCREEN_H,
    name: 'Feed', fill: P.bg, children: ch,
  };
}

// ─── Screen 2: Review ────────────────────────────────────────────────────────
function makeReview() {
  const ch = [];
  const SX = 1 * SCREEN_W + 40;

  ch.push(makeTopBar('feat: OAuth refresh', 'auth/token-refresh → main', [
    Badge('AI Review', SCREEN_W - 80, 16, P.accentLt, P.accentBg),
  ]));

  let y = TOP_H + 10;

  // File header
  ch.push(F(PAD, y, COL, 32, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
    T('◈  src/auth/refresh.ts', 10, 8, 200, 16, { size: 11, weight: 600, fill: P.textDim }),
    T('+28 −9', COL - 48, 9, 40, 14, { size: 10, fill: P.teal, align: 'right' }),
  ]}));
  y += 40;

  // Diff lines
  const diffLines = [
    { type: 'ctx',  line: '  const token = await getToken(user);', num: '142' },
    { type: 'ctx',  line: '  if (!token) throw new AuthError();',  num: '143' },
    { type: 'del',  line: '- const exp = token.exp;',              num: '144' },
    { type: 'del',  line: '- if (Date.now() > exp) refresh();',    num: '145' },
    { type: 'add',  line: '+ const exp = token.expiresAt * 1000;', num: ''    },
    { type: 'add',  line: '+ if (isExpired(token)) {',             num: ''    },
    { type: 'add',  line: '+   await refreshToken(user, token);',  num: ''    },
    { type: 'add',  line: '+ }',                                   num: ''    },
    { type: 'ctx',  line: '  return token.accessToken;',           num: '146' },
  ];

  const lineH = 20;
  diffLines.forEach(dl => {
    const isAdd = dl.type === 'add';
    const isDel = dl.type === 'del';
    const bg = isAdd ? P.tealBg : isDel ? P.redBg : 'transparent';
    const fg = isAdd ? P.teal : isDel ? P.red : P.textDim;
    ch.push(R(PAD, y, COL, lineH, bg, { r: 0 }));
    if (dl.num) {
      ch.push(T(dl.num, PAD + 2, y + 3, 26, 14, {
        size: 9, fill: P.muted, align: 'right', mono: true,
      }));
    }
    ch.push(T(dl.line, PAD + 32, y + 3, COL - 34, 14, {
      size: 10, fill: fg, mono: true,
    }));
    y += lineH;
  });

  y += 8;

  // AI Suggestion card
  ch.push(F(PAD, y, COL, 90, P.accentBg, { r: 12, stroke: P.accentBg2, sw: 1, ch: [
    T('✦  AI Suggestion', 12, 10, 180, 15, { size: 11, weight: 700, fill: P.accentLt }),
    T('Missing rate limit on refreshToken(). An attacker\ncould spam this endpoint to brute-force tokens.', 12, 28, COL - 24, 32, {
      size: 11, fill: P.text, lh: 1.6,
    }),
    F(12, 66, 120, 18, P.accentBg2, { r: 9, ch: [
      T('View suggested fix →', 0, 2, 120, 14, { size: 10, weight: 600, fill: P.accentLt, align: 'center' }),
    ]}),
    F(140, 66, 60, 18, P.surface, { r: 9, ch: [
      T('Dismiss', 0, 2, 60, 14, { size: 10, fill: P.muted, align: 'center' }),
    ]}),
  ]}));
  y += 102;

  // Warning card
  ch.push(F(PAD, y, COL, 62, P.amberBg, { r: 12, stroke: P.amberBg2, sw: 1, ch: [
    T('⚠  Warning', 12, 10, 120, 14, { size: 11, weight: 700, fill: P.amber }),
    T('token.exp (old field) used in deleted lines was\nnon-standard. The fix aligns with RFC 7519 ✓', 12, 28, COL - 24, 28, {
      size: 11, fill: P.text, lh: 1.5,
    }),
  ]}));
  y += 74;

  // Approve / Request Changes buttons
  ch.push(F(PAD, y, (COL - 10) / 2, 40, P.tealBg, { r: 12, stroke: P.teal, sw: 1, ch: [
    T('✓  Approve', 0, 12, (COL - 10) / 2, 16, { size: 13, weight: 600, fill: P.teal, align: 'center' }),
  ]}));
  ch.push(F(PAD + (COL - 10) / 2 + 10, y, (COL - 10) / 2, 40, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
    T('Request Changes', 0, 12, (COL - 10) / 2, 16, { size: 12, weight: 500, fill: P.textDim, align: 'center' }),
  ]}));

  ch.push(makeNav(1));

  return {
    id: uid(), type: 'frame',
    x: SX, y: 0,
    width: SCREEN_W, height: SCREEN_H,
    name: 'Review', fill: P.bg, children: ch,
  };
}

// ─── Screen 3: Insights ──────────────────────────────────────────────────────
function makeInsights() {
  const ch = [];
  const SX = 2 * (SCREEN_W + 40);

  ch.push(makeTopBar('Insights', 'last 30 days'));

  let y = TOP_H + 12;

  // Score card
  ch.push(F(PAD, y, COL, 68, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    T('Codebase Health', 12, 10, 160, 14, { size: 11, weight: 600, fill: P.muted }),
    T('87', 12, 26, 50, 32, { size: 32, weight: 800, fill: P.teal }),
    T('/100', 52, 40, 40, 16, { size: 14, fill: P.muted }),
    T('▲ +4 vs last month', 100, 32, 130, 14, { size: 11, fill: P.teal }),
    // Mini bar at bottom
    R(12, 56, (COL - 24) * 0.87, 5, P.teal, { r: 3 }),
    R(12 + (COL - 24) * 0.87, 56, (COL - 24) * 0.13, 5, P.border2, { r: 3 }),
  ]}));
  y += 80;

  // Merge quality chart (bar)
  ch.push(T('Merge Quality — Weekly', PAD, y, 200, 14, { size: 12, weight: 600 }));
  y += 22;

  const bars = [
    { l: 'W1', v: 78, c: P.accent },
    { l: 'W2', v: 82, c: P.accent },
    { l: 'W3', v: 74, c: P.accent },
    { l: 'W4', v: 91, c: P.teal },  // current week
  ];
  const bh = 72, bw = 48;
  const bg2 = (COL - bars.length * bw) / (bars.length + 1);
  bars.forEach((b, i) => {
    const bx = PAD + bg2 + i * (bw + bg2);
    const fh = Math.round(bh * b.v / 100);
    const isCurrent = i === bars.length - 1;
    ch.push(R(bx, y, bw, bh, P.surface2, { r: 8 }));
    ch.push(R(bx, y + bh - fh, bw, fh, isCurrent ? P.teal : P.accentBg2, { r: 8 }));
    if (isCurrent) {
      ch.push(R(bx - 1, y + bh - fh - 1, bw + 2, fh + 2, 'transparent', { r: 9, stroke: P.teal, sw: 1 }));
    }
    ch.push(T(String(b.v), bx, y - 18, bw, 14, { size: 12, weight: 700, fill: isCurrent ? P.teal : P.textDim, align: 'center' }));
    ch.push(T(b.l, bx, y + bh + 6, bw, 14, { size: 10, fill: P.muted, align: 'center' }));
  });
  y += bh + 30;

  // Hotspot files
  ch.push(T('Hotspot Files', PAD, y, 160, 14, { size: 12, weight: 600 }));
  ch.push(T('most changed · 30d', SCREEN_W - PAD - 100, y, 100, 14, { size: 10, fill: P.muted, align: 'right' }));
  y += 22;

  const hotspots = [
    { file: 'src/auth/refresh.ts',    churn: 94, w: 0.94 },
    { file: 'src/db/UserRepo.ts',     churn: 78, w: 0.78 },
    { file: 'src/queue/JobQueue.ts',  churn: 65, w: 0.65 },
    { file: 'src/api/middleware.ts',  churn: 42, w: 0.42 },
  ];

  hotspots.forEach(h => {
    ch.push(F(PAD, y, COL, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T(h.file, 12, 6, COL - 70, 15, { size: 11, weight: 500, mono: true }),
      T(String(h.churn) + ' changes', COL - 58, 8, 50, 13, { size: 10, fill: h.churn > 80 ? P.red : P.muted, align: 'right' }),
      R(12, 28, (COL - 24) * h.w, 5, h.churn > 80 ? P.red : P.accent, { r: 3 }),
      R(12 + (COL - 24) * h.w, 28, (COL - 24) * (1 - h.w), 5, P.border2, { r: 3 }),
    ]}));
    y += 54;
  });

  ch.push(makeNav(2));

  return {
    id: uid(), type: 'frame',
    x: SX, y: 0,
    width: SCREEN_W, height: SCREEN_H,
    name: 'Insights', fill: P.bg, children: ch,
  };
}

// ─── Screen 4: Team ──────────────────────────────────────────────────────────
function makeTeam() {
  const ch = [];
  const SX = 3 * (SCREEN_W + 40);

  ch.push(makeTopBar('Team', '4 contributors · active'));

  let y = TOP_H + 12;

  // Team velocity header
  ch.push(F(PAD, y, COL, 60, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    T('Avg Review Time', 12, 10, 140, 14, { size: 11, weight: 500, fill: P.muted }),
    T('4.2h', 12, 26, 80, 24, { size: 22, weight: 700, fill: P.text }),
    T('↓ 1.1h faster than last sprint', 80, 34, 160, 14, { size: 10, fill: P.teal }),
    // divider
    R(COL / 2, 8, 1, 44, P.border),
    T('Merge Rate', COL / 2 + 12, 10, 120, 14, { size: 11, weight: 500, fill: P.muted }),
    T('91%', COL / 2 + 12, 26, 80, 24, { size: 22, weight: 700, fill: P.teal }),
    T('+6% vs last month', COL / 2 + 12, 50, 120, 13, { size: 10, fill: P.teal }),
  ]}));
  y += 72;

  // Contributors
  ch.push(T('Contributors', PAD, y, 160, 14, { size: 12, weight: 600 }));
  y += 22;

  const contributors = [
    { name: 'Kai L.',    initials: 'KL', prs: 12, comments: 34, score: 94, trend: '▲', trendC: P.teal  },
    { name: 'Mo R.',     initials: 'MR', prs:  8, comments: 19, score: 76, trend: '▼', trendC: P.red   },
    { name: 'Dev P.',    initials: 'DP', prs: 11, comments: 28, score: 88, trend: '▲', trendC: P.teal  },
    { name: 'Sam W.',    initials: 'SW', prs:  5, comments: 11, score: 82, trend: '─', trendC: P.muted },
  ];

  contributors.forEach(c => {
    ch.push(F(PAD, y, COL, 56, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      F(10, 10, 36, 36, P.accentBg2, { r: 18, ch: [
        T(c.initials, 0, 10, 36, 16, { size: 11, weight: 700, fill: P.accentLt, align: 'center' }),
      ]}),
      T(c.name, 54, 8, 100, 16, { size: 12, weight: 600 }),
      T(`${c.prs} PRs  ·  ${c.comments} comments`, 54, 28, 140, 14, { size: 10, fill: P.muted }),
      // Score bar
      T(`${c.trend} ${c.score}`, COL - 52, 10, 46, 14, { size: 13, weight: 700, fill: c.trendC, align: 'right' }),
      R(COL - 50, 28, 44, 5, P.border2, { r: 3 }),
      R(COL - 50, 28, Math.round(44 * c.score / 100), 5, c.score > 85 ? P.teal : c.score > 75 ? P.accent : P.amber, { r: 3 }),
    ]}));
    y += 66;
  });

  // AI agent summary
  ch.push(F(PAD, y, COL, 60, P.accentBg, { r: 12, stroke: P.accentBg2, sw: 1, ch: [
    T('✦  diff-agent this sprint', 12, 10, 220, 14, { size: 11, weight: 600, fill: P.accentLt }),
    T('Reviewed 36 PRs  ·  127 suggestions made  ·  89 accepted', 12, 28, COL - 24, 14, { size: 10, fill: P.textDim }),
    T('Acceptance rate: 70%  →  above team average', 12, 42, COL - 24, 14, { size: 10, fill: P.teal }),
  ]}));

  ch.push(makeNav(3));

  return {
    id: uid(), type: 'frame',
    x: SX, y: 0,
    width: SCREEN_W, height: SCREEN_H,
    name: 'Team', fill: P.bg, children: ch,
  };
}

// ─── Screen 5: Rules ─────────────────────────────────────────────────────────
function makeRules() {
  const ch = [];
  const SX = 4 * (SCREEN_W + 40);

  ch.push(makeTopBar('AI Rules', 'configure diff-agent'));

  let y = TOP_H + 12;

  // Agent status
  ch.push(F(PAD, y, COL, 44, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    Dot(12, 18, P.online),
    T('diff-agent v2.4 — running', 26, 14, 200, 16, { size: 12, weight: 600 }),
    T('last sync: 2 min ago', 26, 30, 180, 13, { size: 10, fill: P.muted }),
    T('Configure', COL - 74, 14, 64, 16, { size: 11, weight: 600, fill: P.accent, align: 'right' }),
  ]}));
  y += 56;

  // Rule categories
  ch.push(T('Active Rules', PAD, y, 160, 14, { size: 12, weight: 600 }));
  y += 22;

  const rules = [
    {
      name: 'Security scan',
      desc: 'Flag auth, injection, secrets exposure',
      enabled: true,
      severity: 'Critical',
      sevColor: P.red,
      sevBg: P.redBg,
      coverage: 100,
      coverColor: P.teal,
    },
    {
      name: 'N+1 query detection',
      desc: 'Detect ORM loop anti-patterns',
      enabled: true,
      severity: 'High',
      sevColor: P.amber,
      sevBg: P.amberBg,
      coverage: 78,
      coverColor: P.amber,
    },
    {
      name: 'Test coverage gate',
      desc: 'Require ≥80% coverage on changed files',
      enabled: true,
      severity: 'Medium',
      sevColor: P.accent,
      sevBg: P.accentBg,
      coverage: 85,
      coverColor: P.teal,
    },
    {
      name: 'Type safety enforcement',
      desc: 'Flag any / unknown escapes in TS',
      enabled: false,
      severity: 'Low',
      sevColor: P.muted,
      sevBg: P.surface3,
      coverage: 0,
      coverColor: P.muted,
    },
  ];

  rules.forEach(rule => {
    const cardH = 82;
    ch.push(F(PAD, y, COL, cardH, rule.enabled ? P.surface : P.bg, {
      r: 12,
      stroke: rule.enabled ? P.border : P.border,
      sw: 1,
      ch: [
        // Toggle
        R(COL - 44, 16, 32, 18, rule.enabled ? P.accentBg2 : P.surface3, { r: 9 }),
        R(rule.enabled ? COL - 20 : COL - 42, 18, 14, 14, rule.enabled ? P.accentLt : P.muted, { r: 7 }),
        // Severity badge
        F(10, 14, 60, 18, rule.sevBg, { r: 9, ch: [
          T(rule.severity, 0, 2, 60, 14, { size: 9, weight: 700, fill: rule.sevColor, align: 'center' }),
        ]}),
        T(rule.name, 10, 38, COL - 60, 16, { size: 12, weight: 600, fill: rule.enabled ? P.text : P.muted }),
        T(rule.desc, 10, 56, COL - 60, 14, { size: 10, fill: P.muted }),
        // Coverage bar
        R(10, cardH - 8, (COL - 20) * rule.coverage / 100, 3, rule.coverColor, { r: 2 }),
        R(10 + (COL - 20) * rule.coverage / 100, cardH - 8, (COL - 20) * (1 - rule.coverage / 100), 3, P.border2, { r: 2 }),
      ],
    }));
    y += cardH + 8;
  });

  ch.push(makeNav(4));

  return {
    id: uid(), type: 'frame',
    x: SX, y: 0,
    width: SCREEN_W, height: SCREEN_H,
    name: 'Rules', fill: P.bg, children: ch,
  };
}

// ─── Assemble & Write ────────────────────────────────────────────────────────
const screens = [makeFeed(), makeReview(), makeInsights(), makeTeam(), makeRules()];

const pen = {
  version: '2.8',
  fileName: 'DIFF — AI Pull Request Intelligence',
  screens,
  metadata: {
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    theme: 'dark',
    palette: {
      bg: P.bg, surface: P.surface, text: P.text,
      accent: P.accent, accent2: P.teal, muted: P.muted,
    },
  },
};

const outPath = path.join(__dirname, 'diff.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓  Written ${outPath}  (${Math.round(fs.statSync(outPath).size / 1024)}KB)`);
console.log(`   Screens: ${screens.map(s => s.name).join(', ')}`);
