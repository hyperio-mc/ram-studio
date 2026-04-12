// flux-app.js — FLUX developer dashboard
// Theme: DARK — near-black blue-tinted #0C0E14 + terminal green #00E676 + electric amber #FFB300
// Inspired by:
//   Utopia Tokyo (utopiatokyo.com, Awwwards SOTD Mar 29 2026) — dark navy #14171F, PPMori font,
//     terminal bracket notation [ BUTTON ], scattered monospace labels [LOADING], glitch aesthetic,
//     "MASKED. MARKED. WATCHED." high-contrast structural composition
//   Sutera (sutera.ch) — "Reality, By Design", "BLUEPRINT REALITY", structural XR agency aesthetic
// Concept: Real-time infrastructure monitoring + deployment dashboard.
//   Terminal bracket notation for all status labels: [OK] [WARN] [CRIT] [INFO] [LIVE]
//   Every datum bracketed, every label bracketed. Pure mono-dominant type system.
//   5 screens: Overview, Services, Logs, Deploy, Profile
// Fonts: Geist (NEW) + Geist Mono (NEW) — Vercel's clean system, both first use in heartbeat series

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// Palette
const BG      = '#0C0E14';
const SURFACE = '#141820';
const DEEP    = '#0A0C11';
const BORDER  = '#1E2435';
const GREEN   = '#00E676';
const AMBER   = '#FFB300';
const RED     = '#FF4D4D';
const CYAN    = '#38BDF8';
const TEXT    = '#E2E8F0';
const MUTED   = '#4B5A6F';
const DIM     = '#1A2030';
const GHOST   = '#2A3550';

const SANS = 'Geist';
const MONO = 'Geist Mono';

let nodes = [];
let id = 1;

function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({
    type: 'RECTANGLE', id: `node_${id++}`, name,
    x, y, width: w, height: h, fill,
    cornerRadius: opts.cr || 0,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
  });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({
    type: 'TEXT', id: `node_${id++}`, name,
    x, y, width: w, content, fontSize: size, color,
    font: opts.font || MONO,
    weight: opts.weight || 400,
    align: opts.align || 'left',
    lh: opts.lh || 1.4,
    ls: opts.ls || 0.02,
  });
}

function mono(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, { font: MONO, ls: 0.02, ...opts });
}

function statusAccent(sx, color) {
  rect(`accent-${sx}`, sx, 0, W, 2, color);
}

function header(sx, label, sub, rightLabel, rightColor) {
  rect(`hdr-bg-${sx}`, sx, 0, W, 72, BG);
  mono(`hdr-title-${sx}`, sx + 20, 24, 200, label, 17, TEXT, { weight: 700, ls: 0.01 });
  mono(`hdr-sub-${sx}`,   sx + 20, 47, W - 40, sub, 8, MUTED, { ls: 0.06 });
  if (rightLabel) {
    mono(`hdr-right-${sx}`, sx + W - 90, 24, 84, rightLabel, 9, rightColor || MUTED, { align: 'right' });
  }
  rect(`hdr-div-${sx}`, sx + 20, 70, W - 40, 1, BORDER);
}

function bottomNav(sx, active) {
  rect(`nav-bg-${sx}`,  sx, H - 60, W, 60, SURFACE);
  rect(`nav-top-${sx}`, sx, H - 61, W, 1, BORDER);
  const tabs = [
    { label: '[OV]',  full: 'OVERVIEW'  },
    { label: '[SVC]', full: 'SERVICES'  },
    { label: '[LOG]', full: 'LOGS'      },
    { label: '[DEP]', full: 'DEPLOY'    },
    { label: '[ME]',  full: 'PROFILE'   },
  ];
  const navColors = [GREEN, CYAN, AMBER, GREEN, MUTED];
  const tw = Math.floor(W / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = sx + i * tw;
    const isActive = i === active;
    const col = isActive ? navColors[i] : MUTED;
    mono(`nav-lbl-${sx}-${i}`,  tx, H - 44, tw, tab.label, 9, col, { align: 'center', weight: isActive ? 700 : 400 });
    mono(`nav-full-${sx}-${i}`, tx, H - 27, tw, tab.full,  6, col, { align: 'center', ls: 0.08 });
    if (isActive) rect(`nav-ind-${sx}-${i}`, tx + tw/2 - 12, H - 12, 24, 2, col, { cr: 1 });
  });
}

