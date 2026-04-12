'use strict';
// warden-app.js
// WARDEN — Developer Secrets Vault & Access Control Manager
//
// Challenge: Design a mobile secrets manager for dev teams, inspired by:
// 1. Evervault "Customers" page (godly.website) — ultra-dark cosmic #010314
//    background, glassmorphism panels rgba(17,18,35,0.75), Times+Roboto Mono
//    typography pairing, encrypted card aesthetic
// 2. Midday.ai (darkmodedesign.com) — editorial serif headings on dark, warm
//    off-white text (#DBDAD7), clean financial data density with breathing room
// 3. Superset.sh (darkmodedesign.com) — parallel agent terminal UI, developer
//    tooling going ultra-dark with monospace everything
//
// Trend: Security/DevOps SaaS abandoning bright blues for cosmic near-blacks.
// Palette: cosmic void #01030E + indigo violet #6366F1 + emerald #10B981
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#01030E',   // cosmic void (Evervault-inspired)
  surface:  '#0C0E1F',   // elevated surface
  surface2: '#111326',   // card surface
  surface3: '#181B32',   // lighter card
  border:   '#222540',   // subtle border
  border2:  '#2E325A',   // visible border
  muted:    '#525780',   // muted violet-grey
  fg:       '#E8E9F2',   // cool off-white
  fg2:      '#A8AACF',   // secondary text
  accent:   '#6366F1',   // indigo violet (primary)
  accent2:  '#10B981',   // emerald green (success)
  danger:   '#EF4444',   // red (danger/revoke)
  warn:     '#F59E0B',   // amber (warning)
  mono:     '#A78BFA',   // soft violet for code
};

let _id = 0;
const uid = () => `wd${++_id}`;

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

// ── Reusable Components ───────────────────────────────────────────────────────

// Glow corona — Evervault-style radiant halos
const Glow = (cx, cy, r, color, baseOpacity = 0.08) => [
  E(cx - r*2.4, cy - r*2.4, r*4.8, r*4.8, color, { opacity: baseOpacity * 0.4 }),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color, { opacity: baseOpacity * 0.7 }),
  E(cx - r,     cy - r,     r*2,   r*2,   color, { opacity: baseOpacity }),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color, { opacity: baseOpacity * 1.5 }),
];

// Status dot pill
const Pill = (x, y, label, color, alpha = '33') => F(x, y, label.length * 6.4 + 22, 22, color + alpha, {
  r: 11,
  ch: [
    E(8, 7, 8, 8, color),
    T(label, 22, 4, label.length * 6.4, 14, { size: 10, fill: color, weight: 600, ls: 0.3 }),
  ],
});

// Key icon (simplified lock symbol as frame art)
const KeyIcon = (x, y, color) => [
  E(x, y, 14, 14, color, { opacity: 0.2 }),
  E(x+3, y+3, 8, 8, color, { opacity: 0.5 }),
  F(x+5, y+10, 4, 7, color),
  F(x+8, y+13, 3, 3, P.surface2),
];

// Mini monospace key display
const KeyChip = (x, y, w, label, color) => F(x, y, w, 24, P.surface, {
  r: 6, stroke: color + '44', sw: 1,
  ch: [
    T(label, 8, 5, w - 16, 14, { size: 10, fill: color, weight: 500, ls: 0.5 }),
  ],
});

// Masked secret value — like ••••••••sk-1234
const MaskedKey = (x, y, prefix, suffix) => F(x, y, 350, 36, P.surface2, {
  r: 8, stroke: P.border2, sw: 1,
  ch: [
    T('••••••••••••••••', 12, 9, 200, 18, { size: 13, fill: P.muted, ls: 2 }),
    T(suffix, 220, 9, 80, 18, { size: 13, fill: P.fg2, weight: 600, ls: 0.5 }),
    F(310, 6, 30, 24, P.accent + '22', { r: 6, ch: [
      T('COPY', 4, 6, 22, 12, { size: 8, fill: P.accent, weight: 700, ls: 1 }),
    ]}),
  ],
});

