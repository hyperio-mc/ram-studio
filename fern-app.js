'use strict';
/**
 * FERN — Daily rituals & gentle wellness
 *
 * Inspired by:
 * 1. Dawn (lapa.ninja) — "The future of mental health is proactive"
 *    Rich warm amber/ochre background, circular arc motifs, editorial layout
 *    with large display type and contemplative spacing
 * 2. Ray (land-book) — Warm earthy interior wood-tone photography,
 *    organic neutral palette, lots of breathing room
 * 3. ISA DE BURGH (lapa.ninja/minimal.gallery) — Bold editorial serif headings
 *    mixed with delicate thin sans — a typographic contrast I haven't used before
 *
 * Theme: LIGHT — warm parchment (#F6EFE3), amber accent, editorial serif type
 * Challenge: daily ritual tracker with organic arc progress, large serif display
 *            type mixed with thin sans — new typographic territory for RAM
 */

const fs = require('fs');

// ─── PALETTE ────────────────────────────────────────────────────────────────
const T = {
  bg:       '#F6EFE3',   // warm parchment
  surface:  '#FFFDF8',   // clean warm white
  surface2: '#EDE4D3',   // tan card
  surface3: '#F9F4EC',   // mid warm
  amber:    '#C4793A',   // warm amber
  amberDim: 'rgba(196,121,58,0.12)',
  amberGlow:'rgba(196,121,58,0.22)',
  sage:     '#5A7B5E',   // forest sage
  sageDim:  'rgba(90,123,94,0.12)',
  rose:     '#B85C4A',   // terracotta rose
  roseDim:  'rgba(184,92,74,0.11)',
  gold:     '#D4A056',   // warm gold
  text:     '#1E130A',   // deep warm ink
  textMid:  '#8A7060',   // warm muted
  textMute: 'rgba(30,19,10,0.32)',
  border:   'rgba(30,19,10,0.09)',
  border2:  'rgba(30,19,10,0.14)',
  cream:    '#E8D9C0',   // warm line
};

const W = 375, H = 812, GAP = 80;
let _id = 0;
const uid = () => `fn${++_id}`;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.shadow ? { shadow: { x: 0, y: 3, blur: 18, color: 'rgba(30,19,10,0.10)' } } : {}),
    ...(opts.border ? { border: { color: opts.border, width: opts.bw ?? 1 } } : {}),
  };
}

function text(x, y, w, content, opts = {}) {
  const isSerif = opts.serif;
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize:    opts.size ?? 13,
    fontFamily:  isSerif
      ? '"Georgia","Garamond","Times New Roman",serif'
      : '"Inter","Helvetica Neue",sans-serif',
    fontWeight:  opts.bold ? '700' : opts.semi ? '600' : opts.medium ? '500' : opts.light ? '300' : '400',
    color:       opts.color ?? T.text,
    textAlign:   opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight:  opts.lh ?? (opts.size >= 28 ? 1.1 : opts.size >= 18 ? 1.25 : 1.5),
    letterSpacing: opts.ls ?? (opts.caps ? 1.5 : opts.size >= 28 ? -0.5 : 0),
    opacity:     opts.opacity ?? 1,
    ...(opts.caps ? { textTransform: 'uppercase' } : {}),
    ...(opts.italic ? { fontStyle: 'italic' } : {}),
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    id: uid(), type: 'frame',
    x, y, width: w, height: h,
    fill: opts.fill ?? 'transparent',
    cornerRadius: opts.r ?? 0,
    children: children.filter(Boolean),
    ...(opts.border ? { border: { color: opts.border, width: 1 } } : {}),
    ...(opts.shadow ? { shadow: { x: 0, y: 4, blur: 24, color: 'rgba(30,19,10,0.12)' } } : {}),
  };
}

function ellipse(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: opts.opacity ?? 1 };
}

function circle(cx, cy, r, fill, opts = {}) {
  return ellipse(cx - r, cy - r, r * 2, r * 2, fill, opts);
}

function line(x1, y1, x2, y2, color, opts = {}) {
  const w = Math.abs(x2 - x1) || 1;
  const h = Math.abs(y2 - y1) || 1;
  return {
    id: uid(), type: 'rectangle',
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    width: w, height: opts.thick ?? (w === 1 ? 1 : h),
    fill: color,
    opacity: opts.opacity ?? 1,
  };
}

