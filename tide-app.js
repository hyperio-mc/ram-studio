#!/usr/bin/env node
// tide-app.js — TIDE: Personal Finance Clarity
// Inspired by: "Fluid Glass" by Exo Ape (Awwwards SOTD 7.77/10) — frosted glass card layering
//              + Atlas Card (godly.website) — premium financial product light aesthetic
//              + Robinhood Market (minimal.gallery) — clean financial dashboard typography
// LIGHT THEME (Lumen was dark — rotating to light)
// Design: warm cream bg, frosted glass cards, large typographic numbers, forest green + amber

const fs = require('fs');
const path = require('path');

const SLUG = 'tide';
const APP_NAME = 'Tide';
const TAGLINE = 'Your money, in motion';
const ARCHETYPE = 'finance-clarity';
const W = 390, H = 844;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:        '#F4F0E8',
  bgDeep:    '#EDE7D9',
  glass:     'rgba(255,255,255,0.72)',
  glassHi:   'rgba(255,255,255,0.90)',
  text:      '#1C1A18',
  textSub:   '#7A7268',
  accent:    '#2A5F4A',
  accentLt:  '#EBF4F0',
  amber:     '#E8893A',
  amberLt:   '#FEF3E8',
  green:     '#27AE74',
  red:       '#E05454',
  blue:      '#5B8FD6',
  purple:    '#B15CC6',
  div:       'rgba(28,26,24,0.07)',
  shadow:    'rgba(28,26,24,0.08)',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function el(type, props = {}) {
  return { type, version: '2.8', ...props };
}
function rect(x, y, w, h, style = {}) {
  return el('rect', { x, y, width: w, height: h, style });
}
function rRect(x, y, w, h, r, style = {}) {
  return el('rect', { x, y, width: w, height: h, rx: r, ry: r, style });
}
function txt(content, x, y, style = {}) {
  return el('text', { content, x, y, style });
}
function circ(cx, cy, r, style = {}) {
  return el('ellipse', { x: cx - r, y: cy - r, width: r * 2, height: r * 2, style });
}
function pathEl(d, style = {}) {
  return el('path', { d, style });
}

function SF(size, weight, color, extra = {}) {
  return { fontSize: size, fontWeight: weight, fill: color, fontFamily: "SF Pro Display, -apple-system, Helvetica Neue, sans-serif", ...extra };
}

// ── Shared UI ─────────────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(txt('9:41', 20, 18, SF(15, '600', C.text)));
  els.push(txt('●●●  ▲  ▓▓', W - 78, 18, { fontSize: 10, fill: C.text, opacity: '0.45', fontFamily: 'monospace' }));
}

function glass(els, x, y, w, h, r = 20) {
  els.push(rRect(x + 2, y + 5, w, h, r, { fill: C.shadow }));
  els.push(rRect(x, y, w, h, r, { fill: C.glass }));
  els.push(rRect(x + 1, y + 1, w - 2, (h / 2) - 1, r, { fill: C.glassHi, opacity: '0.55' }));
}

function navBar(els, active) {
  const tabs = [
    { id: 'home',    icon: '⌂', label: 'Home'   },
    { id: 'flow',    icon: '◎', label: 'Flow'   },
    { id: 'goals',   icon: '◈', label: 'Goals'  },
    { id: 'history', icon: '≡', label: 'History'},
    { id: 'pulse',   icon: '✦', label: 'Pulse'  },
  ];
  els.push(rRect(0, H - 88, W, 88, 0, { fill: C.glass }));
  els.push(rect(0, H - 88, W, 1, { fill: C.div }));
  tabs.forEach((t, i) => {
    const tx = Math.round((W / tabs.length) * i + (W / tabs.length) / 2);
    const isAct = t.id === active;
    if (isAct) {
      els.push(rRect(tx - 28, H - 80, 56, 30, 15, { fill: C.accent }));
      els.push(txt(t.icon, tx, H - 61, { ...SF(13, '700', '#fff'), textAnchor: 'middle' }));
    } else {
      els.push(txt(t.icon, tx, H - 61, { ...SF(13, '400', C.textSub), textAnchor: 'middle' }));
    }
    els.push(txt(t.label, tx, H - 44, {
      ...SF(9, isAct ? '600' : '400', isAct ? C.accent : C.textSub),
      textAnchor: 'middle'
    }));
  });
}

