// PRISM — Unified Threat Intelligence
// Dark theme: deep navy + electric cyan + amber alerts
// Inspired by: Tracebit ("Assume Breach") on land-book.com + dark security UIs on darkmodedesign.com
// Monospace data type, dense card layout, threat-score ring

const fs = require('fs');

// ─── PALETTE ───────────────────────────────────────────────────────────
const P = {
  bg:       '#080A0F',   // deepest navy
  surface:  '#0E1118',   // card bg
  surface2: '#141824',   // elevated card
  border:   '#1E2535',   // subtle divider
  cyan:     '#00E8D6',   // electric accent
  cyanDim:  '#00E8D620', // transparent cyan
  amber:    '#F59E0B',   // warning
  red:      '#EF4444',   // critical
  green:    '#22C55E',   // safe
  text:     '#E8EAF2',   // primary text
  muted:    '#5A6380',   // muted
  dim:      '#2A3048',   // very dim
};

let idCounter = 100;
const uid = () => `p${idCounter++}`;

// ─── HELPERS ───────────────────────────────────────────────────────────
function frame(x, y, w, h, fill, children = [], extra = {}) {
  return { id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: false, children, ...extra };
}

function text(content, x, y, w, h, size, weight, color, extra = {}) {
  return {
    id: uid(), type: 'text', content,
    x, y, width: w, height: h,
    textGrowth: 'fixed-width-height',
    fontSize: size, fontWeight: weight, fill: color,
    textAlign: 'left', ...extra
  };
}

function rect(x, y, w, h, fill, extra = {}) {
  return { id: uid(), type: 'rectangle', x, y, width: w, height: h, fill, ...extra };
}

function pill(x, y, w, h, label, fillBg, fillText, fontSize = 9) {
  return frame(x, y, w, h, fillBg, [
    text(label, 0, 0, w, h, fontSize, '600', fillText, { textAlign: 'center', letterSpacing: 0.8 })
  ], { cornerRadius: h / 2 });
}

function statusBar(fill) {
  return frame(0, 0, 390, 44, fill, [
    text('9:41', 16, 14, 50, 16, 12, '600', P.text, { textAlign: 'left' }),
    text('●●●  ▲▲  ▐', 306, 15, 68, 14, 9, '400', P.muted, { textAlign: 'right' }),
  ]);
}

function navBar(fill, activeLabel) {
  const tabs = [
    { label: 'Command', icon: '⬡' },
    { label: 'Events',  icon: '≡' },
    { label: 'Assets',  icon: '◫' },
    { label: 'Intel',   icon: '◈' },
    { label: 'Profile', icon: '○' },
  ];
  const children = [];
  // top border line
  children.push(rect(0, 0, 390, 1, P.border));
  tabs.forEach((t, i) => {
    const x = i * 78;
    const isActive = t.label === activeLabel;
    if (isActive) {
      children.push(rect(x, 0, 78, 1, P.cyan));
    }
    children.push(text(t.icon, x, 8, 78, 16, 14, isActive ? '700' : '400',
      isActive ? P.cyan : P.muted, { textAlign: 'center' }));
    children.push(text(t.label, x, 26, 78, 12, 8, isActive ? '700' : '400',
      isActive ? P.cyan : P.muted, { textAlign: 'center', letterSpacing: 0.5 }));
  });
  return frame(0, 844 - 60, 390, 60, fill, children);
}

function divider(y) {
  return rect(0, y, 390, 1, P.border);
}

function metricCard(x, y, w, h, label, value, sub, valueColor = P.text) {
  return frame(x, y, w, h, P.surface2, [
    text(label, 12, 10, w - 24, 11, 8, '600', P.muted, { letterSpacing: 1.2 }),
    text(value, 12, 26, w - 24, 30, 24, '700', valueColor, { letterSpacing: -0.5 }),
    text(sub,   12, 58, w - 24, 11, 8, '400', P.muted),
  ], { cornerRadius: 10, stroke: { align: 'inside', thickness: 1, fill: P.border } });
}

