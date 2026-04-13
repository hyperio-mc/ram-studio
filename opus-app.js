'use strict';
// OPUS — Creative Portfolio Journal
// Heartbeat #500 | Light theme
// Inspired by: minimal.gallery's editorial serif renaissance (Early Works, Clim Studio)
//              + Notion's warm cream palette (Saaspo/Land-book research)
//              + Center-column asymmetric editorial layouts from minimal.gallery

const fs   = require('fs');
const path = require('path');

const SLUG = 'opus';

// ─── Palette (warm cream editorial) ─────────────────────────────────────────
const BG      = '#FAF8F4';  // warm cream — Notion/minimal.gallery inspired
const SURF    = '#FFFFFF';
const CARD    = '#F3EFE8';  // warm off-white card
const CARD2   = '#EDE8DF';  // slightly deeper card
const TEXT    = '#1C1917';  // near-black warm ink
const TEXT2   = '#4B4540';  // secondary text
const MUTED   = 'rgba(28,25,23,0.4)';
const ACC     = '#B5673E';  // warm terracotta — "one warm accent" trend
const ACC2    = '#3D5A80';  // muted steel blue — subtle complement
const BORDER  = 'rgba(28,25,23,0.1)';
const SERIF   = 'Georgia, serif'; // editorial serif (simulates Canela/GT Alpina)

// ─── Primitives ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    sw: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, size, fill,
    fw: opts.fw ?? 400,
    font: opts.font ?? 'Inter, sans-serif',
    anchor: opts.anchor ?? 'start',
    ls: opts.ls ?? '0',
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    sw: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    sw: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

const W = 390, H = 844;

// ─── Shared UI Components ────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 30, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(340, 30, '●●● ▲ ▮▮', 11, TEXT, { anchor: 'end', opacity: 0.5 }));
}

function navBar(els, activeIdx) {
  // Minimal editorial nav — text only, no icons
  els.push(rect(0, H - 64, W, 64, SURF));
  els.push(line(0, H - 64, W, H - 64, BORDER, { sw: 0.5 }));
  const labels = ['Work', 'Journal', 'Gallery', 'Share'];
  const xs = [40, 120, 230, 330];
  labels.forEach((lbl, i) => {
    const active = i === activeIdx;
    els.push(text(xs[i], H - 34, lbl, active ? 12 : 11, active ? ACC : TEXT2,
      { fw: active ? 700 : 400, font: active ? 'Inter, sans-serif' : 'Inter, sans-serif', anchor: 'middle' }));
    if (active) {
      els.push(rect(xs[i] - 16, H - 10, 32, 2, ACC, { rx: 1 }));
    }
  });
}

function topBar(els, title, subtitle) {
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 74, title, 22, TEXT, { fw: 300, font: SERIF, ls: '-0.02em' }));
  if (subtitle) els.push(text(20, 90, subtitle, 11, TEXT2, { opacity: 0.6 }));
}

// ─── Decorative elements ─────────────────────────────────────────────────────
function addDecorativeDots(els, x, y, cols, rows, fill, spacing = 10) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      els.push(circle(x + c * spacing, y + r * spacing, 1, fill, { opacity: 0.12 }));
    }
  }
}

function addRuledLines(els, x, y, w, count, spacing = 14, col = BORDER) {
  for (let i = 0; i < count; i++) {
    els.push(line(x, y + i * spacing, x + w, y + i * spacing, col, { sw: 0.4, opacity: 0.5 }));
  }
}

function addPaletteSwatches(els, x, y, colors) {
  colors.forEach((c, i) => {
    els.push(circle(x + i * 18, y, 6, c));
  });
}

function addMiniBarChart(els, x, y, data, maxH, barW, col) {
  data.forEach((v, i) => {
    const bH = (v / 100) * maxH;
    els.push(rect(x + i * (barW + 3), y + maxH - bH, barW, bH, col, { rx: 2, opacity: 0.3 + v / 200 }));
  });
}

function addTagRow(els, x, y, tags) {
  let tx = x;
  tags.forEach(t => {
    const tw = t.length * 7 + 16;
    els.push(rect(tx, y - 11, tw, 20, CARD2, { rx: 10 }));
    els.push(text(tx + tw / 2, y + 2, t, 10, TEXT2, { anchor: 'middle', opacity: 0.7 }));
    tx += tw + 6;
  });
}

