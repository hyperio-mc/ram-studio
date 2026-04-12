// conductor-app.js — AI Agent Orchestration Dashboard
// Inspired by: JetBrains Air "Multitask with agents, stay in control" (lapa.ninja)
//              + Midday.ai clean tabbed dashboard (darkmodedesign.com)
//              + Minimal SaaS patterns from minimal.gallery
// Theme: LIGHT — warm off-white with indigo/amber accents

const fs = require('fs');

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F4F1',   // warm off-white
  surface:  '#FFFFFF',
  surface2: '#ECEAE5',   // subtle divider/chip bg
  surface3: '#F9F8F6',   // hover state
  text:     '#18181A',
  textSub:  '#6B6A6E',
  accent:   '#5046E5',   // electric indigo
  accent2:  '#F59E0B',   // amber
  accent3:  '#22C55E',   // green (running)
  danger:   '#EF4444',   // red (error)
  border:   'rgba(24,24,26,0.09)',
  shadow:   'rgba(80,70,229,0.10)',
};

// ─── Pencil helpers ─────────────────────────────────────────────────────────
const W = 390, H = 844;

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill,
    r: opts.r ?? 0, stroke: opts.stroke, strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1, children: opts.ch };
}
function text(str, x, y, w, h, opts = {}) {
  return { type: 'text', x, y, w, h, content: str,
    fontSize: opts.size ?? 14, fontWeight: opts.weight ?? 400,
    color: opts.fill ?? P.text, align: opts.align ?? 'left',
    letterSpacing: opts.ls ?? 0, opacity: opts.opacity ?? 1,
    lineHeight: opts.lh ?? 1.4 };
}
function circle(x, y, r, fill, opts = {}) {
  return { type: 'ellipse', x: x - r, y: y - r, w: r*2, h: r*2, fill,
    stroke: opts.stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}
function line(x1, y1, x2, y2, color, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke: color,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ─── Reusable components ─────────────────────────────────────────────────────

function statusDot(x, y, color) {
  return circle(x, y, 4, color, {});
}

function chip(x, y, label, color, bg) {
  return rect(x, y, 60, 20, bg, { r: 10, ch: [
    text(label, 0, 3, 60, 14, { size: 10, fill: color, align: 'center', weight: 600 })
  ]});
}

function agentRow(x, y, w, name, task, status, pct) {
  const statusColor = status === 'running' ? P.accent3 : status === 'idle' ? P.textSub : P.danger;
  const statusLabel = status === 'running' ? 'RUNNING' : status === 'idle' ? 'IDLE' : 'ERROR';
  const chipBg      = status === 'running' ? 'rgba(34,197,94,0.10)' : status === 'idle' ? P.surface2 : 'rgba(239,68,68,0.10)';

  return rect(x, y, w, 76, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    // left accent strip
    rect(0, 0, 3, 76, status === 'running' ? P.accent3 : status === 'idle' ? P.surface2 : P.danger, { r: 2 }),
    // status dot
    statusDot(20, 24, statusColor),
    // name
    text(name, 32, 10, 180, 18, { size: 14, weight: 700 }),
    // task desc
    text(task, 32, 30, 220, 14, { size: 11, fill: P.textSub }),
    // chip
    chip(w - 72, 10, statusLabel, statusColor, chipBg),
    // progress bar bg
    rect(32, 54, w - 50, 6, P.surface2, { r: 3 }),
    // progress bar fill
    rect(32, 54, Math.max(6, (w - 50) * pct / 100), 6, P.accent, { r: 3, opacity: status === 'idle' ? 0.3 : 1 }),
    // pct
    text(`${pct}%`, w - 14, 50, 30, 12, { size: 10, fill: P.textSub, align: 'right' }),
  ]});
}

function metricCard(x, y, w, h, label, value, sub, accentColor) {
  return rect(x, y, w, h, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    text(label, 14, 14, w - 28, 14, { size: 11, fill: P.textSub, weight: 500 }),
    text(value, 14, 32, w - 28, 36, { size: 28, weight: 800, fill: accentColor ?? P.text }),
    text(sub, 14, 68, w - 28, 14, { size: 10, fill: P.textSub }),
  ]});
}

