// ARC — AI Agent Orchestration Console
// Inspired by: Linear's "calmer, more consistent UI refresh" (darkmodedesign.com)
// + Codegen "OS for Code Agents" (land-book.com)
// Dark theme. Network graph visualization + serene dark productivity aesthetic.
// Pencil.dev format v2.8

const fs = require('fs');

const W = 390;
const H = 844;
const SCREENS = 6;
const GAP = 60;
const CANVAS_W = W * SCREENS + GAP * (SCREENS - 1);

// ARC Palette — deep space midnight + violet + teal
const C = {
  bg:        '#0D0C14',
  surface:   '#141320',
  surfaceHi: '#1C1A2E',
  border:    '#28263C',
  borderHi:  '#3A3758',
  text:      '#EBE9FC',
  muted:     'rgba(235,233,252,0.45)',
  dim:       'rgba(235,233,252,0.2)',
  accent:    '#8B5CF6',   // violet — primary
  accent2:   '#2DD4BF',  // teal — running/active
  accent3:   '#F59E0B',  // amber — queued/warn
  accent4:   '#F87171',  // red — error
};

let _id = 1;
const uid = () => `arc-${_id++}`;

// ─── Primitives ───────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rect', x, y, width: w, height: h, fill,
    ...(opts.radius ? { cornerRadius: opts.radius } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    id: uid(), type: 'text', x, y,
    content: String(content),
    fontSize: size,
    fill,
    fontFamily: opts.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
    fontWeight: opts.weight || 400,
    ...(opts.align ? { textAlign: opts.align } : {}),
    ...(opts.width ? { width: opts.width } : {}),
    ...(opts.lineHeight ? { lineHeight: opts.lineHeight } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.letterSpacing ? { letterSpacing: opts.letterSpacing } : {}),
  };
}

function line(x1, y1, x2, y2, stroke, strokeWidth = 1, opts = {}) {
  return {
    id: uid(), type: 'line', x: x1, y: y1, x2, y2,
    stroke, strokeWidth,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.dash ? { strokeDasharray: opts.dash } : {}),
  };
}

