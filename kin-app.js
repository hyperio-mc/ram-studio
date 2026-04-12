// KIN — Relationship Memory, Amplified.
// Personal relationship intelligence app — light theme
// Inspired by folk.app (minimal.gallery SAAS) — clean white, Foundersgrotesk, airy layout
// + letta.com "memory-first" agent concept — persistent context, memory palace
// + lapa.ninja AI category surge — evidence-based AI for human connection
// Theme: LIGHT — #F5F4F1 warm off-white, #1A1817 near-black, #3A5CFF electric blue

const fs = require('fs');

const W = 390, H = 844;
const SLUG = 'kin';

// ── PALETTE ─────────────────────────────────────────────────────────────────
const BG      = '#F5F4F1';   // warm off-white (folk.app inspired parchment)
const SURF    = '#FFFFFF';   // pure white surface
const SURF2   = '#EEECEA';   // subtle tinted surface
const SURF3   = '#E5E2DE';   // deeper tint
const INK     = '#1A1817';   // near-black (folk.app rgba(3,2,0,0.89) approx)
const BLUE    = '#3A5CFF';   // electric blue — primary action
const BLUE2   = '#6B83FF';   // lighter blue
const BLUESOFT= 'rgba(58,92,255,0.08)'; // blue fill tint
const CORAL   = '#FF6B35';   // warm coral — alerts/attention
const GREEN   = '#2DB87C';   // success/positive
const MUTED   = 'rgba(26,24,23,0.45)';  // muted ink
const DIM     = 'rgba(26,24,23,0.18)';  // very dim
const DIVIDER = 'rgba(26,24,23,0.10)';  // hairline divider
const BLUEDIM = 'rgba(58,92,255,0.15)';

// ── HELPERS ─────────────────────────────────────────────────────────────────
function pen(id, name, bg, elements) {
  return { id, name, backgroundColor: bg, width: W, height: H, elements };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    opacity: opts.opacity ?? 1,
    cornerRadius: opts.r ?? 0,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1,
  };
}

function txt(content, x, y, size, color, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: size, color,
    fontWeight: opts.w ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAlign: opts.align ?? 'left',
    width: opts.width ?? 340,
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
  };
}

function line(x1, y1, x2, y2, color, strokeW = 1, opacity = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: strokeW, opacity };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1.5,
    opacity: opts.opacity ?? 1,
  };
}

// ── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar(dark = false) {
  const c = dark ? SURF : INK;
  return [
    txt('9:41', 20, 18, 12, c, { w: 600, ls: 0.3 }),
    txt('●●● ▲▲▲ ▮', 295, 18, 10, c, { opacity: 0.6, width: 80, align: 'right' }),
  ];
}

// ── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  // active: 0=home, 1=people, 2=pulse, 3=memory, 4=profile
  const tabs = [
    { label: 'Home',    icon: '⌂' },
    { label: 'People',  icon: '◎' },
    { label: 'Pulse',   icon: '∿' },
    { label: 'Memory',  icon: '◇' },
    { label: 'You',     icon: '○' },
  ];
  const tabW = W / 5;
  const navY = H - 80;
  const els = [
    rect(0, navY, W, 80, SURF, { r: 0 }),
    line(0, navY, W, navY, DIVIDER, 1),
  ];
  tabs.forEach((t, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    if (isActive) {
      els.push(rect(cx - 28, navY + 8, 56, 38, BLUESOFT, { r: 10 }));
    }
    els.push(txt(t.icon, cx - 10, navY + 13, 18, isActive ? BLUE : MUTED, { w: isActive ? 700 : 400, width: 20, align: 'center' }));
    els.push(txt(t.label, cx - 22, navY + 36, 9, isActive ? BLUE : MUTED, { w: isActive ? 700 : 400, ls: 0.3, width: 44, align: 'center' }));
  });
  return els;
}

// ── AVATAR ──────────────────────────────────────────────────────────────────
function avatar(cx, cy, r, initials, bg, textColor = SURF, opts = {}) {
  const els = [circle(cx, cy, r, bg, { stroke: opts.stroke, strokeWidth: opts.strokeWidth })];
  const fs = r * 0.52;
  els.push(txt(initials, cx - r, cy - fs * 0.6, fs, textColor, { w: 600, align: 'center', width: r * 2 }));
  return els;
}

