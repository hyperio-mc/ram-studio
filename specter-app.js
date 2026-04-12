'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'specter';
const NAME = 'SPECTER';
const W = 390, H = 844;

// ─── Palette ───────────────────────────────────────────────────────────────
const BG      = '#09090D';
const SURF    = '#0E0F15';
const CARD    = '#141620';
const CARD2   = '#1A1C28';
const ACC     = '#00FF88';   // neon green — security authority
const ACC2    = '#3B82F6';   // electric blue
const ACC3    = '#F43F5E';   // alert red
const ACC4    = '#A855F7';   // purple — intel
const TEXT    = '#E2E8F4';
const SUB     = '#8892A0';
const MUTED   = 'rgba(226,232,244,0.25)';
const BORDER  = 'rgba(226,232,244,0.08)';

// ─── Helpers ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400, fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start', letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1,
           stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ─── Components ─────────────────────────────────────────────────────────────
function statusBar(label) {
  return [
    rect(0, 0, W, 44, BG),
    text(20, 28, '9:41', 13, SUB, { fw: 600 }),
    text(W / 2, 28, label.toUpperCase(), 11, SUB, { anchor: 'middle', ls: 3, fw: 500 }),
    text(W - 20, 28, '● LTE', 11, ACC, { anchor: 'end', fw: 600 }),
  ];
}

function navBar(activeIdx) {
  const items = [
    { icon: '⬡', label: 'THREAT' },
    { icon: '⊡', label: 'FEEDS' },
    { icon: '⊕', label: 'HUNT' },
    { icon: '◎', label: 'INTEL' },
    { icon: '⊘', label: 'OPS' },
  ];
  const els = [
    rect(0, H - 72, W, 72, SURF),
    line(0, H - 72, W, H - 72, BORDER, { sw: 1 }),
  ];
  const colW = W / items.length;
  items.forEach((item, i) => {
    const cx = colW * i + colW / 2;
    const isActive = i === activeIdx;
    els.push(
      text(cx, H - 44, item.icon, 18, isActive ? ACC : SUB, { anchor: 'middle', fw: isActive ? 700 : 400 }),
      text(cx, H - 20, item.label, 8, isActive ? ACC : SUB, { anchor: 'middle', ls: 1.5, fw: isActive ? 700 : 400 }),
    );
    if (isActive) {
      els.push(rect(cx - 16, H - 73, 32, 2, ACC, { rx: 1 }));
    }
  });
  return els;
}

function bentoCard(x, y, w, h, opts = {}) {
  const els = [
    rect(x, y, w, h, CARD, { rx: 12, stroke: BORDER, sw: 1 }),
  ];
  if (opts.accentBar) {
    els.push(rect(x, y, w, 2, opts.accentBar, { rx: 0 }));
    // top rounded corners fix
    els.push(rect(x, y, w, 12, opts.accentBar, { rx: 12, opacity: 0.3 }));
  }
  if (opts.glow) {
    els.push(rect(x - 2, y - 2, w + 4, h + 4, opts.glow, { rx: 14, opacity: 0.06 }));
  }
  return els;
}

function threatScore(x, y, score, label, color) {
  const els = [];
  // Ring background
  els.push(circle(x, y, 30, 'none', { stroke: BORDER, sw: 4 }));
  // Score arc (simplified as colored ring portion)
  els.push(circle(x, y, 30, 'none', { stroke: color, sw: 4, opacity: 0.9 }));
  els.push(text(x, y + 6, score, 18, color, { anchor: 'middle', fw: 800 }));
  els.push(text(x, y + 22, label, 8, SUB, { anchor: 'middle', ls: 1 }));
  return els;
}

function pill(x, y, label, color, bgOpacity = 0.12) {
  const w = label.length * 6.5 + 16;
  return [
    rect(x, y, w, 20, color, { rx: 10, opacity: bgOpacity }),
    text(x + w / 2, y + 13.5, label, 8.5, color, { anchor: 'middle', fw: 700, ls: 0.5 }),
  ];
}

