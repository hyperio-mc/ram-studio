'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'chalk';
const NAME = 'CHALK';
const TAGLINE = 'Think in long form';
const HEARTBEAT = 'light-editorial';

// ─── Palette (light / warm editorial) ─────────────────────────────────────
const BG     = '#FAF8F4';  // warm cream
const SURF   = '#FFFFFF';  // white card surface
const CARD   = '#F5F1EB';  // slightly warm card
const TEXT   = '#1C1A18';  // deep warm near-black
const TEXT2  = '#6B6560';  // muted mid-tone
const ACC    = '#C0522E';  // terracotta accent (single accent rule)
const ACCLT  = '#F0E2DC';  // light terracotta tint
const BORDER = 'rgba(28,26,24,0.08)';
const W = 390, H = 844;

let allElements = [];

// ─── Primitives ────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill, rx: opts.rx || 0, opacity: opts.opacity || 1, stroke: opts.stroke || 'none', sw: opts.sw || 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, size, fill, fw: opts.fw || '400', font: opts.font || 'system-ui', anchor: opts.anchor || 'start', ls: opts.ls || '0', opacity: opts.opacity || 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity || 1, stroke: opts.stroke || 'none', sw: opts.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, sw: opts.sw || 1, opacity: opts.opacity || 1 };
}

// SVG builder
function buildSvg(elements) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      const rx = el.rx ? `rx="${el.rx}"` : '';
      const st = el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" ${rx} opacity="${el.opacity}" ${st}/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw}" font-family="${el.font}" text-anchor="${el.anchor}" letter-spacing="${el.ls}" opacity="${el.opacity}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      const st = el.stroke !== 'none' ? `stroke="${el.stroke}" stroke-width="${el.sw}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" ${st}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw}" opacity="${el.opacity}" stroke-linecap="round"/>`;
    }
    return '';
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${shapes}\n</svg>`;
}

// ─── Background dot grid texture ──────────────────────────────────────────
function dotGrid(els, startY = 44, endY = H - 83, spacing = 24) {
  for (let gy = startY + spacing; gy < endY; gy += spacing) {
    for (let gx = spacing; gx < W; gx += spacing) {
      els.push(circle(gx, gy, 0.8, TEXT, { opacity: 0.03 }));
    }
  }
}

// ─── Shared components ─────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 28, '9:41', 14, TEXT, { fw: '500', font: 'system-ui' }));
  els.push(text(W - 20, 28, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.5 }));
}

function navBar(els, active) {
  // nav background
  els.push(rect(0, H - 83, W, 83, SURF));
  els.push(line(0, H - 83, W, H - 83, BORDER, { sw: 1 }));
  const tabs = [
    { id: 0, label: 'Library', icon: 'B' },
    { id: 1, label: 'Explore', icon: 'E' },
    { id: 2, label: 'New', icon: '+' },
    { id: 3, label: 'Collections', icon: 'C' },
    { id: 4, label: 'Profile', icon: 'P' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tw * i + tw / 2;
    const isActive = i === active;
    if (i === 2) {
      // centre plus button
      els.push(circle(cx, H - 52, 22, ACC));
      els.push(text(cx, H - 46, t.icon, 20, SURF, { fw: '300', anchor: 'middle' }));
    } else {
      const col = isActive ? ACC : TEXT2;
      els.push(text(cx, H - 54, t.icon, 18, col, { anchor: 'middle', fw: isActive ? '600' : '400', font: 'Georgia, serif' }));
      els.push(text(cx, H - 36, t.label, 10, col, { anchor: 'middle', fw: isActive ? '500' : '400' }));
      if (isActive) els.push(circle(cx, H - 22, 3, ACC));
    }
  });
}

function serifHeadline(els, x, y, lines, size, fill, opts = {}) {
  lines.forEach((ln, i) => {
    els.push(text(x, y + i * (size * 1.25), ln, size, fill, { font: 'Georgia, serif', fw: '400', ...opts }));
  });
}

