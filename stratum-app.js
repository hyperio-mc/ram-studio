'use strict';
// stratum-app.js — STRATUM: AI-Powered Design System Intelligence
// Challenge inspired by:
//   - Diffusion Studio (minimal.gallery/saas, March 2026): pure B/W + single electric accent
//   - Haptic + Twingate (godly.website): layer/node UI patterns, enterprise SaaS dark
//   - Ape AI (lapa.ninja): AI-first bold typography, electric single-color accent
// Palette: #0F0F12 charcoal · #B4FF4C electric lime · #9D7FFF AI purple

const fs   = require('fs');
const path = require('path');

const P = {
  bg:        '#0F0F12',
  surface:   '#161619',
  surface2:  '#1E1E22',
  surface3:  '#26262B',
  border:    '#2A2A30',
  border2:   '#3A3A42',
  muted:     '#5C5C6E',
  muted2:    '#8A8A9E',
  fg:        '#F0F0F4',
  fg2:       '#B8B8C8',
  accent:    '#B4FF4C',
  purple:    '#9D7FFF',
  red:       '#FF4C6A',
  amber:     '#FFB84C',
  green:     '#4CFF9D',
};

let _id = 0;
const uid = () => `s${++_id}`;

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

const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || (label.length * 6.2 + 16);
  return F(x, y, w, 20, color + '22', {
    r: 4, stroke: color + '44', sw: 1,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 600, ls: 0.3, align: 'center' })],
  });
};

// ── Bottom Nav ─────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => {
  const items = [
    { icon: '#', label: 'Tokens' },
    { icon: '+', label: 'Audit' },
    { icon: '~', label: 'History' },
    { icon: '@', label: 'Deps' },
    { icon: '*', label: 'AI' },
  ];
  return F(0, 780, 390, 64, P.surface, {
    stroke: P.border, sw: 1,
    ch: items.flatMap((item, i) => {
      const isActive = i === activeIdx;
      const bx = i * 78;
      return [
        ...(isActive ? [F(bx + 24, 0, 30, 2, P.accent, { r: 1 })] : []),
        T(item.icon, bx, 12, 78, 20, { size: 16, fill: isActive ? P.accent : P.muted, align: 'center' }),
        T(item.label, bx, 34, 78, 12, { size: 7, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400 }),
      ];
    }),
  });
};

// ── Token row ─────────────────────────────────────────────────────────────────
const TokenRow = (x, y, name, value, type, swatch) => {
  const typeColors = { color: P.accent, spacing: P.purple, typography: P.fg2, shadow: P.muted2, border: P.amber };
  const tc = typeColors[type] || P.muted2;
  return F(x, y, 350, 52, P.surface, {
    r: 8, stroke: P.border, sw: 1,
    ch: [
      ...(type === 'color' ? [
        F(12, 14, 24, 24, swatch || value, { r: 6, stroke: P.border2, sw: 1 }),
      ] : [
        F(12, 14, 24, 24, tc + '22', { r: 6, stroke: tc + '44', sw: 1,
          ch: [T({ color: 'C', spacing: 'S', typography: 'T', shadow: 'X', border: 'B' }[type] || '.', 0, 5, 24, 14, { size: 9, fill: tc, align: 'center' })] }),
      ]),
      T(name, 46, 8, 190, 14, { size: 11, fill: P.fg, weight: 500 }),
      T(value, 46, 26, 190, 14, { size: 9, fill: P.muted2 }),
      Pill(288, 16, type, tc, { w: 54 }),
    ],
  });
};

// ── Component Card (for audit) ─────────────────────────────────────────────────
const ComponentCard = (x, y, name, status, score, used, issues) => {
  const statusColor = { healthy: P.accent, warning: P.amber, critical: P.red, deprecated: P.muted }[status];
  const statusLabel = { healthy: 'Healthy', warning: 'Warning', critical: 'Critical', deprecated: 'Deprecated' }[status];
  return F(x, y, 162, 110, P.surface, {
    r: 10, stroke: P.border, sw: 1,
    ch: [
      F(0, 0, 162, 3, statusColor, { r: 2 }),
      T(name, 12, 14, 110, 14, { size: 10, fill: P.fg, weight: 700 }),
      T(used + ' uses', 12, 30, 80, 12, { size: 8, fill: P.muted }),
      E(118, 14, 32, 32, statusColor + '18', { stroke: statusColor + '40', sw: 1.5 }),
      T(String(score), 118, 22, 32, 18, { size: 12, weight: 800, fill: statusColor, align: 'center' }),
      Line(12, 52, 138, P.border),
      T(statusLabel, 12, 62, 100, 14, { size: 8, fill: statusColor, weight: 600 }),
      T(issues + ' issue' + (issues !== 1 ? 's' : ''), 12, 78, 100, 14, { size: 8, fill: P.muted }),
      F(12, 94, 138, 4, P.surface3, { r: 2 }),
      F(12, 94, Math.max(3, Math.round(138 * score / 100)), 4, statusColor, { r: 2, opacity: 0.8 }),
    ],
  });
};

