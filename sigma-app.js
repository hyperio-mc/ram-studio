'use strict';
// sigma-app.js
// SIGMA — AI Production Monitoring
//
// Inspiration:
//   · neon.com (darkmodedesign.com) — Pure #060708 black, electric #00E599 green
//     as sole accent. Terminal-meets-luxury aesthetic. Code elements on even
//     darker panels. Large bold sans-serif at tight tracking. Surface layering
//     through opacity rather than borders — no card outlines, just depth.
//   · godly.website grid — Multiple AI workspace dashboards trending toward
//     "control room" density: metric rows, status dots, live sparklines.
//   · land-book "Radial" listing — Deep slate + single neon accent +
//     "Science needs a new operating system" positioning. That boldness applied
//     to infra tooling.
//
// New patterns tried:
//   · Distributed trace waterfall as design element (nested indent bars)
//   · SLO "burn rate" arc — semicircle gauge using layered rectangles
//   · Deploy timeline with impact zones (color-coded inline segments)
//   · "Pulse" status dot with ring — live / degraded / down states
//
// Theme: DARK (balm was light → rotating to dark)
//
// Palette: near-pure black + electric green + warm amber alerts
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ─── Pencil v2.8 helpers ────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10) +
         Math.random().toString(36).slice(2, 10);
}

function frame(x, y, w, h, extra = {}) {
  return { x, y, width: w, height: h, ...extra };
}

function rect(x, y, w, h, fill, extra = {}) {
  return {
    id: uid(), type: 'rectangle',
    frame: frame(x, y, w, h),
    fills: [{ type: 'solid', color: fill }],
    cornerRadius: extra.r ?? 0,
    ...extra,
  };
}

function text(x, y, w, h, str, size, weight, color, extra = {}) {
  return {
    id: uid(), type: 'text',
    frame: frame(x, y, w, h),
    content: str,
    fontSize: size,
    fontWeight: weight,
    color,
    ...extra,
  };
}

function group(children, extra = {}) {
  return { id: uid(), type: 'group', children, ...extra };
}

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:       '#060708',      // near-pure black (Neon.com inspired)
  surf:     '#0C0E14',      // dark navy-black card surface
  surf2:    '#111520',      // slightly lighter nested surface
  green:    '#00E599',      // electric green — Neon's signature
  greenDim: 'rgba(0,229,153,0.15)',
  amber:    '#F59E0B',      // warm amber for alerts/degraded
  amberDim: 'rgba(245,158,11,0.15)',
  red:      '#EF4444',      // critical / down
  redDim:   'rgba(239,68,68,0.15)',
  text:     '#E8EDF5',      // cool off-white
  muted:    'rgba(232,237,245,0.45)',
  sub:      'rgba(232,237,245,0.28)',
  border:   'rgba(232,237,245,0.07)',
  greenBorder: 'rgba(0,229,153,0.25)',
};

const W = 390;
const H = 844;

// ─── Shared components ──────────────────────────────────────────────────────
function statusBar(extra = {}) {
  return rect(0, 0, W, 44, C.bg, { ...extra });
}

function bottomNav(activeIdx) {
  const items = ['activity','grid','search','bell','user'];
  const labels = ['Monitor','Services','Traces','Alerts','Settings'];
  const icons  = ['◈','⊞','⌥','◉','◎'];
  const navH   = 80;
  const y0     = H - navH;
  const tabW   = W / items.length;

  const bg = rect(0, y0, W, navH, C.surf);
  const border = rect(0, y0, W, 1, C.border);

  const tabs = items.map((_, i) => {
    const active = i === activeIdx;
    const cx = i * tabW + tabW / 2;
    return group([
      text(cx - 12, y0 + 10, 24, 24, icons[i], 18, '400',
           active ? C.green : C.sub, { textAlign: 'center' }),
      text(cx - 28, y0 + 36, 56, 16, labels[i], 9, '500',
           active ? C.green : C.sub, { textAlign: 'center' }),
    ]);
  });
  return group([bg, border, ...tabs]);
}

function chip(x, y, label, color = C.green, bg = C.greenDim) {
  return group([
    rect(x, y, label.length * 6.5 + 16, 20, bg, { r: 10 }),
    text(x + 8, y + 3, label.length * 6.5, 14, label, 9, '600', color),
  ]);
}