function navBar(active) {
  const items = [
    { label: 'Overview', icon: '⬡' },
    { label: 'Agents',   icon: '◈' },
    { label: 'Tasks',    icon: '◫' },
    { label: 'Analytics',icon: '◩' },
    { label: 'Compose',  icon: '+' },
  ];
  const tabW = W / items.length;
  return rect(0, H - 64, W, 64, P.surface, { stroke: P.border, sw: 1, ch: [
    line(0, 0, W, 0, P.border),
    ...items.map((item, i) => {
      const isActive = item.label === active;
      return rect(i * tabW, 0, tabW, 64, 'transparent', { ch: [
        text(item.icon, 0, 8, tabW, 20, { size: 18, align: 'center', fill: isActive ? P.accent : P.textSub }),
        text(item.label, 0, 30, tabW, 16, { size: 10, align: 'center', fill: isActive ? P.accent : P.textSub, weight: isActive ? 700 : 400 }),
        ...(isActive ? [rect(tabW * 0.25, 54, tabW * 0.5, 3, P.accent, { r: 2 })] : []),
      ]});
    }),
  ]});
}

function statusBar() {
  return rect(0, 0, W, 44, P.bg, { ch: [
    text('9:41', 16, 12, 50, 20, { size: 13, weight: 700 }),
    text('CONDUCTOR', W/2 - 50, 12, 100, 20, { size: 11, weight: 800, fill: P.accent, align: 'center', ls: 1.5 }),
    text('●●●', W - 60, 12, 50, 20, { size: 12, fill: P.textSub, align: 'right' }),
  ]});
}

// ─── Screen 1: Overview ──────────────────────────────────────────────────────
function screenOverview() {
  const children = [
    rect(0, 0, W, H, P.bg),
    statusBar(),

    // Header
    text('Good morning, Rakis', 20, 54, 280, 24, { size: 18, weight: 700 }),
    text('3 agents active · 2 tasks queued', 20, 80, 280, 16, { size: 12, fill: P.textSub }),

    // Notification icon
    rect(W - 48, 54, 32, 32, P.surface2, { r: 10, ch: [
      text('🔔', 0, 6, 32, 20, { size: 14, align: 'center' }),
    ]}),

    // Metrics row
    metricCard(16, 108, 108, 88, 'Active', '3', 'of 6 agents', P.accent3),
    metricCard(136, 108, 108, 88, 'Tasks Done', '47', 'today', P.accent),
    metricCard(256, 108, 118, 88, 'Avg Speed', '1.8s', 'per task', P.accent2),

    // Section label
    text('AGENTS', 20, 212, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
    text('View all →', W - 80, 212, 70, 14, { size: 11, fill: P.accent, align: 'right' }),

    // Agent rows
    agentRow(16, 232, W - 32, 'Researcher',    'Scanning tech papers · batch 4/12', 'running', 67),
    agentRow(16, 316, W - 32, 'Codesmith',     'Refactoring auth module · pass 2',  'running', 34),
    agentRow(16, 400, W - 32, 'Summariser',    'Idle — awaiting task assignment',    'idle',    0),
    agentRow(16, 484, W - 32, 'Validator',     'Schema lint failed · retry #2',      'error',   15),

    // Live feed label
    text('LIVE FEED', 20, 576, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),

    // Feed items
    rect(16, 596, W - 32, 36, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      statusDot(16, 18, P.accent3),
      text('Researcher completed batch 3 of 12', 28, 10, 260, 16, { size: 11 }),
      text('12s ago', W - 64, 10, 50, 16, { size: 10, fill: P.textSub, align: 'right' }),
    ]}),
    rect(16, 638, W - 32, 36, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      statusDot(16, 18, P.danger),
      text('Validator — lint error in schema.v2', 28, 10, 260, 16, { size: 11 }),
      text('1m ago', W - 64, 10, 50, 16, { size: 10, fill: P.textSub, align: 'right' }),
    ]}),
    rect(16, 680, W - 32, 36, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      statusDot(16, 18, P.accent),
      text('Codesmith started auth module pass 2', 28, 10, 260, 16, { size: 11 }),
      text('3m ago', W - 64, 10, 50, 16, { size: 10, fill: P.textSub, align: 'right' }),
    ]}),

    navBar('Overview'),
  ];
  return { id: 'overview', label: 'Overview', width: W, height: H, backgroundColor: P.bg, elements: children };
}

