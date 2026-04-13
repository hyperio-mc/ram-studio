'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'gist';
const NAME  = 'GIST';
const THEME = 'light';

// Warm editorial palette — inspired by Minimal Gallery's paper-like warmth
// and Lapa Ninja's warm minimal SaaS aesthetic
const C = {
  bg:        '#FAF8F4',   // warm parchment
  surface:   '#FFFFFF',   // clean white cards
  card:      '#F5F1EB',   // cream card surface
  border:    '#E8E2D9',   // warm light border
  text:      '#1A1714',   // near-black warm ink
  textMid:   '#5C5148',   // warm mid tone
  textFaint: '#9C9088',   // muted faint text
  accent:    '#2B4A3F',   // deep forest green (editorial)
  accentLt:  '#3D6B5E',   // lighter green
  accentBg:  '#EBF2EF',   // very light green tint
  amber:     '#C4874A',   // warm amber accent
  amberBg:   '#FDF3E7',   // light amber tint
  red:       '#C04A3A',   // editorial red (reading indicator)
  white:     '#FFFFFF',
  stat:      '#F0EDE8',   // stat card bg
};

let elCount = 0;

function rect(x, y, w, h, fill, opts = {}) {
  elCount++;
  const rx  = opts.rx  !== undefined ? `rx="${opts.rx}"` : '';
  const op  = opts.opacity !== undefined ? `opacity="${opts.opacity}"` : '';
  const st  = opts.stroke ? `stroke="${opts.stroke}" stroke-width="${opts.sw || 1}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${rx} ${op} ${st}/>`;
}
function text(x, y, content, size, fill, opts = {}) {
  elCount++;
  const fw     = opts.fw     ? `font-weight="${opts.fw}"` : '';
  const font   = opts.font   ? `font-family="${opts.font}"` : `font-family="Georgia, serif"`;
  const anchor = opts.anchor ? `text-anchor="${opts.anchor}"` : '';
  const ls     = opts.ls     ? `letter-spacing="${opts.ls}"` : '';
  const op     = opts.opacity !== undefined ? `opacity="${opts.opacity}"` : '';
  const dec    = opts.dec    ? `text-decoration="${opts.dec}"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${fw} ${font} ${anchor} ${ls} ${op} ${dec}>${content}</text>`;
}
function circle(cx, cy, r, fill, opts = {}) {
  elCount++;
  const op = opts.opacity !== undefined ? `opacity="${opts.opacity}"` : '';
  const st = opts.stroke ? `stroke="${opts.stroke}" stroke-width="${opts.sw || 1}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${op} ${st}/>`;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  elCount++;
  const sw = opts.sw || 1;
  const op = opts.opacity !== undefined ? `opacity="${opts.opacity}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" ${op}/>`;
}
function pill(x, y, w, h, fill, rx) {
  elCount++;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx || h/2}"/>`;
}

// ── Shared UI chrome ─────────────────────────────────────────────────────────
function statusBar(label) {
  return [
    rect(0, 0, 390, 44, C.bg),
    text(195, 16, '9:41', 13, C.textMid, { fw: '500', anchor: 'middle', font: 'system-ui, sans-serif', ls: '0.5' }),
    // battery
    rect(348, 6, 25, 12, 'none', { rx: 3, stroke: C.textMid, sw: 1.2 }),
    rect(350, 8, 17, 8, C.textMid, { rx: 1.5 }),
    rect(374, 9, 3, 6, C.textMid, { rx: 1 }),
    // signal dots
    circle(312, 12, 3, C.textMid),
    circle(322, 12, 3, C.textMid),
    circle(332, 12, 3, C.textMid),
  ].join('');
}

function navBar(active) {
  const tabs = [
    { id: 'brief',  label: 'Brief',   x: 48 },
    { id: 'read',   label: 'Reading', x: 130 },
    { id: 'collect',label: 'Saved',   x: 212 },
    { id: 'you',    label: 'You',     x: 290 },
  ];
  let out = rect(0, 790, 390, 54, C.surface);
  out += line(0, 790, 390, 790, C.border, { sw: 0.8 });
  tabs.forEach(t => {
    const isActive = t.id === active;
    const col = isActive ? C.accent : C.textFaint;
    out += text(t.x, 822, t.label, 10.5, col, {
      fw: isActive ? '600' : '400',
      anchor: 'middle',
      font: 'system-ui, sans-serif',
      ls: '0.3',
    });
    if (isActive) out += rect(t.x - 16, 790, 32, 2, C.accent, { rx: 1 });
  });
  return out;
}

