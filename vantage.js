#!/usr/bin/env node
// VANTAGE — Contact Center Command
// Research-first design: customer support supervisor mission control
//
// Production apps studied:
//   Talkdesk Live — service level half-circle gauge, per-row Monitor button, ring gauge widgets
//   Five9 Supervisor Desktop — monitor/whisper/barge/force-ready/log-out inline controls
//   Genesys Cloud — AI-suggested QA pre-scoring, wide-tab analytics, 4 KPI headline tiles
//   Intercom — three-panel inbox (rail+list+thread+context), Sankey flow AI vs human paths
//   Zendesk Explore — WFM heatmaps, schedule adherence, CSAT driver analysis
//
// Domain actors shaping UI:
//   Supervisor — scans queue depth → longest wait → SLA% → agent state distribution →
//     long-duration calls → sentiment alerts every 60-90 seconds.
//     This cycle = information hierarchy. KPI strip is PERMANENT, zero-click.
//   Agent — receives interactions, moves through state machine:
//     Available → Ringing → Connected → ACW → Available (or Not Ready)
//     Each state transition surfaces different actions to supervisor.
//   AI Agent — same state machine, different visibility needs: containment rate,
//     confidence score, HITL authorization queue (AI requesting human override).
//
// Domain concepts shaping specific UI decisions:
//   SLA 80/20 — answer 80% of contacts within 20 seconds. BINARY pass/fail threshold,
//     not a trend. Gauge must show threshold marker. Red = below. Not a gradient.
//   ACW (After Call Work) — post-interaction wrap state. Supervisors monitor for abuse.
//     Long ACW rows get amber highlight + Force Ready action inline.
//   RONA (Redirect on No Answer) — agent didn't pick up assigned contact.
//     Surfaces as exception item, not a buried statistic.
//   HITL (Human in the Loop) — AI agent requesting human authorization mid-interaction.
//     Time-critical. Must appear as urgent action tray above fleet table, not in a menu.
//   Wallboard — large-format display for contact center floor. Supervisors toggle
//     wallboard mode to put giant numerics on a shared TV screen.
//
// Structural decision: NOT nav+list+card.
//   Primary skeleton: persistent KPI strip (wallboard numerics) +
//     left sidebar (queue/SLA/alerts) + live fleet table with inline intervention controls.
//   Map replaced by agent state distribution visualization (same cognitive role: spatial overview).
//   Primary object: the IN-PROGRESS INTERACTION (not the agent, not the ticket).

const https = require('https');
const fs    = require('fs');

// ─── PALETTE — dark mission control, nothing like previous apps ───────────────
const P = {
  bg:        '#07090F',   // near-black, control room void
  panel:     '#0D1118',   // dark panel surface
  panel2:    '#131A26',   // raised panel
  panel3:    '#1A2235',   // elevated element
  border:    '#1C2538',   // subtle separator
  border2:   '#263347',   // stronger border
  text:      '#DDE4F0',   // primary text
  sub:       '#7A8BA8',   // secondary text
  dim:       '#3A4A60',   // tertiary/disabled
  // Agent states
  avail:     '#10B981',   // green — Available
  availBg:   '#0A1F18',
  busy:      '#3B82F6',   // blue — Connected
  busyBg:    '#0A1330',
  acw:       '#F59E0B',   // amber — After Call Work
  acwBg:     '#1F1507',
  noReady:   '#EF4444',   // red — Not Ready / SLA breach
  noReadyBg: '#200B0B',
  offline:   '#3D4A5C',   // grey
  // Channels
  voice:     '#A78BFA',   // purple
  voiceBg:   '#1A1530',
  chat:      '#22D3EE',   // cyan
  chatBg:    '#071A20',
  email:     '#34D399',   // green
  emailBg:   '#071A12',
  social:    '#FB923C',   // orange
  socialBg:  '#1F0D04',
  // AI
  ai:        '#818CF8',   // indigo
  aiBg:      '#10122A',
  // Sentiment
  sentPos:   '#10B981',
  sentNeg:   '#EF4444',
  sentNeu:   '#F59E0B',
};

const MW = 375, MH = 812;
const PW = 1440, PH = 900;