// ─── Screen 2: Agent Detail ──────────────────────────────────────────────────
function screenAgentDetail() {
  // Sparkline data (fake)
  const sparkVals = [40, 55, 45, 70, 65, 80, 75, 90, 85, 92, 88, 96];
  const sparkW = W - 48, sparkH = 64;
  const sparkX = 24, sparkY = 232;

  function sparkLine(vals, x, y, w, h) {
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const pts = vals.map((v, i) => ({
      px: x + (i / (vals.length - 1)) * w,
      py: y + h - ((v - min) / (max - min + 1)) * h,
    }));
    const lines = [];
    for (let i = 0; i < pts.length - 1; i++) {
      lines.push(line(pts[i].px, pts[i].py, pts[i+1].px, pts[i+1].py, P.accent, { sw: 2 }));
    }
    return lines;
  }

  const taskLog = [
    { time: '14:22', msg: 'Batch 4 started — 12 items queued', color: P.text },
    { time: '14:18', msg: 'Batch 3 complete — 12/12 ✓', color: P.accent3 },
    { time: '14:11', msg: 'Source filter applied (tech, AI)', color: P.text },
    { time: '13:55', msg: 'Batch 2 complete — 12/12 ✓', color: P.accent3 },
    { time: '13:40', msg: 'Agent initialised with config v2.1', color: P.textSub },
  ];

  return {
    id: 'agent-detail', label: 'Agent Detail', width: W, height: H, backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),

      // Back + title
      text('← Agents', 16, 52, 100, 20, { size: 13, fill: P.accent }),
      text('Researcher', 20, 76, 260, 28, { size: 22, weight: 800 }),
      text('Scanning tech papers · batch 4 of 12', 20, 106, W - 40, 16, { size: 12, fill: P.textSub }),

      // Status pill
      rect(20, 126, 90, 24, 'rgba(34,197,94,0.12)', { r: 12, ch: [
        statusDot(14, 12, P.accent3),
        text('RUNNING', 22, 5, 60, 14, { size: 10, weight: 700, fill: P.accent3 }),
      ]}),
      rect(120, 126, 80, 24, P.surface2, { r: 12, ch: [
        text('v2.1 config', 0, 5, 80, 14, { size: 10, fill: P.textSub, align: 'center' }),
      ]}),

      // Divider
      line(0, 162, W, 162, P.border),

      // Mini metrics
      metricCard(16, 172, 106, 76, 'Tasks Done', '36', 'total today', P.accent),
      metricCard(130, 172, 106, 76, 'Accuracy', '94%', 'last 50 tasks', P.accent3),
      metricCard(244, 172, W - 260, 76, 'Speed', '2.1s', 'avg/task', P.accent2),

      // Spark chart bg
      rect(16, 260, sparkW, sparkH + 20, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Tasks / hour', 12, 10, 200, 14, { size: 10, fill: P.textSub, weight: 600 }),
        ...sparkLine(sparkVals, 16, 28, sparkW - 32, sparkH - 10),
      ]}),

      // Progress section
      text('CURRENT BATCH', 20, 360, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      rect(16, 380, W - 32, 60, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Batch 4 of 12', 16, 10, 200, 18, { size: 13, weight: 700 }),
        text('8 remaining in queue', 16, 30, 200, 14, { size: 11, fill: P.textSub }),
        // bar
        rect(W - 130, 18, 100, 8, P.surface2, { r: 4 }),
        rect(W - 130, 18, 67, 8, P.accent, { r: 4 }),
        text('67%', W - 22, 14, 30, 16, { size: 10, fill: P.textSub, align: 'right' }),
      ]}),

      // Task log
      text('ACTIVITY LOG', 20, 458, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      ...taskLog.map((entry, i) =>
        rect(16, 478 + i * 46, W - 32, 40, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
          text(entry.time, 12, 12, 44, 16, { size: 10, fill: P.textSub, weight: 600 }),
          line(58, 4, 58, 36, P.border, { sw: 1 }),
          text(entry.msg, 70, 12, W - 100, 16, { size: 11, fill: entry.color }),
        ]})
      ),

      navBar('Agents'),
    ],
  };
}

