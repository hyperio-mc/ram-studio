'use strict';
// proxy-app.js
// PROXY — AI Agent Control Room
//
// Challenge: Design a dark-mode AI Agent Control Room for solo founders.
// Directly inspired by:
// 1. Belka.ai (darkmodedesign.com, March 2026) — near-dark #181818 bg with
//    bold Times New Roman serif for an AI industrial product. The unexpected
//    editorial serif-on-darkness move is what this design pushes further.
// 2. Linear (darkmodedesign.com, March 2026) — near-black #08090A,
//    "for teams AND agents" — the world where AI agents are first-class
//    collaborators. Linear's restraint and near-absolute darkness is the UI canon.
// 3. Stripe Sessions 2026 (godly.website) — deep purple #20033C accent on
//    dark backgrounds, dramatic event/conference presence.
//
// Palette: near-black #0A0A0F + electric violet #6B5EFF + cyber teal #3DFFC0
// Typography push: serif display text for agent names (editorial-industrial)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0A0A0F',   // near-black with cool blue shift (deeper than Linear)
  surface:  '#111118',   // elevated surface
  surface2: '#181822',   // card surface
  surface3: '#1E1E2C',   // lighter card
  border:   '#24243A',   // subtle border
  muted:    '#4A4A68',   // muted indigo
  fg:       '#F0F0FA',   // cool near-white
  accent:   '#6B5EFF',   // electric violet (AI authority)
  teal:     '#3DFFC0',   // cyber teal (online/positive)
  warm:     '#FF6565',   // warm red (error/warning)
  amber:    '#FFD166',   // amber (pending/caution)
  violet2:  '#9B8FFF',   // lighter violet (secondary)
  dim:      '#1C1C2A',   // dimmed surface
};

