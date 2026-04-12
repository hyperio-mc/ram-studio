// RUNE — Zero-config secret management for developer teams
// Inspired by:
//   1. Twingate (godly.website, Mar 25 2026): Zero-trust developer network security;
//      dark enterprise UI with clean data tables and access-log patterns.
//   2. Evervault/customers (godly.website): Developer encryption platform;
//      deep near-black backgrounds, subtle glows, enterprise dark confidence.
//   3. Midday.ai (darkmodedesign.com): Clarity-first financial dark UI —
//      complex data made legible through restraint and strong hierarchy.
// Theme: DARK — near-black #06080F + emerald mint accent + indigo secondary
// Design push: Security-paranoid aesthetic with terminal undertones;
//   type hierarchy borrowed from Midday; access log pattern from Twingate.
// Format: Pencil.dev v2.8

const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;
const SLUG = 'rune';

// ─── PALETTE ───────────────────────────────────────────────────────
const C = {
  bg:         '#06080F',  // near-black with deep blue tint
  surface:    '#0B1019',  // elevated surface
  surface2:   '#101822',  // cards
  surface3:   '#162030',  // hover / input
  border:     '#1C2D3E',  // subtle border
  borderSoft: '#132030',  // very subtle divider
  text:       '#E1E7F0',  // primary
  textSub:    '#4D6B80',  // muted
  textDim:    '#2D4A5E',  // very muted
  accent:     '#34D399',  // emerald mint — "secrets are safe"
  accentDim:  '#0A2018',  // emerald wash
  indigo:     '#818CF8',  // soft indigo — highlights
  indigoDim:  '#141530',  // indigo wash
  amber:      '#FBBF24',
  amberDim:   '#231A06',
  red:        '#F87171',
  redDim:     '#230A0A',
  white:      '#FFFFFF',
  // env colors
  envProd:    '#34D399',  // green = prod
  envStage:   '#818CF8',  // indigo = staging
  envDev:     '#FBBF24',  // amber = dev
  envTest:    '#60A5FA',  // blue = test
};

// ─── PRIMITIVES ────────────────────────────────────────────────────
const el = (type, props = {}) => ({ type, ...props });

const frame = (name, children, props = {}) =>
  el('FRAME', { name, width: W, height: H, x: 0, y: 0,
    fills: [solid(C.bg)], children, ...props });

function solid(hex, opacity = 1) {
  if (hex.startsWith('rgba')) {
    const m = hex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) return { type:'SOLID', color:{ r:+m[1]/255, g:+m[2]/255, b:+m[3]/255 }, opacity:+m[4] };
  }
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return { type:'SOLID', color:{ r, g, b }, opacity };
}

function rect(x, y, w, h, fill, props = {}) {
  const fills = typeof fill === 'string' ? [solid(fill)] : Array.isArray(fill) ? fill : [fill];
  return el('RECTANGLE', {
    x, y, width: w, height: h, fills,
    cornerRadius: props.r || 0,
    strokes: props.stroke ? [solid(props.stroke, props.strokeOpacity ?? 1)] : [],
    strokeWeight: props.strokeWeight || 1,
    ...props,
  });
}

function txt(str, x, y, size, color, props = {}) {
  return el('TEXT', {
    x, y, characters: String(str), fontSize: size,
    fills: [solid(color)],
    fontName: { family: props.family || 'Inter', style: props.weight || 'Regular' },
    textAlignHorizontal: props.align || 'LEFT',
    width: props.w || 300,
    height: props.h || Math.ceil(size * 1.45),
    letterSpacing: props.ls || 0,
    lineHeight: props.lh ? { value: props.lh, unit:'PIXELS' } : undefined,
    ...props,
  });
}

function mono(str, x, y, size, color, props = {}) {
  return txt(str, x, y, size, color, { family: 'Roboto Mono', weight: 'Regular', ...props });
}

function dot(x, y, color, size = 6) {
  return rect(x, y, size, size, color, { r: size / 2 });
}

