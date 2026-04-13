'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'surge';
const NAME    = 'SURGE';
const TAGLINE = 'Every API call, accounted for';
const THEME   = 'dark';
const HB      = 99; // heartbeat approximate count

// ── Palette (Neon.com-inspired developer-tool dark + Mortons glow accent) ──────
const C = {
  bg:      '#070A0F',  // near-black navy (Neon.com aesthetic)
  surf:    '#0D1117',  // GitHub dark surface
  card:    '#141C26',  // card lift
  card2:   '#0F1823',  // secondary card
  border:  '#1E2D3D',  // subtle border
  accent:  '#00D4FF',  // electric cyan
  accent2: '#FF5240',  // alert red/coral (Neon.com red)
  green:   '#34C97A',  // success green
  amber:   '#F59E0B',  // warning amber
  text:    '#E2EAF4',  // primary text
  text2:   '#7B8FA6',  // secondary text
  text3:   '#435567',  // tertiary / muted
  glow:    'rgba(0,212,255,0.12)',  // cyan glow
  glow2:   'rgba(255,82,64,0.10)', // red glow
};

const W = 390;
const H = 844;

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 1,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type:'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 1,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── Helper: rounded glow card ──────────────────────────────────────────────
function glowCard(x, y, w, h, glowColor, elements) {
  const bg = rect(x, y, w, h, C.card, { rx:12, stroke: C.border, sw:1 });
  const glow = rect(x, y, w, h, glowColor, { rx:12, opacity:0.07 });
  return [bg, glow, ...elements];
}

// ── Helper: status dot ─────────────────────────────────────────────────────
function statusDot(x, y, color) {
  return circle(x, y, 4, color);
}

// ── Helper: mini bar (for sparklines) ─────────────────────────────────────
function miniBars(x, y, data, w, h, color) {
  const els = [];
  const barW = (w / data.length) - 2;
  const maxV = Math.max(...data);
  data.forEach((v, i) => {
    const bh = (v / maxV) * h;
    const bx = x + i * (barW + 2);
    const by = y + h - bh;
    els.push(rect(bx, by, barW, bh, color, { rx:2, opacity:0.8 }));
  });
  return els;
}

// ── Helper: progress bar ───────────────────────────────────────────────────
function progressBar(x, y, w, pct, fill) {
  return [
    rect(x, y, w, 4, C.border, { rx:2 }),
    rect(x, y, w * pct, 4, fill, { rx:2 }),
  ];
}

// ── Helper: tag chip ───────────────────────────────────────────────────────
function chip(x, y, label, fill, textColor) {
  const tw = label.length * 6.5 + 16;
  return [
    rect(x, y-11, tw, 20, fill, { rx:10, opacity:0.2 }),
    text(x + tw/2, y+3, label, 10, textColor, { fw:600, anchor:'middle', ls:0.5 }),
  ];
}

// ── Helper: bottom nav ─────────────────────────────────────────────────────
function bottomNav(activeIdx) {
  const items = [
    { icon:'◈', label:'Overview' },
    { icon:'⊞', label:'Endpoints' },
    { icon:'⚡', label:'Incidents' },
    { icon:'◎', label:'Usage' },
    { icon:'◉', label:'Settings' },
  ];
  const navW = W;
  const navH = 70;
  const navY = H - navH;
  const els = [
    rect(0, navY, navW, navH, C.surf, { stroke:C.border, sw:1 }),
    line(0, navY, navW, navY, C.border, { sw:1 }),
  ];
  items.forEach((item, i) => {
    const ix = (navW / items.length) * i + (navW / items.length) / 2;
    const isActive = i === activeIdx;
    if (isActive) {
      // Active glow pill
      els.push(rect(ix - 24, navY + 8, 48, 32, C.accent, { rx:16, opacity:0.12 }));
    }
    els.push(text(ix, navY + 26, item.icon, isActive ? 18 : 16, isActive ? C.accent : C.text3, { anchor:'middle', fw: isActive ? 700 : 400 }));
    els.push(text(ix, navY + 46, item.label, 9, isActive ? C.accent : C.text3, { anchor:'middle', fw: isActive ? 600 : 400, ls:0.2 }));
  });
  return { els, height: navH };
}