// Stat card — floating glass card
const StatCard = (x, y, w, h, label, value, sub, color) => F(x, y, w, h, P.surface2, {
  r: 12, stroke: P.border, sw: 1,
  ch: [
    T(label, 14, 12, w - 28, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    T(value, 14, 28, w - 28, 32, { size: 26, fill: color, weight: 800 }),
    T(sub,   14, 62, w - 28, 12, { size: 10, fill: P.fg2 }),
  ],
});

// Bottom nav bar
const BottomNav = (activeIdx) => F(0, 764, 390, 80, P.surface, {
  ch: [
    Line(0, 0, 390, P.border2),
    ...[
      ['⬡', 'Vault', 0],
      ['◈', 'Secrets', 1],
      ['◎', 'Audit', 2],
      ['⊕', 'New', 3],
    ].map(([ic, lb, j]) => {
      const nx = 16 + j * 90;
      const isActive = j === activeIdx;
      return [
        isActive ? F(nx + 16, 6, 58, 50, P.accent + '1A', { r: 14 }) : null,
        T(ic, nx + 26, 14, 38, 22, { size: 17, fill: isActive ? P.accent : P.muted, align: 'center' }),
        T(lb, nx + 8, 38, 74, 14, { size: 9, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400, ls: 0.5 }),
      ].filter(Boolean);
    }).flat(),
  ],
});

// Top bar / header
const TopBar = (title, subtitle) => F(0, 0, 390, 64, P.bg, {
  ch: [
    T('⬡ WARDEN', 20, 14, 120, 16, { size: 12, fill: P.accent, weight: 800, ls: 2 }),
    T('🔒', 348, 14, 24, 20, { size: 16, align: 'center' }),
    Line(0, 63, 390, P.border),
  ],
});

// ── Screen 1: Vault Dashboard ─────────────────────────────────────────────────
function screenDashboard(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Background cosmic glow — top center
    ...Glow(195, 80, 120, P.accent, 0.06),
    ...Glow(320, 400, 80, P.accent2, 0.05),

    // Fine grid texture (subtle horizontal lines)
    ...[100, 200, 300, 400, 500, 600, 700].map(y =>
      Line(0, y, 390, P.border + '33')
    ),

    // Top bar
    TopBar(),

    // Hero title block
    T('YOUR VAULT', 20, 78, 260, 20, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
    T('23', 20, 98, 120, 64, { size: 56, fill: P.fg, weight: 900 }),
    T('active secrets', 100, 136, 140, 18, { size: 14, fill: P.fg2 }),
    Pill(20, 170, 'ALL HEALTHY', P.accent2),
    Pill(136, 170, '2 EXPIRING', P.warn),

    // Status cards row
    StatCard(20, 208, 108, 88, 'TOTAL KEYS', '23', 'across 4 envs', P.accent),
    StatCard(138, 208, 108, 88, 'TEAM ACCESS', '6', 'contributors', P.accent2),
    StatCard(256, 208, 114, 88, 'LAST ACCESS', '2m', 'ago by ci/cd', P.fg2),

    // Recent activity header
    T('RECENT ACTIVITY', 20, 312, 220, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    T('View all →', 290, 312, 80, 12, { size: 9, fill: P.accent, align: 'right' }),

    // Activity feed
    ...[
      { time: '2m ago',  label: 'STRIPE_SECRET_KEY', action: 'Read by', actor: 'ci-deploy',  color: P.accent2 },
      { time: '14m ago', label: 'OPENAI_API_KEY',    action: 'Rotated by', actor: 'alex.dev', color: P.accent },
      { time: '1h ago',  label: 'DB_PASSWORD_PROD',  action: 'Read by', actor: 'api-server', color: P.accent2 },
      { time: '3h ago',  label: 'SENDGRID_KEY',      action: 'Created by', actor: 'mia.ops', color: P.warn },
    ].map(({ time, label, action, actor, color }, i) =>
      F(20, 334 + i * 76, 350, 64, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
        F(12, 18, 28, 28, color + '1A', { r: 8, ch: [
          T('⬡', 6, 4, 16, 20, { size: 14, fill: color }),
        ]}),
        T(label, 50, 12, 220, 14, { size: 12, fill: P.fg, weight: 600, ls: 0.3 }),
        T(`${action} ${actor}`, 50, 30, 220, 13, { size: 11, fill: P.fg2 }),
        T(time, 298, 12, 50, 12, { size: 10, fill: P.muted, align: 'right' }),
        F(298, 34, 42, 18, color + '1A', { r: 9, ch: [
          T(i === 3 ? 'NEW' : i === 1 ? 'ROTATED' : 'READ', 4, 3, 34, 12, { size: 8, fill: color, weight: 700, ls: 0.5 }),
        ]}),
      ]})
    ),

    // Expiring soon alert
    F(20, 650, 350, 56, P.warn + '0F', { r: 12, stroke: P.warn + '44', sw: 1, ch: [
      T('⚠', 14, 16, 22, 24, { size: 20, fill: P.warn }),
      T('2 secrets expiring within 7 days', 44, 12, 250, 14, { size: 12, fill: P.warn, weight: 600 }),
      T('SENDGRID_KEY · MAILGUN_TOKEN', 44, 30, 250, 14, { size: 11, fill: P.warn, opacity: 0.7 }),
      T('Review →', 306, 18, 40, 18, { size: 11, fill: P.warn, weight: 700 }),
    ]}),

    BottomNav(0),
  ]});
}

