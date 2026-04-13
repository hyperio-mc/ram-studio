'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'type';
const NAME = 'TYPE';
const TAGLINE = 'Font discovery, specimen & pairing studio';
const HEARTBEAT = 512;

// ─── Palette (LIGHT — editorial warm) ────────────────────────────────────────
const BG      = '#F8F5F0';
const SURF    = '#FFFFFF';
const CARD    = '#F0EBE3';
const TEXT    = '#1C1814';
const ACC     = '#C94F0A';   // terracotta / burnt orange
const ACC2    = '#4A5560';   // slate-blue muted
const MUTED   = '#9A9086';
const BORDER  = '#DDD7CE';
const MONO    = '#E8E2D9';   // mono accent bg strip

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill, rx: opts.rx || 0, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', sw: opts.sw || 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), size, fill,
    fw: opts.fw || '400', font: opts.font || 'sans-serif',
    anchor: opts.anchor || 'start', ls: opts.ls || '0', opacity: opts.opacity || 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', sw: opts.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, sw: opts.sw || 1, opacity: opts.opacity || 1 };
}

const W = 390, H = 844;

// ─── SVG builder ──────────────────────────────────────────────────────────────
function buildSVG(elements) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.sw}"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw}" font-family="${el.font}" text-anchor="${el.anchor}" letter-spacing="${el.ls}" opacity="${el.opacity}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.sw}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw}" opacity="${el.opacity}"/>`;
    }
    return '';
  }).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n    ${shapes}\n</svg>`;
}

// ─── Shared components ─────────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 30, '9:41', 13, TEXT, { fw: '600', font: 'monospace' }));
  els.push(text(W - 20, 30, '●●● ▲', 11, TEXT, { fw: '400', anchor: 'end', opacity: 0.5 }));
}

function navBar(els, activeIdx) {
  const NAV = ['Discover', 'Specimen', 'Pairs', 'Library', 'Studio'];
  const NAV_ICONS = ['◈', '◉', '⊞', '♠', '▤'];
  els.push(rect(0, H - 82, W, 82, SURF));
  els.push(line(0, H - 82, W, H - 82, BORDER, { sw: 0.7 }));
  const tabW = W / NAV.length;
  NAV.forEach((label, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === activeIdx;
    els.push(text(cx, H - 52, NAV_ICONS[i], 18, isActive ? ACC : MUTED, { anchor: 'middle', fw: '400' }));
    els.push(text(cx, H - 30, label, 9, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? '600' : '400', font: 'monospace' }));
    if (isActive) {
      els.push(rect(cx - 16, H - 82, 32, 2, ACC, { rx: 1 }));
    }
  });
}

