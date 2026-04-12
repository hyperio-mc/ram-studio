'use strict';
// codex-app.js
// CODEX — Team Knowledge Vault for Engineering Teams
//
// Challenge: Design a dark mode archival/editorial developer knowledge hub
// inspired by:
// 1. Silencio.es (godly.website) — Swiss editorial reference taxonomy,
//    ALL CAPS label system, archival REF: codes, data tables,
//    bold thinking + systematic visual language
// 2. Linear.app (darkmodedesign.com) — Ultra-refined deep dark SaaS,
//    cool near-black backgrounds, violet accent, systematic precision,
//    "purpose-built for teams and agents"
// 3. Atlas Card (godly.website) — Invite-only premium exclusivity signals,
//    ultra-minimal with weighted typography, high-contrast hierarchy
//
// This style pushes toward an aesthetic RAM hasn't used before:
// Swiss archival system + modern SaaS precision + dark editorial
//
// Palette: near-black #0C0C12 · violet #7060F0 · amber phosphor #E8A838
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0C0C12',   // near-black with cool blue undertone
  surface:  '#12121C',   // elevated surface
  surface2: '#18182A',   // card surface
  surface3: '#1E1E35',   // hover/selected surface
  border:   '#242438',   // subtle border
  muted:    '#4A4A72',   // muted purple-grey
  fg:       '#E4E4F0',   // cool near-white
  accent:   '#7060F0',   // violet (Linear-inspired)
  amber:    '#E8A838',   // phosphor amber (terminal glow, REF codes)
  green:    '#3DD68C',   // active / positive
  red:      '#F06B6B',   // error / critical
  blue:     '#4A9EF0',   // info / link
  violet2:  '#A090FF',   // lighter violet for highlights
};

let _id = 0;
const uid = () => `cx${++_id}`;

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

// ── Glows (subtle ambient) ─────────────────────────────────────────────────────
const Glow = (cx, cy, r, color, intensity = 1) => [
  E(cx - r*2.5, cy - r*2.5, r*5,   r*5,   color + Math.round(4  * intensity).toString(16).padStart(2,'0')),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color + Math.round(10 * intensity).toString(16).padStart(2,'0')),
  E(cx - r,     cy - r,     r*2,   r*2,   color + Math.round(18 * intensity).toString(16).padStart(2,'0')),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + Math.round(28 * intensity).toString(16).padStart(2,'0')),
];

// ── REF badge (Swiss archival style) ──────────────────────────────────────────
const RefBadge = (x, y, code) => F(x, y, code.length * 6.8 + 16, 20, P.amber + '18', {
  r: 3,
  stroke: P.amber + '30',
  sw: 1,
  ch: [T(code, 8, 3, code.length * 6.8, 14, { size: 9.5, fill: P.amber, weight: 700, ls: 0.8 })],
});

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 7, 7, color);

// ── Tag pill ─────────────────────────────────────────────────────────────────
const Tag = (x, y, label, color = P.muted) => F(x, y, label.length * 6.2 + 16, 20, color + '18', {
  r: 4,
  ch: [T(label, 8, 4, label.length * 6.2, 12, { size: 9, fill: color, weight: 600, ls: 0.5 })],
});

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgBar = (x, y, w, pct, color) => [
  F(x, y, w, 4, P.surface3, { r: 2 }),
  F(x, y, Math.round(w * pct), 4, color, { r: 2, opacity: 0.85 }),
];

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => {
  const tabs = [['⊟', 'INDEX'], ['⊞', 'BROWSE'], ['⊡', 'SEARCH'], ['⊛', 'TEAM']];
  return F(0, 764, 390, 80, P.surface, { ch: [
    Line(0, 0, 390, P.border),
    ...tabs.map(([icon, label], i) => {
      const nx = 20 + i * 88;
      const on = i === active;
      return [
        on ? F(nx + 16, 6, 56, 52, P.accent + '14', { r: 14 }) : null,
        T(icon, nx + 22, 12, 44, 22, { size: 18, fill: on ? P.accent : P.muted }),
        T(label, nx + 6, 38, 76, 12, { size: 8.5, fill: on ? P.accent : P.muted, align: 'center', weight: on ? 700 : 400, ls: 0.5 }),
      ].filter(Boolean);
    }).flat(),
  ]});
};

