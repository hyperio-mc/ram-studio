#!/usr/bin/env node
// CORD — Contract intelligence for creative studios
// Inspired by:
//   • Midday.ai (darkmodedesign.com) — dashboard-in-hero "agent-first" landing pattern
//     and the "agentic commerce" framing from Stripe Sessions 2026 (featured on godly.website)
//   • Locomotive.ca (godly.website) — asymmetric editorial magazine grid that breaks
//     out of the standard centered SaaS column — huge display type beside live product UI
// Theme: LIGHT (PRAXIS was dark → rotating to light)
// Novel push: editorial magazine-grid hero with full-width asymmetric column split
//             + warm parchment palette (cream/ink/slate/terracotta) — warmer than typical "white SaaS"

const fs = require('fs');

// ─── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:            '#F7F4EF',   // warm parchment
  bgAlt:         '#EDE9E2',   // slightly warmer
  surface:       '#FFFFFF',
  surfaceAlt:    '#FAF8F4',
  surfaceHover:  '#F2EFE9',
  text:          '#1C1916',   // near-black warm
  textMuted:     'rgba(28,25,22,0.45)',
  textSubtle:    'rgba(28,25,22,0.28)',
  accent:        '#2B5A8A',   // slate blue
  accent2:       '#8B4A1E',   // warm terracotta
  accentSoft:    'rgba(43,90,138,0.09)',
  accent2Soft:   'rgba(139,74,30,0.09)',
  border:        'rgba(28,25,22,0.08)',
  borderStrong:  'rgba(28,25,22,0.16)',
  borderAccent:  'rgba(43,90,138,0.22)',
  green:         '#1E7A4E',
  orange:        '#C4620A',
  red:           '#B83242',
  greenSoft:     'rgba(30,122,78,0.10)',
  orangeSoft:    'rgba(196,98,10,0.10)',
  redSoft:       'rgba(184,50,66,0.10)',
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
let _id = 0;
const uid = (pfx = 'c') => `${pfx}${++_id}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: false, children: [], ...opts };
}
function text(x, y, w, content, fontSize, fill, opts = {}) {
  return { id: uid(), type: 'text', x, y, width: w, content, fontSize, fill, ...opts };
}
function circle(x, y, r, fill, opts = {}) {
  return { id: uid(), type: 'ellipse', x, y, width: r*2, height: r*2, fill, ...opts };
}
function pill(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, cornerRadius: h/2, children: [], ...opts };
}
function card(x, y, w, h, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill: P.surface,
    clip: true, cornerRadius: opts.r || 10, borderColor: P.border, borderWidth: 1, children: [], ...opts };
}
function divider(x, y, w, fill = P.border, opts = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: 1, fill, clip: false, children: [], ...opts };
}
function statusDot(x, y, color) {
  return circle(x, y, 4, color);
}

// ─── NAV BAR ────────────────────────────────────────────────────────────────
function makeNav(W = 390) {
  const nav = rect(0, 0, W, 54, P.surface);
  nav.borderColor = P.border; nav.borderWidth = 1;
  // Logo wordmark
  nav.children.push(text(20, 17, 60, 'CORD', 15, P.text, { fontWeight: 700, letterSpacing: 0.1 }));
  // nav items (desktop-ish but compact)
  const items = ['Projects', 'Contracts', 'Time', 'Finance'];
  items.forEach((it, i) => {
    nav.children.push(text(90 + i * 66, 19, 60, it, 11, P.textMuted, { fontWeight: 500 }));
  });
  // avatar pill
  const av = pill(W - 48, 16, 28, 22, P.accentSoft);
  av.children.push(text(7, 4, 16, 'AK', 9, P.accent, { fontWeight: 700 }));
  nav.children.push(av);
  return nav;
}

// ─── SCREEN 1: OVERVIEW / EDITORIAL HERO ────────────────────────────────────
function makeScreen1() {
  const S = rect(0, 0, 390, 844, P.bg, { clip: true });

  // Warm texture orbs
  S.children.push(circle(-60, -60, 220, 'rgba(43,90,138,0.04)'));
  S.children.push(circle(250, 180, 160, 'rgba(139,74,30,0.05)'));

  S.children.push(makeNav());
  S.children.push(divider(0, 54, 390, P.border));

  // ── EDITORIAL HERO SPLIT ─────────────────────────────────────────
  // Top half: huge display type left column + mini stat cards right
  // Left: big label + headline
  S.children.push(text(20, 70, 200, 'STUDIO OPS', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.14 }));

  // Giant display number (editorial highlight, like Locomotive's stat-in-type)
  S.children.push(text(18, 84, 130, '3', 88, P.accent, { fontWeight: 800, opacity: 0.10 }));
  S.children.push(text(20, 100, 200, 'Active', 28, P.text, { fontWeight: 700 }));
  S.children.push(text(20, 132, 200, 'Contracts', 28, P.text, { fontWeight: 700 }));

  S.children.push(text(20, 166, 230, 'One place for proposals, invoices,\nand project milestones.', 12, P.textMuted, { fontWeight: 400, lineHeight: 1.55 }));

  // CTA pill
  const cta = pill(20, 200, 130, 34, P.accent);
  cta.children.push(text(12, 9, 110, 'Start free trial →', 12, '#FFFFFF', { fontWeight: 600 }));
  S.children.push(cta);

  const cta2 = pill(158, 200, 110, 34, P.accentSoft);
  cta2.children.push(text(12, 9, 90, 'See demo', 12, P.accent, { fontWeight: 600 }));
  S.children.push(cta2);

  // Right mini stat cards (magazine-grid breakout — 2 stacked)
  const sc1 = card(268, 68, 104, 62, { r: 8 });
  sc1.children.push(text(10, 10, 84, 'Revenue MTD', 9, P.textMuted, { fontWeight: 500 }));
  sc1.children.push(text(10, 24, 84, '$28,400', 17, P.text, { fontWeight: 700 }));
  sc1.children.push(text(10, 44, 84, '↑ 12% vs last mo', 9, P.green, { fontWeight: 600 }));
  S.children.push(sc1);

  const sc2 = card(268, 136, 104, 56, { r: 8 });
  sc2.children.push(text(10, 10, 84, 'Pending invoices', 9, P.textMuted, { fontWeight: 500 }));
  sc2.children.push(text(10, 24, 84, '7', 20, P.text, { fontWeight: 700 }));
  sc2.children.push(text(10, 46, 84, '$12,600 total', 9, P.textMuted, { fontWeight: 500 }));
  S.children.push(sc2);

  // Thin horizontal divider
  S.children.push(divider(20, 244, 350));

  // ── ACTIVE CONTRACTS LIST ──────────────────────────────────────────
  S.children.push(text(20, 254, 200, 'ACTIVE', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  S.children.push(text(340, 254, 40, '3/3', 9, P.textMuted, { fontWeight: 600, textAlign: 'right' }));

  const contracts = [
    { name: 'Prism Brand Identity', client: 'Prism Labs', val: '$14,200', status: 'In Progress', statusColor: P.accent, pct: 62 },
    { name: 'Annual Report Design', client: 'Stonebridge Co.', val: '$8,500', status: 'Review', statusColor: P.orange, pct: 88 },
    { name: 'Product Launch Kit', client: 'Forge Studio', val: '$5,700', status: 'Draft', statusColor: P.textSubtle, pct: 20 },
  ];

  contracts.forEach((ct, i) => {
    const cy = 272 + i * 82;
    const row = card(20, cy, 350, 72, { r: 8 });

    // Status dot
    row.children.push(statusDot(12, 24, ct.statusColor));
    // Contract name
    row.children.push(text(24, 12, 220, ct.name, 13, P.text, { fontWeight: 600 }));
    row.children.push(text(24, 30, 200, ct.client, 11, P.textMuted, { fontWeight: 400 }));

    // Value
    row.children.push(text(254, 12, 80, ct.val, 13, P.text, { fontWeight: 700, textAlign: 'right' }));

    // Status badge
    const badge = pill(252, 28, 82, 18, ct.statusColor === P.textSubtle ? P.bgAlt : `${ct.statusColor}15`);
    badge.children.push(text(8, 3, 68, ct.status, 9, ct.statusColor === P.textSubtle ? P.textMuted : ct.statusColor, { fontWeight: 600 }));
    row.children.push(badge);

    // Progress bar
    const pgBg = rect(12, 52, 320, 4, P.bgAlt, { cornerRadius: 2 });
    const pgFill = rect(0, 0, Math.round(320 * ct.pct / 100), 4, ct.statusColor === P.textSubtle ? P.textMuted : ct.statusColor, { cornerRadius: 2, opacity: ct.statusColor === P.textSubtle ? 0.35 : 0.7 });
    pgBg.children.push(pgFill);
    row.children.push(pgBg);
    row.children.push(text(335, 48, 24, `${ct.pct}%`, 9, P.textMuted, { fontWeight: 600 }));

    S.children.push(row);
  });

  // Bottom bar
  const bb = makeBottomBar(0, 0);
  bb.y = 800;
  S.children.push(bb);

  return S;
}

// ─── SCREEN 2: CONTRACTS DETAIL ─────────────────────────────────────────────
function makeScreen2() {
  const S = rect(410, 0, 390, 844, P.bg, { clip: true });

  S.children.push(circle(550, -80, 200, 'rgba(43,90,138,0.04)'));
  S.children.push(makeNav(390));
  S.children.push(divider(410, 54, 390, P.border));

  // Breadcrumb
  S.children.push(text(430, 66, 280, '← Contracts  /  Prism Brand Identity', 11, P.textMuted, { fontWeight: 500 }));

  // Contract header card
  const hdr = card(430, 84, 350, 120, { r: 10 });
  hdr.children.push(text(16, 14, 280, 'Prism Brand Identity', 18, P.text, { fontWeight: 700 }));
  hdr.children.push(text(16, 36, 200, 'Prism Labs · Brand & Identity', 12, P.textMuted));
  // value badge
  const vb = pill(16, 56, 90, 22, P.accentSoft);
  vb.children.push(text(10, 4, 74, '$14,200.00', 11, P.accent, { fontWeight: 700 }));
  hdr.children.push(vb);
  const sb = pill(110, 56, 82, 22, 'rgba(43,90,138,0.09)');
  sb.children.push(text(8, 4, 66, 'In Progress', 11, P.accent, { fontWeight: 600 }));
  hdr.children.push(sb);
  // timeline
  hdr.children.push(text(16, 86, 180, 'Mar 1 — Apr 28, 2026', 11, P.textMuted, { fontWeight: 500 }));
  hdr.children.push(text(240, 86, 100, '14 days left', 11, P.orange, { fontWeight: 600, textAlign: 'right' }));
  // progress
  const pgBg2 = rect(16, 104, 316, 5, P.bgAlt, { cornerRadius: 3 });
  pgBg2.children.push(rect(0, 0, 196, 5, P.accent, { cornerRadius: 3, opacity: 0.7 }));
  hdr.children.push(pgBg2);
  hdr.children.push(text(335, 100, 24, '62%', 9, P.textMuted, { fontWeight: 600 }));
  S.children.push(hdr);

  // Milestones
  S.children.push(text(430, 216, 200, 'MILESTONES', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));

  const milestones = [
    { name: 'Discovery & Brief', due: 'Mar 5', done: true },
    { name: 'Moodboard & Concept', due: 'Mar 14', done: true },
    { name: 'Logo Exploration', due: 'Mar 26', done: true },
    { name: 'Identity System v1', due: 'Apr 9', done: false, active: true },
    { name: 'Client Presentation', due: 'Apr 18', done: false },
    { name: 'Final Delivery', due: 'Apr 28', done: false },
  ];

  milestones.forEach((m, i) => {
    const my = 232 + i * 46;
    // connector line
    if (i < milestones.length - 1) {
      S.children.push(rect(441, my + 28, 2, 18, m.done ? P.accent : P.border, { opacity: m.done ? 0.5 : 1 }));
    }
    // dot
    const dot = circle(434, my + 14, 8, m.done ? P.accent : m.active ? P.accent : P.bgAlt, { borderColor: m.active ? P.accent : m.done ? 'transparent' : P.border, borderWidth: m.done ? 0 : 2 });
    if (m.done) {
      dot.children = [text(4, 3, 10, '✓', 8, '#FFFFFF', { fontWeight: 700 })];
    }
    S.children.push(dot);
    S.children.push(text(456, my + 8, 200, m.name, 13, m.active ? P.text : m.done ? P.textMuted : P.text, { fontWeight: m.active ? 600 : m.done ? 400 : 500 }));
    S.children.push(text(656, my + 10, 60, m.due, 10, m.active ? P.orange : P.textSubtle, { fontWeight: m.active ? 600 : 400, textAlign: 'right' }));
  });

  // Payment schedule mini card
  S.children.push(divider(430, 510, 350, P.border));
  S.children.push(text(430, 520, 200, 'PAYMENT SCHEDULE', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));

  const payments = [
    { label: 'Deposit 30%', amount: '$4,260', status: 'Paid', color: P.green },
    { label: 'Mid-project 40%', amount: '$5,680', status: 'Invoiced', color: P.orange },
    { label: 'Final 30%', amount: '$4,260', status: 'Pending', color: P.textMuted },
  ];
  payments.forEach((p, i) => {
    const py = 538 + i * 44;
    const pr = card(430, py, 350, 36, { r: 6 });
    pr.children.push(text(12, 10, 160, p.label, 12, P.text, { fontWeight: 500 }));
    pr.children.push(text(220, 10, 80, p.amount, 13, P.text, { fontWeight: 700, textAlign: 'right' }));
    const pb = pill(304, 9, 30, 18, p.color === P.green ? P.greenSoft : p.color === P.orange ? P.orangeSoft : P.bgAlt);
    pb.children.push(text(4, 3, 22, p.status, 8, p.color, { fontWeight: 600 }));
    pr.children.push(pb);
    S.children.push(pr);
  });

  const bb = makeBottomBar(410, 800);
  S.children.push(bb);
  return S;
}

// ─── SCREEN 3: TIME TRACKER ───────────────────────────────────────────────
function makeScreen3() {
  const S = rect(820, 0, 390, 844, P.bg, { clip: true });
  S.children.push(circle(940, 600, 180, 'rgba(139,74,30,0.04)'));
  S.children.push(makeNav(390));
  S.children.push(divider(820, 54, 390, P.border));

  S.children.push(text(840, 66, 200, 'TIME', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  S.children.push(text(1070, 66, 120, 'This week: 26.5h', 9, P.accent, { fontWeight: 600, textAlign: 'right' }));

  // Live timer card (editorial large number)
  const timer = card(840, 82, 350, 112, { r: 10 });
  timer.children.push(text(16, 14, 250, 'Currently tracking', 11, P.textMuted));
  timer.children.push(text(16, 30, 320, 'Identity System v1', 15, P.text, { fontWeight: 700 }));
  timer.children.push(text(16, 52, 200, 'Prism Brand Identity', 11, P.textMuted));
  // Big timer display — editorial number
  timer.children.push(text(16, 66, 160, '02:47:33', 32, P.text, { fontWeight: 800, letterSpacing: 0.02 }));
  const stopBtn = pill(248, 70, 80, 28, P.redSoft);
  stopBtn.children.push(text(14, 6, 56, '◼ Stop', 12, P.red, { fontWeight: 600 }));
  timer.children.push(stopBtn);
  S.children.push(timer);

  // Day chart (editorial: vertical bars with day labels)
  S.children.push(text(840, 206, 200, 'THIS WEEK', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));

  const days = [
    { label: 'Mon', hours: 8.5 },
    { label: 'Tue', hours: 6.0 },
    { label: 'Wed', hours: 7.5 },
    { label: 'Thu', hours: 4.5, today: true },
    { label: 'Fri', hours: 0 },
  ];
  const maxH = 9;
  const barW = 46;
  const barAreaH = 90;
  const barBaseY = 840 + 210 + barAreaH;

  days.forEach((d, i) => {
    const bx = 840 + 16 + i * (barW + 12);
    const barH = Math.round((d.hours / maxH) * barAreaH);
    const by = barBaseY - barH;

    const bg = rect(bx, 840 + 218, barW, barAreaH, P.bgAlt, { cornerRadius: 5 });
    S.children.push(bg);

    if (barH > 0) {
      const fill = rect(bx, by, barW, barH, d.today ? P.accent : P.accent, { cornerRadius: 5, opacity: d.today ? 1 : 0.4 });
      S.children.push(fill);
    }

    S.children.push(text(bx + 8, barBaseY + 6, barW, d.label, 10, d.today ? P.accent : P.textMuted, { fontWeight: d.today ? 700 : 500 }));
    if (d.hours > 0) S.children.push(text(bx + 4, barBaseY - barH - 14, barW, `${d.hours}h`, 10, P.text, { fontWeight: 600, textAlign: 'center' }));
  });

  // --- fix y coords (absolute)
  // Let me redo with simple absolute coords:
  const weekChartBg = card(840, 214, 350, 120, { r: 8, fill: P.surface });
  // bars inside
  const maxHours = 9;
  const chartH = 72;
  days.forEach((d, i) => {
    const bx = 12 + i * 62;
    const bH = Math.round((d.hours / maxHours) * chartH);
    const bBg = rect(bx, 12, 50, chartH, P.bgAlt, { cornerRadius: 4 });
    weekChartBg.children.push(bBg);
    if (bH > 0) {
      const bFill = rect(bx, 12 + chartH - bH, 50, bH, P.accent, { cornerRadius: 4, opacity: d.today ? 1 : 0.4 });
      weekChartBg.children.push(bFill);
    }
    weekChartBg.children.push(text(bx + 8, 88, 40, d.label, 9, d.today ? P.accent : P.textMuted, { fontWeight: d.today ? 700 : 400 }));
    if (d.hours > 0) weekChartBg.children.push(text(bx + 4, 12 + chartH - bH - 14, 40, `${d.hours}h`, 9, P.text, { fontWeight: 600 }));
  });
  S.children.push(weekChartBg);

  // Recent entries
  S.children.push(text(840, 346, 200, 'TODAY', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));

  const entries = [
    { task: 'Logo concept revision', proj: 'Prism Labs', dur: '1h 20m', start: '09:00' },
    { task: 'Brand guideline draft', proj: 'Prism Labs', dur: '0h 55m', start: '10:20' },
    { task: 'Stonebridge report cover', proj: 'Stonebridge Co.', dur: '0h 32m', start: '11:15' },
  ];
  entries.forEach((e, i) => {
    const ey = 362 + i * 60;
    const er = card(840, ey, 350, 50, { r: 7 });
    er.children.push(text(12, 10, 220, e.task, 13, P.text, { fontWeight: 600 }));
    er.children.push(text(12, 28, 180, `${e.proj} · ${e.start}`, 10, P.textMuted, { fontWeight: 400 }));
    const durP = pill(264, 14, 72, 20, P.accentSoft);
    durP.children.push(text(8, 3, 58, e.dur, 10, P.accent, { fontWeight: 600 }));
    er.children.push(durP);
    S.children.push(er);
  });

  // Billable summary mini card
  S.children.push(divider(840, 548, 350, P.border));
  const bSum = card(840, 558, 350, 64, { r: 8 });
  bSum.children.push(text(16, 14, 200, 'Week billable', 12, P.textMuted));
  bSum.children.push(text(16, 32, 100, '24.5h', 20, P.text, { fontWeight: 800 }));
  bSum.children.push(text(116, 36, 120, 'of 40h target', 11, P.textMuted));
  const bPct = rect(16, 54, 318, 4, P.bgAlt, { cornerRadius: 2 });
  bPct.children.push(rect(0, 0, Math.round(318 * 24.5 / 40), 4, P.accent, { cornerRadius: 2, opacity: 0.75 }));
  bSum.children.push(bPct);
  S.children.push(bSum);

  const bb = makeBottomBar(820, 800);
  S.children.push(bb);
  return S;
}

// ─── SCREEN 4: INVOICE BUILDER ───────────────────────────────────────────
function makeScreen4() {
  const S = rect(1230, 0, 390, 844, P.bg, { clip: true });
  S.children.push(circle(1430, -40, 200, 'rgba(43,90,138,0.05)'));
  S.children.push(makeNav(390));
  S.children.push(divider(1230, 54, 390, P.border));

  S.children.push(text(1250, 66, 200, 'NEW INVOICE', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));

  // Invoice preview card (warm paper feel)
  const inv = card(1250, 82, 350, 380, { r: 10, fill: '#FFFEF9' });
  // Invoice header
  inv.children.push(text(20, 20, 200, 'CORD', 14, P.text, { fontWeight: 800, letterSpacing: 0.10 }));
  inv.children.push(text(20, 36, 200, 'Akemi Kusabe · Creative Studio', 10, P.textMuted));
  // Invoice number + date
  inv.children.push(text(200, 20, 130, 'INV-2026-041', 10, P.textMuted, { textAlign: 'right', fontWeight: 600 }));
  inv.children.push(text(200, 32, 130, 'Apr 1, 2026', 10, P.textMuted, { textAlign: 'right' }));
  inv.children.push(rect(20, 54, 310, 1, P.border));
  // Bill to
  inv.children.push(text(20, 62, 80, 'BILL TO', 8, P.textSubtle, { fontWeight: 700, letterSpacing: 0.12 }));
  inv.children.push(text(20, 74, 180, 'Prism Labs', 13, P.text, { fontWeight: 700 }));
  inv.children.push(text(20, 90, 200, 'contracts@prismlabs.io', 10, P.textMuted));
  // Line items
  inv.children.push(rect(20, 112, 310, 1, P.border));
  const items = [
    { desc: 'Identity System v1', hrs: 22, rate: '$120', total: '$2,640' },
    { desc: 'Logo exploration', hrs: 18, rate: '$120', total: '$2,160' },
    { desc: 'Brand guidelines', hrs: 14, rate: '$120', total: '$1,680' },
  ];
  ['Description', 'Hrs', 'Rate', 'Total'].forEach((h, i) => {
    const xs = [20, 192, 234, 288];
    inv.children.push(text(xs[i], 118, 80, h, 8, P.textSubtle, { fontWeight: 700, letterSpacing: 0.10 }));
  });
  items.forEach((it, i) => {
    const iy = 138 + i * 32;
    inv.children.push(text(20, iy, 165, it.desc, 11, P.text, { fontWeight: 500 }));
    inv.children.push(text(190, iy, 36, `${it.hrs}`, 11, P.textMuted, { textAlign: 'right' }));
    inv.children.push(text(228, iy, 52, it.rate, 11, P.textMuted, { textAlign: 'right' }));
    inv.children.push(text(274, iy, 56, it.total, 12, P.text, { fontWeight: 700, textAlign: 'right' }));
  });
  inv.children.push(rect(20, 238, 310, 1, P.border));
  // Totals
  inv.children.push(text(20, 246, 160, 'Subtotal', 11, P.textMuted));
  inv.children.push(text(264, 246, 66, '$6,480', 12, P.text, { fontWeight: 600, textAlign: 'right' }));
  inv.children.push(text(20, 262, 160, 'Tax (0%)', 11, P.textMuted));
  inv.children.push(text(264, 262, 66, '$0.00', 12, P.textMuted, { textAlign: 'right' }));
  inv.children.push(rect(20, 278, 310, 1, P.borderStrong));
  inv.children.push(text(20, 286, 160, 'TOTAL DUE', 12, P.text, { fontWeight: 800, letterSpacing: 0.06 }));
  inv.children.push(text(240, 284, 90, '$6,480.00', 16, P.accent, { fontWeight: 800, textAlign: 'right' }));
  inv.children.push(text(20, 308, 310, 'Payment due within 14 days of receipt.', 9, P.textSubtle));
  inv.children.push(text(20, 320, 310, 'Bank transfer, Stripe, or Wise accepted.', 9, P.textSubtle));
  inv.children.push(text(20, 356, 310, 'Thank you for your continued partnership.', 10, P.textMuted, { fontWeight: 500 }));
  S.children.push(inv);

  // Action buttons
  const sendBtn = pill(1250, 474, 168, 38, P.accent);
  sendBtn.children.push(text(20, 10, 128, '✉ Send invoice', 13, '#FFFFFF', { fontWeight: 600 }));
  S.children.push(sendBtn);

  const pdfBtn = pill(1424, 474, 170, 38, P.accentSoft);
  pdfBtn.children.push(text(20, 10, 130, '↓ Download PDF', 13, P.accent, { fontWeight: 600 }));
  S.children.push(pdfBtn);

  // Payment link card
  S.children.push(text(1250, 524, 200, 'PAYMENT LINK', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  const plCard = card(1250, 540, 350, 50, { r: 8, fill: P.surfaceAlt });
  plCard.children.push(text(12, 16, 266, 'cord.app/pay/inv-2026-041', 12, P.text, { fontWeight: 500 }));
  const copyBtn = pill(274, 14, 60, 22, P.accentSoft);
  copyBtn.children.push(text(10, 3, 42, 'Copy', 11, P.accent, { fontWeight: 600 }));
  plCard.children.push(copyBtn);
  S.children.push(plCard);

  const bb = makeBottomBar(1230, 800);
  S.children.push(bb);
  return S;
}

// ─── SCREEN 5: INSIGHTS ───────────────────────────────────────────────────
function makeScreen5() {
  const S = rect(1640, 0, 390, 844, P.bg, { clip: true });
  S.children.push(circle(1780, 200, 200, 'rgba(43,90,138,0.04)'));
  S.children.push(circle(1840, 700, 160, 'rgba(139,74,30,0.04)'));
  S.children.push(makeNav(390));
  S.children.push(divider(1640, 54, 390, P.border));

  S.children.push(text(1660, 66, 200, 'INSIGHTS', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  S.children.push(text(1880, 66, 120, 'Apr 2026', 9, P.textMuted, { textAlign: 'right' }));

  // Revenue donut editorial card
  // Simulate donut with concentric arcs (circles)
  const insightTop = card(1660, 82, 350, 158, { r: 10 });
  insightTop.children.push(text(16, 14, 200, 'Revenue breakdown', 13, P.text, { fontWeight: 700 }));
  insightTop.children.push(text(16, 32, 200, 'April · $28,400 total', 11, P.textMuted));
  // Donut visual (circles)
  insightTop.children.push(circle(60, 50, 44, P.bgAlt));     // bg donut
  insightTop.children.push(circle(68, 58, 28, '#FFFEF9'));   // hole
  insightTop.children.push(text(60, 82, 80, '3 clients', 9, P.textMuted, { textAlign: 'center' }));
  // Legend
  const legends = [
    { label: 'Prism Labs', pct: '50%', color: P.accent },
    { label: 'Stonebridge Co.', pct: '30%', color: P.accent2 },
    { label: 'Forge Studio', pct: '20%', color: P.textMuted },
  ];
  legends.forEach((l, i) => {
    const lx = 152 + (i % 2) * 90;
    const ly = 50 + Math.floor(i / 2) * 28 + (i >= 2 ? -28 : 0);
    const lineY = 50 + i * 28;
    insightTop.children.push(circle(152, lineY + 6, 4, l.color));
    insightTop.children.push(text(160, lineY, 120, l.label, 10, P.text, { fontWeight: 500 }));
    insightTop.children.push(text(264, lineY, 70, l.pct, 11, P.text, { fontWeight: 700, textAlign: 'right' }));
  });
  S.children.push(insightTop);

  // Metrics row
  const metrics = [
    { label: 'Avg project', value: '$9,467', sub: '+8% vs Q1' },
    { label: 'Utilization', value: '78%', sub: 'of 40h/week' },
    { label: 'Avg payment', value: '11d', sub: 'days to pay' },
  ];
  metrics.forEach((m, i) => {
    const mx = 1660 + i * 118;
    const mc = card(mx, 252, 110, 72, { r: 8 });
    mc.children.push(text(10, 10, 90, m.label, 9, P.textMuted, { fontWeight: 500 }));
    mc.children.push(text(10, 24, 90, m.value, 18, P.text, { fontWeight: 800 }));
    mc.children.push(text(10, 46, 90, m.sub, 9, P.green, { fontWeight: 600 }));
    S.children.push(mc);
  });

  // Trend chart
  S.children.push(text(1660, 336, 200, 'MONTHLY REVENUE', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  const trendCard = card(1660, 352, 350, 140, { r: 8 });
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const vals = [18400, 14200, 21600, 19800, 24700, 28400];
  const maxV = 30000;
  const tH = 88;
  months.forEach((mo, i) => {
    const bx = 16 + i * 52;
    const bH = Math.round((vals[i] / maxV) * tH);
    const bBg = rect(bx, 14, 42, tH, P.bgAlt, { cornerRadius: 4 });
    trendCard.children.push(bBg);
    const bFill = rect(bx, 14 + tH - bH, 42, bH, i === 5 ? P.accent : P.accent, { cornerRadius: 4, opacity: i === 5 ? 0.9 : 0.35 + i * 0.08 });
    trendCard.children.push(bFill);
    trendCard.children.push(text(bx + 4, 106, 40, mo, 9, i === 5 ? P.accent : P.textMuted, { fontWeight: i === 5 ? 700 : 400 }));
    if (i === 5) {
      trendCard.children.push(text(bx - 4, 4, 52, `$${(vals[i]/1000).toFixed(1)}K`, 9, P.accent, { fontWeight: 700 }));
    }
  });
  S.children.push(trendCard);

  // Top client card
  S.children.push(text(1660, 504, 200, 'TOP CLIENTS (YTD)', 9, P.textMuted, { fontWeight: 700, letterSpacing: 0.12 }));
  const clients = [
    { name: 'Prism Labs', rev: '$42,800', projects: 3 },
    { name: 'Stonebridge Co.', rev: '$27,400', projects: 2 },
    { name: 'Forge Studio', rev: '$18,200', projects: 4 },
  ];
  clients.forEach((cl, i) => {
    const cy = 520 + i * 52;
    const cr = card(1660, cy, 350, 42, { r: 7 });
    const rank = pill(12, 12, 20, 20, i === 0 ? P.accentSoft : P.bgAlt);
    rank.children.push(text(5, 3, 12, `${i + 1}`, 10, i === 0 ? P.accent : P.textMuted, { fontWeight: 700 }));
    cr.children.push(rank);
    cr.children.push(text(38, 6, 180, cl.name, 13, P.text, { fontWeight: 600 }));
    cr.children.push(text(38, 22, 180, `${cl.projects} projects`, 10, P.textMuted, { fontWeight: 400 }));
    cr.children.push(text(260, 10, 78, cl.rev, 14, P.text, { fontWeight: 700, textAlign: 'right' }));
    S.children.push(cr);
  });

  const bb = makeBottomBar(1640, 800);
  S.children.push(bb);
  return S;
}

// ─── BOTTOM NAV BAR ──────────────────────────────────────────────────────────
function makeBottomBar(offsetX, y) {
  const bb = rect(offsetX, y, 390, 44, P.surface);
  bb.borderColor = P.border; bb.borderWidth = 1;
  const tabs = [
    { label: 'Home', icon: '⌂' },
    { label: 'Projects', icon: '◫' },
    { label: 'Time', icon: '◷' },
    { label: 'Finance', icon: '◈' },
    { label: 'Insights', icon: '◉' },
  ];
  tabs.forEach((t, i) => {
    const tx = offsetX + 16 + i * 72;
    bb.children.push(text(tx - offsetX, 6, 60, t.icon, 14, i === 0 ? P.accent : P.textMuted, { textAlign: 'center', fontWeight: i === 0 ? 700 : 400 }));
    bb.children.push(text(tx - offsetX, 22, 60, t.label, 8, i === 0 ? P.accent : P.textMuted, { textAlign: 'center', fontWeight: i === 0 ? 600 : 400 }));
  });
  return bb;
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'CORD — Contract intelligence for creative studios',
  width: 2030,
  height: 844,
  fill: P.bg,
  children: [
    makeScreen1(),
    makeScreen2(),
    makeScreen3(),
    makeScreen4(),
    makeScreen5(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/cord.pen', JSON.stringify(pen, null, 2));
console.log('✓ cord.pen written', JSON.stringify(pen).length, 'chars');