// ─── SCREEN 1: Library ─────────────────────────────────────────────────────
function screen1() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, BG));
  dotGrid(els, 44, H - 83, 44);
  statusBar(els);

  // Top bar
  els.push(text(20, 74, 'CHALK', 22, TEXT, { fw: '700', ls: '3', font: 'system-ui' }));
  // search icon
  els.push(circle(354, 66, 16, CARD));
  els.push(text(354, 71, '○', 16, TEXT2, { anchor: 'middle' }));

  // Editorial hero section
  els.push(rect(20, 92, W - 40, 130, CARD, { rx: 12 }));
  // small tag
  els.push(rect(32, 104, 72, 20, ACCLT, { rx: 4 }));
  els.push(text(68, 118, 'TODAY\'S THREAD', 8, ACC, { anchor: 'middle', fw: '600', ls: '1' }));
  // big serif headline
  serifHeadline(els, 32, 148, ['The anatomy of', 'a good argument'], 18, TEXT);
  // meta
  els.push(text(32, 208, '12 min read  ·  Philosophy', 11, TEXT2));
  // reading progress bar
  els.push(rect(32, 218, W - 64, 4, CARD, { rx: 2 }));
  els.push(rect(32, 218, 130, 4, ACC, { rx: 2 }));

  // Section label
  els.push(text(20, 250, 'Recent Notes', 16, TEXT, { fw: '600' }));
  els.push(text(W - 20, 250, 'View all', 13, ACC, { anchor: 'end' }));

  // Note cards list
  const notes = [
    { title: 'On the concept of deep work', tag: 'Productivity', mins: '4 min', progress: 0 },
    { title: 'Mental models for decision making', tag: 'Thinking', mins: '8 min', progress: 0.6 },
    { title: 'The art of asking better questions', tag: 'Learning', mins: '6 min', progress: 0.2 },
    { title: 'Why silence is a design tool', tag: 'Design', mins: '3 min', progress: 0.85 },
  ];

  let cy = 270;
  notes.forEach((n, i) => {
    els.push(rect(20, cy, W - 40, 68, SURF, { rx: 10 }));
    els.push(rect(20, cy, W - 40, 68, BORDER, { rx: 10, stroke: 'rgba(28,26,24,0.08)', sw: 1, fill: 'none' }));

    // left accent bar if in progress
    if (n.progress > 0) {
      els.push(rect(20, cy, 3, 68, ACC, { rx: 2 }));
    }

    // tag
    els.push(rect(32, cy + 10, n.tag.length * 6 + 12, 16, ACCLT, { rx: 3 }));
    els.push(text(38, cy + 22, n.tag, 9, ACC, { fw: '500' }));

    // serif title
    serifHeadline(els, 32, cy + 44, [n.title.length > 30 ? n.title.slice(0, 30) + '…' : n.title], 14, TEXT);

    // meta
    els.push(text(W - 24, cy + 44, n.mins, 11, TEXT2, { anchor: 'end' }));

    // progress dot
    if (n.progress > 0) {
      const progressW = (W - 64) * n.progress;
      els.push(rect(32, cy + 59, W - 64, 3, CARD, { rx: 1 }));
      els.push(rect(32, cy + 59, progressW, 3, ACC, { rx: 1 }));
    }

    cy += 78;
  });

  navBar(els, 0);

  allElements += els.length;
  return { name: 'Library', svg: buildSvg(els), elements: els };
}

