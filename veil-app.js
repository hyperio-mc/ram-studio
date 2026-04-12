'use strict';
// veil-app.js
// VEIL — Zero-Trust AI Agent Compliance Platform
//
// Design Challenge:
//   Design a dark AI-agent monitoring & compliance dashboard inspired by:
//   1. Evervault Customers page (via godly.website → evervault.com/customers)
//      — ultra-dark navy #010314, electric violet #6633EE, Roobert font,
//        full-bleed editorial sections with strong typographic hierarchy,
//        premium B2B security SaaS aesthetic
//   2. Linear (darkmodedesign.com featured) — product system UI conventions,
//      sidebar-style nav, structured grids, "system for teams and agents"
//   3. Dark Mode Design gallery (darkmodedesign.com) — current trend:
//      deep void-black/navy UIs with single electric accent color glow
//
// The trend: "AI-era serious dark SaaS with electric accent colors"
// Challenge: 5 mobile screens for an AI agent firewall / compliance product
//
// Palette: Evervault-derived
//   bg:      #010314  (deep cosmic navy, Evervault background)
//   surface: #0D0F24  (elevated surface)
//   s2:      #12142D  (card surface)
//   s3:      #181A36  (lighter card)
//   border:  #1E2048  (subtle border)
//   accent:  #6633EE  (Evervault electric violet — exact match)
//   accent2: #9B6DFF  (lighter glow violet)
//   fg:      #DFE1F4  (Evervault lavender-white — exact match)
//   muted:   #8B8DB8  (muted lavender)
//   dim:     #3B3D68  (very dim)
//   success: #22D3A0  (emerald green)
//   warn:    #F59E0B  (amber)
//   danger:  #F43F5E  (rose red)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#010314',
  surface: '#0D0F24',
  s2:      '#12142D',
  s3:      '#181A36',
  border:  '#1E2048',
  border2: '#2A2C5A',
  accent:  '#6633EE',
  accent2: '#9B6DFF',
  fg:      '#DFE1F4',
  muted:   '#8B8DB8',
  dim:     '#3B3D68',
  success: '#22D3A0',
  warn:    '#F59E0B',
  danger:  '#F43F5E',
};

