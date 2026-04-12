'use strict';
// rift-app.js
// RIFT — AI-Native Code Review Command Center
//
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Linear.app (darkmodedesign.com) — "AI workflows at core", near-black dark,
//     single violet accent, bento feature grid, "calmer, more consistent" MAR 2026 UI refresh
//   • Lusion.co (lusion.co via godly.website) — deep space dark, immersive cinematic dark
//   • Godly.website curation — AuthKit, Amie.so — clean dark product SaaS patterns
//   • DarkModeDesign.com showcase — Forge, Superset, OWO — dark dev-tool aesthetics

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#07070F',   // deep space near-black (Linear-inspired)
  surface:    '#0E0E1C',   // elevated surface
  surface2:   '#16162A',   // higher elevation
  surface3:   '#1E1E38',   // card bg
  border:     '#1E1E36',   // subtle border
  border2:    '#2C2C4E',   // stronger border
  border3:    '#3A3A60',   // active border

  violet:     '#7B5CF5',   // electric violet — single accent
  violetHi:   '#9B82FF',   // lighter violet
  violetLo:   '#5B3FD0',   // deeper violet
  violetGlow: '#7B5CF514', // transparent glow bg

  fg:         '#E8E8F2',   // near-white with slight blue tint
  fg2:        '#6E6E9A',   // muted secondary
  fg3:        '#3C3C60',   // very muted tertiary
  fg4:        '#28284A',   // near-invisible

  green:      '#34D399',   // approved / success
  greenLo:    '#34D39914', // muted green bg
  amber:      '#FBBF24',   // needs review / warning
  amberLo:    '#FBBF2414', // muted amber bg
  red:        '#F87171',   // blocked / declined
  redLo:      '#F8717114', // muted red bg
  blue:       '#60A5FA',   // info / link
  mono:       '#94A3C0',   // monospace code color
};