// ─── Screen 3: Task Queue ────────────────────────────────────────────────────
function screenTasks() {
  const tasks = [
    { id: 'T-091', name: 'Summarise paper batch', agent: 'Researcher', priority: 'high',  status: 'running', pct: 67 },
    { id: 'T-090', name: 'Refactor auth module',  agent: 'Codesmith',  priority: 'high',  status: 'running', pct: 34 },
    { id: 'T-089', name: 'Lint schema v2.1',       agent: 'Validator',  priority: 'med',   status: 'error',   pct: 0 },
    { id: 'T-088', name: 'Generate API docs',      agent: 'Unassigned', priority: 'low',   status: 'queued',  pct: 0 },
    { id: 'T-087', name: 'Unit test coverage run', agent: 'Unassigned', priority: 'med',   status: 'queued',  pct: 0 },
    { id: 'T-086', name: 'Summarise Q1 metrics',   agent: 'Summariser', priority: 'low',   status: 'idle',    pct: 0 },
  ];

  const priorityColor = { high: P.danger, med: P.accent2, low: P.textSub };
  const statusColor = { running: P.accent3, error: P.danger, queued: P.accent, idle: P.textSub };
  const statusBg = { running: 'rgba(34,197,94,0.10)', error: 'rgba(239,68,68,0.10)', queued: 'rgba(80,70,229,0.10)', idle: P.surface2 };

  return {
    id: 'tasks', label: 'Task Queue', width: W, height: H, backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),

      text('Task Queue', 20, 56, 250, 28, { size: 22, weight: 800 }),
      text('6 tasks · 2 running', 20, 86, 200, 16, { size: 12, fill: P.textSub }),

      // New task btn
      rect(W - 100, 54, 88, 34, P.accent, { r: 10, ch: [
        text('+ New Task', 0, 9, 88, 16, { size: 12, fill: '#FFF', align: 'center', weight: 700 }),
      ]}),

      // Tabs
      rect(16, 108, W - 32, 36, P.surface2, { r: 10, ch: [
        rect(2, 2, (W - 36) / 3, 32, P.surface, { r: 8, ch: [
          text('All (6)', 0, 8, (W - 36) / 3, 16, { size: 12, align: 'center', weight: 700 }),
        ]}),
        text('Running', (W - 36) / 3 + 2, 8, (W - 36) / 3, 16, { size: 12, align: 'center', fill: P.textSub }),
        text('Queued', (W - 36) * 2 / 3 + 2, 8, (W - 36) / 3, 16, { size: 12, align: 'center', fill: P.textSub }),
      ]}),

      // Task cards
      ...tasks.map((task, i) => {
        const sc = statusColor[task.status];
        const sb = statusBg[task.status];
        const pc = priorityColor[task.priority];
        return rect(16, 156 + i * 86, W - 32, 78, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
          // left priority bar
          rect(0, 0, 3, 78, pc, { r: 2 }),
          text(task.id, 14, 10, 60, 14, { size: 10, fill: P.textSub, weight: 600 }),
          text(task.name, 14, 26, 220, 18, { size: 14, weight: 700 }),
          text(task.agent, 14, 46, 160, 14, { size: 11, fill: P.textSub }),
          // priority chip
          rect(W - 80, 8, 64, 20, 'transparent', { ch: [
            text(task.priority.toUpperCase(), 0, 4, 64, 12, { size: 9, fill: pc, align: 'right', weight: 700, ls: 0.5 }),
          ]}),
          // status chip
          rect(W - 104, 46, 90, 20, sb, { r: 10, ch: [
            text(task.status.toUpperCase(), 0, 4, 90, 12, { size: 9, fill: sc, align: 'center', weight: 700 }),
          ]}),
          // progress (if running)
          ...(task.pct > 0 ? [
            rect(14, 62, W - 60, 6, P.surface2, { r: 3 }),
            rect(14, 62, (W - 60) * task.pct / 100, 6, P.accent, { r: 3 }),
          ] : []),
        ]});
      }),

      navBar('Tasks'),
    ],
  };
}