// ── Screen 1: Home Dashboard ──────────────────────────────────────────────────
function s1Home() {
  const e = [];
  e.push(rect(0, 0, W, H, { fill: C.bg }));
  // ambient blobs
  e.push(circ(330, 110, 95, { fill: C.accentLt, opacity: '0.55' }));
  e.push(circ(55, 320, 72, { fill: C.amberLt, opacity: '0.45' }));
  e.push(circ(200, 720, 140, { fill: C.accentLt, opacity: '0.25' }));

  statusBar(e);

  // Greeting
  e.push(txt('Good morning', 22, 62, SF(13, '400', C.textSub)));
  e.push(txt('Mia ✦', 22, 86, SF(23, '800', C.text, { letterSpacing: '-0.5' })));
  // Avatar
  e.push(circ(W - 32, 74, 18, { fill: C.accentLt }));
  e.push(txt('M', W - 32, 79, { ...SF(13, '700', C.accent), textAnchor: 'middle' }));

  // ── Hero balance card ───────────────────────────────────────────────────
  glass(e, 16, 104, W - 32, 164, 24);

  e.push(txt('Net Worth', 36, 132, SF(11, '500', C.textSub, { letterSpacing: '0.4' })));
  // Big number
  e.push(txt('$12,847', 36, 178, SF(46, '900', C.text, { letterSpacing: '-2' })));
  e.push(txt('.36', 198, 178, SF(26, '400', C.textSub)));

  // Trend chip
  e.push(rRect(36, 192, 86, 20, 10, { fill: C.accentLt }));
  e.push(txt('↑ +4.2% this month', 44, 205, SF(9, '600', C.accent)));

  // Mini sparkline top-right
  const sx = W - 105, sy = 140;
  const spts = [0, 6, 2, 12, 7, 18, 5, 26, 16, 20, 12, 30, 24];
  let sp = `M ${sx} ${sy + 28 - spts[0]}`;
  spts.forEach((p, i) => { if (i) sp += ` L ${sx + i * 5.5} ${sy + 28 - p}`; });
  e.push(pathEl(sp, { stroke: C.accent, strokeWidth: '2', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }));
  const fp = sp + ` L ${sx + (spts.length - 1) * 5.5} ${sy + 28} L ${sx} ${sy + 28} Z`;
  e.push(pathEl(fp, { fill: C.accent, opacity: '0.10' }));

  // ── 3 stat cards ────────────────────────────────────────────────────────
  const cW = (W - 40) / 3;
  [
    { label: 'Income',  value: '$4,200', icon: '↓', color: C.green,  bg: '#EDFAF4' },
    { label: 'Spent',   value: '$2,163', icon: '↑', color: C.red,    bg: '#FEF0F0' },
    { label: 'Saved',   value: '$2,037', icon: '◆', color: C.accent, bg: C.accentLt },
  ].forEach((s, i) => {
    const cx = 16 + i * (cW + 4);
    glass(e, cx, 284, cW, 86, 16);
    e.push(rRect(cx + 9, 297, 26, 26, 8, { fill: s.bg }));
    e.push(txt(s.icon, cx + 22, 314, { ...SF(11, '700', s.color), textAnchor: 'middle' }));
    e.push(txt(s.value, cx + 9, 348, SF(13, '700', C.text)));
    e.push(txt(s.label, cx + 9, 362, SF(9, '400', C.textSub)));
  });

  // ── Monthly budget bar ───────────────────────────────────────────────────
  glass(e, 16, 386, W - 32, 96, 18);
  e.push(txt('Monthly Budget', 34, 408, SF(12, '600', C.text)));
  e.push(txt('$2,163 / $3,500', W - 34, 408, { ...SF(11, '400', C.textSub), textAnchor: 'end' }));
  const bW = W - 72;
  e.push(rRect(34, 418, bW, 10, 5, { fill: C.div }));
  e.push(rRect(34, 418, Math.round(bW * 0.618), 10, 5, { fill: C.accent }));
  // sub-segments
  const segs = [0.28, 0.19, 0.24, 0.17, 0.12];
  const segColors = [C.amber, C.blue, C.purple, C.red, C.green];
  let sx2 = 34;
  segs.forEach((p, i) => {
    const sw = Math.round(bW * p * 0.618 * 1.62);
    e.push(rRect(sx2, 436, sw - 2, 5, 2, { fill: segColors[i], opacity: '0.65' }));
    sx2 += sw - 2 + 2;
  });
  e.push(txt('62% used  ·  $1,337 remaining', 34, 460, SF(9, '400', C.textSub)));
  e.push(txt('💡 On track', W - 34, 460, { ...SF(9, '600', C.accent), textAnchor: 'end' }));

  // ── Recent transactions ───────────────────────────────────────────────────
  e.push(txt('Recent', 22, 502, SF(14, '700', C.text)));
  e.push(txt('View all →', W - 22, 502, { ...SF(11, '400', C.accent), textAnchor: 'end' }));

  [
    { name: 'Whole Foods', sub: 'Groceries', amt: '−$43.20', icon: '🛒', col: C.amber, pos: false },
    { name: 'Freelance Design', sub: 'Income', amt: '+$800', icon: '↓', col: C.green, pos: true },
    { name: 'Netflix', sub: 'Entertainment', amt: '−$15.99', icon: '▶', col: C.purple, pos: false },
  ].forEach((tx, i) => {
    const ty = 514 + i * 60;
    glass(e, 16, ty, W - 32, 52, 13);
    e.push(rRect(28, ty + 10, 32, 32, 10, { fill: tx.col, opacity: '0.12' }));
    e.push(txt(tx.icon, 44, ty + 30, { ...SF(13, '400', tx.col), textAnchor: 'middle' }));
    e.push(txt(tx.name, 70, ty + 24, SF(12, '600', C.text)));
    e.push(txt(tx.sub, 70, ty + 40, SF(9, '400', C.textSub)));
    e.push(txt(tx.amt, W - 28, ty + 32, { ...SF(12, '700', tx.pos ? C.green : C.text), textAnchor: 'end' }));
  });

  navBar(e, 'home');
  return { name: 'Home', elements: e };
}

