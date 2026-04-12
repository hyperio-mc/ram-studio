'use strict';
/**
 * SLAB — The independent publisher's studio
 * RAM Design Heartbeat #50 | Light theme
 *
 * Inspired by:
 * - Lapa Ninja: Serif revival trend (PP Editorial New, Canela in Daydream 1820, Unwell)
 * - minimal.gallery: Typography-as-layout (Immeasurable, Office CY oversized letterforms)
 * - Saaspo: Bento grid feature sections replacing linear lists
 *
 * New technique: oversized slab-serif letterforms as structural layout elements
 * Palette: warm cream editorial with single terracotta accent
 */

const fs   = require('fs');
const path = require('path');

const SLUG    = 'slab';
const W       = 390;
const H       = 844;
const BEAT    = 50;

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF7F2',   // warm cream
  surface:  '#FFFFFF',
  card:     '#F5F1EA',   // warm parchment
  cardB:    '#EEE8DE',   // deeper parchment
  text:     '#1A1714',   // near-black warm
  textSub:  '#5C5650',   // mid warm gray
  textMut:  '#9C958D',   // muted warm
  accent:   '#C4511A',   // terracotta
  accentLt: '#F5E6DD',   // terracotta tint
  accent2:  '#3D6B4F',   // editorial green
  acc2Lt:   '#E2EDE6',
  rule:     '#DDD7CE',   // warm hairline
  white:    '#FFFFFF',
};

// ── Primitives ────────────────────────────────────────────────────────────────
const els = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, w, h, fill };
  if (opts.rx)      el.rx      = opts.rx;
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.sw      = opts.sw;
  els.push(el);
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, size, fill };
  if (opts.fw)     el.fw     = opts.fw;
  if (opts.font)   el.font   = opts.font;
  if (opts.anchor) el.anchor = opts.anchor;
  if (opts.ls)     el.ls     = opts.ls;
  if (opts.opacity)el.opacity= opts.opacity;
  if (opts.lh)     el.lh     = opts.lh;
  els.push(el);
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.sw      = opts.sw;
  els.push(el);
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)      el.sw      = opts.sw;
  if (opts.opacity) el.opacity = opts.opacity;
  els.push(el);
  return el;
}

// ── Shared UI Components ──────────────────────────────────────────────────────

function statusBar(yBase) {
  // Warm status bar for light theme
  rect(0, yBase, W, 44, P.bg);
  text(20, yBase + 16, '9:41', 13, P.text, { fw: 600 });
  // Battery
  rect(W - 52, yBase + 16, 22, 11, 'none', { stroke: P.text, sw: 1.2, rx: 2, opacity: 0.5 });
  rect(W - 51, yBase + 17, 18, 9, P.text, { rx: 1, opacity: 0.5 });
  rect(W - 30, yBase + 19, 2, 5, P.text, { rx: 1, opacity: 0.5 });
  // Signal dots
  for (let i = 0; i < 4; i++) {
    rect(W - 100 + i * 8, yBase + 19 + (3 - i) * 1.5, 5, 5 + i * 2, P.text, { opacity: 0.5, rx: 1 });
  }
  // WiFi arcs approximated with circles
  circle(W - 66, yBase + 23, 5, 'none', { stroke: P.text, sw: 1.5, opacity: 0.5 });
  circle(W - 66, yBase + 23, 2.5, P.text, { opacity: 0.5 });
}

function navBar(yBase, activeIdx) {
  rect(0, yBase, W, 83, P.white, { stroke: P.rule, sw: 0.5 });
  // Home indicator
  rect(W/2 - 67, yBase + 66, 134, 5, P.text, { rx: 2.5, opacity: 0.2 });

  const items = [
    { label: 'Feed',      icon: 'home'    },
    { label: 'Write',     icon: 'edit'    },
    { label: 'Stats',     icon: 'bar'     },
    { label: 'Audience',  icon: 'users'   },
    { label: 'Revenue',   icon: 'dollar'  },
  ];
  const step = W / items.length;
  items.forEach((item, i) => {
    const cx = step * i + step / 2;
    const cy = yBase + 22;
    const isActive = i === activeIdx;
    const col = isActive ? P.accent : P.textMut;
    drawNavIcon(cx, cy, item.icon, col);
    text(cx, cy + 22, item.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 });
    if (isActive) {
      rect(cx - 16, yBase + 2, 32, 3, P.accent, { rx: 1.5 });
    }
  });
}

