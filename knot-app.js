// KNOT — Personal Knowledge Graph & AI Thought Partner
// Inspired by: Reflect (godly.website) — networked note-taking "thought partner"
//              Amie (godly.website) — AI note taker "without a bot joining"
//              NNGroup Apr 3, 2026 — AI agents iterative evaluation loop concept
// Dark obsidian theme: #09090F bg, #7C6EF2 violet knots, #34D399 emerald synthesis
// Pencil.dev v2.8 format

const fs   = require('fs');
const path = require('path');

const BG       = '#09090F';
const SURFACE  = '#121219';
const SURFACE2 = '#1B1C29';
const TEXT     = '#E9EDF6';
const MUTED    = '#58697F';
const ACCENT   = '#7C6EF2';  // violet — connection threads
const ACCENT2  = '#34D399';  // emerald — AI synthesis / active
const WARN     = '#F59E0B';
const ERR      = '#F04B4B';
const DIM      = '#1E2438';

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT,
    align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter',
    opacity: opts.opacity ?? 1,
  };
}
function line(x1, y1, x2, y2, color = DIM, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}

// ─── SCREEN 1: KNOWLEDGE GRAPH ───────────────────────────────────────────────
function screenGraph() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  // Ambient glows
  els.push({ type: 'ellipse', cx: 195, cy: 370, rx: 270, ry: 210, fill: ACCENT,  opacity: 0.04 });
  els.push({ type: 'ellipse', cx: 76,  cy: 270, rx: 130, ry: 95,  fill: ACCENT2, opacity: 0.05 });
  els.push({ type: 'ellipse', cx: 325, cy: 530, rx: 140, ry: 105, fill: ACCENT,  opacity: 0.03 });

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('●●●  WiFi  🔋', 280, 16, { size: 11, color: MUTED }));

  // Search bar
  els.push(rect(20, 34, 314, 36, SURFACE, { radius: 18 }));
  els.push(circle(46, 52, 8, MUTED, { opacity: 0.3 }));
  els.push(text('Search your thoughts...', 62, 56, { size: 13, color: MUTED }));
  els.push(rect(342, 34, 34, 36, SURFACE, { radius: 18 }));
  els.push(text('⊞', 359, 56, { size: 13, color: MUTED, align: 'center' }));

  // Graph label
  els.push(text('KNOWLEDGE GRAPH', 20, 90, { size: 9, weight: 'bold', color: MUTED }));
  els.push(text('247 notes · 89 connections', 124, 90, { size: 9, color: MUTED, opacity: 0.7 }));

  // Nodes
  const nodes = [
    { cx: 195, cy: 238, r: 28, label: 'AI in 2026',  type: 'hub' },
    { cx: 86,  cy: 315, r: 18, label: 'LLM limits',  type: 'linked' },
    { cx: 304, cy: 296, r: 20, label: 'Agentic UX',  type: 'linked' },
    { cx: 132, cy: 160, r: 16, label: 'Memory',       type: 'linked' },
    { cx: 274, cy: 165, r: 15, label: 'RAG systems',  type: 'tag' },
    { cx: 74,  cy: 420, r: 14, label: 'Eval loops',   type: 'tag' },
    { cx: 338, cy: 396, r: 16, label: 'Copilot UX',   type: 'tag' },
    { cx: 200, cy: 386, r: 12, label: 'Context',       type: 'small' },
    { cx: 148, cy: 470, r: 13, label: 'Tool use',      type: 'small' },
    { cx: 292, cy: 466, r: 14, label: 'Grounding',     type: 'small' },
    { cx: 56,  cy: 526, r: 11, label: 'Prompting',     type: 'small' },
    { cx: 335, cy: 536, r: 12, label: 'Multimodal',    type: 'small' },
    { cx: 196, cy: 535, r: 16, label: 'Reflection',    type: 'linked' },
  ];

  // Connection lines (drawn below nodes)
  const connections = [
    [0,1],[0,2],[0,3],[0,4],[0,6],[0,7],
    [1,5],[1,8],[2,6],[2,9],[3,4],[3,7],
    [7,8],[8,10],[9,11],[12,8],[12,9],[12,0],
  ];
  connections.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const hi = a === 0 || b === 0;
    els.push(line(na.cx, na.cy, nb.cx, nb.cy,
      hi ? 'rgba(124,110,242,0.36)' : 'rgba(30,36,56,0.75)', hi ? 1.5 : 1));
  });

  // Node circles + labels
  nodes.forEach(n => {
    const isHub    = n.type === 'hub';
    const isLinked = n.type === 'linked';
    if (isHub) {
      els.push(circle(n.cx, n.cy, n.r + 10, ACCENT, { opacity: 0.1 }));
      els.push(circle(n.cx, n.cy, n.r + 5,  ACCENT, { opacity: 0.2 }));
    } else if (isLinked) {
      els.push(circle(n.cx, n.cy, n.r + 4, ACCENT, { opacity: 0.08 }));
    }
    els.push(circle(n.cx, n.cy, n.r, isHub ? ACCENT : isLinked ? SURFACE2 : SURFACE));
    els.push(text(n.label, n.cx, n.cy + n.r + 13, {
      size: isHub ? 10 : 9,
      color: isHub ? '#FFFFFF' : isLinked ? ACCENT : MUTED,
      weight: isHub ? 'semibold' : 'regular',
      align: 'center',
    }));
  });

  // AI Insight strip
  els.push(rect(0, 654, W, 102, SURFACE));
  els.push(line(0, 654, W, 654, 'rgba(124,110,242,0.26)'));
  els.push(rect(20, 666, 3, 74, ACCENT2, { radius: 2 }));
  els.push(text('AI INSIGHT', 30, 682, { size: 9, weight: 'bold', color: ACCENT2 }));
  els.push(text('"AI in 2026" connects 12 notes across your graph.', 30, 702, { size: 12, color: TEXT }));
  els.push(text('Strongest thread: Agentic UX → Eval loops →', 30, 720, { size: 11, color: MUTED }));
  els.push(text('Tool use. Suggested: link Memory + Reflection.', 30, 736, { size: 11, color: MUTED }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  const nav = ['◉ Graph', '✎ Notes', '⊕ Capture', '⌕ Search', '☀ Daily'];
  nav.forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 0;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(233,237,246,0.2)', { radius: 2 }));
  return { id: 'screen-1', name: 'Knowledge Graph', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 2: NOTE VIEW ─────────────────────────────────────────────────────
function screenNote() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('←', 20, 56, { size: 18, color: TEXT }));
  els.push(text('Note', 195, 56, { size: 16, weight: 'semibold', color: TEXT, align: 'center' }));
  els.push(text('⋯', 358, 56, { size: 18, color: MUTED }));

  // Title
  els.push(text('AI agents need iterative', 24, 96, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('evaluation loops', 24, 122, { size: 22, weight: 'bold', color: TEXT }));

  els.push(text('Apr 3, 2026  ·  2 min read', 24, 150, { size: 11, color: MUTED }));

  // Tags
  const tags = ['ai-agents', 'eval', 'nngroup'];
  let tx = 24;
  tags.forEach(tag => {
    const tw = tag.length * 7 + 18;
    els.push(rect(tx, 164, tw, 20, 'rgba(124,110,242,0.12)', { radius: 10 }));
    els.push(text('#' + tag, tx + 9, 177, { size: 9, color: ACCENT }));
    tx += tw + 8;
  });

  els.push(line(24, 194, 366, 194, DIM));

  // Body
  const body = [
    { t: 'An AI agent pursues a goal by iteratively taking', c: TEXT },
    { t: 'actions, evaluating progress, and deciding next steps.', c: TEXT },
    { t: '', c: '' },
    { t: 'Unlike a single-shot LLM call, the agent runs a loop:', c: TEXT },
    { t: '', c: '' },
    { t: '  1.  Observe — capture the current world state', c: MUTED },
    { t: '  2.  Reason — choose the best next action', c: MUTED },
    { t: '  3.  Act — execute a tool or generate output', c: MUTED },
    { t: '  4.  Evaluate — measure how close to the goal', c: ACCENT2 },
    { t: '', c: '' },
    { t: 'The eval step is the hardest. Without it, agents', c: TEXT },
    { t: 'hallucinate completion rather than measure it.', c: TEXT },
    { t: '', c: '' },
    { t: 'See → Agentic UX must surface loop state to users.', c: ACCENT },
    { t: 'Connected: Copilot UX, Dispatch patterns.', c: ACCENT },
  ];
  body.forEach((l, i) => {
    if (l.t) els.push(text(l.t, 24, 212 + i * 20, { size: 13, color: l.c }));
  });

  // Right AI suggestions bar
  els.push(rect(358, 202, 3, 280, ACCENT, { radius: 2, opacity: 0.22 }));

  // Backlinks
  els.push(rect(0, 574, W, 110, SURFACE));
  els.push(line(0, 574, W, 574, DIM));
  els.push(text('BACKLINKS', 24, 592, { size: 9, weight: 'bold', color: MUTED }));
  els.push(text('3 notes link here', 90, 592, { size: 9, color: MUTED, opacity: 0.7 }));
  [
    'Dispatch: AI agent UX patterns',
    'LLM limits in practice',
    'KNOT: design principles',
  ].forEach((bl, i) => {
    const by = 606 + i * 24;
    els.push(rect(24, by, 3, 16, ACCENT, { radius: 2, opacity: 0.5 }));
    els.push(text(bl, 32, by + 13, { size: 11, color: TEXT }));
    els.push(text('→', 350, by + 13, { size: 11, color: MUTED, align: 'right' }));
  });

  // Nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['◉ Graph', '✎ Notes', '⊕ Capture', '⌕ Search', '☀ Daily'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 1;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(233,237,246,0.2)', { radius: 2 }));
  return { id: 'screen-2', name: 'Note', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 3: CAPTURE ───────────────────────────────────────────────────────
function screenCapture() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('←', 20, 56, { size: 18, color: TEXT }));
  els.push(text('Capture', 195, 56, { size: 16, weight: 'semibold', color: TEXT, align: 'center' }));
  els.push(circle(334, 52, 5, ERR));
  els.push(circle(334, 52, 9, ERR, { opacity: 0.2 }));
  els.push(text('REC', 346, 55, { size: 10, weight: 'bold', color: ERR }));

  // Meeting card
  els.push(rect(20, 76, 350, 56, SURFACE, { radius: 10 }));
  els.push(rect(20, 76, 3, 56, ACCENT2, { radius: 2 }));
  els.push(text('Product Sync — Apr 4, 2026', 34, 96, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('9:00–10:00 AM · Sarah, Marco, Lena, you · 12 min in', 34, 116, { size: 11, color: MUTED }));

  // Notes area
  els.push(text('NOTES', 20, 152, { size: 9, weight: 'bold', color: MUTED }));
  els.push(rect(20, 166, 350, 196, SURFACE, { radius: 10 }));
  els.push(rect(20, 166, 350, 2, ACCENT2, { radius: 2 }));

  [
    { t: '— Sarah: Q2 roadmap needs final sign-off', c: TEXT },
    { t: '  by end of week', c: TEXT },
    { t: '', c: '' },
    { t: '— Marco: Dispatch integration blocked by', c: TEXT },
    { t: '  API rate limits — needs eng escalation', c: TEXT },
    { t: '', c: '' },
    { t: '— Lena: User research found 3 pain points', c: TEXT },
    { t: '  in onboarding — will share deck async', c: TEXT },
    { t: '', c: '' },
    { t: 'Eval loop + AI agents came up ▋', c: ACCENT2 },
  ].forEach((l, i) => {
    if (l.t) els.push(text(l.t, 30, 184 + i * 18, { size: 12, color: l.c }));
  });

  // AI extraction
  els.push(text('AI EXTRACTION', 20, 378, { size: 9, weight: 'bold', color: MUTED }));
  els.push(rect(20, 392, 350, 224, 'rgba(52,211,153,0.04)', { radius: 10 }));
  els.push(rect(20, 392, 350, 2, ACCENT2, { radius: 2 }));
  els.push(text('◉ Extracting in real-time...', 34, 412, { size: 10, weight: 'semibold', color: ACCENT2 }));

  els.push(text('ACTION ITEMS', 34, 434, { size: 9, weight: 'bold', color: MUTED }));
  [
    { who: 'Sarah', task: 'Q2 roadmap sign-off', due: 'this week' },
    { who: 'Marco', task: 'Escalate API rate limit to eng', due: 'today' },
    { who: 'Lena',  task: 'Share UX research deck', due: 'async' },
  ].forEach((a, i) => {
    const ay = 450 + i * 32;
    els.push(rect(34, ay + 2, 3, 18, ACCENT2, { radius: 2, opacity: 0.6 }));
    els.push(text(`${a.who}: ${a.task}`, 44, ay + 15, { size: 11, color: TEXT }));
    els.push(text(a.due, 318, ay + 15, { size: 10, color: WARN, align: 'right' }));
  });

  els.push(text('DECISIONS', 34, 552, { size: 9, weight: 'bold', color: MUTED }));
  els.push(rect(34, 566, 312, 22, 'rgba(124,110,242,0.08)', { radius: 4 }));
  els.push(text('Dispatch integration → P1 next sprint', 44, 581, { size: 11, color: ACCENT }));

  els.push(text('SUGGESTED LINKS', 34, 604, { size: 9, weight: 'bold', color: MUTED }));
  let cx = 34;
  ['Dispatch', 'API rate limits', 'Agentic UX'].forEach(ch => {
    const cw = ch.length * 7 + 18;
    els.push(rect(cx, 616, cw, 20, 'rgba(124,110,242,0.12)', { radius: 10 }));
    els.push(text(ch, cx + 9, 629, { size: 10, color: ACCENT }));
    cx += cw + 8;
  });

  els.push(rect(20, 700, 350, 44, ACCENT2, { radius: 10 }));
  els.push(text('Save & Link Notes', 195, 726, { size: 14, weight: 'bold', color: BG, align: 'center' }));

  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['◉ Graph', '✎ Notes', '⊕ Capture', '⌕ Search', '☀ Daily'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 2;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(233,237,246,0.2)', { radius: 2 }));
  return { id: 'screen-3', name: 'Capture', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 4: SEMANTIC SEARCH ───────────────────────────────────────────────
function screenSearch() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  // Search bar
  els.push(rect(20, 34, 350, 40, SURFACE, { radius: 20 }));
  els.push(rect(20, 34, 350, 2, ACCENT, { radius: 2 }));
  els.push(circle(46, 54, 8, ACCENT, { opacity: 0.55 }));
  els.push(text('eval loop AI agents', 62, 59, { size: 14, color: TEXT }));
  els.push(text('✕', 348, 59, { size: 13, color: MUTED }));

  // Synthesis card
  els.push(rect(20, 88, 350, 112, 'rgba(52,211,153,0.05)', { radius: 12 }));
  els.push(rect(20, 88, 3, 112, ACCENT2, { radius: 2 }));
  els.push(text('AI SYNTHESIS', 34, 106, { size: 9, weight: 'bold', color: ACCENT2 }));
  els.push(text('Your notes describe eval loops as the', 34, 126, { size: 13, color: TEXT }));
  els.push(text('critical missing piece in agentic systems.', 34, 144, { size: 13, color: TEXT }));
  els.push(text('Key tension: agents hallucinate completion', 34, 164, { size: 12, color: MUTED }));
  els.push(text('vs. actually measuring it. 4 notes explore this.', 34, 180, { size: 12, color: MUTED }));

  // Tabs
  els.push(rect(20, 212, 350, 32, SURFACE, { radius: 8 }));
  ['Notes (4)', 'Threads (7)', 'Captures (2)'].forEach((t, i) => {
    const tx2 = 30 + i * 118;
    const active = i === 0;
    els.push(text(t, tx2, 232, { size: 12, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED }));
    if (active) els.push(rect(tx2 - 4, 240, t.length * 7.5 + 4, 2, ACCENT));
  });

  els.push(text('4 notes found', 20, 260, { size: 10, color: MUTED }));

  [
    { title: 'AI agents need iterative evaluation loops', date: 'Apr 3', match: 98, excerpt: 'An AI agent pursues a goal by iteratively...', tags: ['ai-agents', 'eval'] },
    { title: 'Dispatch: AI agent UX patterns',           date: 'Apr 2', match: 91, excerpt: 'The eval loop must surface to users in real...', tags: ['dispatch', 'agentic-ux'] },
    { title: 'LLM limits in practice',                   date: 'Mar 30', match: 84, excerpt: 'Single-shot calls fail for goal-directed...', tags: ['llm', 'eval'] },
    { title: 'Tool use and grounding',                   date: 'Mar 28', match: 72, excerpt: 'Grounding via tool use helps agents avoid...', tags: ['tool-use', 'grounding'] },
  ].forEach((r, i) => {
    const ry = 276 + i * 100;
    els.push(rect(20, ry, 350, 90, SURFACE, { radius: 10 }));
    els.push(rect(20, ry, 3, 90, ACCENT, { radius: 2, opacity: r.match / 100 * 0.9 }));
    els.push(text(r.title, 32, ry + 18, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(r.date, 32, ry + 36, { size: 10, color: MUTED }));
    els.push(text(`${r.match}% match`, 310, ry + 36, { size: 10, color: ACCENT, align: 'right' }));
    els.push(text(r.excerpt, 32, ry + 54, { size: 11, color: MUTED }));
    let lx = 32;
    r.tags.forEach(tag => {
      const tw = tag.length * 6.5 + 12;
      els.push(rect(lx, ry + 70, tw, 16, 'rgba(124,110,242,0.1)', { radius: 3 }));
      els.push(text('#' + tag, lx + 6, ry + 81, { size: 8, color: ACCENT }));
      lx += tw + 6;
    });
  });

  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['◉ Graph', '✎ Notes', '⊕ Capture', '⌕ Search', '☀ Daily'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 3;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(233,237,246,0.2)', { radius: 2 }));
  return { id: 'screen-4', name: 'Semantic Search', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 5: DAILY DIGEST ──────────────────────────────────────────────────
function screenDaily() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push({ type: 'ellipse', cx: 195, cy: 185, rx: 240, ry: 160, fill: ACCENT, opacity: 0.04 });
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  els.push(text('Good morning.', 24, 58, { size: 26, weight: 'bold', color: TEXT }));
  els.push(text('Saturday, April 4', 24, 86, { size: 14, color: MUTED }));

  // Stats
  els.push(rect(20, 108, 350, 74, SURFACE, { radius: 12 }));
  [
    { label: 'NOTES',   val: '247', sub: '+3 today' },
    { label: 'THREADS', val: '89',  sub: '+7 this wk' },
    { label: 'CAPTURES',val: '12',  sub: 'this month' },
  ].forEach((s, i) => {
    const sx = 36 + i * 118;
    els.push(text(s.label, sx, 126, { size: 8, weight: 'bold', color: MUTED }));
    els.push(text(s.val,   sx, 150, { size: 20, weight: 'bold', color: TEXT }));
    els.push(text(s.sub,   sx, 170, { size: 9, color: ACCENT2 }));
    if (i < 2) els.push(line(sx + 78, 118, sx + 78, 174, DIM));
  });

  // Thought partner
  els.push(text('YOUR THOUGHT PARTNER', 20, 206, { size: 9, weight: 'bold', color: MUTED }));
  els.push(rect(20, 220, 350, 136, 'rgba(124,110,242,0.05)', { radius: 12 }));
  els.push(rect(20, 220, 3, 136, ACCENT, { radius: 2 }));
  els.push(text('Three ideas worth connecting', 34, 240, { size: 15, weight: 'semibold', color: TEXT }));
  [
    'AI agents + Eval loops: 3 notes this week. Ready to synthesize?',
    '"Agentic UX" not yet linked to "Dispatch" — strong overlap.',
    'Unresolved Mar 28: "How do agents know when they\'re done?"',
  ].forEach((ins, i) => {
    const iy = 262 + i * 28;
    els.push(text('◈', 34, iy + 12, { size: 10, color: ACCENT, opacity: 0.8 }));
    const short = ins.length > 52 ? ins.slice(0, 52) + '…' : ins;
    els.push(text(short, 50, iy + 12, { size: 11, color: MUTED }));
  });

  // Suggested connections
  els.push(text('SUGGESTED CONNECTIONS', 20, 378, { size: 9, weight: 'bold', color: MUTED }));
  [
    { from: 'AI agents eval loop',   to: 'Dispatch patterns', sColor: ACCENT2 },
    { from: 'Meeting: Product Sync', to: 'API rate limits',   sColor: WARN },
    { from: 'LLM limits',            to: 'Grounding',          sColor: ACCENT },
  ].forEach((s, i) => {
    const sy = 394 + i * 72;
    els.push(rect(20, sy, 350, 62, SURFACE, { radius: 10 }));
    els.push(rect(20, sy, 3, 62, s.sColor, { radius: 2 }));
    els.push(text(s.from, 34, sy + 18, { size: 12, weight: 'semibold', color: TEXT }));
    els.push(text('—→', 190, sy + 30, { size: 14, color: ACCENT, align: 'center' }));
    els.push(text(s.to, 218, sy + 18, { size: 12, weight: 'semibold', color: TEXT }));
    els.push(text('Link →', 34, sy + 46, { size: 11, color: ACCENT }));
    els.push(text('Dismiss', 96, sy + 46, { size: 11, color: MUTED }));
  });

  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['◉ Graph', '✎ Notes', '⊕ Capture', '⌕ Search', '☀ Daily'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 4;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(233,237,246,0.2)', { radius: 2 }));
  return { id: 'screen-5', name: 'Daily', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── ASSEMBLE & WRITE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'KNOT — Personal Knowledge Graph & AI Thought Partner',
    description: 'Dark obsidian PKM app. Knowledge graph with violet connection threads, note view with backlinks + AI suggestions, meeting capture with intelligence extraction, semantic search with AI synthesis, and daily AI thought partner digest. Inspired by Reflect networked notes (godly.website) and Amie AI note taker (godly.website).',
    author: 'RAM Design AI',
    created: new Date().toISOString(),
    theme: 'dark',
    tags: ['dark', 'knowledge-graph', 'pkm', 'notes', 'ai', 'obsidian-style'],
  },
  screens: [
    screenGraph(),
    screenNote(),
    screenCapture(),
    screenSearch(),
    screenDaily(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'knot.pen'), JSON.stringify(pen, null, 2));
console.log('✓ knot.pen written —', pen.screens.length, 'screens');
