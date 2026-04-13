// Heartbeat #504 | Light theme
// LOFT — studio project workspace for creative teams
// Inspired by: Minimal Gallery SaaS minimalism (Folk, Composio, PostHog pattern)
//              × Land-Book heritage craft aesthetic (warm off-white, terracotta, serif revival)
'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'loft';
const W = 390, H = 844;

// ── Palette (light / warm cream) ──────────────────────────────────────────────
const P = {
  bg:      '#FAF7F2',   // warm cream
  surf:    '#FFFFFF',
  card:    '#F0EDE6',
  card2:   '#E8E3DA',
  text:    '#1C1917',
  text2:   '#57534E',
  muted:   '#A8A29E',
  acc:     '#C2714A',   // terracotta
  acc2:    '#4A7C6F',   // sage green
  accLt:   '#F0E0D6',   // light terracotta tint
  acc2Lt:  '#D4EAE6',   // light sage tint
  border:  '#E2DDD7',
  white:   '#FFFFFF',
};

// ── Element helpers ───────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Reusable components ───────────────────────────────────────────────────────

// Status pill
function pill(x, y, label, bg, textCol) {
  const w = label.length * 6.5 + 16;
  return [
    rect(x, y, w, 20, bg, { rx: 10 }),
    text(x + 8, y + 14, label, 10, textCol, { fw: 600, ls: 0.3 }),
  ];
}

// Top bar
function topBar(title, sub = '') {
  return [
    rect(0, 0, W, 52, P.surf),
    line(0, 52, W, 52, P.border, { sw: 1 }),
    text(20, 34, title, 16, P.text, { fw: 700, font: 'Georgia, serif' }),
    ...(sub ? [text(W - 20, 34, sub, 11, P.muted, { anchor: 'end' })] : []),
  ];
}

// Bottom nav
function bottomNav(active = 0) {
  const tabs = [
    { icon: '⌂', label: 'Home' },
    { icon: '◫', label: 'Projects' },
    { icon: '+', label: '' },
    { icon: '☰', label: 'Assets' },
    { icon: '◎', label: 'Profile' },
  ];
  const els = [
    rect(0, H - 80, W, 80, P.surf),
    line(0, H - 80, W, H - 80, P.border, { sw: 1 }),
  ];
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    if (i === 2) {
      // plus button
      els.push(circle(x, H - 40, 22, P.acc));
      els.push(text(x, H - 33, '+', 18, P.white, { fw: 300, anchor: 'middle' }));
    } else {
      els.push(circle(x, H - 52, 14, isActive ? P.accLt : 'none'));
      els.push(text(x, H - 45, tab.icon, 14, isActive ? P.acc : P.muted, { anchor: 'middle' }));
      els.push(text(x, H - 26, tab.label, 9, isActive ? P.acc : P.muted, { fw: isActive ? 600 : 400, anchor: 'middle', ls: 0.2 }));
    }
  });
  return els;
}

// Section header
function sectionHdr(x, y, label, cta = '') {
  return [
    text(x, y, label, 11, P.text2, { fw: 600, ls: 0.8 }),
    ...(cta ? [text(W - x, y, cta, 11, P.acc, { anchor: 'end' })] : []),
  ];
}

// Project card (horizontal)
function projectCard(y, name, client, status, statusBg, statusText, pct, color) {
  const h = 80;
  return [
    rect(16, y, W - 32, h, P.white, { rx: 10, stroke: P.border, sw: 1 }),
    // Color bar left
    rect(16, y, 4, h, color, { rx: 2 }),
    // Name
    text(32, y + 20, name, 13, P.text, { fw: 600 }),
    // Client
    text(32, y + 36, client, 11, P.text2),
    // Status pill
    ...pill(32, y + 50, status, statusBg, statusText),
    // Percentage
    text(W - 24, y + 24, `${pct}%`, 14, color, { fw: 700, anchor: 'end' }),
    // Mini progress bar
    rect(W - 72, y + 48, 52, 4, P.card, { rx: 2 }),
    rect(W - 72, y + 48, 52 * (pct / 100), 4, color, { rx: 2 }),
    // Arrow
    text(W - 24, y + 60, '›', 14, P.muted, { anchor: 'end' }),
  ];
}

