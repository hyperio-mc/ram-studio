'use strict';
/**
 * GHOST — Intelligence briefing for builders
 *
 * Inspired by:
 * 1. Muradov portfolio (darkmodedesign.com) — "VISUAL DESIGNER" in massive
 *    all-caps condensed sans on pure black — typographic maximalism at new scale
 * 2. darkmodedesign.com's card system — pure black + rgba(255,255,255,0.11)
 *    ultra-subtle borders. Cards float on the void, no shadows, no fills.
 * 3. godly.website / land-book.com single-accent discipline — one saturated
 *    teal color marks exactly one primary action per screen. Nothing else.
 *
 * Theme: DARK — pure black (#000000), 4-tier white opacity, single teal accent
 * Challenge: typographic maximalism — 84px display type dominates each screen,
 *            secondary content uses layered opacity not distinct colors,
 *            the void of pure black is treated as an active design element.
 */

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const T = {
  bg:          '#000000',
  surface:     '#0D0D0D',
  surface2:    '#161616',
  border:      'rgba(255,255,255,0.11)',
  border2:     'rgba(255,255,255,0.20)',
  text:        'rgba(255,255,255,1.0)',
  text2:       'rgba(255,255,255,0.70)',
  text3:       'rgba(255,255,255,0.50)',
  text4:       'rgba(255,255,255,0.28)',
  teal:        '#007C6E',
  tealBright:  '#00B49C',
  red:         '#E84040',
  amber:       '#D48E3A',
};

const W = 375, H = 812, GAP = 80;
let _id = 0;
const uid = () => `gh${++_id}`;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.border ? { border: { color: opts.border, width: opts.bw ?? 1 } } : {}),
    ...(opts.shadow ? { shadow: { x: 0, y: 2, blur: 24, color: 'rgba(0,0,0,0.9)' } } : {}),
  };
}

function text(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize:      opts.size ?? 13,
    fontFamily:    '"Inter","Helvetica Neue",Arial,sans-serif',
    fontWeight:    opts.bold ? '700' : opts.semi ? '600' : opts.medium ? '500' : opts.light ? '300' : '400',
    color:         opts.color ?? T.text,
    textAlign:     opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight:    opts.lh ?? (opts.size >= 60 ? 0.88 : opts.size >= 30 ? 1.05 : opts.size >= 18 ? 1.3 : 1.55),
    letterSpacing: opts.ls ?? (opts.caps ? (opts.size >= 40 ? -2 : 1.2) : opts.size >= 40 ? -3 : opts.size >= 20 ? -0.6 : -0.15),
    opacity:       opts.opacity ?? 1,
    ...(opts.caps ? { textTransform: 'uppercase' } : {}),
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
  };
}

function ellipse(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: opts.opacity ?? 1 };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    id: uid(), type: 'line',
    x: x1, y: y1, width: Math.max(1, x2 - x1), height: 1,
    stroke: color, strokeWidth: opts.w ?? 1, opacity: opts.opacity ?? 1,
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function statusBar(yOff) {
  return [
    text(20, yOff + 14, 80,    '9:41',     { size: 15, medium: true, color: T.text }),
    text(W-80, yOff + 14, 76,  '●●● ▲ ■', { size: 10, color: T.text3, right: true }),
  ];
}

function navBar(yOff, active) {
  const tabs = [
    { id: 'TODAY',   icon: '⚡' },
    { id: 'TOPICS',  icon: '◈'  },
    { id: 'DIGEST',  icon: '▤'  },
    { id: 'PROFILE', icon: '○'  },
  ];
  const tw = W / tabs.length;
  const els = [
    rect(0, yOff, W, H - yOff, T.bg),
    line(0, yOff, W, yOff, T.border),
  ];
  tabs.forEach((tab, i) => {
    const cx = i * tw + tw / 2;
    const on = tab.id === active;
    if (on) els.push(rect(cx - 14, yOff + 1, 28, 2, T.teal, { r: 1 }));
    els.push(
      text(cx - 20, yOff + 8,  40, tab.icon, { size: 17, center: true, color: on ? T.teal : T.text4 }),
      text(cx - 24, yOff + 30, 48, tab.id,   { size: 7.5, center: true, caps: true, ls: 0.8,
        color: on ? T.teal : T.text4, medium: on }),
    );
  });
  return els;
}