// ─── SCREEN 1: DASHBOARD / HOME ──────────────────────────────────────────────
function screenDashboard() {
  const els = [];
  els.push(rect(0, 0, W, H, BG)); // background
  statusBar(els);

  // Masthead — editorial top header
  els.push(rect(0, 44, W, 80, BG));
  els.push(text(20, 78, 'OPUS', 28, TEXT, { fw: 700, ls: '0.08em' })); // wordmark
  els.push(text(W - 20, 74, 'Portfolio Journal', 11, TEXT2, { anchor: 'end', opacity: 0.6 }));
  els.push(line(0, 108, W, 108, BORDER, { sw: 0.5 }));
  // Decorative dot grid behind masthead
  addDecorativeDots(els, W - 80, 48, 7, 5, TEXT, 10);

  // Date editorial header
  els.push(text(20, 132, 'April 2026', 11, TEXT2, { fw: 500, ls: '0.06em', opacity: 0.55 }));
  els.push(text(20, 160, 'In Progress', 36, TEXT, { fw: 300, font: SERIF, ls: '-0.03em' }));
  els.push(text(20, 180, '4 active projects', 12, TEXT2, { opacity: 0.55 }));

  // Active project cards — asymmetric stagger
  const projects = [
    { title: 'Brand Identity System', client: 'Helios Studio', pct: 78, col: ACC },
    { title: 'Dashboard Redesign', client: 'Orbital Tech', pct: 42, col: ACC2 },
    { title: 'Editorial Typeface', client: 'Personal', pct: 23, col: TEXT },
  ];

  let y = 205;
  projects.forEach((p, i) => {
    const cardH = 88;
    const xOff = i % 2 === 1 ? 16 : 0; // slight offset on alternating cards for asymmetry
    els.push(rect(xOff + 20, y, W - 40 - xOff, cardH, SURF, { rx: 4, stroke: BORDER, sw: 0.5 }));

    // Progress bar background
    els.push(rect(xOff + 20, y + cardH - 4, W - 40 - xOff, 4, CARD, { rx: 2 }));
    // Progress bar fill
    const pW = (W - 40 - xOff) * (p.pct / 100);
    els.push(rect(xOff + 20, y + cardH - 4, pW, 4, p.col, { rx: 2 }));

    // Card content
    els.push(text(xOff + 36, y + 24, p.title, 14, TEXT, { fw: 500 }));
    els.push(text(xOff + 36, y + 42, p.client, 11, TEXT2, { opacity: 0.6 }));
    els.push(text(W - 36, y + 24, `${p.pct}%`, 13, p.col, { fw: 700, anchor: 'end' }));
    // Status dot
    els.push(circle(xOff + 30, y + 28, 4, p.col, { opacity: 0.8 }));

    y += cardH + 10;
  });

  // Divider
  els.push(line(20, y + 4, W - 20, y + 4, BORDER, { sw: 0.5 }));
  y += 20;

  // Recent activity section — editorial layout
  els.push(text(20, y + 18, 'Recent', 11, TEXT2, { fw: 500, ls: '0.05em', opacity: 0.55 }));
  y += 30;

  const activity = [
    { action: 'Added 3 case studies to Helios', time: '2h ago' },
    { action: 'Exported dashboard mockups', time: 'Yesterday' },
    { action: 'New journal entry: On negative space', time: '2 days ago' },
  ];
  activity.forEach(a => {
    els.push(text(20, y, '—', 12, ACC, { fw: 700 }));
    els.push(text(36, y, a.action, 12, TEXT, { fw: 400 }));
    els.push(text(W - 20, y, a.time, 10, TEXT2, { anchor: 'end', opacity: 0.5 }));
    y += 24;
  });

  // Mini activity sparkline chart
  els.push(text(20, y + 28, 'Weekly views', 10, TEXT2, { opacity: 0.5 }));
  addMiniBarChart(els, 20, y + 32, [40, 55, 35, 70, 90, 65, 80], 36, 14, ACC);
  // Day labels
  ['M','T','W','T','F','S','S'].forEach((d, i) => {
    els.push(text(27 + i * 17, y + 80, d, 8, TEXT2, { anchor: 'middle', opacity: 0.4 }));
  });
  // Total views label
  els.push(text(W - 20, y + 50, '1,247 views', 11, TEXT, { fw: 600, anchor: 'end' }));
  els.push(text(W - 20, y + 64, 'this week', 9, TEXT2, { anchor: 'end', opacity: 0.5 }));

  navBar(els, 0);
  return { name: 'Dashboard', elements: els };
}

