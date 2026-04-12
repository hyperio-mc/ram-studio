#!/usr/bin/env node
/**
 * CIPHER — AI Secrets & API Security Platform
 * Inspired by:
 * - Runlayer.com (Land-book, March 2026) — enterprise MCP security, "command & control" grid aesthetic
 * - Linear (Dark Mode Design gallery) — precision dark UI, monospaced data, ghost borders
 * - Darknode (Awwwards nominee) — deep near-black with electric accent glows
 *
 * Theme: DARK (previous was SYLVAN — light/warm)
 */

const fs = require('fs');

const W = 390, H = 844;

const BG      = '#08101E';
const SURF    = '#0D1829';
const SURF2   = '#111F35';
const BORDER  = '#1C2E4A';
const TEXT    = '#E2ECFF';
const MUTED   = '#5A7499';
const DIM     = '#2D4361';
const ACCENT  = '#3D7EFF';
const ACCENT2 = '#8B5CF6';
const GREEN   = '#10B981';
const AMBER   = '#F59E0B';
const RED     = '#EF4444';

let _id = 1;
const id = (prefix = 'el') => `${prefix}${_id++}`;

function rect(x, y, w, h, fill, opts = {}) {
  const o = { id: id('r'), type: 'rect', x, y, width: w, height: h, fill, opacity: opts.opacity ?? 1, cornerRadius: opts.r ?? 0 };
  if (opts.stroke) { o.stroke = opts.stroke; o.strokeWidth = opts.strokeWidth ?? 1; }
  return o;
}

function text(content, x, y, w, h, fontSize, fontWeight, fill, opts = {}) {
  const o = { id: id('t'), type: 'text', content, x, y, width: w, height: h, textGrowth: 'fixed-width-height', fontSize, fontWeight, fill, textAlign: opts.align ?? 'left', opacity: opts.opacity ?? 1 };
  if (opts.mono) o.fontFamily = 'monospace';
  return o;
}

function ellipse(x, y, w, h, fill, opacity = 1) {
  return { id: id('e'), type: 'ellipse', x, y, width: w, height: h, fill, opacity };
}

function statusBar(bgColor) {
  return { id: id('sb'), type: 'frame', x: 0, y: 0, width: W, height: 44, fill: bgColor, clip: false, children: [
    text('9:41', 20, 16, 50, 16, 12, '600', TEXT),
    text('◉ ◉ ◉  ▲ ▬', 294, 16, 80, 16, 10, '400', MUTED, { align: 'right' }),
  ]};
}

function navBar(activeIdx) {
  const tabs = [
    { icon: '⬡', label: 'Shield' },
    { icon: '◈', label: 'Vault' },
    { icon: '≋', label: 'Audit' },
    { icon: '◉', label: 'Threats' },
    { icon: '⊞', label: 'Links' },
  ];
  const tabW = W / tabs.length;
  const children = [rect(0, 0, W, 64, SURF), rect(0, 0, W, 1, BORDER)];
  tabs.forEach((tab, i) => {
    const isActive = i === activeIdx;
    const cx = i * tabW + tabW / 2;
    if (isActive) children.push(rect(cx - 16, 0, 32, 2, ACCENT, { r: 1 }));
    children.push(
      text(tab.icon, i * tabW + 8, 10, tabW - 16, 22, isActive ? 18 : 16, '400', isActive ? ACCENT : MUTED, { align: 'center' }),
      text(tab.label, i * tabW + 4, 34, tabW - 8, 16, 9, isActive ? '700' : '400', isActive ? ACCENT : MUTED, { align: 'center' }),
    );
  });
  return { id: id('nav'), type: 'frame', x: 0, y: H - 64, width: W, height: 64, fill: SURF, clip: false, children };
}