// ── Screen 2: Flow (Spending) ──────────────────────────────────────────────────
function s2Flow() {
  const e = [];
  e.push(rect(0, 0, W, H, { fill: C.bg }));
  e.push(circ(190, 190, 140, { fill: C.amberLt, opacity: '0.35' }));
  e.push(circ(50, 460, 80, { fill: C.accentLt, opacity: '0.30' }));

  statusBar(e);
  e.push(txt('Cash Flow', 22, 68, SF(26, '800', C.text, { letterSpacing: '-0.5' })));
  e.push(txt('April 2026', 22, 88, SF(13, '400', C.textSub)));

  // Period toggle
  ['Week', 'Month', 'Year'].forEach((p, i) => {
    const px = W - 128 + i * 40;
    if (i === 1) {
      e.push(rRect(px - 4, 60, 36, 22, 11, { fill: C.accent }));
      e.push(txt(p, px + 14, 75, { ...SF(10, '600', '#fff'), textAnchor: 'middle' }));
    } else {
      e.push(txt(p, px + 14, 75, { ...SF(10, '400', C.textSub), textAnchor: 'middle' }));
    }
  });

  // ── Donut chart ─────────────────────────────────────────────────────────
  glass(e, 16, 102, W - 32, 195, 24);
  const cx = W / 2, cy = 206, R = 72, ri = 48;
  const segs = [
    { pct: 0.28, col: C.amber,  label: 'Food',     amt: '$605' },
    { pct: 0.19, col: C.blue,   label: 'Transport', amt: '$411' },
    { pct: 0.24, col: C.purple, label: 'Shopping',  amt: '$519' },
    { pct: 0.17, col: C.red,    label: 'Health',    amt: '$368' },
    { pct: 0.12, col: C.accent, label: 'Other',     amt: '$260' },
  ];
  let ang = -Math.PI / 2;
  segs.forEach(seg => {
    const sw = seg.pct * 2 * Math.PI;
    const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang);
    const x2 = cx + R * Math.cos(ang + sw), y2 = cy + R * Math.sin(ang + sw);
    const ix1 = cx + ri * Math.cos(ang), iy1 = cy + ri * Math.sin(ang);
    const ix2 = cx + ri * Math.cos(ang + sw), iy2 = cy + ri * Math.sin(ang + sw);
    const lg = sw > Math.PI ? 1 : 0;
    const d = `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${lg} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${ix2.toFixed(1)} ${iy2.toFixed(1)} A${ri} ${ri} 0 ${lg} 0 ${ix1.toFixed(1)} ${iy1.toFixed(1)}Z`;
    e.push(pathEl(d, { fill: seg.col, opacity: '0.87' }));
    ang += sw + 0.022;
  });
  // Center
  e.push(circ(cx, cy, ri - 5, { fill: C.glass }));
  e.push(txt('$2,163', cx, cy - 4, { ...SF(18, '800', C.text), textAnchor: 'middle' }));
  e.push(txt('total', cx, cy + 13, { ...SF(9, '400', C.textSub), textAnchor: 'middle' }));

  // Legend (right side)
  segs.slice(0, 3).forEach((s, i) => {
    const lx = W - 100, ly = 122 + i * 22;
    e.push(circ(lx, ly + 5, 5, { fill: s.col, opacity: '0.87' }));
    e.push(txt(s.label, lx + 10, ly + 9, SF(10, '400', C.text)));
    e.push(txt(s.amt, W - 30, ly + 9, { ...SF(10, '600', C.text), textAnchor: 'end' }));
  });

  // ── Categories ──────────────────────────────────────────────────────────
  e.push(txt('By Category', 22, 316, SF(14, '700', C.text)));
  segs.forEach((s, i) => {
    const ty = 332 + i * 64;
    glass(e, 16, ty, W - 32, 56, 13);
    e.push(rRect(27, ty + 11, 34, 34, 10, { fill: s.col, opacity: '0.12' }));
    e.push(circ(44, ty + 28, 8, { fill: s.col, opacity: '0.88' }));
    e.push(txt(s.label, 72, ty + 25, SF(13, '600', C.text)));
    e.push(txt(`${Math.round(s.pct * 100)}% of spend`, 72, ty + 41, SF(9, '400', C.textSub)));
    const bw2 = 154;
    e.push(rRect(72, ty + 44, bw2, 4, 2, { fill: C.div }));
    e.push(rRect(72, ty + 44, Math.min(bw2, Math.round(bw2 * s.pct * 3.2)), 4, 2, { fill: s.col, opacity: '0.75' }));
    e.push(txt(s.amt, W - 28, ty + 32, { ...SF(14, '700', C.text), textAnchor: 'end' }));
  });

  navBar(e, 'flow');
  return { name: 'Flow', elements: e };
}

