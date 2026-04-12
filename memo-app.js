'use strict';
/**
 * MEMO — Heartbeat Generator
 * Theme: LIGHT (warm cream editorial)
 * Inspired by: lapa.ninja serif revival trend — Recoleta/Canela display serifs
 * in warm editorial contexts (Unwell brand, All You Can wellness brand)
 *
 * Palette — Warm Editorial Light:
 *   BG:      #FAF8F4  warm cream parchment
 *   SURF:    #FFFFFF  pure white cards
 *   CARD:    #F3EFE8  warm card fill
 *   ACC:     #C0392B  editorial red
 *   ACC2:    #4A7C6F  sage green
 *   MUTED:   rgba(28,26,23,0.42)
 */

const fs   = require('fs');
const path = require('path');

const SLUG = 'memo';
const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const BG    = '#FAF8F4';
const SURF  = '#FFFFFF';
const CARD  = '#F3EFE8';
const LINE  = '#E8E2D8';
const TEXT  = '#1C1A17';
const MUTED = 'rgba(28,26,23,0.42)';
const ACC   = '#C0392B';   // editorial red
const ACC2  = '#4A7C6F';   // sage green
const ACCS  = '#F9EDE9';   // red tint surface
const ACC2S = '#EBF3F1';   // sage tint surface

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const rx    = opts.rx    !== undefined ? opts.rx    : 0;
  const op    = opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : '';
  const st    = opts.stroke  ? ` stroke="${opts.stroke}" stroke-width="${opts.sw || 1}"` : '';
  return { type: 'rect', x, y, width: w, height: h, fill, rx, _raw: `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}"${op}${st}/>` };
}

function text(x, y, content, size, fill, opts = {}) {
  const fw     = opts.fw     || 400;
  const font   = opts.font   || 'Georgia, serif';
  const anchor = opts.anchor || 'start';
  const ls     = opts.ls     ? ` letter-spacing="${opts.ls}"` : '';
  const op     = opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : '';
  const style  = `font-size:${size}px;font-family:${font};font-weight:${fw};fill:${fill};text-anchor:${anchor}${ls ? `;letter-spacing:${opts.ls}px` : ''}`;
  return { type: 'text', x, y, content, _raw: `<text x="${x}" y="${y}" style="${style}"${op}>${content}</text>` };
}

function circle(cx, cy, r, fill, opts = {}) {
  const op = opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : '';
  const st = opts.stroke  ? ` stroke="${opts.stroke}" stroke-width="${opts.sw || 1}"` : '';
  return { type: 'circle', _raw: `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${op}${st}/>` };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const sw  = opts.sw || 1;
  const op  = opts.opacity !== undefined ? ` opacity="${opts.opacity}"` : '';
  const dash = opts.dash ? ` stroke-dasharray="${opts.dash}"` : '';
  return { type: 'line', _raw: `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${op}${dash}/>` };
}