function sparkline(x, y, w, h, values, color = C.green) {
  // Render as a series of vertical bars for .pen compatibility
  const max = Math.max(...values);
  const barW = Math.floor(w / values.length) - 1;
  const bars = values.map((v, i) => {
    const bh = Math.max(2, Math.round((v / max) * h));
    return rect(x + i * (barW + 1), y + h - bh, barW, bh, color, { r: 1 });
  });
  return group(bars);
}

function sloArc(x, y, r, pct, color = C.green) {
  // Semicircle SLO gauge — represented as stacked rect segments
  const segs = 20;
  const filled = Math.round(pct * segs / 100);
  const segW = Math.floor((r * 2) / segs);
  const parts = [];
  for (let i = 0; i < segs; i++) {
    const active = i < filled;
    const cx = x - r + i * segW;
    const ht = active ? 8 : 5;
    parts.push(rect(cx, y - ht / 2, segW - 2, ht, active ? color : C.border, { r: 2 }));
  }
  return group(parts);
}

// ─── Screen 1: Monitor (Overview) ───────────────────────────────────────────
function screen1() {
  const layers = [];

  // Background
  layers.push(rect(0, 0, W, H, C.bg));

  // Header
  layers.push(text(20, 56, 200, 28, 'Monitor', 22, '700', C.text));
  layers.push(text(20, 84, 250, 16, 'Production · All regions', 11, '400', C.muted));

  // Live indicator
  layers.push(rect(W - 70, 62, 8, 8, C.green, { r: 4 }));
  layers.push(text(W - 58, 60, 48, 14, 'LIVE', 10, '700', C.green));

  // SLO Status bar
  const sloY = 116;
  layers.push(rect(20, sloY, W - 40, 72, C.surf, { r: 12 }));
  layers.push(text(32, sloY + 12, 120, 16, 'Overall SLO', 11, '500', C.muted));
  layers.push(text(32, sloY + 30, 100, 24, '99.94%', 20, '700', C.text));
  layers.push(text(32, sloY + 54, 200, 12, '30-day error budget: 62% remaining', 9, '400', C.sub));
  // Arc
  layers.push(sloArc(W - 60, sloY + 36, 36, 99.94, C.green));

  // Service health grid (3×2)
  const services = [
    { name: 'API Gateway',    rps: '4.2K', p99: '42ms', status: 'healthy' },
    { name: 'Auth Service',   rps: '1.8K', p99: '18ms', status: 'healthy' },
    { name: 'Database',       rps: '9.1K', p99: '6ms',  status: 'healthy' },
    { name: 'Cache Layer',    rps: '22K',  p99: '2ms',  status: 'healthy' },
    { name: 'Queue Worker',   rps: '340',  p99: '180ms', status: 'degraded' },
    { name: 'ML Inference',   rps: '88',   p99: '310ms', status: 'degraded' },
  ];

  layers.push(text(20, 208, 200, 16, 'Services', 12, '600', C.muted));

  services.forEach((svc, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 20 + col * (W / 2 - 10);
    const sy = 228 + row * 78;
    const cw = W / 2 - 30;
    const isDeg = svc.status === 'degraded';

    layers.push(rect(sx, sy, cw, 68, C.surf, { r: 10 }));
    // Status dot
    layers.push(rect(sx + cw - 22, sy + 12, 8, 8, isDeg ? C.amber : C.green, { r: 4 }));
    layers.push(text(sx + 10, sy + 10, cw - 30, 14, svc.name, 11, '600', C.text));
    layers.push(text(sx + 10, sy + 28, 60, 12, svc.rps + '/s', 10, '500', isDeg ? C.amber : C.green));
    layers.push(text(sx + 10, sy + 44, 80, 12, 'p99 ' + svc.p99, 9, '400', C.sub));
    // Mini sparkline
    const vals = isDeg
      ? [30,35,32,50,80,95,110,98,120,105]
      : [40,38,42,39,41,40,43,38,40,41];
    layers.push(sparkline(sx + cw - 52, sy + 30, 40, 28, vals, isDeg ? C.amber : C.green));
  });

  // Incidents section
  const incY = 462;
  layers.push(text(20, incY, 200, 16, 'Active Incidents', 12, '600', C.muted));

  const incidents = [
    { sev: 'P2', title: 'Queue latency spike', age: '23m', color: C.amber },
    { sev: 'P3', title: 'ML cold start increase', age: '1h 4m', color: C.amber },
  ];

  incidents.forEach((inc, i) => {
    const iy = incY + 22 + i * 60;
    layers.push(rect(20, iy, W - 40, 50, C.surf, { r: 10 }));
    layers.push(rect(20, iy, 3, 50, inc.color, { r: [0,2,2,0] }));
    layers.push(text(32, iy + 10, 50, 16, inc.sev, 10, '700', inc.color));
    layers.push(text(32, iy + 26, 200, 14, inc.title, 11, '500', C.text));
    layers.push(text(W - 80, iy + 18, 60, 14, inc.age + ' ago', 9, '400', C.sub, { textAlign: 'right' }));
  });

  // Volume chart
  const chartY = 610;
  layers.push(text(20, chartY, 200, 16, 'Request Volume', 12, '600', C.muted));
  const volVals = [68,74,71,80,95,110,105,120,118,130,125,140];
  layers.push(rect(20, chartY + 22, W - 40, 60, C.surf, { r: 10 }));
  layers.push(sparkline(30, chartY + 30, W - 60, 44, volVals, C.green));
  layers.push(text(20, chartY + 90, W - 40, 12, '6h ago                   Now', 9, '400', C.sub, { textAlign: 'center' }));

  layers.push(bottomNav(0));
  return { id: uid(), name: 'Monitor', frame: frame(0, 0, W, H), children: layers };
}

