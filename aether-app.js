'use strict';
// aether-app.js
// AETHER — Agentic AI Workflow Orchestrator
//
// Inspired by:
//  · JetBrains Air (lapa.ninja/post/air-dev/) — agentic dev environment,
//    near-black + teal + electric-blue, terminal mono typography
//  · Forge + Linear featured on DarkModeDesign.com — precision dark tooling,
//    deep-contrast surfaces, single accent on deep black
//  · Evervault (godly.website) — data-flow aesthetic, teal glow on black
//
// Challenge: Design a dark-mode multi-agent task orchestrator with a
// bento-grid dashboard where AI agents run parallel task loops, each
// streaming live terminal output. Pushes a new "terminal bento" hybrid
// pattern not previously explored in this design system.
// 5 mobile + 5 desktop screens.

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const cfg          = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || cfg.GITHUB_TOKEN || '';
const GITHUB_REPO  = cfg.GITHUB_REPO || '';
const SLUG         = 'aether-orchestrator';
const APP_NAME     = 'AETHER';
const TAGLINE      = 'Run parallel AI agents. See every task. Own every outcome.';

// ── Palette — Deep space black + JetBrains Air teal + Forge violet ─────────
const P = {
  bg:       '#07090E',
  surface:  '#0D1117',
  surface2: '#131C28',
  border:   '#1E2B3C',
  muted:    '#3D5A7A',
  fg:       '#DDE9FF',
  accent:   '#00D4AA',   // JetBrains Air teal
  accent2:  '#8B5CF6',   // Forge/Linear violet
  hot:      '#FF4D6D',
  warn:     '#F59E0B',
  info:     '#38BDF8',
  ok:       '#10B981',
};

