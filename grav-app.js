'use strict';
/**
 * GRAV — AI Relationship Intelligence
 * Dark theme. Inspired by Reflect.app's cosmic deep navy palette (#030014)
 * from Godly.website — bento grid, glassmorphic cards, gradient text aesthetic.
 * Heartbeat design — RAM Design Studio
 */
const fs = require('fs');
const path = require('path');

const SLUG = 'grav';
const W = 390, H = 844;

// ─── Palette ───────────────────────────────────────────────────────────────
const BG      = '#030014';
const SURF    = '#0A0520';
const CARD    = '#110830';
const CARD2   = '#150C3A';
const BORDER  = 'rgba(167,139,250,0.15)';
const ACC     = '#A78BFA';   // violet
const ACC2    = '#38BDF8';   // sky blue
const ACC3    = '#F472B6';   // pink accent
const TEXT    = '#F1F5F9';
const MUTED   = 'rgba(148,163,184,0.5)';
const DIM     = 'rgba(148,163,184,0.3)';
const SUCCESS = '#34D399';

// ─── Primitives ────────────────────────────────────────────────────────────
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
    letterSpacing: opts.ls ?? '-0.02em',
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
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

function pill(x, y, w, h, fill, opts = {}) {
  return rect(x, y, w, h, fill, { rx: h / 2, ...opts });
}

// ─── Reusable Components ────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 28, '9:41', 14, TEXT, { fw: 600, ls: '0em' }));
  // signal dots
  for (let i = 0; i < 3; i++) {
    els.push(rect(W - 80 + i * 8, 18, 4, 8 + i * 3, TEXT, { rx: 1, opacity: 0.8 }));
  }
  els.push(rect(W - 56, 19, 22, 11, 'none', { rx: 3, stroke: TEXT, sw: 1, opacity: 0.6 }));
  els.push(rect(W - 54, 21, 16, 7, TEXT, { rx: 2, opacity: 0.9 }));
  els.push(circle(W - 30, 24, 5, 'none', { stroke: TEXT, sw: 1, opacity: 0.6 }));
  els.push(circle(W - 17, 24, 3, TEXT, { opacity: 0.7 }));
}

function navBar(els, active = 0) {
  const labels = ['Home', 'Network', 'Discover', 'Insights', 'You'];
  const icons  = ['◎', '⬡', '✦', '◈', '○'];
  els.push(rect(0, H - 80, W, 80, SURF, { opacity: 0.98 }));
  els.push(line(0, H - 80, W, H - 80, BORDER, { sw: 0.5 }));
  labels.forEach((label, i) => {
    const x = 20 + i * 70 + 15;
    const isActive = i === active;
    const c = isActive ? ACC : MUTED;
    els.push(text(x, H - 52, icons[i], 18, c, { anchor: 'middle', ls: '0' }));
    els.push(text(x, H - 32, label, 9, c, { anchor: 'middle', ls: '0.01em', opacity: isActive ? 1 : 0.7 }));
    if (isActive) {
      els.push(pill(x - 14, H - 73, 28, 3, ACC, { opacity: 0.7 }));
    }
  });
}

function cosmicParticle(cx, cy, r, opacity = 0.4) {
  return circle(cx, cy, r, ACC, { opacity });
}

