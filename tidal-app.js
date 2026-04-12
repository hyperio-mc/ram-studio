'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'tidal';
const NAME      = 'TIDAL';
const TAGLINE   = 'Artist analytics, deep as the ocean';
const HEARTBEAT = 50;
const W = 390, H = 844;

// ─── Palette ─────────────────────────────────────────────────────────────────
// Inspired by darkmodedesign.com — QASE "frozen deep-sea bioluminescence":
// deep navy backgrounds, electric teal/cyan micro-accents, space-like depth.
const C = {
  bg:    '#030B17',
  surf:  '#071120',
  card:  '#0C1A30',
  card2: '#0F2040',
  acc:   '#06B6D4',   // electric teal
  acc2:  '#818CF8',   // soft indigo
  acc3:  '#34D399',   // mint green
  text:  '#E0F2FE',
  sub:   '#7DB9D8',
  muted: '#3B5F7A',
  bdr:   'rgba(6,182,212,0.14)',
  glow:  'rgba(6,182,212,0.07)',
  red:   '#F87171',
  amber: '#FBBF24',
  white: '#FFFFFF',
};

// ─── Primitives ──────────────────────────────────────────────────────────────
function R(x, y, w, h, fill, o = {}) {
  return {
    type:'rect', x, y, w, h, fill,
    rx: o.rx || 0,
    opacity: o.op !== undefined ? o.op : 1,
    stroke: o.stroke || null,
    strokeWidth: o.sw || 0,
  };
}
function T(x, y, content, size, fill, o = {}) {
  return {
    type:'text', x, y, content, size, fill,
    fontWeight: o.fw || 400,
    fontFamily: o.font || 'Inter',
    textAnchor: o.anchor || 'start',
    letterSpacing: o.ls || 0,
    opacity: o.op !== undefined ? o.op : 1,
  };
}
function Ci(cx, cy, r, fill, o = {}) {
  return {
    type:'circle', cx, cy, r, fill,
    opacity: o.op !== undefined ? o.op : 1,
    stroke: o.stroke || null,
    strokeWidth: o.sw || 0,
  };
}
function Li(x1, y1, x2, y2, stroke, o = {}) {
  return {
    type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: o.sw || 1,
    opacity: o.op !== undefined ? o.op : 1,
  };
}

// ─── Shared Components ───────────────────────────────────────────────────────
function statusBar(el) {
  el.push(R(0, 0, W, 44, C.bg));
  el.push(T(20, 28, '9:41', 13, C.text, { fw: 600 }));
  el.push(T(308, 28, '▲▼ LTE', 10, C.sub));
  el.push(T(363, 28, '⬡ 91', 10, C.sub));
}

function bottomNav(el, active) {
  const tabs = [
    { label: 'Overview', icon: '⬡' },
    { label: 'Streams',  icon: '◈' },
    { label: 'Tracks',   icon: '♪'  },
    { label: 'Audience', icon: '◯'  },
    { label: 'Revenue',  icon: '◎'  },
  ];
  el.push(R(0, H - 80, W, 80, C.surf));
  el.push(Li(0, H - 80, W, H - 80, C.bdr, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const on = i === active;
    if (on) el.push(R(x - 22, H - 80, 44, 2, C.acc, { rx: 1 }));
    el.push(T(x, H - 48, tab.icon, 18, on ? C.acc : C.muted, { anchor: 'middle' }));
    el.push(T(x, H - 27, tab.label, 9, on ? C.acc : C.muted, { anchor: 'middle' }));
  });
}

function glowBlob(el, cx, cy, r) {
  // soft ambient glow behind hero content
  el.push(R(cx - r, cy - r * 0.6, r * 2, r * 1.2, C.glow, { rx: r, op: 0.8 }));
}