// ─── Screen 2: Services ─────────────────────────────────────────────────────
function screen2() {
  const layers = [];
  layers.push(rect(0, 0, W, H, C.bg));

  // Header
  layers.push(text(20, 56, 200, 28, 'Services', 22, '700', C.text));
  layers.push(text(20, 84, 260, 16, '12 services · 3 regions', 11, '400', C.muted));

  // Filter chips
  ['All','Healthy','Degraded','Down'].forEach((f, i) => {
    const fx = 20 + i * 76;
    const active = i === 0;
    layers.push(rect(fx, 112, 68, 26, active ? C.greenDim : C.surf, { r: 13 }));
    layers.push(rect(fx, 112, 68, 26, 'transparent', { r: 13, strokeColor: active ? C.green : 'transparent', strokeWidth: 1 }));
    layers.push(text(fx, 112, 68, 26, f, 10, active ? '600' : '400', active ? C.green : C.muted, { textAlign: 'center', verticalAlign: 'middle' }));
  });

  // Service list
  const services = [
    { name: 'API Gateway',    env: 'prod-us-east', rps: '4,241', p50: '12ms', p99: '42ms', errors: '0.02%', status: 'healthy', uptime: '99.99%' },
    { name: 'Auth Service',   env: 'prod-us-east', rps: '1,802', p50: '8ms',  p99: '18ms', errors: '0.01%', status: 'healthy', uptime: '99.98%' },
    { name: 'Database',       env: 'prod-us-east', rps: '9,103', p50: '3ms',  p99: '6ms',  errors: '0.00%', status: 'healthy', uptime: '100%'   },
    { name: 'Queue Worker',   env: 'prod-us-east', rps: '340',   p50: '85ms', p99: '180ms',errors: '0.12%', status: 'degraded',uptime: '99.82%' },
    { name: 'ML Inference',   env: 'prod-us-west', rps: '88',    p50: '140ms',p99: '310ms',errors: '0.08%', status: 'degraded',uptime: '99.91%' },
    { name: 'Email Worker',   env: 'prod-eu',      rps: '24',    p50: '220ms',p99: '440ms',errors: '0.00%', status: 'healthy', uptime: '99.97%' },
  ];

  services.forEach((svc, i) => {
    const sy = 154 + i * 90;
    const isDeg = svc.status === 'degraded';
    const sc = isDeg ? C.amber : C.green;

    layers.push(rect(20, sy, W - 40, 80, C.surf, { r: 12 }));
    layers.push(rect(20, sy, 3, 80, sc, { r: [0, 2, 2, 0] }));

    // Row 1: name + status chip
    layers.push(text(32, sy + 12, 180, 16, svc.name, 13, '600', C.text));
    layers.push(chip(W - 90, sy + 12, isDeg ? 'DEGRADED' : 'HEALTHY', sc, isDeg ? C.amberDim : C.greenDim));

    // Row 2: env tag
    layers.push(text(32, sy + 30, 200, 12, svc.env, 9, '400', C.sub));

    // Row 3: metrics
    layers.push(text(32,       sy + 48, 80, 12, svc.rps + ' rps', 10, '500', C.text));
    layers.push(text(110,      sy + 48, 70, 12, 'p50 ' + svc.p50, 10, '400', C.muted));
    layers.push(text(175,      sy + 48, 70, 12, 'p99 ' + svc.p99, 10, '400', C.muted));
    layers.push(text(32,       sy + 62, 80, 12, svc.errors + ' err', 9, '400', parseFloat(svc.errors) > 0.05 ? C.amber : C.sub));
    layers.push(text(110,      sy + 62, 100, 12, svc.uptime + ' up', 9, '400', C.sub));
  });

  layers.push(bottomNav(1));
  return { id: uid(), name: 'Services', frame: frame(0, 0, W, H), children: layers };
}