let _id = 0;
const uid = () => `ae${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 12,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls  !== undefined ? { letterSpacing: opts.ls }   : {}),
  ...(opts.lh  !== undefined ? { lineHeight:    opts.lh }   : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

const Glow = (cx, cy, r, color) => [
  E(cx-r*2,   cy-r*2,   r*4,   r*4,   color+'06', {}),
  E(cx-r*1.3, cy-r*1.3, r*2.6, r*2.6, color+'0E', {}),
  E(cx-r*0.7, cy-r*0.7, r*1.4, r*1.4, color+'1A', {}),
];

const Pill = (x, y, label, color, w = 0) => {
  const pw = w || (label.length * 6.5 + 24);
  return F(x, y, pw, 20, color+'1A', { r:10, stroke:color+'33', sw:1, ch:[
    E(7, 6, 8, 8, color, {}),
    T(label, 18, 3, pw-22, 14, { size:9, fill:color, weight:600, ls:0.8 }),
  ]});
};

const ProgBar = (x, y, w, pct, color) => [
  F(x, y, w, 4, P.border, { r:2 }),
  F(x, y, Math.max(2, Math.round(w*pct)), 4, color, { r:2 }),
];

// Agent status colors
const SC = { RUNNING:P.accent, DONE:P.ok, WAITING:P.warn, ERROR:P.hot, IDLE:P.muted };

// ── Agent card — mobile ───────────────────────────────────────────────────────
const AgentCardM = (x, y, name, role, model, status, pct, color) =>
  F(x, y, 335, 80, P.surface2, { r:10, stroke:P.border, sw:1, ch:[
    F(0, 0, 3, 80, color, { r:2 }),
    E(18, 20, 36, 36, color+'22', {}),
    T(name[0], 27, 27, 18, 18, { size:12, weight:800, fill:color, align:'center' }),
    T(name,     62, 14, 160, 16, { size:12, weight:700, fill:P.fg }),
    T(role,     62, 33, 160, 12, { size:9,  fill:P.muted, ls:0.4 }),
    T(model,    62, 49, 120, 11, { size:8,  fill:P.muted, opacity:0.55 }),
    Pill(242, 14, status, SC[status]),
    ...ProgBar(62, 66, 250, pct, color),
    T(Math.round(pct*100)+'%', 308, 60, 28, 11, { size:8, fill:P.muted, align:'right' }),
  ]});

// Agent card — desktop (bento tile)
const AgentCardD = (x, y, name, role, model, status, tasks, tokensK, color) =>
  F(x, y, 220, 160, P.surface2, { r:12, stroke:P.border, sw:1, ch:[
    F(0, 0, 220, 3, color, { r:2 }),
    E(16, 18, 40, 40, color+'1E', {}),
    T(name[0], 26, 27, 20, 22, { size:14, weight:800, fill:color, align:'center' }),
    T(name,    64, 18, 140, 16, { size:13, weight:700, fill:P.fg }),
    T(role,    64, 37, 140, 12, { size:9,  fill:P.muted, ls:0.3 }),
    Pill(64, 55, status, SC[status], 64),
    Line(0, 82, 220, P.border),
    T('TASKS',  16, 94,  80, 11, { size:8, fill:P.muted, ls:1 }),
    T(String(tasks), 16, 108, 80, 20, { size:18, weight:700, fill:P.fg }),
    T('TOKENS', 110, 94, 80, 11, { size:8, fill:P.muted, ls:1 }),
    T(tokensK+'k', 110, 108, 80, 20, { size:18, weight:700, fill:color }),
    T(model, 16, 142, 190, 11, { size:8, fill:P.muted, opacity:0.55 }),
  ]});

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS (375 × 812)
// ══════════════════════════════════════════════════════════════════════════════

function mLanding(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip:true, ch:[
    ...Glow(187, 340, 130, P.accent),
    ...Glow(60,  640, 80,  P.accent2),
    T('9:41', 16, 16, 50, 14, { size:11, weight:600 }),
    T('●●●', 312, 16, 48, 14, { size:8, fill:P.muted }),
    T('AETHER', 20, 50, 160, 18, { size:13, weight:800, ls:4 }),
    F(283, 46, 74, 28, P.accent+'18', { r:14, stroke:P.accent+'44', ch:[T('Sign in', 10, 6, 54, 16, { size:10, fill:P.accent, weight:600 })] }),
    T('AGENTIC\nORCHESTRATION', 20, 100, 335, 88, { size:36, weight:900, fill:P.fg, ls:-1.2, lh:1.05 }),
    F(20, 102, 6, 86, P.accent, { r:3 }),
    T('Run parallel AI agents. See every task.\nOwn every outcome.', 20, 200, 310, 40, { size:13, fill:P.fg, opacity:0.5, lh:1.65 }),
    F(20, 260, 178, 46, P.accent, { r:8, ch:[T('Start Free', 28, 13, 122, 20, { size:13, weight:700, fill:P.bg })] }),
    F(208, 260, 147, 46, P.surface2, { r:8, stroke:P.border, ch:[T('Watch demo', 16, 13, 115, 20, { size:13, weight:600, fill:P.fg })] }),
    T('LIVE AGENTS', 20, 330, 200, 12, { size:8, fill:P.muted, ls:2 }),
    ...['CODA','LENS','FORGE','ECHO'].map((name, i) =>
      AgentCardM(20, 350+i*92, name,
        ['Code Review','Data Extract','Test Runner','Doc Writer'][i],
        ['claude-3.5','gpt-4o','claude-3.5','gemini-2'][i],
        ['RUNNING','DONE','RUNNING','WAITING'][i],
        [0.72,1.0,0.41,0.0][i],
        [P.accent,P.accent2,P.info,P.ok][i])
    ),
    T('Join 2,400+ engineering teams', 20, 748, 335, 14, { size:11, fill:P.muted, align:'center' }),
    Line(0, 788, 375, P.border),
    T('AETHER', 20, 796, 100, 10, { size:9, fill:P.muted, ls:2 }),
    T('v2.4', 308, 796, 48, 10, { size:9, fill:P.muted, opacity:0.5 }),
  ]});
}

function mOnboarding(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip:true, ch:[
    T('9:41', 16, 14, 50, 14, { size:11, weight:600 }),
    F(16, 44, 36, 36, P.surface2, { r:8, stroke:P.border, ch:[T('←', 8, 8, 20, 20, { size:14, fill:P.fg })] }),
    T('Setup', 62, 52, 200, 18, { size:14, weight:700 }),
    T('STEP 1 OF 3', 20, 96, 200, 12, { size:8, fill:P.muted, ls:2 }),
    ...[0,1,2].map(i => F(232+i*18, 96, 12, 8, i===0 ? P.accent : P.border, { r:4 })),
    T('Connect your\nrepository', 20, 118, 335, 60, { size:30, weight:900, fill:P.fg, ls:-1, lh:1.1 }),
    T('AETHER agents need read access to index\nyour codebase and run task loops.', 20, 186, 335, 36, { size:12, fill:P.fg, opacity:0.5, lh:1.7 }),
    ...['GitHub', 'GitLab', 'Bitbucket'].map((name, i) => {
      const sel = i === 0;
      return F(20, 244+i*74, 335, 64, sel ? P.accent+'12' : P.surface2, { r:10, stroke:sel ? P.accent+'66' : P.border, ch:[
        T(['⬡','◈','◉'][i], 18, 18, 28, 28, { size:20, fill:[P.fg, '#E24329', P.info][i] }),
        T(name, 58, 14, 180, 18, { size:14, weight:700 }),
        T(['github.com/acme','gitlab.com/acme','bitbucket.org/co'][i], 58, 36, 200, 12, { size:9, fill:P.muted }),
        ...(sel ? [F(298, 22, 20, 20, P.accent+'22', { r:10, ch:[E(5,5,10,10,P.accent,{})] })] : []),
      ]});
    }),
    T('PERMISSIONS', 20, 472, 280, 12, { size:8, fill:P.muted, ls:2 }),
    ...['Read repository contents','Read pull requests','Read issues & comments'].map((p,i) =>
      F(20, 490+i*40, 335, 32, P.surface, { r:8, ch:[
        T('✓', 14, 8, 20, 16, { size:11, fill:P.ok }),
        T(p,   36, 8, 270, 16, { size:11, fill:P.fg, opacity:0.7 }),
      ]})
    ),
    F(20, 640, 335, 50, P.accent, { r:10, ch:[T('Connect GitHub →', 80, 15, 175, 20, { size:14, weight:700, fill:P.bg, align:'center' })] }),
    T('We never write to your repository', 20, 704, 335, 12, { size:10, fill:P.muted, opacity:0.5, align:'center' }),
  ]});
}

function mDashboard(ox) {
  const agents = [
    { n:'CODA',  role:'Code Review',  model:'claude-3.5',   s:'RUNNING', pct:0.72, c:P.accent  },
    { n:'LENS',  role:'Data Extract', model:'gpt-4o',       s:'DONE',    pct:1.00, c:P.accent2 },
    { n:'FORGE', role:'Test Runner',  model:'claude-3.5',   s:'RUNNING', pct:0.41, c:P.info    },
    { n:'ECHO',  role:'Doc Writer',   model:'gemini-2',     s:'WAITING', pct:0.00, c:P.ok      },
    { n:'RIFT',  role:'API Monitor',  model:'claude-haiku', s:'ERROR',   pct:0.19, c:P.hot     },
  ];
  return F(ox, 0, 375, 812, P.bg, { clip:true, ch:[
    T('9:41', 16, 14, 50, 14, { size:11, weight:600 }),
    T('●●●', 312, 14, 48, 14, { size:8, fill:P.muted }),
    T('Dashboard', 20, 46, 200, 22, { size:18, weight:800 }),
    F(295, 44, 62, 30, P.surface2, { r:8, stroke:P.border, ch:[T('+ Agent', 8, 7, 46, 16, { size:10, fill:P.accent, weight:600 })] }),
    F(20, 84, 335, 60, P.surface2, { r:10, stroke:P.border, ch:[
      T('ACTIVE', 14, 10, 80, 10, { size:7, fill:P.muted, ls:1.2 }),
      T('3',  14, 24, 40, 22, { size:20, weight:800, fill:P.accent }),
      VLine(70, 10, 40, P.border),
      T('DONE',   84, 10, 80, 10, { size:7, fill:P.muted, ls:1.2 }),
      T('12', 84, 24, 60, 22, { size:20, weight:800, fill:P.ok }),
      VLine(148, 10, 40, P.border),
      T('ERRORS', 162, 10, 80, 10, { size:7, fill:P.muted, ls:1.2 }),
      T('1',  162, 24, 40, 22, { size:20, weight:800, fill:P.hot }),
      VLine(222, 10, 40, P.border),
      T('TOKENS', 236, 10, 80, 10, { size:7, fill:P.muted, ls:1.2 }),
      T('284k', 236, 24, 80, 22, { size:20, weight:800, fill:P.fg }),
    ]}),
    T('AGENTS', 20, 162, 200, 12, { size:8, fill:P.muted, ls:2 }),
    ...agents.map((a,i) => AgentCardM(20, 180+i*90, a.n, a.role, a.model, a.s, a.pct, a.c)),
    F(0, 774, 375, 38, P.surface, { ch:[
      ...['⊞ Board','⌥ Runs','⎈ Settings'].map((lbl,i) => [
        T(lbl, 16+i*120, 10, 100, 18, { size:10, fill:i===0?P.accent:P.muted, weight:i===0?700:400 }),
      ]).flat(),
      F(16, 0, 60, 2, P.accent, { r:1 }),
    ]}),
  ]});
}

function mTaskStream(ox) {
  const lines = [
    { t:'00:00', msg:'Agent CODA initialized · claude-3.5-sonnet', c:P.muted },
    { t:'00:01', msg:'Cloning repo context · 847 files indexed', c:P.accent },
    { t:'00:04', msg:'Task: Review PR #1247 — auth middleware', c:P.fg },
    { t:'00:08', msg:'Analyzing 14 changed files...', c:P.accent },
    { t:'00:12', msg:'→ auth.ts: null-check missing (line 47)', c:P.warn },
    { t:'00:13', msg:'→ bcrypt.compareSync() — use async', c:P.warn },
    { t:'00:15', msg:'→ Hardcoded 3600s expiry', c:P.warn },
    { t:'00:18', msg:'→ No refresh token rotation ⚠ HIGH', c:P.hot },
    { t:'00:22', msg:'Running security scan...', c:P.accent },
    { t:'00:26', msg:'  ✓ No SQL injection vectors', c:P.ok },
    { t:'00:27', msg:'  ✓ CSRF tokens present', c:P.ok },
    { t:'00:29', msg:'Generating review comment...', c:P.accent },
    { t:'00:34', msg:'█', c:P.accent },
  ];
  return F(ox, 0, 375, 812, P.bg, { clip:true, ch:[
    T('9:41', 16, 14, 50, 14, { size:11, weight:600 }),
    F(16, 44, 36, 36, P.surface2, { r:8, stroke:P.border, ch:[T('←', 8, 8, 20, 20, { size:14 })] }),
    T('CODA', 62, 46, 160, 18, { size:14, weight:800 }),
    T('Code Review Agent', 62, 65, 200, 12, { size:10, fill:P.muted }),
    Pill(270, 46, 'RUNNING', P.accent),
    ...ProgBar(0, 86, 375, 0.72, P.accent),
    F(16, 94, 343, 44, P.surface2, { r:8, stroke:P.border, ch:[
      T('ELAPSED',  12,  8, 60, 10, { size:7, fill:P.muted, ls:1 }),
      T('0:34',     12, 22, 60, 16, { size:14, weight:700 }),
      VLine(90, 8, 28, P.border),
      T('TOKENS',  104,  8, 60, 10, { size:7, fill:P.muted, ls:1 }),
      T('8.4k',    104, 22, 60, 16, { size:14, weight:700, fill:P.accent }),
      VLine(172, 8, 28, P.border),
      T('ISSUES',  186,  8, 60, 10, { size:7, fill:P.muted, ls:1 }),
      T('4',       186, 22, 40, 16, { size:14, weight:700, fill:P.hot }),
      VLine(254, 8, 28, P.border),
      T('STEP',    268,  8, 60, 10, { size:7, fill:P.muted, ls:1 }),
      T('4/6',     268, 22, 60, 16, { size:14, weight:700, fill:P.warn }),
    ]}),
    F(16, 148, 343, 520, P.surface, { r:10, stroke:P.border, ch:[
      F(0, 0, 343, 28, P.surface2, { r:10, ch:[
        E(12,  9, 10, 10, P.hot +'AA', {}),
        E(28,  9, 10, 10, P.warn+'AA', {}),
        E(44,  9, 10, 10, P.ok  +'AA', {}),
        T('STREAM LOG · PR #1247', 66, 7, 260, 14, { size:9, fill:P.muted, ls:1 }),
      ]}),
      ...lines.map((l,i) => [
        T(l.t,   12, 40+i*36, 44, 14, { size:9, fill:P.muted }),
        T(l.msg, 60, 40+i*36, 272, 14, { size:10, fill:l.c, opacity:l.c===P.muted?0.5:0.85 }),
      ]).flat(),
    ]}),
    F(16, 682, 160, 44, P.hot+'1A', { r:8, stroke:P.hot+'44', ch:[T('⏹ Stop Agent', 22, 12, 116, 20, { size:12, fill:P.hot, weight:600 })] }),
    F(186, 682, 163, 44, P.surface2, { r:8, stroke:P.border, ch:[T('↻ Restart', 30, 12, 103, 20, { size:12, fill:P.fg, weight:600 })] }),
  ]});
}

function mAnalytics(ox) {
  const Spark = (x, y, vals, color, bw=8, h=30) =>
    vals.map((v,i) => F(x+i*(bw+2), y+(h-Math.round(v*h)), bw, Math.round(v*h), color, { r:2, opacity:0.5+v*0.5 }));
  const tVals  = [0.3,0.5,0.4,0.7,0.65,0.8,0.9,0.75,0.85,1.0,0.92,0.88,0.95,0.78,0.9,0.85,0.72];
  const tkVals = [0.4,0.6,0.5,0.7,0.8,0.6,0.9,0.85,0.7,0.95,0.88,0.92,0.8,0.75,0.85,0.9,0.95];

  return F(ox, 0, 375, 812, P.bg, { clip:true, ch:[
    T('9:41', 16, 14, 50, 14, { size:11, weight:600 }),
    T('Analytics', 20, 46, 200, 22, { size:18, weight:800 }),
    T('Last 7 days', 20, 72, 200, 14, { size:11, fill:P.muted }),
    F(218, 46, 137, 28, P.surface2, { r:8, stroke:P.border, ch:[
      F(4, 4, 42, 20, P.accent+'22', { r:6, ch:[T('7d', 6, 3, 30, 14, { size:9, fill:P.accent, weight:700 })] }),
      T('30d', 54, 5, 30, 18, { size:9, fill:P.muted }),
      T('90d', 94, 5, 30, 18, { size:9, fill:P.muted }),
    ]}),
    ...['284k','847','94%','$8.40'].map((val,i) =>
      F(20+i*84, 106, 76, 64, P.surface2, { r:8, stroke:P.border, ch:[
        T(['TOKENS','TASKS','SUCCESS','COST'][i], 8, 8, 60, 10, { size:6, fill:P.muted, ls:0.8 }),
        T(val, 8, 22, 60, 22, { size:i===2?16:14, weight:800, fill:[P.accent,P.ok,P.info,P.accent2][i] }),
      ]})
    ),
    T('TOKEN USAGE', 20, 184, 200, 12, { size:8, fill:P.muted, ls:2 }),
    F(20, 200, 335, 88, P.surface2, { r:10, stroke:P.border, ch:[
      T('284,112', 12, 8, 140, 18, { size:14, weight:700, fill:P.accent }),
      T('tokens this week', 12, 28, 160, 12, { size:9, fill:P.muted }),
      T('↑ 18%', 264, 8, 60, 16, { size:11, fill:P.ok, weight:600 }),
      ...Spark(12, 50, tVals, P.accent),
    ]}),
    T('TASK THROUGHPUT', 20, 304, 200, 12, { size:8, fill:P.muted, ls:2 }),
    F(20, 320, 335, 88, P.surface2, { r:10, stroke:P.border, ch:[
      T('847', 12, 8, 100, 18, { size:14, weight:700, fill:P.ok }),
      T('tasks completed', 12, 28, 160, 12, { size:9, fill:P.muted }),
      T('↑ 31%', 264, 8, 60, 16, { size:11, fill:P.ok, weight:600 }),
      ...Spark(12, 50, tkVals, P.ok),
    ]}),
    T('AGENT PERFORMANCE', 20, 424, 200, 12, { size:8, fill:P.muted, ls:2 }),
    F(20, 440, 335, 200, P.surface2, { r:10, stroke:P.border, ch:[
      T('AGENT',  12, 10, 80, 11, { size:8, fill:P.muted, ls:1 }),
      T('TASKS',  120, 10, 60, 11, { size:8, fill:P.muted, ls:1 }),
      T('WIN%',   195, 10, 60, 11, { size:8, fill:P.muted, ls:1 }),
      T('AVG',    270, 10, 60, 11, { size:8, fill:P.muted, ls:1 }),
      Line(0, 26, 335, P.border),
      ...['CODA','LENS','FORGE','ECHO','RIFT'].map((n,i) => {
        const nc = [P.accent,P.accent2,P.info,P.ok,P.hot];
        const t  = [312,218,154,97,66];
        const s  = ['98%','100%','91%','87%','74%'];
        const tm = ['1m12','43s','3m8','2m44','5m2'];
        return [
          T(n, 12, 35+i*32, 80, 14, { size:11, weight:700, fill:nc[i] }),
          T(String(t[i]), 120, 35+i*32, 60, 14, { size:11, fill:P.fg }),
          T(s[i], 195, 35+i*32, 60, 14, { size:11, fill:parseInt(s[i])>=90?P.ok:P.warn }),
          T(tm[i], 270, 35+i*32, 60, 14, { size:10, fill:P.muted }),
          ...(i<4 ? [Line(0, 29+(i+1)*32, 335, P.border)] : []),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS (1440 × 900)
// ══════════════════════════════════════════════════════════════════════════════

function dLanding(ox) {
  return F(ox, 0, 1440, 900, P.bg, { clip:true, ch:[
    ...Glow(720, 400, 280, P.accent),
    ...Glow(200, 720, 140, P.accent2),
    ...Glow(1300, 200, 110, P.info),
    // nav
    F(0, 0, 1440, 64, P.bg, { ch:[
      T('AETHER', 60, 22, 120, 20, { size:14, weight:800, ls:4 }),
      T('Product', 240, 22, 80, 20, { size:13, fill:P.muted }),
      T('Docs',    330, 22, 60, 20, { size:13, fill:P.muted }),
      T('Pricing', 400, 22, 70, 20, { size:13, fill:P.muted }),
      F(1234, 16, 80, 32, P.surface2, { r:8, stroke:P.border, ch:[T('Sign in', 12, 8, 56, 16, { size:12 })] }),
      F(1330, 16, 110, 32, P.accent, { r:8, ch:[T('Get started →', 10, 8, 90, 16, { size:12, fill:P.bg, weight:700 })] }),
      Line(0, 63, 1440, P.border),
    ]}),
    // hero
    T('AGENTIC AI', 60, 140, 700, 80, { size:72, weight:900, fill:P.fg, ls:-3, lh:0.95 }),
    T('ORCHESTRATION', 60, 220, 700, 80, { size:72, weight:900, fill:P.accent, ls:-3, lh:0.95 }),
    T('Run parallel AI agents on your codebase.\nAutomate review, testing, documentation,\nand monitoring — all from one dashboard.', 60, 310, 500, 72, { size:16, fill:P.fg, opacity:0.5, lh:1.7 }),
    F(60, 400, 196, 52, P.accent, { r:10, ch:[T('Start free →', 34, 15, 128, 22, { size:15, weight:700, fill:P.bg })] }),
    F(272, 400, 156, 52, P.surface2, { r:10, stroke:P.border, ch:[T('Watch demo', 22, 15, 112, 22, { size:15 })] }),
    T('No credit card required · 5 agents free forever', 60, 470, 380, 14, { size:11, fill:P.muted }),
    // right mock dashboard
    F(682, 74, 698, 700, P.surface2, { r:16, stroke:P.border, ch:[
      F(0, 0, 698, 44, P.surface, { r:16, ch:[
        E(18, 16, 12, 12, P.hot+'AA',  {}),
        E(36, 16, 12, 12, P.warn+'AA', {}),
        E(54, 16, 12, 12, P.ok+'AA',   {}),
        T('aether.app · dashboard', 78, 13, 260, 18, { size:11, fill:P.muted }),
      ]}),
      ...['CODA','LENS','FORGE','ECHO'].map((n,i) =>
        AgentCardD(20+[0,1,0,1][i]*240, 62+[0,0,1,1][i]*178, n,
          ['Code Review','Data Extract','Test Runner','Doc Writer'][i],
          ['claude-3.5','gpt-4o','claude-3.5','gemini-2'][i],
          ['RUNNING','DONE','RUNNING','WAITING'][i],
          [312,218,154,97][i],[84,61,42,28][i],
          [P.accent,P.accent2,P.info,P.ok][i])
      ),
      F(500, 62, 178, 310, P.bg, { r:10, stroke:P.border, ch:[
        F(0, 0, 178, 26, P.surface, { r:10, ch:[T('CODA · STREAM', 10, 7, 158, 12, { size:8, fill:P.muted, ls:1 })] }),
        ...['Analyzing PR #1247...','→ auth.ts: 4 issues','→ null check missing','→ bcrypt async fix','Running sec scan...','✓ No SQL injection','✓ CSRF tokens ok','Drafting review...','█'].map((line,i) =>
          T(line, 10, 34+i*28, 158, 18, { size:9, fill:[P.accent,P.warn,P.warn,P.warn,P.accent,P.ok,P.ok,P.accent,P.accent][i], opacity:0.8 })
        ),
      ]}),
      F(20, 420, 658, 260, P.surface, { r:10, ch:[
        T('RECENT ACTIVITY', 16, 14, 200, 12, { size:8, fill:P.muted, ls:2 }),
        ...['CODA completed PR #1247 review · 4 issues flagged',
            'LENS extracted 42 data points from analytics.csv',
            'FORGE ran 847 tests · 2 failures in auth.spec.ts',
            'RIFT detected API latency spike on /v2/payments',
            'ECHO generated docs for 12 new functions',
        ].map((msg,i) => [
          T(['00:34','00:31','00:28','00:24','00:19'][i], 16, 38+i*40, 40, 12, { size:8, fill:P.muted }),
          T(msg, 62, 36+i*40, 578, 14, { size:10, fill:P.fg, opacity:0.7 }),
          ...(i<4 ? [Line(16, 52+i*40, 626, P.border)] : []),
        ]).flat(),
      ]}),
    ]}),
    T('Trusted by engineering teams at', 60, 800, 340, 16, { size:12, fill:P.muted }),
    ...['Acme Corp','Stripe Labs','Figma OSS','Linear','Vercel'].map((co,i) =>
      T(co, 262+i*148, 800, 130, 16, { size:13, weight:700, fill:P.fg, opacity:0.35 })
    ),
  ]});
}

function dOnboarding(ox) {
  return F(ox, 0, 1440, 900, P.bg, { clip:true, ch:[
    F(0, 0, 1440, 60, P.bg, { ch:[T('AETHER', 60, 20, 120, 20, { size:14, weight:800, ls:4 }), Line(0, 59, 1440, P.border)] }),
    // sidebar
    F(0, 60, 320, 840, P.surface, { ch:[
      VLine(319, 0, 840, P.border),
      T('SETUP WIZARD', 40, 40, 240, 12, { size:8, fill:P.muted, ls:2 }),
      ...['Connect Repository','Configure Agents','Invite Team'].map((step,i) => {
        const active = i===0;
        return F(20, 80+i*72, 280, 56, active ? P.accent+'0F' : 'transparent', { r:10, ch:[
          F(16, 16, 24, 24, active ? P.accent : P.border, { r:12, ch:[
            T(String(i+1), 6, 4, 12, 16, { size:10, weight:700, fill:active?P.bg:P.muted, align:'center' }),
          ]}),
          T(step, 50, 10, 200, 16, { size:13, weight:active?700:400, fill:active?P.fg:P.muted }),
          T(['Your codebase','AI task types','Collaborators'][i], 50, 30, 200, 12, { size:10, fill:P.muted }),
        ]});
      }),
      T('1 OF 3', 40, 310, 240, 12, { size:8, fill:P.muted, ls:2 }),
      ...ProgBar(40, 328, 240, 0.33, P.accent),
    ]}),
    // content
    F(320, 60, 1120, 840, P.bg, { ch:[
      T('Connect your repository', 60, 60, 800, 40, { size:34, weight:900, fill:P.fg, ls:-1 }),
      T('AETHER needs read access to index your codebase. We never write to your repo.', 60, 108, 700, 20, { size:14, fill:P.muted, lh:1.6 }),
      T('CHOOSE PROVIDER', 60, 156, 300, 12, { size:9, fill:P.muted, ls:2 }),
      ...['GitHub','GitLab','Bitbucket','Self-hosted'].map((name,i) => {
        const sel = i===0;
        return F(60+i*240, 176, 220, 80, sel ? P.accent+'0F' : P.surface2, { r:12, stroke:sel?P.accent+'55':P.border, ch:[
          T(['⬡','◈','◉','⊕'][i], 16, 20, 36, 36, { size:24, fill:[P.fg,'#E24329',P.info,P.muted][i] }),
          T(name, 58, 24, 140, 18, { size:14, weight:600 }),
          T(['github.com','gitlab.com','bitbucket.org','Custom URL'][i], 58, 46, 140, 12, { size:9, fill:P.muted }),
          ...(sel ? [F(188, 24, 20, 20, P.accent+'22', { r:10, ch:[E(5,5,10,10,P.accent,{})] })] : []),
        ]});
      }),
      T('SELECT REPOSITORY', 60, 284, 300, 12, { size:9, fill:P.muted, ls:2 }),
      F(60, 304, 700, 50, P.surface2, { r:10, stroke:P.border, ch:[
        T('🔍', 14, 13, 24, 24, { size:16 }),
        T('Search repositories...', 46, 15, 600, 20, { size:13, fill:P.muted }),
      ]}),
      ...['acme/auth-service','acme/payments-api','acme/frontend-app'].map((repo,i) => {
        const sel = i===0;
        return F(60, 364+i*66, 700, 56, sel?P.accent+'0A':P.surface, { r:10, stroke:sel?P.accent+'33':P.border, ch:[
          T(['🔐','💳','⚛'][i], 16, 16, 24, 24, { size:16 }),
          T(repo, 50, 11, 400, 16, { size:13, weight:600 }),
          T(['TypeScript · 847 files · 2h ago','Go · 312 files · 5h ago','React/TS · 1,204 files · 30m ago'][i], 50, 31, 400, 12, { size:10, fill:P.muted }),
          ...(sel ? [F(654, 17, 30, 22, P.accent+'22', { r:11, ch:[E(8,5,14,14,P.accent,{})] })] : []),
        ]});
      }),
      T('PERMISSIONS', 60, 574, 300, 12, { size:9, fill:P.muted, ls:2 }),
      F(60, 594, 700, 100, P.surface2, { r:10, stroke:P.border, ch:[
        ...['Read repository contents','Read pull requests & code reviews','Read issues & comments'].map((p,i) => [
          T('✓', 16, 14+i*30, 20, 16, { size:12, fill:P.ok }),
          T(p,   40, 14+i*30, 500, 16, { size:12, fill:P.fg, opacity:0.7 }),
        ]).flat(),
      ]}),
      F(60, 724, 260, 52, P.accent, { r:10, ch:[T('Continue →', 60, 15, 140, 22, { size:15, weight:700, fill:P.bg })] }),
      F(340, 724, 140, 52, P.surface2, { r:10, stroke:P.border, ch:[T('Skip', 42, 15, 56, 22, { size:14, fill:P.muted })] }),
    ]}),
  ]});
}

function dDashboard(ox) {
  const agents = [
    { n:'CODA',  role:'Code Review',  model:'claude-3.5-sonnet', s:'RUNNING', tasks:312, tok:84,  c:P.accent  },
    { n:'LENS',  role:'Data Extract', model:'gpt-4o',            s:'DONE',    tasks:218, tok:61,  c:P.accent2 },
    { n:'FORGE', role:'Test Runner',  model:'claude-3.5-sonnet', s:'RUNNING', tasks:154, tok:42,  c:P.info    },
    { n:'ECHO',  role:'Doc Writer',   model:'gemini-2-flash',    s:'WAITING', tasks:97,  tok:28,  c:P.ok      },
    { n:'RIFT',  role:'API Monitor',  model:'claude-3.5-haiku',  s:'ERROR',   tasks:66,  tok:18,  c:P.hot     },
  ];
  return F(ox, 0, 1440, 900, P.bg, { clip:true, ch:[
    // sidebar
    F(0, 0, 220, 900, P.surface, { ch:[
      VLine(219, 0, 900, P.border),
      T('AETHER', 24, 28, 100, 18, { size:13, weight:800, ls:3 }),
      ...['⊞ Dashboard','⌥ Runs','◑ Analytics','⎈ Settings','? Docs'].map((item,i) =>
        F(12, 72+i*48, 196, 36, i===0?P.accent+'14':'transparent', { r:8, ch:[
          T(item, 16, 8, 164, 20, { size:12, weight:i===0?700:400, fill:i===0?P.accent:P.muted }),
        ]})
      ),
      T('WORKSPACE', 24, 340, 172, 10, { size:7, fill:P.muted, ls:1.5 }),
      T('Acme Corp', 24, 356, 172, 16, { size:12, weight:600 }),
      T('Pro · 5 agents active', 24, 376, 172, 12, { size:9, fill:P.muted }),
    ]}),
    F(220, 0, 1220, 900, P.bg, { ch:[
      F(0, 0, 1220, 60, P.bg, { ch:[
        T('Dashboard', 28, 18, 300, 24, { size:20, weight:800 }),
        Pill(340, 18, 'LIVE', P.ok, 48),
        F(1060, 14, 124, 36, P.accent, { r:8, ch:[T('+ New Agent', 16, 9, 92, 18, { size:12, weight:700, fill:P.bg })] }),
        Line(0, 59, 1220, P.border),
      ]}),
      // KPI bar
      F(28, 76, 1164, 72, P.surface2, { r:12, stroke:P.border, ch:[
        ...['ACTIVE AGENTS','TASKS TODAY','SUCCESS RATE','TOKENS USED','EST. COST'].map((lbl,i) => [
          ...(i>0 ? [VLine(i*232, 16, 40, P.border)] : []),
          T(lbl, 20+i*232, 14, 200, 10, { size:7, fill:P.muted, ls:1.2 }),
          T(['3','847','94%','284k','$8.40'][i], 20+i*232, 28, 200, 28, { size:20, weight:800, fill:[P.accent,P.ok,P.info,P.accent2,P.fg][i] }),
        ]).flat(),
      ]}),
      T('AGENTS', 28, 166, 200, 12, { size:8, fill:P.muted, ls:2 }),
      ...agents.map((a,i) => AgentCardD(28+i*232, 186, a.n, a.role, a.model, a.s, a.tasks, a.tok, a.c)),
      T('ACTIVITY STREAM', 28, 374, 300, 12, { size:8, fill:P.muted, ls:2 }),
      F(28, 392, 740, 484, P.surface2, { r:12, stroke:P.border, ch:[
        F(0, 0, 740, 38, P.surface, { r:12, ch:[
          T('LIVE · Updated just now', 16, 11, 300, 16, { size:10, fill:P.muted }),
          Pill(630, 10, 'LIVE', P.ok, 56),
        ]}),
        ...[
          { t:'00:34', n:'CODA',  c:P.accent,  m:'Completed PR #1247 review · 4 security issues flagged' },
          { t:'00:31', n:'LENS',  c:P.accent2, m:'Extracted 42 data points from analytics.csv · 98.3% confidence' },
          { t:'00:28', n:'FORGE', c:P.info,    m:'Test suite: 847 tests · 2 failures in auth.spec.ts' },
          { t:'00:24', n:'RIFT',  c:P.hot,     m:'⚠ API latency spike on /v2/payments · p99: 2,840ms (threshold: 500ms)' },
          { t:'00:19', n:'ECHO',  c:P.ok,      m:'Generated JSDoc for 12 new functions in src/utils/crypto.ts' },
          { t:'00:15', n:'CODA',  c:P.accent,  m:'Started review of PR #1244 · feature/rate-limiting' },
          { t:'00:11', n:'FORGE', c:P.info,    m:'Seeded test database · 10,000 fixtures loaded in 3.2s' },
          { t:'00:07', n:'LENS',  c:P.accent2, m:'Ingested Q4 revenue data · 3,847 rows processed' },
          { t:'00:03', n:'RIFT',  c:P.hot,     m:'⚠ Rate limit on OpenAI embedding API · retrying...' },
          { t:'00:01', n:'ECHO',  c:P.ok,      m:'Changelog drafted for v2.4.1 · 847 words' },
        ].map((row,i) => [
          T(row.t, 16, 48+i*42, 40, 14, { size:9, fill:P.muted }),
          T(row.n, 62, 48+i*42, 52, 14, { size:10, weight:700, fill:row.c }),
          T(row.m, 118, 48+i*42, 608, 14, { size:10, fill:P.fg, opacity:0.7 }),
          ...(i<9 ? [Line(16, 62+i*42, 708, P.border)] : []),
        ]).flat(),
      ]}),
      F(788, 392, 404, 484, P.surface2, { r:12, stroke:P.border, ch:[
        F(0, 0, 404, 38, P.surface, { r:12, ch:[T('QUICK TASK', 16, 11, 200, 16, { size:10, fill:P.muted, ls:1 })] }),
        T('Describe a task for an agent...', 16, 52, 372, 80, { size:13, fill:P.muted, lh:1.6, opacity:0.7 }),
        F(0, 130, 404, 1, P.border, {}),
        T('ASSIGN TO', 16, 148, 100, 10, { size:7, fill:P.muted, ls:1.5 }),
        ...['CODA','LENS','FORGE'].map((n,i) => {
          const nc = [P.accent,P.accent2,P.info];
          return F(16+i*120, 164, 108, 36, nc[i]+'18', { r:8, stroke:nc[i]+'33', ch:[
            T(n, 16, 8, 76, 20, { size:11, weight:700, fill:nc[i] }),
          ]});
        }),
        T('PRIORITY', 16, 220, 100, 10, { size:7, fill:P.muted, ls:1.5 }),
        ...['Low','Medium','High'].map((p,i) => {
          const pc = [P.ok,P.warn,P.hot];
          const sel = i===1;
          return F(16+i*120, 236, 108, 34, sel?pc[i]+'22':P.surface, { r:8, stroke:sel?pc[i]+'55':P.border, ch:[
            T(p, 24, 8, 60, 18, { size:11, fill:sel?pc[i]:P.muted, weight:sel?700:400 }),
          ]});
        }),
        F(16, 440, 372, 28, P.accent, { r:8, ch:[T('Dispatch Task →', 110, 6, 152, 16, { size:12, weight:700, fill:P.bg })] }),
      ]}),
    ]}),
  ]});
}

function dTaskStream(ox) {
  const logLines = [
    { t:'00:00', m:'Agent CODA initialized · claude-3.5-sonnet · max_tokens: 8192', c:P.muted },
    { t:'00:01', m:'Cloning repo context: acme/auth-service · 847 files indexed', c:P.accent },
    { t:'00:04', m:'Task: Review PR #1247 — auth middleware refactor (14 files changed)', c:P.fg },
    { t:'00:06', m:'Analyzing diff: +842 / -127 lines across src/middleware/', c:P.accent },
    { t:'00:08', m:'→ src/middleware/auth.ts:23 — potential null dereference on JWT decode', c:P.warn },
    { t:'00:09', m:'→ src/middleware/auth.ts:47 — bcrypt.compareSync() deprecated → use async', c:P.warn },
    { t:'00:11', m:'→ src/middleware/auth.ts:91 — hardcoded 3600s expiry → use env var TOKEN_TTL', c:P.warn },
    { t:'00:14', m:'→ src/utils/jwt.ts:112 — no refresh token rotation implemented ⚠ HIGH', c:P.hot },
    { t:'00:16', m:'Running SAST security scan...', c:P.accent },
    { t:'00:20', m:'  ✓ SQL injection: no vectors found (14 queries scanned)', c:P.ok },
    { t:'00:21', m:'  ✓ CSRF protection: tokens present on all 23 mutations', c:P.ok },
    { t:'00:22', m:'  ✓ XSS: output encoding consistent across views', c:P.ok },
    { t:'00:24', m:'  ⚠ Missing rate-limit on POST /auth/login', c:P.warn },
    { t:'00:27', m:'Checking test coverage for changed files...', c:P.accent },
    { t:'00:30', m:'  auth.ts: 81% coverage (threshold 80%) ✓', c:P.ok },
    { t:'00:31', m:'  jwt.ts: 63% coverage (threshold 80%) ✗ — needs 3 more unit tests', c:P.hot },
    { t:'00:33', m:'Generating structured review comment...', c:P.accent },
    { t:'00:34', m:'█', c:P.accent },
  ];
  return F(ox, 0, 1440, 900, P.bg, { clip:true, ch:[
    F(0, 0, 220, 900, P.surface, { ch:[
      VLine(219, 0, 900, P.border),
      T('AETHER', 24, 28, 100, 18, { size:13, weight:800, ls:3 }),
      ...['⊞ Dashboard','⌥ Runs','◑ Analytics','⎈ Settings','? Docs'].map((item,i) =>
        F(12, 72+i*48, 196, 36, i===1?P.accent+'14':'transparent', { r:8, ch:[
          T(item, 16, 8, 164, 20, { size:12, weight:i===1?700:400, fill:i===1?P.accent:P.muted }),
        ]})
      ),
    ]}),
    F(220, 0, 1220, 900, P.bg, { ch:[
      F(0, 0, 1220, 60, P.bg, { ch:[
        F(16, 14, 100, 32, P.surface2, { r:8, stroke:P.border, ch:[T('← All runs', 12, 8, 76, 16, { size:11, fill:P.muted })] }),
        T('CODA · PR #1247 Review', 132, 18, 400, 22, { size:16, weight:700 }),
        Pill(544, 18, 'RUNNING', P.accent),
        Line(0, 59, 1220, P.border),
      ]}),
      F(0, 60, 1220, 56, P.surface, { ch:[
        Line(0, 55, 1220, P.border),
        ...['AGENT','MODEL','ELAPSED','TOKENS IN','TOKENS OUT','ISSUES','STEP'].map((lbl,i) => [
          ...(i>0 ? [VLine(i*160, 10, 35, P.border)] : []),
          T(lbl, 16+i*160, 10, 140, 10, { size:7, fill:P.muted, ls:1 }),
          T(['CODA','claude-3.5-sonnet','0:34','6,847','1,284','4','4/6'][i], 16+i*160, 24, 140, 22, { size:13, weight:700, fill:[P.accent,P.fg,P.fg,P.accent2,P.accent,P.hot,P.warn][i] }),
        ]).flat(),
      ]}),
      F(16, 134, 780, 740, P.surface, { r:12, stroke:P.border, ch:[
        F(0, 0, 780, 36, P.surface2, { r:12, ch:[
          E(14, 12, 12, 12, P.hot+'AA',  {}),
          E(32, 12, 12, 12, P.warn+'AA', {}),
          E(50, 12, 12, 12, P.ok+'AA',   {}),
          T('EXECUTION STREAM · CODA · claude-3.5-sonnet', 74, 10, 500, 16, { size:9, fill:P.muted, ls:0.5 }),
          T('⏬ Export log', 672, 8, 96, 20, { size:9, fill:P.muted }),
        ]}),
        ...logLines.map((l,i) => [
          T(l.t,  16, 48+i*36, 44, 16, { size:9, fill:P.muted }),
          T(l.m,  66, 48+i*36, 702, 16, { size:10, fill:l.c, opacity:l.c===P.muted?0.5:0.85 }),
        ]).flat(),
      ]}),
      F(812, 134, 392, 740, P.surface2, { r:12, stroke:P.border, ch:[
        T('CONTEXT', 16, 16, 200, 12, { size:8, fill:P.muted, ls:2 }),
        F(16, 36, 360, 90, P.surface, { r:10, ch:[
          T('PR #1247', 14, 12, 200, 14, { size:10, fill:P.accent, weight:700 }),
          T('feat: auth middleware refactor', 14, 30, 332, 16, { size:12, weight:600 }),
          T('acme/auth-service · main ← feature/auth', 14, 50, 332, 12, { size:9, fill:P.muted }),
          T('14 files · +842 / -127 lines', 14, 66, 332, 12, { size:9, fill:P.muted }),
        ]}),
        T('ISSUES FOUND', 16, 142, 200, 12, { size:8, fill:P.muted, ls:2 }),
        ...[
          { sev:'HIGH', loc:'jwt.ts:112',  msg:'No refresh token rotation' },
          { sev:'MED',  loc:'auth.ts:47',  msg:'Sync bcrypt → use async' },
          { sev:'MED',  loc:'auth.ts:23',  msg:'Null dereference on JWT' },
          { sev:'LOW',  loc:'auth.ts:91',  msg:'Hardcoded expiry 3600s' },
        ].map((issue,i) => {
          const sc = { HIGH:P.hot, MED:P.warn, LOW:P.ok }[issue.sev];
          return F(16, 162+i*58, 360, 48, P.surface, { r:8, ch:[
            Pill(12, 10, issue.sev, sc, 38),
            T(issue.loc, 58, 8, 200, 12, { size:9, fill:P.muted }),
            T(issue.msg, 12, 30, 336, 14, { size:11, fill:P.fg, opacity:0.7 }),
          ]});
        }),
        T('TOKEN BUDGET', 16, 402, 200, 12, { size:8, fill:P.muted, ls:2 }),
        F(16, 420, 360, 60, P.surface, { r:8, ch:[
          T('8,131 / 32,768', 12, 10, 200, 14, { size:11 }),
          T('25% used', 290, 10, 70, 14, { size:9, fill:P.muted }),
          ...ProgBar(12, 32, 336, 0.25, P.accent),
        ]}),
        F(16, 500, 172, 40, P.hot+'1A', { r:8, stroke:P.hot+'33', ch:[T('⏹ Stop', 44, 10, 84, 20, { size:12, fill:P.hot, weight:600 })] }),
        F(204, 500, 172, 40, P.surface, { r:8, stroke:P.border, ch:[T('↻ Restart', 40, 10, 92, 20, { size:12 })] }),
        F(16, 558, 360, 40, P.accent, { r:8, ch:[T('Post Review to GitHub →', 80, 11, 200, 18, { size:12, weight:700, fill:P.bg })] }),
      ]}),
    ]}),
  ]});
}

function dAnalytics(ox) {
  const Spark = (x, y, vals, color, bw=10, h=40) =>
    vals.map((v,i) => F(x+i*(bw+2), y+(h-Math.round(v*h)), bw, Math.round(v*h), color, { r:2, opacity:0.4+v*0.6 }));
  const tV = [0.3,0.5,0.4,0.7,0.65,0.8,0.9,0.75,0.85,1.0,0.92,0.88,0.95,0.78,0.9,0.85,0.72,0.95,0.8,0.88];
  const tkV= [0.4,0.6,0.5,0.7,0.8,0.6,0.9,0.85,0.7,0.95,0.88,0.92,0.8,0.75,0.85,0.9,0.95,1.0,0.88,0.93];
  const cV = [0.2,0.35,0.3,0.5,0.45,0.6,0.7,0.55,0.65,0.8,0.72,0.68,0.75,0.62,0.7,0.65,0.55,0.75,0.6,0.68];

  return F(ox, 0, 1440, 900, P.bg, { clip:true, ch:[
    F(0, 0, 220, 900, P.surface, { ch:[
      VLine(219, 0, 900, P.border),
      T('AETHER', 24, 28, 100, 18, { size:13, weight:800, ls:3 }),
      ...['⊞ Dashboard','⌥ Runs','◑ Analytics','⎈ Settings','? Docs'].map((item,i) =>
        F(12, 72+i*48, 196, 36, i===2?P.accent+'14':'transparent', { r:8, ch:[
          T(item, 16, 8, 164, 20, { size:12, weight:i===2?700:400, fill:i===2?P.accent:P.muted }),
        ]})
      ),
    ]}),
    F(220, 0, 1220, 900, P.bg, { ch:[
      F(0, 0, 1220, 60, P.bg, { ch:[
        T('Analytics', 28, 18, 300, 24, { size:20, weight:800 }),
        F(900, 14, 196, 32, P.surface2, { r:8, stroke:P.border, ch:[
          F(4, 4, 56, 24, P.accent+'22', { r:6, ch:[T('7 days', 6, 4, 44, 16, { size:10, fill:P.accent, weight:700 })] }),
          T('30d', 72, 8, 40, 16, { size:10, fill:P.muted }),
          T('90d', 118, 8, 40, 16, { size:10, fill:P.muted }),
          T('All', 162, 8, 30, 16, { size:10, fill:P.muted }),
        ]}),
        F(1112, 14, 80, 32, P.surface2, { r:8, stroke:P.border, ch:[T('Export', 14, 8, 52, 16, { size:11 })] }),
        Line(0, 59, 1220, P.border),
      ]}),
      ...['284,112','847','94.2%','$58.40','1m 12s'].map((val,i) =>
        F(28+i*236, 76, 220, 88, P.surface2, { r:12, stroke:P.border, ch:[
          T(['TOTAL TOKENS','TASKS DONE','SUCCESS RATE','TOTAL COST','AVG TASK TIME'][i], 16, 14, 188, 10, { size:7, fill:P.muted, ls:1.2 }),
          T(val, 16, 30, 188, 28, { size:20, weight:800, fill:[P.accent,P.ok,P.info,P.accent2,P.fg][i] }),
          T(['+18%','+31%','+4.2%','+8%','-12%'][i], 16, 62, 80, 14, { size:11, fill:[P.ok,P.ok,P.ok,P.warn,P.ok][i], weight:600 }),
          T('vs last period', 68, 62, 120, 14, { size:9, fill:P.muted }),
        ]})
      ),
      F(28, 180, 560, 180, P.surface2, { r:12, stroke:P.border, ch:[
        T('TOKEN USAGE', 20, 16, 300, 12, { size:8, fill:P.muted, ls:2 }),
        T('284,112 tokens', 20, 34, 300, 22, { size:18, weight:700, fill:P.accent }),
        T('↑ 18% vs last week', 20, 58, 200, 14, { size:11, fill:P.ok }),
        ...Spark(20, 120, tV, P.accent, 24, 48),
      ]}),
      F(608, 180, 560, 180, P.surface2, { r:12, stroke:P.border, ch:[
        T('TASK THROUGHPUT', 20, 16, 300, 12, { size:8, fill:P.muted, ls:2 }),
        T('847 tasks', 20, 34, 300, 22, { size:18, weight:700, fill:P.ok }),
        T('↑ 31% vs last week', 20, 58, 200, 14, { size:11, fill:P.ok }),
        ...Spark(20, 120, tkV, P.ok, 24, 48),
      ]}),
      F(28, 376, 280, 180, P.surface2, { r:12, stroke:P.border, ch:[
        T('COST TREND', 20, 16, 200, 12, { size:8, fill:P.muted, ls:2 }),
        T('$58.40', 20, 34, 200, 22, { size:18, weight:700, fill:P.accent2 }),
        T('↑ 8% vs last week', 20, 58, 200, 14, { size:11, fill:P.warn }),
        ...Spark(20, 120, cV, P.accent2, 12, 44),
      ]}),
      F(324, 376, 280, 180, P.surface2, { r:12, stroke:P.border, ch:[
        T('MODEL MIX', 20, 16, 200, 12, { size:8, fill:P.muted, ls:2 }),
        ...['claude-3.5-sonnet','gpt-4o','gemini-2-flash','claude-3.5-haiku'].map((m,i) => {
          const pcts = [0.58,0.22,0.12,0.08];
          const nc   = [P.accent,P.info,P.ok,P.accent2];
          return [
            T(m, 20, 40+i*32, 160, 14, { size:10, fill:P.fg, opacity:0.7 }),
            T(Math.round(pcts[i]*100)+'%', 222, 40+i*32, 38, 14, { size:10, fill:nc[i], weight:700, align:'right' }),
            ...ProgBar(20, 56+i*32, 240, pcts[i], nc[i]),
          ];
        }).flat(),
      ]}),
      F(620, 376, 572, 180, P.surface2, { r:12, stroke:P.border, ch:[
        T('AGENT PERFORMANCE', 16, 14, 300, 12, { size:8, fill:P.muted, ls:2 }),
        T('AGENT', 16, 34, 80, 12, { size:8, fill:P.muted }),
        T('TASKS', 110, 34, 60, 12, { size:8, fill:P.muted }),
        T('WIN%', 180, 34, 60, 12, { size:8, fill:P.muted }),
        T('TOKENS', 258, 34, 60, 12, { size:8, fill:P.muted }),
        T('AVG TIME', 340, 34, 80, 12, { size:8, fill:P.muted }),
        T('STATUS', 440, 34, 60, 12, { size:8, fill:P.muted }),
        Line(16, 50, 540, P.border),
        ...['CODA','LENS','FORGE','ECHO','RIFT'].map((n,i) => {
          const nc = [P.accent,P.accent2,P.info,P.ok,P.hot];
          const sc = { RUNNING:P.accent, DONE:P.ok, WAITING:P.warn, ERROR:P.hot };
          const ss = ['RUNNING','DONE','RUNNING','WAITING','ERROR'];
          return [
            T(n, 16, 60+i*22, 80, 14, { size:11, weight:700, fill:nc[i] }),
            T([312,218,154,97,66][i].toString(), 110, 60+i*22, 60, 14, { size:11 }),
            T(['98%','100%','91%','87%','74%'][i], 180, 60+i*22, 60, 14, { size:11, fill:[P.ok,P.ok,P.ok,P.warn,P.warn][i] }),
            T(['84k','61k','42k','28k','18k'][i], 258, 60+i*22, 60, 14, { size:11, fill:P.muted }),
            T(['1m12s','43s','3m8s','2m44s','5m2s'][i], 340, 60+i*22, 80, 14, { size:10, fill:P.muted }),
            Pill(440, 56+i*22, ss[i], sc[ss[i]], 60),
          ];
        }).flat(),
      ]}),
    ]}),
  ]});
}

// ── Assemble doc ──────────────────────────────────────────────────────────────
const MOBILE_W  = 375;
const DESKTOP_W = 1440;
const GAP       = 40;

let offsetX = 0;
const children = [];
[mLanding,mOnboarding,mDashboard,mTaskStream,mAnalytics].forEach(fn => {
  children.push(fn(offsetX));
  offsetX += MOBILE_W + GAP;
});
offsetX += GAP * 2;
[dLanding,dOnboarding,dDashboard,dTaskStream,dAnalytics].forEach(fn => {
  children.push(fn(offsetX));
  offsetX += DESKTOP_W + GAP;
});

const doc = { version:'2.8', width:offsetX, height:900, children };
// Use compact JSON to keep file size under ZenBin's 512 KB limit
const penJson = JSON.stringify(doc);
fs.writeFileSync(path.join(__dirname, 'aether-app.pen'), penJson);
console.log(`✓ aether-app.pen  (${(penJson.length/1024).toFixed(1)} KB compact, ${children.length} screens)`);

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function lightenHex(hex, amt) {
  const n = parseInt((hex||'#111').replace('#',''), 16);
  const r = Math.min(255, (n>>16)+amt);
  const g = Math.min(255, ((n>>8)&0xff)+amt);
  const b = Math.min(255, (n&0xff)+amt);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const surface = lightenHex(P.bg, 14);
const border  = lightenHex(P.bg, 28);
// Compact pen for embedding (base64) - fits in hero HTML under 512 KB limit
const encoded = Buffer.from(penJson).toString('base64');

function screenThumbSVG(screen, tw, th) {
  const scale = Math.min(tw/screen.width, th/screen.height);
  function col(c) {
    if (!c||c==='transparent') return 'none';
    return c.startsWith('#') ? c.slice(0,7) : '#888';
  }
  function node2svg(n, depth=0) {
    if (depth>12) return '';
    const x=(n.x||0)*scale, y=(n.y||0)*scale;
    const w=Math.max(1,(n.width||0)*scale), h=Math.max(1,(n.height||0)*scale);
    const r=(n.cornerRadius||0)*scale;
    const op=n.opacity!==undefined?n.opacity:1;
    let s='';
    if (n.type==='frame') {
      const cid=n.clip?`c${n.id}`:null;
      if (cid) s+=`<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>`;
      s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${col(n.fill)}" opacity="${op}"/>`;
      if (n.stroke) s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${col(n.stroke.fill)}" stroke-width="${(n.stroke.thickness||1)*scale}" opacity="0.6"/>`;
      if (n.children&&n.children.length) {
        const inner=n.children.map(c=>node2svg({...c,x:(n.x||0)+(c.x||0),y:(n.y||0)+(c.y||0)},depth+1)).join('');
        s+=cid?`<g clip-path="url(#${cid})">${inner}</g>`:inner;
      }
    } else if (n.type==='ellipse') {
      s+=`<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${col(n.fill)}" opacity="${op}"/>`;
    } else if (n.type==='text') {
      const sz=Math.max(1,(n.fontSize||12)*scale);
      if (sz<0.8) return '';
      const ta=n.textAlign==='center'?'middle':'start';
      const cx=n.textAlign==='center'?x+w/2:x;
      const txt=(n.content||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])).split('\n')[0].substring(0,40);
      s+=`<text x="${cx}" y="${y+sz}" font-size="${sz}" fill="${col(n.fill)}" font-weight="${n.fontWeight||400}" text-anchor="${ta}" opacity="${op}" font-family="monospace">${txt}</text>`;
    }
    return s;
  }
  return `<svg width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}" xmlns="http://www.w3.org/2000/svg" style="border-radius:6px;overflow:hidden;display:block">${node2svg(screen)}</svg>`;
}