// ── Screen 3: Goals ────────────────────────────────────────────────────────────
function s3Goals() {
  const e = [];
  e.push(rect(0, 0, W, H, { fill: C.bg }));
  e.push(circ(340, 190, 100, { fill: C.accentLt, opacity: '0.50' }));
  e.push(circ(30, 580, 85, { fill: C.amberLt, opacity: '0.40' }));

  statusBar(e);
  e.push(txt('Goals', 22, 68, SF(26, '800', C.text, { letterSpacing: '-0.5' })));
  e.push(txt('3 active  ·  $8,400 saved total', 22, 88, SF(13, '400', C.textSub)));
  e.push(rRect(W - 60, 57, 44, 24, 12, { fill: C.accent }));
  e.push(txt('+ New', W - 38, 73, { ...SF(10, '600', '#fff'), textAnchor: 'middle' }));

  const goals = [
    { name: 'Emergency Fund', target: 10000, saved: 6800, color: C.accent, icon: '🛡', days: 62 },
    { name: 'Japan Trip ✈', target: 3500, saved: 1260, color: C.amber, icon: '✈', days: 128 },
    { name: 'New MacBook', target: 2200, saved: 340, color: C.blue, icon: '💻', days: 244 },
  ];

  goals.forEach((g, i) => {
    const gy = 106 + i * 198;
    const pct = g.saved / g.target;
    glass(e, 16, gy, W - 32, 186, 24);

    // Left accent strip
    e.push(rRect(16, gy, 4, 186, 2, { fill: g.color }));

    // Icon block
    e.push(rRect(30, gy + 14, 44, 44, 14, { fill: g.color, opacity: '0.10' }));
    e.push(txt(g.icon, 52, gy + 41, { ...SF(18, '400', g.color), textAnchor: 'middle' }));

    e.push(txt(g.name, 84, gy + 34, SF(14, '700', C.text)));
    e.push(txt(`Target: $${g.target.toLocaleString()}`, 84, gy + 52, SF(11, '400', C.textSub)));

    // Days badge
    e.push(rRect(W - 76, gy + 18, 62, 20, 10, { fill: g.color, opacity: '0.10' }));
    e.push(txt(`${g.days} days left`, W - 45, gy + 31, { ...SF(9, '600', g.color), textAnchor: 'middle' }));

    // Divider
    e.push(rect(28, gy + 70, W - 72, 1, { fill: C.div }));

    // Progress ring
    const pcx = 62, pcy = gy + 130, pR2 = 38, pR2i = 28;
    const tAngle = pct * 2 * Math.PI;
    // Track
    e.push(pathEl(
      `M ${pcx} ${pcy - pR2} A ${pR2} ${pR2} 0 1 1 ${pcx - 0.001} ${pcy - pR2}`,
      { stroke: C.div, strokeWidth: '8', fill: 'none' }
    ));
    e.push(pathEl(
      `M ${pcx} ${pcy - pR2i} A ${pR2i} ${pR2i} 0 1 1 ${pcx - 0.001} ${pcy - pR2i}`,
      { stroke: C.glass, strokeWidth: '8', fill: 'none' }
    ));
    if (pct > 0.02) {
      const px2 = pcx + pR2 * Math.sin(tAngle), py2 = pcy - pR2 * Math.cos(tAngle);
      const lg2 = pct > 0.5 ? 1 : 0;
      e.push(pathEl(
        `M ${pcx} ${pcy - pR2} A ${pR2} ${pR2} 0 ${lg2} 1 ${px2.toFixed(1)} ${py2.toFixed(1)}`,
        { stroke: g.color, strokeWidth: '8', fill: 'none', strokeLinecap: 'round' }
      ));
    }
    e.push(txt(`${Math.round(pct * 100)}%`, pcx, pcy + 5, { ...SF(13, '800', g.color), textAnchor: 'middle' }));

    // Amount block
    e.push(txt(`$${g.saved.toLocaleString()}`, 116, gy + 116, SF(26, '900', C.text, { letterSpacing: '-1' })));
    e.push(txt('saved so far', 116, gy + 134, SF(10, '400', C.textSub)));
    const mNeeded = Math.round((g.target - g.saved) / (g.days / 30));
    e.push(rRect(116, gy + 146, W - 152, 22, 8, { fill: g.color, opacity: '0.09' }));
    e.push(txt(`+$${mNeeded}/mo to finish`, 124, gy + 160, SF(10, '500', g.color)));
  });

  navBar(e, 'goals');
  return { name: 'Goals', elements: e };
}