function progress(x, y, w, pct, trackColor, fillColor, props = {}) {
  const h = props.h || 4;
  return [
    rect(x, y, w, h, trackColor, { r: props.r ?? 2 }),
    rect(x, y, Math.max(3, Math.round(w * Math.min(pct, 1))), h, fillColor, { r: props.r ?? 2 }),
  ];
}

function chip(label, x, y, bg, color, props = {}) {
  const w = props.w || (label.length * 7 + 16);
  const h = props.h || 22;
  return [
    rect(x, y, w, h, bg, { r: 5 }),
    txt(label, x + 8, y + 4, 10, color, { weight: 'Medium', w: w - 16, align: 'CENTER', ls: 0.2 }),
  ];
}

// ─── STATUS BAR ────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, C.bg),
    txt('9:41', 20, 13, 15, C.text, { weight: 'SemiBold', w: 60 }),
    txt('●●● ▲ ■', W - 80, 13, 12, C.textSub, { align: 'RIGHT', w: 70 }),
  ];
}

// ─── NAV BAR ───────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',   label: 'Overview',  icon: '◈' },
  { id: 'envs',       label: 'Envs',      icon: '◉' },
  { id: 'secrets',    label: 'Secrets',   icon: '▣' },
  { id: 'log',        label: 'Log',       icon: '≡' },
  { id: 'integrations', label: 'Connect', icon: '⌘' },
];

function navBar(active) {
  const children = [];
  children.push(rect(0, H - 82, W, 82, C.surface));
  children.push(rect(0, H - 82, W, 1, C.border));
  NAV.forEach((item, i) => {
    const ix = i * (W / NAV.length);
    const iw = W / NAV.length;
    const isActive = item.id === active;
    if (isActive) {
      children.push(rect(ix + iw/2 - 22, H - 82, 44, 3, C.accent, { r: 2 }));
    }
    children.push(txt(item.icon, ix + iw/2 - 11, H - 66,
      17, isActive ? C.accent : C.textDim,
      { align: 'CENTER', w: 22 }));
    children.push(txt(item.label, ix + 2, H - 46,
      10, isActive ? C.accent : C.textSub,
      { align: 'CENTER', w: iw - 4, weight: isActive ? 'SemiBold' : 'Regular' }));
  });
  return el('GROUP', { name: 'NavBar', children });
}