// ─── Screen 1: Dashboard / Gravity Field ────────────────────────────────────
function screen1() {
  const els = [];

  // Background + ambient glow
  els.push(rect(0, 0, W, H, BG));
  // Cosmic glow orb behind content
  els.push(circle(195, 280, 180, ACC, { opacity: 0.04 }));
  els.push(circle(195, 280, 120, ACC, { opacity: 0.05 }));
  els.push(circle(195, 280, 60, ACC2, { opacity: 0.06 }));

  // Particle field
  const particles = [
    [30, 120, 1.5, 0.3], [320, 90, 2, 0.25], [60, 200, 1, 0.2],
    [340, 180, 1.5, 0.3], [15, 320, 2, 0.2], [360, 340, 1, 0.25],
    [80, 450, 1.5, 0.2], [310, 420, 2, 0.3], [350, 500, 1, 0.2],
    [25, 550, 1.5, 0.25], [370, 150, 1, 0.2], [45, 700, 2, 0.2],
  ];
  particles.forEach(([cx, cy, r, op]) => els.push(cosmicParticle(cx, cy, r, op)));

  statusBar(els);

  // Header
  els.push(text(20, 76, 'Good morning,', 13, MUTED, { ls: '0' }));
  els.push(text(20, 97, 'Alex Chen', 22, TEXT, { fw: 700, ls: '-0.04em' }));
  // Avatar
  els.push(circle(W - 36, 82, 22, CARD2));
  els.push(circle(W - 36, 82, 22, 'none', { stroke: ACC, sw: 1.5, opacity: 0.6 }));
  els.push(text(W - 36, 87, 'AC', 12, ACC, { anchor: 'middle', fw: 700 }));

  // Pull Score Hero Card
  els.push(rect(16, 112, W - 32, 110, CARD, { rx: 20 }));
  els.push(rect(16, 112, W - 32, 110, 'none', { rx: 20, stroke: BORDER, sw: 1 }));
  // Glow effect on card
  els.push(circle(195, 167, 60, ACC, { opacity: 0.06 }));
  els.push(text(195, 148, 'GRAVITY SCORE', 9, ACC, { anchor: 'middle', ls: '0.12em', fw: 600 }));
  els.push(text(195, 190, '847', 52, TEXT, { anchor: 'middle', fw: 800, ls: '-0.05em' }));
  els.push(text(195, 212, '↑ 23 pts this week', 11, SUCCESS, { anchor: 'middle', ls: '0' }));
  // Score bar
  els.push(rect(40, 220, W - 80, 4, CARD2, { rx: 2 }));
  els.push(rect(40, 220, (W - 80) * 0.847, 4, ACC, { rx: 2 }));

  // Quick Stats Row
  const stats = [
    { label: 'Connections', value: '312', sub: 'active', x: 16 },
    { label: 'Signals', value: '18', sub: 'new today', x: 143 },
    { label: 'Introductions', value: '5', sub: 'pending', x: 268 },
  ];
  stats.forEach((s, i) => {
    const w = i === 2 ? W - 16 - s.x : 111;
    els.push(rect(s.x, 236, w, 72, CARD, { rx: 14 }));
    els.push(rect(s.x, 236, w, 72, 'none', { rx: 14, stroke: BORDER, sw: 0.5 }));
    els.push(text(s.x + (w / 2), 263, s.value, 22, i === 0 ? ACC : i === 1 ? ACC2 : ACC3, { anchor: 'middle', fw: 800, ls: '-0.03em' }));
    els.push(text(s.x + (w / 2), 279, s.label, 9, MUTED, { anchor: 'middle', ls: '0' }));
    els.push(text(s.x + (w / 2), 294, s.sub, 8, DIM, { anchor: 'middle', ls: '0' }));
  });

  // Section: Top Orbiting Contacts
  els.push(text(20, 331, 'Top Gravitational Pulls', 14, TEXT, { fw: 700, ls: '-0.02em' }));
  els.push(text(W - 20, 331, 'See all', 12, ACC, { anchor: 'end', ls: '0' }));

  const contacts = [
    { name: 'Sara Okafor', role: 'Head of Product @ Stripe', pull: 94, delta: '+2', avatar: 'SO', ac: ACC },
    { name: 'James Liu', role: 'Partner @ a16z', pull: 89, delta: '+5', avatar: 'JL', ac: ACC2 },
    { name: 'Mia Torres', role: 'Founder @ Vercel', pull: 82, delta: '-1', avatar: 'MT', ac: ACC3 },
  ];
  contacts.forEach((c, i) => {
    const y = 344 + i * 78;
    els.push(rect(16, y, W - 32, 70, CARD, { rx: 14 }));
    els.push(rect(16, y, W - 32, 70, 'none', { rx: 14, stroke: BORDER, sw: 0.5 }));
    // Avatar
    els.push(circle(50, y + 35, 20, CARD2));
    els.push(circle(50, y + 35, 20, 'none', { stroke: c.ac, sw: 1.5, opacity: 0.7 }));
    els.push(text(50, y + 40, c.avatar, 11, c.ac, { anchor: 'middle', fw: 700 }));
    // Name + role
    els.push(text(80, y + 27, c.name, 14, TEXT, { fw: 600, ls: '-0.02em' }));
    els.push(text(80, y + 44, c.role, 10, MUTED, { ls: '0' }));
    // Pull score
    els.push(text(W - 20, y + 28, `${c.pull}`, 16, c.ac, { anchor: 'end', fw: 700 }));
    els.push(text(W - 20, y + 46, c.delta, 10, c.delta.startsWith('+') ? SUCCESS : '#F87171', { anchor: 'end', ls: '0' }));
    // Orbit line
    els.push(rect(80, y + 54, (W - 100) * (c.pull / 100), 2, c.ac, { rx: 1, opacity: 0.4 }));
  });

  navBar(els, 0);

  const svg = renderSVG(els);
  return { name: 'Dashboard', svg, elements: els };
}