// ── Screen 4: History ─────────────────────────────────────────────────────────
function s4History() {
  const e = [];
  e.push(rect(0, 0, W, H, { fill: C.bg }));
  e.push(circ(340, 140, 85, { fill: C.accentLt, opacity: '0.40' }));

  statusBar(e);
  e.push(txt('History', 22, 68, SF(26, '800', C.text, { letterSpacing: '-0.5' })));

  // Search
  glass(e, 16, 84, W - 70, 38, 11);
  e.push(txt('🔍', 28, 107, { fontSize: 13, fontFamily: 'sans-serif' }));
  e.push(txt('Search transactions…', 48, 107, SF(12, '400', C.textSub)));
  e.push(rRect(W - 46, 84, 38, 38, 11, { fill: C.accent }));
  e.push(txt('⊞', W - 27, 107, { ...SF(14, '400', '#fff'), textAnchor: 'middle' }));

  const groups = [
    { label: 'Today', items: [
      { name: 'Whole Foods', sub: 'Groceries', amt: '−$43.20', icon: '🛒', col: C.amber },
      { name: 'Spotify', sub: 'Entertainment', amt: '−$9.99', icon: '♪', col: C.purple },
      { name: 'Client Transfer', sub: 'Income', amt: '+$500.00', icon: '↓', col: C.green },
    ]},
    { label: 'Yesterday', items: [
      { name: 'Uber', sub: 'Transport', amt: '−$12.50', icon: '🚗', col: C.blue },
      { name: 'Amazon', sub: 'Shopping · Pending', amt: '−$67.89', icon: '📦', col: C.amber },
      { name: 'Freelance — UI work', sub: 'Income', amt: '+$400.00', icon: '↓', col: C.green },
    ]},
    { label: 'Apr 6', items: [
      { name: 'Netflix', sub: 'Entertainment', amt: '−$15.99', icon: '▶', col: C.purple },
      { name: 'Pharmacy', sub: 'Health', amt: '−$28.40', icon: '+', col: C.red },
    ]},
  ];

  let y = 136;
  for (const grp of groups) {
    e.push(txt(grp.label, 22, y, SF(11, '600', C.textSub, { letterSpacing: '0.3' })));
    y += 14;
    for (const tx of grp.items) {
      glass(e, 16, y, W - 32, 50, 12);
      e.push(rRect(27, y + 9, 32, 32, 9, { fill: tx.col, opacity: '0.12' }));
      e.push(txt(tx.icon, 43, y + 28, { ...SF(13, '400', tx.col), textAnchor: 'middle' }));
      e.push(txt(tx.name, 68, y + 22, SF(12, '600', C.text)));
      e.push(txt(tx.sub, 68, y + 38, SF(9, '400', C.textSub)));
      const isPos = tx.amt.startsWith('+');
      e.push(txt(tx.amt, W - 26, y + 29, { ...SF(12, '700', isPos ? C.green : C.text), textAnchor: 'end' }));
      y += 56;
    }
    y += 6;
  }

  navBar(e, 'history');
  return { name: 'History', elements: e };
}

