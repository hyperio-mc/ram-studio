'use strict';
// lane-app.js
// LANE — AI Workflow Builder & Run Scheduler (Light Theme)
//
// Challenge: Design a warm-light AI pipeline orchestration tool — teams define
// "lanes" (reusable agent workflows), schedule runs, and track health across
// all their AI products.
//
// Inspired by:
// 1. Land-book.com — LangChain "Observe, Evaluate, and Deploy Reliable AI Agents"
//    + Runlayer "Enterprise MCPs, Skills & Agents" — a gap exists between raw
//    LLM APIs and production orchestration; LANE fills that gap visually.
//    Also Sanity "The Content Operating System for the AI era" — the word
//    "operating system" planted the idea of a workflow-first approach to AI.
//
// 2. Awwwards.com — warm orange #FA5D29 accent system, Inter Tight typography,
//    generous gutters, rounded-corner-as-default card pattern, container query
//    responsiveness. Adapted: cooled orange to #C94A14 for light-BG legibility.
//
// 3. Minimal.gallery — editorial black/white restraint applied as off-white
//    ground (#F4F2ED), letting data surfaces float with depth, not decoration.
//
// Design decisions:
//  · Off-white ground #F4F2ED (warm paper) — matches the Minimal.gallery ethos
//    of "quality paper, not clinical lab." Cards use true white so they lift.
//  · Single accent #C94A14 (burnt sienna / cooled Awwwards orange) — does ALL
//    heavy lifting: active nav, run-in-progress, primary CTA, pipeline nodes.
//  · Pipeline Builder screen uses proportional node widths and connecting lines
//    to mimic a real DAG without SVG — each step is a white card on the warm
//    background with left-border accent; connectors are 1px dividers.
//
// 5 screens: Lanes · Builder · Runs · Analytics · Team

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4F2ED',
  surface:  '#FFFFFF',
  surface2: '#FAFAF7',
  border:   '#E6E2D8',
  border2:  '#D4CFCA',
  text:     '#1B1916',
  textDim:  '#504D48',
  muted:    '#9A9690',
  accent:   '#C94A14',   // burnt sienna — cooled from Awwwards #FA5D29
  accent2:  '#1E40AF',   // deep cobalt — secondary / informational
  green:    '#166534',   // forest green — success
  greenBg:  '#DCFCE7',
  red:      '#B91C1C',   // deep red — error
  redBg:    '#FEE2E2',
  amber:    '#92400E',   // amber — warning
  amberBg:  '#FEF3C7',
  purple:   '#6D28D9',   // violet — AI model
  purpleBg: '#EDE9FE',
  divider:  '#EAE7E0',
};

let _id = 0;
const uid = () => `l${++_id}`;

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
  fill: opts.fill || P.text,
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

const Line = (x, y, w, fill = P.divider) => F(x, y, w, 1, fill, {});
const Dot  = (x, y, color, r = 5) => E(x, y, r, r, color);

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = (x, y, w, h, opts = {}) => F(x, y, w, h, P.surface, {
  r: opts.r !== undefined ? opts.r : 14,
  stroke: opts.stroke || P.border,
  sw: 1,
  ch: opts.ch || [],
});

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, bg, opts = {}) => {
  const w = opts.w || Math.max(label.length * 6.4 + 18, 44);
  return F(x, y, w, 20, bg || color + '18', {
    r: 10,
    stroke: color + '35',
    sw: 1,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.5, align: 'center' })],
  });
};

// ── Progress bar ─────────────────────────────────────────────────────────────
const Bar = (x, y, w, pct, color, trackColor = P.border) => [
  F(x, y, w, 5, trackColor, { r: 3 }),
  F(x, y, Math.max(3, Math.round(w * Math.min(pct, 1))), 5, color, { r: 3 }),
];

// ── Sparkline ─────────────────────────────────────────────────────────────────
const Spark = (x, y, w, h, bars, color) => {
  const n = bars.length;
  const bw = Math.floor((w - (n - 1) * 2) / n);
  const max = Math.max(...bars);
  return bars.map((v, i) => {
    const bh = Math.max(2, Math.round((v / max) * h));
    return F(x + i * (bw + 2), y + (h - bh), bw, bh, color, { r: 1 });
  });
};