// ─── SCREEN 2: Note Reading View ───────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  statusBar(els);

  // back + save
  els.push(text(20, 73, '←', 20, TEXT2));
  els.push(text(W - 20, 73, '♡', 20, TEXT2, { anchor: 'end' }));
  els.push(text(W - 48, 73, '⋯', 20, TEXT2, { anchor: 'end' }));

  // Article tag + reading time
  els.push(rect(20, 92, 78, 22, ACCLT, { rx: 5 }));
  els.push(text(59, 107, 'PHILOSOPHY', 9, ACC, { anchor: 'middle', fw: '600', ls: '0.5' }));
  els.push(text(W - 20, 107, '12 min', 12, TEXT2, { anchor: 'end' }));

  // Big editorial serif headline
  serifHeadline(els, 20, 140, ['The anatomy of', 'a good argument'], 28, TEXT, { fw: '400' });

  // Author + date
  els.push(circle(20, 186, 12, ACC, { opacity: 0.15 }));
  els.push(circle(20, 186, 12, SURF, { stroke: ACC, sw: 1 }));
  els.push(text(20, 191, 'R', 10, ACC, { anchor: 'middle', fw: '600' }));
  els.push(text(38, 183, 'Rakis', 13, TEXT, { fw: '500' }));
  els.push(text(38, 197, 'Apr 9, 2026', 11, TEXT2));

  // Separator
  els.push(line(20, 210, W - 20, 210, BORDER, { sw: 1, opacity: 1 }));

  // Drop cap first para
  els.push(text(20, 256, 'A', 56, ACC, { font: 'Georgia, serif', fw: '400' }));
  const bodyLines1 = [
    'n argument is a sequence of statements',
    'intended to establish a definite proposition.',
    'Not all collections of claims qualify —',
    'there must be structure, evidence, and',
    'a conclusion that the premises support.',
  ];
  bodyLines1.forEach((ln, i) => {
    els.push(text(58, 230 + i * 18, ln, 13, TEXT, { font: 'Georgia, serif', opacity: 0.9 }));
  });

  // Callout quote block
  els.push(rect(20, 328, W - 40, 72, ACCLT, { rx: 8 }));
  els.push(rect(20, 328, 3, 72, ACC, { rx: 1 }));
  els.push(text(32, 353, '"The strength of an argument is', 13, TEXT, { font: 'Georgia, serif', fw: '400', opacity: 0.9 }));
  els.push(text(32, 371, 'not in its volume, but in its clarity."', 13, TEXT, { font: 'Georgia, serif', fw: '400', opacity: 0.9 }));
  els.push(text(32, 389, '— Aristotle, Rhetoric', 11, ACC, { font: 'system-ui' }));

  // Body continuation
  const bodyLines2 = [
    'There are three classical modes: logos,',
    'ethos, and pathos. Modern discourse tends',
    'to collapse these, relying on emotional',
    'appeals while dressing them as logic.',
  ];
  bodyLines2.forEach((ln, i) => {
    els.push(text(20, 420 + i * 18, ln, 13, TEXT, { font: 'Georgia, serif', opacity: 0.9 }));
  });

  // Section heading
  els.push(text(20, 502, 'Structure', 18, TEXT, { font: 'Georgia, serif', fw: '400' }));
  els.push(line(20, 510, 80, 510, ACC, { sw: 2 }));

  const bodyLines3 = [
    'Every valid argument has premises and a',
    'conclusion. The premises offer reasons;',
    'the conclusion is what you want accepted.',
  ];
  bodyLines3.forEach((ln, i) => {
    els.push(text(20, 526 + i * 18, ln, 13, TEXT, { font: 'Georgia, serif', opacity: 0.9 }));
  });

  // Highlights bar
  els.push(rect(20, 596, W - 40, 44, CARD, { rx: 10 }));
  els.push(text(32, 614, '✎', 14, ACC));
  els.push(text(52, 614, '3 highlights', 13, TEXT, { fw: '500' }));
  els.push(text(52, 628, 'Tap to review', 11, TEXT2));
  els.push(text(W - 28, 621, '→', 16, ACC, { anchor: 'end' }));

  // Reading progress strip
  els.push(rect(0, H - 83 - 8, W, 8, CARD));
  const pct = 0.35;
  els.push(rect(0, H - 83 - 8, W * pct, 8, ACC, { rx: 0 }));

  navBar(els, 0);

  allElements += els.length;
  return { name: 'Note Reading', svg: buildSvg(els), elements: els };
}

