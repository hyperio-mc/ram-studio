'use strict';
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
//  FEND — Threat Intelligence Platform
//  Heartbeat design · Dark theme
//  Inspired by:
//    darkmodedesign.com → developer-minimal dark (Linear/Vercel/Raycast aesthetic)
//    land-book.com      → oversized stat-as-headline pattern
//    saaspo.com         → bento grid feature sections
//    godly.website      → cinematic dark grain / textured darkness
// ─────────────────────────────────────────────

const SLUG    = 'fend';
const NAME    = 'FEND';
const W       = 390;
const H       = 844;

// Palette — developer-minimal dark (NOT the saturated AI purple cliché)
const BG      = '#080B10';   // near-black, slight navy warmth
const SURF    = '#0E1219';   // elevated surface
const CARD    = '#141A25';   // card background
const CARD2   = '#1A2233';   // secondary card
const TEXT    = '#E2E8F4';   // warm off-white
const MUTED   = 'rgba(226,232,244,0.45)';
const DIM     = 'rgba(226,232,244,0.22)';
const ACC     = '#F97316';   // amber-orange — threat/alert urgency
const ACC2    = '#38BDF8';   // sky blue — data/insight highlights
const GREEN   = '#22C55E';   // safe/clear
const RED     = '#EF4444';   // critical
const BORDER  = 'rgba(226,232,244,0.08)';

// ─── Primitives ───────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? '400',
    fontFamily: opts.font ?? '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? '0',
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

function buildSvg(els) {
  const parts = els.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    }
    if (e.type === 'text') {
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${e.content}</text>`;
    }
    if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    }
    if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}"/>`;
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

// ─── Shared UI Components ─────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 28, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(W - 16, 28, '●●●', 12, TEXT, { anchor: 'end', opacity: 0.5 }));
}

