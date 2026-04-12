/**
 * SIGNAL — AI Pipeline Observability
 * RAM Design Heartbeat · March 2026
 *
 * Inspired by:
 * - "Darknode" (Awwwards SOTD) — deep dark developer tooling with dense data layers
 * - "Runlayer — Enterprise MCPs, Skills & Agents" (Land-book) — AI agent monitoring use case
 * - "Forge" + "Linear" (Dark Mode Design) — electric accent on near-black, surgical precision
 *
 * Dark theme: deep navy-black, electric blue accent, teal live indicators
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#07090F',   // near-void navy-black
  surface:  '#0E1219',   // elevated card
  border:   '#1C2333',   // subtle separator
  text:     '#D6E0F0',   // cool white
  muted:    '#5A6882',   // deemphasised
  accent:   '#4B7FFF',   // electric blue
  live:     '#1EE8A8',   // teal — "active / alive"
  warn:     '#FF9052',   // amber warning
  error:    '#FF4D6A',   // red error
  dim:      '#1A2035',   // very dim bg for charts
};

// ─── Typography ───────────────────────────────────────────────────────────────
const FONTS = {
  ui:   'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", monospace',
};

// ─── Canvas / Frame config ────────────────────────────────────────────────────
const W = 390;
const H = 844;

// ─── Helper: create element node ─────────────────────────────────────────────
let _id = 1;
function uid() { return `el-${_id++}`; }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'RECTANGLE',
    x, y, width: w, height: h,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity ?? 1 }],
    cornerRadius: opts.r ?? 0,
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke) }] : [],
    strokeWeight: opts.strokeWeight ?? 1,
    opacity: 1,
    effects: opts.shadow ? [{
      type: 'DROP_SHADOW', radius: 24, spread: 0,
      color: { r: 0, g: 0, b: 0, a: 0.4 }, x: 0, y: 8, visible: true,
    }] : [],
  };
}

function text(content, x, y, opts = {}) {
  const { size = 13, weight = 400, color = P.text, font = FONTS.ui,
    align = 'LEFT', w = 280, opacity = 1, letterSpacing = 0 } = opts;
  return {
    id: uid(), type: 'TEXT',
    x, y, width: w, height: size * 1.4,
    content,
    fontSize: size,
    fontWeight: weight,
    fontFamily: font,
    fills: [{ type: 'SOLID', color: hexToRgb(color), opacity }],
    textAlign: align,
    letterSpacing,
    opacity,
  };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    id: uid(), type: 'ELLIPSE',
    x: x - r, y: y - r, width: r * 2, height: r * 2,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity ?? 1 }],
    strokes: [],
    effects: opts.glow ? [{
      type: 'DROP_SHADOW', radius: 8, spread: 2,
      color: { ...hexToRgb(fill), a: 0.5 }, x: 0, y: 0, visible: true,
    }] : [],
  };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    id: uid(), type: 'LINE',
    x: x1, y: y1,
    width: x2 - x1, height: Math.max(1, y2 - y1),
    fills: [], strokes: [{ type: 'SOLID', color: hexToRgb(color) }],
    strokeWeight: opts.weight ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2), 16) / 255;
  const g = parseInt(h.slice(2,4), 16) / 255;
  const b = parseInt(h.slice(4,6), 16) / 255;
  return { r, g, b };
}

// ─── Reusable components ──────────────────────────────────────────────────────

function statusDot(x, y, color, glow = true) {
  return circle(x, y, 4, color, { glow });
}

function badge(x, y, label, color, bgColor) {
  const bg = bgColor || (color + '22');
  return [
    rect(x, y, label.length * 6.5 + 12, 18, bg, { r: 4, stroke: color, strokeWeight: 0.5 }),
    text(label, x + 6, y + 3, { size: 9, color, weight: 600, w: 100, letterSpacing: 0.5 }),
  ];
}

function miniSparkline(x, y, w, h, values, color) {
  const nodes = [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);

  // Fill area
  nodes.push(rect(x, y, w, h, P.dim, { r: 2 }));

  // Line segments
  for (let i = 0; i < values.length - 1; i++) {
    const x1 = x + i * step;
    const x2 = x + (i + 1) * step;
    const y1 = y + h - ((values[i] - min) / range) * (h - 4) - 2;
    const y2 = y + h - ((values[i+1] - min) / range) * (h - 4) - 2;
    nodes.push(line(x1, y1, x2, y2, color, { weight: 1.5 }));
  }
  return nodes;
}

function progressBar(x, y, w, pct, color, bg = P.border) {
  return [
    rect(x, y, w, 3, bg, { r: 2 }),
    rect(x, y, Math.round(w * pct), 3, color, { r: 2 }),
  ];
}

// ─── Status bar ──────────────────────────────────────────────────────────────
function statusBar(screenLabel) {
  return [
    rect(0, 0, W, H, P.bg),                               // full bg
    text('9:41', 16, 14, { size: 12, weight: 600, color: P.text, w: 60 }),
    text('● ● ▐', W - 60, 14, { size: 10, color: P.text, w: 60, align: 'RIGHT' }),
  ];
}

// ─── Top nav bar ─────────────────────────────────────────────────────────────
function topNav(title, subtitle) {
  return [
    rect(0, 44, W, 52, P.surface),
    line(0, 96, W, 96, P.border),
    text(title,    16, 56, { size: 17, weight: 700, color: P.text, w: 220 }),
    subtitle ? text(subtitle, 16, 75, { size: 10, color: P.muted, w: 220 }) : null,
    // Live indicator top-right
    ...badge(W - 72, 60, '● LIVE', P.live),
  ].filter(Boolean);
}

// ─── Bottom tab bar ───────────────────────────────────────────────────────────
function tabBar(active = 0) {
  const tabs = [
    { icon: '◈', label: 'Overview' },
    { icon: '⌥', label: 'Traces' },
    { icon: '△', label: 'Alerts' },
    { icon: '⬡', label: 'Models' },
    { icon: '⊞', label: 'Keys' },
  ];
  const nodes = [
    rect(0, H - 82, W, 82, P.surface),
    line(0, H - 82, W, H - 82, P.border),
  ];
  const tabW = W / tabs.length;
  tabs.forEach((tab, i) => {
    const tx = i * tabW + tabW / 2;
    const isActive = i === active;
    if (isActive) {
      nodes.push(rect(i * tabW + 8, H - 80, tabW - 16, 2, P.accent, { r: 1 }));
    }
    nodes.push(text(tab.icon, tx - 12, H - 68, {
      size: 16, color: isActive ? P.accent : P.muted, w: 24, align: 'CENTER',
    }));
    nodes.push(text(tab.label, tx - 28, H - 50, {
      size: 9, weight: isActive ? 600 : 400,
      color: isActive ? P.accent : P.muted, w: 56, align: 'CENTER',
    }));
  });
  return nodes;
}

// ─── SCREEN 1: Overview ───────────────────────────────────────────────────────
function screenOverview() {
  const nodes = [
    ...statusBar('Overview'),
    ...topNav('SIGNAL', 'AI Pipeline Observability'),
    ...tabBar(0),
  ];

  // ── Summary metric row
  const metrics = [
    { label: 'Active Agents', value: '48', sub: 'pipelines', color: P.live },
    { label: 'Req/min',       value: '1.2K', sub: 'throughput', color: P.accent },
    { label: 'P99 Latency',   value: '284ms', sub: 'avg', color: P.text },
    { label: 'Error Rate',    value: '0.3%', sub: 'last 5m', color: P.warn },
  ];
  const mW = (W - 32 - 12) / 4;
  metrics.forEach((m, i) => {
    const mx = 16 + i * (mW + 4);
    const my = 108;
    nodes.push(rect(mx, my, mW, 68, P.surface, { r: 8, stroke: P.border }));
    nodes.push(text(m.value, mx + 8, my + 10, { size: 18, weight: 700, color: m.color, w: mW - 16 }));
    nodes.push(text(m.label, mx + 8, my + 33, { size: 8, color: P.muted, w: mW - 8, weight: 500 }));
    nodes.push(text(m.sub,   mx + 8, my + 46, { size: 7.5, color: P.muted, w: mW - 8 }));
  });

  // ── Section label
  nodes.push(text('PIPELINE THROUGHPUT', 16, 192, {
    size: 9, weight: 700, color: P.muted, letterSpacing: 1.5, w: 200,
  }));

  // ── Sparkline chart
  const spark1 = [120, 180, 145, 220, 190, 260, 310, 280, 350, 320, 400, 380];
  const spark2 = [80, 90, 70, 100, 85, 110, 95, 130, 120, 140, 125, 145];
  nodes.push(rect(16, 206, W - 32, 90, P.surface, { r: 8, stroke: P.border }));
  nodes.push(...miniSparkline(24, 212, W - 48, 70, spark1, P.accent));
  nodes.push(...miniSparkline(24, 212, W - 48, 70, spark2, P.live));
  // Legend
  nodes.push(circle(24, 288, 3, P.accent));
  nodes.push(text('Requests', 30, 284, { size: 8, color: P.muted, w: 70 }));
  nodes.push(circle(100, 288, 3, P.live));
  nodes.push(text('Tokens', 106, 284, { size: 8, color: P.muted, w: 60 }));
  nodes.push(text('Last 12 hours', W - 90, 284, { size: 8, color: P.muted, w: 80, align: 'RIGHT' }));

  // ── Active agents list
  nodes.push(text('ACTIVE AGENTS', 16, 310, {
    size: 9, weight: 700, color: P.muted, letterSpacing: 1.5, w: 160,
  }));

  const agents = [
    { name: 'research-agent-01',  model: 'gpt-4o',        rps: '18.4', lat: '312ms', status: 'healthy' },
    { name: 'summarizer-v3',      model: 'claude-3-5',    rps: '9.2',  lat: '189ms', status: 'healthy' },
    { name: 'code-reviewer',      model: 'gpt-4-turbo',   rps: '4.1',  lat: '441ms', status: 'warn' },
    { name: 'embed-pipeline',     model: 'text-embed-3',  rps: '88.0', lat: '42ms',  status: 'healthy' },
  ];

  agents.forEach((a, i) => {
    const ay = 324 + i * 60;
    const statusColor = a.status === 'healthy' ? P.live : P.warn;

    nodes.push(rect(16, ay, W - 32, 54, P.surface, { r: 8, stroke: P.border }));
    nodes.push(statusDot(32, ay + 14, statusColor, true));
    nodes.push(text(a.name, 44, ay + 7, { size: 11, weight: 600, color: P.text, w: 180, font: FONTS.mono }));
    nodes.push(text(a.model, 44, ay + 23, { size: 9, color: P.muted, w: 100 }));

    // RPS + latency chips right side
    nodes.push(text(a.rps + ' rps', W - 100, ay + 7, { size: 10, weight: 600, color: P.accent, w: 70, align: 'RIGHT' }));
    nodes.push(text(a.lat, W - 100, ay + 23, { size: 9, color: P.muted, w: 70, align: 'RIGHT' }));

    // Thin progress bar (utilisation)
    const util = a.status === 'warn' ? 0.82 : (i === 2 ? 0.55 : [0.72, 0.48, 0.91][i % 3]);
    nodes.push(...progressBar(16, ay + 40, W - 32, util,
      a.status === 'warn' ? P.warn : P.accent));
  });

  return { id: 'screen-overview', name: 'Overview', nodes };
}

// ─── SCREEN 2: Traces ─────────────────────────────────────────────────────────
function screenTraces() {
  const nodes = [
    ...statusBar('Traces'),
    ...topNav('Traces', 'LLM call waterfall'),
    ...tabBar(1),
  ];

  // Filter chips
  const filters = ['All', 'Errors', 'Slow >500ms', 'GPT-4o', 'Claude'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 6.5 + 16;
    const isActive = i === 0;
    nodes.push(rect(fx, 108, fw, 24, isActive ? P.accent + '22' : P.surface, {
      r: 12, stroke: isActive ? P.accent : P.border,
    }));
    nodes.push(text(f, fx + 8, 114, { size: 9, color: isActive ? P.accent : P.muted, w: fw - 8, weight: isActive ? 600 : 400 }));
    fx += fw + 6;
  });

  // Trace entries — waterfall style
  const traces = [
    {
      id: 'trc_8f2a91',
      name: 'research-pipeline',
      total: '892ms',
      tokens: '4,210',
      status: 'ok',
      spans: [
        { label: 'retrieval',  dur: 45,   pct: 0.05, color: P.accent },
        { label: 'gpt-4o',     dur: 712,  pct: 0.80, color: '#7C5FFF' },
        { label: 'postproc',   dur: 135,  pct: 0.15, color: P.live },
      ],
    },
    {
      id: 'trc_1c44fe',
      name: 'summarizer-v3',
      total: '231ms',
      tokens: '1,820',
      status: 'ok',
      spans: [
        { label: 'claude-3-5', dur: 189, pct: 0.82, color: '#E87C3E' },
        { label: 'format',     dur: 42,  pct: 0.18, color: P.live },
      ],
    },
    {
      id: 'trc_9d77bc',
      name: 'code-reviewer',
      total: '1,441ms',
      tokens: '6,890',
      status: 'slow',
      spans: [
        { label: 'parse',      dur: 88,   pct: 0.06, color: P.accent },
        { label: 'gpt-4-turbo', dur: 1240, pct: 0.86, color: '#7C5FFF' },
        { label: 'lint',       dur: 113,  pct: 0.08, color: P.live },
      ],
    },
    {
      id: 'trc_3a10d2',
      name: 'embed-pipeline',
      total: '42ms',
      tokens: '512',
      status: 'ok',
      spans: [
        { label: 'embed',      dur: 38,  pct: 0.90, color: '#2BD9D9' },
        { label: 'store',      dur: 4,   pct: 0.10, color: P.muted },
      ],
    },
  ];

  const barW = W - 32;
  traces.forEach((tr, i) => {
    const ty = 142 + i * 130;
    const isError = tr.status === 'slow';
    const statusColor = isError ? P.warn : P.live;

    nodes.push(rect(16, ty, W - 32, 120, P.surface, {
      r: 8, stroke: isError ? P.warn + '44' : P.border,
    }));

    // Trace header
    nodes.push(statusDot(32, ty + 14, statusColor));
    nodes.push(text(tr.id, 44, ty + 7, { size: 9, color: P.muted, w: 100, font: FONTS.mono }));
    nodes.push(text(tr.name, 44, ty + 20, { size: 11, weight: 600, color: P.text, w: 160, font: FONTS.mono }));

    // Right side stats
    nodes.push(text(tr.total, W - 100, ty + 7, { size: 11, weight: 700, color: isError ? P.warn : P.text, w: 80, align: 'RIGHT' }));
    nodes.push(text(tr.tokens + ' tok', W - 100, ty + 22, { size: 8, color: P.muted, w: 80, align: 'RIGHT' }));

    // Waterfall bars
    let bx = 24;
    tr.spans.forEach((span, si) => {
      const spanW = Math.round((barW - 16) * span.pct);
      nodes.push(rect(bx, ty + 44 + si * 20, spanW, 12, span.color + '33', { r: 2, stroke: span.color + '88' }));
      nodes.push(text(span.label, bx + 4, ty + 46 + si * 20, {
        size: 7.5, color: span.color, w: spanW - 4, font: FONTS.mono,
      }));
      nodes.push(text(span.dur + 'ms', bx + spanW + 4, ty + 46 + si * 20, {
        size: 7.5, color: P.muted, w: 50, font: FONTS.mono,
      }));
    });
  });

  return { id: 'screen-traces', name: 'Traces', nodes };
}

// ─── SCREEN 3: Alerts ─────────────────────────────────────────────────────────
function screenAlerts() {
  const nodes = [
    ...statusBar('Alerts'),
    ...topNav('Alerts', 'Anomaly detection feed'),
    ...tabBar(2),
  ];

  // Alert summary row
  const alertCounts = [
    { label: 'Critical', count: 0, color: P.error },
    { label: 'Warning',  count: 3, color: P.warn },
    { label: 'Info',     count: 11, color: P.accent },
    { label: 'Resolved', count: 24, color: P.muted },
  ];
  const acW = (W - 32 - 12) / 4;
  alertCounts.forEach((ac, i) => {
    const ax = 16 + i * (acW + 4);
    nodes.push(rect(ax, 108, acW, 50, P.surface, { r: 8, stroke: ac.count > 0 && ac.label !== 'Resolved' ? ac.color + '44' : P.border }));
    nodes.push(text(String(ac.count), ax + acW / 2 - 10, ax < 80 ? 118 : 118, {
      size: 20, weight: 700, color: ac.count > 0 ? ac.color : P.muted, w: 40, align: 'CENTER',
    }));
    nodes.push(text(ac.label, ax + 6, 140, { size: 8, color: P.muted, w: acW - 8, align: 'CENTER' }));
  });

  // Alert items
  const alerts = [
    {
      level: 'warn',
      title: 'P99 latency spike detected',
      detail: 'code-reviewer pipeline exceeded 1400ms threshold for 3+ minutes',
      agent: 'code-reviewer',
      time: '2m ago',
    },
    {
      level: 'warn',
      title: 'Token budget near limit',
      detail: 'research-agent-01 has consumed 87% of hourly token budget',
      agent: 'research-agent-01',
      time: '8m ago',
    },
    {
      level: 'warn',
      title: 'Embedding cache miss rate high',
      detail: 'Cache miss rate reached 64% on embed-pipeline (normal < 30%)',
      agent: 'embed-pipeline',
      time: '14m ago',
    },
    {
      level: 'info',
      title: 'New model version available',
      detail: 'gpt-4o-2025-03 now available for zero-downtime rollout',
      agent: 'system',
      time: '1h ago',
    },
    {
      level: 'info',
      title: 'Summarizer-v3 auto-scaled',
      detail: 'Added 2 new instances in us-east-1 to handle traffic surge',
      agent: 'summarizer-v3',
      time: '1h ago',
    },
  ];

  alerts.forEach((al, i) => {
    const ay = 172 + i * 112;
    const lColor = al.level === 'warn' ? P.warn : al.level === 'critical' ? P.error : P.accent;

    nodes.push(rect(16, ay, W - 32, 104, P.surface, { r: 8, stroke: P.border }));
    // Left accent stripe
    nodes.push(rect(16, ay, 3, 104, lColor, { r: 0 }));

    // Badge + time
    nodes.push(...badge(28, ay + 10, al.level.toUpperCase(), lColor));
    nodes.push(text(al.time, W - 60, ay + 12, { size: 9, color: P.muted, w: 50, align: 'RIGHT' }));

    // Title + detail
    nodes.push(text(al.title, 28, ay + 32, { size: 12, weight: 600, color: P.text, w: W - 56 }));
    nodes.push(text(al.detail, 28, ay + 50, { size: 10, color: P.muted, w: W - 56 }));

    // Agent chip
    nodes.push(...badge(28, ay + 78, al.agent, P.accent));
  });

  return { id: 'screen-alerts', name: 'Alerts', nodes };
}

// ─── SCREEN 4: Models ─────────────────────────────────────────────────────────
function screenModels() {
  const nodes = [
    ...statusBar('Models'),
    ...topNav('Models', 'Performance & cost by model'),
    ...tabBar(3),
  ];

  // Model comparison table header
  nodes.push(rect(16, 108, W - 32, 24, P.dim, { r: 6 }));
  nodes.push(text('MODEL', 24, 114, { size: 8, weight: 700, color: P.muted, w: 120, letterSpacing: 1 }));
  nodes.push(text('P99', 188, 114, { size: 8, weight: 700, color: P.muted, w: 50, align: 'RIGHT' }));
  nodes.push(text('COST/1K', 250, 114, { size: 8, weight: 700, color: P.muted, w: 60, align: 'RIGHT' }));
  nodes.push(text('CALLS', W - 50, 114, { size: 8, weight: 700, color: P.muted, w: 40, align: 'RIGHT' }));

  const models = [
    { name: 'gpt-4o',         provider: 'OpenAI',    p99: '312ms', cost: '$0.024', calls: '48.2K', health: 0.95, color: '#74AA9C' },
    { name: 'claude-3-5',     provider: 'Anthropic', p99: '189ms', cost: '$0.018', calls: '31.0K', health: 0.98, color: '#E87C3E' },
    { name: 'gpt-4-turbo',    provider: 'OpenAI',    p99: '441ms', cost: '$0.031', calls: '12.4K', health: 0.78, color: '#74AA9C' },
    { name: 'gemini-1.5-pro', provider: 'Google',    p99: '228ms', cost: '$0.014', calls: '8.9K',  health: 0.91, color: '#4285F4' },
    { name: 'text-embed-3',   provider: 'OpenAI',    p99: '42ms',  cost: '$0.001', calls: '204K',  health: 1.00, color: '#74AA9C' },
  ];

  models.forEach((m, i) => {
    const my = 138 + i * 96;
    const healthColor = m.health > 0.9 ? P.live : m.health > 0.7 ? P.warn : P.error;

    nodes.push(rect(16, my, W - 32, 88, P.surface, { r: 8, stroke: P.border }));

    // Provider colour dot
    nodes.push(circle(30, my + 16, 5, m.color));
    nodes.push(text(m.name, 42, my + 9, { size: 12, weight: 600, color: P.text, w: 150, font: FONTS.mono }));
    nodes.push(text(m.provider, 42, my + 25, { size: 9, color: P.muted, w: 80 }));

    // Right-side stats
    nodes.push(text(m.p99, 188, my + 9, { size: 11, weight: 600, color: P.text, w: 50, align: 'RIGHT' }));
    nodes.push(text(m.cost, 250, my + 9, { size: 11, weight: 600, color: P.accent, w: 60, align: 'RIGHT' }));
    nodes.push(text(m.calls, W - 50, my + 9, { size: 11, weight: 600, color: P.text, w: 40, align: 'RIGHT' }));

    // Health bar row
    nodes.push(text('health', 24, my + 44, { size: 8, color: P.muted, w: 50 }));
    nodes.push(...progressBar(70, my + 48, W - 90, m.health, healthColor));
    nodes.push(text(Math.round(m.health * 100) + '%', W - 50, my + 44, {
      size: 9, weight: 600, color: healthColor, w: 38, align: 'RIGHT',
    }));

    // Micro sparkline row
    const mVals = Array.from({ length: 8 }, (_, k) => 200 + Math.sin(k + i) * 80 + Math.random() * 40);
    nodes.push(...miniSparkline(24, my + 60, W - 48, 18, mVals, m.color));
  });

  return { id: 'screen-models', name: 'Models', nodes };
}

// ─── SCREEN 5: API Keys ───────────────────────────────────────────────────────
function screenKeys() {
  const nodes = [
    ...statusBar('Keys'),
    ...topNav('API Keys', 'Access management'),
    ...tabBar(4),
  ];

  // Usage gauge
  nodes.push(rect(16, 108, W - 32, 100, P.surface, { r: 8, stroke: P.border }));
  nodes.push(text('Monthly Usage', 28, 118, { size: 11, weight: 600, color: P.text, w: 160 }));
  nodes.push(text('68% of plan limit', 28, 136, { size: 9, color: P.muted, w: 160 }));
  nodes.push(...progressBar(28, 158, W - 56, 0.68, P.accent));
  nodes.push(text('13.6M / 20M tokens', 28, 168, { size: 8, color: P.muted, w: 150 }));
  nodes.push(text('Resets Apr 1', W - 80, 168, { size: 8, color: P.muted, w: 70, align: 'RIGHT' }));
  // Cost summary
  nodes.push(rect(28, 180, (W - 56) / 2 - 4, 20, P.dim, { r: 4 }));
  nodes.push(text('$486 this month', 36, 185, { size: 9, color: P.text, w: 120 }));
  nodes.push(rect(28 + (W - 56) / 2 + 4, 180, (W - 56) / 2 - 4, 20, P.dim, { r: 4 }));
  nodes.push(text('−12% vs last month', 28 + (W - 56) / 2 + 12, 185, { size: 9, color: P.live, w: 140 }));

  // Keys list
  nodes.push(text('API KEYS', 16, 224, {
    size: 9, weight: 700, color: P.muted, letterSpacing: 1.5, w: 120,
  }));

  const keys = [
    { label: 'Production',  key: 'sig_live_8f2a...c9d1', perms: 'Read/Write', last: '2m ago',  active: true },
    { label: 'Staging',     key: 'sig_test_1c44...77bc', perms: 'Read/Write', last: '1h ago',  active: true },
    { label: 'Analytics',   key: 'sig_live_9d77...a901', perms: 'Read only',  last: '3h ago',  active: true },
    { label: 'Dev (Jake)',   key: 'sig_test_3a10...f822', perms: 'Read/Write', last: '2d ago',  active: false },
  ];

  keys.forEach((k, i) => {
    const ky = 238 + i * 88;
    nodes.push(rect(16, ky, W - 32, 80, P.surface, { r: 8, stroke: P.border }));

    // Status dot
    nodes.push(statusDot(30, ky + 16, k.active ? P.live : P.muted));
    nodes.push(text(k.label, 42, ky + 9, { size: 12, weight: 600, color: P.text, w: 160 }));
    nodes.push(text(k.key, 42, ky + 26, { size: 9, color: P.muted, w: 180, font: FONTS.mono }));

    // Perm chip + last used
    nodes.push(...badge(42, ky + 46, k.perms, k.perms === 'Read only' ? P.accent : P.warn));
    nodes.push(text('used ' + k.last, W - 80, ky + 49, { size: 8, color: P.muted, w: 70, align: 'RIGHT' }));

    // Revoke button (far right)
    nodes.push(rect(W - 64, ky + 10, 50, 20, P.error + '11', { r: 4, stroke: P.error + '44' }));
    nodes.push(text('Revoke', W - 60, ky + 14, { size: 8, color: P.error, w: 45 }));
  });

  // + New Key button
  nodes.push(rect(16, H - 96, W - 32, 36, P.accent + '22', { r: 8, stroke: P.accent }));
  nodes.push(text('+ Generate new key', W / 2 - 60, H - 84, {
    size: 12, weight: 600, color: P.accent, w: 140, align: 'CENTER',
  }));

  return { id: 'screen-keys', name: 'API Keys', nodes };
}

// ─── Assemble .pen file ───────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    screenOverview(),
    screenTraces(),
    screenAlerts(),
    screenModels(),
    screenKeys(),
  ];

  const pen = {
    version: '2.8',
    meta: {
      name:        'SIGNAL',
      tagline:     'AI Pipeline Observability',
      description: 'Monitor LLM agents in production — traces, latency, token budgets, cost. Dark theme, precision-engineered dashboard inspired by Darknode (Awwwards SOTD) and Runlayer (Land-book).',
      archetype:   'developer-tools',
      created:     new Date().toISOString(),
      author:      'RAM Design Heartbeat',
      tags:        ['dark', 'developer-tools', 'AI', 'observability', 'dashboard', 'LLM', 'monochrome'],
      theme: {
        mode:    'dark',
        palette: {
          bg:      P.bg,
          surface: P.surface,
          text:    P.text,
          accent:  P.accent,
          accent2: P.live,
          muted:   P.muted,
        },
      },
      inspiration: 'Darknode (Awwwards SOTD) for the deep dark developer aesthetic; Runlayer + LangChain (Land-book) for the AI agent monitoring use case; Forge + Linear (Dark Mode Design) for electric accent on near-black.',
    },
    canvas: {
      width:       W,
      height:      H,
      background:  P.bg,
    },
    screens: screens.map(s => ({
      id:     s.id,
      name:   s.name,
      width:  W,
      height: H,
      nodes:  s.nodes,
    })),
  };

  return pen;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const pen = buildPen();
const outPath = path.join(__dirname, 'signal.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ signal.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
pen.screens.forEach(s => console.log(`    · ${s.name}: ${s.nodes.length} nodes`));
