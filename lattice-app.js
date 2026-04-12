'use strict';
// lattice-app.js
// LATTICE — AI Developer Experience Platform
//
// Challenge: Design a dark DevEx analytics platform for engineering teams,
// inspired by:
// 1. Evervault Customers page (godly.website) — ultra-deep navy #010314 bg,
//    enterprise dark aesthetic, editorial hero headings on near-void darkness
// 2. LangChain landing (land-book.com) — AI developer tool SaaS trending March 2026,
//    terminal-flavored interfaces, strong data hierarchy
// 3. Linear (darkmodedesign.com) — hyper-refined dark UI, subtle glow borders,
//    impeccable information density without clutter
// 4. Good Fella portfolio (Awwwards) — brutalist motion, "Websites That Move"
//    oversized kinetic type statements on dark backgrounds
//
// Palette: void navy #010610 · electric blue #4F8EFF · teal #00C896 · amber #FFB340
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#010610',   // void navy — Evervault darkness pushed further
  surface:  '#060D1F',   // elevated surface
  surface2: '#0B1530',   // card surface
  surface3: '#101D3F',   // lighter card
  border:   '#1A2D5A',   // subtle border
  muted:    '#3A5490',   // muted blue
  dim:      '#243660',   // dim text/lines
  fg:       '#DCE8FF',   // cool blue-white
  fg2:      '#8AAAD8',   // secondary text
  accent:   '#4F8EFF',   // electric blue (primary)
  teal:     '#00C896',   // teal/emerald (positive / good metrics)
  amber:    '#FFB340',   // warm amber (warnings / highlights)
  red:      '#FF4D6A',   // alert red
  glow:     '#4F8EFF',   // glow color
};