// ── Screen 2: Secret Detail ───────────────────────────────────────────────────
function screenSecretDetail(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Cosmic glow
    ...Glow(195, 120, 100, P.accent, 0.07),

    // Grid lines
    ...[150, 300, 450, 600].map(y => Line(0, y, 390, P.border + '22')),

    // Header
    F(0, 0, 390, 64, P.bg, { ch: [
      T('← Back', 20, 22, 60, 20, { size: 13, fill: P.accent }),
      T('Secret Detail', 110, 22, 170, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
      Line(0, 63, 390, P.border),
    ]}),

    // Secret name hero
    T('STRIPE_SECRET_KEY', 20, 80, 350, 22, { size: 18, fill: P.fg, weight: 800, ls: 0.5 }),
    T('Production · Payments', 20, 106, 200, 16, { size: 12, fill: P.fg2 }),
    Pill(20, 128, 'ACTIVE', P.accent2),
    Pill(92, 128, 'PROD', P.accent),
    Pill(144, 128, 'SENSITIVE', P.danger),

    // Masked value
    T('VALUE', 20, 164, 80, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    MaskedKey(20, 180, 'sk-live-', '...4a9f'),

    // Metadata grid
    F(20, 232, 350, 92, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('CREATED', 14, 12, 80, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T('Jan 12, 2026', 14, 26, 140, 14, { size: 12, fill: P.fg }),
      T('LAST ROTATED', 104, 12, 100, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T('Mar 14, 2026', 104, 26, 140, 14, { size: 12, fill: P.fg }),
      T('EXPIRES', 200, 12, 80, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T('Apr 12, 2026', 200, 26, 140, 14, { size: 12, fill: P.warn }),
      Line(14, 50, 322, P.border),
      T('ACCESS LEVEL', 14, 60, 120, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T('Read-only for 5 services', 14, 74, 250, 14, { size: 12, fill: P.fg2 }),
    ]}),

    // Rotation history timeline
    T('ROTATION HISTORY', 20, 342, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),

    ...[
      { date: 'Mar 14, 2026', by: 'alex.dev', label: 'Manual rotation', color: P.accent },
      { date: 'Feb 01, 2026', by: 'auto-rotate', label: 'Scheduled rotation', color: P.accent2 },
      { date: 'Jan 12, 2026', by: 'mia.ops', label: 'Initial creation', color: P.fg2 },
    ].map(({ date, by, label, color }, i) =>
      F(20, 362 + i * 60, 350, 48, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        E(10, 16, 16, 16, color, { opacity: 0.3 }),
        E(14, 20, 8, 8, color),
        T(date, 36, 8, 160, 13, { size: 11, fill: P.fg, weight: 600 }),
        T(`by ${by}`, 36, 26, 160, 13, { size: 11, fill: P.fg2 }),
        F(264, 12, 74, 22, color + '1A', { r: 11, ch: [
          T(label.toUpperCase().slice(0, 8), 6, 5, 62, 12, { size: 8, fill: color, weight: 700, ls: 0.5 }),
        ]}),
      ]})
    ),

    // Action buttons
    F(20, 550, 168, 48, P.accent, { r: 12, ch: [
      T('↻  ROTATE KEY', 0, 14, 168, 20, { size: 12, fill: P.fg, weight: 700, align: 'center', ls: 1 }),
    ]}),
    F(202, 550, 168, 48, P.danger + '22', { r: 12, stroke: P.danger + '44', sw: 1, ch: [
      T('⊗  REVOKE', 0, 14, 168, 20, { size: 12, fill: P.danger, weight: 700, align: 'center', ls: 1 }),
    ]}),

    // Access list
    T('SERVICES WITH ACCESS', 20, 618, 220, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    ...[
      ['api-server', P.accent2],
      ['ci-deploy', P.accent],
      ['webhook-worker', P.fg2],
    ].map(([name, color], i) =>
      F(20, 638 + i * 36, 350, 28, P.surface2, { r: 8, ch: [
        E(14, 10, 8, 8, color),
        T(name, 30, 7, 260, 14, { size: 12, fill: P.fg }),
        T('read-only', 296, 7, 60, 14, { size: 10, fill: P.muted, align: 'right' }),
      ]})
    ),

    BottomNav(1),
  ]});
}

