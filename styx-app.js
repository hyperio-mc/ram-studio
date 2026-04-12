'use strict';
// styx-app.js
// STYX — AI Threat Intelligence & Security Operations
//
// Challenge: Design a dark AI security ops platform inspired by:
// 1. Evervault.com/customers (godly.website) — deep cosmic bg #010314, violet #6633EE accent,
//    cool off-white #DFE1F4 text, security-forward SaaS aesthetic
// 2. Superset.sh (darkmodedesign.com) — terminal-embedded live data feeds, parallel agent
//    orchestration, real-time activity panels baked into the hero UI
// 3. Darknode.io (Awwwards) — dark AI automation agency aesthetic, kinetic data streams
//
// Palette: Cosmic near-black + Evervault violet + electric blue signal system
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette (Evervault-inspired) ─────────────────────────────────────────────
const P = {
  bg:       '#010314',   // Evervault cosmic near-black
  surface:  '#080C24',   // slightly lighter card bg
  surface2: '#0E1230',   // elevated card
  surface3: '#131732',   // deepest elevated panel
  border:   '#1A1F42',   // subtle border
  border2:  '#242A55',   // active border
  muted:    '#5E6077',   // secondary text
  muted2:   '#9FA2B9',   // tertiary
  fg:       '#DFE1F4',   // Evervault cool off-white
  accent:   '#6633EE',   // Evervault violet — primary brand
  accent2:  '#8B5CF6',   // lighter violet
  blue:     '#4F7CFF',   // electric blue — secondary signal
  cyan:     '#00D4FF',   // live/active indicator
  green:    '#10B981',   // safe / resolved
  amber:    '#F59E0B',   // warning / medium
  red:      '#EF4444',   // critical / high
  dimAccent:'#6633EE22', // ghost accent fill
};

