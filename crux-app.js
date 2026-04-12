// crux-app.js
// CRUX — Autonomous AI Agent Command Center
//
// Challenge: Design a dark-mode "agentic command center" where multiple AI agents
// autonomously run your business operations — finance, outreach, intel, content —
// while you sleep. Treat each agent as a living entity with heartbeat vitality rings
// and real-time activity logs as the primary data surface.
//
// Inspired by:
// 1. Midday.ai (darkmodedesign.com, April 2026) — "Let agents run your business" hero copy,
//    dark zinc palette rgb(24,24,27), clean data tables showing agent-categorised transactions.
//    Key insight: the table IS the hero — not a chart, not an illustration.
// 2. dhero.studio (darkmodedesign.com, April 2026) — acid lime #D4FF70 + electric purple
//    #D19DFF on near-black #111111. This pairing is emerging across creative-tech dark UIs.
// 3. lapa.ninja 2026 trend — Paperclip ("zero-human company"), Relace ("coding agents"),
//    JetBrains Air ("multitask with agents"). Autonomous/agentic is the defining UI
//    category of 2026.
//
// Innovation: Vitality-arc rings treating agents as living entities, acid-lime/purple
// status palette, table-as-hero for transaction data, heat-bar prospect pipeline.
//
// Theme: DARK (last run PACT was LIGHT → this run DARK)
// Screens: 5 mobile (390×844)

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────────────────
const BG       = '#0D0D11';   // near-black with violet undertone
const SURFACE  = '#16161D';   // card bg
const SURFACE2 = '#1E1E28';   // elevated card
const SURFACE3 = '#252532';   // subtle raised / divider
const TEXT     = '#EBEBEB';   // primary text
const MUTED    = '#7B7B99';   // secondary text
const MUTED2   = '#3D3D55';   // very muted / track bg
const LIME     = '#C6FF45';   // acid lime — dhero.studio inspired
const PURPLE   = '#A259F7';   // electric purple — dhero.studio inspired
const AMBER    = '#FFB444';   // warning / in-progress
const RED      = '#FF4D6D';   // error/alert
const BORDER   = '#252532';   // divider lines

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    radius: opts.radius ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1 } : {}),
  };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content: String(content), x, y,
    fontSize: opts.size ?? 14, fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT, align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter', opacity: opts.opacity ?? 1,
    ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  };
}
function line(x1, y1, x2, y2, color = BORDER, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}
function arc(cx, cy, r, start, end, color, strokeW = 6) {
  return {
    type: 'arc', cx, cy, r,
    startAngle: start, endAngle: end,
    stroke: color, strokeWidth: strokeW, fill: 'none',
  };
}

// ── Reusable components ───────────────────────────────────────────────────────
function statusBar(els, W) {
  els.push(text('9:41', 22, 16, { size: 12, weight: 'semibold', color: MUTED }));
  els.push(text('●●  ▲  🔋', W - 72, 16, { size: 11, color: MUTED }));
}

function bottomNav(els, W, H, active) {
  const navH = 78;
  els.push(rect(0, H - navH, W, navH, SURFACE));
  els.push(line(0, H - navH, W, H - navH, BORDER));
  const items = [
    { icon: '⬡', label: 'Fleet'    },
    { icon: '◈', label: 'Finance'  },
    { icon: '◎', label: 'Outreach' },
    { icon: '◐', label: 'Intel'    },
    { icon: '⊹', label: 'Config'   },
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? LIME : MUTED2;
    const textCol = isActive ? LIME : MUTED;
    els.push(text(item.icon, nx, H - navH + 16, { size: 18, color: col, align: 'center' }));
    els.push(text(item.label, nx, H - navH + 40, { size: 9, color: textCol, align: 'center', ls: 0.2 }));
    if (isActive) {
      els.push(rect(nx - 16, H - navH, 32, 2, LIME, { radius: 1 }));
    }
  });
  els.push(rect(150, H - 8, 90, 4, SURFACE3, { radius: 2 }));
}