function hline(x, y, w, color, opts = {}) {
  return rect(x, y, w, opts.h ?? 1, color, { opacity: opts.opacity ?? 0.4 });
}

function card(x, y, w, h, children, opts = {}) {
  return frame(x, y, w, h, [
    rect(0, 0, w, h, opts.fill ?? T.surface, { r: opts.r ?? 16, border: opts.border ?? T.border, shadow: true }),
    ...children,
  ], { r: opts.r ?? 16 });
}

// Organic arc (ring segment for progress)
function arcRing(cx, cy, outerR, innerR, fill, opts = {}) {
  // Approximated with nested circles + clip
  return [
    circle(cx, cy, outerR, fill, { opacity: opts.opacity ?? 0.15 }),
    circle(cx, cy, innerR, T.bg, { opacity: 1 }),
  ];
}

// ─── NAV BAR ────────────────────────────────────────────────────────────────
function navBar(yOff, active) {
  const items = [
    { label: 'Home',     icon: '⌂' },
    { label: 'Rituals',  icon: '◎' },
    { label: 'Journal',  icon: '✦' },
    { label: 'Insights', icon: '◑' },
    { label: 'Discover', icon: '❋' },
  ];
  const tw = W / items.length;
  const ch = [
    rect(0, 0, W, 64, T.surface, { shadow: true }),
    hline(0, 0, W, T.border, { h: 1, opacity: 0.8 }),
  ];
  items.forEach((item, i) => {
    const isActive = i === active;
    const cx = tw * i + tw / 2;
    ch.push(text(cx - tw / 2 + 4, 10, tw - 8, item.icon, {
      size: 18, center: true,
      color: isActive ? T.amber : T.textMid,
    }));
    ch.push(text(cx - tw / 2 + 2, 34, tw - 4, item.label, {
      size: 9.5, center: true, caps: true,
      color: isActive ? T.amber : T.textMute,
    }));
    if (isActive) {
      ch.push(rect(cx - 14, 56, 28, 3, T.amber, { r: 1.5 }));
    }
  });
  return frame(0, yOff, W, 64, ch, { fill: 'transparent' });
}

// ─── STATUS BAR ─────────────────────────────────────────────────────────────
function statusBar(yOff) {
  return frame(0, yOff, W, 44, [
    text(20, 14, 60, '9:41', { size: 14, semi: true, color: T.text }),
    text(W - 80, 14, 70, '●●● ▲ 🔋', { size: 11, color: T.textMid, right: true }),
  ]);
}