// ─── SCREEN 1: OVERVIEW ────────────────────────────────────────────
function overviewScreen() {
  const children = [...statusBar()];

  // Logo + wordmark
  children.push(rect(20, 54, 28, 28, C.accentDim, { r: 8 }));
  children.push(txt('⬡', 27, 59, 16, C.accent, { w: 16 }));
  children.push(txt('RUNE', 56, 60, 18, C.text, { weight: 'Bold', ls: 3.5, w: 100 }));

  // Project selector
  children.push(rect(W - 130, 56, 118, 28, C.surface2, { r: 8, stroke: C.border }));
  children.push(dot(W - 120, 69, C.accent, 8));
  children.push(txt('acme-app', W - 108, 62, 12, C.text, { weight: 'Medium', w: 80 }));
  children.push(txt('▾', W - 24, 64, 12, C.textSub, { w: 14 }));

  children.push(rect(20, 94, W - 40, 1, C.borderSoft));

  // Health score hero card
  children.push(rect(20, 108, W - 40, 118, C.surface2, { r: 16, stroke: C.border }));
  children.push(rect(20, 108, W - 40, 52, C.accentDim, { r: 16 }));
  children.push(txt('Vault Health', 36, 120, 11, C.textSub, { weight: 'Medium', ls: 1.8, w: 160 }));
  children.push(txt('98', 36, 138, 42, C.accent, { weight: 'Bold', w: 80, family: 'Roboto Mono' }));
  children.push(txt('/100', 90, 152, 18, C.textSub, { weight: 'Regular', w: 50 }));
  children.push(txt('2 secrets expiring soon', 36, 192, 12, C.textSub, { w: 200 }));
  children.push(dot(W - 52, 194, C.amber, 8));
  children.push(txt('Warn', W - 40, 192, 11, C.amber, { weight: 'SemiBold', w: 40 }));

  // Stat strip
  const stats = [
    { l: 'Total Secrets', v: '247',   icon: '●', c: C.accent },
    { l: 'Environments',  v: '4',     icon: '●', c: C.indigo },
    { l: 'Rotations',     v: '12',    icon: '●', c: C.amber },
    { l: 'Access Today',  v: '1.4K',  icon: '●', c: C.envTest },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + (i % 2) * ((W - 48) / 2 + 8);
    const sy = 240 + Math.floor(i / 2) * 78;
    children.push(rect(sx, sy, (W - 48) / 2, 68, C.surface2, { r: 12, stroke: C.border }));
    children.push(txt(s.v, sx + 14, sy + 12, 22, C.text, { weight: 'Bold', w: 100, family: 'Roboto Mono' }));
    children.push(dot(sx + 14, sy + 42, s.c, 6));
    children.push(txt(s.l, sx + 26, sy + 40, 10, C.textSub, { w: 110 }));
  });

  // Recent activity
  children.push(txt('Recent activity', 20, 406, 13, C.text, { weight: 'SemiBold', w: 200 }));
  children.push(txt('View all →', W - 70, 409, 11, C.indigo, { align: 'RIGHT', w: 58 }));

  const events = [
    { who: 'deploy-bot',   action: 'read',   key: 'DATABASE_URL',    env: 'prod',    time: '2m',   ok: true },
    { who: 'ci-runner',    action: 'read',   key: 'STRIPE_KEY',      env: 'staging', time: '8m',   ok: true },
    { who: 'karan.d',      action: 'update', key: 'OPENAI_KEY',      env: 'dev',     time: '24m',  ok: true },
    { who: 'ip: unknown',  action: 'denied', key: 'JWT_SECRET',      env: 'prod',    time: '1h',   ok: false },
    { who: 'deploy-bot',   action: 'read',   key: 'REDIS_URL',       env: 'prod',    time: '1h',   ok: true },
    { who: 'karan.d',      action: 'create', key: 'ANTHROPIC_KEY',   env: 'dev',     time: '3h',   ok: true },
  ];

  events.forEach((e, i) => {
    const ey = 428 + i * 62;
    children.push(rect(20, ey, W - 40, 54, C.surface, { r: 10, stroke: C.border }));
    // indicator
    children.push(dot(34, ey + 24, e.ok ? C.accent : C.red, 6));
    // action chip
    const actionColor = e.action === 'denied' ? C.red : e.action === 'update' ? C.amber : e.action === 'create' ? C.indigo : C.textSub;
    children.push(...chip(e.action, 46, ey + 16, e.ok ? C.surface2 : C.redDim, actionColor, { w: 52, h: 18 }));
    children.push(mono(e.key, 46, ey + 36, 10, C.text, { w: W - 120 }));
    children.push(txt(e.who, 104, ey + 18, 11, C.textSub, { w: W - 160 }));
    // env + time
    const envC = e.env === 'prod' ? C.envProd : e.env === 'staging' ? C.envStage : C.envDev;
    children.push(...chip(e.env, W - 74, ey + 16, C.surface2, envC, { w: 42, h: 18 }));
    children.push(txt(e.time, W - 28, ey + 36, 10, C.textDim, { align: 'RIGHT', w: 24 }));
  });

  children.push(navBar('overview'));
  return frame('Overview', children);
}