function ellipse(cx, cy, r, fill, opts = {}) {
  return {
    id: uid(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2, fill,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1.5 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

// ─── Components ───────────────────────────────────────────────────────────────

function navBar(activeIdx) {
  const items = [
    { label: 'Hub',       icon: '⬡' },
    { label: 'Agents',    icon: '◈' },
    { label: 'Graph',     icon: '◉' },
    { label: 'Logs',      icon: '≡' },
    { label: 'Settings',  icon: '◎' },
  ];
  const iw = W / items.length;
  const els = [
    rect(0, H - 70, W, 70, C.surface),
    rect(0, H - 70, W, 1, C.border),
  ];
  items.forEach((item, i) => {
    const cx = iw * i + iw / 2;
    const active = i === activeIdx;
    if (active) els.push(rect(cx - 24, H - 68, 48, 34, `${C.accent}1A`, { radius: 10 }));
    els.push(text(cx - 9, H - 62, item.icon, 18, active ? C.accent : C.dim));
    els.push(text(cx - (item.label.length * 3.5), H - 40, item.label, 9.5,
      active ? C.accent : C.dim, { weight: active ? 600 : 400 }));
  });
  return els;
}

function statusBar() {
  return [
    text(16, 14, '9:41', 13, C.text, { weight: 700 }),
    text(W - 56, 14, '▣▣▣', 10, C.muted),
  ];
}

function label(x, y, txt) {
  return text(x, y, txt, 9.5, C.accent, { weight: 700, letterSpacing: 1.0 });
}

function pill(x, y, txt, fg, bg) {
  const w = txt.length * 6.8 + 16;
  return [
    rect(x, y, w, 20, bg, { radius: 10 }),
    text(x + 8, y + 4, txt, 9, fg, { weight: 600, letterSpacing: 0.3 }),
  ];
}

function divider(y) {
  return rect(16, y, W - 32, 1, C.border);
}

// ─── Screen 1: Hub — Command Center ──────────────────────────────────────────

function screen1() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(text(16, 44, 'ARC', 26, C.text, { weight: 800, letterSpacing: -1 }));
  els.push(text(16, 72, 'Agent Orchestration Console', 11, C.muted));
  els.push(...pill(W - 102, 48, '● 7 ACTIVE', C.accent2, `${C.accent2}1A`));

  els.push(divider(96));

  // 4 metric tiles 2×2
  const mw = (W - 48) / 2;
  const metrics = [
    { lbl: 'ACTIVE AGENTS', val: '7',    sub: '↑2 since yesterday', col: C.accent2 },
    { lbl: 'TASKS TODAY',   val: '342',  sub: '↑18% vs avg',         col: C.accent  },
    { lbl: 'PIPELINE RUNS', val: '29',   sub: 'Last run: 4m ago',    col: C.text    },
    { lbl: 'ERROR RATE',    val: '0.3%', sub: '↓ Well within range', col: C.accent2 },
  ];
  metrics.forEach((m, i) => {
    const mx = i % 2 === 0 ? 16 : 24 + mw;
    const my = 106 + Math.floor(i / 2) * 84;
    els.push(rect(mx, my, mw, 76, C.surfaceHi, { radius: 12, stroke: C.border }));
    els.push(text(mx + 12, my + 12, m.lbl, 8.5, C.muted, { letterSpacing: 0.5 }));
    els.push(text(mx + 12, my + 28, m.val, 24, m.col, { weight: 700, mono: true }));
    els.push(text(mx + 12, my + 57, m.sub, 9, C.dim));
  });

  els.push(divider(282));

  // Activity feed
  els.push(label(16, 292, 'RECENT ACTIVITY'));

  const events = [
    { dot: C.accent2, agent: 'Scout-3',  msg: 'Web crawl complete → 412 pages indexed',      time: '9:41' },
    { dot: C.accent,  agent: 'Coder-1',  msg: 'PR #291 opened — auth refactor, 14 files',      time: '9:38' },
    { dot: C.accent2, agent: 'Analyst',  msg: 'Q1 summary report generated and stored',        time: '9:35' },
    { dot: C.accent3, agent: 'Fetch-2',  msg: 'Rate limited — retrying in 60s',                time: '9:29' },
    { dot: C.accent2, agent: 'Writer-A', msg: 'Article draft published to CMS',                time: '9:22' },
  ];
  events.forEach((ev, i) => {
    const ey = 310 + i * 56;
    els.push(rect(16, ey, W - 32, 50, C.surfaceHi, { radius: 10 }));
    els.push(ellipse(30, ey + 14, 4, ev.dot));
    els.push(text(44, ey + 8, ev.agent, 11, C.text, { weight: 600 }));
    els.push(text(W - 52, ey + 8, ev.time, 9.5, C.dim, { mono: true }));
    els.push(text(44, ey + 24, ev.msg, 10, C.muted, { width: W - 100 }));
  });

  els.push(...navBar(0));
  return els;
}

// ─── Screen 2: Agents List ────────────────────────────────────────────────────

function screen2() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(label(16, 44, 'AGENTS'));
  els.push(text(16, 60, 'Your fleet', 22, C.text, { weight: 700 }));

  // Search bar
  els.push(rect(16, 94, W - 32, 36, C.surfaceHi, { radius: 10, stroke: C.border }));
  els.push(text(36, 105, '⌕  Search agents…', 12, C.dim));

  els.push(text(16, 142, 'RUNNING  •  4', 9.5, C.accent2, { weight: 600, letterSpacing: 0.8 }));

  const agents = [
    { name: 'Coder-1',  role: 'Code generation & PR review',  status: 'running', m: ['87 tasks', '96% success'] },
    { name: 'Scout-3',  role: 'Web crawl & content extraction', status: 'running', m: ['2.1K pages', '99.1% ok'] },
    { name: 'Analyst',  role: 'Data analysis & reporting',     status: 'running', m: ['12 reports', '340ms avg'] },
    { name: 'Fetch-2',  role: 'API & data fetching',           status: 'queued',  m: ['38 queued', '3 retries']  },
  ];

  agents.forEach((a, i) => {
    const ay = 160 + i * 90;
    const sc = a.status === 'running' ? C.accent2 : C.accent3;
    els.push(rect(16, ay, W - 32, 82, C.surfaceHi, { radius: 12, stroke: C.border }));
    els.push(rect(16, ay, 3, 82, sc, { radius: 2 }));
    els.push(ellipse(34, ay + 24, 6, sc));
    els.push(text(48, ay + 14, a.name, 13, C.text, { weight: 600 }));
    els.push(text(48, ay + 30, a.role, 10, C.muted));
    // metrics
    els.push(rect(28, ay + 50, (W - 72) / 2, 22, C.surface, { radius: 6 }));
    els.push(text(36, ay + 56, a.m[0], 9.5, C.accent, { mono: true }));
    els.push(rect(28 + (W - 72) / 2 + 8, ay + 50, (W - 72) / 2, 22, C.surface, { radius: 6 }));
    els.push(text(36 + (W - 72) / 2 + 8, ay + 56, a.m[1], 9.5, C.accent2, { mono: true }));
    els.push(...pill(W - 80, ay + 14, a.status === 'running' ? '● RUN' : '◎ QUEUE', sc, `${sc}15`));
  });

  // Idle section
  els.push(text(16, 526, 'IDLE  •  3', 9.5, C.dim, { weight: 600, letterSpacing: 0.8 }));
  ['Writer-A', 'Review-B', 'Deploy-1'].forEach((name, i) => {
    const ay = 542 + i * 50;
    els.push(rect(16, ay, W - 32, 44, C.surfaceHi, { radius: 10, stroke: C.border, opacity: 0.55 }));
    els.push(ellipse(30, ay + 22, 5, C.dim));
    els.push(text(44, ay + 14, name, 12, C.text, { weight: 600, opacity: 0.5 }));
    els.push(text(W - 60, ay + 14, 'IDLE', 9.5, C.dim, { weight: 600 }));
  });

  els.push(...navBar(1));
  return els;
}

// ─── Screen 3: Network Graph ──────────────────────────────────────────────────

function screen3() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(label(16, 44, 'PIPELINE GRAPH'));
  els.push(text(16, 60, 'Research → Publish', 18, C.text, { weight: 700 }));

  // Graph area tinted bg
  els.push(rect(16, 92, W - 32, 460, `${C.accent}07`, { radius: 16 }));

  // Node positions (all relative to screen)
  const nodes = [
    { id: 'trigger', lbl: 'TRIGGER',  sub: 'webhook',  x: 195, y: 138, r: 28, col: C.borderHi  },
    { id: 'scout',   lbl: 'Scout-3',  sub: 'crawl',    x:  95, y: 228, r: 34, col: C.accent2   },
    { id: 'fetch',   lbl: 'Fetch-2',  sub: 'fetch',    x: 295, y: 228, r: 34, col: C.accent3   },
    { id: 'analyst', lbl: 'Analyst',  sub: 'analyze',  x: 195, y: 328, r: 36, col: C.accent    },
    { id: 'writer',  lbl: 'Writer-A', sub: 'write',    x:  95, y: 428, r: 32, col: C.accent2   },
    { id: 'coder',   lbl: 'Coder-1',  sub: 'code',     x: 295, y: 428, r: 32, col: C.accent    },
    { id: 'output',  lbl: 'OUTPUT',   sub: 'publish',  x: 195, y: 518, r: 28, col: C.accent2   },
  ];

  const edges = [
    ['trigger', 'scout'],  ['trigger', 'fetch'],
    ['scout',   'analyst'],['fetch',   'analyst'],
    ['analyst', 'writer'], ['analyst', 'coder'],
    ['writer',  'output'], ['coder',   'output'],
  ];

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // Draw edges
  edges.forEach(([fid, tid]) => {
    const f = nodeMap[fid]; const t = nodeMap[tid];
    // glow
    els.push({ ...line(f.x, f.y, t.x, t.y, `${C.accent}25`, 7), id: uid() });
    // main
    els.push(line(f.x, f.y, t.x, t.y, C.borderHi, 1.5));
    // traveling dot (midpoint)
    const mx = (f.x + t.x) / 2;
    const my = (f.y + t.y) / 2;
    els.push(ellipse(mx, my, 3, C.accent2));
  });

  // Draw nodes
  nodes.forEach(n => {
    els.push(ellipse(n.x, n.y, n.r + 6, `${n.col}12`));  // outer glow
    els.push(ellipse(n.x, n.y, n.r, 'transparent', { stroke: n.col, strokeWidth: 1.5 }));
    els.push(ellipse(n.x, n.y, n.r - 3, C.surfaceHi));
    // label centered
    els.push(text(n.x - n.r + 4, n.y - 8, n.lbl, n.r > 30 ? 9.5 : 8.5, n.col, {
      weight: 700, width: (n.r - 4) * 2, align: 'center',
    }));
    els.push(text(n.x - n.r + 4, n.y + 4, n.sub, 8.5, C.muted, {
      width: (n.r - 4) * 2, align: 'center',
    }));
  });

  // Legend
  els.push(rect(16, 564, W - 32, 40, C.surfaceHi, { radius: 10, stroke: C.border }));
  const legendItems = [
    { col: C.accent2, lbl: 'Running' },
    { col: C.accent,  lbl: 'Queued'  },
    { col: C.accent3, lbl: 'Waiting' },
    { col: C.accent4, lbl: 'Error'   },
  ];
  legendItems.forEach((li, i) => {
    const lx = 28 + i * 86;
    els.push(ellipse(lx, 584, 4, li.col));
    els.push(text(lx + 10, 578, li.lbl, 9.5, C.muted));
  });

  // Stats bar
  els.push(rect(16, 614, W - 32, 34, C.surfaceHi, { radius: 10, stroke: C.border }));
  els.push(text(28, 624, '7 nodes  •  8 edges  •  avg depth 3  •  last run 4m ago', 9.5, C.dim, { width: W - 56 }));

  els.push(...navBar(2));
  return els;
}