// ── Run status badge with semantic color ──────────────────────────────────────
const statusPill = (x, y, st) => {
  const map = {
    SUCCESS: [P.green, P.greenBg],
    RUNNING: [P.accent, P.accent + '18'],
    ERROR:   [P.red,   P.redBg],
    QUEUED:  [P.muted, P.border],
    PARTIAL: [P.amber, P.amberBg],
  };
  const [c, bg] = map[st] || [P.muted, P.border];
  return Pill(x, y, st, c, bg);
};

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => {
  const items = [['⊞','LANES'],['⋮','BUILD'],['◎','RUNS'],['◑','ANALYTICS'],['✦','TEAM']];
  return F(0, 764, 390, 80, P.surface, {
    stroke: P.divider, sw: 1,
    ch: [
      Line(0, 0, 390),
      ...items.map(([ic, lb], i) => {
        const a = i === activeIdx;
        const nx = i * 78;
        return [
          a ? F(nx + 22, 6, 34, 32, P.accent + '14', { r: 10 }) : null,
          T(ic, nx + 8, 8, 62, 22, { size: 17, fill: a ? P.accent : P.muted, align: 'center' }),
          T(lb, nx, 34, 78, 11, { size: 7, fill: a ? P.accent : P.muted, align: 'center', weight: a ? 700 : 400, ls: 0.5 }),
        ].filter(Boolean);
      }).flat(),
    ],
  });
};

