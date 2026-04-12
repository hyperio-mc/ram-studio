/**
 * FARO — Developer Log Intelligence Platform
 * Dark theme: deep space navy + electric teal
 * Inspired by:
 *   - Godly.website: "Evervault: Customers" dark developer UI with subtle
 *     encrypted-data motifs and ultra-clean card surfaces; "Twingate" network
 *     security platform with dense info grids
 *   - DarkMode Design: Linear's ultra-minimal dark chrome + Midday's clean
 *     data density; OWO's high-contrast accent usage
 *   Trend: "terminal-to-product" aesthetic — monospace log data meets modern
 *   product UI; deep navy replacing pure black; teal accent over purple for
 *   developer observability tools in 2025-26.
 * RAM Design Heartbeat — 2026-03-29
 */

const fs = require('fs');

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:         '#07090F',   // deep space navy
  bg2:        '#0C0F1A',   // slightly lighter bg
  surface:    '#111624',   // card bg
  surface2:   '#161C2E',   // elevated surface
  surface3:   '#1D2540',   // highlight surface
  border:     'rgba(0,199,190,0.10)',
  border2:    'rgba(200,212,232,0.06)',
  borderGlow: 'rgba(0,199,190,0.22)',
  accent:     '#00C7BE',   // electric teal
  accentDim:  'rgba(0,199,190,0.15)',
  accentGlow: 'rgba(0,199,190,0.06)',
  accent2:    '#6B5FEB',   // electric purple
  acc2Dim:    'rgba(107,95,235,0.15)',
  success:    '#22D17A',   // green
  successDim: 'rgba(34,209,122,0.12)',
  danger:     '#FF4F4F',   // red
  dangerDim:  'rgba(255,79,79,0.12)',
  warn:       '#F5A623',   // amber
  warnDim:    'rgba(245,166,35,0.12)',
  text:       '#C8D4E8',   // cool blue-white
  textDim:    '#6B7A97',   // muted text
  textFaint:  'rgba(200,212,232,0.22)',
  mono:       'monospace', // font family hint for text
};

let eid = 0;
const id = () => `e${++eid}`;

// ─── Primitives ───────────────────────────────────────────────────────────────
function r(x, y, w, h, fill, opts = {}) {
  return { id: id(), type: 'rect', x, y, w, h, fill, ...opts };
}
function t(x, y, str, size, weight, fill, opts = {}) {
  return { id: id(), type: 'text', x, y, text: str, fontSize: size, fontWeight: weight, fill, ...opts };
}
function card(x, y, w, h, opts = {}) {
  return r(x, y, w, h, opts.fill || C.surface, {
    rx: opts.rx ?? 14,
    stroke: opts.stroke || C.border2,
    strokeWidth: 1,
    ...opts,
  });
}
function pill(x, y, label, bg, fg, fs = 10) {
  const pw = label.length * 6.5 + 14;
  return [
    r(x, y, pw, 18, bg, { rx: 9 }),
    t(x + pw / 2, y + 13, label, fs, '700', fg, { textAlign: 'center', letterSpacing: 0.5 }),
  ];
}
function div(y, opacity = 0.06) {
  return r(20, y, 350, 1, `rgba(200,212,232,${opacity})`);
}
function tealDot(x, y) {
  return r(x, y, 6, 6, C.accent, { rx: 3 });
}
function statusBar() {
  return [
    t(20, 18, '9:41', 14, '600', C.textDim),
    t(370, 18, '▲ ▮▮▮▮', 10, '400', C.textDim, { textAlign: 'right' }),
  ];
}

