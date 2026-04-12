/**
 * ORBIT — Mission Control for Autonomous Agents
 * RAM Design Heartbeat — 2026-03-23
 *
 * Inspired by:
 * - Linear's ultra-clean dark mode sidebar UI (darkmodedesign.com)
 * - JetBrains Air "Multitask with agents, stay in control" (lapa.ninja)
 * - Paperclip "Open-source orchestration for zero-human companies" (lapa.ninja)
 * - Evervault's customer grid layout (godly.website)
 *
 * Theme: DARK (#0D0D10 near-black, electric indigo accents)
 */

const fs = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0D0D10',
  surface:  '#16161C',
  surface2: '#1E1E28',
  border:   'rgba(138,132,255,0.10)',
  text:     '#EEEAF8',
  textMid:  '#9994BB',
  textDim:  '#5E5A7A',
  accent:   '#7B6EF6',   // electric indigo
  accentLt: '#A99EFA',
  teal:     '#34C8A0',   // success/online
  amber:    '#F5A623',   // warning
  red:      '#E5534B',   // error/offline
  white:    '#FFFFFF',
};

// ── uid helper ─────────────────────────────────────────────────────────────
let _id = 0;
const uid = (prefix = 'el') => `${prefix}_${++_id}`;

// ── Primitive builders ─────────────────────────────────────────────────────
const rect = (props) => ({ id: uid('rect'), type: 'rect', ...props });
const text = (props) => ({ id: uid('text'), type: 'text', ...props });
const frame = (props) => ({ id: uid('frame'), type: 'frame', ...props });
const circle = (props) => ({ id: uid('circ'), type: 'ellipse', ...props });

// ── Tiny helpers ───────────────────────────────────────────────────────────
const mkFrame = (x, y, w, h, fill, clip, children) =>
  frame({ x, y, width: w, height: h, fill: fill ?? 'transparent', clip: clip ?? false, children: children ?? [] });

const mkRect = (x, y, w, h, fill, r) =>
  rect({ x, y, width: w, height: h, fill, cornerRadius: r ?? 0 });

const mkText = (x, y, content, size, color, weight, w, align) =>
  text({ x, y, content, fontSize: size, color, fontWeight: weight ?? 400, width: w ?? 320, textAlign: align ?? 'left' });

// ── Reusable components ────────────────────────────────────────────────────

function statusDot(x, y, color) {
  return circle({ x, y, width: 7, height: 7, fill: color });
}

function chip(x, y, label, fg, bg) {
  const W = label.length * 6.5 + 14;
  return mkFrame(x, y, W, 20, bg, true, [
    mkRect(0, 0, W, 20, bg, 4),
    mkText(7, 3, label, 10, fg, 600, W - 14),
  ]);
}

function card(x, y, w, h, children) {
  return mkFrame(x, y, w, h, P.surface, true, [
    mkRect(0, 0, w, h, P.surface, 10),
    mkRect(0, 0, w, 1, P.border, 0),   // top line
    ...children,
  ]);
}

function divider(x, y, w) {
  return mkRect(x, y, w, 1, P.border, 0);
}

// ── Bottom nav ─────────────────────────────────────────────────────────────
const NAV_ICONS = ['grid', 'activity', 'zap', 'bell', 'settings'];
const NAV_LABELS = ['Control', 'Agents', 'Pipeline', 'Signals', 'Settings'];

function bottomNav(activeIdx) {
  const W = 390;
  const children = [
    mkRect(0, 0, W, 70, P.surface, 0),
    mkRect(0, 0, W, 1, P.border, 0),
  ];
  NAV_LABELS.forEach((label, i) => {
    const cx = 39 + i * 78;
    const isActive = i === activeIdx;
    const fg = isActive ? P.accent : P.textDim;
    // icon circle stub
    children.push(circle({ x: cx - 11, y: 8, width: 22, height: 22, fill: isActive ? 'rgba(123,110,246,0.18)' : 'transparent' }));
    children.push(mkText(cx - 16, 10, isActive ? '●' : '○', 11, fg, 700, 32, 'center'));
    children.push(mkText(cx - 22, 32, label, 9, fg, isActive ? 600 : 400, 44, 'center'));
  });
  return mkFrame(0, 774, W, 70, P.surface, false, children);
}