// ─── Screen 2: Network / Orbital View ────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(circle(195, 420, 200, ACC, { opacity: 0.025 }));

  statusBar(els);

  // Header
  els.push(text(20, 76, 'Your Network', 22, TEXT, { fw: 800, ls: '-0.04em' }));
  els.push(text(20, 97, '312 gravitational connections', 12, MUTED, { ls: '0' }));

  // Search bar
  els.push(rect(16, 110, W - 32, 44, CARD, { rx: 22 }));
  els.push(rect(16, 110, W - 32, 44, 'none', { rx: 22, stroke: BORDER, sw: 1 }));
  els.push(text(46, 136, '⌕  Search your network...', 13, DIM, { ls: '0' }));

  // Filter pills
  const filters = ['All', 'Investors', 'Founders', 'Eng', 'Design'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 8 + 20;
    els.push(pill(fx, 166, fw, 28, i === 0 ? ACC : CARD2, { opacity: i === 0 ? 1 : 0.8 }));
    els.push(text(fx + fw / 2, 184, f, 11, i === 0 ? BG : MUTED, { anchor: 'middle', fw: i === 0 ? 700 : 400, ls: '0' }));
    fx += fw + 8;
  });

  // Connection list
  const people = [
    { name: 'Sara Okafor', role: 'Stripe · Head of Product', pull: 94, tags: ['VC', 'Fintech'], avatar: 'SO', ac: ACC, last: '2h ago' },
    { name: 'James Liu', role: 'a16z · Partner', pull: 89, tags: ['Investor'], avatar: 'JL', ac: ACC2, last: '1d ago' },
    { name: 'Mia Torres', role: 'Vercel · Founder', pull: 82, tags: ['Dev', 'Infra'], avatar: 'MT', ac: ACC3, last: '3d ago' },
    { name: 'Ravi Patel', role: 'Notion · PM Lead', pull: 78, tags: ['Product'], avatar: 'RP', ac: SUCCESS, last: '5d ago' },
    { name: 'Chen Wei', role: 'OpenAI · Research', pull: 71, tags: ['AI', 'ML'], avatar: 'CW', ac: '#FBBF24', last: '1w ago' },
  ];

  people.forEach((p, i) => {
    const y = 208 + i * 88;
    els.push(rect(16, y, W - 32, 80, CARD, { rx: 16 }));
    els.push(rect(16, y, W - 32, 80, 'none', { rx: 16, stroke: BORDER, sw: 0.5 }));
    // Strength indicator left bar
    els.push(rect(16, y + 8, 3, 64, p.ac, { rx: 1.5, opacity: 0.8 }));
    // Avatar
    els.push(circle(56, y + 40, 22, CARD2));
    els.push(circle(56, y + 40, 22, 'none', { stroke: p.ac, sw: 2, opacity: 0.6 }));
    els.push(text(56, y + 45, p.avatar, 12, p.ac, { anchor: 'middle', fw: 700 }));
    // Info
    els.push(text(88, y + 28, p.name, 15, TEXT, { fw: 700, ls: '-0.02em' }));
    els.push(text(88, y + 45, p.role, 10, MUTED, { ls: '0' }));
    // Tags
    let tx = 88;
    p.tags.forEach(tag => {
      const tw = tag.length * 6 + 12;
      els.push(pill(tx, y + 56, tw, 16, CARD2));
      els.push(text(tx + tw / 2, y + 68, tag, 8, p.ac, { anchor: 'middle', fw: 600, ls: '0.02em' }));
      tx += tw + 6;
    });
    // Pull score + last seen
    els.push(text(W - 20, y + 30, `${p.pull}%`, 14, p.ac, { anchor: 'end', fw: 700 }));
    els.push(text(W - 20, y + 48, p.last, 9, DIM, { anchor: 'end', ls: '0' }));
  });

  navBar(els, 1);
  return { name: 'Network', svg: renderSVG(els), elements: els };
}