function signalCard(x, y, w, category, headline, source, time, opts = {}) {
  const h    = opts.h ?? 108;
  const catC = category === 'AI'      ? T.tealBright
             : category === 'MARKETS' ? T.amber
             : category === 'POLICY'  ? T.red
             : T.text3;
  return frame(x, y, w, h, [
    rect(0, 0, w, h, T.surface, { r: 8, border: T.border }),
    text(14, 13, 80, category,  { size: 8.5, color: catC, caps: true, medium: true, ls: 1.8 }),
    opts.delta ? text(w-54, 11, 40, opts.delta, {
      size: 11, bold: true, color: opts.pos ? T.tealBright : T.red, right: true,
    }) : null,
    text(14, 32, w-28, headline, { size: 13.5, color: T.text, medium: true, ls: -0.3, lh: 1.3 }),
    line(14, h-26, w-14, h-26, T.border),
    text(14, h-17, 160, source, { size: 9.5, color: T.text3, ls: 0 }),
    text(w-58, h-17, 44, time,   { size: 9.5, color: T.text4, right: true }),
  ]);
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function screenToday(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(...statusBar(yOff));

  // ── TYPOGRAPHIC MAXIMALISM: giant date dominates the top third ──
  e.push(text(18, yOff + 46, W - 36, 'MAR', {
    size: 88, bold: true, caps: true, color: T.text, ls: -6, lh: 0.85,
  }));
  e.push(text(18, yOff + 122, W - 36, '27', {
    size: 88, bold: true, caps: true, color: T.teal, ls: -6, lh: 0.85,
  }));

  // Signal count badge + thin rule
  e.push(text(20, yOff + 218, 200, '14 SIGNALS TODAY', {
    size: 9.5, color: T.text3, caps: true, ls: 2.2, medium: true,
  }));
  e.push(text(W - 90, yOff + 218, 70, 'LIVE ●', {
    size: 9.5, color: T.tealBright, caps: true, ls: 1.5, right: true,
  }));
  e.push(line(20, yOff + 238, W - 20, yOff + 238, T.border));

  const cards = [
    { cat: 'AI',      head: 'Anthropic ships Claude 4 — 2M token context window, available now', src: 'TechCrunch', t: '2m',  delta: '+12%', pos: true },
    { cat: 'MARKETS', head: 'Stripe revised to $95B ahead of anticipated Q3 IPO window',           src: 'Bloomberg',  t: '18m', delta: '+4%',  pos: true },
    { cat: 'BUILD',   head: 'Vercel v0 gains full-stack generation with automated DB migrations', src: 'Vercel Blog', t: '1h',  delta: null },
    { cat: 'POLICY',  head: 'EU AI Act enforcement begins — 11 companies fined in first wave',    src: 'Reuters',    t: '3h',  delta: null },
  ];
  let cy = yOff + 250;
  cards.forEach((c, i) => {
    const h = i === 0 ? 118 : 106;
    e.push(signalCard(20, cy, W - 40, c.cat, c.head, c.src, c.t, { h, delta: c.delta, pos: c.pos }));
    cy += h + 10;
  });

  e.push(...navBar(yOff + 730, 'TODAY'));
  return e;
}

// ─── SCREEN 2: SIGNAL DETAIL ─────────────────────────────────────────────────
function screenDetail(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(...statusBar(yOff));

  // Nav row
  e.push(text(18, yOff + 46, 32, '←', { size: 20, color: T.text2 }));
  e.push(text(W - 42, yOff + 46, 26, '↗', { size: 17, color: T.text3 }));

  // Category pill + meta
  e.push(text(20, yOff + 80, 40, 'AI', { size: 8.5, color: T.tealBright, caps: true, medium: true, ls: 2 }));
  e.push(text(56, yOff + 80, 90, '3 MIN READ', { size: 8.5, color: T.text4, caps: true, ls: 1.5 }));
  e.push(text(W - 62, yOff + 80, 42, '2m ago', { size: 8.5, color: T.text4, right: true }));

  // ── MASSIVE DISPLAY HEADLINE — new typographic scale ──
  e.push(text(18, yOff + 104, W - 36, 'CLAUDE\n4 SHIPS', {
    size: 70, bold: true, caps: true, color: T.text, ls: -4, lh: 0.88,
  }));

  // Deck
  e.push(text(20, yOff + 264, W - 40,
    '2M-token context window — every document\nyou\'ve ever written, in one conversation.',
    { size: 14, color: T.text2, ls: -0.3, lh: 1.45 }
  ));

  // Divider
  e.push(line(20, yOff + 322, W - 20, yOff + 322, T.border));

  // Author row
  e.push(ellipse(20, yOff + 338, 30, 30, T.surface2));
  e.push(text(20, yOff + 347, 30, 'TC', { size: 10, bold: true, color: T.text3, center: true }));
  e.push(text(60, yOff + 338, 180, 'TechCrunch', { size: 12, medium: true, color: T.text2 }));
  e.push(text(60, yOff + 354, 180, 'Devin Coldewey', { size: 10, color: T.text4 }));

  e.push(line(20, yOff + 378, W - 20, yOff + 378, T.border));

  // Body excerpt
  e.push(text(20, yOff + 394, W - 40,
    'Anthropic today announced Claude 4, featuring a 2-million token context window — enough to hold the entire corpus of a small library. The model\'s extended recall enables use cases previously impossible: full-codebase refactoring, multi-document legal analysis, and long-running autonomous agents that never lose context.',
    { size: 13, color: T.text3, ls: -0.2, lh: 1.65 }
  ));

  // Tags
  ['AI', 'Anthropic', 'LLM', 'Context', 'Agents'].reduce((tx, tag) => {
    const tw = tag.length * 7 + 18;
    e.push(rect(tx, yOff + 524, tw, 22, T.surface2, { r: 11, border: T.border }));
    e.push(text(tx + 9, yOff + 530, tw - 18, tag, { size: 9, color: T.text3, caps: true, ls: 0.8 }));
    return tx + tw + 8;
  }, 20);

  // CTA — THE single teal action
  e.push(rect(20, yOff + 564, W - 40, 46, T.teal, { r: 23 }));
  e.push(text(20, yOff + 578, W - 40, 'READ FULL SIGNAL  ↗', {
    size: 11, bold: true, color: '#000000', caps: true, ls: 1.8, center: true,
  }));

  // Related signals
  e.push(text(20, yOff + 628, 200, 'RELATED SIGNALS', { size: 8.5, color: T.text4, caps: true, ls: 2 }));
  e.push(line(20, yOff + 644, W - 20, yOff + 644, T.border));
  [
    'Claude 3.7 usage surges 340% in enterprise deployments',
    'Cursor IDE adds native Anthropic API toggle to settings',
  ].forEach((head, i) => {
    const ry = yOff + 654 + i * 40;
    e.push(text(20, ry, W - 80, head, { size: 12, color: T.text2, ls: -0.2, lh: 1.3 }));
    e.push(text(W - 58, ry, 38, i === 0 ? '1d ago' : '2d ago', { size: 9.5, color: T.text4, right: true }));
    e.push(line(20, ry + 32, W - 20, ry + 32, T.border));
  });

  return e;
}

// ─── SCREEN 3: TOPICS ────────────────────────────────────────────────────────
function screenTopics(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(...statusBar(yOff));

  // Header
  e.push(text(18, yOff + 46, 280, 'TOPICS', {
    size: 60, bold: true, caps: true, color: T.text, ls: -4, lh: 0.88,
  }));
  e.push(text(20, yOff + 116, 280, 'ranked by signal volume', { size: 10.5, color: T.text4, ls: -0.2 }));

  // Search bar
  e.push(rect(20, yOff + 144, W - 40, 38, T.surface, { r: 19, border: T.border }));
  e.push(text(44, yOff + 154, 20, '⌕', { size: 14, color: T.text4 }));
  e.push(text(68, yOff + 155, 200, 'Search topics…', { size: 12.5, color: T.text4 }));

  const topics = [
    { count: 342, topic: 'Artificial Intelligence', change: '+28%', pos: true  },
    { count: 218, topic: 'Startup Funding',         change: '+11%', pos: true  },
    { count: 187, topic: 'Infrastructure',          change: '+6%',  pos: true  },
    { count: 156, topic: 'Markets & Finance',       change: '-3%',  pos: false },
    { count: 134, topic: 'Developer Tools',         change: '+19%', pos: true  },
    { count:  98, topic: 'Design & Product',        change: '+42%', pos: true  },
  ];

  const tileW = (W - 52) / 2;
  const tileH = 116;
  topics.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const tx = 20 + col * (tileW + 12);
    const ty = yOff + 196 + row * (tileH + 10);
    const changeColor = t.pos ? T.tealBright : T.red;
    e.push(frame(tx, ty, tileW, tileH, [
      rect(0, 0, tileW, tileH, T.surface, { r: 8, border: T.border }),
      text(14, 14, tileW - 28, String(t.count), { size: 38, bold: true, color: T.text, ls: -2.5, lh: 0.88 }),
      text(14, 58, tileW - 28, 'signals', { size: 8, color: T.text4, caps: true, ls: 1.2 }),
      line(14, 78, tileW - 14, 78, T.border),
      text(14, 90, tileW - 52, t.topic, { size: 12, medium: true, color: T.text2, ls: -0.2 }),
      text(tileW - 44, 90, 30, t.change, { size: 10.5, bold: true, color: changeColor, right: true }),
    ]));
  });

  e.push(...navBar(yOff + 730, 'TOPICS'));
  return e;
}