function navbar(els, screens, active) {
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, BORDER, { sw: 1 }));
  const icons = ['⊞', '◎', '◈', '◑', '⊕'];
  const labels = ['Feed', 'Assets', 'Rules', 'Team', 'More'];
  const cols = [W * 0.1, W * 0.3, W * 0.5, W * 0.7, W * 0.9];
  cols.forEach((cx, i) => {
    const isActive = labels[i] === active;
    const col = isActive ? ACC : MUTED;
    els.push(text(cx, H - 48, icons[i], 20, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    els.push(text(cx, H - 26, labels[i], 10, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    if (isActive) {
      els.push(rect(cx - 12, H - 80, 24, 2, ACC, { rx: 1 }));
    }
  });
}

function chip(els, x, y, label, color, fill = 'none') {
  const w = label.length * 6.5 + 16;
  els.push(rect(x, y, w, 22, fill === 'none' ? 'none' : fill, {
    rx: 11, stroke: color, sw: 1, opacity: 0.9,
  }));
  els.push(text(x + w / 2, y + 15, label, 10, color, { anchor: 'middle', fw: '600', ls: '0.5' }));
  return w;
}

// ─── Screen 1: Threat Center (HERO) ──────────────────
// Inspired by: land-book's "oversized stat as headline" + saaspo bento grid
function screenThreatCenter() {
  const els = [];
  statusBar(els);

  // Header bar
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(16, 78, 'FEND', 18, TEXT, { fw: '700', ls: '3' }));
  // Dot indicator
  els.push(circle(60, 69, 4, RED));
  els.push(text(70, 75, 'LIVE', 9, RED, { fw: '700', ls: '1.5' }));
  // Avatar
  els.push(circle(W - 30, 70, 16, CARD2));
  els.push(text(W - 30, 75, 'AK', 10, ACC2, { anchor: 'middle', fw: '700' }));

  // ─── HERO: Oversized Threat Count (land-book pattern) ───
  els.push(rect(0, 96, W, 140, BG));
  // Ambient glow behind number (subtle, not the clichéd AI orb)
  els.push(circle(195, 145, 80, ACC, { opacity: 0.04 }));

  els.push(text(195, 165, '2,847', 72, TEXT, { fw: '700', anchor: 'middle', ls: '-2' }));
  els.push(text(195, 192, 'threats detected today', 13, MUTED, { anchor: 'middle' }));

  // Delta indicator
  els.push(text(155, 218, '▲ 14%', 11, RED, { fw: '600' }));
  els.push(text(200, 218, 'vs yesterday', 11, MUTED));

  // ─── Bento Grid (saaspo pattern) ───
  // Row 1: 2 tall cards
  const B = { pad: 12, gap: 10, top: 240, cardH: 120 };

  // Bento card: Critical (tall left)
  els.push(rect(B.pad, B.top, 174, B.cardH, CARD, { rx: 12 }));
  els.push(rect(B.pad, B.top, 174, B.cardH, RED, { rx: 12, opacity: 0.06 }));
  els.push(text(B.pad + 14, B.top + 30, '●', 12, RED, { fw: '700' }));
  els.push(text(B.pad + 30, B.top + 30, 'Critical', 12, TEXT, { fw: '600' }));
  els.push(text(B.pad + 14, B.top + 72, '38', 40, RED, { fw: '700' }));
  els.push(text(B.pad + 14, B.top + 95, 'open incidents', 10, MUTED));
  els.push(line(B.pad + 14, B.top + 108, B.pad + 160, B.top + 108, RED, { sw: 1, opacity: 0.2 }));

  // Bento card: High (tall right)
  const rx = B.pad + 174 + B.gap;
  els.push(rect(rx, B.top, 180, B.cardH, CARD, { rx: 12 }));
  els.push(rect(rx, B.top, 180, B.cardH, ACC, { rx: 12, opacity: 0.05 }));
  els.push(text(rx + 14, B.top + 30, '●', 12, ACC, { fw: '700' }));
  els.push(text(rx + 30, B.top + 30, 'High', 12, TEXT, { fw: '600' }));
  els.push(text(rx + 14, B.top + 72, '217', 40, ACC, { fw: '700' }));
  els.push(text(rx + 14, B.top + 95, 'flagged assets', 10, MUTED));
  els.push(line(rx + 14, B.top + 108, rx + 166, B.top + 108, ACC, { sw: 1, opacity: 0.2 }));

  // Row 2: 3 small cards
  const B2top = B.top + B.cardH + B.gap;
  const cardW3 = (W - B.pad * 2 - B.gap * 2) / 3;
  const cats = [
    { label: 'Medium', count: '891', color: '#FBBF24' },
    { label: 'Low', count: '1.7K', color: ACC2 },
    { label: 'Resolved', count: '8.2K', color: GREEN },
  ];
  cats.forEach((c, i) => {
    const cx = B.pad + i * (cardW3 + B.gap);
    els.push(rect(cx, B2top, cardW3, 72, CARD, { rx: 12 }));
    els.push(text(cx + 10, B2top + 26, c.count, 22, c.color, { fw: '700' }));
    els.push(text(cx + 10, B2top + 46, c.label, 10, MUTED));
    // Subtle color accent strip at top
    els.push(rect(cx + 10, B2top + 8, 20, 3, c.color, { rx: 1.5 }));
  });

  // ─── Recent Activity ───
  const actY = B2top + 82;
  els.push(text(16, actY, 'RECENT ACTIVITY', 10, MUTED, { fw: '600', ls: '1.5' }));

  const events = [
    { time: '2m', icon: '◉', color: RED, msg: 'SQL injection attempt blocked', src: 'api.prod.us-east-1' },
    { time: '7m', icon: '◎', color: ACC, msg: 'Brute force on SSH port 22', src: 'worker-node-14' },
    { time: '11m', icon: '◎', color: ACC2, msg: 'Anomalous S3 bucket access', src: 'eu-central-1' },
  ];

  events.forEach((ev, i) => {
    const ey = actY + 20 + i * 54;
    els.push(rect(12, ey, W - 24, 48, CARD, { rx: 10 }));
    // Icon dot
    els.push(circle(36, ey + 24, 7, ev.color, { opacity: 0.15 }));
    els.push(circle(36, ey + 24, 4, ev.color));
    // Text
    els.push(text(52, ey + 19, ev.msg, 12, TEXT, { fw: '500' }));
    els.push(text(52, ey + 36, ev.src, 10, MUTED));
    // Time
    els.push(text(W - 24, ey + 24, ev.time + ' ago', 10, DIM, { anchor: 'end' }));
    // Separator line
    if (i < events.length - 1) {
      els.push(line(12, ey + 48, W - 12, ey + 48, BORDER, { sw: 1 }));
    }
  });

  navbar(els, [], 'Feed');
  return { name: 'Threat Center', svg: buildSvg(els), elements: els };
}

// ─── Screen 2: Live Feed ──────────────────────────
function screenLiveFeed() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(16, 78, 'Live Feed', 20, TEXT, { fw: '700' }));
  // Filter chips
  chip(els, W - 100, 60, 'ALL', ACC, CARD2);
  chip(els, W - 56, 60, '●', ACC, 'none');

  // Timeline header
  const incidents = [
    { sev: 'CRITICAL', sevC: RED,    type: 'SQL Injection',        src: 'api.prod.us-east',       rule: 'R-0091', ts: '09:41:02', status: 'Blocking', statusC: RED },
    { sev: 'HIGH',     sevC: ACC,    type: 'Port Scan Detected',   src: 'worker-node-14',         rule: 'R-0044', ts: '09:39:58', status: 'Alerting', statusC: ACC },
    { sev: 'HIGH',     sevC: ACC,    type: 'Cred Stuffing Burst',  src: 'auth.service.prod',      rule: 'R-0067', ts: '09:38:11', status: 'Alerting', statusC: ACC },
    { sev: 'MEDIUM',   sevC: '#FBBF24', type: 'S3 Bucket Exposed', src: 'eu-central-1-storage',  rule: 'R-0022', ts: '09:35:44', status: 'Review',   statusC: '#FBBF24' },
    { sev: 'LOW',      sevC: ACC2,   type: 'Unusual Login Hours',  src: 'user:priya.k',           rule: 'R-0011', ts: '09:33:30', status: 'Logged',   statusC: ACC2 },
    { sev: 'CRITICAL', sevC: RED,    type: 'Privilege Escalation', src: 'k8s-cluster-prod',       rule: 'R-0103', ts: '09:31:09', status: 'Blocking', statusC: RED },
    { sev: 'MEDIUM',   sevC: '#FBBF24', type: 'Tor Exit Node Hit', src: 'cdn-edge-3',            rule: 'R-0088', ts: '09:28:55', status: 'Monitor',  statusC: '#FBBF24' },
    { sev: 'LOW',      sevC: ACC2,   type: 'Failed MFA ×5',        src: 'user:jdoe@company.io',  rule: 'R-0019', ts: '09:24:03', status: 'Logged',   statusC: ACC2 },
  ];

  let yy = 106;
  incidents.forEach((inc, i) => {
    els.push(rect(12, yy, W - 24, 70, CARD, { rx: 10 }));
    // Left severity bar
    els.push(rect(12, yy, 3, 70, inc.sevC, { rx: 1.5 }));

    // Severity chip
    const cw = chip(els, 24, yy + 10, inc.sev, inc.sevC);
    // Timestamp
    els.push(text(W - 24, yy + 22, inc.ts, 10, DIM, { anchor: 'end' }));

    // Type
    els.push(text(24, yy + 42, inc.type, 13, TEXT, { fw: '600' }));
    // Source
    els.push(text(24, yy + 58, inc.src, 10, MUTED));
    // Rule badge
    els.push(text(W - 24, yy + 48, inc.rule, 9, DIM, { anchor: 'end', ls: '0.5' }));
    // Status
    els.push(text(W - 24, yy + 62, inc.status, 9, inc.statusC, { anchor: 'end', fw: '600' }));

    yy += 76;
  });

  navbar(els, [], 'Feed');
  return { name: 'Live Feed', svg: buildSvg(els), elements: els };
}

