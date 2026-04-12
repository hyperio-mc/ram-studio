// FRAME — The Studio OS
// Inspired by: Locomotive.ca (Godly.website) bold editorial display type + Stripe Sessions warm cream palette
// Light theme: editorial agency project management OS

const fs = require('fs');
const path = require('path');

// ─── Pencil v2.8 pen generator ─────────────────────────────────────────────

const W = 390, H = 844;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: makeId(), type: 'rect', x, y, width: w, height: h,
    fill, opacity: opts.opacity ?? 1,
    cornerRadius: opts.r ?? 0,
    stroke: opts.stroke ?? null, strokeWidth: opts.sw ?? 0,
    shadow: opts.shadow ?? null,
  };
}

function text(x, y, content, opts = {}) {
  return {
    id: makeId(), type: 'text', x, y,
    content: String(content),
    fontSize: opts.size ?? 14,
    fontFamily: opts.font ?? 'Inter',
    fontWeight: opts.weight ?? '400',
    fill: opts.fill ?? '#0F0F0E',
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
    lineHeight: opts.lh ?? 1.3,
    align: opts.align ?? 'left',
    width: opts.w ?? 300,
  };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    id: makeId(), type: 'ellipse', x: x - r, y: y - r,
    width: r * 2, height: r * 2,
    fill, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? null, strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, sw = 1) {
  return {
    id: makeId(), type: 'line',
    x1, y1, x2, y2, stroke, strokeWidth: sw,
  };
}

// ── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F6F4EF',   // warm cream — Stripe Sessions inspired
  surface:  '#FFFFFF',
  surface2: '#EDEBE5',   // subtle warm grey
  text:     '#0F0F0E',   // near-black
  muted:    '#8A8880',
  accent:   '#1B1BE0',   // bold indigo — editorial blue
  accent2:  '#E03030',   // editorial red
  accent3:  '#F5C842',   // warm amber tag
  border:   '#D8D5CC',
};

// ── STATUS COLORS ──────────────────────────────────────────────────────────
const STATUS = {
  active:    '#1B1BE0',
  review:    '#E03030',
  done:      '#2E9E5B',
  hold:      '#C8760A',
};