// ─── SCREEN 3: Explore (Bento Grid) ────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  dotGrid(els, 44, H - 83, 44);
  statusBar(els);

  els.push(text(20, 74, 'Explore', 24, TEXT, { fw: '700', font: 'Georgia, serif' }));
  els.push(text(20, 92, 'Threads curated for how you think', 13, TEXT2));

  // search bar
  els.push(rect(20, 108, W - 40, 38, CARD, { rx: 10 }));
  els.push(text(42, 131, '○ Search threads, topics, ideas…', 13, TEXT2));

  // Tags row
  const tags = ['All', 'Philosophy', 'Design', 'Science', 'Writing', 'Technology'];
  let tx = 20;
  tags.forEach((t, i) => {
    const tw = t.length * 7.5 + 20;
    const isFirst = i === 0;
    els.push(rect(tx, 158, tw, 26, isFirst ? ACC : CARD, { rx: 13 }));
    els.push(text(tx + tw / 2, 175, t, 12, isFirst ? SURF : TEXT2, { anchor: 'middle', fw: isFirst ? '600' : '400' }));
    tx += tw + 8;
  });

  // ─── BENTO GRID ───
  // Card 1: Large hero bento (spans full width, taller)
  els.push(rect(20, 196, W - 40, 130, CARD, { rx: 14 }));
  els.push(rect(20, 196, 3, 130, ACC, { rx: 2 }));
  els.push(rect(28, 210, 64, 18, ACCLT, { rx: 4 }));
  els.push(text(60, 223, 'FEATURED', 8, ACC, { anchor: 'middle', fw: '600', ls: '1' }));
  serifHeadline(els, 28, 250, ['The paradox of choice and', 'the art of satisficing'], 16, TEXT);
  els.push(text(28, 298, 'Decision Theory  ·  9 min read', 11, TEXT2));
  els.push(text(W - 28, 298, '→', 16, ACC, { anchor: 'end' }));
  // decorative serif letter in corner
  els.push(text(W - 32, 235, '"', 72, ACC, { anchor: 'end', opacity: 0.07, font: 'Georgia, serif' }));

  // Card 2 + 3: Two half-width cards side by side
  const cardW = (W - 48) / 2;
  // Card 2
  els.push(rect(20, 338, cardW, 100, SURF, { rx: 12, stroke: 'rgba(28,26,24,0.08)', sw: 1, fill: 'none' }));
  els.push(rect(20, 338, cardW, 100, CARD, { rx: 12 }));
  els.push(rect(28, 350, 40, 16, ACCLT, { rx: 3 }));
  els.push(text(48, 362, 'Writing', 9, ACC, { anchor: 'middle', fw: '500' }));
  serifHeadline(els, 28, 392, ['Voice in', 'non-fiction'], 14, TEXT);
  els.push(text(28, 422, '5 min', 10, TEXT2));
  // Card 3
  const cx3 = 28 + cardW;
  els.push(rect(cx3, 338, cardW, 100, CARD, { rx: 12 }));
  els.push(rect(cx3 + 8, 350, 48, 16, ACCLT, { rx: 3 }));
  els.push(text(cx3 + 32, 362, 'Science', 9, ACC, { anchor: 'middle', fw: '500' }));
  serifHeadline(els, cx3 + 8, 392, ['How memory', 'is formed'], 14, TEXT);
  els.push(text(cx3 + 8, 422, '7 min', 10, TEXT2));

  // Card 4: Stat card
  els.push(rect(20, 450, W - 40, 60, ACC, { rx: 12 }));
  serifHeadline(els, 32, 482, ['247 threads across 18 topics in your collection'], 13, SURF);
  els.push(text(W - 28, 492, '→', 18, SURF, { anchor: 'end' }));

  // Card 5 + 6: Two more half cards
  els.push(rect(20, 522, cardW, 90, CARD, { rx: 12 }));
  els.push(rect(28, 534, 46, 16, ACCLT, { rx: 3 }));
  els.push(text(51, 546, 'Design', 9, ACC, { anchor: 'middle', fw: '500' }));
  serifHeadline(els, 28, 573, ['Whitespace is', 'not empty'], 13, TEXT);
  els.push(text(28, 600, '4 min', 10, TEXT2));

  els.push(rect(cx3, 522, cardW, 90, CARD, { rx: 12 }));
  els.push(rect(cx3 + 8, 534, 52, 16, ACCLT, { rx: 3 }));
  els.push(text(cx3 + 34, 546, 'History', 9, ACC, { anchor: 'middle', fw: '500' }));
  serifHeadline(els, cx3 + 8, 573, ['The Gutenberg', 'press effect'], 13, TEXT);
  els.push(text(cx3 + 8, 600, '6 min', 10, TEXT2));

  // Card 7: Editor pick
  els.push(rect(20, 624, W - 40, 58, SURF, { rx: 12 }));
  els.push(rect(20, 624, 3, 58, TEXT, { rx: 2 }));
  els.push(text(32, 643, "Editor's Pick", 11, TEXT2, { fw: '500' }));
  serifHeadline(els, 32, 662, ['The examined life: Socratic questioning methods'], 13, TEXT);
  els.push(text(W - 28, 655, '→', 16, TEXT2, { anchor: 'end' }));

  navBar(els, 1);

  allElements += els.length;
  return { name: 'Explore', svg: buildSvg(els), elements: els };
}