// Agent heartbeat ring — vitality 0..1, status: 'running'|'thinking'|'idle'|'error'
function heartbeatRing(els, cx, cy, vitality, status) {
  const r = 22;
  const accent = status === 'running'  ? LIME
               : status === 'thinking' ? PURPLE
               : status === 'error'    ? RED
               : MUTED;
  // background track
  els.push(arc(cx, cy, r, -90, 270, MUTED2, 5));
  // vitality fill
  if (vitality > 0) {
    const endDeg = -90 + (vitality * 360);
    els.push(arc(cx, cy, r, -90, endDeg, accent, 5));
  }
  // glow dot at current position
  const glowAngle = (-90 + vitality * 360) * (Math.PI / 180);
  const gx = cx + r * Math.cos(glowAngle);
  const gy = cy + r * Math.sin(glowAngle);
  els.push(circle(gx, gy, 5, accent + '60'));
  els.push(circle(gx, gy, 3, accent));
  // centre
  els.push(circle(cx, cy, 8, accent + '22'));
  els.push(circle(cx, cy, 4, accent));
}

// Activity log row
function logRow(els, x, y, w, { agent, action, time, accent }) {
  els.push(circle(x + 5, y + 9, 3, accent ?? LIME));
  els.push(text(agent, x + 14, y, { size: 11, weight: 'semibold', color: accent ?? LIME }));
  els.push(text(time, x + w, y, { size: 10, color: MUTED, align: 'right' }));
  els.push(text(action, x + 14, y + 16, { size: 11, color: MUTED }));
}

// ─── SCREEN 1: FLEET ──────────────────────────────────────────────────────────
function screenFleet() {
  const els = [], W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  // Brand
  els.push(text('CRUX', 24, 48, { size: 11, weight: 'bold', color: LIME, ls: 3 }));
  els.push(text('Agent Fleet', 24, 68, { size: 24, weight: 'bold', color: TEXT }));

  // Live pill
  els.push(rect(W - 82, 57, 62, 22, LIME + '1A', { radius: 11 }));
  els.push(circle(W - 74, 68, 4, LIME));
  els.push(circle(W - 74, 68, 7, LIME + '44'));
  els.push(text('LIVE', W - 61, 62, { size: 9, weight: 'bold', color: LIME, ls: 1.5 }));

  // Summary strip
  els.push(rect(24, 96, W - 48, 36, SURFACE, { radius: 10 }));
  els.push(text('4 agents running  ·  0 errors  ·  2,847 tasks today', 38, 110, { size: 11, color: MUTED }));

  // Agent cards
  const agents = [
    { name: 'Finance',  role: 'Reconcile & Categorise',   tasks: 312, status: 'running',  vitality: 0.82, last: '2m ago',  color: LIME   },
    { name: 'Outreach', role: 'Pipeline & Follow-ups',    tasks: 88,  status: 'thinking', vitality: 0.65, last: '8m ago',  color: PURPLE },
    { name: 'Intel',    role: 'Market Research & Alerts', tasks: 44,  status: 'running',  vitality: 0.91, last: '1m ago',  color: AMBER  },
    { name: 'Content',  role: 'Draft & Schedule Posts',   tasks: 17,  status: 'idle',     vitality: 0.28, last: '42m ago', color: MUTED  },
  ];

  agents.forEach((ag, i) => {
    const top = 148 + i * 138;
    const cardH = 122;
    els.push(rect(24, top, W - 48, cardH, SURFACE, { radius: 16 }));
    // Left accent bar
    els.push(rect(24, top, 3, cardH, ag.color, { radius: 2 }));

    // Heartbeat ring
    heartbeatRing(els, 68, top + cardH / 2, ag.vitality, ag.status);

    // Name + role
    els.push(text(ag.name, 106, top + 20, { size: 16, weight: 'bold', color: TEXT }));
    els.push(text(ag.role, 106, top + 40, { size: 11, color: MUTED }));

    // Status badge
    const sBg  = ag.status === 'running' ? LIME + '22' : ag.status === 'thinking' ? PURPLE + '22' : ag.status === 'error' ? RED + '22' : MUTED2;
    const sCol = ag.status === 'running' ? LIME : ag.status === 'thinking' ? PURPLE : ag.status === 'error' ? RED : MUTED;
    els.push(rect(W - 92, top + 18, 64, 20, sBg, { radius: 10 }));
    els.push(text(ag.status.toUpperCase(), W - 60, top + 22, { size: 9, weight: 'bold', color: sCol, align: 'center', ls: 0.6 }));

    // Divider
    els.push(line(106, top + 58, W - 36, top + 58, BORDER));

    // Stats
    els.push(text(ag.tasks.toLocaleString(), 106, top + 70, { size: 20, weight: 'bold', color: TEXT }));
    els.push(text('tasks today', 106, top + 92, { size: 9, color: MUTED }));
    els.push(text('Last active', W - 36, top + 70, { size: 9, color: MUTED, align: 'right' }));
    els.push(text(ag.last, W - 36, top + 88, { size: 11, weight: 'semibold', color: ag.color, align: 'right' }));

    // Vitality bar
    const bx = 27, bw = W - 54;
    els.push(rect(bx, top + cardH - 10, bw, 4, MUTED2, { radius: 2 }));
    els.push(rect(bx, top + cardH - 10, bw * ag.vitality, 4, ag.color, { radius: 2 }));
  });

  bottomNav(els, W, H, 0);
  return { name: 'Fleet', width: W, height: H, backgroundColor: BG, layers: els };
}