// ─── Nav bar (5 tabs) ─────────────────────────────────────────────────────────
function navBar(active) {
  const items = [
    { icon: '◎', label: 'Overview' },
    { icon: '⌁', label: 'Logs' },
    { icon: '⚡', label: 'Alerts' },
    { icon: '⊞', label: 'Sources' },
    { icon: '◈', label: 'Insights' },
  ];
  const els = [];
  els.push(r(0, 784, 390, 60, C.surface, { stroke: C.border2, strokeWidth: 1 }));
  // home indicator
  els.push(r(160, 836, 70, 4, 'rgba(200,212,232,0.12)', { rx: 2 }));
  items.forEach((item, i) => {
    const cx = 39 + i * 78;
    const on = i === active;
    const fg = on ? C.accent : C.textFaint;
    if (on) {
      els.push(r(cx - 24, 787, 48, 36, C.accentDim, { rx: 10 }));
      els.push(r(cx - 14, 786, 28, 2, C.accent, { rx: 1 }));
    }
    els.push(t(cx, 808, item.icon, 18, '400', fg, { textAlign: 'center' }));
    els.push(t(cx, 824, item.label, 8, on ? '700' : '500', fg, { textAlign: 'center' }));
  });
  return els;
}

// ─── Screen 1: Overview ───────────────────────────────────────────────────────
function s1() {
  const els = [];
  // background
  els.push(r(0, 0, 390, 844, C.bg));
  // subtle teal glow top-right
  els.push(r(220, -40, 220, 220, 'rgba(0,199,190,0.04)', { rx: 110 }));
  els.push(...statusBar());

  // Header
  els.push(t(20, 44, 'FARO', 22, '800', C.text, { letterSpacing: 3 }));
  els.push(t(20, 68, 'log intelligence', 11, '400', C.textDim, { letterSpacing: 1 }));
  // Live badge
  els.push(r(310, 44, 60, 22, C.successDim, { rx: 11, stroke: 'rgba(34,209,122,0.2)', strokeWidth: 1 }));
  els.push(r(320, 55, 6, 6, C.success, { rx: 3 }));
  els.push(t(350, 58, 'LIVE', 10, '700', C.success, { textAlign: 'center', letterSpacing: 1 }));

  // Big metric row
  const metrics = [
    { label: 'Uptime', value: '99.98%', sub: '30d avg', col: C.success },
    { label: 'Error rate', value: '0.14%', sub: 'last 1h', col: C.warn },
    { label: 'P95 Latency', value: '84ms', sub: 'api gw', col: C.accent },
  ];
  metrics.forEach((m, i) => {
    const cx = 20 + i * 125;
    els.push(card(cx, 90, 115, 78, { rx: 12 }));
    els.push(t(cx + 12, 108, m.label, 10, '500', C.textDim, { letterSpacing: 0.5 }));
    els.push(t(cx + 12, 136, m.value, 18, '800', m.col));
    els.push(t(cx + 12, 156, m.sub, 9, '400', C.textFaint));
  });

  // Log volume chart card
  els.push(card(20, 180, 350, 130, { rx: 12 }));
  els.push(t(32, 196, 'Log Volume', 11, '600', C.text));
  els.push(t(32, 212, 'last 24 hours', 9, '400', C.textDim));
  els.push(t(358, 196, '1.2M events', 10, '600', C.accent, { textAlign: 'right' }));

  // Bar chart — 12 bars simulating hourly log volume
  const barData = [38, 52, 45, 60, 48, 70, 82, 65, 55, 90, 78, 44];
  const barW = 22, gap = 5;
  barData.forEach((h, i) => {
    const bx = 32 + i * (barW + gap);
    const bh = Math.round(h * 0.62);
    const isSpike = h === 90;
    const fill = isSpike ? C.danger : i >= 9 ? C.accent : 'rgba(0,199,190,0.25)';
    els.push(r(bx, 260 - bh, barW, bh, fill, { rx: 4 }));
    if (isSpike) els.push(r(bx, 258 - bh - 6, barW, 4, C.dangerDim, { rx: 2 }));
  });
  els.push(t(32, 298, '00:00', 8, '400', C.textFaint));
  els.push(t(194, 298, '12:00', 8, '400', C.textFaint, { textAlign: 'center' }));
  els.push(t(358, 298, 'now', 8, '400', C.accent, { textAlign: 'right' }));

  // Recent events section
  els.push(t(20, 328, 'Recent Events', 11, '700', C.text, { letterSpacing: 0.5 }));
  els.push(t(358, 328, 'see all →', 10, '500', C.accent, { textAlign: 'right' }));

  const events = [
    { time: '09:41:22', level: 'ERROR', src: 'api-gateway', msg: 'Connection pool exhausted — postgres', bg: C.dangerDim, fg: C.danger, lbg: C.dangerDim },
    { time: '09:40:58', level: 'WARN',  src: 'worker-3',    msg: 'Job queue depth > 5000 threshold',   bg: C.warnDim,   fg: C.warn,   lbg: C.warnDim },
    { time: '09:40:31', level: 'INFO',  src: 'auth-svc',    msg: 'Token rotation completed (12k keys)', bg: C.accentDim, fg: C.accent, lbg: C.accentDim },
    { time: '09:39:44', level: 'INFO',  src: 'cdn',         msg: 'Cache warmed — 98.3% hit ratio',      bg: C.accentDim, fg: C.accent, lbg: C.accentDim },
  ];

  events.forEach((e, i) => {
    const ey = 348 + i * 96;
    els.push(card(20, ey, 350, 86, { rx: 10, fill: C.surface }));
    // Left accent strip
    els.push(r(20, ey, 3, 86, e.fg, { rx: 1.5 }));
    // Level badge
    els.push(...pill(30, ey + 12, e.level, e.bg, e.fg, 9));
    // Source
    els.push(t(358, ey + 20, e.src, 9, '500', C.textDim, { textAlign: 'right' }));
    // Message — monospace style
    els.push(t(30, ey + 42, e.msg, 11, '400', C.text));
    // Time
    els.push(t(30, ey + 62, e.time, 9, '400', C.textFaint, { fontFamily: 'monospace' }));
    // Chevron
    els.push(t(358, ey + 52, '›', 16, '300', C.textFaint, { textAlign: 'right' }));
  });

  els.push(...navBar(0));
  return els;
}