// ─── SCREEN 4: New Note ────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  // subtle ruled lines for writing feel
  for (let ly = 220; ly < H - 83; ly += 28) {
    els.push(line(16, ly, W - 16, ly, BORDER, { sw: 0.7, opacity: 0.7 }));
  }
  statusBar(els);

  // Header
  els.push(text(20, 74, '✕', 18, TEXT2));
  els.push(rect(W / 2 - 40, 58, 80, 26, CARD, { rx: 13 }));
  els.push(text(W / 2, 76, 'New Note', 13, TEXT, { anchor: 'middle', fw: '500' }));
  els.push(rect(W - 72, 60, 54, 26, ACC, { rx: 13 }));
  els.push(text(W - 45, 78, 'Save', 13, SURF, { anchor: 'middle', fw: '500' }));

  // Format toolbar
  els.push(rect(0, 92, W, 40, CARD));
  const tools = ['H1', 'H2', 'B', 'I', '"', '—', '·', 'Link', '⌘'];
  tools.forEach((t, i) => {
    const tx2 = 16 + i * 40;
    const isActive = i === 0;
    if (isActive) {
      els.push(rect(tx2 - 6, 98, 28, 26, ACC, { rx: 5 }));
      els.push(text(tx2 + 8, 115, t, 13, SURF, { anchor: 'middle', fw: '600' }));
    } else {
      els.push(text(tx2 + 8, 115, t, 13, TEXT2, { anchor: 'middle' }));
    }
  });

  // Title area (large serif placeholder)
  els.push(text(20, 174, 'Title your thought…', 32, TEXT, { font: 'Georgia, serif', fw: '400', opacity: 0.25 }));

  // Cursor line
  els.push(rect(20, 182, 2, 36, ACC, { rx: 1 }));

  // Tag input
  els.push(rect(20, 196, 80, 26, CARD, { rx: 13 }));
  els.push(text(60, 213, '+ Topic', 12, TEXT2, { anchor: 'middle' }));

  // Body placeholder lines
  els.push(text(20, 244, 'Begin writing. Every great thread starts', 14, TEXT2, { font: 'Georgia, serif', opacity: 0.5 }));
  els.push(text(20, 262, 'with a single, honest sentence.', 14, TEXT2, { font: 'Georgia, serif', opacity: 0.5 }));

  // Typing simulation — partial body text
  els.push(text(20, 302, 'Arguments are not battles to be won,', 14, TEXT, { font: 'Georgia, serif' }));
  els.push(text(20, 320, 'but conversations to be deepened. The', 14, TEXT, { font: 'Georgia, serif' }));
  els.push(text(20, 338, 'best thinkers I know ask more than they', 14, TEXT, { font: 'Georgia, serif' }));
  els.push(text(20, 356, 'assert, and hold conclusions lightly.', 14, TEXT, { font: 'Georgia, serif' }));
  // text cursor
  els.push(rect(20 + 232, 360, 2, 18, ACC, { rx: 1 }));

  // Word count
  els.push(text(20, 390, '38 words', 11, TEXT2));

  // Idea seeds panel
  els.push(rect(20, 410, W - 40, 110, CARD, { rx: 14 }));
  els.push(text(32, 432, 'Related ideas from your library', 13, TEXT, { fw: '600' }));
  els.push(line(32, 440, W - 32, 440, BORDER, { sw: 1 }));
  const seeds = [
    'Steelman technique for stronger arguments',
    'The Minto Pyramid for structured thinking',
    'Why Socrates asked questions, not questions',
  ];
  seeds.forEach((s, i) => {
    els.push(text(32, 460 + i * 22, '○ ' + s, 12, TEXT2));
    if (i < seeds.length - 1) els.push(line(32, 470 + i * 22, W - 32, 470 + i * 22, BORDER, { sw: 0.5 }));
  });

  // Templates
  els.push(rect(20, 534, W - 40, 44, SURF, { rx: 12 }));
  els.push(text(32, 551, '⊞', 16, ACC));
  els.push(text(54, 551, 'Use a template', 14, TEXT, { fw: '500' }));
  els.push(text(54, 565, 'Essay, Thread, Summary, Q&A…', 12, TEXT2));
  els.push(text(W - 28, 560, '→', 16, ACC, { anchor: 'end' }));

  // Keyboard strip
  els.push(rect(0, H - 83 - 12, W, 12, BG));

  navBar(els, 2);

  allElements += els.length;
  return { name: 'New Note', svg: buildSvg(els), elements: els };
}

