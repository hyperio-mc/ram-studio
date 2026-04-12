'use strict';
// POLLEN — freelance creative brief & project tracker
// Theme: LIGHT — neubrutalist (inspired by siteinspire.com unusual layouts / neobrutalism trend)
// Heartbeat design — RAM
const fs   = require('fs');
const path = require('path');

const SLUG = 'pollen';
const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAF7EC',   // warm cream
  surf:    '#FFFFFF',   // white
  card:    '#F9EAA9',   // warm yellow card
  card2:   '#E4CCCC',   // blush pink card
  card3:   '#C8DFC8',   // sage green card
  accent:  '#E84B3A',   // tomato red
  accent2: '#6B4CFF',   // electric violet
  text:    '#1A1510',   // near-black
  muted:   '#6B6050',   // warm mid-tone
  border:  '#1A1510',   // stroke
  white:   '#FFFFFF',
  yellow:  '#F9EAA9',
  pink:    '#E4CCCC',
  sage:    '#C8DFC8',
  lavender:'#D4CCEE',
};

const SHADOW = (x=3, y=3) => ({ stroke: C.border, sw: 0 }); // handled via rect offset

let elements = [];
let totalElems = 0;

// ── Primitives ────────────────────────────────────────────────────────────────
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
    fw: opts.fw ?? '400',
    font: opts.font ?? 'Inter, sans-serif',
    anchor: opts.anchor ?? 'start',
    ls: opts.ls ?? '0',
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', sw: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, sw: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Neubrutalist card (offset shadow via extra rect) ──────────────────────────
function neoCard(x, y, w, h, fill, elems, opts = {}) {
  const r = opts.rx ?? 4;
  const sx = opts.sx ?? 4, sy = opts.sy ?? 4;
  elems.push(rect(x + sx, y + sy, w, h, C.border, { rx: r }));          // shadow
  elems.push(rect(x, y, w, h, fill, { rx: r, stroke: C.border, sw: 2 })); // card
  return 2;
}

// ── Neubrutalist button ───────────────────────────────────────────────────────
function neoBtn(x, y, w, h, label, fill, textFill, elems) {
  elems.push(rect(x + 3, y + 3, w, h, C.border, { rx: 4 }));
  elems.push(rect(x, y, w, h, fill, { rx: 4, stroke: C.border, sw: 2 }));
  elems.push(text(x + w / 2, y + h / 2 + 6, label, 14, textFill, { fw: '700', anchor: 'middle' }));
  return 3;
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function neoTag(x, y, label, fill, elems) {
  const w = label.length * 8 + 20;
  elems.push(rect(x + 2, y + 2, w, 26, C.border, { rx: 4 }));
  elems.push(rect(x, y, w, 26, fill, { rx: 4, stroke: C.border, sw: 1.5 }));
  elems.push(text(x + w / 2, y + 18, label, 12, C.text, { fw: '700', anchor: 'middle' }));
  return 3;
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function neoProgress(x, y, w, pct, fill, elems) {
  elems.push(rect(x + 2, y + 2, w, 14, C.border, { rx: 4 }));
  elems.push(rect(x, y, w, 14, C.surf, { rx: 4, stroke: C.border, sw: 1.5 }));
  if (pct > 0) elems.push(rect(x + 1, y + 1, Math.round((w - 2) * pct / 100), 12, fill, { rx: 3 }));
  return 3;
}

// ── Dot pattern decoration ────────────────────────────────────────────────────
function dotGrid(x, y, cols, rows, color, elems) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      elems.push(circle(x + c * 10, y + r * 10, 1.5, color, { opacity: 0.35 }));
    }
  }
  return cols * rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