// ─── Screen 3: Discover ──────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  // Top gradient orb
  els.push(circle(195, 200, 220, ACC2, { opacity: 0.03 }));
  els.push(circle(195, 200, 100, ACC, { opacity: 0.04 }));

  statusBar(els);

  els.push(text(20, 76, 'Discover', 22, TEXT, { fw: 800, ls: '-0.04em' }));
  els.push(text(20, 96, 'AI-matched connections for you', 12, MUTED, { ls: '0' }));

  // Featured match card (hero)
  els.push(rect(16, 110, W - 32, 160, CARD, { rx: 20 }));
  els.push(rect(16, 110, W - 32, 160, 'none', { rx: 20, stroke: ACC, sw: 1, opacity: 0.3 }));
  // Gradient background effect
  els.push(circle(80, 160, 60, ACC, { opacity: 0.08 }));
  els.push(circle(310, 200, 80, ACC2, { opacity: 0.06 }));
  // Badge
  els.push(pill(24, 118, 84, 22, ACC, { opacity: 0.15 }));
  els.push(text(66, 132, '✦  Top Match', 10, ACC, { anchor: 'middle', fw: 600, ls: '0.04em' }));
  // Avatar
  els.push(circle(52, 178, 28, CARD2));
  els.push(circle(52, 178, 28, 'none', { stroke: ACC, sw: 2 }));
  els.push(text(52, 184, 'NA', 14, ACC, { anchor: 'middle', fw: 700 }));
  // Name + info
  els.push(text(92, 162, 'Nina Arora', 18, TEXT, { fw: 800, ls: '-0.03em' }));
  els.push(text(92, 180, 'CTO @ Anthropic', 12, MUTED, { ls: '0' }));
  // Match score
  els.push(text(W - 24, 162, '97%', 20, ACC, { anchor: 'end', fw: 800 }));
  els.push(text(W - 24, 180, 'match', 10, MUTED, { anchor: 'end', ls: '0' }));
  // Why matched
  els.push(text(92, 200, '3 mutual connections · AI, ML, Infra interests', 10, DIM, { ls: '0' }));
  // Action buttons
  els.push(rect(24, 220, 100, 36, ACC, { rx: 18 }));
  els.push(text(74, 242, 'Connect', 12, BG, { anchor: 'middle', fw: 700, ls: '0' }));
  els.push(rect(136, 220, 100, 36, CARD2, { rx: 18 }));
  els.push(text(186, 242, 'View Profile', 12, MUTED, { anchor: 'middle', ls: '0' }));

  // Section header
  els.push(text(20, 293, 'More Suggestions', 14, TEXT, { fw: 700, ls: '-0.02em' }));

  // Suggestion cards
  const suggestions = [
    { name: 'Dev Anand', role: 'Sequoia · Partner', match: 91, mutual: 4, avatar: 'DA', ac: ACC2 },
    { name: 'Lena Müller', role: 'Figma · Design Lead', match: 86, mutual: 2, avatar: 'LM', ac: ACC3 },
    { name: 'Omar Khalil', role: 'YC · Group Partner', match: 80, mutual: 6, avatar: 'OK', ac: SUCCESS },
  ];
  suggestions.forEach((s, i) => {
    const y = 306 + i * 82;
    els.push(rect(16, y, W - 32, 74, CARD, { rx: 14 }));
    els.push(rect(16, y, W - 32, 74, 'none', { rx: 14, stroke: BORDER, sw: 0.5 }));
    els.push(circle(52, y + 37, 20, CARD2));
    els.push(circle(52, y + 37, 20, 'none', { stroke: s.ac, sw: 1.5, opacity: 0.7 }));
    els.push(text(52, y + 42, s.avatar, 11, s.ac, { anchor: 'middle', fw: 700 }));
    els.push(text(82, y + 27, s.name, 14, TEXT, { fw: 600, ls: '-0.02em' }));
    els.push(text(82, y + 44, s.role, 10, MUTED, { ls: '0' }));
    els.push(text(82, y + 60, `${s.mutual} mutual connections`, 9, DIM, { ls: '0' }));
    // Match badge
    els.push(pill(W - 70, y + 20, 54, 22, s.ac, { opacity: 0.15 }));
    els.push(text(W - 43, y + 35, `${s.match}%`, 12, s.ac, { anchor: 'middle', fw: 700 }));
    // Connect icon
    els.push(text(W - 30, y + 58, '+', 18, s.ac, { anchor: 'middle', opacity: 0.8 }));
  });

  navBar(els, 2);
  return { name: 'Discover', svg: renderSVG(els), elements: els };
}