// ─── Screen 1: Discover ───────────────────────────────────────────────────────
function screenDiscover() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 72, 'TYPE', 28, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-1' }));
  els.push(text(W - 20, 72, '🔍', 20, TEXT, { anchor: 'end' }));
  els.push(line(20, 82, W - 20, 82, BORDER, { sw: 0.6 }));

  // ── BIG TYPE hero section ──────────────────────────────────────────────────
  // Oversized specimen letter — editorial "big type" pattern from Land-Book
  els.push(rect(0, 88, W, 210, MONO, { rx: 0 }));
  // Giant decorative letter
  els.push(text(W / 2, 260, 'Aa', 160, TEXT, { fw: '700', font: 'Georgia, serif', anchor: 'middle', opacity: 0.08 }));
  // Overlay labels
  els.push(text(20, 112, 'FONT OF THE DAY', 9, ACC, { fw: '700', font: 'monospace', ls: '1.5' }));
  els.push(text(20, 134, 'Stabil Grotesk', 26, TEXT, { fw: '700', font: 'Georgia, serif' }));
  els.push(text(20, 158, 'by KOMETA Typefaces', 12, MUTED, { font: 'monospace' }));
  els.push(text(20, 178, 'Extended — 10 styles', 11, ACC2, { font: 'monospace' }));
  // Specimen strip
  els.push(text(20, 210, 'ABCDEFGHIJKLM', 14, TEXT, { font: 'monospace', opacity: 0.45, ls: '2' }));
  els.push(text(20, 228, 'nopqrstuvwxyz', 14, TEXT, { font: 'monospace', opacity: 0.45, ls: '2' }));
  // CTA pill
  els.push(rect(20, 240, 110, 30, ACC, { rx: 15 }));
  els.push(text(75, 260, 'View Specimen', 11, '#FFFFFF', { anchor: 'middle', fw: '600', font: 'monospace' }));
  els.push(rect(140, 240, 70, 30, SURF, { rx: 15, stroke: BORDER, sw: 1 }));
  els.push(text(175, 260, '+ Save', 11, TEXT, { anchor: 'middle', fw: '500', font: 'monospace' }));

  // Divider
  els.push(line(20, 308, W - 20, 308, BORDER, { sw: 0.6 }));
  els.push(text(20, 324, 'TRENDING THIS WEEK', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));

  // Trending cards — 3 horizontal scroll cards
  const fonts = [
    { name: 'Departure Mono', by: 'Helena Zhang', styles: '1 style', tag: 'MONO', color: '#1C1814' },
    { name: 'GT Pantheon', by: 'Grilli Type', styles: '6 styles', tag: 'SERIF', color: '#C94F0A' },
    { name: 'Swizzy', by: 'Independent', styles: '3 styles', tag: 'SANS', color: '#4A5560' },
  ];
  fonts.forEach((f, i) => {
    const cx = 20 + i * 120;
    els.push(rect(cx, 334, 110, 130, SURF, { rx: 10, stroke: BORDER, sw: 0.8 }));
    // specimen bg
    els.push(rect(cx + 8, 342, 94, 60, CARD, { rx: 6 }));
    // sample letter
    els.push(text(cx + 55, 394, f.name[0], 42, f.color, { anchor: 'middle', fw: '700', font: 'Georgia, serif', opacity: 0.7 }));
    // tag chip
    els.push(rect(cx + 10, 344, 36, 16, f.color, { rx: 8 }));
    els.push(text(cx + 28, 357, f.tag, 7.5, '#FFFFFF', { anchor: 'middle', fw: '700', font: 'monospace' }));
    // name + info
    els.push(text(cx + 10, 418, f.name, 10, TEXT, { fw: '700', font: 'Georgia, serif' }));
    els.push(text(cx + 10, 432, f.by, 8.5, MUTED, { font: 'monospace' }));
    els.push(text(cx + 10, 446, f.styles, 8.5, ACC2, { font: 'monospace' }));
    els.push(circle(cx + 95, 342 + 70 + 40, 8, CARD));
    els.push(text(cx + 95, 459, '♡', 10, MUTED, { anchor: 'middle' }));
  });

  // Section: Categories
  els.push(line(20, 478, W - 20, 478, BORDER, { sw: 0.6 }));
  els.push(text(20, 494, 'BROWSE BY STYLE', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));

  const cats = ['Serif', 'Sans-Serif', 'Mono', 'Display', 'Script', 'Slab'];
  cats.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = 20 + col * 118;
    const by = 504 + row * 52;
    els.push(rect(bx, by, 108, 42, SURF, { rx: 8, stroke: BORDER, sw: 0.8 }));
    els.push(text(bx + 54, by + 19, c[0], 18, TEXT, { anchor: 'middle', fw: '700', font: 'Georgia, serif', opacity: 0.2 }));
    els.push(text(bx + 54, by + 32, c, 10, TEXT, { anchor: 'middle', fw: '600', font: 'monospace' }));
  });

  // Recent activity strip
  els.push(rect(0, 614, W, 46, MONO));
  els.push(text(20, 633, '↑ 1,247 new specimens added this week', 11, ACC2, { font: 'monospace' }));
  els.push(text(20, 648, '▸ Updated: Apr 13, 2026', 10, MUTED, { font: 'monospace' }));

  navBar(els, 0);
  return els;
}