// ─── SCREEN 4: DIGEST ────────────────────────────────────────────────────────
function screenDigest(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(...statusBar(yOff));

  // Massive week header
  e.push(text(18, yOff + 46, W - 36, 'WEEK', {
    size: 76, bold: true, caps: true, color: T.text4, ls: -5, lh: 0.85,
  }));
  e.push(text(18, yOff + 118, W - 36, '13', {
    size: 76, bold: true, caps: true, color: T.teal, ls: -5, lh: 0.85,
  }));
  e.push(text(22, yOff + 204, 320, 'Mar 24 – Mar 30  ·  847 signals curated', {
    size: 9.5, color: T.text4, ls: -0.2,
  }));
  e.push(line(20, yOff + 224, W - 20, yOff + 224, T.border));

  // Bar chart — signal volume by day
  e.push(text(20, yOff + 236, 220, 'DAILY SIGNAL VOLUME', { size: 8.5, color: T.text4, caps: true, ls: 1.8 }));

  const days = [
    { d: 'MON', pct: 0.54 }, { d: 'TUE', pct: 0.89 }, { d: 'WED', pct: 1.00 },
    { d: 'THU', pct: 0.75 }, { d: 'FRI', pct: 0.86 }, { d: 'SAT', pct: 0.38 }, { d: 'SUN', pct: 0.25 },
  ];
  const barW = Math.floor((W - 40 - 6 * 6) / 7);
  const maxBH = 68;
  const baseY = yOff + 328;
  days.forEach((day, i) => {
    const bx  = 20 + i * (barW + 6);
    const bh  = Math.round(day.pct * maxBH);
    const today = day.d === 'WED';
    e.push(rect(bx, baseY - maxBH, barW, maxBH, T.surface, { r: 3 }));
    e.push(rect(bx, baseY - bh, barW, bh, today ? T.teal : T.surface2, { r: 3 }));
    e.push(text(bx, baseY + 6, barW, day.d, { size: 7.5, center: true, caps: true, ls: 0.4, color: today ? T.teal : T.text4 }));
  });

  e.push(line(20, yOff + 354, W - 20, yOff + 354, T.border));
  e.push(text(20, yOff + 366, 240, 'TOP SIGNALS THIS WEEK', { size: 8.5, color: T.text4, caps: true, ls: 1.8 }));

  const top = [
    { rank: '01', head: 'GPT-5 launch sends AI stocks up 18% in pre-market trading',      cat: 'AI',      reads: '24.3K' },
    { rank: '02', head: 'EU AI Act: 11 companies fined in first enforcement wave',         cat: 'POLICY',  reads: '18.7K' },
    { rank: '03', head: 'YC W25 demo day — 6 breakout companies to follow closely',       cat: 'STARTUP', reads: '16.1K' },
    { rank: '04', head: 'Figma acquires Diagram — AI-native design tools consolidating',  cat: 'DESIGN',  reads: '12.9K' },
  ];
  top.forEach((s, i) => {
    const sy = yOff + 388 + i * 76;
    e.push(rect(20, sy, W - 40, 68, T.surface, { r: 8, border: T.border }));
    e.push(text(34, sy + 8, 30, s.rank, { size: 20, bold: true, color: T.text4, ls: -1.5 }));
    e.push(text(66, sy + 9, W - 106, s.head, { size: 12, color: T.text, ls: -0.3, lh: 1.3, medium: true }));
    e.push(text(66, sy + 49, 70, s.cat, { size: 8, color: T.tealBright, caps: true, ls: 1.3 }));
    e.push(text(W - 70, sy + 49, 30, s.reads, { size: 8, color: T.text4, right: true }));
  });

  e.push(...navBar(yOff + 730, 'DIGEST'));
  return e;
}