// SCREEN 0 — OVERVIEW
function screenOverview(sx) {
  rect(`s0-bg`, sx, 0, W, H, BG);
  statusAccent(sx, GREEN);
  header(sx, '[FLUX]', 'SYSTEM DASHBOARD — MON 30 MAR 2026', '[ALL SYSTEMS ↑]', GREEN);

  const metrics = [
    { label: '[CPU]',  val: '72%',  bar: 0.72, col: AMBER },
    { label: '[MEM]',  val: '48%',  bar: 0.48, col: GREEN },
    { label: '[NET]',  val: '12ms', bar: 0.30, col: CYAN  },
  ];
  const cw = Math.floor((W - 48) / 3);
  metrics.forEach((m, i) => {
    const cx = sx + 16 + i * (cw + 8);
    rect(`s0-card-${i}`,      cx,      82,  cw, 80, SURFACE, { cr: 6, stroke: m.col, sw: 0.5 });
    mono(`s0-card-lbl-${i}`,  cx + 10, 94,  cw, m.label, 8, m.col);
    mono(`s0-card-val-${i}`,  cx + 10, 113, cw, m.val,   20, TEXT, { weight: 700, lh: 1 });
    rect(`s0-bar-bg-${i}`,    cx + 10, 152, cw - 20, 4, DIM, { cr: 2 });
    rect(`s0-bar-fill-${i}`,  cx + 10, 152, Math.round((cw - 20) * m.bar), 4, m.col, { cr: 2 });
    mono(`s0-bar-num-${i}`,   cx + 10, 160, cw - 10, `${Math.round(m.bar * 100)}%`, 6, MUTED);
  });

  rect(`s0-chart-bg`, sx + 16, 176, W - 32, 128, SURFACE, { cr: 6, stroke: BORDER, sw: 1 });
  mono(`s0-chart-lbl`, sx + 26, 188, W - 52, '[LOAD AVERAGE — LAST 24H]', 8, MUTED, { ls: 0.06 });
  const chartX = sx + 26, chartY = 208, chartW2 = W - 52, chartH = 70;
  rect(`s0-chart-inner`, chartX, chartY, chartW2, chartH, DEEP, { cr: 3 });
  [0, 0.33, 0.66, 1].forEach((t, gi) => {
    rect(`s0-grid-${gi}`, chartX, chartY + Math.round(t * (chartH - 2)), chartW2, 1, BORDER);
  });
  const barVals = [0.28, 0.45, 0.38, 0.62, 0.75, 0.58, 0.80, 0.72, 0.68, 0.74, 0.70, 0.72];
  const bw = Math.floor(chartW2 / barVals.length) - 2;
  barVals.forEach((v, bi) => {
    const bx = chartX + bi * (bw + 2);
    const bh = Math.round(v * (chartH - 8) * 0.9);
    rect(`s0-bar-c-${bi}`, bx, chartY + chartH - bh - 2, bw, bh,
      v > 0.7 ? AMBER : GREEN, { cr: 1, op: 0.3 + v * 0.5 });
  });
  mono(`s0-chart-t0`, chartX,                    chartY + chartH + 5, 40, '00:00', 7, MUTED);
  mono(`s0-chart-t1`, chartX + chartW2 - 36,     chartY + chartH + 5, 40, '23:59', 7, MUTED);

  mono(`s0-svc-lbl`, sx + 16, 318, 120, '[SERVICES]', 8, CYAN, { ls: 0.08 });
  mono(`s0-svc-cnt`, sx + W - 90, 318, 80, '12 RUNNING', 8, MUTED, { align: 'right' });

  const svcs = [
    { name: 'api-gateway',   status: '[OK]',   col: GREEN, lat: '8ms'   },
    { name: 'auth-service',  status: '[OK]',   col: GREEN, lat: '3ms'   },
    { name: 'data-pipeline', status: '[WARN]', col: AMBER, lat: '240ms' },
    { name: 'cdn-edge',      status: '[OK]',   col: GREEN, lat: '2ms'   },
  ];
  svcs.forEach((svc, i) => {
    const sy = 332 + i * 52;
    rect(`s0-svc-bg-${i}`,  sx + 16, sy, W - 32, 44, SURFACE, { cr: 4, stroke: i === 2 ? AMBER : BORDER, sw: 1 });
    rect(`s0-svc-bar-${i}`, sx + 16, sy, 3, 44, svc.col, { cr: 2 });
    mono(`s0-svc-name-${i}`, sx + 28, sy + 9,  W - 80, svc.name,   11, TEXT, { weight: 600 });
    mono(`s0-svc-stat-${i}`, sx + 28, sy + 27, 80,     svc.status,  8, svc.col);
    mono(`s0-svc-lat-${i}`,  sx + W - 64, sy + 15, 48, svc.lat,    13, TEXT, { weight: 700, align: 'right' });
  });

  bottomNav(sx, 0);
}