// ─── SCREEN 2: ENVIRONMENTS ────────────────────────────────────────
function envsScreen() {
  const children = [...statusBar()];

  children.push(txt('Environments', 20, 58, 22, C.text, { weight: 'Bold', w: 220 }));
  children.push(txt('4 environments · acme-app', 20, 82, 12, C.textSub, { w: W - 40 }));

  const envs = [
    {
      name: 'production',
      secrets: 84,
      last: '2 min ago',
      deploys: 1847,
      health: 100,
      color: C.envProd,
      locked: true,
      tag: 'LIVE',
    },
    {
      name: 'staging',
      secrets: 82,
      last: '14 min ago',
      deploys: 433,
      health: 96,
      color: C.envStage,
      locked: false,
      tag: 'REVIEW',
    },
    {
      name: 'development',
      secrets: 79,
      last: '24 min ago',
      deploys: 2104,
      health: 89,
      color: C.envDev,
      locked: false,
      tag: 'DEV',
    },
    {
      name: 'test',
      secrets: 52,
      last: '3h ago',
      deploys: 891,
      health: 95,
      color: C.envTest,
      locked: false,
      tag: 'TEST',
    },
  ];

  envs.forEach((env, i) => {
    const ey = 108 + i * 162;
    children.push(rect(20, ey, W - 40, 150, C.surface2, { r: 16, stroke: C.border }));
    // color band
    children.push(rect(20, ey, W - 40, 8, env.color, { r: 16 }));
    children.push(rect(20, ey + 8, W - 40, 6, env.color, { r: 0 }));

    // env name + lock icon
    children.push(txt(env.name, 36, ey + 26, 16, C.text, { weight: 'Bold', w: W - 100, family: 'Roboto Mono' }));
    if (env.locked) {
      children.push(rect(W - 60, ey + 24, 28, 20, C.redDim, { r: 6 }));
      children.push(txt('🔒', W - 54, ey + 26, 11, C.red, { w: 16 }));
    }
    children.push(...chip(env.tag, W - 78, ey + 22, env.color + '22', env.color, { w: env.locked ? 0 : 42, h: 20 }));

    // Stats row
    children.push(txt(env.secrets + ' secrets', 36, ey + 52, 12, C.textSub, { w: 90 }));
    children.push(txt('·', 124, ey + 52, 12, C.textDim, { w: 8 }));
    children.push(txt(env.deploys.toLocaleString() + ' deploys', 132, ey + 52, 12, C.textSub, { w: 110 }));
    children.push(txt('Last: ' + env.last, 36, ey + 68, 11, C.textDim, { w: W - 72 }));

    // Health bar
    children.push(txt('Health score', 36, ey + 96, 10, C.textSub, { w: 100, weight: 'Medium' }));
    children.push(mono(env.health + '%', W - 58, ey + 94, 12, env.color, { align: 'RIGHT', w: 46 }));
    children.push(...progress(36, ey + 110, W - 72, env.health / 100, C.border, env.color, { h: 6, r: 3 }));

    // Action buttons
    children.push(rect(36, ey + 126, 90, 14, C.surface3, { r: 4 }));
    children.push(txt('View Secrets', 50, ey + 128, 9, C.textSub, { w: 80, weight: 'Medium' }));
    children.push(rect(134, ey + 126, 60, 14, C.surface3, { r: 4 }));
    children.push(txt('Access Log', 140, ey + 128, 9, C.textSub, { w: 60, weight: 'Medium' }));
  });

  children.push(navBar('envs'));
  return frame('Environments', children);
}