let idC = 1;
const uid = () => `v${idC++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, children = [], opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: opts.r || 0, opacity: opts.op !== undefined ? opts.op : 1,
  children: children.filter(Boolean),
});
const R  = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, [], opts);
const E  = (x, y, w, h, fill, op = 1)   => ({ id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: op });
const T  = (text, x, y, w, h, size, color, bold = false, align = 'left', op = 1, ls = 0) => ({
  id: uid(), type: 'text', x, y, width: w, height: h, text,
  fontSize: size, fill: color, fontWeight: bold ? 700 : 400,
  textAlign: align, opacity: op, letterSpacing: ls,
});
const Ln = (x, y, w, fill, op = 1) => R(x, y, w, 1, fill, { op });

// ─── DOMAIN HELPERS ───────────────────────────────────────────────────────────

// Agent state badge — colored pill with state label
function StateBadge(x, y, state) {
  const cfg = {
    'Available': { col: P.avail,   bg: P.availBg,   label: 'AVAILABLE'  },
    'Connected': { col: P.busy,    bg: P.busyBg,     label: 'CONNECTED'  },
    'ACW':       { col: P.acw,     bg: P.acwBg,      label: 'ACW'        },
    'Not Ready': { col: P.noReady, bg: P.noReadyBg,  label: 'NOT READY'  },
    'Offline':   { col: P.offline, bg: P.panel,      label: 'OFFLINE'    },
    'Ringing':   { col: P.busy,    bg: P.busyBg,     label: 'RINGING'    },
  };
  const c = cfg[state] || cfg['Offline'];
  const w = c.label.length * 6.2 + 16;
  return F(x, y, w, 20, c.bg, [
    T(c.label, 0, 4, w, 12, 8, c.col, true, 'center', 1, 0.8),
  ], { r: 4 });
}

// KPI tile — large wallboard-style numeric with label
function KPITile(x, y, w, h, value, label, col, alert = false) {
  return F(x, y, w, h, P.panel, [
    alert ? R(0, 0, w, 2, col) : null,
    T(value, 0, alert ? 14 : 10, w, Math.round(h * 0.52), Math.round(h * 0.42), col, true, 'center'),
    T(label,  0, Math.round(h * 0.64), w, Math.round(h * 0.28), 8, P.sub, false, 'center', 1, 0.6),
  ].filter(Boolean), { r: 6 });
}

// Channel pill badge
function ChPill(x, y, ch) {
  const m = {
    'Voice':  { col: P.voice,  bg: P.voiceBg,  label: 'VOICE'  },
    'Chat':   { col: P.chat,   bg: P.chatBg,   label: 'CHAT'   },
    'Email':  { col: P.email,  bg: P.emailBg,  label: 'EMAIL'  },
    'Social': { col: P.social, bg: P.socialBg, label: 'SOCIAL' },
  };
  const c = m[ch] || m['Voice'];
  const w = c.label.length * 5.5 + 14;
  return F(x, y, w, 18, c.bg, [
    T(c.label, 0, 4, w, 10, 8, c.col, true, 'center', 1, 0.6),
  ], { r: 3 });
}

// Sentiment indicator dot
function SentDot(x, y, s) {
  const col = s === '+' ? P.sentPos : s === '-' ? P.sentNeg : P.sentNeu;
  return E(x, y, 9, 9, col);
}

// Horizontal progress bar (for queue fill, SLA, etc.)
function ProgressBar(x, y, w, pct, col, bg = P.border) {
  return F(x, y, w, 6, bg, [
    R(0, 0, Math.round(w * Math.min(pct, 1)), 6, col, { r: 3 }),
  ], { r: 3 });
}

// SLA gauge — prominent number with threshold indicator
// threshold = 0.80 (80/20 rule), current = 0.78 (below = red alert)
function SLAGauge(x, y, w, current, threshold = 0.80) {
  const pct    = Math.round(current * 100);
  const col    = current >= threshold ? P.avail : current >= threshold - 0.1 ? P.acw : P.noReady;
  const status = current >= threshold ? 'ON TARGET' : 'SLA BREACH';
  const statusCol = current >= threshold ? P.avail : P.noReady;
  // Simulate half-circle gauge with two ellipses + center number
  const cx = Math.round(w / 2);
  const r1 = Math.round(w * 0.4);
  const r2 = Math.round(w * 0.28);
  return F(x, y, w, Math.round(w * 0.62), P.panel2, [
    // Outer ring bg (full circle, clipped visual)
    E(cx - r1, Math.round(w * 0.02), r1 * 2, r1 * 2, P.border, 0.6),
    // Progress ring
    E(cx - r1, Math.round(w * 0.02), r1 * 2, r1 * 2, col, current * 0.7),
    // Inner cutout
    E(cx - r2, Math.round(w * 0.02) + (r1 - r2), r2 * 2, r2 * 2, P.panel2),
    // Center: big % number
    T(`${pct}%`, 0, Math.round(w * 0.22), w, 28, 22, col, true, 'center'),
    T('SERVICE LEVEL', 0, Math.round(w * 0.44), w, 12, 8, P.sub, true, 'center', 1, 0.8),
    // Threshold marker label
    T(`TARGET: ${Math.round(threshold * 100)}%`, 0, Math.round(w * 0.52), w, 11, 8, P.dim, false, 'center', 1, 0.5),
    // Status pill
    F(Math.round((w - 80) / 2), Math.round(w * 0.58), 80, 16, statusCol, [
      R(0, 0, 80, 16, statusCol, { op: 0.15, r: 3 }),
      T(status, 0, 3, 80, 10, 7, statusCol, true, 'center', 1, 0.8),
    ], { r: 3 }),
  ], { r: 8 });
}

// Queue channel row (left sidebar queue breakdown)
function QueueRow(x, y, w, channel, count, longest, col) {
  return F(x, y, w, 44, P.panel, [
    R(0, 0, 3, 44, col),
    T(channel.toUpperCase(), 12, 8, 80, 11, 8, P.sub, true, 'left', 1, 0.6),
    T(`${count}`, 12, 22, 40, 16, 14, count > 5 ? P.noReady : col, true),
    T('waiting', 52, 26, 60, 11, 8, P.dim),
    T(longest, w - 68, 14, 60, 16, 11, P.sub, false, 'right'),
    T('longest', w - 72, 28, 68, 10, 8, P.dim, false, 'right'),
  ], { r: 4 });
}

// Agent row in fleet table
function AgentRow(x, y, w, rowH, agent) {
  // agent: { name, state, duration, channel, customer, sent, isAI, longACW, id }
  const stateCol = {
    'Available': P.avail, 'Connected': P.busy, 'ACW': P.acw,
    'Not Ready': P.noReady, 'Offline': P.offline, 'Ringing': P.busy,
  }[agent.state] || P.offline;

  const rowBg = agent.isAI ? P.aiBg : (agent.state === 'Not Ready' ? P.noReadyBg : 'transparent');
  const mid   = Math.round((rowH - 20) / 2);

  return F(x, y, w, rowH, rowBg, [
    // State color bar (left edge)
    R(0, 0, 3, rowH, stateCol),

    // AI label or avatar initials
    agent.isAI
      ? F(12, mid, 32, 20, P.aiBg, [
          R(0, 0, 32, 20, P.ai, { op: 0.2, r: 3 }),
          T('AI', 0, 4, 32, 12, 8, P.ai, true, 'center'),
        ], { r: 3 })
      : F(12, mid, 28, 20, P.panel3, [
          T(agent.name.split(' ').map(n => n[0]).join('').slice(0,2), 0, 4, 28, 12, 8, P.sub, true, 'center'),
        ], { r: 10 }),

    // Name
    T(agent.name, 52, mid + 2, 130, 16, 11, P.text, !agent.isAI),

    // State badge
    StateBadge(192, mid, agent.state),

    // Duration
    T(agent.duration, 310, mid + 2, 60, 16, 11,
      agent.state === 'ACW' && agent.longACW ? P.acw : P.sub, agent.longACW),

    // Channel
    agent.channel ? ChPill(378, mid + 1, agent.channel) : null,

    // Customer / interaction ID
    T(agent.customer || '—', 450, mid + 2, 140, 16, 11, P.sub),

    // Sentiment
    agent.sent ? SentDot(610, mid + 5, agent.sent) : null,

    // Inline actions for Connected
    agent.state === 'Connected' ? F(634, mid - 2, 192, 24, 'transparent', [
      F(0, 0, 58, 24, P.panel3, [T('Monitor', 0, 6, 58, 12, 8, P.sub, false, 'center', 1, 0.4)], { r: 4 }),
      F(64, 0, 58, 24, P.panel3, [T('Whisper', 0, 6, 58, 12, 8, P.busy, false, 'center', 1, 0.4)], { r: 4 }),
      F(128, 0, 58, 24, P.busyBg, [
        R(0, 0, 58, 24, P.busy, { op: 0.2, r: 4 }),
        T('Barge', 0, 6, 58, 12, 8, P.busy, true, 'center', 1, 0.4),
      ], { r: 4 }),
    ]) : null,

    // Force Ready for long ACW
    agent.state === 'ACW' && agent.longACW ? F(634, mid - 2, 112, 24, P.acwBg, [
      R(0, 0, 112, 24, P.acw, { op: 0.18, r: 4 }),
      T('Force Ready', 0, 6, 112, 12, 8, P.acw, true, 'center', 1, 0.4),
    ], { r: 4 }) : null,

    // Bottom rule
    Ln(0, rowH - 1, w, P.border),
  ].filter(Boolean));
}

// HITL alert card — AI requesting human authorization (time-critical)
function HITLCard(x, y, w, aiName, topic, confidence, wait) {
  return F(x, y, w, 60, P.aiBg, [
    R(0, 0, w, 60, P.ai, { op: 0.08, r: 6 }),
    R(0, 0, 3, 60, P.ai),
    E(12, 20, 10, 10, P.ai, 0.8),
    T('HITL REQUEST', 30, 8, 120, 12, 8, P.ai, true, 'left', 1, 0.8),
    T(`${aiName} needs authorization`, 30, 22, w - 180, 16, 11, P.text, true),
    T(topic, 30, 38, w - 180, 14, 10, P.sub),
    T(`Confidence: ${confidence}%`, w - 200, 14, 100, 14, 9, P.ai, false, 'right'),
    T(`Waiting ${wait}s`, w - 200, 30, 100, 14, 9, P.acw, false, 'right'),
    F(w - 92, 18, 80, 24, P.ai, [
      R(0, 0, 80, 24, P.ai, { op: 0.2, r: 4 }),
      T('Authorize', 0, 6, 80, 12, 9, P.ai, true, 'center'),
    ], { r: 4 }),
  ], { r: 6 });
}

// ─── MOBILE SCREEN 1 — SUPERVISOR OVERVIEW ───────────────────────────────────
function mobileSupervisor() {
  const agents = [
    { name: 'Dana Kim',    state: 'Connected', duration: '8:14', channel: 'Voice', customer: 'John M.', sent: '-', isAI: false },
    { name: 'Marcus L.',   state: 'ACW',       duration: '6:02', channel: 'Chat',  customer: '—',       sent: null, isAI: false, longACW: true },
    { name: 'Priya S.',    state: 'Connected', duration: '2:33', channel: 'Chat',  customer: 'Alicia R.', sent: '+', isAI: false },
    { name: 'Nexus-7',    state: 'Connected', duration: '1:48', channel: 'Chat',  customer: 'Brian T.', sent: '~', isAI: true  },
    { name: 'Tom R.',      state: 'Not Ready', duration: '12:07',channel: null,    customer: '—',        sent: null, isAI: false },
    { name: 'Aria-3',     state: 'Connected', duration: '3:21', channel: 'Voice', customer: 'Chen L.',  sent: '+', isAI: true  },
    { name: 'Sam O.',      state: 'Available', duration: '0:32', channel: null,    customer: '—',        sent: null, isAI: false },
  ];

  return F(0, 0, MW, MH, P.bg, [
    // Status bar
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('VANTAGE', MW/2 - 36, 14, 72, 16, 10, P.sub, true, 'center', 1, 1.5),
    // Alert dot
    E(MW - 36, 16, 8, 8, P.noReady),
    T('3', MW - 52, 12, 24, 20, 11, P.noReady, true, 'center'),

    // KPI strip — 4 tiles at top
    F(0, 44, MW, 76, P.panel2, [
      Ln(0, 0, MW, P.border),
      // 4 mini KPI tiles
      ...[
        { v: '14',  l: 'IN QUEUE',   c: P.noReady, a: true  },
        { v: '4:23',l: 'LONG WAIT',  c: P.acw,     a: true  },
        { v: '78%', l: 'SLA',        c: P.noReady, a: true  },
        { v: '8',   l: 'AVAILABLE',  c: P.avail,   a: false },
      ].map(({ v, l, c, a }, i) => {
        const tw = MW / 4;
        return F(i * tw, 0, tw, 76, 'transparent', [
          a ? R(0, 0, tw, 2, c) : null,
          T(v, 0, a ? 12 : 10, tw, 30, 22, c, true, 'center'),
          T(l, 0, 44, tw, 12, 7, P.sub, true, 'center', 1, 0.6),
          i < 3 ? Ln(tw - 1, 16, 1, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 75, MW, P.border),
    ]),

    // HITL alert tray
    F(0, 120, MW, 68, P.aiBg, [
      R(0, 0, MW, 68, P.ai, { op: 0.06 }),
      Ln(0, 0, MW, P.ai, 0.3),
      E(16, 26, 8, 8, P.ai, 0.9),
      T('HITL · Nexus-7 needs authorization', 32, 12, MW - 100, 16, 10, P.ai, true),
      T('Refund request > $500 — confidence 62%', 32, 30, MW - 100, 14, 9, P.sub),
      T('Waiting 23s', 32, 46, 100, 12, 9, P.acw),
      F(MW - 88, 20, 72, 28, P.ai, [
        R(0, 0, 72, 28, P.ai, { op: 0.2, r: 6 }),
        T('Auth →', 0, 8, 72, 12, 9, P.ai, true, 'center'),
      ], { r: 6 }),
      Ln(0, 67, MW, P.border),
    ]),

    // Section header
    F(0, 188, MW, 28, P.panel, [
      T('LIVE AGENTS', 16, 8, 140, 14, 8, P.sub, true, 'left', 1, 1),
      T('7 agents · 2 AI', MW - 100, 8, 84, 14, 8, P.dim, false, 'right', 1, 0.4),
      Ln(0, 27, MW, P.border),
    ]),

    // Agent list (scrollable, clipped)
    F(0, 216, MW, MH - 216 - 56, P.bg, agents.slice(0, 5).map((ag, i) => {
      const rowH = 60;
      const stateCol = { 'Available': P.avail, 'Connected': P.busy, 'ACW': P.acw, 'Not Ready': P.noReady }[ag.state] || P.offline;
      return F(0, i * (rowH + 1), MW, rowH, ag.isAI ? P.aiBg : P.panel, [
        R(0, 0, 3, rowH, stateCol),
        ag.isAI
          ? F(12, 18, 26, 16, P.aiBg, [R(0,0,26,16,P.ai,{op:0.2,r:3}), T('AI',0,3,26,10,7,P.ai,true,'center')], { r: 3 })
          : F(12, 18, 28, 22, P.panel3, [T(ag.name.split(' ').map(n=>n[0]).join('').slice(0,2),0,5,28,12,8,P.sub,true,'center')], { r: 10 }),
        T(ag.name, 48, 10, 120, 16, 12, P.text, true),
        StateBadge(48, 30, ag.state),
        T(ag.duration, MW - 100, 10, 60, 16, 12, stateCol, true, 'right'),
        ag.channel ? ChPill(MW - 100, 32, ag.channel) : null,
        ag.sent ? SentDot(MW - 24, 24, ag.sent) : null,
        Ln(0, rowH - 1, MW, P.border),
      ].filter(Boolean));
    })),

    // Bottom nav
    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['⊞ Live', '≡ Queue', '◎ AI', '⌂ WB'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 0;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.busy : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.busy, { r: 2 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 2 — QUEUE MONITOR ─────────────────────────────────────────
function mobileQueue() {
  const queues = [
    { ch: 'Voice',  count: 6, longest: '4:23', col: P.voice  },
    { ch: 'Chat',   count: 5, longest: '2:11', col: P.chat   },
    { ch: 'Email',  count: 3, longest: '18m',  col: P.email  },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('Queue Monitor', MW/2 - 56, 14, 112, 16, 11, P.text, true, 'center'),
    Ln(0, 43, MW, P.border),

    // SLA gauge — prominent, threshold-colored
    F(0, 44, MW, 180, P.panel2, [
      Ln(0, 0, MW, P.border),
      T('SERVICE LEVEL', 0, 20, MW, 14, 9, P.sub, true, 'center', 1, 1.2),
      T('78%', 0, 44, MW, 60, 52, P.noReady, true, 'center'),
      T('TARGET: 80% OF CALLS < 20 SECONDS', 0, 108, MW, 14, 8, P.dim, false, 'center', 1, 0.6),
      // Progress bar against threshold
      F(32, 130, MW - 64, 20, 'transparent', [
        ProgressBar(0, 8, MW - 64, 0.78, P.noReady, P.border),
        // Threshold marker at 80%
        R(Math.round((MW - 64) * 0.80) - 1, 0, 2, 20, P.text, { op: 0.6 }),
        T('80%', Math.round((MW - 64) * 0.78) - 12, 14, 32, 10, 8, P.dim, false, 'center'),
      ]),
      F(Math.round((MW - 80) / 2), 156, 80, 18, P.noReadyBg, [
        R(0, 0, 80, 18, P.noReady, { op: 0.2, r: 4 }),
        T('SLA BREACH', 0, 4, 80, 10, 7, P.noReady, true, 'center', 1, 0.8),
      ], { r: 4 }),
      Ln(0, 179, MW, P.border),
    ]),

    // Queue breakdown by channel
    T('CONTACTS WAITING BY CHANNEL', 16, 240, MW - 32, 14, 8, P.sub, true, 'left', 1, 0.8),
    F(0, 260, MW, 176, 'transparent',
      queues.map((q, i) => F(0, i * 60, MW, 58, P.panel, [
        R(0, 0, 3, 58, q.col),
        T(q.ch.toUpperCase(), 16, 8, 100, 12, 8, P.sub, true, 'left', 1, 0.6),
        T(`${q.count}`, 16, 24, 48, 22, 18, q.count > 5 ? P.noReady : q.col, true),
        T('contacts', 64, 30, 80, 14, 9, P.dim),
        T(q.longest, MW - 68, 14, 52, 22, 14, P.sub, false, 'right'),
        T('longest wait', MW - 76, 36, 68, 12, 8, P.dim, false, 'right'),
        ProgressBar(16, 50, MW - 32, q.count / 10, q.col),
        Ln(0, 57, MW, P.border),
      ]))
    ),

    // Escalation feed
    T('ESCALATION ALERTS', 16, 452, MW - 32, 14, 8, P.sub, true, 'left', 1, 0.8),
    F(0, 472, MW, MH - 472 - 56, P.bg, [
      ...[
        { type: 'RONA',      agent: 'Marcus L.',  detail: 'Contact #4821 not answered (Voice)',  col: P.noReady, t: '1m ago' },
        { type: 'LONG WAIT', agent: 'Queue',      detail: 'Voice wait exceeded 5 minutes',       col: P.acw,     t: '3m ago' },
        { type: 'SENTIMENT', agent: 'Dana Kim',   detail: 'Negative trend detected in active call', col: P.acw,  t: '5m ago' },
      ].map(({ type, agent, detail, col, t }, i) =>
        F(0, i * 68, MW, 64, P.panel, [
          R(0, 0, 3, 64, col),
          T(type, 12, 8, 100, 12, 8, col, true, 'left', 1, 0.7),
          T(t, MW - 52, 8, 44, 12, 8, P.dim, false, 'right'),
          T(agent, 12, 22, MW - 60, 16, 11, P.text, true),
          T(detail, 12, 40, MW - 24, 14, 9, P.sub),
          Ln(0, 63, MW, P.border),
        ])
      ),
    ]),

    // Bottom nav
    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['⊞ Live', '≡ Queue', '◎ AI', '⌂ WB'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 1;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.busy : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.busy, { r: 2 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 3 — AGENT DETAIL (MONITOR VIEW) ───────────────────────────
function mobileAgentDetail() {
  return F(0, 0, MW, MH, P.bg, [
    // Header
    F(0, 0, MW, 52, P.panel, [
      T('←', 16, 16, 24, 20, 16, P.sub),
      T('Dana Kim', MW/2 - 48, 16, 96, 20, 13, P.text, true, 'center'),
      StateBadge(MW - 96, 16, 'Connected'),
      Ln(0, 51, MW, P.border),
    ]),

    // Agent state card
    F(16, 68, MW - 32, 100, P.panel2, [
      F(16, 16, 44, 44, P.panel3, [
        E(0, 0, 44, 44, P.busy, 0.15),
        T('DK', 0, 13, 44, 18, 13, P.busy, true, 'center'),
      ], { r: 22 }),
      T('Dana Kim', 72, 16, 180, 18, 14, P.text, true),
      T('Senior Agent · Team Alpha', 72, 36, 200, 14, 10, P.sub),
      StateBadge(72, 56, 'Connected'),
      T('8:14', MW - 64, 32, 48, 24, 18, P.busy, true, 'right'),
      T('duration', MW - 68, 56, 52, 14, 8, P.dim, false, 'right'),
    ], { r: 8 }),

    // Supervisor controls — the primary mission control actions
    F(0, 184, MW, 40, P.bg, [
      T('SUPERVISOR CONTROLS', 16, 12, 200, 14, 8, P.sub, true, 'left', 1, 0.8),
    ]),
    F(16, 224, MW - 32, 56, P.panel, [
      F(0, 0, (MW - 32) / 3, 56, P.panel2, [
        T('◉', 0, 8, (MW-32)/3, 18, 14, P.sub, false, 'center'),
        T('Monitor', 0, 30, (MW-32)/3, 14, 9, P.sub, false, 'center'),
      ]),
      F((MW - 32) / 3 + 1, 0, (MW - 32) / 3, 56, P.panel2, [
        T('◎', 0, 8, (MW-32)/3, 18, 14, P.busy, false, 'center'),
        T('Whisper', 0, 30, (MW-32)/3, 14, 9, P.busy, false, 'center'),
      ]),
      F(2 * (MW - 32) / 3 + 2, 0, (MW - 32) / 3, 56, P.busyBg, [
        R(0, 0, (MW-32)/3, 56, P.busy, { op: 0.2 }),
        T('⬤', 0, 8, (MW-32)/3, 18, 14, P.busy, false, 'center'),
        T('Barge In', 0, 30, (MW-32)/3, 14, 9, P.busy, true, 'center'),
      ]),
    ], { r: 8 }),

    // Live conversation transcript (simulated)
    F(0, 296, MW, 28, P.bg, [
      T('LIVE TRANSCRIPT', 16, 8, 200, 14, 8, P.sub, true, 'left', 1, 0.8),
      E(MW - 24, 12, 8, 8, P.noReady),
      T('LIVE', MW - 48, 10, 36, 12, 7, P.noReady, true),
    ]),
    F(0, 324, MW, 260, P.panel, [
      Ln(0, 0, MW, P.border),
      // Customer bubble
      F(16, 16, MW - 80, 52, P.panel3, [
        T('CUSTOMER', 12, 8, 100, 10, 7, P.sub, true, 'left', 1, 0.6),
        T("I've been charged twice for the same order. This is really frustrating.", 12, 20, MW - 104, 28, 10, P.text),
      ], { r: 8 }),
      // Sentiment — negative
      F(MW - 56, 22, 40, 16, P.noReadyBg, [
        R(0, 0, 40, 16, P.noReady, { op: 0.2, r: 4 }),
        SentDot(6, 4, '-'),
        T('NEG', 18, 3, 20, 10, 7, P.noReady, true),
      ], { r: 4 }),
      // Agent bubble
      F(16, 84, MW - 80, 52, P.busyBg, [
        R(0, 0, MW - 96, 52, P.busy, { op: 0.08, r: 8 }),
        T('AGENT', 12, 8, 100, 10, 7, P.busy, true, 'left', 1, 0.6),
        T('I completely understand your frustration. Let me pull up your account and sort this out right now.', 12, 20, MW - 104, 28, 10, P.text),
      ], { r: 8 }),
      // AI suggestion whisper
      F(16, 152, MW - 32, 44, P.aiBg, [
        R(0, 0, MW - 48, 44, P.ai, { op: 0.08, r: 6 }),
        R(0, 0, 3, 44, P.ai),
        T('AI WHISPER SUGGESTION', 10, 6, 200, 10, 7, P.ai, true, 'left', 1, 0.8),
        T('Offer $10 credit and expedite refund to retain customer.', 10, 20, MW - 60, 18, 9, P.sub),
      ], { r: 6 }),

      // CSAT prediction
      F(16, 208, MW - 32, 36, P.panel2, [
        T('CSAT Prediction', 12, 10, 120, 16, 10, P.sub),
        F(MW - 96, 8, 80, 20, 'transparent', [
          ...Array(5).fill(0).map((_, i) => R(i * 16, 4, 12, 12, i < 2 ? P.acw : P.border, { r: 2 })),
        ]),
        T('2/5 projected', MW - 100, 22, 84, 12, 8, P.noReady, false, 'right'),
      ], { r: 4 }),
    ]),

    // Today's stats for this agent
    F(16, 600, MW - 32, 80, P.panel2, [
      T('TODAY — DANA KIM', 16, 14, 200, 14, 8, P.sub, true, 'left', 1, 0.8),
      ...[['Handled', '18'], ['AHT', '6:42'], ['CSAT', '4.1']].map(([k, v], i) =>
        F(16 + i * 100, 32, 90, 36, 'transparent', [
          T(v, 0, 0, 90, 22, 16, P.text, true, 'center'),
          T(k, 0, 22, 90, 14, 8, P.sub, false, 'center'),
        ])
      ),
    ], { r: 8 }),
  ]);
}

// ─── MOBILE SCREEN 4 — WALLBOARD MODE ────────────────────────────────────────
// Designed for floor TV / large display — giant metrics, high contrast
function mobileWallboard() {
  const metrics = [
    { v: '14',  l: 'IN QUEUE',       c: P.noReady },
    { v: '4:23',l: 'LONGEST WAIT',   c: P.acw     },
    { v: '78%', l: 'SERVICE LEVEL',  c: P.noReady },
    { v: '8',   l: 'AVAILABLE',      c: P.avail   },
    { v: '71%', l: 'AI CONTAINMENT', c: P.ai      },
    { v: '3',   l: 'ALERTS',         c: P.acw     },
  ];

  return F(0, 0, MW, MH, P.bg, [
    // Top bar with branding and time
    F(0, 0, MW, 44, P.panel, [
      T('VANTAGE', 20, 14, 80, 16, 10, P.sub, true, 'left', 1, 2),
      T('COMMAND CENTER — LIVE', MW/2 - 80, 14, 160, 16, 9, P.dim, false, 'center', 1, 1.5),
      T('09:41', MW - 56, 14, 40, 16, 11, P.sub, false, 'right'),
      Ln(0, 43, MW, P.border),
    ]),

    // Giant metric grid — 2×3
    F(0, 44, MW, MH - 44 - 44, P.bg, metrics.map(({ v, l, c }, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const tw  = MW / 2;
      const th  = (MH - 88) / 3;
      const alert = c === P.noReady;
      return F(col * tw, row * th, tw, th, P.panel, [
        Ln(0, 0, tw, P.border),
        col > 0 ? R(0, 0, 1, th, P.border) : null,
        alert ? R(0, 0, tw, 3, c) : null,
        T(v, 0, alert ? Math.round(th * 0.22) : Math.round(th * 0.18), tw, Math.round(th * 0.46), Math.round(th * 0.38), c, true, 'center'),
        T(l, 0, Math.round(th * 0.72), tw, Math.round(th * 0.2), 8, P.sub, false, 'center', 1, 0.8),
      ].filter(Boolean));
    })),

    // Footer
    F(0, MH - 44, MW, 44, P.panel, [
      Ln(0, 0, MW, P.border),
      E(16, 18, 8, 8, P.avail),
      T('SYSTEM OPERATIONAL', 32, 16, 180, 14, 9, P.sub, false, 'left', 1, 0.6),
      T('Updated 0s ago', MW - 100, 16, 84, 14, 9, P.dim, false, 'right'),
    ]),
  ]);
}

// ─── MOBILE SCREEN 5 — AI OVERSIGHT ──────────────────────────────────────────
function mobileAI() {
  const aiAgents = [
    { name: 'Nexus-7',  state: 'Connected', ch: 'Chat',  conf: 62, handled: 34, contained: 29, hitl: 2 },
    { name: 'Aria-3',   state: 'Connected', ch: 'Voice', conf: 88, handled: 21, contained: 20, hitl: 0 },
    { name: 'Echo-12',  state: 'ACW',       ch: 'Chat',  conf: 71, handled: 47, contained: 38, hitl: 1 },
    { name: 'Orion-2',  state: 'Available', ch: null,    conf: 95, handled: 18, contained: 17, hitl: 0 },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.panel),
    T('9:41', 16, 14, 60, 16, 12, P.text, true),
    T('AI Oversight', MW/2 - 52, 14, 104, 16, 11, P.text, true, 'center'),
    Ln(0, 43, MW, P.border),

    // Containment rate hero
    F(0, 44, MW, 108, P.panel2, [
      Ln(0, 0, MW, P.border),
      T('AI CONTAINMENT RATE', MW/2 - 80, 16, 160, 14, 8, P.sub, true, 'center', 1, 0.8),
      T('71%', 0, 36, MW, 44, 38, P.ai, true, 'center'),
      T('of contacts fully resolved by AI — 29% escalated to humans', 16, 84, MW - 32, 16, 9, P.dim, false, 'center'),
      Ln(0, 107, MW, P.border),
    ]),

    // HITL queue header
    F(0, 152, MW, 28, P.bg, [
      T('HITL AUTHORIZATION QUEUE', 16, 8, MW - 80, 14, 8, P.ai, true, 'left', 1, 0.8),
      F(MW - 36, 8, 28, 14, P.aiBg, [
        R(0, 0, 28, 14, P.ai, { op: 0.25, r: 3 }),
        T('2', 0, 2, 28, 10, 9, P.ai, true, 'center'),
      ], { r: 3 }),
    ]),

    // HITL cards
    HITLCard(0, 180, MW, 'Nexus-7', 'Refund > $500 policy exception', 62, 23),
    HITLCard(0, 248, MW, 'Echo-12', 'Account closure — retention offer', 71, 8),

    // AI agent list
    F(0, 320, MW, 28, P.bg, [
      T('AI FLEET', 16, 8, 120, 14, 8, P.sub, true, 'left', 1, 0.8),
    ]),
    F(0, 348, MW, MH - 348 - 56, P.bg,
      aiAgents.map((ag, i) => {
        const stateCol = { 'Available': P.avail, 'Connected': P.ai, 'ACW': P.acw }[ag.state] || P.offline;
        const rate = Math.round((ag.contained / ag.handled) * 100);
        return F(0, i * 68, MW, 64, P.panel, [
          R(0, 0, 3, 64, stateCol),
          F(12, 16, 30, 20, P.aiBg, [R(0,0,30,20,P.ai,{op:0.2,r:3}), T('AI',0,4,30,12,8,P.ai,true,'center')], { r: 3 }),
          T(ag.name, 52, 10, 100, 16, 12, P.text, true),
          StateBadge(52, 30, ag.state),
          T(`${ag.handled} handled`, MW - 120, 10, 100, 14, 10, P.sub, false, 'right'),
          T(`${rate}% contained`, MW - 120, 28, 100, 14, 10, P.ai, true, 'right'),
          ag.hitl > 0 ? F(MW - 120, 44, 60, 14, P.aiBg, [
            R(0, 0, 60, 14, P.ai, { op: 0.2, r: 3 }),
            T(`${ag.hitl} HITL`, 0, 2, 60, 10, 7, P.ai, true, 'center'),
          ], { r: 3 }) : null,
          T(`Confidence ${ag.conf}%`, MW - 56, 44, 44, 14, 8, P.dim, false, 'right'),
          Ln(0, 63, MW, P.border),
        ].filter(Boolean));
      })
    ),

    // Bottom nav
    F(0, MH - 56, MW, 56, P.panel2, [
      Ln(0, 0, MW, P.border),
      ...['⊞ Live', '≡ Queue', '◎ AI', '⌂ WB'].map((label, i) => {
        const tw = MW / 4;
        const active = i === 2;
        return F(i * tw, 0, tw, 56, 'transparent', [
          T(label, 0, 14, tw, 28, active ? 10 : 9, active ? P.busy : P.dim, active, 'center', 1, 0.3),
          active ? R(Math.round(tw * 0.3), 50, Math.round(tw * 0.4), 3, P.busy, { r: 2 }) : null,
        ].filter(Boolean));
      }),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 1 — MISSION CONTROL ──────────────────────────────────────
// Primary skeleton: KPI strip + left sidebar (queue+SLA+alerts) + live fleet table
// This is the supervisor's primary workspace — NOT a dashboard, NOT a list
function desktopMissionControl() {
  const SIDE = 280;
  const TABLE_W = PW - SIDE;
  const KPI_H = 72;
  const MAIN_H = PH - KPI_H - 40; // 40 = topnav

  const agents = [
    { name: 'Dana Kim',      state: 'Connected', duration: '8:14',  channel: 'Voice', customer: 'John M. · #4801',    sent: '-', isAI: false },
    { name: 'Priya Sharma',  state: 'Connected', duration: '2:33',  channel: 'Chat',  customer: 'Alicia R. · #4802',  sent: '+', isAI: false },
    { name: 'Nexus-7',       state: 'Connected', duration: '1:48',  channel: 'Chat',  customer: 'Brian T. · #4803',   sent: '~', isAI: true  },
    { name: 'Aria-3',        state: 'Connected', duration: '3:21',  channel: 'Voice', customer: 'Chen L. · #4804',    sent: '+', isAI: true  },
    { name: 'Marcus Lee',    state: 'ACW',       duration: '6:02',  channel: 'Chat',  customer: '—',                  sent: null, isAI: false, longACW: true },
    { name: 'Echo-12',       state: 'ACW',       duration: '1:14',  channel: 'Voice', customer: '—',                  sent: null, isAI: true  },
    { name: 'Sam O\'Brien',  state: 'Available', duration: '0:32',  channel: null,    customer: '—',                  sent: null, isAI: false },
    { name: 'Orion-2',       state: 'Available', duration: '2:11',  channel: null,    customer: '—',                  sent: null, isAI: true  },
    { name: 'Leila Frost',   state: 'Available', duration: '1:08',  channel: null,    customer: '—',                  sent: null, isAI: false },
    { name: 'Tom R.',        state: 'Not Ready', duration: '12:07', channel: null,    customer: '—',                  sent: null, isAI: false },
    { name: 'Wei Zhang',     state: 'Offline',   duration: '—',     channel: null,    customer: '—',                  sent: null, isAI: false },
  ];

  const ROW_H = 44;

  return F(0, 0, PW, PH, P.bg, [

    // ── Top nav bar ──────────────────────────────────────────────────────────
    F(0, 0, PW, 40, P.panel, [
      T('VANTAGE', 24, 12, 80, 16, 10, P.sub, true, 'left', 1, 2),
      T('MISSION CONTROL', 120, 12, 160, 16, 9, P.dim, false, 'left', 1, 1.5),
      // Live dot
      E(320, 17, 7, 7, P.avail),
      T('LIVE', 334, 13, 40, 14, 8, P.avail, true, 'left', 1, 1),
      // Nav tabs
      ...['Overview', 'AI Fleet', 'QA', 'Analytics'].map((tab, i) =>
        F(PW - 400 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 0 ? P.text : P.sub, i === 0, 'center'),
          i === 0 ? R(30, 37, 40, 2, P.busy, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // ── KPI strip — 8 tiles, full width ──────────────────────────────────────
    F(0, 40, PW, KPI_H, P.panel2, [
      Ln(0, 0, PW, P.border),
      ...[
        { v: '14',   l: 'CONTACTS IN QUEUE',  c: P.noReady, a: true  },
        { v: '4:23', l: 'LONGEST WAIT',        c: P.acw,     a: true  },
        { v: '78%',  l: 'SERVICE LEVEL',       c: P.noReady, a: true  },
        { v: '8',    l: 'AGENTS AVAILABLE',    c: P.avail,   a: false },
        { v: '3',    l: 'AGENTS IN ACW',       c: P.acw,     a: false },
        { v: '2',    l: 'NOT READY',           c: P.acw,     a: false },
        { v: '71%',  l: 'AI CONTAINMENT',      c: P.ai,      a: false },
        { v: '3',    l: 'SENTIMENT ALERTS',    c: P.acw,     a: false },
      ].map(({ v, l, c, a }, i) => {
        const tw = PW / 8;
        return F(i * tw, 0, tw, KPI_H, 'transparent', [
          a ? R(0, 0, tw, 2, c) : null,
          T(v, 0, a ? 10 : 8, tw, 32, 26, c, true, 'center'),
          T(l, 0, 46, tw, 14, 7, P.sub, false, 'center', 1, 0.5),
          i < 7 ? R(tw - 1, 12, 1, KPI_H - 24, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, KPI_H - 1, PW, P.border),
    ]),

    // ── Left sidebar ─────────────────────────────────────────────────────────
    F(0, 40 + KPI_H, SIDE, MAIN_H, P.panel, [

      // SLA gauge
      F(16, 16, SIDE - 32, 148, P.panel2, [
        T('SERVICE LEVEL', 0, 14, SIDE - 32, 12, 8, P.sub, true, 'center', 1, 0.8),
        T('78%', 0, 30, SIDE - 32, 52, 44, P.noReady, true, 'center'),
        T('TARGET: 80/20', 0, 84, SIDE - 32, 12, 8, P.dim, false, 'center', 1, 0.6),
        ProgressBar(16, 106, SIDE - 64, 0.78, P.noReady),
        // Threshold marker
        R(Math.round((SIDE - 64) * 0.80) + 14, 100, 2, 18, P.text, { op: 0.5 }),
        F(Math.round((SIDE - 32 - 88) / 2), 122, 88, 16, P.noReadyBg, [
          R(0, 0, 88, 16, P.noReady, { op: 0.2, r: 3 }),
          T('SLA BREACH', 0, 3, 88, 10, 7, P.noReady, true, 'center', 1, 0.8),
        ], { r: 3 }),
      ], { r: 6 }),

      // Queue by channel
      T('QUEUE BY CHANNEL', 16, 180, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      ...[
        { ch: 'Voice',  n: 6, wait: '4:23', col: P.voice  },
        { ch: 'Chat',   n: 5, wait: '2:11', col: P.chat   },
        { ch: 'Email',  n: 3, wait: '18m',  col: P.email  },
        { ch: 'Social', n: 0, wait: '—',    col: P.social },
      ].map(({ ch, n, wait, col }, i) =>
        F(12, 200 + i * 48, SIDE - 24, 44, P.panel2, [
          R(0, 0, 3, 44, col),
          T(ch.toUpperCase(), 12, 8, 80, 11, 7, P.sub, true, 'left', 1, 0.6),
          T(`${n}`, 12, 20, 36, 18, 14, n > 4 ? P.noReady : col, true),
          T('waiting', 50, 24, 60, 12, 8, P.dim),
          T(wait, SIDE - 52, 14, 40, 14, 10, P.sub, false, 'right'),
          Ln(0, 43, SIDE - 24, P.border),
        ], { r: 4 })
      ),

      // Agent state distribution
      T('AGENT STATES', 16, 400, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(12, 420, SIDE - 24, 60, P.panel2, [
        // State distribution strip
        ...((() => {
          const states = [
            { col: P.busy,    pct: 0.36 },  // 4 connected
            { col: P.avail,   pct: 0.27 },  // 3 available
            { col: P.acw,     pct: 0.18 },  // 2 ACW
            { col: P.noReady, pct: 0.09 },  // 1 not ready
            { col: P.offline, pct: 0.09 },  // 1 offline
          ];
          const barW = SIDE - 48;
          let ox = 0;
          return states.map(({ col, pct }) => {
            const w = Math.round(barW * pct) - 2;
            const el = R(12 + ox, 12, w, 20, col, { r: 2 });
            ox += w + 2;
            return el;
          });
        })()),
        T('Connected', 12, 38, 80, 14, 8, P.busy,    false, 'left'),
        T('4', 90, 38, 20, 14, 8, P.busy,    true),
        T('Avail', 116, 38, 48, 14, 8, P.avail,   false, 'left'),
        T('3', 160, 38, 20, 14, 8, P.avail,  true),
        T('ACW', 184, 38, 36, 14, 8, P.acw,    false, 'left'),
        T('2', 216, 38, 20, 14, 8, P.acw,    true),
      ], { r: 4 }),

      // HITL authorization queue
      T('HITL REQUESTS', 16, 500, SIDE - 32, 12, 8, P.ai, true, 'left', 1, 0.8),
      ...[
        { ai: 'Nexus-7', topic: 'Refund > $500',       conf: 62, wait: '23s', c: P.noReady },
        { ai: 'Echo-12', topic: 'Account closure offer', conf: 71, wait: '8s',  c: P.acw    },
      ].map(({ ai, topic, conf, wait, c }, i) =>
        F(12, 520 + i * 64, SIDE - 24, 58, P.aiBg, [
          R(0, 0, SIDE - 24, 58, P.ai, { op: 0.06, r: 4 }),
          R(0, 0, 3, 58, P.ai),
          T(ai, 10, 8, 100, 14, 10, P.ai, true),
          T(`Wait: ${wait}`, SIDE - 72, 8, 60, 12, 8, c, true, 'right'),
          T(topic, 10, 24, SIDE - 60, 16, 9, P.sub),
          T(`Conf: ${conf}%`, 10, 40, 80, 12, 8, P.dim),
          F(SIDE - 80, 36, 60, 18, P.ai, [
            R(0, 0, 60, 18, P.ai, { op: 0.2, r: 3 }),
            T('Auth →', 0, 4, 60, 10, 8, P.ai, true, 'center'),
          ], { r: 3 }),
        ], { r: 4 })
      ),

      // Escalation log
      T('EXCEPTIONS', 16, 660, SIDE - 32, 12, 8, P.sub, true, 'left', 1, 0.8),
      ...[
        { type: 'RONA',      msg: 'Marcus L. — #4821', t: '1m', col: P.noReady },
        { type: 'LONG WAIT', msg: 'Voice queue > 5m',   t: '3m', col: P.acw    },
        { type: 'SENTIMENT', msg: 'Dana Kim — negative', t: '5m', col: P.acw   },
      ].map(({ type, msg, t, col }, i) =>
        F(0, 680 + i * 40, SIDE, 38, P.panel, [
          R(0, 0, 3, 38, col),
          T(type, 10, 6, 80, 12, 7, col, true, 'left', 1, 0.7),
          T(t, SIDE - 28, 6, 24, 12, 7, P.dim, false, 'right'),
          T(msg, 10, 20, SIDE - 40, 14, 9, P.text),
          Ln(0, 37, SIDE, P.border),
        ])
      ),

      Ln(SIDE - 1, 0, 1, MAIN_H, P.border),
    ]),

    // ── Live fleet table ──────────────────────────────────────────────────────
    F(SIDE, 40 + KPI_H, TABLE_W, MAIN_H, P.bg, [

      // Table header
      F(0, 0, TABLE_W, 36, P.panel2, [
        Ln(0, 0, TABLE_W, P.border),
        T('AGENT', 52, 11, 140, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('STATE', 192, 11, 100, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('DURATION', 308, 11, 80, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('CHANNEL', 378, 11, 80, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('INTERACTION', 450, 11, 150, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('SENT', 606, 11, 40, 14, 8, P.dim, true, 'center', 1, 0.8),
        T('ACTIONS', 634, 11, 180, 14, 8, P.dim, true, 'left', 1, 0.8),
        Ln(0, 35, TABLE_W, P.border),
      ]),

      // Agent rows
      F(0, 36, TABLE_W, agents.length * (ROW_H + 1), P.bg,
        agents.map((ag, i) => AgentRow(0, i * (ROW_H + 1), TABLE_W, ROW_H, ag))
      ),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 2 — WALLBOARD MODE ───────────────────────────────────────
function desktopWallboard() {
  const BIG = [
    { v: '14',   l: 'CONTACTS IN QUEUE', c: P.noReady },
    { v: '4:23', l: 'LONGEST WAIT',      c: P.acw     },
    { v: '78%',  l: 'SERVICE LEVEL',     c: P.noReady },
    { v: '8',    l: 'AGENTS AVAILABLE',  c: P.avail   },
  ];
  const SMALL = [
    { v: '71%',  l: 'AI CONTAINMENT', c: P.ai      },
    { v: '3',    l: 'NOT READY',      c: P.acw     },
    { v: '6:42', l: 'AVG HANDLE TIME', c: P.sub    },
    { v: '4.2',  l: 'CSAT TODAY',     c: P.avail   },
  ];

  const tW = PW / 4;
  const topH = Math.round(PH * 0.62);
  const botH = PH - topH - 40;

  return F(0, 0, PW, PH, P.bg, [
    // Slim header bar
    F(0, 0, PW, 40, P.panel, [
      T('VANTAGE COMMAND CENTER', 40, 13, 240, 14, 10, P.sub, true, 'left', 1, 1.5),
      E(300, 18, 7, 7, P.avail),
      T('LIVE', 314, 14, 40, 12, 8, P.avail, true, 'left', 1, 1),
      T('WALLBOARD MODE', PW/2 - 60, 13, 120, 14, 9, P.dim, false, 'center', 1, 1.5),
      T('09:41:22', PW - 120, 13, 80, 14, 11, P.sub, false, 'right'),
      Ln(0, 39, PW, P.border),
    ]),

    // 4 giant metric tiles (top row)
    F(0, 40, PW, topH, P.bg,
      BIG.map(({ v, l, c }, i) => {
        const alert = c === P.noReady;
        return F(i * tW, 0, tW, topH, P.panel, [
          i > 0 ? R(0, 0, 1, topH, P.border) : null,
          alert ? R(0, 0, tW, 4, c) : null,
          T(v, 0, alert ? Math.round(topH * 0.24) : Math.round(topH * 0.20), tW, Math.round(topH * 0.5), Math.round(topH * 0.42), c, true, 'center'),
          T(l, 0, Math.round(topH * 0.76), tW, Math.round(topH * 0.14), 11, P.sub, false, 'center', 1, 0.8),
        ].filter(Boolean));
      })
    ),

    Ln(0, 40 + topH, PW, P.border),

    // 4 smaller tiles (bottom strip)
    F(0, 40 + topH, PW, botH, P.panel2,
      SMALL.map(({ v, l, c }, i) =>
        F(i * tW, 0, tW, botH, 'transparent', [
          i > 0 ? R(0, 0, 1, botH, P.border) : null,
          T(v, 0, Math.round(botH * 0.1), tW, Math.round(botH * 0.55), Math.round(botH * 0.46), c, true, 'center'),
          T(l, 0, Math.round(botH * 0.7), tW, Math.round(botH * 0.25), 9, P.sub, false, 'center', 1, 0.7),
        ].filter(Boolean))
      )
    ),
  ]);
}

// ─── DESKTOP SCREEN 3 — AI FLEET UNIFIED ─────────────────────────────────────
function desktopAIFleet() {
  const SIDE = 320;

  const aiAgents = [
    { name: 'Nexus-7',  state: 'Connected', ch: 'Chat',  conf: 62, handled: 34, contained: 29, hitl: 2, duration: '1:48', customer: 'Brian T. · #4803' },
    { name: 'Aria-3',   state: 'Connected', ch: 'Voice', conf: 88, handled: 21, contained: 20, hitl: 0, duration: '3:21', customer: 'Chen L. · #4804'  },
    { name: 'Echo-12',  state: 'ACW',       ch: 'Chat',  conf: 71, handled: 47, contained: 38, hitl: 1, duration: '1:14', customer: '—'                  },
    { name: 'Orion-2',  state: 'Available', ch: null,    conf: 95, handled: 18, contained: 17, hitl: 0, duration: '2:11', customer: '—'                  },
    { name: 'Nova-5',   state: 'Available', ch: null,    conf: 91, handled: 28, contained: 25, hitl: 0, duration: '0:44', customer: '—'                  },
  ];

  const CONF_W = SIDE - 40;
  const ROW_H  = 48;

  return F(0, 0, PW, PH, P.bg, [
    // Nav
    F(0, 0, PW, 40, P.panel, [
      T('VANTAGE', 24, 12, 80, 16, 10, P.sub, true, 'left', 1, 2),
      ...['Overview', 'AI Fleet', 'QA', 'Analytics'].map((tab, i) =>
        F(PW - 400 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 1 ? P.text : P.sub, i === 1, 'center'),
          i === 1 ? R(30, 37, 40, 2, P.ai, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Left: AI summary panel
    F(0, 40, SIDE, PH - 40, P.panel, [

      T('AI FLEET OVERVIEW', 20, 20, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),

      // Containment donut (simulated)
      F(20, 44, SIDE - 40, 130, P.panel2, [
        E(Math.round((SIDE - 40) / 2) - 44, 8, 88, 88, P.ai, 0.12),
        E(Math.round((SIDE - 40) / 2) - 30, 22, 60, 60, P.panel2),
        T('71%', 0, 38, SIDE - 40, 32, 26, P.ai, true, 'center'),
        T('CONTAINED', 0, 72, SIDE - 40, 12, 7, P.ai, true, 'center', 1, 0.8),
        Ln(0, 100, SIDE - 40, P.border, 0.4),
        T('29% escalated to humans', 0, 108, SIDE - 40, 16, 9, P.sub, false, 'center'),
      ], { r: 6 }),

      // AI KPIs
      T('AI METRICS TODAY', 20, 192, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),
      ...[
        { l: 'Total AI interactions', v: '148' },
        { l: 'Fully contained',       v: '105' },
        { l: 'Escalated to human',    v: '43'  },
        { l: 'HITL requests',         v: '4'   },
        { l: 'Avg confidence score',  v: '81%' },
        { l: 'Avg AI handle time',    v: '2:18'},
      ].map(({ l, v }, i) =>
        F(20, 212 + i * 36, SIDE - 40, 32, P.panel2, [
          T(l, 12, 9, SIDE - 100, 14, 10, P.sub),
          T(v, SIDE - 80, 9, 60, 14, 11, P.text, true, 'right'),
          Ln(0, 31, SIDE - 40, P.border),
        ], { r: 3 })
      ),

      // Confidence distribution
      T('CONFIDENCE DISTRIBUTION', 20, 440, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(20, 460, CONF_W, 80, P.panel2, [
        ...[
          { label: '90–100%', pct: 0.38, col: P.avail  },
          { label: '70–89%',  pct: 0.44, col: P.ai     },
          { label: '50–69%',  pct: 0.14, col: P.acw    },
          { label: '<50%',    pct: 0.04, col: P.noReady },
        ].map(({ label, pct, col }, i) =>
          F(12, 8 + i * 16, CONF_W - 24, 14, 'transparent', [
            T(label, 0, 1, 60, 12, 8, P.sub),
            ProgressBar(68, 3, CONF_W - 120, pct, col),
            T(`${Math.round(pct * 100)}%`, CONF_W - 44, 1, 36, 12, 8, col, true, 'right'),
          ])
        ),
      ], { r: 4 }),

      // HITL queue
      T('HITL REQUESTS', 20, 556, SIDE - 40, 12, 8, P.ai, true, 'left', 1, 0.8),
      ...[
        { ai: 'Nexus-7', topic: 'Refund > $500 policy', conf: 62, wait: '23s' },
        { ai: 'Echo-12', topic: 'Account closure offer', conf: 71, wait: '8s'  },
      ].map(({ ai, topic, conf, wait }, i) =>
        F(20, 576 + i * 68, SIDE - 40, 60, P.aiBg, [
          R(0, 0, SIDE - 40, 60, P.ai, { op: 0.07, r: 4 }),
          R(0, 0, 3, 60, P.ai),
          T(ai, 10, 8, 100, 14, 10, P.ai, true),
          T(`${wait}`, SIDE - 70, 8, 52, 12, 8, i === 0 ? P.noReady : P.acw, true, 'right'),
          T(topic, 10, 24, SIDE - 60, 16, 9, P.sub),
          T(`Confidence ${conf}%`, 10, 42, 100, 12, 8, P.dim),
          F(SIDE - 90, 38, 62, 16, P.ai, [
            R(0, 0, 62, 16, P.ai, { op: 0.2, r: 3 }),
            T('Authorize', 0, 3, 62, 10, 8, P.ai, true, 'center'),
          ], { r: 3 }),
        ], { r: 4 })
      ),

      Ln(SIDE - 1, 0, 1, PH - 40, P.border),
    ]),

    // Right: AI agent fleet table
    F(SIDE, 40, PW - SIDE, PH - 40, P.bg, [
      // Section header
      F(0, 0, PW - SIDE, 44, P.panel2, [
        T('AI AGENT FLEET', 24, 14, 200, 16, 10, P.text, true),
        T('5 agents active · 148 interactions today', 200, 16, 300, 12, 9, P.sub),
        Ln(0, 43, PW - SIDE, P.border),
      ]),

      // Column headers
      F(0, 44, PW - SIDE, 32, P.panel, [
        T('AGENT', 20, 9, 120, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('STATE', 160, 9, 90, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('CHANNEL', 280, 9, 80, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('CONFIDENCE', 370, 9, 90, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('HANDLED', 480, 9, 80, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('CONTAINED', 560, 9, 90, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('HITL', 660, 9, 50, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('DURATION', 720, 9, 80, 14, 8, P.dim, true, 'left', 1, 0.8),
        T('INTERACTION', 810, 9, 200, 14, 8, P.dim, true, 'left', 1, 0.8),
        Ln(0, 31, PW - SIDE, P.border),
      ]),

      // AI agent rows
      F(0, 76, PW - SIDE, aiAgents.length * (ROW_H + 1), P.bg,
        aiAgents.map(({ name, state, ch, conf, handled, contained, hitl, duration, customer }, i) => {
          const stateCol = { 'Available': P.avail, 'Connected': P.ai, 'ACW': P.acw }[state] || P.offline;
          const rate = Math.round((contained / handled) * 100);
          const confCol = conf >= 80 ? P.avail : conf >= 65 ? P.ai : P.acw;
          return F(0, i * (ROW_H + 1), PW - SIDE, ROW_H, P.aiBg, [
            R(0, 0, 3, ROW_H, stateCol),
            F(12, Math.round((ROW_H - 20) / 2), 36, 20, P.aiBg, [
              R(0, 0, 36, 20, P.ai, { op: 0.2, r: 3 }),
              T('AI', 0, 4, 36, 12, 8, P.ai, true, 'center'),
            ], { r: 3 }),
            T(name, 56, Math.round((ROW_H - 16) / 2), 100, 16, 11, P.text, true),
            StateBadge(160, Math.round((ROW_H - 20) / 2), state),
            ch ? ChPill(280, Math.round((ROW_H - 18) / 2), ch) : null,
            T(`${conf}%`, 370, Math.round((ROW_H - 14) / 2), 50, 14, 11, confCol, true),
            ProgressBar(428, Math.round(ROW_H / 2) - 3, 44, conf / 100, confCol),
            T(`${handled}`, 480, Math.round((ROW_H - 14) / 2), 60, 14, 11, P.sub),
            T(`${rate}%`, 560, Math.round((ROW_H - 14) / 2), 60, 14, 11, P.ai, true),
            hitl > 0
              ? F(660, Math.round((ROW_H - 18) / 2), 40, 18, P.aiBg, [
                  R(0, 0, 40, 18, P.ai, { op: 0.25, r: 3 }),
                  T(`${hitl}`, 0, 3, 40, 12, 9, P.ai, true, 'center'),
                ], { r: 3 })
              : T('—', 660, Math.round((ROW_H - 14) / 2), 40, 14, 11, P.dim),
            T(duration, 720, Math.round((ROW_H - 14) / 2), 70, 14, 11, P.sub),
            T(customer, 810, Math.round((ROW_H - 14) / 2), 200, 14, 10, P.sub),
            Ln(0, ROW_H - 1, PW - SIDE, P.border),
          ].filter(Boolean));
        })
      ),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 4 — QA EVALUATION ────────────────────────────────────────
function desktopQA() {
  const SIDE = 300;
  const scores = [
    { label: 'Opening & Greeting',        max: 10, ai: 9,  human: 9  },
    { label: 'Issue Identification',       max: 15, ai: 14, human: 12 },
    { label: 'Empathy & Active Listening', max: 15, ai: 11, human: 10 },
    { label: 'Product Knowledge',          max: 20, ai: 18, human: 17 },
    { label: 'Resolution Effectiveness',   max: 20, ai: 14, human: 16 },
    { label: 'Communication Clarity',      max: 10, ai: 8,  human: 9  },
    { label: 'ACW & Wrap-up',              max: 10, ai: 9,  human: 8  },
  ];

  const aiTotal    = scores.reduce((a, s) => a + s.ai, 0);
  const humanTotal = scores.reduce((a, s) => a + s.human, 0);
  const maxTotal   = scores.reduce((a, s) => a + s.max, 0);

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('VANTAGE', 24, 12, 80, 16, 10, P.sub, true, 'left', 1, 2),
      ...['Overview', 'AI Fleet', 'QA', 'Analytics'].map((tab, i) =>
        F(PW - 400 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 2 ? P.text : P.sub, i === 2, 'center'),
          i === 2 ? R(30, 37, 40, 2, P.busy, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Left: call info + context
    F(0, 40, SIDE, PH - 40, P.panel, [
      T('QA EVALUATION', 20, 20, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),

      // Call card
      F(20, 44, SIDE - 40, 120, P.panel2, [
        T('Call #4801', 16, 14, 160, 16, 12, P.text, true),
        T('Dana Kim  ·  Voice', 16, 32, 200, 14, 10, P.sub),
        T('Today 09:22 · 8:14 min', 16, 48, 200, 12, 9, P.dim),
        Ln(0, 68, SIDE - 40, P.border, 0.4),
        T('Customer', 16, 80, 60, 12, 8, P.sub),
        T('John Martinez', 16, 94, 200, 14, 11, P.text, true),
        T('Billing dispute — double charge', 16, 110, SIDE - 56, 12, 9, P.dim),
      ], { r: 6 }),

      // AI pre-score summary
      F(20, 180, SIDE - 40, 60, P.aiBg, [
        R(0, 0, SIDE - 40, 60, P.ai, { op: 0.07, r: 4 }),
        T('AI PRE-SCORE', 12, 10, 100, 12, 7, P.ai, true, 'left', 1, 0.8),
        T(`${aiTotal}/${maxTotal}`, SIDE - 80, 8, 60, 22, 16, P.ai, true, 'right'),
        T('Based on transcript analysis', 12, 24, SIDE - 60, 14, 9, P.sub),
        T('Human override available', 12, 40, SIDE - 60, 14, 9, P.dim),
      ], { r: 4 }),

      // Score breakdown
      T('SCORECARD', 20, 258, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(20, 278, SIDE - 40, 60, P.panel2, [
        T(`AI Score:    ${aiTotal}/${maxTotal}`, 16, 10, SIDE - 72, 16, 11, P.ai,  true),
        T(`Human Score: ${humanTotal}/${maxTotal}`, 16, 34, SIDE - 72, 16, 11, P.text, true),
        ProgressBar(16, 52, SIDE - 72, aiTotal / maxTotal, P.ai),
      ], { r: 4 }),

      // Flags
      T('COACH FLAGS', 20, 356, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),
      ...[
        { flag: 'Customer interrupted', col: P.acw     },
        { flag: 'Hold > 90 seconds',    col: P.noReady },
        { flag: 'No empathy statement', col: P.acw     },
      ].map(({ flag, col }, i) =>
        F(20, 376 + i * 36, SIDE - 40, 30, P.panel2, [
          R(0, 0, 3, 30, col),
          T(flag, 10, 8, SIDE - 72, 14, 9, P.text),
          Ln(0, 29, SIDE - 40, P.border),
        ], { r: 3 })
      ),

      // Outcomes
      T('RESOLUTION', 20, 492, SIDE - 40, 12, 8, P.sub, true, 'left', 1, 0.8),
      F(20, 512, SIDE - 40, 60, P.panel2, [
        T('Refund issued: $47.99', 12, 10, SIDE - 64, 14, 10, P.avail),
        T('$10 credit added', 12, 28, SIDE - 64, 14, 10, P.avail),
        T('CSAT: Sent to customer', 12, 46, SIDE - 64, 12, 9, P.sub),
      ], { r: 4 }),

      Ln(SIDE - 1, 0, 1, PH - 40, P.border),
    ]),

    // Right: detailed scorecard
    F(SIDE, 40, PW - SIDE, PH - 40, P.bg, [
      F(0, 0, PW - SIDE, 44, P.panel2, [
        T('DETAILED SCORECARD', 24, 14, 300, 16, 11, P.text, true),
        T('AI pre-scored · awaiting human override', 300, 16, 300, 12, 9, P.sub),
        F(PW - SIDE - 120, 10, 100, 24, P.busyBg, [
          R(0, 0, 100, 24, P.busy, { op: 0.2, r: 4 }),
          T('Submit Review', 0, 6, 100, 12, 9, P.busy, true, 'center'),
        ], { r: 4 }),
        Ln(0, 43, PW - SIDE, P.border),
      ]),

      // Column headers
      F(0, 44, PW - SIDE, 28, P.panel, [
        T('CRITERION', 24, 8, 300, 12, 8, P.dim, true, 'left', 1, 0.8),
        T('MAX', 340, 8, 40, 12, 8, P.dim, true, 'center', 1, 0.8),
        T('AI SCORE', 400, 8, 80, 12, 8, P.dim, true, 'center', 1, 0.8),
        T('YOUR SCORE', 520, 8, 90, 12, 8, P.dim, true, 'center', 1, 0.8),
        T('NOTES', 650, 8, PW - SIDE - 674, 12, 8, P.dim, true, 'left', 1, 0.8),
        Ln(0, 27, PW - SIDE, P.border),
      ]),

      // Score rows
      F(0, 72, PW - SIDE, scores.length * 60, P.bg,
        scores.map(({ label, max, ai, human }, i) => {
          const noteW = PW - SIDE - 674;
          return F(0, i * 60, PW - SIDE, 58, P.panel, [
            T(label, 24, 20, 300, 18, 11, P.text),
            T(`${max}`, 340, 20, 40, 18, 11, P.sub, false, 'center'),
            // AI score circle
            F(400, 12, 60, 34, 'transparent', [
              E(15, 5, 30, 30, P.ai, 0.12),
              T(`${ai}`, 0, 12, 60, 18, 12, P.ai, true, 'center'),
            ]),
            // Human score — editable input simulation
            F(520, 10, 60, 36, P.panel3, [
              R(0, 0, 60, 36, P.busy, { op: 0.08, r: 4 }),
              T(`${human}`, 0, 10, 60, 18, 13, P.text, true, 'center'),
            ], { r: 4 }),
            // Notes field
            F(650, 10, noteW, 36, P.panel3, [
              R(0, 0, noteW, 36, P.border, { op: 0.3, r: 4 }),
              T(i === 1 ? 'Customer stated issue unclear initially' : i === 4 ? 'Strong handling, exceeded expectations' : '', 8, 10, noteW - 16, 18, 9, P.sub),
            ], { r: 4 }),
            Ln(0, 57, PW - SIDE, P.border),
          ]);
        })
      ),

      // Total row
      F(0, 72 + scores.length * 60, PW - SIDE, 52, P.panel2, [
        T('TOTAL', 24, 16, 300, 20, 12, P.text, true),
        T(`${maxTotal}`, 340, 16, 40, 20, 12, P.sub, false, 'center'),
        T(`${aiTotal}`, 400, 16, 80, 20, 13, P.ai, true, 'center'),
        T(`${humanTotal}`, 520, 16, 90, 20, 13, P.busy, true, 'center'),
        T(`${Math.round((humanTotal / maxTotal) * 100)}% — PASS`, 650, 16, 200, 20, 12, humanTotal / maxTotal >= 0.7 ? P.avail : P.noReady, true),
      ]),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 5 — ANALYTICS ────────────────────────────────────────────
function desktopAnalytics() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const aht    = [7.2, 6.8, 6.9, 7.1, 6.5, 6.3, 6.8, 7.0, 6.4, 6.2, 6.7, 6.4];
  const csat   = [3.9, 4.0, 4.1, 3.8, 4.2, 4.3, 4.1, 4.0, 4.2, 4.4, 4.2, 4.3];
  const fcr    = [0.72, 0.74, 0.71, 0.75, 0.78, 0.77, 0.76, 0.79, 0.80, 0.82, 0.80, 0.83];
  const aiCont = [0.55, 0.57, 0.60, 0.62, 0.65, 0.67, 0.68, 0.69, 0.70, 0.71, 0.72, 0.71];

  const chartH = 120;
  const chartW = PW - 96 - 48;
  const barCount = 12;
  const barW = Math.floor((chartW - (barCount - 1) * 6) / barCount);

  function Bars(data, maxVal, col) {
    return data.map((v, i) => {
      const h = Math.round(chartH * (v / maxVal));
      return R(i * (barW + 6), chartH - h, barW, h, col, { r: 2 });
    });
  }

  const statCards = [
    { l: 'Avg Handle Time',    v: '6:42', delta: '↓ 0:18', up: true,  col: P.avail },
    { l: 'First Contact Res.', v: '83%',  delta: '↑ 3%',   up: true,  col: P.avail },
    { l: 'CSAT Score',         v: '4.3',  delta: '↑ 0.1',  up: true,  col: P.avail },
    { l: 'AI Containment',     v: '71%',  delta: '↑ 16%',  up: true,  col: P.ai    },
  ];

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 40, P.panel, [
      T('VANTAGE', 24, 12, 80, 16, 10, P.sub, true, 'left', 1, 2),
      ...['Overview', 'AI Fleet', 'QA', 'Analytics'].map((tab, i) =>
        F(PW - 400 + i * 100, 0, 100, 40, 'transparent', [
          T(tab, 0, 13, 100, 14, 10, i === 3 ? P.text : P.sub, i === 3, 'center'),
          i === 3 ? R(30, 37, 40, 2, P.busy, { r: 1 }) : null,
        ].filter(Boolean))
      ),
      Ln(0, 39, PW, P.border),
    ]),

    // Stat summary strip
    F(0, 40, PW, 72, P.panel2, [
      Ln(0, 0, PW, P.border),
      ...statCards.map(({ l, v, delta, up, col }, i) => {
        const tw = PW / 4;
        return F(i * tw, 0, tw, 72, 'transparent', [
          T(v, 20, 10, 100, 28, 22, col, true),
          T(delta, 124, 18, 80, 16, 10, col, true),
          T(l, 20, 44, tw - 40, 16, 9, P.sub),
          i < 3 ? R(tw - 1, 12, 1, 48, P.border) : null,
        ].filter(Boolean));
      }),
      Ln(0, 71, PW, P.border),
    ]),

    // Charts grid — 2×2
    F(48, 128, PW - 96, PH - 128 - 40, P.bg, [

      // AHT chart
      F(0, 0, (PW - 96 - 24) / 2, 180, P.panel, [
        T('AVG HANDLE TIME (minutes)', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        T('6:42', 20, 34, 80, 24, 18, P.text, true),
        T('this month', 104, 42, 100, 16, 9, P.dim),
        F(20, 62, chartW / 2 - 20, chartH, 'transparent',
          Bars(aht, 10, P.busy)
        ),
        F(20, 62 + chartH + 4, chartW / 2 - 20, 16, 'transparent',
          months.map((m, i) =>
            T(m, i * (barW + 6), 0, barW, 14, 7, P.dim, false, 'center')
          )
        ),
      ], { r: 6 }),

      // CSAT chart
      F((PW - 96 - 24) / 2 + 24, 0, (PW - 96 - 24) / 2, 180, P.panel, [
        T('CSAT SCORE (1–5)', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        T('4.3', 20, 34, 80, 24, 18, P.avail, true),
        T('this month', 80, 42, 100, 16, 9, P.dim),
        F(20, 62, chartW / 2 - 20, chartH, 'transparent',
          Bars(csat, 5, P.avail)
        ),
        F(20, 62 + chartH + 4, chartW / 2 - 20, 16, 'transparent',
          months.map((m, i) =>
            T(m, i * (barW + 6), 0, barW, 14, 7, P.dim, false, 'center')
          )
        ),
      ], { r: 6 }),

      // FCR chart
      F(0, 204, (PW - 96 - 24) / 2, 180, P.panel, [
        T('FIRST CONTACT RESOLUTION RATE', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        T('83%', 20, 34, 80, 24, 18, P.avail, true),
        T('this month', 88, 42, 100, 16, 9, P.dim),
        F(20, 62, chartW / 2 - 20, chartH, 'transparent',
          Bars(fcr, 1, P.email)
        ),
        F(20, 62 + chartH + 4, chartW / 2 - 20, 16, 'transparent',
          months.map((m, i) =>
            T(m, i * (barW + 6), 0, barW, 14, 7, P.dim, false, 'center')
          )
        ),
      ], { r: 6 }),

      // AI Containment chart
      F((PW - 96 - 24) / 2 + 24, 204, (PW - 96 - 24) / 2, 180, P.panel, [
        T('AI CONTAINMENT RATE', 20, 16, 300, 14, 9, P.sub, true, 'left', 1, 0.8),
        T('71%', 20, 34, 80, 24, 18, P.ai, true),
        T('this month', 80, 42, 100, 16, 9, P.dim),
        F(20, 62, chartW / 2 - 20, chartH, 'transparent',
          Bars(aiCont, 1, P.ai)
        ),
        F(20, 62 + chartH + 4, chartW / 2 - 20, 16, 'transparent',
          months.map((m, i) =>
            T(m, i * (barW + 6), 0, barW, 14, 7, P.dim, false, 'center')
          )
        ),
      ], { r: 6 }),

    ]),
  ]);
}

// ─── ASSEMBLE & LAYOUT ────────────────────────────────────────────────────────
const screens = [
  mobileSupervisor(),
  mobileQueue(),
  mobileAgentDetail(),
  mobileWallboard(),
  mobileAI(),
  desktopMissionControl(),
  desktopWallboard(),
  desktopAIFleet(),
  desktopQA(),
  desktopAnalytics(),
];

let ox = 0;
const GAP = 60;
const laid = screens.map(s => {
  const out = { ...s, x: ox };
  ox += s.width + GAP;
  return out;
});

// ─── MINIFY ───────────────────────────────────────────────────────────────────
function minifyEl(el) {
  const o = { type: el.type, x: el.x || 0, y: el.y || 0, width: el.width, height: el.height };
  if (el.fill !== undefined) o.fill = el.fill;
  if (el.cornerRadius) o.cornerRadius = el.cornerRadius;
  if (el.opacity !== undefined && el.opacity < 0.999) o.opacity = el.opacity;
  if (el.type === 'text') {
    o.text = el.text;
    o.fontSize = el.fontSize;
    if (el.fontWeight === 700) o.fontWeight = 700;
    if (el.textAlign && el.textAlign !== 'left') o.textAlign = el.textAlign;
    if (el.letterSpacing) o.letterSpacing = el.letterSpacing;
    if (el.fill) o.fill = el.fill;
  }
  if (el.children && el.children.length) o.children = el.children.map(minifyEl);
  return o;
}

const penDoc  = { version: '2.8', children: laid.map(minifyEl) };
const penJSON = JSON.stringify(penDoc);
const penB64  = Buffer.from(penJSON).toString('base64');
fs.writeFileSync('/workspace/group/design-studio/vantage.pen', penJSON);
console.log(`Pen JSON: ${(penJSON.length / 1024).toFixed(1)} KB`);

// ─── SVG THUMBNAILS ───────────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oA = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rA = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rA}${oA}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse')
    return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}"${oA}/>`;
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 12) * 0.65));
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w}" height="${fh}" fill="${fill || '#DDE4F0'}"${oA} rx="1"/>`;
  }
  return '';
}