// ─── SCREEN 5: Collections ─────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  dotGrid(els, 44, H - 83, 44);
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Collections', 24, TEXT, { fw: '700', font: 'Georgia, serif' }));
  els.push(text(20, 92, '14 curated by you', 13, TEXT2));
  // new btn
  els.push(rect(W - 68, 58, 50, 26, ACC, { rx: 13 }));
  els.push(text(W - 43, 76, '+ New', 12, SURF, { anchor: 'middle', fw: '500' }));

  // Featured collection (large)
  els.push(rect(20, 108, W - 40, 120, TEXT, { rx: 14 }));
  // texture lines
  for (let i = 0; i < 8; i++) {
    els.push(line(20, 108 + i * 15, 200, 108, TEXT2, { sw: 0.5, opacity: 0.1 }));
  }
  els.push(rect(20, 108, 3, 120, ACC, { rx: 2 }));
  els.push(rect(32, 122, 60, 18, 'rgba(255,255,255,0.1)', { rx: 4 }));
  els.push(text(62, 135, 'PINNED', 9, SURF, { anchor: 'middle', fw: '600', ls: '1' }));
  serifHeadline(els, 32, 162, ['Philosophy of Mind', '& Consciousness'], 18, SURF);
  els.push(text(32, 208, '24 threads  ·  Updated yesterday', 11, 'rgba(255,255,255,0.6)'));
  els.push(text(W - 32, 208, '→', 16, ACC, { anchor: 'end' }));

  // Collection grid 2×2
  const cw = (W - 48) / 2;
  const collections = [
    { name: 'Writing Craft', count: 18, color: ACCLT },
    { name: 'Cognitive Science', count: 12, color: CARD },
    { name: 'Design Principles', count: 31, color: CARD },
    { name: 'Economic Thinking', count: 9, color: ACCLT },
  ];
  collections.forEach((c, i) => {
    const col = i % 2 === 0 ? 20 : 28 + cw;
    const row = 242 + Math.floor(i / 2) * 98;
    els.push(rect(col, row, cw, 88, c.color, { rx: 12 }));
    // letter marker
    els.push(text(col + 12, row + 30, c.name.charAt(0), 28, ACC, { font: 'Georgia, serif', fw: '400', opacity: 0.3 }));
    serifHeadline(els, col + 12, row + 56, [c.name.length > 16 ? c.name.slice(0, 16) + '…' : c.name], 14, TEXT);
    els.push(text(col + 12, row + 74, c.count + ' threads', 11, TEXT2));
  });

  // Recent activity section
  els.push(text(20, 452, 'Recently Added', 16, TEXT, { fw: '600' }));
  const recent = [
    { title: 'Gettier problems in epistemology', col: 'Philosophy of Mind' },
    { title: 'Passive voice and when to use it', col: 'Writing Craft' },
    { title: 'The Dunning-Kruger effect revisited', col: 'Cognitive Science' },
  ];
  recent.forEach((r, i) => {
    const ry = 472 + i * 56;
    els.push(rect(20, ry, W - 40, 48, SURF, { rx: 10 }));
    serifHeadline(els, 32, ry + 22, [r.title.length > 34 ? r.title.slice(0, 34) + '…' : r.title], 13, TEXT);
    els.push(rect(32, ry + 32, r.col.length * 5.5 + 10, 14, ACCLT, { rx: 3 }));
    els.push(text(37, ry + 43, r.col, 9, ACC, { fw: '500' }));
    els.push(text(W - 28, ry + 30, '→', 14, TEXT2, { anchor: 'end' }));
  });

  navBar(els, 3);

  allElements += els.length;
  return { name: 'Collections', svg: buildSvg(els), elements: els };
}

