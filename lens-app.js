// LENS — AI Agent Observability Platform
// Inspired by: Linear.app "for teams and agents" + dark data-dense SaaS from darkmodedesign.com
// Theme: DARK — near-black with electric violet + cyan accent
// Pencil.dev v2.8 format

const fs = require('fs');

const W = 390;
const H = 844;

const C = {
  bg:        '#09090F',
  surface:   '#111120',
  surface2:  '#191930',
  border:    '#242442',
  text:      '#EEEEFF',
  muted:     '#7070A0',
  accent:    '#7C5CFC',  // electric violet
  accentDim: '#2A1D6B',
  accent2:   '#2DCBBA',  // teal/cyan
  red:       '#FF4757',
  amber:     '#F59E0B',
  green:     '#22D17A',
  white:     '#FFFFFF',
};

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rectangle',
    x, y, width: w, height: h,
    fill,
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? null,
    strokeWidth: opts.sw ?? 0,
  };
}

function text(content, x, y, opts = {}) {
  return {
    type: 'text',
    x, y,
    content: String(content),
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? '400',
    fill: opts.color ?? C.text,
    fontFamily: 'Inter',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
    align: opts.align ?? 'left',
    width: opts.width ?? 300,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return rect(cx - r, cy - r, r * 2, r * 2, fill, { ...opts, r });
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function statusBar(title) {
  return [
    text('9:41', 20, 14, { size: 12, weight: '600', color: C.muted }),
    text(title, W / 2, 14, { size: 12, weight: '700', color: C.text, align: 'center', width: 120 }),
    text('●●●', W - 60, 14, { size: 8, color: C.muted, align: 'right', width: 60 }),
  ];
}

function bottomNav(active) {
  const items = [
    { icon: '⊞', label: 'Overview' },
    { icon: '◈', label: 'Agents' },
    { icon: '≡', label: 'Stream' },
    { icon: '◜', label: 'Usage' },
  ];
  return [
    rect(0, H - 74, W, 74, C.surface),
    rect(0, H - 74, W, 1, C.border),
    ...items.flatMap(({ icon, label }, i) => {
      const cx = 49 + i * 73;
      const isActive = i === active;
      return [
        text(icon, cx - 12, H - 58, { size: 18, color: isActive ? C.accent : C.muted }),
        text(label, cx - 20, H - 36, { size: 9, weight: isActive ? '600' : '400', color: isActive ? C.accent : C.muted, width: 50, align: 'center' }),
        ...(isActive ? [rect(cx - 18, H - 6, 36, 3, C.accent, { r: 2 })] : []),
      ];
    }),
  ];
}

function glowRect(x, y, w, h, color) {
  return { ...rect(x, y, w, h, color, { r: 60 }), opacity: 0.08 };
}

// ─── SCREEN 1: OVERVIEW ──────────────────────────────────────────────────────

function screen1() {
  const agents = [
    { name: 'Researcher', pct: 72, col: C.green },
    { name: 'Coder',      pct: 88, col: C.green },
    { name: 'Reviewer',   pct: 45, col: C.amber },
    { name: 'Monitor',    pct: 0,  col: C.red   },
    { name: 'Deployer',   pct: 62, col: C.green },
  ];

  return [
    rect(0, 0, W, H, C.bg),
    glowRect(-40, -60, 300, 260, C.accent),
    glowRect(180, 40, 260, 200, C.accent2),

    ...statusBar('LENS'),

    // header row
    text('Mission Control', 20, 50, { size: 26, weight: '800', color: C.text }),
    text('Sunday · Mar 29', 20, 82, { size: 12, color: C.muted }),
    // live badge
    rect(W - 68, 54, 56, 22, 'rgba(34,209,122,0.15)', { r: 11 }),
    circle(W - 54, 65, 4, C.green),
    text('LIVE', W - 44, 57, { size: 9, weight: '700', color: C.green }),

    // ── Big hero metric ──
    rect(12, 108, W - 24, 112, C.surface, { r: 16, stroke: C.border, sw: 1 }),
    glowRect(12, 108, W - 24, 112, C.accent),
    text('12', W / 2, 130, { size: 56, weight: '800', color: C.accent, align: 'center', width: 200 }),
    text('AGENTS RUNNING', W / 2, 193, { size: 10, weight: '700', color: C.muted, ls: 3, align: 'center', width: 200 }),

    // ── 3 metrics ──
    ...[
      { v: '4,281', label: 'Tasks today',   col: C.text },
      { v: '98.2%', label: 'Success rate',  col: C.green },
      { v: '$14.32', label: 'Spend today',  col: C.accent2 },
    ].flatMap(({ v, label, col }, i) => {
      const x = 12 + i * 123;
      return [
        rect(x, 232, 117, 62, C.surface, { r: 10, stroke: C.border, sw: 1 }),
        text(v, x + 58, 248, { size: 17, weight: '700', color: col, align: 'center', width: 117 }),
        text(label, x + 58, 270, { size: 9, color: C.muted, align: 'center', width: 117 }),
      ];
    }),

    // ── Agent health rows ──
    text('AGENT HEALTH', 20, 314, { size: 9, weight: '700', color: C.muted, ls: 3 }),

    ...agents.flatMap(({ name, pct, col }, i) => {
      const y = 334 + i * 46;
      const barW = W - 170;
      return [
        rect(12, y, W - 24, 38, C.surface, { r: 8, stroke: C.border, sw: 1 }),
        circle(30, y + 19, 5, col),
        text(name, 44, y + 11, { size: 12, weight: '500', color: C.text }),
        rect(170, y + 15, barW, 8, C.surface2, { r: 4 }),
        rect(170, y + 15, Math.max(pct > 0 ? 8 : 0, barW * pct / 100), 8, col, { r: 4 }),
        text(pct + '%', W - 24, y + 11, { size: 10, weight: '600', color: col, align: 'right', width: 40 }),
      ];
    }),

    ...bottomNav(0),
  ];
}

// ─── SCREEN 2: AGENTS LIST ───────────────────────────────────────────────────

function agentCard(name, model, status, rate, cost, tokens, y) {
  const statusCol = { running: C.green, idle: C.amber, error: C.red }[status];
  const statusText = { running: '● RUNNING', idle: '○ IDLE', error: '✕ ERROR' }[status];
  return [
    rect(12, y, W - 24, 80, C.surface, { r: 12, stroke: C.border, sw: 1 }),
    // left accent bar
    rect(12, y + 12, 3, 56, statusCol, { r: 2 }),
    // name + model
    text(name, 26, y + 14, { size: 14, weight: '700', color: C.text }),
    text(model, 26, y + 34, { size: 10, color: C.muted }),
    // status
    text(statusText, W - 24, y + 14, { size: 9, weight: '700', color: statusCol, align: 'right', width: 110 }),
    // stats row
    text(rate + ' t/hr', 26, y + 56, { size: 10, color: C.muted }),
    text(tokens, W / 2, y + 56, { size: 10, color: C.muted, align: 'center', width: 100 }),
    text(cost, W - 24, y + 56, { size: 10, color: C.accent2, align: 'right', width: 80 }),
  ];
}

function screen2() {
  return [
    rect(0, 0, W, H, C.bg),
    glowRect(100, -80, 280, 220, C.accent),

    ...statusBar('Agents'),

    text('Active Agents', 20, 50, { size: 24, weight: '800', color: C.text }),
    text('12 running · 3 idle · 1 error', 20, 80, { size: 12, color: C.muted }),

    // filter tabs
    ...['All (16)', 'Running', 'Idle', 'Error'].flatMap((label, i) => {
      const x = 20 + i * 90;
      const active = i === 0;
      return [
        rect(x, 106, 82, 26, active ? C.accent : 'transparent', { r: 13, stroke: active ? 'transparent' : C.border, sw: 1 }),
        text(label, x + 41, 111, { size: 10, weight: active ? '700' : '400', color: active ? C.white : C.muted, align: 'center', width: 82 }),
      ];
    }),

    ...agentCard('Researcher-01', 'claude-3-7-sonnet', 'running', 42, '$3.12', '621K tok', 146),
    ...agentCard('Coder-02',      'claude-3-5-haiku',  'running', 118, '$1.88', '340K tok', 238),
    ...agentCard('Reviewer-03',   'gpt-4o',            'idle',    31, '$2.04', '188K tok', 330),
    ...agentCard('Monitor-05',    'gemini-2.0-flash',  'error',   0, '$0.11', '22K tok',  422),
    ...agentCard('Deployer-04',   'claude-3-7-sonnet', 'running', 8, '$0.94', '91K tok',  514),
    ...agentCard('Writer-06',     'claude-3-5-haiku',  'running', 27, '$2.23', '412K tok', 606),

    ...bottomNav(1),
  ];
}

// ─── SCREEN 3: TASK STREAM ───────────────────────────────────────────────────

function streamEntry(emoji, action, agent, ago, col, y) {
  return [
    rect(12, y, W - 24, 62, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    // emoji pill
    rect(20, y + 14, 32, 32, C.surface2, { r: 8 }),
    text(emoji, 36, y + 19, { size: 14, align: 'center', width: 14 }),
    // action text
    text(action, 62, y + 13, { size: 11, weight: '600', color: C.text, width: W - 130 }),
    text(agent, 62, y + 31, { size: 10, color: C.muted, width: W - 130 }),
    // status + time
    circle(W - 28, y + 18, 5, col),
    text(ago, W - 24, y + 32, { size: 9, color: C.muted, align: 'right', width: 60 }),
  ];
}

function screen3() {
  const stream = [
    ['🔍', 'Web search: "ML benchmark Q1 2026"',   'Researcher-01', '2s',  C.green],
    ['✍️',  'Draft executive summary v3',            'Writer-06',    '9s',  C.green],
    ['⚙️',  'Run test_suite_core (312 tests)',       'Coder-02',     '15s', C.green],
    ['🔎', 'Review PR #2041 — diff analysis',        'Reviewer-03',  '34s', C.amber],
    ['🚀', 'Deploy staging-v1.4.2',                  'Deployer-04',  '52s', C.green],
    ['❌', 'Error: model timeout — 3rd attempt',     'Monitor-05',   '1m',  C.red],
    ['📊', 'Analyze: weekly token usage report',     'Researcher-01', '2m', C.green],
    ['💾', 'Commit: refactor auth module',           'Coder-02',     '3m',  C.green],
    ['📝', 'Update changelog v1.4.2',                'Writer-06',    '5m',  C.green],
  ];

  return [
    rect(0, 0, W, H, C.bg),

    ...statusBar('Stream'),

    text('Task Stream', 20, 50, { size: 24, weight: '800', color: C.text }),

    // LIVE pill
    rect(20, 82, 58, 20, 'rgba(34,209,122,0.15)', { r: 10 }),
    circle(32, 92, 4, C.green),
    text('LIVE', 40, 84, { size: 9, weight: '700', color: C.green }),
    text('4,281 tasks today', 88, 84, { size: 11, color: C.muted }),

    ...stream.flatMap(([e, a, ag, t, c], i) => streamEntry(e, a, ag, t, c, 112 + i * 70)),

    ...bottomNav(2),
  ];
}

// ─── SCREEN 4: USAGE ─────────────────────────────────────────────────────────

function usageBar(label, pct, value, y) {
  const bw = W - 100;
  return [
    text(label, 20, y, { size: 11, color: C.muted }),
    text(value, W - 20, y, { size: 11, color: C.text, align: 'right', width: 100 }),
    rect(20, y + 18, bw, 7, C.surface2, { r: 4 }),
    rect(20, y + 18, Math.max(pct > 0 ? 6 : 0, bw * pct / 100), 7, C.accent, { r: 4 }),
  ];
}

function screen4() {
  const bars = [55, 48, 72, 90, 64, 80, 100, 74, 58, 90, 100, 66];
  const labels = ['6a','7','8','9','10','11','12','1p','2','3','4','5'];

  return [
    rect(0, 0, W, H, C.bg),
    glowRect(-40, 60, 280, 200, C.accent2),

    ...statusBar('Usage'),

    text('Usage & Cost', 20, 50, { size: 24, weight: '800', color: C.text }),
    text('Mar 29, 2026', 20, 82, { size: 12, color: C.muted }),

    // ── Main spend card ──
    rect(12, 106, W - 24, 88, C.surface, { r: 14, stroke: C.border, sw: 1 }),
    glowRect(12, 106, W - 24, 88, C.accent),
    text('$14.32', W / 2, 126, { size: 38, weight: '800', color: C.accent, align: 'center', width: 200 }),
    text('TOTAL TODAY', W / 2, 170, { size: 9, weight: '700', color: C.muted, ls: 3, align: 'center', width: 200 }),
    text('↑ +12% vs yesterday', W / 2, 185, { size: 10, color: C.amber, align: 'center', width: 200 }),

    // ── Token usage ──
    text('TOKENS BY MODEL', 20, 214, { size: 9, weight: '700', color: C.muted, ls: 3 }),
    rect(12, 232, W - 24, 148, C.surface, { r: 12, stroke: C.border, sw: 1 }),
    ...usageBar('claude-3-7-sonnet', 68, '1.24M', 244),
    ...usageBar('claude-3-5-haiku',  42, '0.76M', 288),
    ...usageBar('gpt-4o',            18, '0.33M', 332),
    ...usageBar('gemini-2.0-flash',   8, '0.14M', 364),

    // ── Bar chart ──
    text('HOURLY ACTIVITY', 20, 398, { size: 9, weight: '700', color: C.muted, ls: 3 }),
    rect(12, 416, W - 24, 100, C.surface, { r: 12, stroke: C.border, sw: 1 }),

    ...bars.flatMap((h, i) => {
      const bw = 22;
      const gap = (W - 24 - 12 * bw) / 13;
      const x = 20 + i * (bw + gap);
      const maxH = 72;
      const barH = Math.floor(maxH * h / 100);
      const isNow = i === 10;
      return [
        rect(x, 416 + maxH + 12 - barH, bw, barH, isNow ? C.accent : C.accentDim + 'AA', { r: 4 }),
        text(labels[i], x + bw / 2, 496, { size: 7, color: isNow ? C.accent : C.muted, align: 'center', width: bw + 4 }),
      ];
    }),

    // ── Totals row ──
    rect(12, 526, W - 24, 58, C.surface, { r: 10, stroke: C.border, sw: 1 }),
    text('4,281', 20 + 80, 542, { size: 18, weight: '700', color: C.text, align: 'center', width: 120 }),
    text('Tasks', 20 + 80, 563, { size: 9, color: C.muted, align: 'center', width: 120 }),
    rect(W / 2, 536, 1, 36, C.border),
    text('2.47M', W / 2 + 80, 542, { size: 18, weight: '700', color: C.accent2, align: 'center', width: 120 }),
    text('Tokens', W / 2 + 80, 563, { size: 9, color: C.muted, align: 'center', width: 120 }),

    ...bottomNav(3),
  ];
}

// ─── SCREEN 5: ALERTS ────────────────────────────────────────────────────────

function alertCard(icon, title, body, level, y) {
  const colors = { error: C.red, warn: C.amber, info: C.accent2 };
  const col = colors[level];
  const bg = level === 'error' ? 'rgba(255,71,87,0.10)' : level === 'warn' ? 'rgba(245,158,11,0.10)' : 'rgba(45,203,186,0.10)';
  return [
    rect(12, y, W - 24, 76, bg, { r: 12, stroke: col + '55', sw: 1 }),
    rect(20, y + 16, 36, 36, C.surface, { r: 10 }),
    text(icon, 38, y + 22, { size: 18, align: 'center', width: 14 }),
    text(title, 66, y + 16, { size: 12, weight: '700', color: C.text, width: W - 110 }),
    text(body, 66, y + 34, { size: 10, color: C.muted, width: W - 110 }),
    // level badge
    rect(W - 56, y + 16, 40, 18, col + '25', { r: 9 }),
    text(level.toUpperCase(), W - 56, y + 17, { size: 8, weight: '700', color: col, align: 'center', width: 40 }),
  ];
}

function screen5() {
  return [
    rect(0, 0, W, H, C.bg),
    glowRect(160, -60, 240, 200, C.red),

    ...statusBar('Alerts'),

    text('Alerts', 20, 50, { size: 24, weight: '800', color: C.text }),
    // badge
    rect(90, 52, 24, 20, C.red, { r: 10 }),
    text('1', 102, 53, { size: 9, weight: '700', color: C.white, align: 'center', width: 24 }),
    text('3 warnings · 1 error', 20, 82, { size: 12, color: C.muted }),

    ...alertCard('❌', 'Monitor-05: Model timeout', '3 failed calls in a row — action required', 'error', 106),
    ...alertCard('⚠️', 'Token burn rate elevated', 'claude-3-7-sonnet 40% above 7-day avg', 'warn', 196),
    ...alertCard('⚠️', 'Reviewer-03 latency high', 'P95 response 8.4s · threshold is 5.0s', 'warn', 286),
    ...alertCard('ℹ️', 'New agent slot available', '3 additional agents can be started now', 'info', 376),

    // CTA button
    rect(12, 466, W - 24, 48, C.red, { r: 12 }),
    text('Restart Monitor-05', W / 2, 482, { size: 14, weight: '700', color: C.white, align: 'center', width: W - 24 }),

    // resolved history
    text('RESOLVED (24h)', 20, 530, { size: 9, weight: '700', color: C.muted, ls: 3 }),

    ...[
      ['✓', 'Deployer memory spike resolved', '2h ago'],
      ['✓', 'Writer rate limit cleared', '5h ago'],
      ['✓', 'API key rotation complete', '11h ago'],
    ].flatMap(([icon, label, ts], i) => {
      const y = 552 + i * 46;
      return [
        rect(12, y, W - 24, 38, C.surface, { r: 8, stroke: C.border, sw: 1 }),
        text(icon, 26, y + 11, { size: 12, color: C.green }),
        text(label, 46, y + 11, { size: 11, color: C.muted, width: W - 120 }),
        text(ts, W - 24, y + 11, { size: 9, color: C.muted, align: 'right', width: 60 }),
      ];
    }),

    ...bottomNav(3),

    // alert badge on alerts tab (special override)
    rect(49 + 3 * 73 - 6, H - 64, 16, 16, C.red, { r: 8 }),
    text('1', 49 + 3 * 73 + 2, H - 62, { size: 8, weight: '700', color: C.white, align: 'center', width: 16 }),
  ];
}

// ─── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────

function flatten(arr) {
  return arr.flat(Infinity).filter(Boolean);
}

const screens = [
  { name: 'Overview',    layers: screen1() },
  { name: 'Agents',      layers: screen2() },
  { name: 'Task Stream', layers: screen3() },
  { name: 'Usage',       layers: screen4() },
  { name: 'Alerts',      layers: screen5() },
];

const pen = {
  version: '2.8',
  name: 'LENS',
  width: W,
  height: H,
  fill: C.bg,
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    fill: C.bg,
    children: flatten(s.layers),
  })),
};

fs.writeFileSync('/workspace/group/design-studio/lens.pen', JSON.stringify(pen, null, 2));
console.log('✓ lens.pen written');
pen.screens.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} — ${s.children.length} layers`));