// ─── Screen 2: Log Stream ─────────────────────────────────────────────────────
function s2() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(...statusBar());

  // Header
  els.push(t(20, 44, 'Log Stream', 20, '700', C.text));
  els.push(t(20, 68, 'live · all services', 11, '400', C.textDim));

  // Pulse dot
  els.push(r(348, 47, 10, 10, C.success, { rx: 5 }));
  els.push(r(344, 43, 18, 18, 'rgba(34,209,122,0.2)', { rx: 9 }));

  // Filter pills row
  const filters = ['All', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
  const filterColors = [C.accent, C.danger, C.warn, C.accent, C.textDim];
  let fx = 20;
  filters.forEach((f, i) => {
    const active = i === 0;
    const fw = f.length * 7 + 18;
    const bg = active ? C.accentDim : 'transparent';
    const fg = active ? C.accent : filterColors[i];
    const stroke = active ? C.borderGlow : C.border2;
    els.push(r(fx, 85, fw, 24, bg, { rx: 12, stroke, strokeWidth: 1 }));
    els.push(t(fx + fw / 2, 101, f, 10, '700', fg, { textAlign: 'center', letterSpacing: 0.4 }));
    fx += fw + 8;
  });

  // Search bar
  els.push(card(20, 118, 350, 36, { rx: 8, fill: C.surface2, stroke: C.border2 }));
  els.push(t(44, 139, 'grep · filter · regex search…', 11, '400', C.textFaint));
  els.push(t(32, 140, '⊘', 13, '400', C.textDim));

  // Log entries — monospace feel
  const logs = [
    { time: '09:41:32.441', level: 'ERROR', svc: 'api-gw',   msg: '[pg-pool] connection refused: ECONNREFUSED 5432', fg: C.danger },
    { time: '09:41:31.220', level: 'ERROR', svc: 'api-gw',   msg: '[pg-pool] retry 3/5 failed — backoff 2048ms',    fg: C.danger },
    { time: '09:41:29.884', level: 'WARN',  svc: 'worker-3', msg: 'queue.depth=5242 exceeds warn_threshold=5000',    fg: C.warn },
    { time: '09:41:28.112', level: 'INFO',  svc: 'auth-svc', msg: 'jwt.rotation: 12048 keys cycled ok',              fg: C.accent },
    { time: '09:41:27.560', level: 'INFO',  svc: 'cdn',      msg: 'cache.warm complete: hit_rate=0.983',             fg: C.accent },
    { time: '09:41:26.330', level: 'DEBUG', svc: 'scheduler',msg: 'cron: next_run=09:42:00 job=cleanup_sessions',    fg: C.textDim },
    { time: '09:41:25.119', level: 'INFO',  svc: 'auth-svc', msg: 'login: user=dan@acme.com ip=94.130.12.7',         fg: C.accent },
    { time: '09:41:23.882', level: 'WARN',  svc: 'mailer',   msg: 'smtp.send: retried 2x domain=gmail.com',          fg: C.warn },
    { time: '09:41:22.441', level: 'INFO',  svc: 'api-gw',   msg: 'POST /v2/events 200 — 52ms 3.2kb',                fg: C.accent },
  ];

  logs.forEach((log, i) => {
    const ly = 168 + i * 64;
    if (ly > 760) return;
    // row bg — alternating
    els.push(r(0, ly, 390, 64, i % 2 === 0 ? 'transparent' : 'rgba(200,212,232,0.015)'));
    // left accent strip for ERROR/WARN
    if (log.level === 'ERROR') els.push(r(0, ly, 2, 64, C.danger));
    if (log.level === 'WARN') els.push(r(0, ly, 2, 64, C.warn));

    // timestamp (mono)
    els.push(t(12, ly + 16, log.time, 9, '400', C.textFaint));
    // level badge
    els.push(...pill(12, ly + 30, log.level, log.level === 'ERROR' ? C.dangerDim : log.level === 'WARN' ? C.warnDim : log.level === 'DEBUG' ? 'rgba(107,95,235,0.12)' : C.accentDim, log.fg, 8));
    // service
    const pwLabel = log.level.length * 6.5 + 14;
    els.push(t(18 + pwLabel + 8, ly + 38, log.svc, 9, '600', C.textDim));
    // message
    els.push(t(12, ly + 54, log.msg.substring(0, 50) + (log.msg.length > 50 ? '…' : ''), 10, '400', log.level === 'ERROR' ? C.danger : log.level === 'WARN' ? C.warn : C.textDim));
    els.push(div(ly + 63, 0.04));
  });

  els.push(...navBar(1));
  return els;
}