// SCREEN 1 — SERVICES
function screenServices(sx) {
  rect(`s1-bg`, sx, 0, W, H, BG);
  statusAccent(sx, CYAN);
  header(sx, '[SERVICES]', '12 RUNNING  ·  1 WARNING  ·  0 CRITICAL', '[HEALTHY]', GREEN);

  const filters = ['[ALL]', '[OK]', '[WARN]', '[CRIT]'];
  const fCols   = [TEXT,    GREEN,  AMBER,    RED];
  filters.forEach((f, i) => {
    const fx = sx + 16 + i * 84;
    const active = i === 0;
    rect(`s1-f-bg-${i}`, fx, 78, 76, 26, active ? DIM : 'transparent', { cr: 4, stroke: active ? CYAN : BORDER, sw: 1 });
    mono(`s1-f-lbl-${i}`, fx + 6, 86, 64, f, 8, active ? CYAN : fCols[i]);
  });

  const allSvcs = [
    { name: 'api-gateway',   env: 'prod',    status: '[OK]',   col: GREEN, cpu: '4%',  mem: '128MB', up: '99.9%' },
    { name: 'auth-service',  env: 'prod',    status: '[OK]',   col: GREEN, cpu: '2%',  mem: '64MB',  up: '100%'  },
    { name: 'data-pipeline', env: 'prod',    status: '[WARN]', col: AMBER, cpu: '78%', mem: '512MB', up: '98.2%' },
    { name: 'worker-queue',  env: 'prod',    status: '[OK]',   col: GREEN, cpu: '12%', mem: '256MB', up: '99.7%' },
    { name: 'search-index',  env: 'prod',    status: '[OK]',   col: GREEN, cpu: '8%',  mem: '384MB', up: '99.5%' },
    { name: 'notifier',      env: 'staging', status: '[OK]',   col: GREEN, cpu: '1%',  mem: '48MB',  up: '100%'  },
  ];
  allSvcs.forEach((svc, i) => {
    const sy = 112 + i * 100;
    if (sy + 88 > H - 66) return;
    rect(`s1-card-${i}`, sx + 16, sy, W - 32, 88, SURFACE,
      { cr: 6, stroke: svc.col === AMBER ? AMBER : BORDER, sw: 1 });
    rect(`s1-ind-${i}`,  sx + 16, sy, 3, 88, svc.col, { cr: 2 });
    mono(`s1-name-${i}`,   sx + 28, sy + 12, W - 80, svc.name,   13, TEXT, { weight: 700 });
    mono(`s1-env-${i}`,    sx + 28, sy + 30, 80,     `env:${svc.env}`, 8, MUTED);
    mono(`s1-stat-${i}`,   sx + W - 86, sy + 12, 72, svc.status, 10, svc.col, { weight: 700, align: 'right' });
    mono(`s1-cpul-${i}`,   sx + 28,  sy + 52, 40, '[CPU]',    7, MUTED, { ls: 0.04 });
    mono(`s1-cpuv-${i}`,   sx + 28,  sy + 64, 40, svc.cpu,   11, TEXT);
    mono(`s1-meml-${i}`,   sx + 108, sy + 52, 40, '[MEM]',    7, MUTED, { ls: 0.04 });
    mono(`s1-memv-${i}`,   sx + 108, sy + 64, 64, svc.mem,   11, TEXT);
    mono(`s1-upl-${i}`,    sx + 220, sy + 52, 60, '[UPTIME]', 7, MUTED, { ls: 0.04 });
    mono(`s1-upv-${i}`,    sx + 220, sy + 64, 60, svc.up,    11, svc.up === '100%' ? GREEN : TEXT);
  });

  bottomNav(sx, 1);
}

