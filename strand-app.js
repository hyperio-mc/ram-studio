// STRAND — AI-assisted knowledge threading for solo founders
// Palette: ultra-dark near-black + soft violet + warm white + gold
// Inspired by:
//   - Midday.ai (darkmodedesign.com) — "one-person company" clarity, serif/sans hybrid
//   - Linear.app (godly.website) — near-black #08090A, Inter Variable editorial weight
//   - Relace AI / Sparkles (lapa.ninja) — AI-first solo workflow tools

const fs   = require('fs');
const path = require('path');

// ── Palette (directly from Linear #08090A + Midday research) ─────────────────
const C = {
  bg:       '#08090A',   // Linear's exact background (darkmodedesign.com research)
  surface:  '#0E1012',   // slightly lifted
  surface2: '#141619',   // card surface
  surface3: '#1C2026',   // elevated / hover
  border:   '#1F2428',   // hairline
  border2:  '#2A3038',   // stronger dividers
  fg:       '#EDEDEA',   // warm near-white (not pure #FFF)
  fg2:      '#8A9099',   // muted text
  fg3:      '#4A5260',   // very muted
  accent:   '#7C6EFC',   // soft violet (distinct from green/cyan tropes)
  accentLt: '#C3B1FF',   // light lavender
  accentDim:'#7C6EFC22', // tinted bg
  accentBrd:'#7C6EFC44', // tinted border
  gold:     '#F2C84B',   // warm gold for highlights
  goldDim:  '#F2C84B22',
  coral:    '#FF6B6B',   // warm coral for alerts
  teal:     '#4ECDC4',   // cool teal for tags
  tealDim:  '#4ECDC422',
  white:    '#FFFFFF',
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ── UID ───────────────────────────────────────────────────────────────────────
let _uid = 1000;
const uid = () => `el-${_uid++}`;

// ── Primitive builders ────────────────────────────────────────────────────────
const R = (x, y, w, h, fill, r = 0, opts = {}) => ({
  id: uid(), type: 'rectangle',
  x, y, width: w, height: h, fill,
  cornerRadius: r, ...opts,
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse',
  x, y, width: w, height: h, fill, ...opts,
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content,
  x, y, width: w, height: h,
  fontSize: opts.size || 13,
  fill: opts.fill || C.fg,
  fontFamily: opts.font || 'Inter',
  fontWeight: opts.weight || 400,
  letterSpacing: opts.ls || 0,
  lineHeight: opts.lh || 1.4,
  textAlignHorizontal: opts.align || 'left',
  textAlignVertical: opts.valign || 'top',
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

// Frame with optional children
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame',
  x, y, width: w, height: h, fill,
  cornerRadius: opts.r || 0,
  clip: opts.clip !== undefined ? opts.clip : true,
  ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const HR = (x, y, w, fill) => R(x, y, w, 1, fill);
const VR = (x, y, h, fill) => R(x, y, 1, h, fill);

// ── Components ────────────────────────────────────────────────────────────────

// Pill tag
function Tag(x, y, label, color = C.accent, textColor = null) {
  const len = label.length * 6.5 + 16;
  return [
    R(x, y, len, 20, color + '22', 10),
    T(label, x + 8, y + 3, len - 16, 14, {
      size: 9.5, fill: textColor || color, weight: 600, ls: 0.3,
    }),
  ];
}

// Avatar
function Av(x, y, size, initials, bg = C.surface3) {
  return [
    R(x, y, size, size, bg, size / 2),
    T(initials, x, y, size, size, {
      size: size * 0.38, fill: C.accentLt, weight: 700,
      align: 'center', valign: 'middle',
    }),
  ];
}

// Dot indicator
function Dot(x, y, color) {
  return [E(x, y, 7, 7, color)];
}

// Stat badge
function StatBadge(x, y, label, value, color = C.accent) {
  return [
    R(x, y, 80, 48, C.surface2, 8, { stroke: C.border, sw: 1 }),
    T(label, x + 10, y + 10, 60, 12, { size: 8, fill: C.fg3, ls: 1 }),
    T(value, x + 10, y + 26, 60, 16, { size: 14, fill: color, weight: 700 }),
  ];
}

// Node card (knowledge node)
function NodeCard(x, y, w, type, title, preview, tags = [], color = C.accent) {
  const h = 88;
  const els = [
    R(x, y, w, h, C.surface2, 10, { stroke: C.border, sw: 1 }),
    R(x, y, 3, h, color, 10),   // left accent stripe
    T(type, x + 14, y + 12, w - 28, 12, {
      size: 8.5, fill: color, weight: 700, ls: 1.5,
    }),
    T(title, x + 14, y + 26, w - 28, 18, {
      size: 13, fill: C.fg, weight: 600,
    }),
    T(preview, x + 14, y + 48, w - 28, 28, {
      size: 10.5, fill: C.fg2, lh: 1.5,
    }),
  ];
  let tagX = x + 14;
  tags.forEach(([label, col]) => {
    const tw = label.length * 5.5 + 12;
    els.push(...Tag(tagX, y + h - 22, label, col || color));
    tagX += tw + 6;
  });
  return els;
}

// Progress bar
function ProgressBar(x, y, w, h, pct, color = C.accent) {
  return [
    R(x, y, w, h, C.surface3, h / 2),
    R(x, y, Math.round(w * pct), h, color, h / 2),
  ];
}

// Connection line (for graph)
function ConnLine(x1, y1, x2, y2, color = C.accent) {
  // Approximate with a rectangle along the angle
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return [R(x1, y1, len, 1.5, color + '55', 1, {
    opacity: 0.4,
  })];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

function mobileToday() {
  const W = W_M, H = H_M;
  const PAD = 20;
  const ch = [];

  // Ambient glow
  ch.push(E(W * 0.6, -60, 280, 280, C.accent, { opacity: 0.06 }));

  // Status bar
  ch.push(T('9:41', PAD, 14, 60, 16, { size: 12, fill: C.fg, weight: 600 }));
  ch.push(T('●●●', W - 70, 14, 60, 16, { size: 10, fill: C.fg2, align: 'right' }));

  // Nav
  ch.push(T('STRAND', PAD, 52, 120, 20, {
    size: 15, fill: C.accent, weight: 800, ls: 3,
  }));
  ch.push(...Av(W - PAD - 32, 46, 32, 'YA'));

  // AI Brief card
  ch.push(R(PAD, 88, W - PAD * 2, 88, C.accent + '10', 14, {
    stroke: C.accent + '30', sw: 1,
  }));
  ch.push(T('✦  AI DAILY BRIEF', PAD + 14, 100, W - PAD * 2 - 28, 14, {
    size: 9, fill: C.accent, weight: 700, ls: 1.5,
  }));
  ch.push(T(
    '"3 strands intersect on competitive positioning. Synthesis ready.\nRelated: Porter\'s Five Forces, Notion AI notes, market research doc."',
    PAD + 14, 118, W - PAD * 2 - 28, 50,
    { size: 11, fill: C.fg2, lh: 1.55 }
  ));
  ch.push(T('VIEW SYNTHESIS →', W - PAD * 2 - 28, 156, 120, 16, {
    size: 9, fill: C.accent, weight: 700, align: 'right',
  }));

  // Section label
  ch.push(T('ACTIVE STRANDS', PAD, 194, 200, 14, {
    size: 8.5, fill: C.fg3, weight: 600, ls: 2,
  }));
  ch.push(HR(PAD, 210, W - PAD * 2, C.border));

  // Strand cards
  const strands = [
    { type: 'RESEARCH', title: 'Competitor Landscape Q1', preview: 'Notion, Linear, Coda — mapping AI feature gaps...', tags: [['AI', C.accent], ['MARKET']], color: C.accent },
    { type: 'IDEA', title: 'Pricing model rethink', preview: 'Seat-based vs. usage-based — token metering fits...', tags: [['STRATEGY', C.gold], ['PRICING']], color: C.gold },
    { type: 'CAPTURE', title: 'Podcast notes: Lenny', preview: '"Activation within 3 minutes is the only KPI that..."', tags: [['PRODUCT', C.teal]], color: C.teal },
  ];

  let y = 220;
  strands.forEach(s => {
    ch.push(...NodeCard(PAD, y, W - PAD * 2, s.type, s.title, s.preview, s.tags, s.color));
    y += 98;
  });

  // Capture FAB
  ch.push(R(W / 2 - 64, H - 100, 128, 48, C.accent, 24));
  ch.push(T('+ Capture', W / 2 - 64, H - 100, 128, 48, {
    size: 13, fill: C.bg, weight: 700, align: 'center', valign: 'middle',
  }));

  // Bottom nav
  ch.push(R(0, H - 60, W, 60, C.surface, 0, { stroke: C.border, sw: 1 }));
  const navItems = [['Today', true], ['Graph', false], ['Capture', false], ['Insights', false]];
  navItems.forEach(([label, active], i) => {
    const nx = i * (W / 4) + W / 8;
    ch.push(T(label, nx - 30, H - 42, 60, 28, {
      size: 10, fill: active ? C.accent : C.fg3, weight: active ? 700 : 400, align: 'center',
    }));
    if (active) ch.push(R(nx - 20, H - 56, 40, 2, C.accent, 1));
  });

  return { id: uid(), name: 'Mobile — Today', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function mobileStrand() {
  const W = W_M, H = H_M;
  const PAD = 20;
  const ch = [];

  // bg glow
  ch.push(E(W * 0.8, 200, 240, 240, C.gold, { opacity: 0.04 }));

  // Status bar
  ch.push(T('9:41', PAD, 14, 60, 16, { size: 12, fill: C.fg, weight: 600 }));

  // Back nav
  ch.push(T('← Strands', PAD, 52, 120, 18, { size: 12, fill: C.fg2 }));
  ch.push(T('···', W - PAD - 20, 52, 30, 18, { size: 16, fill: C.fg2 }));

  // Thread title
  ch.push(T('RESEARCH', PAD, 82, 200, 14, {
    size: 9, fill: C.accent, weight: 700, ls: 2,
  }));
  ch.push(T('Competitor Landscape Q1', PAD, 98, W - PAD * 2, 28, {
    size: 20, fill: C.fg, weight: 700,
  }));
  ch.push(T('12 nodes · Last updated 2h ago · 3 connections', PAD, 128, W - PAD * 2, 16, {
    size: 10, fill: C.fg3,
  }));

  // Tags row
  ch.push(...Tag(PAD, 148, 'AI', C.accent));
  ch.push(...Tag(PAD + 40, 148, 'MARKET', C.gold));
  ch.push(...Tag(PAD + 100, 148, 'Q1 2026', C.fg3));

  ch.push(HR(PAD, 176, W - PAD * 2, C.border));

  // AI annotation banner
  ch.push(R(PAD, 184, W - PAD * 2, 60, C.accent + '0F', 10, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('✦  AI SYNTHESIS', PAD + 12, 194, 180, 12, { size: 8.5, fill: C.accent, weight: 700, ls: 1.5 }));
  ch.push(T(
    '"Notion + Linear share 4 core AI workflows. Gap: async knowledge threading at solo scale."',
    PAD + 12, 210, W - PAD * 2 - 24, 28,
    { size: 10.5, fill: C.fg2, lh: 1.5 }
  ));

  // Timeline nodes
  const nodes = [
    { time: '10:22', label: 'NOTE', content: 'Linear\'s new AI sidebar — auto-tagging issues to knowledge base', color: C.accent },
    { time: 'Yesterday', label: 'LINK', content: 'Notion AI "Q&A" — scoped to workspace only, no cross-app threading', color: C.teal },
    { time: 'Mar 17', label: 'CAPTURE', content: 'Lenny podcast: "The magic is in the connection, not the note"', color: C.gold },
    { time: 'Mar 16', label: 'RESEARCH', content: 'Coda AI — strongest at structured docs, weakest at unstructured capture', color: C.accent },
  ];

  let y = 256;
  nodes.forEach((n, i) => {
    // Timeline dot + line
    ch.push(E(PAD + 2, y + 8, 10, 10, n.color));
    if (i < nodes.length - 1) ch.push(R(PAD + 6, y + 18, 2, 60, C.border));

    ch.push(T(n.time, PAD + 20, y + 6, 70, 12, { size: 9, fill: C.fg3 }));
    ch.push(...Tag(PAD + 96, y + 2, n.label, n.color));
    ch.push(T(n.content, PAD + 20, y + 24, W - PAD * 2 - 20, 28, {
      size: 11, fill: C.fg2, lh: 1.5,
    }));
    y += 70;
  });

  // Bottom actions
  ch.push(R(0, H - 60, W, 60, C.surface, 0, { stroke: C.border, sw: 1 }));
  ch.push(R(PAD, H - 50, W - PAD * 2 - 60, 40, C.surface3, 20, { stroke: C.border, sw: 1 }));
  ch.push(T('Add to this strand…', PAD + 16, H - 42, W - PAD * 2 - 80, 24, { size: 12, fill: C.fg3, valign: 'middle' }));
  ch.push(R(W - PAD - 48, H - 50, 48, 40, C.accent, 20));
  ch.push(T('✦', W - PAD - 48, H - 50, 48, 40, { size: 16, fill: C.bg, align: 'center', valign: 'middle' }));

  return { id: uid(), name: 'Mobile — Strand View', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function mobileGraph() {
  const W = W_M, H = H_M;
  const PAD = 20;
  const ch = [];

  // bg atmosphere
  ch.push(E(W / 2, H / 2, 380, 380, C.accent, { opacity: 0.05 }));
  ch.push(E(W * 0.8, H * 0.7, 180, 180, C.gold, { opacity: 0.04 }));

  // Status bar
  ch.push(T('9:41', PAD, 14, 60, 16, { size: 12, fill: C.fg, weight: 600 }));

  // Header
  ch.push(T('KNOWLEDGE GRAPH', PAD, 52, 220, 18, { size: 13, fill: C.fg, weight: 700 }));
  ch.push(T('24 nodes · 38 connections', PAD, 72, 200, 14, { size: 10, fill: C.fg3 }));

  // Filter bar
  ch.push(R(PAD, 92, W - PAD * 2, 36, C.surface2, 18, { stroke: C.border, sw: 1 }));
  ch.push(T('🔍 Filter by tag or date…', PAD + 16, 92, W - PAD * 2 - 32, 36, {
    size: 11, fill: C.fg3, valign: 'middle',
  }));

  // Graph canvas area
  const GY = 140, GH = 460;
  ch.push(R(PAD, GY, W - PAD * 2, GH, C.surface, 16, { stroke: C.border, sw: 1 }));

  // Draw nodes as circles with labels
  const nodes = [
    { x: 170, y: 250, r: 28, label: 'Competitor\nLandscape', color: C.accent, main: true },
    { x: 80, y: 170, r: 18, label: 'Notion AI', color: C.teal },
    { x: 280, y: 190, r: 18, label: 'Linear', color: C.accent },
    { x: 300, y: 310, r: 18, label: 'Pricing', color: C.gold },
    { x: 60, y: 310, r: 18, label: 'Lenny Pod', color: C.gold },
    { x: 170, y: 380, r: 14, label: 'Q1 Market', color: C.fg3 },
    { x: 90, y: 400, r: 14, label: 'Coda', color: C.teal },
    { x: 255, y: 420, r: 14, label: 'Usage\nMetrics', color: C.coral },
  ];

  // Connection lines first
  const edges = [[0,1],[0,2],[0,3],[0,4],[1,6],[3,5],[4,5],[2,7]];
  edges.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    ch.push(R(
      PAD + na.x, GY + na.y,
      Math.sqrt((nb.x-na.x)**2 + (nb.y-na.y)**2), 1.5,
      na.color + '40', 1
    ));
  });

  // Node circles
  nodes.forEach(n => {
    ch.push(E(PAD + n.x - n.r, GY + n.y - n.r, n.r * 2, n.r * 2,
      n.color + (n.main ? '30' : '1A'), { stroke: n.color + (n.main ? 'AA' : '55'), sw: 1 }));
    if (n.main) {
      ch.push(E(PAD + n.x - n.r + 4, GY + n.y - n.r + 4, (n.r - 4) * 2, (n.r - 4) * 2, n.color + '20'));
    }
    ch.push(T(n.label, PAD + n.x - 30, GY + n.y - 10, 60, 20, {
      size: n.main ? 8.5 : 7.5, fill: n.main ? C.fg : C.fg2, weight: n.main ? 700 : 400,
      align: 'center',
    }));
  });

  // Selected node panel
  ch.push(R(PAD, GY + GH + 8, W - PAD * 2, 80, C.surface2, 12, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('SELECTED NODE', PAD + 12, GY + GH + 20, 200, 12, { size: 8.5, fill: C.accent, weight: 700, ls: 1.5 }));
  ch.push(T('Competitor Landscape Q1', PAD + 12, GY + GH + 36, W - PAD * 2 - 24, 18, { size: 14, fill: C.fg, weight: 600 }));
  ch.push(T('12 nodes · 8 connections · RESEARCH', PAD + 12, GY + GH + 56, W - PAD * 2 - 24, 14, { size: 10, fill: C.fg3 }));

  // Bottom nav
  ch.push(R(0, H - 60, W, 60, C.surface, 0, { stroke: C.border, sw: 1 }));
  const navItems = [['Today', false], ['Graph', true], ['Capture', false], ['Insights', false]];
  navItems.forEach(([label, active], i) => {
    const nx = i * (W / 4) + W / 8;
    ch.push(T(label, nx - 30, H - 42, 60, 28, {
      size: 10, fill: active ? C.accent : C.fg3, weight: active ? 700 : 400, align: 'center',
    }));
    if (active) ch.push(R(nx - 20, H - 56, 40, 2, C.accent, 1));
  });

  return { id: uid(), name: 'Mobile — Graph', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function mobileCapture() {
  const W = W_M, H = H_M;
  const PAD = 20;
  const ch = [];

  // bg glow
  ch.push(E(W / 2, H * 0.3, 300, 300, C.accent, { opacity: 0.05 }));

  // Status bar
  ch.push(T('9:41', PAD, 14, 60, 16, { size: 12, fill: C.fg, weight: 600 }));

  // Header
  ch.push(T('← Back', PAD, 52, 80, 18, { size: 12, fill: C.fg2 }));
  ch.push(T('CAPTURE', W / 2 - 50, 52, 100, 18, { size: 12, fill: C.fg, weight: 700, align: 'center' }));

  // Capture modes
  const modes = [
    { label: 'TEXT', active: true, color: C.accent },
    { label: 'VOICE', active: false, color: C.fg3 },
    { label: 'LINK', active: false, color: C.fg3 },
    { label: 'IMAGE', active: false, color: C.fg3 },
  ];
  ch.push(R(PAD, 80, W - PAD * 2, 40, C.surface2, 20));
  modes.forEach((m, i) => {
    const mx = PAD + i * ((W - PAD * 2) / 4);
    const mw = (W - PAD * 2) / 4;
    if (m.active) ch.push(R(mx + 4, 84, mw - 8, 32, C.accent + '30', 16));
    ch.push(T(m.label, mx, 80, mw, 40, {
      size: 10, fill: m.active ? C.accent : C.fg3, weight: m.active ? 700 : 400,
      align: 'center', valign: 'middle', ls: 1,
    }));
  });

  // Text input area
  ch.push(R(PAD, 134, W - PAD * 2, 200, C.surface, 12, { stroke: C.border, sw: 1 }));
  ch.push(T(
    'The magic moment in Lenny\'s podcast episode with Elena Verna — growth without marketing in B2B SaaS. The key insight: product-qualified leads convert 3× better when the activation event happens before the sales call.\n\nThis connects to our pricing rethink strand — if we gate on usage rather than seats, we create a natural PQL pipeline...',
    PAD + 14, 150, W - PAD * 2 - 28, 170,
    { size: 12, fill: C.fg, lh: 1.6 }
  ));
  // Cursor
  ch.push(R(PAD + 14, 150 + 60, 2, 16, C.accent));

  // AI tagging preview
  ch.push(R(PAD, 346, W - PAD * 2, 72, C.surface2, 10, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('✦  AI AUTO-TAGS', PAD + 12, 358, 180, 12, { size: 8.5, fill: C.accent, weight: 700, ls: 1.5 }));
  ch.push(...Tag(PAD + 12, 376, 'GROWTH', C.teal));
  ch.push(...Tag(PAD + 72, 376, 'PRICING', C.gold));
  ch.push(...Tag(PAD + 132, 376, 'B2B SAAS', C.accent));
  ch.push(...Tag(PAD + 204, 376, 'PQL', C.fg3));

  // Connection suggestion
  ch.push(R(PAD, 430, W - PAD * 2, 68, C.surface2, 10, { stroke: C.border, sw: 1 }));
  ch.push(T('CONNECTS TO', PAD + 12, 442, 180, 12, { size: 8.5, fill: C.fg3, weight: 600, ls: 1.5 }));
  ch.push(T('Pricing model rethink', PAD + 12, 458, W - PAD * 2 - 80, 18, { size: 12, fill: C.fg, weight: 600 }));
  ch.push(R(W - PAD - 60, 448, 48, 28, C.accent + '20', 14, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('Link', W - PAD - 60, 448, 48, 28, { size: 11, fill: C.accent, weight: 600, align: 'center', valign: 'middle' }));

  // Save to strand selector
  ch.push(R(PAD, 510, W - PAD * 2, 52, C.surface2, 10, { stroke: C.border, sw: 1 }));
  ch.push(T('SAVE TO STRAND', PAD + 14, 522, 180, 12, { size: 8.5, fill: C.fg3, weight: 600, ls: 1.5 }));
  ch.push(T('Pricing model rethink ›', PAD + 14, 538, W - PAD * 2 - 28, 16, { size: 12, fill: C.fg, weight: 600 }));

  // Save button
  ch.push(R(PAD, 576, W - PAD * 2, 52, C.accent, 14));
  ch.push(T('Save to Strand', PAD, 576, W - PAD * 2, 52, {
    size: 14, fill: C.bg, weight: 700, align: 'center', valign: 'middle',
  }));
  ch.push(T('Add as new strand', PAD, 636, W - PAD * 2, 20, {
    size: 12, fill: C.fg3, align: 'center',
  }));

  return { id: uid(), name: 'Mobile — Capture', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function mobileInsight() {
  const W = W_M, H = H_M;
  const PAD = 20;
  const ch = [];

  // bg glow
  ch.push(E(-60, 200, 300, 300, C.gold, { opacity: 0.05 }));
  ch.push(E(W + 30, 500, 280, 280, C.accent, { opacity: 0.05 }));

  // Status bar
  ch.push(T('9:41', PAD, 14, 60, 16, { size: 12, fill: C.fg, weight: 600 }));

  // Header
  ch.push(T('INSIGHTS', PAD, 52, 200, 18, { size: 13, fill: C.fg, weight: 700 }));
  ch.push(T('AI-synthesized across your strands', PAD, 72, W - PAD * 2, 14, { size: 10, fill: C.fg3 }));

  // Main insight card
  ch.push(R(PAD, 96, W - PAD * 2, 240, C.surface, 16, {
    stroke: C.gold + '40', sw: 1,
  }));
  ch.push(R(PAD, 96, W - PAD * 2, 4, C.gold, 0));
  ch.push(T('✦  WEEKLY SYNTHESIS', PAD + 16, 114, 200, 12, { size: 9, fill: C.gold, weight: 700, ls: 1.5 }));
  ch.push(T('Positioning Clarity', PAD + 16, 132, W - PAD * 2 - 32, 28, {
    size: 20, fill: C.fg, weight: 700, lh: 1.2,
    font: 'Georgia',  // Midday-inspired serif for emotional insight headings
  }));
  ch.push(T(
    'Your research across 4 strands reveals a clear gap: competitors optimize for team-scale knowledge management, but none address the solo founder\'s need for asynchronous reasoning chains.\n\nSTRAND\'s opportunity: position as "the second brain that thinks while you sleep."',
    PAD + 16, 166, W - PAD * 2 - 32, 130,
    { size: 11.5, fill: C.fg2, lh: 1.6 }
  ));

  // Sources
  ch.push(T('SOURCES', PAD + 16, 312, 100, 12, { size: 8.5, fill: C.fg3, weight: 600, ls: 1.5 }));
  const sources = ['Competitor Landscape Q1 →', 'Pricing model rethink →', 'Lenny podcast →'];
  sources.forEach((s, i) => {
    ch.push(...Tag(PAD + 16 + i * 0, 328 + i * 24, s, C.accent));
  });

  // Smaller insight cards
  const miniInsights = [
    { title: 'Activation Gap', body: '73% of PKM tools lose users in week 2 due to friction at capture stage.', color: C.accent },
    { title: 'Pricing Signal', body: 'Usage-based resonates 2× more with solo founders than seat-based models.', color: C.gold },
  ];

  let insightY = 430;
  miniInsights.forEach(ins => {
    ch.push(R(PAD, insightY, W - PAD * 2, 90, C.surface2, 12, { stroke: C.border, sw: 1 }));
    ch.push(R(PAD, insightY, 3, 90, ins.color, 12));
    ch.push(T('✦  INSIGHT', PAD + 14, insightY + 12, 100, 12, { size: 8.5, fill: ins.color, weight: 700, ls: 1.5 }));
    ch.push(T(ins.title, PAD + 14, insightY + 28, W - PAD * 2 - 28, 18, { size: 14, fill: C.fg, weight: 700 }));
    ch.push(T(ins.body, PAD + 14, insightY + 50, W - PAD * 2 - 28, 32, { size: 10.5, fill: C.fg2, lh: 1.5 }));
    insightY += 100;
  });

  // Bottom nav
  ch.push(R(0, H - 60, W, 60, C.surface, 0, { stroke: C.border, sw: 1 }));
  const navItems = [['Today', false], ['Graph', false], ['Capture', false], ['Insights', true]];
  navItems.forEach(([label, active], i) => {
    const nx = i * (W / 4) + W / 8;
    ch.push(T(label, nx - 30, H - 42, 60, 28, {
      size: 10, fill: active ? C.accent : C.fg3, weight: active ? 700 : 400, align: 'center',
    }));
    if (active) ch.push(R(nx - 20, H - 56, 40, 2, C.accent, 1));
  });

  return { id: uid(), name: 'Mobile — Insights', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

const SB = 240; // sidebar width

function Sidebar(active = 'today') {
  const ch = [];
  ch.push(R(0, 0, SB, H_D, C.surface, 0, { stroke: C.border, sw: 1 }));

  // Logo
  ch.push(T('STRAND', 28, 28, 120, 22, { size: 16, fill: C.accent, weight: 800, ls: 3 }));
  ch.push(T('Beta', 130, 31, 40, 16, {
    size: 9, fill: C.accent, weight: 700, ls: 1,
  }));

  // Search
  ch.push(R(20, 64, SB - 40, 34, C.surface2, 8, { stroke: C.border2, sw: 1 }));
  ch.push(T('🔍 Search strands…', 36, 64, SB - 56, 34, { size: 11, fill: C.fg3, valign: 'middle' }));

  // Nav items
  const navItems = [
    { icon: '◈', label: 'Today', key: 'today' },
    { icon: '⬡', label: 'All Strands', key: 'strands' },
    { icon: '⬕', label: 'Knowledge Graph', key: 'graph' },
    { icon: '✦', label: 'AI Insights', key: 'insights' },
    { icon: '⊕', label: 'Capture', key: 'capture' },
  ];

  navItems.forEach((item, i) => {
    const y = 116 + i * 40;
    const isActive = item.key === active;
    if (isActive) ch.push(R(8, y - 4, SB - 16, 36, C.accent + '18', 8));
    ch.push(T(item.icon, 24, y + 4, 20, 16, { size: 13, fill: isActive ? C.accent : C.fg3, align: 'center' }));
    ch.push(T(item.label, 48, y + 2, SB - 68, 20, { size: 12, fill: isActive ? C.fg : C.fg2, weight: isActive ? 600 : 400 }));
  });

  // Divider
  ch.push(HR(20, 330, SB - 40, C.border));

  // Strands list
  ch.push(T('STRANDS', 20, 344, SB - 40, 12, { size: 8, fill: C.fg3, weight: 700, ls: 2 }));

  const recentStrands = [
    { name: 'Competitor Landscape Q1', color: C.accent },
    { name: 'Pricing model rethink', color: C.gold },
    { name: 'Lenny podcast notes', color: C.gold },
    { name: 'Onboarding research', color: C.teal },
    { name: 'Brand positioning', color: C.accentLt },
  ];
  recentStrands.forEach((s, i) => {
    const y = 364 + i * 34;
    ch.push(E(20, y + 6, 8, 8, s.color));
    ch.push(T(s.name, 36, y + 2, SB - 56, 18, { size: 11, fill: C.fg2, weight: 400 }));
  });

  // User
  ch.push(HR(20, H_D - 72, SB - 40, C.border));
  ch.push(...Av(20, H_D - 54, 32, 'YA'));
  ch.push(T('Yusuf Al-Rashid', 60, H_D - 52, SB - 80, 16, { size: 11, fill: C.fg, weight: 600 }));
  ch.push(T('Free Trial · 8 days left', 60, H_D - 36, SB - 80, 14, { size: 10, fill: C.fg3 }));

  return ch;
}

function desktopDashboard() {
  const W = W_D, H = H_D;
  const ch = [];

  // bg
  ch.push(E(600, 200, 600, 400, C.accent, { opacity: 0.04 }));

  // Sidebar
  ch.push(...Sidebar('today'));

  // Top bar
  ch.push(HR(SB, 0, W - SB, C.border));
  ch.push(T('Today\'s Focus', SB + 32, 20, 300, 24, { size: 18, fill: C.fg, weight: 700 }));
  ch.push(T('Thursday, March 19, 2026', SB + 32, 46, 300, 16, { size: 11, fill: C.fg3 }));
  ch.push(R(W - 180, 20, 140, 34, C.accent, 8));
  ch.push(T('+ New Capture', W - 180, 20, 140, 34, { size: 12, fill: C.bg, weight: 700, align: 'center', valign: 'middle' }));
  ch.push(HR(SB, 68, W - SB, C.border));

  // AI Brief (hero area)
  ch.push(R(SB + 32, 88, W - SB - 380, 96, C.accent + '0E', 12, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('✦  AI DAILY BRIEF', SB + 48, 100, 300, 12, { size: 9, fill: C.accent, weight: 700, ls: 2 }));
  ch.push(T(
    '"3 strands intersect on competitive positioning. Synthesis ready. Relace AI and Sparkles both shipping AI coding agents — relevant to your Competitor Landscape research. Cross-reference: pricing model rethink."',
    SB + 48, 118, W - SB - 420, 54,
    { size: 12, fill: C.fg2, lh: 1.6 }
  ));
  ch.push(T('VIEW FULL SYNTHESIS →', W - 380 - 32, 162, 180, 16, { size: 10, fill: C.accent, weight: 700 }));

  // Stat badges
  const stats = [
    { label: 'ACTIVE STRANDS', value: '12', color: C.accent },
    { label: 'TOTAL NODES', value: '147', color: C.fg },
    { label: 'CONNECTIONS', value: '83', color: C.gold },
    { label: 'AI INSIGHTS', value: '9', color: C.accentLt },
  ];
  const STAT_W = (W - SB - 380 - 64) / 4;
  stats.forEach((s, i) => {
    const sx = SB + 32 + i * (STAT_W + 12);
    ch.push(R(sx, 196, STAT_W, 52, C.surface2, 8, { stroke: C.border, sw: 1 }));
    ch.push(T(s.label, sx + 12, 208, STAT_W - 24, 12, { size: 8, fill: C.fg3, weight: 600, ls: 1 }));
    ch.push(T(s.value, sx + 12, 226, STAT_W - 24, 16, { size: 18, fill: s.color, weight: 800 }));
  });

  // Active strands grid
  ch.push(T('ACTIVE STRANDS', SB + 32, 266, 300, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }));
  ch.push(HR(SB + 32, 282, W - SB - 380 - 64, C.border));

  const strands = [
    { type: 'RESEARCH', title: 'Competitor Landscape Q1', preview: 'Notion, Linear, Coda — mapping AI feature gaps and market positioning...', tags: [['AI', C.accent], ['MARKET', C.fg3]], color: C.accent, nodes: 12, updated: '2h ago' },
    { type: 'IDEA', title: 'Pricing model rethink', preview: 'Seat-based vs. usage-based — token metering creates natural PQL pipeline...', tags: [['STRATEGY', C.gold], ['PRICING', C.fg3]], color: C.gold, nodes: 7, updated: 'Yesterday' },
    { type: 'CAPTURE', title: 'Lenny podcast: Elena Verna', preview: '"Growth without marketing in B2B SaaS — activation before the sales call."', tags: [['GROWTH', C.teal], ['B2B', C.fg3]], color: C.teal, nodes: 4, updated: 'Mar 17' },
    { type: 'RESEARCH', title: 'Onboarding flow research', preview: 'Figma, Notion, Linear — best-in-class flows all share a single magic moment...', tags: [['UX', C.accentLt], ['PRODUCT', C.fg3]], color: C.accentLt, nodes: 9, updated: 'Mar 16' },
  ];
  const CARD_W = (W - SB - 380 - 64 - 24) / 2;
  strands.forEach((s, i) => {
    const sx = SB + 32 + (i % 2) * (CARD_W + 12);
    const sy = 294 + Math.floor(i / 2) * 108;
    ch.push(R(sx, sy, CARD_W, 96, C.surface, 10, { stroke: C.border, sw: 1 }));
    ch.push(R(sx, sy, 3, 96, s.color, 10));
    ch.push(T(s.type, sx + 14, sy + 12, CARD_W - 28, 12, { size: 8.5, fill: s.color, weight: 700, ls: 1.5 }));
    ch.push(T(s.title, sx + 14, sy + 28, CARD_W - 28, 18, { size: 13, fill: C.fg, weight: 600 }));
    ch.push(T(s.preview, sx + 14, sy + 50, CARD_W - 28, 28, { size: 10.5, fill: C.fg2, lh: 1.45 }));
    ch.push(T(`${s.nodes} nodes · ${s.updated}`, sx + CARD_W - 14, sy + 80, 120, 12, { size: 9, fill: C.fg3, align: 'right' }));
  });

  // Right panel — Recent captures
  const RP = W - 340;
  ch.push(R(RP, 68, 340, H - 68, C.surface, 0, { stroke: C.border, sw: 1 }));
  ch.push(T('RECENT CAPTURES', RP + 20, 88, 280, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));
  ch.push(HR(RP + 20, 106, 300, C.border));

  const captures = [
    { type: 'NOTE', content: 'Linear\'s new AI sidebar auto-tags issues to knowledge base. Implications for how STRAND should handle auto-threading.', time: '10:22', color: C.accent },
    { type: 'LINK', content: 'Relace AI — coding agents with async reasoning chains. Maps directly to the "second brain" thesis.', time: '9:15', color: C.teal },
    { type: 'VOICE', content: 'Idea: capture friction is the #1 killer of PKM tools. Voice-first could be the differentiator.', time: 'Yesterday', color: C.gold },
  ];

  captures.forEach((c, i) => {
    const cy = 118 + i * 120;
    ch.push(R(RP + 20, cy, 300, 108, C.surface2, 8, { stroke: C.border, sw: 1 }));
    ch.push(T(c.type, RP + 32, cy + 10, 60, 12, { size: 8, fill: c.color, weight: 700, ls: 1.5 }));
    ch.push(T(c.time, RP + 280, cy + 10, 40, 12, { size: 9, fill: C.fg3, align: 'right' }));
    ch.push(T(c.content, RP + 32, cy + 28, 276, 64, { size: 11, fill: C.fg2, lh: 1.55 }));
  });

  ch.push(R(RP + 20, H - 64, 300, 40, C.accent + '18', 8, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('+ Quick Capture', RP + 20, H - 64, 300, 40, { size: 12, fill: C.accent, weight: 600, align: 'center', valign: 'middle' }));

  return { id: uid(), name: 'Desktop — Dashboard', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function desktopStrandEditor() {
  const W = W_D, H = H_D;
  const ch = [];

  ch.push(E(800, 300, 500, 400, C.accent, { opacity: 0.03 }));

  // Sidebar
  ch.push(...Sidebar('strands'));

  // Top bar
  ch.push(HR(SB, 0, W - SB, C.border));
  ch.push(T('← All Strands', SB + 32, 24, 140, 18, { size: 11, fill: C.fg3 }));

  // Strand title
  ch.push(T('RESEARCH', SB + 180, 14, 200, 14, { size: 9, fill: C.accent, weight: 700, ls: 2 }));
  ch.push(T('Competitor Landscape Q1', SB + 180, 30, 600, 22, { size: 18, fill: C.fg, weight: 700 }));

  // Action buttons
  ch.push(R(W - 260, 20, 100, 32, C.surface2, 8, { stroke: C.border, sw: 1 }));
  ch.push(T('⬡ Add Node', W - 260, 20, 100, 32, { size: 11, fill: C.fg, weight: 500, align: 'center', valign: 'middle' }));
  ch.push(R(W - 148, 20, 120, 32, C.accent, 8));
  ch.push(T('✦ Synthesize', W - 148, 20, 120, 32, { size: 11, fill: C.bg, weight: 700, align: 'center', valign: 'middle' }));

  ch.push(HR(SB, 64, W - SB, C.border));

  // Tags + meta
  ch.push(...Tag(SB + 32, 76, 'AI', C.accent));
  ch.push(...Tag(SB + 72, 76, 'MARKET', C.gold));
  ch.push(...Tag(SB + 130, 76, 'Q1 2026', C.fg3));
  ch.push(T('12 nodes · 38 connections · Updated 2h ago', SB + 210, 80, 400, 14, { size: 10, fill: C.fg3 }));

  // AI Synthesis banner
  ch.push(R(SB + 32, 104, W - SB - 340, 72, C.accent + '0F', 10, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('✦  AI SYNTHESIS', SB + 48, 114, 200, 12, { size: 9, fill: C.accent, weight: 700, ls: 2 }));
  ch.push(T(
    '"Competitors share 4 AI workflow patterns but all target teams. Solo founder gap is unaddressed.\nStrongest opportunity: async reasoning chains with external source threading."',
    SB + 48, 130, W - SB - 380, 40,
    { size: 11.5, fill: C.fg2, lh: 1.55 }
  ));
  ch.push(T('REGENERATE ↻', W - 340 - 28, 158, 140, 14, { size: 9, fill: C.accent, weight: 700 }));

  // Timeline of nodes
  const nodes = [
    { time: '10:22 AM', type: 'NOTE', label: 'Linear new AI sidebar', body: 'Auto-tagging issues to knowledge base. Implications for how STRAND should handle auto-threading vs. user-directed connections. The key difference: Linear is team-mode, STRAND is solo-mode.', color: C.accent },
    { time: '9:15 AM', type: 'LINK', label: 'Relace AI — async coding agents', body: 'Coding agents with async reasoning chains. Maps directly to our "second brain that thinks while you sleep" positioning. Check: how do they handle context windows?', color: C.teal },
    { time: 'Mar 17, 3:44 PM', type: 'CAPTURE', label: 'Lenny: activation magic moment', body: '"Product-qualified leads convert 3× better when activation happens before the sales call." — Elena Verna. This reframes the pricing model: if we can show value before the paywall, we win.', color: C.gold },
    { time: 'Mar 16, 11:20 AM', type: 'RESEARCH', label: 'Coda AI structured docs analysis', body: 'Coda\'s AI is strongest at structured document management, weakest at unstructured idea capture. This is STRAND\'s entry point — capture first, structure later.', color: C.accentLt },
  ];

  let nodeY = 188;
  nodes.forEach((n, i) => {
    const h = 96;
    // timeline line
    if (i < nodes.length - 1) ch.push(R(SB + 44, nodeY + 18, 2, h, C.border));
    // dot
    ch.push(E(SB + 38, nodeY + 8, 12, 12, n.color + '40', { stroke: n.color + 'AA', sw: 1.5 }));
    ch.push(E(SB + 42, nodeY + 12, 4, 4, n.color));

    // card
    ch.push(R(SB + 64, nodeY, W - SB - 400, h, C.surface2, 8, { stroke: C.border, sw: 1 }));
    ch.push(T(n.type, SB + 76, nodeY + 10, 80, 12, { size: 8, fill: n.color, weight: 700, ls: 1.5 }));
    ch.push(T(n.time, W - 400 - 28, nodeY + 10, 140, 12, { size: 9, fill: C.fg3, align: 'right' }));
    ch.push(T(n.label, SB + 76, nodeY + 26, W - SB - 464, 18, { size: 13, fill: C.fg, weight: 600 }));
    ch.push(T(n.body, SB + 76, nodeY + 48, W - SB - 464, 40, { size: 10.5, fill: C.fg2, lh: 1.5 }));

    nodeY += h + 12;
  });

  // Right panel — connections
  const RP = W - 320;
  ch.push(R(RP, 64, 320, H - 64, C.surface, 0, { stroke: C.border, sw: 1 }));
  ch.push(T('CONNECTIONS', RP + 20, 84, 280, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));
  ch.push(HR(RP + 20, 102, 280, C.border));

  const connections = [
    { name: 'Pricing model rethink', nodes: '7 nodes', color: C.gold },
    { name: 'Lenny podcast notes', nodes: '4 nodes', color: C.gold },
    { name: 'Onboarding research', nodes: '9 nodes', color: C.accentLt },
  ];
  connections.forEach((c, i) => {
    const cy = 114 + i * 60;
    ch.push(R(RP + 20, cy, 280, 48, C.surface2, 8, { stroke: C.border, sw: 1 }));
    ch.push(E(RP + 32, cy + 18, 8, 8, c.color));
    ch.push(T(c.name, RP + 48, cy + 12, 200, 16, { size: 12, fill: C.fg, weight: 500 }));
    ch.push(T(c.nodes, RP + 48, cy + 30, 120, 12, { size: 9.5, fill: C.fg3 }));
  });

  return { id: uid(), name: 'Desktop — Strand Editor', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function desktopGraph() {
  const W = W_D, H = H_D;
  const ch = [];

  // Sidebar
  ch.push(...Sidebar('graph'));

  // Top bar
  ch.push(HR(SB, 0, W - SB, C.border));
  ch.push(T('Knowledge Graph', SB + 32, 20, 300, 24, { size: 18, fill: C.fg, weight: 700 }));
  ch.push(T('24 nodes · 38 connections · 12 strands', SB + 32, 46, 400, 16, { size: 11, fill: C.fg3 }));

  // Filters
  const filters = ['All', 'Research', 'Ideas', 'Captures', 'AI Generated'];
  let fx = W - 560;
  filters.forEach((f, i) => {
    const active = i === 0;
    ch.push(R(fx, 24, f.length * 8 + 20, 28, active ? C.accent : C.surface2, 14, {
      stroke: active ? C.accent : C.border, sw: 1,
    }));
    ch.push(T(f, fx, 24, f.length * 8 + 20, 28, {
      size: 10.5, fill: active ? C.bg : C.fg2, weight: active ? 700 : 400,
      align: 'center', valign: 'middle',
    }));
    fx += f.length * 8 + 28;
  });

  ch.push(HR(SB, 64, W - SB, C.border));

  // Graph canvas
  const GX = SB + 20, GY = 74, GW = W - SB - 340, GH = H - 84;
  ch.push(R(GX, GY, GW, GH, C.surface, 8));

  // bg atmosphere glows
  ch.push(E(GX + GW * 0.5, GY + GH * 0.4, 500, 400, C.accent, { opacity: 0.04 }));
  ch.push(E(GX + GW * 0.7, GY + GH * 0.7, 300, 280, C.gold, { opacity: 0.03 }));

  // Nodes
  const graphNodes = [
    { x: 0.45, y: 0.42, r: 40, label: 'Competitor\nLandscape Q1', color: C.accent, main: true },
    { x: 0.25, y: 0.28, r: 26, label: 'Pricing\nRethink', color: C.gold },
    { x: 0.62, y: 0.22, r: 22, label: 'Lenny\nPodcast', color: C.gold },
    { x: 0.72, y: 0.48, r: 20, label: 'Linear\nAI Sidebar', color: C.accent },
    { x: 0.30, y: 0.60, r: 20, label: 'Notion\nAI', color: C.teal },
    { x: 0.20, y: 0.72, r: 18, label: 'Coda\nAnalysis', color: C.teal },
    { x: 0.55, y: 0.68, r: 18, label: 'Onboarding\nResearch', color: C.accentLt },
    { x: 0.72, y: 0.68, r: 16, label: 'Relace\nAI', color: C.teal },
    { x: 0.38, y: 0.78, r: 16, label: 'Usage\nMetrics', color: C.coral },
    { x: 0.80, y: 0.30, r: 14, label: 'Sparkles\nPRs', color: C.fg3 },
    { x: 0.14, y: 0.48, r: 14, label: 'B2B SaaS\nGrowth', color: C.teal },
    { x: 0.60, y: 0.85, r: 12, label: 'Activation\nFlow', color: C.accentLt },
  ];

  const edges = [[0,1],[0,2],[0,3],[0,4],[0,6],[1,2],[1,8],[3,7],[4,5],[5,8],[6,11],[2,9],[4,10]];

  // Draw edges
  edges.forEach(([a, b]) => {
    const na = graphNodes[a], nb = graphNodes[b];
    const x1 = GX + na.x * GW, y1 = GY + na.y * GH;
    const x2 = GX + nb.x * GW, y2 = GY + nb.y * GH;
    const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    ch.push(R(Math.min(x1,x2), Math.min(y1,y2), len, 1.5, na.color + '33', 1));
  });

  // Draw nodes
  graphNodes.forEach(n => {
    const nx = GX + n.x * GW, ny = GY + n.y * GH;
    ch.push(E(nx - n.r, ny - n.r, n.r * 2, n.r * 2, n.color + (n.main ? '25' : '18'), {
      stroke: n.color + (n.main ? 'CC' : '66'), sw: n.main ? 1.5 : 1,
    }));
    if (n.main) {
      ch.push(E(nx - n.r + 6, ny - n.r + 6, (n.r - 6) * 2, (n.r - 6) * 2, n.color + '18'));
    }
    ch.push(T(n.label, nx - 36, ny - 10, 72, 24, {
      size: n.main ? 9.5 : 8, fill: n.main ? C.fg : C.fg2, weight: n.main ? 700 : 400,
      align: 'center', lh: 1.3,
    }));
  });

  // Right panel — selected node
  const RP = W - 320;
  ch.push(R(RP, 64, 320, H - 64, C.surface, 0, { stroke: C.border, sw: 1 }));
  ch.push(T('SELECTED NODE', RP + 20, 84, 280, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));
  ch.push(HR(RP + 20, 102, 280, C.border));

  ch.push(R(RP + 20, 114, 280, 8, C.accent + '30', 4));  // visual node indicator
  ch.push(T('Competitor Landscape Q1', RP + 20, 130, 280, 22, { size: 16, fill: C.fg, weight: 700 }));
  ch.push(T('RESEARCH · 12 nodes · 8 connections', RP + 20, 156, 280, 14, { size: 9.5, fill: C.accent }));

  ch.push(HR(RP + 20, 176, 280, C.border));
  ch.push(T('CONNECTED TO', RP + 20, 190, 280, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));

  const connectedTo = [
    { name: 'Pricing model rethink', color: C.gold },
    { name: 'Lenny podcast', color: C.gold },
    { name: 'Linear AI Sidebar', color: C.accent },
    { name: 'Notion AI', color: C.teal },
    { name: 'Onboarding Research', color: C.accentLt },
  ];
  connectedTo.forEach((c, i) => {
    ch.push(E(RP + 20, 210 + i * 28 + 4, 7, 7, c.color));
    ch.push(T(c.name, RP + 36, 208 + i * 28, 240, 16, { size: 11, fill: C.fg2 }));
  });

  ch.push(HR(RP + 20, 358, 280, C.border));
  ch.push(T('✦  AI SUGGESTED CONNECTIONS', RP + 20, 372, 280, 12, { size: 8, fill: C.accent, weight: 700, ls: 1.5 }));
  const suggested = ['B2B SaaS Growth', 'Activation Flow'];
  suggested.forEach((s, i) => {
    ch.push(R(RP + 20, 390 + i * 48, 280, 38, C.accentDim, 8, { stroke: C.accentBrd, sw: 1 }));
    ch.push(T('+ ' + s, RP + 32, 390 + i * 48, 210, 38, { size: 11, fill: C.accentLt, valign: 'middle' }));
    ch.push(T('Link →', RP + 258, 390 + i * 48, 40, 38, { size: 10, fill: C.accent, weight: 600, align: 'right', valign: 'middle' }));
  });

  return { id: uid(), name: 'Desktop — Knowledge Graph', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function desktopResearch() {
  const W = W_D, H = H_D;
  const ch = [];

  // bg
  ch.push(E(900, -100, 400, 400, C.accent, { opacity: 0.04 }));
  ch.push(E(300, 700, 300, 300, C.gold, { opacity: 0.03 }));

  // Sidebar
  ch.push(...Sidebar('insights'));

  // Header
  ch.push(HR(SB, 0, W - SB, C.border));
  ch.push(T('Research Mode', SB + 32, 20, 300, 24, { size: 18, fill: C.fg, weight: 700 }));
  ch.push(T('Sources + AI Synthesis · Split view', SB + 32, 46, 400, 16, { size: 11, fill: C.fg3 }));

  // Active strand badge
  ch.push(...Tag(W - 260, 26, 'Competitor Landscape Q1', C.accent));
  ch.push(HR(SB, 64, W - SB, C.border));

  const SPLIT = (W - SB) / 2;

  // LEFT: Sources panel
  ch.push(T('SOURCES', SB + 32, 82, 200, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));
  ch.push(HR(SB + 32, 100, SPLIT - 52, C.border));

  const sources = [
    { type: 'LINK', title: 'Notion AI — Official Feature Page', url: 'notion.so/product/ai', preview: 'Q&A scoped to workspace only. No cross-app context. Highlights: summarization, action items, translation...', color: C.teal, active: true },
    { type: 'NOTE', title: 'Personal observation: Linear sidebar', url: 'Captured Mar 18', preview: 'Auto-tags issues to knowledge base. Team-mode only — individual context not preserved between sessions.', color: C.accent, active: false },
    { type: 'CAPTURE', title: 'Lenny podcast: Elena Verna', url: 'Captured Mar 17', preview: '"Growth without marketing in B2B SaaS — the activation moment is everything."', color: C.gold, active: false },
    { type: 'LINK', title: 'Relace AI — Product page', url: 'relace.ai', preview: 'Async coding agents with persistent context. Reasoning chains survive session breaks. Key differentiator...', color: C.teal, active: false },
  ];

  sources.forEach((s, i) => {
    const sy = 110 + i * 110;
    ch.push(R(SB + 32, sy, SPLIT - 52, 98, s.active ? C.surface2 : C.surface, 8, {
      stroke: s.active ? C.accentBrd : C.border, sw: 1,
    }));
    ch.push(T(s.type, SB + 44, sy + 10, 60, 12, { size: 8, fill: s.color, weight: 700, ls: 1.5 }));
    ch.push(T(s.url, SB + 44 + 56, sy + 10, SPLIT - 120, 12, { size: 9, fill: C.fg3 }));
    ch.push(T(s.title, SB + 44, sy + 26, SPLIT - 88, 18, { size: 13, fill: C.fg, weight: 600 }));
    ch.push(T(s.preview, SB + 44, sy + 48, SPLIT - 88, 42, { size: 10.5, fill: C.fg2, lh: 1.5 }));
  });

  // Divider
  ch.push(VR(SB + SPLIT, 64, H - 64, C.border));

  // RIGHT: Synthesis panel
  const RX = SB + SPLIT + 20;
  ch.push(T('AI SYNTHESIS', RX + 12, 82, 200, 12, { size: 8.5, fill: C.accent, weight: 700, ls: 2 }));
  ch.push(HR(RX + 12, 100, W - SB - SPLIT - 52, C.border));

  // Synthesis header
  ch.push(T('Competitive Landscape\nAI Summary', RX + 12, 112, W - SB - SPLIT - 52, 44, {
    size: 22, fill: C.fg, weight: 700, lh: 1.2, font: 'Georgia',
  }));
  ch.push(T('Generated from 4 sources · Updated 2h ago', RX + 12, 162, W - SB - SPLIT - 52, 16, { size: 10, fill: C.fg3 }));

  ch.push(HR(RX + 12, 184, W - SB - SPLIT - 52, C.border));

  // Key findings
  const findings = [
    { title: '01 · The Team vs. Solo Gap', body: 'All major PKM/AI tools (Notion, Linear, Coda) are designed for team context sharing. No tool treats the solo founder\'s asynchronous reasoning chain as a first-class citizen.' },
    { title: '02 · The Activation Problem', body: 'Capture friction kills PKM tools. Users abandon within 2 weeks when the capture flow requires more than 3 taps or context-switching.' },
    { title: '03 · The Positioning Window', body: '"Second brain that thinks while you sleep" — no competitor owns this positioning. AI synthesis running asynchronously is an unexploited wedge.' },
  ];

  let fy = 196;
  findings.forEach(f => {
    ch.push(T(f.title, RX + 12, fy, W - SB - SPLIT - 52, 16, { size: 12, fill: C.accent, weight: 700 }));
    ch.push(T(f.body, RX + 12, fy + 18, W - SB - SPLIT - 52, 52, { size: 11, fill: C.fg2, lh: 1.6 }));
    fy += 84;
  });

  ch.push(HR(RX + 12, fy, W - SB - SPLIT - 52, C.border));
  ch.push(T('RECOMMENDED NEXT ACTIONS', RX + 12, fy + 12, W - SB - SPLIT - 52, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 2 }));

  const actions = [
    '→  Interview 5 solo founders about PKM abandonment triggers',
    '→  Prototype a voice-first capture flow (3 taps max)',
    '→  Draft landing page with "second brain" positioning',
  ];
  actions.forEach((a, i) => {
    ch.push(T(a, RX + 12, fy + 32 + i * 24, W - SB - SPLIT - 52, 18, { size: 11, fill: C.fg2 }));
  });

  ch.push(R(RX + 12, H - 68, W - SB - SPLIT - 52, 44, C.accent, 10));
  ch.push(T('Save Synthesis to Strand →', RX + 12, H - 68, W - SB - SPLIT - 52, 44, {
    size: 13, fill: C.bg, weight: 700, align: 'center', valign: 'middle',
  }));

  return { id: uid(), name: 'Desktop — Research Mode', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

function desktopLanding() {
  const W = W_D, H = H_D;
  const ch = [];

  // Atmospheric glows
  ch.push(E(400, 0, 800, 600, C.accent, { opacity: 0.06 }));
  ch.push(E(1100, 500, 500, 500, C.gold, { opacity: 0.04 }));
  ch.push(E(200, 700, 400, 400, C.teal, { opacity: 0.03 }));

  // Navbar
  ch.push(T('STRAND', 60, 26, 120, 22, { size: 16, fill: C.accent, weight: 800, ls: 3 }));
  const navLinks = ['Product', 'Research', 'Blog', 'Pricing'];
  navLinks.forEach((l, i) => ch.push(T(l, 220 + i * 100, 30, 80, 18, { size: 12, fill: C.fg2 })));
  ch.push(R(W - 200, 18, 80, 34, C.surface2, 8, { stroke: C.border, sw: 1 }));
  ch.push(T('Sign in', W - 200, 18, 80, 34, { size: 12, fill: C.fg, align: 'center', valign: 'middle' }));
  ch.push(R(W - 108, 18, 80, 34, C.accent, 8));
  ch.push(T('Try free', W - 108, 18, 80, 34, { size: 12, fill: C.bg, weight: 700, align: 'center', valign: 'middle' }));
  ch.push(HR(0, 62, W, C.border));

  // Hero — Large type (Linear-style, from research)
  ch.push(T('Untangle', 60, 96, W / 2, 120, {
    size: 108, fill: C.fg, weight: 800, ls: -3, lh: 1.0,
    font: 'Georgia',  // Midday-inspired serif for hero display
  }));
  ch.push(T('your thinking.', 60, 204, W / 2, 96, {
    size: 88, fill: C.accent, weight: 800, ls: -3, lh: 1.0,
    font: 'Georgia',
  }));

  // Subheadline
  ch.push(T(
    'The AI knowledge tool for solo founders who\nneed a second brain that thinks while they sleep.',
    60, 320, 540, 64,
    { size: 20, fill: C.fg2, lh: 1.5, ls: -0.2 }
  ));

  // CTAs
  ch.push(R(60, 404, 180, 52, C.accent, 12));
  ch.push(T('Start free — no CC', 60, 404, 180, 52, { size: 13, fill: C.bg, weight: 700, align: 'center', valign: 'middle' }));
  ch.push(R(256, 404, 160, 52, C.surface2, 12, { stroke: C.border, sw: 1 }));
  ch.push(T('Watch 2-min demo', 256, 404, 160, 52, { size: 13, fill: C.fg, align: 'center', valign: 'middle' }));
  ch.push(T('14-day trial · Cancel anytime · Built for one', 60, 470, 400, 16, { size: 10.5, fill: C.fg3 }));

  // Feature pills
  const features = ['AI auto-synthesis', 'Knowledge graph', 'Voice capture', 'Cross-strand threading', 'Solo-first design'];
  let px = 60, py = 500;
  features.forEach(f => {
    const fw = f.length * 7.5 + 24;
    ch.push(R(px, py, fw, 28, C.accent + '15', 14, { stroke: C.accentBrd, sw: 1 }));
    ch.push(T(f, px, py, fw, 28, { size: 11, fill: C.accentLt, align: 'center', valign: 'middle' }));
    px += fw + 10;
  });

  // Right side — mock UI preview (large)
  const MX = W / 2 + 40, MY = 80, MW = W / 2 - 80, MH = H - 130;
  ch.push(R(MX, MY, MW, MH, C.surface, 16, { stroke: C.border2, sw: 1 }));

  // Mock nav bar inside preview
  ch.push(R(MX, MY, MW, 36, C.surface2, 0));
  ch.push(R(MX + 12, MY + 12, 12, 12, C.coral, 6));
  ch.push(R(MX + 30, MY + 12, 12, 12, C.gold, 6));
  ch.push(R(MX + 48, MY + 12, 12, 12, C.teal + '88', 6));
  ch.push(T('STRAND — Today', MX + 72, MY + 10, 300, 16, { size: 10, fill: C.fg3 }));

  // Mock content
  ch.push(R(MX + 16, MY + 50, MW - 32, 68, C.accent + '0E', 10, { stroke: C.accentBrd, sw: 1 }));
  ch.push(T('✦  AI BRIEF', MX + 28, MY + 62, 100, 12, { size: 8, fill: C.accent, weight: 700, ls: 2 }));
  ch.push(T('"3 strands converge on your pricing model. Synthesis: usage-based pricing aligns with PQL strategy from Lenny research."', MX + 28, MY + 78, MW - 56, 32, { size: 10, fill: C.fg2, lh: 1.5 }));

  // Mock strand cards
  const mockStrands = [
    { label: 'RESEARCH', title: 'Competitor Landscape Q1', color: C.accent },
    { label: 'IDEA', title: 'Pricing model rethink', color: C.gold },
    { label: 'CAPTURE', title: 'Lenny: Elena Verna notes', color: C.teal },
  ];
  mockStrands.forEach((s, i) => {
    const sy = MY + 130 + i * 80;
    ch.push(R(MX + 16, sy, MW - 32, 68, C.surface2, 8, { stroke: C.border, sw: 1 }));
    ch.push(R(MX + 16, sy, 3, 68, s.color, 8));
    ch.push(T(s.label, MX + 28, sy + 10, 100, 12, { size: 7.5, fill: s.color, weight: 700, ls: 1.5 }));
    ch.push(T(s.title, MX + 28, sy + 26, MW - 56, 18, { size: 12, fill: C.fg, weight: 600 }));
    ch.push(R(MX + 28, sy + 48, Math.floor(Math.random() * 40 + 60), 6, s.color + '60', 3));
  });

  // Social proof
  ch.push(HR(0, H - 60, W, C.border));
  ch.push(T('USED BY 2,400+ SOLO FOUNDERS', W / 2, H - 42, 400, 18, {
    size: 9, fill: C.fg3, align: 'center', weight: 600, ls: 2,
  }));

  return { id: uid(), name: 'Desktop — Landing', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, clip: true, children: ch };
}

// ── Assemble document ─────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  name: 'STRAND — AI Knowledge Threading',
  children: [
    mobileToday(),
    mobileStrand(),
    mobileGraph(),
    mobileCapture(),
    mobileInsight(),
    desktopDashboard(),
    desktopStrandEditor(),
    desktopGraph(),
    desktopResearch(),
    desktopLanding(),
  ],
};

const outPath = path.join(__dirname, 'strand.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ strand.pen written — ${doc.children.length} screens`);
console.log(`  Mobile:  ${doc.children.filter(s => s.width < 500).length} screens (${W_M}×${H_M})`);
console.log(`  Desktop: ${doc.children.filter(s => s.width >= 500).length} screens (${W_D}×${H_D})`);
console.log(`  Total elements: ~${JSON.stringify(doc).split('"id"').length - 1}`);
console.log(`  File size: ${(JSON.stringify(doc).length / 1024).toFixed(0)} KB`);