// SCREEN 1 — SHIELD DASHBOARD
function screenDashboard() {
  const feedItems = [
    { method: 'GET',  path: '/v2/secrets/prod-db',    agent: 'cursor',      status: GREEN, statusLabel: '200' },
    { method: 'POST', path: '/v2/secrets/stripe-key', agent: 'claude-code', status: GREEN, statusLabel: '201' },
    { method: 'GET',  path: '/v2/secrets/aws-root',   agent: 'unknown',     status: RED,   statusLabel: '403' },
    { method: 'GET',  path: '/v2/audit/export',       agent: 'codeium',     status: AMBER, statusLabel: '429' },
    { method: 'PUT',  path: '/v2/secrets/gh-token',   agent: 'windsurf',    status: GREEN, statusLabel: '200' },
  ];

  const barVals = [22, 18, 30, 25, 19, 15, 14, 12];

  const children = [
    rect(0, 0, W, H, BG),
    ellipse(-40, 80, 300, 200, ACCENT, 0.07),
    ellipse(160, 600, 260, 200, ACCENT2, 0.06),
    statusBar(BG),
    text('CIPHER', 20, 56, 180, 28, 20, '800', TEXT),
    text('SHIELD', 20, 56, 370, 28, 20, '800', ACCENT, { align: 'right' }),
    text('AI Security · All Systems Monitored', 20, 88, 300, 16, 11, '400', MUTED),
    // Hero threat score card
    rect(16, 112, W - 32, 108, SURF2, { r: 12, stroke: BORDER }),
    rect(16, 112, W - 32, 3, ACCENT, { r: 2, opacity: 0.5 }),
    text('THREAT SCORE', 32, 128, 200, 14, 10, '700', MUTED),
    text('12', 32, 144, 80, 52, 52, '800', GREEN),
    text('/100', 86, 172, 60, 18, 18, '400', MUTED),
    text('LOW RISK', 148, 155, 100, 20, 10, '700', GREEN),
    text('↓ Improved 8pts from yesterday', 148, 172, 210, 14, 9, '400', MUTED),
    ...barVals.map((bh, i) => {
      const barH = Math.round(bh * 0.6);
      return rect(262 + i * 13, 218 - barH, 10, barH, i === 7 ? GREEN : DIM, { r: 2 });
    }),
    text('7d', 262, 221, 40, 12, 8, '400', MUTED),
    // Stat row
    ...['Active Secrets|48|' + TEXT, 'API Calls/hr|1.2K|' + TEXT, 'Blocked|3|' + RED].flatMap((spec, i) => {
      const [label, value, color] = spec.split('|');
      const x = 16 + i * 120;
      return [
        rect(x, 236, 112, 56, SURF2, { r: 8, stroke: BORDER }),
        text(value, x + 12, 248, 90, 24, 22, '700', color),
        text(label, x + 12, 275, 90, 12, 9, '400', MUTED),
      ];
    }),
    text('LIVE API FEED', 20, 306, 200, 14, 10, '700', MUTED),
    text('⬤ real-time', 300, 306, 74, 14, 9, '400', GREEN, { align: 'right' }),
    rect(20, 322, W - 40, 1, BORDER),
    ...feedItems.flatMap(({ method, path, agent, status, statusLabel }, i) => {
      const y = 330 + i * 46;
      const mc = method === 'GET' ? ACCENT : method === 'POST' ? ACCENT2 : AMBER;
      return [
        rect(20, y + 2, W - 40, 40, i % 2 === 0 ? `${SURF2}88` : 'transparent', { r: 6 }),
        text(method, 28, y + 12, 38, 16, 9, '700', mc),
        text(path, 72, y + 12, 220, 16, 10, '500', TEXT, { mono: true }),
        text(agent, 72, y + 27, 160, 12, 9, '400', MUTED, { mono: true }),
        text(statusLabel, 342, y + 16, 36, 16, 10, '700', status, { align: 'right', mono: true }),
      ];
    }),
    navBar(0),
  ];
  return { id: 'dashboard', label: 'Shield', width: W, height: H, children };
}