// ── SCREEN 1: Home Dashboard ──────────────────────────────────────────────────
function screen1() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, P.bg));
  // Top bar
  els.push(...topBar('LOFT', 'April 2026'));
  // Status bar area
  els.push(rect(0, 0, W, 44, P.surf));

  // Welcome hero strip
  els.push(rect(0, 52, W, 90, P.acc));
  els.push(text(20, 84, 'Good morning,', 12, 'rgba(255,230,220,0.85)', { fw: 400 }));
  els.push(text(20, 104, 'Studio HYPER', 18, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 122, '3 deadlines this week', 11, 'rgba(255,230,220,0.7)'));
  // Avatar cluster
  [P.acc2, '#7C6B5A', '#4A6B7C'].forEach((c, i) => {
    els.push(circle(W - 40 + i * 12, 95, 14, c, { stroke: P.acc, sw: 2 }));
  });
  els.push(text(W - 40, 112, '+4', 9, 'rgba(255,230,220,0.8)', { anchor: 'middle' }));

  // Stats row
  const stats = [
    { label: 'Active', val: '8' },
    { label: 'Due Soon', val: '3' },
    { label: 'Overdue', val: '1' },
    { label: 'Done', val: '12' },
  ];
  els.push(rect(0, 142, W, 68, P.surf));
  stats.forEach((s, i) => {
    const x = 20 + i * (W / 4);
    els.push(text(x + (W / 8) - 10, 163, s.val, 20, i === 2 ? '#E53E3E' : P.acc, { fw: 700, anchor: 'middle' }));
    els.push(text(x + (W / 8) - 10, 179, s.label, 9, P.muted, { anchor: 'middle', ls: 0.3 }));
    if (i < 3) els.push(line(x + W / 4, 152, x + W / 4, 198, P.border, { sw: 1 }));
  });
  els.push(line(0, 210, W, 210, P.border, { sw: 1 }));

  // Active projects section
  let y = 224;
  els.push(...sectionHdr(20, y, 'ACTIVE PROJECTS', 'View all'));
  y += 20;

  // Project cards
  const projects = [
    { name: 'Verdana Brand Identity', client: 'Verdana Inc.', status: 'On Track', sBg: P.acc2Lt, sText: P.acc2, pct: 68, col: P.acc2 },
    { name: 'Opal Website Redesign', client: 'Opal Agency', status: 'At Risk', sBg: '#FEF3C7', sText: '#B45309', pct: 34, col: '#D97706' },
    { name: 'Milo Campaign Kit', client: 'Milo Beverages', status: 'On Track', sBg: P.acc2Lt, sText: P.acc2, pct: 82, col: P.acc },
  ];
  projects.forEach(p => {
    els.push(...projectCard(y, p.name, p.client, p.status, p.sBg, p.sText, p.pct, p.col));
    y += 92;
  });

  // Upcoming deadline strip
  y = 560;
  els.push(...sectionHdr(20, y, 'NEXT DEADLINE'));
  y += 14;
  els.push(rect(16, y, W - 32, 60, P.accLt, { rx: 10 }));
  els.push(circle(36, y + 30, 18, P.acc));
  els.push(text(36, y + 35, '14', 13, P.white, { fw: 700, anchor: 'middle' }));
  els.push(text(56, y + 22, 'Verdana — Final Assets', 13, P.text, { fw: 600 }));
  els.push(text(56, y + 39, 'Mon Apr 14 · 5 files outstanding', 11, P.text2));

  // Bottom nav
  els.push(...bottomNav(0));
  return els;
}