// ─── Screen 2: Specimen ───────────────────────────────────────────────────────
function screenSpecimen() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  statusBar(els);

  // Back + share
  els.push(text(20, 72, '← Back', 13, ACC, { fw: '600', font: 'monospace' }));
  els.push(text(W - 20, 72, '⬆', 18, TEXT, { anchor: 'end' }));
  els.push(line(0, 82, W, 82, BORDER, { sw: 0.6 }));

  // HERO — "Big Type" specimen display
  els.push(rect(0, 88, W, 280, BG));
  // Watermark grid of letters
  const alphaRow1 = 'ABCDEFGHIJ';
  const alphaRow2 = 'KLMNOPQRST';
  [...alphaRow1].forEach((ch, i) => {
    els.push(text(20 + i * 36, 165, ch, 32, TEXT, { fw: '700', font: 'Georgia, serif', opacity: 0.06 }));
  });
  [...alphaRow2].forEach((ch, i) => {
    els.push(text(20 + i * 36, 205, ch, 32, TEXT, { fw: '700', font: 'Georgia, serif', opacity: 0.06 }));
  });

  // Main display
  els.push(text(W / 2, 200, 'Gg', 120, TEXT, { fw: '700', font: 'Georgia, serif', anchor: 'middle', opacity: 0.9 }));

  // Font name block
  els.push(text(20, 380, 'Stabil Grotesk', 28, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-0.5' }));
  els.push(text(20, 400, 'Extended Variable', 13, MUTED, { font: 'monospace' }));

  // Stats row
  const stats = [['10', 'Styles'], ['2026', 'Release'], ['Free', 'License']];
  stats.forEach(([v, l], i) => {
    const sx = 20 + i * 118;
    els.push(rect(sx, 414, 108, 56, CARD, { rx: 8 }));
    els.push(text(sx + 54, 440, v, 18, ACC, { anchor: 'middle', fw: '700', font: 'monospace' }));
    els.push(text(sx + 54, 458, l, 9, MUTED, { anchor: 'middle', fw: '500', font: 'monospace' }));
  });

  // Weight tabs
  els.push(line(20, 480, W - 20, 480, BORDER, { sw: 0.6 }));
  const weights = ['Thin', 'Light', 'Regular', 'Medium', 'Bold', 'Black'];
  weights.forEach((w, i) => {
    const isActive = i === 2;
    const wx = 20 + i * 60;
    if (isActive) els.push(rect(wx, 486, 52, 22, ACC, { rx: 11 }));
    els.push(text(wx + 26, 502, w, 9, isActive ? '#FFF' : MUTED, { anchor: 'middle', fw: isActive ? '700' : '400', font: 'monospace' }));
  });

  // Specimen text
  els.push(text(20, 530, 'The quick brown fox', 18, TEXT, { fw: '400', font: 'Georgia, serif' }));
  els.push(text(20, 554, 'jumps over the lazy dog.', 18, TEXT, { fw: '400', font: 'Georgia, serif' }));
  els.push(text(20, 578, '0123456789 @#$%&', 14, TEXT, { fw: '400', font: 'monospace', opacity: 0.5 }));
  els.push(line(20, 592, W - 20, 592, BORDER, { sw: 0.5 }));

  // Glyphs grid
  els.push(text(20, 608, 'GLYPHS', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));
  const glyphs = ['A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f', '1', '2', '3', '!', '?', '&'];
  glyphs.forEach((g, i) => {
    const col = i % 9;
    const row = Math.floor(i / 9);
    const gx = 20 + col * 38;
    const gy = 618 + row * 40;
    els.push(rect(gx, gy, 30, 30, CARD, { rx: 4 }));
    els.push(text(gx + 15, gy + 21, g, 14, TEXT, { anchor: 'middle', fw: '500', font: 'Georgia, serif' }));
  });

  // Download button
  els.push(rect(20, 714, W - 40, 44, ACC, { rx: 22 }));
  els.push(text(W / 2, 741, '↓  Download Free', 14, '#FFFFFF', { anchor: 'middle', fw: '700', font: 'monospace' }));

  navBar(els, 1);
  return els;
}

// ─── Screen 3: Pairs ──────────────────────────────────────────────────────────
function screenPairs() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 72, 'PAIRS', 22, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-0.5' }));
  els.push(text(20, 90, 'Curated font combinations', 12, MUTED, { font: 'monospace' }));
  els.push(line(20, 100, W - 20, 100, BORDER, { sw: 0.6 }));

  // Filter chips
  const filters = ['All', 'Editorial', 'Tech', 'Brand', 'Display'];
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const chipX = 20 + i * 70;
    els.push(rect(chipX, 108, 62, 24, isActive ? ACC : SURF, { rx: 12, stroke: isActive ? 'none' : BORDER, sw: 0.8 }));
    els.push(text(chipX + 31, 125, f, 10, isActive ? '#FFF' : TEXT, { anchor: 'middle', fw: isActive ? '700' : '400', font: 'monospace' }));
  });

  // Pair cards
  const pairs = [
    {
      h: 'Stabil Grotesk', b: 'Departure Mono', tag: 'EDITORIAL',
      sample_h: 'The Future\nof Type', sample_b: 'A specimen for the new age of variable fonts and digital typography.',
      saved: true, votes: '1.2k'
    },
    {
      h: 'GT Pantheon', b: 'Inter', tag: 'BRAND',
      sample_h: 'Clarity\nin Motion', sample_b: 'Every character chosen with intention. Every weight a deliberate choice.',
      saved: false, votes: '891'
    },
    {
      h: 'Swizzy', b: 'Stabil Grotesk', tag: 'DISPLAY',
      sample_h: 'Bold\nStatement', sample_b: 'Contrasting styles create visual hierarchy that guides the reader naturally.',
      saved: false, votes: '654'
    },
  ];

  pairs.forEach((p, i) => {
    const cy = 142 + i * 186;
    els.push(rect(20, cy, W - 40, 178, SURF, { rx: 12, stroke: BORDER, sw: 0.8 }));
    // Tag
    els.push(rect(32, cy + 10, 58, 18, CARD, { rx: 9 }));
    els.push(text(61, cy + 23, p.tag, 8, ACC2, { anchor: 'middle', fw: '700', font: 'monospace' }));
    // Votes / save
    els.push(text(W - 32, cy + 23, (p.saved ? '♥' : '♡') + ' ' + p.votes, 10, p.saved ? ACC : MUTED, { anchor: 'end', font: 'monospace' }));
    // Pair names
    els.push(line(32, cy + 36, W - 32, cy + 36, BORDER, { sw: 0.5 }));
    els.push(text(32, cy + 52, p.h, 11, TEXT, { fw: '700', font: 'monospace' }));
    els.push(text(W - 32, cy + 52, 'H1', 9, MUTED, { anchor: 'end', font: 'monospace' }));
    els.push(text(32, cy + 66, p.b, 11, ACC2, { fw: '400', font: 'monospace' }));
    els.push(text(W - 32, cy + 66, 'Body', 9, MUTED, { anchor: 'end', font: 'monospace' }));
    // Sample preview box
    els.push(rect(32, cy + 80, W - 64, 82, CARD, { rx: 8 }));
    // Sample lines (multiline via split)
    const lines_h = p.sample_h.split('\n');
    lines_h.forEach((ln, li) => {
      els.push(text(44, cy + 100 + li * 18, ln, 14, TEXT, { fw: '700', font: 'Georgia, serif' }));
    });
    const bodyY = cy + 100 + lines_h.length * 18 + 4;
    // Wrap body text
    const bWords = p.sample_b.split(' ');
    let bLine = '', bLineIdx = 0;
    bWords.forEach((w, wi) => {
      bLine += (bLine ? ' ' : '') + w;
      if (bLine.length > 40 || wi === bWords.length - 1) {
        els.push(text(44, bodyY + bLineIdx * 12, bLine, 9, MUTED, { font: 'monospace' }));
        bLine = '';
        bLineIdx++;
      }
    });
  });

  navBar(els, 2);
  return els;
}

