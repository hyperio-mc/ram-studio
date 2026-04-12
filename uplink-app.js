#!/usr/bin/env node
// UPLINK — API health & integration monitoring for indie developers
// Inspired by:
//   • Godly.website's "Status" (featured front page Mar 30 2026) — status page tool, clean data UI
//   • Land-book's "Interfere — Build software that never breaks" — reliability-first messaging
//   • Dark Mode Design's "Midday" — dark business dashboard, sidebar nav + data density
// Theme: DARK — cool near-black navy + electric blue + coral + emerald monospace aesthetic

const fs = require('fs');

const W = 390, H = 844;
function makeId() { return Math.random().toString(36).slice(2, 10); }

const C = {
  bg:         '#0B0D14',
  bgDeep:     '#080A10',
  surface:    '#13161F',
  surfaceUp:  '#1A1E2C',
  border:     'rgba(255,255,255,0.07)',
  borderBlu:  'rgba(79,126,255,0.22)',
  borderGrn:  'rgba(61,202,138,0.20)',
  borderRed:  'rgba(255,79,106,0.22)',
  borderAmb:  'rgba(245,166,35,0.22)',
  text:       '#EDF0F8',
  textSub:    'rgba(237,240,248,0.55)',
  textMuted:  'rgba(237,240,248,0.30)',
  blue:       '#4F7EFF',
  blueDim:    'rgba(79,126,255,0.12)',
  green:      '#3DCA8A',
  greenDim:   'rgba(61,202,138,0.12)',
  red:        '#FF4F6A',
  redDim:     'rgba(255,79,106,0.12)',
  amber:      '#F5A623',
  amberDim:   'rgba(245,166,35,0.12)',
  purple:     '#9B6DFF',
  purpleDim:  'rgba(155,109,255,0.12)',
};

const MONO = "'JetBrains Mono','Fira Code','SF Mono',monospace";
const SANS = "'Inter','SF Pro Display',system-ui,sans-serif";