// ── Status pill row ────────────────────────────────────────────────────────
function statPill(x, y, value, label, accent) {
  return mkFrame(x, y, 108, 58, P.surface2, true, [
    mkRect(0, 0, 108, 58, P.surface2, 8),
    mkRect(0, 0, 108, 2, accent, 0),
    mkText(12, 10, value, 22, accent, 700, 84),
    mkText(12, 36, label, 9, P.textMid, 400, 84),
  ]);
}

// ── Agent list row ─────────────────────────────────────────────────────────
function agentRow(x, y, w, name, model, status, tasks, statusColor) {
  return mkFrame(x, y, w, 56, 'transparent', false, [
    divider(0, 0, w),
    statusDot(0, 24, statusColor),
    mkText(16, 8, name, 13, P.text, 600, 200),
    mkText(16, 28, model, 10, P.textMid, 400, 160),
    mkText(w - 80, 8, tasks + ' tasks', 10, P.textDim, 400, 80, 'right'),
    chip(w - 68, 28, status, statusColor, `${statusColor}22`),
  ]);
}

// ── Progress bar ──────────────────────────────────────────────────────────
function progressBar(x, y, w, label, pct, color) {
  return mkFrame(x, y, w, 36, 'transparent', false, [
    mkText(0, 0, label, 10, P.textMid, 400, w - 50),
    mkText(w - 40, 0, `${pct}%`, 10, color, 600, 40, 'right'),
    mkRect(0, 18, w, 4, P.surface2, 2),
    mkRect(0, 18, Math.round(w * pct / 100), 4, color, 2),
  ]);
}

// ── Timeline event ────────────────────────────────────────────────────────
function timelineEvent(x, y, w, time, title, sub, dotColor) {
  return mkFrame(x, y, w, 52, 'transparent', false, [
    circle({ x: 0, y: 18, width: 8, height: 8, fill: dotColor }),
    mkRect(3, 26, 2, 26, P.border, 0),
    mkText(18, 0, time, 9, P.textDim, 400, 80),
    mkText(18, 14, title, 12, P.text, 500, w - 18),
    mkText(18, 32, sub, 10, P.textMid, 400, w - 18),
  ]);
}