// ─── Screen 3: Incident Detail ────────────────────
function screenIncidentDetail() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(16, 72, '←', 20, TEXT, { fw: '300' }));
  els.push(text(195, 76, 'Incident Detail', 16, TEXT, { fw: '600', anchor: 'middle' }));
  chip(els, W - 90, 57, 'BLOCKING', RED, 'rgba(239,68,68,0.15)');

  // Title block
  els.push(rect(0, 100, W, 90, SURF));
  els.push(rect(16, 110, 4, 60, RED, { rx: 2 }));
  els.push(text(30, 130, 'SQL Injection Attempt', 18, TEXT, { fw: '700' }));
  els.push(text(30, 152, 'api.prod.us-east-1 · Rule R-0091', 12, MUTED));
  els.push(text(30, 170, 'Detected 09:41:02 UTC · 2 min ago', 11, DIM));

  // Timeline of events
  const tlY = 210;
  els.push(text(16, tlY, 'ATTACK TIMELINE', 10, MUTED, { fw: '600', ls: '1.5' }));

  const events = [
    { t: '09:41:02', label: 'Payload detected in /api/search', color: RED },
    { t: '09:41:02', label: 'WAF rule R-0091 triggered',       color: ACC },
    { t: '09:41:03', label: 'Request blocked — 403 returned',  color: GREEN },
    { t: '09:41:03', label: 'Threat logged to SIEM',           color: ACC2 },
    { t: '09:41:05', label: 'IP 185.220.101.x flagged',        color: ACC },
  ];

  events.forEach((ev, i) => {
    const ey = tlY + 18 + i * 46;
    // Timeline line
    if (i < events.length - 1) els.push(line(32, ey + 14, 32, ey + 46, BORDER, { sw: 1.5 }));
    els.push(circle(32, ey + 8, 5, ev.color));
    els.push(text(48, ey + 12, ev.label, 12, TEXT, { fw: '500' }));
    els.push(text(48, ey + 28, ev.t + ' UTC', 10, DIM));
  });

  // Payload section
  const pyY = tlY + 18 + events.length * 46 + 10;
  els.push(text(16, pyY, 'PAYLOAD SAMPLE', 10, MUTED, { fw: '600', ls: '1.5' }));
  els.push(rect(12, pyY + 10, W - 24, 72, '#0A0F1A', { rx: 8, stroke: BORDER, sw: 1 }));
  // Code font simulation
  els.push(text(24, pyY + 30, "GET /api/search?q=", 11, ACC2, { font: '"SF Mono", monospace', fw: '400' }));
  els.push(text(168, pyY + 30, "1' OR '1'='1", 11, RED, { font: '"SF Mono", monospace', fw: '500' }));
  els.push(text(24, pyY + 48, 'User-Agent: sqlmap/1.7.11', 11, MUTED, { font: '"SF Mono", monospace' }));
  els.push(text(24, pyY + 66, 'X-Forwarded-For: 185.220.101.x', 11, MUTED, { font: '"SF Mono", monospace' }));

  // Action buttons
  const actY = pyY + 90;
  els.push(rect(12, actY, (W - 36) / 2, 44, ACC, { rx: 10 }));
  els.push(text(12 + (W - 36) / 4, actY + 27, 'Block IP Range', 13, '#000', { anchor: 'middle', fw: '700' }));

  const bx2 = 12 + (W - 36) / 2 + 12;
  els.push(rect(bx2, actY, (W - 36) / 2, 44, CARD2, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(bx2 + (W - 36) / 4, actY + 27, 'Create Rule', 13, TEXT, { anchor: 'middle', fw: '600' }));

  navbar(els, [], 'Feed');
  return { name: 'Incident Detail', svg: buildSvg(els), elements: els };
}