function buildSVG(elements) {
  const inner = elements.map(e => e._raw || '').join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${inner}\n</svg>`;
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 48, BG));
  els.push(text(20, 31, '9:41', 14, TEXT, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 31, '●●● ▌▌', 12, TEXT, { fw: 400, font: 'system-ui, sans-serif', anchor: 'end', opacity: 0.6 }));
}

function navBar(els, activeIdx) {
  const tabs = [
    { label: 'Inbox',   icon: '✉' },
    { label: 'Write',   icon: '✎' },
    { label: 'Signals', icon: '◎' },
    { label: 'Spaces',  icon: '⊞' },
    { label: 'You',     icon: '○' },
  ];
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, LINE, { sw: 1 }));
  tabs.forEach((t, i) => {
    const x = 39 + i * 78;
    const isActive = i === activeIdx;
    if (isActive) {
      els.push(rect(x - 22, H - 68, 44, 28, ACCS, { rx: 14 }));
    }
    els.push(text(x, H - 49, t.icon, 16, isActive ? ACC : MUTED, { font: 'system-ui, sans-serif', anchor: 'middle' }));
    els.push(text(x, H - 28, t.label, 10, isActive ? ACC : MUTED, { fw: isActive ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });
}

// ── Screen 1 — Inbox Feed ────────────────────────────────────────────────────
function screenInbox() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header area
  els.push(text(20, 88, 'Memo', 32, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));
  els.push(text(20, 108, 'Your team, in writing.', 13, MUTED, { font: 'system-ui, sans-serif' }));

  // Search bar
  els.push(rect(20, 120, W - 40, 38, CARD, { rx: 10 }));
  els.push(text(42, 144, 'Search memos…', 13, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(text(38, 144, '⌕', 14, MUTED, { font: 'system-ui, sans-serif' }));

  // Section label
  els.push(text(20, 180, 'TODAY', 10, MUTED, { fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
  els.push(line(20, 185, W - 20, 185, LINE, { sw: 1 }));

  // Memo cards
  const memos = [
    { from: 'Ravi M.', initials: 'RM', role: 'Design Lead', time: '11:32 am', unread: true,
      subject: 'Q2 Brand Refresh — Final Notes', preview: 'Attached the updated type scale. The Recoleta pairing with…', color: ACC },
    { from: 'Yuna K.', initials: 'YK', role: 'Product', time: '10:14 am', unread: true,
      subject: 'Sprint 12 retrospective', preview: 'Three things shipped, two slipped. Let\'s debrief on the nav…', color: ACC2 },
    { from: 'Theo R.', initials: 'TR', role: 'Engineering', time: 'Yesterday',
      subject: 'API rate limit upgrade path', preview: 'Quick note on what we need before the next infra cycle…', color: '#7B6FA0' },
    { from: 'Sera L.', initials: 'SL', role: 'Growth', time: 'Tuesday',
      subject: 'Launch week comms draft', preview: 'I drafted the email sequence — please review sections 2 and…', color: '#B67A3D' },
  ];

  let y = 196;
  memos.forEach(m => {
    const cardH = 90;
    els.push(rect(20, y, W - 40, cardH, SURF, { rx: 12 }));
    if (m.unread) els.push(rect(20, y, W - 40, cardH, BG, { rx: 12, opacity: 0 }));

    // Avatar
    els.push(circle(52, y + 22, 16, m.color, { opacity: 0.15 }));
    els.push(circle(52, y + 22, 16, m.color, { opacity: 0, stroke: m.color, sw: 1.5 }));
    els.push(circle(52, y + 22, 14, m.color, { opacity: 0.1 }));
    els.push(text(52, y + 27, m.initials, 10, m.color, { fw: 700, font: 'system-ui, sans-serif', anchor: 'middle' }));

    // Meta
    els.push(text(78, y + 17, m.from, 13, TEXT, { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(78, y + 30, m.role, 11, MUTED, { font: 'system-ui, sans-serif' }));
    els.push(text(W - 28, y + 17, m.time, 11, MUTED, { font: 'system-ui, sans-serif', anchor: 'end' }));

    // Subject + preview
    els.push(text(78, y + 48, m.subject, 13, TEXT, { fw: m.unread ? 600 : 400, font: 'Georgia, serif' }));
    els.push(text(78, y + 65, m.preview.slice(0, 42) + '…', 11, MUTED, { font: 'system-ui, sans-serif' }));

    // Unread dot
    if (m.unread) els.push(circle(W - 30, y + 17, 4, ACC));

    y += cardH + 8;
  });

  // Floating compose button
  els.push(rect(W - 64, H - 144, 48, 48, ACC, { rx: 24 }));
  els.push(text(W - 40, H - 113, '✎', 20, SURF, { font: 'system-ui, sans-serif', anchor: 'middle' }));

  navBar(els, 0);
  return { name: 'Inbox', svg: buildSVG(els), elements: els };
}

// ── Screen 2 — Memo Reading View ─────────────────────────────────────────────
function screenReader() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  statusBar(els);

  // Back + actions
  els.push(text(20, 82, '← Back', 14, ACC, { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(text(W - 20, 82, '⋯', 20, TEXT, { font: 'system-ui, sans-serif', anchor: 'end' }));

  // Divider
  els.push(line(20, 96, W - 20, 96, LINE, { sw: 1 }));

  // Memo header — editorial typographic treatment
  els.push(rect(20, 106, W - 40, 3, ACC, { rx: 1.5 }));  // editorial rule

  els.push(text(20, 134, 'Q2 Brand Refresh', 26, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));
  els.push(text(20, 158, '— Final Notes', 26, TEXT, { fw: 300, font: 'Georgia, serif', ls: -0.5, opacity: 0.55 }));

  // Author block
  els.push(circle(32, 192, 16, ACC, { opacity: 0.12 }));
  els.push(text(32, 196, 'RM', 10, ACC, { fw: 700, font: 'system-ui, sans-serif', anchor: 'middle' }));
  els.push(text(56, 189, 'Ravi M.', 13, TEXT, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(56, 202, 'Design Lead  ·  Today 11:32 am', 11, MUTED, { font: 'system-ui, sans-serif' }));

  // Tags
  const tags = ['Brand', 'Q2 2026', 'Design System'];
  let tx = 20;
  tags.forEach(tag => {
    const tw = tag.length * 7 + 18;
    els.push(rect(tx, 218, tw, 22, CARD, { rx: 11 }));
    els.push(text(tx + tw / 2, 232, tag, 11, TEXT, { fw: 500, font: 'system-ui, sans-serif', anchor: 'middle' }));
    tx += tw + 8;
  });

  els.push(line(20, 252, W - 20, 252, LINE, { sw: 1, opacity: 0.5 }));

  // Body text (editorial blocks)
  const paragraphs = [
    { y: 276, text: 'Attached the updated type scale. The Recoleta pairing with' },
    { y: 293, text: 'Instrument Sans is landing well — see the specimen PDF.' },
    { y: 320, text: 'Three things to finalize before Thursday review:' },
  ];
  paragraphs.forEach(p => {
    els.push(text(20, p.y, p.text, 14, TEXT, { font: 'Georgia, serif', ls: -0.1 }));
  });

  // Numbered list items
  const items = [
    { n: '1', t: 'Lock headline weight at 700 for all h1 elements' },
    { n: '2', t: 'Confirm warm-red (#C0392B) as the primary accent' },
    { n: '3', t: 'Update the icon set to stroke-only, 1.5px weight' },
  ];
  items.forEach((item, i) => {
    const iy = 346 + i * 42;
    els.push(rect(20, iy, W - 40, 36, CARD, { rx: 8 }));
    els.push(text(36, iy + 22, item.n + '.', 13, ACC, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(56, iy + 22, item.t, 12, TEXT, { font: 'system-ui, sans-serif' }));
  });

  // Attachment card
  els.push(rect(20, 482, W - 40, 54, ACCS, { rx: 10 }));
  els.push(rect(32, 496, 32, 32, ACC, { rx: 6, opacity: 0.15 }));
  els.push(text(48, 516, '📄', 14, TEXT, { font: 'system-ui, sans-serif', anchor: 'middle' }));
  els.push(text(76, 510, 'brand-type-scale-v3.pdf', 13, TEXT, { fw: 500, font: 'system-ui, sans-serif' }));
  els.push(text(76, 526, '1.2 MB  ·  Tap to open', 11, MUTED, { font: 'system-ui, sans-serif' }));

  // Reply input
  els.push(rect(20, 558, W - 40, 44, CARD, { rx: 22, stroke: LINE, sw: 1 }));
  els.push(text(44, 585, 'Reply to Ravi…', 13, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(rect(W - 54, 563, 34, 34, ACC, { rx: 17 }));
  els.push(text(W - 37, 584, '↑', 16, SURF, { fw: 700, font: 'system-ui, sans-serif', anchor: 'middle' }));

  // React bar
  els.push(text(20, 625, '👍  12', 12, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(text(72, 625, '❤️  5', 12, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(text(114, 625, '💬  3 replies', 12, MUTED, { font: 'system-ui, sans-serif' }));

  navBar(els, 0);
  return { name: 'Read Memo', svg: buildSVG(els), elements: els };
}

// ── Screen 3 — Write Memo ─────────────────────────────────────────────────────
function screenWrite() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  statusBar(els);

  // Header
  els.push(text(20, 82, '✕ Discard', 14, MUTED, { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(rect(W - 88, 66, 72, 32, ACC, { rx: 16 }));
  els.push(text(W - 52, 86, 'Send', 14, SURF, { fw: 600, font: 'system-ui, sans-serif', anchor: 'middle' }));

  els.push(line(20, 106, W - 20, 106, LINE, { sw: 1 }));

  // To field
  els.push(text(20, 136, 'To', 12, MUTED, { fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));
  // Recipients
  const recips = ['Design', 'Product'];
  let rx2 = 46;
  recips.forEach(r => {
    const rw = r.length * 7 + 20;
    els.push(rect(rx2, 120, rw, 26, ACCS, { rx: 13 }));
    els.push(circle(rx2 + 12, 133, 7, ACC, { opacity: 0.3 }));
    els.push(text(rx2 + rw / 2 + 5, 137, r, 12, ACC, { fw: 500, font: 'system-ui, sans-serif', anchor: 'middle' }));
    rx2 += rw + 8;
  });
  els.push(text(rx2 + 2, 137, '+ Add', 12, ACC, { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(line(20, 152, W - 20, 152, LINE, { sw: 0.5, opacity: 0.5 }));

  // Subject field
  els.push(text(20, 176, 'SUBJECT', 10, MUTED, { fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
  els.push(text(20, 202, 'Q3 Creative Direction Brief', 20, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.3 }));
  // Cursor blink
  els.push(rect(282, 186, 2, 18, ACC, { rx: 1, opacity: 0.9 }));
  els.push(line(20, 214, W - 20, 214, LINE, { sw: 0.5, opacity: 0.5 }));

  // Formatting toolbar
  const tools = ['B', 'I', 'H', '"', '•', '—', '🔗', '📎'];
  tools.forEach((t, i) => {
    const tx = 20 + i * 44;
    if (i < 3) {
      els.push(rect(tx, 222, 36, 28, CARD, { rx: 6 }));
      els.push(text(tx + 18, 240, t, 13, TEXT, { fw: i === 0 ? 700 : i === 1 ? 400 : 400, font: i === 1 ? 'Georgia, serif' : 'system-ui, sans-serif', anchor: 'middle' }));
    } else {
      els.push(text(tx + 18, 240, t, 13, MUTED, { font: 'system-ui, sans-serif', anchor: 'middle' }));
    }
  });
  els.push(line(20, 258, W - 20, 258, LINE, { sw: 0.5, opacity: 0.5 }));

  // Body area with editorial typography
  const bodyLines = [
    { y: 290, t: 'Following last week\'s strategy session, here', size: 15, font: 'Georgia, serif' },
    { y: 312, t: 'are the creative principles for Q3.', size: 15, font: 'Georgia, serif' },
    { y: 344, t: 'VISUAL IDENTITY', size: 10, col: MUTED, fw: 700, font: 'system-ui', ls: 1.5 },
    { y: 368, t: 'We shift toward warm neutrals and reduce our', size: 14, font: 'Georgia, serif', col: TEXT },
    { y: 388, t: 'reliance on pure digital blues. The editorial red', size: 14, font: 'Georgia, serif', col: TEXT },
    { y: 408, t: 'becomes our sole accent.', size: 14, font: 'Georgia, serif', col: TEXT },
    { y: 438, t: 'TYPOGRAPHY', size: 10, col: MUTED, fw: 700, font: 'system-ui', ls: 1.5 },
    { y: 462, t: 'Headlines in Georgia. Body in system-ui.', size: 14, font: 'Georgia, serif', col: TEXT },
  ];
  bodyLines.forEach(l => {
    els.push(text(20, l.y, l.t, l.size || 15, l.col || TEXT, {
      font: l.font || 'Georgia, serif', fw: l.fw || 400, ls: l.ls || -0.1
    }));
  });

  // Word count
  els.push(text(20, 510, '127 words', 11, MUTED, { font: 'system-ui, sans-serif' }));

  // Inline attachment suggestion
  els.push(rect(20, 526, W - 40, 48, CARD, { rx: 10 }));
  els.push(text(36, 544, '📎', 14, TEXT, { font: 'system-ui, sans-serif' }));
  els.push(text(56, 544, 'Attach a file or image', 13, TEXT, { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(text(56, 560, 'PDF, image, Figma link…', 11, MUTED, { font: 'system-ui, sans-serif' }));

  navBar(els, 1);
  return { name: 'Write', svg: buildSVG(els), elements: els };
}

// ── Screen 4 — Signals (Analytics) ───────────────────────────────────────────
function screenSignals() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 88, 'Signals', 28, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));
  els.push(text(20, 107, 'How your writing lands.', 13, MUTED, { font: 'system-ui, sans-serif' }));

  // Period selector
  const periods = ['7d', '30d', '90d'];
  periods.forEach((p, i) => {
    const px = 20 + i * 56;
    const isActive = i === 1;
    els.push(rect(px, 118, 48, 26, isActive ? ACC : CARD, { rx: 13 }));
    els.push(text(px + 24, 135, p, 12, isActive ? SURF : MUTED, { fw: isActive ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  // Big metric cards row
  const metrics = [
    { label: 'Memos sent', val: '34', sub: '+8 this month', color: ACC },
    { label: 'Avg read time', val: '2.4m', sub: '↑ 18% from last', color: ACC2 },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * (W / 2);
    const mw = W / 2 - 28;
    els.push(rect(mx, 154, mw, 88, SURF, { rx: 14 }));
    els.push(rect(mx + 12, 166, 28, 28, m.color, { rx: 8, opacity: 0.12 }));
    els.push(text(mx + 26, 186, i === 0 ? '✉' : '⏱', 14, m.color, { font: 'system-ui, sans-serif', anchor: 'middle' }));
    els.push(text(mx + mw / 2, 216, m.val, 28, TEXT, { fw: 700, font: 'Georgia, serif', anchor: 'middle', ls: -1 }));
    els.push(text(mx + mw / 2, 232, m.label, 10, MUTED, { font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  // Read rate bar chart
  els.push(text(20, 268, 'READ RATE  BY DAY', 10, MUTED, { fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
  els.push(rect(20, 278, W - 40, 120, SURF, { rx: 14 }));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [0.72, 0.88, 0.65, 0.91, 0.78, 0.42, 0.55];
  const barW = 24, chartH = 80, chartY = 298;
  days.forEach((d, i) => {
    const bx = 36 + i * 46;
    const bh = vals[i] * chartH;
    const by = chartY + chartH - bh;
    const isMax = vals[i] === Math.max(...vals);
    els.push(rect(bx, by, barW, bh, isMax ? ACC : CARD, { rx: 5 }));
    if (isMax) {
      els.push(rect(bx, by, barW, bh, ACC, { rx: 5, opacity: 0.85 }));
    }
    els.push(text(bx + barW / 2, chartY + chartH + 16, d, 10, MUTED, { font: 'system-ui, sans-serif', anchor: 'middle' }));
    if (isMax) {
      els.push(rect(bx - 6, by - 26, 36, 20, ACC, { rx: 10 }));
      els.push(text(bx + barW / 2, by - 12, '91%', 10, SURF, { fw: 600, font: 'system-ui, sans-serif', anchor: 'middle' }));
    }
  });

  // Top memos by engagement
  els.push(text(20, 430, 'TOP MEMOS', 10, MUTED, { fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
  const topMemos = [
    { rank: '1', title: 'Q2 Brand Refresh — Final Notes', reads: '18 reads', pct: 94 },
    { rank: '2', title: 'Sprint 12 retrospective', reads: '14 reads', pct: 87 },
    { rank: '3', title: 'Launch week comms draft', reads: '11 reads', pct: 79 },
  ];
  topMemos.forEach((m, i) => {
    const my = 444 + i * 74;
    els.push(rect(20, my, W - 40, 66, SURF, { rx: 12 }));
    els.push(text(36, my + 20, m.rank, 18, MUTED, { fw: 700, font: 'Georgia, serif' }));
    els.push(line(52, my + 10, 52, my + 52, LINE, { sw: 1, opacity: 0.5 }));
    els.push(text(64, my + 21, m.title, 13, TEXT, { fw: 500, font: 'Georgia, serif' }));
    els.push(text(64, my + 37, m.reads, 11, MUTED, { font: 'system-ui, sans-serif' }));
    // Progress bar
    els.push(rect(64, my + 46, W - 100, 4, LINE, { rx: 2 }));
    els.push(rect(64, my + 46, (W - 100) * m.pct / 100, 4, ACC, { rx: 2 }));
    els.push(text(W - 30, my + 50, m.pct + '%', 10, ACC, { fw: 600, font: 'system-ui, sans-serif', anchor: 'end' }));
  });

  navBar(els, 2);
  return { name: 'Signals', svg: buildSVG(els), elements: els };
}

// ── Screen 5 — Spaces ────────────────────────────────────────────────────────
function screenSpaces() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 88, 'Spaces', 28, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));
  els.push(text(20, 107, 'Your team channels.', 13, MUTED, { font: 'system-ui, sans-serif' }));

  // New space button
  els.push(rect(W - 96, 72, 78, 32, ACCS, { rx: 16 }));
  els.push(text(W - 57, 92, '+ New', 13, ACC, { fw: 600, font: 'system-ui, sans-serif', anchor: 'middle' }));

  // Spaces list
  const spaces = [
    { icon: '🎨', name: 'Design Studio', desc: 'Brand, UI, creative direction', count: 24, dot: ACC, active: true },
    { icon: '🚀', name: 'Product Drops', desc: 'Launch updates, roadmap notes', count: 8, dot: ACC2, active: false },
    { icon: '📊', name: 'Growth & Data', desc: 'Analytics, experiments, results', count: 5, dot: '#7B6FA0', active: false },
    { icon: '🔧', name: 'Engineering', desc: 'Infra, deploys, tech notes', count: 16, dot: '#B67A3D', active: false },
    { icon: '💬', name: 'All Hands', desc: 'Company-wide announcements', count: 3, dot: '#4A7C6F', active: false },
  ];

  spaces.forEach((sp, i) => {
    const sy = 126 + i * 88;
    const cardH = 80;
    els.push(rect(20, sy, W - 40, cardH, SURF, { rx: 14 }));
    if (sp.active) {
      els.push(rect(20, sy, 4, cardH, ACC, { rx: 2 }));
    }

    // Icon bg
    els.push(rect(36, sy + 14, 44, 44, sp.active ? ACCS : CARD, { rx: 10 }));
    els.push(text(58, sy + 42, sp.icon, 20, TEXT, { font: 'system-ui, sans-serif', anchor: 'middle' }));

    // Text
    els.push(text(92, sy + 28, sp.name, 14, TEXT, { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(92, sy + 44, sp.desc, 11, MUTED, { font: 'system-ui, sans-serif' }));

    // Count badge
    els.push(rect(W - 50, sy + 21, 32, 20, sp.dot, { rx: 10, opacity: 0.12 }));
    els.push(text(W - 34, sy + 34, String(sp.count), 11, sp.dot, { fw: 700, font: 'system-ui, sans-serif', anchor: 'middle' }));

    // Chevron
    els.push(text(W - 26, sy + 44, '›', 18, MUTED, { font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  navBar(els, 3);
  return { name: 'Spaces', svg: buildSVG(els), elements: els };
}

// ── Screen 6 — Profile ───────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Profile hero — editorial warm card
  els.push(rect(20, 62, W - 40, 140, SURF, { rx: 18 }));
  // Editorial rule at top of card
  els.push(rect(20, 62, W - 40, 4, ACC, { rx: 2 }));

  // Avatar
  els.push(circle(70, 130, 34, ACC, { opacity: 0.12 }));
  els.push(circle(70, 130, 26, ACC, { opacity: 0.18 }));
  els.push(text(70, 138, 'YO', 15, ACC, { fw: 700, font: 'system-ui, sans-serif', anchor: 'middle' }));

  els.push(text(116, 118, 'You', 20, TEXT, { fw: 700, font: 'Georgia, serif', ls: -0.3 }));
  els.push(text(116, 136, 'Designer & writer', 13, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(text(116, 152, 'Joined March 2025', 11, MUTED, { font: 'system-ui, sans-serif', opacity: 0.7 }));

  // Writing stats strip
  els.push(rect(20, 170, W - 40, 30, ACCS, { rx: 0 }));
  const stats = [
    { l: '34 memos', v: 'sent' }, { l: '1,204', v: 'words avg' }, { l: '89%', v: 'read rate' }
  ];
  stats.forEach((s, i) => {
    const sx = 52 + i * 118;
    els.push(text(sx, 182, s.l + ' ' + s.v, 11, ACC, { fw: 600, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  // Settings sections
  const sections = [
    {
      title: 'WRITING PREFERENCES', items: [
        { icon: '✒', label: 'Default font', val: 'Georgia, serif' },
        { icon: '⏱', label: 'Reading time estimate', val: 'On' },
        { icon: '💬', label: 'Reactions on memos', val: 'Everyone' },
      ]
    },
    {
      title: 'NOTIFICATIONS', items: [
        { icon: '🔔', label: 'New memo in your Spaces', val: 'Instant' },
        { icon: '↩', label: 'Replies to your memos', val: 'Instant' },
        { icon: '📊', label: 'Weekly Signals digest', val: 'Fridays' },
      ]
    },
  ];

  let sy = 218;
  sections.forEach(sec => {
    els.push(text(20, sy, sec.title, 10, MUTED, { fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
    sy += 16;
    els.push(rect(20, sy, W - 40, sec.items.length * 50, SURF, { rx: 14 }));
    sec.items.forEach((item, j) => {
      const iy = sy + j * 50;
      if (j > 0) els.push(line(52, iy, W - 20, iy, LINE, { sw: 0.5, opacity: 0.5 }));
      els.push(text(38, iy + 30, item.icon, 16, TEXT, { font: 'system-ui, sans-serif' }));
      els.push(text(60, iy + 30, item.label, 14, TEXT, { font: 'system-ui, sans-serif', fw: 400 }));
      els.push(text(W - 28, iy + 30, item.val, 12, MUTED, { font: 'system-ui, sans-serif', anchor: 'end' }));
      els.push(text(W - 18, iy + 30, '›', 16, MUTED, { font: 'system-ui, sans-serif', anchor: 'end' }));
    });
    sy += sec.items.length * 50 + 16;
  });

  // Sign out
  els.push(text(W / 2, sy + 24, 'Sign out', 14, ACC, { fw: 500, font: 'system-ui, sans-serif', anchor: 'middle' }));

  navBar(els, 4);
  return { name: 'Profile', svg: buildSVG(els), elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  screenInbox(),
  screenReader(),
  screenWrite(),
  screenSignals(),
  screenSpaces(),
  screenProfile(),
];

const totalElements = screens.reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'Memo — Async Team Writing',
    author:    'RAM',
    date:      new Date().toISOString(),
    theme:     'light',
    heartbeat: 'memo',
    elements:  totalElements,
    palette: {
      bg:      BG,
      surface: SURF,
      card:    CARD,
      accent:  ACC,
      accent2: ACC2,
      muted:   MUTED,
      line:    LINE,
    },
    inspiration: 'lapa.ninja serif revival — Recoleta/Canela editorial typography in warm, magazine-feel contexts',
  },
  screens: screens.map(s => ({
    name:     s.name,
    svg:      s.svg,
    elements: s.elements.length,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`Memo: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