function sparkline(x, y, w, h, points, color) {
  // Simplified sparkline using horizontal lines of varying height
  const els = [];
  const step = w / (points.length - 1);
  points.forEach((p, i) => {
    if (i < points.length - 1) {
      const x1 = x + i * step, y1 = y + h - p * h;
      const x2 = x + (i + 1) * step, y2 = y + h - points[i + 1] * h;
      els.push(line(x1, y1, x2, y2, color, { sw: 1.5, opacity: 0.8 }));
    }
    // Dot on last point
    if (i === points.length - 1) {
      els.push(circle(x + i * step, y + h - p * h, 3, color));
    }
  });
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Threat Dashboard (Bento Grid)
// ═══════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];
  // BG
  els.push(rect(0, 0, W, H, BG));
  // Ambient glow top
  els.push(rect(60, -60, 270, 180, ACC, { rx: 135, opacity: 0.04 }));

  // Status bar
  els.push(...statusBar('specter'));

  // Header
  els.push(text(20, 72, 'THREAT CENTER', 11, ACC, { fw: 700, ls: 3 }));
  els.push(text(20, 94, 'Global telemetry — live', 13, TEXT, { fw: 300, opacity: 0.7 }));

  // LIVE badge
  els.push(rect(W - 72, 60, 52, 22, ACC, { rx: 11, opacity: 0.12 }));
  els.push(circle(W - 60, 71, 4, ACC));
  els.push(text(W - 50, 75, 'LIVE', 9, ACC, { fw: 800, ls: 2 }));

  // ── Bento Row 1: Threat Score (wide) + Active (narrow) ──
  const R1Y = 112;
  els.push(...bentoCard(16, R1Y, 220, 120, { glow: ACC }));
  els.push(text(28, R1Y + 20, 'THREAT SCORE', 9, SUB, { fw: 600, ls: 2 }));
  // Big number
  els.push(text(28, R1Y + 70, '8.4', 44, ACC, { fw: 900 }));
  els.push(text(100, R1Y + 70, '/10', 18, SUB, { fw: 300 }));
  els.push(...pill(28, R1Y + 90, 'ELEVATED', ACC3, 0.15));
  // Sparkline in score card
  els.push(...sparkline(140, R1Y + 40, 80, 60, [0.3, 0.5, 0.45, 0.7, 0.6, 0.85, 0.75, 0.9], ACC));

  // Active incidents card
  els.push(...bentoCard(244, R1Y, 130, 120, { accentBar: ACC3 }));
  els.push(text(256, R1Y + 22, 'ACTIVE', 9, SUB, { fw: 600, ls: 2 }));
  els.push(text(256, R1Y + 62, '23', 38, ACC3, { fw: 900 }));
  els.push(text(256, R1Y + 84, 'incidents', 9, SUB, { fw: 400 }));
  els.push(text(256, R1Y + 100, '↑ 7 from yesterday', 8, ACC3, { fw: 500, opacity: 0.8 }));

  // ── Bento Row 2: Three small metric cards ──
  const R2Y = 244;
  const metrics = [
    { label: 'BLOCKED', val: '1,847', color: ACC2 },
    { label: 'SCANNED', val: '48.2M', color: ACC4 },
    { label: 'PATCHED', val: '99.1%', color: ACC },
  ];
  const mW = (W - 32 - 16) / 3;
  metrics.forEach((m, i) => {
    const mx = 16 + i * (mW + 8);
    els.push(...bentoCard(mx, R2Y, mW, 80, { accentBar: m.color }));
    els.push(text(mx + 10, R2Y + 24, m.label, 7.5, SUB, { fw: 700, ls: 2 }));
    els.push(text(mx + 10, R2Y + 56, m.val, 20, m.color, { fw: 800 }));
  });

  // ── Bento Row 3: Attack Vectors (large card) ──
  const R3Y = 340;
  els.push(...bentoCard(16, R3Y, W - 32, 140, {}));
  els.push(text(28, R3Y + 20, 'ATTACK VECTORS', 9, SUB, { fw: 600, ls: 2 }));

  const vectors = [
    { label: 'Phishing', pct: 0.72, color: ACC3 },
    { label: 'Ransomware', pct: 0.58, color: ACC4 },
    { label: 'Zero-Day', pct: 0.41, color: ACC2 },
    { label: 'Insider', pct: 0.29, color: ACC },
  ];
  vectors.forEach((v, i) => {
    const vy = R3Y + 40 + i * 24;
    const barW = (W - 80) * v.pct;
    els.push(text(28, vy + 10, v.label, 9, TEXT, { fw: 400 }));
    els.push(rect(120, vy, W - 136, 8, BORDER, { rx: 4 }));
    els.push(rect(120, vy, barW, 8, v.color, { rx: 4 }));
    els.push(text(W - 28, vy + 9, `${Math.round(v.pct * 100)}%`, 8, v.color, { anchor: 'end', fw: 700 }));
  });

  // ── Bento Row 4: Two cards ──
  const R4Y = 496;
  // Nation-state actors
  els.push(...bentoCard(16, R4Y, 174, 90, {}));
  els.push(text(28, R4Y + 22, 'NATION STATE', 8, SUB, { fw: 600, ls: 1.5 }));
  const actors = [
    { name: 'APT-29', color: ACC3 }, { name: 'Lazarus', color: ACC4 }, { name: 'APT-41', color: ACC2 },
  ];
  actors.forEach((a, i) => {
    els.push(...pill(28 + i * 58, R4Y + 50, a.name, a.color));
  });
  els.push(text(28, R4Y + 78, '12 tracked groups', 8, SUB, { fw: 400 }));

  // CVE score
  els.push(...bentoCard(198, R4Y, 176, 90, {}));
  els.push(text(210, R4Y + 22, 'TOP CVE SCORE', 8, SUB, { fw: 600, ls: 1.5 }));
  els.push(text(210, R4Y + 58, '9.8', 30, ACC3, { fw: 900 }));
  els.push(text(256, R4Y + 58, 'CRITICAL', 9, ACC3, { fw: 700, opacity: 0.8 }));
  els.push(text(210, R4Y + 76, 'CVE-2026-0021', 9, SUB, { fw: 500, ls: 0.5 }));

  // ── Bento Row 5: Recent alerts ──
  const R5Y = 602;
  els.push(...bentoCard(16, R5Y, W - 32, 100, {}));
  els.push(text(28, R5Y + 20, 'RECENT ALERTS', 9, SUB, { fw: 600, ls: 2 }));

  const alerts = [
    { msg: 'Lateral movement detected — node 192.168.3.12', sev: 'HIGH', color: ACC3 },
    { msg: 'Brute-force attempt — SSH service exposed', sev: 'MED', color: ACC4 },
    { msg: 'Anomalous DNS query volume — endpoint 04', sev: 'LOW', color: ACC2 },
  ];
  alerts.forEach((a, i) => {
    const ay = R5Y + 40 + i * 22;
    els.push(circle(28, ay + 4, 3, a.color));
    els.push(text(38, ay + 9, a.msg, 8, TEXT, { fw: 400, opacity: 0.75 }));
    els.push(...pill(W - 52, ay - 2, a.sev, a.color, 0.15));
  });

  // Nav
  els.push(...navBar(0));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Threat Feed (Live Intelligence Stream)
// ═══════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar('specter'));

  // Header
  els.push(text(20, 72, 'THREAT FEEDS', 11, ACC, { fw: 700, ls: 3 }));
  els.push(text(20, 92, '12 sources · Updated 3s ago', 12, SUB, { fw: 400 }));

  // Filter pills row
  const filters = ['ALL', 'CRITICAL', 'MALWARE', 'EXPLOIT', 'PHISH'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw2 = f.length * 6.5 + 20;
    const isActive = i === 0;
    els.push(rect(fx, 106, fw2, 24, isActive ? ACC : CARD, { rx: 12, opacity: isActive ? 1 : 0.8 }));
    els.push(text(fx + fw2 / 2, 121, f, 8.5, isActive ? BG : SUB, { anchor: 'middle', fw: 700, ls: 1 }));
    fx += fw2 + 8;
  });

  // Feed items
  const feedItems = [
    {
      time: '00:03', title: 'Cobalt Strike C2 Infrastructure Expanded',
      source: 'ThreatConnect', tags: ['APT', 'C2'], sev: 'CRITICAL', sevColor: ACC3,
      body: 'New beacon domains registered across 14 hosting providers. Attribution: APT-29.',
    },
    {
      time: '00:11', title: 'CVE-2026-0021 POC Published to GitHub',
      source: 'NVD + GitHub Scan', tags: ['CVE', 'RCE'], sev: 'CRITICAL', sevColor: ACC3,
      body: 'Working PoC for remote code execution in OpenSSH 9.8. Patch immediately.',
    },
    {
      time: '00:28', title: 'Conti Successor Campaign — Healthcare Sector',
      source: 'CrowdStrike Intel', tags: ['Ransomware', 'HEALTH'], sev: 'HIGH', sevColor: ACC4,
      body: '17 hospital systems targeted across EU. Initial access via VPN credential stuffing.',
    },
    {
      time: '01:14', title: 'Mass Phishing Wave — O365 Lookalikes',
      source: 'PhishLabs', tags: ['Phish', 'BEC'], sev: 'HIGH', sevColor: ACC4,
      body: '4,200+ domains mimicking Microsoft 365 login. AiTM proxy kit in use.',
    },
    {
      time: '02:07', title: 'Quasar RAT Variant Detected — Finance',
      source: 'Recorded Future', tags: ['RAT', 'FIN'], sev: 'MED', sevColor: ACC2,
      body: 'Modified Quasar with anti-sandbox and encrypted C2. Targeting SWIFT terminals.',
    },
    {
      time: '04:45', title: 'Dark Web: 2M Corp Credentials on Sale',
      source: 'DarkOwl Feed', tags: ['DARKWEB', 'CRED'], sev: 'MED', sevColor: ACC2,
      body: 'Fortune 500 employee credentials listed on RAMP forum. Likely from infostealer.',
    },
  ];

  feedItems.forEach((item, i) => {
    const iy = 144 + i * 104;
    if (iy + 104 > H - 80) return;

    els.push(rect(16, iy, W - 32, 96, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
    // Severity accent left bar
    els.push(rect(16, iy, 3, 96, item.sevColor, { rx: 2 }));

    // Time + source
    els.push(text(28, iy + 16, item.time, 8, SUB, { fw: 500, ls: 1 }));
    els.push(text(28, iy + 30, item.source, 8, SUB, { fw: 400 }));
    els.push(...pill(W - 72, iy + 10, item.sev, item.sevColor, 0.15));

    // Title
    els.push(text(28, iy + 52, item.title, 10.5, TEXT, { fw: 600 }));

    // Body (truncated)
    const bodyTrunc = item.body.length > 60 ? item.body.slice(0, 60) + '…' : item.body;
    els.push(text(28, iy + 68, bodyTrunc, 8.5, SUB, { fw: 400 }));

    // Tags
    let tx = 28;
    item.tags.forEach(tag => {
      const tw = tag.length * 5.5 + 12;
      els.push(rect(tx, iy + 80, tw, 14, MUTED, { rx: 7, opacity: 0.6 }));
      els.push(text(tx + tw / 2, iy + 90, tag, 7, SUB, { anchor: 'middle', fw: 600 }));
      tx += tw + 6;
    });
  });

  els.push(...navBar(1));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Hunt (Threat Hunting Query Interface)
// ═══════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar('specter'));

  // Header
  els.push(text(20, 72, 'THREAT HUNT', 11, ACC, { fw: 700, ls: 3 }));
  els.push(text(20, 92, 'Query across 180-day log corpus', 12, SUB, { fw: 400 }));

  // Search bar (monospace — signals developer/technical tool)
  els.push(rect(16, 108, W - 32, 44, CARD, { rx: 8, stroke: ACC, sw: 1, opacity: 0.9 }));
  els.push(rect(16, 108, W - 32, 44, ACC, { rx: 8, opacity: 0.05 }));
  els.push(text(30, 134, '> process.name:"cmd.exe" AND parent.name:"word.exe"', 8.5, ACC, { fw: 600, ls: 0.3, font: 'monospace' }));
  // Cursor blink
  els.push(rect(W - 44, 122, 8, 14, ACC, { rx: 1, opacity: 0.8 }));

  // Query stats row
  els.push(text(16, 172, '847 results', 12, ACC, { fw: 700 }));
  els.push(text(16, 188, 'across 23 endpoints · MITRE T1059.003', 10, SUB, { fw: 400 }));

  // MITRE ATT&CK badge
  els.push(rect(W - 120, 160, 104, 32, ACC4, { rx: 6, opacity: 0.12 }));
  els.push(text(W - 68, 178, 'T1059 — CMD', 8.5, ACC4, { anchor: 'middle', fw: 700 }));

  // Result timeline mini-chart
  els.push(rect(16, 202, W - 32, 64, CARD, { rx: 8 }));
  els.push(text(28, 218, 'OCCURRENCES / HOUR', 7.5, SUB, { fw: 600, ls: 2 }));
  const timePts = [0.1, 0.2, 0.15, 0.4, 0.35, 0.8, 0.9, 0.7, 0.5, 0.6, 0.85, 1.0, 0.75];
  els.push(...sparkline(28, 220, W - 56, 40, timePts, ACC3));

  // Results list
  const results = [
    { host: 'WORKSTATION-042', time: '11:47:22', pid: '4821', risk: 'CRITICAL', rColor: ACC3 },
    { host: 'LAPTOP-JCHEN', time: '11:51:09', pid: '3204', risk: 'CRITICAL', rColor: ACC3 },
    { host: 'SERVER-PROD-03', time: '12:02:44', pid: '9102', risk: 'HIGH', rColor: ACC4 },
    { host: 'WORKSTATION-017', time: '12:18:31', pid: '1847', risk: 'HIGH', rColor: ACC4 },
    { host: 'LAPTOP-MKHAN', time: '12:24:55', pid: '6623', risk: 'MED', rColor: ACC2 },
    { host: 'WORKSTATION-091', time: '12:29:07', pid: '2291', risk: 'MED', rColor: ACC2 },
    { host: 'LAPTOP-RTOMASZ', time: '12:31:44', pid: '8834', risk: 'LOW', rColor: ACC },
  ];

  results.forEach((r, i) => {
    const ry = 278 + i * 56;
    if (ry + 56 > H - 80) return;
    els.push(rect(16, ry, W - 32, 48, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    // Left accent
    els.push(rect(16, ry, 3, 48, r.rColor, { rx: 2 }));
    els.push(text(28, ry + 18, r.host, 11, TEXT, { fw: 600, font: 'monospace' }));
    els.push(text(28, ry + 34, `PID ${r.pid} · ${r.time}`, 9, SUB, { fw: 400, font: 'monospace' }));
    els.push(...pill(W - 72, ry + 14, r.risk, r.rColor, 0.15));
    // Chevron
    els.push(text(W - 28, ry + 26, '›', 16, SUB, { anchor: 'middle', fw: 300 }));
  });

  els.push(...navBar(2));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Intel (Nation-State Actor Profile)
// ═══════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  // Ambient purple glow
  els.push(rect(W / 2 - 100, 60, 200, 200, ACC4, { rx: 100, opacity: 0.06 }));
  els.push(...statusBar('specter'));

  // Back nav
  els.push(text(20, 72, '‹ INTEL', 12, SUB, { fw: 500 }));

  // Actor header
  els.push(text(W / 2, 102, 'APT-29', 28, TEXT, { anchor: 'middle', fw: 900, ls: 4 }));
  els.push(text(W / 2, 122, 'COZY BEAR · SVR AFFILIATE', 9, ACC4, { anchor: 'middle', ls: 3, fw: 600 }));

  // Origin badge
  els.push(rect(W / 2 - 40, 132, 80, 22, ACC4, { rx: 11, opacity: 0.15 }));
  els.push(text(W / 2, 146, '🇷🇺 RUSSIA', 9, ACC4, { anchor: 'middle', fw: 700, ls: 1 }));

  // Divider
  els.push(line(40, 162, W - 40, 162, BORDER));

  // Threat score rings (simplified bento trio)
  const ringData = [
    { label: 'SOPH.', val: '9.2', color: ACC3 },
    { label: 'ACTIVE', val: '8.7', color: ACC4 },
    { label: 'IMPACT', val: '9.5', color: ACC2 },
  ];
  const ringW = (W - 32) / 3;
  ringData.forEach((rd, i) => {
    const rx2 = 16 + i * ringW + ringW / 2;
    const ry2 = 200;
    els.push(...bentoCard(16 + i * ringW + 4, 170, ringW - 8, 68, {}));
    els.push(...threatScore(rx2, ry2, rd.val, rd.label, rd.color));
  });

  // TTPs card
  els.push(...bentoCard(16, 250, W - 32, 130, { accentBar: ACC4 }));
  els.push(text(28, 272, 'TACTICS, TECHNIQUES, PROCEDURES', 7.5, SUB, { fw: 700, ls: 2 }));

  const ttps = [
    { tactic: 'Initial Access', tech: 'Spearphishing (T1566)', color: ACC3 },
    { tactic: 'Persistence', tech: 'Registry Run Keys (T1547)', color: ACC4 },
    { tactic: 'C2', tech: 'Encrypted Channel (T1573)', color: ACC2 },
    { tactic: 'Exfiltration', tech: 'Cloud Storage (T1567)', color: ACC },
  ];
  ttps.forEach((t, i) => {
    const ty = 286 + i * 22;
    els.push(circle(28, ty + 5, 3, t.color));
    els.push(text(38, ty + 10, t.tactic, 8.5, SUB, { fw: 500 }));
    els.push(text(130, ty + 10, t.tech, 8.5, TEXT, { fw: 500 }));
  });

  // Recent activity card
  els.push(...bentoCard(16, 392, W - 32, 104, {}));
  els.push(text(28, 412, 'RECENT CAMPAIGNS', 9, SUB, { fw: 600, ls: 2 }));
  const campaigns = [
    { name: 'WellMess v3', target: 'Healthcare · EU', date: 'Mar 2026', color: ACC3 },
    { name: 'MiniDuke Resurgence', target: 'Gov · NATO', date: 'Jan 2026', color: ACC4 },
    { name: 'CloudAtlas EU', target: 'Finance · DACH', date: 'Dec 2025', color: ACC2 },
  ];
  campaigns.forEach((c, i) => {
    const cy = 424 + i * 24;
    els.push(circle(28, cy + 5, 3, c.color));
    els.push(text(38, cy + 10, c.name, 9, TEXT, { fw: 600 }));
    els.push(text(165, cy + 10, c.target, 8.5, SUB, { fw: 400 }));
    els.push(text(W - 28, cy + 10, c.date, 8, SUB, { anchor: 'end', fw: 400 }));
  });

  // Indicators card
  els.push(...bentoCard(16, 508, W - 32, 80, {}));
  els.push(text(28, 528, 'KNOWN INDICATORS', 9, SUB, { fw: 600, ls: 2 }));
  const iocs = [
    { type: 'DOMAIN', val: 'update-checker[.]ru', color: ACC3 },
    { type: 'IP', val: '185.244.30.xx (C2)', color: ACC4 },
    { type: 'HASH', val: 'a4f9c2...e81d (SHA256)', color: ACC2 },
  ];
  iocs.forEach((ioc, i) => {
    const iocy = 540 + i * 16;
    els.push(text(28, iocy, ioc.type, 7.5, ioc.color, { fw: 700, ls: 1 }));
    els.push(text(88, iocy, ioc.val, 8.5, SUB, { fw: 400, font: 'monospace' }));
  });

  // Watch level
  els.push(rect(16, 600, W - 32, 50, ACC3, { rx: 10, opacity: 0.1, stroke: ACC3, sw: 1 }));
  els.push(text(W / 2, 622, '⚠ PRIORITY WATCH — Active Campaign Confirmed', 9, ACC3, { anchor: 'middle', fw: 700 }));
  els.push(text(W / 2, 638, 'Last observed: 4 hours ago', 9, SUB, { anchor: 'middle', fw: 400 }));

  els.push(...navBar(3));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Incident Detail
// ═══════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar('specter'));

  // Back + incident ID header
  els.push(text(20, 72, '‹ BACK', 12, SUB, { fw: 500 }));
  els.push(text(W - 20, 68, 'INC-2026-0847', 9, SUB, { anchor: 'end', fw: 600, ls: 1, font: 'monospace' }));

  // Incident title
  els.push(text(20, 96, 'Lateral Movement Detected', 16, TEXT, { fw: 800 }));
  els.push(text(20, 114, 'Internal network traversal via SMB', 11, SUB, { fw: 400 }));

  // Status + time row
  els.push(...pill(20, 124, 'INVESTIGATING', ACC3, 0.15));
  els.push(text(W - 20, 136, '11 Apr 2026  ·  11:47 UTC', 8.5, SUB, { anchor: 'end', fw: 400 }));

  // Divider
  els.push(line(20, 150, W - 20, 150, BORDER));

  // Impact bento trio
  const impacts = [
    { label: 'HOSTS', val: '12', color: ACC3 },
    { label: 'ACCTS', val: '3', color: ACC4 },
    { label: 'DATA AT RISK', val: '2.4TB', color: ACC2 },
  ];
  const iW = (W - 32) / 3;
  impacts.forEach((im, i) => {
    const ix = 16 + i * iW + 4;
    els.push(...bentoCard(ix, 162, iW - 8, 64, { accentBar: im.color }));
    els.push(text(ix + 10, 180, im.label, 7.5, SUB, { fw: 700, ls: 1.5 }));
    els.push(text(ix + 10, 208, im.val, 18, im.color, { fw: 900 }));
  });

  // Attack chain timeline
  els.push(text(20, 246, 'ATTACK CHAIN', 9, SUB, { fw: 600, ls: 2 }));

  const chain = [
    { step: '1', label: 'Initial Access', detail: 'Phishing email → macro execution', time: '11:02', color: ACC3, done: true },
    { step: '2', label: 'Execution', detail: 'PowerShell spawn · cmd.exe · WMI', time: '11:18', color: ACC3, done: true },
    { step: '3', label: 'Persistence', detail: 'Registry run key installed', time: '11:31', color: ACC4, done: true },
    { step: '4', label: 'Lateral Movement', detail: 'Pass-the-hash · SMB sweep', time: '11:47', color: ACC4, done: true },
    { step: '5', label: 'C2 Established', detail: 'HTTPS beacon to 185.244.xx.xx', time: 'ACTIVE', color: ACC3, done: false },
    { step: '6', label: 'Exfiltration', detail: 'Not yet observed', time: 'PENDING', color: MUTED, done: false },
  ];

  chain.forEach((c, i) => {
    const cy = 264 + i * 56;
    if (cy + 56 > H - 80) return;

    // Timeline connector line
    if (i < chain.length - 1) {
      els.push(line(36, cy + 22, 36, cy + 56, c.done ? c.color : BORDER, { sw: 2, opacity: 0.5 }));
    }
    // Step circle
    els.push(circle(36, cy + 10, 10, c.done ? c.color : CARD, { stroke: c.done ? 'none' : BORDER, sw: 1, opacity: c.done ? 0.15 : 1 }));
    els.push(text(36, cy + 15, c.step, 9, c.done ? c.color : SUB, { anchor: 'middle', fw: 700 }));

    // Card
    els.push(rect(56, cy, W - 72, 48, CARD, { rx: 8, stroke: c.done ? c.color : BORDER, sw: c.done ? 1 : 1, opacity: 0.8 }));
    if (c.done && c.color !== MUTED) {
      els.push(rect(56, cy, 3, 48, c.color, { rx: 2 }));
    }
    els.push(text(68, cy + 16, c.label, 10, c.done ? TEXT : SUB, { fw: 700 }));
    els.push(text(68, cy + 32, c.detail, 8.5, SUB, { fw: 400 }));
    els.push(text(W - 28, cy + 16, c.time, 8, c.done ? c.color : SUB, { anchor: 'end', fw: 700, font: 'monospace' }));
  });

  els.push(...navBar(4));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Ops (Integrations + System Health)
// ═══════════════════════════════════════════════════════════════════════════
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar('specter'));

  els.push(text(20, 72, 'OPS CONSOLE', 11, ACC, { fw: 700, ls: 3 }));
  els.push(text(20, 92, 'System health · Integrations', 12, SUB, { fw: 400 }));

  // System health bento grid
  const healthItems = [
    { label: 'SIEM', status: 'ONLINE', color: ACC, pct: 100 },
    { label: 'EDR', status: 'ONLINE', color: ACC, pct: 100 },
    { label: 'SOAR', status: 'DEGRADED', color: ACC4, pct: 67 },
    { label: 'SYSLOG', status: 'ONLINE', color: ACC, pct: 100 },
  ];
  const hW = (W - 40) / 2;
  healthItems.forEach((h, i) => {
    const hx = 16 + (i % 2) * (hW + 8);
    const hy = 108 + Math.floor(i / 2) * 84;
    els.push(...bentoCard(hx, hy, hW, 76, { accentBar: h.color }));
    els.push(text(hx + 12, hy + 24, h.label, 9, SUB, { fw: 700, ls: 2 }));
    els.push(...pill(hx + 12, hy + 38, h.status, h.color, 0.15));
    // Mini progress bar
    els.push(rect(hx + 12, hy + 62, hW - 24, 5, BORDER, { rx: 2.5 }));
    els.push(rect(hx + 12, hy + 62, (hW - 24) * h.pct / 100, 5, h.color, { rx: 2.5 }));
  });

  // Data sources section
  els.push(text(20, 284, 'DATA SOURCES', 9, SUB, { fw: 600, ls: 2 }));

  const sources = [
    { name: 'CrowdStrike Falcon', type: 'EDR', status: 'active', color: ACC, events: '2.4M/h' },
    { name: 'Splunk Enterprise', type: 'SIEM', status: 'active', color: ACC, events: '8.1M/h' },
    { name: 'Microsoft Sentinel', type: 'CLOUD SIEM', status: 'active', color: ACC, events: '1.9M/h' },
    { name: 'ThreatConnect', type: 'THREAT INTEL', status: 'active', color: ACC, events: '12K/h' },
    { name: 'Recorded Future', type: 'THREAT INTEL', status: 'active', color: ACC, events: '8K/h' },
    { name: 'Palo Alto XSOAR', type: 'SOAR', status: 'degraded', color: ACC4, events: '430/h' },
  ];

  sources.forEach((s, i) => {
    const sy = 300 + i * 50;
    if (sy + 50 > H - 80) return;
    els.push(rect(16, sy, W - 32, 42, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    // Status dot
    els.push(circle(32, sy + 21, 5, s.color, { opacity: 0.8 }));
    // Pulse ring
    els.push(circle(32, sy + 21, 9, s.color, { opacity: 0.12 }));
    els.push(text(46, sy + 16, s.name, 10.5, TEXT, { fw: 600 }));
    els.push(text(46, sy + 30, s.type, 8.5, SUB, { fw: 500, ls: 1 }));
    els.push(text(W - 28, sy + 16, s.events, 9, s.color, { anchor: 'end', fw: 700 }));
    els.push(text(W - 28, sy + 30, 'events', 8, SUB, { anchor: 'end', fw: 400 }));
  });

  // Version footer
  els.push(text(W / 2, H - 82, 'SPECTER v3.1.0 · build 20260411', 8, SUB, { anchor: 'middle', fw: 400, ls: 1, opacity: 0.5 }));

  els.push(...navBar(4));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE PEN FILE
// ═══════════════════════════════════════════════════════════════════════════
const screens = [
  { name: 'Threat Dashboard', fn: screen1 },
  { name: 'Threat Feeds', fn: screen2 },
  { name: 'Threat Hunt', fn: screen3 },
  { name: 'Intel — APT Profile', fn: screen4 },
  { name: 'Incident Detail', fn: screen5 },
  { name: 'Ops Console', fn: screen6 },
];

let totalElements = 0;
const penScreens = screens.map(s => {
  const elements = s.fn();
  totalElements += elements.length;
  return { name: s.name, svg: '', elements };
});

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 11,
    elements: totalElements,
    description: 'AI-powered cybersecurity threat intelligence platform — inspired by Panther/Vapi on darkmodedesign.com and bento grid trend from Saaspo. Dark + neon green SecOps aesthetic.',
  },
  screens: penScreens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