// ──────────────────────────────────────────────────────────────────────────
//  SCREEN 1 — Dashboard Overview
// ──────────────────────────────────────────────────────────────────────────
function buildDashboard() {
  const els = [];

  // BG
  els.push(rect(0, 0, W, H, P.bg));

  // ── STATUS BAR ──
  els.push(text(20, 52, '9:41', { size: 15, weight: '600', fill: P.text }));
  els.push(text(330, 52, '●●●', { size: 12, fill: P.text, opacity: 0.4 }));

  // ── HEADER ──
  els.push(text(20, 88, 'FRAME', { size: 11, weight: '600', fill: P.accent, ls: 3 }));
  
  // Avatar cluster (top right)
  [360, 340, 320].forEach((x, i) => {
    els.push(circle(x, 96, 14, ['#C87070','#70A8C8','#8870C8'][i]));
    els.push(text(x-6, 90, ['AL','MS','JK'][i], { size: 8, weight:'700', fill:'#fff', w:20, align:'center' }));
  });

  // ── BIG EDITORIAL HEADLINE ──
  els.push(text(20, 132, 'Studio\nOverview', {
    size: 44, weight: '800', font: 'Inter', fill: P.text, lh: 1.05, w: 350
  }));

  // ── DATE PILL ──
  els.push(rect(20, 230, 120, 26, P.text, { r: 13 }));
  els.push(text(34, 237, 'APR  2026', { size: 10, weight: '700', fill: P.bg, ls: 1, w: 90 }));

  // ── METRICS ROW ──
  const metrics = [
    { label: 'Projects', value: '14', sub: 'active', color: P.accent },
    { label: 'Deadlines', value: '3', sub: 'this week', color: P.accent2 },
    { label: 'On Track', value: '91%', sub: 'health', color: '#2E9E5B' },
  ];
  metrics.forEach((m, i) => {
    const x = 20 + i * 122;
    els.push(rect(x, 274, 112, 82, P.surface, { r: 12, shadow: { blur: 8, color: 'rgba(0,0,0,0.06)', x:0, y:2 } }));
    els.push(text(x + 12, 290, m.label, { size: 9, weight: '600', fill: P.muted, ls: 1, w: 90 }));
    els.push(text(x + 12, 308, m.value, { size: 26, weight: '800', fill: m.color, w: 90 }));
    els.push(text(x + 12, 340, m.sub, { size: 10, fill: P.muted, w: 90 }));
  });

  // ── ACTIVE PROJECTS ──
  els.push(text(20, 376, 'Active Projects', { size: 13, weight: '700', fill: P.text, w: 200 }));
  els.push(text(310, 376, 'See all →', { size: 11, fill: P.accent, w: 70 }));

  const projects = [
    { name: 'Solaris Brand', client: 'Solaris Co.', progress: 78, status: 'active', tag: 'Branding', daysLeft: 5 },
    { name: 'Neon Commerce', client: 'NeonDB Inc.', progress: 45, status: 'review', tag: 'Web', daysLeft: 12 },
    { name: 'Atlas Campaign', client: 'Atlas Group', progress: 92, status: 'active', tag: 'Motion', daysLeft: 2 },
    { name: 'Mortons Rebrand', client: 'Mortons Light', progress: 20, status: 'hold', tag: 'Brand', daysLeft: 28 },
  ];

  projects.forEach((p, i) => {
    const y = 402 + i * 88;
    els.push(rect(20, y, W - 40, 80, P.surface, { r: 12, shadow: { blur: 10, color: 'rgba(0,0,0,0.05)', x:0, y:3 } }));

    // Status dot
    const sc = STATUS[p.status];
    els.push(circle(44, y + 22, 6, sc));

    // Tag pill
    els.push(rect(60, y + 12, 54, 20, P.surface2, { r: 10 }));
    els.push(text(68, y + 16, p.tag, { size: 9, weight: '600', fill: P.muted, w: 40 }));

    // Days left pill
    const dcolor = p.daysLeft <= 5 ? P.accent2 : P.border;
    const dtextcolor = p.daysLeft <= 5 ? P.accent2 : P.muted;
    els.push(rect(W - 80, y + 12, 56, 20, 'transparent', { r: 10, stroke: dcolor, sw: 1 }));
    els.push(text(W - 75, y + 16, `${p.daysLeft}d left`, { size: 9, weight: '600', fill: dtextcolor, w: 48 }));

    // Project name
    els.push(text(20 + 12, y + 38, p.name, { size: 14, weight: '700', fill: P.text, w: 220 }));
    els.push(text(20 + 12, y + 56, p.client, { size: 11, fill: P.muted, w: 180 }));

    // Progress bar
    const barW = W - 40 - 24;
    els.push(rect(20 + 12, y + 66, barW, 4, P.surface2, { r: 2 }));
    els.push(rect(20 + 12, y + 66, barW * p.progress / 100, 4, sc, { r: 2 }));
  });

  // ── BOTTOM NAV ──
  els.push(rect(0, H - 80, W, 80, P.surface));
  els.push(line(0, H - 80, W, H - 80, P.border, 1));
  const navItems = [
    { label: 'Home', icon: '⌂', active: true },
    { label: 'Projects', icon: '◫', active: false },
    { label: 'Briefs', icon: '✎', active: false },
    { label: 'Pulse', icon: '◉', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 40 + i * 78;
    els.push(text(nx, H - 66, n.icon, { size: 18, fill: n.active ? P.accent : P.muted, w: 30, align: 'center' }));
    els.push(text(nx - 8, H - 44, n.label, { size: 9, weight: n.active ? '700' : '400', fill: n.active ? P.accent : P.muted, w: 46, align: 'center' }));
  });

  return { id: makeId(), name: 'Dashboard', elements: els };
}