// ── Screen 3: Audit Log ───────────────────────────────────────────────────────
function screenAuditLog(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Subtle background glow
    ...Glow(195, 60, 90, P.mono, 0.05),

    // Header
    F(0, 0, 390, 64, P.bg, { ch: [
      T('⬡ WARDEN', 20, 14, 120, 16, { size: 12, fill: P.accent, weight: 800, ls: 2 }),
      T('🔒', 348, 14, 24, 20, { size: 16, align: 'center' }),
      Line(0, 63, 390, P.border),
    ]}),

    // Page title
    T('AUDIT LOG', 20, 80, 180, 20, { size: 16, fill: P.fg, weight: 900, ls: 2 }),
    T('All access events · Last 24h', 20, 104, 260, 14, { size: 11, fill: P.fg2 }),

    // Filter pills
    ...[
      ['ALL', true],
      ['READ', false],
      ['WRITE', false],
      ['REVOKE', false],
    ].map(([label, active], i) =>
      F(20 + i * 80, 126, 72, 26, active ? P.accent : P.surface2, {
        r: 13,
        stroke: active ? P.accent : P.border,
        sw: 1,
        ch: [T(label, 0, 6, 72, 14, { size: 10, fill: active ? P.fg : P.muted, weight: 700, align: 'center', ls: 1 })],
      })
    ),

    // Log entries — monospace terminal aesthetic
    ...[
      { time: '14:22:01', action: 'READ',   secret: 'STRIPE_SECRET_KEY', actor: 'ci-deploy',   env: 'prod', color: P.accent2 },
      { time: '14:18:44', action: 'READ',   secret: 'OPENAI_API_KEY',    actor: 'api-server',  env: 'prod', color: P.accent2 },
      { time: '13:55:10', action: 'ROTATE', secret: 'OPENAI_API_KEY',    actor: 'alex.dev',    env: 'prod', color: P.accent },
      { time: '13:30:02', action: 'READ',   secret: 'DB_PASSWORD_PROD',  actor: 'api-server',  env: 'prod', color: P.accent2 },
      { time: '12:44:18', action: 'CREATE', secret: 'SENDGRID_KEY',      actor: 'mia.ops',     env: 'prod', color: P.warn },
      { time: '11:02:55', action: 'READ',   secret: 'MAILGUN_TOKEN',     actor: 'webhook',     env: 'prod', color: P.accent2 },
      { time: '09:15:33', action: 'REVOKE', secret: 'OLD_TWILIO_KEY',    actor: 'alex.dev',    env: 'prod', color: P.danger },
    ].map(({ time, action, secret, actor, env, color }, i) =>
      F(0, 166 + i * 72, 390, 64, i % 2 === 0 ? P.surface + '80' : P.bg, {
        ch: [
          // Timestamp in mono
          T(time, 16, 12, 70, 13, { size: 10, fill: P.muted, ls: 0.3, weight: 500 }),
          // Action badge
          F(90, 10, 54, 18, color + '1A', { r: 9, ch: [
            T(action, 4, 3, 46, 12, { size: 9, fill: color, weight: 700, ls: 0.5 }),
          ]}),
          // Secret key name
          T(secret, 16, 30, 260, 14, { size: 11, fill: P.fg, weight: 700, ls: 0.3 }),
          // Actor
          T(`by ${actor}`, 16, 46, 180, 12, { size: 10, fill: P.fg2 }),
          // Env badge
          F(320, 30, 54, 18, P.surface3, { r: 9, ch: [
            T(env.toUpperCase(), 4, 3, 46, 12, { size: 9, fill: P.fg2, weight: 600, ls: 0.5 }),
          ]}),
          Line(0, 63, 390, P.border + '44'),
        ],
      })
    ),

    // Load more
    F(145, 674, 100, 36, P.surface2, { r: 18, stroke: P.border, sw: 1, ch: [
      T('Load more', 0, 10, 100, 16, { size: 12, fill: P.fg2, align: 'center' }),
    ]}),

    BottomNav(2),
  ]});
}