// ─── SCREEN 2: PROJECT DETAIL ─────────────────────────────────────────────────
function screenProject() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Back nav + header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 74, '← Work', 12, TEXT2, { opacity: 0.7 }));

  els.push(line(0, 96, W, 96, BORDER, { sw: 0.5 }));

  // Project header — editorial serif large
  els.push(rect(0, 96, W, 110, CARD));
  els.push(text(20, 126, 'Brand Identity', 34, TEXT, { fw: 300, font: SERIF, ls: '-0.03em' }));
  els.push(text(20, 156, 'System', 34, TEXT, { fw: 300, font: SERIF, ls: '-0.03em' }));
  els.push(text(20, 180, 'Helios Studio · 2026', 11, TEXT2, { opacity: 0.55, ls: '0.02em' }));

  // Status chips
  els.push(rect(20, 192, 68, 18, ACC, { rx: 9 }));
  els.push(text(54, 204, 'In Progress', 9, SURF, { fw: 600, anchor: 'middle' }));
  els.push(rect(96, 192, 52, 18, CARD2, { rx: 9 }));
  els.push(text(122, 204, 'Brand', 9, TEXT, { fw: 600, anchor: 'middle', opacity: 0.7 }));

  // Thumbnail strip (simulated) — editorial image block
  const imgY = 222;
  els.push(rect(20, imgY, 165, 88, CARD2, { rx: 4 }));
  els.push(text(102, imgY + 36, '[ LOGO ]', 10, TEXT2, { anchor: 'middle', opacity: 0.4 }));
  els.push(rect(193, imgY, 177, 88, CARD, { rx: 4 }));
  els.push(text(281, imgY + 36, '[ PALETTE ]', 10, TEXT2, { anchor: 'middle', opacity: 0.4 }));
  els.push(rect(20, imgY + 96, 350, 56, CARD, { rx: 4 }));
  els.push(text(195, imgY + 124, '[ TYPOGRAPHY SPECIMEN ]', 10, TEXT2, { anchor: 'middle', opacity: 0.4 }));

  // Deliverables list — editorial checklist
  const dlY = 398;
  els.push(line(20, dlY, W - 20, dlY, BORDER, { sw: 0.5 }));
  els.push(text(20, dlY + 20, 'Deliverables', 11, TEXT2, { fw: 500, ls: '0.05em', opacity: 0.55 }));

  const deliverables = [
    { item: 'Primary wordmark', done: true },
    { item: 'Brand colour system', done: true },
    { item: 'Typography pairing guide', done: true },
    { item: 'Icon & symbol set', done: false },
    { item: 'Brand guidelines PDF', done: false },
  ];
  let y = dlY + 38;
  deliverables.forEach(d => {
    const marker = d.done ? '✓' : '○';
    const col = d.done ? ACC : TEXT2;
    const alpha = d.done ? 1 : 0.45;
    els.push(text(20, y, marker, 12, col, { fw: 700, opacity: alpha }));
    els.push(text(40, y, d.item, 13, TEXT, { opacity: d.done ? 1 : 0.55 }));
    y += 26;
  });

  // Progress bar large
  els.push(line(20, y + 8, W - 20, y + 8, BORDER, { sw: 0.5 }));
  els.push(text(20, y + 28, '78% Complete', 12, TEXT2, { opacity: 0.6 }));
  els.push(rect(20, y + 36, 350, 6, CARD2, { rx: 3 }));
  els.push(rect(20, y + 36, 350 * 0.78, 6, ACC, { rx: 3 }));

  // Add palette swatches for the project
  const swatchY = y + 56;
  els.push(text(20, swatchY - 4, 'Colour palette', 10, TEXT2, { opacity: 0.5 }));
  addPaletteSwatches(els, 20, swatchY + 14, ['#1C1917', '#B5673E', '#F3EFE8', '#3D5A80', '#FAFAF8', '#C9B99A']);

  // Project tags
  addTagRow(els, 20, swatchY + 40, ['Branding', 'Identity', 'Type', 'Print-ready']);

  // Notes snippet
  els.push(rect(20, swatchY + 56, 350, 46, CARD, { rx: 4, stroke: BORDER, sw: 0.5 }));
  els.push(text(36, swatchY + 74, '"Client wants warmth but authority — the terracotta', 11, TEXT2, { opacity: 0.6 }));
  els.push(text(36, swatchY + 88, 'strikes that balance."', 11, TEXT2, { opacity: 0.6 }));
  els.push(rect(20, swatchY + 56, 3, 46, ACC, { rx: 1.5 }));

  navBar(els, 0);
  return { name: 'Project', elements: els };
}