// ─── SCREEN 6: Insights ─────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  dotGrid(els, 44, H - 83, 44);
  statusBar(els);

  els.push(text(20, 74, 'Your Reading Mind', 22, TEXT, { fw: '400', font: 'Georgia, serif' }));
  els.push(text(20, 92, 'Week of Apr 7–13, 2026', 13, TEXT2));

  // Hero stat
  els.push(rect(20, 108, W - 40, 88, CARD, { rx: 14 }));
  els.push(text(W / 2, 156, '4.2 hrs', 40, TEXT, { anchor: 'middle', font: 'Georgia, serif', fw: '400' }));
  els.push(text(W / 2, 176, 'total reading this week', 13, TEXT2, { anchor: 'middle' }));
  els.push(rect(W / 2 - 30, 183, 60, 3, ACCLT, { rx: 1 }));
  els.push(rect(W / 2 - 30, 183, 38, 3, ACC, { rx: 1 }));

  // Week bar chart
  els.push(rect(20, 210, W - 40, 100, SURF, { rx: 14 }));
  els.push(text(32, 228, 'Daily reading', 13, TEXT, { fw: '600' }));
  const days = [
    { d: 'M', h: 0.3 },
    { d: 'T', h: 0.8 },
    { d: 'W', h: 0.5 },
    { d: 'T', h: 1.0 },
    { d: 'F', h: 0.6 },
    { d: 'S', h: 0.9 },
    { d: 'S', h: 0.4 },
  ];
  const barW = (W - 72) / 7;
  const maxH = 40;
  days.forEach((d, i) => {
    const bx = 32 + i * barW;
    const bh = d.h * maxH;
    const by = 284 - bh;
    const isToday = i === 5; // Saturday
    els.push(rect(bx + 2, by, barW - 6, bh, isToday ? ACC : ACCLT, { rx: 3 }));
    els.push(text(bx + barW / 2, 296, d.d, 10, isToday ? ACC : TEXT2, { anchor: 'middle', fw: isToday ? '600' : '400' }));
  });

  // Topic breakdown
  els.push(text(20, 328, 'By Topic', 16, TEXT, { fw: '600' }));
  const topics = [
    { name: 'Philosophy', pct: 0.38, reads: 12 },
    { name: 'Design', pct: 0.27, reads: 9 },
    { name: 'Writing', pct: 0.21, reads: 7 },
    { name: 'Science', pct: 0.14, reads: 4 },
  ];
  let ry = 348;
  topics.forEach((t) => {
    els.push(text(20, ry, t.name, 13, TEXT, { fw: '500' }));
    els.push(text(W - 20, ry, t.reads + ' threads', 12, TEXT2, { anchor: 'end' }));
    ry += 6;
    els.push(rect(20, ry, W - 40, 8, CARD, { rx: 4 }));
    els.push(rect(20, ry, (W - 40) * t.pct, 8, ACC, { rx: 4, opacity: 0.7 + t.pct * 0.3 }));
    ry += 24;
  });

  // Reading streak
  els.push(rect(20, 494, W - 40, 64, ACC, { rx: 14 }));
  els.push(text(32, 520, '🔥', 22));
  els.push(text(64, 517, '14-day streak', 16, SURF, { fw: '600' }));
  els.push(text(64, 535, 'Your longest run — keep going', 12, 'rgba(255,255,255,0.75)'));
  els.push(text(W - 28, 525, '14', 28, SURF, { anchor: 'end', font: 'Georgia, serif', fw: '400' }));

  // Highlights
  els.push(text(20, 580, 'Highlights this week', 16, TEXT, { fw: '600' }));
  const highlights = [
    '"Argument is to thought what grammar is to language."',
    '"Whitespace is not empty. It is a decision."',
  ];
  highlights.forEach((h, i) => {
    const hy = 600 + i * 56;
    els.push(rect(20, hy, W - 40, 48, CARD, { rx: 10 }));
    els.push(rect(20, hy, 3, 48, ACC, { rx: 2 }));
    els.push(text(32, hy + 20, h.length > 44 ? h.slice(0, 44) + '…' : h, 12, TEXT, { font: 'Georgia, serif', opacity: 0.85 }));
    els.push(text(32, hy + 36, h.slice(h.length - 20), 11, TEXT2, { font: 'Georgia, serif' }));
  });

  navBar(els, 3);

  allElements += els.length;
  return { name: 'Insights', svg: buildSvg(els), elements: els };
}

// ─── ASSEMBLE ──────────────────────────────────────────────────────────────
allElements = 0;
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 'chalk',
    elements: totalEls,
    screens: screens.length,
    palette: { bg: BG, surface: SURF, accent: ACC, text: TEXT },
    inspiration: 'minimal.gallery editorial pacing + lapa.ninja serif revival + saaspo bento grid',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: sc.svg,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