// ─── Screen 4: Library ────────────────────────────────────────────────────────
function screenLibrary() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 72, 'LIBRARY', 22, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-0.5' }));
  els.push(text(W - 20, 72, '+ Add', 13, ACC, { anchor: 'end', fw: '600', font: 'monospace' }));
  els.push(line(20, 82, W - 20, 82, BORDER, { sw: 0.6 }));

  // Stats bar
  els.push(rect(0, 88, W, 60, MONO));
  const libStats = [['47', 'Saved'], ['12', 'Collections'], ['8', 'In Use']];
  libStats.forEach(([v, l], i) => {
    const sx = (W / 3) * i + (W / 6);
    els.push(text(sx, 115, v, 24, TEXT, { anchor: 'middle', fw: '700', font: 'Georgia, serif' }));
    els.push(text(sx, 133, l, 10, MUTED, { anchor: 'middle', font: 'monospace' }));
    if (i < 2) els.push(line((W / 3) * (i + 1), 96, (W / 3) * (i + 1), 140, BORDER, { sw: 0.5 }));
  });

  // Collection tabs
  const collections = ['All Fonts', 'Serifs', 'Display', 'Monospace'];
  els.push(text(20, 166, 'COLLECTIONS', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));
  collections.forEach((c, i) => {
    const isActive = i === 0;
    const cx2 = 20 + i * 90;
    els.push(rect(cx2, 172, 82, 26, isActive ? TEXT : SURF, { rx: 13, stroke: isActive ? 'none' : BORDER, sw: 0.8 }));
    els.push(text(cx2 + 41, 190, c, 9.5, isActive ? BG : TEXT, { anchor: 'middle', fw: isActive ? '700' : '400', font: 'monospace' }));
  });

  // Font list
  const fonts = [
    { name: 'Stabil Grotesk', by: 'KOMETA', styles: '10', tag: 'SANS', color: CARD, lastUsed: '2d ago' },
    { name: 'Departure Mono', by: 'Helena Zhang', styles: '1', tag: 'MONO', color: '#E8F4E8', lastUsed: '5d ago' },
    { name: 'GT Pantheon', by: 'Grilli Type', styles: '6', tag: 'SERIF', color: '#F4E8E8', lastUsed: '1w ago' },
    { name: 'Swizzy', by: 'Independent', styles: '3', tag: 'SANS', color: '#E8EEF4', lastUsed: '2w ago' },
    { name: 'Inter Variable', by: 'Rasmus', styles: '1 var', tag: 'SANS', color: CARD, lastUsed: '1mo ago' },
  ];

  fonts.forEach((f, i) => {
    const fy = 210 + i * 78;
    els.push(rect(20, fy, W - 40, 68, SURF, { rx: 10, stroke: BORDER, sw: 0.7 }));
    // Specimen box
    els.push(rect(32, fy + 8, 52, 52, f.color, { rx: 8 }));
    els.push(text(58, fy + 42, f.name[0], 32, TEXT, { anchor: 'middle', fw: '700', font: 'Georgia, serif', opacity: 0.4 }));
    // Tag chip
    els.push(rect(90, fy + 12, 34, 14, ACC2, { rx: 7 }));
    els.push(text(107, fy + 23, f.tag, 7, '#FFF', { anchor: 'middle', fw: '700', font: 'monospace' }));
    // Details
    els.push(text(132, fy + 12, f.name, 13, TEXT, { fw: '700', font: 'Georgia, serif' }));
    els.push(text(132, fy + 30, f.by + ' · ' + f.styles + ' styles', 10, MUTED, { font: 'monospace' }));
    els.push(text(132, fy + 48, 'Last used: ' + f.lastUsed, 9.5, MUTED, { font: 'monospace' }));
    // Options
    els.push(text(W - 32, fy + 38, '···', 14, MUTED, { anchor: 'end' }));
  });

  navBar(els, 3);
  return els;
}