// ─── SCREEN 3: JOURNAL ────────────────────────────────────────────────────────
function screenJournal() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  topBar(els, 'Journal', 'Design thinking & notes');
  els.push(line(0, 100, W, 100, BORDER, { sw: 0.5 }));

  // Featured long-form entry — editorial treatment
  const featY = 108;
  els.push(rect(20, featY, 350, 148, SURF, { rx: 4, stroke: BORDER, sw: 0.5 }));
  els.push(rect(20, featY, 3, 148, ACC, { rx: 1.5 })); // accent left border

  els.push(text(36, featY + 24, 'On Negative Space', 18, TEXT, { fw: 400, font: SERIF, ls: '-0.02em' }));
  els.push(text(36, featY + 42, 'April 10 · 4 min read', 10, TEXT2, { opacity: 0.5, ls: '0.03em' }));

  // Body excerpt
  const excerpt = 'The most powerful design decisions are often what you choose to remove. White space is not empty — it is the breath between notes that makes music';
  const words = excerpt.split(' ');
  // Simulate 4 lines of body text
  const lineH = 18, lineY = featY + 60, lineW = 310, charW = 6.2;
  let lineStart = 0, lY = lineY;
  for (let l = 0; l < 4; l++) {
    let lineStr = '', i = lineStart;
    while (i < words.length && (lineStr + ' ' + words[i]).length * charW < lineW) {
      lineStr += (lineStr ? ' ' : '') + words[i++];
    }
    lineStart = i;
    els.push(text(36, lY, lineStr + (l === 3 ? '...' : ''), 12, TEXT2, { opacity: 0.65 }));
    lY += lineH;
    if (lineStart >= words.length) break;
  }
  els.push(text(36, featY + 136, '→ Read entry', 11, ACC, { fw: 600 }));

  // Divider + list of older entries
  let y = featY + 166;
  els.push(text(20, y, 'Earlier', 11, TEXT2, { fw: 500, ls: '0.05em', opacity: 0.55 }));
  y += 18;

  const entries = [
    { title: 'Typography as personality', date: 'Apr 7', mins: 6 },
    { title: 'Working with difficult clients', date: 'Apr 4', mins: 8 },
    { title: 'The brief is never the brief', date: 'Mar 30', mins: 5 },
    { title: 'What makes a mark memorable?', date: 'Mar 26', mins: 7 },
  ];
  entries.forEach(e => {
    els.push(line(20, y, W - 20, y, BORDER, { sw: 0.5 }));
    y += 14;
    els.push(text(20, y, e.title, 13, TEXT, { fw: 400 }));
    els.push(text(W - 20, y, `${e.date} · ${e.mins}m`, 10, TEXT2, { anchor: 'end', opacity: 0.5 }));
    y += 26;
  });

  // Ruled lines behind the reading area (like notebook paper, subtle)
  addRuledLines(els, 20, 272, 350, 8, 18, BORDER);

  // Writing moods chips
  els.push(text(20, y + 8, 'Mood tags', 10, TEXT2, { opacity: 0.45 }));
  addTagRow(els, 20, y + 24, ['reflective', 'theory', 'craft', 'critique']);

  // New entry FAB — editorial minimal
  els.push(circle(W - 36, H - 88, 22, ACC));
  els.push(text(W - 36, H - 83, '+', 20, SURF, { fw: 300, anchor: 'middle' }));

  navBar(els, 1);
  return { name: 'Journal', elements: els };
}

