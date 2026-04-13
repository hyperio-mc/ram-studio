'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'rift';
const NAME      = 'RIFT';
const TAGLINE   = 'Engineering health, at a glance.';
const THEME     = 'dark';
const HEARTBEAT = 468;
const W = 390, H = 844;

// Palette — Land-book Fintech/Data Dark + Saaspo Linear Look
const BG      = '#0A0E14';
const SURF    = '#0F1923';
const CARD    = '#142232';
const CARD2   = '#1C2E40';
const BORDER  = 'rgba(0,212,255,0.12)';
const ACC     = '#00D4FF';
const ACC2    = '#7FFF00';
const RED     = '#FF4F5E';
const AMBER   = '#FFB347';
const TEXT    = '#E8F4F8';
const TEXT2   = '#7BA8C0';
const TEXT3   = '#4A6E85';
const MONO    = '#A8D4E8';

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw) el.strokeWidth = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw) el.fontWeight = opts.fw;
  if (opts.font) el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls) el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw) el.strokeWidth = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw) el.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 30, '9:41', 14, TEXT, { fw: 600, font: 'monospace' }));
  els.push(text(374, 30, '●●●', 10, TEXT2, { anchor: 'end' }));
}

function bottomNav(els, activeIdx) {
  const tabs = [
    { icon: '⬡', label: 'Health' },
    { icon: '⚡', label: 'Deploy' },
    { icon: '◈', label: 'Dash' },
    { icon: '⚑', label: 'Alerts' },
    { icon: '⊙', label: 'Team' },
  ];
  els.push(rect(0, 782, W, 62, SURF, { opacity: 0.92 }));
  els.push(rect(0, 782, W, 1, ACC, { opacity: 0.15 }));
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tw * i + tw / 2;
    const isActive = i === activeIdx;
    const icColor  = isActive ? ACC  : TEXT3;
    const txColor  = isActive ? ACC  : TEXT3;
    if (isActive) {
      els.push(rect(cx - 20, 787, 40, 3, ACC, { rx: 1 }));
    }
    els.push(text(cx, 808, tab.icon, isActive ? 16 : 14, icColor, { anchor: 'middle' }));
    els.push(text(cx, 823, tab.label, 10, txColor, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

function sectionHeader(els, y, title, actionLabel) {
  els.push(text(20, y, title, 12, TEXT2, { fw: 600, ls: 1.5 }));
  if (actionLabel) els.push(text(370, y, actionLabel, 11, ACC, { anchor: 'end', fw: 500 }));
}

function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(rect(95, 20, 200, 200, ACC, { opacity: 0.04, rx: 100 }));
  statusBar(els);

  els.push(text(20, 74, 'RIFT', 20, TEXT, { fw: 700, ls: 3 }));
  els.push(text(20, 92, 'Engineering health', 12));
  els.push(circle(362, 78, 16, CARD2));
  els.push(text(362, 83, 'JL', 10, ACC, { anchor: 'middle', fw: 700 }));

  // DORA Score hero card
  els.push(rect(16, 106, W - 32, 100, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
  els.push(rect(16, 106, W - 32, 100, ACC, { rx: 12, opacity: 0.03 }));
  els.push(text(32, 128, 'DORA SCORE', 10, TEXT2, { fw: 600, ls: 2 }));
  els.push(text(32, 164, '87', 42, ACC, { fw: 700, font: 'monospace' }));
  els.push(text(82, 164, '/100', 16));
  els.push(text(32, 185, 'Top 15% of engineering teams', 11, ACC2, { fw: 500 }));

  const barHeights = [22, 34, 18, 40, 28, 36, 42];
  barHeights.forEach((bh, i) => {
    const bx = 258 + i * 15;
    const by = 186 - bh;
    els.push(rect(bx, by, 10, bh, ACC, { rx: 2, opacity: i === 6 ? 0.9 : 0.3 + i * 0.08 }));
  });
  els.push(text(260, 196, 'deploys/day', 9, TEXT3));

  // 2x2 bento tiles
  const tiles = [
    { label: 'DEPLOY FREQ', value: '4.2', unit: '/day', color: ACC2,  trend: '+12%' },
    { label: 'LEAD TIME',   value: '2.8', unit: 'hrs',  color: ACC,   trend: '-18%' },
    { label: 'MTTR',        value: '14',  unit: 'min',  color: AMBER, trend: '-5%'  },
    { label: 'CHANGE FAIL', value: '3.2', unit: '%',    color: RED,   trend: '+0.4%'},
  ];
  tiles.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = 16 + col * (W / 2 - 8);
    const ty = 222 + row * 92;
    const tw2 = W / 2 - 24;
    els.push(rect(tx, ty, tw2, 80, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(text(tx + 12, ty + 21, t.label, 9, TEXT3, { fw: 600, ls: 1.5 }));
    els.push(text(tx + 12, ty + 52, t.value, 26, t.color, { fw: 700, font: 'monospace' }));
    const vw = t.value.length * 15;
    els.push(text(tx + 14 + vw, ty + 52, t.unit, 11));
    els.push(text(tx + 12, ty + 68, t.trend, 10, t.color, { fw: 500 }));
  });

  // Recent deploys
  sectionHeader(els, 424, 'RECENT DEPLOYS', 'all');
  const deploys = [
    { repo: 'api-gateway',   sha: 'a3f9c1', status: 'success', time: '2m ago',  env: 'prod'    },
    { repo: 'web-frontend',  sha: 'b7d2e4', status: 'success', time: '14m ago', env: 'prod'    },
    { repo: 'auth-service',  sha: 'c1a8f2', status: 'failed',  time: '1h ago',  env: 'staging' },
    { repo: 'data-pipeline', sha: 'd4c7b9', status: 'pending', time: '2h ago',  env: 'prod'    },
  ];
  deploys.forEach((d, i) => {
    const dy = 440 + i * 68;
    els.push(rect(16, dy, W - 32, 60, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    const dotColor = d.status === 'success' ? ACC2 : d.status === 'failed' ? RED : AMBER;
    els.push(circle(34, dy + 19, 5, dotColor));
    els.push(text(46, dy + 23, d.repo, 13, TEXT, { fw: 600 }));
    els.push(text(46, dy + 39, d.sha, 11, MONO, { font: 'monospace' }));
    els.push(rect(W - 82, dy + 11, 56, 18, CARD2, { rx: 4 }));
    els.push(text(W - 54, dy + 23, d.env, 10, TEXT2, { anchor: 'middle', fw: 500 }));
    els.push(text(W - 36, dy + 39, d.time, 10, TEXT3, { anchor: 'end' }));
    if (i < deploys.length - 1) els.push(line(32, dy + 60, W - 32, dy + 60, BORDER, { sw: 1 }));
  });

  bottomNav(els, 2);
  return els;
}

function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  els.push(text(20, 74, 'Code Health', 18, TEXT, { fw: 700 }));
  els.push(text(20, 92, 'Repos · Last 7 days', 12));

  // Overall health bar
  els.push(rect(16, 106, W - 32, 72, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(30, 126, 'OVERALL HEALTH INDEX', 9, TEXT3, { fw: 600, ls: 1.5 }));
  els.push(rect(30, 137, W - 60, 8, CARD2, { rx: 4 }));
  els.push(rect(30, 137, (W - 60) * 0.87, 8, ACC, { rx: 4 }));
  els.push(text(30, 162, '87% — Healthy', 11));
  els.push(text(W - 36, 162, '13 issues found', 11, RED, { anchor: 'end' }));

  sectionHeader(els, 194, 'REPOSITORIES', 'filter');
  const repos = [
    { name: 'api-gateway',   cov: 84, debt: 'Low',    issues: 2,  grade: 'A'  },
    { name: 'web-frontend',  cov: 71, debt: 'Medium', issues: 7,  grade: 'B'  },
    { name: 'auth-service',  cov: 93, debt: 'Low',    issues: 0,  grade: 'A+' },
    { name: 'data-pipeline', cov: 58, debt: 'High',   issues: 14, grade: 'C'  },
    { name: 'mobile-client', cov: 66, debt: 'Medium', issues: 5,  grade: 'B-' },
    { name: 'infra-modules', cov: 79, debt: 'Low',    issues: 3,  grade: 'B+' },
  ];
  repos.forEach((r, i) => {
    const ry = 212 + i * 90;
    els.push(rect(16, ry, W - 32, 80, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
    const gradeColor = r.grade.startsWith('A') ? ACC2 : r.grade.startsWith('B') ? ACC : r.grade.startsWith('C') ? AMBER : RED;
    els.push(rect(W - 60, ry + 14, 40, 40, CARD2, { rx: 8 }));
    els.push(text(W - 40, ry + 38, r.grade, 14, gradeColor, { fw: 700, anchor: 'middle' }));
    els.push(text(32, ry + 25, r.name, 13, TEXT, { fw: 600, font: 'monospace' }));
    els.push(text(32, ry + 42, 'Coverage: ' + r.cov + '%', 11));
    els.push(rect(32, ry + 52, 180, 5, CARD2, { rx: 2 }));
    const covColor = r.cov >= 80 ? ACC2 : r.cov >= 60 ? ACC : RED;
    els.push(rect(32, ry + 52, Math.round(180 * r.cov / 100), 5, covColor, { rx: 2 }));
    const debtColor = r.debt === 'Low' ? ACC2 : r.debt === 'Medium' ? AMBER : RED;
    els.push(rect(32, ry + 63, 62, 14, CARD2, { rx: 4 }));
    els.push(text(63, ry + 73, r.debt + ' debt', 9, debtColor, { anchor: 'middle', fw: 500 }));
    if (r.issues > 0) {
      els.push(rect(102, ry + 63, 50, 14, CARD2, { rx: 4 }));
      els.push(text(127, ry + 73, r.issues + ' issues', 9, RED, { anchor: 'middle', fw: 500 }));
    }
  });
  bottomNav(els, 0);
  return els;
}

function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  els.push(text(20, 74, 'Incidents', 18, TEXT, { fw: 700 }));
  els.push(text(20, 92, 'Last 30 days', 12));

  const summaryTiles = [
    { label: 'TOTAL', value: '12', color: TEXT  },
    { label: 'OPEN',  value: '2',  color: RED   },
    { label: 'MTTR',  value: '14m',color: ACC   },
  ];
  summaryTiles.forEach((t, i) => {
    const tw3 = (W - 48) / 3;
    const tx = 16 + i * (tw3 + 8);
    els.push(rect(tx, 106, tw3, 62, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    els.push(text(tx + tw3 / 2, 126, t.label, 8, TEXT3, { fw: 600, ls: 1.5, anchor: 'middle' }));
    els.push(text(tx + tw3 / 2, 154, t.value, 22, t.color, { fw: 700, font: 'monospace', anchor: 'middle' }));
  });

  sectionHeader(els, 186, 'TIMELINE — APRIL', '');
  els.push(rect(40, 200, 310, 1, CARD2));
  const days = ['Apr 1', 'Apr 8', 'Apr 15', 'Apr 22', 'Apr 29'];
  days.forEach((d, i) => {
    const dx = 40 + i * 77;
    els.push(text(dx, 212, d, 8, TEXT3, { anchor: 'middle' }));
  });
  const incidents = [
    { x: 55,  sev: 'P1', color: RED   },
    { x: 105, sev: 'P2', color: AMBER },
    { x: 155, sev: 'P3', color: ACC   },
    { x: 198, sev: 'P2', color: AMBER },
    { x: 260, sev: 'P1', color: RED   },
    { x: 285, sev: 'P3', color: ACC   },
    { x: 312, sev: 'P2', color: AMBER },
    { x: 338, sev: 'P3', color: ACC   },
  ];
  incidents.forEach(inc => {
    els.push(circle(inc.x, 197, 7, inc.color, { opacity: 0.85 }));
    els.push(text(inc.x, 201, inc.sev.charAt(1), 7, BG, { anchor: 'middle', fw: 700 }));
  });

  sectionHeader(els, 230, 'INCIDENTS', 'all');
  const incidentList = [
    { title: 'API Gateway 503s',    time: '2h ago',  status: 'open',     sev: 'P1', dur: null,  service: 'api-gateway'  },
    { title: 'Auth token expiry',   time: '8h ago',  status: 'open',     sev: 'P2', dur: null,  service: 'auth-service' },
    { title: 'DB connection pool',  time: '2d ago',  status: 'resolved', sev: 'P1', dur: '22m', service: 'postgres'     },
    { title: 'Frontend CDN miss',   time: '3d ago',  status: 'resolved', sev: 'P3', dur: '8m',  service: 'cdn'          },
    { title: 'Kafka consumer lag',  time: '5d ago',  status: 'resolved', sev: 'P2', dur: '41m', service: 'data-pipeline'},
    { title: 'TLS cert renewal',    time: '8d ago',  status: 'resolved', sev: 'P1', dur: '6m',  service: 'infra'        },
  ];
  incidentList.forEach((inc, i) => {
    const iy = 248 + i * 82;
    const sevColor = inc.sev === 'P1' ? RED : inc.sev === 'P2' ? AMBER : ACC;
    els.push(rect(16, iy, W - 32, 74, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    els.push(rect(16, iy, 3, 74, sevColor, { rx: 1, opacity: 0.85 }));
    els.push(circle(34, iy + 21, 5, sevColor));
    const statColor = inc.status === 'open' ? RED : ACC2;
    els.push(rect(W - 82, iy + 8, 66, 16, statColor, { rx: 8, opacity: 0.15 }));
    els.push(text(W - 49, iy + 19, inc.status, 9, statColor, { anchor: 'middle', fw: 600 }));
    els.push(text(46, iy + 23, inc.title, 13, TEXT, { fw: 600 }));
    els.push(text(32, iy + 40, inc.service, 10, MONO, { font: 'monospace', opacity: 0.7 }));
    els.push(text(32, iy + 55, inc.time, 10));
    if (inc.dur) els.push(text(W - 36, iy + 55, inc.dur + ' MTTR', 10, TEXT2, { anchor: 'end' }));
    if (i < incidentList.length - 1) els.push(line(32, iy + 74, W - 32, iy + 74, BORDER, { sw: 1 }));
  });

  bottomNav(els, 3);
  return els;
}

function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  els.push(text(20, 74, 'Velocity', 18, TEXT, { fw: 700 }));
  els.push(text(20, 92, 'Sprint 42 · Apr 1–14', 12));

  // Sprint progress
  els.push(rect(16, 106, W - 32, 92, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
  els.push(text(30, 126, 'SPRINT PROGRESS', 9, TEXT3, { fw: 600, ls: 1.5 }));
  els.push(text(30, 158, '34', 32, ACC2, { fw: 700, font: 'monospace' }));
  els.push(text(72, 158, '/ 42 pts', 14));
  els.push(text(30, 175, '81% complete · 2 days left', 11));
  els.push(rect(30, 183, W - 60, 6, CARD2, { rx: 3 }));
  els.push(rect(30, 183, Math.round((W - 60) * 0.81), 6, ACC2, { rx: 3 }));
  for (let d = 0; d <= 14; d++) {
    const mx = 30 + Math.round(d * (W - 60) / 14);
    els.push(rect(mx, 182, 1, 8, d <= 12 ? TEXT3 : ACC, { opacity: 0.4 }));
  }

  sectionHeader(els, 214, 'PR METRICS', '');
  const prMetrics = [
    { label: 'Avg Cycle Time', value: '6.2h', trend: '-22%', color: ACC2 },
    { label: 'Review Lag',     value: '1.8h', trend: '-31%', color: ACC  },
    { label: 'Merge Rate',     value: '94%',  trend: '+3%',  color: ACC2 },
  ];
  prMetrics.forEach((m, i) => {
    const my = 232 + i * 56;
    els.push(rect(16, my, W - 32, 48, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    els.push(text(32, my + 22, m.label, 12));
    els.push(text(W - 36, my + 22, m.value, 14, m.color, { fw: 700, font: 'monospace', anchor: 'end' }));
    els.push(text(W - 36, my + 38, m.trend, 10, m.color, { anchor: 'end', fw: 500 }));
  });

  sectionHeader(els, 410, 'TOP CONTRIBUTORS', '');
  const contributors = [
    { name: 'J. Lim',     prs: 8, pts: 12, avatar: 'JL' },
    { name: 'A. Patel',   prs: 6, pts: 10, avatar: 'AP' },
    { name: 'M. Osei',    prs: 7, pts: 9,  avatar: 'MO' },
    { name: 'S. Torres',  prs: 5, pts: 8,  avatar: 'ST' },
    { name: 'K. Nakamura',prs: 4, pts: 7,  avatar: 'KN' },
  ];
  contributors.forEach((c, i) => {
    const cy = 428 + i * 66;
    els.push(rect(16, cy, W - 32, 58, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    els.push(text(32, cy + 34, '#' + (i + 1), 12, i === 0 ? ACC : TEXT3, { fw: 700, font: 'monospace' }));
    els.push(circle(68, cy + 29, 16, CARD2));
    els.push(text(68, cy + 33, c.avatar, 9, ACC, { anchor: 'middle', fw: 700 }));
    els.push(text(92, cy + 26, c.name, 13, TEXT, { fw: 600 }));
    els.push(text(92, cy + 42, c.prs + ' PRs merged', 11));
    els.push(rect(W - 70, cy + 17, 54, 24, CARD2, { rx: 6 }));
    els.push(text(W - 43, cy + 33, c.pts + ' pts', 12, ACC2, { anchor: 'middle', fw: 700, font: 'monospace' }));
  });

  bottomNav(els, 4);
  return els;
}

function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  els.push(text(20, 74, 'Alerts', 18, TEXT, { fw: 700 }));
  els.push(rect(85, 62, 22, 16, RED, { rx: 8 }));
  els.push(text(96, 73, '5', 10, '#FFFFFF', { anchor: 'middle', fw: 700 }));
  els.push(text(20, 92, 'Real-time · 8 active', 12));

  const filters = ['All', 'Critical', 'Warning', 'Info'];
  const fwidths  = [36, 58, 58, 36];
  const fxs      = [0, 44, 110, 176];
  filters.forEach((f, i) => {
    const fx = 16 + fxs[i];
    const isActive = i === 0;
    els.push(rect(fx, 102, fwidths[i], 24, isActive ? ACC : CARD2, { rx: 12 }));
    els.push(text(fx + fwidths[i] / 2, 117, f, 11, isActive ? BG : TEXT2, { anchor: 'middle', fw: 600 }));
  });

  const alerts = [
    { title: 'High CPU on prod-api-02',  sev: 'critical', time: '3m ago',  service: 'api-gateway',   acked: false, value: '94%'  },
    { title: 'Disk usage >85%',           sev: 'warning',  time: '12m ago', service: 'postgres',      acked: false, value: '87%'  },
    { title: 'Slow query detected',       sev: 'warning',  time: '28m ago', service: 'postgres',      acked: true,  value: '4.2s' },
    { title: 'Memory pressure spike',     sev: 'critical', time: '1h ago',  service: 'auth-service',  acked: false, value: '91%'  },
    { title: 'Cert expiry in 14 days',    sev: 'warning',  time: '2h ago',  service: 'infra',         acked: true,  value: '14d'  },
    { title: 'P99 latency elevated',      sev: 'info',     time: '3h ago',  service: 'data-pipeline', acked: false, value: '1.8s' },
    { title: 'Successful backup run',     sev: 'info',     time: '6h ago',  service: 'backup',        acked: true,  value: 'OK'   },
    { title: 'Spike in 404 errors',       sev: 'warning',  time: '8h ago',  service: 'web-frontend',  acked: true,  value: '2.3%' },
  ];
  alerts.forEach((a, i) => {
    const ay = 140 + i * 76;
    const sevColor = a.sev === 'critical' ? RED : a.sev === 'warning' ? AMBER : ACC;
    els.push(rect(16, ay, W - 32, 68, CARD, { rx: 8, stroke: BORDER, sw: 1, opacity: a.acked ? 0.65 : 1 }));
    els.push(rect(16, ay, 3, 68, sevColor, { rx: 1, opacity: a.acked ? 0.35 : 0.9 }));
    els.push(circle(34, ay + 21, 5, sevColor, { opacity: a.acked ? 0.5 : 1 }));
    els.push(text(46, ay + 23, a.title, 13, a.acked ? TEXT2 : TEXT, { fw: a.acked ? 400 : 600 }));
    els.push(text(46, ay + 40, a.service, 10, MONO, { font: 'monospace', opacity: 0.7 }));
    els.push(text(46, ay + 55, a.time, 10));
    els.push(rect(W - 74, ay + 11, 58, 22, CARD2, { rx: 6 }));
    els.push(text(W - 45, ay + 25, a.value, 12, sevColor, { anchor: 'middle', fw: 700, font: 'monospace' }));
    if (a.acked) els.push(text(W - 36, ay + 55, 'acked', 9, TEXT3, { anchor: 'end' }));
    if (i < alerts.length - 1) els.push(line(32, ay + 68, W - 32, ay + 68, BORDER, { sw: 1 }));
  });

  bottomNav(els, 3);
  return els;
}

function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  els.push(text(20, 74, 'Integrations', 18, TEXT, { fw: 700 }));
  els.push(text(20, 92, '7 connected · 1 needs attention', 12));

  els.push(rect(16, 106, W - 32, 58, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(30, 126, 'DATA SOURCE HEALTH', 9, TEXT3, { fw: 600, ls: 1.5 }));
  let sx = 30;
  const segments = [{ w: 0.57, color: ACC2 }, { w: 0.29, color: AMBER }, { w: 0.14, color: RED }];
  segments.forEach(s => {
    const sw2 = Math.round((W - 60) * s.w) - 2;
    els.push(rect(sx, 135, sw2, 10, s.color, { rx: 2, opacity: 0.8 }));
    sx += sw2 + 2;
  });
  els.push(text(30, 154, '4 healthy', 10));
  els.push(text(104, 154, '2 degraded', 10));
  els.push(text(188, 154, '1 error', 10));

  sectionHeader(els, 180, 'CONNECTED TOOLS', '');
  const integrations = [
    { name: 'GitHub',    desc: 'Repos, PRs, commits',    status: 'healthy',  icon: 'GH', lastSync: '1m ago'  },
    { name: 'PagerDuty', desc: 'Incident management',    status: 'healthy',  icon: 'PD', lastSync: '2m ago'  },
    { name: 'Datadog',   desc: 'Metrics & APM',          status: 'healthy',  icon: 'DD', lastSync: '1m ago'  },
    { name: 'Jira',      desc: 'Sprints & velocity',     status: 'degraded', icon: 'JR', lastSync: '8m ago'  },
    { name: 'SonarQube', desc: 'Code quality analysis',  status: 'healthy',  icon: 'SQ', lastSync: '5m ago'  },
    { name: 'ArgoCD',    desc: 'Deployment pipelines',   status: 'degraded', icon: 'AC', lastSync: '12m ago' },
    { name: 'Slack',     desc: 'Alert notifications',    status: 'error',    icon: 'SL', lastSync: '2h ago'  },
  ];
  integrations.forEach((intg, i) => {
    const iy = 198 + i * 78;
    const statColor = intg.status === 'healthy' ? ACC2 : intg.status === 'degraded' ? AMBER : RED;
    els.push(rect(16, iy, W - 32, 70, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(rect(28, iy + 14, 36, 36, CARD2, { rx: 8 }));
    els.push(text(46, iy + 36, intg.icon, 11, ACC, { anchor: 'middle', fw: 700, font: 'monospace' }));
    els.push(text(76, iy + 29, intg.name, 13, TEXT, { fw: 600 }));
    els.push(text(76, iy + 45, intg.desc, 11));
    els.push(circle(W - 50, iy + 22, 5, statColor));
    els.push(text(W - 42, iy + 26, intg.status, 10, statColor, { fw: 600 }));
    els.push(text(W - 36, iy + 44, intg.lastSync, 10, TEXT3, { anchor: 'end' }));
    if (i < integrations.length - 1) els.push(line(28, iy + 70, W - 28, iy + 70, BORDER, { sw: 1 }));
  });

  bottomNav(els, 4);
  return els;
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const screenDefs = [
  { name: 'Dashboard',    fn: screen1 },
  { name: 'Code Health',  fn: screen2 },
  { name: 'Incidents',    fn: screen3 },
  { name: 'Velocity',     fn: screen4 },
  { name: 'Alerts',       fn: screen5 },
  { name: 'Integrations', fn: screen6 },
];

function elToSvg(el) {
  if (el.type === 'rect') {
    const a = [`x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"`];
    if (el.rx !== undefined) a.push(`rx="${el.rx}"`);
    if (el.opacity !== undefined) a.push(`opacity="${el.opacity}"`);
    if (el.stroke) a.push(`stroke="${el.stroke}"`);
    if (el.strokeWidth) a.push(`stroke-width="${el.strokeWidth}"`);
    return `<rect ${a.join(' ')}/>`;
  }
  if (el.type === 'text') {
    const a = [`x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${el.fontSize}"`];
    a.push(`font-weight="${el.fontWeight || 400}"`);
    a.push(`font-family="${el.fontFamily || 'Inter, system-ui, sans-serif'}"`);
    if (el.textAnchor) a.push(`text-anchor="${el.textAnchor}"`);
    if (el.letterSpacing) a.push(`letter-spacing="${el.letterSpacing}"`);
    if (el.opacity !== undefined) a.push(`opacity="${el.opacity}"`);
    return `<text ${a.join(' ')}>${el.content}</text>`;
  }
  if (el.type === 'circle') {
    const a = [`cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`];
    if (el.opacity !== undefined) a.push(`opacity="${el.opacity}"`);
    if (el.stroke) a.push(`stroke="${el.stroke}"`);
    if (el.strokeWidth) a.push(`stroke-width="${el.strokeWidth}"`);
    return `<circle ${a.join(' ')}/>`;
  }
  if (el.type === 'line') {
    const a = [`x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}"`];
    a.push(`stroke-width="${el.strokeWidth || 1}"`);
    if (el.opacity !== undefined) a.push(`opacity="${el.opacity}"`);
    return `<line ${a.join(' ')}/>`;
  }
  return '';
}

const screens = screenDefs.map(({ name, fn }) => {
  const elements = fn();
  const svgParts = elements.map(elToSvg).filter(Boolean);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgParts.join('')}</svg>`;
  return { name, svg, elements };
});

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME, tagline: TAGLINE, author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: THEME, heartbeat: HEARTBEAT, elements: totalElements, slug: SLUG,
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT, text2: TEXT2 },
    inspiration: 'Land-book Fintech/Data Dark palette + Saaspo Linear Look: deep navy, electric cyan, chartreuse data, tinted borders',
  },
  screens: screens.map(s => ({ name: s.name, svg: s.svg, elements: s.elements })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