let _id = 0;
const uid = () => `px${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Glow layers ───────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r * 2.5, cy - r * 2.5, r * 5,   r * 5,   color + '05'),
  E(cx - r * 1.8, cy - r * 1.8, r * 3.6, r * 3.6, color + '0C'),
  E(cx - r,       cy - r,       r * 2,   r * 2,   color + '16'),
  E(cx - r * 0.5, cy - r * 0.5, r,       r,       color + '28'),
];

// ── Status dot ────────────────────────────────────────────────────────────────
const StatusDot = (x, y, color, size = 8) => [
  E(x - size * 0.5, y - size * 0.5, size * 2, size * 2, color + '28'),
  E(x, y, size, size, color),
];

// ── Pill label ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, bgOpacity = '22') => {
  const w = label.length * 6.4 + 20;
  return F(x, y, w, 22, color + bgOpacity, {
    r: 11,
    ch: [
      T(label, 0, 4, w, 14, { size: 10, fill: color, weight: 700, ls: 0.5, align: 'center' }),
    ],
  });
};

// ── Agent status card ─────────────────────────────────────────────────────────
const AgentCard = (x, y, name, role, status, taskDesc, progress) => {
  const statusColors = {
    WORKING: P.teal,
    IDLE:    P.muted,
    ERROR:   P.warm,
    QUEUED:  P.amber,
  };
  const sc = statusColors[status] || P.muted;
  const progressW = Math.round((progress / 100) * 314);

  return F(x, y, 350, 90, P.surface2, {
    r: 14,
    stroke: status === 'WORKING' ? P.accent + '44' : P.border,
    sw: 1,
    ch: [
      // Subtle glow for working agents
      ...(status === 'WORKING' ? [E(-20, -20, 120, 120, P.accent + '08')] : []),

      // Agent avatar area
      F(14, 14, 48, 48, P.accent + '18', {
        r: 12,
        ch: [
          // Stylized letter / serif initial
          T(name[0], 0, 8, 48, 32, { size: 26, fill: sc, weight: 800, align: 'center', ls: -1 }),
        ],
      }),

      // Status dot on avatar
      ...StatusDot(50, 14, sc, 7),

      // Name + role
      T(name, 72, 14, 200, 18, { size: 15, fill: P.fg, weight: 700, ls: -0.3 }),
      T(role, 72, 34, 200, 14, { size: 10, fill: P.muted, ls: 1, weight: 500 }),

      // Status pill
      Pill(72, 54, status, sc),

      // Task description
      T(taskDesc, 72, 54, 188, 12, { size: 10, fill: P.muted, lh: 1.4 }),

      // Progress bar (only for working)
      ...(status === 'WORKING' ? [
        F(14, 76, 314, 3, P.border, { r: 2 }),
        F(14, 76, progressW, 3, P.accent, { r: 2 }),
      ] : []),

      // Right arrow
      T('→', 322, 34, 16, 20, { size: 14, fill: P.muted, align: 'center' }),
    ],
  });
};

// ── Mini event row ────────────────────────────────────────────────────────────
const EventRow = (x, y, time, agentName, action, color) => F(x, y, 350, 36, 'transparent', {
  ch: [
    T(time, 0, 10, 40, 14, { size: 9, fill: P.muted, ls: 0.3 }),
    E(46, 14, 8, 8, color),
    T(agentName, 60, 3, 100, 14, { size: 10, fill: color, weight: 700 }),
    T(action, 60, 18, 280, 13, { size: 10, fill: P.muted, lh: 1.3 }),
  ],
});

// ── Metric chip ───────────────────────────────────────────────────────────────
const MetricChip = (x, y, w, label, value, color) => F(x, y, w, 56, P.surface2, {
  r: 12,
  stroke: P.border,
  sw: 1,
  ch: [
    T(label, 12, 10, w - 24, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    T(value, 12, 26, w - 24, 22, { size: 18, fill: color, weight: 800, ls: -0.5 }),
  ],
});

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => {
  const items = [['⬡', 'Control'], ['◈', 'Agents'], ['◎', 'Tasks'], ['≡', 'Log'], ['⊕', 'Deploy']];
  return F(0, 764, 390, 80, P.surface, {
    ch: [
      Line(0, 0, 390),
      ...items.map(([icon, label], i) => {
        const nx = 12 + i * 74;
        const active = i === activeIdx;
        return [
          active ? F(nx + 10, 6, 54, 54, P.accent + '18', { r: 27 }) : null,
          T(icon, nx + 16, 12, 44, 22, { size: 18, fill: active ? P.accent : P.muted }),
          T(label, nx + 4, 36, 68, 14, {
            size: 9, fill: active ? P.accent : P.muted,
            align: 'center', weight: active ? 700 : 400, ls: 0.5,
          }),
        ].filter(Boolean);
      }).flat(),
    ],
  });
};

// ── Status bar (top) ─────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 44, 'transparent', {
  ch: [
    T('9:41', 20, 14, 60, 16, { size: 13, fill: P.fg, weight: 600 }),
    T('●●●', 290, 14, 80, 16, { size: 10, fill: P.fg, align: 'right' }),
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — MISSION CONTROL (Dashboard)
// ══════════════════════════════════════════════════════════════════════════════
function screenMissionControl(ox) {
  return F(ox, 0, 390, 844, P.bg, {
    ch: [
      // Ambient glow — top violet
      ...Glow(195, 80, 120, P.accent),

      StatusBar(),

      // Header
      T('PROXY', 20, 50, 200, 36, { size: 28, fill: P.fg, weight: 900, ls: -1 }),
      T('AI AGENT CONTROL ROOM', 20, 88, 300, 14, { size: 9, fill: P.accent, ls: 3, weight: 600 }),

      // System health strip (3 metrics)
      MetricChip(20,  110, 106, 'AGENTS', '6', P.teal),
      MetricChip(134, 110, 106, 'TASKS/HR', '142', P.accent),
      MetricChip(248, 110, 106, 'UPTIME', '99.8%', P.violet2),

      // Section: Active Agents
      T('ACTIVE AGENTS', 20, 178, 200, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),
      Line(20, 195, 350),

      AgentCard(20, 204, 'Orion', 'CUSTOMER SUPPORT', 'WORKING', 'Responding to #1284 — refund escalation', 72),
      AgentCard(20, 302, 'Vega', 'FINANCE OPS', 'WORKING', 'Reconciling March invoices (34/41)', 85),
      AgentCard(20, 400, 'Atlas', 'CONTENT', 'IDLE', 'Waiting for next scheduled post', 0),
      AgentCard(20, 498, 'Nova', 'RESEARCH', 'QUEUED', 'Competitor analysis — queued 2 min ago', 0),

      // Section: Recent Events
      T('RECENT EVENTS', 20, 600, 200, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),
      Line(20, 617, 350),

      EventRow(20, 623, '9:38', 'Orion', 'Ticket #1282 resolved — customer satisfied', P.teal),
      EventRow(20, 659, '9:35', 'Vega', 'Invoice INV-0341 generated and sent', P.violet2),
      EventRow(20, 695, '9:31', 'Nova', 'Task queued: weekly competitor brief', P.amber),
      EventRow(20, 731, '9:28', 'Orion', 'Escalation detected — human review requested', P.warm),

      NavBar(0),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — AGENT DETAIL (Orion)
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentDetail(ox) {
  // Mini sparkline bars (task throughput)
  const SparkBars = (x, y, values, color) => {
    const max = Math.max(...values);
    return values.map((v, i) => {
      const bh = Math.round((v / max) * 44);
      return F(x + i * 14, y + (44 - bh), 10, bh, i === values.length - 1 ? color : color + '55', { r: 2 });
    });
  };

  const throughput = [22, 31, 18, 27, 35, 29, 41, 38, 44, 37, 42, 48];

  return F(ox, 0, 390, 844, P.bg, {
    ch: [
      ...Glow(195, 200, 150, P.teal),

      StatusBar(),

      // Back nav
      T('← Control', 20, 52, 120, 18, { size: 13, fill: P.accent, weight: 600 }),

      // Agent identity — editorial serif treatment (inspired by Belka.ai)
      F(20, 80, 68, 68, P.teal + '18', { r: 18, ch: [
        // Oversized letter — the Belka.ai editorial serif move
        T('O', 0, 8, 68, 50, { size: 44, fill: P.teal, weight: 900, align: 'center', ls: -2 }),
      ]}),
      ...StatusDot(76, 80, P.teal, 9),

      T('Orion', 102, 82, 240, 32, { size: 26, fill: P.fg, weight: 800, ls: -1 }),
      T('CUSTOMER SUPPORT AGENT', 102, 116, 260, 14, { size: 10, fill: P.teal, ls: 2, weight: 600 }),

      // Capability tags
      ...[['TICKETS', P.accent], ['ESCALATION', P.violet2], ['NLP', P.teal], ['EMAIL', P.muted]].map(([tag, color], i) =>
        Pill(20 + i * 82, 150, tag, color)
      ),

      // Current task card
      F(20, 184, 350, 100, P.surface2, {
        r: 14,
        stroke: P.teal + '44',
        sw: 1,
        ch: [
          T('CURRENT TASK', 14, 12, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
          T('Responding to ticket #1284\n— customer refund escalation', 14, 30, 322, 36, { size: 14, fill: P.fg, weight: 600, lh: 1.5 }),
          // Progress
          T('72% complete', 14, 72, 160, 14, { size: 10, fill: P.teal }),
          F(14, 86, 314, 4, P.border, { r: 2 }),
          F(14, 86, 226, 4, P.teal, { r: 2 }),
        ],
      }),

      // Performance metrics strip
      T('PERFORMANCE · 30 DAYS', 20, 296, 250, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      Line(20, 312, 350),

      MetricChip(20,  320, 166, 'TASKS COMPLETED', '1,247', P.teal),
      MetricChip(194, 320, 166, 'AVG RESOLUTION', '4.2 min', P.violet2),
      MetricChip(20,  384, 166, 'CSAT SCORE', '94.1%', P.accent),
      MetricChip(194, 384, 166, 'ESCALATIONS', '3.2%', P.amber),

      // Throughput chart
      T('DAILY THROUGHPUT', 20, 452, 200, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      F(20, 470, 350, 64, P.surface2, {
        r: 12,
        stroke: P.border,
        ch: [
          ...SparkBars(12, 10, throughput, P.accent),
          T('12-DAY TASK VOLUME', 185, 50, 160, 12, { size: 9, fill: P.muted, ls: 1, align: 'right' }),
        ],
      }),

      // Recent task log
      T('RECENT TASKS', 20, 546, 200, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      Line(20, 562, 350),

      ...[
        ['#1282', 'Refund request resolved', 'RESOLVED', P.teal,    '2m ago'],
        ['#1281', 'Billing question answered', 'RESOLVED', P.teal,  '8m ago'],
        ['#1279', 'Account access escalated', 'ESCALATED', P.warm,  '19m ago'],
        ['#1278', 'Subscription downgrade', 'RESOLVED', P.teal,     '31m ago'],
      ].map(([id, desc, status, color, time], i) =>
        F(20, 570 + i * 44, 350, 36, i % 2 === 0 ? P.surface2 : 'transparent', {
          r: 8,
          ch: [
            T(id, 12, 10, 54, 16, { size: 11, fill: color, weight: 700 }),
            T(desc, 70, 10, 196, 16, { size: 11, fill: P.fg }),
            T(status, 280, 4, 70, 14, { size: 9, fill: color, align: 'right', weight: 700, ls: 0.5 }),
            T(time, 280, 18, 70, 12, { size: 9, fill: P.muted, align: 'right' }),
          ],
        })
      ),

      NavBar(1),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — TASK QUEUE / PIPELINE
// ══════════════════════════════════════════════════════════════════════════════
function screenTaskQueue(ox) {
  const TaskRow = (x, y, id, agent, desc, status, priority, time) => {
    const statusColors = { ACTIVE: P.teal, PENDING: P.amber, REVIEW: P.violet2, DONE: P.muted };
    const priorityColors = { HIGH: P.warm, MED: P.amber, LOW: P.muted };
    const sc = statusColors[status] || P.muted;
    const pc = priorityColors[priority] || P.muted;
    return F(x, y, 350, 70, P.surface2, {
      r: 12,
      stroke: status === 'ACTIVE' ? P.accent + '30' : P.border,
      sw: 1,
      ch: [
        // Left accent bar
        F(0, 0, 3, 70, sc, { r: 2 }),
        // Task ID
        T(id, 14, 10, 70, 14, { size: 9, fill: sc, weight: 700, ls: 1 }),
        // Priority
        Pill(14, 26, priority, pc, '20'),
        // Agent name
        T(agent, 80, 28, 120, 14, { size: 10, fill: P.muted, weight: 600 }),
        // Description
        T(desc, 14, 44, 270, 22, { size: 11, fill: P.fg, lh: 1.4 }),
        // Status
        Pill(270, 10, status, sc, '18'),
        // Time
        T(time, 280, 50, 70, 14, { size: 9, fill: P.muted, align: 'right' }),
      ],
    });
  };

  return F(ox, 0, 390, 844, P.bg, {
    ch: [
      ...Glow(195, 300, 130, P.amber),

      StatusBar(),

      T('Task Queue', 20, 52, 260, 28, { size: 22, fill: P.fg, weight: 800, ls: -0.5 }),

      // Filter tabs
      ...[['ALL · 14', true], ['ACTIVE · 4', false], ['PENDING · 7', false], ['DONE · 3', false]].map(([label, active], i) =>
        F(20 + i * 86, 88, 82, 28, active ? P.accent : P.surface2, {
          r: 8,
          stroke: active ? 'none' : P.border,
          sw: 1,
          ch: [T(label, 0, 6, 82, 16, { size: 9, fill: active ? P.bg : P.muted, weight: 700, align: 'center', ls: 0.5 })],
        })
      ),

      // Queue section header
      T('IN PROGRESS', 20, 128, 200, 14, { size: 9, fill: P.teal, ls: 2.5, weight: 700 }),
      Line(20, 144, 350, P.teal + '33'),

      TaskRow(20, 152, 'TSK-0091', 'ORION', 'Handle escalation on ticket #1284', 'ACTIVE', 'HIGH', '2m'),
      TaskRow(20, 230, 'TSK-0090', 'VEGA', 'Reconcile March invoices (34/41 done)', 'ACTIVE', 'MED', '8m'),

      // Pending section
      T('PENDING', 20, 312, 200, 14, { size: 9, fill: P.amber, ls: 2.5, weight: 700 }),
      Line(20, 328, 350, P.amber + '33'),

      TaskRow(20, 336, 'TSK-0089', 'NOVA', 'Weekly competitor brief — awaiting trigger', 'PENDING', 'MED', '11m'),
      TaskRow(20, 414, 'TSK-0088', 'ATLAS', 'Schedule 3 LinkedIn posts for next week', 'PENDING', 'LOW', '18m'),
      TaskRow(20, 492, 'TSK-0087', 'ORION', 'Follow up on unresolved tickets > 24h', 'PENDING', 'HIGH', '22m'),

      // Review section
      T('NEEDS REVIEW', 20, 574, 200, 14, { size: 9, fill: P.violet2, ls: 2.5, weight: 700 }),
      Line(20, 590, 350, P.violet2 + '33'),

      TaskRow(20, 598, 'TSK-0086', 'VEGA', 'Invoice INV-0340 flagged — unusual amount', 'REVIEW', 'HIGH', '34m'),

      // Bottom total
      F(20, 676, 350, 44, P.surface2, {
        r: 10,
        stroke: P.border,
        ch: [
          T('14 TASKS ACROSS 4 AGENTS', 20, 12, 200, 20, { size: 11, fill: P.muted }),
          T('⚡ 142 tasks/hr today', 200, 12, 148, 20, { size: 11, fill: P.accent, align: 'right', weight: 600 }),
        ],
      }),

      NavBar(2),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — AUDIT LOG (Chronological timeline)
// ══════════════════════════════════════════════════════════════════════════════
function screenAuditLog(ox) {
  const LogEntry = (x, y, time, agent, action, detail, color, isError = false) => F(x, y, 350, 76, 'transparent', {
    ch: [
      // Timeline line
      VLine(13, 0, 76, P.border),
      // Timeline dot
      E(10, 28, 7, 7, color),

      // Time
      T(time, 28, 8, 80, 12, { size: 9, fill: P.muted, ls: 0.5 }),
      // Agent
      T(agent, 28, 22, 200, 14, { size: 11, fill: color, weight: 700, ls: 0.3 }),
      // Action
      T(action, 28, 38, 310, 16, { size: 12, fill: P.fg, weight: 500 }),
      // Detail
      T(detail, 28, 56, 310, 14, { size: 10, fill: P.muted, lh: 1.4 }),

      // Error badge
      ...(isError ? [Pill(284, 22, 'ERROR', P.warm)] : []),
    ],
  });

  return F(ox, 0, 390, 844, P.bg, {
    ch: [
      StatusBar(),

      T('Audit Log', 20, 52, 260, 28, { size: 22, fill: P.fg, weight: 800, ls: -0.5 }),
      T('MARCH 20, 2026', 20, 84, 200, 14, { size: 9, fill: P.accent, ls: 2.5, weight: 600 }),

      // Filter row
      ...[['ALL', true], ['ERRORS', false], ['ORION', false], ['VEGA', false]].map(([label, active], i) =>
        F(20 + i * 82, 104, 78, 26, active ? P.accent + '22' : 'transparent', {
          r: 7,
          stroke: active ? P.accent + '44' : P.border,
          sw: 1,
          ch: [T(label, 0, 5, 78, 16, { size: 9, fill: active ? P.accent : P.muted, weight: 700, align: 'center', ls: 0.8 })],
        })
      ),

      Line(20, 140, 350),

      // Timeline entries
      LogEntry(20, 148, '09:38:21', 'ORION', 'Ticket #1282 resolved', 'Customer confirmed satisfaction. CSAT submitted: 5/5.', P.teal),
      LogEntry(20, 224, '09:35:04', 'VEGA', 'Invoice INV-0341 generated', 'Amount: $4,200.00 · Client: Acme Corp · Sent via email.', P.violet2),
      LogEntry(20, 300, '09:31:18', 'NOVA', 'Task queued: competitor brief', 'Weekly research trigger fired. Estimated completion: 15 min.', P.amber),
      LogEntry(20, 376, '09:28:55', 'ORION', 'Escalation flagged on #1279', 'Account access issue exceeds agent authority. Routing to human.', P.warm, true),
      LogEntry(20, 452, '09:22:10', 'ATLAS', 'Post scheduled: LinkedIn', '3 posts queued for Mon–Wed. Awaiting final approval.', P.accent),
      LogEntry(20, 528, '09:17:33', 'VEGA', 'Anomaly detected on INV-0340', 'Amount $28,000 exceeds usual range. Flagged for review.', P.warm, true),
      LogEntry(20, 604, '09:11:00', 'ORION', 'Ticket #1278 resolved', 'Subscription downgrade processed. Confirmation email sent.', P.teal),

      // Bottom timeline cap
      F(13, 708, 1, 24, P.border),
      F(10, 730, 7, 7, P.muted + '44', { r: 4 }),
      T('Earlier entries...', 28, 732, 200, 14, { size: 10, fill: P.muted }),

      NavBar(3),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — DEPLOY NEW AGENT (Configuration wizard)
// ══════════════════════════════════════════════════════════════════════════════
function screenDeploy(ox) {
  // Capability toggles
  const CapToggle = (x, y, label, enabled) => F(x, y, 160, 36, enabled ? P.accent + '18' : P.surface2, {
    r: 10,
    stroke: enabled ? P.accent + '55' : P.border,
    sw: 1,
    ch: [
      E(12, 13, 10, 10, enabled ? P.accent : P.muted),
      T(label, 28, 10, 120, 16, { size: 11, fill: enabled ? P.fg : P.muted, weight: enabled ? 600 : 400 }),
    ],
  });

  // Input field
  const InputField = (x, y, w, label, placeholder, value) => F(x, y, w, 56, 'transparent', {
    ch: [
      T(label, 0, 0, w, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
      F(0, 16, w, 32, P.surface2, {
        r: 8,
        stroke: P.accent + '44',
        sw: 1,
        ch: [
          T(value || placeholder, 12, 8, w - 24, 16, { size: 12, fill: value ? P.fg : P.muted }),
        ],
      }),
    ],
  });

  return F(ox, 0, 390, 844, P.bg, {
    ch: [
      ...Glow(195, 120, 100, P.accent),

      StatusBar(),

      // Back
      T('← Agents', 20, 52, 120, 18, { size: 13, fill: P.accent, weight: 600 }),

      T('Deploy Agent', 20, 78, 300, 28, { size: 22, fill: P.fg, weight: 800, ls: -0.5 }),
      T('Configure a new AI agent for your stack', 20, 112, 320, 18, { size: 12, fill: P.muted, lh: 1.5 }),

      // Step indicator
      ...[1, 2, 3].map((step, i) => [
        E(20 + i * 44, 138, 20, 20, i === 0 ? P.accent : P.surface2, {
          stroke: i === 0 ? 'none' : P.border, sw: 1,
        }),
        T(String(step), 20 + i * 44, 138, 20, 20, { size: 10, fill: i === 0 ? P.bg : P.muted, align: 'center', weight: 700 }),
        i < 2 ? F(42 + i * 44, 147, 24, 2, P.border, { r: 1 }) : null,
      ]).flat().filter(Boolean),
      T('IDENTITY', 78, 142, 80, 12, { size: 8, fill: P.accent, ls: 1 }),
      T('CAPABILITIES', 122, 142, 90, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('TRIGGERS', 166, 142, 70, 12, { size: 8, fill: P.muted, ls: 1 }),

      Line(20, 168, 350),

      // Form fields
      InputField(20, 178, 350, 'AGENT NAME', 'e.g. "Orion"', 'Sirius'),
      InputField(20, 242, 350, 'ROLE / FUNCTION', 'e.g. "Customer Support"', 'Sales Intelligence'),
      InputField(20, 306, 350, 'BASE MODEL', 'Select model...', 'Claude Sonnet 4.5'),

      // Capabilities
      T('CAPABILITIES', 20, 370, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      CapToggle(20,  388, 'Web browsing', true),
      CapToggle(188, 388, 'Email access', true),
      CapToggle(20,  430, 'CRM read', true),
      CapToggle(188, 430, 'CRM write', false),
      CapToggle(20,  472, 'Slack messaging', false),
      CapToggle(188, 472, 'Calendar', false),

      // Oversight toggle
      T('OVERSIGHT LEVEL', 20, 520, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      F(20, 536, 350, 36, P.surface2, {
        r: 10,
        stroke: P.border,
        ch: [
          F(0, 0, 116, 36, P.accent, { r: 10 }),
          T('SUPERVISED', 0, 10, 116, 16, { size: 10, fill: P.bg, weight: 700, align: 'center', ls: 0.5 }),
          T('SEMI-AUTO', 120, 10, 110, 16, { size: 10, fill: P.muted, align: 'center' }),
          T('AUTONOMOUS', 234, 10, 114, 16, { size: 10, fill: P.muted, align: 'center' }),
        ],
      }),

      // Deploy button
      F(20, 590, 350, 54, P.accent, {
        r: 14,
        ch: [
          ...Glow(175, 27, 60, '#FFFFFF'),
          T('DEPLOY SIRIUS', 0, 15, 350, 24, { size: 14, weight: 900, fill: P.bg, align: 'center', ls: 2 }),
        ],
      }),

      // Warning notice
      F(20, 652, 350, 56, P.warm + '10', {
        r: 10,
        stroke: P.warm + '30',
        sw: 1,
        ch: [
          T('⚠', 14, 18, 20, 20, { size: 14, fill: P.warm }),
          T('Supervised mode: all agent actions\nrequire your approval before execution.', 38, 10, 298, 36, { size: 11, fill: P.warm, lh: 1.5 }),
        ],
      }),

      NavBar(4),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'PROXY — AI Agent Control Room',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#06060C',
  children: [
    screenMissionControl(GAP),
    screenAgentDetail   (GAP + (SCREEN_W + GAP)),
    screenTaskQueue     (GAP + (SCREEN_W + GAP) * 2),
    screenAuditLog      (GAP + (SCREEN_W + GAP) * 3),
    screenDeploy        (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'proxy.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ proxy.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Mission Control · Agent Detail · Task Queue · Audit Log · Deploy');
console.log('  Palette: near-black #0A0A0F · electric violet #6B5EFF · cyber teal #3DFFC0');