// ──────────────────────────────────────────────────────────────────────────
//  SCREEN 2 — Projects Grid (editorial card layout)
// ──────────────────────────────────────────────────────────────────────────
function buildProjects() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Header
  els.push(text(20, 52, '9:41', { size: 15, weight: '600', fill: P.text }));
  els.push(text(20, 88, 'Projects', { size: 36, weight: '800', fill: P.text, w: 250 }));

  // Filter pills
  const filters = ['All', 'Active', 'Review', 'Hold', 'Done'];
  let fx = 20;
  filters.forEach((f, i) => {
    const w = f.length * 8 + 20;
    const isActive = i === 0;
    els.push(rect(fx, 138, w, 30, isActive ? P.text : P.surface2, { r: 15 }));
    els.push(text(fx + 10, 147, f, { size: 11, weight: '600', fill: isActive ? P.bg : P.muted, w: w - 20 }));
    fx += w + 8;
  });

  // Sort / view toggle
  els.push(text(W - 80, 147, '⊞  Grid', { size: 11, fill: P.accent, w: 70, weight: '600' }));

  // Project cards — 2 column editorial grid
  const projects = [
    { name: 'Solaris Brand System', client: 'Solaris Co.', progress: 78, status: 'active', tag: 'Branding', color: '#1B1BE0', daysLeft: 5 },
    { name: 'Neon Commerce', client: 'NeonDB Inc.', progress: 45, status: 'review', tag: 'Web Dev', color: '#E03030', daysLeft: 12 },
    { name: 'Atlas Campaign', client: 'Atlas Group', progress: 92, status: 'active', tag: 'Motion', color: '#2E9E5B', daysLeft: 2 },
    { name: 'Mortons Rebrand', client: 'Mortons Light', progress: 20, status: 'hold', tag: 'Branding', color: '#C8760A', daysLeft: 28 },
    { name: 'Haptic App UI', client: 'Haptic Labs', progress: 60, status: 'active', tag: 'Product', color: '#1B1BE0', daysLeft: 9 },
    { name: 'Silencio Campaign', client: 'Silencio ES', progress: 35, status: 'review', tag: 'Campaign', color: '#E03030', daysLeft: 18 },
  ];

  // Bold first card full-width (editorial asymmetry)
  const fp = projects[0];
  els.push(rect(20, 186, W - 40, 130, fp.color, { r: 16 }));
  // Big number in corner
  els.push(text(W - 70, 192, '78%', { size: 44, weight: '900', fill: 'rgba(255,255,255,0.15)', w: 80, align:'right' }));
  // Tag
  els.push(rect(32, 200, 58, 20, 'rgba(255,255,255,0.2)', { r: 10 }));
  els.push(text(40, 204, fp.tag, { size: 9, weight: '700', fill: '#fff', w: 44 }));
  // Name
  els.push(text(32, 228, fp.name, { size: 18, weight: '800', fill: '#fff', w: 250, lh: 1.1 }));
  els.push(text(32, 258, fp.client, { size: 11, fill: 'rgba(255,255,255,0.65)', w: 200 }));
  // Progress bar
  els.push(rect(32, 288, W - 72, 5, 'rgba(255,255,255,0.2)', { r: 3 }));
  els.push(rect(32, 288, (W - 72) * fp.progress / 100, 5, '#fff', { r: 3 }));
  // Days pill
  els.push(rect(W - 96, 298, 72, 20, 'rgba(255,255,255,0.15)', { r: 10 }));
  els.push(text(W - 90, 302, `${fp.daysLeft}d left`, { size: 9, weight: '600', fill: '#fff', w: 60 }));

  // 2-column grid for rest
  const cols = [20, 207];
  const colW = 165;
  projects.slice(1).forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = cols[col];
    const cy = 332 + row * 138;

    els.push(rect(cx, cy, colW, 128, P.surface, { r: 12, shadow: { blur: 8, color: 'rgba(0,0,0,0.06)', x:0, y:2 } }));

    // Color accent bar at top
    els.push(rect(cx, cy, colW, 4, p.color, { r: 2 }));

    // Tag
    els.push(rect(cx + 10, cy + 14, 50, 18, 'rgba(0,0,0,0.05)', { r: 9 }));
    els.push(text(cx + 16, cy + 18, p.tag, { size: 8, weight: '600', fill: P.muted, w: 40 }));

    // Name
    els.push(text(cx + 10, cy + 42, p.name, { size: 12, weight: '700', fill: P.text, w: colW - 20, lh: 1.2 }));
    els.push(text(cx + 10, cy + 74, p.client, { size: 9, fill: P.muted, w: colW - 20 }));

    // Progress
    els.push(rect(cx + 10, cy + 90, colW - 20, 3, P.surface2, { r: 2 }));
    els.push(rect(cx + 10, cy + 90, (colW - 20) * p.progress / 100, 3, p.color, { r: 2 }));
    els.push(text(cx + 10, cy + 100, `${p.progress}%`, { size: 9, fill: p.color, weight: '700', w: 40 }));
    els.push(text(cx + colW - 50, cy + 100, `${p.daysLeft}d`, { size: 9, fill: P.muted, w: 40 }));
  });

  // New project FAB
  els.push(circle(W - 36, H - 110, 24, P.text));
  els.push(text(W - 44, H - 119, '+', { size: 22, weight: '300', fill: P.bg, w: 18, align: 'center' }));

  // Nav
  els.push(rect(0, H - 80, W, 80, P.surface));
  els.push(line(0, H - 80, W, H - 80, P.border, 1));
  const navItems = ['Home','Projects','Briefs','Pulse'];
  const navIcons = ['⌂','◫','✎','◉'];
  navItems.forEach((n, i) => {
    const nx = 40 + i * 78;
    els.push(text(nx, H - 66, navIcons[i], { size: 18, fill: i===1 ? P.accent : P.muted, w:30, align:'center' }));
    els.push(text(nx - 8, H - 44, n, { size: 9, weight: i===1 ? '700':'400', fill: i===1 ? P.accent : P.muted, w:46, align:'center' }));
  });

  return { id: makeId(), name: 'Projects', elements: els };
}