// ─── SCREEN 5: PROFILE ───────────────────────────────────────────────────────
function screenProfile(yOff) {
  const e = [];
  e.push(rect(0, yOff, W, H, T.bg));
  e.push(...statusBar(yOff));

  e.push(text(18, yOff + 46, 280, 'PROFILE', {
    size: 50, bold: true, caps: true, color: T.text, ls: -3.5,
  }));

  // Avatar + info
  e.push(ellipse(20, yOff + 112, 54, 54, T.surface2));
  e.push(text(20, yOff + 129, 54, 'JK', { size: 17, bold: true, color: T.text2, center: true }));
  e.push(text(86, yOff + 116, 200, 'Jonah Kessler', { size: 16, medium: true, color: T.text }));
  e.push(text(86, yOff + 136, 220, 'Product · @jonahk', { size: 10.5, color: T.text4 }));

  // Stats bar
  e.push(line(20, yOff + 180, W - 20, yOff + 180, T.border));
  [{ l: 'Signals read', v: '1.2K' }, { l: 'Topics', v: '9' }, { l: 'Streak', v: '31d' }, { l: 'Saved', v: '47' }].forEach((s, i) => {
    const sx = 20 + i * ((W - 40) / 4);
    const sw = (W - 40) / 4;
    e.push(text(sx, yOff + 194, sw, s.v, { size: 20, bold: true, color: T.text, center: true, ls: -1.2 }));
    e.push(text(sx, yOff + 219, sw, s.l, { size: 7.5, color: T.text4, center: true, caps: true, ls: 0.8 }));
  });
  e.push(line(20, yOff + 244, W - 20, yOff + 244, T.border));

  // Preferences
  e.push(text(20, yOff + 258, 200, 'PREFERENCES', { size: 8.5, color: T.text4, caps: true, ls: 1.8 }));
  [
    { title: 'Digest frequency', value: 'Daily' },
    { title: 'Signal depth',     value: 'Full'  },
    { title: 'Notifications',    value: 'On'    },
  ].forEach((item, i) => {
    const iy = yOff + 280 + i * 44;
    if (i > 0) e.push(line(20, iy, W - 20, iy, T.border));
    e.push(text(20, iy + 13, 200, item.title,  { size: 13, color: T.text2, ls: -0.2 }));
    e.push(text(W - 90, iy + 13, 70, item.value, { size: 12, color: T.tealBright, right: true }));
  });
  e.push(line(20, yOff + 412, W - 20, yOff + 412, T.border));

  // Subscriptions
  e.push(text(20, yOff + 428, 200, 'SUBSCRIBED TOPICS', { size: 8.5, color: T.text4, caps: true, ls: 1.8 }));
  [
    { title: 'Artificial Intelligence', value: '342 signals' },
    { title: 'Developer Tools',         value: '134 signals' },
    { title: 'Markets & Finance',       value: '156 signals' },
  ].forEach((item, i) => {
    const iy = yOff + 450 + i * 44;
    if (i > 0) e.push(line(20, iy, W - 20, iy, T.border));
    e.push(text(20, iy + 13, 200, item.title,  { size: 13, color: T.text2, ls: -0.2 }));
    e.push(text(W - 100, iy + 13, 80, item.value, { size: 12, color: T.text4, right: true }));
  });
  e.push(line(20, yOff + 582, W - 20, yOff + 582, T.border));

  // Sign out (ghost button — NOT teal — saving accent for "Subscribe" below)
  e.push(rect(20, yOff + 600, W - 40, 42, 'transparent', { r: 21, border: T.border2 }));
  e.push(text(20, yOff + 613, W - 40, 'SIGN OUT', { size: 10.5, bold: true, color: T.text3, caps: true, ls: 2, center: true }));

  // Subscribe CTA — THE teal action on this screen
  e.push(rect(20, yOff + 654, W - 40, 46, T.teal, { r: 23 }));
  e.push(text(20, yOff + 668, W - 40, 'UPGRADE TO PRO  ↗', {
    size: 11, bold: true, color: '#000000', caps: true, ls: 1.8, center: true,
  }));

  e.push(...navBar(yOff + 730, 'PROFILE'));
  return e;
}