// SCREEN 2 — LOGS
function screenLogs(sx) {
  rect(`s2-bg`, sx, 0, W, H, BG);
  statusAccent(sx, AMBER);
  header(sx, '[LOGS]', 'LIVE STREAM — REAL-TIME EVENT LOG');
  rect(`s2-live-dot`, sx + W - 60, 24, 8, 8, RED, { cr: 4 });
  mono(`s2-live-lbl`, sx + W - 48, 23, 36, 'LIVE', 9, RED, { weight: 700 });

  const logFilters = ['[ALL]', '[ERROR]', '[WARN]', '[INFO]'];
  const logCols    = [TEXT,    RED,       AMBER,    CYAN];
  logFilters.forEach((f, i) => {
    const fx = sx + 16 + i * 84;
    const active = i === 0;
    rect(`s2-f-bg-${i}`, fx, 78, 76, 26, active ? DIM : 'transparent', { cr: 4, stroke: active ? TEXT : BORDER, sw: 1 });
    mono(`s2-f-lbl-${i}`, fx + 6, 86, 64, f, 8, active ? TEXT : logCols[i]);
  });

  const logs = [
    { time: '14:23:01', lvl: '[INFO]',  lc: CYAN,  msg: 'deployment pipeline started'       },
    { time: '14:22:58', lvl: '[WARN]',  lc: AMBER, msg: 'memory threshold at 85%'           },
    { time: '14:22:47', lvl: '[INFO]',  lc: CYAN,  msg: 'cache invalidated — 2.4k keys'     },
    { time: '14:22:35', lvl: '[ERROR]', lc: RED,   msg: 'connection timeout after 5000ms'   },
    { time: '14:22:28', lvl: '[INFO]',  lc: CYAN,  msg: 'health check passed all nodes'     },
    { time: '14:22:15', lvl: '[WARN]',  lc: AMBER, msg: 'queue depth 890 — above threshold' },
    { time: '14:22:09', lvl: '[INFO]',  lc: CYAN,  msg: 'auto-scaled to 8 instances'        },
    { time: '14:21:54', lvl: '[ERROR]', lc: RED,   msg: 'db replica lag 240ms'              },
    { time: '14:21:41', lvl: '[INFO]',  lc: CYAN,  msg: 'cdn purge completed — 12 edges'    },
  ];
  logs.forEach((log, i) => {
    const ly = 112 + i * 58;
    if (ly + 50 > H - 66) return;
    const isErr = log.lvl === '[ERROR]';
    rect(`s2-log-bg-${i}`, sx + 16, ly, W - 32, 50,
      isErr ? '#120A0A' : SURFACE, { cr: 4, stroke: isErr ? '#3D1010' : BORDER, sw: 1 });
    if (isErr) rect(`s2-log-line-${i}`, sx + 16, ly, 2, 50, RED, { cr: 1 });
    mono(`s2-log-t-${i}`,   sx + 26, ly + 8,  64,    log.time, 8,  MUTED);
    mono(`s2-log-lv-${i}`,  sx + 96, ly + 8,  52,    log.lvl,  8,  log.lc, { weight: 700 });
    mono(`s2-log-msg-${i}`, sx + 26, ly + 28, W - 52, log.msg, 9,  isErr ? '#FF8080' : TEXT);
  });

  bottomNav(sx, 2);
}