// ── Helper: top status bar ─────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, C.bg),
    text(16, 29, '9:41', 13, C.text, { fw:600 }),
    text(W - 16, 29, '●●● ⌹ ▮', 11, C.text2, { anchor:'end' }),
  ];
}

// ── Helper: section header ─────────────────────────────────────────────────
function secHeader(y, title, subtitle) {
  const els = [
    rect(0, y, W, 64, C.bg),
    // Logo pill
    rect(16, y + 12, 72, 26, C.accent, { rx:13, opacity:0.12 }),
    text(52, y + 29, 'SURGE', 11, C.accent, { fw:800, anchor:'middle', ls:2 }),
    text(W - 16, y + 29, subtitle, 11, C.text3, { anchor:'end' }),
    text(16, y + 54, title, 20, C.text, { fw:700 }),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — COMMAND OVERVIEW (bento grid, Mortons-glow-inspired cards)
// ══════════════════════════════════════════════════════════════════════════════
function screen1() {
  const nav = bottomNav(0);
  const contentH = H - nav.height;
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
  ];

  // Header
  els.push(rect(0, 44, W, 60, C.bg));
  els.push(rect(16, 56, 64, 24, C.accent, { rx:12, opacity:0.12 }));
  els.push(text(48, 72, 'SURGE', 10, C.accent, { fw:800, anchor:'middle', ls:2.5 }));
  els.push(text(16, 100, 'Command Overview', 22, C.text, { fw:700 }));

  // Live indicator
  els.push(circle(W - 40, 69, 5, C.green, { opacity:0.9 }));
  els.push(circle(W - 40, 69, 9, C.green, { opacity:0.25 }));
  els.push(text(W - 28, 73, 'LIVE', 9, C.green, { fw:700, ls:1 }));

  // ── Row 1: Two metric cards ─────────────────────────────────────────────
  const r1y = 116;
  const cw = (W - 40) / 2;

  // Card A: Total requests
  els.push(...glowCard(16, r1y, cw, 100, C.accent, [
    text(28, r1y + 22, 'REQUESTS', 9, C.text3, { fw:600, ls:1.5 }),
    text(28, r1y + 54, '48.3M', 28, C.text, { fw:700 }),
    text(28, r1y + 74, '↑ 12.4% vs yesterday', 10, C.green),
    ...miniBars(28, r1y + 80, [60,45,70,55,80,65,90,75,100,88], cw - 24, 14, C.accent),
  ]));

  // Card B: Error rate
  els.push(...glowCard(24 + cw, r1y, cw, 100, C.accent2, [
    text(36 + cw, r1y + 22, 'ERROR RATE', 9, C.text3, { fw:600, ls:1.5 }),
    text(36 + cw, r1y + 54, '0.12%', 28, C.text, { fw:700 }),
    text(36 + cw, r1y + 74, '↓ 0.03% improved', 10, C.green),
    ...miniBars(36 + cw, r1y + 80, [15,20,10,18,12,8,14,9,12,8], cw - 24, 14, C.accent2),
  ]));

  // ── Row 2: Latency wide card ────────────────────────────────────────────
  const r2y = r1y + 112;
  els.push(...glowCard(16, r2y, W - 32, 110, C.accent, [
    text(28, r2y + 22, 'P99 LATENCY', 9, C.text3, { fw:600, ls:1.5 }),
    text(28, r2y + 52, '186ms', 32, C.text, { fw:700 }),
    text(170, r2y + 52, 'P50', 10, C.text3, { fw:600, ls:1 }),
    text(170, r2y + 72, '42ms', 18, C.text, { fw:700 }),
    text(240, r2y + 52, 'P95', 10, C.text3, { fw:600, ls:1 }),
    text(240, r2y + 72, '98ms', 18, C.text, { fw:700 }),
    // Thin separator line
    line(160, r2y + 40, 160, r2y + 100, C.border, { sw:1 }),
    // Progress bars
    text(28, r2y + 82, 'Target ≤200ms', 10, C.text3),
    ...progressBar(28, r2y + 96, W - 72, 0.93, C.accent),
    text(W - 40, r2y + 82, '93%', 10, C.accent, { anchor:'end' }),
  ]));

  // ── Row 3: Status + cost ────────────────────────────────────────────────
  const r3y = r2y + 122;
  // Status card
  els.push(...glowCard(16, r3y, cw, 88, C.green, [
    text(28, r3y + 20, 'SYSTEM STATUS', 9, C.text3, { fw:600, ls:1.5 }),
    circle(28, r3y + 50, 6, C.green),
    text(40, r3y + 55, 'All Systems', 14, C.text, { fw:600 }),
    text(28, r3y + 74, '99.97% uptime 30d', 10, C.text2),
  ]));
  // Cost card
  els.push(...glowCard(24 + cw, r3y, cw, 88, C.amber, [
    text(36 + cw, r3y + 20, 'COST TODAY', 9, C.text3, { fw:600, ls:1.5 }),
    text(36 + cw, r3y + 54, '$184', 28, C.text, { fw:700 }),
    text(36 + cw, r3y + 74, '↓ 8% vs avg', 10, C.green),
  ]));

  // ── Row 4: Top endpoints mini list ──────────────────────────────────────
  const r4y = r3y + 100;
  els.push(text(16, r4y + 16, 'Hot Endpoints', 13, C.text, { fw:600 }));
  els.push(text(W - 16, r4y + 16, 'See all →', 11, C.accent, { anchor:'end' }));

  const endpoints = [
    { path:'/v2/inference', rps:'2,340', err:'0.08%', color:C.accent },
    { path:'/v1/embeddings', rps:'890', err:'0.21%', color:C.amber },
    { path:'/v2/chat/stream', rps:'450', err:'1.40%', color:C.accent2 },
  ];
  endpoints.forEach((ep, i) => {
    const ey = r4y + 32 + i * 46;
    els.push(rect(16, ey, W - 32, 40, C.card2, { rx:8, stroke:C.border, sw:1 }));
    els.push(circle(30, ey + 20, 4, ep.color));
    els.push(text(42, ey + 24, ep.path, 12, C.text, { fw:500 }));
    els.push(text(W - 72, ey + 14, ep.rps, 11, C.text2, { anchor:'end' }));
    els.push(text(W - 72, ey + 30, 'req/s', 9, C.text3, { anchor:'end' }));
    els.push(text(W - 24, ey + 14, ep.err, 11, ep.color, { anchor:'end' }));
    els.push(text(W - 24, ey + 30, 'err%', 9, C.text3, { anchor:'end' }));
  });

  els.push(...nav.els);
  return { name:'Command Overview', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════
function screen2() {
  const nav = bottomNav(1);
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
    ...secHeader(44, 'API Endpoints', 'Apr 12'),
  ];

  // Filter chips
  const filters = ['All', 'v2', 'v1', 'Slow', 'Errors'];
  let fx = 16;
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const tw = f.length * 8 + 20;
    els.push(rect(fx, 114, tw, 28, isActive ? C.accent : C.card, { rx:14, opacity: isActive ? 1 : 1, stroke: isActive ? 'none' : C.border, sw:1 }));
    els.push(text(fx + tw/2, 132, f, 11, isActive ? C.bg : C.text2, { fw:600, anchor:'middle' }));
    fx += tw + 8;
  });

  // Column headers
  const listY = 158;
  els.push(text(16, listY, 'Endpoint', 10, C.text3, { fw:600, ls:0.8 }));
  els.push(text(220, listY, 'Latency', 10, C.text3, { fw:600, ls:0.8 }));
  els.push(text(290, listY, 'RPS', 10, C.text3, { fw:600, ls:0.8 }));
  els.push(text(350, listY, 'Err%', 10, C.text3, { fw:600, ls:0.8 }));
  els.push(line(16, listY + 12, W - 16, listY + 12, C.border, { sw:1 }));

  const rows = [
    { method:'POST', path:'/v2/inference',      lat:'42ms',  rps:'2,340', err:'0.08', health:0.99, color:C.accent },
    { method:'POST', path:'/v1/embeddings',     lat:'18ms',  rps:'890',   err:'0.21', health:0.96, color:C.green },
    { method:'GET',  path:'/v2/chat/stream',    lat:'238ms', rps:'450',   err:'1.40', health:0.72, color:C.amber },
    { method:'POST', path:'/v2/completions',    lat:'190ms', rps:'320',   err:'0.33', health:0.88, color:C.accent },
    { method:'GET',  path:'/v1/models',         lat:'8ms',   rps:'210',   err:'0.00', health:1.00, color:C.green },
    { method:'POST', path:'/v2/fine-tune',      lat:'4.2s',  rps:'12',    err:'3.10', health:0.45, color:C.accent2 },
    { method:'DELETE',path:'/v1/sessions/{id}',lat:'22ms',  rps:'88',    err:'0.09', health:0.98, color:C.green },
  ];

  rows.forEach((row, i) => {
    const ry = listY + 20 + i * 58;
    const isSelected = i === 2;
    els.push(rect(16, ry, W - 32, 50, isSelected ? C.card : C.card2, { rx:8, stroke: isSelected ? C.accent : C.border, sw: isSelected ? 1 : 1, opacity:1 }));
    if (isSelected) els.push(rect(16, ry, W - 32, 50, C.accent, { rx:8, opacity:0.04 }));

    // Method chip
    const mColor = row.method === 'GET' ? C.green : row.method === 'DELETE' ? C.accent2 : C.accent;
    els.push(rect(22, ry + 10, row.method.length * 6 + 10, 16, mColor, { rx:4, opacity:0.15 }));
    els.push(text(27, ry + 22, row.method, 8, mColor, { fw:700, ls:0.5 }));

    els.push(text(22, ry + 40, row.path, 11, C.text, { fw:500 }));

    // Latency
    const latColor = parseFloat(row.lat) > 200 ? C.accent2 : parseFloat(row.lat) > 100 ? C.amber : C.green;
    els.push(text(220, ry + 22, row.lat, 13, latColor, { fw:600 }));

    // Mini health bar
    els.push(...progressBar(220, ry + 36, 50, row.health, row.color));

    els.push(text(290, ry + 29, row.rps, 13, C.text, { fw:600 }));

    const errColor = parseFloat(row.err) > 1 ? C.accent2 : parseFloat(row.err) > 0.3 ? C.amber : C.green;
    els.push(text(354, ry + 29, row.err + '%', 13, errColor, { fw:600 }));
  });

  els.push(...nav.els);
  return { name:'Endpoints', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — INCIDENTS
// ══════════════════════════════════════════════════════════════════════════════
function screen3() {
  const nav = bottomNav(2);
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
  ];

  // Dramatic header for incidents
  els.push(rect(0, 44, W, 80, C.surf));
  // Red alert strip at top
  els.push(rect(0, 44, W, 3, C.accent2, { opacity:0.9 }));
  els.push(text(16, 74, '⚡ Incidents', 22, C.text, { fw:700 }));
  els.push(text(16, 96, '1 active   ·   3 resolved today', 12, C.text3));

  // Active badge
  els.push(rect(W - 80, 60, 64, 26, C.accent2, { rx:13, opacity:0.18 }));
  els.push(circle(W - 64, 73, 4, C.accent2));
  els.push(circle(W - 64, 73, 8, C.accent2, { opacity:0.3 }));
  els.push(text(W - 24, 77, '1 ACTIVE', 9, C.accent2, { fw:700, ls:0.8, anchor:'end' }));

  // ── Active incident card (glows red) ────────────────────────────────────
  const ay = 140;
  els.push(rect(16, ay, W - 32, 140, C.card, { rx:12, stroke:C.accent2, sw:1 }));
  els.push(rect(16, ay, W - 32, 140, C.accent2, { rx:12, opacity:0.06 }));
  els.push(rect(16, ay, 3, 140, C.accent2, { rx:2 }));

  els.push(...chip(26, ay + 22, 'ACTIVE', C.accent2, C.accent2));
  els.push(...chip(80, ay + 22, 'P1', C.accent2, C.accent2));
  els.push(text(W - 24, ay + 22, '23m ago', 10, C.text3, { anchor:'end' }));

  els.push(text(26, ay + 44, 'Elevated error rate on /v2/chat/stream', 13, C.text, { fw:600 }));
  els.push(text(26, ay + 62, 'Error rate spiked to 1.4% (threshold: 0.5%)', 11, C.text2));

  // Sparkline of error rate
  els.push(text(26, ay + 82, 'Error rate (last 30m)', 9, C.text3, { fw:500, ls:0.5 }));
  els.push(...miniBars(26, ay + 94, [2,3,3,4,5,12,18,14,16,14], W - 72, 28, C.accent2));

  els.push(text(26, ay + 132, '🔗 Inc-2847  ·  Assigned: @kai', 11, C.text3));

  // ── Resolved incidents ───────────────────────────────────────────────────
  const resolvedTitle = ay + 156;
  els.push(text(16, resolvedTitle, 'Resolved Today', 13, C.text2, { fw:600 }));

  const resolved = [
    { title:'Latency spike — /v1/embeddings', dur:'14m', ago:'2h ago', tag:'P2' },
    { title:'5xx errors — auth service upstream', dur:'6m', ago:'5h ago', tag:'P2' },
    { title:'Rate limit breach — enterprise tenant', dur:'2m', ago:'9h ago', tag:'P3' },
  ];
  resolved.forEach((r, i) => {
    const ry = resolvedTitle + 18 + i * 56;
    els.push(rect(16, ry, W - 32, 48, C.card2, { rx:8, stroke:C.border, sw:1 }));
    els.push(rect(16, ry, 3, 48, C.green, { rx:2 }));
    els.push(circle(W - 30, ry + 24, 8, C.green, { opacity:0.15 }));
    els.push(text(W - 30, ry + 28, '✓', 10, C.green, { anchor:'middle', fw:700 }));
    els.push(text(26, ry + 18, r.title, 12, C.text, { fw:500 }));
    els.push(text(26, ry + 36, `Resolved in ${r.dur}  ·  ${r.ago}`, 10, C.text3));
    els.push(...chip(W - 70, ry + 28, r.tag, C.text3, C.text3));
  });

  els.push(...nav.els);
  return { name:'Incidents', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — USAGE & COST
// ══════════════════════════════════════════════════════════════════════════════
function screen4() {
  const nav = bottomNav(3);
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
    ...secHeader(44, 'Usage & Cost', 'This month'),
  ];

  // Period selector
  const periods = ['Day', 'Week', 'Month', 'Year'];
  let px = W - 16;
  [...periods].reverse().forEach(p => {
    const isA = p === 'Month';
    const tw = p.length * 8 + 18;
    px -= tw;
    els.push(rect(px, 112, tw, 26, isA ? C.accent : 'transparent', { rx:13, opacity: isA ? 1 : 1, stroke: isA ? 'none' : C.border, sw:1 }));
    els.push(text(px + tw/2, 129, p, 10, isA ? C.bg : C.text3, { fw:600, anchor:'middle' }));
    px -= 6;
  });

  // Monthly cost hero
  const heroY = 152;
  els.push(rect(16, heroY, W - 32, 100, C.card, { rx:12, stroke:C.border, sw:1 }));
  els.push(rect(16, heroY, W - 32, 100, C.accent, { rx:12, opacity:0.05 }));
  els.push(text(28, heroY + 24, 'TOTAL SPEND', 9, C.text3, { fw:600, ls:1.5 }));
  els.push(text(28, heroY + 64, '$2,847', 40, C.text, { fw:700 }));
  els.push(text(28, heroY + 90, 'of $4,000 budget', 11, C.text2));
  els.push(...progressBar(28, heroY + 94, W - 72, 0.71, C.accent));
  els.push(text(W - 24, heroY + 90, '71%', 11, C.accent, { anchor:'end' }));

  // Projected
  els.push(text(W - 28, heroY + 62, '$3,640', 18, C.text2, { fw:600, anchor:'end' }));
  els.push(text(W - 28, heroY + 80, 'projected', 10, C.text3, { anchor:'end' }));

  // Divider
  els.push(line(240, heroY + 30, 240, heroY + 85, C.border, { sw:1 }));

  // Cost by model bars
  const chartY = heroY + 118;
  els.push(text(16, chartY, 'Cost by Model', 14, C.text, { fw:600 }));

  const models = [
    { name:'gpt-4o',         pct:0.52, cost:'$1,480', color:C.accent },
    { name:'claude-sonnet',  pct:0.27, cost:'$769',   color:'#A78BFA' },
    { name:'gemini-1.5-pro', pct:0.14, cost:'$398',   color:C.green },
    { name:'gpt-3.5-turbo',  pct:0.07, cost:'$200',   color:C.text3 },
  ];
  models.forEach((m, i) => {
    const my = chartY + 24 + i * 52;
    els.push(text(16, my + 14, m.name, 12, C.text, { fw:500 }));
    els.push(text(W - 16, my + 14, m.cost, 12, C.text2, { fw:600, anchor:'end' }));
    els.push(...progressBar(16, my + 24, W - 32, m.pct, m.color));
    els.push(text(16, my + 38, `${Math.round(m.pct * 100)}% of spend`, 10, C.text3));
  });

  // Daily cost chart
  const dcY = chartY + 240;
  els.push(text(16, dcY, 'Daily Spend (last 12 days)', 13, C.text, { fw:600 }));
  const dailyData = [180, 210, 195, 230, 205, 188, 240, 220, 198, 215, 235, 184];
  els.push(...miniBars(16, dcY + 18, dailyData, W - 32, 60, C.accent));

  // X axis labels
  const days = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  const bw = (W - 32) / 12;
  days.forEach((d, i) => {
    els.push(text(16 + i * bw + bw/2, dcY + 92, d, 8, C.text3, { anchor:'middle' }));
  });

  els.push(...nav.els);
  return { name:'Usage & Cost', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INTEGRATIONS
// ══════════════════════════════════════════════════════════════════════════════
function screen5() {
  const nav = bottomNav(4);
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
    ...secHeader(44, 'Integrations', 'Stack'),
  ];

  // Connected section
  els.push(text(16, 122, 'Connected', 12, C.text3, { fw:600, ls:0.8 }));

  const connected = [
    { icon:'◈', name:'OpenAI',      desc:'GPT-4o + Embeddings', status:'healthy',  calls:'28.4M' },
    { icon:'◎', name:'Anthropic',   desc:'Claude 3.5 Sonnet',   status:'healthy',  calls:'12.1M' },
    { icon:'⊡', name:'Google AI',   desc:'Gemini 1.5 Pro',      status:'degraded', calls:'4.8M'  },
  ];
  connected.forEach((c, i) => {
    const cy = 140 + i * 72;
    els.push(rect(16, cy, W - 32, 62, C.card, { rx:12, stroke:C.border, sw:1 }));
    const statusColor = c.status === 'healthy' ? C.green : C.amber;
    els.push(rect(16, cy, 3, 62, statusColor, { rx:2 }));

    // Icon circle
    els.push(circle(46, cy + 30, 16, C.accent, { opacity:0.12 }));
    els.push(text(46, cy + 35, c.icon, 16, C.accent, { anchor:'middle' }));

    els.push(text(70, cy + 22, c.name, 14, C.text, { fw:600 }));
    els.push(text(70, cy + 40, c.desc, 11, C.text2));

    els.push(circle(W - 28, cy + 20, 5, statusColor));
    els.push(text(W - 28, cy + 44, c.calls, 11, C.text2, { anchor:'middle', fw:500 }));
    els.push(text(W - 28, cy + 56, 'calls', 8, C.text3, { anchor:'middle' }));
  });

  // Available section
  const avY = 140 + connected.length * 72 + 16;
  els.push(text(16, avY, 'Available', 12, C.text3, { fw:600, ls:0.8 }));

  const available = [
    { icon:'⬡', name:'AWS Bedrock',     desc:'Titan, Llama, Mistral' },
    { icon:'⌘', name:'Azure OpenAI',    desc:'Enterprise deployment' },
    { icon:'◆', name:'Cohere',          desc:'Command R+, Embed' },
    { icon:'◻', name:'Mistral',         desc:'Open-source models' },
  ];
  available.forEach((a, i) => {
    const ay = avY + 18 + i * 62;
    els.push(rect(16, ay, W - 32, 52, C.card2, { rx:10, stroke:C.border, sw:1 }));
    els.push(circle(44, ay + 26, 14, C.card, { stroke:C.border, sw:1 }));
    els.push(text(44, ay + 31, a.icon, 14, C.text3, { anchor:'middle' }));
    els.push(text(66, ay + 20, a.name, 13, C.text, { fw:500 }));
    els.push(text(66, ay + 36, a.desc, 11, C.text2));
    // Connect button
    els.push(rect(W - 84, ay + 14, 68, 24, C.accent, { rx:12, opacity:0.15 }));
    els.push(text(W - 50, ay + 30, 'Connect', 11, C.accent, { anchor:'middle', fw:600 }));
  });

  els.push(...nav.els);
  return { name:'Integrations', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — SETTINGS / ALERT RULES
// ══════════════════════════════════════════════════════════════════════════════
function screen6() {
  const nav = bottomNav(4);
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),
    ...secHeader(44, 'Alert Rules', 'Settings'),
  ];

  // Rule cards
  const rules = [
    {
      name: 'Error Rate Threshold',
      desc: 'Trigger when error rate > 0.5%',
      channel: 'PagerDuty + Slack',
      severity: 'P1',
      sevColor: C.accent2,
      active: true,
    },
    {
      name: 'Latency Degradation',
      desc: 'P99 > 500ms for 5 min window',
      channel: 'Slack #eng-oncall',
      severity: 'P2',
      sevColor: C.amber,
      active: true,
    },
    {
      name: 'Cost Spike',
      desc: 'Hourly spend > 120% of 7d avg',
      channel: 'Email + Slack',
      severity: 'P3',
      sevColor: C.accent,
      active: true,
    },
    {
      name: 'Model Timeout Rate',
      desc: 'Timeout rate > 2% on any model',
      channel: 'Slack #ml-ops',
      severity: 'P2',
      sevColor: C.amber,
      active: false,
    },
  ];

  rules.forEach((rule, i) => {
    const ry = 120 + i * 90;
    els.push(rect(16, ry, W - 32, 78, C.card, { rx:12, stroke:C.border, sw:1 }));
    if (rule.active) {
      els.push(rect(16, ry, 3, 78, rule.sevColor, { rx:2 }));
    }

    // Severity + toggle
    els.push(...chip(26, ry + 20, rule.severity, rule.sevColor, rule.sevColor));

    // Toggle switch
    const togX = W - 56;
    const togColor = rule.active ? C.accent : C.text3;
    els.push(rect(togX, ry + 12, 36, 20, togColor, { rx:10, opacity: rule.active ? 0.3 : 0.2 }));
    const knobX = rule.active ? togX + 18 : togX + 2;
    els.push(circle(knobX + 8, ry + 22, 8, rule.active ? C.accent : C.text3));

    els.push(text(26, ry + 42, rule.name, 13, C.text, { fw:600 }));
    els.push(text(26, ry + 58, rule.desc, 11, C.text2));
    els.push(text(26, ry + 72, '→ ' + rule.channel, 10, C.text3));
  });

  // Add rule button
  const btnY = 120 + rules.length * 90 + 8;
  els.push(rect(16, btnY, W - 32, 48, 'transparent', { rx:12, stroke:C.border, sw:1 }));
  els.push(text(W/2, btnY + 28, '+ Add Alert Rule', 13, C.accent, { anchor:'middle', fw:600 }));

  // Notification channels section
  const ncY = btnY + 68;
  els.push(text(16, ncY, 'Notification Channels', 13, C.text2, { fw:600 }));
  const channels = [
    { name:'PagerDuty', connected:true, icon:'⬡' },
    { name:'Slack',     connected:true, icon:'◈' },
    { name:'Email',     connected:true, icon:'◻' },
  ];
  channels.forEach((ch, i) => {
    const cx = 16 + i * ((W - 32) / 3);
    const cw = (W - 32) / 3 - 6;
    els.push(rect(cx, ncY + 14, cw, 52, C.card2, { rx:10, stroke: ch.connected ? C.green : C.border, sw:1 }));
    els.push(text(cx + cw/2, ncY + 38, ch.icon, 16, ch.connected ? C.green : C.text3, { anchor:'middle' }));
    els.push(text(cx + cw/2, ncY + 58, ch.name, 10, ch.connected ? C.text : C.text3, { anchor:'middle', fw:500 }));
  });

  els.push(...nav.els);
  return { name:'Settings', svg:'', elements:els };
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ══════════════════════════════════════════════════════════════════════════════
const screens = [
  screen1(),
  screen2(),
  screen3(),
  screen4(),
  screen5(),
  screen6(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     THEME,
    heartbeat: HB,
    elements:  totalElements,
    archetype: 'developer-tool',
    palette: {
      bg:      C.bg,
      surface: C.surf,
      card:    C.card,
      accent:  C.accent,
      accent2: C.accent2,
      text:    C.text,
    },
    inspiration: 'Neon.com developer-tool dark minimalism (DarkModeDesign.com) + Mortons cursor-glow card treatment',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