// SCREEN 2 — VAULT
function screenVault() {
  const secrets = [
    { name: 'STRIPE_SECRET_KEY',  env: 'prod',    age: '3d',   status: GREEN, statusLabel: 'Active',  ring: false },
    { name: 'OPENAI_API_KEY',     env: 'prod',    age: '12d',  status: AMBER, statusLabel: 'Rotate',  ring: true  },
    { name: 'AWS_ACCESS_KEY_ID',  env: 'prod',    age: '31d',  status: RED,   statusLabel: 'Expired', ring: true  },
    { name: 'GITHUB_TOKEN',       env: 'staging', age: '1d',   status: GREEN, statusLabel: 'Active',  ring: false },
    { name: 'POSTGRES_URL',       env: 'prod',    age: '7d',   status: GREEN, statusLabel: 'Active',  ring: false },
    { name: 'SENDGRID_API_KEY',   env: 'dev',     age: '45d',  status: RED,   statusLabel: 'Expired', ring: true  },
    { name: 'TWILIO_AUTH_TOKEN',  env: 'prod',    age: '5d',   status: GREEN, statusLabel: 'Active',  ring: false },
  ];
  const categories = ['All', 'API Keys', 'DB', 'OAuth', 'Tokens'];
  const catWidths  = [34, 58, 22, 46, 52];
  const catXs = [16];
  catWidths.slice(0,-1).forEach((w,i) => catXs.push(catXs[i] + w + 12));

  const children = [
    rect(0, 0, W, H, BG),
    ellipse(200, 100, 220, 160, ACCENT2, 0.06),
    statusBar(BG),
    text('Secret Vault', 20, 56, 200, 26, 22, '700', TEXT),
    text('48 secrets', 20, 56, 370, 26, 22, '700', MUTED, { align: 'right' }),
    text('Encrypted at rest · Zero-knowledge', 20, 86, 300, 16, 11, '400', MUTED),
    // Search bar
    rect(16, 106, W - 32, 36, SURF2, { r: 8, stroke: BORDER }),
    text('⌕  Search secrets...', 28, 119, 200, 16, 11, '400', DIM),
    text('⊟ Filter', 310, 117, 60, 18, 10, '500', ACCENT, { align: 'right' }),
    // Category chips
    ...categories.flatMap((cat, i) => {
      const isFirst = i === 0;
      const w = catWidths[i] + 16;
      return [
        rect(catXs[i], 152, w, 24, isFirst ? ACCENT : SURF2, { r: 12, stroke: isFirst ? undefined : BORDER }),
        text(cat, catXs[i], 152, w, 24, 10, isFirst ? '700' : '400', isFirst ? '#fff' : MUTED, { align: 'center' }),
      ];
    }),
    // Secret list
    ...secrets.flatMap(({ name, env, age, status, statusLabel, ring }, i) => {
      const y = 188 + i * 74;
      const envColor = env === 'prod' ? ACCENT : env === 'staging' ? ACCENT2 : MUTED;
      return [
        rect(16, y, W - 32, 66, SURF2, { r: 10, stroke: ring ? status : BORDER }),
        rect(28, y + 18, 28, 28, `${status}22`, { r: 6 }),
        text('🔑', 28, y + 18, 28, 28, 14, '400', status, { align: 'center' }),
        text(name, 64, y + 12, 250, 18, 10, '600', TEXT, { mono: true }),
        rect(64, y + 33, Math.max(env.length * 7 + 10, 28), 18, `${envColor}22`, { r: 4 }),
        text(env.toUpperCase(), 69, y + 34, 60, 14, 8, '700', envColor),
        text(`Updated ${age} ago`, 64 + env.length * 7 + 16, y + 34, 120, 14, 9, '400', MUTED),
        text(statusLabel, 316, y + 22, 58, 20, 9, '700', status, { align: 'right' }),
        ring ? text('⟳ rotate now', 316, y + 40, 58, 14, 8, '400', status, { align: 'right' }) : null,
      ].filter(Boolean);
    }),
    navBar(1),
  ];
  return { id: 'vault', label: 'Vault', width: W, height: H, children };
}