// ─── SCREEN 1: Overview ──────────────────────────────────────────────────────
function screen1() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  glowBlob(el, 195, 200, 200);
  statusBar(el);

  // Header
  el.push(T(20, 68, 'TIDAL', 24, C.text, { fw: 800, ls: 3 }));
  el.push(T(20, 90, 'Artist Dashboard', 12, C.sub));
  el.push(Ci(354, 68, 17, C.card, { stroke: C.bdr, sw: 1 }));
  el.push(T(354, 73, 'AK', 10, C.acc, { fw: 700, anchor: 'middle' }));
  // Live pill
  el.push(R(20, 104, 52, 18, 'rgba(6,182,212,0.12)', { rx: 9 }));
  el.push(Ci(32, 113, 3, C.acc));
  el.push(T(39, 117, 'LIVE', 9, C.acc, { fw: 600 }));

  // ── Bento top row: 3 metric cards ──
  const stats = [
    { label: 'Monthly',   value: '4.2M',  sub: 'streams',   col: C.acc  },
    { label: 'Followers', value: '182K',  sub: '+2.1% wk',  col: C.acc3 },
    { label: 'Revenue',   value: '$8.4K', sub: 'this month', col: C.acc2 },
  ];
  stats.forEach((s, i) => {
    const bx = 16 + i * 120;
    el.push(R(bx, 130, 110, 86, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
    el.push(T(bx + 12, 152, s.label, 9,  C.sub));
    el.push(T(bx + 12, 176, s.value, 20, s.col, { fw: 800 }));
    el.push(R(bx + 12, 188, 50, 2, s.col, { rx: 1, op: 0.35 }));
    el.push(T(bx + 12, 208, s.sub,  10, C.sub));
  });

  // ── Now Playing wide card ──
  el.push(R(16, 228, 358, 72, C.card2, { rx: 14, stroke: C.bdr, sw: 1 }));
  el.push(R(26, 238, 52, 52, C.acc, { rx: 10, op: 0.18 }));
  el.push(T(52, 268, '♪', 20, C.acc, { anchor: 'middle' }));
  el.push(T(90, 254, 'Midnight Tide', 14, C.text, { fw: 600 }));
  el.push(T(90, 272, 'Trending #3 worldwide', 11, C.sub));
  // waveform bars (mini)
  const waveAmps = [4,6,9,12,10,8,14,16,12,9,11,8,6,10,13,15,11,7,5,8];
  waveAmps.forEach((h, i) => {
    const bx = 256 + i * 5;
    el.push(R(bx, 264 - h, 3, h * 2, C.acc, { rx: 1, op: i < 12 ? 1 : 0.4 }));
  });

  // ── Stream Chart ──
  el.push(T(20, 318, 'Stream Velocity', 13, C.text, { fw: 600 }));
  el.push(T(20, 334, 'Last 7 days', 10, C.sub));
  el.push(T(356, 318, '7d ▾', 10, C.acc, { anchor: 'end' }));

  el.push(R(16, 346, 358, 130, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  // chart grid
  [0,1,2,3].forEach(i => {
    el.push(Li(32, 362 + i * 26, 366, 362 + i * 26, C.bdr, { sw: 0.5, op: 0.6 }));
  });
  // sparkline bars (28 days compressed to bars)
  const streamBars = [20,24,18,30,28,36,40,38,32,44,50,48,42,56,52,62,58,54,64,70,66,60,72,75,68,80,84,90];
  streamBars.forEach((h, i) => {
    const bx = 30 + i * 11;
    const barH = h * 0.78;
    el.push(R(bx, 460 - barH, 8, barH, C.acc, { rx: 2, op: i > 22 ? 1 : 0.45 }));
  });
  // chart x labels
  ['Mon','','','Thu','','','Sun'].forEach((lb, i) => {
    if (!lb) return;
    el.push(T(30 + i * 44, 476, lb, 9, C.muted));
  });

  // ── Top Tracks mini list ──
  el.push(T(20, 492, 'Top Tracks', 13, C.text, { fw: 600 }));
  el.push(T(356, 492, 'See all →', 10, C.acc, { anchor: 'end' }));

  const topTracks = [
    { n: 1, title: 'Midnight Tide',    streams: '1.4M', delta: '+12%', col: C.acc3 },
    { n: 2, title: 'Undertow',         streams: '980K', delta: '+8%',  col: C.acc  },
    { n: 3, title: 'Saltwater Dreams', streams: '744K', delta: '+5%',  col: C.acc2 },
  ];
  topTracks.forEach((tr, i) => {
    const ty = 508 + i * 54;
    el.push(R(16, ty, 358, 46, C.card, { rx: 10, stroke: C.bdr, sw: 0.5 }));
    el.push(T(30, ty + 27, String(tr.n), 13, C.muted, { fw: 700 }));
    el.push(R(52, ty + 8, 30, 30, C.acc, { rx: 8, op: 0.12 }));
    el.push(T(67, ty + 28, '♪', 12, C.acc, { anchor: 'middle' }));
    el.push(T(92, ty + 20, tr.title,   13, C.text, { fw: 500 }));
    el.push(T(92, ty + 36, tr.streams, 11, C.sub));
    el.push(T(354, ty + 27, tr.delta,  11, tr.col, { anchor: 'end', fw: 600 }));
  });

  bottomNav(el, 0);
  return { name: 'Overview', elements: el };
}

// ─── SCREEN 2: Streams ───────────────────────────────────────────────────────
function screen2() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  statusBar(el);

  el.push(T(20, 68, 'Streams', 22, C.text, { fw: 700 }));
  el.push(T(20, 90, '4.2M streams this month', 12, C.sub));

  // Time range chips
  ['7d','30d','90d','1y'].forEach((r, i) => {
    const rx2 = 20 + i * 70;
    const on  = i === 1;
    el.push(R(rx2, 106, 60, 24, on ? C.acc : C.card, { rx: 12, stroke: on ? null : C.bdr, sw: 1 }));
    el.push(T(rx2 + 30, 122, r, 11, on ? C.white : C.sub, { anchor: 'middle', fw: on ? 600 : 400 }));
  });

  // Big stream area chart
  el.push(R(16, 140, 358, 180, C.card, { rx: 14, stroke: C.bdr, sw: 1 }));
  // grid
  [0,1,2,3,4].forEach(i => {
    el.push(Li(30, 155 + i * 30, 366, 155 + i * 30, C.bdr, { sw: 0.5, op: 0.5 }));
  });
  // area chart (stepped fill bars simulating area)
  const areaPoints = [8,10,9,12,14,11,16,20,18,22,26,24,28,32,30,34,38,36,40,44,42,46,50,48,52,56,54,58,62,60];
  areaPoints.forEach((h, i) => {
    const bx = 30 + i * 11;
    const fullH = h * 1.8;
    el.push(R(bx, 315 - fullH, 8, fullH, C.acc, { rx: 1, op: 0.3 }));
    el.push(R(bx, 310 - 3, 8, 6, C.acc, { rx: 1, op: 0.8 }));
  });
  // y axis labels
  ['5M','4M','3M','2M','1M'].forEach((lb, i) => {
    el.push(T(16, 157 + i * 30, lb, 8, C.muted));
  });
  // x axis
  ['May 1','','May 8','','May 15','','May 22','May 30'].forEach((lb, i) => {
    if (!lb) return;
    el.push(T(30 + i * 44, 332, lb, 8, C.muted));
  });

  // Platform breakdown
  el.push(T(20, 350, 'By Platform', 13, C.text, { fw: 600 }));

  const platforms = [
    { name: 'Spotify',       pct: 52, streams: '2.18M', col: C.acc3  },
    { name: 'Apple Music',   pct: 24, streams: '1.01M', col: '#FC3C44' },
    { name: 'YouTube Music', pct: 14, streams: '588K',  col: '#FF0000' },
    { name: 'Tidal',         pct: 6,  streams: '252K',  col: C.acc    },
    { name: 'Other',         pct: 4,  streams: '168K',  col: C.muted  },
  ];
  platforms.forEach((p, i) => {
    const py = 366 + i * 52;
    el.push(R(16, py, 358, 44, C.card, { rx: 10, stroke: C.bdr, sw: 0.5 }));
    el.push(R(26, py + 17, 8, 8, p.col, { rx: 2 }));
    el.push(T(42, py + 26, p.name, 12, C.text));
    // bar
    el.push(R(160, py + 17, 140, 8, C.surf, { rx: 4 }));
    el.push(R(160, py + 17, Math.round(140 * p.pct / 100), 8, p.col, { rx: 4, op: 0.8 }));
    el.push(T(354, py + 26, p.streams, 11, C.sub, { anchor: 'end' }));
  });

  // Daily peak
  el.push(R(16, 636, 358, 56, C.card2, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(T(32, 656, 'Peak Day', 11, C.sub));
  el.push(T(32, 676, 'Saturday', 15, C.text, { fw: 700 }));
  el.push(T(195, 656, 'Peak Hour', 11, C.sub));
  el.push(T(195, 676, '10–11 PM', 15, C.acc, { fw: 700 }));
  el.push(T(354, 676, '↑ 2.3×', 14, C.acc3, { anchor: 'end', fw: 700 }));

  bottomNav(el, 1);
  return { name: 'Streams', elements: el };
}

// ─── SCREEN 3: Tracks ────────────────────────────────────────────────────────
function screen3() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  statusBar(el);

  el.push(T(20, 68, 'Tracks', 22, C.text, { fw: 700 }));
  el.push(T(20, 90, '18 releases · sorted by streams', 12, C.sub));

  // Search / filter
  el.push(R(16, 106, 262, 34, C.card, { rx: 10, stroke: C.bdr, sw: 1 }));
  el.push(T(36, 127, '⌕  Search tracks...', 12, C.muted));
  el.push(R(288, 106, 86, 34, C.card, { rx: 10, stroke: C.bdr, sw: 1 }));
  el.push(T(331, 127, '⧩  Filter', 11, C.sub, { anchor: 'middle' }));

  // Column headers
  el.push(T(20, 158, '#', 10, C.muted));
  el.push(T(56, 158, 'Track', 10, C.muted));
  el.push(T(244, 158, 'Streams', 10, C.muted));
  el.push(T(354, 158, '30d', 10, C.muted, { anchor: 'end' }));
  el.push(Li(16, 165, 374, 165, C.bdr, { sw: 0.5 }));

  const tracks = [
    { n:  1, title: 'Midnight Tide',       rel: '2026',  streams: '1.4M',  delta: '+12%', col: C.acc3 },
    { n:  2, title: 'Undertow',            rel: '2026',  streams: '980K',  delta: '+8%',  col: C.acc  },
    { n:  3, title: 'Saltwater Dreams',    rel: '2025',  streams: '744K',  delta: '+5%',  col: C.acc2 },
    { n:  4, title: 'Bioluminescence',     rel: '2025',  streams: '612K',  delta: '-2%',  col: C.amber},
    { n:  5, title: 'Deep Current',        rel: '2025',  streams: '540K',  delta: '+3%',  col: C.acc3 },
    { n:  6, title: 'Pressure Ridge',      rel: '2024',  streams: '488K',  delta: '—',    col: C.muted},
    { n:  7, title: 'Abyssal Plain',       rel: '2024',  streams: '412K',  delta: '-1%',  col: C.amber},
    { n:  8, title: 'Tidal Lock',          rel: '2024',  streams: '380K',  delta: '+4%',  col: C.acc  },
  ];

  tracks.forEach((tr, i) => {
    const ty = 172 + i * 60;
    if (ty > H - 88) return;
    const isTop = i < 3;
    el.push(R(16, ty, 358, 52, isTop ? C.card2 : C.card, { rx: 10, stroke: isTop ? C.bdr : 'rgba(6,182,212,0.07)', sw: 1 }));
    el.push(T(28, ty + 28, String(tr.n), 12, i < 3 ? C.acc : C.muted, { fw: 700 }));
    el.push(R(52, ty + 9, 34, 34, C.acc, { rx: 8, op: isTop ? 0.18 : 0.08 }));
    el.push(T(69, ty + 31, '♪', 12, isTop ? C.acc : C.muted, { anchor: 'middle' }));
    el.push(T(96, ty + 22, tr.title, 12, C.text, { fw: 500 }));
    el.push(T(96, ty + 38, tr.rel,   10, C.muted));
    el.push(T(244, ty + 28, tr.streams, 12, C.sub, { fw: 500 }));
    el.push(T(354, ty + 28, tr.delta, 11, tr.col, { anchor: 'end', fw: 600 }));
  });

  bottomNav(el, 2);
  return { name: 'Tracks', elements: el };
}

// ─── SCREEN 4: Audience ──────────────────────────────────────────────────────
function screen4() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  statusBar(el);

  el.push(T(20, 68, 'Audience', 22, C.text, { fw: 700 }));
  el.push(T(20, 90, '182K followers · 32 countries', 12, C.sub));

  // Age demo bento
  el.push(T(20, 110, 'Age Groups', 13, C.text, { fw: 600 }));
  el.push(R(16, 126, 358, 90, C.card, { rx: 14, stroke: C.bdr, sw: 1 }));
  const ages = [
    { range: '13-17', pct: 8,  w: 28  },
    { range: '18-24', pct: 34, w: 118 },
    { range: '25-34', pct: 38, w: 132 },
    { range: '35-44', pct: 14, w: 48  },
    { range: '45+',   pct: 6,  w: 22  },
  ];
  let bx = 26;
  ages.forEach((a, i) => {
    const cols = [C.acc2, C.acc, C.acc3, C.amber, C.muted];
    el.push(R(bx, 140, a.w, 28, cols[i], { rx: 4, op: 0.75 }));
    el.push(T(bx + a.w / 2, 162, `${a.pct}%`, 9, C.white, { anchor: 'middle', fw: 600 }));
    el.push(T(bx + a.w / 2, 200, a.range, 8, C.sub, { anchor: 'middle' }));
    bx += a.w + 4;
  });

  // Gender split
  el.push(T(20, 228, 'Gender Split', 13, C.text, { fw: 600 }));
  el.push(R(16, 244, 172, 68, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(R(202, 244, 172, 68, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(T(102, 270, '58%', 22, C.acc, { anchor: 'middle', fw: 800 }));
  el.push(T(102, 290, 'Female', 11, C.sub, { anchor: 'middle' }));
  el.push(T(288, 270, '42%', 22, C.acc2, { anchor: 'middle', fw: 800 }));
  el.push(T(288, 290, 'Male', 11, C.sub, { anchor: 'middle' }));

  // Top countries
  el.push(T(20, 330, 'Top Countries', 13, C.text, { fw: 600 }));
  const countries = [
    { name: 'United States', pct: 28, listeners: '51K', col: C.acc  },
    { name: 'United Kingdom', pct: 14, listeners: '25K', col: C.acc2 },
    { name: 'Canada',         pct: 11, listeners: '20K', col: C.acc3 },
    { name: 'Australia',      pct: 8,  listeners: '14K', col: C.amber},
    { name: 'Germany',        pct: 7,  listeners: '13K', col: C.acc  },
    { name: 'Other',          pct: 32, listeners: '59K', col: C.muted},
  ];
  countries.forEach((c, i) => {
    const cy = 346 + i * 52;
    el.push(R(16, cy, 358, 44, C.card, { rx: 10, stroke: C.bdr, sw: 0.5 }));
    el.push(T(30, cy + 26, c.name, 12, C.text));
    el.push(R(160, cy + 18, 140, 8, C.surf, { rx: 4 }));
    el.push(R(160, cy + 18, Math.round(140 * c.pct / 40), 8, c.col, { rx: 4, op: 0.75 }));
    el.push(T(354, cy + 26, c.listeners, 11, C.sub, { anchor: 'end' }));
  });

  // Listener behaviour
  el.push(T(20, 664, 'Listener Behaviour', 13, C.text, { fw: 600 }));
  el.push(R(16, 680, 172, 60, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(R(202, 680, 172, 60, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(T(26, 700, 'Avg Session', 11, C.sub));
  el.push(T(26, 720, '38 min', 18, C.acc, { fw: 700 }));
  el.push(T(212, 700, 'Skip Rate', 11, C.sub));
  el.push(T(212, 720, '12.4%', 18, C.acc3, { fw: 700 }));

  bottomNav(el, 3);
  return { name: 'Audience', elements: el };
}

// ─── SCREEN 5: Revenue ───────────────────────────────────────────────────────
function screen5() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  statusBar(el);

  el.push(T(20, 68, 'Revenue', 22, C.text, { fw: 700 }));
  el.push(T(20, 90, 'April 2026 · Royalty cycle', 12, C.sub));

  // Hero earnings card
  el.push(R(16, 108, 358, 110, C.card2, { rx: 16, stroke: C.bdr, sw: 1 }));
  el.push(T(32, 130, 'This Month', 11, C.sub));
  el.push(T(32, 158, '$8,412', 38, C.text, { fw: 800 }));
  el.push(T(32, 180, '↑ +18% vs March', 12, C.acc3, { fw: 500 }));
  // spark mini
  const revSpark = [3,4,4,5,5,6,7,8,7,9,10,9,11,12,11,13,14,13,15,16];
  revSpark.forEach((h, i) => {
    el.push(R(248 + i * 6, 198 - h * 4, 4, h * 4, C.acc3, { rx: 1, op: i > 14 ? 1 : 0.45 }));
  });
  el.push(T(248, 204, 'Apr 1', 8, C.muted));
  el.push(T(362, 204, 'Today', 8, C.muted, { anchor: 'end' }));

  // Platform earnings
  el.push(T(20, 234, 'By Platform', 13, C.text, { fw: 600 }));
  const platRev = [
    { name: 'Spotify',      amount: '$3,820', pct: 45, col: C.acc3 },
    { name: 'Apple Music',  amount: '$2,104', pct: 25, col: '#FC3C44' },
    { name: 'YouTube',      amount: '$1,516', pct: 18, col: '#FF0000' },
    { name: 'Tidal',        amount: '$676',   pct: 8,  col: C.acc   },
    { name: 'Other',        amount: '$296',   pct: 4,  col: C.muted },
  ];
  platRev.forEach((p, i) => {
    const py = 250 + i * 52;
    el.push(R(16, py, 358, 44, C.card, { rx: 10, stroke: C.bdr, sw: 0.5 }));
    el.push(R(28, py + 16, 10, 10, p.col, { rx: 3 }));
    el.push(T(46, py + 26, p.name, 12, C.text));
    el.push(R(172, py + 18, 120, 8, C.surf, { rx: 4 }));
    el.push(R(172, py + 18, Math.round(120 * p.pct / 50), 8, p.col, { rx: 4, op: 0.75 }));
    el.push(T(354, py + 26, p.amount, 12, C.sub, { anchor: 'end', fw: 500 }));
  });

  // Upcoming payout
  el.push(R(16, 518, 358, 80, C.card2, { rx: 14, stroke: C.bdr, sw: 1 }));
  el.push(T(32, 538, 'Next Payout', 11, C.sub));
  el.push(T(32, 560, '$8,412', 22, C.acc, { fw: 800 }));
  el.push(T(32, 578, 'Estimated · May 15, 2026', 10, C.muted));
  el.push(R(242, 528, 120, 40, C.acc, { rx: 10 }));
  el.push(T(302, 553, 'Withdraw ↗', 11, C.white, { anchor: 'middle', fw: 600 }));

  // Year to date
  el.push(T(20, 618, 'Year to Date', 13, C.text, { fw: 600 }));
  el.push(R(16, 634, 358, 78, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const ytdRev  = [4.2,5.1,6.8,8.4,0,0,0,0,0,0,0,0];
  months.forEach((m, i) => {
    const bx = 30 + i * 27;
    el.push(T(bx + 5, 706, m, 8, i < 4 ? C.sub : C.muted, { anchor: 'middle' }));
    if (ytdRev[i]) {
      const bh = ytdRev[i] * 6;
      el.push(R(bx, 700 - bh, 10, bh, C.acc, { rx: 2, op: i === 3 ? 1 : 0.55 }));
    }
  });
  el.push(T(354, 650, 'YTD: $24.5K', 11, C.acc, { anchor: 'end', fw: 600 }));

  bottomNav(el, 4);
  return { name: 'Revenue', elements: el };
}

// ─── SCREEN 6: Promote ───────────────────────────────────────────────────────
function screen6() {
  const el = [];
  el.push(R(0, 0, W, H, C.bg));
  statusBar(el);

  el.push(T(20, 68, 'Promote', 22, C.text, { fw: 700 }));
  el.push(T(20, 90, '3 active campaigns', 12, C.sub));
  // New campaign button
  el.push(R(248, 57, 126, 34, C.acc, { rx: 10 }));
  el.push(T(311, 78, '+ New Campaign', 11, C.white, { anchor: 'middle', fw: 600 }));

  // Active campaigns
  el.push(T(20, 112, 'Active', 13, C.text, { fw: 600 }));

  const campaigns = [
    {
      name: 'Midnight Tide — Playlist Push',
      status: 'Running',
      budget: '$250 / $500',
      reach: '48K',
      statusCol: C.acc3,
      barPct: 50,
    },
    {
      name: 'Album Drop — Social Boost',
      status: 'Running',
      budget: '$180 / $300',
      reach: '32K',
      statusCol: C.acc3,
      barPct: 60,
    },
    {
      name: 'Bioluminescence — Promo Tile',
      status: 'Paused',
      budget: '$80 / $200',
      reach: '12K',
      statusCol: C.amber,
      barPct: 40,
    },
  ];
  campaigns.forEach((c, i) => {
    const cy = 128 + i * 116;
    el.push(R(16, cy, 358, 106, C.card, { rx: 14, stroke: C.bdr, sw: 1 }));
    // status pill
    el.push(R(28, cy + 14, 58, 18, `${c.statusCol}22`, { rx: 9 }));
    el.push(Ci(34, cy + 23, 3, c.statusCol));
    el.push(T(40, cy + 26, c.status, 9, c.statusCol, { fw: 600 }));
    el.push(T(28, cy + 44, c.name, 12, C.text, { fw: 500 }));
    // Budget bar
    el.push(T(28, cy + 66, 'Budget', 10, C.sub));
    el.push(T(354, cy + 66, c.budget, 10, C.sub, { anchor: 'end' }));
    el.push(R(28, cy + 74, 304, 6, C.surf, { rx: 3 }));
    el.push(R(28, cy + 74, Math.round(304 * c.barPct / 100), 6, c.statusCol, { rx: 3, op: 0.75 }));
    el.push(T(28, cy + 96, `${c.reach} reached`, 11, C.sub, { fw: 500 }));
    el.push(T(354, cy + 96, 'Details →', 11, C.acc, { anchor: 'end' }));
  });

  // Recommendations
  el.push(T(20, 488, 'Recommended', 13, C.text, { fw: 600 }));
  const recs = [
    { title: 'Playlist Pitching',  desc: 'Submit to 14 editorial playlists', icon: '♫' },
    { title: 'Release Radar Boost', desc: 'Promote to followers on Friday',   icon: '⊞' },
  ];
  recs.forEach((r, i) => {
    const ry = 504 + i * 72;
    el.push(R(16, ry, 358, 60, C.card, { rx: 12, stroke: C.bdr, sw: 0.5, op: 0.7 }));
    el.push(R(26, ry + 12, 36, 36, C.glow, { rx: 10 }));
    el.push(T(44, ry + 36, r.icon, 16, C.acc, { anchor: 'middle' }));
    el.push(T(74, ry + 26, r.title, 13, C.text, { fw: 600 }));
    el.push(T(74, ry + 44, r.desc,  11, C.sub));
    el.push(R(286, ry + 16, 74, 28, C.surf, { rx: 8, stroke: C.bdr, sw: 1 }));
    el.push(T(323, ry + 34, 'Explore', 11, C.acc, { anchor: 'middle' }));
  });

  // Quick stats
  el.push(T(20, 658, 'Campaign Stats', 13, C.text, { fw: 600 }));
  el.push(R(16, 674, 358, 60, C.card, { rx: 12, stroke: C.bdr, sw: 1 }));
  el.push(T(32, 694, 'Total Reach', 11, C.sub));
  el.push(T(32, 714, '92K', 20, C.acc, { fw: 800 }));
  el.push(Li(140, 679, 140, 729, C.bdr, { sw: 1 }));
  el.push(T(160, 694, 'Saves', 11, C.sub));
  el.push(T(160, 714, '4,812', 20, C.acc3, { fw: 800 }));
  el.push(Li(265, 679, 265, 729, C.bdr, { sw: 1 }));
  el.push(T(283, 694, 'Spent', 11, C.sub));
  el.push(T(283, 714, '$510', 20, C.acc2, { fw: 800 }));

  bottomNav(el, 2);
  return { name: 'Promote', elements: el };
}

// ─── Assemble & Write ────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEl = screens.reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:        NAME,
    tagline:     TAGLINE,
    author:      'RAM',
    date:        new Date().toISOString().split('T')[0],
    theme:       'dark',
    heartbeat:   HEARTBEAT,
    elements:    totalEl,
    palette: {
      bg:      C.bg,
      surface: C.surf,
      accent:  C.acc,
      accent2: C.acc2,
      text:    C.text,
    },
    inspiration: 'darkmodedesign.com — QASE deep-navy bioluminescence aesthetic; saaspo.com — bento grid with product-glow hero; godly.website — deconstructed negative-space hero layouts',
    slug:        SLUG,
  },
  screens: screens.map(s => ({
    name:     s.name,
    width:    W,
    height:   H,
    svg:      `<rect width="${W}" height="${H}" fill="${C.bg}"/>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEl} elements`);
console.log(`Written: ${SLUG}.pen`);