// ─── Screen 4: Insights ─────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(circle(300, 300, 180, ACC3, { opacity: 0.025 }));

  statusBar(els);

  els.push(text(20, 76, 'AI Insights', 22, TEXT, { fw: 800, ls: '-0.04em' }));
  els.push(text(20, 96, 'Your relationship intelligence', 12, MUTED, { ls: '0' }));

  // Bento grid of insight cards (inspired by Reflect.app 4-col bento)
  // Row 1: 2 equal cards
  const bentoCards = [
    { x: 16, y: 112, w: 170, h: 100, title: 'Network Health', value: '92/100', sub: 'Excellent', ac: SUCCESS, icon: '◎' },
    { x: 204, y: 112, w: 170, h: 100, title: 'Response Rate', value: '78%', sub: 'Above avg', ac: ACC2, icon: '◈' },
  ];
  bentoCards.forEach(c => {
    els.push(rect(c.x, c.y, c.w, c.h, CARD, { rx: 16 }));
    els.push(rect(c.x, c.y, c.w, c.h, 'none', { rx: 16, stroke: BORDER, sw: 0.5 }));
    els.push(text(c.x + 16, c.y + 28, c.icon, 16, c.ac));
    els.push(text(c.x + 16, c.y + 62, c.value, 24, c.ac, { fw: 800, ls: '-0.04em' }));
    els.push(text(c.x + 16, c.y + 80, c.title, 10, MUTED, { ls: '0' }));
    els.push(text(c.x + 16, c.y + 95, c.sub, 9, c.ac, { opacity: 0.7, ls: '0' }));
  });

  // Wide card
  els.push(rect(16, 224, W - 32, 90, CARD2, { rx: 16 }));
  els.push(rect(16, 224, W - 32, 90, 'none', { rx: 16, stroke: BORDER, sw: 0.5 }));
  els.push(circle(50, 269, 18, ACC, { opacity: 0.2 }));
  els.push(text(50, 274, '◎', 18, ACC, { anchor: 'middle' }));
  els.push(text(80, 254, 'Momentum Alert', 13, TEXT, { fw: 700, ls: '-0.02em' }));
  els.push(text(80, 272, 'You haven\'t spoken with Sara Okafor', 11, MUTED, { ls: '0' }));
  els.push(text(80, 288, 'in 14 days. Send a pulse?', 11, MUTED, { ls: '0' }));
  els.push(pill(W - 104, 252, 80, 28, ACC, { opacity: 0.9 }));
  els.push(text(W - 64, 270, 'Reach Out', 10, BG, { anchor: 'middle', fw: 700, ls: '0' }));

  // AI Insight cards
  els.push(text(20, 332, 'Pattern Analysis', 14, TEXT, { fw: 700, ls: '-0.02em' }));

  const insights = [
    { title: 'Weak Ties Opportunity', body: 'You have 47 dormant connections in VC who are currently very active.', ac: ACC, icon: '⬡' },
    { title: 'Introduction Bridge', body: 'Sara can introduce you to 12 founders you\'re likely to click with.', ac: ACC2, icon: '◈' },
    { title: 'Industry Shift', body: 'Your network is 34% AI/ML, growing 8% this month. You\'re well positioned.', ac: SUCCESS, icon: '✦' },
  ];
  insights.forEach((ins, i) => {
    const y = 348 + i * 90;
    els.push(rect(16, y, W - 32, 82, CARD, { rx: 14 }));
    els.push(rect(16, y, W - 32, 82, 'none', { rx: 14, stroke: BORDER, sw: 0.5 }));
    els.push(rect(16, y, 4, 82, ins.ac, { rx: 2 }));
    els.push(text(32, y + 28, ins.icon, 16, ins.ac));
    els.push(text(56, y + 28, ins.title, 13, TEXT, { fw: 700, ls: '-0.02em' }));
    els.push(text(32, y + 46, ins.body, 10, MUTED, { ls: '0' }));
    els.push(text(32, y + 64, ins.body.slice(40), 10, MUTED, { ls: '0', opacity: 0.7 }));
  });

  navBar(els, 3);
  return { name: 'Insights', svg: renderSVG(els), elements: els };
}