// ── SCREEN 2: Projects List ───────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...topBar('Projects', '8 active'));

  // Filter tabs
  const filters = ['All', 'Active', 'On Hold', 'Done'];
  els.push(rect(0, 52, W, 44, P.surf));
  els.push(line(0, 96, W, 96, P.border, { sw: 1 }));
  let fx = 16;
  filters.forEach((f, i) => {
    const w = f.length * 8 + 20;
    const active = i === 0;
    els.push(rect(fx, 60, w, 26, active ? P.acc : P.card, { rx: 13 }));
    els.push(text(fx + w / 2, 77, f, 11, active ? P.white : P.text2, { fw: active ? 600 : 400, anchor: 'middle' }));
    fx += w + 8;
  });

  // Month divider
  els.push(text(20, 118, 'APRIL 2026', 10, P.muted, { fw: 600, ls: 1.2 }));

  // Full project list with budget / timeline
  const list = [
    { name: 'Verdana Brand Identity', cat: 'Branding', due: 'Apr 14', budget: '£8,400', status: 'Active', col: P.acc2 },
    { name: 'Opal Website Redesign', cat: 'Digital', due: 'Apr 22', budget: '£14,200', status: 'At Risk', col: '#D97706' },
    { name: 'Milo Campaign Kit', cat: 'Marketing', due: 'Apr 30', budget: '£5,600', status: 'Active', col: P.acc },
    { name: 'Nova Annual Report', cat: 'Editorial', due: 'May 6', budget: '£11,000', status: 'Active', col: '#7C3AED' },
    { name: 'Prism Packaging', cat: 'Print', due: 'May 18', budget: '£6,800', status: 'On Hold', col: P.muted },
  ];
  let y = 130;
  list.forEach(p => {
    els.push(rect(16, y, W - 32, 84, P.white, { rx: 10, stroke: P.border, sw: 1 }));
    els.push(rect(16, y, 4, 84, p.col, { rx: 2 }));
    // Name + cat
    els.push(text(32, y + 22, p.name, 13, P.text, { fw: 600 }));
    els.push(text(32, y + 38, p.cat, 10, P.muted, { ls: 0.5 }));
    // Status pill
    const sBg = p.status === 'At Risk' ? '#FEF3C7' : p.status === 'On Hold' ? P.card : P.acc2Lt;
    const sText = p.status === 'At Risk' ? '#B45309' : p.status === 'On Hold' ? P.muted : P.acc2;
    els.push(...pill(32, y + 52, p.status, sBg, sText));
    // Budget
    els.push(text(W - 24, y + 28, p.budget, 13, P.text, { fw: 600, anchor: 'end' }));
    els.push(text(W - 24, y + 45, `Due ${p.due}`, 10, P.muted, { anchor: 'end' }));
    y += 96;
  });

  // FAB
  els.push(circle(W - 36, H - 108, 24, P.acc));
  els.push(text(W - 36, H - 100, '+', 18, P.white, { fw: 300, anchor: 'middle' }));

  els.push(...bottomNav(1));
  return els;
}

// ── SCREEN 3: Project Brief Detail ───────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  // Back bar
  els.push(rect(0, 0, W, 52, P.surf));
  els.push(line(0, 52, W, 52, P.border, { sw: 1 }));
  els.push(text(20, 33, '← Verdana Brand Identity', 13, P.acc, { fw: 500 }));
  els.push(...pill(W - 72, 16, 'On Track', P.acc2Lt, P.acc2));

  // Hero project info
  els.push(rect(0, 52, W, 110, P.acc));
  els.push(text(20, 83, 'Verdana Brand Identity', 17, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 102, 'Verdana Inc. · Branding & Identity', 12, 'rgba(255,225,215,0.8)'));
  els.push(text(20, 121, 'Due Mon Apr 14 · 3 days left', 11, 'rgba(255,225,215,0.7)'));
  // Progress
  els.push(rect(20, 134, W - 40, 6, 'rgba(255,255,255,0.25)', { rx: 3 }));
  els.push(rect(20, 134, (W - 40) * 0.68, 6, P.white, { rx: 3 }));
  els.push(text(W - 20, 144, '68%', 10, 'rgba(255,225,215,0.9)', { fw: 600, anchor: 'end' }));

  // Tab bar
  const tabs = ['Brief', 'Assets', 'Timeline', 'Notes'];
  els.push(rect(0, 162, W, 40, P.surf));
  els.push(line(0, 202, W, 202, P.border, { sw: 1 }));
  let tx = 20;
  tabs.forEach((t, i) => {
    const active = i === 0;
    els.push(text(tx, 186, t, 12, active ? P.acc : P.muted, { fw: active ? 600 : 400 }));
    if (active) els.push(line(tx, 202, tx + t.length * 7.5, 202, P.acc, { sw: 2 }));
    tx += t.length * 7.5 + 22;
  });

  // Brief sections
  let y = 216;
  const sections = [
    { label: 'CLIENT CONTEXT', body: 'Verdana Inc. is a sustainable materials startup rebranding after Series A. They need a full visual identity reflecting their commitment to circular design principles.' },
    { label: 'DELIVERABLES', items: ['Primary + secondary logo suite', 'Brand guidelines (40pp PDF)', 'Business stationery pack', 'Social media template set'] },
    { label: 'CREATIVE DIRECTION', body: 'Earthy, premium, minimal. Reference: Aesop meets Patagonia. Avoid tech-company aesthetics. Serif headline type preferred.' },
  ];

  sections.forEach(s => {
    els.push(rect(16, y, W - 32, s.items ? s.items.length * 24 + 40 : 80, P.white, { rx: 10, stroke: P.border, sw: 1 }));
    els.push(text(26, y + 16, s.label, 9, P.muted, { fw: 600, ls: 1 }));
    if (s.body) {
      // Wrap text over 2 lines
      const line1 = s.body.slice(0, 52);
      const line2 = s.body.slice(52, 104);
      const line3 = s.body.slice(104);
      els.push(text(26, y + 31, line1, 11, P.text2));
      els.push(text(26, y + 46, line2, 11, P.text2));
      if (line3) els.push(text(26, y + 61, line3, 11, P.text2));
    }
    if (s.items) {
      s.items.forEach((item, ii) => {
        els.push(circle(30, y + 28 + ii * 24, 3, P.acc));
        els.push(text(40, y + 32 + ii * 24, item, 11, P.text));
      });
    }
    y += (s.items ? s.items.length * 24 + 50 : 92);
  });

  els.push(...bottomNav(1));
  return els;
}