// ── SCREEN 1: Welcome / Splash ────────────────────────────────────────────────
function buildWelcome() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));                                  // bg

  // dot grid top-right
  dotGrid(260, 40, 8, 8, C.border, el);

  // Big decorative P letter (outlined, neubrutalist)
  // Large outlined letterform background
  el.push(text(38, 280, 'P', 280, C.yellow, { fw: '900', font: 'Georgia, serif', opacity: 0.9 }));
  // Stroke version offset
  el.push(text(42, 284, 'P', 280, C.border, { fw: '900', font: 'Georgia, serif', opacity: 0.12 }));

  // Brand logo block (top-left)
  el.push(rect(2, 2, 160, 44, C.border, { rx: 0 }));    // shadow
  el.push(rect(0, 0, 160, 44, C.accent, { rx: 0, stroke: C.border, sw: 2 })); // bar
  el.push(text(16, 29, '● POLLEN', 18, C.white, { fw: '800', ls: '0.05em' }));

  // Tagline block
  el.push(rect(22, 330, 344, 3, C.border));              // rule
  el.push(text(22, 310, 'Brief it.', 52, C.text, { fw: '900', font: 'Georgia, serif', ls: '-0.02em' }));
  el.push(text(22, 362, 'Track it.', 52, C.text, { fw: '900', font: 'Georgia, serif', ls: '-0.02em' }));
  el.push(text(22, 414, 'Bill it.', 52, C.accent, { fw: '900', font: 'Georgia, serif', ls: '-0.02em' }));

  // Sub-copy
  el.push(text(22, 446, 'Freelance project management', 16, C.muted, { fw: '400' }));
  el.push(text(22, 466, 'built for creative professionals.', 16, C.muted, { fw: '400' }));

  // CTA button
  neoBtn(22, 510, 222, 52, 'Get Started →', C.accent, C.white, el);
  neoBtn(258, 510, 110, 52, 'Sign In', C.yellow, C.text, el);

  // Bottom decoration: horizontal stripe of tags
  neoTag(22, 600, 'DESIGN', C.sage, el);
  neoTag(100, 600, 'COPY', C.lavender, el);
  neoTag(161, 600, 'DEV', C.pink, el);
  neoTag(210, 600, 'STRATEGY', C.yellow, el);

  // Bottom strip
  el.push(rect(0, H - 80, W, 80, C.text));
  el.push(text(W / 2, H - 44, 'POLLEN — FREELANCE STUDIO OS', 11, C.yellow, { fw: '700', anchor: 'middle', ls: '0.12em' }));
  el.push(text(W / 2, H - 26, 'version 2.1 · ram.zenbin.org/pollen', 10, C.muted, { fw: '400', anchor: 'middle', opacity: 0.5 }));

  // small decorative circles
  el.push(circle(360, 600, 22, C.accent, { stroke: C.border, sw: 2 }));
  el.push(circle(360, 600, 10, C.white));
  el.push(circle(20, 690, 14, C.yellow, { stroke: C.border, sw: 2 }));

  return el;
}