let _id = 0;
const uid = () => `lt${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Glow layers ───────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.5, cy - r*2.5, r*5, r*5, color + '05'),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color + '0C'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '18'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '28'),
];

// ── Mini sparkline bars ───────────────────────────────────────────────────────
const Sparkline = (x, y, w, h, data, color) => {
  const max = Math.max(...data);
  const bw = Math.floor(w / data.length) - 1;
  return data.map((v, i) => {
    const bh = Math.round((v / max) * h);
    return F(x + i * (bw + 1), y + h - bh, bw, bh, color, { r: 1 });
  });
};

// ── Score ring (SVG-ish via frame ellipses) ───────────────────────────────────
const ScoreArc = (cx, cy, score, color) => [
  E(cx - 44, cy - 44, 88, 88, P.surface2, { stroke: P.border, sw: 2 }),
  E(cx - 36, cy - 36, 72, 72, P.surface3, { stroke: color + '30', sw: 2 }),
  ...Glow(cx, cy, 20, color),
  T(String(score), cx - 24, cy - 20, 48, 40, { size: 32, weight: 900, fill: color, align: 'center' }),
];

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 7, 7, color);

// ── Metric chip ──────────────────────────────────────────────────────────────
const MetricChip = (x, y, w, label, value, sub, color) =>
  F(x, y, w, 76, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
    T(label, 12, 10, w - 24, 11, { size: 9, fill: P.fg2, ls: 1.2 }),
    T(value, 12, 26, w - 24, 28, { size: 22, weight: 800, fill: color }),
    T(sub,   12, 56, w - 24, 11, { size: 9, fill: color, opacity: 0.65 }),
  ]});

// ── Status bar (horizontal) ───────────────────────────────────────────────────
const StatusBar = (x, y, w, pct, color) => [
  F(x, y, w, 6, P.surface3, { r: 3 }),
  F(x, y, Math.round(w * pct), 6, color, { r: 3, opacity: 0.9 }),
];

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => F(0, 764, 390, 80, P.surface, { ch: [
  Line(0, 0, 390, P.border),
  ...[
    ['◈', 'Home',    0],
    ['◎', 'PRs',     1],
    ['⊛', 'Alerts',  2],
    ['◉', 'Code',    3],
    ['◷', 'Team',    4],
  ].map(([ic, lb, j]) => {
    const nx = 3 + j * 77;
    const isActive = j === active;
    return [
      isActive ? F(nx + 14, 6, 48, 50, P.accent + '14', { r: 24 }) : null,
      T(ic, nx + 18, 14, 42, 22, { size: 17, fill: isActive ? P.accent : P.muted }),
      T(lb, nx + 2, 40, 74, 13, { size: 9, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400, ls: 0.5 }),
    ].filter(Boolean);
  }).flat(),
]});

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar2 = (text) => [
  T('9:41', 20, 16, 60, 15, { size: 12, weight: 600, fill: P.fg }),
  T(text || '●●●●', 310, 16, 60, 15, { size: 9, fill: P.muted }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — DASHBOARD (DORA Metrics + Team Velocity)
// ══════════════════════════════════════════════════════════════════════════════
function screenDashboard(ox) {
  const sparkData1 = [60, 72, 55, 80, 91, 78, 95, 88, 100, 82, 96, 110];
  const sparkData2 = [3.2, 2.8, 3.5, 2.1, 1.9, 2.6, 1.4, 2.2, 1.7, 1.5, 1.8, 1.2];
  const sparkData3 = [88, 91, 85, 93, 90, 95, 88, 97, 92, 96, 91, 98];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // background glow
    ...Glow(195, 160, 120, P.accent),
    ...Glow(320, 580, 70, P.teal),

    // status bar
    ...StatusBar2(''),

    // header
    T('LATTICE', 20, 46, 200, 28, { size: 22, weight: 900, fill: P.fg, ls: 3 }),
    T('Mar 20 · Week 12', 20, 76, 200, 14, { size: 11, fill: P.fg2 }),

    // notif dot on top right
    F(338, 48, 32, 32, P.surface2, { r: 16, stroke: P.border, ch: [
      T('⊕', 8, 7, 16, 18, { size: 15, fill: P.fg2 }),
    ]}),
    E(363, 48, 8, 8, P.red),

    // DORA score card
    F(20, 102, 350, 100, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('DORA SCORE', 14, 12, 200, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
      T('ELITE', 14, 28, 100, 24, { size: 20, weight: 900, fill: P.teal }),
      T('Your team is in the top 12% of engineering orgs.', 14, 56, 280, 30, { size: 11, fill: P.fg2, lh: 1.5 }),
      // elite badge
      F(284, 20, 52, 22, P.teal + '18', { r: 11, stroke: P.teal + '44', ch: [
        T('↑ Elite', 8, 4, 38, 14, { size: 10, fill: P.teal, weight: 700 }),
      ]}),
      // mini progress ring placeholder
      ...ScoreArc(322, 60, 94, P.teal),
    ]}),

    // 4-metric bento row
    T('KEY METRICS', 20, 214, 200, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    MetricChip(20,  230, 167, 'DEPLOY FREQ',     '4.2/day',  '↑ 18% this week',   P.accent),
    MetricChip(203, 230, 167, 'LEAD TIME',        '1.4 hrs',  '↓ 28 min faster',   P.teal),
    MetricChip(20,  316, 167, 'CHANGE FAIL RATE', '1.8%',     '↓ elite threshold', P.amber),
    MetricChip(203, 316, 167, 'MTTR',             '12 min',   '↓ 6 min faster',    P.teal),

    // velocity sparklines
    T('DEPLOY VELOCITY', 20, 404, 200, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    F(20, 420, 350, 80, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('Deploys / day', 12, 12, 180, 12, { size: 10, fill: P.fg2 }),
      T('12 wk avg', 240, 12, 100, 12, { size: 10, fill: P.muted, align: 'right' }),
      ...Sparkline(12, 32, 326, 36, sparkData1, P.accent + 'CC'),
    ]}),

    T('LEAD TIME TREND (HRS)', 20, 512, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    F(20, 528, 350, 80, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('PR open → deploy', 12, 12, 200, 12, { size: 10, fill: P.fg2 }),
      T('Improving ↓', 240, 12, 100, 12, { size: 10, fill: P.teal, align: 'right' }),
      ...Sparkline(12, 32, 326, 36, sparkData2.map(v => Math.round(v * 20)), P.teal + 'CC'),
    ]}),

    // active PRs strip
    T('ACTIVE PULL REQUESTS', 20, 620, 300, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    T('See all →', 288, 620, 62, 11, { size: 9, fill: P.accent }),
    ...[
      ['feat: AI review assistant v2',    'Jordan K.', P.amber,  '14h'],
      ['fix: rate limiter edge case',     'Sam T.',    P.teal,   '2h' ],
      ['refactor: auth token pipeline',   'Alex M.',   P.accent, '6h' ],
    ].map(([title, author, color, age], i) =>
      F(20, 638 + i * 40, 350, 33, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
        Dot(12, 13, color),
        T(title, 26, 6, 238, 14, { size: 11, fill: P.fg, weight: 500 }),
        T(`${author} · ${age} ago`, 26, 20, 238, 11, { size: 9, fill: P.fg2 }),
        F(308, 7, 34, 20, color + '18', { r: 10, ch: [
          T('→', 10, 3, 14, 14, { size: 11, fill: color }),
        ]}),
      ]})
    ),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — PR ANALYTICS (Cycle Time + Review Queue)
// ══════════════════════════════════════════════════════════════════════════════
function screenPRs(ox) {
  const cycleData = [4.2, 3.1, 5.8, 2.9, 3.5, 1.8, 4.1, 2.3, 3.2, 1.9, 2.8, 1.4];
  const maxCycle  = Math.max(...cycleData);

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(80, 300, 100, P.amber),
    ...StatusBar2(''),

    T('PULL REQUESTS', 20, 46, 300, 28, { size: 20, weight: 900, fill: P.fg, ls: 2 }),
    T('12 open · 8 reviewed today', 20, 76, 260, 14, { size: 11, fill: P.fg2 }),

    // filter chips
    ...[['All', true], ['My PRs', false], ['Review', false], ['Merged', false]].map(([label, active], i) =>
      F(20 + i * 82, 100, 76, 28, active ? P.accent + '22' : P.surface, {
        r: 14,
        stroke: active ? P.accent + '66' : P.border,
        ch: [T(label, 0, 6, 76, 16, { size: 10, fill: active ? P.accent : P.fg2, align: 'center', weight: active ? 700 : 400 })],
      })
    ),

    // cycle time chart
    T('CYCLE TIME — 12 WEEKS', 20, 142, 260, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    T('avg 2.8 hrs', 290, 142, 80, 11, { size: 9, fill: P.accent }),
    F(20, 158, 350, 100, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      // bar chart
      ...cycleData.map((v, i) => {
        const bh = Math.round((v / maxCycle) * 68);
        const bw = 20;
        return F(12 + i * 27, 84 - bh, bw, bh, P.accent + (v < 3 ? 'DD' : '88'), { r: 3 });
      }),
      Line(12, 84, 326, P.border),
      T('1.4h', 12, 70, 40, 12, { size: 9, fill: P.teal }),
      T('best', 12, 80, 30, 9,  { size: 8,  fill: P.teal, opacity: 0.6 }),
    ]}),

    // review queue
    T('NEEDS YOUR REVIEW', 20, 272, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    T('4 pending', 288, 272, 62, 11, { size: 9, fill: P.amber }),

    ...[
      { title: 'feat: streaming inference pipeline',    repo: 'api-core',    lines: '+428', age: '3h',  urgency: P.red,    label: 'URGENT' },
      { title: 'chore: upgrade grpc to 1.62',           repo: 'infra',       lines: '+89',  age: '5h',  urgency: P.amber,  label: 'TODAY'  },
      { title: 'fix: token expiry race condition',       repo: 'auth-service',lines: '+34',  age: '8h',  urgency: P.amber,  label: 'TODAY'  },
      { title: 'docs: update deployment runbook',        repo: 'ops',         lines: '+201', age: '22h', urgency: P.muted,  label: 'QUEUE'  },
    ].map((pr, i) =>
      F(20, 290 + i * 86, 350, 78, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        F(0, 0, 4, 78, pr.urgency, { r: 2 }),
        T(pr.repo.toUpperCase(), 16, 10, 200, 11, { size: 8, fill: pr.urgency, ls: 1, weight: 700 }),
        T(pr.age + ' ago', 310, 10, 32, 11, { size: 8, fill: P.fg2, align: 'right' }),
        T(pr.title, 16, 26, 310, 14, { size: 12, fill: P.fg, weight: 600 }),
        T(pr.lines + ' lines', 16, 46, 80, 13, { size: 10, fill: P.fg2 }),
        F(268, 42, 64, 24, pr.urgency + '18', { r: 12, stroke: pr.urgency + '44', ch: [
          T(pr.label, 4, 6, 56, 12, { size: 8, fill: pr.urgency, weight: 700, ls: 0.5, align: 'center' }),
        ]}),
      ]})
    ),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — ALERTS (Incident Intelligence)
// ══════════════════════════════════════════════════════════════════════════════
function screenAlerts(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(300, 200, 110, P.red),
    ...Glow(50, 600, 80, P.amber),
    ...StatusBar2(''),

    T('ALERTS', 20, 46, 300, 28, { size: 22, weight: 900, fill: P.fg, ls: 3 }),
    T('2 active · 5 resolved today', 20, 76, 260, 14, { size: 11, fill: P.fg2 }),

    // active incident card
    T('ACTIVE INCIDENTS', 20, 104, 250, 11, { size: 9, fill: P.red, ls: 1.5, weight: 700 }),
    F(20, 120, 350, 136, P.surface, { r: 14, stroke: P.red + '44', sw: 1, ch: [
      F(0, 0, 4, 136, P.red, { r: 2 }),
      // pulsing dot indicator
      E(22, 16, 10, 10, P.red, { opacity: 0.9 }),
      E(24, 18, 6, 6,  P.red + 'FF'),
      T('CRITICAL', 38, 14, 120, 14, { size: 10, fill: P.red, weight: 800, ls: 1 }),
      T('14 min ago', 290, 14, 52, 14, { size: 9, fill: P.fg2, align: 'right' }),
      T('P99 latency spike — api-gateway', 16, 36, 316, 16, { size: 14, fill: P.fg, weight: 700 }),
      T('Latency 840ms (baseline 95ms). Affecting 23% of\nrequests. Auto-scale triggered — 3 new pods spinning.', 16, 58, 316, 36, { size: 11, fill: P.fg2, lh: 1.5 }),
      F(16, 104, 100, 24, P.red + '18', { r: 12, stroke: P.red + '44', ch: [
        T('View Runbook', 8, 5, 86, 14, { size: 10, fill: P.red, weight: 600 }),
      ]}),
      F(126, 104, 84, 24, P.surface3, { r: 12, stroke: P.border, ch: [
        T('Acknowledge', 8, 5, 70, 14, { size: 10, fill: P.fg2 }),
      ]}),
      F(220, 104, 60, 24, P.surface3, { r: 12, stroke: P.border, ch: [
        T('Resolve', 8, 5, 46, 14, { size: 10, fill: P.fg2 }),
      ]}),
    ]}),

    // second active
    F(20, 264, 350, 90, P.surface, { r: 14, stroke: P.amber + '44', sw: 1, ch: [
      F(0, 0, 4, 90, P.amber, { r: 2 }),
      E(22, 16, 10, 10, P.amber, { opacity: 0.7 }),
      T('WARNING', 38, 14, 120, 14, { size: 10, fill: P.amber, weight: 800, ls: 1 }),
      T('48 min ago', 290, 14, 52, 14, { size: 9, fill: P.fg2, align: 'right' }),
      T('Elevated error rate — auth-service', 16, 34, 316, 16, { size: 13, fill: P.fg, weight: 600 }),
      T('Error rate 0.8% (SLO 0.5%). Watching.', 16, 54, 316, 14, { size: 11, fill: P.fg2 }),
      F(16, 72, 84, 14, P.amber + '18', { r: 7, ch: [
        T('Monitoring...', 8, 2, 70, 10, { size: 8, fill: P.amber }),
      ]}),
    ]}),

    // resolved section
    T('RESOLVED TODAY', 20, 368, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    ...[
      { title: 'DB connection pool exhausted',    duration: '8 min',  severity: P.teal  },
      { title: 'CDN cache invalidation timeout',  duration: '3 min',  severity: P.teal  },
      { title: 'Memory pressure — ML inference',  duration: '22 min', severity: P.amber },
      { title: 'DNS resolution failure — eu-west',duration: '1 min',  severity: P.teal  },
      { title: 'Deployment rollback triggered',   duration: '15 min', severity: P.amber },
    ].map((inc, i) =>
      F(20, 386 + i * 44, 350, 36, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
        E(12, 14, 8, 8, inc.severity),
        T('✓', 10, 12, 12, 12, { size: 10, fill: inc.severity }),
        T(inc.title, 30, 6, 246, 14, { size: 11, fill: P.fg2 }),
        T(`TTR ${inc.duration}`, 30, 20, 180, 12, { size: 9, fill: inc.severity }),
        T('Resolved', 294, 10, 50, 16, { size: 9, fill: P.muted, align: 'right' }),
      ]})
    ),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — CODE HEALTH (Tech Debt + Coverage + Complexity)
// ══════════════════════════════════════════════════════════════════════════════
function screenCode(ox) {
  const coverageData = [71, 74, 73, 78, 80, 79, 82, 84, 83, 86, 85, 88];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 120, 100, P.teal),
    ...StatusBar2(''),

    T('CODE HEALTH', 20, 46, 300, 28, { size: 20, weight: 900, fill: P.fg, ls: 2 }),
    T('Improving · Last analysis 4 min ago', 20, 76, 300, 14, { size: 11, fill: P.fg2 }),

    // overall health score
    F(20, 100, 350, 110, P.surface, { r: 14, stroke: P.teal + '33', sw: 1, ch: [
      // large score
      ...ScoreArc(66, 55, 88, P.teal),
      T('HEALTH SCORE', 130, 12, 200, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
      T('Great', 130, 30, 200, 24, { size: 20, weight: 800, fill: P.teal }),
      T('+4 pts from last week', 130, 58, 200, 13, { size: 11, fill: P.teal }),
      T('Top 15% of repos this size', 130, 74, 200, 13, { size: 10, fill: P.fg2 }),
    ]}),

    // 3-metric row
    T('BREAKDOWN', 20, 224, 200, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    ...[
      ['TEST COVERAGE', '88%',     '↑ 3% / week',  P.teal,  20 ],
      ['TECH DEBT',     '14 days', '↓ 2d reduced', P.amber, 150],
      ['COMPLEXITY',    'B+',      'avg cyclomatic',P.accent,280],
    ].map(([label, val, sub, color, x]) =>
      F(x, 240, 110, 80, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(label, 10, 10, 90, 10, { size: 8, fill: P.fg2, ls: 0.8 }),
        T(val, 10, 25, 90, 28, { size: 22, weight: 800, fill: color }),
        T(sub, 10, 56, 90, 14, { size: 9, fill: color, opacity: 0.7, lh: 1.3 }),
      ]})
    ),

    // coverage trend
    T('TEST COVERAGE TREND', 20, 334, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    F(20, 350, 350, 80, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('12-week coverage %', 12, 12, 200, 12, { size: 10, fill: P.fg2 }),
      T('88% now', 260, 12, 80, 12, { size: 10, fill: P.teal, align: 'right' }),
      ...Sparkline(12, 32, 326, 36, coverageData, P.teal + 'CC'),
    ]}),

    // hotspots
    T('COMPLEXITY HOTSPOTS', 20, 444, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    T('Needs attention', 288, 444, 62, 11, { size: 9, fill: P.amber }),
    ...[
      { file: 'src/inference/pipeline.ts',    score: 'A', debt: '0.5d', color: P.teal  },
      { file: 'src/auth/token-service.ts',    score: 'B', debt: '1.2d', color: P.accent},
      { file: 'src/api/rate-limiter.ts',      score: 'C', debt: '3.1d', color: P.amber },
      { file: 'legacy/reporting/engine.ts',   score: 'D', debt: '7.4d', color: P.red   },
    ].map((f, i) =>
      F(20, 462 + i * 46, 350, 38, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
        F(12, 9, 22, 22, f.color + '22', { r: 11, stroke: f.color + '55', ch: [
          T(f.score, 0, 4, 22, 14, { size: 10, fill: f.color, weight: 800, align: 'center' }),
        ]}),
        T(f.file, 44, 5, 230, 14, { size: 11, fill: P.fg }),
        T(`Tech debt: ${f.debt}`, 44, 21, 180, 12, { size: 9, fill: f.color, opacity: 0.75 }),
        T('Fix →', 310, 12, 30, 14, { size: 9, fill: f.color }),
      ]})
    ),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — TEAM (Contributor Dashboard)
// ══════════════════════════════════════════════════════════════════════════════
function screenTeam(ox) {
  const members = [
    { name: 'Jordan K.',   role: 'Eng Lead',    prs: 12, reviews: 28, score: 97, status: 'active',  color: P.teal   },
    { name: 'Sam T.',      role: 'Backend',     prs: 8,  reviews: 14, score: 91, status: 'active',  color: P.accent },
    { name: 'Alex M.',     role: 'Infra / SRE', prs: 6,  reviews: 22, score: 88, status: 'focused', color: P.amber  },
    { name: 'Priya R.',    role: 'Frontend',    prs: 9,  reviews: 11, score: 85, status: 'active',  color: P.accent },
    { name: 'Chris W.',    role: 'Backend',     prs: 4,  reviews: 8,  score: 72, status: 'out',     color: P.muted  },
  ];

  const weekBars = [6, 9, 7, 12, 8, 4, 2]; // Mon–Sun commit activity

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(100, 200, 90, P.accent),
    ...Glow(320, 600, 60, P.teal),
    ...StatusBar2(''),

    T('TEAM', 20, 46, 300, 28, { size: 22, weight: 900, fill: P.fg, ls: 4 }),
    T('5 engineers · Week 12', 20, 76, 260, 14, { size: 11, fill: P.fg2 }),

    // week activity bar
    T('COMMIT ACTIVITY — THIS WEEK', 20, 102, 300, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    F(20, 118, 350, 56, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      ...weekBars.map((v, i) => {
        const maxV = 12;
        const bh = Math.round((v / maxV) * 32);
        return F(14 + i * 47, 36 - bh, 36, bh, P.accent + (i === 3 ? 'EE' : '66'), { r: 2 });
      }),
      ...['M','T','W','T','F','S','S'].map((d, i) =>
        T(d, 18 + i * 47, 40, 28, 10, { size: 8, fill: P.muted, align: 'center' })
      ),
    ]}),

    // team members
    T('CONTRIBUTORS', 20, 188, 250, 11, { size: 9, fill: P.fg2, ls: 1.5 }),
    ...members.map((m, i) =>
      F(20, 206 + i * 100, 350, 88, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        // avatar circle
        E(18, 18, 44, 44, m.color + '22'),
        T(m.name.split(' ').map(n => n[0]).join(''), 18, 26, 44, 28, { size: 16, fill: m.color, weight: 800, align: 'center' }),

        // name + role
        T(m.name, 76, 10, 180, 16, { size: 13, fill: P.fg, weight: 700 }),
        T(m.role, 76, 28, 180, 13, { size: 10, fill: P.fg2 }),

        // status badge
        F(268, 12, 64, 20, m.status === 'active' ? P.teal + '18' : m.status === 'focused' ? P.amber + '18' : P.muted + '18', {
          r: 10,
          stroke: m.status === 'active' ? P.teal + '44' : m.status === 'focused' ? P.amber + '44' : P.muted + '44',
          ch: [T(m.status.toUpperCase(), 4, 4, 56, 12, { size: 8, fill: m.status === 'active' ? P.teal : m.status === 'focused' ? P.amber : P.muted, weight: 700, ls: 0.5 })],
        }),

        // mini stats
        ...['PRs', 'Reviews', 'Score'].map((stat, j) =>
          F(76 + j * 90, 50, 80, 30, 'transparent', { ch: [
            T(stat.toUpperCase(), 0, 0, 80, 11, { size: 8, fill: P.muted, ls: 0.8 }),
            T(String(j === 0 ? m.prs : j === 1 ? m.reviews : m.score + '%'), 0, 13, 60, 16, { size: 14, fill: j === 2 ? m.color : P.fg, weight: 700 }),
          ]})
        ),

        // contribution bar
        ...StatusBar(76, 76, 256, m.prs / 12, m.color),
      ]})
    ),

    BottomNav(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'LATTICE — AI Developer Experience Platform',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#010610',
  children: [
    screenDashboard(GAP),
    screenPRs      (GAP + (SCREEN_W + GAP)),
    screenAlerts   (GAP + (SCREEN_W + GAP) * 2),
    screenCode     (GAP + (SCREEN_W + GAP) * 3),
    screenTeam     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'lattice.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ lattice.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Dashboard · PR Analytics · Alerts · Code Health · Team');
console.log('  Palette: void navy #010610 · electric blue #4F8EFF · teal #00C896 · amber #FFB340');