// ─── Screen 3: Alerts ─────────────────────────────────────────────────────────
function s3() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  // subtle red glow top-left for alerts mood
  els.push(r(-40, -40, 200, 200, 'rgba(255,79,79,0.04)', { rx: 100 }));
  els.push(...statusBar());

  // Header
  els.push(t(20, 44, 'Active Alerts', 20, '700', C.text));
  els.push(t(20, 68, '2 open incidents', 11, '400', C.danger));

  // Status row
  const statuses = [
    { label: '2 Open',    bg: C.dangerDim,  fg: C.danger },
    { label: '5 Ack\'d',  bg: C.warnDim,    fg: C.warn },
    { label: '18 Closed', bg: C.successDim, fg: C.success },
  ];
  let sfx = 20;
  statuses.forEach(s => {
    const sw = s.label.length * 7 + 20;
    els.push(r(sfx, 82, sw, 24, s.bg, { rx: 12 }));
    els.push(t(sfx + sw / 2, 97, s.label, 10, '700', s.fg, { textAlign: 'center' }));
    sfx += sw + 10;
  });

  // Alerts list
  const alerts = [
    {
      sev: 'P0', sevBg: C.dangerDim, sevFg: C.danger,
      title: 'DB Connection Pool Exhausted',
      svc: 'api-gateway · postgres',
      time: '1 min ago',
      dur: '3m',
      assignee: 'Dan K.',
      desc: 'Connection pool at 100% capacity. 12 queued, 3 dropped.',
      tags: ['database', 'critical'],
    },
    {
      sev: 'P1', sevBg: 'rgba(245,166,35,0.15)', sevFg: C.warn,
      title: 'Worker Queue Depth Threshold',
      svc: 'worker-3 · job-queue',
      time: '3 min ago',
      dur: '5m',
      assignee: 'Priya S.',
      desc: 'Queue depth 5.2k — 4% drop rate observed on email jobs.',
      tags: ['queue', 'worker'],
    },
    {
      sev: 'P2', sevBg: 'rgba(107,95,235,0.15)', sevFg: C.accent2,
      title: 'SMTP Retry Rate Elevated',
      svc: 'mailer · smtp-relay',
      time: '9 min ago',
      dur: '11m',
      assignee: 'Unassigned',
      desc: 'External SMTP relay showing 8% retry rate (baseline: 0.4%).',
      tags: ['email', 'smtp'],
      ack: true,
    },
  ];

  alerts.forEach((a, i) => {
    const ay = 120 + i * 204;
    els.push(card(20, ay, 350, 192, { rx: 12, stroke: a.ack ? C.border2 : a.sevBg }));
    // Top accent strip
    els.push(r(20, ay, 350, 3, a.ack ? C.surface3 : a.sevFg, { rx: 12 }));

    // Severity + title row
    els.push(...pill(30, ay + 16, `SEV ${a.sev}`, a.sevBg, a.sevFg, 9));
    const pWidth = `SEV ${a.sev}`.length * 6.5 + 14;
    if (a.ack) els.push(t(30 + pWidth + 10, ay + 24, 'ACKNOWLEDGED', 9, '700', C.textDim, { letterSpacing: 0.5 }));
    els.push(t(358, ay + 24, `${a.dur} elapsed`, 9, '500', C.textDim, { textAlign: 'right' }));
    els.push(t(30, ay + 48, a.title, 14, '700', a.ack ? C.textDim : C.text));
    els.push(t(30, ay + 68, a.svc, 10, '500', C.textDim));

    // Description
    els.push(t(30, ay + 90, a.desc, 11, '400', C.textDim));

    // Tags
    let tx = 30;
    a.tags.forEach(tag => {
      const tw = tag.length * 6.5 + 12;
      els.push(r(tx, ay + 116, tw, 18, C.surface3, { rx: 9 }));
      els.push(t(tx + tw / 2, ay + 128, tag, 9, '500', C.textDim, { textAlign: 'center' }));
      tx += tw + 6;
    });

    // Assignee + time
    els.push(t(30, ay + 148, `⊙ ${a.assignee}`, 10, '500', C.textDim));
    els.push(t(358, ay + 148, a.time, 10, '400', C.textFaint, { textAlign: 'right' }));

    // Action buttons
    if (!a.ack) {
      els.push(r(30, ay + 164, 100, 20, C.dangerDim, { rx: 10 }));
      els.push(t(80, ay + 177, 'Acknowledge', 10, '700', C.danger, { textAlign: 'center' }));
      els.push(r(140, ay + 164, 80, 20, C.accentDim, { rx: 10 }));
      els.push(t(180, ay + 177, 'Silence', 10, '700', C.accent, { textAlign: 'center' }));
    } else {
      els.push(r(30, ay + 164, 80, 20, C.accentDim, { rx: 10 }));
      els.push(t(70, ay + 177, 'Resolve', 10, '700', C.accent, { textAlign: 'center' }));
    }
  });

  els.push(...navBar(2));
  return els;
}