// ── SCREEN 4: Asset Gallery ───────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...topBar('Assets', '24 files'));

  // Search bar
  els.push(rect(16, 62, W - 32, 34, P.white, { rx: 8, stroke: P.border, sw: 1 }));
  els.push(circle(36, 79, 7, 'none', { stroke: P.muted, sw: 1.5 }));
  els.push(text(52, 83, 'Search files…', 12, P.muted));

  // Filter chips
  const chips = ['All', 'Logos', 'Docs', 'Images', 'Video'];
  let cx = 16;
  els.push(rect(0, 104, W, 36, P.surf));
  chips.forEach((c, i) => {
    const w = c.length * 7.5 + 18;
    const active = i === 0;
    els.push(rect(cx, 110, w, 22, active ? P.acc : P.card, { rx: 11 }));
    els.push(text(cx + w / 2, 124, c, 10, active ? P.white : P.text2, { anchor: 'middle', fw: active ? 600 : 400 }));
    cx += w + 6;
  });
  els.push(line(0, 140, W, 140, P.border, { sw: 1 }));

  // Asset grid - 2 col
  const assets = [
    { name: 'Logo Primary.svg', type: 'SVG', size: '24 KB', bg: P.accLt, icon: '◈' },
    { name: 'Logo Mono.svg', type: 'SVG', size: '18 KB', bg: P.acc2Lt, icon: '◈' },
    { name: 'Brand Guide.pdf', type: 'PDF', size: '3.2 MB', bg: '#FEF3C7', icon: '▤' },
    { name: 'Patterns.zip', type: 'ZIP', size: '12 MB', bg: P.card, icon: '⬡' },
    { name: 'Stationery.pdf', type: 'PDF', size: '8.1 MB', bg: '#FEF3C7', icon: '▤' },
    { name: 'Keynote Template', type: 'KEY', size: '44 MB', bg: P.acc2Lt, icon: '⬜' },
  ];
  const gw = (W - 48) / 2;
  assets.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = 16 + col * (gw + 16);
    const ay = 152 + row * (gw * 0.85 + 12);
    const th = gw * 0.65;
    els.push(rect(ax, ay, gw, gw * 0.85, P.white, { rx: 10, stroke: P.border, sw: 1 }));
    els.push(rect(ax, ay, gw, th, a.bg, { rx: 10 }));
    els.push(rect(ax, ay + th - 14, gw, 28, a.bg)); // overlap fix
    els.push(rect(ax, ay + th, gw, gw * 0.85 - th, P.white));
    els.push(text(ax + gw / 2, ay + th / 2 + 8, a.icon, 22, P.text2, { anchor: 'middle', opacity: 0.5 }));
    els.push(text(ax + 10, ay + th + 16, a.name.slice(0, 16) + (a.name.length > 16 ? '…' : ''), 10, P.text, { fw: 500 }));
    els.push(text(ax + 10, ay + th + 30, `${a.type} · ${a.size}`, 9, P.muted));
  });

  // Upload FAB
  els.push(circle(W - 36, H - 108, 24, P.acc));
  els.push(text(W - 36, H - 100, '↑', 16, P.white, { fw: 600, anchor: 'middle' }));

  els.push(...bottomNav(3));
  return els;
}