let _id = 0;
const uid = () => `vl${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r  } : {}),
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
  ...(opts.ls  !== undefined ? { letterSpacing:  opts.ls  } : {}),
  ...(opts.lh  !== undefined ? { lineHeight:     opts.lh  } : {}),
  ...(opts.opacity !== undefined ? { opacity:    opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Glow layers (Evervault style — soft radial aura) ──────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r * 2.8, cy - r * 2.8, r * 5.6, r * 5.6, color + '05'),
  E(cx - r * 1.8, cy - r * 1.8, r * 3.6, r * 3.6, color + '0A'),
  E(cx - r,       cy - r,       r * 2,   r * 2,   color + '16'),
  E(cx - r * 0.5, cy - r * 0.5, r,       r,       color + '24'),
];

// ── Pill tag ──────────────────────────────────────────────────────────────────
const Pill = (x, y, text, color, bgOpacity = '22') =>
  F(x, y, text.length * 7 + 20, 22, color + bgOpacity, { r: 11, ch: [
    T(text, 0, 4, text.length * 7 + 20, 14, { size: 9, fill: color, weight: 700, ls: 0.8, align: 'center' }),
  ]});

// ── Risk score ring ───────────────────────────────────────────────────────────
const RiskRing = (cx, cy, score, color) => {
  const rings = [];
  const sizes = [56, 44, 34];
  sizes.forEach((r, i) => {
    rings.push(E(cx - r, cy - r, r * 2, r * 2, 'transparent', {
      stroke: color, sw: i === 0 ? 1 : 0.5,
      opacity: [0.15, 0.25, 0.4][i],
    }));
  });
  rings.push(T(String(score), cx - 20, cy - 18, 40, 36, {
    size: 28, weight: 800, fill: color, align: 'center',
  }));
  rings.push(T('RISK', cx - 16, cy + 18, 32, 12, {
    size: 8, fill: color, align: 'center', ls: 1.5, weight: 700, opacity: 0.7,
  }));
  return rings;
};

// ── Agent status dot ──────────────────────────────────────────────────────────
const AgentDot = (x, y, status) => {
  const color = status === 'active' ? P.success : status === 'warning' ? P.warn : status === 'blocked' ? P.danger : P.muted;
  return [
    E(x - 4, y - 4, 12, 12, color, { opacity: 0.2 }),
    E(x, y, 6, 6, color),
  ];
};

// ── Spark bar chart ───────────────────────────────────────────────────────────
const SparkBars = (x, y, w, h, values, color) => {
  const barW = Math.floor((w - (values.length - 1) * 2) / values.length);
  const max = Math.max(...values);
  return values.map((v, i) => {
    const bh = Math.round((v / max) * h);
    return F(x + i * (barW + 2), y + (h - bh), barW, bh, color, { r: 1, opacity: 0.6 + (i / values.length) * 0.4 });
  });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = (ox) => [
  T('9:41', ox + 20, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('●●●●', ox + 310, 14, 60, 16, { size: 8, fill: P.muted }),
];

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) =>
  F(0, 762, 390, 82, P.surface, { ch: [
    Line(0, 0, 390, P.border),
    ...[
      ['⬡', 'Command'],
      ['⬢', 'Agents'],
      ['◈', 'Vault'],
      ['⊙', 'Alerts'],
      ['⊞', 'Policy'],
    ].map(([ic, lb], j) => {
      const nx = 8 + j * 75;
      const isActive = j === active;
      return [
        isActive ? F(nx + 16, 8, 44, 44, P.accent + '1A', { r: 22 }) : null,
        T(ic, nx + 18, 14, 40, 22, {
          size: 17, fill: isActive ? P.accent2 : P.dim, align: 'center',
        }),
        T(lb, nx + 2, 38, 72, 14, {
          size: 8, fill: isActive ? P.accent2 : P.dim, weight: isActive ? 700 : 400,
          align: 'center', ls: 0.3,
        }),
      ].filter(Boolean);
    }).flat(),
  ]});

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Command Center (Overview Dashboard)
// ══════════════════════════════════════════════════════════════════════════════
function screenCommand(ox) {
  const agents = [
    { name: 'data-sync-v2',    status: 'active',  calls: '2.4K', risk: 12, color: P.success },
    { name: 'invoice-bot',     status: 'warning', calls: '847',  risk: 67, color: P.warn    },
    { name: 'email-router',    status: 'active',  calls: '5.1K', risk: 24, color: P.success },
    { name: 'db-analyzer',     status: 'blocked', calls: '192',  risk: 94, color: P.danger  },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient violet glow (Evervault style)
    ...Glow(195, 140, 120, P.accent),

    // fine grid pattern overlay
    ...[0,1,2,3,4].map(row => Line(0, row * 160, 390, P.border + '30')),
    ...[0,1,2,3].map(col => VLine(col * 98, 0, 844, P.border + '18')),

    // status bar
    ...StatusBar(0),

    // header
    T('VEIL', 20, 44, 200, 36, { size: 28, weight: 900, fill: P.fg, ls: -0.5 }),
    T('AI COMPLIANCE', 20, 80, 200, 14, { size: 10, fill: P.accent2, weight: 700, ls: 2 }),
    F(20, 80, 10, 10, P.accent, { r: 5 }),

    // compliance score — big editorial number (Evervault H1 treatment)
    F(20, 106, 350, 110, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      T('COMPLIANCE SCORE', 16, 14, 240, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
      T('94', 16, 28, 100, 64, { size: 56, weight: 900, fill: P.accent2, ls: -2 }),
      T('%', 104, 52, 30, 32, { size: 22, fill: P.dim }),
      T('↑ 3 pts this week', 136, 28, 200, 16, { size: 11, fill: P.success }),
      T('4 agents monitored · 1 blocked', 136, 48, 200, 14, { size: 10, fill: P.muted }),
      T('Last scan: 2 min ago', 136, 66, 200, 12, { size: 9, fill: P.dim }),
      // score track
      F(16, 90, 318, 4, P.border2, { r: 2 }),
      F(16, 90, Math.round(318 * 0.94), 4, P.accent2, { r: 2, opacity: 0.8 }),
    ]}),

    // threat overview strip — 3 metric tiles
    ...[
      { label: 'VIOLATIONS', val: '3',   sub: 'last 24h', color: P.danger  },
      { label: 'API CALLS',  val: '8.5K', sub: 'today',   color: P.accent2 },
      { label: 'DATA SCANS', val: '127',  sub: 'running',  color: P.success },
    ].map(({ label, val, sub, color }, i) =>
      F(20 + i * 118, 230, 108, 74, P.s2, { r: 12, stroke: P.border, sw: 1, ch: [
        T(label, 10, 10, 88, 10, { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
        T(val, 10, 24, 88, 30, { size: 24, weight: 800, fill: color }),
        T(sub, 10, 56, 88, 12, { size: 9, fill: P.muted }),
      ]})
    ),

    // active agents list
    T('ACTIVE AGENTS', 20, 316, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    T('4 of 4 running', 262, 316, 108, 12, { size: 9, fill: P.accent2, align: 'right' }),

    ...agents.map((ag, i) =>
      F(20, 334 + i * 76, 350, 66, P.surface, { r: 14, stroke: i === 3 ? P.danger + '44' : P.border, sw: 1, ch: [
        // agent dot
        ...AgentDot(22, 22, ag.status),
        T(ag.name, 36, 14, 180, 16, { size: 13, fill: ag.status === 'blocked' ? P.danger : P.fg, weight: 600, ls: 0.2 }),
        T(ag.status.toUpperCase(), 36, 34, 100, 12, { size: 9, fill: ag.color, ls: 1.5, weight: 700 }),
        // risk score
        F(288, 13, 48, 40, ag.color + '15', { r: 8, ch: [
          T(String(ag.risk), 0, 6, 48, 22, { size: 18, weight: 800, fill: ag.color, align: 'center' }),
          T('risk', 0, 28, 48, 10, { size: 7, fill: ag.color, align: 'center', ls: 1, opacity: 0.7 }),
        ]}),
        // API calls badge
        T(ag.calls + ' calls', 200, 22, 80, 14, { size: 10, fill: P.muted }),
        // spark activity
        ...SparkBars(200, 36, 80, 14, [4,7,3,8,5,9,6,10,7,8], ag.color),
      ]})
    ),

    // quick action row
    ...[
      ['Run Scan', P.accent],
      ['View Policy', P.surface],
      ['Alerts', P.danger + '22'],
    ].map(([label, bg], i) =>
      F(20 + i * 118, 646, 106, 38, bg, {
        r: 10,
        stroke: i === 0 ? P.accent : i === 2 ? P.danger + '66' : P.border2,
        sw: 1,
        ch: [
          T(label, 0, 11, 106, 16, { size: 11, fill: i === 0 ? P.fg : i === 2 ? P.danger : P.fg, weight: 700, align: 'center' }),
        ],
      })
    ),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Agent Detail (Deep Dive)
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentDetail(ox) {
  const permissions = [
    { scope: 'read:user_data',       granted: true,  risk: 'medium', color: P.warn    },
    { scope: 'write:user_data',      granted: false, risk: 'high',   color: P.danger  },
    { scope: 'read:payments',        granted: true,  risk: 'high',   color: P.danger  },
    { scope: 'read:internal_docs',   granted: true,  risk: 'low',    color: P.success },
    { scope: 'exec:database_query',  granted: true,  risk: 'medium', color: P.warn    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(300, 200, 90, P.warn),

    ...StatusBar(0),

    // back + title
    T('←  Agents', 20, 44, 100, 16, { size: 13, fill: P.accent2 }),
    T('invoice-bot', 20, 68, 260, 28, { size: 22, weight: 800, fill: P.fg }),
    T('v2.1.4 · production', 20, 100, 200, 14, { size: 10, fill: P.muted }),
    Pill(234, 100, 'WARNING', P.warn),

    // risk ring + summary
    F(20, 122, 350, 120, P.surface, { r: 16, stroke: P.warn + '33', sw: 1, ch: [
      ...RiskRing(64, 60, 67, P.warn),
      VLine(134, 16, 88, P.border2),
      T('BEHAVIOR SUMMARY', 150, 14, 186, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
      T('Accessing payment data\n3× above baseline. Unusual\nafter-hours call pattern.', 150, 30, 186, 54, { size: 11, fill: P.fg, lh: 1.55 }),
      Pill(150, 90, '⚠ Anomaly Detected', P.warn),
    ]}),

    // permission matrix
    T('PERMISSIONS', 20, 254, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    T('5 scopes · 4 granted', 236, 254, 114, 12, { size: 9, fill: P.accent2, align: 'right' }),

    ...permissions.map((p, i) =>
      F(20, 272 + i * 54, 350, 46, P.s2, { r: 10, stroke: p.granted && p.risk === 'high' ? P.danger + '44' : P.border, sw: 1, ch: [
        // granted toggle-style indicator
        F(10, 13, 24, 20, p.granted ? p.color + '22' : P.border + '44', { r: 10, ch: [
          T(p.granted ? '✓' : '—', 0, 3, 24, 14, {
            size: 10, fill: p.granted ? p.color : P.dim, weight: 700, align: 'center',
          }),
        ]}),
        T(p.scope, 42, 9, 210, 14, { size: 11, fill: p.granted ? P.fg : P.dim, weight: 600, ls: 0.3 }),
        Pill(42, 28, p.risk.toUpperCase() + ' RISK', p.color),
        F(302, 13, 38, 20, p.granted ? p.color + '15' : P.surface, { r: 4, ch: [
          T(p.granted ? 'ON' : 'OFF', 0, 4, 38, 12, {
            size: 9, fill: p.granted ? p.color : P.dim, weight: 800, align: 'center', ls: 1,
          }),
        ]}),
      ]})
    ),

    // action buttons
    F(20, 556, 163, 48, P.danger + '1A', { r: 12, stroke: P.danger + '66', sw: 1, ch: [
      T('⊗  Block Agent', 0, 15, 163, 18, { size: 12, fill: P.danger, weight: 700, align: 'center' }),
    ]}),
    F(207, 556, 163, 48, P.surface, { r: 12, stroke: P.border2, sw: 1, ch: [
      T('⊙  View Logs', 0, 15, 163, 18, { size: 12, fill: P.fg, weight: 700, align: 'center' }),
    ]}),

    // recent activity footer strip
    T('RECENT CALLS (LAST 1H)', 20, 618, 250, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    ...SparkBars(20, 636, 350, 40, [3,6,4,8,5,12,7,18,14,22,9,16], P.warn),
    T('call rate ↑ 3.2× baseline', 20, 684, 250, 14, { size: 10, fill: P.warn }),
    T('peak: 14:32', 270, 684, 100, 14, { size: 10, fill: P.muted, align: 'right' }),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Data Vault (Sensitive Asset Map)
// ══════════════════════════════════════════════════════════════════════════════
function screenVault(ox) {
  const assets = [
    { name: 'users.pii',         type: 'PII',      size: '24K records', accessed: '2 agents', risk: 'high',   color: P.danger  },
    { name: 'payments.history',  type: 'FINANCIAL', size: '8.1K txns',  accessed: '1 agent',  risk: 'high',   color: P.danger  },
    { name: 'internal.docs',     type: 'INTERNAL',  size: '412 files',  accessed: '2 agents', risk: 'medium', color: P.warn    },
    { name: 'audit.logs',        type: 'SYSTEM',    size: '1.2M lines', accessed: '3 agents', risk: 'low',    color: P.success },
    { name: 'ml.training.data',  type: 'ML DATA',   size: '18 GB',      accessed: '1 agent',  risk: 'medium', color: P.warn    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(60, 300, 80, P.danger),
    ...Glow(320, 500, 60, P.accent),

    ...StatusBar(0),

    T('DATA VAULT', 20, 44, 280, 28, { size: 22, weight: 900, fill: P.fg }),
    T('SENSITIVE ASSET MAP', 20, 76, 280, 14, { size: 9, fill: P.accent2, weight: 700, ls: 2 }),

    // summary row
    ...[
      { label: 'ASSETS',   val: '5',  color: P.fg      },
      { label: 'HIGH RISK',val: '2',  color: P.danger  },
      { label: 'ACCESSED', val: '9',  color: P.warn    },
    ].map(({ label, val, color }, i) =>
      F(20 + i * 118, 102, 108, 60, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(label, 0, 10, 108, 10, { size: 7, fill: P.muted, ls: 1.5, weight: 700, align: 'center' }),
        T(val, 0, 22, 108, 28, { size: 24, weight: 900, fill: color, align: 'center' }),
      ]})
    ),

    T('ASSET REGISTER', 20, 174, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),

    ...assets.map((a, i) =>
      F(20, 192 + i * 82, 350, 72, P.surface, { r: 14, stroke: a.risk === 'high' ? a.color + '33' : P.border, sw: 1, ch: [
        // asset type icon box
        F(12, 14, 38, 44, a.color + '18', { r: 8, ch: [
          T(a.type === 'PII' ? '⊕' : a.type === 'FINANCIAL' ? '◎' : a.type === 'INTERNAL' ? '⬡' : a.type === 'ML DATA' ? '⬢' : '⊙',
            0, 8, 38, 28, { size: 20, fill: a.color, align: 'center' }),
        ]}),
        T(a.name, 60, 12, 210, 16, { size: 13, fill: P.fg, weight: 700, ls: 0.2 }),
        T(a.type + '  ·  ' + a.size, 60, 32, 210, 12, { size: 9, fill: P.muted, ls: 0.5 }),
        T(a.accessed, 60, 50, 110, 12, { size: 9, fill: P.dim }),
        Pill(290, 50, a.risk.toUpperCase(), a.color),
        // access heatmap mini
        ...SparkBars(290, 12, 50, 26, [2,5,3,7,4,6,8,5], a.color),
      ]})
    ),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Alert Feed (Real-time Anomaly Detection)
// ══════════════════════════════════════════════════════════════════════════════
function screenAlerts(ox) {
  const alerts = [
    {
      severity: 'CRITICAL',
      title: 'db-analyzer blocked',
      desc: 'Attempted read of users.pii outside approved scope. Auto-blocked.',
      time: '2 min ago',
      agent: 'db-analyzer',
      color: P.danger,
      icon: '⊗',
    },
    {
      severity: 'WARNING',
      title: 'invoice-bot rate spike',
      desc: 'Call rate 3.2× baseline. Accessing payments.history repeatedly.',
      time: '18 min ago',
      agent: 'invoice-bot',
      color: P.warn,
      icon: '⚠',
    },
    {
      severity: 'WARNING',
      title: 'Off-hours activity',
      desc: 'email-router made 47 API calls between 02:00–04:00 UTC.',
      time: '6h ago',
      agent: 'email-router',
      color: P.warn,
      icon: '◎',
    },
    {
      severity: 'INFO',
      title: 'Policy updated',
      desc: 'data-sync-v2 granted access to audit.logs per policy P-009.',
      time: '1d ago',
      agent: 'system',
      color: P.accent2,
      icon: '⊞',
    },
    {
      severity: 'RESOLVED',
      title: 'PII scan completed',
      desc: 'Scheduled scan of users.pii found no new exposures.',
      time: '2d ago',
      agent: 'system',
      color: P.success,
      icon: '✓',
    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 180, 100, P.danger),

    ...StatusBar(0),

    // header
    T('ALERTS', 20, 44, 280, 28, { size: 22, weight: 900, fill: P.fg }),
    T('ANOMALY DETECTION FEED', 20, 76, 280, 14, { size: 9, fill: P.accent2, weight: 700, ls: 2 }),

    // filter chips
    ...[
      ['All', P.accent2, true],
      ['Critical', P.danger, false],
      ['Warning', P.warn, false],
    ].map(([label, color, active], i) =>
      F(20 + i * 88, 102, 80, 26, active ? color + '22' : P.surface, {
        r: 13,
        stroke: active ? color : P.border,
        sw: 1,
        ch: [
          T(label, 0, 5, 80, 16, { size: 10, fill: active ? color : P.muted, weight: active ? 700 : 400, align: 'center' }),
        ],
      })
    ),

    Line(20, 138, 350, P.border),

    ...alerts.map((al, i) =>
      F(20, 146 + i * 108, 350, 98, al.severity === 'CRITICAL' ? P.danger + '08' : P.surface, {
        r: 14,
        stroke: al.severity === 'CRITICAL' ? P.danger + '44' : P.border,
        sw: 1,
        ch: [
          // icon
          F(12, 16, 36, 36, al.color + '1A', { r: 10, ch: [
            T(al.icon, 0, 6, 36, 24, { size: 16, fill: al.color, align: 'center' }),
          ]}),
          // severity + title
          Pill(56, 14, al.severity, al.color),
          T(al.title, 56, 38, 240, 16, { size: 13, fill: al.color === P.danger ? P.danger : P.fg, weight: 700 }),
          T(al.desc, 56, 58, 266, 28, { size: 10, fill: P.muted, lh: 1.5 }),
          // meta
          T(al.time, 56, 80, 100, 12, { size: 9, fill: P.dim }),
          T(al.agent, 220, 80, 116, 12, { size: 9, fill: P.accent2, align: 'right' }),
        ],
      })
    ),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Policy Builder (Access Rule Editor)
// ══════════════════════════════════════════════════════════════════════════════
function screenPolicy(ox) {
  const rules = [
    { id: 'P-001', name: 'PII Read Gate',      scope: 'read:user_data',    env: 'production', active: true,  color: P.warn    },
    { id: 'P-002', name: 'Payment Read Lock',  scope: 'read:payments',     env: 'all',        active: true,  color: P.danger  },
    { id: 'P-003', name: 'Internal Docs Open', scope: 'read:internal_docs',env: 'staging',    active: true,  color: P.success },
    { id: 'P-004', name: 'DB Write Block',     scope: 'write:database',    env: 'all',        active: false, color: P.danger  },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(320, 120, 80, P.accent),

    ...StatusBar(0),

    T('POLICY', 20, 44, 250, 28, { size: 22, weight: 900, fill: P.fg }),
    T('ACCESS RULE BUILDER', 20, 76, 260, 14, { size: 9, fill: P.accent2, weight: 700, ls: 2 }),

    // + new rule button
    F(272, 60, 98, 32, P.accent, { r: 10, ch: [
      T('+ New Rule', 0, 7, 98, 18, { size: 11, fill: P.fg, weight: 700, align: 'center' }),
    ]}),

    // policy summary
    F(20, 102, 350, 70, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('4 policies active', 16, 14, 200, 16, { size: 13, fill: P.fg, weight: 700 }),
      T('2 high-risk scopes gated · 1 paused', 16, 34, 290, 14, { size: 11, fill: P.muted }),
      Pill(16, 52, '✓ SOC 2 COMPLIANT', P.success),
      Pill(140, 52, '⚠ 1 REVIEW NEEDED', P.warn),
    ]}),

    T('ACTIVE POLICIES', 20, 184, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),

    ...rules.map((rule, i) =>
      F(20, 202 + i * 88, 350, 78, rule.active ? P.surface : P.bg, {
        r: 14,
        stroke: rule.active ? P.border : P.border + '44',
        sw: 1,
        opacity: rule.active ? 1 : 0.55,
        ch: [
          // rule ID badge
          F(12, 14, 44, 18, P.accent + '22', { r: 6, ch: [
            T(rule.id, 0, 3, 44, 12, { size: 8, fill: P.accent2, weight: 700, align: 'center', ls: 0.5 }),
          ]}),
          T(rule.name, 64, 12, 220, 16, { size: 13, fill: rule.active ? P.fg : P.muted, weight: 700 }),
          // scope chip
          F(12, 40, 240, 22, rule.color + '15', { r: 6, ch: [
            T(rule.scope, 8, 4, 224, 14, { size: 10, fill: rule.color, weight: 600, ls: 0.3 }),
          ]}),
          // env tag
          T(rule.env, 12, 64, 60, 10, { size: 8, fill: P.dim, ls: 0.5 }),
          // toggle
          F(302, 22, 36, 20, rule.active ? P.accent : P.border2, { r: 10, ch: [
            E(rule.active ? 18 : 2, 2, 16, 16, P.fg, { opacity: rule.active ? 1 : 0.4 }),
          ]}),
          // risk indicator
          F(302, 48, 36, 20, rule.color + '20', { r: 6, ch: [
            T(rule.id === 'P-001' || rule.id === 'P-002' ? 'HI' : rule.id === 'P-004' ? 'HI' : 'LO', 0, 4, 36, 12, {
              size: 9, fill: rule.color, weight: 800, align: 'center', ls: 0.5,
            }),
          ]}),
        ],
      })
    ),

    // compliance frameworks strip
    T('FRAMEWORKS', 20, 558, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    ...[
      ['SOC 2', P.success, '✓'],
      ['GDPR',  P.success, '✓'],
      ['HIPAA', P.warn,    '!'],
      ['ISO 27001', P.accent2, '~'],
    ].map(([label, color, ic], i) =>
      F(20 + i * 86, 576, 78, 52, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(ic, 0, 8, 78, 22, { size: 16, fill: color, align: 'center' }),
        T(label, 0, 34, 78, 12, { size: 8, fill: P.muted, align: 'center', ls: 0.5 }),
      ]})
    ),

    // save policy bar
    F(20, 644, 350, 52, P.accent, { r: 14, ch: [
      T('SAVE POLICY CHANGES', 0, 15, 350, 22, { size: 13, fill: P.fg, weight: 800, align: 'center', ls: 1.5 }),
    ]}),

    // bottom helper text
    T('Changes apply to all new agent invocations immediately', 20, 704, 350, 14, {
      size: 10, fill: P.dim, align: 'center',
    }),

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
  name:    'VEIL — Zero-Trust AI Agent Compliance Platform',
  width:   5 * SCREEN_W + 6 * GAP,
  height:  844,
  fill:    P.bg,
  children: [
    screenCommand    (GAP),
    screenAgentDetail(GAP + (SCREEN_W + GAP)),
    screenVault      (GAP + (SCREEN_W + GAP) * 2),
    screenAlerts     (GAP + (SCREEN_W + GAP) * 3),
    screenPolicy     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'veil.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ veil.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Command · Agent Detail · Data Vault · Alerts · Policy');
console.log('  Palette: cosmic navy #010314 · electric violet #6633EE · lavender #DFE1F4');
console.log('  Inspired by: Evervault.com (godly.website) + Linear (darkmodedesign.com)');