// ─── Screen 3: Traces ───────────────────────────────────────────────────────
function screen3() {
  const layers = [];
  layers.push(rect(0, 0, W, H, C.bg));

  // Header
  layers.push(text(20, 56, 200, 28, 'Traces', 22, '700', C.text));
  layers.push(text(20, 84, 260, 16, 'Last 15 min · p99 spike filter', 11, '400', C.muted));

  // Search bar
  layers.push(rect(20, 112, W - 40, 36, C.surf, { r: 18 }));
  layers.push(text(44, 112, 20, 36, '⌥', 14, '400', C.muted, { verticalAlign: 'middle' }));
  layers.push(text(62, 112, 200, 36, 'Search traces...', 12, '400', C.sub, { verticalAlign: 'middle' }));

  // Trace list header
  layers.push(text(20, 164, 200, 12, 'TRACE ID', 9, '600', C.sub));
  layers.push(text(W - 120, 164, 100, 12, 'DURATION', 9, '600', C.sub, { textAlign: 'right' }));
  layers.push(rect(20, 178, W - 40, 1, C.border));

  // Traces — waterfall representation
  const traces = [
    {
      id: 'trc_8f3a2b', op: 'POST /api/ingest', dur: 342, status: 'error',
      spans: [
        { name: 'api-gateway', start: 0,   dur: 342, color: C.amber },
        { name: 'auth.verify', start: 5,   dur: 18,  color: C.green },
        { name: 'queue.push',  start: 28,  dur: 290, color: C.amber },
        { name: 'db.insert',   start: 330, dur: 10,  color: C.green },
      ],
    },
    {
      id: 'trc_1c9d4e', op: 'GET /api/events', dur: 22, status: 'ok',
      spans: [
        { name: 'api-gateway', start: 0, dur: 22, color: C.green },
        { name: 'cache.get',   start: 4, dur: 8,  color: C.green },
        { name: 'auth.verify', start: 4, dur: 12, color: C.green },
      ],
    },
    {
      id: 'trc_7e5f0a', op: 'POST /api/ml/score', dur: 418, status: 'slow',
      spans: [
        { name: 'api-gateway',   start: 0,   dur: 418, color: C.amber },
        { name: 'ml.inference',  start: 10,  dur: 390, color: C.amber },
        { name: 'db.read',       start: 405, dur: 12,  color: C.green },
      ],
    },
  ];

  traces.forEach((tr, ti) => {
    const ty = 186 + ti * 172;
    const isErr = tr.status === 'error';
    const isSlow = tr.status === 'slow';
    const sc = isErr ? C.red : isSlow ? C.amber : C.green;

    layers.push(rect(20, ty, W - 40, 160, C.surf, { r: 12 }));

    // Trace header
    layers.push(text(32, ty + 12, 180, 14, tr.op, 11, '600', C.text));
    layers.push(text(32, ty + 28, 120, 12, tr.id, 9, '400', C.sub));
    layers.push(text(W - 68, ty + 12, 48, 14, tr.dur + 'ms', 11, '600', sc, { textAlign: 'right' }));
    layers.push(chip(W - 80, ty + 30, tr.status.toUpperCase(), sc, isErr ? C.redDim : isSlow ? C.amberDim : C.greenDim));

    // Waterfall spans
    const wfY = ty + 56;
    const wfW = W - 64;
    const totalDur = tr.dur;

    layers.push(text(32, wfY - 14, 80, 12, 'SPAN', 8, '600', C.sub));
    layers.push(text(W - 90, wfY - 14, 70, 12, 'WATERFALL', 8, '600', C.sub, { textAlign: 'right' }));

    tr.spans.forEach((sp, si) => {
      const spy = wfY + si * 24;
      const barX = 32 + Math.round((sp.start / totalDur) * wfW * 0.5);
      const barW2 = Math.max(3, Math.round((sp.dur / totalDur) * wfW * 0.5));

      layers.push(text(32, spy + 2, 110, 12, sp.name, 9, '400', C.muted));
      layers.push(rect(150, spy + 4, wfW * 0.5, 8, C.surf2, { r: 2 }));
      layers.push(rect(150 + Math.round((sp.start / totalDur) * wfW * 0.5), spy + 4,
                        barW2, 8, sp.color, { r: 2 }));
    });
  });

  layers.push(bottomNav(2));
  return { id: uid(), name: 'Traces', frame: frame(0, 0, W, H), children: layers };
}