function drawNavIcon(cx, cy, icon, col) {
  switch (icon) {
    case 'home':
      // house
      rect(cx - 7, cy - 1, 14, 10, 'none', { stroke: col, sw: 1.5, rx: 1 });
      // roof triangle approx
      rect(cx - 9, cy - 5, 18, 6, 'none', { stroke: col, sw: 1.5 });
      break;
    case 'edit':
      rect(cx - 6, cy - 6, 12, 12, 'none', { stroke: col, sw: 1.5, rx: 1 });
      line(cx - 3, cy, cx + 3, cy, col, { sw: 1.5 });
      line(cx, cy - 3, cx, cy + 3, col, { sw: 1.5 });
      break;
    case 'bar':
      rect(cx - 7, cy + 3, 4, 4, col, { rx: 0.5 });
      rect(cx - 2, cy - 1, 4, 8, col, { rx: 0.5 });
      rect(cx + 3, cy - 5, 4, 12, col, { rx: 0.5 });
      break;
    case 'users':
      circle(cx - 3, cy - 2, 4, 'none', { stroke: col, sw: 1.5 });
      rect(cx - 9, cy + 4, 12, 6, 'none', { stroke: col, sw: 1.5, rx: 3 });
      circle(cx + 5, cy - 3, 3, 'none', { stroke: col, sw: 1.3 });
      rect(cx + 1, cy + 4, 9, 5, 'none', { stroke: col, sw: 1.3, rx: 2.5 });
      break;
    case 'dollar':
      circle(cx, cy, 7, 'none', { stroke: col, sw: 1.5 });
      line(cx, cy - 4, cx, cy + 4, col, { sw: 1.5 });
      line(cx - 3, cy - 1, cx + 3, cy - 1, col, { sw: 1.2 });
      line(cx - 3, cy + 1, cx + 3, cy + 1, col, { sw: 1.2 });
      break;
  }
}

function sectionLabel(x, y, label) {
  text(x, y, label.toUpperCase(), 10, P.textMut, { fw: 700, ls: '0.12em' });
}

// ── Screen helpers ─────────────────────────────────────────────────────────────

function makeScreen(name) {
  // Flush elements and return snapshot
  const start = els.length;
  return { name, start };
}