let _id = 0;
const uid = () => `rft${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
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
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const R = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, opts); // alias

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = Math.max(text.length * 6.8 + 20, 38);
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 10, 3, w - 20, 14, { size: 9, fill: fg, weight: 700, ls: 0.6, align: 'center' })],
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: 1, fill: opts.stroke } } : {}),
  });
};

const Dot = (x, y, color) => E(x, y, 6, 6, color);

// ── Layout constants ──────────────────────────────────────────────────────────
const W   = 1280;
const H   = 800;
const PAD = 24;

// ── Glow orb (decorative) ─────────────────────────────────────────────────────
const GlowOrb = (x, y, r, color, opacity = 0.12) =>
  E(x - r, y - r, r * 2, r * 2, color, { opacity });

// ── Top nav bar ───────────────────────────────────────────────────────────────
function TopNav(activeLabel) {
  const navItems = ['Review', 'Dashboard', 'Agents', 'Insights', 'Settings'];
  const ch = [
    F(0, 0, W, 52, P.bg, {}),
    Line(0, 51, W, P.border),
    // Logo
    F(16, 14, 24, 24, P.violet, { r: 6,
      ch: [T('R', 6, 4, 12, 16, { size: 12, fill: '#fff', weight: 700, align: 'center' })] }),
    T('RIFT', 48, 17, 48, 18, { size: 13, fill: P.fg, weight: 700, ls: 2 }),
    Pill(108, 17, 'BETA', P.violetGlow, P.violet, { stroke: P.violet }),
  ];
  let navX = 220;
  navItems.forEach(label => {
    const isActive = label === activeLabel;
    ch.push(T(label, navX, 17, 70, 18, { size: 12, fill: isActive ? P.fg : P.fg2, weight: isActive ? 600 : 400 }));
    if (isActive) ch.push(F(navX, 47, 70, 2, P.violet, {}));
    navX += 80;
  });
  // Right side
  ch.push(
    F(W - 200, 14, 80, 24, P.surface2, { r: 12,
      ch: [
        E(8, 7, 10, 10, P.green, {}),
        T('main', 24, 5, 48, 14, { size: 11, fill: P.fg2 }),
      ] }),
    E(W - 108, 16, 20, 20, P.surface3, { stroke: P.border2, sw: 1 }),
    T('KR', W - 105, 19, 14, 12, { size: 9, fill: P.violet, weight: 700, align: 'center' }),
  );
  return F(0, 0, W, 52, 'transparent', { ch });
}

// ── Left sidebar ──────────────────────────────────────────────────────────────
function LeftSidebar(activeSection, items) {
  const SIDEBAR_W = 220;
  const ch = [
    F(0, 0, SIDEBAR_W, H - 52, P.bg, {}),
    VLine(SIDEBAR_W - 1, 0, H - 52, P.border),
  ];
  let y = 12;
  items.forEach(({ label, icon, badge, section }) => {
    if (label === '---') { ch.push(Line(12, y, SIDEBAR_W - 24, P.border)); y += 16; return; }
    const isActive = label === activeSection;
    ch.push(
      F(8, y, SIDEBAR_W - 16, 28, isActive ? P.surface2 : 'transparent', {
        r: 6,
        ch: [
          T(icon || '·', 10, 6, 16, 16, { size: 12, fill: isActive ? P.violet : P.fg3 }),
          T(label, 32, 7, SIDEBAR_W - 80, 14, { size: 11, fill: isActive ? P.fg : P.fg2, weight: isActive ? 600 : 400 }),
          ...(badge ? [Pill(SIDEBAR_W - 60, 4, badge, isActive ? P.violet : P.surface3, isActive ? '#fff' : P.fg2)] : []),
        ],
      }),
    );
    y += 32;
  });
  return F(0, 52, SIDEBAR_W, H - 52, 'transparent', { ch, clip: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — HERO LANDING
// ─────────────────────────────────────────────────────────────────────────────
function Screen1_Hero() {
  const ch = [
    // Ambient glow
    GlowOrb(W * 0.35, 350, 380, P.violet, 0.08),
    GlowOrb(W * 0.7, 200, 220, P.blue, 0.05),

    // Nav
    F(0, 0, W, 60, P.bg, {
      ch: [
        F(PAD, 16, 28, 28, P.violet, { r: 8,
          ch: [T('R', 8, 5, 12, 18, { size: 14, fill: '#fff', weight: 800, align: 'center' })] }),
        T('RIFT', 60, 20, 56, 20, { size: 14, fill: P.fg, weight: 700, ls: 2 }),
        T('Product', 200, 21, 60, 18, { size: 12, fill: P.fg2 }),
        T('Docs', 268, 21, 40, 18, { size: 12, fill: P.fg2 }),
        T('Changelog', 316, 21, 80, 18, { size: 12, fill: P.fg2 }),
        T('Pricing', 400, 21, 60, 18, { size: 12, fill: P.fg2 }),
        F(W - 200, 14, 80, 32, P.surface2, { r: 8, stroke: P.border2,
          ch: [T('Log in', 16, 8, 48, 16, { size: 12, fill: P.fg2 })] }),
        F(W - 108, 14, 92, 32, P.violet, { r: 8,
          ch: [T('Get access', 10, 8, 72, 16, { size: 12, fill: '#fff', weight: 600 })] }),
        Line(0, 59, W, P.border),
      ],
    }),

    // Badge
    F(W / 2 - 130, 100, 260, 28, P.violetGlow, { r: 14, stroke: P.violet,
      ch: [
        E(14, 11, 6, 6, P.violet, {}),
        T('Introducing RIFT Agent v2 — Now in beta', 26, 7, 220, 14, { size: 10, fill: P.violetHi, weight: 500 }),
      ] }),

    // Hero headline
    T('Every line of code,', W / 2 - 380, 152, 760, 72, {
      size: 64, weight: 300, fill: P.fg, align: 'center', ls: -1.5, lh: 1.1,
    }),
    T('reviewed by intelligence.', W / 2 - 380, 228, 760, 72, {
      size: 64, weight: 700, fill: P.fg, align: 'center', ls: -1.5, lh: 1.1,
    }),

    // Sub
    T('RIFT connects AI agents to your pull request workflow. Catch bugs,\nenforce conventions, and ship faster — without slowing your team down.',
      W / 2 - 280, 318, 560, 52, {
        size: 16, fill: P.fg2, align: 'center', lh: 1.6, weight: 400,
      }),

    // CTA row
    F(W / 2 - 160, 392, 148, 44, P.violet, { r: 10,
      ch: [T('Start free trial', 16, 13, 116, 18, { size: 13, fill: '#fff', weight: 600 })] }),
    F(W / 2 + 4, 392, 136, 44, P.surface2, { r: 10, stroke: P.border2,
      ch: [T('Watch demo →', 14, 13, 108, 18, { size: 13, fill: P.fg2, weight: 500 })] }),

    // Social proof
    T('Trusted by 1,200+ engineering teams', W / 2 - 140, 454, 280, 16, { size: 11, fill: P.fg3, align: 'center' }),

    // Feature preview card
    F(W / 2 - 440, 500, 880, 240, P.surface, { r: 16, stroke: P.border,
      ch: [
        // Code diff strip
        F(20, 20, 840, 200, P.surface2, { r: 10, stroke: P.border2,
          ch: [
            // Code lines
            ...[
              { y: 16, line: '  async function processPayment(order: Order) {', indent: 0, type: 'neutral' },
              { y: 38, line: '-   const charge = await stripe.charge(order.amount);', indent: 2, type: 'removed' },
              { y: 60, line: '+   const charge = await stripe.charge({', indent: 2, type: 'added' },
              { y: 82, line: '+     amount: order.amount,', indent: 4, type: 'added' },
              { y: 104, line: '+     idempotencyKey: order.id,  // RIFT: prevents duplicate charges', indent: 4, type: 'added' },
              { y: 126, line: '+   });', indent: 2, type: 'added' },
            ].map(({ y, line, type }) => {
              const bg = type === 'removed' ? '#F8717118' : type === 'added' ? '#34D39918' : 'transparent';
              const fg = type === 'removed' ? P.red : type === 'added' ? P.green : P.mono;
              return F(0, y, 840, 22, bg, { ch: [T(line, 16, 3, 800, 16, { size: 11, fill: fg, font: 'monospace' })] });
            }),
            // RIFT AI annotation
            F(540, 100, 280, 52, P.bg, { r: 8, stroke: P.violet,
              ch: [
                F(10, 10, 16, 16, P.violetGlow, { r: 8,
                  ch: [T('⚡', 3, 2, 10, 12, { size: 9 })] }),
                T('RIFT Agent', 32, 8, 120, 12, { size: 9, fill: P.violet, weight: 600, ls: 0.5 }),
                T('Adding idempotency key prevents\nduplicate charges on retry', 10, 26, 260, 20, { size: 9, fill: P.fg2, lh: 1.4 }),
              ] }),
          ],
        }),
      ],
    }),
  ];
  return F(0, 0, W, H, P.bg, { ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — CODE REVIEW INTERFACE
// ─────────────────────────────────────────────────────────────────────────────
function Screen2_Review() {
  const MAIN_X = 220;
  const MAIN_W = W - 220 - 300;
  const PANEL_X = W - 300;

  const sidebarItems = [
    { label: 'Review', icon: '◈', section: 'Review', badge: '3' },
    { label: 'All PRs', icon: '⊞' },
    { label: 'Assigned to me', icon: '◎', badge: '5' },
    { label: 'Waiting review', icon: '◷', badge: '12' },
    { label: '---' },
    { label: 'Drafts', icon: '◻' },
    { label: 'Merged', icon: '✓' },
    { label: 'Closed', icon: '✕' },
    { label: '---' },
    { label: 'Repositories', icon: '⬡' },
    { label: 'RIFT Agents', icon: '⬢', badge: 'AI' },
  ];

  const codeLines = [
    { ln: 1,  txt: 'import { stripe } from "@/lib/payments";',              type: 'neutral' },
    { ln: 2,  txt: 'import { Order, PaymentResult } from "@/types";',        type: 'neutral' },
    { ln: 3,  txt: '',                                                        type: 'neutral' },
    { ln: 4,  txt: 'export async function processPayment(',                  type: 'neutral' },
    { ln: 5,  txt: '  order: Order',                                         type: 'neutral' },
    { ln: 6,  txt: '): Promise<PaymentResult> {',                            type: 'neutral' },
    { ln: 7,  txt: '-  const charge = await stripe.charge(order.amount);',  type: 'removed' },
    { ln: 8,  txt: '+  const charge = await stripe.charge({',                type: 'added' },
    { ln: 9,  txt: '+    amount: order.amount,',                             type: 'added' },
    { ln: 10, txt: '+    idempotencyKey: order.id,',                        type: 'added' },
    { ln: 11, txt: '+  });',                                                  type: 'added' },
    { ln: 12, txt: '  return { chargeId: charge.id, status: "ok" };',       type: 'neutral' },
    { ln: 13, txt: '}',                                                       type: 'neutral' },
  ];

  const ch = [
    // BG
    F(0, 0, W, H, P.bg, {}),
    TopNav('Review'),
    LeftSidebar('Review', sidebarItems),

    // Diff panel header
    F(MAIN_X, 52, MAIN_W, 48, P.bg, {
      ch: [
        F(16, 12, MAIN_W - 32, 24, 'transparent', {
          ch: [
            T('feat/payment-idempotency', 0, 3, 240, 18, { size: 13, fill: P.fg, weight: 600 }),
            Pill(244, 2, 'RIFT REVIEWED', P.violetGlow, P.violet),
            Pill(320, 2, '+142  −38', P.greenLo, P.green),
          ],
        }),
        Line(0, 47, MAIN_W, P.border),
      ],
    }),

    // File header
    F(MAIN_X, 100, MAIN_W, 36, P.surface, {
      ch: [
        T('▶', 16, 11, 12, 14, { size: 10, fill: P.fg3 }),
        T('src/lib/payments/process.ts', 32, 11, 300, 14, { size: 11, fill: P.fg, font: 'monospace', weight: 500 }),
        Pill(MAIN_W - 120, 8, '+15  −7', P.greenLo, P.green),
        Line(0, 35, MAIN_W, P.border),
      ],
    }),

    // Code diff
    ...codeLines.map(({ ln, txt, type }, i) => {
      const bg = type === 'removed' ? '#F8717112' : type === 'added' ? '#34D39912' : 'transparent';
      const prefix = type === 'removed' ? '−' : type === 'added' ? '+' : ' ';
      const prefixColor = type === 'removed' ? P.red : type === 'added' ? P.green : P.fg4;
      const textColor = type === 'removed' ? '#F87171CC' : type === 'added' ? '#34D399CC' : P.mono;
      return F(MAIN_X, 136 + i * 22, MAIN_W, 22, bg, {
        ch: [
          T(String(ln), 8, 4, 24, 14, { size: 10, fill: P.fg3, align: 'right', font: 'monospace' }),
          T(prefix, 36, 4, 12, 14, { size: 10, fill: prefixColor, font: 'monospace' }),
          T(txt, 52, 4, MAIN_W - 60, 14, { size: 10, fill: textColor, font: 'monospace' }),
        ],
      });
    }),

    // RIFT AI annotation on line 10
    F(MAIN_X + 52, 348, MAIN_W - 60, 56, P.bg, { r: 8, stroke: P.violet,
      ch: [
        F(10, 10, 20, 20, P.violetGlow, { r: 10,
          ch: [T('⚡', 5, 3, 10, 14, { size: 10 })] }),
        T('RIFT Agent', 36, 8, 100, 14, { size: 10, fill: P.violet, weight: 700, ls: 0.4 }),
        T('Idempotency key prevents duplicate charges if the request is retried.', 36, 24, MAIN_W - 120, 14, { size: 10, fill: P.fg2 }),
        T('Pattern: payment-safety · Confidence 98%', 36, 38, 300, 12, { size: 9, fill: P.fg3 }),
      ],
    }),

    // Right panel — review summary
    F(PANEL_X, 52, 300, H - 52, P.surface, { stroke: P.border,
      ch: [
        F(0, 0, 300, H - 52, 'transparent', {
          ch: [
            // PR info
            F(16, 16, 268, 96, P.surface2, { r: 10, stroke: P.border2,
              ch: [
                T('feat/payment-idempotency', 12, 12, 244, 14, { size: 11, fill: P.fg, weight: 600 }),
                T('#PR-2847', 12, 28, 100, 12, { size: 9, fill: P.fg3, font: 'monospace' }),
                F(12, 44, 244, 36, 'transparent', {
                  ch: [
                    E(0, 5, 24, 24, P.surface3, { stroke: P.border2 }),
                    T('KR', 3, 7, 18, 10, { size: 9, fill: P.violet, weight: 700, align: 'center' }),
                    T('Kevin Roux  ·  2 hours ago', 28, 6, 180, 12, { size: 10, fill: P.fg2 }),
                  ],
                }),
              ],
            }),

            // RIFT summary
            T('RIFT ANALYSIS', 16, 128, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
            F(16, 144, 268, 80, P.violetGlow, { r: 8, stroke: P.border2,
              ch: [
                T('⚡ Summary', 12, 10, 180, 14, { size: 10, fill: P.violet, weight: 600 }),
                T('1 critical fix, 2 style suggestions.\nIdempotency pattern adds safety.\nTests recommended for retry path.', 12, 28, 244, 42, { size: 9, fill: P.fg2, lh: 1.5 }),
              ],
            }),

            // Checks
            T('CHECKS', 16, 240, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
            ...[
              { label: 'RIFT Agent', status: 'Passed', color: P.green },
              { label: 'CI / Build', status: 'Passing', color: P.green },
              { label: 'Coverage', status: '78% ↓', color: P.amber },
              { label: 'Security', status: 'Scanning…', color: P.fg3 },
            ].map(({ label, status, color }, i) =>
              F(16, 258 + i * 32, 268, 28, P.surface2, { r: 6,
                ch: [
                  Dot(12, 11, color),
                  T(label, 24, 7, 140, 14, { size: 11, fill: P.fg }),
                  T(status, 268 - 80, 7, 72, 14, { size: 10, fill: color, align: 'right' }),
                ],
              }),
            ),

            // Reviewers
            T('REVIEWERS', 16, 396, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
            ...[
              { name: 'Ana P.', status: 'Approved', color: P.green },
              { name: 'Marcus L.', status: 'Requested changes', color: P.amber },
              { name: 'RIFT Agent', status: 'Approved', color: P.violet },
            ].map(({ name, status, color }, i) =>
              F(16, 414 + i * 34, 268, 28, 'transparent', {
                ch: [
                  E(0, 4, 20, 20, P.surface3, { stroke: P.border2 }),
                  T(name.slice(0, 2).toUpperCase(), 3, 6, 14, 8, { size: 8, fill: color, weight: 700, align: 'center' }),
                  T(name, 26, 7, 120, 14, { size: 11, fill: P.fg }),
                  T(status, 26, 21, 160, 10, { size: 9, fill: color }),
                ],
              }),
            ),

            // Action buttons
            F(16, 544, 268, 40, P.green, { r: 8,
              ch: [T('Approve & Merge', 40, 12, 188, 16, { size: 12, fill: '#fff', weight: 600, align: 'center' })] }),
            F(16, 592, 268, 36, P.surface2, { r: 8, stroke: P.border2,
              ch: [T('Request changes', 40, 10, 188, 16, { size: 12, fill: P.fg2, align: 'center' })] }),
          ],
        }),
      ],
    }),
  ];
  return F(0, 0, W, H, P.bg, { ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — BENTO DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function Screen3_Dashboard() {
  const MAIN_X = 220;
  const MAIN_W = W - 220;

  const sidebarItems = [
    { label: 'Review', icon: '◈', badge: '3' },
    { label: 'Dashboard', icon: '⬡', section: 'Dashboard' },
    { label: 'All PRs', icon: '⊞' },
    { label: '---' },
    { label: 'Repositories', icon: '⬡' },
    { label: 'RIFT Agents', icon: '⬢', badge: 'AI' },
    { label: 'Analytics', icon: '◷' },
    { label: '---' },
    { label: 'Settings', icon: '⚙' },
  ];

  // Stat cards
  const statCard = (x, y, w, h, label, value, sub, accent) =>
    F(MAIN_X + PAD + x, 100 + y, w, h, P.surface, { r: 12, stroke: P.border,
      ch: [
        T(label, 16, 14, w - 32, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
        T(value, 16, 32, w - 32, 36, { size: 28, fill: P.fg, weight: 700 }),
        T(sub, 16, h - 28, w - 32, 14, { size: 10, fill: accent }),
        F(w - 28, h - 32, 16, 16, accent + '22', { r: 8,
          ch: [T('↑', 4, 1, 8, 14, { size: 10, fill: accent, weight: 700 })] }),
      ],
    });

  // Mini sparkline (fake)
  const Sparkline = (x, y, w, h, color) => {
    const pts = [0.4, 0.6, 0.45, 0.75, 0.6, 0.9, 0.8, 1.0];
    const bars = pts.map((v, i) => {
      const bh = Math.round(v * h);
      return F(x + i * (w / 8), y + h - bh, Math.floor(w / 8) - 2, bh, color + '44', { r: 2 });
    });
    return bars;
  };

  const ch = [
    F(0, 0, W, H, P.bg, {}),
    TopNav('Dashboard'),
    LeftSidebar('Dashboard', sidebarItems),

    // Header
    F(MAIN_X, 52, MAIN_W, 48, P.bg, {
      ch: [
        T('Team Dashboard', 24, 14, 300, 20, { size: 15, fill: P.fg, weight: 600 }),
        T('Last 30 days  ·  acme-corp / monorepo', 24, 33, 300, 12, { size: 10, fill: P.fg3 }),
        F(MAIN_W - 128, 13, 112, 28, P.surface2, { r: 6, stroke: P.border2,
          ch: [T('Last 30 days  ▾', 10, 7, 92, 14, { size: 11, fill: P.fg2 })] }),
        Line(0, 47, MAIN_W, P.border),
      ],
    }),

    // Row 1 stat cards
    statCard(0, 0, 174, 100, 'PRS MERGED', '142', '↑ 18% vs last month', P.green),
    statCard(190, 0, 174, 100, 'AVG REVIEW TIME', '1.4h', '↓ 42% faster with RIFT', P.violet),
    statCard(380, 0, 174, 100, 'BUGS CAUGHT', '67', '↑ 31% catch rate', P.amber),
    statCard(570, 0, 174, 100, 'COVERAGE', '84%', '↑ 3pts this month', P.blue),

    // RIFT Agent activity card (wide)
    F(MAIN_X + PAD + 760, 100, MAIN_W - 784, 220, P.surface, { r: 12, stroke: P.border,
      ch: [
        T('RIFT AGENT', 16, 14, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
        Pill(16, 30, 'ACTIVE', P.greenLo, P.green),
        T('247', 16, 64, 100, 36, { size: 28, fill: P.fg, weight: 700 }),
        T('reviews this month', 16, 100, 150, 12, { size: 10, fill: P.fg3 }),
        // sparkline bars inline
        ...Sparkline(16, 124, MAIN_W - 820, 52, P.violet),
      ],
    }),

    // Row 2 — PR velocity chart (large)
    F(MAIN_X + PAD, 218, 480, 200, P.surface, { r: 12, stroke: P.border,
      ch: [
        T('PR VELOCITY', 16, 14, 300, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
        T('Reviews per day', 16, 30, 300, 14, { size: 12, fill: P.fg }),
        // Fake bar chart
        ...Array.from({ length: 14 }, (_, i) => {
          const heights = [28, 44, 36, 52, 40, 68, 56, 72, 48, 60, 76, 52, 64, 80];
          const bh = heights[i];
          const isToday = i === 13;
          return F(16 + i * 32, 180 - bh, 24, bh, isToday ? P.violet : P.surface3, { r: 4 });
        }),
        // X axis
        Line(16, 182, 448, P.border),
        ...['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'T'].map((d, i) =>
          T(d, 16 + i * 32, 185, 24, 12, { size: 8, fill: P.fg3, align: 'center' }),
        ),
      ],
    }),

    // Recent PRs list
    F(MAIN_X + PAD + 496, 218, 248, 200, P.surface, { r: 12, stroke: P.border,
      ch: [
        T('RECENT MERGES', 16, 14, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
        ...[
          { title: 'feat/payment-idempotency', tag: 'RIFT ✓', color: P.violet },
          { title: 'fix/auth-token-refresh', tag: 'Approved', color: P.green },
          { title: 'refactor/query-optimizer', tag: 'Merged', color: P.fg3 },
          { title: 'chore/dependency-updates', tag: 'Auto', color: P.blue },
          { title: 'feat/export-csv-endpoint', tag: 'RIFT ✓', color: P.violet },
        ].map(({ title, tag, color }, i) =>
          F(0, 36 + i * 34, 248, 32, 'transparent', {
            ch: [
              Line(16, 0, 216),
              T(title.length > 22 ? title.slice(0, 22) + '…' : title, 16, 10, 140, 12, { size: 10, fill: P.fg }),
              Pill(178, 9, tag, color + '20', color),
            ],
          }),
        ),
      ],
    }),

    // Team members row
    F(MAIN_X + PAD + 760, 340, MAIN_W - 784, 78, P.surface, { r: 12, stroke: P.border,
      ch: [
        T('TEAM VELOCITY', 16, 12, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
        ...[
          { name: 'K.R', prs: 34, color: P.violet },
          { name: 'A.P', prs: 28, color: P.green },
          { name: 'M.L', prs: 22, color: P.blue },
          { name: 'S.K', prs: 18, color: P.amber },
        ].map(({ name, prs, color }, i) =>
          F(16 + i * 90, 30, 80, 36, P.surface2, { r: 6,
            ch: [
              T(name, 8, 5, 64, 14, { size: 11, fill: color, weight: 600 }),
              T(`${prs} PRs`, 8, 20, 64, 12, { size: 9, fill: P.fg3 }),
            ],
          }),
        ),
      ],
    }),

    // RIFT insights card
    F(MAIN_X + PAD, 432, 736, 68, P.violetGlow, { r: 12, stroke: P.border2,
      ch: [
        T('⚡', 16, 22, 20, 24, { size: 18 }),
        T('RIFT WEEKLY INSIGHT', 44, 12, 200, 12, { size: 9, fill: P.violet, weight: 700, ls: 1 }),
        T('Payment module shows 3× more retry-related bugs. RIFT recommends adding idempotency tests to CI.', 44, 28, 600, 26, { size: 10, fill: P.fg2, lh: 1.5 }),
        F(660, 18, 64, 28, P.violet, { r: 6,
          ch: [T('See plan', 8, 8, 48, 12, { size: 10, fill: '#fff', weight: 600 })] }),
      ],
    }),
  ];
  return F(0, 0, W, H, P.bg, { ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — AI AGENT PANEL
// ─────────────────────────────────────────────────────────────────────────────
function Screen4_Agent() {
  const MAIN_X = 220;
  const MAIN_W = W - 220;

  const sidebarItems = [
    { label: 'Review', icon: '◈', badge: '3' },
    { label: 'Dashboard', icon: '⬡' },
    { label: 'RIFT Agents', icon: '⬢', section: 'RIFT Agents', badge: 'AI' },
    { label: '---' },
    { label: 'Repositories', icon: '⬡' },
    { label: 'Analytics', icon: '◷' },
    { label: 'Settings', icon: '⚙' },
  ];

  const chatMessages = [
    {
      role: 'system',
      text: 'RIFT Agent connected to acme-corp/monorepo · Analyzing PR #2847',
    },
    {
      role: 'user',
      text: 'Why did you flag the payment function? Explain the idempotency issue.',
    },
    {
      role: 'agent',
      text: 'The original stripe.charge() call had no idempotency key. If the network times out mid-request, a retry would create a duplicate charge.\n\nBy adding idempotencyKey: order.id, Stripe will deduplicate requests with the same key within 24 hours — preventing double-billing on retries.',
      refs: ['Stripe docs', 'PR #2301'],
    },
    {
      role: 'user',
      text: 'Should we add a test for this?',
    },
    {
      role: 'agent',
      text: 'Yes. I\'d suggest a test that:\n1. Calls processPayment() twice with the same order ID\n2. Mocks stripe.charge() to verify it receives the same idempotencyKey\n3. Asserts the charge is only created once\n\nWant me to generate the test file?',
      refs: [],
    },
  ];

  const CH = [];
  CH.push(F(0, 0, W, H, P.bg, {}));
  CH.push(TopNav('Agents'));
  CH.push(LeftSidebar('RIFT Agents', sidebarItems));

  // Header
  CH.push(F(MAIN_X, 52, MAIN_W, 48, P.bg, {
    ch: [
      F(16, 12, 28, 28, P.violetGlow, { r: 14, stroke: P.violet,
        ch: [T('⚡', 8, 5, 12, 18, { size: 11 })] }),
      T('RIFT Agent', 52, 13, 200, 16, { size: 13, fill: P.fg, weight: 600 }),
      Pill(52, 31, 'CONNECTED · PR #2847', P.greenLo, P.green),
      F(MAIN_W - 160, 14, 48, 26, P.surface2, { r: 6, stroke: P.border2,
        ch: [T('⚙', 14, 5, 20, 16, { size: 12, fill: P.fg3 })] }),
      F(MAIN_W - 104, 14, 88, 26, P.surface2, { r: 6, stroke: P.border2,
        ch: [T('New session', 8, 6, 72, 14, { size: 11, fill: P.fg2 })] }),
      Line(0, 47, MAIN_W, P.border),
    ],
  }));

  // Left: chat panel
  const CHAT_W = MAIN_W * 0.6;
  CH.push(F(MAIN_X, 100, CHAT_W, H - 160, P.bg, { clip: true,
    ch: chatMessages.map((msg, i) => {
      const isAgent = msg.role === 'agent';
      const isSystem = msg.role === 'system';
      const yPos = i * 100 + 12;
      const bg = isSystem ? P.surface : isAgent ? P.surface : 'transparent';
      const msgW = CHAT_W - 48;
      const textColor = isSystem ? P.fg3 : P.fg;
      const lines = msg.text.split('\n');
      const textH = Math.max(lines.length * 16, 32);
      const cardH = textH + (isAgent && msg.refs?.length ? 32 : 0) + 32;
      const inner = [
        ...(isAgent ? [
          F(12, 12, 20, 20, P.violetGlow, { r: 10,
            ch: [T('⚡', 5, 3, 10, 14, { size: 9 })] }),
          T('RIFT Agent', 38, 14, 120, 12, { size: 9, fill: P.violet, weight: 600, ls: 0.4 }),
        ] : isSystem ? [
          T('● SYSTEM', 12, 12, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 0.8 }),
        ] : [
          E(12, 12, 20, 20, P.surface3, { stroke: P.border2 }),
          T('KR', 14, 15, 16, 10, { size: 8, fill: P.violet, weight: 700, align: 'center' }),
          T('You', 38, 14, 60, 12, { size: 9, fill: P.fg2, weight: 500 }),
        ]),
        T(msg.text, 12, isSystem ? 28 : 34, msgW - 24, textH,
          { size: 11, fill: textColor, lh: 1.6 }),
        ...(isAgent && msg.refs?.length ? msg.refs.map((ref, ri) =>
          Pill(12 + ri * 72, cardH - 20, ref, P.surface3, P.fg2, { stroke: P.border }),
        ) : []),
      ];
      return F(16, yPos, msgW, cardH, bg, {
        r: isSystem ? 0 : 10,
        stroke: isSystem ? undefined : P.border,
        ch: inner,
      });
    }),
  }));

  // Input bar
  CH.push(F(MAIN_X, H - 60, CHAT_W, 56, P.bg, {
    ch: [
      Line(0, 0, CHAT_W, P.border),
      F(16, 10, CHAT_W - 100, 36, P.surface2, { r: 10, stroke: P.border2,
        ch: [T('Ask RIFT a question about this PR…', 12, 10, CHAT_W - 140, 16, { size: 12, fill: P.fg3 })] }),
      F(CHAT_W - 80, 10, 64, 36, P.violet, { r: 10,
        ch: [T('Send', 12, 10, 40, 16, { size: 12, fill: '#fff', weight: 600 })] }),
    ],
  }));

  // Right: context panel
  const CTX_X = MAIN_X + CHAT_W;
  const CTX_W = MAIN_W - CHAT_W;
  CH.push(F(CTX_X, 100, CTX_W, H - 100, P.surface, { stroke: P.border,
    ch: [
      T('CONTEXT', 16, 14, 150, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
      // PR context
      F(12, 32, CTX_W - 24, 80, P.surface2, { r: 8, stroke: P.border2,
        ch: [
          T('PR #2847', 12, 10, 150, 14, { size: 11, fill: P.fg, weight: 600 }),
          T('feat/payment-idempotency', 12, 26, CTX_W - 48, 12, { size: 9, fill: P.fg3, font: 'monospace' }),
          T('+142  −38  · 5 files', 12, 42, 180, 12, { size: 9, fill: P.fg2 }),
          Pill(12, 58, 'RIFT REVIEWED', P.violetGlow, P.violet),
        ],
      }),

      // Files touched
      T('FILES IN SCOPE', 16, 126, 150, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
      ...[
        'src/lib/payments/process.ts',
        'src/lib/payments/types.ts',
        'tests/payments.test.ts',
        'package.json',
      ].map((file, i) =>
        F(12, 144 + i * 28, CTX_W - 24, 24, 'transparent', {
          ch: [
            T('📄', 8, 5, 16, 14, { size: 10 }),
            T(file.length > 22 ? '…' + file.slice(-20) : file, 28, 6, CTX_W - 52, 12, {
              size: 9, fill: P.mono, font: 'monospace',
            }),
          ],
        }),
      ),

      // Related issues
      T('RELATED ISSUES', 16, 268, 150, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }),
      ...[
        { id: '#2301', title: 'Double charge incident', color: P.red },
        { id: '#1987', title: 'Stripe retry behavior', color: P.amber },
      ].map(({ id, title, color }, i) =>
        F(12, 286 + i * 34, CTX_W - 24, 28, P.surface2, { r: 6,
          ch: [
            Pill(8, 4, id, color + '20', color),
            T(title, CTX_W - 140, 7, 120, 14, { size: 9, fill: P.fg2 }),
          ],
        }),
      ),
    ],
  }));

  return F(0, 0, W, H, P.bg, { ch: CH });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — ONBOARDING / CONNECT REPO
// ─────────────────────────────────────────────────────────────────────────────
function Screen5_Onboarding() {
  const steps = ['Create account', 'Connect repo', 'Configure agent', 'Review first PR'];

  const ch = [
    F(0, 0, W, H, P.bg, {}),
    GlowOrb(W * 0.5, H * 0.4, 400, P.violet, 0.06),

    // Progress stepper
    F(W / 2 - 400, 32, 800, 40, 'transparent', {
      ch: steps.map((step, i) => {
        const isActive = i === 1;
        const isDone   = i === 0;
        const x = i * 200;
        return F(x, 0, 200, 40, 'transparent', {
          ch: [
            // connector
            ...(i > 0 ? [F(x - 100, 14, 100, 2, isDone || isActive ? P.violet : P.border, {})] : []),
            // circle
            E(x + 100 - 14, 0, 28, 28, isDone ? P.violet : isActive ? P.violetGlow : P.surface2, {
              stroke: isDone || isActive ? P.violet : P.border2,
            }),
            T(isDone ? '✓' : String(i + 1), x + 100 - 7, 7, 14, 14, {
              size: 10, fill: isDone ? '#fff' : isActive ? P.violet : P.fg3, weight: 600, align: 'center',
            }),
            T(step, x + 60, 32, 80, 12, { size: 9, fill: isActive ? P.fg : P.fg3, align: 'center', weight: isActive ? 600 : 400 }),
          ],
        });
      }),
    }),

    // Main card
    F(W / 2 - 260, 100, 520, 440, P.surface, { r: 16, stroke: P.border,
      ch: [
        // Header
        F(0, 0, 520, 72, P.bg, { r: 16, stroke: P.border,
          ch: [
            T('Connect your repository', 32, 24, 400, 24, { size: 18, fill: P.fg, weight: 600 }),
          ],
        }),
        F(0, 72, 520, 1, P.border, {}),

        // Git provider buttons
        T('Choose your Git provider', 32, 96, 300, 16, { size: 12, fill: P.fg2 }),
        ...[
          { label: 'GitHub', icon: '⬡', active: true },
          { label: 'GitLab', icon: '⬡', active: false },
          { label: 'Bitbucket', icon: '⬡', active: false },
        ].map(({ label, icon, active }, i) =>
          F(32 + i * 148, 120, 132, 48, active ? P.violetGlow : P.surface2, {
            r: 10, stroke: active ? P.violet : P.border2,
            ch: [
              T(icon, 12, 16, 20, 16, { size: 14, fill: active ? P.violet : P.fg3 }),
              T(label, 36, 16, 80, 16, { size: 12, fill: active ? P.violet : P.fg2, weight: active ? 600 : 400 }),
            ],
          }),
        ),

        // Org selector
        T('Organization', 32, 190, 200, 14, { size: 11, fill: P.fg2, weight: 500 }),
        F(32, 210, 456, 40, P.surface2, { r: 8, stroke: P.border2,
          ch: [
            T('acme-corp', 14, 12, 380, 16, { size: 12, fill: P.fg }),
            T('▾', 432, 13, 12, 14, { size: 11, fill: P.fg3 }),
          ],
        }),

        // Repo search
        T('Repository', 32, 264, 200, 14, { size: 11, fill: P.fg2, weight: 500 }),
        F(32, 284, 456, 40, P.surface2, { r: 8, stroke: P.violet,
          ch: [
            T('⌕', 14, 12, 14, 16, { size: 12, fill: P.fg3 }),
            T('monorepo', 32, 12, 380, 16, { size: 12, fill: P.fg }),
          ],
        }),

        // Permissions
        F(32, 340, 456, 52, P.violetGlow, { r: 8, stroke: P.border2,
          ch: [
            T('🔒', 12, 16, 20, 20, { size: 14 }),
            T('RIFT only requests read access to pull requests and code.\nWrite access is never requested.', 36, 12, 400, 28, { size: 10, fill: P.fg2, lh: 1.5 }),
          ],
        }),

        // CTA
        F(32, 408, 456, 44, P.violet, { r: 10,
          ch: [T('Connect Repository →', 96, 13, 264, 18, { size: 13, fill: '#fff', weight: 600, align: 'center' })] }),
      ],
    }),
  ];
  return F(0, 0, W, H, P.bg, { ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE .pen
// ─────────────────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Hero Landing',        fn: Screen1_Hero       },
  { name: 'Code Review',         fn: Screen2_Review     },
  { name: 'Team Dashboard',      fn: Screen3_Dashboard  },
  { name: 'AI Agent Panel',      fn: Screen4_Agent      },
  { name: 'Onboarding',          fn: Screen5_Onboarding },
];

const doc = {
  version:  '2.8',
  type:     'document',
  name:     'RIFT — AI Code Review',
  children: screens.map(({ name, fn }, i) => {
    const screen = fn();
    screen.name = name;
    screen.x    = i * (W + 80);
    screen.y    = 0;
    return screen;
  }),
};

const OUT = path.join(__dirname, 'rift-app.pen');
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log(`✅ RIFT design written → ${OUT}`);
console.log(`   Screens: ${screens.length}  |  Size: ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