function t(content, x, y, opts = {}) {
  return {
    id: makeId(), type: 'text', x, y,
    content: String(content),
    fontSize: opts.size || 13,
    fontFamily: opts.font || SANS,
    fontWeight: opts.weight || '400',
    letterSpacing: opts.ls !== undefined ? opts.ls : 0,
    color: opts.color || C.text,
    textAlign: opts.align || 'left',
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function r(x, y, w, h, opts = {}) {
  return {
    id: makeId(), type: 'rectangle', x, y, width: w, height: h,
    fill: opts.fill || 'transparent',
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.sw || 0,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function ln(x1, y1, x2, y2, opts = {}) {
  return { id: makeId(), type: 'line', x1, y1, x2, y2, stroke: opts.stroke || C.border, strokeWidth: opts.sw || 1 };
}

function circ(cx, cy, rad, opts = {}) {
  return {
    id: makeId(), type: 'ellipse',
    x: cx - rad, y: cy - rad, width: rad*2, height: rad*2,
    fill: opts.fill || 'transparent',
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.sw || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function card(x, y, w, h, opts = {}) {
  return [r(x, y, w, h, {
    fill: opts.fill || C.surface,
    stroke: opts.stroke || C.border,
    sw: opts.sw !== undefined ? opts.sw : 1,
    r: opts.r !== undefined ? opts.r : 14,
  })];
}

function statusBar() {
  return [
    t('9:41', 20, 14, { size: 15, weight: '600', color: C.text }),
    t('● ●  ▲', W - 80, 14, { size: 11, color: C.textMuted, align: 'right' }),
  ];
}

function pulseDot(cx, cy, color) {
  return [
    circ(cx, cy, 7, { fill: color + '22', stroke: color + '55', sw: 1 }),
    circ(cx, cy, 4, { fill: color }),
  ];
}

function navBar(active) {
  const items = [
    { label: 'Status',  icon: '◉' },
    { label: 'Routes',  icon: '⇄' },
    { label: 'Events',  icon: '⚡' },
    { label: 'Stats',   icon: '∿' },
  ];
  const els = [];
  const navY = H - 74;
  els.push(r(0, navY, W, 76, { fill: C.bgDeep, stroke: C.border, sw: 0, r: 0 }));
  els.push(ln(0, navY, W, navY, { stroke: C.border, sw: 1 }));
  const tabW = W / items.length;
  items.forEach((item, i) => {
    const tx = i * tabW + tabW / 2;
    const isActive = i === active;
    if (isActive) {
      els.push(r(tx - 30, navY + 7, 60, 36, { fill: C.blueDim, stroke: C.borderBlu, sw: 1, r: 10 }));
    }
    els.push(t(item.icon, tx, navY + 14, { size: 17, color: isActive ? C.blue : C.textMuted, align: 'center', weight: isActive ? '700' : '400', font: MONO }));
    els.push(t(item.label, tx, navY + 36, { size: 10, color: isActive ? C.blue : C.textMuted, align: 'center', weight: isActive ? '600' : '400' }));
  });
  els.push(r(W/2 - 55, H - 6, 110, 4, { fill: 'rgba(237,240,248,0.15)', r: 2 }));
  return els;
}

// ─── SCREEN 1 — Live Status ───────────────────────────────────────────────────
function screen1() {
  const els = [];
  // bg + ambient glows
  els.push(r(0, 0, W, H, { fill: C.bg }));
  els.push(r(50, 50, 280, 220, { fill: 'rgba(79,126,255,0.04)', r: 120 }));
  els.push(r(0, 420, 200, 200, { fill: 'rgba(61,202,138,0.03)', r: 100 }));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(t('uplink', 20, 50, { size: 22, weight: '700', color: C.text, font: MONO, ls: -0.02 }));
  els.push(t('· All Systems Operational', 78, 52, { size: 12, color: C.green, weight: '500' }));
  pulseDot(W - 22, 52, C.green).forEach(e => els.push(e));
  els.push(circ(W - 40, 48, 15, { fill: C.surface, stroke: C.border, sw: 1 }));
  els.push(t('⚙', W - 40, 40, { size: 13, color: C.textSub, align: 'center' }));

  // Uptime hero
  const heroY = 76;
  card(16, heroY, W - 32, 100, { fill: C.surfaceUp, stroke: C.borderBlu, sw: 1, r: 18 }).forEach(e => els.push(e));
  els.push(r(36, heroY + 1, W - 72, 2, { fill: 'rgba(79,126,255,0.35)', r: 1 }));
  els.push(t('UPTIME · 30 DAYS', 32, heroY + 16, { size: 10, color: C.textMuted, weight: '600', ls: 0.08, font: MONO }));
  els.push(t('99.98%', 32, heroY + 50, { size: 36, weight: '700', color: C.blue, font: MONO, ls: -0.02 }));
  els.push(t('↑ +0.01% vs last month', 32, heroY + 82, { size: 11, color: C.green, weight: '500' }));
  els.push(t('~2 min downtime', W - 28, heroY + 82, { size: 11, color: C.textMuted, align: 'right' }));

  // 30-day bar
  const barY = heroY + 95;
  const totalW = W - 64;
  const blocks = 30;
  const bw = Math.floor(totalW / blocks) - 2;
  for (let i = 0; i < blocks; i++) {
    const s = i === 14 ? 'out' : i === 22 ? 'deg' : 'ok';
    const col = s === 'out' ? C.red : s === 'deg' ? C.amber : C.green;
    els.push(r(32 + i * (bw + 2), barY, bw, 6, { fill: col + '80', r: 1 }));
  }

  // Metric quad
  const metY = heroY + 116;
  const metrics = [
    { label: 'Req/min',  val: '4.2K',  color: C.blue   },
    { label: 'P99 ms',   val: '182',   color: C.text   },
    { label: 'Errors',   val: '0.02%', color: C.green  },
    { label: 'Regions',  val: '6',     color: C.purple },
  ];
  const mw = (W - 32) / 4;
  metrics.forEach((m, i) => {
    const mx = 16 + i * mw;
    card(mx + 2, metY, mw - 4, 60, { fill: C.surface, stroke: C.border, r: 10 }).forEach(e => els.push(e));
    els.push(t(m.val, mx + mw/2, metY + 20, { size: 18, weight: '700', color: m.color, align: 'center', font: MONO }));
    els.push(t(m.label, mx + mw/2, metY + 42, { size: 9, color: C.textMuted, align: 'center', weight: '500', ls: 0.04 }));
  });

  // Services
  const svcY = metY + 76;
  els.push(t('SERVICES', 20, svcY, { size: 10, color: C.textMuted, weight: '600', ls: 0.08, font: MONO }));
  const services = [
    { name: 'API Gateway',       sub: 'api.uplink.dev',     status: 'ok',       lat: '48ms'  },
    { name: 'Auth Service',      sub: 'auth.uplink.dev',    status: 'ok',       lat: '23ms'  },
    { name: 'Webhook Processor', sub: 'hooks.uplink.dev',   status: 'degraded', lat: '340ms' },
    { name: 'Data Pipeline',     sub: 'stream.uplink.dev',  status: 'ok',       lat: '61ms'  },
    { name: 'CDN / Assets',      sub: 'cdn.uplink.dev',     status: 'ok',       lat: '12ms'  },
  ];
  services.forEach((svc, i) => {
    const sy = svcY + 18 + i * 56;
    const sc = svc.status === 'ok' ? C.green : svc.status === 'degraded' ? C.amber : C.red;
    const bord = svc.status !== 'ok' ? C.borderAmb : C.border;
    card(16, sy, W - 32, 46, { fill: i%2===0 ? C.surface : C.surfaceUp, stroke: bord, r: 12 }).forEach(e => els.push(e));
    pulseDot(35, sy + 23, sc).forEach(e => els.push(e));
    els.push(t(svc.name, 52, sy + 14, { size: 13, weight: '600', color: C.text }));
    els.push(t(svc.sub, 52, sy + 31, { size: 10, color: C.textMuted, font: MONO }));
    els.push(t(svc.lat, W - 28, sy + 14, { size: 13, weight: '600', color: svc.status === 'ok' ? C.text : C.amber, align: 'right', font: MONO }));
    const sl = svc.status === 'ok' ? 'Operational' : svc.status === 'degraded' ? 'Degraded' : 'Outage';
    els.push(t(sl, W - 28, sy + 31, { size: 10, color: sc, align: 'right', weight: '500' }));
  });

  navBar(0).forEach(e => els.push(e));
  return { id: makeId(), name: 'Status', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ─── SCREEN 2 — Routes ────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(r(0, 0, W, H, { fill: C.bg }));
  els.push(r(W - 160, 30, 220, 180, { fill: 'rgba(155,109,255,0.04)', r: 90 }));
  statusBar().forEach(e => els.push(e));

  els.push(t('Routes', 20, 50, { size: 24, weight: '700', color: C.text }));
  els.push(t('14 monitored · 13 healthy', 20, 76, { size: 12, color: C.textSub }));

  // Search
  card(16, 94, W - 32, 38, { fill: C.surface, stroke: C.border, r: 10 }).forEach(e => els.push(e));
  els.push(t('⌕', 34, 105, { size: 14, color: C.textMuted, font: MONO }));
  els.push(t('Search routes…', 54, 107, { size: 13, color: C.textMuted }));

  // Method chips
  const chips = ['ALL', 'GET', 'POST', 'SLOW'];
  let cx2 = 16;
  chips.forEach((chip, i) => {
    const isA = i === 0;
    const cw = chip.length * 8 + 18;
    els.push(r(cx2, 142, cw, 22, { fill: isA ? C.blue : 'transparent', stroke: isA ? C.blue : C.border, sw: 1, r: 11 }));
    els.push(t(chip, cx2 + cw/2, 147, { size: 10, weight: isA ? '700' : '400', color: isA ? '#FFF' : C.textMuted, align: 'center', font: MONO }));
    cx2 += cw + 8;
  });

  const endpoints = [
    { method: 'GET',    path: '/api/v2/users',         p50: '28ms',  p99: '94ms',  rpm: '1.2K', err: '0.0%', spark: [30,28,32,27,29,31,28], slow: false },
    { method: 'POST',   path: '/api/v2/events',         p50: '41ms',  p99: '112ms', rpm: '890',  err: '0.1%', spark: [40,45,38,42,44,41,40], slow: false },
    { method: 'GET',    path: '/api/v2/metrics',        p50: '18ms',  p99: '58ms',  rpm: '642',  err: '0.0%', spark: [20,18,22,17,19,18,20], slow: false },
    { method: 'DELETE', path: '/api/v2/sessions/:id',   p50: '67ms',  p99: '201ms', rpm: '234',  err: '0.2%', spark: [60,70,65,80,68,72,67], slow: false },
    { method: 'POST',   path: '/api/v2/webhooks',       p50: '340ms', p99: '980ms', rpm: '88',   err: '1.4%', spark: [280,340,400,320,360,340,380], slow: true },
    { method: 'GET',    path: '/health',                p50: '4ms',   p99: '11ms',  rpm: '3.1K', err: '0.0%', spark: [4,5,4,4,5,4,4], slow: false },
  ];

  let ey = 174;
  endpoints.forEach((ep) => {
    const eh = 76;
    const isAlert = ep.slow;
    card(16, ey, W - 32, eh, {
      fill: isAlert ? 'rgba(245,166,35,0.06)' : C.surface,
      stroke: isAlert ? C.borderAmb : C.border, r: 12,
    }).forEach(e => els.push(e));

    const mc = ep.method === 'GET' ? C.blue : ep.method === 'POST' ? C.green : ep.method === 'DELETE' ? C.red : C.purple;
    const mw2 = ep.method.length * 7 + 12;
    els.push(r(26, ey + 10, mw2, 17, { fill: mc + '22', stroke: mc + '40', sw: 1, r: 5 }));
    els.push(t(ep.method, 32, ey + 12, { size: 9.5, weight: '700', color: mc, font: MONO, ls: 0.04 }));
    els.push(t(ep.path, 26 + mw2 + 8, ey + 12, { size: 11, color: C.text, font: MONO }));
    if (isAlert) els.push(t('⚠ Slow', W - 28, ey + 12, { size: 10, color: C.amber, align: 'right', weight: '600' }));

    // Stats
    const stats = [
      { label: 'P50', val: ep.p50, x: 26 },
      { label: 'P99', val: ep.p99, x: 82, warn: isAlert },
      { label: 'RPM', val: ep.rpm, x: 140 },
      { label: 'ERR', val: ep.err, x: 194, errColor: parseFloat(ep.err) > 0.5 ? C.red : parseFloat(ep.err) > 0 ? C.amber : C.green },
    ];
    stats.forEach(s => {
      els.push(t(s.label, s.x, ey + 40, { size: 9, color: C.textMuted, font: MONO }));
      els.push(t(s.val, s.x, ey + 54, { size: 11, weight: '600', color: s.errColor || (s.warn ? C.amber : C.text), font: MONO }));
    });

    // Sparkline
    const spW = 68; const spX = W - 40; const spVals = ep.spark;
    const spMax = Math.max(...spVals); const spMin = Math.min(...spVals);
    const spRange = spMax - spMin || 1; const spStep = spW / (spVals.length - 1);
    spVals.forEach((v, i) => {
      if (i < spVals.length - 1) {
        const px = spX - spW + i * spStep;
        const py = ey + 64 - Math.round(((v - spMin)/spRange) * 22);
        const px2 = spX - spW + (i+1) * spStep;
        const py2 = ey + 64 - Math.round(((spVals[i+1] - spMin)/spRange) * 22);
        els.push(r(px, Math.min(py, py2), px2-px+1, Math.abs(py2-py)||1, { fill: (isAlert ? C.amber : C.blue) + '60' }));
      }
    });
    spVals.forEach((v, i) => {
      const px = spX - spW + i * spStep;
      const py = ey + 64 - Math.round(((v - spMin)/spRange) * 22);
      els.push(circ(px, py, 1.5, { fill: isAlert ? C.amber : C.blue }));
    });

    ey += eh + 8;
  });

  navBar(1).forEach(e => els.push(e));
  return { id: makeId(), name: 'Routes', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ─── SCREEN 3 — Incidents ────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(r(0, 0, W, H, { fill: C.bg }));
  els.push(r(200, 80, 220, 220, { fill: 'rgba(255,79,106,0.04)', r: 110 }));
  statusBar().forEach(e => els.push(e));

  els.push(t('Incidents', 20, 50, { size: 24, weight: '700', color: C.text }));
  els.push(t('0 active  ·  12 resolved (30d)', 20, 76, { size: 12, color: C.textSub }));

  // Summary
  const summItems = [
    { label: 'MTTD', val: '3m 12s', color: C.blue  },
    { label: 'MTTR', val: '14m 8s', color: C.green },
    { label: 'SLA',  val: '99.98%', color: C.text  },
  ];
  const sw = (W - 32) / 3;
  summItems.forEach((s, i) => {
    const sx = 16 + i * sw;
    card(sx + 2, 94, sw - 4, 54, { fill: C.surface, stroke: C.border, r: 10 }).forEach(e => els.push(e));
    els.push(t(s.val, sx + sw/2, 109, { size: 15, weight: '700', color: s.color, align: 'center', font: MONO }));
    els.push(t(s.label, sx + sw/2, 130, { size: 9, color: C.textMuted, align: 'center', weight: '600', ls: 0.06, font: MONO }));
  });

  els.push(t('INCIDENT LOG', 20, 162, { size: 10, color: C.textMuted, weight: '600', ls: 0.08, font: MONO }));

  const incidents = [
    { id: 'INC-042', title: 'Webhook processor latency spike', sub: 'P99 exceeded 900ms for 18 min', time: 'Mar 28 · 14:32 UTC', dur: '18m', sev: 'degraded' },
    { id: 'INC-041', title: 'Auth service partial outage', sub: 'Token validation failures — EU region', time: 'Mar 24 · 09:15 UTC', dur: '7m', sev: 'outage' },
    { id: 'INC-040', title: 'CDN cache invalidation delay', sub: 'Stale responses in us-east-1', time: 'Mar 19 · 22:44 UTC', dur: '31m', sev: 'degraded' },
    { id: 'INC-039', title: 'API Gateway cold start burst', sub: 'P95 at 680ms for ~5 min', time: 'Mar 14 · 07:01 UTC', dur: '5m', sev: 'degraded' },
    { id: 'INC-038', title: 'Database connection pool exhausted', sub: 'Full outage — query queue overflow', time: 'Mar 10 · 03:22 UTC', dur: '2m', sev: 'outage' },
  ];

  let iy = 180;
  const tlX = 36;
  incidents.forEach((inc, i) => {
    const ih = 86;
    const sc = inc.sev === 'outage' ? C.red : C.amber;
    if (i < incidents.length - 1) els.push(ln(tlX, iy + 20, tlX, iy + ih + 12, { stroke: C.border, sw: 1 }));
    els.push(circ(tlX, iy + 20, 7, { fill: sc + '25', stroke: sc, sw: 1.5 }));
    els.push(circ(tlX, iy + 20, 3, { fill: sc }));

    const cx2 = tlX + 14;
    card(cx2, iy, W - cx2 - 16, ih, {
      fill: C.surface,
      stroke: i === 0 ? (inc.sev === 'outage' ? C.borderRed : C.borderAmb) : C.border,
      r: 12,
    }).forEach(e => els.push(e));

    const sevLabel = inc.sev === 'outage' ? 'OUTAGE' : 'DEGRADED';
    const bw3 = sevLabel.length * 6 + 12;
    els.push(r(cx2 + 8, iy + 9, bw3, 15, { fill: sc + '18', stroke: sc + '40', sw: 1, r: 7 }));
    els.push(t(sevLabel, cx2 + 14, iy + 11, { size: 8, color: sc, weight: '700', ls: 0.05, font: MONO }));
    els.push(t(inc.id, W - 28, iy + 11, { size: 10, color: C.textMuted, align: 'right', font: MONO }));
    els.push(t(inc.title, cx2 + 8, iy + 32, { size: 12, weight: '600', color: C.text }));
    els.push(t(inc.sub, cx2 + 8, iy + 50, { size: 10, color: C.textSub }));
    els.push(t(inc.time, cx2 + 8, iy + 68, { size: 10, color: C.textMuted, font: MONO }));
    els.push(t('⏱ ' + inc.dur, W - 28, iy + 68, { size: 10, color: C.textMuted, align: 'right', font: MONO }));
    iy += ih + 14;
  });

  navBar(2).forEach(e => els.push(e));
  return { id: makeId(), name: 'Incidents', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ─── SCREEN 4 — Analytics ────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(r(0, 0, W, H, { fill: C.bg }));
  els.push(r(20, 280, 200, 200, { fill: 'rgba(79,126,255,0.04)', r: 100 }));
  statusBar().forEach(e => els.push(e));

  els.push(t('Analytics', 20, 50, { size: 24, weight: '700', color: C.text }));
  els.push(t('Last 7 days', 20, 76, { size: 12, color: C.textSub }));

  // Period chips
  const periods = ['24h', '7d', '30d', '90d'];
  let px2 = W - 16;
  periods.slice().reverse().forEach((p) => {
    const isA = p === '7d';
    const pw = p.length * 9 + 16;
    px2 -= pw + 4;
    els.push(r(px2, 66, pw, 22, { fill: isA ? C.blue : 'transparent', stroke: isA ? C.blue : C.border, sw: 1, r: 11 }));
    els.push(t(p, px2 + pw/2, 71, { size: 11, weight: isA ? '600' : '400', color: isA ? '#FFF' : C.textMuted, align: 'center', font: MONO }));
  });

  // Response time bar chart
  const chartY = 100;
  card(16, chartY, W - 32, 158, { fill: C.surface, stroke: C.border, r: 16 }).forEach(e => els.push(e));
  els.push(t('Response Time (ms) — P50 / P99', 28, chartY + 14, { size: 11, color: C.textSub, weight: '500' }));
  els.push(t('↓ Improving', W - 28, chartY + 14, { size: 11, color: C.green, align: 'right', weight: '500' }));

  for (let g = 0; g < 4; g++) {
    els.push(ln(28, chartY + 38 + g * 26, W - 44, chartY + 38 + g * 26, { stroke: C.border, sw: 0.5 }));
  }

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const p50 = [28, 32, 26, 34, 30, 29, 27];
  const p99 = [94, 112, 88, 148, 98, 91, 85];
  const bZW = W - 72; const bW4 = Math.floor(bZW / 7) - 6;
  const bMaxH = 82; const bBase = chartY + 142;

  days.forEach((d, i) => {
    const bx = 28 + i * (bW4 + 6);
    const isT = i === 6;
    els.push(r(bx, bBase - Math.round(p99[i]/160*bMaxH), bW4, Math.round(p99[i]/160*bMaxH), { fill: isT ? C.blue + '30' : 'rgba(79,126,255,0.12)', r: 4 }));
    els.push(r(bx + 2, bBase - Math.round(p50[i]/160*bMaxH), bW4 - 4, Math.round(p50[i]/160*bMaxH), { fill: isT ? C.blue : C.blue + '70', r: 3 }));
    els.push(t(d, bx + bW4/2, bBase + 8, { size: 10, color: isT ? C.blue : C.textMuted, align: 'center', font: MONO, weight: isT ? '700' : '400' }));
  });

  els.push(r(28, chartY + 152, 10, 5, { fill: C.blue, r: 2 }));
  els.push(t('P50', 42, chartY + 151, { size: 9, color: C.textMuted, font: MONO }));
  els.push(r(70, chartY + 152, 10, 5, { fill: C.blue + '40', r: 2 }));
  els.push(t('P99', 84, chartY + 151, { size: 9, color: C.textMuted, font: MONO }));

  // Error rate
  const errY = chartY + 172;
  card(16, errY, W - 32, 106, { fill: C.surface, stroke: C.border, r: 16 }).forEach(e => els.push(e));
  els.push(t('Error Rate %', 28, errY + 14, { size: 11, color: C.textSub, weight: '500' }));
  els.push(t('0.02% avg', W - 28, errY + 14, { size: 11, color: C.green, align: 'right', weight: '600', font: MONO }));

  const errVals = [0.0, 0.1, 0.0, 0.2, 1.4, 0.0, 0.0];
  const eBase = errY + 90; const eBW = Math.floor(bZW / 7) - 6;
  days.forEach((d, i) => {
    const ex = 28 + i * (eBW + 6);
    const eh = Math.max(3, Math.round((errVals[i] / 2.0) * 58));
    els.push(r(ex, eBase - eh, eBW, eh, { fill: errVals[i] > 0.5 ? C.red : C.green + '60', r: 3 }));
    els.push(t(d, ex + eBW/2, eBase + 8, { size: 10, color: C.textMuted, align: 'center', font: MONO }));
  });

  // Regional
  const regY = errY + 120;
  card(16, regY, W - 32, 148, { fill: C.surface, stroke: C.border, r: 16 }).forEach(e => els.push(e));
  els.push(t('REGIONAL TRAFFIC', 28, regY + 14, { size: 10, color: C.textMuted, weight: '600', ls: 0.06, font: MONO }));

  const regions = [
    { name: 'US East', pct: 42, ms: '28ms', color: C.blue },
    { name: 'EU West', pct: 28, ms: '41ms', color: C.purple },
    { name: 'Asia Pac', pct: 18, ms: '68ms', color: C.green },
    { name: 'US West', pct: 12, ms: '19ms', color: C.amber },
  ];
  const regBarW = W - 32 - 90 - 50;
  regions.forEach((reg, i) => {
    const ry2 = regY + 32 + i * 26;
    els.push(t(reg.name, 28, ry2 + 2, { size: 11, color: C.text, weight: '500' }));
    els.push(r(96, ry2 + 5, regBarW, 6, { fill: 'rgba(255,255,255,0.05)', r: 3 }));
    els.push(r(96, ry2 + 5, Math.round(regBarW * reg.pct / 100), 6, { fill: reg.color, r: 3 }));
    els.push(t(reg.pct + '%', 96 + regBarW + 8, ry2 + 2, { size: 11, color: C.textMuted, font: MONO }));
    els.push(t(reg.ms, W - 28, ry2 + 2, { size: 11, color: reg.color, align: 'right', font: MONO, weight: '600' }));
  });

  navBar(3).forEach(e => els.push(e));
  return { id: makeId(), name: 'Analytics', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ─── SCREEN 5 — Alerts ───────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(r(0, 0, W, H, { fill: C.bg }));
  els.push(r(240, 110, 180, 180, { fill: 'rgba(61,202,138,0.03)', r: 90 }));
  statusBar().forEach(e => els.push(e));

  els.push(t('Alerts', 20, 50, { size: 24, weight: '700', color: C.text }));
  els.push(t('4 active rules  ·  On-call: you', 20, 76, { size: 12, color: C.textSub }));

  // On-call card
  card(16, 94, W - 32, 64, { fill: C.greenDim, stroke: C.borderGrn, r: 14 }).forEach(e => els.push(e));
  els.push(r(20, 95, W - 40, 1.5, { fill: 'rgba(61,202,138,0.28)', r: 1 }));
  els.push(circ(38, 126, 17, { fill: C.surface, stroke: C.borderGrn, sw: 1 }));
  els.push(t('J', 38, 118, { size: 13, weight: '700', color: C.green, align: 'center' }));
  els.push(t('Jordan Kim', 64, 113, { size: 13, weight: '600', color: C.text }));
  els.push(t('On-call until Mon 09:00 UTC', 64, 131, { size: 10, color: C.textSub }));
  els.push(t('● Live', W - 28, 120, { size: 11, color: C.green, align: 'right', weight: '500' }));

  els.push(t('ALERT RULES', 20, 170, { size: 10, color: C.textMuted, weight: '600', ls: 0.08, font: MONO }));
  els.push(t('+ Rule', W - 20, 170, { size: 11, color: C.blue, align: 'right' }));

  const rules = [
    { name: 'High Error Rate',    cond: 'error_rate > 1% for 5m', ch: 'PagerDuty + Slack', sev: 'critical', on: true  },
    { name: 'P99 Latency Spike',  cond: 'p99 > 500ms for 2m',     ch: 'Slack #incidents',  sev: 'warning',  on: true  },
    { name: 'Service Down',       cond: 'uptime check fails 3x',  ch: 'PagerDuty + SMS',   sev: 'critical', on: true  },
    { name: 'Low Traffic Anomaly',cond: 'req/min drops > 80%',     ch: 'Slack #alerts',     sev: 'warning',  on: false },
  ];

  let ry3 = 186;
  rules.forEach((rule) => {
    const rh = 80;
    const sc2 = rule.sev === 'critical' ? C.red : C.amber;
    card(16, ry3, W - 32, rh, {
      fill: rule.on ? C.surface : 'rgba(255,255,255,0.02)',
      stroke: rule.on ? C.border : 'rgba(255,255,255,0.04)', r: 12,
    }).forEach(e => els.push(e));

    const sl = rule.sev === 'critical' ? 'CRITICAL' : 'WARNING';
    const bw5 = sl.length * 6 + 12;
    els.push(r(26, ry3 + 9, bw5, 15, { fill: rule.on ? sc2 + '18' : 'rgba(255,255,255,0.04)', stroke: rule.on ? sc2 + '40' : C.border, sw: 1, r: 7 }));
    els.push(t(sl, 32, ry3 + 11, { size: 8, color: rule.on ? sc2 : C.textMuted, weight: '700', ls: 0.04, font: MONO }));

    // Toggle
    els.push(r(W - 52, ry3 + 10, 32, 16, { fill: rule.on ? C.blue : 'rgba(255,255,255,0.08)', stroke: 'transparent', r: 8 }));
    const kx = rule.on ? W - 52 + 18 : W - 52 + 2;
    els.push(circ(kx + 6, ry3 + 18, 6, { fill: '#FFFFFF' }));

    els.push(t(rule.name, 26, ry3 + 33, { size: 13, weight: '600', color: rule.on ? C.text : C.textMuted }));
    els.push(t(rule.cond, 26, ry3 + 50, { size: 10, color: C.textMuted, font: MONO }));
    els.push(t('→ ' + rule.ch, 26, ry3 + 65, { size: 10, color: rule.on ? C.blue : C.textMuted, weight: '500' }));
    ry3 += rh + 10;
  });

  els.push(t('CHANNELS', 20, ry3 + 4, { size: 10, color: C.textMuted, weight: '600', ls: 0.08, font: MONO }));
  const channels = [
    { name: 'Slack',      sub: '#incidents, #alerts',  icon: '◈', color: C.purple },
    { name: 'PagerDuty',  sub: 'Team: platform-oncall', icon: '◉', color: C.red    },
    { name: 'Email',      sub: 'team@uplink.dev',       icon: '✉', color: C.blue   },
  ];
  channels.forEach((ch, i) => {
    const cy3 = ry3 + 22 + i * 46;
    card(16, cy3, W - 32, 38, { fill: C.surface, stroke: C.border, r: 10 }).forEach(e => els.push(e));
    els.push(circ(36, cy3 + 19, 12, { fill: ch.color + '18', stroke: ch.color + '40', sw: 1 }));
    els.push(t(ch.icon, 36, cy3 + 12, { size: 11, color: ch.color, align: 'center' }));
    els.push(t(ch.name, 56, cy3 + 10, { size: 13, weight: '600', color: C.text }));
    els.push(t(ch.sub, 56, cy3 + 26, { size: 10, color: C.textMuted, font: MONO }));
    els.push(t('✓ Connected', W - 28, cy3 + 16, { size: 10, color: C.green, align: 'right', weight: '500' }));
  });

  navBar(0).forEach(e => els.push(e));
  return { id: makeId(), name: 'Alerts', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'UPLINK — API Health & Monitoring',
    description: "Dark-theme API health monitoring dashboard for indie developers. Inspired by Godly's 'Status' (front page Mar 30 2026), Land-book's 'Interfere — Build software that never breaks', and Dark Mode Design's Midday. Cool navy base, electric blue + emerald + coral palette, monospace data type.",
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

fs.writeFileSync('/workspace/group/design-studio/uplink.pen', JSON.stringify(pen, null, 2));
console.log('✓ uplink.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