// ─── SCREEN 3: SECRETS ─────────────────────────────────────────────
function secretsScreen() {
  const children = [...statusBar()];

  children.push(txt('Secrets', 20, 58, 22, C.text, { weight: 'Bold', w: 200 }));
  children.push(txt('production · 84 keys', 20, 82, 12, C.textSub, { w: 240 }));

  // Env switcher
  const envLabels = ['prod', 'staging', 'dev', 'test'];
  let ex = 20;
  envLabels.forEach((e, i) => {
    const isActive = i === 0;
    const ec = [C.envProd, C.envStage, C.envDev, C.envTest][i];
    const ew = e.length * 9 + 20;
    children.push(rect(ex, 104, ew, 26, isActive ? ec + '22' : C.surface2, { r: 6, stroke: isActive ? ec : C.border }));
    children.push(dot(ex + 8, 113, ec, 6));
    children.push(txt(e, ex + 18, 109, 11, isActive ? ec : C.textSub, { weight: isActive ? 'SemiBold' : 'Regular', w: ew - 20 }));
    ex += ew + 8;
  });

  // Search
  children.push(rect(20, 140, W - 40, 36, C.surface2, { r: 9, stroke: C.border }));
  children.push(txt('⌕', 34, 151, 13, C.textSub, { w: 16 }));
  children.push(txt('Filter secrets...', 54, 151, 12, C.textDim, { w: 200 }));
  children.push(rect(W - 54, 148, 26, 20, C.surface3, { r: 5 }));
  children.push(txt('⚙', W - 48, 151, 12, C.textSub, { w: 14 }));

  // Group headers + secrets
  const groups = [
    {
      name: 'DATABASE',
      secrets: [
        { key: 'DATABASE_URL',      masked: true,  accessed: '2m',  expiry: null,    c: C.envProd },
        { key: 'DATABASE_POOL_SIZE',masked: false, accessed: '1d',  expiry: null,    c: C.accent },
        { key: 'REDIS_URL',         masked: true,  accessed: '2m',  expiry: null,    c: C.envProd },
      ],
    },
    {
      name: 'AUTH',
      secrets: [
        { key: 'JWT_SECRET',        masked: true,  accessed: '1h',  expiry: '7d',   c: C.amber },
        { key: 'NEXTAUTH_SECRET',   masked: true,  accessed: '4h',  expiry: null,   c: C.envProd },
      ],
    },
    {
      name: 'THIRD-PARTY APIS',
      secrets: [
        { key: 'STRIPE_SECRET_KEY', masked: true,  accessed: '8m',  expiry: null,   c: C.envProd },
        { key: 'OPENAI_API_KEY',    masked: true,  accessed: '24m', expiry: '30d',  c: C.indigo },
        { key: 'ANTHROPIC_API_KEY', masked: true,  accessed: '3h',  expiry: null,   c: C.envProd },
      ],
    },
  ];

  let gy = 186;
  groups.forEach(group => {
    children.push(txt(group.name, 20, gy, 10, C.textDim, { weight: 'SemiBold', ls: 2, w: W - 40 }));
    gy += 18;

    group.secrets.forEach(s => {
      children.push(rect(20, gy, W - 40, 50, C.surface, { r: 10, stroke: C.borderSoft }));
      // masked value preview
      const preview = s.masked ? '••••••••••••' : '8';
      children.push(mono(s.key, 36, gy + 10, 12, C.text, { w: W - 120 }));
      children.push(mono(preview, 36, gy + 28, 10, C.textDim, { w: 150 }));
      // status
      if (s.expiry) {
        children.push(...chip('exp ' + s.expiry, W - 86, gy + 14, C.amberDim, C.amber, { w: 58, h: 18 }));
      }
      // accessed
      children.push(txt(s.accessed, W - 28, gy + 32, 10, C.textDim, { align: 'RIGHT', w: 28 }));
      children.push(dot(34, gy + 22, s.c, 5));
      gy += 58;
    });

    gy += 8;
  });

  // Add button
  children.push(rect(W/2 - 70, H - 116, 140, 36, C.accentDim, { r: 10, stroke: C.accent, strokeOpacity: 0.5 }));
  children.push(txt('+ Add Secret', W/2 - 38, H - 107, 13, C.accent, { weight: 'SemiBold', w: 80 }));

  children.push(navBar('secrets'));
  return frame('Secrets', children);
}