// ─── Screen 5: Messages / Pulse ─────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(circle(100, 250, 150, ACC2, { opacity: 0.03 }));

  statusBar(els);
  els.push(text(20, 76, 'Pulse Messages', 22, TEXT, { fw: 800, ls: '-0.04em' }));
  els.push(text(20, 96, 'Smart outreach, crafted by AI', 12, MUTED, { ls: '0' }));

  // Draft card
  els.push(rect(16, 110, W - 32, 110, CARD, { rx: 18 }));
  els.push(rect(16, 110, W - 32, 110, 'none', { rx: 18, stroke: ACC, sw: 1, opacity: 0.25 }));
  els.push(pill(24, 118, 72, 20, ACC, { opacity: 0.15 }));
  els.push(text(60, 131, 'AI Draft', 9, ACC, { anchor: 'middle', fw: 600, ls: '0.06em' }));
  els.push(text(28, 154, '"Hey Sara — congrats on the Stripe Series D.', 11, TEXT, { ls: '0' }));
  els.push(text(28, 170, 'Would love to reconnect and explore', 11, TEXT, { ls: '0', opacity: 0.8 }));
  els.push(text(28, 186, 'potential synergies with what we\'re building."', 11, MUTED, { ls: '0' }));
  els.push(rect(W - 100, 198, 76, 14, 'none'));
  els.push(text(W - 52, 210, '↻ Regenerate', 9, ACC, { anchor: 'middle', ls: '0' }));

  // Message threads
  els.push(text(20, 242, 'Recent Pulses', 14, TEXT, { fw: 700, ls: '-0.02em' }));

  const threads = [
    { name: 'James Liu', preview: 'Coffee next week?', time: '10:32 AM', unread: 3, avatar: 'JL', ac: ACC2, status: 'sent' },
    { name: 'Mia Torres', preview: 'Thanks for the intro!', time: 'Yesterday', unread: 0, avatar: 'MT', ac: ACC3, status: 'read' },
    { name: 'Ravi Patel', preview: 'Would love to chat about...', time: 'Mon', unread: 1, avatar: 'RP', ac: SUCCESS, status: 'unread' },
    { name: 'Chen Wei', preview: 'Following up on our convo', time: 'Sun', unread: 0, avatar: 'CW', ac: '#FBBF24', status: 'read' },
    { name: 'Nina Arora', preview: 'Great meeting you at NeurIPS', time: '3/28', unread: 0, avatar: 'NA', ac: ACC, status: 'read' },
  ];
  threads.forEach((t, i) => {
    const y = 256 + i * 78;
    els.push(rect(16, y, W - 32, 70, CARD, { rx: 14 }));
    els.push(rect(16, y, W - 32, 70, 'none', { rx: 14, stroke: t.unread > 0 ? t.ac : BORDER, sw: t.unread > 0 ? 0.8 : 0.5, opacity: 0.5 }));
    els.push(circle(52, y + 35, 20, CARD2));
    els.push(circle(52, y + 35, 20, 'none', { stroke: t.ac, sw: 1.5, opacity: 0.5 }));
    els.push(text(52, y + 40, t.avatar, 11, t.ac, { anchor: 'middle', fw: 700 }));
    els.push(text(82, y + 28, t.name, 14, TEXT, { fw: t.unread > 0 ? 700 : 500, ls: '-0.01em' }));
    els.push(text(82, y + 46, t.preview, 10, MUTED, { ls: '0', opacity: t.unread > 0 ? 0.9 : 0.6 }));
    els.push(text(W - 20, y + 28, t.time, 9, DIM, { anchor: 'end', ls: '0' }));
    if (t.unread > 0) {
      els.push(circle(W - 28, y + 48, 9, ACC));
      els.push(text(W - 28, y + 52, `${t.unread}`, 9, BG, { anchor: 'middle', fw: 700 }));
    }
  });

  navBar(els, 4);
  return { name: 'Pulse Messages', svg: renderSVG(els), elements: els };
}