const THUMB_H = 180;
const SCREEN_LABELS = ['LANDING','ONBOARDING','DASHBOARD','TASK STREAM','ANALYTICS'];
const thumbsHTML = doc.children.map((s,i) => {
  const tw = Math.round(THUMB_H * (s.width/s.height));
  const mobile = s.width < 500;
  const lbl = `${mobile?'MOBILE':'DESKTOP'} · ${SCREEN_LABELS[i%5]}`;
  return `<div style="text-align:center;flex-shrink:0">
    ${screenThumbSVG(s,tw,THUMB_H)}
    <div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${lbl}</div>
  </div>`;
}).join('');

const cssTokens = `:root {
  /* Color */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface-2: ${P.surface2};
  --color-border:    ${P.border};
  --color-fg:        ${P.fg};
  --color-primary:   ${P.accent};
  --color-secondary: ${P.accent2};
  --color-success:   ${P.ok};
  --color-warning:   ${P.warn};
  --color-danger:    ${P.hot};
  --color-info:      ${P.info};

  /* Typography */
  --font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 6vw, 80px) / 1 var(--font-family);
  --font-heading:  700 24px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  400 9px / 1 var(--font-family);

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;   --space-3: 16px;
  --space-4: 24px; --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 4px;  --radius-md: 8px;  --radius-lg: 12px;  --radius-full: 9999px;

  /* Agent tokens */
  --agent-coda:  ${P.accent};
  --agent-lens:  ${P.accent2};
  --agent-forge: ${P.info};
  --agent-echo:  ${P.ok};
  --agent-rift:  ${P.hot};
}`;