// ─── SCREEN 4: ACCESS LOG ──────────────────────────────────────────
function logScreen() {
  const children = [...statusBar()];

  children.push(txt('Access Log', 20, 58, 22, C.text, { weight: 'Bold', w: 220 }));
  children.push(txt('All environments · Last 24h', 20, 82, 12, C.textSub, { w: W - 40 }));

  // Filter row
  const filters = ['All', 'Read', 'Write', 'Denied', 'Rotation'];
  let fx = 20;
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const fw = f.length * 8 + 20;
    const fc = i === 3 ? C.red : isActive ? C.accent : C.textSub;
    children.push(rect(fx, 104, fw, 24, isActive ? C.accentDim : C.surface2, { r: 5, stroke: isActive ? C.accent : C.border }));
    children.push(txt(f, fx + 10, 109, 10, fc, { weight: isActive ? 'SemiBold' : 'Regular', w: fw - 20 }));
    fx += fw + 6;
  });

  // Log entries — Twingate-style network access log
  const logs = [
    { time: '09:41:02', who: 'deploy-bot',   action: 'READ',   key: 'DATABASE_URL',    env: 'prod',    ok: true },
    { time: '09:39:18', who: 'ci-runner-01', action: 'READ',   key: 'STRIPE_SECRET_KEY', env:'staging', ok: true },
    { time: '09:30:44', who: 'karan.d',      action: 'WRITE',  key: 'OPENAI_API_KEY',  env: 'dev',     ok: true },
    { time: '09:17:21', who: 'ip:203.x.x.1', action: 'DENIED', key: 'JWT_SECRET',      env: 'prod',    ok: false },
    { time: '09:12:05', who: 'deploy-bot',   action: 'READ',   key: 'REDIS_URL',       env: 'prod',    ok: true },
    { time: '08:54:33', who: 'karan.d',      action: 'CREATE', key: 'ANTHROPIC_API_KEY', env:'dev',    ok: true },
    { time: '08:41:00', who: 'rotation-svc', action: 'ROTATE', key: 'JWT_SECRET',      env: 'prod',    ok: true },
    { time: '07:22:47', who: 'ci-runner-02', action: 'READ',   key: 'NEXTAUTH_SECRET', env: 'staging', ok: true },
    { time: '06:58:12', who: 'deploy-bot',   action: 'READ',   key: 'DATABASE_URL',    env: 'staging', ok: true },
  ];

  const actionColors = {
    'READ':   C.textSub,
    'WRITE':  C.indigo,
    'CREATE': C.accent,
    'DENIED': C.red,
    'ROTATE': C.amber,
  };

  logs.forEach((log, i) => {
    const ly = 140 + i * 68;
    children.push(rect(20, ly, W - 40, 60, log.ok ? C.surface : C.redDim, { r: 10, stroke: log.ok ? C.borderSoft : C.red, strokeOpacity: 0.25 }));

    // time
    children.push(mono(log.time, 36, ly + 10, 10, C.textDim, { w: 70 }));

    // action chip
    const ac = actionColors[log.action] || C.textSub;
    children.push(...chip(log.action, 108, ly + 8, log.ok ? C.surface3 : C.redDim, ac, { w: 54, h: 18 }));

    // key
    children.push(mono(log.key, 36, ly + 32, 11, C.text, { w: W - 110 }));

    // who
    children.push(txt(log.who, 108, ly + 30, 10, C.textSub, { w: W - 150 }));

    // env badge + deny flag
    const envColor = log.env === 'prod' ? C.envProd : log.env === 'staging' ? C.envStage : C.envDev;
    children.push(...chip(log.env, W - 72, ly + 10, C.surface2, envColor, { w: 50, h: 18 }));
    if (!log.ok) {
      children.push(txt('⚠', W - 28, ly + 10, 13, C.red, { w: 14 }));
    }
  });

  children.push(navBar('log'));
  return frame('Access Log', children);
}