// ─── Screen 6: Profile / Your Gravity ────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  // Hero glow
  els.push(circle(195, 180, 200, ACC, { opacity: 0.05 }));
  els.push(circle(195, 180, 100, ACC2, { opacity: 0.04 }));

  statusBar(els);

  // Profile hero
  els.push(circle(195, 130, 50, CARD2));
  els.push(circle(195, 130, 50, 'none', { stroke: ACC, sw: 2 }));
  // Orbit ring
  els.push(circle(195, 130, 68, 'none', { stroke: ACC, sw: 0.5, opacity: 0.3 }));
  els.push(circle(195, 130, 84, 'none', { stroke: ACC2, sw: 0.5, opacity: 0.2 }));
  els.push(text(195, 137, 'AC', 22, ACC, { anchor: 'middle', fw: 800 }));

  // Orbiting mini avatars
  const orbiters = [
    { angle: 0, name: 'SO', color: ACC },
    { angle: 72, name: 'JL', color: ACC2 },
    { angle: 144, name: 'MT', color: ACC3 },
    { angle: 216, name: 'RP', color: SUCCESS },
    { angle: 288, name: 'CW', color: '#FBBF24' },
  ];
  orbiters.forEach(o => {
    const rad = (o.angle * Math.PI) / 180;
    const ox = 195 + Math.cos(rad) * 68;
    const oy = 130 + Math.sin(rad) * 68;
    els.push(circle(ox, oy, 10, CARD2));
    els.push(circle(ox, oy, 10, 'none', { stroke: o.color, sw: 1 }));
    els.push(text(ox, oy + 4, o.name[0], 7, o.color, { anchor: 'middle', fw: 700 }));
  });

  els.push(text(195, 210, 'Alex Chen', 20, TEXT, { anchor: 'middle', fw: 800, ls: '-0.03em' }));
  els.push(text(195, 229, 'Founder · San Francisco', 12, MUTED, { anchor: 'middle', ls: '0' }));

  // Gradient "Gravity Score" label
  els.push(text(195, 254, '847 GRAVITY', 11, ACC, { anchor: 'middle', fw: 700, ls: '0.1em' }));

  // Stats row
  const profileStats = [
    { label: 'Network', value: '312' },
    { label: 'Streak', value: '14d' },
    { label: 'Rank', value: 'Top 5%' },
  ];
  profileStats.forEach((s, i) => {
    const x = 47 + i * 130;
    els.push(rect(x, 266, 100, 56, CARD, { rx: 12 }));
    els.push(text(x + 50, 293, s.value, 18, i === 0 ? ACC : i === 1 ? ACC2 : ACC3, { anchor: 'middle', fw: 800, ls: '-0.03em' }));
    els.push(text(x + 50, 311, s.label, 10, MUTED, { anchor: 'middle', ls: '0' }));
  });

  // Skill tags
  els.push(text(20, 346, 'Gravity Fields', 13, TEXT, { fw: 700, ls: '-0.02em' }));
  const skills = ['AI / ML', 'Startups', 'Product', 'VC Networks', 'B2B SaaS', 'Developer Tools'];
  let sx = 20, sy = 360;
  skills.forEach(s => {
    const sw = s.length * 7 + 18;
    if (sx + sw > W - 20) { sx = 20; sy += 32; }
    els.push(pill(sx, sy, sw, 24, CARD2));
    els.push(rect(sx, sy, sw, 24, 'none', { rx: 12, stroke: BORDER, sw: 0.5 }));
    els.push(text(sx + sw / 2, sy + 16, s, 10, MUTED, { anchor: 'middle', ls: '0' }));
    sx += sw + 8;
  });

  // Settings list
  const settingY = 440;
  els.push(text(20, settingY, 'Settings', 13, TEXT, { fw: 700, ls: '-0.02em' }));
  const settings = ['Notification Preferences', 'Privacy & Visibility', 'Integrations', 'Gravity Algorithm', 'Export Network'];
  settings.forEach((setting, i) => {
    const y = settingY + 14 + i * 50;
    els.push(rect(16, y, W - 32, 42, CARD, { rx: 12 }));
    els.push(rect(16, y, W - 32, 42, 'none', { rx: 12, stroke: BORDER, sw: 0.5 }));
    els.push(text(32, y + 26, setting, 13, TEXT, { ls: '0' }));
    els.push(text(W - 30, y + 26, '›', 16, MUTED, { anchor: 'middle' }));
  });

  navBar(els, 4);
  return { name: 'Profile', svg: renderSVG(els), elements: els };
}

// ─── SVG Renderer ───────────────────────────────────────────────────────────
function renderSVG(elements) {
  const shapes = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${el.textAnchor}" letter-spacing="${el.letterSpacing}" opacity="${el.opacity}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
    }
    return '';
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${shapes}
</svg>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
const screens = [
  screen1(),
  screen2(),
  screen3(),
  screen4(),
  screen5(),
  screen6(),
];

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'GRAV — AI Relationship Intelligence',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 1,
    elements: totalElements,
    description: 'AI-powered relationship intelligence with cosmic particle aesthetic. Inspired by Reflect.app\'s deep navy palette and bento feature grid from Godly.website.',
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT },
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`GRAV: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