// ─── Screen 4: Sources ────────────────────────────────────────────────────────
function s4() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  els.push(...statusBar());

  // Header
  els.push(t(20, 44, 'Sources', 20, '700', C.text));
  els.push(t(20, 68, '8 connected · 1 degraded', 11, '400', C.textDim));

  // Add button
  els.push(r(330, 42, 44, 28, C.accentDim, { rx: 14, stroke: C.borderGlow, strokeWidth: 1 }));
  els.push(t(352, 59, '+ Add', 10, '700', C.accent, { textAlign: 'center' }));

  // Global stats row
  const gStats = [
    { val: '1.2M', lbl: 'events/day' },
    { val: '8',    lbl: 'sources' },
    { val: '98%',  lbl: 'healthy' },
  ];
  gStats.forEach((g, i) => {
    const gx = 20 + i * 120;
    els.push(card(gx, 86, 110, 54, { rx: 10 }));
    els.push(t(gx + 12, 108, g.val, 18, '800', C.accent));
    els.push(t(gx + 12, 126, g.lbl, 9, '400', C.textDim));
  });

  // Sources grid (2 columns)
  const sources = [
    { name: 'Kubernetes',     env: 'prod-us-east',   vol: '440k/d', status: 'healthy',  icon: '⎈', iconC: '#326CE5' },
    { name: 'AWS Lambda',     env: 'us-east-1',      vol: '290k/d', status: 'healthy',  icon: '⚡', iconC: '#FF9900' },
    { name: 'Vercel',         env: 'edge — global',  vol: '180k/d', status: 'healthy',  icon: '▲', iconC: C.text },
    { name: 'Fly.io',         env: 'sjc · ams · sin',vol: '140k/d', status: 'degraded', icon: '✈', iconC: C.warn },
    { name: 'Supabase',       env: 'prod db cluster', vol: '95k/d', status: 'healthy',  icon: '⏣', iconC: '#3ECF8E' },
    { name: 'GitHub Actions', env: 'ci/cd pipeline',  vol: '60k/d', status: 'healthy',  icon: '◉', iconC: C.textDim },
    { name: 'Cloudflare',     env: 'global edge',     vol: '48k/d', status: 'healthy',  icon: '☁', iconC: '#F6821F' },
    { name: 'Custom SDK',     env: 'node · python',   vol: '12k/d', status: 'healthy',  icon: '⊛', iconC: C.accent2 },
  ];

  sources.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 20 + col * 182;
    const sy = 156 + row * 140;
    const degraded = s.status === 'degraded';
    els.push(card(sx, sy, 172, 128, {
      rx: 12,
      stroke: degraded ? 'rgba(245,166,35,0.22)' : C.border2,
    }));

    // Icon circle
    els.push(r(sx + 12, sy + 14, 32, 32, degraded ? C.warnDim : C.surface3, { rx: 8 }));
    els.push(t(sx + 28, sy + 34, s.icon, 15, '400', degraded ? C.warn : s.iconC, { textAlign: 'center' }));

    // Status indicator
    const statC = degraded ? C.warn : C.success;
    els.push(r(sx + 154, sy + 14, 10, 10, statC, { rx: 5 }));

    // Name + env
    els.push(t(sx + 12, sy + 60, s.name, 12, '700', degraded ? C.warn : C.text));
    els.push(t(sx + 12, sy + 78, s.env, 9, '400', C.textDim));

    // Volume
    els.push(div(sy + 92, 0.05));
    els.push(t(sx + 12, sy + 108, s.vol, 11, '600', C.textDim));
    els.push(t(sx + 162, sy + 108, degraded ? '⚠' : '→', 12, '400', statC, { textAlign: 'right' }));
  });

  els.push(...navBar(3));
  return els;
}