// ─── SCREEN 1: HOME (Morning) ────────────────────────────────────────────────
function screenHome(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(statusBar(yOff));

  // Top decorative arc — large organic circle motif (inspired by Dawn's circular graphic)
  e.push(...arcRing(W + 40, yOff + 120, 220, 160, T.amber, { opacity: 0.18 }));
  e.push(circle(W + 40, yOff + 120, 220, T.amber, { opacity: 0.06 }));
  // Small accent circles
  e.push(circle(32, yOff + 200, 8, T.sage, { opacity: 0.4 }));
  e.push(circle(50, yOff + 218, 5, T.amber, { opacity: 0.35 }));

  // Header greeting (editorial serif — large)
  e.push(text(22, yOff + 62, W - 44, 'Good\nMorning,', {
    size: 42, serif: true, lh: 1.05, color: T.text, bold: true,
  }));
  e.push(text(22, yOff + 165, 220, 'Mara.', {
    size: 42, serif: true, italic: true, lh: 1.0, color: T.amber,
  }));

  // Date
  e.push(text(22, yOff + 220, 200, 'Friday, March 27', {
    size: 12, caps: true, color: T.textMid, ls: 1.2,
  }));
  e.push(hline(22, yOff + 240, 200, T.cream));

  // Today's Intention card
  e.push(card(16, yOff + 258, W - 32, 108, [
    text(16, 14, 80, 'Today\'s intention', { size: 10, caps: true, color: T.textMid, ls: 1.2 }),
    text(16, 34, W - 64, '"I move through my day\nwith ease and presence."', {
      size: 16, serif: true, italic: true, lh: 1.4, color: T.text,
    }),
    rect(W - 32 - 44, 14, 28, 28, T.amberDim, { r: 8 }),
    text(W - 32 - 40, 20, 20, '✦', { size: 15, color: T.amber, center: true }),
  ], { fill: T.surface3, r: 16 }));

  // Ritual progress strip
  e.push(text(22, yOff + 382, 160, 'Morning rituals', { size: 12, semi: true, color: T.text }));
  e.push(text(W - 82, yOff + 382, 64, '4 of 6', { size: 12, color: T.textMid, right: true }));

  // Ritual mini-cards row
  const rituals = [
    { icon: '☀', label: 'Wake', done: true },
    { icon: '💧', label: 'Water', done: true },
    { icon: '🧘', label: 'Meditate', done: true },
    { icon: '✍', label: 'Journal', done: true },
    { icon: '🌿', label: 'Stretch', done: false },
    { icon: '🥣', label: 'Eat', done: false },
  ];
  const rw = 52, gap = 8, rx0 = 20;
  rituals.forEach((r, i) => {
    const x = rx0 + i * (rw + gap);
    if (x + rw > W - 4) return; // skip if overflow
    e.push(card(x, yOff + 404, rw, 64, [
      text(0, 10, rw, r.icon, { size: 22, center: true }),
      text(4, 40, rw - 8, r.label, { size: 9, center: true, color: r.done ? T.amber : T.textMid }),
      ...(r.done ? [rect(rw - 16, 6, 10, 10, T.amberDim, { r: 5 }),
                    text(rw - 15, 6, 10, '✓', { size: 8, center: true, color: T.amber })] : []),
    ], { fill: r.done ? T.amberDim : T.surface, r: 12 }));
  });

  // Mood check
  e.push(card(16, yOff + 488, W - 32, 72, [
    text(16, 14, 160, 'How are you feeling?', { size: 13, semi: true, color: T.text }),
    text(16, 36, 180, 'Tap to log your mood', { size: 11, color: T.textMid }),
    // mood dots
    ...[['😌', T.sage], ['😊', T.amber], ['😐', T.textMid], ['😔', T.rose]].map(([em, c], i) => (
      rect(W - 32 - 28 - i * 32, 18, 28, 28, `${c}22`, { r: 14 })
    )),
    ...[['😌', T.sage], ['😊', T.amber], ['😐', T.textMid], ['😔', T.rose]].map(([em, c], i) => (
      text(W - 32 - 28 - i * 32, 24, 28, em, { size: 16, center: true })
    )),
  ], { fill: T.surface3, r: 16 }));

  // Daily quote
  e.push(text(22, yOff + 578, W - 44, '"The present moment\nis always enough."', {
    size: 18, serif: true, italic: true, lh: 1.3, color: T.textMid, opacity: 0.7,
  }));
  e.push(text(22, yOff + 638, 120, '— Thich Nhat Hanh', { size: 10, color: T.textMute, caps: true, ls: 0.8 }));

  e.push(navBar(yOff + H - 64, 0));
  return e;
}