// ─── Screen 4: Analytics ────────────────────────────────────────────────────
function screenAnalytics() {
  // Bar chart data — tasks per agent
  const bars = [
    { label: 'Research', val: 47, color: P.accent },
    { label: 'Codesmith', val: 31, color: P.accent2 },
    { label: 'Validate', val: 12, color: P.danger },
    { label: 'Summarise', val: 22, color: P.accent3 },
    { label: 'Other', val: 8, color: P.textSub },
  ];
  const maxVal = Math.max(...bars.map(b => b.val));
  const barW = 48, barH = 120, barY = 290, barGap = 14;
  const barStartX = (W - (bars.length * (barW + barGap) - barGap)) / 2;

  return {
    id: 'analytics', label: 'Analytics', width: W, height: H, backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),

      text('Analytics', 20, 56, 250, 28, { size: 22, weight: 800 }),
      text('Today · March 25, 2026', 20, 86, 250, 16, { size: 12, fill: P.textSub }),

      // Summary cards row
      metricCard(16, 110, 108, 82, 'Total Tasks', '120', '+18% vs yesterday', P.accent),
      metricCard(132, 110, 108, 82, 'Success Rate', '96%', 'last 24h', P.accent3),
      metricCard(248, 110, W - 264, 82, 'Errors', '5', '↓ 2 from yesterday', P.danger),

      // Bar chart card
      rect(16, 204, W - 32, 220, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        text('Tasks by Agent', 16, 14, 200, 16, { size: 13, weight: 700 }),
        text('Today', W - 80, 14, 64, 16, { size: 11, fill: P.textSub, align: 'right' }),
        // bars
        ...bars.map((b, i) => {
          const bh = (b.val / maxVal) * barH;
          const bx = barStartX + i * (barW + barGap) - 16;
          return rect(bx, barY - bh - 60, barW, bh, b.color, { r: 6, opacity: 0.85, ch: [
            // value on top
            text(b.val.toString(), 0, -18, barW, 16, { size: 11, weight: 700, fill: b.color, align: 'center' }),
          ]});
        }),
        // x-axis labels
        ...bars.map((b, i) => {
          const bx = barStartX + i * (barW + barGap) - 16;
          return text(b.label, bx, barY - 50, barW, 14, { size: 9, fill: P.textSub, align: 'center' });
        }),
        // baseline
        line(16, barY - 48, W - 64, barY - 48, P.border),
      ]}),

      // Heatmap label
      text('ACTIVITY HEATMAP', 20, 438, 250, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      rect(16, 458, W - 32, 96, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Mon', 12, 12, 30, 14, { size: 9, fill: P.textSub }),
        text('Tue', 12, 28, 30, 14, { size: 9, fill: P.textSub }),
        text('Wed', 12, 44, 30, 14, { size: 9, fill: P.textSub }),
        text('Thu', 12, 60, 30, 14, { size: 9, fill: P.textSub }),
        // heatmap cells (5 rows × 12 cols)
        ...[0,1,2,3].flatMap(row =>
          [0,1,2,3,4,5,6,7,8,9,10,11].map(col => {
            const intensity = Math.random();
            const alpha = 0.1 + intensity * 0.9;
            return rect(44 + col * 25, 8 + row * 20, 22, 16,
              `rgba(80,70,229,${alpha.toFixed(2)})`, { r: 3 });
          })
        ),
        text('12:00', 44, 76, 60, 12, { size: 9, fill: P.textSub }),
        text('18:00', 144, 76, 60, 12, { size: 9, fill: P.textSub }),
        text('Now', 284, 76, 40, 12, { size: 9, fill: P.textSub }),
      ]}),

      // Agent efficiency
      text('AGENT EFFICIENCY', 20, 566, 250, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      ...['Researcher', 'Codesmith', 'Summariser'].map((name, i) => {
        const pct = [96, 88, 72][i];
        const color = [P.accent3, P.accent, P.accent2][i];
        return rect(16, 586 + i * 52, W - 32, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
          text(name, 14, 14, 160, 16, { size: 12, weight: 600 }),
          text(`${pct}%`, W - 64, 14, 48, 16, { size: 12, weight: 700, fill: color, align: 'right' }),
          rect(14, 32, W - 60, 6, P.surface2, { r: 3 }),
          rect(14, 32, (W - 60) * pct / 100, 6, color, { r: 3 }),
        ]});
      }),

      navBar('Analytics'),
    ],
  };
}