// ── SCREEN 1: Morning Brief ──────────────────────────────────────────────────
function screen1() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar());

  // Header
  els.push(text(24, 68, 'GIST', 20, C.accent, { fw: '700', font: 'system-ui, sans-serif', ls: '3' }));
  els.push(text(24, 94, 'Monday, 13 April', 13, C.textFaint, { font: 'system-ui, sans-serif', fw: '400' }));
  // Bookmark icon (right)
  els.push(rect(348, 58, 20, 20, 'none'));
  els.push(text(358, 72, '⊡', 16, C.textMid, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Divider
  els.push(line(24, 108, 366, 108, C.border, { sw: 0.8 }));

  // Today's count
  els.push(text(24, 132, '8 stories curated for you', 12, C.textFaint, { font: 'system-ui, sans-serif', ls: '0.2' }));
  els.push(pill(270, 119, 96, 22, C.accentBg, 11));
  els.push(text(318, 134, 'Est. 24 min read', 10, C.accentLt, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Featured story — large editorial card
  els.push(rect(24, 148, 342, 188, C.surface, { rx: 12, stroke: C.border, sw: 0.8 }));
  // Warm image placeholder block
  els.push(rect(24, 148, 342, 100, C.card, { rx: 12 }));
  // Cover lines on the image
  els.push(rect(24, 200, 342, 48, C.text, { opacity: 0.06 }));
  // Category tag
  els.push(pill(36, 158, 66, 20, C.amberBg, 10));
  els.push(text(69, 172, 'TECHNOLOGY', 8.5, C.amber, { fw: '600', anchor: 'middle', font: 'system-ui, sans-serif', ls: '1.2' }));
  // Photo lines suggesting landscape
  els.push(line(24, 180, 366, 180, C.border, { sw: 0.5, opacity: 0.5 }));
  els.push(line(24, 165, 200, 165, C.border, { sw: 0.5, opacity: 0.4 }));
  // Story text
  els.push(text(36, 268, 'The Quiet Case for Offline-First', 17, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(36, 290, 'Software', 17, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(36, 314, 'Why the best apps work without internet', 12, C.textMid, { font: 'system-ui, sans-serif' }));
  // Meta
  els.push(circle(36, 326, 4, C.amber));
  els.push(text(46, 330, 'Wired · 8 min read', 10.5, C.textFaint, { font: 'system-ui, sans-serif' }));

  // Story list items
  const stories = [
    { cat: 'DESIGN',   catColor: C.accentBg,  catText: C.accentLt,  title: 'Warm Minimalism Is Having Its Moment',    src: 'Eye on Design · 5 min', border: true },
    { cat: 'SCIENCE',  catColor: '#F0ECF8',    catText: '#7A5BA6',   title: 'Forests Are Rewilding Faster Than Expected', src: 'The Atlantic · 6 min', border: true },
    { cat: 'CULTURE',  catColor: C.amberBg,   catText: C.amber,     title: 'The Return of the Handwritten Letter',    src: 'Aeon · 4 min', border: false },
  ];
  let sy = 358;
  stories.forEach(s => {
    if (s.border) els.push(line(24, sy - 1, 366, sy - 1, C.border, { sw: 0.6 }));
    els.push(pill(24, sy + 6, 58, 18, s.catColor, 9));
    els.push(text(53, sy + 19, s.cat, 7.5, s.catText, { fw: '700', anchor: 'middle', font: 'system-ui, sans-serif', ls: '1' }));
    els.push(text(90, sy + 13, s.title, 12.5, C.text, { fw: '500', font: 'Georgia, serif' }));
    els.push(text(90, sy + 30, s.src, 10.5, C.textFaint, { font: 'system-ui, sans-serif' }));
    // Chevron
    els.push(text(360, sy + 20, '›', 16, C.textFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
    sy += 52;
  });

  els.push(navBar('brief'));
  return els.join('');
}

// ── SCREEN 2: Article Reader ─────────────────────────────────────────────────
function screen2() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.surface));
  els.push(statusBar());

  // Back + progress
  els.push(text(24, 70, '← Brief', 13, C.accent, { font: 'system-ui, sans-serif', fw: '500' }));
  // Progress bar at top
  els.push(rect(0, 78, 390, 3, C.border));
  els.push(rect(0, 78, 130, 3, C.accent, { rx: 0 }));

  // Category
  els.push(pill(24, 90, 80, 22, C.accentBg, 11));
  els.push(text(64, 105, 'TECHNOLOGY', 8.5, C.accentLt, { fw: '600', anchor: 'middle', font: 'system-ui, sans-serif', ls: '1' }));

  // Headline — editorial serif, large
  els.push(text(24, 136, 'The Quiet Case for', 22, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(24, 162, 'Offline-First Software', 22, C.text, { fw: '600', font: 'Georgia, serif' }));

  // Standfirst
  els.push(text(24, 190, 'Why the apps that endure are the ones', 13, C.textMid, { font: 'Georgia, serif', fw: '400' }));
  els.push(text(24, 208, 'designed to work without a signal.', 13, C.textMid, { font: 'Georgia, serif', fw: '400' }));

  // Divider
  els.push(line(24, 224, 366, 224, C.border, { sw: 0.8 }));

  // Author bar
  els.push(circle(36, 242, 12, C.card));
  els.push(text(56, 246, 'By Mira Osei', 12, C.text, { fw: '500', font: 'system-ui, sans-serif' }));
  els.push(text(56, 260, 'Wired  ·  Apr 12, 2026  ·  8 min read', 11, C.textFaint, { font: 'system-ui, sans-serif' }));

  // Save + share
  els.push(pill(300, 230, 66, 28, C.accentBg, 14));
  els.push(text(333, 249, 'Save', 12, C.accent, { fw: '600', anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Divider
  els.push(line(24, 278, 366, 278, C.border, { sw: 0.8 }));

  // Body text — editorial serif simulation with natural line breaks
  const bodyLines = [
    'There is a quiet heresy spreading through software',
    'development circles: the idea that your app should',
    'work just as well when there is no internet.',
    '',
    'For the past decade, the cloud-first model has',
    'been the unquestioned orthodoxy. Store data',
    'remotely. Sync everything. Assume connectivity.',
    '',
    'But something is shifting. A new generation of',
    'developers — many of them frustrated users of',
    'the very products they build — are rediscovering',
    'an older principle.',
  ];
  let by = 302;
  bodyLines.forEach(l => {
    if (l === '') { by += 10; return; }
    els.push(text(24, by, l, 13.5, C.text, { font: 'Georgia, serif', fw: '400' }));
    by += 22;
  });

  // Pull quote
  els.push(rect(24, by + 8, 4, 52, C.accent, { rx: 2 }));
  els.push(text(38, by + 26, '"The best tool is the one', 14, C.accent, { font: 'Georgia, serif', fw: '400' }));
  els.push(text(38, by + 46, 'you can still use on a plane."', 14, C.accent, { font: 'Georgia, serif', fw: '400' }));

  // Reading position indicator
  els.push(text(195, 762, '34% read · 5 min remaining', 11, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  // Serif/size control
  els.push(text(24, 762, 'Aa', 13, C.textMid, { font: 'Georgia, serif', fw: '400' }));
  els.push(text(366, 762, '☰', 14, C.textMid, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(line(0, 770, 390, 770, C.border, { sw: 0.7 }));
  // Bottom progress fill
  els.push(rect(0, 837, 390, 7, C.bg));
  els.push(rect(0, 837, 132, 7, C.accent));
  // Home indicator
  els.push(rect(155, 840, 80, 4, C.textFaint, { rx: 2, opacity: 0.4 }));

  return els.join('');
}

// ── SCREEN 3: Collections / Saved ───────────────────────────────────────────
function screen3() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar());

  // Header
  els.push(text(24, 72, 'Saved', 26, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(24, 94, '47 stories across 6 collections', 12, C.textFaint, { font: 'system-ui, sans-serif' }));

  // Search bar
  els.push(rect(24, 108, 342, 38, C.card, { rx: 10, stroke: C.border, sw: 0.8 }));
  els.push(text(50, 131, 'Search saved stories…', 13, C.textFaint, { font: 'system-ui, sans-serif' }));
  els.push(circle(38, 127, 7, 'none', { stroke: C.textFaint, sw: 1.2 }));

  // Collection cards — 2-col grid
  const cols = [
    { name: 'Design',     count: 14, color: C.accentBg,  accent: C.accent,  last: 'Warm Minimalism…'   },
    { name: 'Science',    count: 9,  color: '#F0ECF8',    accent: '#7A5BA6', last: 'Forest Rewilding…'  },
    { name: 'Culture',    count: 11, color: C.amberBg,   accent: C.amber,   last: 'Handwritten Letter…' },
    { name: 'Tech',       count: 8,  color: '#F0F4FC',    accent: '#3D6CB5', last: 'Offline-First…'     },
    { name: 'Long Reads', count: 5,  color: '#F5F0EE',    accent: '#A05A4A', last: 'The Slowdown…'      },
  ];
  const positions = [
    { x: 24, y: 162 }, { x: 201, y: 162 },
    { x: 24, y: 278 }, { x: 201, y: 278 },
    { x: 24, y: 394 },
  ];
  cols.forEach((col, i) => {
    const pos = positions[i];
    const w = 165, h = 104;
    els.push(rect(pos.x, pos.y, w, h, C.surface, { rx: 12, stroke: C.border, sw: 0.8 }));
    els.push(rect(pos.x, pos.y, w, 36, col.color, { rx: 12 }));
    els.push(rect(pos.x, pos.y + 24, w, 12, col.color)); // bottom fill to square off bottom of header
    els.push(text(pos.x + 12, pos.y + 24, col.name, 13, col.accent, { fw: '600', font: 'system-ui, sans-serif' }));
    els.push(text(pos.x + 12, pos.y + 56, col.count + ' stories', 11, C.textFaint, { font: 'system-ui, sans-serif' }));
    els.push(text(pos.x + 12, pos.y + 74, col.last, 11.5, C.textMid, { font: 'Georgia, serif' }));
    // Count badge
    els.push(pill(pos.x + w - 38, pos.y + 8, 26, 18, 'rgba(0,0,0,0.08)', 9));
    els.push(text(pos.x + w - 25, pos.y + 21, col.count, 10, col.accent, { anchor: 'middle', font: 'system-ui, sans-serif', fw: '600' }));
  });

  // "New collection" button
  els.push(rect(201, 394, 165, 104, C.card, { rx: 12, stroke: C.border, sw: 0.8 }));
  els.push(text(283, 448, '+', 30, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif', fw: '300' }));
  els.push(text(283, 470, 'New collection', 11, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Recently saved
  els.push(text(24, 524, 'Recently Saved', 14, C.text, { fw: '600', font: 'system-ui, sans-serif' }));
  els.push(line(24, 540, 366, 540, C.border, { sw: 0.7 }));

  const recent = [
    { title: 'On Slowness as a Virtue', src: 'Aeon · 9 min', cat: 'Culture' },
    { title: 'How I Rebuilt My Focus', src: 'The Margin · 6 min', cat: 'Long Reads' },
    { title: 'Typography\'s Serif Revival', src: 'Eye on Design · 5 min', cat: 'Design' },
  ];
  let ry = 558;
  recent.forEach(r => {
    els.push(text(24, ry, r.title, 13, C.text, { fw: '500', font: 'Georgia, serif' }));
    els.push(text(24, ry + 18, r.src + '  ·  ' + r.cat, 10.5, C.textFaint, { font: 'system-ui, sans-serif' }));
    els.push(text(366, ry + 8, '›', 16, C.textFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
    if (ry < 640) els.push(line(24, ry + 30, 366, ry + 30, C.border, { sw: 0.5 }));
    ry += 48;
  });

  els.push(navBar('collect'));
  return els.join('');
}

// ── SCREEN 4: Discover / Topics ──────────────────────────────────────────────
function screen4() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar());

  // Header
  els.push(text(24, 72, 'Discover', 26, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(24, 94, 'Explore by topic or source', 12, C.textFaint, { font: 'system-ui, sans-serif' }));

  // Search
  els.push(rect(24, 108, 342, 38, C.card, { rx: 10, stroke: C.border, sw: 0.8 }));
  els.push(text(50, 131, 'Topics, writers, publications…', 13, C.textFaint, { font: 'system-ui, sans-serif' }));
  els.push(circle(38, 127, 7, 'none', { stroke: C.textFaint, sw: 1.2 }));

  // Featured topic
  els.push(text(24, 166, 'Trending Topics', 13, C.textMid, { fw: '600', font: 'system-ui, sans-serif', ls: '0.3' }));

  const topics = [
    { label: 'Slow Design',    col: C.accentBg,  text: C.accent },
    { label: 'Long-form',     col: C.amberBg,   text: C.amber  },
    { label: 'Climate',       col: '#EEF4EE',    text: '#3A6B3A' },
    { label: 'Art',           col: '#F5EEFA',    text: '#7A4AAA' },
    { label: 'Architecture',  col: '#F0F4FC',    text: '#3D6CB5' },
    { label: 'Philosophy',    col: '#F5F0EE',    text: '#A05A4A' },
    { label: 'Future Work',   col: '#FDF3E7',    text: C.amber  },
    { label: 'Wellness',      col: '#EDFAF2',    text: '#2A7A4A' },
  ];
  let tx = 24, ty = 184;
  topics.forEach((t, i) => {
    const w = t.label.length * 7.8 + 22;
    if (tx + w > 366) { tx = 24; ty += 36; }
    els.push(pill(tx, ty, w, 26, t.col, 13));
    els.push(text(tx + w/2, ty + 17, t.label, 12, t.text, { fw: '500', anchor: 'middle', font: 'system-ui, sans-serif' }));
    tx += w + 8;
  });

  // Publications
  els.push(text(24, 300, 'Publications', 13, C.textMid, { fw: '600', font: 'system-ui, sans-serif', ls: '0.3' }));
  els.push(line(24, 312, 366, 312, C.border, { sw: 0.7 }));

  const pubs = [
    { name: 'Aeon Magazine',    desc: 'Philosophy, science, culture', count: '3 stories today' },
    { name: 'Eye on Design',    desc: 'Visual culture & design',       count: '2 stories today' },
    { name: 'The Atlantic',     desc: 'Long-form journalism',          count: '5 stories today' },
    { name: 'Delayed Gratification', desc: 'The slow journalism mag', count: '1 story today'   },
  ];
  let py = 328;
  pubs.forEach(p => {
    // Pub avatar
    els.push(rect(24, py, 40, 40, C.card, { rx: 8, stroke: C.border, sw: 0.7 }));
    els.push(text(44, py + 26, p.name[0], 16, C.textMid, { anchor: 'middle', font: 'Georgia, serif', fw: '600' }));
    els.push(text(74, py + 14, p.name, 13, C.text, { fw: '500', font: 'system-ui, sans-serif' }));
    els.push(text(74, py + 30, p.desc, 11, C.textFaint, { font: 'system-ui, sans-serif' }));
    // Count badge
    els.push(pill(280, py + 10, 82, 20, C.accentBg, 10));
    els.push(text(321, py + 24, p.count, 9.5, C.accentLt, { anchor: 'middle', font: 'system-ui, sans-serif', fw: '500' }));
    els.push(line(24, py + 52, 366, py + 52, C.border, { sw: 0.5 }));
    py += 58;
  });

  // Writers
  els.push(text(24, py + 14, 'Writers You Follow', 13, C.textMid, { fw: '600', font: 'system-ui, sans-serif', ls: '0.3' }));
  const writers = ['M. Osei', 'P. Bates', 'K. Faulk', 'A. Nour'];
  let wx = 24;
  writers.forEach(w => {
    els.push(circle(wx + 20, py + 48, 18, C.card, { stroke: C.border, sw: 0.7 }));
    els.push(text(wx + 20, py + 54, w[0] + w.split(' ')[1][0], 12, C.textMid, { anchor: 'middle', font: 'system-ui, sans-serif', fw: '600' }));
    els.push(text(wx + 20, py + 76, w, 9.5, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    wx += 72;
  });

  els.push(navBar('collect'));
  return els.join('');
}

// ── SCREEN 5: Reading Stats / You ────────────────────────────────────────────
function screen5() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar());

  // Header
  els.push(text(24, 72, 'Your Reading', 26, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(24, 94, 'April 2026  ·  Week 15', 12, C.textFaint, { font: 'system-ui, sans-serif' }));

  // Period toggle
  els.push(rect(24, 106, 200, 30, C.card, { rx: 10, stroke: C.border, sw: 0.7 }));
  ['Week', 'Month', 'Year'].forEach((p, i) => {
    if (i === 0) {
      els.push(rect(24, 106, 68, 30, C.accent, { rx: 10 }));
      els.push(text(58, 126, p, 12, C.white, { anchor: 'middle', font: 'system-ui, sans-serif', fw: '600' }));
    } else {
      els.push(text(24 + 68 * i + 34, 126, p, 12, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    }
  });

  // Key stats row
  const stats = [
    { label: 'Stories read', value: '23',     sub: '+5 vs last week' },
    { label: 'Time reading', value: '3h 12m', sub: 'Avg 8 min/story' },
    { label: 'Saved',        value: '8',      sub: 'In 3 collections' },
  ];
  let sx = 24;
  stats.forEach(s => {
    const w = 110;
    els.push(rect(sx, 150, w, 74, C.surface, { rx: 10, stroke: C.border, sw: 0.7 }));
    els.push(text(sx + 10, 178, s.value, 20, C.text, { fw: '600', font: 'system-ui, sans-serif' }));
    els.push(text(sx + 10, 193, s.label, 9.5, C.textFaint, { font: 'system-ui, sans-serif' }));
    els.push(text(sx + 10, 210, s.sub, 9, C.accentLt, { font: 'system-ui, sans-serif' }));
    sx += 118;
  });

  // Reading streak
  els.push(rect(24, 238, 342, 56, C.accentBg, { rx: 12 }));
  els.push(text(44, 258, '🔥', 16, C.text, { font: 'system-ui, sans-serif' }));
  els.push(text(64, 260, '14-day reading streak', 13.5, C.accent, { fw: '600', font: 'system-ui, sans-serif' }));
  els.push(text(64, 278, 'You\'ve read something every day this fortnight.', 11, C.accentLt, { font: 'system-ui, sans-serif' }));

  // Activity chart — daily bars this week
  els.push(text(24, 320, 'This Week', 13, C.textMid, { fw: '600', font: 'system-ui, sans-serif', ls: '0.3' }));
  const days = ['M', 'T', 'W', 'T', 'F', 'Sa', 'Su'];
  const vals  = [4,   6,   3,   7,   5,   2,    4  ];
  const maxV = Math.max(...vals);
  const barW = 34, barGap = 14, chartH = 90, chartY = 380;
  days.forEach((d, i) => {
    const bh = Math.round((vals[i] / maxV) * chartH);
    const bx = 24 + i * (barW + barGap);
    const by = chartY + chartH - bh;
    const isToday = d === 'Su';
    els.push(rect(bx, chartY, barW, chartH, C.card, { rx: 6 }));
    els.push(rect(bx, by, barW, bh, isToday ? C.accent : '#B4C9C2', { rx: 6 }));
    els.push(text(bx + barW/2, chartY + chartH + 16, d, 11, isToday ? C.accent : C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif', fw: isToday ? '600' : '400' }));
    els.push(text(bx + barW/2, by - 6, vals[i], 10, C.textMid, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Topics breakdown
  els.push(text(24, 500, 'Topics This Week', 13, C.textMid, { fw: '600', font: 'system-ui, sans-serif', ls: '0.3' }));
  els.push(line(24, 514, 366, 514, C.border, { sw: 0.7 }));
  const topicBreak = [
    { label: 'Design',   pct: 35, col: C.accent   },
    { label: 'Culture',  pct: 28, col: C.amber    },
    { label: 'Science',  pct: 22, col: '#7A5BA6'  },
    { label: 'Tech',     pct: 15, col: '#3D6CB5'  },
  ];
  let tby = 530;
  topicBreak.forEach(t => {
    els.push(text(24, tby + 14, t.label, 12, C.text, { font: 'system-ui, sans-serif', fw: '500' }));
    els.push(text(366, tby + 14, t.pct + '%', 12, t.col, { anchor: 'end', font: 'system-ui, sans-serif', fw: '600' }));
    // Track
    els.push(rect(24, tby + 20, 342, 8, C.card, { rx: 4 }));
    els.push(rect(24, tby + 20, Math.round(342 * t.pct / 100), 8, t.col, { rx: 4 }));
    tby += 40;
  });

  // Average reading time
  els.push(rect(24, 706, 342, 60, C.surface, { rx: 10, stroke: C.border, sw: 0.7 }));
  els.push(text(36, 728, 'Best reading time', 12, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(text(36, 752, '7 – 9 AM', 20, C.text, { fw: '600', font: 'Georgia, serif' }));
  els.push(text(220, 728, 'Avg story length', 12, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(text(220, 752, '7.2 min', 20, C.text, { fw: '600', font: 'Georgia, serif' }));

  els.push(navBar('you'));
  return els.join('');
}

// ── SCREEN 6: Onboarding / Welcome ──────────────────────────────────────────
function screen6() {
  let els = [];

  els.push(rect(0, 0, 390, 844, C.surface));
  els.push(statusBar());

  // Warm decorative background element — subtle
  els.push(rect(0, 0, 390, 300, C.bg));
  // Decorative grid lines — newspaper-feel
  for (let i = 0; i < 8; i++) {
    els.push(line(0, i * 38, 390, i * 38, C.border, { sw: 0.5, opacity: 0.4 }));
  }

  // Logo mark — large editorial
  els.push(text(195, 148, 'GIST', 52, C.text, { fw: '700', anchor: 'middle', font: 'system-ui, sans-serif', ls: '8' }));
  els.push(text(195, 178, 'Slow reading for busy minds.', 14, C.textMid, { anchor: 'middle', font: 'Georgia, serif', fw: '400' }));

  // Divider rule
  els.push(line(120, 200, 270, 200, C.border, { sw: 1 }));

  // Three value props with elegant minimal presentation
  const props = [
    { icon: '◎', title: 'Curated daily',   body: 'Eight hand-picked stories every morning, never an algorithm.' },
    { icon: '◈', title: 'Your pace',        body: 'Reading streaks, not streaks of anxiety. Go at your own speed.' },
    { icon: '◇', title: 'Pure reading',    body: 'No comments, no likes, no distractions. Just words.' },
  ];
  let py = 240;
  props.forEach(p => {
    els.push(text(48, py, p.icon, 18, C.accent, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(70, py - 4, p.title, 14, C.text, { fw: '600', font: 'system-ui, sans-serif' }));
    els.push(text(70, py + 14, p.body, 12, C.textMid, { font: 'Georgia, serif', fw: '400' }));
    py += 72;
  });

  // Divider
  els.push(line(24, 468, 366, 468, C.border, { sw: 0.8 }));

  // Select interests
  els.push(text(195, 498, 'What do you love to read?', 15, C.text, { anchor: 'middle', fw: '600', font: 'system-ui, sans-serif' }));
  els.push(text(195, 518, 'Choose at least 3 topics to get started.', 12, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  const interests = [
    { label: 'Design',    selected: true  },
    { label: 'Science',   selected: true  },
    { label: 'Culture',   selected: false },
    { label: 'Tech',      selected: true  },
    { label: 'Climate',   selected: false },
    { label: 'Wellness',  selected: false },
    { label: 'History',   selected: false },
    { label: 'Art',       selected: true  },
  ];
  let ix = 24, iy = 532;
  interests.forEach(int => {
    const w = int.label.length * 7.5 + 24;
    if (ix + w > 366) { ix = 24; iy += 38; }
    const bg = int.selected ? C.accent : C.card;
    const col = int.selected ? C.white : C.textMid;
    els.push(pill(ix, iy, w, 28, bg, 14));
    els.push(text(ix + w/2, iy + 18.5, int.label, 12, col, { anchor: 'middle', font: 'system-ui, sans-serif', fw: int.selected ? '600' : '400' }));
    ix += w + 8;
  });

  // CTA
  els.push(rect(24, 720, 342, 52, C.accent, { rx: 14 }));
  els.push(text(195, 752, 'Start Reading', 15, C.white, { anchor: 'middle', fw: '600', font: 'system-ui, sans-serif' }));

  // Terms
  els.push(text(195, 792, 'By continuing you agree to our Terms & Privacy Policy', 10.5, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Home indicator
  els.push(rect(155, 824, 80, 4, C.border, { rx: 2 }));

  return els.join('');
}

// ── Assemble pen ─────────────────────────────────────────────────────────────
const screens = [
  { name: 'Morning Brief',   content: screen1() },
  { name: 'Article Reader',  content: screen2() },
  { name: 'Collections',     content: screen3() },
  { name: 'Discover',        content: screen4() },
  { name: 'Reading Stats',   content: screen5() },
  { name: 'Welcome',         content: screen6() },
];

const W = 390, H = 844;
const pen = {
  version: '2.8',
  metadata: {
    name:      'GIST — Slow Reading Digest',
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     THEME,
    heartbeat: 'April 2026',
    elements:  elCount,
    inspired:  'Minimal Gallery warm-minimal + Lapa Ninja serif revival',
  },
  screens: screens.map(s => ({
    name:     s.name,
    width:    W,
    height:   H,
    svg:      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s.content}</svg>`,
    elements: [],
  })),
};

// update element count in metadata
pen.metadata.elements = elCount;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elCount} elements`);
console.log(`Written: ${SLUG}.pen`);