// ─── SCREEN 2: RITUALS ──────────────────────────────────────────────────────
function screenRituals(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(statusBar(yOff));

  // Top arc decoration
  e.push(circle(-40, yOff + 80, 140, T.sage, { opacity: 0.08 }));

  e.push(text(22, yOff + 60, W - 44, 'Morning\nRituals', {
    size: 38, serif: true, lh: 1.1, color: T.text, bold: true,
  }));
  e.push(text(22, yOff + 148, 200, '4 of 6 complete · 12 day streak ⊛', {
    size: 12, color: T.textMid,
  }));

  // Streak bar
  const days = ['M','T','W','T','F','S','S'];
  const filled = [true, true, true, true, true, false, false];
  e.push(card(16, yOff + 172, W - 32, 56, [
    text(14, 10, 100, '12-day streak', { size: 10, caps: true, color: T.textMid, ls: 1 }),
    ...days.map((d, i) => rect(14 + i * (Math.floor((W - 32 - 28) / 7)), 26, Math.floor((W - 32 - 44) / 7), 14,
      filled[i] ? T.amber : T.cream, { r: 3 })),
    ...days.map((d, i) => text(14 + i * (Math.floor((W - 32 - 28) / 7)), 26, Math.floor((W - 32 - 44) / 7), d, {
      size: 8, center: true, color: filled[i] ? T.surface : T.textMute,
    })),
  ], { fill: T.surface3, r: 14 }));

  // Ritual list
  const ritualsList = [
    { icon: '☀', name: 'Wake at 6:30 am', time: '6:30 AM', done: true, color: T.amber },
    { icon: '💧', name: 'Drink 500ml water', time: '6:32 AM', done: true, color: T.sage },
    { icon: '🧘', name: 'Meditate 10 min', time: '6:45 AM', done: true, color: T.sage },
    { icon: '✍', name: 'Morning pages', time: '7:00 AM', done: true, color: T.amber },
    { icon: '🌿', name: 'Stretch & breathe', time: '7:30 AM', done: false, color: T.rose },
    { icon: '🥣', name: 'Mindful breakfast', time: '7:45 AM', done: false, color: T.gold },
  ];

  ritualsList.forEach((r, i) => {
    const y = yOff + 244 + i * 74;
    e.push(card(16, y, W - 32, 62, [
      rect(0, 0, W - 32, 62, r.done ? T.amberDim : 'transparent', { r: 14, opacity: 0.4 }),
      rect(14, 14, 34, 34, `${r.color}22`, { r: 10 }),
      text(14, 20, 34, r.icon, { size: 19, center: true }),
      text(58, 13, W - 120, r.name, { size: 14, semi: true, color: r.done ? T.text : T.textMid }),
      text(58, 34, 160, r.time, { size: 11, color: T.textMute }),
      // Checkbox
      rect(W - 64, 17, 28, 28, r.done ? T.amber : 'transparent', { r: 14, border: r.done ? T.amber : T.border2, bw: 2 }),
      text(W - 64, 17, 28, r.done ? '✓' : '', { size: 14, center: true, color: T.surface, bold: true }),
    ], { fill: T.surface, r: 14 }));
  });

  e.push(navBar(yOff + H - 64, 1));
  return e;
}

// ─── SCREEN 3: JOURNAL ──────────────────────────────────────────────────────
function screenJournal(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.surface));
  e.push(statusBar(yOff));

  // Thin top bar
  e.push(rect(0, yOff + 44, W, 48, T.surface));
  e.push(text(22, yOff + 56, 160, '← Back', { size: 13, color: T.textMid }));
  e.push(text(W - 80, yOff + 56, 64, 'Save', { size: 13, semi: true, color: T.amber, right: true }));

  // Date header with decorative serif
  e.push(hline(22, yOff + 98, W - 44, T.cream));
  e.push(text(22, yOff + 110, 200, 'March 27, 2026', {
    size: 11, caps: true, color: T.textMid, ls: 1.2,
  }));
  e.push(text(22, yOff + 132, W - 44, 'Morning Pages', {
    size: 32, serif: true, color: T.text, bold: true,
  }));

  // Writing area with decorative ruled lines
  const lineY = [188, 210, 232, 254, 276, 298, 320, 342, 364, 386, 408, 430, 452, 474, 496, 518, 540, 562];
  lineY.forEach(ly => e.push(hline(22, yOff + ly, W - 44, T.cream, { opacity: 0.6 })));

  // Journaled text (realistic lorem-ish)
  e.push(text(22, yOff + 194, W - 48,
    'Today I woke before my alarm — unusual. The light\ncoming through the curtain had that early-spring\nquality, soft and almost green.',
    { size: 14, lh: 1.65, color: T.text, opacity: 0.88 }));

  e.push(text(22, yOff + 286, W - 48,
    'I made tea without reaching for my phone first.\nThat felt important. Something to hold onto.',
    { size: 14, lh: 1.65, color: T.text, opacity: 0.88 }));

  e.push(text(22, yOff + 352, W - 48,
    'What do I want from today? Not achievement —\njust presence. To notice the small things that\nusually scroll past me.',
    { size: 14, lh: 1.65, color: T.text, opacity: 0.88 }));

  // Blinking cursor
  e.push(rect(22, yOff + 444, 2, 18, T.amber, { opacity: 0.8 }));

  // Bottom toolbar
  e.push(hline(0, yOff + H - 108, W, T.cream));
  e.push(rect(0, yOff + H - 108, W, 46, T.surface));
  ['✦', '❝', '◎', '—', '…'].forEach((sym, i) => {
    e.push(rect(16 + i * 52, yOff + H - 99, 38, 28, T.amberDim, { r: 8 }));
    e.push(text(16 + i * 52, yOff + H - 97, 38, sym, { size: 14, center: true, color: T.amber }));
  });
  e.push(text(W - 60, yOff + H - 97, 50, '247 words', { size: 10, color: T.textMute, right: true }));

  e.push(navBar(yOff + H - 64, 2));
  return e;
}