// ── Screen 5: Pulse (Insights) ────────────────────────────────────────────────
function s5Pulse() {
  const e = [];
  e.push(rect(0, 0, W, H, { fill: C.bg }));
  e.push(circ(320, 120, 110, { fill: C.amberLt, opacity: '0.45' }));
  e.push(circ(40, 490, 85, { fill: C.accentLt, opacity: '0.40' }));

  statusBar(e);
  e.push(txt('Pulse', 22, 68, SF(26, '800', C.text, { letterSpacing: '-0.5' })));
  e.push(txt('Weekly Report  ·  Apr 1–7', 22, 88, SF(13, '400', C.textSub)));

  // ── Weekly bar chart ─────────────────────────────────────────────────────
  glass(e, 16, 102, W - 32, 162, 22);
  e.push(txt('Daily Spending', 34, 126, SF(12, '600', C.text)));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [42, 87, 23, 134, 56, 198, 45];
  const mv = Math.max(...vals);
  const bW2 = 22, bGap = 20, chartB = 246, chartH2 = 80;
  const startX = (W - 32 - (bW2 * 7 + bGap * 6)) / 2 + 16;

  days.forEach((d, i) => {
    const bx = startX + i * (bW2 + bGap);
    const bh = Math.round((vals[i] / mv) * chartH2);
    const hi = i === 5;
    e.push(rRect(bx, chartB - bh, bW2, bh, 5, { fill: hi ? C.accent : C.div }));
    if (hi) {
      e.push(rRect(bx - 8, chartB - bh - 24, 38, 17, 9, { fill: C.accent }));
      e.push(txt(`$${vals[i]}`, bx + 11, chartB - bh - 12, { ...SF(9, '600', '#fff'), textAnchor: 'middle' }));
    }
    e.push(txt(d, bx + 11, chartB + 13, { ...SF(9, hi ? '700' : '400', hi ? C.accent : C.textSub), textAnchor: 'middle' }));
  });

  // ── Comparison banner ────────────────────────────────────────────────────
  glass(e, 16, 280, W - 32, 66, 18);
  e.push(txt('vs Last Week', 34, 303, SF(12, '600', C.text)));
  e.push(txt('You spent 18% less — your best week this month.', 34, 320, SF(11, '400', C.textSub)));
  e.push(rRect(34, 330, 64, 14, 7, { fill: C.accentLt }));
  e.push(txt('↓ 18% saved', 66, 340, { ...SF(9, '600', C.accent), textAnchor: 'middle' }));
  e.push(txt('📉', W - 50, 322, { fontSize: 26, fontFamily: 'sans-serif', textAnchor: 'middle' }));

  // ── Insight cards ─────────────────────────────────────────────────────────
  e.push(txt('Smart Insights', 22, 368, SF(14, '700', C.text)));

  [
    { icon: '🍕', title: 'Food up 12% this week', body: 'Eating out 6× costs you +$80/mo vs cooking.', col: C.amber },
    { icon: '🛡', title: 'Emergency fund on track', body: '$6,800 saved — 68% done. 62 days to $10K.', col: C.accent },
    { icon: '⚡', title: 'Best transport week', body: '$28 on transport — $84 under budget this month.', col: C.blue },
    { icon: '💰', title: 'Biggest win: Freelance', body: '$1,200 income this week. Up 33% from last.', col: C.green },
  ].forEach((ins, i) => {
    const iy = 384 + i * 100;
    glass(e, 16, iy, W - 32, 90, 18);
    e.push(rRect(16, iy, 4, 90, 2, { fill: ins.col }));
    e.push(rRect(30, iy + 14, 34, 34, 11, { fill: ins.col, opacity: '0.10' }));
    e.push(txt(ins.icon, 47, iy + 36, { ...SF(16, '400', ins.col), textAnchor: 'middle' }));
    e.push(txt(ins.title, 74, iy + 32, SF(13, '700', C.text)));
    e.push(txt(ins.body, 74, iy + 50, SF(10, '400', C.textSub)));
    e.push(rRect(74, iy + 64, 68, 14, 7, { fill: ins.col, opacity: '0.10' }));
    e.push(txt('View detail →', 108, iy + 74, { ...SF(8, '600', ins.col), textAnchor: 'middle' }));
  });

  navBar(e, 'pulse');
  return { name: 'Pulse', elements: e };
}