function screenThumb(s, tw, th) {
  const flat = { ...s, x: 0, y: 0 };
  const kids = (flat.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${flat.width} ${flat.height}" `
    + `width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0;box-shadow:0 4px 20px rgba(0,0,0,0.4)">`
    + `<rect width="${flat.width}" height="${flat.height}" fill="${flat.fill || P.bg}"/>`
    + kids + `</svg>`;
}

const labels = [
  'M·Supervisor', 'M·Queue Monitor', 'M·Agent Detail', 'M·Wallboard', 'M·AI Oversight',
  'D·Mission Control', 'D·Wallboard', 'D·AI Fleet', 'D·QA Evaluation', 'D·Analytics',
];

const thumbsHTML = screens.map((s, i) => {
  const mobile = i < 5;
  const th = 180;
  const tw = mobile ? Math.round(th * MW / MH) : Math.round(th * PW / PH);
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">`
    + screenThumb(s, tw, th)
    + `<span style="font-size:9px;letter-spacing:1.5px;color:#7A8BA8;text-transform:uppercase;white-space:nowrap">${labels[i]}</span></div>`;
}).join('');

// ─── BUILD HTML ───────────────────────────────────────────────────────────────
const tagsHTML = [
  'MISSION CONTROL', 'DARK MODE', 'REAL-TIME', 'CONTACT CENTER', 'AGENT STATE MACHINE',
  'HITL AUTHORIZATION', 'SLA 80/20', 'WALLBOARD MODE',
].map(t => `<span style="border:1px solid #1C2538;color:#7A8BA8;padding:4px 12px;border-radius:20px;font-size:10px;letter-spacing:1px">${t}</span>`).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VANTAGE — Contact Center Command</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07090F;color:#DDE4F0;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
a{color:inherit;text-decoration:none}
::-webkit-scrollbar{height:4px;width:4px}
::-webkit-scrollbar-track{background:#0D1118}
::-webkit-scrollbar-thumb{background:#1C2538;border-radius:4px}
.nav{display:flex;justify-content:space-between;align-items:center;padding:0 40px;height:56px;border-bottom:1px solid #1C2538}
.logo{font-size:14px;font-weight:700;letter-spacing:2px;color:#DDE4F0}
.logo span{color:#3B82F6}
.nav-r{display:flex;align-items:center;gap:20px}
.btn{background:#131A26;border:1px solid #1C2538;color:#7A8BA8;padding:8px 18px;border-radius:6px;font-size:11px;letter-spacing:0.5px;cursor:pointer;font-family:inherit;font-weight:700}
.btn:hover{border-color:#3B82F6;color:#DDE4F0}
.btn-p{background:#0A1330;border:1px solid #3B82F6;color:#3B82F6}
.btn-x{background:#0D0D0D;border:1px solid #333;color:#fff}
.hero{padding:48px 40px 32px;border-bottom:1px solid #1C2538}
.hero-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:40px}
.hero-text h1{font-size:32px;font-weight:700;letter-spacing:-0.5px;line-height:1.15;margin-bottom:10px}
.hero-text p{font-size:14px;color:#7A8BA8;line-height:1.6;max-width:520px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.thumb-row{display:flex;gap:24px;padding:32px 40px;overflow-x:auto;align-items:flex-end}
.section{padding:32px 40px;border-top:1px solid #1C2538}
.section h2{font-size:11px;letter-spacing:1.5px;color:#7A8BA8;margin-bottom:20px;text-transform:uppercase}
.research{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px}
.research-card{background:#0D1118;border:1px solid #1C2538;border-radius:8px;padding:20px}
.research-card h3{font-size:11px;letter-spacing:1px;color:#3B82F6;margin-bottom:12px;text-transform:uppercase}
.research-card p,.research-card li{font-size:12px;color:#7A8BA8;line-height:1.7}
.research-card ul{padding-left:16px}
</style>
</head>
<body>

<nav class="nav">
  <div class="logo">VANTAGE<span> ·</span> Contact Center Command</div>
  <div class="nav-r">
    <button class="btn btn-p" onclick="openInViewer()">Open in Viewer ↗</button>
    <button class="btn" onclick="downloadPen()">Download .pen</button>
    <button class="btn btn-x" onclick="shareOnX()">Share on 𝕏</button>
  </div>
</nav>

<div class="hero">
  <div class="hero-top">
    <div class="hero-text">
      <h1>Contact Center<br>Mission Control</h1>
      <p>Research-first design — studied Talkdesk, Five9, Genesys Cloud, Intercom, and Zendesk before touching a layout. Built from the supervisor's 60-second scan cycle outward: queue depth → longest wait → SLA% → agent states → sentiment alerts.</p>
      <div class="tags">${tagsHTML}</div>
    </div>
  </div>
</div>

<div class="thumb-row">${thumbsHTML}</div>

<div class="section">
  <h2>Design Decisions from Domain Research</h2>
  <div class="research">
    <div class="research-card">
      <h3>Skeleton — Not Nav+List+Card</h3>
      <p>Contact center supervisors don't browse — they monitor. Primary skeleton is a persistent KPI strip (wallboard numerics, zero-click), left sidebar for queue/SLA/alerts, and a live fleet table with inline intervention controls. The "map" equivalent is the agent state distribution strip.</p>
    </div>
    <div class="research-card">
      <h3>SLA 80/20 as Binary, Not Trend</h3>
      <p>The 80/20 rule (answer 80% of calls within 20 seconds) is a pass/fail threshold, not a gradient. The SLA gauge shows a hard threshold marker. Red = breach. There's no "pretty good" — you're either passing or you're not. This shaped the entire KPI strip coloring logic.</p>
    </div>
    <div class="research-card">
      <h3>Agent State Machine in Every Row</h3>
      <p>Each agent is always in one of: Available → Ringing → Connected → ACW → Not Ready → Offline. Monitor/Whisper/Barge controls only appear on Connected rows. Force Ready only appears on long ACW rows. Actions are contextual to state — never a generic action menu.</p>
    </div>
    <div class="research-card">
      <h3>HITL as Urgent Tray, Not a Menu Item</h3>
      <p>When an AI agent requests human authorization (e.g. refund > $500), it surfaces as a time-critical card above the fleet table — with the wait timer and confidence score visible. One tap to authorize. This is not buried in a notification dropdown.</p>
    </div>
    <div class="research-card">
      <h3>AI Agents in the Same Fleet Table</h3>
      <p>Human and AI agents appear in the same fleet table, visually distinguished by an AI badge and indigo accent row. AI-specific columns (confidence score, containment rate) are visible alongside human metrics. The supervisor manages one hybrid fleet, not two separate systems.</p>
    </div>
    <div class="research-card">
      <h3>Wallboard Mode as a Core View</h3>
      <p>Contact centers have shared TV displays for the floor. Wallboard mode isn't a stretch goal — it's a primary view, with giant 42px+ numerics, high contrast, and minimal chrome. Supervisors toggle it to put the floor view on a shared screen without any UI fuss.</p>
    </div>
  </div>
</div>

<script>
const D="${penB64}";
function downloadPen(){
  const a=document.createElement('a');
  a.href='data:application/json;base64,'+D;
  a.download='vantage.pen';
  a.click();
}
function openInViewer(){
  try {
    localStorage.setItem('pv_pending', JSON.stringify({ json: atob(D), name: 'vantage.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  } catch(e){ alert('Error: '+e.message); }
}
function shareOnX(){
  const url=encodeURIComponent(window.location.href);
  const text=encodeURIComponent('VANTAGE — Contact Center Command. Mission control for supervisors managing human + AI agents in real time. 10 screens built from domain research. By RAM Design Studio.');
  window.open('https://twitter.com/intent/tweet?text='+text+'&url='+url,'_blank');
}
</script>
</body>
</html>`;

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
const slugs = ['vantage-cmd', 'vantage-cc1', 'vantage-cc2', 'vantage-cc3', 'vantage-x1'];

function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'VANTAGE — Contact Center Command', html: htmlContent });
    const req = https.request({
      hostname: 'zenbin.org', port: 443, path: `/v1/pages/${slug}`,
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const slug of slugs) {
    const r = await publishPage(slug, html);
    if (r.status === 200 || r.status === 201) {
      console.log(`✓ Published: https://zenbin.org/p/${slug}`);
      return;
    }
    if (r.status !== 409) { console.error(`✗ HTTP ${r.status}: ${r.body.slice(0, 300)}`); break; }
    console.log(`  Slug "${slug}" taken, trying next…`);
  }
})();