// ── Status bar ─────────────────────────────────────────────────────────────────
const StatusBar = (ox) => [
  T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('⚡ 87%', 310, 16, 60, 16, { size: 10, fill: P.muted, align: 'right' }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — INDEX (Category Dashboard)
// Swiss editorial: all categories listed with REF codes, doc counts, status
// ══════════════════════════════════════════════════════════════════════════════
function screenIndex(ox) {
  const categories = [
    { ref: 'CDX-001', name: 'ARCHITECTURE',    sub: 'System design & ADRs',      docs: 47,  updated: '2h ago',  color: P.accent,  pct: 0.82 },
    { ref: 'CDX-002', name: 'API REFERENCE',   sub: 'Endpoints & schemas',        docs: 134, updated: '34m ago', color: P.blue,    pct: 0.95 },
    { ref: 'CDX-003', name: 'RUNBOOKS',        sub: 'Ops & incident playbooks',   docs: 28,  updated: '1d ago',  color: P.green,   pct: 0.64 },
    { ref: 'CDX-004', name: 'ONBOARDING',      sub: 'New eng setup guides',       docs: 12,  updated: '3d ago',  color: P.amber,   pct: 0.40 },
    { ref: 'CDX-005', name: 'DECISIONS',       sub: 'RFCs & tech decisions',      docs: 89,  updated: '6h ago',  color: P.violet2, pct: 0.77 },
    { ref: 'CDX-006', name: 'SECURITY',        sub: 'Auth, certs & policies',     docs: 31,  updated: '12h ago', color: P.red,     pct: 0.55 },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow top-right
    ...Glow(340, 80, 100, P.accent, 0.6),

    // status bar
    ...StatusBar(),

    // header — CODEX wordmark (Silencio-style large editorial)
    T('CODEX', 20, 44, 300, 48, { size: 40, weight: 900, fill: P.fg, ls: 6 }),
    T('KNOWLEDGE VAULT', 20, 88, 240, 14, { size: 9, fill: P.muted, ls: 3 }),

    // stats row (archival counts)
    F(20, 108, 350, 48, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      ...[[341, 'DOCS', 0], [8, 'UPDATED TODAY', 1], [24, 'CONTRIBUTORS', 2]].map(([val, lbl, i]) => [
        VLine(i === 0 ? 0 : i * 116, 8, 32, P.border),
        T(String(val), 16 + i * 116, 8, 80, 20, { size: 16, weight: 800, fill: P.fg }),
        T(lbl, 16 + i * 116, 30, 96, 12, { size: 8, fill: P.muted, ls: 0.8 }),
      ]).flat().filter((_, j) => j % 3 !== 0 || _ !== undefined),
    ].filter(Boolean) }),

    // actually redo the stats row simply:
    ...[[341, 'DOCS', 0], [8, 'TODAY', 1], [24, 'CONTRIB.', 2]].map(([val, lbl, i]) =>
      F(20 + i * 118, 108, 110, 48, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(String(val), 14, 8, 82, 20, { size: 16, weight: 800, fill: P.fg }),
        T(lbl, 14, 30, 82, 12, { size: 8, fill: P.muted, ls: 1.2 }),
      ]})
    ),

    // section label
    T('CATEGORIES', 20, 168, 200, 14, { size: 8.5, fill: P.muted, ls: 2.5 }),
    Line(20, 184, 350, P.border),

    // category rows — Swiss tabular archival style
    ...categories.map((c, i) =>
      F(20, 190 + i * 88, 350, 80, i % 2 === 0 ? P.surface : P.bg, { r: 10, stroke: P.border, sw: 1, ch: [
        // REF badge
        RefBadge(12, 10, c.ref),
        // category name — large editorial
        T(c.name, 12, 34, 220, 20, { size: 15, weight: 800, fill: P.fg, ls: 0.3 }),
        T(c.sub, 12, 56, 220, 14, { size: 10, fill: P.muted }),
        // doc count (right-aligned, prominent)
        T(String(c.docs), 270, 10, 68, 28, { size: 22, weight: 800, fill: c.color, align: 'right' }),
        T('DOCS', 270, 40, 68, 12, { size: 8, fill: P.muted, align: 'right', ls: 1 }),
        // progress bar
        ...ProgBar(12, 72, 326, c.pct, c.color),
        // updated label
        T(c.updated, 12, 59, 100, 13, { size: 9, fill: P.muted, opacity: 0.6 }),
      ]}),
    ),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — BROWSE (Doc Card Grid)
