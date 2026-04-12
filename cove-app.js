/**
 * COVE — Private team documentation hub
 * Inspired by:
 *   - "Chus Retro OS Portfolio" (minimal.gallery) — retro OS windowed panels trending
 *     as an aesthetic for dev/design tools; draggable cards, terminal accents, monospace data
 *   - Evervault Customers page (Godly.website) — dark security-tech UI, clean hierarchy
 *   - Darknode (Awwwards) — phosphor palette, deep navy-black backgrounds
 *
 * Dark theme: deep navy #040810, cyan accent #00D4FF, violet #9B59FF
 * Typography: Inter + JetBrains Mono for values
 */

const fs = require('fs');

// ─── PALETTE ───────────────────────────────────────────────────────────────
const P = {
  bg:        '#040810',   // deepest navy-black
  surface:   '#0A1220',   // card surface
  surface2:  '#0F1A2E',   // elevated surface
  surface3:  '#141F38',   // hover state
  border:    '#1A2844',   // subtle border
  borderHi:  '#243556',   // highlighted border
  text:      '#E8EEF8',   // near-white blue tint
  textSub:   '#7A94C4',   // muted blue-grey
  textMuted: '#3D5480',   // very muted
  cyan:      '#00D4FF',   // primary accent
  cyanDim:   '#005F7A',   // accent dim
  cyanBg:    'rgba(0,212,255,0.08)', // accent tint
  violet:    '#9B59FF',   // secondary accent
  violetDim: '#3D2080',
  violetBg:  'rgba(155,89,255,0.10)',
  green:     '#2DEB8A',   // success
  greenBg:   'rgba(45,235,138,0.09)',
  amber:     '#F5B731',   // warning
  amberBg:   'rgba(245,183,49,0.09)',
  red:       '#FF4F6A',   // error
  redBg:     'rgba(255,79,106,0.09)',
  mono:      'JetBrains Mono',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const W = 390;
const H = 844;
let idCounter = 1;
const id = () => `node_${idCounter++}`;

function frame(name, x, y, w, h, fill, children = [], extra = {}) {
  return { id: id(), type: 'FRAME', name, x, y, width: w, height: h,
    fill: fill || 'transparent', cornerRadius: 0, children, ...extra };
}
function rect(name, x, y, w, h, fill, extra = {}) {
  return { id: id(), type: 'RECT', name, x, y, width: w, height: h, fill, ...extra };
}
function text(content, x, y, w, h, opts = {}) {
  return {
    id: id(), type: 'TEXT', name: content.slice(0, 30),
    x, y, width: w, height: h, content,
    fontSize:    opts.size   || 14,
    fontFamily:  opts.font   || 'Inter',
    fontWeight:  opts.weight || '400',
    color:       opts.color  || P.text,
    align:       opts.align  || 'left',
    lineHeight:  opts.lh     || 1.4,
    letterSpacing: opts.ls   || 0,
    opacity:     opts.opacity || 1,
  };
}
function circle(name, x, y, r, fill, extra = {}) {
  return { id: id(), type: 'ELLIPSE', name, x, y, width: r*2, height: r*2, fill, ...extra };
}
function line(name, x, y, w, h, fill, extra = {}) {
  return rect(name, x, y, w, h, fill, extra);
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function statusBar() {
  return frame('StatusBar', 0, 0, W, 48, 'transparent', [
    text('9:41', 16, 16, 60, 16, { size: 13, weight: '600', color: P.text, font: P.mono }),
    // Network dots
    circle('sig1', W-72, 20, 3, P.cyan),
    circle('sig2', W-62, 20, 3, P.cyan),
    circle('sig3', W-52, 20, 3, P.textMuted),
    // Battery
    rect('bat-body', W-40, 17, 24, 13, 'transparent', { cornerRadius: 3, strokeColor: P.textSub, strokeWidth: 1.5 }),
    rect('bat-fill', W-38, 19, 16, 9, P.cyan, { cornerRadius: 2 }),
    rect('bat-tip', W-16, 20, 3, 7, P.textSub, { cornerRadius: 1 }),
  ]);
}

function topBar(title, subtitle, showBack = false) {
  return frame('TopBar', 0, 0, W, 92, 'transparent', [
    statusBar(),
    showBack ? frame('back-btn', 16, 52, 32, 32, P.surface2, [
      text('←', 8, 6, 16, 20, { size: 14, color: P.textSub, align: 'center' })
    ], { cornerRadius: 10 }) : null,
    text(title, showBack ? 60 : 20, 54, 240, 28,
      { size: 22, weight: '700', color: P.text }),
    subtitle ? text(subtitle, showBack ? 60 : 20, 78, 240, 14,
      { size: 12, color: P.textSub }) : null,
    // Avatar / action icon
    frame('avatar', W-52, 52, 32, 32, P.surface2, [
      text('AK', 4, 8, 24, 16, { size: 11, weight: '700', color: P.cyan, align: 'center' })
    ], { cornerRadius: 10 }),
  ].filter(Boolean));
}

function bottomNav(active) {
  const tabs = [
    { icon: '⌂', label: 'Home',    id: 0 },
    { icon: '◫', label: 'Docs',    id: 1 },
    { icon: '◎', label: 'Search',  id: 2 },
    { icon: '◷', label: 'Recent',  id: 3 },
    { icon: '⊞', label: 'Team',    id: 4 },
  ];
  const tabW = W / tabs.length;
  return frame('BottomNav', 0, H - 84, W, 84, P.surface, [
    rect('nav-border', 0, 0, W, 1, P.border),
    ...tabs.map((t, i) => {
      const isA = i === active;
      return frame(`tab-${t.label}`, i * tabW, 4, tabW, 76, 'transparent', [
        frame('icon-wrap', tabW/2 - 16, 8, 32, 28, isA ? P.cyanBg : 'transparent', [
          text(t.icon, 6, 4, 20, 20, { size: 16, color: isA ? P.cyan : P.textMuted, align: 'center' })
        ], { cornerRadius: 8 }),
        text(t.label, tabW/2 - 18, 40, 36, 12,
          { size: 9, weight: isA ? '700' : '400', color: isA ? P.cyan : P.textMuted, align: 'center', ls: 0.3 }),
      ]);
    }),
  ]);
}

// ─── WINDOW PANEL COMPONENT (retro OS style) ─────────────────────────────────
function windowPanel(title, badge, x, y, w, h, children = []) {
  return frame(`window-${title}`, x, y, w, h, P.surface, [
    // Title bar
    rect('title-bar-bg', 0, 0, w, 36, P.surface2, { cornerRadius: 0,
      cornerRadiusTopLeft: 12, cornerRadiusTopRight: 12 }),
    // traffic lights
    circle('tl-red', 12, 12, 5, P.red),
    circle('tl-amb', 28, 12, 5, P.amber),
    circle('tl-grn', 44, 12, 5, P.green),
    text(title, 60, 10, w - 100, 16, { size: 11, weight: '600', color: P.textSub, ls: 0.4 }),
    badge ? frame('win-badge', w - 54, 8, 44, 18, P.cyanBg, [
      text(badge, 4, 2, 36, 14, { size: 10, weight: '700', color: P.cyan, align: 'center' })
    ], { cornerRadius: 6 }) : null,
    // Content area
    ...children,
  ].filter(Boolean), { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 });
}

// ─── SCREEN 1: HOME / WORKSPACE DESK ─────────────────────────────────────────
function screen1() {
  const nodes = [
    frame('screen1', 0, 0, W, H, P.bg, [
      topBar('cove', 'your workspace'),

      // Scan lines (retro texture, subtle)
      rect('scanline1', 0, 0, W, 1, 'rgba(0,212,255,0.03)'),
      rect('scanline2', 0, 4, W, 1, 'rgba(0,212,255,0.02)'),

      // Status ticker
      frame('ticker', 16, 96, W - 32, 28, P.cyanBg, [
        circle('pulse', 10, 10, 4, P.cyan),
        text('● WORKSPACE ONLINE · 3 teammates active · last sync 2m ago', 22, 6, W - 60, 16,
          { size: 10, weight: '500', color: P.cyan, font: P.mono }),
      ], { cornerRadius: 8 }),

      // Quick actions row
      text('QUICK ACCESS', 16, 138, 200, 14,
        { size: 10, weight: '700', color: P.textMuted, ls: 1.2 }),

      ...[
        { icon: '⊕', label: 'New Doc',   color: P.cyan },
        { icon: '◈', label: 'Template',  color: P.violet },
        { icon: '↑', label: 'Import',    color: P.green },
        { icon: '⊞', label: 'Spaces',    color: P.amber },
      ].map((a, i) => {
        const qW = (W - 40) / 4 - 4;
        return frame(`qa-${a.label}`, 16 + i * (qW + 5), 158, qW, 68, P.surface, [
          frame('qa-icon', qW/2 - 16, 10, 32, 28, `rgba(${a.color === P.cyan ? '0,212,255' : a.color === P.violet ? '155,89,255' : a.color === P.green ? '45,235,138' : '245,183,49'},0.15)`, [
            text(a.icon, 6, 4, 20, 20, { size: 14, color: a.color, align: 'center' })
          ], { cornerRadius: 8 }),
          text(a.label, 0, 44, qW, 14, { size: 10, weight: '600', color: P.textSub, align: 'center' }),
        ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 });
      }),

      // Recent spaces — window panel style
      windowPanel('SPACES', '4 active', 16, 240, W - 32, 210, [
        ...[
          { name: 'Product Roadmap', icon: '◈', members: '5', updated: '3m', color: P.cyan },
          { name: 'Engineering Wiki', icon: '◫', members: '8', updated: '1h', color: P.violet },
          { name: 'Design System',   icon: '◎', members: '4', updated: '2h', color: P.green },
          { name: 'Onboarding',      icon: '⊕', members: '12', updated: '1d', color: P.amber },
        ].map((s, i) => frame(`space-${i}`, 0, 36 + i * 42, W - 32, 42, 'transparent', [
          rect('space-line', 0, 41, W - 32, 1, P.border),
          frame('s-icon', 14, 9, 24, 24, `rgba(${s.color === P.cyan ? '0,212,255' : s.color === P.violet ? '155,89,255' : s.color === P.green ? '45,235,138' : '245,183,49'},0.12)`, [
            text(s.icon, 4, 4, 16, 16, { size: 12, color: s.color, align: 'center' })
          ], { cornerRadius: 8 }),
          text(s.name, 50, 7, 160, 16, { size: 13, weight: '600', color: P.text }),
          text(`${s.members} members`, 50, 24, 100, 12, { size: 10, color: P.textSub }),
          text(s.updated, W - 60, 15, 40, 12, { size: 10, color: P.textMuted, align: 'right', font: P.mono }),
          text('›', W - 32, 13, 16, 16, { size: 16, color: P.textMuted, align: 'center' }),
        ])),
      ]),

      // Activity summary widget
      frame('activity-widget', 16, 462, W - 32, 80, P.surface, [
        text('TODAY\'S ACTIVITY', 14, 14, 200, 12, { size: 10, weight: '700', color: P.textMuted, ls: 1.0 }),
        // Mini bar chart
        ...[40, 65, 52, 80, 70, 88, 60].map((h, i) => {
          const bH = Math.round(h * 0.36);
          return rect(`bar-${i}`, 14 + i * 20, 60 - bH, 14, bH,
            i === 6 ? P.cyan : P.surface3, { cornerRadius: 3 });
        }),
        frame('activity-today', W - 120, 12, 106, 44, P.cyanBg, [
          text('26', 10, 4, 40, 24, { size: 22, weight: '800', color: P.cyan, font: P.mono }),
          text('edits today', 10, 28, 86, 12, { size: 10, color: P.textSub }),
        ], { cornerRadius: 8 }),
      ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 }),

      bottomNav(0),
    ])
  ];
  return nodes[0];
}

// ─── SCREEN 2: DOCS LIST ──────────────────────────────────────────────────────
function screen2() {
  return frame('screen2', 0, 0, W, H, P.bg, [
    topBar('docs', 'Product Roadmap'),

    // Filter chips
    frame('filters', 16, 96, W - 32, 32, 'transparent', [
      ...[
        { label: 'All', active: true },
        { label: 'Pinned', active: false },
        { label: 'Drafts', active: false },
        { label: 'Shared', active: false },
      ].map((f, i) => {
        const fw = [40, 58, 52, 52];
        const fx = [0, 48, 114, 174];
        return frame(`chip-${f.label}`, fx[i], 0, fw[i], 28, f.active ? P.cyan : P.surface2, [
          text(f.label, 0, 6, fw[i], 16,
            { size: 11, weight: '600', color: f.active ? P.bg : P.textSub, align: 'center' })
        ], { cornerRadius: 20 });
      }),
    ]),

    // Pinned window panel
    windowPanel('PINNED', '2 docs', 16, 140, W - 32, 130, [
      ...[
        { title: 'Q2 2025 Roadmap', icon: '◈', tag: 'Strategy', updated: '3m ago', lines: 48 },
        { title: 'Sprint 14 Notes', icon: '◷', tag: 'Meeting', updated: '1h ago', lines: 12 },
      ].map((d, i) => frame(`pinned-${i}`, 0, 36 + i * 46, W - 32, 46, 'transparent', [
        rect('pin-line', 0, 45, W - 32, 1, P.border),
        rect('pin-accent', 14, 14, 3, 18, P.cyan, { cornerRadius: 2 }),
        text(d.title, 28, 8, 190, 16, { size: 13, weight: '600', color: P.text }),
        frame('d-tag', 28, 26, 60, 14, P.surface3, [
          text(d.tag, 4, 1, 52, 12, { size: 9, weight: '600', color: P.textSub })
        ], { cornerRadius: 4 }),
        text(d.updated, W - 72, 10, 58, 12, { size: 10, color: P.textMuted, align: 'right', font: P.mono }),
        text(`${d.lines} lines`, W - 72, 26, 58, 12, { size: 10, color: P.textMuted, align: 'right', font: P.mono }),
      ])),
    ]),

    // Recent docs
    text('RECENT', 16, 284, 200, 14, { size: 10, weight: '700', color: P.textMuted, ls: 1.2 }),

    ...[
      { title: 'Architecture Decisions',   icon: '◫', tag: 'Tech', updated: '2h', color: P.violet, preview: 'ADR-013: Moving to event-driven...' },
      { title: 'User Research Synthesis',  icon: '◎', tag: 'Research', updated: '4h', color: P.green, preview: 'Key finding: users struggle with...' },
      { title: 'API Reference v2.4',       icon: '⊕', tag: 'Docs', updated: '1d', color: P.cyan, preview: 'Updated endpoints: /auth, /spaces...' },
      { title: 'Retrospective Mar 2025',   icon: '◷', tag: 'Meeting', updated: '2d', color: P.amber, preview: 'What went well: deployment pipeline...' },
    ].map((d, i) => frame(`doc-${i}`, 16, 306 + i * 86, W - 32, 80, P.surface, [
      frame('doc-icon', 14, 16, 36, 36, `rgba(${d.color === P.cyan ? '0,212,255' : d.color === P.violet ? '155,89,255' : d.color === P.green ? '45,235,138' : '245,183,49'},0.12)`, [
        text(d.icon, 6, 8, 24, 20, { size: 16, color: d.color, align: 'center' })
      ], { cornerRadius: 10 }),
      text(d.title, 62, 12, 220, 16, { size: 13, weight: '600', color: P.text }),
      text(d.preview, 62, 30, 210, 14, { size: 11, color: P.textSub, opacity: 0.8 }),
      frame('d-tag2', 62, 50, 60, 16, P.surface2, [
        text(d.tag, 6, 2, 48, 12, { size: 9, weight: '600', color: P.textSub })
      ], { cornerRadius: 4 }),
      text(d.updated, W - 52, 32, 36, 12, { size: 10, color: P.textMuted, align: 'right', font: P.mono }),
      rect('doc-line', 0, 79, W - 32, 1, P.border),
    ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 })),

    bottomNav(1),
  ]);
}

// ─── SCREEN 3: DOCUMENT VIEWER ─────────────────────────────────────────────
function screen3() {
  return frame('screen3', 0, 0, W, H, P.bg, [
    // OS-style window chrome header
    rect('chrome-bg', 0, 0, W, 92, P.surface),
    rect('chrome-border', 0, 92, W, 1, P.border),
    statusBar(),
    // Traffic lights in header
    circle('hd-red', 16, 56, 5, P.red),
    circle('hd-amb', 32, 56, 5, P.amber),
    circle('hd-grn', 48, 56, 5, P.green),
    text('Q2 2025 ROADMAP.md', 66, 50, 220, 16, { size: 12, weight: '600', color: P.textSub, font: P.mono }),
    frame('share-btn', W - 54, 46, 38, 24, P.cyanBg, [
      text('↑ Share', 4, 4, 30, 16, { size: 10, weight: '600', color: P.cyan })
    ], { cornerRadius: 8 }),

    // Doc content
    text('Q2 2025 Product Roadmap', 20, 108, W - 40, 28, { size: 20, weight: '800', color: P.text }),
    frame('meta-row', 20, 138, W - 40, 18, 'transparent', [
      frame('author-chip', 0, 0, 68, 18, P.surface2, [
        text('AK · Alex Kim', 6, 2, 60, 14, { size: 10, color: P.textSub })
      ], { cornerRadius: 6 }),
      text('Updated 3m ago', 76, 2, 120, 14, { size: 10, color: P.textMuted, font: P.mono }),
    ]),

    rect('doc-divider', 20, 164, W - 40, 1, P.border),

    // Callout block (OS terminal style)
    frame('callout', 20, 172, W - 40, 52, P.cyanBg, [
      rect('callout-accent', 0, 0, 3, 52, P.cyan, { cornerRadius: 2 }),
      text('📋 Overview', 14, 8, W - 60, 14, { size: 12, weight: '700', color: P.cyan }),
      text('Ship 3 major features by June 30. Focus areas: collaboration, performance, and onboarding redesign.', 14, 26, W - 56, 28, { size: 11, color: P.text, lh: 1.5 }),
    ], { cornerRadius: 10 }),

    // Section heading
    text('# OBJECTIVES', 20, 234, W - 40, 16, { size: 13, weight: '800', color: P.cyan, font: P.mono, ls: 1 }),
    rect('h-underline', 20, 252, 90, 2, P.cyanDim, { cornerRadius: 1 }),

    ...[
      { id: 'OBJ-1', title: 'Real-time Collaboration', status: 'in progress', pct: 65, color: P.cyan },
      { id: 'OBJ-2', title: 'Performance v2',          status: 'planned',     pct: 20, color: P.violet },
      { id: 'OBJ-3', title: 'Onboarding Redesign',     status: 'review',      pct: 90, color: P.green },
    ].map((o, i) => frame(`obj-${i}`, 20, 262 + i * 82, W - 40, 74, P.surface, [
      frame('obj-id', 14, 12, 52, 18, P.surface3, [
        text(o.id, 6, 2, 40, 14, { size: 10, weight: '700', color: P.textSub, font: P.mono })
      ], { cornerRadius: 5 }),
      frame('obj-status', 74, 12, o.status === 'in progress' ? 74 : 52, 18,
        o.color === P.cyan ? P.cyanBg : o.color === P.violet ? P.violetBg : P.greenBg, [
        text(o.status, 6, 2, 62, 14,
          { size: 10, weight: '600', color: o.color })
      ], { cornerRadius: 5 }),
      text(o.title, 14, 34, W - 80, 16, { size: 14, weight: '600', color: P.text }),
      // Progress bar
      rect('prog-bg', 14, 58, W - 72, 8, P.surface3, { cornerRadius: 4 }),
      rect('prog-fill', 14, 58, Math.round((W - 72) * o.pct / 100), 8, o.color, { cornerRadius: 4 }),
      text(`${o.pct}%`, W - 50, 54, 36, 12, { size: 11, weight: '600', color: o.color, align: 'right', font: P.mono }),
    ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 })),

    // Inline code block
    frame('code-block', 20, 514, W - 40, 48, P.surface2, [
      rect('code-accent', 0, 0, W - 40, 48, 'transparent', { cornerRadius: 10, strokeColor: P.border, strokeWidth: 1 }),
      text('$ curl -X POST /api/v2/spaces/create', 12, 14, W - 64, 16, { size: 11, color: P.green, font: P.mono }),
      text('  --json \'{"name": "Q2 Roadmap", "public": false}\'', 12, 30, W - 64, 14, { size: 11, color: P.textSub, font: P.mono }),
    ], { cornerRadius: 10 }),

    // Comment thread (bottom)
    frame('comment-bar', 20, 576, W - 40, 42, P.surface, [
      circle('cmt-av1', 14, 11, 10, P.violet),
      text('JL', 9, 14, 20, 13, { size: 9, weight: '700', color: P.bg, align: 'center' }),
      circle('cmt-av2', 38, 11, 10, P.green),
      text('+2 comments on this doc', 60, 12, 200, 16, { size: 12, color: P.textSub }),
      text('View →', W - 80, 14, 56, 14, { size: 11, weight: '600', color: P.cyan, align: 'right' }),
    ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 }),

    bottomNav(1),
  ]);
}

// ─── SCREEN 4: SEARCH ─────────────────────────────────────────────────────────
function screen4() {
  return frame('screen4', 0, 0, W, H, P.bg, [
    topBar('search', 'Find anything in cove'),

    // Search input (OS-style command bar)
    frame('search-bar', 16, 96, W - 32, 48, P.surface2, [
      text('⌘', 14, 14, 20, 20, { size: 16, color: P.cyan }),
      rect('sb-divider', 36, 12, 1, 24, P.border),
      text('Type to search docs, people, spaces...', 44, 14, W - 100, 20, { size: 13, color: P.textMuted }),
      frame('kbd', W - 72, 13, 42, 22, P.surface3, [
        text('⌘K', 8, 3, 26, 16, { size: 11, weight: '600', color: P.textSub, font: P.mono })
      ], { cornerRadius: 6, strokeColor: P.border, strokeWidth: 1 }),
    ], { cornerRadius: 14, strokeColor: P.cyan, strokeWidth: 1 }),

    // Recent searches
    text('RECENT SEARCHES', 16, 158, 200, 14, { size: 10, weight: '700', color: P.textMuted, ls: 1.2 }),
    ...[
      { q: 'authentication flow', tag: 'Docs' },
      { q: 'sprint 14 retrospective', tag: 'Meeting' },
      { q: 'API v2 endpoints', tag: 'Tech' },
    ].map((s, i) => frame(`recent-${i}`, 16, 178 + i * 46, W - 32, 40, P.surface, [
      text('◷', 14, 10, 20, 20, { size: 14, color: P.textMuted }),
      text(s.q, 42, 11, 220, 16, { size: 13, color: P.text }),
      frame('rec-tag', W - 70, 11, 50, 18, P.surface3, [
        text(s.tag, 6, 2, 38, 14, { size: 9, weight: '600', color: P.textSub })
      ], { cornerRadius: 5 }),
      rect('rec-line', 0, 39, W - 32, 1, P.border),
    ], { cornerRadius: 10, strokeColor: P.border, strokeWidth: 1 })),

    // Search results preview (window panel)
    windowPanel('RESULTS FOR "ROADMAP"', '14 found', 16, 326, W - 32, 330, [
      ...[
        { title: 'Q2 2025 Roadmap',         space: 'Product', match: '5 matches', icon: '◈', color: P.cyan },
        { title: 'Q3 Roadmap Draft',         space: 'Product', match: '3 matches', icon: '◈', color: P.cyan },
        { title: 'Roadmap Review Notes',     space: 'Engineering', match: '2 matches', icon: '◷', color: P.violet },
        { title: 'Mobile Roadmap 2025',      space: 'Mobile', match: '8 matches', icon: '◫', color: P.green },
        { title: 'Stakeholder Roadmap Deck', space: 'Strategy', match: '1 match', icon: '⊞', color: P.amber },
      ].map((r, i) => frame(`result-${i}`, 0, 36 + i * 58, W - 32, 58, 'transparent', [
        rect('res-line', 0, 57, W - 32, 1, P.border),
        frame('res-icon', 14, 12, 32, 32, `rgba(${r.color === P.cyan ? '0,212,255' : r.color === P.violet ? '155,89,255' : r.color === P.green ? '45,235,138' : '245,183,49'},0.12)`, [
          text(r.icon, 6, 7, 20, 18, { size: 14, color: r.color, align: 'center' })
        ], { cornerRadius: 8 }),
        text(r.title, 58, 10, 190, 16, { size: 13, weight: '600', color: P.text }),
        text(r.space, 58, 28, 80, 14, { size: 11, color: P.textSub }),
        frame('match-pill', W - 90, 18, 72, 18, P.cyanBg, [
          text(r.match, 6, 2, 60, 14, { size: 10, weight: '600', color: P.cyan })
        ], { cornerRadius: 5 }),
      ])),
    ]),

    bottomNav(2),
  ]);
}

// ─── SCREEN 5: TEAM VIEW ──────────────────────────────────────────────────────
function screen5() {
  return frame('screen5', 0, 0, W, H, P.bg, [
    topBar('team', '8 members · 3 online'),

    // Online presence strip
    frame('presence', 16, 96, W - 32, 56, P.surface, [
      text('NOW ONLINE', 14, 8, 140, 12, { size: 10, weight: '700', color: P.green, ls: 1.0 }),
      ...[
        { init: 'AK', color: P.cyan, doc: 'Q2 Roadmap' },
        { init: 'MR', color: P.violet, doc: 'API Docs' },
        { init: 'JL', color: P.green, doc: 'Sprint Notes' },
      ].map((m, i) => frame(`online-${i}`, 14 + i * 100, 22, 90, 28, P.surface2, [
        circle(`av-${i}`, 8, 4, 10, m.color),
        text(m.init, 3, 7, 20, 13, { size: 9, weight: '700', color: P.bg, align: 'center' }),
        text(m.doc, 24, 6, 62, 16, { size: 10, color: P.textSub }),
      ], { cornerRadius: 8 })),
    ], { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 }),

    // Members
    text('MEMBERS', 16, 166, 200, 14, { size: 10, weight: '700', color: P.textMuted, ls: 1.2 }),
    ...[
      { init: 'AK', name: 'Alex Kim',    role: 'Admin',      docs: 48, color: P.cyan,   online: true  },
      { init: 'MR', name: 'Maya Reyes',  role: 'Editor',     docs: 34, color: P.violet, online: true  },
      { init: 'JL', name: 'Jin Lee',     role: 'Editor',     docs: 27, color: P.green,  online: true  },
      { init: 'TB', name: 'Tom Bridges', role: 'Viewer',     docs: 5,  color: P.amber,  online: false },
      { init: 'SR', name: 'Sara Roth',   role: 'Editor',     docs: 19, color: P.violet, online: false },
    ].map((m, i) => frame(`member-${i}`, 16, 184 + i * 64, W - 32, 58, P.surface, [
      circle(`m-av-${i}`, 14, 14, 16, m.color),
      text(m.init, 5, 19, 32, 16, { size: 11, weight: '800', color: P.bg, align: 'center' }),
      m.online ? circle(`online-dot-${i}`, 38, 10, 4, P.green) : null,
      text(m.name, 54, 10, 160, 16, { size: 13, weight: '600', color: P.text }),
      frame('role-pill', 54, 28, m.role === 'Admin' ? 44 : m.role === 'Editor' ? 46 : 44, 18,
        m.role === 'Admin' ? P.cyanBg : P.surface3, [
        text(m.role, 6, 2, 38, 14,
          { size: 9, weight: '700', color: m.role === 'Admin' ? P.cyan : P.textSub })
      ], { cornerRadius: 5 }),
      frame('docs-stat', W - 70, 16, 54, 24, P.surface3, [
        text(`${m.docs}`, 6, 2, 24, 20, { size: 13, weight: '700', color: P.text, font: P.mono }),
        text('docs', 28, 5, 22, 14, { size: 9, color: P.textMuted }),
      ], { cornerRadius: 8 }),
      rect('m-line', 0, 57, W - 32, 1, P.border),
    ].filter(Boolean), { cornerRadius: 12, strokeColor: P.border, strokeWidth: 1 })),

    // Invite button
    frame('invite-btn', 16, 510, W - 32, 48, P.cyanBg, [
      rect('invite-border', 0, 0, W - 32, 48, 'transparent', { cornerRadius: 14, strokeColor: P.cyan, strokeWidth: 1, strokeDash: [4, 4] }),
      text('+ Invite teammate', W/2 - 100, 14, 200, 20, { size: 14, weight: '600', color: P.cyan, align: 'center' }),
    ], { cornerRadius: 14 }),

    bottomNav(4),
  ]);
}

// ─── PEN DOCUMENT ─────────────────────────────────────────────────────────────
const penDoc = {
  version: '2.8',
  name: 'COVE — Team Documentation Hub',
  description: 'Private team documentation hub with retro OS windowed panels, deep navy-black palette, and cyan+violet accents. Inspired by "Chus Retro OS Portfolio" (minimal.gallery) and Evervault dark tech UI (Godly).',
  width:  W,
  height: H,
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

fs.writeFileSync('cove.pen', JSON.stringify(penDoc, null, 2));
console.log('✓ cove.pen written — screens:', penDoc.screens.length);