// ── Version row (for history) ──────────────────────────────────────────────────
const VersionRow = (x, y, version, date, author, changes, type) => {
  const typeColors = { major: P.red, minor: P.amber, patch: P.accent };
  const tc = typeColors[type] || P.accent;
  return F(x, y, 350, 72, P.surface, {
    r: 8, stroke: P.border, sw: 1,
    ch: [
      F(0, 0, 3, 72, tc, { r: 2 }),
      F(14, 12, 54, 20, tc + '22', { r: 5, stroke: tc + '44', sw: 1,
        ch: [T(version, 0, 3, 54, 14, { size: 9, fill: tc, weight: 700, align: 'center' })] }),
      T(date,   14, 38, 80, 14, { size: 8, fill: P.muted }),
      T(author, 14, 52, 80, 12, { size: 8, fill: P.muted2 }),
      T(changes[0] || '', 76, 14, 258, 12, { size: 9, fill: P.fg2 }),
      T(changes[1] || '', 76, 28, 258, 12, { size: 9, fill: P.muted2 }),
      T(changes[2] || '', 76, 42, 258, 12, { size: 9, fill: P.muted }),
    ],
  });
};

// ── Dep node ───────────────────────────────────────────────────────────────────
const DepNode = (x, y, label, type) => {
  const colors = { core: P.accent, composite: P.purple, page: P.fg2, utility: P.amber };
  const c = colors[type] || P.muted2;
  const r = type === 'core' ? 28 : 20;
  return [
    E(x - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4, c + '0F'),
    E(x - r, y - r, r * 2, r * 2, P.surface, { stroke: c + '50', sw: type === 'core' ? 2 : 1.5 }),
    T(label, x - 32, y - 7, 64, 14, { size: type === 'core' ? 8 : 7, fill: c, weight: 700, align: 'center' }),
  ];
};