// ─── Screen 4: Agent Detail — Coder-1 ────────────────────────────────────────

function screen4() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(text(16, 48, '← Agents', 11.5, C.accent, { weight: 600 }));

  // Agent header
  els.push(rect(16, 70, W - 32, 96, C.surfaceHi, { radius: 14, stroke: `${C.accent}50` }));
  els.push(rect(16, 70, 4, 96, C.accent, { radius: 2 }));
  // Ring avatar
  els.push(ellipse(52, 118, 22, C.surface));
  els.push(ellipse(52, 118, 22, 'transparent', { stroke: C.accent, strokeWidth: 2 }));
  els.push(text(43, 112, '◈', 16, C.accent));
  els.push(text(84, 80, 'Coder-1', 18, C.text, { weight: 700 }));
  els.push(text(84, 100, 'Code generation & PR review', 10, C.muted));
  els.push(...pill(84, 118, '● RUNNING', C.accent2, `${C.accent2}1A`));
  els.push(text(W - 48, 80, 'Edit', 10.5, C.accent, { weight: 600 }));

  // Model config
  els.push(rect(16, 176, W - 32, 52, C.surfaceHi, { radius: 10, stroke: C.border }));
  els.push(text(28, 186, 'MODEL', 8, C.dim, { letterSpacing: 0.8 }));
  els.push(text(28, 198, 'claude-3-7-sonnet-20250219', 10.5, C.accent, { mono: true, weight: 600 }));
  els.push(text(28, 214, 'Temp: 0.2  •  Context: 128K  •  Tools: 8', 9, C.muted));

  // 3-col metrics
  els.push(label(16, 240, 'PERFORMANCE'));
  const mw = (W - 52) / 3;
  [
    { l: 'TASKS', v: '87', s: 'today' },
    { l: 'SUCCESS', v: '96%', s: '+2% wk' },
    { l: 'AVG TIME', v: '2m14s', s: 'per task' },
  ].forEach((m, i) => {
    const mx = 16 + i * (mw + 8);
    els.push(rect(mx, 256, mw, 58, C.surfaceHi, { radius: 9, stroke: C.border }));
    els.push(text(mx + 8, 266, m.l, 7.5, C.dim, { letterSpacing: 0.5 }));
    els.push(text(mx + 8, 278, m.v, 15, C.accent, { weight: 700, mono: true }));
    els.push(text(mx + 8, 298, m.s, 8.5, C.muted));
  });

  // Current task
  els.push(label(16, 328, 'CURRENT TASK'));
  els.push(rect(16, 344, W - 32, 104, C.surfaceHi, { radius: 12, stroke: `${C.accent}40` }));
  els.push(rect(16, 344, W - 32, 3, C.accent, { radius: 2 }));
  els.push(text(28, 356, '#291  Refactor auth module', 12, C.text, { weight: 600 }));
  els.push(text(28, 374, 'Implement OAuth 2.1 with PKCE flow, replace\nlegacy JWT middleware.', 10.5, C.muted, { lineHeight: 1.5, width: W - 60 }));
  // Progress bar
  els.push(text(28, 418, 'Progress', 8.5, C.dim));
  els.push(rect(28, 430, W - 72, 4, C.border, { radius: 2 }));
  els.push(rect(28, 430, (W - 72) * 0.65, 4, C.accent, { radius: 2 }));
  els.push(text(W - 46, 426, '65%', 9.5, C.accent, { mono: true, weight: 600 }));

  // Recent tasks
  els.push(label(16, 462, 'RECENT TASKS'));
  const tasks = [
    { id: '#288', title: 'Add rate limiting middleware',  time: '4m ago',  ok: true  },
    { id: '#285', title: 'Fix CORS headers in gateway',   time: '18m ago', ok: true  },
    { id: '#282', title: 'Database migration v2→v3',      time: '1h ago',  ok: false },
    { id: '#279', title: 'Set up test coverage reports',  time: '2h ago',  ok: true  },
  ];
  tasks.forEach((t, i) => {
    const ty = 478 + i * 46;
    els.push(rect(16, ty, W - 32, 40, C.surfaceHi, { radius: 9 }));
    els.push(ellipse(30, ty + 20, 5, t.ok ? C.accent2 : C.accent4));
    els.push(text(44, ty + 11, t.id, 10, C.accent, { mono: true, weight: 600 }));
    els.push(text(82, ty + 11, t.title, 10.5, C.text, { width: W - 156 }));
    els.push(text(W - 64, ty + 11, t.time, 9, C.dim));
  });

  els.push(...navBar(1));
  return els;
}