// ── SCREEN 1: LANES ──────────────────────────────────────────────────────────
function screenLanes(ox) {
  const lanes = [
    {
      name: 'content-writer',
      desc: 'Research → outline → draft → review',
      status: 'RUNNING',
      runs: 342,
      successRate: 97,
      lastRun: '2m ago',
      steps: 4,
      sparkData: [88,90,94,93,97,95,97,97],
      model: 'claude-3.5',
    },
    {
      name: 'lead-classifier',
      desc: 'Parse CRM data → classify → tag',
      status: 'SUCCESS',
      runs: 1204,
      successRate: 99,
      lastRun: '12m ago',
      steps: 3,
      sparkData: [95,97,98,99,99,98,99,99],
      model: 'gpt-4o-mini',
    },
    {
      name: 'doc-ingestion',
      desc: 'Chunk → embed → validate → index',
      status: 'ERROR',
      runs: 78,
      successRate: 81,
      lastRun: '28m ago',
      steps: 4,
      sparkData: [92,89,85,83,87,80,78,81],
      model: 'text-embed-3',
    },
    {
      name: 'support-triage',
      desc: 'Classify ticket → route → draft reply',
      status: 'QUEUED',
      runs: 561,
      successRate: 94,
      lastRun: '1h ago',
      steps: 3,
      sparkData: [90,92,91,93,94,94,93,94],
      model: 'gpt-4o',
    },
  ];

  const statusColors = { RUNNING: P.accent, SUCCESS: P.green, ERROR: P.red, QUEUED: P.muted };

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [

      // Header
      F(0, 0, 390, 52, P.surface, {
        stroke: P.divider, sw: 1, r: 0,
        ch: [
          T('LANE', 20, 14, 70, 24, { size: 16, weight: 900, fill: P.text, ls: 1.2 }),
          T('·', 70, 14, 16, 24, { size: 16, fill: P.accent, align: 'center' }),
          T('4 lanes · 2 running', 84, 18, 180, 16, { size: 11, fill: P.muted }),
          Pill(288, 16, '+ NEW', P.accent, P.accent + '18', { w: 58 }),
        ],
      }),

      // Summary row
      Card(16, 64, 106, 66, {
        ch: [
          T('TOTAL RUNS', 10, 10, 86, 9, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
          T('2.2K', 10, 24, 86, 28, { size: 24, weight: 800, fill: P.text }),
          T('this month', 10, 54, 86, 10, { size: 8, fill: P.muted }),
        ],
      }),
      Card(132, 64, 106, 66, {
        ch: [
          T('AVG SUCCESS', 10, 10, 86, 9, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
          T('93%', 10, 24, 86, 28, { size: 24, weight: 800, fill: P.green }),
          T('+2% vs last month', 10, 54, 86, 10, { size: 8, fill: P.green }),
        ],
      }),
      Card(248, 64, 126, 66, {
        ch: [
          T('ACTIVE LANES', 10, 10, 106, 9, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
          T('4', 10, 24, 40, 28, { size: 24, weight: 800, fill: P.text }),
          T('2 running now', 10, 54, 106, 10, { size: 8, fill: P.accent }),
        ],
      }),

      // Lanes list
      T('YOUR LANES', 16, 146, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      ...lanes.map((lane, i) => {
        const col = statusColors[lane.status];
        return Card(16, 164 + i * 138, 358, 124, {
          r: 14,
          stroke: lane.status === 'ERROR' ? P.red + '40' : lane.status === 'RUNNING' ? P.accent + '30' : P.border,
          ch: [
            // top accent bar
            F(0, 0, 358, 3, col + '70', { r: 2 }),
            // lane name + status
            T(lane.name, 14, 14, 230, 18, { size: 14, weight: 700, fill: P.text }),
            statusPill(276, 12, lane.status),
            // description
            T(lane.desc, 14, 36, 260, 14, { size: 10.5, fill: P.textDim }),
            // model pill
            Pill(14, 54, lane.model, P.purple, P.purpleBg, { w: lane.model.length * 6.2 + 16 }),
            T(lane.steps + ' steps', 14 + lane.model.length * 6.2 + 26, 56, 80, 12, { size: 9.5, fill: P.muted }),
            // sparkline
            ...Spark(220, 54, 124, 28, lane.sparkData, col + '80'),
            // bottom stats
            Line(14, 86, 330),
            T(lane.runs.toLocaleString() + ' runs', 14, 96, 100, 14, { size: 10, fill: P.textDim }),
            T(lane.successRate + '% success', 120, 96, 110, 14, { size: 10, fill: col, weight: 600 }),
            T('Last: ' + lane.lastRun, 248, 96, 100, 14, { size: 10, fill: P.muted, align: 'right' }),
          ],
        });
      }),

      NavBar(0),
    ],
  });
}

// ── SCREEN 2: BUILDER ────────────────────────────────────────────────────────
function screenBuilder(ox) {
  // Visual pipeline builder for "content-writer" lane
  const steps = [
    { id: 'S1', label: 'research',     type: 'LLM',    model: 'claude-3.5', inputs: ['topic', 'context'],       out: 'research_notes' },
    { id: 'S2', label: 'outline',      type: 'LLM',    model: 'claude-3.5', inputs: ['research_notes'],          out: 'outline'        },
    { id: 'S3', label: 'draft',        type: 'LLM',    model: 'claude-3.5', inputs: ['outline', 'style_guide'],  out: 'draft_html'     },
    { id: 'S4', label: 'quality-check',type: 'TOOL',   model: null,         inputs: ['draft_html'],              out: 'report'         },
  ];

  const typeColor = { LLM: P.purple, TOOL: P.accent2, OUTPUT: P.green };

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [

      // Header
      F(0, 0, 390, 52, P.surface, {
        stroke: P.divider, sw: 1, r: 0,
        ch: [
          T('← Lanes', 14, 15, 70, 22, { size: 11, fill: P.accent, weight: 600 }),
          T('content-writer', 86, 15, 200, 22, { size: 13, weight: 700, fill: P.text }),
          Pill(292, 16, 'DRAFT', P.amber, P.amberBg, { w: 50 }),
        ],
      }),

      // Lane metadata card
      Card(16, 64, 358, 56, {
        r: 12,
        ch: [
          T('content-writer', 14, 10, 200, 16, { size: 13, weight: 700, fill: P.text }),
          T('Research → outline → draft → review', 14, 30, 290, 13, { size: 10, fill: P.muted }),
          Pill(280, 10, '4 STEPS', P.accent, P.accent + '18', { w: 58 }),
        ],
      }),

      // Pipeline visual
      T('PIPELINE STEPS', 16, 134, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),

      ...steps.map((s, i) => {
        const stepY = 152 + i * 128;
        const col = typeColor[s.type] || P.muted;

        return [
          // Step card
          Card(16, stepY, 358, 108, {
            r: 14,
            stroke: P.border,
            ch: [
              // left accent border
              F(0, 0, 4, 108, col, { r: 2 }),
              // step number badge
              F(14, 12, 24, 24, col + '18', {
                r: 12,
                ch: [T(s.id, 0, 4, 24, 16, { size: 10, fill: col, weight: 800, align: 'center' })],
              }),
              // label
              T(s.label, 46, 14, 200, 18, { size: 14, weight: 700, fill: P.text }),
              Pill(278, 12, s.type, col, col + '15', { w: 52 }),
              // model
              s.model ? Pill(46, 36, s.model, P.purple, P.purpleBg, { w: s.model.length * 6.4 + 14 }) : null,
              // inputs row
              T('IN', 14, 58, 24, 12, { size: 8, fill: P.muted, weight: 700, ls: 0.8 }),
              ...s.inputs.map((inp, j) =>
                F(40 + j * (inp.length * 6.2 + 24), 54, inp.length * 6.2 + 20, 20, P.surface2, {
                  r: 6, stroke: P.border, sw: 1,
                  ch: [T(inp, 6, 4, inp.length * 6.2 + 8, 12, { size: 8.5, fill: P.textDim })],
                })
              ),
              // output row
              T('OUT', 14, 82, 30, 12, { size: 8, fill: P.muted, weight: 700, ls: 0.8 }),
              F(46, 78, s.out.length * 6.2 + 20, 20, col + '12', {
                r: 6, stroke: col + '40', sw: 1,
                ch: [T(s.out, 6, 4, s.out.length * 6.2 + 10, 12, { size: 8.5, fill: col, weight: 500 })],
              }),
            ].filter(Boolean),
          }),
          // Connector arrow (not on last step)
          i < steps.length - 1
            ? F(16 + 358/2 - 1, stepY + 108, 2, 20, P.border2, {})
            : null,
          i < steps.length - 1
            ? T('↓', 16 + 358/2 - 7, stepY + 110, 14, 14, { size: 11, fill: P.muted, align: 'center' })
            : null,
        ].filter(Boolean);
      }).flat(),

      NavBar(1),
    ],
  });
}