// Document cards with tags, ref codes, author avatars
// ══════════════════════════════════════════════════════════════════════════════
function screenBrowse(ox) {
  const docs = [
    { ref: 'CDX-002', title: 'Auth Gateway v3 API',       sub: 'OAuth2 + JWT reference',         tags: ['API', 'AUTH'],    updated: '34m',  author: 'KL', color: P.blue,    hot: true  },
    { ref: 'CDX-001', title: 'Event Bus Architecture',    sub: 'Kafka topology & consumer groups', tags: ['ARCH', 'ASYNC'],  updated: '2h',   author: 'SR', color: P.accent,  hot: false },
    { ref: 'CDX-005', title: 'ADR-042: Move to Postgres', sub: 'Decision record for DB migration', tags: ['ADR', 'DB'],      updated: '6h',   author: 'MN', color: P.violet2, hot: false },
    { ref: 'CDX-003', title: 'Incident: P0 DB Runbook',   sub: 'On-call response playbook',       tags: ['OPS', 'P0'],      updated: '1d',   author: 'TB', color: P.red,     hot: false },
    { ref: 'CDX-001', title: 'Service Mesh Overview',     sub: 'Istio config & traffic policies',  tags: ['INFRA', 'ARCH'],  updated: '2d',   author: 'KL', color: P.accent,  hot: false },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(80, 300, 80, P.blue, 0.5),

    ...StatusBar(),

    // header row with filter chips
    T('BROWSE', 20, 44, 250, 32, { size: 26, weight: 900, fill: P.fg, ls: 4 }),
    T('ALL CATEGORIES', 20, 80, 200, 14, { size: 9, fill: P.accent, ls: 2 }),

    // active filter pills
    Tag(20, 100, 'ALL', P.accent),
    Tag(72, 100, 'API', P.blue),
    Tag(106, 100, 'ARCH', P.accent),
    Tag(148, 100, 'OPS', P.green),
    Tag(183, 100, 'ADR', P.violet2),

    // sort row
    T('SORT: RECENT', 270, 104, 100, 14, { size: 9, fill: P.muted, align: 'right' }),

    Line(20, 124, 350, P.border),

    // doc cards
    ...docs.map((d, i) =>
      F(20, 130 + i * 118, 350, 110, P.surface, { r: 12, stroke: d.hot ? P.blue + '44' : P.border, sw: d.hot ? 1.5 : 1, ch: [

        // hot indicator
        d.hot ? F(0, 0, 350, 3, P.blue, { r: 2 }) : null,

        // ref + author row
        RefBadge(12, 10, d.ref),
        // author avatar
        E(316, 10, 22, 22, d.color + '30'),
        T(d.author, 316, 13, 22, 16, { size: 9.5, fill: d.color, weight: 700, align: 'center' }),

        // title
        T(d.title, 12, 36, 300, 22, { size: 15, weight: 700, fill: P.fg }),
        T(d.sub, 12, 60, 300, 16, { size: 11, fill: P.muted }),

        // tags row
        ...d.tags.map((tag, j) => Tag(12 + j * (tag.length * 6.2 + 22), 80, tag, d.color)),

        // updated
        T(d.updated + ' ago', 280, 84, 60, 14, { size: 9, fill: P.muted, align: 'right' }),

      ].filter(Boolean) })
    ),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — DOC VIEW (Document Reader)
// Editorial document view — Silencio-style hierarchy with code block
// ══════════════════════════════════════════════════════════════════════════════
function screenDoc(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(300, 400, 120, P.accent, 0.4),

    ...StatusBar(),

    // breadcrumb
    T('INDEX  ›  API REFERENCE  ›', 20, 44, 340, 14, { size: 9, fill: P.muted, ls: 0.5 }),

    // doc title — large editorial display
    T('AUTH GATEWAY', 20, 60, 350, 36, { size: 30, weight: 900, fill: P.fg, ls: 2 }),
    T('V3 API REFERENCE', 20, 96, 280, 20, { size: 14, weight: 300, fill: P.blue }),

    // meta row: ref + updated + contributors
    RefBadge(20, 122, 'CDX-002'),
    T('UPDATED 34m AGO', 80, 124, 160, 14, { size: 9, fill: P.muted, ls: 0.8 }),
    Dot(252, 128, P.green),
    T('LIVE', 264, 124, 40, 14, { size: 9, fill: P.green, weight: 700 }),

    Line(20, 144, 350, P.border),

    // table of contents — Silencio-style indexed list
    T('CONTENTS', 20, 154, 200, 14, { size: 8.5, fill: P.muted, ls: 2.5 }),

    ...['01  Overview', '02  Authentication Flow', '03  Endpoints', '04  Error Codes', '05  Rate Limits'].map((item, i) =>
      F(20, 172 + i * 28, 350, 24, i === 2 ? P.surface3 : P.bg, { r: 5, ch: [
        T(item, 12, 4, 270, 16, { size: 12, weight: i === 2 ? 700 : 400, fill: i === 2 ? P.fg : P.muted }),
        i === 2 ? T('›', 332, 4, 14, 16, { size: 12, fill: P.accent }) : null,
      ].filter(Boolean) })
    ),

    Line(20, 314, 350, P.border),

    // document body section — "03 ENDPOINTS"
    T('03', 20, 324, 40, 26, { size: 22, weight: 900, fill: P.accent, opacity: 0.4 }),
    T('ENDPOINTS', 56, 328, 200, 20, { size: 14, weight: 800, fill: P.fg, ls: 1.5 }),

    T('Base URL: api.codex-internal.dev/v3', 20, 356, 350, 16, { size: 11, fill: P.muted }),

    // Endpoint card (code block aesthetic)
    F(20, 376, 350, 68, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      // method badge
      F(12, 14, 44, 18, P.green + '22', { r: 4, stroke: P.green + '44', sw: 1, ch: [
        T('POST', 6, 3, 32, 12, { size: 9, fill: P.green, weight: 700, ls: 0.5 }),
      ]}),
      T('/auth/token', 66, 14, 200, 18, { size: 12, weight: 600, fill: P.fg }),
      T('Exchange credentials for JWT', 12, 40, 300, 14, { size: 10, fill: P.muted }),
      T('›', 326, 20, 14, 20, { size: 12, fill: P.muted }),
    ]}),

    F(20, 452, 350, 68, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      F(12, 14, 40, 18, P.blue + '22', { r: 4, stroke: P.blue + '44', sw: 1, ch: [
        T('GET', 8, 3, 24, 12, { size: 9, fill: P.blue, weight: 700, ls: 0.5 }),
      ]}),
      T('/auth/verify', 62, 14, 200, 18, { size: 12, weight: 600, fill: P.fg }),
      T('Validate & decode a JWT token', 12, 40, 300, 14, { size: 10, fill: P.muted }),
      T('›', 326, 20, 14, 20, { size: 12, fill: P.muted }),
    ]}),

    F(20, 528, 350, 68, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      F(12, 14, 52, 18, P.red + '22', { r: 4, stroke: P.red + '44', sw: 1, ch: [
        T('DELETE', 6, 3, 40, 12, { size: 9, fill: P.red, weight: 700, ls: 0.5 }),
      ]}),
      T('/auth/revoke', 74, 14, 200, 18, { size: 12, weight: 600, fill: P.fg }),
      T('Revoke a token by JTI', 12, 40, 300, 14, { size: 10, fill: P.muted }),
      T('›', 326, 20, 14, 20, { size: 12, fill: P.muted }),
    ]}),

    // code example block
    T('REQUEST EXAMPLE', 20, 610, 200, 14, { size: 8.5, fill: P.muted, ls: 2 }),
    F(20, 628, 350, 102, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      T('curl -X POST \\', 12, 10, 320, 14, { size: 10, fill: P.fg, opacity: 0.85 }),
      T('  https://api.codex.dev/v3/auth/token \\', 12, 26, 320, 14, { size: 10, fill: P.fg, opacity: 0.7 }),
      T("  -H 'Content-Type: application/json' \\", 12, 42, 320, 14, { size: 10, fill: P.blue, opacity: 0.85 }),
      T("  -d '{\"client_id\": \"...\",", 12, 58, 320, 14, { size: 10, fill: P.amber, opacity: 0.9 }),
      T('      \"client_secret\": \"...\"}', 12, 74, 320, 14, { size: 10, fill: P.amber, opacity: 0.9 }),
      // copy button
      F(286, 8, 52, 20, P.accent + '22', { r: 4, stroke: P.accent + '44', sw: 1, ch: [
        T('COPY', 10, 4, 32, 12, { size: 8.5, fill: P.accent, weight: 700, ls: 0.5 }),
      ]}),
    ]}),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — SEARCH (Taxonomic Filtered Search)