// ─── Screen 5: Studio ─────────────────────────────────────────────────────────
function screenStudio() {
  const els = [];
  els.push(rect(0, 0, W, H, '#FDFCFA'));
  statusBar(els);

  els.push(text(20, 72, 'STUDIO', 22, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-0.5' }));
  els.push(text(20, 90, 'Live type tester', 12, MUTED, { font: 'monospace' }));
  els.push(line(20, 100, W - 20, 100, BORDER, { sw: 0.6 }));

  // Font selector
  els.push(text(20, 120, 'TYPEFACE', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));
  els.push(rect(20, 128, W - 40, 40, SURF, { rx: 10, stroke: BORDER, sw: 0.8 }));
  els.push(text(34, 153, 'Stabil Grotesk Extended', 14, TEXT, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(W - 34, 153, '▾', 14, MUTED, { anchor: 'end' }));

  // Controls row
  const controls = ['Weight', 'Size', 'Leading', 'Tracking'];
  const vals = ['Regular', '36px', '1.3×', '−10'];
  controls.forEach((c, i) => {
    const cx3 = 20 + i * 88;
    els.push(text(cx3, 184, c, 8.5, MUTED, { font: 'monospace', fw: '500' }));
    els.push(rect(cx3, 190, 80, 26, SURF, { rx: 8, stroke: BORDER, sw: 0.7 }));
    els.push(text(cx3 + 40, 208, vals[i], 10, TEXT, { anchor: 'middle', font: 'monospace', fw: '600' }));
  });

  // ── BIG TYPE preview canvas ────────────────────────────────────────────────
  els.push(rect(0, 224, W, 280, MONO, { rx: 0 }));
  // Ruler ticks
  for (let rx = 0; rx <= W; rx += 20) {
    els.push(line(rx, 224, rx, rx % 100 === 0 ? 238 : rx % 40 === 0 ? 234 : 230, BORDER, { sw: 0.4, opacity: 0.6 }));
    if (rx % 100 === 0) els.push(text(rx + 2, 248, rx + 'px', 6.5, MUTED, { font: 'monospace', opacity: 0.5 }));
  }
  // Baseline guides
  const baselineY = [320, 358, 396, 440, 480];
  baselineY.forEach(by => {
    els.push(line(20, by, W - 20, by, ACC, { sw: 0.3, opacity: 0.25 }));
  });
  // Preview text (sample editorial headline)
  els.push(text(30, 318, 'The art of', 36, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-1' }));
  els.push(text(30, 356, 'choosing type', 36, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-1' }));
  els.push(text(30, 392, 'is the art of', 36, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-1' }));
  els.push(text(30, 430, 'saying nothing', 36, TEXT, { fw: '400', font: 'Georgia, serif', ls: '-0.5', opacity: 0.6 }));
  els.push(text(30, 468, 'loudly.', 36, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-1', opacity: 0.15 }));

  // Edit indicator
  els.push(line(30, 282, 30, 502, ACC, { sw: 1.5, opacity: 0.6 }));

  // Text area controls
  els.push(line(0, 508, W, 508, BORDER, { sw: 0.6 }));
  const tools2 = ['B', 'I', 'U', 'S̶', '≡', '⟨⟩', '⚙'];
  tools2.forEach((t, i) => {
    const isActive = i === 0;
    els.push(rect(20 + i * 48, 514, 38, 30, isActive ? ACC : SURF, { rx: 8, stroke: isActive ? 'none' : BORDER, sw: 0.7 }));
    els.push(text(39 + i * 48, 534, t, 14, isActive ? '#FFF' : TEXT, { anchor: 'middle', fw: isActive ? '700' : '400' }));
  });

  // Color + BG pickers
  els.push(line(20, 556, W - 20, 556, BORDER, { sw: 0.5 }));
  els.push(text(20, 574, 'TEXT COLOR', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));
  const colorSwatches = [TEXT, ACC, ACC2, '#000000', '#FFFFFF', '#C00000'];
  colorSwatches.forEach((col, i) => {
    els.push(circle(44 + i * 36, 596, 14, col, { stroke: i === 0 ? ACC : 'transparent', sw: 2 }));
  });
  els.push(text(W - 20, 574, 'BACKGROUND', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5', anchor: 'end' }));
  const bgSwatches = [BG, SURF, CARD, MONO, '#1C1814', '#C94F0A'];
  bgSwatches.forEach((col, i) => {
    els.push(circle(W - 44 - i * 36, 596, 14, col, { stroke: BORDER, sw: 1 }));
  });

  // Export button
  els.push(rect(20, 618, W - 40, 44, TEXT, { rx: 22 }));
  els.push(text(W / 2, 645, '↗  Export PNG  ·  Copy CSS', 13, BG, { anchor: 'middle', fw: '600', font: 'monospace' }));

  navBar(els, 4);
  return els;
}

// ─── Screen 6: Profile / Year in Review ───────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 72, 'YOUR TYPE YEAR', 20, TEXT, { fw: '700', font: 'Georgia, serif', ls: '-0.5' }));
  els.push(text(20, 90, '2026 · Jan — Apr', 12, MUTED, { font: 'monospace' }));
  els.push(line(20, 100, W - 20, 100, BORDER, { sw: 0.6 }));

  // Avatar
  els.push(circle(W - 36, 70, 20, CARD, { stroke: BORDER, sw: 1.5 }));
  els.push(text(W - 36, 76, 'R', 16, TEXT, { anchor: 'middle', fw: '700', font: 'Georgia, serif' }));

  // Top stat cards
  const topStats = [
    { v: '47', l: 'Fonts\nSaved', icon: '♠' },
    { v: '12', l: 'Pairs\nMade', icon: '⊞' },
    { v: '1.2k', l: 'Glyphs\nViewed', icon: '◈' },
  ];
  topStats.forEach((s, i) => {
    const sx = 20 + i * 118;
    els.push(rect(sx, 110, 108, 80, SURF, { rx: 10, stroke: BORDER, sw: 0.8 }));
    els.push(text(sx + 14, 134, s.icon, 18, ACC, { fw: '400' }));
    els.push(text(sx + 54, 155, s.v, 22, TEXT, { anchor: 'middle', fw: '700', font: 'Georgia, serif' }));
    s.l.split('\n').forEach((ln, li) => {
      els.push(text(sx + 54, 170 + li * 12, ln, 9, MUTED, { anchor: 'middle', font: 'monospace' }));
    });
  });

  // Activity heatmap strip
  els.push(line(20, 204, W - 20, 204, BORDER, { sw: 0.5 }));
  els.push(text(20, 220, 'ACTIVITY HEATMAP', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));
  const weeks = 16, days = 7;
  const cellSize = 14, gapX = 4, gapY = 3;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      const intensity = Math.random();
      const fillColor = intensity < 0.3 ? CARD
        : intensity < 0.55 ? '#DCCFBC'
        : intensity < 0.75 ? '#D4A27A'
        : ACC;
      els.push(rect(20 + w * (cellSize + gapX), 228 + d * (cellSize + gapY), cellSize, cellSize, fillColor, { rx: 3 }));
    }
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    els.push(text(20 + i * 72, 346, m, 8.5, MUTED, { font: 'monospace', opacity: 0.6 }));
  });

  // Top typefaces
  els.push(line(20, 358, W - 20, 358, BORDER, { sw: 0.5 }));
  els.push(text(20, 374, 'YOUR TOP TYPEFACES', 9, MUTED, { fw: '700', font: 'monospace', ls: '1.5' }));

  const topFonts = [
    { rank: '01', name: 'Stabil Grotesk', use: '43 sessions', pct: 88 },
    { rank: '02', name: 'Inter Variable', use: '31 sessions', pct: 64 },
    { rank: '03', name: 'Departure Mono', use: '24 sessions', pct: 49 },
    { rank: '04', name: 'GT Pantheon', use: '17 sessions', pct: 35 },
  ];
  topFonts.forEach((f, i) => {
    const fy = 384 + i * 66;
    els.push(rect(20, fy, W - 40, 58, SURF, { rx: 10, stroke: BORDER, sw: 0.7 }));
    els.push(text(34, fy + 24, f.rank, 22, CARD, { fw: '700', font: 'Georgia, serif' }));
    els.push(text(62, fy + 22, f.name, 13, TEXT, { fw: '700', font: 'Georgia, serif' }));
    els.push(text(62, fy + 38, f.use, 10, MUTED, { font: 'monospace' }));
    // Progress bar
    els.push(rect(62, fy + 44, W - 102, 6, CARD, { rx: 3 }));
    els.push(rect(62, fy + 44, Math.round((W - 102) * f.pct / 100), 6, ACC, { rx: 3 }));
    els.push(text(W - 34, fy + 50, f.pct + '%', 9, ACC, { anchor: 'end', font: 'monospace', fw: '600' }));
  });

  // Share badge
  els.push(rect(20, 650, W - 40, 44, MONO, { rx: 22, stroke: BORDER, sw: 0.8 }));
  els.push(text(W / 2, 677, '↗  Share My Type Year', 13, TEXT, { anchor: 'middle', fw: '600', font: 'monospace' }));

  navBar(els, 0);
  return els;
}

// ─── Assemble pen ──────────────────────────────────────────────────────────────
const screenDefs = [
  { name: 'Discover',  fn: screenDiscover },
  { name: 'Specimen',  fn: screenSpecimen },
  { name: 'Pairs',     fn: screenPairs    },
  { name: 'Library',   fn: screenLibrary  },
  { name: 'Studio',    fn: screenStudio   },
  { name: 'Year',      fn: screenProfile  },
];

const screens = screenDefs.map(sd => {
  const elements = sd.fn();
  return { name: sd.name, svg: buildSVG(elements), elements };
});

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    slug: SLUG,
    tagline: TAGLINE,
    palette: { bg: BG, surface: SURF, text: TEXT, accent: ACC, accent2: ACC2, muted: MUTED },
    inspiration: [
      'KOMETA Typefaces on minimal.gallery — editorial type specimen UI',
      'Big Type category on land-book.com — oversized letterforms as hero',
      'Departure Mono on lapa.ninja — monospace as identity/branding',
    ],
  },
  screens: screens.map(s => ({ name: s.name, svg: s.svg, elements: s.elements })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