// ── Build & write ─────────────────────────────────────────────────────────────
const screens = [s1Home(), s2Flow(), s3Goals(), s4History(), s5Pulse()];

const pen = {
  version: '2.8',
  name: 'Tide — Financial Clarity',
  description: 'Personal finance app with frosted glass card system on warm cream. Inspired by Fluid Glass (Awwwards SOTD 7.77/10) + Atlas Card (Godly) + Robinhood Market (minimal.gallery).',
  metadata: {
    slug: SLUG,
    appName: APP_NAME,
    tagline: TAGLINE,
    archetype: ARCHETYPE,
    theme: 'light',
    created: new Date().toISOString(),
    inspiration: 'Fluid Glass by Exo Ape (Awwwards SOTD) + Atlas Card (Godly) + Robinhood Market (minimal.gallery)',
    palette: { bg: C.bg, accent: C.accent, accent2: C.amber, text: C.text },
  },
  canvas: { width: W, height: H },
  screens: screens.map((s, i) => ({
    id: `s${i + 1}`,
    name: s.name,
    width: W,
    height: H,
    elements: s.elements,
  })),
};

const out = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ ${APP_NAME} pen → ${out}`);
console.log(`  ${pen.screens.length} screens, ${pen.screens.reduce((n, s) => n + s.elements.length, 0)} elements`);