// ──────────────────────────────────────────────────────────────────────────
//  SCREEN 3 — Project Detail (editorial timeline)
// ──────────────────────────────────────────────────────────────────────────
function buildProjectDetail() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Back + status
  els.push(text(20, 54, '← Projects', { size: 12, fill: P.accent, weight: '600', w: 120 }));
  els.push(rect(W - 86, 46, 70, 24, STATUS.active, { r: 12 }));
  els.push(text(W - 77, 52, '● ACTIVE', { size: 9, weight: '700', fill: '#fff', w: 60 }));

  // Project name — big editorial
  els.push(text(20, 84, 'Solaris\nBrand\nSystem', { size: 38, weight: '900', fill: P.text, w: 320, lh: 1.0 }));

  // Client + timeline summary
  els.push(text(20, 226, 'Solaris Co.  ·  Started Jan 14  ·  Due Apr 6', { size: 11, fill: P.muted, w: 340 }));

  // Big progress ring (simulated)
  els.push(circle(W - 56, 164, 40, P.surface2));
  els.push(text(W - 71, 152, '78%', { size: 18, weight: '900', fill: P.accent, w: 40, align: 'center' }));
  els.push(text(W - 71, 174, 'done', { size: 9, fill: P.muted, w: 40, align: 'center' }));

  // Divider
  els.push(line(20, 248, W - 20, 248, P.border, 1));

  // Team section
  els.push(text(20, 264, 'Team', { size: 11, weight: '700', fill: P.text, w: 80, ls: 1 }));
  const team = [
    { name: 'Alex L.', role: 'Creative Dir.', color: '#C87070' },
    { name: 'Mia S.', role: 'Designer', color: '#70A8C8' },
    { name: 'Jake K.', role: 'Developer', color: '#8870C8' },
  ];
  team.forEach((m, i) => {
    const y = 286 + i * 44;
    els.push(circle(40, y + 14, 16, m.color));
    els.push(text(34, y + 8, m.name.slice(0,2).toUpperCase(), { size: 9, weight:'800', fill:'#fff', w:22, align:'center' }));
    els.push(text(64, y + 6, m.name, { size: 13, weight: '600', fill: P.text, w: 200 }));
    els.push(text(64, y + 22, m.role, { size: 10, fill: P.muted, w: 200 }));
  });

  els.push(line(20, 420, W - 20, 420, P.border, 1));

  // Milestones timeline
  els.push(text(20, 436, 'Milestones', { size: 11, weight: '700', fill: P.text, w: 120, ls: 1 }));

  const milestones = [
    { name: 'Discovery & Research', date: 'Jan 14–21', done: true },
    { name: 'Brand Strategy', date: 'Jan 21–Feb 4', done: true },
    { name: 'Visual Identity', date: 'Feb 4–Mar 1', done: true },
    { name: 'Asset Production', date: 'Mar 1–Apr 1', done: false, current: true },
    { name: 'Client Handoff', date: 'Apr 1–6', done: false },
  ];

  milestones.forEach((m, i) => {
    const y = 460 + i * 52;
    const color = m.done ? STATUS.done : m.current ? STATUS.active : P.border;
    // Timeline dot
    els.push(circle(32, y + 10, 7, color));
    if (i < milestones.length - 1) {
      els.push(rect(31, y + 17, 2, 35, m.done ? STATUS.done : P.border));
    }
    if (m.current) {
      // Pulsing ring
      els.push(circle(32, y + 10, 12, 'transparent', { stroke: STATUS.active, sw: 1.5, opacity: 0.4 }));
    }
    els.push(text(50, y + 2, m.name, { size: 13, weight: m.current ? '700' : '500', fill: m.done ? P.muted : P.text, w: 240 }));
    els.push(text(50, y + 18, m.date, { size: 10, fill: P.muted, w: 200 }));
    if (m.current) {
      els.push(rect(W - 80, y + 2, 58, 20, STATUS.active, { r: 10 }));
      els.push(text(W - 74, y + 6, 'In Progress', { size: 8, weight: '700', fill: '#fff', w: 52 }));
    }
  });

  // Nav
  els.push(rect(0, H - 80, W, 80, P.surface));
  els.push(line(0, H - 80, W, H - 80, P.border, 1));
  ['⌂','◫','✎','◉'].forEach((icon, i) => {
    const nx = 40 + i * 78;
    els.push(text(nx, H - 66, icon, { size: 18, fill: i===1 ? P.accent : P.muted, w:30, align:'center' }));
    els.push(text(nx - 8, H - 44, ['Home','Projects','Briefs','Pulse'][i], { size: 9, weight: i===1 ? '700':'400', fill: i===1 ? P.accent : P.muted, w:46, align:'center' }));
  });

  return { id: makeId(), name: 'Project Detail', elements: els };
}