// ─── Screen 5: AI Insights ────────────────────────────────────────────────────
function s5() {
  const els = [];
  els.push(r(0, 0, 390, 844, C.bg));
  // subtle purple glow for AI theme
  els.push(r(180, -30, 240, 240, 'rgba(107,95,235,0.05)', { rx: 120 }));
  els.push(...statusBar());

  // Header
  els.push(t(20, 44, 'AI Insights', 20, '700', C.text));
  els.push(t(20, 68, 'anomaly detection · root cause', 11, '400', C.textDim));
  // AI badge
  els.push(r(308, 42, 62, 24, C.acc2Dim, { rx: 12, stroke: 'rgba(107,95,235,0.22)', strokeWidth: 1 }));
  els.push(t(339, 57, '◈ GPT-4o', 9, '700', C.accent2, { textAlign: 'center' }));

  // Summary insight card (prominent)
  els.push(card(20, 84, 350, 120, {
    rx: 14,
    fill: C.surface2,
    stroke: 'rgba(107,95,235,0.18)',
  }));
  els.push(r(20, 84, 350, 3, C.accent2, { rx: 14 }));
  els.push(t(32, 102, '◈  Pattern Detected', 11, '700', C.accent2, { letterSpacing: 0.5 }));
  els.push(t(358, 102, 'High confidence', 9, '600', C.textDim, { textAlign: 'right' }));
  els.push(t(32, 122, 'DB pool exhaustion correlates with', 13, '600', C.text));
  els.push(t(32, 140, 'a 3× spike in /v2/events write traffic', 13, '600', C.text));
  els.push(t(32, 162, 'triggered 09:38 — 3 services impacted', 11, '400', C.textDim));
  els.push(t(32, 182, 'Recommendation: scale pg-pool max_conn ≥ 120', 10, '500', C.accent2));

  // Section title
  els.push(t(20, 222, 'Anomaly Timeline', 11, '700', C.text, { letterSpacing: 0.5 }));
  els.push(t(358, 222, 'last 6h', 10, '400', C.textDim, { textAlign: 'right' }));

  // Timeline items
  const events = [
    { time: '09:38', icon: '▲', iconC: C.danger,  title: 'Error rate spike  +840%', svc: 'api-gateway',    conf: '97%', confC: C.danger },
    { time: '09:37', icon: '◎', iconC: C.warn,    title: 'Write QPS anomaly +310%', svc: 'postgres write', conf: '88%', confC: C.warn },
    { time: '09:21', icon: '⬡', iconC: C.accent2, title: 'Latency drift detected',  svc: 'cdn · edge',     conf: '74%', confC: C.accent2 },
    { time: '08:55', icon: '◈', iconC: C.accent,  title: 'Cache efficiency drop',   svc: 'redis cluster',  conf: '71%', confC: C.accent },
    { time: '07:30', icon: '◎', iconC: C.textDim, title: 'Scheduled: key rotation', svc: 'auth-svc',       conf: '99%', confC: C.success },
  ];

  events.forEach((e, i) => {
    const ey = 242 + i * 88;
    // Timeline line
    els.push(r(40, ey + 10, 2, 88, 'rgba(200,212,232,0.06)'));
    // Circle node
    els.push(r(32, ey + 6, 18, 18, C.surface2, { rx: 9, stroke: e.iconC + '44', strokeWidth: 1 }));
    els.push(t(41, ey + 19, e.icon, 10, '700', e.iconC, { textAlign: 'center' }));

    // Content
    els.push(card(58, ey, 302, 76, { rx: 10, fill: C.surface }));
    els.push(t(70, ey + 18, e.time, 9, '600', C.textDim));
    els.push(t(70, ey + 36, e.title, 12, '700', C.text));
    els.push(t(70, ey + 54, e.svc, 10, '400', C.textDim));
    // Confidence
    els.push(r(288, ey + 14, 62, 18, C.surface3, { rx: 9 }));
    els.push(t(319, ey + 26, `${e.conf} conf`, 9, '700', e.confC, { textAlign: 'center' }));
  });

  els.push(...navBar(4));
  return els;
}

// ─── Build .pen file ──────────────────────────────────────────────────────────
const penData = {
  version: '2.8',
  meta: {
    name: 'FARO — Log Intelligence Platform',
    description: 'Dark-theme developer log observability and AI anomaly detection platform',
    createdAt: new Date().toISOString(),
  },
  screens: [
    { id: 's1', name: 'Overview',   width: 390, height: 844, elements: s1() },
    { id: 's2', name: 'Log Stream', width: 390, height: 844, elements: s2() },
    { id: 's3', name: 'Alerts',     width: 390, height: 844, elements: s3() },
    { id: 's4', name: 'Sources',    width: 390, height: 844, elements: s4() },
    { id: 's5', name: 'AI Insights',width: 390, height: 844, elements: s5() },
  ],
};

fs.writeFileSync('faro.pen', JSON.stringify(penData, null, 2));
console.log('✓ faro.pen written');
console.log(`  Screens: ${penData.screens.length}`);
penData.screens.forEach(sc => {
  console.log(`  ${sc.name}: ${sc.elements.length} elements`);
});