// SCREEN 3 — AUDIT LOG
function screenAudit() {
  const logs = [
    { time: '21:47:03', agent: 'claude-code', action: 'READ',   secret: 'STRIPE_SECRET_KEY',  status: GREEN, risk: '' },
    { time: '21:46:55', agent: 'cursor',       action: 'READ',   secret: 'OPENAI_API_KEY',     status: GREEN, risk: '' },
    { time: '21:46:41', agent: 'unknown',       action: 'READ',   secret: 'AWS_ACCESS_KEY_ID',  status: RED,   risk: '⚠' },
    { time: '21:46:29', agent: 'windsurf',      action: 'WRITE',  secret: 'GITHUB_TOKEN',       status: AMBER, risk: '' },
    { time: '21:46:18', agent: 'claude-code', action: 'READ',   secret: 'POSTGRES_URL',       status: GREEN, risk: '' },
    { time: '21:46:02', agent: 'codeium',      action: 'READ',   secret: 'SENDGRID_API_KEY',   status: RED,   risk: '⚠' },
    { time: '21:45:51', agent: 'cursor',       action: 'READ',   secret: 'TWILIO_AUTH_TOKEN',  status: GREEN, risk: '' },
    { time: '21:45:38', agent: 'unknown',       action: 'DELETE', secret: 'POSTGRES_URL',       status: RED,   risk: '🔴' },
  ];
  const children = [
    rect(0, 0, W, H, BG),
    ellipse(-20, 400, 200, 160, RED, 0.04),
    statusBar(BG),
    text('Audit Log', 20, 56, 220, 26, 22, '700', TEXT),
    text('⬤  Live', 296, 62, 78, 16, 10, '700', GREEN, { align: 'right' }),
    text('Full access history · tamper-proof', 20, 86, 300, 16, 11, '400', MUTED),
    // Filter chips
    ...['All Events', 'Anomalies', 'Writes', 'Blocks'].flatMap((chip, i) => {
      const isFirst = i === 0;
      const ws = [76, 72, 54, 54];
      const xs = [16, 96, 172, 230];
      return [
        rect(xs[i], 108, ws[i], 24, isFirst ? ACCENT : SURF2, { r: 12, stroke: isFirst ? undefined : BORDER }),
        text(chip, xs[i], 108, ws[i], 24, 9, isFirst ? '700' : '400', isFirst ? '#fff' : MUTED, { align: 'center' }),
      ];
    }),
    // Headers
    rect(16, 142, W - 32, 1, BORDER),
    text('TIME', 20, 149, 64, 13, 8, '700', MUTED, { mono: true }),
    text('AGENT', 88, 149, 100, 13, 8, '700', MUTED),
    text('ACTION', 200, 149, 60, 13, 8, '700', MUTED),
    text('RISK', 354, 149, 28, 13, 8, '700', MUTED, { align: 'right' }),
    rect(16, 163, W - 32, 1, BORDER),
    // Log rows
    ...logs.flatMap(({ time, agent, action, secret, status, risk }, i) => {
      const y = 170 + i * 70;
      const ac = action === 'READ' ? TEXT : action === 'WRITE' ? AMBER : RED;
      return [
        rect(16, y, W - 32, 64, i % 2 === 0 ? `${SURF2}88` : 'transparent', { r: 6 }),
        text(time, 22, y + 8, 72, 14, 9, '500', MUTED, { mono: true }),
        text(agent, 22, y + 25, 120, 14, 10, '600', TEXT, { mono: true }),
        text(secret.length > 22 ? secret.slice(0,20) + '…' : secret, 22, y + 43, 220, 12, 8, '400', DIM, { mono: true }),
        rect(200, y + 18, action.length * 7 + 10, 18, `${ac}20`, { r: 4 }),
        text(action, 205, y + 19, action.length * 7, 16, 8, '700', ac, { mono: true }),
        text(risk || '✓', 350, y + 24, 28, 16, risk ? 12 : 10, '700', status, { align: 'right' }),
      ];
    }),
    navBar(2),
  ];
  return { id: 'audit', label: 'Audit', width: W, height: H, children };
}