// ── SCREEN 3: RUNS ───────────────────────────────────────────────────────────
function screenRuns(ox) {
  const runs = [
    { id: 'run_f9a2',  lane: 'content-writer',  status: 'RUNNING', dur: '3.2s+', tokens: '6.1K', ts: 'now',     model: 'claude-3.5' },
    { id: 'run_e8b1',  lane: 'lead-classifier', status: 'SUCCESS', dur: '0.4s',  tokens: '820',  ts: '4m ago',  model: 'gpt-4o-mini' },
    { id: 'run_d7c0',  lane: 'lead-classifier', status: 'SUCCESS', dur: '0.5s',  tokens: '790',  ts: '4m ago',  model: 'gpt-4o-mini' },
    { id: 'run_c6d9',  lane: 'doc-ingestion',   status: 'ERROR',   dur: '1.1s',  tokens: '2.4K', ts: '28m ago', model: 'text-embed-3' },
    { id: 'run_b5e8',  lane: 'content-writer',  status: 'SUCCESS', dur: '8.7s',  tokens: '9.2K', ts: '35m ago', model: 'claude-3.5' },
    { id: 'run_a4f7',  lane: 'support-triage',  status: 'QUEUED',  dur: '—',     tokens: '—',    ts: 'queued',  model: 'gpt-4o' },
    { id: 'run_997e',  lane: 'lead-classifier', status: 'SUCCESS', dur: '0.3s',  tokens: '640',  ts: '1h ago',  model: 'gpt-4o-mini' },
  ];

  const sparkData = [6,4,9,7,12,8,15,11,9,14,10,13,16,12];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [

      // Header
      F(0, 0, 390, 52, P.surface, {
        stroke: P.divider, sw: 1, r: 0,
        ch: [
          T('LANE', 20, 14, 60, 24, { size: 16, weight: 900, fill: P.text, ls: 1.2 }),
          T('Run Log', 82, 17, 140, 18, { size: 13, fill: P.muted }),
          Pill(284, 16, '● LIVE', P.accent, P.accent + '15', { w: 58 }),
        ],
      }),

      // Throughput mini chart
      Card(16, 64, 358, 60, {
        ch: [
          T('RUNS / HOUR', 14, 10, 120, 9, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
          T('16', 14, 24, 50, 26, { size: 22, weight: 800, fill: P.text }),
          T('this hour', 50, 30, 80, 14, { size: 9, fill: P.muted }),
          ...Spark(170, 10, 170, 42, sparkData, P.accent + '90'),
        ],
      }),

      // Filter pills
      T('FILTER', 16, 138, 60, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      Pill(80, 134, 'ALL', P.accent, P.accent + '18', { w: 36 }),
      Pill(122, 134, 'RUNNING', P.muted, P.border, { w: 62 }),
      Pill(190, 134, 'ERROR', P.muted, P.border, { w: 48 }),

      // Run rows
      T('RECENT', 16, 164, 100, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      ...runs.map((run, i) => {
        const statusCol = { RUNNING: P.accent, SUCCESS: P.green, ERROR: P.red, QUEUED: P.muted }[run.status];
        return Card(16, 182 + i * 78, 358, 68, {
          r: 12,
          stroke: run.status === 'RUNNING' ? P.accent + '40' : run.status === 'ERROR' ? P.red + '30' : P.border,
          ch: [
            F(0, 0, 4, 68, statusCol + (run.status === 'SUCCESS' ? '60' : '99'), { r: 2 }),
            T(run.lane, 14, 8, 210, 16, { size: 12, fill: P.text, weight: 600 }),
            statusPill(270, 7, run.status),
            T(run.id, 14, 28, 150, 13, { size: 9, fill: P.muted }),
            T(run.ts, 282, 28, 72, 13, { size: 9, fill: P.muted, align: 'right' }),
            T('⏱ ' + run.dur, 14, 46, 80, 13, { size: 9.5, fill: P.textDim }),
            T('◑ ' + run.tokens, 100, 46, 80, 13, { size: 9.5, fill: statusCol }),
            Pill(232, 42, run.model, P.purple, P.purpleBg, { w: run.model.length * 5.8 + 14 }),
          ],
        });
      }),

      NavBar(2),
    ],
  });
}

// ── SCREEN 4: ANALYTICS ──────────────────────────────────────────────────────
function screenAnalytics(ox) {
  const weekBars = [72, 84, 91, 89, 95, 88, 93];  // success rate
  const costBars = [8.4, 11.2, 9.8, 14.6, 12.1, 16.8, 18.2];
  const days     = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const topLanes = [
    { name: 'lead-classifier', calls: 892,  cost: '$6.40',  rate: 99, color: P.green },
    { name: 'content-writer',  calls: 342,  cost: '$48.20', rate: 97, color: P.accent },
    { name: 'support-triage',  calls: 561,  cost: '$18.60', rate: 94, color: P.accent2 },
    { name: 'doc-ingestion',   calls: 78,   cost: '$3.95',  rate: 81, color: P.red },
  ];

  const BAR_AREA_W = 310;

  const renderBarGroup = (x, y, w, h, bars, color, labels) => {
    const n = bars.length;
    const bw = Math.floor((BAR_AREA_W - (n - 1) * 6) / n);
    const max = Math.max(...bars);
    return [
      ...bars.map((v, i) => {
        const bh = Math.max(3, Math.round((v / max) * h));
        return F(x + i * (bw + 6), y + (h - bh), bw, bh, color, { r: 3 });
      }),
      ...(labels ? labels.map((lb, i) =>
        T(lb, x + i * (bw + 6), y + h + 4, bw, 12, { size: 8, fill: P.muted, align: 'center' })
      ) : []),
    ];
  };

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [

      // Header
      F(0, 0, 390, 52, P.surface, {
        stroke: P.divider, sw: 1, r: 0,
        ch: [
          T('LANE', 20, 14, 60, 24, { size: 16, weight: 900, fill: P.text, ls: 1.2 }),
          T('Analytics', 82, 17, 140, 18, { size: 13, fill: P.muted }),
          T('Last 7 days', 260, 20, 110, 14, { size: 10, fill: P.muted, align: 'right' }),
        ],
      }),

      // Hero stat row
      Card(16, 64, 168, 68, {
        ch: [
          T('SUCCESS RATE', 12, 10, 144, 9, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
          T('93.4%', 12, 26, 130, 30, { size: 26, weight: 800, fill: P.green }),
          T('+2.1% vs prior week', 12, 58, 144, 10, { size: 8.5, fill: P.green }),
        ],
      }),
      Card(202, 64, 172, 68, {
        ch: [
          T('TOTAL COST', 12, 10, 148, 9, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
          T('$91.15', 12, 26, 130, 30, { size: 26, weight: 800, fill: P.text }),
          T('+$18 vs prior week', 12, 58, 148, 10, { size: 8.5, fill: P.amber }),
        ],
      }),

      // Success rate chart
      T('SUCCESS RATE — DAILY', 16, 146, 250, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      Card(16, 164, 358, 100, {
        ch: [
          ...renderBarGroup(24, 12, BAR_AREA_W, 64, weekBars, P.green + 'AA', days),
          T('65%', 334, 66, 20, 12, { size: 7, fill: P.muted }),
          T('100%', 330, 12, 24, 12, { size: 7, fill: P.muted }),
        ],
      }),

      // Cost chart
      T('COST — DAILY ($)', 16, 278, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      Card(16, 296, 358, 100, {
        ch: [
          ...renderBarGroup(24, 12, BAR_AREA_W, 64, costBars, P.accent + 'AA', days),
          T('$8', 338, 66, 20, 12, { size: 7, fill: P.muted }),
          T('$19', 332, 12, 24, 12, { size: 7, fill: P.muted }),
        ],
      }),

      // Lane performance table
      T('LANE PERFORMANCE', 16, 410, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      Card(16, 428, 358, 176, {
        r: 14,
        ch: [
          // Header row
          T('LANE', 14, 10, 130, 10, { size: 7, fill: P.muted, ls: 1, weight: 600 }),
          T('CALLS', 152, 10, 50, 10, { size: 7, fill: P.muted, ls: 1, weight: 600, align: 'right' }),
          T('COST', 214, 10, 50, 10, { size: 7, fill: P.muted, ls: 1, weight: 600, align: 'right' }),
          T('RATE', 278, 10, 50, 10, { size: 7, fill: P.muted, ls: 1, weight: 600, align: 'right' }),
          Line(14, 26, 330),
          ...topLanes.map((ln, i) => [
            Dot(14, 38 + i * 36, ln.color),
            T(ln.name, 28, 31 + i * 36, 120, 16, { size: 11, fill: P.text }),
            T(ln.calls.toLocaleString(), 152, 31 + i * 36, 50, 16, { size: 11, fill: P.textDim, align: 'right' }),
            T(ln.cost, 214, 31 + i * 36, 50, 16, { size: 11, fill: P.textDim, align: 'right' }),
            T(ln.rate + '%', 278, 31 + i * 36, 50, 16, { size: 11, fill: ln.color, weight: 700, align: 'right' }),
          ]).flat(),
        ],
      }),

      NavBar(3),
    ],
  });
}

// ── SCREEN 5: TEAM ───────────────────────────────────────────────────────────
function screenTeam(ox) {
  const members = [
    { name: 'Ava Nakamura',  role: 'Admin',     email: 'ava@acme.io',     status: 'ACTIVE', avatar: 'AN' },
    { name: 'Dani Reyes',    role: 'Developer', email: 'dani@acme.io',    status: 'ACTIVE', avatar: 'DR' },
    { name: 'Priya Sharma',  role: 'Developer', email: 'priya@acme.io',   status: 'ACTIVE', avatar: 'PS' },
    { name: 'Lena Brückner', role: 'Viewer',    email: 'lena@acme.io',    status: 'PENDING', avatar: 'LB' },
  ];

  const apiKeys = [
    { name: 'Production',   prefix: 'lane_live_k9x2…', created: 'Jan 14',  lastUsed: '1m ago' },
    { name: 'Staging',      prefix: 'lane_test_4m7r…', created: 'Feb 2',   lastUsed: '3h ago' },
  ];

  const integrations = [
    { name: 'OpenAI',     status: 'CONNECTED', icon: '◎' },
    { name: 'Anthropic',  status: 'CONNECTED', icon: '✦' },
    { name: 'Slack',      status: 'CONNECTED', icon: '⊞' },
    { name: 'Datadog',    status: 'PENDING',   icon: '◑' },
  ];

  const avatarColors = ['#6D28D9','#1E40AF','#166534','#92400E'];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [

      // Header
      F(0, 0, 390, 52, P.surface, {
        stroke: P.divider, sw: 1, r: 0,
        ch: [
          T('LANE', 20, 14, 60, 24, { size: 16, weight: 900, fill: P.text, ls: 1.2 }),
          T('Team & Settings', 82, 17, 180, 18, { size: 13, fill: P.muted }),
        ],
      }),

      // Plan badge
      Card(16, 64, 358, 52, {
        r: 12, stroke: P.accent + '35',
        ch: [
          Pill(14, 15, 'PRO PLAN', P.accent, P.accent + '15', { w: 72 }),
          T('Acme Corp', 96, 16, 160, 16, { size: 12, fill: P.text, weight: 700 }),
          T('4 of 20 members · 2,193/5,000 runs', 96, 35, 220, 13, { size: 9.5, fill: P.muted }),
          Pill(290, 15, 'UPGRADE', P.accent2, P.accent2 + '15', { w: 62 }),
        ],
      }),

      // Team members
      T('MEMBERS', 16, 130, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      ...members.map((m, i) =>
        Card(16, 148 + i * 68, 358, 58, {
          r: 12,
          ch: [
            // avatar circle
            E(14, 12, 34, 34, avatarColors[i] + '22', {}),
            T(m.avatar, 14, 20, 34, 20, { size: 11, fill: avatarColors[i], weight: 700, align: 'center' }),
            T(m.name, 58, 8, 190, 16, { size: 12.5, fill: P.text, weight: 600 }),
            Pill(58, 28, m.role, P.muted, P.border, { w: m.role.length * 6.2 + 16 }),
            Pill(240, 8, m.status, m.status === 'ACTIVE' ? P.green : P.amber, m.status === 'ACTIVE' ? P.greenBg : P.amberBg, { w: m.status === 'PENDING' ? 60 : 52 }),
            T(m.email, 58, 44, 200, 12, { size: 9, fill: P.muted }),
          ],
        })
      ),

      // API Keys
      T('API KEYS', 16, 430, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      ...apiKeys.map((k, i) =>
        Card(16, 448 + i * 64, 358, 54, {
          r: 10,
          ch: [
            T(k.name, 14, 8, 180, 16, { size: 12, fill: P.text, weight: 600 }),
            Pill(268, 7, 'COPY', P.accent2, P.accent2 + '14', { w: 42 }),
            Pill(316, 7, '⋮', P.muted, P.border, { w: 26 }),
            T(k.prefix, 14, 28, 210, 14, { size: 10, fill: P.muted }),
            T('Last used ' + k.lastUsed, 200, 28, 154, 14, { size: 9.5, fill: P.muted, align: 'right' }),
          ],
        })
      ),

      // Integrations
      T('INTEGRATIONS', 16, 582, 200, 10, { size: 7.5, fill: P.muted, ls: 1.4, weight: 600 }),
      Card(16, 600, 358, 116, {
        r: 14,
        ch: integrations.map((intg, i) => [
          Dot(14, 12 + i * 24, intg.status === 'CONNECTED' ? P.green : P.amber),
          T(intg.icon, 30, 5 + i * 24, 20, 18, { size: 13, fill: intg.status === 'CONNECTED' ? P.green : P.amber, align: 'center' }),
          T(intg.name, 56, 7 + i * 24, 160, 16, { size: 12, fill: P.text }),
          Pill(272, 4 + i * 24, intg.status, intg.status === 'CONNECTED' ? P.green : P.amber, intg.status === 'CONNECTED' ? P.greenBg : P.amberBg, { w: intg.status === 'PENDING' ? 60 : 78 }),
        ]).flat(),
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
  name: 'LANE — AI Workflow Builder & Run Scheduler',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   P.bg,
  children: [
    screenLanes    (GAP),
    screenBuilder  (GAP + (SCREEN_W + GAP)),
    screenRuns     (GAP + (SCREEN_W + GAP) * 2),
    screenAnalytics(GAP + (SCREEN_W + GAP) * 3),
    screenTeam     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'lane.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ lane.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Lanes · Builder · Runs · Analytics · Team');
console.log('  Palette: warm off-white #F4F2ED · burnt sienna #C94A14 · cobalt #1E40AF · forest green #166534');