// ─── SCREEN 4: INSIGHTS ─────────────────────────────────────────────────────
function screenInsights(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(statusBar(yOff));

  e.push(text(22, yOff + 60, W - 44, 'Your\nWeek', {
    size: 38, serif: true, lh: 1.1, color: T.text, bold: true,
  }));
  e.push(text(22, yOff + 146, 260, 'March 21 – 27  ·  strongest week yet', {
    size: 12, color: T.amber,
  }));

  // Big organic arc / radial progress — inspired by Dawn's circular motif
  const cx = W / 2, cy = yOff + 290;
  // Outer ring background
  e.push(ellipse(cx - 100, cy - 100, 200, 200, T.cream, { opacity: 0.6 }));
  // Filled arc (approx with overlapping ellipses + mask)
  e.push(ellipse(cx - 88, cy - 88, 176, 176, T.bg));
  // Progress arc (approximated as a wedge-like overlay)
  e.push(ellipse(cx - 100, cy - 100, 200, 200, T.amber, { opacity: 0.22 }));
  e.push(ellipse(cx - 88, cy - 88, 176, 176, T.bg));
  // Inner clean circle
  e.push(ellipse(cx - 72, cy - 72, 144, 144, T.surface, { opacity: 1 }));
  // Center text
  e.push(text(cx - 50, cy - 30, 100, '83%', { size: 32, bold: true, center: true, serif: true, color: T.text }));
  e.push(text(cx - 60, cy + 8, 120, 'consistency', { size: 12, center: true, color: T.textMid, caps: true, ls: 1 }));

  // Organic small satellites
  [
    { angle: -60, label: 'Rituals', val: '24/28', color: T.amber },
    { angle: 60,  label: 'Journal', val: '6 days', color: T.sage },
    { angle: 175, label: 'Mood avg', val: '8.2/10', color: T.rose },
  ].forEach(({ angle, label, val, color }) => {
    const rad = (angle * Math.PI) / 180;
    const ox = cx + 118 * Math.cos(rad);
    const oy = cy + 118 * Math.sin(rad);
    e.push(ellipse(ox - 28, oy - 28, 56, 56, `${color}22`));
    e.push(text(ox - 28, oy - 12, 56, val, { size: 10, bold: true, center: true, color }));
    e.push(text(ox - 28, oy + 4, 56, label, { size: 8, center: true, color: T.textMute, caps: true }));
  });

  // Weekly stats row
  e.push(text(22, yOff + 410, W - 44, 'This week', { size: 13, semi: true, color: T.text }));
  const stats = [
    { label: 'Streak',   val: '12',    unit: 'days',    color: T.amber },
    { label: 'Journal',  val: '6',     unit: 'entries', color: T.sage },
    { label: 'Moods',    val: '14',    unit: 'logged',  color: T.rose },
    { label: 'Rituals',  val: '24',    unit: 'done',    color: T.gold },
  ];
  const sw = (W - 32) / 4 - 4;
  stats.forEach((s, i) => {
    e.push(card(16 + i * (sw + 5.3), yOff + 434, sw, 70, [
      text(8, 10, sw - 16, s.val, { size: 22, bold: true, center: true, color: s.color }),
      text(4, 40, sw - 8, s.unit, { size: 9, center: true, color: T.textMute, caps: true }),
      text(4, 53, sw - 8, s.label, { size: 9, center: true, color: T.textMid }),
    ], { fill: T.surface3, r: 12 }));
  });

  // Mood graph — simple bar chart with warm bars
  e.push(text(22, yOff + 522, W - 44, 'Mood this week', { size: 13, semi: true, color: T.text }));
  const moodData = [7, 8, 6, 9, 8, 9, 8];
  const bw = 28, bGap = 10, bX0 = 24, maxH = 70;
  const daysShort = ['M','T','W','T','F','S','S'];
  moodData.forEach((v, i) => {
    const bh = (v / 10) * maxH;
    const bx = bX0 + i * (bw + bGap);
    const by = yOff + 610 - bh;
    e.push(rect(bx, by, bw, bh, i === 5 ? T.amber : T.amberDim, { r: 6 }));
    e.push(text(bx, yOff + 614, bw, daysShort[i], { size: 9, center: true, color: T.textMute }));
  });

  e.push(navBar(yOff + H - 64, 3));
  return e;
}