// ── Screen 4: New Secret ──────────────────────────────────────────────────────
function screenNewSecret(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Cosmic glow — accent2 for creation flow
    ...Glow(195, 180, 110, P.accent2, 0.06),

    // Header
    F(0, 0, 390, 64, P.bg, { ch: [
      T('← Cancel', 20, 22, 70, 20, { size: 13, fill: P.fg2 }),
      T('New Secret', 110, 22, 170, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
      T('Save', 310, 22, 60, 20, { size: 13, fill: P.accent, weight: 700, align: 'right' }),
      Line(0, 63, 390, P.border),
    ]}),

    // Step indicator
    T('STEP 1 OF 3 · DEFINE', 20, 78, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    F(20, 96, 350, 4, P.surface2, { r: 2, ch: [] }),
    F(20, 96, 116, 4, P.accent2, { r: 2, ch: [] }),

    // Key name input
    T('SECRET NAME', 20, 116, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    F(20, 132, 350, 48, P.surface2, { r: 12, stroke: P.accent + '66', sw: 1.5, ch: [
      T('SENDGRID_API_KEY', 14, 14, 322, 20, { size: 14, fill: P.fg, weight: 600, ls: 0.5 }),
    ]}),

    // Value input
    T('SECRET VALUE', 20, 196, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    F(20, 212, 350, 60, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
      T('SG.••••••••••••••••••••••', 14, 18, 300, 20, { size: 13, fill: P.fg2, ls: 1 }),
    ]}),
    // Generate button
    F(20, 280, 350, 36, P.surface3, { r: 10, ch: [
      T('⚡  Generate secure random value', 0, 10, 350, 16, { size: 12, fill: P.accent2, align: 'center' }),
    ]}),

    // Environment tags
    T('ENVIRONMENT', 20, 334, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    ...[
      ['production', P.danger, true],
      ['staging', P.warn, false],
      ['development', P.accent2, false],
    ].map(([env, color, active], i) =>
      F(20 + i * 118, 352, 110, 32, active ? color + '22' : P.surface2, {
        r: 16,
        stroke: active ? color : P.border,
        sw: 1,
        ch: [
          E(12, 11, 10, 10, color, { opacity: active ? 1 : 0.4 }),
          T(env, 26, 9, 80, 14, { size: 11, fill: active ? color : P.fg2, weight: active ? 700 : 400 }),
        ],
      })
    ),

    // Access control
    T('ACCESS CONTROL', 20, 402, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    ...[
      ['api-server', P.accent2, true],
      ['ci-deploy', P.accent, true],
      ['webhook-worker', P.fg2, false],
      ['alex.dev', P.accent, false],
    ].map(([name, color, selected], i) =>
      F(20, 420 + i * 44, 350, 36, P.surface2, { r: 10, stroke: selected ? color + '44' : P.border, sw: 1, ch: [
        F(10, 10, 16, 16, selected ? color + '22' : P.surface3, { r: 4, ch: [
          T(selected ? '✓' : '', 2, 1, 12, 14, { size: 11, fill: color }),
        ]}),
        T(name, 34, 10, 240, 16, { size: 12, fill: selected ? P.fg : P.fg2 }),
        T(selected ? 'read-only' : 'no access', 286, 10, 64, 16, { size: 10, fill: selected ? color : P.muted, align: 'right' }),
      ]})
    ),

    // Expiry toggle
    T('EXPIRY', 20, 600, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    F(20, 618, 350, 44, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('Auto-rotate in 90 days', 14, 14, 240, 16, { size: 13, fill: P.fg }),
      F(298, 12, 38, 20, P.accent, { r: 10, ch: [
        E(20, 2, 16, 16, P.fg),
      ]}),
    ]}),

    // Save button
    F(20, 682, 350, 52, P.accent2, { r: 14, ch: [
      T('SAVE SECRET', 0, 15, 350, 22, { size: 14, fill: P.bg, weight: 800, align: 'center', ls: 2 }),
    ]}),

    BottomNav(3),
  ]});
}

