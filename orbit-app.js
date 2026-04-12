'use strict';
// orbit-app.js
// ORBIT — AI Model Performance Observatory
//
// Challenge: Design a dark-mode AI model orchestration dashboard.
// Inspired by:
// 1. Linear (darkmodedesign.com) — ultra-clean, near-black, crisp white type
// 2. OWO (darkmodedesign.com) — radial orbital layout, circular progress rings
// 3. Evervault Customers (godly.website) — concentric glow halos, glassmorphism
// 4. Locomotive.ca (godly.website) — immersive full-bleed dark, bold editorial hierarchy
//
// Trend: AI/DevOps SaaS embracing orbital/radial data viz on deep cosmic backgrounds.
// Palette: void #080B14 · indigo #5B5EF4 · cyan #06B6D4 · amber #F59E0B
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#080B14',
  surface:  '#0E1120',
  surface2: '#141728',
  surface3: '#1B1F30',
  border:   '#1E2338',
  border2:  '#2A2F4A',
  muted:    '#4A506E',
  fg:       '#EEF0FA',
  fg2:      '#9BA3C4',
  accent:   '#5B5EF4',
  cyan:     '#06B6D4',
  amber:    '#F59E0B',
  green:    '#10B981',
  danger:   '#EF4444',
};

let _id = 0;
const uid = () => `ob${++_id}`;

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

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

const OrbGlow = (cx, cy, r, color, op = 0.07) => [
  E(cx-r*3, cy-r*3, r*6, r*6, color, { opacity: op*0.3 }),
  E(cx-r*2, cy-r*2, r*4, r*4, color, { opacity: op*0.55 }),
  E(cx-r,   cy-r,   r*2, r*2, color, { opacity: op }),
  E(cx-r*0.5, cy-r*0.5, r, r, color, { opacity: op*1.8 }),
];

const Ring = (cx, cy, r, pct, color) => {
  const sw = 9;
  const items = [];
  items.push(E(cx-r, cy-r, r*2, r*2, 'transparent', { stroke: P.border2+'88', sw }));
  items.push(E(cx-r+sw/2, cy-r+sw/2, (r-sw/2)*2, (r-sw/2)*2, 'transparent', { stroke: color, sw, opacity: pct/100 }));
  const angle = (-90 + (pct/100)*360) * Math.PI/180;
  items.push(E(cx+r*Math.cos(angle)-5, cy+r*Math.sin(angle)-5, 10, 10, color));
  return items;
};

const Pill = (x, y, label, color) => F(x, y, label.length*6.5+20, 22, color+'22', {
  r: 11, stroke: color+'55', sw: 1,
  ch: [
    E(8, 7, 8, 8, color),
    T(label, 22, 4, label.length*6.5, 14, { size: 10, fill: color, weight: 700, ls: 0.4 }),
  ],
});

const Sep = (x, y, w) => Line(x, y, w, P.border+'CC');

const Tabs = (W, active) => F(0, 790, W, 54, P.surface, {
  stroke: P.border, sw: 1,
  ch: [
    Line(0, 0, W),
    ...(['ORBIT','PROBE','ROUTE','LOGS']).map((label, i) => {
      const isActive = i === active;
      const tw = Math.floor(W/4);
      const icons = ['◎','⊕','⇌','≡'];
      return F(i*tw, 0, tw, 54, 'transparent', {
        ch: [
          T(icons[i], i*tw, 8, tw, 20, { size: 18, fill: isActive?P.accent:P.muted, align:'center' }),
          T(label, i*tw, 30, tw, 14, { size: 9, fill: isActive?P.accent:P.muted, align:'center', ls:0.5, weight: isActive?700:400 }),
        ],
      });
    }),
  ],
});