// ──────────────────────────────────────────────────────────────────────────
//  SCREEN 4 — Client Brief (editorial document)
// ──────────────────────────────────────────────────────────────────────────
function buildBrief() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Nav header
  els.push(text(20, 54, '← Solaris Brand', { size: 12, fill: P.accent, weight: '600', w: 160 }));
  els.push(text(20, 84, 'Client Brief', { size: 28, weight: '900', fill: P.text, w: 300 }));

  // Editorial accent line
  els.push(rect(20, 120, 40, 4, P.accent2));

  // Brief meta
  els.push(text(20, 136, 'BRIEF  /  SOLARIS CO.  /  V3.2', { size: 9, weight: '700', fill: P.muted, ls: 1.5, w: 300 }));

  // Brief content blocks
  const sections = [
    {
      heading: 'The Ask',
      body: 'Solaris Co. needs a complete brand overhaul for their 2026 product launch. Bold, modern, and distinctly premium — think editorial meets tech.',
    },
    {
      heading: 'Core Deliverables',
      bullets: ['Logo system + full guidelines', 'Typography + color system', 'Campaign assets (12 formats)', 'Motion design kit'],
    },
    {
      heading: 'Tone & Direction',
      body: 'Confident. Minimal. Warm. Reference: Locomotive agency aesthetic — bold display type with restrained color palette.',
    },
    {
      heading: 'Key Dates',
      bullets: ['Apr 1 — Asset production review', 'Apr 6 — Final client delivery', 'Apr 14 — Brand goes live'],
    },
  ];

  let sy = 162;
  sections.forEach((s, si) => {
    // Section heading with counter
    els.push(text(20, sy, `0${si+1}  ${s.heading.toUpperCase()}`, { size: 9, weight: '700', fill: P.accent, ls: 1, w: 300 }));
    sy += 22;

    if (s.body) {
      els.push(rect(20, sy, W - 40, 1, P.border));
      sy += 8;
      els.push(text(20, sy, s.body, { size: 13, fill: P.text, w: W - 40, lh: 1.5 }));
      sy += Math.ceil(s.body.length / 42) * 20 + 20;
    }
    if (s.bullets) {
      els.push(rect(20, sy, W - 40, 1, P.border));
      sy += 8;
      s.bullets.forEach(b => {
        els.push(text(20, sy, '—', { size: 12, weight: '700', fill: P.accent2, w: 14 }));
        els.push(text(38, sy, b, { size: 12, fill: P.text, w: W - 60, lh: 1.3 }));
        sy += 24;
      });
      sy += 8;
    }
  });

  // Approve CTA
  els.push(rect(20, H - 140, W - 40, 50, P.text, { r: 14 }));
  els.push(text(W/2 - 70, H - 122, '✓  Client Approved Brief', { size: 14, weight: '700', fill: P.bg, w: 180, align: 'center' }));

  // Nav
  els.push(rect(0, H - 80, W, 80, P.surface));
  els.push(line(0, H - 80, W, H - 80, P.border, 1));
  ['⌂','◫','✎','◉'].forEach((icon, i) => {
    const nx = 40 + i * 78;
    els.push(text(nx, H - 66, icon, { size: 18, fill: i===2 ? P.accent : P.muted, w:30, align:'center' }));
    els.push(text(nx - 8, H - 44, ['Home','Projects','Briefs','Pulse'][i], { size: 9, weight: i===2 ? '700':'400', fill: i===2 ? P.accent : P.muted, w:46, align:'center' }));
  });

  return { id: makeId(), name: 'Client Brief', elements: els };
}