// ─── BUILD & WRITE ────────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    { fn: screenToday,   label: "Today's Brief",  yOff: 0           },
    { fn: screenDetail,  label: 'Signal Detail',  yOff: H + GAP     },
    { fn: screenTopics,  label: 'Topics',         yOff: 2*(H+GAP)   },
    { fn: screenDigest,  label: 'Digest',         yOff: 3*(H+GAP)   },
    { fn: screenProfile, label: 'Profile',        yOff: 4*(H+GAP)   },
  ];
  return {
    version: '2.8',
    meta: {
      name: 'GHOST — Intelligence briefing for builders',
      description: 'Typographic-maximalist dark signal briefing app. Pure black void, 4-tier white opacity system from darkmodedesign.com, single teal accent per screen, 88px display headlines inspired by Muradov portfolio.',
      theme: 'dark',
      createdAt: new Date().toISOString(),
      author: 'RAM Design Heartbeat',
    },
    canvas: {
      width: W,
      height: screens.length * (H + GAP) - GAP,
      background: T.bg,
    },
    elements: screens.map(s => ({
      id: uid(), type: 'frame',
      x: 0, y: s.yOff, width: W, height: H,
      fill: T.bg,
      label: s.label,
      children: s.fn(s.yOff),
    })),
  };
}

const pen  = buildPen();
const out  = path.join(__dirname, 'ghost.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ ghost.pen written (${Math.round(fs.statSync(out).size/1024)}KB)`);