// ─── SCREEN 2: FINANCE AGENT ──────────────────────────────────────────────────
function screenFinance() {
  const els = [], W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Finance Agent', 24, 48, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('Auto-reconciled · updated 2m ago', 24, 74, { size: 11, color: MUTED }));
  heartbeatRing(els, W - 42, 60, 0.82, 'running');

  // Revenue / Expenses cards
  const cw = (W - 60) / 2;
  [
    { label: 'Revenue',   value: '$14,280', delta: '+12%', dc: LIME   },
    { label: 'Expenses',  value: '$6,940',  delta: '−3%',  dc: LIME   },
  ].forEach((card, i) => {
    const cx2 = 24 + i * (cw + 12);
    els.push(rect(cx2, 96, cw, 88, SURFACE, { radius: 14 }));
    els.push(text(card.label, cx2 + 14, 112, { size: 10, color: MUTED }));
    els.push(text(card.value, cx2 + 14, 134, { size: 19, weight: 'bold', color: TEXT }));
    els.push(rect(cx2 + 14, 158, 48, 18, card.dc + '22', { radius: 9 }));
    els.push(text(card.delta + ' MoM', cx2 + 38, 162, { size: 9, weight: 'semibold', color: card.dc, align: 'center' }));
  });

  // Net P&L
  els.push(rect(24, 196, W - 48, 54, LIME + '14', { radius: 14, stroke: LIME + '33', strokeWidth: 1 }));
  els.push(text('Net Profit', 40, 212, { size: 11, color: LIME }));
  els.push(text('$7,340', 40, 232, { size: 22, weight: 'bold', color: LIME }));
  els.push(text('51.4% margin', W - 36, 226, { size: 12, weight: 'semibold', color: TEXT, align: 'right' }));

  // Transactions — Midday-inspired hero table
  els.push(text('RECENT TRANSACTIONS', 24, 272, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));
  els.push(text('Categorised by Finance agent', W - 24, 272, { size: 9, color: MUTED, align: 'right' }));

  const txns = [
    { date: 'Apr 3',  name: 'Stripe payout',        cat: 'Income', amount: '+$4,200', ac: LIME   },
    { date: 'Apr 3',  name: 'AWS Infrastructure',    cat: 'Ops',    amount: '−$892',  ac: AMBER  },
    { date: 'Apr 2',  name: 'Figma subscription',    cat: 'Tools',  amount: '−$45',   ac: PURPLE },
    { date: 'Apr 2',  name: 'Freelance payment',     cat: 'Income', amount: '+$1,800',ac: LIME   },
    { date: 'Apr 1',  name: 'Vercel Pro',            cat: 'Infra',  amount: '−$20',   ac: AMBER  },
    { date: 'Apr 1',  name: 'OpenAI API',            cat: 'Tools',  amount: '−$180',  ac: PURPLE },
    { date: 'Mar 31', name: 'Client Invoice #441',   cat: 'Income', amount: '+$3,500',ac: LIME   },
  ];

  txns.forEach((tx, i) => {
    const ty = 290 + i * 50;
    if (i > 0) els.push(line(24, ty - 4, W - 24, ty - 4, BORDER));
    els.push(text(tx.date, 24, ty + 2, { size: 10, color: MUTED }));
    els.push(text(tx.name, 24, ty + 18, { size: 12, weight: 'semibold', color: TEXT }));
    // Category pill
    els.push(rect(W - 132, ty + 4, 52, 18, tx.ac + '22', { radius: 9 }));
    els.push(text(tx.cat, W - 106, ty + 7, { size: 9, color: tx.ac, align: 'center' }));
    // Amount
    const amtCol = tx.amount.startsWith('+') ? LIME : TEXT;
    els.push(text(tx.amount, W - 24, ty + 18, { size: 13, weight: 'bold', color: amtCol, align: 'right' }));
  });

  bottomNav(els, W, H, 1);
  return { name: 'Finance', width: W, height: H, backgroundColor: BG, layers: els };
}