// ─── Screen 4: Asset Map ──────────────────────────
function screenAssetMap() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(16, 78, 'Assets', 20, TEXT, { fw: '700' }));
  els.push(text(W - 16, 78, '+ Add', 13, ACC, { anchor: 'end', fw: '600' }));

  // Summary row
  const sumY = 104;
  const stats = [
    { val: '143', label: 'Protected', color: GREEN },
    { val: '38',  label: 'At Risk',   color: ACC },
    { val: '9',   label: 'Critical',  color: RED },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + i * 120;
    els.push(rect(sx, sumY, 110, 62, CARD, { rx: 10 }));
    els.push(text(sx + 14, sumY + 36, s.val, 26, s.color, { fw: '700' }));
    els.push(text(sx + 14, sumY + 54, s.label, 10, MUTED));
    els.push(rect(sx + 14, sumY + 10, 16, 3, s.color, { rx: 1.5 }));
  });

  // Asset list
  const assets = [
    { name: 'api.prod.us-east-1',    type: 'API Gateway',    risk: 95, riskC: RED,    status: 'Critical' },
    { name: 'auth.service.prod',      type: 'Auth Service',   risk: 82, riskC: ACC,    status: 'High' },
    { name: 'k8s-cluster-prod',       type: 'Kubernetes',     risk: 78, riskC: ACC,    status: 'High' },
    { name: 'postgres-primary',       type: 'Database',       risk: 44, riskC: '#FBBF24', status: 'Medium' },
    { name: 'eu-central-1-storage',   type: 'S3 Bucket',      risk: 38, riskC: '#FBBF24', status: 'Medium' },
    { name: 'cdn-edge-3',             type: 'CDN Edge Node',  risk: 21, riskC: ACC2,   status: 'Low' },
    { name: 'monitoring.internal',    type: 'Observability',  risk: 8,  riskC: GREEN,  status: 'Clear' },
    { name: 'bastion.vpn.prod',       type: 'VPN Gateway',    risk: 5,  riskC: GREEN,  status: 'Clear' },
  ];

  const listY = 178;
  els.push(text(16, listY, 'ALL MONITORED ASSETS', 10, MUTED, { fw: '600', ls: '1.5' }));

  assets.forEach((a, i) => {
    const ay = listY + 18 + i * 64;
    els.push(rect(12, ay, W - 24, 58, CARD, { rx: 10 }));

    // Risk score bar (left)
    els.push(rect(12, ay, 4, 58, a.riskC, { rx: 2 }));

    // Asset icon placeholder
    els.push(rect(24, ay + 10, 36, 36, CARD2, { rx: 8 }));
    els.push(text(42, ay + 33, a.type.charAt(0), 14, a.riskC, { anchor: 'middle', fw: '700' }));

    // Name + type
    els.push(text(68, ay + 24, a.name, 12, TEXT, { fw: '600' }));
    els.push(text(68, ay + 40, a.type, 10, MUTED));

    // Risk score
    els.push(text(W - 24, ay + 24, a.risk + '', 20, a.riskC, { anchor: 'end', fw: '700' }));
    els.push(text(W - 24, ay + 40, 'risk score', 9, DIM, { anchor: 'end' }));

    // Status chip
    const cw = chip(els, W - 24 - a.status.length * 6.5 - 16, ay + 46, a.status, a.riskC);
  });

  navbar(els, [], 'Assets');
  return { name: 'Asset Map', svg: buildSvg(els), elements: els };
}