// ── Signal alert row ───────────────────────────────────────────────────────
function signalRow(x, y, w, icon, title, desc, time, severity) {
  const severityColor = severity === 'high' ? P.red : severity === 'med' ? P.amber : P.teal;
  return mkFrame(x, y, w, 70, 'transparent', false, [
    divider(0, 0, w),
    mkRect(0, 10, 3, 50, severityColor, 2),
    mkText(12, 8, icon, 18, severityColor, 400, 26),
    mkText(40, 8, title, 12, P.text, 600, w - 120),
    mkText(40, 28, desc, 10, P.textMid, 400, w - 120),
    mkText(40, 48, time, 9, P.textDim, 400, w - 120),
    chip(w - 58, 12, severity.toUpperCase(), severityColor, `${severityColor}22`),
  ]);
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 1 — COMMAND (Mission Control)
// ══════════════════════════════════════════════════════════════════════
function screenCommand() {
  const W = 390; const H = 844;
  const ch = [
    mkRect(0, 0, W, H, P.bg),
    // subtle glow at top
    mkRect(60, -60, 270, 160, 'rgba(123,110,246,0.06)', 80),

    // Header bar
    mkText(20, 54, 'ORBIT', 18, P.accent, 800, 100),
    mkText(20, 76, 'Mission Control', 11, P.textMid, 400, 160),
    // pulse indicator
    circle({ x: 330, y: 60, width: 10, height: 10, fill: P.teal }),
    mkText(346, 57, 'LIVE', 9, P.teal, 700, 36),

    divider(0, 96, W),

    // Stat pills row
    mkText(20, 110, 'Fleet Status', 11, P.textDim, 600, 200),
    statPill(20, 128, '12', 'AGENTS ONLINE', P.teal),
    statPill(141, 128, '3', 'RUNNING', P.accent),
    statPill(262, 128, '1', 'ALERTS', P.amber),

    divider(0, 200, W),

    // Active runs section
    mkText(20, 212, 'Active Runs', 13, P.text, 700, 200),
    chip(210, 210, '3 live', P.accent, 'rgba(123,110,246,0.14)'),

    // Run cards
    ...runCard(20, 238, 350, 'ORB-0144', 'Competitive pricing analysis', '4 agents', 78, P.accent),
    ...runCard(20, 316, 350, 'ORB-0143', 'Customer churn prediction model', '6 agents', 42, P.accentLt),
    ...runCard(20, 394, 350, 'ORB-0142', 'API latency regression suite', '2 agents', 95, P.teal),

    divider(0, 472, W),

    // Recent completed
    mkText(20, 484, 'Completed Today', 13, P.text, 700, 200),
    mkText(300, 484, 'See all →', 10, P.accentLt, 400, 72),

    ...compactRow(20, 510, 350, '✓', 'ORB-0141 — Legal clause scan', '2m 18s · 8 agents', P.teal),
    ...compactRow(20, 548, 350, '✓', 'ORB-0140 — PR draft × 5 variants', '4m 03s · 5 agents', P.teal),
    ...compactRow(20, 586, 350, '!', 'ORB-0139 — Data ingestion pipeline', 'FAILED · 1 error', P.red),
    ...compactRow(20, 624, 350, '✓', 'ORB-0138 — Sentiment analysis batch', '1m 44s · 3 agents', P.teal),

    divider(0, 670, W),

    // Throughput sparkline label
    mkText(20, 682, 'Throughput · 24h', 11, P.textDim, 600, 200),
    mkText(300, 682, '+18%', 11, P.teal, 700, 60),
    ...sparkline(20, 700, 350, 50),

    bottomNav(0),
  ];
  return mkFrame(0, 0, W, H, P.bg, true, ch);
}

function runCard(x, y, w, id, title, agents, pct, color) {
  return [
    mkFrame(x, y, w, 66, P.surface, true, [
      mkRect(0, 0, w, 66, P.surface, 8),
      mkRect(0, 0, 3, 66, color, 2),
      mkText(12, 8, id, 9, P.textDim, 600, 80),
      chip(w - 80, 8, `${pct}%`, color, `${color}22`),
      mkText(12, 26, title, 12, P.text, 600, w - 100),
      mkText(12, 46, agents + ' · running', 10, P.textMid, 400, 140),
      mkRect(12, 44, (w - 24) * pct / 100, 3, color, 2),
      mkRect(12, 44, w - 24, 3, 'rgba(255,255,255,0.06)', 2),
    ]),
  ];
}

function compactRow(x, y, w, icon, title, sub, iconColor) {
  return [
    mkFrame(x, y, w, 32, 'transparent', false, [
      divider(0, 0, w),
      mkText(0, 8, icon, 11, iconColor, 700, 14),
      mkText(18, 6, title, 11, P.text, 400, w - 120),
      mkText(18, 20, sub, 9, P.textDim, 400, w - 120),
    ]),
  ];
}

function sparkline(x, y, w, h) {
  const pts = [0.3, 0.5, 0.45, 0.7, 0.6, 0.8, 0.75, 0.9, 0.7, 0.85, 1.0, 0.88, 0.92];
  const children = [];
  const step = w / (pts.length - 1);
  pts.forEach((v, i) => {
    const bx = x + i * step;
    const bh = Math.round(h * v);
    const by = y + h - bh;
    children.push(mkRect(Math.round(bx), by, Math.max(1, Math.round(step - 2)), bh, `rgba(123,110,246,${0.3 + v * 0.4})`, 1));
  });
  return children;
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 2 — AGENTS (Fleet)
// ══════════════════════════════════════════════════════════════════════
function screenAgents() {
  const W = 390; const H = 844;
  const ch = [
    mkRect(0, 0, W, H, P.bg),
    mkRect(60, -40, 270, 130, 'rgba(52,200,160,0.05)', 80),

    mkText(20, 54, 'Agents', 22, P.text, 700, 200),
    mkText(20, 82, '12 online · 3 standby · 1 error', 11, P.textMid, 400, 300),
    chip(300, 56, '+ Deploy', P.accent, 'rgba(123,110,246,0.18)'),

    divider(0, 104, W),

    // Filter chips
    mkText(20, 114, 'All', 11, P.text, 600, 30),
    divider(0, 128, 30),
    mkRect(0, 129, 30, 2, P.accent, 0),
    mkText(60, 114, 'Running', 11, P.textDim, 400, 60),
    mkText(132, 114, 'Standby', 11, P.textDim, 400, 60),
    mkText(204, 114, 'Error', 11, P.textDim, 400, 40),

    divider(0, 136, W),

    // Agent rows
    agentRow(20, 148, 350, 'Aria-7', 'GPT-4o · Research', 'RUNNING', 28, P.teal),
    agentRow(20, 204, 350, 'Bolt-3', 'Claude-3.7 · Analysis', 'RUNNING', 41, P.teal),
    agentRow(20, 260, 350, 'Core-9', 'Gemini 2.0 · Synthesis', 'RUNNING', 17, P.teal),
    agentRow(20, 316, 350, 'Dusk-2', 'GPT-4o · Drafting', 'STANDBY', 0, P.textDim),
    agentRow(20, 372, 350, 'Echo-5', 'Claude-3.7 · Review', 'STANDBY', 0, P.textDim),
    agentRow(20, 428, 350, 'Flux-1', 'GPT-4o-mini · Routing', 'ERROR', 3, P.red),
    agentRow(20, 484, 350, 'Grid-4', 'Claude-3.5 · Monitor', 'STANDBY', 0, P.textDim),
    agentRow(20, 540, 350, 'Halo-6', 'Gemini 2.5 · Planning', 'RUNNING', 9, P.teal),
    agentRow(20, 596, 350, 'Iris-8', 'GPT-4o · Code', 'STANDBY', 0, P.textDim),
    agentRow(20, 652, 350, 'Jett-2', 'Claude-3.7 · Extract', 'RUNNING', 22, P.teal),

    divider(0, 710, W),
    mkText(20, 720, 'Showing 10 of 16 agents', 10, P.textDim, 400, 200),
    mkText(300, 720, 'Show all →', 10, P.accentLt, 400, 72),

    bottomNav(1),
  ];
  return mkFrame(0, 0, W, H, P.bg, true, ch);
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 3 — RUN DETAIL (Agent drill-down)
// ══════════════════════════════════════════════════════════════════════
function screenRunDetail() {
  const W = 390; const H = 844;
  const ch = [
    mkRect(0, 0, W, H, P.bg),
    mkRect(40, -30, 310, 150, 'rgba(123,110,246,0.07)', 80),

    // Back + title
    mkText(20, 52, '← ORB-0144', 11, P.accentLt, 400, 200),
    mkText(20, 72, 'Pricing Analysis', 20, P.text, 700, 280),
    mkText(20, 98, 'Started 4m 22s ago · 4 agents · GPT-4o', 10, P.textMid, 400, 300),
    chip(300, 72, '78%', P.accent, 'rgba(123,110,246,0.18)'),

    divider(0, 116, W),

    // Overall progress
    mkText(20, 128, 'Overall Progress', 11, P.textDim, 600, 200),
    mkRect(20, 146, 350, 8, P.surface2, 4),
    mkRect(20, 146, 273, 8, P.accent, 4),
    mkText(286, 140, '78%', 11, P.accentLt, 700, 60),

    divider(0, 166, W),

    // Per-agent progress
    mkText(20, 178, 'Agent Breakdown', 13, P.text, 700, 200),
    progressBar(20, 204, 350, 'Aria-7  ·  Salesforce pricing', 92, P.teal),
    progressBar(20, 250, 350, 'Bolt-3  ·  HubSpot & Intercom pricing', 81, P.accent),
    progressBar(20, 296, 350, 'Core-9  ·  Zendesk vs Freshdesk', 71, P.accentLt),
    progressBar(20, 342, 350, 'Dusk-2  ·  Linear vs Shortcut', 68, P.amber),

    divider(0, 392, W),

    // Timeline
    mkText(20, 404, 'Run Timeline', 13, P.text, 700, 200),
    timelineEvent(20, 430, 330, '4m 22s', 'Run initialized', 'Provisioned 4 agents from pool', P.accent),
    timelineEvent(20, 482, 330, '4m 18s', 'Context injected', 'Task brief + web search enabled', P.accentLt),
    timelineEvent(20, 534, 330, '3m 41s', 'Aria-7 milestone', 'Salesforce plan grid extracted · 14 rows', P.teal),
    timelineEvent(20, 586, 330, '2m 09s', 'Bolt-3 milestone', 'HubSpot pricing ingested · 3 tiers', P.teal),
    timelineEvent(20, 638, 330, 'now', 'Core-9 + Dusk-2', 'Final comparison synthesis in progress…', P.amber),

    divider(0, 698, W),
    mkText(20, 710, 'Est. completion: ~38s', 11, P.textMid, 400, 200),
    chip(260, 706, '⏸ Pause', P.textMid, P.surface2),
    chip(316, 706, '✕ Cancel', P.red, 'rgba(229,83,75,0.14)'),

    bottomNav(2),
  ];
  return mkFrame(0, 0, W, H, P.bg, true, ch);
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 4 — PIPELINE (Queue)
// ══════════════════════════════════════════════════════════════════════
function screenPipeline() {
  const W = 390; const H = 844;
  const ch = [
    mkRect(0, 0, W, H, P.bg),
    mkRect(80, -50, 230, 130, 'rgba(245,166,35,0.05)', 80),

    mkText(20, 54, 'Pipeline', 22, P.text, 700, 200),
    mkText(20, 82, '3 running · 5 queued · 2 paused', 11, P.textMid, 400, 280),

    divider(0, 104, W),

    // RUNNING section
    mkText(20, 116, 'RUNNING', 9, P.teal, 700, 100),
    circle({ x: 94, y: 122, width: 6, height: 6, fill: P.teal }),
    ...pipelineItem(20, 134, 350, 'ORB-0144', 'Competitive pricing analysis', '4 agents · 78%', P.teal, true),
    ...pipelineItem(20, 194, 350, 'ORB-0143', 'Customer churn prediction', '6 agents · 42%', P.accent, true),
    ...pipelineItem(20, 254, 350, 'ORB-0142', 'API latency regression', '2 agents · 95%', P.accentLt, true),

    divider(0, 316, W),

    // QUEUED section
    mkText(20, 328, 'QUEUED', 9, P.amber, 700, 100),
    mkText(92, 328, '5', 9, P.amber, 700, 16),
    ...pipelineItem(20, 346, 350, 'ORB-0145', 'Earnings call transcript parse', '8 agents · est 3m', P.textMid, false),
    ...pipelineItem(20, 406, 350, 'ORB-0146', 'Support ticket categorisation', '3 agents · est 1m', P.textMid, false),
    ...pipelineItem(20, 466, 350, 'ORB-0147', 'SEO gap analysis · 200 pages', '5 agents · est 7m', P.textMid, false),
    ...pipelineItem(20, 526, 350, 'ORB-0148', 'Contract redline v3', '2 agents · est 2m', P.textMid, false),

    divider(0, 590, W),

    // PAUSED section
    mkText(20, 602, 'PAUSED', 9, P.textDim, 700, 100),
    ...pipelineItem(20, 620, 350, 'ORB-0139', 'Data ingestion — Error state', '⚠ Waiting on review', P.red, false),
    ...pipelineItem(20, 680, 350, 'ORB-0136', 'Brand audit — on hold', '2 agents · manual hold', P.textDim, false),

    divider(0, 742, W),
    mkText(20, 754, '+ New run', 11, P.accent, 600, 80),

    bottomNav(2),
  ];
  return mkFrame(0, 0, W, H, P.bg, true, ch);
}

function pipelineItem(x, y, w, id, title, detail, color, active) {
  return [
    mkFrame(x, y, w, 52, 'transparent', false, [
      mkRect(0, 4, w, 44, active ? 'rgba(255,255,255,0.03)' : 'transparent', 6),
      mkRect(0, 4, 2, 44, color, 2),
      mkText(12, 8, id, 9, P.textDim, 600, 80),
      mkText(12, 24, title, 12, P.text, 500, w - 80),
      mkText(12, 40, detail, 9, P.textMid, 400, w - 80),
      active ? chip(w - 62, 14, 'LIVE', color, `${color}22`) : mkText(0, 0, '', 1, 'transparent', 400, 1),
    ]),
  ];
}

// ══════════════════════════════════════════════════════════════════════
//  SCREEN 5 — SIGNALS (Alerts & Anomalies)
// ══════════════════════════════════════════════════════════════════════
function screenSignals() {
  const W = 390; const H = 844;
  const ch = [
    mkRect(0, 0, W, H, P.bg),
    mkRect(60, -30, 270, 120, 'rgba(229,83,75,0.06)', 80),

    mkText(20, 54, 'Signals', 22, P.text, 700, 200),
    mkText(20, 82, '1 critical · 3 warnings · 12 info', 11, P.textMid, 400, 280),
    chip(280, 56, 'Mark all read', P.textMid, P.surface2),

    divider(0, 104, W),

    // Alerts
    signalRow(20, 112, 350, '⚠', 'Flux-1 crashed', 'Max retries exceeded on routing task ORB-0139. Agent removed from pool.', '9m ago', 'high'),
    signalRow(20, 182, 350, '◎', 'Token budget 80%', 'ORB-0143 consumed 80% of allocated token budget. Reduce scope or increase limit.', '22m ago', 'med'),
    signalRow(20, 252, 350, '◎', 'Run timeout approaching', 'ORB-0142 approaching 10m wall clock limit. Est. completion in 38s.', '2m ago', 'med'),
    signalRow(20, 322, 350, '◎', 'New agent deployed', 'Jett-2 (Claude-3.7 Extract) added to fleet by rakis@hyperio.', '1h ago', 'med'),
    signalRow(20, 392, 350, '●', 'Throughput spike +18%', 'Throughput over last 2h is up 18% above 7-day baseline. All systems nominal.', '2h ago', 'low'),
    signalRow(20, 462, 350, '●', 'Daily digest ready', 'Summary of 41 completed runs. Avg duration 2m 31s. 97.6% success rate.', '6h ago', 'low'),
    signalRow(20, 532, 350, '●', 'Scheduled run queued', 'Weekly SEO gap analysis (ORB-0147) auto-queued by cron schedule.', '8h ago', 'low'),
    signalRow(20, 602, 350, '●', 'Cost report', 'Yesterday total: $4.18 across 38 runs. Within budget.', '1d ago', 'low'),

    divider(0, 680, W),
    mkText(20, 692, 'Signal filters', 11, P.textDim, 400, 100),
    chip(120, 690, 'All', P.accent, 'rgba(123,110,246,0.18)'),
    chip(160, 690, 'Critical', P.red, 'rgba(229,83,75,0.14)'),
    chip(214, 690, 'Warning', P.amber, 'rgba(245,166,35,0.14)'),
    chip(272, 690, 'Info', P.textMid, P.surface2),

    divider(0, 716, W),

    bottomNav(3),
  ];
  return mkFrame(0, 0, W, H, P.bg, true, ch);
}

// ══════════════════════════════════════════════════════════════════════
//  ASSEMBLE PEN
// ══════════════════════════════════════════════════════════════════════
function buildPen() {
  const screens = [
    screenCommand(),
    screenAgents(),
    screenRunDetail(),
    screenPipeline(),
    screenSignals(),
  ];

  const pen = {
    version: '2.8',
    name: 'ORBIT — Mission Control for Autonomous Agents',
    description: 'Dark mode AI agent ops dashboard. Inspired by Linear\'s UI + JetBrains Air / Paperclip agent orchestration trend.',
    screens: screens.map((s, i) => ({
      ...s,
      name: ['Command', 'Agents', 'Run Detail', 'Pipeline', 'Signals'][i],
    })),
    palette: P,
    meta: {
      created: new Date().toISOString(),
      author: 'RAM Design Heartbeat',
      theme: 'dark',
      sources: ['darkmodedesign.com (Linear)', 'lapa.ninja (JetBrains Air, Paperclip)', 'godly.website (Evervault)'],
    },
  };

  return pen;
}

// ── Write ──────────────────────────────────────────────────────────────────
const pen = buildPen();
const outPath = path.join(__dirname, 'orbit.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ orbit.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
pen.screens.forEach(s => console.log(`  · ${s.name}`));