// Silencio-inspired table/index feel with filter taxonomy sidebar
// ══════════════════════════════════════════════════════════════════════════════
function screenSearch(ox) {
  const results = [
    { ref: 'CDX-002', title: 'OAuth2 Token Rotation',    cat: 'API REF', match: 'oauth2, token, refresh' },
    { ref: 'CDX-006', title: 'JWT Security Guidelines',  cat: 'SECURITY', match: 'jwt, HS256, signing key' },
    { ref: 'CDX-001', title: 'Auth Service Architecture', cat: 'ARCH',    match: 'auth, gateway, microservice' },
    { ref: 'CDX-005', title: 'ADR-038: OAuth vs SAML',   cat: 'DECISION', match: 'oauth, saml, sso' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(200, 200, 120, P.violet2, 0.4),

    ...StatusBar(),

    T('SEARCH', 20, 44, 250, 30, { size: 24, weight: 900, fill: P.fg, ls: 4 }),

    // Search input — highlighted with accent border
    F(20, 80, 350, 44, P.surface, { r: 10, stroke: P.accent + '66', sw: 1.5, ch: [
      T('⌕', 14, 12, 20, 20, { size: 16, fill: P.accent }),
      T('auth token exchange', 38, 13, 240, 18, { size: 13, fill: P.fg }),
      F(298, 12, 42, 20, P.accent + '18', { r: 6, ch: [
        T('⌫', 12, 2, 18, 16, { size: 12, fill: P.accent }),
      ]}),
    ]}),

    // Filters row (Silencio taxonomy style)
    T('FILTER BY', 20, 136, 100, 14, { size: 8.5, fill: P.muted, ls: 2 }),
    Tag(20, 154, 'ALL TYPES', P.accent),
    Tag(100, 154, 'API', P.blue),
    Tag(134, 154, 'ARCH', P.accent),
    Tag(176, 154, 'OPS', P.green),

    T('SCOPE', 20, 182, 100, 14, { size: 8.5, fill: P.muted, ls: 2 }),
    Tag(20, 200, 'ALL DATES', P.muted),
    Tag(100, 200, 'THIS WEEK', P.violet2),

    Line(20, 226, 350, P.border),

    // Result count
    T('4 RESULTS FOR "auth"', 20, 236, 280, 14, { size: 9, fill: P.muted, ls: 1 }),
    T('0.14s', 310, 236, 60, 14, { size: 9, fill: P.muted, align: 'right' }),

    // Results
    ...results.map((r, i) =>
      F(20, 254 + i * 110, 350, 102, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        // REF + category label
        RefBadge(12, 10, r.ref),
        Tag(12 + r.ref.length * 6.8 + 22, 10, r.cat,
          r.cat === 'API REF' ? P.blue : r.cat === 'SECURITY' ? P.red : r.cat === 'ARCH' ? P.accent : P.violet2),

        // title with "search highlight" effect
        T(r.title, 12, 36, 320, 22, { size: 14, weight: 700, fill: P.fg }),

        // match keywords (highlighted in amber — phosphor style)
        T('MATCHES: ', 12, 62, 52, 14, { size: 8.5, fill: P.muted, ls: 0.5 }),
        T(r.match, 64, 62, 270, 14, { size: 8.5, fill: P.amber }),

        // arrow
        T('›', 330, 38, 14, 22, { size: 14, fill: P.muted }),

        Line(0, 88, 350, P.border),
        T('OPEN', 12, 92, 40, 10, { size: 8, fill: P.accent, weight: 700, ls: 1 }),
        T('COPY LINK', 68, 92, 60, 10, { size: 8, fill: P.muted, weight: 700, ls: 1 }),
        T('SHARE', 146, 92, 40, 10, { size: 8, fill: P.muted, weight: 700, ls: 1 }),
      ]}),
    ),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — TEAM (Contributor Knowledge Map)
// Atlas Card-inspired exclusivity + Linear precision: team activity view
// ══════════════════════════════════════════════════════════════════════════════
function screenTeam(ox) {
  const members = [
    { initials: 'KL', name: 'Kai L.',   role: 'INFRA · ARCH',   docs: 87, score: 0.94, color: P.accent,  streak: 22, active: true  },
    { initials: 'SR', name: 'Sol R.',   role: 'BACKEND · API',  docs: 64, score: 0.81, color: P.blue,    streak: 14, active: true  },
    { initials: 'MN', name: 'Maya N.',  role: 'SECURITY · AUTH', docs: 52, score: 0.76, color: P.violet2, streak: 7,  active: true  },
    { initials: 'TB', name: 'Theo B.',  role: 'OPS · INFRA',    docs: 41, score: 0.62, color: P.green,   streak: 3,  active: false },
    { initials: 'JV', name: 'Jo V.',    role: 'FRONTEND · DX',  docs: 33, score: 0.55, color: P.amber,   streak: 0,  active: false },
  ];

  const activityDays = [0.3, 0.8, 0.6, 0.9, 1.0, 0.4, 0.7, 0.5, 0.8, 0.95, 0.6, 0.3, 0.7, 0.9];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 180, 120, P.accent, 0.5),

    ...StatusBar(),

    T('TEAM', 20, 44, 200, 30, { size: 24, weight: 900, fill: P.fg, ls: 4 }),
    T('KNOWLEDGE CONTRIBUTORS', 20, 80, 280, 14, { size: 8.5, fill: P.muted, ls: 2 }),

    // vault health score bar (editorial big number)
    F(20, 100, 350, 60, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('VAULT HEALTH', 12, 10, 180, 12, { size: 8.5, fill: P.muted, ls: 1.5 }),
      T('94', 12, 24, 56, 28, { size: 26, weight: 900, fill: P.green }),
      T('/100', 60, 36, 50, 16, { size: 11, fill: P.muted }),
      T('Up-to-date & well-maintained.', 110, 10, 220, 14, { size: 10, fill: P.fg, opacity: 0.7 }),
      // mini health bar
      ...ProgBar(110, 32, 222, 0.94, P.green),
    ]}),

    // activity mini chart
    T('14-DAY ACTIVITY', 20, 172, 200, 14, { size: 8.5, fill: P.muted, ls: 2 }),
    ...activityDays.map((v, i) =>
      F(20 + i * 24, 190, 20, Math.round(40 * v), P.accent, { r: 3, opacity: 0.5 + v * 0.5 })
    ),

    Line(20, 244, 350, P.border),

    // member rows
    T('CONTRIBUTORS', 20, 254, 200, 14, { size: 8.5, fill: P.muted, ls: 2 }),

    ...members.map((m, i) =>
      F(20, 272 + i * 90, 350, 82, P.surface, { r: 12, stroke: m.active ? m.color + '22' : P.border, sw: 1, ch: [
        // avatar circle
        E(12, 16, 40, 40, m.color + '22'),
        T(m.initials, 12, 20, 40, 32, { size: 14, weight: 800, fill: m.color, align: 'center' }),
        m.active ? Dot(46, 50, P.green) : null,

        // name + role
        T(m.name, 64, 12, 170, 20, { size: 14, weight: 700, fill: P.fg }),
        T(m.role, 64, 34, 170, 14, { size: 9, fill: P.muted, ls: 0.5 }),

        // doc count
        T(String(m.docs), 264, 10, 60, 24, { size: 18, weight: 800, fill: m.color, align: 'right' }),
        T('DOCS', 264, 36, 60, 12, { size: 8, fill: P.muted, align: 'right', ls: 1 }),

        // streak badge
        m.streak > 0 ? RefBadge(64, 54, `🔥 ${m.streak}d`) : null,

        // health bar
        ...ProgBar(12, 72, 200, m.score, m.color),
        T(Math.round(m.score * 100) + '%', 220, 68, 50, 12, { size: 9, fill: m.color, align: 'right', weight: 700 }),

      ].filter(Boolean) })
    ),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'CODEX — Team Knowledge Vault',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#080810',
  children: [
    screenIndex (GAP),
    screenBrowse(GAP + (SCREEN_W + GAP)),
    screenDoc   (GAP + (SCREEN_W + GAP) * 2),
    screenSearch(GAP + (SCREEN_W + GAP) * 3),
    screenTeam  (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'codex.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ codex.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Index · Browse · Document · Search · Team');
console.log('  Palette: near-black #0C0C12 · violet #7060F0 · amber #E8A838');