// SCREEN 4 — THREATS
function screenThreats() {
  const threats = [
    { id: 'T-001', title: 'Credential Stuffing Attempt',  severity: 'CRITICAL', color: RED,   source: 'Unknown agent · 47 req/min', ts: '2min ago' },
    { id: 'T-002', title: 'Expired Key Still In Use',      severity: 'HIGH',     color: RED,   source: 'codeium · SENDGRID_API_KEY', ts: '14min ago' },
    { id: 'T-003', title: 'Unusual Read Pattern Detected', severity: 'MEDIUM',   color: AMBER, source: 'cursor · 3× normal rate', ts: '1hr ago' },
    { id: 'T-004', title: 'Missing Rotation Policy',       severity: 'LOW',      color: ACCENT,source: '6 secrets > 30 days old', ts: '3hr ago' },
  ];
  const children = [
    rect(0, 0, W, H, BG),
    ellipse(280, 160, 180, 140, RED, 0.08),
    ellipse(50, 500, 200, 160, ACCENT2, 0.05),
    statusBar(BG),
    text('Threat Intel', 20, 56, 220, 26, 22, '700', TEXT),
    text('4 active', 294, 62, 80, 16, 12, '700', RED, { align: 'right' }),
    text('AI-powered risk detection engine', 20, 86, 300, 16, 11, '400', MUTED),
    // Summary row
    ...[['1', 'Critical', RED], ['1', 'High', RED], ['1', 'Medium', AMBER], ['1', 'Low', ACCENT]].flatMap(([v, lbl, color], i) => {
      const x = 16 + i * 88;
      return [
        rect(x, 108, 80, 52, SURF2, { r: 8, stroke: `${color}44` }),
        text(v, x + 10, 116, 60, 26, 24, '800', color),
        text(lbl, x + 10, 142, 60, 14, 9, '500', MUTED),
      ];
    }),
    // Threat cards
    ...threats.flatMap(({ id: tid, title, severity, color, source, ts }, i) => {
      const y = 172 + i * 130;
      return [
        rect(16, y, W - 32, 122, SURF2, { r: 10, stroke: `${color}33` }),
        rect(16, y, 3, 122, color, { r: 1, opacity: 0.8 }),
        text(tid, 28, y + 10, 60, 14, 9, '700', MUTED, { mono: true }),
        text(ts, 296, y + 10, 78, 14, 9, '400', MUTED, { align: 'right' }),
        rect(28, y + 30, severity.length * 7 + 10, 18, `${color}22`, { r: 4 }),
        text(severity, 33, y + 31, severity.length * 7, 16, 8, '700', color),
        text(title, 28, y + 56, W - 68, 20, 13, '600', TEXT),
        text(source, 28, y + 80, W - 68, 14, 10, '400', MUTED),
        rect(28, y + 100, 80, 18, `${color}20`, { r: 4 }),
        text('Investigate →', 28, y + 101, 80, 16, 9, '600', color),
        text('Dismiss', 116, y + 101, 50, 16, 9, '400', MUTED),
      ];
    }),
    navBar(3),
  ];
  return { id: 'threats', label: 'Threats', width: W, height: H, children };
}