// SCREEN 3 — DEPLOY
function screenDeploy(sx) {
  rect(`s3-bg`, sx, 0, W, H, BG);
  statusAccent(sx, GREEN);
  header(sx, '[DEPLOY]', 'main → production · last run 14:22');

  mono(`s3-active-lbl`, sx + 16, 82, 160, '[ACTIVE DEPLOYMENT]', 8, GREEN, { ls: 0.06 });
  rect(`s3-active-card`, sx + 16, 98, W - 32, 84, SURFACE, { cr: 6, stroke: GREEN, sw: 1 });
  rect(`s3-active-ind`,  sx + 16, 98, 3, 84, GREEN, { cr: 2 });
  mono(`s3-ver`, sx + 28, 110, W - 60, 'v2.14.0 — main',                      14, TEXT, { weight: 700 });
  mono(`s3-msg`, sx + 28, 130, W - 44, 'fix: reduce memory leak in pipeline',  9,  MUTED);
  mono(`s3-who`, sx + 28, 148, W - 44, 'deployed 14:22 · @rahel.a',            8,  MUTED);
  mono(`s3-ok`,  sx + W - 76, 110, 60, '[OK]',                                11, GREEN, { weight: 700, align: 'right' });

  mono(`s3-pipe-lbl`, sx + 16, 194, 120, '[PIPELINE]', 8, CYAN, { ls: 0.08 });
  const stages = ['BUILD', 'TEST', 'STAGE', 'PROD'];
  const stTimes = ['1m 24s', '3m 12s', '0m 45s', '0m 38s'];
  const pw = Math.floor((W - 32) / 4);
  stages.forEach((stg, i) => {
    const px = sx + 16 + i * pw;
    rect(`s3-stg-bg-${i}`,  px, 210, pw - 4, 64, SURFACE, { cr: 4, stroke: GREEN, sw: 1 });
    mono(`s3-stg-lbl-${i}`, px + 8, 222, pw - 16, stg,         8, MUTED, { ls: 0.06 });
    mono(`s3-stg-ico-${i}`, px + 8, 238, pw - 16, '✓',         16, GREEN, { weight: 700 });
    mono(`s3-stg-t-${i}`,   px + 8, 260, pw - 16, stTimes[i],  6,  MUTED);
    if (i < 3) rect(`s3-conn-${i}`, px + pw - 4, 238, 4, 2, GREEN);
  });

  mono(`s3-rec-lbl`, sx + 16, 286, 120, '[RECENT]', 8, CYAN, { ls: 0.08 });
  const deploys = [
    { ver: 'v2.14.0', msg: 'fix: memory leak in pipeline', who: '@rahel.a', time: '14:22',    status: '[OK]',   sc: GREEN },
    { ver: 'v2.13.8', msg: 'feat: new metrics endpoint',   who: '@tobi',    time: '11:05',    status: '[OK]',   sc: GREEN },
    { ver: 'v2.13.7', msg: 'hotfix: auth token refresh',   who: '@anya',    time: '09:30',    status: '[OK]',   sc: GREEN },
    { ver: 'v2.13.6', msg: 'chore: update dependencies',   who: '@rahel.a', time: 'yesterday',status: '[WARN]', sc: AMBER },
  ];
  deploys.forEach((d, i) => {
    const dy = 302 + i * 72;
    if (dy + 64 > H - 66) return;
    rect(`s3-dep-bg-${i}`,  sx + 16, dy, W - 32, 64, SURFACE, { cr: 4, stroke: BORDER, sw: 1 });
    mono(`s3-dep-ver-${i}`, sx + 28, dy + 10, 80,     d.ver,   11, TEXT, { weight: 700 });
    mono(`s3-dep-msg-${i}`, sx + 28, dy + 28, W - 60, d.msg,   8,  MUTED);
    mono(`s3-dep-who-${i}`, sx + 28, dy + 46, W - 60, `${d.who} · ${d.time}`, 7, MUTED);
    mono(`s3-dep-st-${i}`,  sx + W - 86, dy + 10, 70, d.status, 9, d.sc, { weight: 700, align: 'right' });
  });

  bottomNav(sx, 3);
}