// ── SCREEN 5: Schedule / Timeline ────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...topBar('Schedule', 'Week 15'));

  // Week strip
  els.push(rect(0, 52, W, 68, P.surf));
  els.push(line(0, 120, W, 120, P.border, { sw: 1 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = ['7', '8', '9', '10', '11', '12', '13'];
  const todayIdx = 6;
  days.forEach((d, i) => {
    const x = 20 + i * 50;
    const isToday = i === todayIdx;
    if (isToday) els.push(rect(x - 10, 55, 38, 58, P.accLt, { rx: 10 }));
    els.push(text(x + 9, 71, d, 10, isToday ? P.acc : P.muted, { fw: isToday ? 600 : 400, anchor: 'middle', ls: 0.5 }));
    els.push(text(x + 9, 91, dates[i], 16, isToday ? P.acc : P.text, { fw: isToday ? 700 : 400, anchor: 'middle' }));
    if (i > 0 && i < 5) els.push(circle(x + 9, 108, 3, P.acc, { opacity: 0.5 }));
  });

  // Milestones / events
  const events = [
    { time: '9:00', title: 'Verdana — Client Presentation', proj: 'Verdana', dur: 60, col: P.acc2 },
    { time: '11:30', title: 'Milo — Asset Review', proj: 'Milo Campaign', dur: 45, col: P.acc },
    { time: '14:00', title: 'Opal — Status Call', proj: 'Opal Website', dur: 30, col: '#D97706' },
    { time: '15:00', title: 'Nova — Copy Sign-Off', proj: 'Nova Report', dur: 90, col: '#7C3AED' },
    { time: '17:00', title: 'Team Check-in', proj: 'Internal', dur: 30, col: P.muted }
  ];
  let y = 132;
  els.push(text(20, y + 10, 'TODAY — APR 13', 9, P.muted, { fw: 600, ls: 1 }));
  y += 22;
  events.forEach(e => {
    const bh = Math.max(56, e.dur * 0.5);
    els.push(rect(16, y, W - 32, bh, P.white, { rx: 10, stroke: P.border, sw: 1 }));
    els.push(rect(16, y, 4, bh, e.col, { rx: 2 }));
    els.push(text(30, y + 17, e.time, 10, P.muted, { fw: 500 }));
    els.push(text(30, y + 33, e.title, 12, P.text, { fw: 600 }));
    els.push(text(30, y + 49, e.proj, 10, P.text2));
    if (bh >= 60) {
      els.push(text(W - 24, y + 17, `${e.dur}m`, 10, P.muted, { anchor: 'end' }));
    }
    y += bh + 8;
  });

  els.push(...bottomNav(0));
  return els;
}

// ── SCREEN 6: Studio Insights ─────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...topBar('Insights', 'Apr 2026'));

  // Period toggle
  els.push(rect(16, 62, W - 32, 30, P.card, { rx: 8 }));
  ['Week', 'Month', 'Quarter'].forEach((p, i) => {
    const w = (W - 32) / 3;
    const active = i === 1;
    if (active) els.push(rect(16 + i * w, 62, w, 30, P.white, { rx: 8, stroke: P.border, sw: 1 }));
    els.push(text(16 + i * w + w / 2, 81, p, 11, active ? P.acc : P.muted, { fw: active ? 600 : 400, anchor: 'middle' }));
  });

  // Hero metric
  els.push(rect(16, 102, W - 32, 72, P.acc, { rx: 12 }));
  els.push(text(32, 128, '£42,000', 26, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(32, 148, 'Revenue this month', 11, 'rgba(255,225,215,0.8)'));
  els.push(text(W - 32, 148, '↑ 12%', 11, P.white, { fw: 600, anchor: 'end' }));
  // Sparkline
  const sparks = [22, 28, 18, 35, 40, 32, 42];
  const sx = W - 120, sy = 120, sh = 32, sw2 = 80;
  sparks.forEach((v, i) => {
    const x1 = sx + i * (sw2 / 6);
    const y1 = sy + sh - (v / 42) * sh;
    const x2 = sx + (i + 1) * (sw2 / 6);
    const y2 = sy + sh - ((sparks[i + 1] ?? v) / 42) * sh;
    if (i < 6) els.push(line(x1, y1, x2, y2, 'rgba(255,255,255,0.6)', { sw: 1.5 }));
    els.push(circle(x1, y1, 2, P.white));
  });

  // 2×2 stat grid
  const stats2 = [
    { label: 'Projects Active', val: '8', sub: '5 on track', col: P.acc2 },
    { label: 'Avg Margin', val: '62%', sub: '+4% vs last mo', col: '#7C3AED' },
    { label: 'Hours Logged', val: '184h', sub: '23 per project', col: P.acc },
    { label: 'Client Rating', val: '4.9', sub: '38 reviews', col: '#D97706' },
  ];
  const gw2 = (W - 48) / 2;
  stats2.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = 16 + col * (gw2 + 16);
    const ay = 186 + row * 88;
    els.push(rect(ax, ay, gw2, 76, P.white, { rx: 10, stroke: P.border, sw: 1 }));
    els.push(rect(ax, ay, gw2, 4, s.col, { rx: 2 }));
    els.push(text(ax + 14, ay + 26, s.val, 20, P.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(ax + 14, ay + 43, s.label, 10, P.text2));
    els.push(text(ax + 14, ay + 60, s.sub, 10, s.col, { fw: 500 }));
  });

  // Capacity bar section
  let y = 370;
  els.push(...sectionHdr(20, y, 'TEAM CAPACITY'));
  y += 20;
  const members = [
    { name: 'Jana K.', pct: 85 },
    { name: 'Reza M.', pct: 62 },
    { name: 'Theo B.', pct: 94 },
    { name: 'Safi L.', pct: 48 },
  ];
  members.forEach(m => {
    els.push(text(20, y + 12, m.name, 11, P.text2));
    const barW = W - 110;
    els.push(rect(W - barW - 16, y, barW, 8, P.card, { rx: 4 }));
    const filled = barW * (m.pct / 100);
    const barCol = m.pct > 90 ? '#E53E3E' : m.pct > 70 ? P.acc : P.acc2;
    els.push(rect(W - barW - 16, y, filled, 8, barCol, { rx: 4 }));
    els.push(text(W - 12, y + 9, `${m.pct}%`, 10, P.text2, { anchor: 'end' }));
    y += 28;
  });

  // Top client by revenue
  y += 8;
  els.push(...sectionHdr(20, y, 'TOP CLIENTS'));
  y += 18;
  [['Verdana Inc.', '£12,400', 0.6], ['Opal Agency', '£9,800', 0.47], ['Milo Beverages', '£7,200', 0.35]].forEach(([name, rev, r], i) => {
    els.push(circle(32, y + 10, 12, [P.acc2, P.acc, '#7C3AED'][i]));
    els.push(text(32, y + 14, String(i + 1), 9, P.white, { fw: 700, anchor: 'middle' }));
    els.push(text(52, y + 6, name, 12, P.text, { fw: 500 }));
    els.push(text(52, y + 20, rev, 10, P.muted));
    els.push(rect(W - 80, y + 3, 60, 5, P.card, { rx: 2 }));
    els.push(rect(W - 80, y + 3, 60 * r, 5, [P.acc2, P.acc, '#7C3AED'][i], { rx: 2 }));
    y += 30;
  });

  els.push(...bottomNav(4));
  return els;
}

// ── Build + write ─────────────────────────────────────────────────────────────
const screens = [
  { name: 'Home Dashboard',     fn: screen1 },
  { name: 'Projects List',      fn: screen2 },
  { name: 'Project Brief',      fn: screen3 },
  { name: 'Asset Gallery',      fn: screen4 },
  { name: 'Schedule',           fn: screen5 },
  { name: 'Studio Insights',    fn: screen6 },
];

let totalEls = 0;
const penScreens = screens.map(s => {
  const elements = s.fn();
  totalEls += elements.length;
  const svgParts = elements.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    }
    if (e.type === 'text') {
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${e.content}</text>`;
    }
    if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    }
    if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}"/>`;
    }
    return '';
  }).join('\n    ');
  return {
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n    ${svgParts}\n  </svg>`,
    elements,
  };
});

const pen = {
  version: '2.8',
  metadata: {
    name: 'LOFT — Studio Project Workspace',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: 504,
    elements: totalEls,
    slug: SLUG,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.acc, accent2: P.acc2, muted: P.muted,
    },
  },
  screens: penScreens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`LOFT: ${penScreens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