// ─── Screen 5: Logs — live terminal stream ────────────────────────────────────

function screen5() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(label(16, 44, 'LOGS'));
  els.push(text(16, 60, 'Live stream', 22, C.text, { weight: 700 }));

  // Filter pills
  const filters = ['All', 'Coder-1', 'Scout-3', 'Errors'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 7 + 18;
    const isActive = i === 0;
    els.push(rect(fx, 90, fw, 24, isActive ? C.accent : C.surfaceHi, { radius: 12 }));
    els.push(text(fx + fw / 2 - f.length * 3.2, 96, f, 9.5,
      isActive ? '#fff' : C.muted, { weight: isActive ? 600 : 400 }));
    fx += fw + 8;
  });

  els.push(rect(0, 122, W, 1, C.border));
  els.push(rect(0, 123, W, H - 123 - 70, '#0A0910'));

  const logs = [
    { t: '09:41:02', a: 'Coder-1', lv: 'INFO',  m: 'Starting task #291 auth refactor' },
    { t: '09:41:04', a: 'Coder-1', lv: 'DEBUG', m: 'Reading 14 source files…' },
    { t: '09:41:08', a: 'Scout-3', lv: 'INFO',  m: 'Crawl complete: 412/412 pages' },
    { t: '09:41:09', a: 'Scout-3', lv: 'INFO',  m: 'Extracted 2,100 content blocks' },
    { t: '09:41:12', a: 'Analyst', lv: 'INFO',  m: 'Processing batch 1/8…' },
    { t: '09:40:58', a: 'Fetch-2', lv: 'WARN',  m: 'Rate limit hit — backoff 60s' },
    { t: '09:40:55', a: 'Coder-1', lv: 'DEBUG', m: 'Generating PKCE flow handler' },
    { t: '09:40:52', a: 'Analyst', lv: 'INFO',  m: 'Model: claude-3-7-sonnet' },
    { t: '09:40:48', a: 'Scout-3', lv: 'DEBUG', m: 'Dedup: removed 88 duplicates' },
    { t: '09:40:44', a: 'Coder-1', lv: 'INFO',  m: 'Cloned repo at 3f2a9b1' },
    { t: '09:40:36', a: 'Fetch-2', lv: 'ERROR', m: 'Timeout: api.source.io:443' },
    { t: '09:40:30', a: 'SYSTEM',  lv: 'INFO',  m: 'Pipeline "Research→Publish" started' },
  ];

  const levelCol = { INFO: C.accent2, DEBUG: C.dim, WARN: C.accent3, ERROR: C.accent4 };
  const agentCol = { 'Coder-1': C.accent, 'Scout-3': C.accent2,
                     'Analyst': '#A78BFA', 'Fetch-2': C.accent3, 'SYSTEM': C.muted };

  logs.forEach((log, i) => {
    const ly = 132 + i * 47;
    els.push(text(10, ly, log.t, 8.5, C.dim, { mono: true }));
    els.push(text(82, ly, log.a, 8.5, agentCol[log.a] || C.muted, { mono: true, weight: 600 }));
    els.push(text(152, ly, log.lv, 8.5, levelCol[log.lv] || C.muted, { mono: true }));
    els.push(text(10, ly + 14, log.m, 9.5, C.text, { mono: true, opacity: 0.78, width: W - 20 }));
    if (i < logs.length - 1) els.push(rect(8, ly + 34, W - 16, 1, `${C.border}60`));
  });

  // cursor
  els.push(rect(10, 706, 8, 12, C.accent2, { opacity: 0.9 }));

  els.push(...navBar(3));
  return els;
}