// ─── SCREEN 3: OUTREACH AGENT ─────────────────────────────────────────────────
function screenOutreach() {
  const els = [], W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Outreach Agent', 24, 48, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('Thinking · drafting 3 follow-ups now', 24, 74, { size: 11, color: PURPLE }));
  heartbeatRing(els, W - 42, 60, 0.65, 'thinking');

  // Stats row
  const stats = [
    { label: 'Pipeline', value: '28' },
    { label: 'Sent',     value: '14' },
    { label: 'Replies',  value: '6'  },
    { label: 'Closed',   value: '2'  },
  ];
  const sw = (W - 48) / 4;
  stats.forEach((s, i) => {
    const sx = 24 + i * sw;
    els.push(rect(sx, 94, sw - 4, 64, SURFACE, { radius: 12 }));
    const valCol = i === 2 ? LIME : TEXT;
    els.push(text(s.value, sx + (sw - 4) / 2, 112, { size: 22, weight: 'bold', color: valCol, align: 'center' }));
    els.push(text(s.label, sx + (sw - 4) / 2, 134, { size: 9, color: MUTED, align: 'center' }));
  });

  els.push(text('PIPELINE', 24, 180, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));

  // Prospect cards with heat bar
  const prospects = [
    { name: 'Priya Mehta',    co: 'Sidecar Labs',    stage: 'Proposal',  reply: 'Replied 1h ago',    rc: LIME,   heat: 0.85 },
    { name: 'David Okafor',   co: 'Bloom Systems',   stage: 'Follow-up', reply: 'Opened · no reply', rc: AMBER,  heat: 0.55 },
    { name: 'Sarah Kimura',   co: 'Alto Design Co.', stage: 'Intro',     reply: 'Sent 3h ago',       rc: MUTED,  heat: 0.38 },
    { name: 'Tom Vries',      co: 'Verdant AI',      stage: 'Discovery', reply: 'Thinking…',         rc: PURPLE, heat: 0.70 },
    { name: 'Ana Colmenares', co: 'Strata Creative', stage: 'Warm',      reply: 'Replied 2d ago',    rc: LIME,   heat: 0.60 },
  ];

  prospects.forEach((p, i) => {
    const py = 196 + i * 86;
    els.push(rect(24, py, W - 48, 74, SURFACE, { radius: 14 }));

    // Heat bar (left edge, height-proportional)
    const hc = p.heat > 0.75 ? LIME : p.heat > 0.5 ? AMBER : MUTED;
    els.push(rect(24, py, 3, 74, MUTED2, { radius: 2 }));
    const hh = 74 * p.heat;
    els.push(rect(24, py + 74 - hh, 3, hh, hc, { radius: 2 }));

    // Name + company
    els.push(text(p.name, 40, py + 12, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(p.co, 40, py + 30, { size: 11, color: MUTED }));

    // Stage badge
    const sb = p.stage === 'Proposal' ? LIME + '20' : p.stage === 'Follow-up' ? AMBER + '20' : SURFACE3;
    const sc = p.stage === 'Proposal' ? LIME : p.stage === 'Follow-up' ? AMBER : MUTED;
    els.push(rect(W - 90, py + 10, 64, 20, sb, { radius: 10 }));
    els.push(text(p.stage, W - 58, py + 13, { size: 9, weight: 'semibold', color: sc, align: 'center' }));

    // Reply line
    els.push(circle(40, py + 55, 3, p.rc));
    els.push(text(p.reply, 50, py + 51, { size: 10, color: p.rc }));
  });

  bottomNav(els, W, H, 2);
  return { name: 'Outreach', width: W, height: H, backgroundColor: BG, layers: els };
}

// ─── SCREEN 4: INTEL AGENT ────────────────────────────────────────────────────
function screenIntel() {
  const els = [], W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Intel Agent', 24, 48, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('Morning briefing · Apr 4, 2026', 24, 74, { size: 11, color: MUTED }));
  heartbeatRing(els, W - 42, 60, 0.91, 'running');

  // Key signal card — editorial pull-quote
  els.push(rect(24, 94, W - 48, 90, AMBER + '12', { radius: 16, stroke: AMBER + '30', strokeWidth: 1 }));
  els.push(rect(24, 94, 3, 90, AMBER, { radius: 2 }));
  els.push(text('KEY SIGNAL', 40, 108, { size: 9, weight: 'bold', color: AMBER, ls: 1.5 }));
  els.push(text('"Two new competitors entered your niche', 40, 126, { size: 11.5, color: TEXT }));
  els.push(text('this week — pricing 15% lower. Suggest', 40, 144, { size: 11.5, color: TEXT }));
  els.push(text('reviewing your Tier 2 pricing."', 40, 162, { size: 11.5, color: MUTED }));

  // Market signals
  els.push(text('MARKET SIGNALS', 24, 204, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));
  els.push(text('44 monitored · 8 new', W - 24, 204, { size: 9, color: LIME, align: 'right' }));

  const signals = [
    { type: 'Competitor', title: 'Relace launches free tier',         impact: 'High',  ic: RED,    time: '6h ago',  src: 'relace.io' },
    { type: 'Trend',      title: 'Agentic dashboards +240% searches', impact: 'Opp',   ic: LIME,   time: '12h ago', src: 'trends.google' },
    { type: 'Market',     title: 'YC S26: 31 companies in your space',impact: 'Watch', ic: AMBER,  time: '1d ago',  src: 'ycombinator.com' },
    { type: 'Mention',    title: '"Best agent OS?" thread trending',   impact: 'Opp',   ic: LIME,   time: '2h ago',  src: 'reddit.com/r/SaaS' },
  ];

  signals.forEach((sig, i) => {
    const sy = 222 + i * 82;
    els.push(rect(24, sy, W - 48, 70, SURFACE, { radius: 14 }));
    // Type label
    els.push(rect(36, sy + 10, 66, 17, SURFACE3, { radius: 8 }));
    els.push(text(sig.type.toUpperCase(), 69, sy + 13, { size: 8, weight: 'bold', color: MUTED, align: 'center', ls: 0.6 }));
    // Impact badge
    els.push(rect(W - 92, sy + 10, 52, 17, sig.ic + '22', { radius: 8 }));
    els.push(text(sig.impact, W - 66, sy + 13, { size: 9, weight: 'bold', color: sig.ic, align: 'center' }));
    // Title
    els.push(text(sig.title, 36, sy + 36, { size: 12, weight: 'semibold', color: TEXT }));
    // Meta
    els.push(text(sig.src, 36, sy + 54, { size: 9, color: MUTED }));
    els.push(text(sig.time, W - 36, sy + 54, { size: 9, color: MUTED, align: 'right' }));
  });

  // Activity log
  els.push(text('LIVE ACTIVITY', 24, 558, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));
  els.push(rect(24, 574, W - 48, 148, SURFACE, { radius: 14 }));
  const logs = [
    { agent: 'Intel',    action: 'Scraped 14 competitor pricing pages',  time: '2m',  accent: AMBER  },
    { agent: 'Finance',  action: 'Reconciled Apr 3 transactions (12)',   time: '5m',  accent: LIME   },
    { agent: 'Outreach', action: 'Drafted follow-up for David Okafor',   time: '9m',  accent: PURPLE },
    { agent: 'Intel',    action: 'Flagged new SaaS thread on Reddit',    time: '14m', accent: AMBER  },
  ];
  logs.forEach((lg, i) => {
    const ly = 584 + i * 34;
    if (i > 0) els.push(line(38, ly - 4, W - 36, ly - 4, BORDER));
    logRow(els, 38, ly, W - 78, lg);
  });

  bottomNav(els, W, H, 3);
  return { name: 'Intel', width: W, height: H, backgroundColor: BG, layers: els };
}

// ─── SCREEN 5: CONFIG ─────────────────────────────────────────────────────────
function screenConfig() {
  const els = [], W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Agent Config', 24, 48, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('Permissions & escalation rules', 24, 74, { size: 11, color: MUTED }));

  // Fleet health
  els.push(rect(24, 94, W - 48, 70, SURFACE, { radius: 16 }));
  els.push(text('Fleet Uptime', 40, 110, { size: 11, color: MUTED }));
  els.push(text('99.7%', 40, 132, { size: 26, weight: 'bold', color: LIME }));
  els.push(text('Last 30 days · 4 agents · 0 incidents', 40, 156, { size: 10, color: MUTED }));
  // Uptime bar chart
  for (let d = 0; d < 30; d++) {
    const ux = W - 48 - (30 - d) * 5;
    const minor = (d === 11 || d === 18);
    const uh = minor ? 10 : 20;
    const uc = minor ? AMBER : LIME;
    els.push(rect(ux, 166 - uh, 3, uh, uc + 'CC', { radius: 1 }));
  }

  els.push(text('AGENT SETTINGS', 24, 184, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));

  const configs = [
    { name: 'Finance',  icon: '◈', status: 'running',  color: LIME,   perms: ['Read bank', 'Categorise', 'Alert'],      autoSend: false },
    { name: 'Outreach', icon: '◎', status: 'thinking', color: PURPLE, perms: ['Draft emails', 'Track opens'],            autoSend: false },
    { name: 'Intel',    icon: '◐', status: 'running',  color: AMBER,  perms: ['Web scrape', 'Monitor RSS'],              autoSend: false },
    { name: 'Content',  icon: '⬡', status: 'idle',     color: MUTED,  perms: ['Draft posts', 'Schedule'],               autoSend: true  },
  ];

  configs.forEach((cfg, i) => {
    const ct = 200 + i * 104;
    els.push(rect(24, ct, W - 48, 92, SURFACE, { radius: 14 }));
    // Icon
    els.push(text(cfg.icon, 52, ct + 20, { size: 20, color: cfg.color, align: 'center' }));
    // Name
    els.push(text(cfg.name + ' Agent', 72, ct + 14, { size: 14, weight: 'bold', color: TEXT }));
    // Status
    const stBg = cfg.status === 'running' ? LIME + '20' : cfg.status === 'thinking' ? PURPLE + '20' : SURFACE3;
    const stCo = cfg.status === 'running' ? LIME : cfg.status === 'thinking' ? PURPLE : MUTED;
    els.push(rect(72, ct + 32, 58, 16, stBg, { radius: 8 }));
    els.push(text(cfg.status.toUpperCase(), 101, ct + 35, { size: 8, weight: 'bold', color: stCo, align: 'center', ls: 0.4 }));
    // Perm pills
    let px = 72;
    cfg.perms.forEach(perm => {
      const pw = perm.length * 5.5 + 14;
      if (px + pw < W - 70) {
        els.push(rect(px, ct + 58, pw, 18, SURFACE3, { radius: 9 }));
        els.push(text(perm, px + pw / 2, ct + 61, { size: 8, color: MUTED, align: 'center' }));
        px += pw + 6;
      }
    });
    // Toggle
    const tX = W - 70;
    const on = cfg.autoSend;
    els.push(rect(tX, ct + 14, 42, 22, on ? LIME + '33' : SURFACE3, { radius: 11 }));
    els.push(circle(tX + (on ? 31 : 11), ct + 25, 8, on ? LIME : MUTED));
    els.push(text('Auto-send', tX + 21, ct + 44, { size: 8, color: MUTED, align: 'center' }));
  });

  // Escalation
  els.push(text('ESCALATION', 24, 624, { size: 9, weight: 'bold', color: MUTED, ls: 1.8 }));
  els.push(rect(24, 640, W - 48, 90, SURFACE, { radius: 14 }));
  const rules = [
    { rule: 'Transaction > $500',      action: 'Ask me first'        },
    { rule: 'Email to VIP prospect',   action: 'Review before send'  },
    { rule: 'High-impact competitor',  action: 'Notify immediately'  },
  ];
  rules.forEach((r, i) => {
    const ry = 652 + i * 26;
    els.push(circle(38, ry + 7, 3, AMBER));
    els.push(text(r.rule, 50, ry, { size: 11, color: TEXT }));
    els.push(text(r.action, W - 36, ry, { size: 10, color: AMBER, align: 'right' }));
  });

  // Save button
  els.push(rect(24, 748, W - 48, 52, LIME, { radius: 26 }));
  els.push(text('Save Configuration', W / 2, 768, { size: 15, weight: 'bold', color: BG, align: 'center' }));

  bottomNav(els, W, H, 4);
  return { name: 'Config', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'CRUX',
  description: [
    'DARK. Agentic command center for solo founders. 4 AI agents (Finance, Outreach,',
    'Intel, Content) run autonomously — heartbeat vitality rings show agent health,',
    'acid-lime #C6FF45 + electric-purple #A259F7 on near-black #0D0D11.',
    'Inspired by: Midday.ai on darkmodedesign.com 2026 (agent-first + hero data tables),',
    'dhero.studio on darkmodedesign.com 2026 (acid lime + purple on #111),',
    'lapa.ninja 2026 trend (Paperclip / Relace / JetBrains Air — autonomous agent category).',
  ].join(' '),
  theme: 'dark',
  screens: [
    screenFleet(),
    screenFinance(),
    screenOutreach(),
    screenIntel(),
    screenConfig(),
  ],
};

const outPath = path.join(__dirname, 'crux.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ crux.pen — ${kb} KB`);
console.log(`  Screens: ${pen.screens.map(s => s.name).join(', ')}`);