// ─── Screen 5: Detection Rules ───────────────────
function screenRules() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(16, 78, 'Rules Engine', 20, TEXT, { fw: '700' }));
  els.push(text(W - 16, 78, '+ Rule', 13, ACC, { anchor: 'end', fw: '600' }));

  // Stats bar
  const statsY = 104;
  els.push(rect(12, statsY, W - 24, 52, CARD, { rx: 10 }));
  const rs = [
    { v: '342', l: 'Active' }, { v: '28', l: 'Staged' }, { v: '14', l: 'Disabled' }, { v: '99.4%', l: 'Uptime' }
  ];
  rs.forEach((r, i) => {
    const sx = 12 + i * ((W - 24) / 4);
    if (i > 0) els.push(line(sx, statsY + 12, sx, statsY + 40, BORDER, { sw: 1 }));
    els.push(text(sx + ((W - 24) / 8), statsY + 28, r.v, 16, i === 3 ? GREEN : TEXT, { anchor: 'middle', fw: '700' }));
    els.push(text(sx + ((W - 24) / 8), statsY + 44, r.l, 9, MUTED, { anchor: 'middle' }));
  });

  const rules = [
    { id: 'R-0103', name: 'Privilege Escalation',    cat: 'AuthN',  sev: 'CRITICAL', hits: 4,   active: true,  sevC: RED },
    { id: 'R-0091', name: 'SQL Injection Pattern',   cat: 'Inj.',   sev: 'CRITICAL', hits: 38,  active: true,  sevC: RED },
    { id: 'R-0067', name: 'Cred Stuffing Burst',     cat: 'AuthN',  sev: 'HIGH',     hits: 217, active: true,  sevC: ACC },
    { id: 'R-0044', name: 'Port Scan Detection',     cat: 'Network',sev: 'HIGH',     hits: 12,  active: true,  sevC: ACC },
    { id: 'R-0088', name: 'Tor Exit Node Access',    cat: 'Network',sev: 'MEDIUM',   hits: 6,   active: true,  sevC: '#FBBF24' },
    { id: 'R-0022', name: 'S3 Public Exposure',      cat: 'Cloud',  sev: 'MEDIUM',   hits: 1,   active: false, sevC: '#FBBF24' },
    { id: 'R-0019', name: 'Repeated MFA Failure',    cat: 'AuthN',  sev: 'LOW',      hits: 89,  active: true,  sevC: ACC2 },
    { id: 'R-0011', name: 'After-Hours Login',       cat: 'UBA',    sev: 'LOW',      hits: 33,  active: true,  sevC: ACC2 },
  ];

  const listY = 168;
  els.push(text(16, listY, 'DETECTION RULES', 10, MUTED, { fw: '600', ls: '1.5' }));

  rules.forEach((rule, i) => {
    const ry = listY + 18 + i * 64;
    els.push(rect(12, ry, W - 24, 58, CARD, { rx: 10 }));

    // Severity bar
    els.push(rect(12, ry, 4, 58, rule.active ? rule.sevC : DIM, { rx: 2 }));

    // Rule ID
    els.push(text(24, ry + 20, rule.id, 10, rule.active ? rule.sevC : DIM, { fw: '600', ls: '0.5' }));
    // Category chip
    chip(els, 80, ry + 8, rule.cat, rule.active ? MUTED : DIM);

    // Name
    els.push(text(24, ry + 38, rule.name, 12, rule.active ? TEXT : MUTED, { fw: '600' }));

    // Hits
    els.push(text(W - 24, ry + 22, rule.hits + ' hits', 11, rule.active ? TEXT : MUTED, { anchor: 'end', fw: '600' }));

    // Toggle indicator
    const toggleX = W - 60;
    els.push(rect(W - 60, ry + 36, 36, 16, rule.active ? ACC + '44' : CARD2, { rx: 8, stroke: rule.active ? ACC : BORDER, sw: 1 }));
    els.push(circle(rule.active ? W - 60 + 24 : W - 60 + 10, ry + 44, 6, rule.active ? ACC : MUTED));
  });

  navbar(els, [], 'Rules');
  return { name: 'Rules Engine', svg: buildSvg(els), elements: els };
}