// ─── SCREEN 5: INTEGRATIONS ────────────────────────────────────────
function integrationsScreen() {
  const children = [...statusBar()];

  children.push(txt('Integrations', 20, 58, 22, C.text, { weight: 'Bold', w: 220 }));
  children.push(txt('Connect your stack', 20, 82, 12, C.textSub, { w: 240 }));

  // Connected
  children.push(txt('CONNECTED', 20, 108, 10, C.textDim, { weight: 'SemiBold', ls: 2, w: 160 }));

  const connected = [
    { name: 'GitHub Actions',  desc: 'CI/CD secret injection',    ok: true,   icon: '◎', c: C.text },
    { name: 'Vercel',          desc: 'Env sync on deploy',         ok: true,   icon: '◈', c: C.text },
    { name: 'Slack',           desc: 'Rotation & alert notifications', ok: true, icon: '☰', c: C.accent },
    { name: 'Datadog',         desc: 'Secret access anomaly alerts', ok: false, icon: '◉', c: C.amber },
  ];

  connected.forEach((int, i) => {
    const iy = 126 + i * 68;
    children.push(rect(20, iy, W - 40, 60, C.surface2, { r: 12, stroke: int.ok ? C.border : C.amberDim }));
    // icon bg
    children.push(rect(34, iy + 14, 32, 32, C.surface3, { r: 8 }));
    children.push(txt(int.icon, 43, iy + 21, 16, int.c, { w: 16 }));
    children.push(txt(int.name, 78, iy + 14, 14, C.text, { weight: 'SemiBold', w: W - 150 }));
    children.push(txt(int.desc, 78, iy + 32, 11, C.textSub, { w: W - 140 }));
    // status
    if (int.ok) {
      children.push(dot(W - 40, iy + 27, C.accent, 8));
    } else {
      children.push(...chip('Review', W - 74, iy + 20, C.amberDim, C.amber, { w: 50, h: 18 }));
    }
  });

  // Available
  children.push(txt('AVAILABLE', 20, 406, 10, C.textDim, { weight: 'SemiBold', ls: 2, w: 160 }));

  const available = [
    { name: 'AWS Secrets Manager', desc: 'Bidirectional sync',       icon: '◦', c: C.amber },
    { name: 'HashiCorp Vault',     desc: 'Import existing secrets',   icon: '◦', c: C.indigo },
    { name: 'Terraform',           desc: 'Infra secret management',   icon: '◦', c: C.envTest },
    { name: 'Kubernetes',          desc: 'Pod secret mounting',        icon: '◦', c: C.text },
    { name: 'Railway',             desc: 'One-click project sync',    icon: '◦', c: C.envStage },
  ];

  available.forEach((int, i) => {
    const iy = 424 + i * 64;
    children.push(rect(20, iy, W - 40, 56, C.surface, { r: 10, stroke: C.borderSoft }));
    children.push(rect(34, iy + 14, 28, 28, C.surface2, { r: 7 }));
    children.push(txt(int.icon, 43, iy + 20, 14, int.c, { w: 14 }));
    children.push(txt(int.name, 72, iy + 12, 13, C.text, { weight: 'Medium', w: W - 140 }));
    children.push(txt(int.desc, 72, iy + 30, 11, C.textSub, { w: W - 130 }));
    // connect button
    children.push(rect(W - 78, iy + 18, 58, 20, C.accentDim, { r: 5 }));
    children.push(txt('Connect', W - 74, iy + 21, 10, C.accent, { weight: 'SemiBold', w: 50 }));
  });

  children.push(navBar('integrations'));
  return frame('Integrations', children);
}

// ─── ASSEMBLE PEN ──────────────────────────────────────────────────
const pen = {
  meta: {
    name: 'Rune',
    version: '2.8',
    slug: SLUG,
    tagline: 'Zero-config secret management for teams',
    description: 'Developer secret management platform. Manage API keys, environment variables, and secrets rotation across dev, staging, and production with paranoid-level security and clean dark-mode UI.',
    archetype: 'developer-security',
    theme: 'dark',
    createdAt: new Date().toISOString(),
  },
  canvas: {
    width:  W * 5,
    height: H,
    background: C.bg,
  },
  screens: [
    { ...overviewScreen(),       x: 0 },
    { ...envsScreen(),           x: W },
    { ...secretsScreen(),        x: W * 2 },
    { ...logScreen(),            x: W * 3 },
    { ...integrationsScreen(),   x: W * 4 },
  ],
};

const out = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${out} (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