function finishScreen(screenDef, svgW, svgH) {
  const slice = els.splice(screenDef.start);
  // Build SVG
  let svgEls = '';
  slice.forEach(el => {
    switch (el.type) {
      case 'rect':
        svgEls += `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}"${el.rx?` rx="${el.rx}"`:''}${el.opacity?` opacity="${el.opacity}"`:''}${el.stroke?` stroke="${el.stroke}" stroke-width="${el.sw||1}"`:''}/>`;
        break;
      case 'text':
        svgEls += `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-family="${el.font||'Georgia, serif'}" font-weight="${el.fw||400}" text-anchor="${el.anchor||'start'}"${el.ls?` letter-spacing="${el.ls}"`:''}${el.opacity?` opacity="${el.opacity}"`:''}>${el.content}</text>`;
        break;
      case 'circle':
        svgEls += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${el.opacity?` opacity="${el.opacity}"`:''}${el.stroke?` stroke="${el.stroke}" stroke-width="${el.sw||1}"`:''}/>`;
        break;
      case 'line':
        svgEls += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}"${el.opacity?` opacity="${el.opacity}"`:''}/>`;
        break;
    }
  });
  return {
    name: screenDef.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">${svgEls}</svg>`,
    elements: slice,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Feed (Home)
// Typography-as-layout: Oversized "SLAB" letterform in background
// ═════════════════════════════════════════════════════════════════════════════
const s1 = makeScreen('Feed');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Oversized background letterform — typography-as-layout
// Huge "S" as structural bg element (minimal.gallery inspiration)
text(W/2, 140, 'S', 220, P.rule, { anchor: 'middle', font: 'Georgia, serif', fw: 700, opacity: 0.18 });

// Top bar
text(20, 62, 'slab', 22, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(20, 76, 'MORNING EDITION', 9, P.textMut, { fw: 600, ls: '0.14em' });

// Date editorial header
rect(W - 56, 56, 36, 36, P.accentLt, { rx: 6 });
text(W - 38, 68, 'APR', 8, P.accent, { anchor: 'middle', fw: 700, ls: '0.06em' });
text(W - 38, 82, '10', 18, P.accent, { anchor: 'middle', fw: 700, font: 'Georgia, serif' });

// Hairline rule (editorial)
line(20, 96, W - 20, 96, P.rule, { sw: 1 });

// Feature article card — editorial serif layout
rect(20, 108, W - 40, 148, P.white, { rx: 4, stroke: P.rule, sw: 0.5 });
// Category tag
rect(30, 118, 60, 18, P.accentLt, { rx: 3 });
text(60, 131, 'LONGFORM', 8, P.accent, { anchor: 'middle', fw: 700, ls: '0.08em' });
// Article headline — slab serif big
text(30, 162, 'The Quiet Revolution', 20, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(30, 178, 'in Independent Media', 20, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
// Deck copy
text(30, 196, 'How solo writers are outpacing newsrooms', 12, P.textSub);
// Meta
line(30, 206, 350, 206, P.rule, { sw: 0.5 });
circle(40, 222, 10, P.card, { stroke: P.rule, sw: 1 });
text(54, 218, 'Jordan Kim', 11, P.text, { fw: 500 });
text(54, 230, '4,821 readers · 8 min read', 10, P.textMut);
// Bookmark icon
circle(W - 40, 220, 10, P.card, { stroke: P.rule, sw: 1 });
text(W - 40, 225, '◈', 11, P.textSub, { anchor: 'middle' });

// Second article
rect(20, 268, W - 40, 100, P.white, { rx: 4, stroke: P.rule, sw: 0.5 });
rect(30, 278, 44, 16, P.acc2Lt, { rx: 3 });
text(52, 290, 'ESSAY', 8, P.accent2, { anchor: 'middle', fw: 700, ls: '0.08em' });
text(30, 312, 'Writing as Infrastructure', 16, P.text, { fw: 700, font: 'Georgia, serif' });
text(30, 328, 'The stack behind 10k subscribers', 12, P.textSub );
circle(40, 352, 8, P.card, { stroke: P.rule, sw: 1 });
text(52, 348, 'Alex Osei', 10, P.text, { fw: 500 });
text(52, 360, '2,104 · 5 min', 9, P.textMut );

// Third article (compact)
rect(20, 380, W - 40, 80, P.white, { rx: 4, stroke: P.rule, sw: 0.5 });
rect(30, 390, 52, 16, P.card, { rx: 3 });
text(56, 402, 'DISPATCH', 8, P.textMut, { anchor: 'middle', fw: 700, ls: '0.08em' });
text(30, 422, 'Notes from the Editorial Field', 15, P.text, { fw: 600, font: 'Georgia, serif' });
text(30, 438, '891 · 3 min', 10, P.textMut );
text(W - 40, 422, '→', 18, P.accent, { anchor: 'middle' });

// Section divider
sectionLabel(20, 478, 'Trending Today');
line(20, 484, W - 20, 484, P.rule, { sw: 0.5 });

// Trending list (bento-style compact cards)
const trends = [
  { rank: '01', title: 'AI and the Essay Form',       sub: '12.3K readers' },
  { rank: '02', title: 'Newsletter Monetisation 2026', sub: '8.9K readers'  },
  { rank: '03', title: 'The Return of the Zine',       sub: '6.1K readers'  },
];
trends.forEach((t, i) => {
  const ty = 494 + i * 52;
  rect(20, ty, W - 40, 44, P.white, { rx: 4, stroke: P.rule, sw: 0.5 });
  text(30, ty + 14, t.rank, 22, P.accentLt, { fw: 800, font: 'Georgia, serif' });
  text(30, ty + 13, t.rank, 22, P.accent, { fw: 800, font: 'Georgia, serif', opacity: 0.35 });
  text(62, ty + 17, t.title, 13, P.text, { fw: 600 });
  text(62, ty + 30, t.sub, 10, P.textMut );
  text(W - 30, ty + 22, '→', 14, P.textMut, { anchor: 'middle' });
});

navBar(H - 83, 0);

const scr1 = finishScreen(s1, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Write (Editor)
// Clean editorial writing interface — serif preview, minimal chrome
// ═════════════════════════════════════════════════════════════════════════════
const s2 = makeScreen('Write');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Top bar
rect(0, 44, W, 48, P.white, { stroke: P.rule, sw: 0.5 });
rect(16, 56, 50, 24, P.accentLt, { rx: 4 });
text(41, 73, 'DRAFT', 9, P.accent, { anchor: 'middle', fw: 700, ls: '0.08em' });
text(W/2, 73, 'Untitled piece', 14, P.text, { anchor: 'middle', fw: 500 });
rect(W - 76, 57, 60, 22, P.accent, { rx: 4 });
text(W - 46, 72, 'Publish', 12, P.white, { anchor: 'middle', fw: 600 });

// Bento-style writing stats bar
rect(20, 102, W - 40, 52, P.white, { rx: 6, stroke: P.rule, sw: 0.5 });
const wStats = [
  { label: 'Words', val: '847'  },
  { label: 'Read',  val: '4m'   },
  { label: 'Grade', val: '11'   },
  { label: 'Score', val: '94%'  },
];
const sw = (W - 40) / 4;
wStats.forEach((s, i) => {
  const sx = 20 + i * sw + sw/2;
  text(sx, 121, s.val, 16, i === 0 ? P.accent : P.text, { anchor: 'middle', fw: 700, font: 'Georgia, serif' });
  text(sx, 135, s.label, 9, P.textMut, { anchor: 'middle', ls: '0.06em' });
  if (i < 3) line(20 + (i+1)*sw, 112, 20 + (i+1)*sw, 148, P.rule, { sw: 0.5 });
});

// Editorial divider
line(20, 163, W - 20, 163, P.rule, { sw: 0.5 });
text(20, 177, 'THE QUIET REVOLUTION', 11, P.textMut, { fw: 700, ls: '0.12em' });
text(W - 20, 177, 'In Independent Media', 11, P.textSub, { anchor: 'end', fw: 400, font: 'Georgia, serif' });
line(20, 184, W - 20, 184, P.rule, { sw: 0.5 });

// Writing canvas
rect(20, 192, W - 40, 380, P.white, { rx: 4, stroke: P.rule, sw: 0.5 });

// Large serif headline in editor
text(32, 228, 'Something is shifting', 22, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(32, 250, 'in how we read.', 22, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });

// Drop cap
rect(32, 262, 28, 36, P.accentLt, { rx: 3 });
text(46, 290, 'I', 26, P.accent, { anchor: 'middle', fw: 700, font: 'Georgia, serif' });

// Body text lines (simulated)
const bodyLines = [
  { x: 68,  y: 272, w: W - 108, t: 'n 2026, the independent newsletter has become',    full: true },
  { x: 32,  y: 287, w: W - 64,  t: 'something more than a side project. With tools like', full: true },
  { x: 32,  y: 302, w: W - 90,  t: 'SLAB, a single writer can reach audiences that',     full: true },
  { x: 32,  y: 317, w: W - 64,  t: 'rival established media outlets — without the',       full: true },
  { x: 32,  y: 332, w: W - 64,  t: 'overhead, the editorial layers, or the paywall.',     full: true },
];
bodyLines.forEach(bl => {
  text(bl.x, bl.y, bl.t, 13, P.text, { lh: 1.6 });
});

// Cursor blink
rect(32, 340, 2, 16, P.accent, { rx: 1 });

// Pull quote
rect(32, 362, W - 64, 50, P.card, { rx: 4 });
line(32, 362, 32, 412, P.accent, { sw: 3 });
text(44, 378, '"The essay is the last form', 13, P.text, { fw: 500, font: 'Georgia, serif' });
text(44, 394, 'where thinking is visible."', 13, P.text, { fw: 500, font: 'Georgia, serif' });
text(44, 407, '— Notes on writing', 10, P.textMut );

// Floating toolbar
rect(W/2 - 100, 548, 200, 40, P.text, { rx: 8 });
const tools = ['B', 'I', 'H', '¶', '»', '✤'];
tools.forEach((t, i) => {
  const tx = W/2 - 100 + 16 + i * 34;
  text(tx + 8, 574, t, 14, i === 5 ? P.accent : P.white, { anchor: 'middle', fw: i < 2 ? 700 : 400 });
  if (i < 5) line(tx + 26, 558, tx + 26, 578, '#FFFFFF', { sw: 0.5, opacity: 0.15 });
});

navBar(H - 83, 1);

const scr2 = finishScreen(s2, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Stats (Analytics)
// Bento grid layout — modular metric cards
// ═════════════════════════════════════════════════════════════════════════════
const s3 = makeScreen('Stats');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Header
text(20, 66, 'Stats', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(20, 80, 'Past 30 days', 12, P.textMut );

// Period toggle
rect(W - 120, 54, 100, 28, P.card, { rx: 6, stroke: P.rule, sw: 0.5 });
text(W - 82, 73, '30d', 12, P.accent, { anchor: 'middle', fw: 600 });
rect(W - 70, 57, 44, 22, P.accentLt, { rx: 4 });
text(W - 70 + 22, 72, '30d', 11, P.accent, { anchor: 'middle', fw: 600 });
text(W - 26, 73, '7d', 11, P.textMut, { anchor: 'middle' });

line(20, 92, W - 20, 92, P.rule, { sw: 0.5 });

// ── BENTO GRID — main metrics ──────────────────────────────────────────────
// Row 1: two half-width cards
const bW = (W - 48) / 2;
// Card 1: Total Reads
rect(20, 100, bW, 90, P.white, { rx: 8, stroke: P.rule, sw: 0.5 });
sectionLabel(32, 118, 'Total Reads');
text(32, 152, '47,821', 30, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
rect(32, 162, 44, 16, P.acc2Lt, { rx: 4 });
text(54, 174, '+18.3%', 9, P.accent2, { anchor: 'middle', fw: 700 });

// Card 2: New Subscribers
rect(W/2 + 4, 100, bW, 90, P.accent, { rx: 8 });
sectionLabel(W/2 + 16, 118, 'New Subs');
text(W/2 + 16, 118, 'NEW SUBS', 10, 'rgba(255,255,255,0.6)', { fw: 700, ls: '0.12em' });
text(W/2 + 16, 152, '1,204', 30, P.white, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
rect(W/2 + 16, 162, 56, 16, 'rgba(255,255,255,0.2)', { rx: 4 });
text(W/2 + 16 + 28, 174, '+23.7%', 9, P.white, { anchor: 'middle', fw: 700 });

// Row 2: full-width sparkline card
rect(20, 200, W - 40, 100, P.white, { rx: 8, stroke: P.rule, sw: 0.5 });
sectionLabel(32, 218, 'Daily Reads');
// Sparkline
const spData = [120, 180, 140, 220, 190, 260, 280, 240, 310, 295, 330, 380, 360, 420, 390, 450, 440, 480, 510, 495, 530, 560, 545, 580, 610, 595, 630, 650, 635, 680];
const spW = W - 80; const spH = 52; const spX = 32; const spY = 232;
const spMax = Math.max(...spData); const spMin = Math.min(...spData);
// Draw bars
spData.forEach((v, i) => {
  const bx = spX + i * (spW / spData.length);
  const bh = ((v - spMin) / (spMax - spMin)) * spH;
  rect(bx, spY + spH - bh, spW / spData.length - 1, bh, i === spData.length - 1 ? P.accent : P.rule, { rx: 1 });
});
text(32, 294, '30-day trend ↑ 23.7%', 10, P.accent2, { fw: 600 });
text(W - 32, 294, '680 peak', 10, P.textMut, { anchor: 'end' });

// Row 3: three small bento cards
const sW3 = (W - 52) / 3;
const bentoData = [
  { label: 'Open Rate',   val: '58%',   sub: 'vs 42% avg', col: P.acc2Lt,  tc: P.accent2 },
  { label: 'CTR',         val: '12.4%', sub: '+3.1% wk',   col: P.accentLt, tc: P.accent  },
  { label: 'Avg Read',    val: '4m 20s',sub: 'full reads',  col: P.card,    tc: P.textSub },
];
bentoData.forEach((b, i) => {
  const bx = 20 + i * (sW3 + 6);
  rect(bx, 312, sW3, 80, b.col, { rx: 8 });
  text(bx + 10, 330, b.label.toUpperCase(), 8, b.tc, { fw: 700, ls: '0.08em', opacity: 0.7 });
  text(bx + 10, 358, b.val, 18, b.tc, { fw: 700, font: 'Georgia, serif' });
  text(bx + 10, 372, b.sub, 9, b.tc, { opacity: 0.7 });
});

// Row 4: Top pieces
sectionLabel(20, 410, 'Top Pieces This Month');
line(20, 416, W - 20, 416, P.rule, { sw: 0.5 });

const pieces = [
  { rank: '01', title: 'The Quiet Revolution',        reads: '12,841', badge: '▲ new'  },
  { rank: '02', title: 'Writing as Infrastructure',   reads: '9,204',  badge: '↑ +4'   },
  { rank: '03', title: 'Notes from the Field',        reads: '6,831',  badge: '—'      },
  { rank: '04', title: 'On Algorithmic Memory',       reads: '4,320',  badge: '↑ +2'   },
];
pieces.forEach((p, i) => {
  const py = 428 + i * 48;
  rect(20, py, W - 40, 40, P.white, { rx: 6, stroke: P.rule, sw: 0.5 });
  text(32, py + 16, p.rank, 14, P.rule, { fw: 800, font: 'Georgia, serif' });
  text(32, py + 15, p.rank, 14, P.accent, { fw: 800, font: 'Georgia, serif', opacity: 0.4 });
  text(60, py + 17, p.title, 13, P.text, { fw: 600 });
  text(60, py + 30, p.reads + ' reads', 10, P.textMut );
  const bCol = p.badge.includes('new') ? P.accentLt : (p.badge === '—' ? P.card : P.acc2Lt);
  const bTxt = p.badge.includes('new') ? P.accent  : (p.badge === '—' ? P.textMut : P.accent2);
  rect(W - 66, py + 11, 46, 16, bCol, { rx: 4 });
  text(W - 43, py + 23, p.badge, 9, bTxt, { anchor: 'middle', fw: 600 });
});

navBar(H - 83, 2);

const scr3 = finishScreen(s3, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Audience (Subscribers)
// Editorial list with slab-serif numbered counts
// ═════════════════════════════════════════════════════════════════════════════
const s4 = makeScreen('Audience');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Header
text(20, 66, 'Audience', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(20, 80, '4,821 total subscribers', 12, P.textMut );

// Search bar
rect(20, 90, W - 40, 36, P.white, { rx: 8, stroke: P.rule, sw: 0.5 });
circle(36, 108, 7, 'none', { stroke: P.textMut, sw: 1.5 });
line(40, 113, 44, 117, P.textMut, { sw: 1.5 });
text(52, 113, 'Search subscribers…', 12, P.textMut );

// Sub count bento strip
rect(20, 136, W - 40, 60, P.text, { rx: 8 });
const subStats = [
  { label: 'Free',    val: '3,614', pct: '75%' },
  { label: 'Paid',    val: '1,012', pct: '21%' },
  { label: 'Gifted',  val: '195',   pct: '4%'  },
];
subStats.forEach((s, i) => {
  const sx = 20 + 12 + i * 118;
  text(sx, 156, s.val, 20, i === 1 ? P.accent : P.white, { fw: 700, font: 'Georgia, serif' });
  text(sx, 170, s.label, 9, 'rgba(255,255,255,0.5)', { ls: '0.08em', fw: 600 });
  text(sx + 60, 156, s.pct, 11, 'rgba(255,255,255,0.35)', { fw: 500 });
  if (i < 2) line(sx + 108, 144, sx + 108, 188, 'rgba(255,255,255,0.1)', { sw: 0.5 });
});

// Filter chips
const chips = ['All', 'Paid', 'Active', 'At-risk', 'New'];
let cx2 = 20;
chips.forEach((c, i) => {
  const cw = c.length * 7 + 20;
  rect(cx2, 208, cw, 24, i === 0 ? P.accent : P.card, { rx: 12, stroke: i === 0 ? 'none' : P.rule, sw: 0.5 });
  text(cx2 + cw/2, 224, c, 11, i === 0 ? P.white : P.textSub, { anchor: 'middle', fw: i === 0 ? 600 : 400 });
  cx2 += cw + 8;
});

// Recent subscribers list
sectionLabel(20, 250, 'Recent Subscribers');
line(20, 256, W - 20, 256, P.rule, { sw: 0.5 });

const subs = [
  { name: 'Maria Santos',    plan: 'Paid · $9/mo',    joined: '2h ago',  avatar: 'MS' },
  { name: 'Dev Patel',       plan: 'Free',             joined: '4h ago',  avatar: 'DP' },
  { name: 'Claire Fontaine', plan: 'Paid · $9/mo',    joined: 'Yesterday',avatar: 'CF' },
  { name: 'Tariq Ibrahim',   plan: 'Gifted · 1yr',    joined: '2d ago',  avatar: 'TI' },
  { name: 'Sophie Chen',     plan: 'Paid · $9/mo',    joined: '3d ago',  avatar: 'SC' },
];

subs.forEach((s, i) => {
  const sy = 264 + i * 60;
  rect(20, sy, W - 40, 52, P.white, { rx: 6, stroke: P.rule, sw: 0.5 });
  // Avatar
  const avColors = [P.accent, P.accent2, P.accentLt, P.acc2Lt, P.card];
  const avTColors = [P.white, P.white, P.accent, P.accent2, P.textSub];
  circle(48, sy + 26, 18, avColors[i % avColors.length]);
  text(48, sy + 31, s.avatar, 10, avTColors[i % avTColors.length], { anchor: 'middle', fw: 700 });
  // Info
  text(74, sy + 21, s.name, 13, P.text, { fw: 600 });
  const isPaid = s.plan.includes('Paid');
  rect(74, sy + 28, isPaid ? 54 : 26, 14, isPaid ? P.accentLt : P.card, { rx: 4 });
  text(74 + (isPaid ? 27 : 13), sy + 38, isPaid ? '$9/mo' : 'Free', 8, isPaid ? P.accent : P.textMut, { anchor: 'middle', fw: 600 });
  // Joined
  text(W - 30, sy + 21, s.joined, 10, P.textMut, { anchor: 'end' });
  // Actions row
  text(74 + (isPaid ? 60 : 32), sy + 37, s.plan.split('·')[0].trim(), 10, P.textMut );
});

navBar(H - 83, 3);

const scr4 = finishScreen(s4, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Revenue
// Editorial financials with slab serif numbers
// ═════════════════════════════════════════════════════════════════════════════
const s5 = makeScreen('Revenue');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Header
text(20, 66, 'Revenue', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(20, 80, 'April 2026', 12, P.textMut );

// Hero revenue card — large slab serif
rect(20, 92, W - 40, 120, P.text, { rx: 10 });
text(32, 116, 'MRR', 10, 'rgba(255,255,255,0.45)', { fw: 700, ls: '0.14em' });
text(32, 156, '$9,108', 48, P.white, { fw: 700, font: 'Georgia, serif', ls: '-0.03em' });
rect(32, 166, 80, 20, 'rgba(255,255,255,0.1)', { rx: 4 });
text(72, 180, '↑ +$1,204 this mo.', 10, P.white, { anchor: 'middle', fw: 500, opacity: 0.8 });
// Mini ARR
text(W - 32, 116, 'ARR', 10, 'rgba(255,255,255,0.45)', { anchor: 'end', fw: 700, ls: '0.14em' });
text(W - 32, 156, '$109K', 28, P.white, { anchor: 'end', fw: 700, font: 'Georgia, serif' });
// Small target bar
rect(W - 108, 164, 76, 4, 'rgba(255,255,255,0.2)', { rx: 2 });
rect(W - 108, 164, 54, 4, P.accent, { rx: 2 });
text(W - 32, 180, '71% of $150K goal', 9, 'rgba(255,255,255,0.5)', { anchor: 'end' });

// Revenue breakdown — bento grid
const revItems = [
  { label: 'Paid Subs',     val: '$9,108',  pct: 100, col: P.white    },
  { label: 'Tips',          val: '$284',    pct: 31,  col: P.accentLt },
  { label: 'Sponsorships',  val: '$1,200',  pct: 13,  col: P.acc2Lt   },
  { label: 'Courses',       val: '$540',    pct: 6,   col: P.card     },
];
revItems.forEach((r, i) => {
  const ry = 224 + Math.floor(i / 2) * 80;
  const rx2 = 20 + (i % 2) * ((W - 48) / 2 + 8);
  const rw = (W - 48) / 2;
  rect(rx2, ry, rw, 72, r.col, { rx: 8, stroke: P.rule, sw: 0.5 });
  text(rx2 + 12, ry + 18, r.label.toUpperCase(), 8, P.textMut, { fw: 700, ls: '0.08em' });
  text(rx2 + 12, ry + 46, r.val, 22, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
  // Progress bar
  rect(rx2 + 12, ry + 56, rw - 24, 6, P.rule, { rx: 3 });
  rect(rx2 + 12, ry + 56, (rw - 24) * r.pct / 100, 6, i === 0 ? P.accent : P.accent2, { rx: 3 });
});

// Payout section
sectionLabel(20, 390, 'Upcoming Payout');
line(20, 396, W - 20, 396, P.rule, { sw: 0.5 });

rect(20, 404, W - 40, 72, P.acc2Lt, { rx: 8 });
text(32, 426, 'Next payout', 12, P.accent2, { fw: 600 });
text(32, 450, '$8,642.40', 28, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(32, 464, 'Scheduled: May 1, 2026 · Stripe', 10, P.textSub );
rect(W - 90, 415, 70, 28, P.accent2, { rx: 6 });
text(W - 55, 434, 'View →', 12, P.white, { anchor: 'middle', fw: 600 });

// Monthly trend bars
sectionLabel(20, 492, 'Monthly Revenue');
line(20, 498, W - 20, 498, P.rule, { sw: 0.5 });

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const mRevs  = [5200, 6100, 6800, 7400, 7900, 9108];
const mMax   = Math.max(...mRevs);
const mbW    = (W - 40) / months.length - 4;
months.forEach((m, i) => {
  const mx   = 20 + i * ((W - 40) / months.length) + 2;
  const bh   = ((mRevs[i] / mMax) * 90);
  const isLast = i === months.length - 1;
  rect(mx, 556 - bh + 48, mbW, bh, isLast ? P.accent : P.rule, { rx: 3 });
  text(mx + mbW / 2, 614, m, 9, P.textMut, { anchor: 'middle' });
  if (isLast) {
    text(mx + mbW / 2, 556 - bh + 42, '$9.1K', 9, P.accent, { anchor: 'middle', fw: 700 });
  }
});

navBar(H - 83, 4);

const scr5 = finishScreen(s5, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Publication Settings
// Typography-as-layout: "SLAB" large display type framing the settings
// ═════════════════════════════════════════════════════════════════════════════
const s6 = makeScreen('Settings');

rect(0, 0, W, H, P.bg);
statusBar(0);

// Oversized background "SLAB" — typography as spatial structure
text(W/2, 320, 'SLAB', 140, P.rule, { anchor: 'middle', font: 'Georgia, serif', fw: 800, ls: '-0.04em', opacity: 0.08 });

// Header
text(20, 66, 'Publication', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: '-0.02em' });
text(20, 80, 'Identity & settings', 12, P.textMut );

// Publication identity card
rect(20, 92, W - 40, 88, P.white, { rx: 8, stroke: P.rule, sw: 0.5 });
// Logo area
rect(32, 104, 52, 52, P.accentLt, { rx: 8 });
text(58, 138, 'S', 36, P.accent, { anchor: 'middle', fw: 800, font: 'Georgia, serif' });
// Details
text(96, 120, 'The Slab Review', 16, P.text, { fw: 700, font: 'Georgia, serif' });
text(96, 135, 'theblabreviw.slab.pub', 11, P.textMut );
text(96, 150, '↑ 23% growth · 4,821 subscribers', 10, P.accent2, { fw: 500 });
// Edit button
rect(W - 66, 112, 46, 22, P.card, { rx: 6, stroke: P.rule, sw: 0.5 });
text(W - 43, 127, 'Edit', 11, P.text, { anchor: 'middle', fw: 500 });

// Settings sections
const settingsGroups = [
  {
    title: 'Content',
    items: [
      { label: 'Publication name',    val: 'The Slab Review', arrow: true  },
      { label: 'Description',         val: 'Long-form journalism…',  arrow: true  },
      { label: 'Categories',          val: 'Essays, Culture', arrow: true  },
    ],
  },
  {
    title: 'Monetisation',
    items: [
      { label: 'Paid subscription',   val: '$9/month',  arrow: true  },
      { label: 'Free tier access',    val: '3 posts/mo', arrow: true  },
      { label: 'Tip jar',             val: 'Enabled',   toggle: true, on: true  },
    ],
  },
  {
    title: 'Delivery',
    items: [
      { label: 'Send day & time',     val: 'Thu · 8am EST', arrow: true  },
      { label: 'Email subject style', val: 'Editorial',     arrow: true  },
      { label: 'Notify on comment',   val: '',              toggle: true, on: false },
    ],
  },
];

let yS = 190;
settingsGroups.forEach(group => {
  sectionLabel(20, yS, group.title);
  yS += 14;
  rect(20, yS, W - 40, group.items.length * 44, P.white, { rx: 8, stroke: P.rule, sw: 0.5 });
  group.items.forEach((item, ii) => {
    const iy = yS + ii * 44;
    text(32, iy + 18, item.label, 13, P.text, { fw: 500 });
    if (item.toggle) {
      const ton = item.on;
      rect(W - 60, iy + 8, 40, 22, ton ? P.accent : P.rule, { rx: 11 });
      circle(ton ? W - 26 : W - 42, iy + 19, 9, P.white);
    } else if (item.val) {
      text(W - 36, iy + 18, item.val, 11, P.textMut, { anchor: 'end' });
      text(W - 26, iy + 18, '›', 16, P.textMut, { anchor: 'middle' });
    }
    if (ii < group.items.length - 1) line(32, iy + 44, W - 32, iy + 44, P.rule, { sw: 0.5 });
  });
  yS += group.items.length * 44 + 14;
});

// Danger zone
sectionLabel(20, yS, 'Danger Zone');
yS += 14;
rect(20, yS, W - 40, 44, P.white, { rx: 8, stroke: '#F5C5B0', sw: 1 });
text(32, yS + 18, 'Archive publication', 13, '#C4511A', { fw: 500 });
text(W - 28, yS + 18, '›', 16, '#C4511A', { anchor: 'middle' });

navBar(H - 83, 4); // no active tab for settings

const scr6 = finishScreen(s6, W, H);

// ═════════════════════════════════════════════════════════════════════════════
// ASSEMBLE PEN FILE
// ═════════════════════════════════════════════════════════════════════════════
const totalElements = [scr1, scr2, scr3, scr4, scr5, scr6].reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'SLAB — The independent publisher\'s studio',
    author:    'RAM',
    date:      new Date().toISOString().slice(0, 10),
    theme:     'light',
    heartbeat: BEAT,
    elements:  totalElements,
    slug:      SLUG,
    tagline:   "The independent publisher's studio",
    archetype: 'content-publishing',
    palette: {
      bg:      P.bg,
      surface: P.surface,
      text:    P.text,
      accent:  P.accent,
      accent2: P.accent2,
      muted:   P.textMut,
    },
    inspiration: [
      'Lapa Ninja — serif revival (PP Editorial New, Canela in Daydream 1820, Unwell)',
      'minimal.gallery — typography-as-layout (Immeasurable, Office CY)',
      'Saaspo — bento grid feature sections replacing linear lists',
    ],
  },
  screens: [scr1, scr2, scr3, scr4, scr5, scr6].map(s => ({
    name:     s.name,
    svg:      s.svg,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`SLAB: 6 screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