// ─── SCREEN 1: COMMAND CENTER ──────────────────────────────────────────
function screen1() {
  const children = [];

  children.push(statusBar(P.bg));

  // Header
  children.push(text('PRISM', 20, 52, 140, 22, 14, '700', P.cyan, { letterSpacing: 4 }));
  children.push(text('Threat Intelligence', 20, 74, 200, 14, 10, '400', P.muted));

  // Notification badge
  children.push(frame(350, 52, 24, 24, P.red + '22', [
    text('3', 0, 3, 24, 18, 11, '700', P.red, { textAlign: 'center' }),
  ], { cornerRadius: 12 }));

  // Threat Score Ring (simulated with concentric frames)
  const ringCx = 195, ringY = 108;
  // outer ring bg
  children.push(frame(ringCx - 64, ringY, 128, 128, P.surface2, [
    // Ring decoration
    rect(0, 0, 128, 1, P.cyan + '30'),
    rect(0, 127, 128, 1, P.cyan + '30'),
    // Score value
    text('72', 14, 32, 100, 52, 44, '700', P.amber, { textAlign: 'center', letterSpacing: -2 }),
    text('THREAT SCORE', 4, 90, 120, 12, 8, '700', P.muted, { textAlign: 'center', letterSpacing: 1.5 }),
    text('ELEVATED', 4, 106, 120, 14, 9, '600', P.amber, { textAlign: 'center', letterSpacing: 2 }),
  ], { cornerRadius: 64, stroke: { align: 'inside', thickness: 2, fill: P.amber + '50' } }));

  // Inner ring (progress indicator effect)
  children.push(frame(ringCx - 52, ringY + 12, 104, 104, 'transparent', [
    rect(0, 0, 104, 1, P.amber + '40'),
  ], { cornerRadius: 52, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  // 3 metric cards row
  const cardY = 252;
  children.push(metricCard(20, cardY, 108, 76, 'ACTIVE ALERTS', '17', '+4 last hour', P.red));
  children.push(metricCard(140, cardY, 110, 76, 'OPEN INCIDENTS', '5', '2 critical', P.amber));
  children.push(metricCard(262, cardY, 108, 76, 'ASSETS SAFE', '98.2%', '240 monitored', P.green));

  // Live feed section
  children.push(text('LIVE EVENT FEED', 20, 346, 200, 12, 9, '700', P.muted, { letterSpacing: 2 }));
  children.push(frame(340, 342, 30, 16, P.red + '22', [
    text('LIVE', 0, 0, 30, 16, 7, '700', P.red, { textAlign: 'center', letterSpacing: 1 }),
  ], { cornerRadius: 4 }));

  // Event rows
  const events = [
    { sev: 'CRIT', col: P.red,   title: 'Lateral movement detected', src: 'host-db-04', time: '00:42' },
    { sev: 'HIGH', col: P.amber, title: 'Privilege escalation attempt', src: 'svc-api-prod', time: '02:18' },
    { sev: 'HIGH', col: P.amber, title: 'Unusual outbound data volume', src: '10.0.4.22', time: '05:31' },
    { sev: 'MED',  col: '#8B5CF6', title: 'Failed MFA × 12 attempts', src: 'user: m.chen@', time: '08:55' },
    { sev: 'LOW',  col: P.muted, title: 'Config drift — firewall rule', src: 'fw-edge-01', time: '11:20' },
  ];

  events.forEach((ev, i) => {
    const ey = 368 + i * 56;
    // row bg
    children.push(frame(20, ey, 350, 48, i % 2 === 0 ? P.surface : 'transparent', [
      // sev pill
      frame(0, 10, 36, 14, ev.col + '22', [
        text(ev.sev, 0, 0, 36, 14, 7, '700', ev.col, { textAlign: 'center', letterSpacing: 0.8 }),
      ], { cornerRadius: 4 }),
      text(ev.title, 44, 8, 220, 13, 11, '600', P.text),
      text(ev.src,   44, 26, 220, 11, 9,  '400', P.muted),
      text(ev.time + 's ago', 278, 8, 64, 12, 9, '400', P.muted, { textAlign: 'right' }),
      // dot
      frame(302, 22, 8, 8, ev.col, [], { cornerRadius: 4 }),
    ], { cornerRadius: 8 }));
  });

  children.push(navBar(P.bg, 'Command'));

  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── SCREEN 2: EVENT STREAM ────────────────────────────────────────────
function screen2() {
  const children = [];

  children.push(statusBar(P.bg));

  // Header
  children.push(text('EVENT STREAM', 20, 54, 250, 20, 14, '700', P.text, { letterSpacing: 3 }));
  children.push(text('Real-time security events', 20, 75, 200, 13, 10, '400', P.muted));

  // Filter chips
  const chips = [
    { label: 'All Events', active: true },
    { label: 'Critical', active: false },
    { label: 'High', active: false },
    { label: 'Anomaly', active: false },
  ];
  let cx = 20;
  chips.forEach(ch => {
    const cw = ch.label.length * 7 + 20;
    children.push(frame(cx, 100, cw, 24, ch.active ? P.cyan : P.surface2, [
      text(ch.label, 0, 0, cw, 24, 9, ch.active ? '700' : '500',
        ch.active ? P.bg : P.muted, { textAlign: 'center', letterSpacing: 0.5 }),
    ], { cornerRadius: 12, stroke: ch.active ? undefined : { align: 'inside', thickness: 1, fill: P.border } }));
    cx += cw + 8;
  });

  // Search bar
  children.push(frame(20, 134, 350, 36, P.surface2, [
    text('⌕', 12, 9, 20, 18, 14, '400', P.muted),
    text('Search events, IPs, users...', 36, 9, 280, 18, 11, '400', P.muted),
  ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  // Time group label
  children.push(text('TODAY · 09:41 UTC', 20, 182, 200, 12, 8, '700', P.muted, { letterSpacing: 2 }));

  // Detailed event rows
  const evts = [
    {
      sev: 'CRITICAL', col: P.red, icon: '▲',
      title: 'Lateral Movement — East-West',
      detail: 'host-db-04 → host-int-17 via SMB',
      meta: 'MITRE: T1021.002  ·  09:42',
      score: '98',
    },
    {
      sev: 'HIGH', col: P.amber, icon: '●',
      title: 'Privilege Escalation Attempt',
      detail: 'svc-api-prod  sudo → root (blocked)',
      meta: 'MITRE: T1548.003  ·  09:39',
      score: '84',
    },
    {
      sev: 'HIGH', col: P.amber, icon: '●',
      title: 'Anomalous Outbound Transfer',
      detail: '10.0.4.22 → 185.220.x.x  2.4 GB',
      meta: 'Geo: RU  ·  09:36',
      score: '81',
    },
    {
      sev: 'MEDIUM', col: '#8B5CF6', icon: '◆',
      title: 'MFA Brute Force  ×12',
      detail: 'm.chen@acme.io  from 3 IPs',
      meta: 'Auth: OKTA  ·  09:33',
      score: '61',
    },
    {
      sev: 'MEDIUM', col: '#8B5CF6', icon: '◆',
      title: 'New Admin Account Created',
      detail: 'admin_svc_temp — unreviewed',
      meta: 'IAM  ·  09:28',
      score: '58',
    },
    {
      sev: 'LOW', col: P.muted, icon: '○',
      title: 'Firewall Rule Config Drift',
      detail: 'fw-edge-01  port 8443 opened',
      meta: 'Network  ·  09:22',
      score: '31',
    },
  ];

  evts.forEach((ev, i) => {
    const ey = 206 + i * 84;
    children.push(frame(20, ey, 350, 76, P.surface, [
      // left accent bar
      rect(0, 0, 3, 76, ev.col),
      // sev
      frame(12, 10, 52, 14, ev.col + '22', [
        text(ev.sev.length > 6 ? ev.sev.slice(0, 4) : ev.sev,
          0, 0, 52, 14, 7, '700', ev.col, { textAlign: 'center', letterSpacing: 0.6 }),
      ], { cornerRadius: 4 }),
      // risk score
      text(ev.score, 304, 8, 38, 28, 20, '700', ev.col, { textAlign: 'right', letterSpacing: -1 }),
      text('RISK', 304, 36, 38, 11, 7, '600', P.muted, { textAlign: 'right', letterSpacing: 1 }),
      // content
      text(ev.title,  72, 10, 224, 14, 11, '700', P.text),
      text(ev.detail, 72, 28, 224, 12, 9,  '400', P.muted, { fontFamily: 'monospace' }),
      text(ev.meta,   72, 46, 224, 12, 8,  '400', P.dim === P.muted ? P.muted : '#3A4560', { letterSpacing: 0.3 }),
    ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));
  });

  children.push(navBar(P.bg, 'Events'));
  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── SCREEN 3: INCIDENT DETAIL ─────────────────────────────────────────
function screen3() {
  const children = [];

  children.push(statusBar(P.bg));

  // Back nav
  children.push(text('← INCIDENTS', 20, 54, 140, 14, 10, '600', P.cyan, { letterSpacing: 1 }));

  // Incident header
  children.push(frame(20, 76, 350, 90, P.surface, [
    rect(0, 0, 350, 3, P.red),
    text('INC-2024-0341', 14, 12, 200, 11, 8, '600', P.muted, { letterSpacing: 1.5 }),
    frame(270, 8, 66, 18, P.red + '22', [
      text('CRITICAL', 0, 0, 66, 18, 8, '700', P.red, { textAlign: 'center', letterSpacing: 0.8 }),
    ], { cornerRadius: 4 }),
    text('Lateral Movement — East-West', 14, 28, 310, 16, 12, '700', P.text),
    text('Detected: host-db-04 → host-int-17 via SMB', 14, 48, 322, 12, 9, '400', P.muted),
    text('Risk Score: 98   ·   MITRE T1021.002   ·   09:42 UTC', 14, 66, 322, 14, 9, '400', P.muted),
  ], { cornerRadius: 10, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  // Risk factors
  children.push(text('RISK FACTORS', 20, 178, 200, 12, 9, '700', P.muted, { letterSpacing: 2 }));
  const factors = [
    { label: 'Rare protocol on this path', pct: 95, col: P.red },
    { label: 'After-hours activity (02:18 local)', pct: 82, col: P.amber },
    { label: 'No matching access policy', pct: 78, col: P.amber },
    { label: 'Source asset previously flagged', pct: 61, col: '#8B5CF6' },
  ];
  factors.forEach((f, i) => {
    const fy = 198 + i * 40;
    children.push(text(f.label, 20, fy, 260, 13, 10, '500', P.text));
    // progress track
    children.push(rect(20, fy + 16, 310, 4, P.dim, { cornerRadius: 2 }));
    children.push(rect(20, fy + 16, Math.round(310 * f.pct / 100), 4, f.col, { cornerRadius: 2 }));
    children.push(text(`${f.pct}%`, 336, fy + 12, 34, 11, 9, '700', f.col, { textAlign: 'right' }));
  });

  // Timeline
  children.push(text('ATTACK TIMELINE', 20, 366, 200, 12, 9, '700', P.muted, { letterSpacing: 2 }));
  const timeline = [
    { time: '02:18', ev: 'First SMB probe from host-db-04', col: P.muted },
    { time: '02:19', ev: 'Authentication via stolen credential hash', col: P.amber },
    { time: '02:21', ev: 'Successful connection to host-int-17', col: P.red },
    { time: '02:24', ev: 'File access — /etc/shadow, /etc/passwd', col: P.red },
    { time: '09:42', ev: 'PRISM anomaly engine triggered alert', col: P.cyan },
  ];
  timeline.forEach((t, i) => {
    const ty = 386 + i * 48;
    // timeline dot + line
    children.push(rect(20, ty + 5, 1, 48, P.border));
    children.push(frame(14, ty + 1, 13, 13, t.col, [], { cornerRadius: 6 }));
    children.push(text(t.time, 36, ty, 50, 13, 9, '700', t.col, { fontFamily: 'monospace' }));
    children.push(text(t.ev, 96, ty, 268, 13, 10, '400', P.text));
  });

  // Action buttons
  children.push(frame(20, 640, 168, 40, P.red, [
    text('Contain Host', 0, 0, 168, 40, 11, '700', '#fff', { textAlign: 'center' }),
  ], { cornerRadius: 8 }));
  children.push(frame(200, 640, 168, 40, P.surface2, [
    text('Assign Analyst', 0, 0, 168, 40, 11, '600', P.text, { textAlign: 'center' }),
  ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  children.push(navBar(P.bg, 'Events'));
  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── SCREEN 4: ASSET INVENTORY ─────────────────────────────────────────
function screen4() {
  const children = [];

  children.push(statusBar(P.bg));

  children.push(text('ASSET MAP', 20, 54, 200, 20, 14, '700', P.text, { letterSpacing: 3 }));
  children.push(text('240 monitored endpoints', 20, 75, 220, 13, 10, '400', P.muted));

  // Summary bar
  children.push(frame(20, 100, 350, 64, P.surface, [
    frame(0, 0, 88, 64, P.green + '11', [
      text('236', 0, 12, 88, 28, 22, '700', P.green, { textAlign: 'center', letterSpacing: -1 }),
      text('SAFE', 0, 42, 88, 12, 8, '700', P.green, { textAlign: 'center', letterSpacing: 1 }),
    ], { cornerRadius: 0 }),
    rect(88, 8, 1, 48, P.border),
    frame(89, 0, 88, 64, P.amber + '11', [
      text('3', 0, 12, 88, 28, 22, '700', P.amber, { textAlign: 'center', letterSpacing: -1 }),
      text('AT RISK', 0, 42, 88, 12, 8, '700', P.amber, { textAlign: 'center', letterSpacing: 1 }),
    ]),
    rect(177, 8, 1, 48, P.border),
    frame(178, 0, 88, 64, P.red + '11', [
      text('1', 0, 12, 88, 28, 22, '700', P.red, { textAlign: 'center', letterSpacing: -1 }),
      text('CONTAINED', 0, 42, 88, 12, 8, '700', P.red, { textAlign: 'center', letterSpacing: 1 }),
    ]),
    rect(266, 8, 1, 48, P.border),
    frame(267, 0, 83, 64, P.surface, [
      text('0', 0, 12, 83, 28, 22, '700', P.muted, { textAlign: 'center', letterSpacing: -1 }),
      text('OFFLINE', 0, 42, 83, 12, 8, '700', P.muted, { textAlign: 'center', letterSpacing: 1 }),
    ]),
  ], { cornerRadius: 10, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  // Asset group headers + rows
  const groups = [
    {
      label: 'SERVERS — PRODUCTION',
      assets: [
        { name: 'host-db-04', role: 'PostgreSQL Primary', status: 'CONTAINED', col: P.red, score: '98' },
        { name: 'host-api-01', role: 'API Gateway', status: 'SAFE', col: P.green, score: '12' },
        { name: 'host-api-02', role: 'API Gateway', status: 'SAFE', col: P.green, score: '8' },
        { name: 'host-int-17', role: 'Internal Services', status: 'AT RISK', col: P.amber, score: '72' },
      ],
    },
    {
      label: 'NETWORK — EDGE',
      assets: [
        { name: 'fw-edge-01', role: 'Perimeter Firewall', status: 'AT RISK', col: P.amber, score: '58' },
        { name: 'lb-prod-01', role: 'Load Balancer', status: 'SAFE', col: P.green, score: '5' },
      ],
    },
  ];

  let gy = 180;
  groups.forEach(grp => {
    children.push(text(grp.label, 20, gy, 300, 12, 8, '700', P.muted, { letterSpacing: 2 }));
    gy += 20;
    grp.assets.forEach(a => {
      children.push(frame(20, gy, 350, 48, P.surface, [
        // Status dot
        frame(12, 19, 10, 10, a.col, [], { cornerRadius: 5 }),
        text(a.name, 30, 8, 200, 14, 11, '700', P.text, { fontFamily: 'monospace' }),
        text(a.role, 30, 26, 200, 12, 9,  '400', P.muted),
        // score
        text(a.score, 280, 8, 50, 14, 11, '700', a.col, { textAlign: 'right' }),
        text('RISK', 280, 26, 50, 12, 8,  '600', P.muted, { textAlign: 'right', letterSpacing: 1 }),
        // status pill
        frame(282, 28, 56, 14, a.col + '22', [
          text(a.status.length > 6 ? a.status.slice(0,4) : a.status,
            0, 0, 56, 14, 7, '700', a.col, { textAlign: 'center', letterSpacing: 0.6 }),
        ], { cornerRadius: 4 }),
      ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));
      gy += 56;
    });
    gy += 12;
  });

  children.push(navBar(P.bg, 'Assets'));
  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── SCREEN 5: THREAT INTEL ────────────────────────────────────────────
function screen5() {
  const children = [];

  children.push(statusBar(P.bg));

  children.push(text('THREAT INTEL', 20, 54, 200, 20, 14, '700', P.text, { letterSpacing: 3 }));
  children.push(text('Indicators of Compromise & Feeds', 20, 75, 280, 13, 10, '400', P.muted));

  // IOC search
  children.push(frame(20, 100, 350, 40, P.surface2, [
    text('⌕', 12, 11, 20, 18, 13, '400', P.cyan),
    text('IP, domain, hash, CVE...', 36, 11, 260, 18, 11, '400', P.muted),
    frame(300, 8, 40, 24, P.cyan, [
      text('Scan', 0, 0, 40, 24, 9, '700', P.bg, { textAlign: 'center' }),
    ], { cornerRadius: 6 }),
  ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.cyan + '40' } }));

  // Active IOCs
  children.push(text('ACTIVE IOCs  —  17 MATCHES', 20, 154, 280, 12, 9, '700', P.muted, { letterSpacing: 2 }));

  const iocs = [
    { type: 'IPv4', value: '185.220.101.47', tag: 'TOR Exit', col: P.red, seen: '2× today' },
    { type: 'HASH', value: 'a3f9c1d... (MD5)', tag: 'Ransomware', col: P.red, seen: '1× 09:42' },
    { type: 'DOMAIN', value: 'update-svc[.]ru', tag: 'C2 Beacon', col: P.amber, seen: '3× today' },
    { type: 'CVE', value: 'CVE-2024-3400', tag: 'PAN-OS RCE', col: P.amber, seen: 'Exposed' },
    { type: 'IPv4', value: '91.108.56.130', tag: 'Scan Source', col: '#8B5CF6', seen: '12× today' },
  ];

  iocs.forEach((ioc, i) => {
    const iy = 174 + i * 64;
    children.push(frame(20, iy, 350, 56, P.surface, [
      frame(0, 0, 46, 56, ioc.col + '15', [
        text(ioc.type, 0, 20, 46, 16, 7, '700', ioc.col, { textAlign: 'center', letterSpacing: 0.8 }),
      ], { cornerRadius: 0 }),
      rect(46, 8, 1, 40, P.border),
      text(ioc.value, 56, 10, 210, 14, 10, '700', P.text, { fontFamily: 'monospace' }),
      text(ioc.seen,  56, 30, 210, 12, 8,  '400', P.muted),
      frame(270, 10, 68, 16, ioc.col + '22', [
        text(ioc.tag, 0, 0, 68, 16, 7, '600', ioc.col, { textAlign: 'center', letterSpacing: 0.6 }),
      ], { cornerRadius: 4 }),
    ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));
  });

  // Feed health
  children.push(text('INTEL FEEDS', 20, 510, 200, 12, 9, '700', P.muted, { letterSpacing: 2 }));
  const feeds = [
    { name: 'AlienVault OTX', status: '✓', items: '12,440 IOCs', col: P.green },
    { name: 'Mandiant Advantage', status: '✓', items: '3,821 IOCs', col: P.green },
    { name: 'CISA KEV', status: '✓', items: '1,056 CVEs', col: P.green },
    { name: 'Custom TAXII Feed', status: '!', items: 'Delayed 14 min', col: P.amber },
  ];
  feeds.forEach((fd, i) => {
    const fy = 530 + i * 44;
    children.push(frame(20, fy, 350, 36, P.surface, [
      frame(8, 8, 20, 20, fd.col + '22', [
        text(fd.status, 0, 0, 20, 20, 10, '700', fd.col, { textAlign: 'center' }),
      ], { cornerRadius: 10 }),
      text(fd.name,  36, 5,  220, 13, 11, '600', P.text),
      text(fd.items, 36, 20, 220, 12, 9,  '400', P.muted),
    ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));
  });

  children.push(navBar(P.bg, 'Intel'));
  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── SCREEN 6: PROFILE / SETTINGS ─────────────────────────────────────
function screen6() {
  const children = [];

  children.push(statusBar(P.bg));

  // Avatar header
  children.push(frame(0, 44, 390, 140, P.surface, [
    // Avatar circle
    frame(155, 20, 80, 80, P.cyan + '20', [
      text('AK', 0, 24, 80, 32, 18, '700', P.cyan, { textAlign: 'center' }),
    ], { cornerRadius: 40, stroke: { align: 'inside', thickness: 2, fill: P.cyan + '60' } }),
    text('Alex Kim', 0, 108, 390, 16, 13, '700', P.text, { textAlign: 'center' }),
    text('Senior SOC Analyst  ·  Tier 2', 0, 126, 390, 12, 10, '400', P.muted, { textAlign: 'center' }),
  ]));

  // Stats row
  children.push(frame(20, 196, 350, 64, P.surface2, [
    frame(0, 0, 116, 64, 'transparent', [
      text('47', 0, 10, 116, 28, 20, '700', P.cyan, { textAlign: 'center', letterSpacing: -1 }),
      text('Incidents Closed', 0, 40, 116, 12, 8, '400', P.muted, { textAlign: 'center' }),
    ]),
    rect(116, 10, 1, 44, P.border),
    frame(117, 0, 116, 64, 'transparent', [
      text('98.4%', 0, 10, 116, 28, 18, '700', P.green, { textAlign: 'center', letterSpacing: -0.5 }),
      text('MTTR SLA Met', 0, 40, 116, 12, 8, '400', P.muted, { textAlign: 'center' }),
    ]),
    rect(233, 10, 1, 44, P.border),
    frame(234, 0, 116, 64, 'transparent', [
      text('4.2h', 0, 10, 116, 28, 20, '700', P.text, { textAlign: 'center', letterSpacing: -1 }),
      text('Avg Response', 0, 40, 116, 12, 8, '400', P.muted, { textAlign: 'center' }),
    ]),
  ], { cornerRadius: 10, stroke: { align: 'inside', thickness: 1, fill: P.border } }));

  // Settings sections
  const sections = [
    {
      label: 'NOTIFICATIONS',
      items: [
        { title: 'Critical Alerts', sub: 'Push, Email, SMS', toggle: true, on: true },
        { title: 'High Severity Events', sub: 'Push only', toggle: true, on: true },
        { title: 'Weekly Digest', sub: 'Monday 08:00 local', toggle: true, on: false },
      ],
    },
    {
      label: 'SECURITY',
      items: [
        { title: 'Biometric Lock', sub: 'Face ID enabled', toggle: true, on: true },
        { title: 'Auto-lock Timeout', sub: '2 minutes', toggle: false, on: false },
        { title: 'Session Token', sub: 'Expires: 7d', toggle: false, on: false },
      ],
    },
  ];

  let sy = 280;
  sections.forEach(sec => {
    children.push(text(sec.label, 20, sy, 200, 12, 8, '700', P.muted, { letterSpacing: 2 }));
    sy += 18;
    sec.items.forEach(item => {
      children.push(frame(20, sy, 350, 44, P.surface, [
        text(item.title, 14, 8, 240, 14, 11, '600', P.text),
        text(item.sub,   14, 26, 240, 12, 9,  '400', P.muted),
        // toggle or chevron
        item.toggle
          ? frame(290, 13, 40, 18, item.on ? P.cyan : P.border, [
              frame(item.on ? 22 : 2, 2, 14, 14, item.on ? P.bg : P.muted, [], { cornerRadius: 7 }),
            ], { cornerRadius: 9 })
          : text('›', 322, 12, 20, 20, 16, '300', P.muted, { textAlign: 'right' }),
      ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.border } }));
      sy += 52;
    });
    sy += 8;
  });

  // Sign out
  children.push(frame(20, sy + 8, 350, 44, P.red + '15', [
    text('Sign Out', 0, 0, 350, 44, 12, '600', P.red, { textAlign: 'center' }),
  ], { cornerRadius: 8, stroke: { align: 'inside', thickness: 1, fill: P.red + '40' } }));

  children.push(navBar(P.bg, 'Profile'));
  return frame(0, 0, 390, 844, P.bg, children, { clip: true });
}

// ─── ASSEMBLE PEN ──────────────────────────────────────────────────────
const SCREENS = [
  screen1(),
  screen2(),
  screen3(),
  screen4(),
  screen5(),
  screen6(),
];

// Position screens side by side with gap
const GAP = 40;
SCREENS.forEach((s, i) => {
  s.x = i * (390 + GAP);
  s.y = 0;
});

const pen = {
  version: '2.8',
  name: 'PRISM — Unified Threat Intelligence',
  width: SCREENS.length * (390 + GAP) - GAP,
  height: 844,
  fill: '#04050A',
  children: SCREENS,
};

fs.writeFileSync('/workspace/group/design-studio/prism.pen', JSON.stringify(pen, null, 2));
console.log('✓ prism.pen written');
console.log(`  Screens: ${SCREENS.length}`);
console.log(`  Canvas:  ${pen.width} × ${pen.height}`);