// ── Screen 1: Constellation Dashboard ────────────────────────────────────────
function s1(ox) {
  const W=390, cx=195, cy=336;
  return F(ox, 0, W, 844, P.bg, { clip: true, ch: [
    ...OrbGlow(cx, cy, 72, P.accent, 0.09),
    ...OrbGlow(cx, cy, 28, P.cyan, 0.06),
    ...Ring(cx, cy, 108, 87, P.accent),
    ...Ring(cx, cy, 148, 94, P.cyan),
    ...Ring(cx, cy, 185, 72, P.amber),

    E(cx-50, cy-50, 100, 100, P.surface2, { stroke: P.border2, sw: 1 }),
    T('ORBIT', cx-50, cy-22, 100, 18, { size: 14, fill: P.fg, weight: 800, align:'center', ls:3 }),
    T('3 active', cx-50, cy-4, 100, 14, { size: 10, fill: P.muted, align:'center' }),

    T('GPT-4o',   cx+72,  cy-14, 70, 14, { size: 11, fill: P.accent, weight: 700 }),
    T('87%',      cx+72,  cy+2,  48, 12, { size: 10, fill: P.muted }),
    T('Claude',   cx-188, cy-14, 70, 14, { size: 11, fill: P.cyan, weight: 700, align:'right' }),
    T('94%',      cx-168, cy+2,  48, 12, { size: 10, fill: P.muted, align:'right' }),
    T('Gemini',   cx-38,  cy+152, 76, 14, { size: 11, fill: P.amber, weight: 700, align:'center' }),
    T('72%',      cx-18,  cy+168, 36, 12, { size: 10, fill: P.muted, align:'center' }),

    F(0, 0, W, 56, P.bg, { ch: [
      T('ORBIT', 20, 18, 80, 20, { size: 16, fill: P.fg, weight: 900, ls:3 }),
      Pill(W-100, 17, 'LIVE', P.green),
      T('↺', W-36, 16, 24, 24, { size: 18, fill: P.muted }),
    ]}),
    Sep(0, 55, W),
    T('ACTIVE MODELS', 20, 68, 160, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    T('Auto-routed · Lowest latency', W-210, 68, 190, 11, { size:9, fill:P.cyan, align:'right', ls:0.3 }),

    F(0, 538, W, 108, P.surface, { ch: [
      Line(0, 0, W),
      T('GLOBAL METRICS', 20, 16, 200, 10, { size:9, fill:P.muted, ls:2, weight:700 }),
      ...[
        { label:'AVG LATENCY', val:'132', unit:'ms', x:16 },
        { label:'REQ/MIN',     val:'2.4', unit:'k',  x:146 },
        { label:'P99',         val:'487', unit:'ms', x:270 },
      ].map(m => F(m.x, 32, 104, 60, P.surface2, {
        r: 12, stroke: P.border, sw: 1,
        ch: [
          T(m.label, 0, 10, 104, 10, { size:8, fill:P.muted, ls:1.2, weight:600, align:'center' }),
          T(m.val,   0, 26,  86, 24, { size:22, fill:P.fg, weight:700, align:'center' }),
          T(m.unit, 87, 32,  16, 16, { size:10, fill:P.muted }),
        ],
      })),
    ]}),

    Tabs(W, 0),
  ]});
}

// ── Screen 2: Model Probe ────────────────────────────────────────────────────
function s2(ox) {
  const W=390;
  const pts = [0.6,0.7,0.5,0.8,0.9,0.75,0.85,0.95,0.88,0.7,0.8,0.9,1.0,0.92,0.85];
  const sparkDots = pts.map((p, i) => {
    const bw = W - 64, bh = 60;
    const x = 16 + i * bw/(pts.length-1);
    const y = 12 + bh - p*bh;
    return F(x-2, y-2, 4, 4, P.accent, { r:2 });
  });

  const pRows = [
    ['P50', '98ms',  P.green],
    ['P75', '142ms', P.accent],
    ['P90', '218ms', P.amber],
    ['P99', '487ms', P.danger],
  ];

  return F(ox, 0, W, 844, P.bg, { clip: true, ch: [
    ...OrbGlow(195, 230, 100, P.cyan, 0.06),

    F(0, 0, W, 56, P.bg, { ch: [
      T('←', 20, 16, 24, 24, { size:18, fill:P.muted }),
      T('Model Probe', 52, 18, 240, 20, { size:16, fill:P.fg, weight:700 }),
      Pill(W-110, 17, 'HEALTHY', P.green),
    ]}),
    Sep(0, 55, W),

    F(16, 72, W-32, 100, P.surface2, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        E(16, 28, 44, 44, P.cyan, { opacity:0.15 }),
        E(22, 34, 32, 32, P.cyan, { opacity:0.3 }),
        T('◎', 22, 34, 32, 32, { size:22, fill:P.cyan, align:'center' }),
        T('Claude 3.5 Sonnet', 72, 22, 220, 22, { size:17, fill:P.fg, weight:800 }),
        T('Anthropic · claude-3-5-sonnet-20241022', 72, 48, 280, 14, { size:11, fill:P.muted }),
        T('Context: 200k tokens', 72, 66, 200, 14, { size:11, fill:P.fg2 }),
        Pill(W-106, 38, '$0.008/k', P.cyan),
      ],
    }),

    T('LATENCY · 24 HRS', 16, 188, 200, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    T('avg 98ms', W-80, 188, 64, 11, { size:9, fill:P.cyan, align:'right' }),
    F(16, 206, W-32, 90, P.surface2, {
      r: 12, stroke: P.border, sw: 1,
      ch: [...sparkDots, Line(16, 72, W-64, P.border2)],
    }),

    T('LATENCY PERCENTILES', 16, 312, 200, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    ...pRows.map(([label, val, color], i) =>
      F(16, 330+i*52, W-32, 44, P.surface2, {
        r: 12, stroke: P.border, sw: 1,
        ch: [
          T(label, 16, 14, 48, 16, { size:12, fill:P.muted, weight:600 }),
          F(72, 14, (W-100)*[0.2,0.35,0.55,0.9][i], 14, color+'33', { r:6 }),
          F(72, 14, (W-100)*[0.2,0.35,0.55,0.9][i], 14, 'transparent', { r:6, stroke:color+'66', sw:1 }),
          T(val, W-92, 10, 74, 22, { size:15, fill:color, weight:800, align:'right' }),
        ],
      })
    ),

    T('QUALITY SIGNALS', 16, 546, 200, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    ...[
      { label:'Success Rate', val:'99.2%', color:P.green },
      { label:'Avg Tokens',   val:'1.2k',  color:P.accent },
      { label:'Error Rate',   val:'0.8%',  color:P.amber },
    ].map((m, i) =>
      F(16+i*122, 564, 114, 72, P.surface2, {
        r: 12, stroke: P.border, sw: 1,
        ch: [
          T(m.label, 0, 12, 114, 12, { size:9, fill:P.muted, align:'center', ls:0.5 }),
          T(m.val,   0, 30, 114, 26, { size:22, fill:m.color, weight:800, align:'center' }),
        ],
      })
    ),

    Tabs(W, 1),
  ]});
}

// ── Screen 3: Route ───────────────────────────────────────────────────────────
function s3(ox) {
  const W=390;
  const policies = [
    { name:'Lowest Latency', desc:'Route to fastest responding model', active:true,  color:P.cyan },
    { name:'Lowest Cost',    desc:'Minimize token spend per request',  active:false, color:P.amber },
    { name:'Load Balance',   desc:'Distribute evenly across models',   active:false, color:P.accent },
    { name:'Fallback Chain', desc:'Primary → Secondary → Tertiary',   active:false, color:P.green },
  ];

  return F(ox, 0, W, 844, P.bg, { clip: true, ch: [
    ...OrbGlow(195, 288, 60, P.accent, 0.07),

    F(0, 0, W, 56, P.bg, { ch: [
      T('←', 20, 16, 24, 24, { size:18, fill:P.muted }),
      T('Routing Policy', 52, 18, 240, 20, { size:16, fill:P.fg, weight:700 }),
      T('Save', W-56, 16, 40, 24, { size:14, fill:P.accent, weight:700 }),
    ]}),
    Sep(0, 55, W),

    F(16, 68, W-32, 48, P.accent+'18', {
      r: 14, stroke: P.accent+'44', sw: 1,
      ch: [
        T('◉', 16, 14, 22, 20, { size:16, fill:P.accent }),
        T('Active: Lowest Latency', 42, 14, 220, 20, { size:13, fill:P.accent, weight:700 }),
        T('Edit ›', W-68, 14, 50, 20, { size:12, fill:P.accent }),
      ],
    }),

    T('ROUTING FLOW', 16, 130, 200, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    F(16, 148, W-32, 278, P.surface, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        // REQUEST node
        F(90, 20, 178, 36, P.surface3, { r:10, stroke: P.border2, sw:1, ch:[
          T('REQUEST', 0, 10, 178, 16, { size:10, fill:P.fg2, align:'center', ls:1.5, weight:700 }),
        ]}),
        // Arrow
        F(177, 58, 2, 24, P.border2, {}),
        E(172, 80, 12, 12, P.border2),
        // ROUTER node
        F(60, 96, 238, 44, P.accent+'18', { r:12, stroke:P.accent+'66', sw:1, ch:[
          T('SMART ROUTER', 0, 12, 238, 20, { size:12, fill:P.accent, align:'center', ls:1, weight:800 }),
        ]}),
        // Branches
        F(177, 142, 2, 32, P.border2, {}),
        F(77, 176, 200, 2, P.border2, {}),
        F(77, 176, 2, 28, P.border2, {}),
        F(177, 176, 2, 28, P.border2, {}),
        F(277, 176, 2, 28, P.border2, {}),
        // Model endpoints
        F(27,  206, 100, 36, P.accent+'18', { r:10, stroke:P.accent+'55', sw:1, ch:[
          T('GPT-4o', 0, 10, 100, 16, { size:11, fill:P.accent, align:'center', weight:700 }),
        ]}),
        F(127, 206, 100, 36, P.cyan+'18', { r:10, stroke:P.cyan+'55', sw:1, ch:[
          T('Claude', 0, 10, 100, 16, { size:11, fill:P.cyan, align:'center', weight:700 }),
        ]}),
        F(227, 206, 100, 36, P.amber+'18', { r:10, stroke:P.amber+'55', sw:1, ch:[
          T('Gemini', 0, 10, 100, 16, { size:11, fill:P.amber, align:'center', weight:700 }),
        ]}),
        T('87%',   27, 246, 100, 14, { size:10, fill:P.muted, align:'center' }),
        T('94% ★', 127, 246, 100, 14, { size:10, fill:P.cyan, align:'center', weight:700 }),
        T('72%',   227, 246, 100, 14, { size:10, fill:P.muted, align:'center' }),
      ],
    }),

    T('ALL POLICIES', 16, 442, 200, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    ...policies.map((p, i) =>
      F(16, 460+i*68, W-32, 60, p.active ? p.color+'15' : P.surface2, {
        r: 14, stroke: p.active ? p.color+'55' : P.border, sw: 1,
        ch: [
          E(16, 20, 20, 20, p.color, { opacity: p.active?0.3:0.12 }),
          T(p.active?'◉':'○', 16, 20, 20, 20, { size:14, fill:p.color, align:'center' }),
          T(p.name, 46, 12, 220, 16, { size:13, fill:p.active?p.color:P.fg, weight:p.active?800:500 }),
          T(p.desc, 46, 32, 240, 14, { size:11, fill:P.muted }),
        ],
      })
    ),

    Tabs(W, 2),
  ]});
}

// ── Screen 4: Compare ─────────────────────────────────────────────────────────
function s4(ox) {
  const W=390;
  const cols = [
    { name:'GPT-4o', color:P.accent },
    { name:'Claude', color:P.cyan },
    { name:'Gemini', color:P.amber },
  ];
  const metrics = [
    { label:'AVG LATENCY', vals:['142ms','98ms','210ms'], winner:1 },
    { label:'COST/1K',     vals:['$0.010','$0.008','$0.002'], winner:2 },
    { label:'SUCCESS',     vals:['98.8%','99.2%','97.1%'], winner:1 },
    { label:'CONTEXT',     vals:['128k','200k','1M'],  winner:2 },
    { label:'P99',         vals:['520ms','487ms','890ms'], winner:1 },
    { label:'REQ/MIN',     vals:['2.1k','2.4k','3.8k'], winner:2 },
    { label:'ERROR RATE',  vals:['1.2%','0.8%','2.9%'], winner:1 },
  ];
  const colW = Math.floor((W-110)/3);

  return F(ox, 0, W, 844, P.bg, { clip: true, ch: [
    F(0, 0, W, 56, P.bg, { ch: [
      T('←', 20, 16, 24, 24, { size:18, fill:P.muted }),
      T('Model Compare', 52, 18, 240, 20, { size:16, fill:P.fg, weight:700 }),
      T('Export', W-66, 16, 50, 24, { size:13, fill:P.accent, weight:600 }),
    ]}),
    Sep(0, 55, W),

    T('METRIC', 16, 74, 90, 12, { size:9, fill:P.muted, ls:1.5, weight:700 }),
    ...cols.map((c, i) =>
      F(110+i*colW, 68, colW-4, 28, c.color+'18', {
        r: 8,
        ch: [T(c.name, 0, 6, colW-4, 16, { size:11, fill:c.color, weight:800, align:'center' })],
      })
    ),

    Sep(0, 104, W),

    ...metrics.map((m, i) => {
      const y = 112+i*56;
      return F(0, y, W, 48, i%2===0 ? P.surface+'88' : 'transparent', {
        ch: [
          T(m.label, 16, 15, 90, 12, { size:9, fill:P.muted, ls:1, weight:600 }),
          ...cols.map((c, ci) => {
            const isW = ci===m.winner;
            return F(110+ci*colW, 6, colW-8, 36, isW ? c.color+'18' : 'transparent', {
              r: 8, stroke: isW ? c.color+'44' : 'transparent', sw: 1,
              ch: [
                T(m.vals[ci], 0, 9, colW-8, 18, { size:13, fill:isW?c.color:P.fg2, weight:isW?800:400, align:'center' }),
                ...(isW ? [T('★', colW-22, 9, 14, 18, { size:10, fill:c.color })] : []),
              ],
            });
          }),
        ],
      });
    }),

    Sep(0, 112+metrics.length*56, W),

    F(16, 510, W-32, 58, P.cyan+'12', {
      r: 14, stroke: P.cyan+'44', sw: 1,
      ch: [
        T('◎', 16, 17, 28, 24, { size:20, fill:P.cyan }),
        T('Claude 3.5 wins 4/7 benchmarks', 50, 12, 250, 18, { size:13, fill:P.cyan, weight:800 }),
        T('Best balance of speed and accuracy', 50, 32, 250, 16, { size:11, fill:P.fg2 }),
      ],
    }),

    T('Based on last 24h · 28k requests sampled', 16, 580, W-32, 14, { size:10, fill:P.muted, align:'center' }),

    Tabs(W, 3),
  ]});
}

// ── Screen 5: Degradation Alert ───────────────────────────────────────────────
function s5(ox) {
  const W=390, cx=195, cy=296;
  return F(ox, 0, W, 844, P.bg, { clip: true, ch: [
    ...OrbGlow(cx, cy, 80, P.amber, 0.13),
    ...OrbGlow(cx, cy, 40, P.danger, 0.07),

    E(cx-120, cy-120, 240, 240, 'transparent', { stroke: P.amber+'22', sw:2 }),
    E(cx-90,  cy-90,  180, 180, 'transparent', { stroke: P.amber+'33', sw:2 }),
    E(cx-60,  cy-60,  120, 120, 'transparent', { stroke: P.amber+'55', sw:2 }),
    E(cx-36,  cy-36,   72,  72, P.amber+'11',  { stroke: P.amber+'88', sw:2 }),
    T('⚠', cx-20, cy-24, 40, 48, { size:36, fill:P.amber, align:'center' }),

    F(0, 0, W, 56, P.bg, { ch: [
      T('ORBIT', 20, 18, 80, 20, { size:16, fill:P.fg, weight:900, ls:3 }),
      Pill(W-126, 17, 'DEGRADED', P.amber),
    ]}),
    Line(0, 55, W, P.amber+'44'),

    T('DEGRADATION DETECTED', 0, 172, W, 28, { size:19, fill:P.amber, weight:900, align:'center', ls:0.5 }),
    T('GPT-4o latency spike · 3 min ago', 0, 204, W, 18, { size:13, fill:P.fg2, align:'center' }),
    T('Avg 142ms → 1,240ms  ·  +773%', 0, 226, W, 16, { size:12, fill:P.danger, align:'center', weight:700 }),

    T('AFFECTED ENDPOINTS', 20, 380, W-40, 11, { size:9, fill:P.muted, ls:2, weight:700, align:'center' }),
    ...['chat/completions','completions','embeddings'].map((ep, i) =>
      F(20, 398+i*52, W-40, 44, P.amber+'0E', {
        r: 12, stroke: P.amber+'44', sw: 1,
        ch: [
          T('⚠', 14, 12, 22, 20, { size:16, fill:P.amber }),
          T('/'+ep, 42, 11, 220, 16, { size:12, fill:P.fg, weight:600 }),
          T('Elevated error rate · P99 > 2s', 42, 29, 220, 13, { size:10, fill:P.amber }),
          Pill(W-90, 12, 'SLOW', P.amber),
        ],
      })
    ),

    T('RESPONSE ACTIONS', 20, 558, W-40, 11, { size:9, fill:P.muted, ls:2, weight:700, align:'center' }),
    F(20, 576, W-40, 54, P.accent, {
      r: 14,
      ch: [T('⇌  Failover to Claude 3.5', 0, 14, W-40, 26, { size:14, fill:P.fg, weight:800, align:'center' })],
    }),
    F(20, 642, (W-48)/2, 46, P.amber+'22', {
      r: 12, stroke: P.amber+'44', sw: 1,
      ch: [T('⚡ Notify Team', 0, 13, (W-48)/2, 20, { size:12, fill:P.amber, weight:600, align:'center' })],
    }),
    F(28+(W-48)/2, 642, (W-48)/2, 46, P.surface2, {
      r: 12, stroke: P.border2, sw: 1,
      ch: [T('Investigate', 0, 13, (W-48)/2, 20, { size:12, fill:P.fg2, weight:600, align:'center' })],
    }),

    T('ALERT TIMELINE', 20, 704, W-40, 11, { size:9, fill:P.muted, ls:2, weight:700 }),
    ...[
      ['14:22:01','P95 latency crosses 500ms', P.amber],
      ['14:23:18','P99 crosses 2s threshold',  P.danger],
      ['14:24:00','Failover triggered',         P.green],
    ].map(([t, ev, color], i) =>
      F(20, 722+i*32, W-40, 26, P.surface, {
        r: 8,
        ch: [
          T(t, 10, 6, 68, 14, { size:10, fill:P.muted, ls:0.3 }),
          E(86, 10, 8, 8, color),
          T(ev, 100, 6, 240, 14, { size:11, fill:color }),
        ],
      })
    ),
  ]});
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const SW=390, GAP=80;
const doc = {
  version: '2.8',
  name: 'ORBIT — AI Model Observatory',
  width:  5*SW + 6*GAP,
  height: 844,
  fill:   P.bg,
  children: [
    s1(GAP),
    s2(GAP+(SW+GAP)),
    s3(GAP+(SW+GAP)*2),
    s4(GAP+(SW+GAP)*3),
    s5(GAP+(SW+GAP)*4),
  ],
};

const outPath = path.join(__dirname, 'orbit.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ orbit.pen written —', Math.round(fs.statSync(outPath).size/1024)+'KB');
console.log('  Screens: Constellation · Probe · Route · Compare · Alert');
console.log('  Palette: void #080B14 · indigo #5B5EF4 · cyan #06B6D4 · amber #F59E0B');