const PROMPT = `Design AETHER — a dark-mode agentic AI workflow orchestrator inspired by JetBrains Air (lapa.ninja/post/air-dev/) and Forge/Linear from darkmodedesign.com. Deep space black + JetBrains Air teal (#00D4AA) + Forge violet (#8B5CF6) palette. JetBrains Mono typography throughout. Terminal bento-grid hybrid: 5 screens — landing hero, repo onboarding, multi-agent bento dashboard with live activity stream, terminal task execution view with split context panel, analytics with sparklines and agent performance table.`;

const shareText = encodeURIComponent('AETHER — Agentic AI Orchestrator. Dark terminal UI, bento grid, parallel agent streams. Designed by RAM Design Studio');

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AETHER — Agentic AI Orchestrator · RAM Design Studio</title>
<meta name="description" content="${TAGLINE} — 10 screens, brand spec, CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'JetBrains Mono','SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px}
  .nav-id{font-size:11px;color:${P.accent};letter-spacing:1px}
  .hero{padding:80px 40px 40px;max-width:920px}
  .tag{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:20px}
  h1{font-size:clamp(48px,7vw,88px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:20px}
  h1 span{color:${P.accent}}
  .sub{font-size:15px;opacity:.5;max-width:500px;line-height:1.7;margin-bottom:36px}
  .meta{display:flex;gap:32px;margin-bottom:44px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:9px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:${P.accent};font-size:13px}
  .actions{display:flex;gap:12px;margin-bottom:60px;flex-wrap:wrap}
  .btn{padding:12px 24px;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:${P.accent};color:${P.bg}}
  .btn-p:hover{opacity:0.9}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.accent}66}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.accent};margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid ${border}}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:${P.accent}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:900px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:10px;flex-wrap:wrap}
  .tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:10px;line-height:1.8;color:${P.fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.accent}22;border:1px solid ${P.accent}44;color:${P.accent};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.accent}33}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:12px}
  .p-text{font-size:17px;opacity:.55;font-style:italic;max-width:620px;line-height:1.65;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:780px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.accent};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;opacity:.65;line-height:1.8;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:4px}
  .prd-section strong{opacity:1;color:${P.fg}}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.accent};color:${P.bg};font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">HEARTBEAT · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