// SCREEN 5 — INTEGRATIONS
function screenIntegrations() {
  const integrations = [
    { name: 'Claude Code',     type: 'MCP Client',   status: GREEN, requests: '847/hr', icon: '◈' },
    { name: 'Cursor',          type: 'MCP Client',   status: GREEN, requests: '312/hr', icon: '◈' },
    { name: 'Windsurf',        type: 'MCP Client',   status: GREEN, requests: '118/hr', icon: '◈' },
    { name: 'Codeium',         type: 'MCP Client',   status: AMBER, requests: '94/hr',  icon: '◈' },
    { name: 'GitHub Actions',  type: 'CI/CD',        status: GREEN, requests: '44/hr',  icon: '⊞' },
    { name: 'AWS Secrets Mgr', type: 'Secret Store', status: GREEN, requests: 'synced', icon: '⬡' },
    { name: 'Vercel',          type: 'Deployment',   status: GREEN, requests: '12/hr',  icon: '△' },
  ];
  const barVals = [0.4,0.6,0.5,0.8,0.7,0.9,1.0,0.85,0.75,0.9,0.95,1.0];
  const children = [
    rect(0, 0, W, H, BG),
    ellipse(180, 80, 240, 160, ACCENT, 0.06),
    statusBar(BG),
    text('Integrations', 20, 56, 220, 26, 22, '700', TEXT),
    text('7 connected', 280, 62, 94, 16, 12, '700', GREEN, { align: 'right' }),
    text('All tool connections secured by CIPHER', 20, 86, 330, 16, 11, '400', MUTED),
    // Traffic card
    rect(16, 108, W - 32, 64, SURF2, { r: 10, stroke: BORDER }),
    text('TOTAL API CALLS TODAY', 28, 120, 200, 14, 9, '700', MUTED),
    text('28,441', 28, 136, 160, 28, 26, '800', ACCENT),
    text('↑ 12% vs yesterday', 28, 163, 180, 14, 9, '400', GREEN),
    ...barVals.map((bh, i) => {
      const barH = Math.round(bh * 28);
      return rect(240 + i * 12, 168 - barH, 9, barH, i === 11 ? ACCENT : DIM, { r: 2 });
    }),
    text('24h', 238, 172, 36, 12, 8, '400', MUTED),
    text('CONNECTED TOOLS', 20, 184, 200, 14, 9, '700', MUTED),
    text('+ Add', 336, 184, 42, 14, 9, '600', ACCENT, { align: 'right' }),
    rect(20, 200, W - 40, 1, BORDER),
    // Integration rows
    ...integrations.flatMap(({ name, type, status, requests, icon }, i) => {
      const y = 208 + i * 70;
      return [
        rect(16, y, W - 32, 62, SURF2, { r: 10, stroke: `${status}22` }),
        rect(28, y + 14, 32, 32, `${ACCENT}18`, { r: 8 }),
        text(icon, 28, y + 14, 32, 32, 16, '400', ACCENT, { align: 'center' }),
        text(name, 70, y + 12, 190, 18, 13, '600', TEXT),
        text(type, 70, y + 32, 190, 14, 10, '400', MUTED),
        rect(318, y + 12, 6, 6, status, { r: 3 }),
        text(requests, 328, y + 10, 46, 16, 9, '700', status, { align: 'right' }),
        text('secured', 328, y + 28, 46, 14, 8, '400', MUTED, { align: 'right' }),
      ];
    }),
    navBar(4),
  ];
  return { id: 'integrations', label: 'Links', width: W, height: H, children };
}

const pen = {
  version: '2.8',
  title: 'CIPHER — Seal every secret. Audit every call.',
  description: 'Dark-mode AI secrets & API security platform for developers managing API keys across AI tool stacks. Inspired by Runlayer.com (Land-book, March 2026) — enterprise MCP security "command & control" grid aesthetic; Linear (Dark Mode Design gallery) — precision monospace data UI with ghost borders; Darknode (Awwwards nominee) — deep navy-black + electric blue glow. Palette: deep navy-black #08101E + electric blue #3D7EFF + violet #8B5CF6 + emerald green #10B981.',
  viewport: { width: W, height: H },
  screens: [
    screenDashboard(),
    screenVault(),
    screenAudit(),
    screenThreats(),
    screenIntegrations(),
  ],
};

fs.writeFileSync('cipher.pen', JSON.stringify(pen, null, 2));
console.log('✓ Generated cipher.pen (' + pen.screens.length + ' screens)');
pen.screens.forEach(s => console.log('  → ' + s.id + ': ' + s.label));