let _id = 0;
const uid = () => `sx${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill ?? P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Glow halos (Evervault-style) ──────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*3,   cy - r*3,   r*6,   r*6,   color + '05'),
  E(cx - r*2,   cy - r*2,   r*4,   r*4,   color + '0A'),
  E(cx - r*1.2, cy - r*1.2, r*2.4, r*2.4, color + '14'),
  E(cx - r*0.6, cy - r*0.6, r*1.2, r*1.2, color + '1F'),
];

// ── Severity dot ──────────────────────────────────────────────────────────────
const Dot = (x, y, r, color) => E(x - r/2, y - r/2, r, r, color);

// ── Severity badge ────────────────────────────────────────────────────────────
const Badge = (x, y, label, color, bgAlpha = '22') => {
  const w = label.length * 5.5 + 16;
  return F(x, y, w, 18, color + bgAlpha, {
    r: 4,
    stroke: color + '55',
    ch: [T(label, 0, 0, w, 18, { size: 8, weight: 700, fill: color, align: 'center', ls: 0.8 })],
  });
};

// ── Terminal row (Superset-inspired live feed item) ───────────────────────────
const TermRow = (x, y, time, label, msg, color = P.muted2) =>
  F(x, y, 350, 16, 'transparent', { ch: [
    T(time,  0, 0,  48, 16, { size: 9, fill: P.muted, weight: 400 }),
    Dot(56, 8, 5, color),
    T(label, 62, 0,  72, 16, { size: 9, fill: color, weight: 600 }),
    T(msg,   138, 0, 212, 16, { size: 9, fill: P.muted2, weight: 400 }),
  ]});

// ── Mini bar ──────────────────────────────────────────────────────────────────
const Bar = (x, y, w, h, pct, fill) => F(x, y, w, h, P.surface2, {
  r: 3, ch: [F(0, 0, Math.round(w * pct), h, fill, { r: 3 })],
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Command Center (Threat Overview Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  const W = 390, H = 844;
  const ch = [];

  // Cosmic glow backdrop — centered accent glow
  ch.push(...Glow(195, 380, 180, P.accent));
  ch.push(...Glow(60, 120, 80, P.blue));

  // Status bar
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }));
  ch.push(T('STYX', W/2-24, 14, 48, 16, { size: 11, weight: 800, fill: P.accent, ls: 2, align: 'center' }));
  ch.push(T('●●●', W-68, 16, 52, 12, { size: 9, fill: P.muted, align: 'right' }));

  // Header
  ch.push(T('Command', 20, 44, 200, 28, { size: 22, weight: 800 }));
  ch.push(T('Center', 20, 68, 200, 24, { size: 22, weight: 800, fill: P.accent }));
  ch.push(T('System alert level: ELEVATED', 20, 96, 220, 14, { size: 10, fill: P.amber, weight: 600 }));

  // Live indicator
  ch.push(Dot(W - 52, 60, 7, P.cyan));
  ch.push(T('LIVE', W - 42, 56, 32, 14, { size: 9, weight: 700, fill: P.cyan, ls: 1 }));

  // ── Risk Gauge card ─────────────────────────────────────────────────────────
  const gaugeCard = F(20, 116, 350, 110, P.surface, {
    r: 14, stroke: P.border,
    ch: [
      T('THREAT INDEX', 16, 12, 140, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }),
      // Big score
      T('74', 16, 28, 80, 52, { size: 46, weight: 900, fill: P.amber }),
      T('/100', 64, 58, 44, 16, { size: 12, weight: 600, fill: P.muted }),
      T('ELEVATED RISK', 16, 84, 120, 14, { size: 9, weight: 700, fill: P.amber, ls: 0.8 }),
      // Bar chart on right
      ...([
        ['M', P.muted, 0.15],
        ['T', P.muted, 0.28],
        ['W', P.amber, 0.55],
        ['T', P.red,   0.74],
        ['F', P.amber, 0.60],
        ['S', P.muted, 0.32],
        ['S', P.muted, 0.20],
      ].map(([label, color, pct], i) => {
        const bx = 190 + i * 24;
        const bh = Math.round(50 * pct);
        return [
          F(bx, 40 - bh + 50, 14, bh, color + 'AA', { r: 3 }),
          T(label, bx, 92, 14, 10, { size: 7, fill: P.muted, align: 'center' }),
        ];
      }).flat()),
      T('7-day trend', 196, 14, 100, 12, { size: 8, fill: P.muted }),
      // Today marker
      T('↑ TODAY', 280, 14, 52, 12, { size: 7, weight: 700, fill: P.red, align: 'right' }),
    ],
  });
  ch.push(gaugeCard);

  // ── Metric grid ─────────────────────────────────────────────────────────────
  const metrics = [
    { label: 'ACTIVE\nTHREATS',    val: '23',   delta: '+5', dc: P.red,   x: 20  },
    { label: 'BLOCKED\nTODAY',     val: '1,847', delta: '+12%', dc: P.green, x: 112 },
    { label: 'MEAN DETECT\nTIME',  val: '4.2s',  delta: '-18%', dc: P.green, x: 218 },
    { label: 'OPEN\nINCIDENTS',    val: '7',    delta: '+2', dc: P.amber, x: 316 },
  ];

  metrics.forEach(m => {
    const mw = 80, mh = 72;
    ch.push(F(m.x, 240, mw, mh, P.surface, {
      r: 10, stroke: P.border,
      ch: [
        T(m.label, 8, 8, mw-16, 22, { size: 7, weight: 700, fill: P.muted, ls: 0.5, lh: 1.4 }),
        T(m.val,   8, 34, mw-16, 22, { size: m.val.length > 3 ? 14 : 18, weight: 900, fill: P.fg }),
        T(m.delta, 8, 56, mw-16, 12, { size: 9, weight: 700, fill: m.dc }),
      ],
    }));
  });

  // ── Live terminal feed ───────────────────────────────────────────────────────
  ch.push(F(20, 326, 350, 168, P.surface, {
    r: 14, stroke: P.border, clip: true,
    ch: [
      // Terminal header
      F(0, 0, 350, 30, P.surface2, {
        r: 14, clip: true,
        ch: [
          F(0, 14, 350, 16, P.surface2, {}),
          E(12, 10, 9, 9, P.red + 'AA'),
          E(26, 10, 9, 9, P.amber + 'AA'),
          E(40, 10, 9, 9, P.green + 'AA'),
          T('styx@intel ~ threat-monitor --live', 58, 9, 240, 14, { size: 9, fill: P.muted, weight: 400 }),
        ],
      }),
      // Terminal rows
      TermRow(14, 40, '09:41:22', 'CRITICAL', 'Brute force detected — 10.4.2.17', P.red),
      TermRow(14, 60, '09:41:18', 'HIGH    ', 'SQL injection attempt blocked',     P.amber),
      TermRow(14, 80, '09:41:14', 'MEDIUM  ', 'Anomalous data exfil pattern',       P.amber),
      TermRow(14, 100,'09:41:09', 'BLOCKED ', 'TOR exit node connection dropped',   P.green),
      TermRow(14, 120,'09:41:05', 'INFO    ', 'AI model updated threat signatures', P.blue),
      TermRow(14, 140,'09:41:01', 'BLOCKED ', 'CVE-2025-1134 exploit attempt',      P.green),
      // blinking cursor line
      T('▋', 14, 158, 8, 10, { size: 9, fill: P.accent }),
    ],
  }));

  // ── Quick action chips ───────────────────────────────────────────────────────
  const actions = ['Investigate', 'Run Playbook', 'Isolate Host', 'Report'];
  actions.forEach((a, i) => {
    const aw = a.length * 6.2 + 20;
    const ax = i < 2 ? (i === 0 ? 20 : 118) : (i === 2 ? 236 : 330);
    ch.push(F(ax, 508, aw, 28, i === 0 ? P.accent : P.surface, {
      r: 8,
      stroke: i === 0 ? P.accent : P.border2,
      ch: [T(a, 0, 0, aw, 28, { size: 10, weight: 600, fill: i === 0 ? '#FFF' : P.fg, align: 'center' })],
    }));
  });

  // ── AI Insight card ──────────────────────────────────────────────────────────
  ch.push(F(20, 550, 350, 80, P.accent + '15', {
    r: 14, stroke: P.accent + '40',
    ch: [
      T('AI INSIGHT', 14, 10, 80, 12, { size: 8, weight: 700, fill: P.accent, ls: 1.5 }),
      T('Coordinated attack from 3 IPs', 14, 26, 290, 16, { size: 13, weight: 700, fill: P.fg }),
      T('Pattern matches LAPSUS$ TTPs. 89% confidence. Recommend activating\nPlaybook #7 — Coordinated Intrusion Response.', 14, 44, 322, 30, { size: 9.5, fill: P.muted2, lh: 1.6 }),
    ],
  }));

  // ── Bottom nav ───────────────────────────────────────────────────────────────
  ch.push(F(0, 784, 390, 60, P.surface, {
    stroke: P.border,
    ch: [
      ...['⌬', '◉', '⊛', '▦', '◈'].map((icon, i) => {
        const nx = 15 + i * 72;
        const labels = ['Home', 'Threats', 'Incidents', 'Playbooks', 'Intel'];
        const active = i === 0;
        return F(nx, 6, 60, 48, 'transparent', {
          ch: [
            T(icon, 0, 4, 60, 20, { size: 18, fill: active ? P.accent : P.muted, align: 'center' }),
            T(labels[i], 0, 28, 60, 14, { size: 8, weight: active ? 700 : 400, fill: active ? P.accent : P.muted, align: 'center' }),
          ],
        });
      }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Threat Feed (Real-time Intelligence Stream)
// ═══════════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(...Glow(320, 200, 100, P.red));
  ch.push(...Glow(50, 600, 80, P.accent));

  // Status bar
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }));
  ch.push(T('STYX', W/2-24, 14, 48, 16, { size: 11, weight: 800, fill: P.accent, ls: 2, align: 'center' }));
  ch.push(Dot(W - 28, 20, 7, P.cyan));

  // Header
  ch.push(T('Threat Feed', 20, 44, 220, 28, { size: 22, weight: 800 }));
  ch.push(T('1,847 events in last 24h', 20, 72, 200, 14, { size: 11, fill: P.muted2 }));

  // Filter chips
  const filters = [
    { label: 'All',       active: true,  color: P.accent },
    { label: 'Critical',  active: false, color: P.red },
    { label: 'High',      active: false, color: P.amber },
    { label: 'Blocked',   active: false, color: P.green },
    { label: 'AI Only',   active: false, color: P.accent2 },
  ];
  let fx = 20;
  filters.forEach(f => {
    const fw = f.label.length * 6.5 + 20;
    ch.push(F(fx, 96, fw, 24, f.active ? f.color : P.surface, {
      r: 12, stroke: f.active ? f.color : P.border,
      ch: [T(f.label, 0, 0, fw, 24, { size: 9, weight: 600, fill: f.active ? '#FFF' : P.muted2, align: 'center' })],
    }));
    fx += fw + 8;
  });

  // Threat feed items
  const threats = [
    {
      time: '09:41', severity: 'CRITICAL', color: P.red,
      title: 'Brute Force — SSH', src: '10.4.2.17 → prod-db-01',
      detail: 'AI: LAPSUS$ pattern match (89%) — 340 attempts in 2 min',
      ip: '10.4.2.17', country: '🇷🇺 RU', blocked: true,
    },
    {
      time: '09:41', severity: 'HIGH', color: P.amber,
      title: 'SQL Injection Attempt', src: '45.33.102.4 → api.styx.io',
      detail: 'Payload: UNION SELECT — Web App Firewall blocked. CVE-2025-0891',
      ip: '45.33.102.4', country: '🇨🇳 CN', blocked: true,
    },
    {
      time: '09:40', severity: 'HIGH', color: P.amber,
      title: 'Data Exfil Pattern', src: 'user_acct_448 → external',
      detail: '14.2 MB transferred to unknown endpoint in 90s. Insider risk score: 87',
      ip: 'internal', country: '—', blocked: false,
    },
    {
      time: '09:39', severity: 'MEDIUM', color: P.blue,
      title: 'Port Scan Detected', src: '192.168.0.0/24',
      detail: 'Full sweep of internal subnet. Attrib: lateral movement post-compromise',
      ip: '10.0.0.44', country: '—', blocked: false,
    },
    {
      time: '09:38', severity: 'BLOCKED', color: P.green,
      title: 'TOR Node Connection', src: '185.220.101.x → VPN',
      detail: 'Known TOR exit node. Auto-dropped by perimeter rule #44. Clean.',
      ip: '185.220.101.22', country: '🌐 TOR', blocked: true,
    },
    {
      time: '09:37', severity: 'BLOCKED', color: P.green,
      title: 'CVE-2025-1134 Exploit', src: '103.12.88.5 → /api/auth',
      detail: 'Remote code execution attempt. Patched — signature caught. Blocked.',
      ip: '103.12.88.5', country: '🇧🇷 BR', blocked: true,
    },
  ];

  threats.forEach((t, i) => {
    const ty = 132 + i * 102;
    if (ty + 100 > H - 70) return;
    const cardH = 92;
    ch.push(F(20, ty, 350, cardH, P.surface, {
      r: 12, stroke: t.blocked ? P.border : t.color + '40',
      ch: [
        // Left severity bar
        F(0, 0, 3, cardH, t.color, { r: 3 }),
        // Content
        T(t.time, 14, 8, 40, 12, { size: 9, fill: P.muted }),
        Badge(58, 6, t.severity, t.color),
        T(t.blocked ? '✓ BLOCKED' : '◉ ACTIVE', t.blocked ? 270 : 276, 8, 66, 12, {
          size: 8, weight: 700, fill: t.blocked ? P.green : P.red, align: 'right',
        }),
        T(t.title, 14, 24, 280, 16, { size: 13, weight: 700, fill: P.fg }),
        T(t.src,   14, 42, 300, 12, { size: 9, fill: P.muted2 }),
        T(t.detail, 14, 57, 320, 26, { size: 9, fill: P.muted, lh: 1.5 }),
        // Country flag
        T(t.country, 310, 42, 32, 12, { size: 9, fill: P.muted, align: 'right' }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, 784, 390, 60, P.surface, {
    stroke: P.border,
    ch: [
      ...['⌬', '◉', '⊛', '▦', '◈'].map((icon, i) => {
        const nx = 15 + i * 72;
        const labels = ['Home', 'Threats', 'Incidents', 'Playbooks', 'Intel'];
        const active = i === 1;
        return F(nx, 6, 60, 48, 'transparent', {
          ch: [
            T(icon, 0, 4, 60, 20, { size: 18, fill: active ? P.accent : P.muted, align: 'center' }),
            T(labels[i], 0, 28, 60, 14, { size: 8, weight: active ? 700 : 400, fill: active ? P.accent : P.muted, align: 'center' }),
          ],
        });
      }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 410, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Incident Detail (Deep dive: INC-2024-0847)
// ═══════════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(...Glow(200, 300, 150, P.red));

  // Status bar + back
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }));
  ch.push(T('← Threats', 20, 44, 80, 16, { size: 11, fill: P.accent }));

  // Incident header
  ch.push(F(20, 68, 350, 56, P.surface, {
    r: 12, stroke: P.red + '55',
    ch: [
      F(0, 0, 3, 56, P.red, { r: 3 }),
      T('INC-2024-0847', 14, 8, 200, 14, { size: 9, weight: 700, fill: P.muted, ls: 0.8 }),
      Badge(14, 26, 'CRITICAL', P.red),
      T('ACTIVE', 280, 26, 60, 16, { size: 9, weight: 700, fill: P.red, align: 'right' }),
      T('Brute Force — SSH Production DB', 14, 40, 310, 14, { size: 11, fill: P.fg }),
    ],
  }));

  // Timeline + detail section
  ch.push(T('ATTACK TIMELINE', 20, 138, 160, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }));

  const timeline = [
    { time: '09:39:14', event: 'First login attempt detected', type: 'start',  color: P.amber },
    { time: '09:39:52', event: 'Rate exceeds 50 req/min threshold', type: 'escalate', color: P.amber },
    { time: '09:40:18', event: 'AI flagged LAPSUS$ signature pattern', type: 'ai',  color: P.accent },
    { time: '09:41:02', event: 'Auto-isolated host prod-db-01', type: 'action', color: P.blue },
    { time: '09:41:10', event: 'SOC analyst notified (PagerDuty)', type: 'notify', color: P.green },
  ];

  timeline.forEach((ev, i) => {
    const ty = 156 + i * 54;
    // Timeline line
    if (i < timeline.length - 1) ch.push(F(36, ty + 20, 2, 34, P.border, {}));
    // Dot
    ch.push(Dot(37, ty + 10, 10, ev.color));
    // Content
    ch.push(T(ev.time, 54, ty + 3, 80, 12, { size: 8, fill: P.muted }));
    ch.push(T(ev.event, 54, ty + 17, 296, 14, { size: 11, fill: P.fg }));
  });

  // Attacker intel section
  const attackerY = 440;
  ch.push(T('ATTACKER PROFILE', 20, attackerY, 160, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }));
  ch.push(F(20, attackerY + 16, 350, 100, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('Origin IP', 14, 12, 80, 12, { size: 9, fill: P.muted }),
      T('10.4.2.17', 110, 12, 100, 12, { size: 9, weight: 700, fill: P.fg }),
      T('🇷🇺 Moscow, RU', 220, 12, 120, 12, { size: 9, fill: P.muted2, align: 'right' }),
      Line(14, 28, 322),
      T('Attribution',   14, 34, 80, 12, { size: 9, fill: P.muted }),
      T('LAPSUS$ (89%)', 110, 34, 150, 12, { size: 9, weight: 700, fill: P.red }),
      Line(14, 50, 322),
      T('Attempts',   14, 56, 80, 12, { size: 9, fill: P.muted }),
      T('340 in 2 min', 110, 56, 120, 12, { size: 9, weight: 700, fill: P.amber }),
      Line(14, 72, 322),
      T('Reputation',   14, 78, 80, 12, { size: 9, fill: P.muted }),
      T('Known malicious — ThreatFox, Shodan', 110, 78, 220, 12, { size: 9, weight: 700, fill: P.red }),
    ],
  }));

  // Response actions
  ch.push(T('RESPONSE ACTIONS', 20, 558, 160, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }));
  const actions = [
    { label: 'View Playbook #7', primary: true },
    { label: 'Block IP Permanently', primary: false },
    { label: 'Forensic Snapshot', primary: false },
  ];
  actions.forEach((a, i) => {
    ch.push(F(20 + i * 116, 574, 106, 30, a.primary ? P.accent : P.surface, {
      r: 8, stroke: a.primary ? P.accent : P.border2,
      ch: [T(a.label, 0, 0, 106, 30, { size: 9, weight: 600, fill: a.primary ? '#FFF' : P.fg, align: 'center' })],
    }));
  });

  // AI Summary
  ch.push(F(20, 618, 350, 76, P.accent + '15', {
    r: 12, stroke: P.accent + '40',
    ch: [
      T('AI ANALYSIS', 14, 10, 100, 12, { size: 8, weight: 700, fill: P.accent, ls: 1.5 }),
      T('Coordinated intrusion attempt with high confidence attribution.', 14, 26, 320, 14, { size: 11, weight: 600, fill: P.fg }),
      T('Host prod-db-01 auto-isolated. No data breach detected. Playbook #7\nrecommended — estimated containment in < 4 minutes.', 14, 44, 320, 28, { size: 9.5, fill: P.muted2, lh: 1.55 }),
    ],
  }));

  // Bottom nav
  ch.push(F(0, 784, 390, 60, P.surface, {
    stroke: P.border,
    ch: [
      ...['⌬', '◉', '⊛', '▦', '◈'].map((icon, i) => {
        const nx = 15 + i * 72;
        const labels = ['Home', 'Threats', 'Incidents', 'Playbooks', 'Intel'];
        const active = i === 2;
        return F(nx, 6, 60, 48, 'transparent', {
          ch: [
            T(icon, 0, 4, 60, 20, { size: 18, fill: active ? P.accent : P.muted, align: 'center' }),
            T(labels[i], 0, 28, 60, 14, { size: 8, weight: active ? 700 : 400, fill: active ? P.accent : P.muted, align: 'center' }),
          ],
        });
      }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 820, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Playbooks (Automated Response Workflows)
// ═══════════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(...Glow(80, 250, 100, P.accent));
  ch.push(...Glow(330, 500, 80, P.blue));

  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }));
  ch.push(T('STYX', W/2-24, 14, 48, 16, { size: 11, weight: 800, fill: P.accent, ls: 2, align: 'center' }));

  ch.push(T('Playbooks', 20, 44, 220, 28, { size: 22, weight: 800 }));
  ch.push(T('12 active · 3 running now', 20, 72, 200, 14, { size: 11, fill: P.muted2 }));

  // Running indicator
  ch.push(F(220, 72, 130, 18, P.accent + '20', {
    r: 9, stroke: P.accent + '50',
    ch: [
      Dot(12, 9, 7, P.cyan),
      T('3 RUNNING', 22, 0, 100, 18, { size: 8, weight: 700, fill: P.cyan }),
    ],
  }));

  const playbooks = [
    {
      num: '#7', name: 'Coordinated Intrusion', status: 'RUNNING', statusColor: P.cyan,
      trigger: 'Brute force + attribution match',
      steps: ['Isolate host', 'Block IPs', 'Notify SOC', 'Forensic snapshot', 'Patch check'],
      progress: 0.6, lastRun: 'Running now', runs: 14,
    },
    {
      num: '#3', name: 'DDoS Mitigation', status: 'RUNNING', statusColor: P.cyan,
      trigger: 'Traffic > 10k req/s from ≥5 IPs',
      steps: ['Rate limit', 'GeoBlock', 'CDN shield', 'Alert NOC'],
      progress: 0.82, lastRun: 'Running now', runs: 28,
    },
    {
      num: '#11', name: 'Insider Threat', status: 'RUNNING', statusColor: P.cyan,
      trigger: 'Risk score > 80 + anomalous transfer',
      steps: ['Revoke token', 'Snapshot session', 'HR notification', 'Log preserve'],
      progress: 0.3, lastRun: 'Running now', runs: 3,
    },
    {
      num: '#2', name: 'Ransomware Containment', status: 'READY', statusColor: P.green,
      trigger: 'File encryption activity detected',
      steps: ['Network segment', 'Backup verify', 'IR team page', 'Forensic lock'],
      progress: 0, lastRun: '3 days ago', runs: 1,
    },
    {
      num: '#9', name: 'Phishing Response', status: 'READY', statusColor: P.green,
      trigger: 'User reported / sandbox detonation',
      steps: ['Quarantine email', 'Reset creds', 'Scan mailboxes', 'Block sender'],
      progress: 0, lastRun: '1 week ago', runs: 7,
    },
  ];

  playbooks.forEach((pb, i) => {
    const py = 104 + i * 130;
    if (py + 118 > H - 72) return;
    const cardH = 118;
    ch.push(F(20, py, 350, cardH, P.surface, {
      r: 12, stroke: pb.status === 'RUNNING' ? P.accent + '55' : P.border,
      ch: [
        // Left accent bar
        F(0, 0, 3, cardH, pb.status === 'RUNNING' ? P.cyan : P.border2, { r: 3 }),
        T(pb.num, 14, 10, 30, 14, { size: 10, weight: 800, fill: P.accent }),
        T(pb.name, 46, 10, 210, 14, { size: 12, weight: 700, fill: P.fg }),
        Badge(264, 8, pb.status, pb.statusColor),
        T('Trigger: ' + pb.trigger, 14, 28, 320, 12, { size: 9, fill: P.muted }),
        // Steps
        ...(pb.steps.slice(0, 4).map((s, si) => {
          const done = pb.status === 'RUNNING' && si < Math.round(pb.steps.length * pb.progress);
          return F(14 + si * 80, 46, 74, 22, done ? P.green + '22' : P.surface2, {
            r: 6, stroke: done ? P.green + '55' : P.border,
            ch: [T((done ? '✓ ' : '') + s, 4, 0, 66, 22, { size: 8, weight: done ? 600 : 400, fill: done ? P.green : P.muted2 })],
          });
        })),
        // Progress bar (if running)
        ...(pb.status === 'RUNNING' ? [
          T(`${Math.round(pb.progress * 100)}% complete`, 14, 76, 100, 12, { size: 8, fill: P.muted }),
          Bar(14, 90, 280, 6, pb.progress, P.cyan),
          T('LIVE', 300, 88, 40, 10, { size: 8, weight: 700, fill: P.cyan }),
        ] : [
          T('Last run: ' + pb.lastRun + ' · ' + pb.runs + ' total runs', 14, 86, 250, 12, { size: 8, fill: P.muted }),
        ]),
        // Runs count
        T(pb.runs + ' runs', 310, 10, 36, 12, { size: 8, fill: P.muted, align: 'right' }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, 784, 390, 60, P.surface, {
    stroke: P.border,
    ch: [
      ...['⌬', '◉', '⊛', '▦', '◈'].map((icon, i) => {
        const nx = 15 + i * 72;
        const labels = ['Home', 'Threats', 'Incidents', 'Playbooks', 'Intel'];
        const active = i === 3;
        return F(nx, 6, 60, 48, 'transparent', {
          ch: [
            T(icon, 0, 4, 60, 20, { size: 18, fill: active ? P.accent : P.muted, align: 'center' }),
            T(labels[i], 0, 28, 60, 14, { size: 8, weight: active ? 700 : 400, fill: active ? P.accent : P.muted, align: 'center' }),
          ],
        });
      }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 1230, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Threat Intelligence (Actor Profiles + Coverage Map)
// ═══════════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(...Glow(200, 200, 160, P.accent));

  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }));
  ch.push(T('STYX', W/2-24, 14, 48, 16, { size: 11, weight: 800, fill: P.accent, ls: 2, align: 'center' }));

  ch.push(T('Threat Intel', 20, 44, 220, 28, { size: 22, weight: 800 }));
  ch.push(T('AI-curated actor database · 1,240 IOCs', 20, 72, 280, 14, { size: 11, fill: P.muted2 }));

  // Coverage stats row
  const statsRow = [
    { val: '47', label: 'Actors\nTracked' },
    { val: '1,240', label: 'IOCs\nActive' },
    { val: '99.7%', label: 'Signature\nCoverage' },
    { val: '4.2s', label: 'Avg Detect\nTime' },
  ];
  statsRow.forEach((s, i) => {
    const sw = 78;
    ch.push(F(20 + i * 90, 96, sw, 60, P.surface, {
      r: 10, stroke: P.border,
      ch: [
        T(s.val, 0, 10, sw, 24, { size: 18, weight: 900, fill: P.fg, align: 'center' }),
        T(s.label, 4, 36, sw - 8, 22, { size: 7.5, fill: P.muted, align: 'center', lh: 1.4 }),
      ],
    }));
  });

  // ── Threat Actor cards ───────────────────────────────────────────────────────
  ch.push(T('TRACKED ACTORS', 20, 168, 200, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }));

  const actors = [
    {
      name: 'LAPSUS$',      origin: '🇧🇷 Brazil',  threat: 94, color: P.red,
      tags: ['Data theft', 'Social eng', 'Corp targets'],
      desc: 'Financially motivated. Targets tech & telecom. Recent: 23 campaigns.',
      iocs: 84, confidence: '98%',
    },
    {
      name: 'Scattered Spider', origin: '🌐 US/UK',  threat: 88, color: P.amber,
      tags: ['BEC', 'SIM swap', 'Ransomware'],
      desc: 'Native English social engineering. High corp impact. 12 active campaigns.',
      iocs: 62, confidence: '91%',
    },
    {
      name: 'APT-41',       origin: '🇨🇳 China',   threat: 96, color: P.red,
      tags: ['Espionage', 'IP theft', 'Gov targets'],
      desc: 'State-sponsored dual nexus espionage & financially motivated ops.',
      iocs: 214, confidence: '87%',
    },
    {
      name: 'Midnight Blizzard', origin: '🇷🇺 Russia', threat: 99, color: P.red,
      tags: ['Espionage', 'Credential', 'Supply chain'],
      desc: 'SVR-linked. Persistent access to diplomatic & NGO targets.',
      iocs: 198, confidence: '94%',
    },
  ];

  actors.forEach((a, i) => {
    const ay = 186 + i * 138;
    if (ay + 126 > H - 72) return;
    ch.push(F(20, ay, 350, 126, P.surface, {
      r: 12, stroke: a.threat >= 90 ? a.color + '40' : P.border,
      ch: [
        // Threat score bar on left
        F(0, 0, 3, 126, a.color + 'AA', { r: 3 }),
        // Actor info
        T(a.name, 14, 10, 180, 15, { size: 13, weight: 800, fill: P.fg }),
        T(a.origin, 14, 28, 100, 12, { size: 9, fill: P.muted2 }),
        // Threat score gauge
        T('THREAT', 270, 10, 66, 10, { size: 7, weight: 700, fill: P.muted, ls: 1 }),
        T(String(a.threat), 270, 22, 66, 20, { size: 18, weight: 900, fill: a.color }),
        T('/100', 304, 34, 28, 12, { size: 9, fill: P.muted }),
        // Tags
        ...(a.tags.map((tag, ti) => {
          const tw = tag.length * 5.5 + 14;
          const tx = 14 + [0, 72, 164][ti] || 14 + ti * 80;
          return Badge(tx, 46, tag, a.color, '18');
        })),
        // Description
        T(a.desc, 14, 72, 320, 26, { size: 9.5, fill: P.muted2, lh: 1.55 }),
        // IOC count
        T(a.iocs + ' IOCs', 14, 102, 60, 12, { size: 8, fill: P.muted }),
        T('Confidence: ' + a.confidence, 80, 102, 120, 12, { size: 8, fill: P.green }),
        T('View Profile →', 296, 102, 50, 12, { size: 8, fill: P.accent, align: 'right' }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, 784, 390, 60, P.surface, {
    stroke: P.border,
    ch: [
      ...['⌬', '◉', '⊛', '▦', '◈'].map((icon, i) => {
        const nx = 15 + i * 72;
        const labels = ['Home', 'Threats', 'Incidents', 'Playbooks', 'Intel'];
        const active = i === 4;
        return F(nx, 6, 60, 48, 'transparent', {
          ch: [
            T(icon, 0, 4, 60, 20, { size: 18, fill: active ? P.accent : P.muted, align: 'center' }),
            T(labels[i], 0, 28, 60, 14, { size: 8, weight: active ? 700 : 400, fill: active ? P.accent : P.muted, align: 'center' }),
          ],
        });
      }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 1640, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 2030,
  height: 844,
  fill: '#000000',
  children: [
    buildScreen1(),
    buildScreen2(),
    buildScreen3(),
    buildScreen4(),
    buildScreen5(),
  ],
};

const out = path.join(__dirname, 'styx.pen');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log('✓ styx.pen written —', doc.children.length, 'screens');
doc.children.forEach((s, i) => console.log(`  Screen ${i+1}: ${s.children?.length || 0} elements`));