// ── SCREEN 2: Dashboard ──────────────────────────────────────────────────────
function buildDashboard() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));

  // Status bar
  el.push(rect(0, 0, W, 44, C.bg));
  el.push(text(20, 30, '9:41', 15, C.text, { fw: '600' }));
  el.push(text(W - 20, 30, '●●● WiFi 🔋', 12, C.text, { fw: '400', anchor: 'end' }));

  // Nav bar with shadow
  el.push(rect(2, 46, W, 56, C.border));
  el.push(rect(0, 44, W, 56, C.text));
  el.push(text(20, 79, 'POLLEN', 20, C.yellow, { fw: '900', ls: '0.08em' }));
  el.push(circle(342, 72, 18, C.accent, { stroke: C.border, sw: 2 }));
  el.push(text(342, 78, 'JD', 11, C.white, { fw: '800', anchor: 'middle' }));
  el.push(circle(308, 72, 16, C.surf, { stroke: C.border, sw: 1.5 }));
  el.push(text(308, 78, '🔔', 14, C.text, { anchor: 'middle' }));

  // Greeting + date
  el.push(text(20, 126, 'Good morning, Jade ✦', 22, C.text, { fw: '800' }));
  el.push(text(20, 148, 'Tuesday, April 11', 14, C.muted, { fw: '400' }));

  // ── Earnings card (big yellow) ─────────
  neoCard(20, 160, 350, 100, C.yellow, el);
  el.push(text(36, 193, 'THIS MONTH', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(text(36, 228, '$8,450', 38, C.text, { fw: '900', font: 'Georgia, serif' }));
  el.push(text(220, 193, 'vs last month', 11, C.muted, { fw: '400' }));
  el.push(rect(222, 200, 1, 60, C.border, {}));
  el.push(text(240, 218, '+14%', 26, C.accent, { fw: '900' }));
  el.push(text(240, 240, '↑ $1,040', 12, C.muted, { fw: '500' }));

  // ── Active briefs count row ──────────
  el.push(text(20, 286, 'ACTIVE BRIEFS', 11, C.muted, { fw: '700', ls: '0.1em' }));

  // 3 mini stat cards
  const stats = [
    { label: 'In Progress', val: '3', fill: C.sage },
    { label: 'Review', val: '2', fill: C.pink },
    { label: 'Draft', val: '5', fill: C.lavender },
  ];
  stats.forEach((s, i) => {
    const cx = 20 + i * 118;
    neoCard(cx, 296, 108, 74, s.fill, el, { sx: 3, sy: 3 });
    el.push(text(cx + 16, 325, s.val, 32, C.text, { fw: '900', font: 'Georgia, serif' }));
    el.push(text(cx + 16, 346, s.label, 11, C.muted, { fw: '600' }));
  });

  // ── Recent briefs ────────────────────
  el.push(text(20, 396, 'RECENT', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(text(W - 20, 396, 'See all →', 12, C.accent, { fw: '700', anchor: 'end' }));
  el.push(line(20, 404, W - 20, 404, C.border, { sw: 1.5 }));

  const briefs = [
    { name: 'Nova Rebrand', client: 'Nova Studio', status: 'IN PROGRESS', pct: 65, fill: C.sage },
    { name: 'Campaign Copy', client: 'Meridian Co.', status: 'REVIEW', pct: 90, fill: C.pink },
    { name: 'App Wireframes', client: 'Trellis Inc.', status: 'DRAFT', pct: 20, fill: C.lavender },
  ];

  briefs.forEach((b, i) => {
    const by = 414 + i * 88;
    neoCard(20, by, 350, 76, C.surf, el, { sx: 3, sy: 3 });
    // Status tag
    neoTag(36, by + 12, b.status, b.fill, el);
    el.push(text(36, by + 52, b.name, 16, C.text, { fw: '800' }));
    el.push(text(36, by + 68, b.client, 12, C.muted, { fw: '400' }));
    neoProgress(220, by + 44, 130, b.pct, C.accent, el);
    el.push(text(354, by + 40, b.pct + '%', 11, C.muted, { fw: '700', anchor: 'end' }));
  });

  // ── Bottom Nav ──────────────────────
  el.push(rect(0, H - 72, W, 72, C.surf, { stroke: C.border, sw: 1 }));
  const nav = [
    { icon: '⬛', label: 'Home', x: 48, active: true },
    { icon: '◻', label: 'Briefs', x: 136 },
    { icon: '◎', label: 'Timer', x: 224, pill: true },
    { icon: '◻', label: 'Invoices', x: 312 },
    { icon: '◻', label: 'Settings', x: 48 + 4*78 },
  ];
  // simplified nav icons
  const navItems = [
    { label: 'Home', x: 48, active: true },
    { label: 'Briefs', x: 128 },
    { label: '+ New', x: 208, pill: true },
    { label: 'Bills', x: 288 },
    { label: 'You', x: 352 },
  ];
  navItems.forEach(n => {
    if (n.pill) {
      el.push(rect(n.x - 28, H - 64, 56, 44, C.accent, { rx: 22, stroke: C.border, sw: 2 }));
      el.push(text(n.x, H - 36, n.label, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      const col = n.active ? C.accent : C.muted;
      el.push(text(n.x, H - 46, '■', 14, col, { anchor: 'middle', opacity: n.active ? 1 : 0.5 }));
      el.push(text(n.x, H - 28, n.label, 10, col, { fw: n.active ? '700' : '400', anchor: 'middle' }));
    }
  });

  return el;
}

// ── SCREEN 3: Brief List ─────────────────────────────────────────────────────
function buildBriefList() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));

  // Header
  el.push(rect(2, 2, W, 56, C.border));
  el.push(rect(0, 0, W, 56, C.bg, { stroke: C.border, sw: 2 }));
  el.push(text(20, 37, '← All Briefs', 15, C.text, { fw: '700' }));
  neoBtn(W - 98, 12, 80, 34, '+ NEW', C.accent, C.white, el);

  // Filter tabs (neubrutalist)
  el.push(line(0, 60, W, 60, C.border, { sw: 2 }));
  const filters = ['All (10)', 'Active', 'Review', 'Done'];
  filters.forEach((f, i) => {
    const fx = 16 + i * 90;
    if (i === 0) {
      // active state
      el.push(rect(fx - 4, 62, 80, 32, C.text, { rx: 0 }));
      el.push(rect(fx - 6, 60, 80, 32, C.yellow, { stroke: C.border, sw: 2 }));
      el.push(text(fx + 34, 81, f, 13, C.text, { fw: '800', anchor: 'middle' }));
    } else {
      el.push(text(fx + 34, 81, f, 13, C.muted, { fw: '500', anchor: 'middle' }));
    }
  });
  el.push(line(0, 94, W, 94, C.border, { sw: 2 }));

  // Search bar
  neoCard(16, 102, W - 32, 42, C.surf, el, { sx: 2, sy: 2 });
  el.push(text(36, 128, '🔍  Search briefs...', 14, C.muted, { fw: '400' }));

  // Section: Due Soon
  el.push(text(20, 164, 'DUE SOON', 11, C.text, { fw: '800', ls: '0.1em' }));
  el.push(line(20, 170, W - 20, 170, C.border, { sw: 1 }));

  const allBriefs = [
    { name: 'Nova Rebrand System', client: 'Nova Studio', due: 'Apr 14', status: 'ACTIVE', pct: 65, fill: C.sage, rate: '$4,200', urgent: true },
    { name: 'Product Launch Copy', client: 'Meridian Co.', due: 'Apr 16', status: 'REVIEW', pct: 90, fill: C.pink, rate: '$1,800' },
    { name: 'SaaS App Wireframes', client: 'Trellis Inc.', due: 'Apr 22', status: 'DRAFT', pct: 20, fill: C.lavender, rate: '$3,500' },
    { name: 'Brand Photography', client: 'Bloom Foods', due: 'Apr 28', status: 'ACTIVE', pct: 40, fill: C.sage, rate: '$2,400' },
    { name: 'Annual Report Layout', client: 'Vortex Capital', due: 'May 3', status: 'DRAFT', pct: 8, fill: C.lavender, rate: '$5,600' },
  ];

  allBriefs.forEach((b, i) => {
    const by = 178 + i * 108;
    if (by + 100 > H - 80) return;

    // card background with shadow
    const urgentFill = b.urgent ? C.yellow : C.surf;
    neoCard(16, by, W - 32, 96, urgentFill, el, { sx: 3, sy: 3 });

    if (b.urgent) {
      el.push(text(W - 28, by + 18, '⚡ URGENT', 10, C.accent, { fw: '800', anchor: 'end' }));
    }

    // Status tag
    neoTag(30, by + 10, b.status, b.fill, el);

    el.push(text(30, by + 56, b.name, 16, C.text, { fw: '800' }));
    el.push(text(30, by + 74, b.client, 12, C.muted, { fw: '400' }));

    // Due date
    el.push(text(W - 30, by + 56, 'Due ' + b.due, 12, C.muted, { fw: '600', anchor: 'end' }));
    el.push(text(W - 30, by + 74, b.rate, 14, C.accent, { fw: '800', anchor: 'end' }));

    // Progress
    neoProgress(30, by + 84, 200, b.pct, C.accent, el);
    el.push(text(238, by + 84, b.pct + '%', 11, C.muted, { fw: '600' }));
  });

  // Bottom Nav
  el.push(rect(0, H - 72, W, 72, C.surf, { stroke: C.border, sw: 1 }));
  const navItems2 = [
    { label: 'Home', x: 48 },
    { label: 'Briefs', x: 128, active: true },
    { label: '+ New', x: 208, pill: true },
    { label: 'Bills', x: 288 },
    { label: 'You', x: 352 },
  ];
  navItems2.forEach(n => {
    if (n.pill) {
      el.push(rect(n.x - 28, H - 64, 56, 44, C.accent, { rx: 22, stroke: C.border, sw: 2 }));
      el.push(text(n.x, H - 36, n.label, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      const col = n.active ? C.accent : C.muted;
      el.push(text(n.x, H - 46, '■', 14, col, { anchor: 'middle', opacity: n.active ? 1 : 0.5 }));
      el.push(text(n.x, H - 28, n.label, 10, col, { fw: n.active ? '700' : '400', anchor: 'middle' }));
    }
  });

  return el;
}

// ── SCREEN 4: Brief Detail ───────────────────────────────────────────────────
function buildBriefDetail() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));

  // Full-bleed header bar (yellow)
  el.push(rect(2, 2, W, 110, C.border));
  el.push(rect(0, 0, W, 110, C.yellow, { stroke: C.border, sw: 2 }));
  el.push(text(20, 36, '← Nova Rebrand', 15, C.text, { fw: '700' }));
  el.push(text(20, 72, 'Nova Rebrand System', 24, C.text, { fw: '900', font: 'Georgia, serif', ls: '-0.01em' }));
  el.push(text(20, 96, 'Nova Studio · $4,200 fixed', 14, C.muted, { fw: '500' }));

  // Status + progress strip
  el.push(rect(0, 112, W, 52, C.surf, { stroke: C.border, sw: 1 }));
  neoTag(16, 124, 'IN PROGRESS', C.sage, el);
  neoProgress(140, 131, 180, 65, C.accent, el);
  el.push(text(326, 131, '65%', 12, C.muted, { fw: '700' }));

  // Tabs
  el.push(rect(0, 164, W, 40, C.bg, { stroke: C.border, sw: 1 }));
  ['Brief', 'Assets', 'Notes', 'Time'].forEach((t, i) => {
    const tx = 16 + i * 92;
    if (i === 0) {
      el.push(rect(tx - 2, 164, 80, 40, C.accent));
      el.push(text(tx + 38, 190, t, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      el.push(text(tx + 38, 190, t, 13, C.muted, { fw: '500', anchor: 'middle' }));
    }
  });
  el.push(line(0, 204, W, 204, C.border, { sw: 2 }));

  // Brief content
  el.push(text(20, 226, 'DELIVERABLES', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(line(20, 232, W - 20, 232, C.border, { sw: 1 }));

  const items = [
    { label: 'Brand identity system', done: true },
    { label: 'Logo suite (primary + variants)', done: true },
    { label: 'Brand guidelines document', done: false },
    { label: 'Social media templates (10)', done: false },
    { label: 'Business card design', done: false },
  ];
  items.forEach((item, i) => {
    const iy = 244 + i * 36;
    el.push(rect(20, iy, 20, 20, item.done ? C.accent : C.surf, { rx: 3, stroke: C.border, sw: 2 }));
    if (item.done) el.push(text(30, iy + 15, '✓', 13, C.white, { fw: '900', anchor: 'middle' }));
    el.push(text(52, iy + 15, item.label, 14, item.done ? C.muted : C.text, { fw: item.done ? '400' : '600', opacity: item.done ? 0.7 : 1 }));
  });

  // Timeline section
  el.push(text(20, 434, 'TIMELINE', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(line(20, 440, W - 20, 440, C.border, { sw: 1 }));

  const timeline = [
    { date: 'Apr 5', label: 'Kickoff call', done: true },
    { date: 'Apr 8', label: 'Initial concepts (3x)', done: true },
    { date: 'Apr 14', label: 'Client review ⚡', done: false, active: true },
    { date: 'Apr 20', label: 'Final delivery', done: false },
  ];
  timeline.forEach((t, i) => {
    const ty = 456 + i * 44;
    const col = t.done ? C.accent : (t.active ? C.accent : C.muted);
    el.push(circle(30, ty + 10, 8, t.done ? C.accent : (t.active ? C.yellow : C.surf), { stroke: C.border, sw: 2 }));
    if (i < timeline.length - 1) el.push(line(30, ty + 18, 30, ty + 44, C.border, { sw: 1, opacity: 0.4 }));
    el.push(text(52, ty + 8, t.date, 12, C.muted, { fw: '600' }));
    el.push(text(108, ty + 8, t.label, 14, t.active ? C.text : (t.done ? C.muted : C.text), { fw: t.active ? '800' : '500', opacity: t.done ? 0.7 : 1 }));
    if (t.active) neoTag(270, ty - 2, 'THIS WEEK', C.yellow, el);
  });

  // Action buttons
  el.push(line(20, 638, W - 20, 638, C.border, { sw: 1 }));
  neoBtn(20, 648, 166, 46, 'Log Time ⏱', C.sage, C.text, el);
  neoBtn(200, 648, 166, 46, 'Send Invoice $', C.accent, C.white, el);

  // Bottom Nav
  el.push(rect(0, H - 72, W, 72, C.surf, { stroke: C.border, sw: 1 }));
  [
    { label: 'Home', x: 48 }, { label: 'Briefs', x: 128, active: true },
    { label: '+ New', x: 208, pill: true }, { label: 'Bills', x: 288 }, { label: 'You', x: 352 },
  ].forEach(n => {
    if (n.pill) {
      el.push(rect(n.x - 28, H - 64, 56, 44, C.accent, { rx: 22, stroke: C.border, sw: 2 }));
      el.push(text(n.x, H - 36, n.label, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      const col = n.active ? C.accent : C.muted;
      el.push(text(n.x, H - 46, '■', 14, col, { anchor: 'middle', opacity: n.active ? 1 : 0.5 }));
      el.push(text(n.x, H - 28, n.label, 10, col, { fw: n.active ? '700' : '400', anchor: 'middle' }));
    }
  });

  return el;
}

// ── SCREEN 5: New Brief Form ──────────────────────────────────────────────────
function buildNewBrief() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));

  // Header
  el.push(rect(2, 2, W, 56, C.border));
  el.push(rect(0, 0, W, 56, C.text));
  el.push(text(20, 37, 'NEW BRIEF', 18, C.yellow, { fw: '900', ls: '0.08em' }));
  el.push(text(W - 20, 37, '✕ Close', 14, C.pink, { fw: '600', anchor: 'end' }));

  // dot grid accent top-right
  dotGrid(300, 70, 6, 4, C.muted, el);

  // Step indicator
  el.push(text(20, 86, 'Step 1 of 3  —  Project Details', 13, C.muted, { fw: '500' }));
  el.push(rect(20, 94, 350, 4, C.border, { rx: 2 }));
  el.push(rect(20, 94, 120, 4, C.accent, { rx: 2 }));

  // Form fields
  function formField(lbl, val, y, fill, active) {
    el.push(text(20, y - 4, lbl, 11, C.muted, { fw: '700', ls: '0.1em' }));
    el.push(rect(22, y + 4, 348, 44, C.border, { rx: 3 }));
    el.push(rect(20, y + 2, 348, 44, active ? C.yellow : fill, { rx: 3, stroke: C.border, sw: active ? 2.5 : 1.5 }));
    el.push(text(36, y + 30, val, 15, val.includes('Enter') ? C.muted : C.text, { fw: val.includes('Enter') ? '400' : '600', opacity: val.includes('Enter') ? 0.6 : 1 }));
    if (active) {
      // cursor
      const curX = 36 + val.length * 8.5;
      el.push(rect(curX, y + 12, 2, 20, C.text));
    }
  }

  formField('PROJECT NAME', 'Nova Rebrand System|', 110, C.surf, true);
  formField('CLIENT', 'Nova Studio', 186, C.surf, false);
  formField('PROJECT TYPE', '◈  Brand Identity', 262, C.surf, false);
  formField('BUDGET', '$4,200', 338, C.surf, false);

  // deadline row
  el.push(text(20, 408, 'DEADLINE', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(rect(22, 412, 168, 44, C.border, { rx: 3 }));
  el.push(rect(20, 410, 168, 44, C.surf, { rx: 3, stroke: C.border, sw: 1.5 }));
  el.push(text(36, 438, '📅  Apr 28, 2026', 14, C.text, { fw: '500' }));

  el.push(rect(202, 412, 168, 44, C.border, { rx: 3 }));
  el.push(rect(200, 410, 168, 44, C.surf, { rx: 3, stroke: C.border, sw: 1.5 }));
  el.push(text(216, 438, '💵  Fixed price', 14, C.text, { fw: '500' }));

  // Tags section
  el.push(text(20, 474, 'CATEGORY TAGS', 11, C.muted, { fw: '700', ls: '0.1em' }));
  neoTag(20, 482, '● DESIGN', C.sage, el);
  neoTag(102, 482, '● BRAND', C.yellow, el);
  neoTag(164, 482, '+ Add', C.lavender, el);

  // Note area
  el.push(text(20, 526, 'BRIEF NOTES', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(rect(22, 530, 348, 100, C.border, { rx: 3 }));
  el.push(rect(20, 528, 348, 100, C.surf, { rx: 3, stroke: C.border, sw: 1.5 }));
  el.push(text(36, 554, 'Complete brand identity overhaul including...', 13, C.text, { fw: '400' }));
  el.push(text(36, 576, 'logo system, typography, colour palette,', 13, C.muted, { fw: '400', opacity: 0.8 }));
  el.push(text(36, 598, 'guidelines and social templates.', 13, C.muted, { fw: '400', opacity: 0.5 }));

  // Next button
  neoBtn(20, 650, 350, 52, 'Continue → Client Details', C.accent, C.white, el);

  return el;
}

// ── SCREEN 6: Invoices / Billing ──────────────────────────────────────────────
function buildInvoices() {
  const el = [];
  el.push(rect(0, 0, W, H, C.bg));

  // Header (pink-ish blush)
  el.push(rect(2, 2, W, 110, C.border));
  el.push(rect(0, 0, W, 110, C.pink, { stroke: C.border, sw: 2 }));
  el.push(text(20, 37, '← Invoices', 15, C.text, { fw: '700' }));
  el.push(text(20, 72, 'BILLING', 36, C.text, { fw: '900', ls: '0.05em', font: 'Georgia, serif' }));
  el.push(text(20, 96, 'April 2026', 14, C.muted, { fw: '500' }));

  // Large summary
  neoCard(20, 120, 350, 80, C.yellow, el);
  el.push(text(36, 150, 'OUTSTANDING', 11, C.muted, { fw: '700', ls: '0.1em' }));
  el.push(text(36, 180, '$6,200', 36, C.text, { fw: '900', font: 'Georgia, serif' }));
  el.push(line(210, 134, 210, 194, C.border, { sw: 1 }));
  el.push(text(226, 150, 'PAID THIS MO.', 10, C.muted, { fw: '700', ls: '0.08em' }));
  el.push(text(226, 180, '$8,450', 24, C.accent, { fw: '900' }));

  // Filters
  el.push(line(0, 212, W, 212, C.border, { sw: 2 }));
  ['All', 'Sent', 'Paid', 'Overdue'].forEach((f, i) => {
    const fx = 16 + i * 88;
    if (i === 3) {
      el.push(rect(fx + 1, 213, 76, 32, C.border));
      el.push(rect(fx - 1, 211, 76, 32, C.accent));
      el.push(text(fx + 37, 232, f, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      el.push(text(fx + 37, 232, f, 13, i === 0 ? C.text : C.muted, { fw: i === 0 ? '700' : '400', anchor: 'middle' }));
    }
  });
  el.push(line(0, 244, W, 244, C.border, { sw: 2 }));

  const invoices = [
    { id: 'INV-0042', client: 'Nova Studio', project: 'Nova Rebrand System', amount: '$4,200', status: 'SENT', due: 'Apr 14', fill: C.yellow, overdue: false },
    { id: 'INV-0041', client: 'Meridian Co.', project: 'Campaign Copy', amount: '$1,800', status: 'OVERDUE', due: 'Apr 8 ⚡', fill: C.pink, overdue: true },
    { id: 'INV-0040', client: 'Bloom Foods', project: 'Brand Photography', amount: '$2,400', status: 'PAID', due: 'Apr 2', fill: C.sage, overdue: false },
    { id: 'INV-0039', client: 'Vortex Capital', project: 'Annual Report', amount: '$5,600', status: 'DRAFT', due: 'May 3', fill: C.lavender, overdue: false },
  ];

  invoices.forEach((inv, i) => {
    const iy = 256 + i * 106;
    if (iy + 98 > H - 80) return;
    neoCard(16, iy, W - 32, 94, inv.fill, el, { sx: 3, sy: 3 });
    el.push(text(30, iy + 20, inv.id, 12, C.muted, { fw: '700', ls: '0.06em' }));
    neoTag(120, iy + 8, inv.status, inv.overdue ? C.accent : C.surf, el);
    el.push(text(30, iy + 50, inv.project, 15, C.text, { fw: '800' }));
    el.push(text(30, iy + 68, inv.client, 12, C.muted, { fw: '400' }));
    el.push(text(W - 30, iy + 50, inv.amount, 20, C.text, { fw: '900', font: 'Georgia, serif', anchor: 'end' }));
    el.push(text(W - 30, iy + 68, 'Due ' + inv.due, 12, inv.overdue ? C.accent : C.muted, { fw: inv.overdue ? '800' : '400', anchor: 'end' }));
    neoBtn(W - 118, iy + 72, 100, 26, inv.status === 'DRAFT' ? 'Send →' : 'View →', C.text, C.yellow, el);
  });

  // Bottom Nav
  el.push(rect(0, H - 72, W, 72, C.surf, { stroke: C.border, sw: 1 }));
  [
    { label: 'Home', x: 48 }, { label: 'Briefs', x: 128 },
    { label: '+ New', x: 208, pill: true }, { label: 'Bills', x: 288, active: true }, { label: 'You', x: 352 },
  ].forEach(n => {
    if (n.pill) {
      el.push(rect(n.x - 28, H - 64, 56, 44, C.accent, { rx: 22, stroke: C.border, sw: 2 }));
      el.push(text(n.x, H - 36, n.label, 13, C.white, { fw: '800', anchor: 'middle' }));
    } else {
      const col = n.active ? C.accent : C.muted;
      el.push(text(n.x, H - 46, '■', 14, col, { anchor: 'middle', opacity: n.active ? 1 : 0.5 }));
      el.push(text(n.x, H - 28, n.label, 10, col, { fw: n.active ? '700' : '400', anchor: 'middle' }));
    }
  });

  return el;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE PEN
// ─────────────────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Welcome', fn: buildWelcome },
  { name: 'Dashboard', fn: buildDashboard },
  { name: 'Brief List', fn: buildBriefList },
  { name: 'Brief Detail', fn: buildBriefDetail },
  { name: 'New Brief', fn: buildNewBrief },
  { name: 'Invoices', fn: buildInvoices },
];

const penScreens = screens.map(s => {
  const els = s.fn();
  totalElems += els.length;

  const svgElems = els.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" fill="${e.fill}" rx="${e.rx || 0}" opacity="${e.opacity || 1}" stroke="${e.stroke || 'none'}" stroke-width="${e.sw || 0}"/>`;
    } else if (e.type === 'text') {
      return `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fw || 400}" font-family="${e.font || 'Inter, sans-serif'}" text-anchor="${e.anchor || 'start'}" letter-spacing="${e.ls || 0}" opacity="${e.opacity || 1}">${e.content}</text>`;
    } else if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity || 1}" stroke="${e.stroke || 'none'}" stroke-width="${e.sw || 0}"/>`;
    } else if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.sw || 1}" opacity="${e.opacity || 1}"/>`;
    }
    return '';
  }).join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n    ${svgElems}\n  </svg>`;

  return { name: s.name, svg, elements: els };
});

const pen = {
  version: '2.8',
  metadata: {
    name: 'POLLEN — Freelance Studio OS',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 'Apr-11-2026',
    elements: totalElems,
    description: 'Neubrutalist freelance project & invoice tracker. Warm cream palette with offset shadows, bold type, and solid colour fills. Inspired by siteinspire.com unusual layouts.',
  },
  screens: penScreens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`POLLEN: ${penScreens.length} screens, ${totalElems} elements`);
console.log(`Written: ${SLUG}.pen`);