// ── PILL TAG ────────────────────────────────────────────────────────────────
function pill(x, y, label, bg, color, opts = {}) {
  const w = opts.w ?? label.length * 7 + 18;
  const h = opts.h ?? 22;
  return [
    rect(x, y, w, h, bg, { r: h / 2 }),
    txt(label, x + 9, y + (h - 11) / 2, 10, color, { w: 600, ls: 0.3, width: w - 10 }),
  ];
}

// ── MEMORY THREAD (shared helper) ───────────────────────────────────────────
function memoryDot(x, cy, color) {
  return [
    circle(x + 6, cy, 5, color),
    line(x + 6, cy + 5, x + 6, cy + 28, DIM, 1),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — HOME DASHBOARD
// "Relationship health at a glance" — warm greeting, activity feed, nudges
// Folk.app-inspired: clean white cards, prominent trust metrics, air
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  // Header
  els.push(txt('Good morning', 20, 52, 13, MUTED, { w: 400, ls: 0.2 }));
  els.push(txt('Marcus', 20, 70, 28, INK, { w: 600, font: 'Inter' }));

  // Search bar
  els.push(rect(20, 108, W - 40, 40, SURF, { r: 10, stroke: DIVIDER, strokeWidth: 1 }));
  els.push(txt('○  Search people, topics…', 36, 119, 13, MUTED, { w: 400, width: 300 }));

  // "Reach out today" nudge section
  els.push(txt("REACH OUT TODAY", 20, 164, 10, MUTED, { w: 600, ls: 1.2 }));

  // Horizontal nudge cards (scroll hint)
  const nudges = [
    { name: 'Priya S.',     initials: 'PS', bg: '#B5D5FF', note: 'Last chat 3 wks ago', topic: 'her move to Berlin' },
    { name: 'Tom Okafor',   initials: 'TO', bg: '#FFD9C4', note: 'Birthday in 2 days', topic: 'his new café launch' },
    { name: 'Lea Fontaine', initials: 'LF', bg: '#C4F0D5', note: 'Mentioned job search', topic: 'product design roles' },
  ];

  nudges.forEach((n, i) => {
    const cardX = 20 + i * 160;
    const cardY = 182;
    const cardW = 148;
    const cardH = 120;
    if (cardX + cardW > W + 30) return; // clip hint
    els.push(rect(cardX, cardY, cardW, cardH, SURF, { r: 14, stroke: DIVIDER, strokeWidth: 1 }));
    els.push(...avatar(cardX + 24, cardY + 30, 18, n.initials, n.bg, INK));
    els.push(txt(n.name, cardX + 48, cardY + 18, 12, INK, { w: 600, width: 90 }));
    els.push(txt(n.note, cardX + 48, cardY + 34, 10, MUTED, { w: 400, width: 90 }));
    els.push(rect(cardX + 12, cardY + 58, cardW - 24, 38, BG, { r: 8 }));
    els.push(txt('Re: ' + n.topic, cardX + 20, cardY + 63, 10, INK, { w: 400, width: cardW - 34 }));
    els.push(txt('Draft message →', cardX + 20, cardY + 78, 10, BLUE, { w: 500, width: cardW - 34 }));
  });

  // "Your network" section header
  els.push(txt("YOUR NETWORK", 20, 320, 10, MUTED, { w: 600, ls: 1.2 }));

  // Relationship health metrics row (folk.app trust metric style)
  const metrics = [
    { val: '47', label: 'Active', color: GREEN },
    { val: '12', label: 'Fading', color: CORAL },
    { val: '94%', label: 'Memory', color: BLUE },
  ];
  const mW = (W - 40 - 20) / 3;
  metrics.forEach((m, i) => {
    const mx = 20 + i * (mW + 10);
    els.push(rect(mx, 336, mW, 64, SURF, { r: 12 }));
    els.push(txt(m.val, mx + 12, 344, 22, m.color, { w: 700, width: mW - 20 }));
    els.push(txt(m.label, mx + 12, 370, 10, MUTED, { w: 400, ls: 0.5 }));
  });

  // Recent activity feed
  els.push(txt("RECENT MOMENTS", 20, 418, 10, MUTED, { w: 600, ls: 1.2 }));

  const activities = [
    { initials: 'JR', bg: '#F5D5FF', name: 'Jamie Reyes', action: 'shared a project update with you', time: '2h', dot: BLUE },
    { initials: 'SK', bg: '#D5FFE8', name: 'Sofia Kim',   action: 'started a new role at Figma', time: '1d', dot: GREEN },
    { initials: 'AN', bg: '#FFE5D5', name: 'Alex Ng',     action: 'mentioned you in a post', time: '2d', dot: CORAL },
    { initials: 'MH', bg: '#D5E8FF', name: 'Mo Hassan',   action: 'replied to your message', time: '3d', dot: MUTED.replace('0.45', '0.5') },
  ];

  activities.forEach((a, i) => {
    const ay = 434 + i * 62;
    if (ay + 50 > H - 90) return;
    els.push(rect(20, ay, W - 40, 54, SURF, { r: 12, stroke: DIVIDER, strokeWidth: 0.5 }));
    els.push(...avatar(20 + 26, ay + 27, 18, a.initials, a.bg, INK));
    els.push(circle(20 + 38, ay + 9, 5, a.dot));
    els.push(txt(a.name, 60, ay + 13, 12, INK, { w: 600, width: 200 }));
    els.push(txt(a.action, 60, ay + 29, 11, MUTED, { w: 400, width: 220 }));
    els.push(txt(a.time, W - 44, ay + 19, 10, MUTED, { w: 400, width: 30, align: 'right' }));
  });

  els.push(...bottomNav(0));
  return pen('screen1', '01 — Home', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — PEOPLE LIST
// Contact roster with AI memory snippets + relationship strength bars
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  // Header
  els.push(txt('People', 20, 56, 26, INK, { w: 600 }));
  els.push(txt('59 connections', W - 40, 62, 12, MUTED, { align: 'right', width: 100 }));

  // Filter pills row
  const filters = ['All', 'Close', 'Work', 'Family', 'Dormant'];
  let fx = 20;
  filters.forEach((f, i) => {
    const isFirst = i === 0;
    const fw = f.length * 8 + 20;
    els.push(rect(fx, 96, fw, 28, isFirst ? INK : SURF2, { r: 14, stroke: isFirst ? 'none' : DIVIDER, strokeWidth: 1 }));
    els.push(txt(f, fx + 10, 104, 11, isFirst ? SURF : MUTED, { w: isFirst ? 600 : 400, width: fw - 10 }));
    fx += fw + 8;
  });

  // Alphabet index strip + list
  const people = [
    { initials: 'AL', bg: '#FFD5D5', name: 'Aria Lim',     role: 'Designer @ Notion',     strength: 88, memo: 'loves hiking in Yosemite', tag: 'Close', tagColor: BLUE },
    { initials: 'CB', bg: '#D5E8FF', name: 'Chris Bowen',  role: 'PM @ Linear',           strength: 62, memo: 'building side project in Rust', tag: 'Work', tagColor: GREEN },
    { initials: 'DM', bg: '#D5FFE8', name: 'Dana Moreau',  role: 'Founder @ Relay',       strength: 45, memo: 'Series A closing this month', tag: 'Work', tagColor: GREEN },
    { initials: 'EV', bg: '#FFF0D5', name: 'Elena Vasil.', role: 'Artist, Berlin',        strength: 30, memo: 'just had exhibition at MACRO', tag: 'Friend', tagColor: CORAL },
    { initials: 'JW', bg: '#F0D5FF', name: 'Jordan Wu',    role: 'Eng @ Anthropic',       strength: 75, memo: 'interested in agent memory', tag: 'Close', tagColor: BLUE },
    { initials: 'LB', bg: '#D5FFF0', name: 'Laura Bello',  role: 'Writer @ NYT',          strength: 55, memo: 'working on book about AI', tag: 'Friend', tagColor: CORAL },
    { initials: 'NT', bg: '#FFD5EE', name: 'Nico Tanner',  role: 'Coach, NYC',            strength: 20, memo: 'reached out in Jan 2024', tag: 'Dormant', tagColor: MUTED },
  ];

  const listY = 142;
  people.forEach((p, i) => {
    const py = listY + i * 72;
    if (py + 60 > H - 86) return;

    els.push(rect(20, py, W - 40, 64, SURF, { r: 14, stroke: DIVIDER, strokeWidth: 0.5 }));

    // Avatar
    els.push(...avatar(20 + 30, py + 32, 22, p.initials, p.bg, INK));

    // Name + role
    els.push(txt(p.name, 70, py + 12, 13, INK, { w: 600, width: 180 }));
    els.push(txt(p.role, 70, py + 29, 11, MUTED, { w: 400, width: 180 }));

    // Memory memo
    els.push(txt('› ' + p.memo, 70, py + 45, 10, MUTED, { w: 400, width: 200, opacity: 0.8 }));

    // Relationship strength bar
    const barW = 50;
    els.push(rect(W - 80, py + 20, barW, 4, SURF3, { r: 2 }));
    els.push(rect(W - 80, py + 20, Math.round(barW * p.strength / 100), 4,
      p.strength > 70 ? BLUE : p.strength > 40 ? GREEN : SURF3, { r: 2 }));

    // Tag pill
    const tagBg = p.tagColor === BLUE ? BLUESOFT :
                  p.tagColor === GREEN ? 'rgba(45,184,124,0.1)' :
                  p.tagColor === CORAL ? 'rgba(255,107,53,0.1)' : DIM;
    els.push(rect(W - 78, py + 30, 56, 18, tagBg, { r: 9 }));
    els.push(txt(p.tag, W - 72, py + 35, 9, p.tagColor, { w: 600, ls: 0.3, width: 44 }));
  });

  els.push(...bottomNav(1));
  return pen('screen2', '02 — People', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — PERSON DETAIL: Priya Singh
// Memory timeline, context threads, AI nudge — letta "memory palace" concept
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  // Back + action row
  els.push(txt('← People', 20, 55, 13, BLUE, { w: 500 }));
  els.push(txt('⋯', W - 36, 52, 18, MUTED, { w: 400, width: 20 }));

  // Profile header — large avatar, name, meta
  els.push(...avatar(W / 2, 126, 40, 'PS', '#B5D5FF', INK));
  els.push(txt('Priya Singh', 0, 178, 20, INK, { w: 600, align: 'center', width: W }));
  els.push(txt('Product Lead @ Figma · Berlin', 0, 202, 12, MUTED, { w: 400, align: 'center', width: W }));

  // Quick action buttons
  const actions = ['Message', 'Note', 'Remind'];
  const actionColors = [BLUE, SURF2, SURF2];
  const actionTextColors = [SURF, INK, INK];
  actions.forEach((a, i) => {
    const ax = 20 + i * ((W - 40 - 20) / 3 + 10);
    const aw = (W - 40 - 20) / 3;
    els.push(rect(ax, 226, aw, 36, actionColors[i], { r: 10 }));
    els.push(txt(a, ax, 235, 12, actionTextColors[i], { w: 600, align: 'center', width: aw }));
  });

  // AI memory summary card
  els.push(rect(20, 276, W - 40, 70, BLUESOFT, { r: 14, stroke: BLUEDIM, strokeWidth: 1 }));
  els.push(txt('◇ Kin Memory', 32, 284, 10, BLUE, { w: 700, ls: 0.5 }));
  els.push(txt('Priya is moving to Berlin for her new PM role. She\'s excited but stressed about apartment search. She loves climbing and mentioned wanting to find a gym there.', 32, 300, 11, INK, { w: 400, width: W - 72, opacity: 0.85 }));

  // Timeline section
  els.push(txt("MEMORY THREAD", 20, 360, 10, MUTED, { w: 600, ls: 1.2 }));

  const moments = [
    { date: 'Mar 28', channel: 'WhatsApp', note: 'Shared flat listings in Prenzlauer Berg', dot: BLUE },
    { date: 'Mar 12', channel: 'LinkedIn', note: 'Commented on her post about Figma AI launch', dot: GREEN },
    { date: 'Feb 24', channel: 'iMessage', note: 'Video call — discussed career shift to Berlin', dot: BLUE },
    { date: 'Jan 15', channel: 'Coffee', note: 'Met at Config SF. Talked for 2 hours about memory UX', dot: CORAL },
    { date: 'Nov 30', channel: 'Twitter', note: 'Liked her thread on AI product intuition', dot: DIM },
  ];

  const threadX = 20;
  moments.forEach((m, i) => {
    const my = 378 + i * 56;
    if (my + 44 > H - 86) return;

    // Dot + thread line
    els.push(circle(threadX + 10, my + 12, 5, m.dot));
    if (i < moments.length - 1) {
      els.push(line(threadX + 10, my + 17, threadX + 10, my + 56, DIVIDER, 1));
    }

    els.push(txt(m.date, threadX + 24, my + 6, 10, MUTED, { w: 600, ls: 0.3, width: 50 }));
    els.push(txt(m.channel, threadX + 76, my + 6, 10, MUTED, { w: 400, width: 80 }));
    els.push(txt(m.note, threadX + 24, my + 22, 12, INK, { w: 400, width: W - 64, opacity: 0.88 }));
    els.push(line(threadX + 24, my + 42, W - 20, my + 42, DIVIDER, 0.5));
  });

  els.push(...bottomNav(1));
  return pen('screen3', '03 — Priya Detail', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — MEMORY PALACE
// letta.com concept: visualize your AI relationship memory as topic clusters
// Light mode with color-coded topic nodes — avant-garde but readable
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  els.push(txt('Memory', 20, 56, 26, INK, { w: 600 }));
  els.push(txt('Palace', 100, 56, 26, BLUE, { w: 600 }));
  els.push(txt('AI-organized themes across all your relationships', 20, 88, 12, MUTED, { w: 400, width: W - 40 }));

  // Topic cluster nodes — organic positioning
  // Central: "Design" (your dominant topic)
  const nodes = [
    { x: 195, y: 220, r: 52, label: 'Design', count: '34 convos', bg: BLUESOFT, color: BLUE, border: BLUEDIM },
    { x: 95,  y: 185, r: 35, label: 'Travel', count: '18',       bg: 'rgba(255,107,53,0.08)', color: CORAL, border: 'rgba(255,107,53,0.2)' },
    { x: 310, y: 195, r: 38, label: 'Career', count: '22',       bg: 'rgba(45,184,124,0.08)', color: GREEN, border: 'rgba(45,184,124,0.2)' },
    { x: 135, y: 310, r: 30, label: 'AI',     count: '16',       bg: 'rgba(107,131,255,0.1)', color: BLUE2, border: 'rgba(107,131,255,0.2)' },
    { x: 280, y: 310, r: 26, label: 'Health', count: '11',       bg: 'rgba(255,180,53,0.1)', color: '#CC8800', border: 'rgba(255,180,53,0.25)' },
    { x: 80,  y: 360, r: 22, label: 'Food',   count: '9',        bg: DIM, color: MUTED, border: DIVIDER },
    { x: 335, y: 355, r: 20, label: 'Books',  count: '7',        bg: 'rgba(180,107,255,0.1)', color: '#8B5CF6', border: 'rgba(180,107,255,0.2)' },
  ];

  // Draw connection lines between related nodes
  const connections = [[0,1],[0,2],[0,3],[1,4],[2,3],[3,6],[1,5]];
  connections.forEach(([a, b]) => {
    els.push(line(nodes[a].x, nodes[a].y, nodes[b].x, nodes[b].y, DIVIDER, 1.5, 0.6));
  });

  // Draw nodes
  nodes.forEach(n => {
    els.push(circle(n.x, n.y, n.r, n.bg, { stroke: n.border, strokeWidth: 1.5 }));
    els.push(txt(n.label, n.x - n.r, n.y - 8, n.r > 40 ? 14 : n.r > 30 ? 12 : 11, n.color, { w: 700, align: 'center', width: n.r * 2 }));
    if (n.r > 30) {
      els.push(txt(n.count, n.x - n.r, n.y + 8, 9, n.color, { w: 400, align: 'center', width: n.r * 2, opacity: 0.7 }));
    }
  });

  // Avatar ring — people connected to "Design" topic
  const avatarPeople = [
    { initials: 'PS', bg: '#B5D5FF', angle: 0 },
    { initials: 'JW', bg: '#F0D5FF', angle: 72 },
    { initials: 'CB', bg: '#D5E8FF', angle: 144 },
    { initials: 'LB', bg: '#D5FFF0', angle: 216 },
    { initials: 'AL', bg: '#FFD5D5', angle: 288 },
  ];
  const ring = 78;
  avatarPeople.forEach(ap => {
    const rad = (ap.angle * Math.PI) / 180;
    const ax = 195 + Math.cos(rad) * ring;
    const ay = 220 + Math.sin(rad) * ring;
    els.push(...avatar(ax, ay, 12, ap.initials, ap.bg, INK));
  });

  // Active topic breakdown card
  els.push(rect(20, 418, W - 40, 130, SURF, { r: 16, stroke: DIVIDER, strokeWidth: 1 }));
  els.push(txt('Design — Most active topic', 32, 430, 13, INK, { w: 600, width: W - 80 }));
  els.push(txt('Across 12 people · Updated 2h ago', 32, 448, 11, MUTED, { w: 400, width: W - 80 }));

  const subtopics = [
    { label: 'AI interfaces', pct: 72, color: BLUE },
    { label: 'Typography',   pct: 55, color: BLUE2 },
    { label: 'Motion',       pct: 38, color: CORAL },
  ];
  subtopics.forEach((s, i) => {
    const sy = 470 + i * 24;
    els.push(txt(s.label, 32, sy, 11, INK, { w: 400, width: 110 }));
    els.push(rect(148, sy + 1, 160, 8, SURF2, { r: 4 }));
    els.push(rect(148, sy + 1, Math.round(160 * s.pct / 100), 8, s.color, { r: 4 }));
    els.push(txt(s.pct + '%', 316, sy, 10, MUTED, { w: 500, width: 30, align: 'right' }));
  });

  // View all topics
  els.push(txt('View all 24 topics →', 20, 564, 12, BLUE, { w: 500 }));

  els.push(...bottomNav(3));
  return pen('screen4', '04 — Memory Palace', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — COMPOSE WITH AI CONTEXT
// AI drafts a message using relationship memory — letta-inspired persistent context
// Clean light compose sheet
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  // Header
  els.push(txt('✕', 20, 55, 16, MUTED, { w: 400 }));
  els.push(txt('New Message', 0, 55, 16, INK, { w: 600, align: 'center', width: W }));
  els.push(rect(W - 64, 50, 48, 28, BLUE, { r: 8 }));
  els.push(txt('Send', W - 64, 58, 12, SURF, { w: 600, width: 48, align: 'center' }));

  // To field
  els.push(line(20, 96, W - 20, 96, DIVIDER));
  els.push(txt('To', 20, 106, 12, MUTED, { w: 400 }));
  // Recipient tag
  els.push(rect(46, 102, 90, 24, BLUESOFT, { r: 12 }));
  els.push(...avatar(46 + 12, 102 + 12, 8, 'PS', '#B5D5FF', INK));
  els.push(txt('Priya Singh', 46 + 24, 107, 11, BLUE, { w: 600, width: 60 }));
  els.push(line(20, 134, W - 20, 134, DIVIDER));

  // Via field
  els.push(txt('Via', 20, 145, 12, MUTED, { w: 400 }));
  els.push(txt('WhatsApp  ↓', 50, 145, 12, INK, { w: 500 }));
  els.push(line(20, 163, W - 20, 163, DIVIDER));

  // AI Context card
  els.push(rect(20, 174, W - 40, 84, 'rgba(45,184,124,0.07)', { r: 14, stroke: 'rgba(45,184,124,0.2)', strokeWidth: 1 }));
  els.push(txt('◇ Memory context loaded', 32, 184, 10, GREEN, { w: 700, ls: 0.4 }));
  els.push(txt('Priya is moving to Berlin next month. She mentioned being nervous about finding a climbing gym there. She hasn\'t heard from you in 3 weeks.', 32, 200, 11, INK, { w: 400, width: W - 72, opacity: 0.85 }));
  els.push(txt('Confidence: High  ·  Based on 8 moments', 32, 244, 10, GREEN, { w: 400, opacity: 0.7 }));

  // Draft message (AI generated)
  els.push(rect(20, 272, W - 40, 200, SURF, { r: 16, stroke: DIVIDER, strokeWidth: 1 }));
  els.push(txt('AI Draft', 32, 282, 10, BLUE, { w: 700, ls: 0.5 }));
  els.push(line(32, 296, W - 32, 296, DIVIDER, 0.5));

  const draftText = 'Hey Priya! Thinking of you as the Berlin move gets closer 🙌\n\nAny luck finding a flat yet? Also — I came across a bouldering gym in Prenzlauer Berg that looked really solid, figured I\'d send it your way.\n\nSo excited for this chapter for you. Let me know if you need anything.';

  draftText.split('\n').forEach((line_txt, i) => {
    if (line_txt === '') {
      return;
    }
    els.push(txt(line_txt, 32, 308 + i * 18, 12, INK, { w: 400, width: W - 72, opacity: 0.9 }));
  });

  // Draft controls
  els.push(line(20, 482, W - 20, 482, DIVIDER));
  els.push(txt('✦ Regenerate', 32, 492, 12, BLUE, { w: 500 }));
  els.push(txt('Edit tone  ↓', 160, 492, 12, MUTED, { w: 400 }));
  els.push(txt('Shorten', 262, 492, 12, MUTED, { w: 400 }));

  // Tone pills
  const tones = ['Warm', 'Casual', 'Brief', 'Formal'];
  let toneX = 20;
  tones.forEach((t, i) => {
    const tw = t.length * 8 + 20;
    const active = i === 0;
    els.push(rect(toneX, 514, tw, 26, active ? INK : SURF2, { r: 13 }));
    els.push(txt(t, toneX + tw / 2 - 10, 521, 11, active ? SURF : MUTED, { w: active ? 600 : 400, width: 60 }));
    toneX += tw + 8;
  });

  // Keyboard suggestion strip
  els.push(rect(0, H - 140, W, 140, SURF2));
  els.push(line(0, H - 140, W, H - 140, DIVIDER));
  els.push(txt('climbing gym', 20, H - 124, 12, INK, { w: 400 }));
  els.push(txt('·', W / 2 - 4, H - 120, 20, MUTED));
  els.push(txt('Berlin', W / 2 + 14, H - 124, 12, INK, { w: 400 }));
  els.push(txt('·', W - 80, H - 120, 20, MUTED));
  els.push(txt('exciting', W - 68, H - 124, 12, INK, { w: 400 }));

  return pen('screen5', '05 — Compose AI', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — PULSE INSIGHTS
// Relationship analytics — folk.app metric style meets data storytelling
// Light, clean charts + AI observations
// ─────────────────────────────────────────────────────────────────────────────
function screen6() {
  const els = [rect(0, 0, W, H, BG)];
  els.push(...statusBar());

  els.push(txt('Pulse', 20, 56, 26, INK, { w: 600 }));
  els.push(txt('March 2025', W - 40, 62, 12, MUTED, { align: 'right', width: 90 }));

  // Period selector
  const periods = ['Week', 'Month', 'Quarter', 'Year'];
  let px = 20;
  periods.forEach((p, i) => {
    const pw = p.length * 8 + 20;
    const active = i === 1;
    els.push(rect(px, 90, pw, 26, active ? INK : 'transparent', { r: 13 }));
    els.push(txt(p, px + pw / 2 - 10, 97, 11, active ? SURF : MUTED, { w: active ? 600 : 400, width: 60 }));
    px += pw + 6;
  });

  // Big metric hero — "Connection Score"
  els.push(rect(20, 128, W - 40, 100, SURF, { r: 16, stroke: DIVIDER, strokeWidth: 1 }));
  els.push(txt('CONNECTION SCORE', 32, 140, 10, MUTED, { w: 600, ls: 1.2 }));
  els.push(txt('84', 32, 156, 42, BLUE, { w: 700 }));
  els.push(txt('/100', 82, 174, 18, MUTED, { w: 400 }));
  els.push(txt('↑ +7 from Feb', 32, 204, 11, GREEN, { w: 500 }));

  // Score ring (simplified arc representation)
  const ringCX = W - 72, ringCY = 178, ringR = 34;
  els.push(circle(ringCX, ringCY, ringR, 'transparent', { stroke: SURF3, strokeWidth: 6 }));
  // Arc approximation with multiple small dots
  const arcFill = 0.84;
  for (let a = -90; a < -90 + 360 * arcFill; a += 12) {
    const rad = (a * Math.PI) / 180;
    const ax = ringCX + Math.cos(rad) * ringR;
    const ay = ringCY + Math.sin(rad) * ringR;
    els.push(circle(ax, ay, 3, BLUE));
  }

  // 3-column metrics (folk.app trust metric style)
  const smallMetrics = [
    { label: 'Interactions', val: '38',  sub: 'this month',  color: INK },
    { label: 'New touches',  val: '12',  sub: '↑ from 8',    color: GREEN },
    { label: 'Avg quality',  val: '4.2', sub: '/ 5.0 AI',    color: BLUE },
  ];
  const smW = (W - 40 - 20) / 3;
  smallMetrics.forEach((m, i) => {
    const mx = 20 + i * (smW + 10);
    els.push(rect(mx, 242, smW, 68, SURF, { r: 12 }));
    els.push(txt(m.val, mx + 10, 252, 20, m.color, { w: 700, width: smW - 12 }));
    els.push(txt(m.label, mx + 10, 276, 10, INK, { w: 500, width: smW - 12 }));
    els.push(txt(m.sub, mx + 10, 290, 9, MUTED, { w: 400, width: smW - 12 }));
  });

  // Weekly activity chart (bar chart)
  els.push(txt("WEEKLY ACTIVITY", 20, 326, 10, MUTED, { w: 600, ls: 1.2 }));
  els.push(rect(20, 342, W - 40, 100, SURF, { r: 14 }));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [4, 7, 3, 9, 6, 2, 5];
  const maxVal = 10;
  const chartH = 70;
  const barW = 20;
  const chartLeft = 32;
  const chartGap = (W - 40 - 32 - barW * 7) / 6;
  days.forEach((d, i) => {
    const bx = chartLeft + i * (barW + chartGap);
    const bh = Math.round((vals[i] / maxVal) * chartH);
    const by = 342 + 16 + (chartH - bh);
    const isMax = vals[i] === Math.max(...vals);
    els.push(rect(bx, by, barW, bh, isMax ? BLUE : BLUESOFT, { r: 4 }));
    els.push(txt(d, bx, 342 + 92, 9, MUTED, { w: 400, width: barW, align: 'center' }));
  });

  // AI observation card
  els.push(rect(20, 456, W - 40, 80, BLUESOFT, { r: 14, stroke: BLUEDIM, strokeWidth: 1 }));
  els.push(txt('◇ AI Observation', 32, 466, 10, BLUE, { w: 700, ls: 0.5 }));
  els.push(txt('You\'re strongest with "Work" contacts but your "Close" friends are drifting. 3 close connections haven\'t heard from you in 30+ days.', 32, 482, 11, INK, { w: 400, width: W - 72, opacity: 0.88 }));
  els.push(txt('View at-risk connections →', 32, 524, 11, BLUE, { w: 500 }));

  els.push(...bottomNav(2));
  return pen('screen6', '06 — Pulse', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE + WRITE
// ─────────────────────────────────────────────────────────────────────────────
const design = {
  version: '2.8',
  name: 'KIN — Relationship Memory, Amplified.',
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
    screen6(),
  ],
};

fs.writeFileSync(`${SLUG}.pen`, JSON.stringify(design, null, 2));
console.log(`✓ Written ${SLUG}.pen (${design.screens.length} screens)`);
console.log(`  Screens: ${design.screens.map(s => s.name).join(', ')}`);
