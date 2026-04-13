'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'siren';
const NAME = 'SIREN';
const TAGLINE = 'real-time API incident intelligence';
const HEARTBEAT = 101;
const THEME = 'dark';

// Palette — Cinema Charcoal + Neon Amber (avoiding tired purple/blue AI cliché)
// Inspired by: Godly.website terminal monospaced aesthetic + DarkModeDesign elevation system
const P = {
  bg:       '#0C0C0F',  // near-black, slightly cool
  surf:     '#131317',  // elevated surface
  card:     '#1B1B21',  // card bg
  card2:    '#212128',  // deeper card
  accent:   '#F59E0B',  // neon amber — incident urgency, avoids purple cliché
  accent2:  '#06B6D4',  // electric cyan — data/status
  green:    '#10B981',  // operational/healthy
  red:      '#EF4444',  // critical
  orange:   '#F97316',  // warning
  text:     '#F0EFE8',  // warm off-white
  muted:    'rgba(240,239,232,0.42)',
  border:   'rgba(240,239,232,0.08)',
  borderLt: 'rgba(240,239,232,0.12)',
  amberGlow:'rgba(245,158,11,0.12)',
  cyanGlow: 'rgba(6,182,212,0.10)',
  greenGlow:'rgba(16,185,129,0.10)',
};

const W = 390, H = 844;

// ── primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const rx = opts.rx ?? 0;
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  const st = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"${st}${op}/>`;
}

function text(x, y, content, size, fill, opts = {}) {
  const fw = opts.fw ?? 400;
  const anchor = opts.anchor ?? 'start';
  const font = opts.font ?? 'Inter, system-ui, sans-serif';
  const ls = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  const dy = opts.dy ?? 0;
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}"${ls}${op} dy="${dy}">${escapeXml(String(content))}</text>`;
}

function circle(cx, cy, r, fill, opts = {}) {
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  const st = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${st}${op}/>`;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const sw = opts.sw ?? 1;
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  const dash = opts.dash ? ` stroke-dasharray="${opts.dash}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${op}${dash}/>`;
}

function poly(points, fill, opts = {}) {
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  return `<polygon points="${points}" fill="${fill}"${op}/>`;
}

function svgPath(d, fill, opts = {}) {
  const op = opts.opacity != null ? ` opacity="${opts.opacity}"` : '';
  const st = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}" fill="${opts.noFill ? 'none' : fill}"` : '';
  if (opts.stroke) return `<path d="${d}"${st}${op}/>`;
  return `<path d="${d}" fill="${fill}"${op}/>`;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── shared components ─────────────────────────────────────────────────────────

function statusBar(el) {
  el.push(rect(0, 0, W, 44, P.bg));
  el.push(text(20, 30, '9:41', 14, P.text, { fw: 600 }));
  el.push(text(W - 20, 30, '●●●', 10, P.text, { anchor: 'end', opacity: 0.6 }));
}