// ── AI suggestion card ─────────────────────────────────────────────────────────
const SuggestionCard = (x, y, title, description, impact, effort, category) => {
  const impactColor = { high: P.accent, medium: P.amber, low: P.muted2 }[impact];
  const effortColor = { low: P.accent, medium: P.amber, high: P.red }[effort];
  const catColors   = { tokens: P.purple, components: P.accent, accessibility: P.green, performance: P.amber };
  const cc = catColors[category] || P.purple;
  return F(x, y, 350, 96, P.surface, {
    r: 10, stroke: P.border, sw: 1,
    ch: [
      E(280, -8, 80, 80, P.purple + '08'),
      Pill(12, 12, category, cc),
      T(title, 12, 38, 260, 15, { size: 11, fill: P.fg, weight: 700 }),
      T(description, 12, 57, 318, 13, { size: 8, fill: P.muted2 }),
      T('Impact', 12, 78, 36, 10, { size: 7, fill: P.muted }),
      T(impact.toUpperCase(), 52, 78, 40, 10, { size: 7, fill: impactColor, weight: 700 }),
      T('Effort', 110, 78, 34, 10, { size: 7, fill: P.muted }),
      T(effort.toUpperCase(), 148, 78, 40, 10, { size: 7, fill: effortColor, weight: 700 }),
      F(290, 72, 48, 18, P.accent + '22', { r: 5, stroke: P.accent + '44', sw: 1,
        ch: [T('Apply', 0, 3, 48, 12, { size: 8, fill: P.accent, weight: 700, align: 'center' })] }),
    ],
  });
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — TOKEN LIBRARY
// ════════════════════════════════════════════════════════════════════════════
function screenTokens(ox) {
  const rows = [
    { name: '--color-accent',    value: '#B4FF4C',            type: 'color',      swatch: P.accent },
    { name: '--color-bg',        value: '#0F0F12',            type: 'color',      swatch: P.bg },
    { name: '--color-surface',   value: '#161619',            type: 'color',      swatch: P.surface },
    { name: '--color-fg',        value: '#F0F0F4',            type: 'color',      swatch: P.fg },
    { name: '--color-muted',     value: '#5C5C6E',            type: 'color',      swatch: P.muted },
    { name: '--space-xs',        value: '4px',                type: 'spacing',    swatch: null },
    { name: '--space-sm',        value: '8px',                type: 'spacing',    swatch: null },
    { name: '--space-md',        value: '16px',               type: 'spacing',    swatch: null },
    { name: '--text-xs',         value: '11px / 400',         type: 'typography', swatch: null },
    { name: '--text-sm',         value: '13px / 400',         type: 'typography', swatch: null },
    { name: '--radius-sm',       value: '6px',                type: 'border',     swatch: null },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('STRATUM', 296, 14, 80, 16, { size: 9, fill: P.accent, align: 'right', weight: 700 }),
    T('Token Library', 20, 48, 280, 28, { size: 22, weight: 800, fill: P.fg }),
    T('187 tokens across 8 categories', 20, 80, 280, 14, { size: 10, fill: P.muted }),
    F(296, 50, 74, 22, P.accent + '18', { r: 6, stroke: P.accent + '35', sw: 1,
      ch: [T('98% valid', 0, 4, 74, 14, { size: 9, fill: P.accent, weight: 600, align: 'center' })] }),
    // Search bar
    F(20, 104, 350, 36, P.surface2, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('search', 12, 8, 20, 20, { size: 12, fill: P.muted }),
        T('Search tokens...', 36, 10, 290, 16, { size: 11, fill: P.muted }),
      ] }),
    // Category chips
    ...['All', 'Color', 'Spacing', 'Type', 'Shadow'].map((c, i) => {
      const isActive = i === 0;
      const cw = c.length * 7 + 16;
      const offsets = [0, 36, 84, 136, 180];
      return F(20 + offsets[i], 150, cw, 24, isActive ? P.accent + '22' : P.surface2, {
        r: 6, stroke: isActive ? P.accent + '55' : P.border, sw: 1,
        ch: [T(c, 0, 5, cw, 14, { size: 9, fill: isActive ? P.accent : P.muted2, weight: isActive ? 700 : 400, align: 'center' })],
      });
    }),
    T('COLORS', 20, 190, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('5 tokens', 300, 190, 60, 12, { size: 8, fill: P.muted, align: 'right' }),
    ...rows.map((row, i) => {
      const y = 208 + i * 56;
      return y + 52 <= 770 ? TokenRow(20, y, row.name, row.value, row.type, row.swatch) : null;
    }).filter(Boolean),
    NavBar(0),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — COMPONENT AUDIT
// ════════════════════════════════════════════════════════════════════════════
function screenAudit(ox) {
  const components = [
    { name: 'Button',     status: 'healthy',    score: 97, used: 412, issues: 0 },
    { name: 'Card',       status: 'warning',    score: 81, used: 238, issues: 3 },
    { name: 'Input',      status: 'healthy',    score: 94, used: 156, issues: 1 },
    { name: 'Modal',      status: 'critical',   score: 52, used: 89,  issues: 7 },
    { name: 'Badge',      status: 'healthy',    score: 99, used: 334, issues: 0 },
    { name: 'Dropdown',   status: 'warning',    score: 76, used: 102, issues: 4 },
    { name: 'NavBar',     status: 'healthy',    score: 91, used: 44,  issues: 1 },
    { name: 'DataTable',  status: 'critical',   score: 43, used: 67,  issues: 11},
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('STRATUM', 296, 14, 80, 16, { size: 9, fill: P.accent, align: 'right', weight: 700 }),
    T('Audit', 20, 48, 280, 28, { size: 22, weight: 800, fill: P.fg }),
    T('Last scan: 4 min ago · 10 of 24 components', 20, 80, 330, 14, { size: 10, fill: P.muted }),
    // Stats strip
    F(20, 102, 350, 48, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      VLine(88, 10, 28, P.border), VLine(176, 10, 28, P.border), VLine(264, 10, 28, P.border),
      T('7', 8, 8, 72, 22, { size: 18, weight: 800, fill: P.accent, align: 'center' }),
      T('Healthy', 8, 31, 72, 10, { size: 7, fill: P.muted, align: 'center' }),
      T('3', 96, 8, 72, 22, { size: 18, weight: 800, fill: P.amber, align: 'center' }),
      T('Warning', 96, 31, 72, 10, { size: 7, fill: P.muted, align: 'center' }),
      T('2', 184, 8, 72, 22, { size: 18, weight: 800, fill: P.red, align: 'center' }),
      T('Critical', 184, 31, 72, 10, { size: 7, fill: P.muted, align: 'center' }),
      T('1', 272, 8, 72, 22, { size: 18, weight: 800, fill: P.muted2, align: 'center' }),
      T('Depr.', 272, 31, 72, 10, { size: 7, fill: P.muted, align: 'center' }),
    ]}),
    // Filters
    ...['All', 'Critical', 'Warning', 'Healthy'].map((tab, i) => {
      const isActive = i === 0;
      const tw = tab.length * 7 + 16;
      const offsets = [0, 36, 90, 148];
      return F(20 + offsets[i], 162, tw, 24, isActive ? P.accent + '22' : 'transparent', {
        r: 6, stroke: isActive ? P.accent + '55' : P.border, sw: 1,
        ch: [T(tab, 0, 5, tw, 14, { size: 9, fill: isActive ? P.accent : P.muted2, weight: isActive ? 700 : 400, align: 'center' })],
      });
    }),
    T('COMPONENTS', 20, 200, 200, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    // 2-col component grid
    ...components.slice(0, 8).map((comp, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = 20 + col * 176;
      const cy = 218 + row * 124;
      return cy + 110 <= 770 ? ComponentCard(cx, cy, comp.name, comp.status, comp.score, comp.used, comp.issues) : null;
    }).filter(Boolean),
    NavBar(1),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — CHANGE HISTORY
// ════════════════════════════════════════════════════════════════════════════
function screenHistory(ox) {
  const versions = [
    { version: 'v3.2.1', date: 'Today, 14:32', author: 'maya.k',  type: 'patch',
      changes: ['Button: fix focus ring opacity', 'Token: --space-xs corrected to 4px', 'Badge: a11y audit pass'] },
    { version: 'v3.2.0', date: 'Yesterday',    author: 'alex.t',  type: 'minor',
      changes: ['Added --color-accent-dim token', 'DataTable: new sort column variant', 'Modal: slide-up anim'] },
    { version: 'v3.1.5', date: 'Mar 19',       author: 'ram.ai',  type: 'patch',
      changes: ['AI: auto-fixed 12 token refs', 'Dropdown: z-index cascade fix', 'Type: --text-lg updated'] },
    { version: 'v3.1.0', date: 'Mar 15',       author: 'sarah.m', type: 'minor',
      changes: ['New Toast component', 'Spacing system refactored to 4px base', '3 deprecated icons removed'] },
    { version: 'v3.0.0', date: 'Mar 01',       author: 'alex.t',  type: 'major',
      changes: ['MAJOR: Brand refresh — lime accent', 'Rebuilt all color tokens', '14 components updated'] },
    { version: 'v2.9.2', date: 'Feb 24',       author: 'maya.k',  type: 'patch',
      changes: ['Input: placeholder contrast fix', 'Card: hover state border', 'Docs: migration guide'] },
    { version: 'v2.9.0', date: 'Feb 18',       author: 'ram.ai',  type: 'minor',
      changes: ['AI audit pass: 8 a11y fixes', 'Button: 3 new size variants', 'Shadow token added'] },
    { version: 'v2.8.4', date: 'Feb 10',       author: 'sarah.m', type: 'patch',
      changes: ['Tooltip: keyboard support', 'Radio group: ARIA fix', 'Storybook: dark addon'] },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('STRATUM', 296, 14, 80, 16, { size: 9, fill: P.accent, align: 'right', weight: 700 }),
    T('History', 20, 48, 280, 28, { size: 22, weight: 800, fill: P.fg }),
    T('v3.2.1 current · 38 releases', 20, 80, 300, 14, { size: 10, fill: P.muted }),
    // Branch
    F(20, 100, 350, 34, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('main', 14, 9, 60, 16, { size: 11, fill: P.accent, weight: 700 }),
      T('v', 74, 9, 14, 16, { size: 11, fill: P.accent }),
      VLine(96, 8, 18, P.border),
      T('38 releases', 110, 9, 120, 16, { size: 10, fill: P.muted2 }),
      T('Compare', 284, 9, 60, 16, { size: 9, fill: P.purple, align: 'right', weight: 600 }),
    ]}),
    // Type legend chips
    ...['major', 'minor', 'patch'].map((type, i) => {
      const typeColor = { major: P.red, minor: P.amber, patch: P.accent }[type];
      return F(20 + i * 82, 144, 74, 18, typeColor + '18', { r: 4, stroke: typeColor + '35', sw: 1,
        ch: [T(type.toUpperCase(), 0, 3, 74, 12, { size: 7, fill: typeColor, weight: 600, align: 'center' })] });
    }),
    T('RELEASES', 20, 174, 200, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    ...versions.slice(0, 8).map((v, i) => {
      const y = 192 + i * 78;
      return y + 72 <= 772 ? VersionRow(20, y, v.version, v.date, v.author, v.changes, v.type) : null;
    }).filter(Boolean),
    NavBar(2),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — DEPENDENCY MAP
// ════════════════════════════════════════════════════════════════════════════
function screenDeps(ox) {
  // Nodes: {x, y} are relative to this screen's local space (0-390)
  const nodes = [
    { x: 195, y: 310, label: 'Tokens',     type: 'core'      },
    { x:  95, y: 210, label: 'Button',     type: 'composite' },
    { x: 295, y: 210, label: 'Input',      type: 'composite' },
    { x:  75, y: 400, label: 'Badge',      type: 'composite' },
    { x: 315, y: 400, label: 'Card',       type: 'composite' },
    { x: 195, y: 185, label: 'Typography', type: 'core'      },
    { x:  55, y: 305, label: 'Nav',        type: 'page'      },
    { x: 335, y: 305, label: 'Modal',      type: 'page'      },
    { x: 140, y: 480, label: 'Form',       type: 'page'      },
    { x: 250, y: 480, label: 'Table',      type: 'page'      },
    { x: 195, y: 540, label: 'Utils',      type: 'utility'   },
    { x:  55, y: 460, label: 'Icons',      type: 'utility'   },
    { x: 335, y: 460, label: 'Theme',      type: 'utility'   },
  ];

  // Simple horizontal line connections (approximate)
  const edges = [
    [0,1],[0,2],[0,3],[0,4],[0,5],
    [5,1],[5,2],
    [1,6],[2,7],[3,6],[4,9],[2,8],
    [9,10],[8,10],[3,11],[4,12],
  ];

  const edgeElements = edges.map(([ai, bi]) => {
    const na = nodes[ai], nb = nodes[bi];
    const isCore = ai === 0 || bi === 0 || ai === 5 || bi === 5;
    const lc = isCore ? P.accent + '28' : P.border2;
    const x1 = na.x, y1 = na.y, x2 = nb.x, y2 = nb.y;
    const lx = Math.min(x1, x2), ly = Math.min(y1, y2);
    const lw = Math.max(1, Math.abs(x2 - x1));
    const lh = Math.max(1, Math.abs(y2 - y1));
    return F(lx, ly, lw, lh, 'transparent', {
      ch: [F(x1 <= x2 ? 0 : lw - 1, y1 <= y2 ? 0 : lh - 1, lw, 1, lc)],
    });
  });

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('STRATUM', 296, 14, 80, 16, { size: 9, fill: P.accent, align: 'right', weight: 700 }),
    T('Dep Map', 20, 48, 280, 28, { size: 22, weight: 800, fill: P.fg }),
    T('13 nodes · 16 deps · 0 cycles detected', 20, 80, 300, 14, { size: 10, fill: P.muted }),
    // Legend
    ...['core', 'composite', 'page', 'utility'].map((type, i) => {
      const typeColors = { core: P.accent, composite: P.purple, page: P.fg2, utility: P.amber };
      const c = typeColors[type];
      return F(20 + i * 88, 104, 80, 20, c + '18', { r: 4, stroke: c + '35', sw: 1,
        ch: [T(type[0].toUpperCase() + type.slice(1), 0, 4, 80, 12, { size: 7, fill: c, weight: 600, align: 'center' })] });
    }),
    // Center glow
    E(195 - 50, 310 - 50, 100, 100, P.accent + '06'),
    E(195 - 35, 310 - 35, 70, 70, P.accent + '0A'),
    // Edges
    ...edgeElements,
    // Nodes
    ...nodes.flatMap(node => DepNode(node.x, node.y, node.label, node.type)),
    // Info panel
    F(20, 700, 350, 68, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('Tokens (Core)', 14, 10, 200, 14, { size: 11, fill: P.accent, weight: 700 }),
      T('Central hub — all 12 components derive from this node', 14, 28, 322, 14, { size: 9, fill: P.muted2 }),
      T('12 dependants', 14, 46, 120, 12, { size: 8, fill: P.muted }),
      Pill(248, 44, '0 cycles', P.accent),
    ]}),
    NavBar(3),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — AI SUGGESTIONS
// ════════════════════════════════════════════════════════════════════════════
function screenAI(ox) {
  const suggestions = [
    { title: 'Consolidate duplicate spacing tokens',
      description: '4 tokens resolve to 8px. Merge --space-xs, --gap-2, --margin-small into --space-sm.',
      impact: 'high', effort: 'low', category: 'tokens' },
    { title: 'Fix low-contrast Badge text',
      description: 'Badge on surface2 fails WCAG AA at 3.2:1. Increase size or darken background.',
      impact: 'high', effort: 'medium', category: 'accessibility' },
    { title: 'Unify border-radius scale',
      description: '6 different radius values in use. Standardize to 4/8/12/24px system.',
      impact: 'medium', effort: 'low', category: 'tokens' },
    { title: 'DataTable: add mobile variant',
      description: 'No responsive layout detected. 67 usages on screens <768px — add scroll wrapper.',
      impact: 'high', effort: 'high', category: 'components' },
    { title: 'Remove 34 unused icon exports',
      description: 'Icons imported but never referenced. Removing saves ~12KB from bundle.',
      impact: 'medium', effort: 'low', category: 'performance' },
    { title: 'Standardize focus ring token',
      description: 'Focus outlines use 3 different colors. Centralize to --color-focus.',
      impact: 'medium', effort: 'low', category: 'accessibility' },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    E(300, -30, 160, 160, P.purple + '08'),
    E(270, -20, 100, 100, P.purple + '0C'),
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    E(316, 16, 8, 8, P.purple),
    T('AI Live', 298, 14, 68, 16, { size: 9, fill: P.purple, align: 'right', weight: 700 }),
    T('AI Insights', 20, 48, 280, 28, { size: 22, weight: 800, fill: P.fg }),
    T('6 recommendations · Scanned 2 min ago', 20, 80, 300, 14, { size: 10, fill: P.muted }),
    // AI summary
    F(20, 102, 350, 48, P.surface, { r: 10, stroke: P.purple + '30', sw: 1, ch: [
      E(14, 14, 20, 20, P.purple + '28'),
      T('*', 14, 19, 20, 14, { size: 10, fill: P.purple, align: 'center' }),
      T('3 quick wins available — auto-apply all?', 40, 15, 238, 14, { size: 10, fill: P.fg2 }),
      F(298, 13, 44, 22, P.purple + '22', { r: 5, stroke: P.purple + '44', sw: 1,
        ch: [T('Apply', 0, 4, 44, 14, { size: 9, fill: P.purple, weight: 700, align: 'center' })] }),
    ]}),
    // Filters
    ...['All', 'Tokens', 'A11y', 'Perf'].map((f, i) => {
      const isActive = i === 0;
      const fw = f.length * 7 + 16;
      const offsets = [0, 36, 80, 114];
      return F(20 + offsets[i], 162, fw, 22, isActive ? P.purple + '22' : P.surface2, {
        r: 5, stroke: isActive ? P.purple + '55' : P.border, sw: 1,
        ch: [T(f, 0, 4, fw, 14, { size: 8, fill: isActive ? P.purple : P.muted2, weight: isActive ? 700 : 400, align: 'center' })],
      });
    }),
    T('RECOMMENDATIONS', 20, 196, 200, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('by impact', 272, 196, 68, 12, { size: 8, fill: P.muted, align: 'right' }),
    ...suggestions.slice(0, 6).map((s, i) => {
      const sy = 214 + i * 100;
      return sy + 96 <= 772 ? SuggestionCard(20, sy, s.title, s.description, s.impact, s.effort, s.category) : null;
    }).filter(Boolean),
    NavBar(4),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'STRATUM — AI-Powered Design System Intelligence',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#08080B',
  children: [
    screenTokens  (GAP),
    screenAudit   (GAP +   (SCREEN_W + GAP)),
    screenHistory (GAP + 2*(SCREEN_W + GAP)),
    screenDeps    (GAP + 3*(SCREEN_W + GAP)),
    screenAI      (GAP + 4*(SCREEN_W + GAP)),
  ],
};

const outPath = path.join(__dirname, 'stratum.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('stratum.pen written -', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Token Library / Component Audit / Change History / Dep Map / AI Suggestions');
console.log('  Palette: charcoal #0F0F12 / electric lime #B4FF4C / AI purple #9D7FFF');