// ─── Screen 6: Settings ───────────────────────────────────────────────────────

function screen6() {
  const els = [rect(0, 0, W, H, C.bg), ...statusBar()];

  els.push(label(16, 44, 'SETTINGS'));
  els.push(text(16, 60, 'Configuration', 22, C.text, { weight: 700 }));

  // Profile card
  els.push(rect(16, 94, W - 32, 72, C.surfaceHi, { radius: 14, stroke: C.border }));
  els.push(ellipse(52, 130, 24, C.surface));
  els.push(ellipse(52, 130, 24, 'transparent', { stroke: C.accent, strokeWidth: 2 }));
  els.push(text(43, 122, '⬡', 18, C.accent));
  els.push(text(88, 110, 'Workspace: Zenbin', 15, C.text, { weight: 600 }));
  els.push(text(88, 128, 'Pro plan  •  7 agents  •  5 pipelines', 10, C.muted));
  els.push(text(W - 56, 118, 'Manage', 10.5, C.accent, { weight: 600 }));

  // Sections
  const sections = [
    {
      heading: 'API CONNECTIONS',
      items: [
        { lbl: 'Anthropic Claude', val: 'Connected', vc: C.accent2 },
        { lbl: 'GitHub Integration', val: 'Active', vc: C.accent2 },
        { lbl: 'Slack Webhooks', val: 'Active', vc: C.accent2 },
        { lbl: 'Custom HTTP Tools', val: '3 configured', vc: C.muted },
      ],
    },
    {
      heading: 'EXECUTION',
      items: [
        { lbl: 'Default model', val: 'claude-3-7-sonnet', vc: C.accent },
        { lbl: 'Max concurrent agents', val: '10', vc: C.muted },
        { lbl: 'Task timeout', val: '15 min', vc: C.muted },
        { lbl: 'Auto-retry on error', val: 'Enabled', vc: C.accent2 },
      ],
    },
  ];

  let sy = 180;
  sections.forEach(sec => {
    els.push(label(16, sy, sec.heading));
    sy += 20;
    sec.items.forEach(item => {
      els.push(rect(16, sy, W - 32, 40, C.surfaceHi, { radius: 9, stroke: C.border }));
      els.push(text(28, sy + 12, item.lbl, 11.5, C.text));
      els.push(text(W - 100, sy + 12, item.val, 10.5, item.vc, { weight: 500 }));
      els.push(text(W - 28, sy + 14, '›', 14, C.dim));
      sy += 50;
    });
    sy += 10;
  });

  // Danger zone
  els.push(rect(16, sy, W - 32, 54, `${C.accent4}12`, { radius: 12, stroke: `${C.accent4}30` }));
  els.push(text(28, sy + 10, 'Danger Zone', 12, C.accent4, { weight: 600 }));
  els.push(text(28, sy + 27, 'Reset all agents  •  Delete workspace', 10.5, `${C.accent4}BB`));

  els.push(...navBar(4));
  return els;
}

// ─── Assemble canvas ──────────────────────────────────────────────────────────

function buildCanvas() {
  const allScreens = [
    screen1(), screen2(), screen3(),
    screen4(), screen5(), screen6(),
  ];

  const frames = allScreens.map((children, i) => ({
    id: `arc-frame-${i + 1}`,
    type: 'frame',
    x: i * (W + GAP),
    y: 0,
    width: W,
    height: H,
    fill: C.bg,
    clip: true,
    children,
  }));

  return {
    version: '2.8',
    name: 'ARC — AI Agent Orchestration Console',
    width: CANVAS_W,
    height: H,
    background: '#08070F',
    screens: frames,
  };
}

const pen = buildCanvas();
fs.writeFileSync('/workspace/group/design-studio/arc.pen', JSON.stringify(pen, null, 2));

const total = pen.screens.reduce((s, sc) => s + sc.children.length, 0);
console.log('✓ arc.pen saved');
console.log('  Screens:', pen.screens.length);
console.log('  Total elements:', total);