// ─── Screen 6: Team Intelligence ─────────────────
function screenTeam() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(16, 78, 'Team Intel', 20, TEXT, { fw: '700' }));
  chip(els, W - 100, 60, 'INCIDENT WAR ROOM', RED, 'rgba(239,68,68,0.12)');

  // Response Score — oversized stat again (land-book pattern)
  els.push(rect(12, 106, W - 24, 100, CARD, { rx: 14 }));
  els.push(rect(12, 106, W - 24, 100, ACC2, { rx: 14, opacity: 0.04 }));
  els.push(text(195, 162, 'MTTD  4.2m', 26, TEXT, { fw: '700', anchor: 'middle' }));
  els.push(text(195, 186, 'mean time to detect  ·  ▼ 18% vs last week', 11, GREEN, { anchor: 'middle' }));
  els.push(text(195, 126, 'RESPONSE HEALTH', 10, MUTED, { anchor: 'middle', fw: '600', ls: '1.5' }));

  // Team member rows
  const members = [
    { name: 'Amara Keita',   role: 'Incident Lead',       status: 'Responding',   cases: 3, statusC: RED },
    { name: 'Priya Singh',   role: 'Threat Analyst',      status: 'Investigating', cases: 7, statusC: ACC },
    { name: 'Leo Marchetti', role: 'Forensics',           status: 'Analyzing',    cases: 2, statusC: ACC },
    { name: 'Sofia Reyes',   role: 'Cloud Security',      status: 'On-call',      cases: 4, statusC: ACC2 },
    { name: 'Jin-ho Park',   role: 'Red Team',            status: 'Standby',      cases: 0, statusC: GREEN },
    { name: 'Zara Okonkwo',  role: 'SecOps Engineer',     status: 'Available',    cases: 1, statusC: GREEN },
  ];

  const teamY = 220;
  els.push(text(16, teamY, 'RESPONDERS ON SHIFT', 10, MUTED, { fw: '600', ls: '1.5' }));

  members.forEach((m, i) => {
    const my = teamY + 18 + i * 68;
    els.push(rect(12, my, W - 24, 62, CARD, { rx: 10 }));

    // Avatar
    const initials = m.name.split(' ').map(n => n[0]).join('');
    els.push(circle(44, my + 31, 20, CARD2));
    els.push(text(44, my + 37, initials, 12, ACC2, { anchor: 'middle', fw: '700' }));

    // Status dot
    els.push(circle(58, my + 16, 5, m.statusC));
    els.push(rect(54, my + 11, 10, 10, CARD, { rx: 5 })); // white ring on dot

    // Name + role
    els.push(text(72, my + 26, m.name, 13, TEXT, { fw: '600' }));
    els.push(text(72, my + 44, m.role, 10, MUTED));

    // Status + cases
    els.push(text(W - 24, my + 26, m.status, 11, m.statusC, { anchor: 'end', fw: '600' }));
    els.push(text(W - 24, my + 44, m.cases + ' cases', 10, DIM, { anchor: 'end' }));
  });

  navbar(els, [], 'Team');
  return { name: 'Team Intel', svg: buildSvg(els), elements: els };
}

// ─── Build ────────────────────────────────────────
const screens = [
  screenThreatCenter(),
  screenLiveFeed(),
  screenIncidentDetail(),
  screenAssetMap(),
  screenRules(),
  screenTeam(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'FEND — Threat Intelligence',
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'dark',
    heartbeat: 'auto',
    elements: totalElements,
    inspiration: [
      'darkmodedesign.com: developer-minimal dark (Vercel/Linear/Raycast aesthetic)',
      'land-book.com: oversized stat-as-headline hero element',
      'saaspo.com: bento grid for feature sections',
      'godly.website: cinematic dark, anti-purple-gradient differentiation',
    ],
  },
  screens: screens.map(({ name, svg }) => ({ name, svg })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