// SCREEN 4 — PROFILE
function screenProfile(sx) {
  rect(`s4-bg`, sx, 0, W, H, BG);
  statusAccent(sx, GHOST);
  header(sx, '[PROFILE]', 'ACCOUNT & SETTINGS');

  rect(`s4-id-card`, sx + 16, 80, W - 32, 104, SURFACE, { cr: 8, stroke: BORDER, sw: 1 });
  rect(`s4-avatar`,  sx + 32, 96,  54, 54, DIM, { cr: 27, stroke: CYAN, sw: 1 });
  mono(`s4-init`,    sx + 32, 112, 54, 'RA', 18, CYAN, { weight: 700, align: 'center' });
  mono(`s4-uname`,   sx + 100, 96,  W - 120, 'rahel.a',           14, TEXT, { weight: 700 });
  mono(`s4-email`,   sx + 100, 116, W - 120, 'rahel@team.io',      9, MUTED);
  mono(`s4-role`,    sx + 100, 134, W - 120, '[ADMIN]',             9, CYAN);
  mono(`s4-plan`,    sx + 32,  162, W - 48,  'team workspace · pro plan', 8, MUTED);

  const sections = [
    { label: '[ENVIRONMENT]', items: ['production', 'staging', 'development'] },
    { label: '[ALERTS]',      items: ['[ERROR]  → slack #incidents', '[WARN]   → email on-call', '[INFO]    → disabled'] },
    { label: '[API KEYS]',    items: ['flux_live_••••••••4a2f', 'flux_test_••••••••8b91'] },
  ];
  let yOff = 196;
  sections.forEach(sec => {
    mono(`s4-lbl-${yOff}`, sx + 16, yOff, W - 32, sec.label, 8, CYAN, { ls: 0.08 });
    yOff += 18;
    const itemH = sec.items.length * 36 + 8;
    rect(`s4-sec-${yOff}`, sx + 16, yOff, W - 32, itemH, SURFACE, { cr: 4, stroke: BORDER, sw: 1 });
    sec.items.forEach((item, ii) => {
      mono(`s4-item-${yOff}-${ii}`, sx + 28, yOff + 8 + ii * 36, W - 56, item, 10, TEXT);
      if (ii < sec.items.length - 1)
        rect(`s4-div-${yOff}-${ii}`, sx + 28, yOff + 8 + ii * 36 + 24, W - 56, 1, BORDER);
    });
    yOff += itemH + 12;
  });

  mono(`s4-footer-1`, sx + 16, H - 76, W - 32, '[FLUX] v0.4.1 — status.flux.dev', 8, MUTED);
  mono(`s4-footer-2`, sx + 16, H - 62, W - 32, 'RAM Design Heartbeat · 30 MAR 2026', 7, GHOST);

  bottomNav(sx, 4);
}

function screenX(i) { return GAP + i * (W + GAP); }

screenOverview(screenX(0));
screenServices(screenX(1));
screenLogs(screenX(2));
screenDeploy(screenX(3));
screenProfile(screenX(4));

const pen = {
  version: '2.8',
  name: 'FLUX',
  width: canvas_w,
  height: H,
  fill: BG,
  children: nodes,
};

fs.writeFileSync('flux.pen', JSON.stringify(pen, null, 2));
console.log(`✓ flux.pen written — ${nodes.length} nodes, canvas ${canvas_w}×${H}`);