// ──────────────────────────────────────────────────────────────────────────
//  SCREEN 5 — Studio Pulse (team activity / workload)
// ──────────────────────────────────────────────────────────────────────────
function buildPulse() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Header
  els.push(text(20, 52, '9:41', { size: 15, weight: '600', fill: P.text }));
  els.push(text(20, 88, 'Studio\nPulse', { size: 40, weight: '900', fill: P.text, w: 300, lh: 1.0 }));

  // Live indicator
  els.push(rect(20, 180, 64, 24, P.accent2, { r: 12 }));
  els.push(text(34, 186, '● LIVE', { size: 9, weight: '700', fill: '#fff', w: 50 }));
  els.push(text(98, 186, 'Updated 2m ago', { size: 10, fill: P.muted, w: 160 }));

  // Workload chart (horizontal bar chart — each team member)
  els.push(text(20, 220, 'Team Workload', { size: 11, weight: '700', fill: P.text, ls: 1, w: 200 }));

  const team = [
    { name: 'Alex L.', role: 'Creative Dir.', load: 88, color: '#C87070', projects: 4 },
    { name: 'Mia S.', role: 'Designer', load: 65, color: '#70A8C8', projects: 3 },
    { name: 'Jake K.', role: 'Developer', load: 42, color: '#8870C8', projects: 2 },
    { name: 'Sam T.', role: 'Copywriter', load: 55, color: '#70C890', projects: 3 },
  ];

  team.forEach((m, i) => {
    const y = 244 + i * 76;
    // Member row
    els.push(circle(36, y + 18, 16, m.color));
    els.push(text(30, y + 12, m.name.slice(0,2).toUpperCase(), { size: 9, weight:'800', fill:'#fff', w:22, align:'center' }));

    els.push(text(62, y + 6, m.name, { size: 13, weight:'700', fill: P.text, w: 180 }));
    els.push(text(62, y + 22, m.role, { size: 10, fill: P.muted, w: 180 }));
    els.push(text(W - 52, y + 6, `${m.load}%`, { size: 13, weight:'800', fill: m.load > 80 ? P.accent2 : P.text, w: 40, align:'right' }));
    els.push(text(W - 52, y + 22, `${m.projects} proj`, { size: 9, fill: P.muted, w: 40, align:'right' }));

    // Load bar
    const barW = W - 40;
    els.push(rect(20, y + 44, barW, 8, P.surface2, { r: 4 }));
    els.push(rect(20, y + 44, barW * m.load / 100, 8, m.color, { r: 4, opacity: 0.85 }));
  });

  // Recent activity feed
  els.push(line(20, 556, W - 20, 556, P.border, 1));
  els.push(text(20, 568, 'Recent Activity', { size: 11, weight:'700', fill: P.text, ls: 1, w: 200 }));

  const activity = [
    { who: 'AL', action: 'Uploaded final logo files', time: '2m ago', color: '#C87070' },
    { who: 'MS', action: 'Left comment on color palette', time: '18m ago', color: '#70A8C8' },
    { who: 'JK', action: 'Pushed Neon Commerce v0.4', time: '1h ago', color: '#8870C8' },
  ];

  activity.forEach((a, i) => {
    const y = 590 + i * 48;
    els.push(circle(32, y + 12, 12, a.color));
    els.push(text(28, y + 6, a.who, { size: 8, weight:'800', fill:'#fff', w:18, align:'center' }));
    els.push(text(52, y + 2, a.action, { size: 12, fill: P.text, w: 240 }));
    els.push(text(52, y + 18, a.time, { size: 10, fill: P.muted, w: 120 }));
  });

  // Nav
  els.push(rect(0, H - 80, W, 80, P.surface));
  els.push(line(0, H - 80, W, H - 80, P.border, 1));
  ['⌂','◫','✎','◉'].forEach((icon, i) => {
    const nx = 40 + i * 78;
    els.push(text(nx, H - 66, icon, { size: 18, fill: i===3 ? P.accent : P.muted, w:30, align:'center' }));
    els.push(text(nx - 8, H - 44, ['Home','Projects','Briefs','Pulse'][i], { size: 9, weight: i===3 ? '700':'400', fill: i===3 ? P.accent : P.muted, w:46, align:'center' }));
  });

  return { id: makeId(), name: 'Studio Pulse', elements: els };
}

// ──────────────────────────────────────────────────────────────────────────
//  BUILD PEN FILE
// ──────────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'FRAME — Studio OS',
    description: 'Light-themed creative studio project management OS. Inspired by Locomotive.ca (Godly.website) — bold editorial display typography, warm cream palette (#F6F4EF), bold indigo + editorial red accents. Grid-based project cards with editorial asymmetry.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['agency', 'studio', 'project-management', 'editorial', 'light', 'bold-typography', 'saas'],
  },
  canvas: {
    width: W,
    height: H,
    background: P.bg,
  },
  screens: [
    buildDashboard(),
    buildProjects(),
    buildProjectDetail(),
    buildBrief(),
    buildPulse(),
  ],
};

const outPath = path.join(__dirname, 'frame.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ frame.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Total elements: ${pen.screens.reduce((a, s) => a + s.elements.length, 0)}`);