// ─── Screen 5: Compose Task ──────────────────────────────────────────────────
function screenCompose() {
  const agentChips = ['Researcher', 'Codesmith', 'Validator', 'Summariser'];
  const priorityChips = ['High', 'Medium', 'Low'];

  return {
    id: 'compose', label: 'Compose Task', width: W, height: H, backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),

      // Header
      text('← Back', 16, 52, 80, 20, { size: 13, fill: P.accent }),
      text('New Task', 20, 76, 250, 28, { size: 22, weight: 800 }),
      text('Define a task to assign to an agent', 20, 106, W - 40, 16, { size: 12, fill: P.textSub }),

      // Task name field
      text('TASK NAME', 20, 138, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      rect(16, 156, W - 32, 48, P.surface, { r: 12, stroke: P.accent, sw: 1.5, ch: [
        text('Summarise Q1 growth metrics…', 16, 15, W - 60, 18, { size: 14, fill: P.text, opacity: 0.5 }),
      ]}),

      // Instructions
      text('INSTRUCTIONS', 20, 220, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      rect(16, 238, W - 32, 88, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Analyse the Q1 2026 dashboard data and generate a concise executive summary…', 16, 12, W - 60, 64, { size: 13, fill: P.text, lh: 1.5 }),
      ]}),

      // Assign to
      text('ASSIGN TO', 20, 342, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      ...agentChips.map((name, i) => {
        const isSelected = name === 'Summariser';
        const col = i % 2, row = Math.floor(i / 2);
        const chipW = (W - 48) / 2;
        return rect(16 + col * (chipW + 8), 360 + row * 46, chipW, 38, isSelected ? 'rgba(80,70,229,0.10)' : P.surface, {
          r: 10, stroke: isSelected ? P.accent : P.border, sw: isSelected ? 1.5 : 1,
          ch: [
            text(name, 0, 10, chipW, 18, { size: 13, align: 'center', fill: isSelected ? P.accent : P.text, weight: isSelected ? 700 : 400 }),
          ]
        });
      }),

      // Priority
      text('PRIORITY', 20, 456, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      ...priorityChips.map((p, i) => {
        const colors = [P.danger, P.accent2, P.textSub];
        const bgs = ['rgba(239,68,68,0.10)', 'rgba(245,158,11,0.10)', P.surface2];
        const chipW = (W - 48) / 3;
        return rect(16 + i * (chipW + 8), 474, chipW, 34, bgs[i], {
          r: 10, stroke: 'transparent',
          ch: [
            text(p, 0, 9, chipW, 16, { size: 12, align: 'center', fill: colors[i], weight: 600 }),
          ]
        });
      }),

      // Run mode
      text('RUN MODE', 20, 524, 200, 14, { size: 10, fill: P.textSub, weight: 700, ls: 1.5 }),
      rect(16, 542, W - 32, 40, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Autonomous — Agent decides steps', 16, 12, W - 80, 16, { size: 13 }),
        text('▾', W - 32, 12, 20, 16, { size: 14, fill: P.textSub, align: 'right' }),
      ]}),

      // Schedule toggle
      rect(16, 594, W - 32, 40, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        text('Schedule for later', 16, 12, 200, 16, { size: 13 }),
        // toggle (off)
        rect(W - 68, 10, 44, 22, P.surface2, { r: 11, ch: [
          circle(40, 11, 9, P.surface, {}),
        ]}),
      ]}),

      // Submit button
      rect(16, 648, W - 32, 52, P.accent, { r: 16, ch: [
        text('Dispatch Task →', 0, 16, W - 32, 20, { size: 16, fill: '#FFFFFF', align: 'center', weight: 700 }),
      ]}),

      // Cancel
      text('Cancel', 0, 712, W, 16, { size: 14, fill: P.textSub, align: 'center' }),

      navBar('Compose'),
    ],
  };
}

// ─── Assemble .pen file ──────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Conductor — AI Agent Orchestration',
  description: 'Light-theme dashboard for managing, monitoring, and composing multi-agent AI workflows. Inspired by JetBrains Air (lapa.ninja) and Midday.ai (darkmodedesign.com).',
  screens: [
    screenOverview(),
    screenAgentDetail(),
    screenTasks(),
    screenAnalytics(),
    screenCompose(),
  ],
  meta: {
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    palette: P,
    theme: 'light',
    archetype: 'ai-ops-dashboard',
  },
};

fs.writeFileSync('/workspace/group/design-studio/conductor.pen', JSON.stringify(pen, null, 2));
console.log('✓ conductor.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.label).join(', '));