// ─── Screen 4: Alerts ───────────────────────────────────────────────────────
function screen4() {
  const layers = [];
  layers.push(rect(0, 0, W, H, C.bg));

  // Header
  layers.push(text(20, 56, 200, 28, 'Alerts', 22, '700', C.text));
  // Badge
  layers.push(rect(130, 60, 24, 18, C.amber, { r: 9 }));
  layers.push(text(130, 60, 24, 18, '5', 10, '700', '#000', { textAlign: 'center', verticalAlign: 'middle' }));

  // Summary cards
  const sumCards = [
    { count: '1', label: 'Critical', color: C.red, bg: C.redDim },
    { count: '2', label: 'Warning',  color: C.amber, bg: C.amberDim },
    { count: '2', label: 'Info',     color: C.green, bg: C.greenDim },
  ];
  sumCards.forEach((s, i) => {
    const sx = 20 + i * ((W - 40) / 3 + 4);
    const sw = (W - 40) / 3 - 4;
    layers.push(rect(sx, 92, sw, 56, s.bg, { r: 10 }));
    layers.push(text(sx, 92, sw, 36, s.count, 24, '700', s.color, { textAlign: 'center', verticalAlign: 'middle' }));
    layers.push(text(sx, 118, sw, 24, s.label, 9, '500', s.color, { textAlign: 'center' }));
  });

  // Alert list
  const alerts = [
    { sev: 'P1', title: 'Error rate > 5% on Queue Worker', service: 'queue-worker', time: '2m ago',  color: C.red,   ack: false },
    { sev: 'P2', title: 'p99 latency > 200ms',             service: 'queue-worker', time: '23m ago', color: C.amber, ack: false },
    { sev: 'P2', title: 'ML cold start rate elevated',      service: 'ml-inference', time: '1h 4m',  color: C.amber, ack: true  },
    { sev: 'P3', title: 'Disk usage > 75% on db-replica-2',service: 'database',     time: '2h 10m', color: C.green, ack: true  },
    { sev: 'P3', title: 'Cache hit ratio dropped to 88%',   service: 'cache-layer',  time: '3h 40m', color: C.green, ack: true  },
  ];

  layers.push(text(20, 160, 200, 16, 'Active', 12, '600', C.muted));

  alerts.forEach((al, i) => {
    const ay = 182 + i * 78;
    layers.push(rect(20, ay, W - 40, 68, C.surf, { r: 12 }));
    layers.push(rect(20, ay, 3, 68, al.color, { r: [0, 2, 2, 0] }));

    // Sev badge
    layers.push(rect(32, ay + 12, 26, 18, al.color === C.red ? C.redDim : al.color === C.amber ? C.amberDim : C.greenDim, { r: 4 }));
    layers.push(text(32, ay + 12, 26, 18, al.sev, 9, '700', al.color, { textAlign: 'center', verticalAlign: 'middle' }));

    layers.push(text(66, ay + 12, W - 120, 16, al.title, 11, '600', C.text));
    layers.push(text(32, ay + 34, 160, 12, al.service, 9, '400', C.sub));
    layers.push(text(32, ay + 48, 100, 12, al.time, 9, '400', C.sub));

    if (al.ack) {
      layers.push(text(W - 68, ay + 12, 48, 14, '✓ Acked', 9, '500', C.sub, { textAlign: 'right' }));
    } else {
      layers.push(rect(W - 80, ay + 12, 58, 22, C.greenDim, { r: 11 }));
      layers.push(text(W - 80, ay + 12, 58, 22, 'Acknowledge', 8, '600', C.green, { textAlign: 'center', verticalAlign: 'middle' }));
    }
  });

  layers.push(bottomNav(3));
  return { id: uid(), name: 'Alerts', frame: frame(0, 0, W, H), children: layers };
}