</nav>
<section class="hero">
  <div class="tag">DESIGN CHALLENGE · AGENTIC AI · TERMINAL BENTO · 10 SCREENS</div>
  <h1>AETHER<br><span>Orchestrate.</span></h1>
  <p class="sub">${TAGLINE}</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>ARCHETYPE</span><strong>DARK TERMINAL / AGENTIC AI</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>DEEP SPACE + TEAL + VIOLET</strong></div>
    <div class="meta-item"><span>TYPOGRAPHY</span><strong>JETBRAINS MONO</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <a class="btn btn-s" href="https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent('https://ram.zenbin.org/'+SLUG)}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">← Gallery</a>
  </div>
</section>
<section class="preview">
  <div class="section-label">SCREEN PREVIEWS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>
<section class="brand-section">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:20px">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          {hex:P.bg,    role:'BG'},
          {hex:P.surface,role:'SURFACE'},
          {hex:P.fg,    role:'FG'},
          {hex:P.accent,role:'TEAL'},
          {hex:P.accent2,role:'VIOLET'},
          {hex:P.ok,    role:'SUCCESS'},
          {hex:P.warn,  role:'WARN'},
          {hex:P.hot,   role:'DANGER'},
        ].map(sw=>`<div style="min-width:72px">
          <div style="height:56px;border-radius:8px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
          <div style="font-size:8px;letter-spacing:1px;opacity:.4;margin-bottom:3px">${sw.role}</div>
          <div style="font-size:11px;font-weight:700;color:${P.accent}">${sw.hex}</div>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:20px">TYPE SCALE</div>
      ${[
        {label:'DISPLAY', size:'52px', weight:'900', sample:'AETHER'},
        {label:'HEADING', size:'24px', weight:'700', sample:'Agentic Orchestration'},
        {label:'BODY',    size:'14px', weight:'400', sample:'Run parallel AI agents. See every task.'},
        {label:'MONO/UI', size:'10px', weight:'400', sample:'AGENT · STATUS · TOKEN COUNT'},
      ].map(t=>`<div style="padding:14px 0;border-bottom:1px solid ${border}">
        <div style="font-size:8px;letter-spacing:2px;opacity:.4;margin-bottom:6px">${t.label} · ${t.size} / ${t.weight}</div>
        <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.15;color:${P.fg};overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <div style="font-size:9px;letter-spacing:2px;color:${P.accent};margin-bottom:16px">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre" id="tokens-pre">${cssTokens.replace(/</g,'&lt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>
<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text">"${PROMPT}"</p>
  <button class="btn btn-s" style="font-size:11px" onclick="copyPrompt()">Copy prompt</button>
</section>
<section class="prd-section">
  <h3>OVERVIEW</h3>
  <p>AETHER is a dark-mode agentic AI workflow orchestrator for engineering teams who want to run multiple AI agents in parallel against their codebase. Each agent executes independent task loops — code review, testing, documentation, API monitoring — with live streaming terminal output and a unified bento-grid dashboard. The terminal aesthetic, drawn from JetBrains Air and Linear/Forge's dark design language, makes complex multi-agent state legible at a glance.</p>

  <h3>TARGET USERS</h3>
  <ul>
    <li><strong>Platform engineers</strong> automating code quality workflows across large monorepos</li>
    <li><strong>ML/AI teams</strong> orchestrating data extraction and evaluation pipelines</li>
    <li><strong>Startup CTOs</strong> replacing 2–3 headcount with agentic automation</li>
    <li><strong>DevOps teams</strong> combining API monitoring with AI-generated incident summaries</li>
  </ul>

  <h3>CORE FEATURES</h3>
  <ul>
    <li><strong>Multi-agent bento grid</strong> — live status cards per agent: progress bar, token count, task metadata</li>
    <li><strong>Terminal stream view</strong> — real-time execution log with timestamped entries and color-coded severity</li>
    <li><strong>Repository connector</strong> — read-only OAuth integration with GitHub, GitLab, Bitbucket</li>
    <li><strong>Quick task dispatch</strong> — natural language task assignment from dashboard to any agent</li>
    <li><strong>Analytics</strong> — token usage, task throughput, success rates, cost per agent, model breakdown</li>
  </ul>

  <h3>DESIGN LANGUAGE</h3>
  <p>Deep space black (#07090E) base with two accent axes: teal (#00D4AA) for active state and primary actions — inspired directly by JetBrains Air's palette — and violet (#8B5CF6) from Forge's dark creative tool UI. JetBrains Mono throughout reinforces the developer-tool signal. Color is semantic: teal = active/running, violet = AI/data classification, green = success, amber = warning, red = error/critical. The terminal bento hybrid is a novel pattern — bento-grid agent cards from godly.website's avant-garde compositions, married to Linear-style dark precision information density.</p>

  <h3>SCREEN ARCHITECTURE</h3>
  <ul>
    <li><strong>Landing</strong> — Hero with live agent preview strip, dual CTAs, social proof</li>
    <li><strong>Onboarding</strong> — 3-step wizard sidebar: connect repo → configure agents → invite team</li>
    <li><strong>Dashboard</strong> — KPI bar + bento agent grid + activity stream + quick task dispatch panel</li>
    <li><strong>Task Stream</strong> — Full terminal log + split context panel (PR metadata, issues, token budget, actions)</li>
    <li><strong>Analytics</strong> — KPI row + sparkline charts (tokens, throughput, cost) + model mix + agent perf table</li>
  </ul>
</section>
<footer>
  <span>RAM Design Studio · heartbeat challenge · March 2026</span>
  <span>ram.zenbin.org/${SLUG}</span>
</footer>
<script>
const D='${encoded}';
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function openInViewer(){try{const j=atob(D);JSON.parse(j);localStorage.setItem('pv_pending',JSON.stringify({json:j,name:'aether-app.pen'}));window.open('https://zenbin.org/p/pen-viewer-2','_blank');}catch(e){alert('Viewer error: '+e.message);}}
function downloadPen(){try{const j=atob(D);const b=new Blob([j],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='aether-app.pen';a.click();URL.revokeObjectURL(a.href);toast('Downloaded ✓');}catch(e){alert(e.message);}}
function copyPrompt(){navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('Prompt copied ✓'));}
function copyTokens(){navigator.clipboard.writeText(document.getElementById('tokens-pre').textContent).then(()=>toast('Tokens copied ✓'));}
<\/script>
</body>
</html>`;

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpReq({
    hostname: 'zenbin.org',
    path:     `/v1/pages/${slug}`,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain':    'ram',
    },
  }, body);
}

async function pushToGallery(heroUrl) {
  try {
    const qRes = await httpReq({
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'GET',
      headers:  { 'User-Agent':'RAM-Design-Bot','Authorization':`token ${GITHUB_TOKEN}`,'Accept':'application/vnd.github.v3+json' },
    });
    const qData = JSON.parse(qRes.body);
    const queue = JSON.parse(Buffer.from(qData.content,'base64').toString());
    queue.submissions = queue.submissions || [];
    queue.submissions.push({
      id:           `hb-aether-${Date.now()}`,
      prompt:       PROMPT.slice(0,200),
      app_name:     APP_NAME,
      archetype:    'dark-terminal-agentic',
      credit:       'RAM Studio Heartbeat',
      submitted_at: new Date().toISOString(),
      status:       'done',
      design_url:   heroUrl,
      published_at: new Date().toISOString(),
    });
    const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const upRes = await httpReq({
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'PUT',
      headers: { 'User-Agent':'RAM-Design-Bot','Authorization':`token ${GITHUB_TOKEN}`,'Content-Type':'application/json','Accept':'application/vnd.github.v3+json' },
    }, JSON.stringify({ message:'heartbeat: AETHER agentic orchestrator published', content, sha:qData.sha }));
    console.log(`  ${upRes.status===200||upRes.status===201?'✓':'⚠'} Gallery ${upRes.status}`);
  } catch(e) { console.log(`  ⚠ Gallery: ${e.message}`); }
}

(async () => {
  console.log('\n🤖 AETHER — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Hero HTML:   ${(heroHTML.length/1024).toFixed(1)} KB`);

  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection+'\n<script>');

  console.log('\n  📤 Hero   → ram.zenbin.org/'+SLUG+' ...');
  const r1 = await publish(SLUG, 'AETHER — Agentic AI Orchestrator · RAM Design Studio', heroHTML);
  const heroOk = r1.status===200||r1.status===201;
  console.log(`  ${heroOk?'✓':'✗'} HTTP ${r1.status}`);
  if (!heroOk) console.log(`     ${r1.body.slice(0,300)}`);

  console.log('  📤 Viewer → ram.zenbin.org/'+SLUG+'-viewer (optional, may hit page limit)...');
  const r2 = await publish(`${SLUG}-viewer`, 'AETHER — Viewer · RAM Design Studio', viewerHtml);
  const viewerOk = r2.status===200||r2.status===201;
  if (viewerOk) console.log(`  ✓ HTTP ${r2.status}`);
  else console.log(`  ⚠ HTTP ${r2.status} (viewer uses localStorage fallback on hero page)`);

  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log('\n  📋 Pushing to gallery queue...');
  await pushToGallery(heroUrl);

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log('\n✅ Pipeline complete');
})();