// ─── SCREEN 4: GALLERY ────────────────────────────────────────────────────────
function screenGallery() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  topBar(els, 'Gallery', '28 pieces');
  els.push(line(0, 100, W, 100, BORDER, { sw: 0.5 }));

  // Filter row
  const filters = ['All', 'Branding', 'UI', 'Typography', 'Print'];
  let fx = 20;
  const fy = 112;
  filters.forEach((f, i) => {
    const active = i === 0;
    const fW = f.length * 8 + 20;
    els.push(rect(fx, fy, fW, 24, active ? TEXT : CARD, { rx: 12 }));
    els.push(text(fx + fW / 2, fy + 15, f, 11, active ? SURF : TEXT2,
      { fw: active ? 600 : 400, anchor: 'middle' }));
    fx += fW + 8;
  });

  // Masonry-ish grid — asymmetric like minimal.gallery curation
  const gridY = 148;
  const gap = 8;
  const colW = (W - 48) / 2;

  // Left column — tall + short
  els.push(rect(20, gridY, colW, 140, CARD2, { rx: 4 }));
  els.push(text(20 + colW / 2, gridY + 68, '[ Helios Logo ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(20, gridY + 150, 'Helios Identity', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(20, gridY + 164, 'Branding', 10, TEXT2, { opacity: 0.45 }));

  els.push(rect(20, gridY + 180, colW, 96, CARD, { rx: 4 }));
  els.push(text(20 + colW / 2, gridY + 228, '[ Type Study ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(20, gridY + 284, 'Canela Study', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(20, gridY + 298, 'Typography', 10, TEXT2, { opacity: 0.45 }));

  els.push(rect(20, gridY + 314, colW, 120, CARD2, { rx: 4 }));
  els.push(text(20 + colW / 2, gridY + 374, '[ UI Screen ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(20, gridY + 442, 'Orbital UI', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(20, gridY + 456, 'UI Design', 10, TEXT2, { opacity: 0.45 }));

  // Right column — short + tall
  const rx2 = 20 + colW + gap;
  els.push(rect(rx2, gridY, colW, 96, CARD, { rx: 4 }));
  els.push(text(rx2 + colW / 2, gridY + 48, '[ Mark ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(rx2, gridY + 106, 'Meridian Mark', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(rx2, gridY + 120, 'Branding', 10, TEXT2, { opacity: 0.45 }));

  els.push(rect(rx2, gridY + 136, colW, 160, CARD2, { rx: 4 }));
  els.push(text(rx2 + colW / 2, gridY + 216, '[ Print ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(rx2, gridY + 304, 'Almanac Print', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(rx2, gridY + 318, 'Print', 10, TEXT2, { opacity: 0.45 }));

  els.push(rect(rx2, gridY + 334, colW, 100, CARD, { rx: 4 }));
  els.push(text(rx2 + colW / 2, gridY + 384, '[ Poster ]', 10, TEXT2, { anchor: 'middle', opacity: 0.35 }));
  els.push(text(rx2, gridY + 442, 'Rhythm Poster', 11, TEXT, { fw: 500, opacity: 0.8 }));
  els.push(text(rx2, gridY + 456, 'Print', 10, TEXT2, { opacity: 0.45 }));

  // Gallery count + sort
  els.push(text(20, 148 + 486, '28 pieces', 10, TEXT2, { opacity: 0.45 }));
  els.push(text(W - 20, 148 + 486, 'Sort: Recent ▾', 10, TEXT2, { anchor: 'end', opacity: 0.45 }));

  // Decorative dot grid in background of gallery
  addDecorativeDots(els, 20, 200, 15, 20, TEXT, 24);

  navBar(els, 2);
  return { name: 'Gallery', elements: els };
}

// ─── SCREEN 5: SHARE / PORTFOLIO ─────────────────────────────────────────────
function screenShare() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  topBar(els, 'Share', 'Your public portfolio');
  els.push(line(0, 100, W, 100, BORDER, { sw: 0.5 }));

  // Decorative ruled lines
  addRuledLines(els, 20, 108, 350, 6, 16, BORDER);

  // Portfolio URL card — premium editorial
  const cardY = 116;
  els.push(rect(20, cardY, 350, 88, TEXT, { rx: 6 }));
  els.push(text(195, cardY + 22, 'Your portfolio is live', 11, SURF, { fw: 400, anchor: 'middle', opacity: 0.65 }));
  els.push(text(195, cardY + 46, 'opus.portfolio/', 16, SURF, { fw: 500, anchor: 'middle' }));
  els.push(text(195, cardY + 62, 'aaronchrisfield', 19, SURF, { fw: 700, font: SERIF, anchor: 'middle', ls: '-0.02em' }));
  // Share button area
  els.push(rect(100, cardY + 70, 80, 20, ACC, { rx: 10 }));
  els.push(text(140, cardY + 83, 'Copy link', 10, SURF, { fw: 600, anchor: 'middle' }));
  els.push(rect(192, cardY + 70, 80, 20, 'rgba(255,255,255,0.2)', { rx: 10 }));
  els.push(text(232, cardY + 83, 'QR Code', 10, SURF, { fw: 600, anchor: 'middle', opacity: 0.85 }));

  // Stats row
  const statY = cardY + 108;
  els.push(line(20, statY, W - 20, statY, BORDER, { sw: 0.5 }));
  const stats = [{ v: '1,247', l: 'Views' }, { v: '84', l: 'Unique' }, { v: '23', l: 'Contacts' }];
  stats.forEach((s, i) => {
    const sx = 20 + i * 116 + 38;
    els.push(text(sx, statY + 32, s.v, 22, TEXT, { fw: 300, font: SERIF, anchor: 'middle' }));
    els.push(text(sx, statY + 48, s.l, 10, TEXT2, { anchor: 'middle', opacity: 0.55 }));
    if (i < 2) els.push(line(20 + (i + 1) * 116, statY + 10, 20 + (i + 1) * 116, statY + 56, BORDER, { sw: 0.5 }));
  });

  // Sections list
  let y = statY + 74;
  els.push(text(20, y, 'Portfolio sections', 11, TEXT2, { fw: 500, ls: '0.05em', opacity: 0.55 }));
  y += 18;

  const sections = [
    { name: 'Selected Work', items: 8, on: true },
    { name: 'About & Process', items: 1, on: true },
    { name: 'Case Studies', items: 4, on: false },
    { name: 'Archive', items: 20, on: false },
  ];
  sections.forEach(s => {
    els.push(line(20, y, W - 20, y, BORDER, { sw: 0.5 }));
    y += 14;
    els.push(text(20, y, s.name, 13, TEXT, { fw: s.on ? 500 : 400 }));
    els.push(text(200, y, `${s.items} items`, 11, TEXT2, { opacity: 0.5 }));
    // Toggle
    const toggleX = W - 60;
    els.push(rect(toggleX, y - 10, 40, 20, s.on ? ACC : CARD2, { rx: 10 }));
    els.push(circle(s.on ? toggleX + 30 : toggleX + 10, y, 8, SURF));
    y += 30;
  });

  // CTA to open
  els.push(line(20, y + 4, W - 20, y + 4, BORDER, { sw: 0.5 }));
  els.push(rect(20, y + 16, 350, 42, CARD, { rx: 6, stroke: BORDER, sw: 0.5 }));
  els.push(text(195, y + 40, 'Preview live portfolio →', 13, ACC, { fw: 600, anchor: 'middle' }));

  // Add referral/invite section
  y += 68;
  els.push(text(20, y + 14, 'Referrals', 11, TEXT2, { fw: 500, ls: '0.05em', opacity: 0.55 }));
  y += 28;
  els.push(rect(20, y, 350, 52, CARD, { rx: 4, stroke: BORDER, sw: 0.5 }));
  els.push(text(36, y + 16, 'Invite a designer friend', 13, TEXT, { fw: 500 }));
  els.push(text(36, y + 32, 'Get 3 months free for each referral', 11, TEXT2, { opacity: 0.5 }));
  els.push(rect(W - 70, y + 14, 52, 24, ACC, { rx: 12 }));
  els.push(text(W - 44, y + 29, 'Invite', 11, SURF, { fw: 600, anchor: 'middle' }));

  // Social proof mini-bar
  y += 68;
  els.push(text(195, y, '⭐⭐⭐⭐⭐  4.9 / 5 · 1,200+ designers', 10, TEXT2, { anchor: 'middle', opacity: 0.5 }));

  navBar(els, 3);
  return { name: 'Share', elements: els };
}

// ─── SCREEN 6: ONBOARDING ─────────────────────────────────────────────────────
function screenOnboarding() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Large editorial serif headline — "type as visual texture"
  els.push(text(20, 140, 'Your work,', 48, TEXT, { fw: 300, font: SERIF, ls: '-0.03em' }));
  els.push(text(20, 196, 'beautifully', 48, TEXT, { fw: 300, font: SERIF, ls: '-0.03em' }));
  els.push(text(20, 252, 'held.', 48, ACC, { fw: 400, font: SERIF, ls: '-0.03em' }));

  // Subhead
  els.push(text(20, 290, 'OPUS is a journal for designers who', 14, TEXT2, { opacity: 0.7 }));
  els.push(text(20, 310, 'take their craft seriously.', 14, TEXT2, { opacity: 0.7 }));

  // Divider ornament
  els.push(line(20, 338, 80, 338, TEXT, { sw: 1, opacity: 0.2 }));
  els.push(circle(88, 338, 2, TEXT, { opacity: 0.2 }));

  // Features — minimal editorial list
  const features = [
    'Project tracking with process notes',
    'Editorial journal for design thinking',
    'Curated public portfolio page',
    'Work archive & version history',
  ];
  let fy = 364;
  features.forEach(f => {
    els.push(text(20, fy, '—', 12, ACC, { fw: 700 }));
    els.push(text(36, fy, f, 13, TEXT, { opacity: 0.75 }));
    fy += 26;
  });

  // CTA — full-width button, sharp corners (Vercel-inspired)
  els.push(rect(20, H - 160, 350, 52, TEXT, { rx: 4 }));
  els.push(text(195, H - 130, 'Start your journal', 15, SURF, { fw: 600, anchor: 'middle' }));

  // Secondary
  els.push(text(195, H - 98, 'Sign in', 13, TEXT2, { fw: 400, anchor: 'middle', opacity: 0.6 }));

  // Footer wordmark
  els.push(text(195, H - 70, 'OPUS', 11, TEXT, { fw: 700, ls: '0.1em', anchor: 'middle', opacity: 0.25 }));

  // Background: large faint serif letter O as typographic texture
  els.push(text(195, 440, 'O', 480, CARD2, { fw: 300, font: SERIF, anchor: 'middle', opacity: 0.18 }));

  // Decorative top ornament
  els.push(line(195, 56, 195, 80, TEXT, { sw: 0.8, opacity: 0.2 }));
  els.push(circle(195, 56, 3, TEXT, { opacity: 0.15 }));

  // Three small editorial bullets in footer
  for (let i = 0; i < 3; i++) {
    els.push(circle(181 + i * 7, H - 80, 2, TEXT, { opacity: 0.15 }));
  }

  return { name: 'Onboarding', elements: els };
}

// ─── BUILD PEN FILE ──────────────────────────────────────────────────────────
const screens = [
  screenOnboarding(),
  screenDashboard(),
  screenProject(),
  screenJournal(),
  screenGallery(),
  screenShare(),
];

// Convert elements arrays to SVG strings
function elToSvg(el) {
  if (el.type === 'rect') {
    return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx ?? 0}" opacity="${el.opacity ?? 1}" stroke="${el.stroke ?? 'none'}" stroke-width="${el.sw ?? 0}"/>`;
  }
  if (el.type === 'text') {
    const anchor = el.anchor ?? 'start';
    return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw ?? 400}" font-family="${el.font ?? 'Inter, sans-serif'}" text-anchor="${anchor}" letter-spacing="${el.ls ?? 0}" opacity="${el.opacity ?? 1}">${el.content}</text>`;
  }
  if (el.type === 'circle') {
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity ?? 1}" stroke="${el.stroke ?? 'none'}" stroke-width="${el.sw ?? 0}"/>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw ?? 1}" opacity="${el.opacity ?? 1}"/>`;
  }
  return '';
}

const penScreens = screens.map(s => ({
  name: s.name,
  svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s.elements.map(elToSvg).join('')}</svg>`,
  elements: s.elements,
}));

const totalEls = screens.reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'OPUS — Creative Portfolio Journal',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: 500,
    elements: totalEls,
    description: 'Editorial serif portfolio journal · warm cream palette · asymmetric minimal layout',
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT },
    inspiration: [
      'minimal.gallery: Early Works (center-column editorial serif)',
      'minimal.gallery: Clim Studio (precise typographic hierarchy)',
      'Saaspo: Notion (warm cream off-white palette)',
      'Land-book: asymmetric minimalism trend',
    ],
  },
  screens: penScreens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`OPUS: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