// Nav bar with 5 items: Dashboard, Alerts, Endpoints, Team, Settings
function navBar(el, active = 0) {
  el.push(rect(0, H - 80, W, 80, P.surf, { stroke: P.border, sw: 1 }));
  // separator line
  el.push(line(0, H - 80, W, H - 80, P.borderLt));
  const tabs = [
    { label: 'Dash', icon: 'grid' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Health', icon: 'activity' },
    { label: 'Team', icon: 'users' },
    { label: 'Config', icon: 'settings' },
  ];
  tabs.forEach((t, i) => {
    const cx = 39 + i * 78;
    const cy = H - 50;
    const isActive = i === active;
    const col = isActive ? P.accent : P.muted;

    // icon placeholder (mini geometric)
    if (t.icon === 'grid') {
      el.push(rect(cx - 8, cy - 12, 6, 6, col, { rx: 1 }));
      el.push(rect(cx + 2, cy - 12, 6, 6, col, { rx: 1 }));
      el.push(rect(cx - 8, cy - 4, 6, 6, col, { rx: 1 }));
      el.push(rect(cx + 2, cy - 4, 6, 6, col, { rx: 1 }));
    } else if (t.icon === 'bell') {
      el.push(rect(cx - 5, cy - 13, 10, 9, col, { rx: 5 }));
      el.push(rect(cx - 3, cy - 4, 6, 3, col, { rx: 1 }));
      el.push(rect(cx - 2, cy, 4, 2, col, { rx: 1 }));
    } else if (t.icon === 'activity') {
      el.push(line(cx - 8, cy - 7, cx - 4, cy - 7, col, { sw: 2 }));
      el.push(line(cx - 4, cy - 7, cx - 1, cy - 13, col, { sw: 2 }));
      el.push(line(cx - 1, cy - 13, cx + 2, cy - 1, col, { sw: 2 }));
      el.push(line(cx + 2, cy - 1, cx + 5, cy - 7, col, { sw: 2 }));
      el.push(line(cx + 5, cy - 7, cx + 8, cy - 7, col, { sw: 2 }));
    } else if (t.icon === 'users') {
      el.push(circle(cx - 4, cy - 9, 4, col));
      el.push(svgPath(`M${cx - 12} ${cy} Q${cx - 4} ${cy - 4} ${cx + 4} ${cy}`, col, { stroke: col, sw: 2, noFill: true }));
      el.push(circle(cx + 5, cy - 10, 3, col, { opacity: 0.7 }));
    } else if (t.icon === 'settings') {
      el.push(circle(cx, cy - 7, 4, col, { stroke: col, sw: 2 }));
      el.push(circle(cx, cy - 7, 2, P.surf));
      for (let g = 0; g < 6; g++) {
        const a = (g * 60) * Math.PI / 180;
        const gx = cx + Math.cos(a) * 7;
        const gy = cy - 7 + Math.sin(a) * 7;
        el.push(rect(gx - 1.5, gy - 1.5, 3, 3, col, { rx: 1 }));
      }
    }
    el.push(text(cx, cy + 18, t.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      el.push(rect(cx - 16, H - 3, 32, 3, P.accent, { rx: 1.5 }));
    }
  });
}

// Monospaced chip / badge
function chip(x, y, label, color, opts = {}) {
  const el = [];
  const w = opts.w ?? label.length * 7.5 + 16;
  const h = opts.h ?? 20;
  el.push(rect(x, y, w, h, color, { rx: 4, opacity: 0.15 }));
  el.push(rect(x, y, w, h, 'none', { rx: 4, stroke: color, sw: 1, opacity: 0.35 }));
  el.push(text(x + w / 2, y + h / 2 + 4, label, 10, color, {
    anchor: 'middle', fw: 600,
    font: '"JetBrains Mono", "Fira Code", monospace',
    ls: '0.03em'
  }));
  return el;
}

function incidentDot(cx, cy, severity) {
  const colors = { critical: P.red, warning: P.orange, info: P.accent2 };
  const c = colors[severity] ?? P.muted;
  return [
    circle(cx, cy, 6, c, { opacity: 0.2 }),
    circle(cx, cy, 3.5, c),
  ];
}

// Thin sparkline from data array
function sparkline(x, y, w, h, data, color) {
  const el = [];
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((v - min) / range) * h;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  });
  // area fill
  const areaPath = `M${x},${y + h} L${pts.join(' L')} L${x + w},${y + h} Z`;
  el.push(svgPath(areaPath, color, { opacity: 0.12 }));
  // line
  el.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`);
  return el;
}

// Latency bar with fill
function latencyBar(x, y, w, h, pct, color) {
  return [
    rect(x, y, w, h, P.border, { rx: h / 2 }),
    rect(x, y, Math.max(4, w * pct / 100), h, color, { rx: h / 2 }),
  ];
}

// ── Screen 1: Live Dashboard ─────────────────────────────────────────────────
function screen1() {
  const el = [];
  statusBar(el);

  // App brand header
  el.push(rect(0, 44, W, 56, P.bg));
  el.push(text(20, 82, 'SIREN', 22, P.accent, {
    fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em'
  }));
  el.push(text(100, 82, '/ dashboard', 13, P.muted, {
    fw: 400, font: '"JetBrains Mono", monospace'
  }));
  // live indicator
  el.push(circle(W - 60, 74, 4, P.green));
  el.push(circle(W - 60, 74, 7, P.green, { opacity: 0.2 }));
  el.push(text(W - 50, 79, 'LIVE', 11, P.green, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.06em' }));

  // ── Bento grid (inspired by Saaspo bento 2.0 trend) ──
  // Row 1: Large uptime tile + small incident count
  const r1y = 110;

  // Uptime mega tile
  el.push(rect(16, r1y, 170, 110, P.card, { rx: 14 }));
  el.push(rect(16, r1y, 170, 110, P.greenGlow, { rx: 14 }));
  el.push(text(28, r1y + 22, 'UPTIME', 9, P.green, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(28, r1y + 62, '99.97', 36, P.text, { fw: 700 }));
  el.push(text(120, r1y + 62, '%', 18, P.muted, { fw: 400 }));
  el.push(text(28, r1y + 84, 'Last 30 days · 3 incidents', 10, P.muted));
  // mini bar chart of uptime by day
  const uptimeData = [1,1,1,1,0.98,1,1,1,1,1,0.99,1,1,1];
  uptimeData.forEach((v, i) => {
    const bx = 28 + i * 10;
    const bh = 8 * v;
    el.push(rect(bx, r1y + 98 - bh, 7, bh, v < 1 ? P.orange : P.green, { rx: 2 }));
  });

  // Active incidents tile
  el.push(rect(196, r1y, 178, 52, P.card, { rx: 14 }));
  el.push(text(212, r1y + 20, 'ACTIVE', 9, P.red, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(212, r1y + 44, '2', 26, P.text, { fw: 700 }));
  el.push(text(232, r1y + 44, 'incidents', 11, P.muted));

  // Error rate tile
  el.push(rect(196, r1y + 58, 178, 52, P.card, { rx: 14 }));
  el.push(text(212, r1y + 78, 'ERROR RATE', 9, P.orange, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(212, r1y + 102, '0.42', 22, P.text, { fw: 700 }));
  el.push(text(253, r1y + 102, '%', 14, P.muted));

  // Row 2: P99 latency sparkline (wide tile)
  const r2y = r1y + 118;
  el.push(rect(16, r2y, 358, 90, P.card, { rx: 14 }));
  el.push(text(28, r2y + 22, 'P99 LATENCY (ms)', 9, P.accent2, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.05em' }));
  el.push(text(310, r2y + 22, '142ms', 11, P.text, { anchor: 'end', fw: 600 }));

  const latencyPoints = [88, 95, 82, 103, 142, 118, 98, 87, 95, 108, 91, 85, 97, 112, 99, 94, 87, 103, 96, 91];
  el.push(...sparkline(28, r2y + 32, 334, 42, latencyPoints, P.accent2));
  // threshold line
  el.push(line(28, r2y + 44, 362, r2y + 44, P.orange, { sw: 1, dash: '4,3', opacity: 0.5 }));
  el.push(text(368, r2y + 48, '120ms SLA', 9, P.orange, { opacity: 0.7 }));

  // Row 3: Endpoint quick status row
  const r3y = r2y + 98;
  el.push(text(20, r3y + 16, 'Endpoint pulse', 12, P.text, { fw: 600 }));
  el.push(text(W - 20, r3y + 16, 'See all →', 12, P.accent, { anchor: 'end', fw: 500 }));

  const endpoints = [
    { name: '/api/auth', status: 'ok', lat: '48ms' },
    { name: '/api/orders', status: 'warn', lat: '312ms' },
    { name: '/api/search', status: 'critical', lat: '—' },
    { name: '/api/users', status: 'ok', lat: '61ms' },
  ];
  const sColors = { ok: P.green, warn: P.orange, critical: P.red };
  endpoints.forEach((ep, i) => {
    const ey = r3y + 30 + i * 42;
    el.push(rect(16, ey, 358, 36, P.surf, { rx: 10 }));
    el.push(circle(36, ey + 18, 5, sColors[ep.status]));
    el.push(circle(36, ey + 18, 8, sColors[ep.status], { opacity: 0.18 }));
    el.push(text(52, ey + 22, ep.name, 12, P.text, {
      fw: 500, font: '"JetBrains Mono", monospace'
    }));
    el.push(text(W - 28, ey + 22, ep.lat, 12, ep.status === 'critical' ? P.red : P.muted, {
      anchor: 'end', fw: 500, font: '"JetBrains Mono", monospace'
    }));
  });

  navBar(el, 0);

  return { name: 'Dashboard', elements: el };
}

// ── Screen 2: Active Alerts ──────────────────────────────────────────────────
function screen2() {
  const el = [];
  statusBar(el);

  el.push(rect(0, 44, W, 56, P.bg));
  el.push(text(20, 82, 'SIREN', 22, P.accent, {
    fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em'
  }));
  el.push(text(100, 82, '/ alerts', 13, P.muted, {
    fw: 400, font: '"JetBrains Mono", monospace'
  }));
  // count chip
  el.push(...chip(W - 66, 64, '2 active', P.red, { w: 62, h: 22 }));

  // Filter row
  const filters = ['All', 'Critical', 'Warning', 'Resolved'];
  filters.forEach((f, i) => {
    const fx = 16 + i * 88;
    const isActive = i === 0;
    el.push(rect(fx, 108, 80, 28, isActive ? P.accent : P.surf, { rx: 8 }));
    el.push(text(fx + 40, 126, f, 12, isActive ? P.bg : P.muted, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });

  // Incident cards
  const incidents = [
    {
      sev: 'CRITICAL', title: '/api/search returning 503',
      service: 'search-service', since: '14m ago',
      assigned: 'J.Kim', id: 'INC-2847',
      detail: 'Error rate spiked to 100% across all regions. Failover not responding.',
      color: P.red,
    },
    {
      sev: 'WARNING', title: 'P99 latency above SLA threshold',
      service: 'orders-service', since: '2h ago',
      assigned: 'R.Patel', id: 'INC-2846',
      detail: 'P99 latency at 312ms, SLA threshold is 200ms. CPU at 87%.',
      color: P.orange,
    },
    {
      sev: 'RESOLVED', title: 'Auth service elevated errors',
      service: 'auth-service', since: '6h ago',
      assigned: 'M.Torres', id: 'INC-2845',
      detail: 'Resolved after config rollback. Root cause: bad TLS cert renewal.',
      color: P.green,
    },
  ];

  incidents.forEach((inc, i) => {
    const iy = 148 + i * 180;
    // card
    el.push(rect(16, iy, 358, 168, P.card, { rx: 14 }));
    if (i < 2) {
      el.push(rect(16, iy, 358, 168, inc.color, { rx: 14, opacity: 0.06 }));
    }
    // severity bar left edge
    el.push(rect(16, iy, 4, 168, inc.color, { rx: 2 }));

    // severity chip
    el.push(...chip(28, iy + 14, inc.sev, inc.color, { w: inc.sev.length * 7.2 + 14, h: 20 }));
    el.push(text(W - 28, iy + 28, inc.id, 10, P.muted, {
      anchor: 'end', fw: 500, font: '"JetBrains Mono", monospace'
    }));

    el.push(text(28, iy + 58, inc.title, 14, P.text, { fw: 600 }));
    el.push(text(28, iy + 80, inc.detail, 11, P.muted));

    // service chip + time
    el.push(rect(28, iy + 102, inc.service.length * 6.5 + 14, 22, P.surf, { rx: 6 }));
    el.push(text(35, iy + 116, inc.service, 10, P.accent2, {
      fw: 500, font: '"JetBrains Mono", monospace'
    }));

    el.push(text(28, iy + 142, `${inc.since}  ·  ${inc.assigned}`, 11, P.muted));

    // action buttons
    el.push(rect(W - 116, iy + 130, 46, 26, P.surf, { rx: 7 }));
    el.push(text(W - 93, iy + 147, 'ACK', 10, P.muted, { anchor: 'middle', fw: 600 }));
    el.push(rect(W - 64, iy + 130, 52, 26, inc.sev === 'RESOLVED' ? P.surf : inc.color, { rx: 7, opacity: inc.sev === 'RESOLVED' ? 1 : 0.18 }));
    el.push(text(W - 38, iy + 147, inc.sev === 'RESOLVED' ? 'REOPEN' : 'RESOLVE', 10, inc.sev === 'RESOLVED' ? P.muted : inc.color, { anchor: 'middle', fw: 600 }));
  });

  navBar(el, 1);
  return { name: 'Active Alerts', elements: el };
}

// ── Screen 3: Endpoint Health ─────────────────────────────────────────────────
function screen3() {
  const el = [];
  statusBar(el);

  el.push(rect(0, 44, W, 56, P.bg));
  el.push(text(20, 82, 'SIREN', 22, P.accent, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(100, 82, '/ health', 13, P.muted, { fw: 400, font: '"JetBrains Mono", monospace' }));

  // Summary strip
  el.push(rect(16, 108, 358, 64, P.card, { rx: 14 }));
  const stats = [
    { val: '18', label: 'endpoints', color: P.text },
    { val: '15', label: 'healthy', color: P.green },
    { val: '2', label: 'degraded', color: P.orange },
    { val: '1', label: 'down', color: P.red },
  ];
  stats.forEach((s, i) => {
    const sx = 50 + i * 85;
    el.push(text(sx, 134, s.val, 20, s.color, { anchor: 'middle', fw: 700 }));
    el.push(text(sx, 150, s.label, 10, P.muted, { anchor: 'middle' }));
    if (i < 3) el.push(line(sx + 40, 118, sx + 40, 162, P.borderLt));
  });

  // Column headers
  el.push(text(20, 196, 'Endpoint', 11, P.muted, { fw: 500 }));
  el.push(text(210, 196, 'Latency', 11, P.muted, { fw: 500, anchor: 'middle' }));
  el.push(text(310, 196, 'Avail', 11, P.muted, { fw: 500, anchor: 'middle' }));
  el.push(text(370, 196, 'Reqs/m', 11, P.muted, { fw: 500, anchor: 'end' }));
  el.push(line(16, 202, W - 16, 202, P.borderLt));

  const rows = [
    { ep: '/api/auth',       lat: 48,  latPct: 24,  avail: 99.99, reqs: '2.1K', status: 'ok' },
    { ep: '/api/users',      lat: 61,  latPct: 30,  avail: 99.97, reqs: '1.4K', status: 'ok' },
    { ep: '/api/products',   lat: 78,  latPct: 39,  avail: 99.98, reqs: '890',  status: 'ok' },
    { ep: '/api/cart',       lat: 91,  latPct: 45,  avail: 99.95, reqs: '712',  status: 'ok' },
    { ep: '/api/checkout',   lat: 144, latPct: 72,  avail: 99.91, reqs: '308',  status: 'warn' },
    { ep: '/api/orders',     lat: 312, latPct: 100, avail: 99.88, reqs: '271',  status: 'warn' },
    { ep: '/api/search',     lat: 0,   latPct: 0,   avail: 85.20, reqs: '0',    status: 'critical' },
    { ep: '/api/recommend',  lat: 63,  latPct: 31,  avail: 99.96, reqs: '1.1K', status: 'ok' },
    { ep: '/api/inventory',  lat: 55,  latPct: 27,  avail: 99.99, reqs: '445',  status: 'ok' },
    { ep: '/api/payments',   lat: 180, latPct: 90,  avail: 99.93, reqs: '89',   status: 'ok' },
  ];

  const sCol = { ok: P.green, warn: P.orange, critical: P.red };
  rows.forEach((r, i) => {
    const ry = 212 + i * 54;
    el.push(rect(16, ry, 358, 48, i % 2 === 0 ? P.surf : P.bg, { rx: 8 }));
    // status dot
    el.push(circle(30, ry + 24, 4, sCol[r.status]));
    if (r.status !== 'ok') el.push(circle(30, ry + 24, 7, sCol[r.status], { opacity: 0.2 }));
    // endpoint name
    el.push(text(42, ry + 20, r.ep, 11, r.status === 'critical' ? P.red : P.text, {
      fw: 500, font: '"JetBrains Mono", monospace'
    }));
    // latency bar
    if (r.status !== 'critical') {
      el.push(...latencyBar(160, ry + 28, 95, 6, r.latPct, sCol[r.status]));
      el.push(text(262, ry + 36, `${r.lat}ms`, 10, P.muted, { anchor: 'end', fw: 500 }));
    } else {
      el.push(text(210, ry + 33, 'TIMEOUT', 10, P.red, { anchor: 'middle', fw: 700, font: '"JetBrains Mono", monospace' }));
    }
    // availability
    el.push(text(310, ry + 22, `${r.avail}%`, 11, r.avail < 99 ? P.orange : P.text, { anchor: 'middle', fw: 500 }));
    // req/m
    el.push(text(374, ry + 22, r.reqs, 11, P.muted, { anchor: 'end', fw: 400 }));
  });

  navBar(el, 2);
  return { name: 'Endpoint Health', elements: el };
}

// ── Screen 4: Incident Timeline ───────────────────────────────────────────────
function screen4() {
  const el = [];
  statusBar(el);

  el.push(rect(0, 44, W, 56, P.bg));
  // Back chevron
  el.push(text(20, 82, '‹', 20, P.muted, { fw: 400 }));
  el.push(text(36, 82, 'INC-2847', 15, P.text, { fw: 700, font: '"JetBrains Mono", monospace' }));
  el.push(...chip(W - 86, 64, 'CRITICAL', P.red, { w: 70, h: 22 }));

  // Incident title card
  el.push(rect(16, 108, 358, 100, P.card, { rx: 14 }));
  el.push(rect(16, 108, 358, 100, P.red, { rx: 14, opacity: 0.07 }));
  el.push(rect(16, 108, 4, 100, P.red, { rx: 2 }));
  el.push(text(28, 133, '/api/search returning 503', 15, P.text, { fw: 700 }));
  el.push(text(28, 153, 'Error rate: 100%  ·  Regions: all', 11, P.muted, { font: '"JetBrains Mono", monospace' }));
  el.push(text(28, 171, 'Assigned: J.Kim  ·  Started: 14:26 UTC', 11, P.muted));
  // Duration chip
  el.push(...chip(28, 178, '14m ongoing', P.red, { w: 88, h: 20 }));

  // MTTR / affect stats
  const mStats = [
    { v: '14m', l: 'Duration' },
    { v: '100%', l: 'Err rate' },
    { v: '2.1K', l: 'Req/min' },
    { v: '3', l: 'Regions' },
  ];
  el.push(rect(16, 216, 358, 52, P.surf, { rx: 12 }));
  mStats.forEach((s, i) => {
    const mx = 50 + i * 83;
    el.push(text(mx, 236, s.v, 16, i === 0 ? P.red : P.text, { anchor: 'middle', fw: 700 }));
    el.push(text(mx, 252, s.l, 10, P.muted, { anchor: 'middle' }));
    if (i < 3) el.push(line(mx + 38, 220, mx + 38, 260, P.borderLt));
  });

  // Timeline
  el.push(text(20, 290, 'Timeline', 13, P.text, { fw: 600 }));
  const timelineEvents = [
    { time: '14:26', desc: 'First alert triggered — error rate > 50%', type: 'alert', col: P.red },
    { time: '14:27', desc: 'Auto-escalated to on-call: J.Kim paged', type: 'escalate', col: P.orange },
    { time: '14:29', desc: 'J.Kim acknowledged incident', type: 'ack', col: P.accent },
    { time: '14:31', desc: 'Identified: search-pod-3 OOMKilled', type: 'diag', col: P.accent2 },
    { time: '14:35', desc: 'Attempted pod restart — no improvement', type: 'action', col: P.muted },
    { time: '14:38', desc: 'Traffic rerouted to backup cluster', type: 'action', col: P.accent2 },
    { time: '14:40', desc: 'Investigation ongoing…', type: 'pending', col: P.muted },
  ];

  // vertical timeline line
  el.push(line(40, 302, 40, 735, P.borderLt, { sw: 1 }));

  timelineEvents.forEach((ev, i) => {
    const ty = 306 + i * 62;
    el.push(circle(40, ty + 10, 5, ev.col));
    el.push(circle(40, ty + 10, 9, ev.col, { opacity: 0.15 }));
    el.push(text(54, ty + 7, ev.time, 10, P.muted, { fw: 600, font: '"JetBrains Mono", monospace' }));
    el.push(text(54, ty + 22, ev.desc, 11, ev.type === 'pending' ? P.muted : P.text));

    if (i < timelineEvents.length - 1) {
      el.push(line(40, ty + 19, 40, ty + 62, ev.col, { sw: 1, opacity: 0.2 }));
    }
  });

  // Action bar at bottom above nav
  el.push(rect(16, H - 108, 358, 20, P.bg));
  el.push(rect(16, H - 96, 170, 36, P.red, { rx: 10, opacity: 0.15 }));
  el.push(rect(16, H - 96, 170, 36, 'none', { rx: 10, stroke: P.red, sw: 1, opacity: 0.4 }));
  el.push(text(101, H - 72, 'RESOLVE', 12, P.red, { anchor: 'middle', fw: 700, font: '"JetBrains Mono", monospace' }));

  el.push(rect(196, H - 96, 178, 36, P.card, { rx: 10 }));
  el.push(text(285, H - 72, 'Post Mortem', 12, P.muted, { anchor: 'middle', fw: 500 }));

  navBar(el, 1);
  return { name: 'Incident Timeline', elements: el };
}

// ── Screen 5: Team On-Call ─────────────────────────────────────────────────────
function screen5() {
  const el = [];
  statusBar(el);

  el.push(rect(0, 44, W, 56, P.bg));
  el.push(text(20, 82, 'SIREN', 22, P.accent, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(100, 82, '/ team', 13, P.muted, { fw: 400, font: '"JetBrains Mono", monospace' }));

  // Current on-call hero
  el.push(rect(16, 110, 358, 96, P.card, { rx: 14 }));
  el.push(rect(16, 110, 358, 96, P.amberGlow, { rx: 14 }));
  el.push(text(28, 132, 'PRIMARY ON-CALL', 9, P.accent, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  // Avatar circle
  el.push(circle(56, 172, 22, P.accent, { opacity: 0.15 }));
  el.push(circle(56, 172, 18, P.accent, { opacity: 0.25 }));
  el.push(text(56, 178, 'JK', 14, P.accent, { anchor: 'middle', fw: 700 }));
  el.push(text(84, 158, 'Ji-young Kim', 15, P.text, { fw: 700 }));
  el.push(text(84, 176, 'Backend SRE · UTC+09:00', 11, P.muted));
  el.push(...chip(84, 182, '🔴 responding', P.red, { w: 104, h: 20 }));
  // Time remaining
  el.push(text(W - 28, 168, '22h left', 12, P.muted, { anchor: 'end' }));
  el.push(rect(W - 86, 178, 58, 4, P.border, { rx: 2 }));
  el.push(rect(W - 86, 178, 22, 4, P.accent, { rx: 2 }));

  // Rotation schedule
  el.push(text(20, 226, 'This week', 13, P.text, { fw: 600 }));

  const teamMembers = [
    { init: 'JK', name: 'Ji-young Kim',   role: 'Backend SRE',    tz: 'UTC+9',  day: 'Sun–Mon', active: true,  incidents: 1 },
    { init: 'RP', name: 'Raj Patel',      role: 'Platform Eng',   tz: 'UTC+5:30', day: 'Tue–Wed', active: false, incidents: 0 },
    { init: 'MT', name: 'Marco Torres',   role: 'Infra SRE',      tz: 'UTC-5',  day: 'Thu–Fri', active: false, incidents: 2 },
    { init: 'AO', name: 'Amira Osei',     role: 'Backend SRE',    tz: 'UTC+0',  day: 'Sat',     active: false, incidents: 0 },
  ];

  teamMembers.forEach((m, i) => {
    const my = 240 + i * 100;
    el.push(rect(16, my, 358, 88, m.active ? P.card : P.surf, { rx: 12 }));
    if (m.active) el.push(rect(16, my, 358, 88, P.amberGlow, { rx: 12 }));

    // avatar
    el.push(circle(48, my + 44, 16, m.active ? P.accent : P.border));
    el.push(text(48, my + 50, m.init, 11, m.active ? P.bg : P.muted, { anchor: 'middle', fw: 700 }));

    el.push(text(72, my + 30, m.name, 13, m.active ? P.text : P.muted, { fw: m.active ? 600 : 400 }));
    el.push(text(72, my + 48, `${m.role}  ·  ${m.tz}`, 11, P.muted));
    el.push(text(72, my + 66, m.day, 10, P.muted, { font: '"JetBrains Mono", monospace' }));

    if (m.active) {
      el.push(...chip(72, my + 70, 'ON-CALL', P.accent, { w: 60, h: 18 }));
    }

    // incident count badge
    if (m.incidents > 0) {
      el.push(circle(W - 36, my + 28, 12, P.red, { opacity: 0.2 }));
      el.push(text(W - 36, my + 33, String(m.incidents), 12, P.red, { anchor: 'middle', fw: 700 }));
      el.push(text(W - 36, my + 50, 'open', 9, P.muted, { anchor: 'middle' }));
    }
  });

  navBar(el, 3);
  return { name: 'Team On-Call', elements: el };
}

// ── Screen 6: Config / Settings ───────────────────────────────────────────────
function screen6() {
  const el = [];
  statusBar(el);

  el.push(rect(0, 44, W, 56, P.bg));
  el.push(text(20, 82, 'SIREN', 22, P.accent, { fw: 700, font: '"JetBrains Mono", monospace', ls: '0.08em' }));
  el.push(text(100, 82, '/ config', 13, P.muted, { fw: 400, font: '"JetBrains Mono", monospace' }));

  // Version chip
  el.push(...chip(W - 84, 64, 'v2.4.1', P.accent2, { w: 56, h: 22 }));

  // Sections
  const sections = [
    {
      title: 'Alerting Rules',
      items: [
        { label: 'Error rate threshold', val: '> 1%', toggle: false },
        { label: 'Latency P99 SLA', val: '200ms', toggle: false },
        { label: 'Auto-escalate after', val: '5 min', toggle: false },
      ],
    },
    {
      title: 'Notification Channels',
      items: [
        { label: 'PagerDuty', val: 'Connected', toggle: true, on: true },
        { label: 'Slack #incidents', val: 'Connected', toggle: true, on: true },
        { label: 'Email digest', val: 'Daily 08:00', toggle: true, on: false },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'Datadog metrics', val: 'Active', toggle: true, on: true },
        { label: 'GitHub deploys', val: 'Active', toggle: true, on: true },
        { label: 'Sentry errors', val: 'Inactive', toggle: true, on: false },
      ],
    },
  ];

  let sy = 112;
  sections.forEach((sec, si) => {
    el.push(text(20, sy + 18, sec.title, 13, P.text, { fw: 600 }));
    sy += 28;
    sec.items.forEach((item, ii) => {
      el.push(rect(16, sy, 358, 46, P.card, { rx: 10 }));
      el.push(text(28, sy + 26, item.label, 12, P.text));

      if (item.toggle) {
        // toggle switch
        const tx = W - 68, ty2 = sy + 15;
        el.push(rect(tx, ty2, 36, 18, item.on ? P.accent : P.border, { rx: 9 }));
        el.push(circle(item.on ? tx + 26 : tx + 10, ty2 + 9, 7, '#fff'));
        el.push(text(tx - 8, sy + 26, item.val, 11, item.on ? P.accent : P.muted, { anchor: 'end' }));
      } else {
        // value chip
        el.push(rect(W - 80, sy + 12, item.val.length * 7 + 12, 22, P.surf, { rx: 6 }));
        el.push(text(W - 74 + (item.val.length * 7 + 12) / 2 - item.val.length * 3.5, sy + 26, item.val, 11, P.accent2, {
          fw: 600, font: '"JetBrains Mono", monospace', anchor: 'middle'
        }));
      }
      sy += 52;
    });
    sy += 12;
  });

  // API key section
  el.push(rect(16, sy, 358, 52, P.card, { rx: 12 }));
  el.push(text(28, sy + 22, 'API Key', 12, P.text, { fw: 600 }));
  el.push(rect(28, sy + 30, 270, 14, P.surf, { rx: 4 }));
  el.push(text(36, sy + 40, 'srn_live_••••••••••••••••••••4a2f', 10, P.muted, { font: '"JetBrains Mono", monospace' }));
  el.push(rect(308, sy + 28, 50, 18, P.accent, { rx: 6, opacity: 0.15 }));
  el.push(text(333, sy + 40, 'Copy', 10, P.accent, { anchor: 'middle', fw: 600 }));

  navBar(el, 4);
  return { name: 'Config', elements: el };
}

// ── assemble ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

const svgScreens = screens.map(s => {
  const svgEl = s.elements.join('\n    ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n  <rect width="${W}" height="${H}" fill="${P.bg}"/>\n    ${svgEl}\n</svg>`;
  return {
    name: s.name,
    svg,
    elements: s.elements,
  };
});

const totalElements = svgScreens.reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  meta: {
    name: NAME,
    tagline: TAGLINE,
    slug: SLUG,
    theme: THEME,
    heartbeat: HEARTBEAT,
    archetype: 'developer-infrastructure',
    palette: {
      bg: P.bg,
      surface: P.surf,
      card: P.card,
      accent: P.accent,
      accent2: P.accent2,
      text: P.text,
      muted: P.muted,
      border: P.border,
      green: P.green,
      red: P.red,
      orange: P.orange,
    },
    canvas: { width: W, height: H },
    totalElements,
    inspiration: 'Godly.website terminal monospaced aesthetic (JetBrains Mono as brand identity, not just code) + DarkModeDesign.com elevation-based dark system (subtle card lift) + Saaspo.com bento grid 2.0 layouts + charcoal+amber palette to escape the tired purple AI startup cliché',
    generated: new Date().toISOString(),
  },
  screens: svgScreens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