// ── Screen 5: Breach Alert / Emergency Revoke ─────────────────────────────────
function screenBreachAlert(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Danger glows — pulsing red corona
    ...Glow(195, 200, 140, P.danger, 0.08),
    ...Glow(195, 200, 80, P.danger, 0.12),

    // Fine scan lines
    ...[80, 160, 240, 320, 400, 480, 560, 640].map(y =>
      Line(0, y, 390, P.danger + '08')
    ),

    // Status bar — red alert
    F(0, 0, 390, 56, P.danger + '1A', { ch: [
      T('🚨  SECURITY ALERT  🚨', 0, 16, 390, 24, { size: 13, fill: P.danger, weight: 800, align: 'center', ls: 2 }),
      Line(0, 55, 390, P.danger + '44'),
    ]}),

    // Alert icon
    E(155, 76, 80, 80, P.danger, { opacity: 0.1 }),
    E(167, 88, 56, 56, P.danger, { opacity: 0.2 }),
    T('⊗', 174, 90, 42, 50, { size: 40, fill: P.danger, align: 'center' }),

    // Alert title
    T('BREACH DETECTED', 20, 172, 350, 30, { size: 22, fill: P.danger, weight: 900, align: 'center', ls: 1 }),
    T('Unauthorized access from unknown IP', 20, 206, 350, 18, { size: 13, fill: P.fg2, align: 'center' }),
    T('185.220.101.47  ·  Tor exit node  ·  2 min ago', 20, 228, 350, 14, { size: 11, fill: P.muted, align: 'center', ls: 0.5 }),

    // Affected secrets
    T('AFFECTED SECRETS', 20, 264, 350, 12, { size: 9, fill: P.danger, ls: 2, weight: 700, align: 'center' }),

    ...[
      ['STRIPE_SECRET_KEY', 'Read · 3×', P.danger],
      ['OPENAI_API_KEY', 'Read · 1×', P.danger],
    ].map(([name, detail, color], i) =>
      F(20, 284 + i * 52, 350, 44, P.danger + '0D', { r: 10, stroke: P.danger + '44', sw: 1, ch: [
        T('⚠', 14, 12, 22, 20, { size: 18, fill: color }),
        T(name, 42, 10, 210, 14, { size: 12, fill: P.fg, weight: 700, ls: 0.3 }),
        T(detail, 42, 28, 210, 12, { size: 10, fill: P.danger }),
        Pill(278, 12, 'EXPOSED', color),
      ]})
    ),

    // Response actions
    T('IMMEDIATE ACTIONS', 20, 406, 350, 12, { size: 9, fill: P.muted, ls: 2, weight: 700, align: 'center' }),

    // Revoke all button — large, urgent
    F(20, 426, 350, 60, P.danger, { r: 14, ch: [
      T('⊗  REVOKE ALL EXPOSED KEYS', 0, 18, 350, 24, { size: 14, fill: P.fg, weight: 800, align: 'center', ls: 1 }),
    ]}),

    F(20, 498, 168, 48, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
      T('Block IP Range', 0, 14, 168, 20, { size: 12, fill: P.fg2, weight: 600, align: 'center' }),
    ]}),
    F(202, 498, 168, 48, P.warn + '22', { r: 12, stroke: P.warn + '44', sw: 1, ch: [
      T('⚡ Notify Team', 0, 14, 168, 20, { size: 12, fill: P.warn, weight: 600, align: 'center' }),
    ]}),

    // Timeline of breach
    T('BREACH TIMELINE', 20, 566, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),

    ...[
      ['14:31:02', 'First read attempt', P.warn],
      ['14:31:08', 'STRIPE_SECRET_KEY accessed', P.danger],
      ['14:31:14', 'OPENAI_API_KEY accessed', P.danger],
      ['14:33:01', 'Alert triggered', P.fg2],
    ].map(([t, ev, color], i) =>
      F(20, 586 + i * 36, 350, 28, P.surface, { r: 8, ch: [
        T(t, 12, 7, 68, 14, { size: 10, fill: P.muted, ls: 0.3 }),
        E(88, 11, 8, 8, color),
        T(ev, 102, 7, 240, 14, { size: 11, fill: color }),
      ]})
    ),

    // Dismiss / false alarm
    T('Mark as false alarm', 130, 740, 130, 14, { size: 12, fill: P.muted, align: 'center' }),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'WARDEN — Developer Secrets Vault',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#01030E',
  children: [
    screenDashboard   (GAP),
    screenSecretDetail(GAP + (SCREEN_W + GAP)),
    screenAuditLog    (GAP + (SCREEN_W + GAP) * 2),
    screenNewSecret   (GAP + (SCREEN_W + GAP) * 3),
    screenBreachAlert (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'warden.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ warden.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Dashboard · Secret Detail · Audit Log · New Secret · Breach Alert');
console.log('  Palette: cosmic void #01030E · indigo #6366F1 · emerald #10B981 · danger #EF4444');