// ─── SCREEN 5: DISCOVER ─────────────────────────────────────────────────────
function screenDiscover(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(statusBar(yOff));

  // Large decorative circle (top right)
  e.push(circle(W + 30, yOff + 100, 160, T.sage, { opacity: 0.09 }));
  e.push(circle(W - 20, yOff + 140, 60, T.amber, { opacity: 0.13 }));

  e.push(text(22, yOff + 60, W - 44, 'Discover', {
    size: 38, serif: true, lh: 1.1, color: T.text, bold: true,
  }));
  e.push(text(22, yOff + 112, W - 44, 'What others are cultivating today', {
    size: 13, color: T.textMid,
  }));

  // Search bar
  e.push(card(16, yOff + 138, W - 32, 44, [
    text(14, 12, 20, '⌕', { size: 16, color: T.textMid }),
    text(40, 13, 200, 'Search intentions, rituals…', { size: 13, color: T.textMute }),
  ], { fill: T.surface3, r: 22 }));

  // Category pills
  const cats = ['All', 'Focus', 'Rest', 'Gratitude', 'Movement', 'Creativity'];
  let px = 16;
  cats.forEach((c, i) => {
    const pw = c.length * 8 + 24;
    e.push(rect(px, yOff + 196, pw, 30, i === 0 ? T.amber : T.surface3, { r: 15 }));
    e.push(text(px + 4, yOff + 202, pw - 8, c, {
      size: 12, center: true, color: i === 0 ? T.surface : T.textMid, semi: i === 0,
    }));
    px += pw + 8;
  });

  // Community intention cards
  const posts = [
    {
      user: 'Nadia B.',   avatar: 'NB', color: T.sage,
      intention: '"To listen before I speak, to breathe before I react."',
      rituals: ['Meditation', 'Walking'],
      likes: 47, time: '2h ago',
    },
    {
      user: 'Tomás L.',   avatar: 'TL', color: T.amber,
      intention: '"Today I create space for deep work and slow thinking."',
      rituals: ['Morning pages', 'No screens til 9am'],
      likes: 31, time: '3h ago',
    },
    {
      user: 'Priya K.',   avatar: 'PK', color: T.rose,
      intention: '"I am grateful for what I already have."',
      rituals: ['Gratitude journal', 'Stretch'],
      likes: 58, time: '4h ago',
    },
  ];

  posts.forEach((p, i) => {
    const py = yOff + 240 + i * 148;
    e.push(card(16, py, W - 32, 134, [
      // Avatar
      ellipse(14, 14, 36, 36, `${p.color}33`),
      text(14, 20, 36, p.avatar, { size: 12, bold: true, center: true, color: p.color }),
      // Name + time
      text(58, 14, 180, p.user, { size: 13, semi: true, color: T.text }),
      text(58, 32, 180, p.time, { size: 10, color: T.textMute }),
      // Intention text
      text(14, 60, W - 60, p.intention, {
        size: 13, serif: true, italic: true, lh: 1.4, color: T.text,
      }),
      // Ritual tags
      ...p.rituals.map((r, ri) => {
        const tw2 = r.length * 7 + 16;
        return rect(14 + ri * (tw2 + 6), 102, tw2, 20, T.amberDim, { r: 10 });
      }),
      ...p.rituals.map((r, ri) => {
        const tw2 = r.length * 7 + 16;
        return text(14 + ri * (tw2 + 6), 104, tw2, r, { size: 9.5, center: true, color: T.amber });
      }),
      // Like
      text(W - 32 - 44, 102, 40, `♡ ${p.likes}`, { size: 11, color: T.textMid, right: true }),
    ], { fill: T.surface, r: 16 }));
  });

  e.push(navBar(yOff + H - 64, 4));
  return e;
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const screens = [
  ...screenHome(0),
  ...screenRituals(H + GAP),
  ...screenJournal((H + GAP) * 2),
  ...screenInsights((H + GAP) * 3),
  ...screenDiscover((H + GAP) * 4),
];

const pen = {
  version: '2.8',
  title: 'Fern — Daily Rituals & Gentle Wellness',
  width: W,
  height: (H + GAP) * 5,
  background: T.bg,
  elements: screens,
};

fs.writeFileSync('fern.pen', JSON.stringify(pen, null, 2));
console.log(`✓ fern.pen written — ${screens.length} elements across 5 screens`);