// ─── Screen 5: Deploy ───────────────────────────────────────────────────────
function screen5() {
  const layers = [];
  layers.push(rect(0, 0, W, H, C.bg));

  // Header
  layers.push(text(20, 56, 200, 28, 'Deploys', 22, '700', C.text));
  layers.push(text(20, 84, 260, 16, 'Impact tracking enabled', 11, '400', C.green));

  // Current deploy card
  const curY = 116;
  layers.push(rect(20, curY, W - 40, 110, C.surf, { r: 12 }));
  layers.push(rect(20, curY, 3, 110, C.green, { r: [0, 2, 2, 0] }));
  layers.push(chip(32, curY + 12, 'LATEST', C.green, C.greenDim));
  layers.push(text(32, curY + 36, 280, 16, 'v2.14.0 — Auth token refresh optimization', 11, '600', C.text));
  layers.push(text(32, curY + 54, 200, 12, 'Deployed by elena@sigma.dev · 14m ago', 9, '400', C.sub));

  // Impact timeline bar
  layers.push(text(32, curY + 74, 80, 12, 'ERROR RATE', 8, '600', C.sub));
  const timelineW = W - 64;
  layers.push(rect(32, curY + 88, timelineW, 10, C.surf2, { r: 3 }));
  // Before deploy: slightly elevated
  layers.push(rect(32, curY + 88, Math.round(timelineW * 0.6), 10, C.greenDim, { r: [3, 0, 0, 3] }));
  // Deploy marker
  layers.push(rect(32 + Math.round(timelineW * 0.6) - 1, curY + 84, 2, 18, C.green));
  // After deploy: healthy
  layers.push(rect(32 + Math.round(timelineW * 0.6) + 1, curY + 88, Math.round(timelineW * 0.4) - 1, 10, C.greenDim, { r: [0, 3, 3, 0] }));

  // Deploy history
  const deploys = [
    { ver: 'v2.13.2', msg: 'Fix ML timeout config',         by: 'omar@sigma.dev',  time: '6h ago',  status: 'ok',   impact: 'no change' },
    { ver: 'v2.13.1', msg: 'Rollback: revert queue changes',by: 'system',           time: '9h ago',  status: 'ok',   impact: 'improved' },
    { ver: 'v2.13.0', msg: 'Queue worker refactor',         by: 'kai@sigma.dev',   time: '11h ago', status: 'bad',  impact: 'spike +180%' },
    { ver: 'v2.12.5', msg: 'Minor dependency bumps',        by: 'elena@sigma.dev', time: '1d ago',  status: 'ok',   impact: 'no change' },
  ];

  layers.push(text(20, 244, 200, 16, 'History', 12, '600', C.muted));

  deploys.forEach((d, i) => {
    const dy = 266 + i * 80;
    const isBad = d.status === 'bad';
    const sc = isBad ? C.amber : C.green;

    layers.push(rect(20, dy, W - 40, 70, C.surf, { r: 12 }));

    // Version chip
    layers.push(rect(32, dy + 12, 56, 18, C.surf2, { r: 4 }));
    layers.push(text(32, dy + 12, 56, 18, d.ver, 9, '600', C.text, { textAlign: 'center', verticalAlign: 'middle' }));

    layers.push(text(96, dy + 12, W - 160, 16, d.msg, 11, '500', C.text));
    layers.push(text(32, dy + 34, 160, 12, d.by, 9, '400', C.sub));
    layers.push(text(32, dy + 50, 100, 12, d.time, 9, '400', C.sub));

    // Impact badge
    layers.push(rect(W - 100, dy + 34, 80, 28, isBad ? C.redDim : C.greenDim, { r: 6 }));
    layers.push(text(W - 100, dy + 34, 80, 28, d.impact, 8, '600', isBad ? C.red : C.green, { textAlign: 'center', verticalAlign: 'middle' }));
  });

  layers.push(bottomNav(4));
  return { id: uid(), name: 'Deploys', frame: frame(0, 0, W, H), children: layers };
}

// ─── Assemble .pen ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SIGMA — AI Production Monitoring',
  description: 'Dark engineering aesthetic: pure black + electric green. Inspired by neon.com from darkmodedesign.com. Terminal-meets-luxury for infra monitoring.',
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
  colorVariables: {
    primary: C.green,
    background: C.bg,
    surface: C.surf,
    text: C.text,
    warning: C.amber,
    danger: C.red,
  },
};

const out = path.join(__dirname, 'sigma.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log('✓ sigma.pen written —', fs.statSync(out).size, 'bytes');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
