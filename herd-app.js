// HERD — Multi-Agent Orchestration OS
// Inspired by: herding.app (Godly), Paperclip & JetBrains Air (Lapa.ninja)
// Trend: AI agent management interfaces — terminal aesthetic + ambient glow
// Theme: DARK (previous design lodge.pen was light)

const fs = require('fs');

const W = 390, H = 844;

// Color palette
const BG       = '#09080E';
const SURFACE  = '#110F1A';
const SURFACE2 = '#1A1728';
const BORDER   = '#2A2640';
const TEXT     = '#E4E0F5';
const MUTED    = '#6B6585';
const ACCENT   = '#7B5CFF'; // electric violet
const ACCENT2  = '#3DBAFF'; // cyan
const ACCENT3  = '#FF5CA8'; // hot pink (alerts)
const GREEN    = '#4DFFA3'; // active/running
const AMBER    = '#FFB84D'; // warning/idle

function statusBar(fill = BG) {
  return `
    <rect x="0" y="0" width="${W}" height="44" fill="${fill}"/>
    <text x="20" y="28" font-size="13" fill="${TEXT}" font-weight="500" font-family="Inter, sans-serif">9:41</text>
    <rect x="340" y="16" width="22" height="11" fill="none" rx="2" stroke="${MUTED}" stroke-width="1.5"/>
    <rect x="342" y="18" width="14" height="7" fill="${MUTED}" rx="1"/>
    <rect x="364" y="20" width="3" height="4" fill="${MUTED}" rx="1"/>
    <circle cx="324" cy="22" r="3" fill="${MUTED}"/>
    <circle cx="314" cy="22" r="3" fill="${MUTED}"/>
  `;
}

function navBar(active) {
  const items = [
    { id: 'command', label: 'Command', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'agents',  label: 'Agents',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'flow',    label: 'Flow',    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
    { id: 'log',     label: 'Log',     icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'pulse',   label: 'Pulse',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];
  const navY = H - 83;
  let svg = `
    <rect x="0" y="${navY}" width="${W}" height="83" fill="${SURFACE}"/>
    <line x1="0" y1="${navY}" x2="${W}" y2="${navY}" stroke="${BORDER}" stroke-width="1"/>
  `;
  items.forEach((item, i) => {
    const x = 20 + i * 70;
    const isActive = item.id === active;
    const col = isActive ? ACCENT : MUTED;
    svg += `
      <rect x="${x-4}" y="${navY+6}" width="46" height="42" rx="10" fill="${isActive ? ACCENT+'22' : 'none'}"/>
      <svg x="${x+5}" y="${navY+10}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="${item.icon}"/>
      </svg>
      <text x="${x+18}" y="${navY+46}" font-size="9.5" fill="${col}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="${isActive?'600':'400'}">${item.label}</text>
    `;
  });
  return svg;
}

function glowCircle(cx, cy, r, color, opacity = 0.25) {
  return `
    <radialGradient id="glow_${cx}_${cy}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="${opacity}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow_${cx}_${cy})"/>
  `;
}

function pill(x, y, w, h, color, text, textColor = BG) {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${color}"/>
    <text x="${x+w/2}" y="${y+h/2+4.5}" font-size="10.5" fill="${textColor}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600">${text}</text>
  `;
}

// ─── SCREEN 1: COMMAND ────────────────────────────────────────────────────
function screenCommand() {
  const defs = `<defs>
    ${glowCircle(195, 200, 180, ACCENT, 0.12)}
    ${glowCircle(50, 400, 100, ACCENT2, 0.08)}
    <linearGradient id="cardGrad1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${SURFACE2}"/>
      <stop offset="100%" stop-color="${SURFACE}"/>
    </linearGradient>
    <linearGradient id="runBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${ACCENT}"/>
      <stop offset="100%" stop-color="${ACCENT2}"/>
    </linearGradient>
  </defs>`;

  // Animated-style ring — fleet status
  const ringR = 60;
  const cx = 195, cy = 185;
  const pct = 0.72; // 72% active
  const circ = 2 * Math.PI * ringR;
  const dash = circ * pct;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${defs}
    ${statusBar()}

    <!-- Header -->
    <text x="20" y="68" font-size="11" fill="${MUTED}" font-family="'SF Mono', 'Fira Code', monospace" letter-spacing="2">HERD OS v1.4.2</text>
    <text x="20" y="92" font-size="26" fill="${TEXT}" font-weight="700" font-family="Inter, sans-serif">Command</text>
    <rect x="20" y="102" width="50" height="3" rx="1.5" fill="${ACCENT}"/>

    <!-- Fleet ring -->
    <circle cx="${cx}" cy="${cy}" r="${ringR+16}" fill="${SURFACE2}" stroke="${BORDER}" stroke-width="1"/>
    <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="${BORDER}" stroke-width="8"/>
    <circle cx="${cx}" cy="${cy}" r="${ringR}" fill="none" stroke="url(#runBar)" stroke-width="8"
      stroke-dasharray="${dash} ${circ}" stroke-dashoffset="${circ * 0.25}" stroke-linecap="round"/>
    <text x="${cx}" y="${cy-8}" font-size="28" fill="${TEXT}" font-weight="700" text-anchor="middle" font-family="Inter, sans-serif">72%</text>
    <text x="${cx}" y="${cy+10}" font-size="11" fill="${MUTED}" text-anchor="middle" font-family="Inter, sans-serif">Fleet Active</text>
    <text x="${cx}" y="${cy+26}" font-size="10" fill="${ACCENT}" text-anchor="middle" font-family="'SF Mono', monospace">18/25 agents</text>

    <!-- Quick stats row -->
    ${['Running','Idle','Error'].map((label, i) => {
      const vals = ['18', '5', '2'];
      const cols = [GREEN, AMBER, ACCENT3];
      const x = 20 + i * 118;
      return `
        <rect x="${x}" y="270" width="108" height="62" rx="12" fill="${SURFACE}"/>
        <rect x="${x}" y="270" width="108" height="62" rx="12" fill="none" stroke="${cols[i]}22" stroke-width="1"/>
        <circle cx="${x+18}" cy="291" r="5" fill="${cols[i]}"/>
        <text x="${x+30}" y="295" font-size="10.5" fill="${MUTED}" font-family="Inter, sans-serif">${label}</text>
        <text x="${x+14}" y="323" font-size="24" fill="${cols[i]}" font-weight="700" font-family="Inter, sans-serif">${vals[i]}</text>
      `;
    }).join('')}

    <!-- Active pipeline card -->
    <rect x="20" y="352" width="${W-40}" height="78" rx="14" fill="${SURFACE}"/>
    <rect x="20" y="352" width="${W-40}" height="78" rx="14" fill="none" stroke="${BORDER}" stroke-width="1"/>
    <text x="36" y="373" font-size="10" fill="${MUTED}" font-family="'SF Mono', monospace" letter-spacing="1.5">ACTIVE PIPELINE</text>
    <text x="36" y="394" font-size="14" fill="${TEXT}" font-weight="600" font-family="Inter, sans-serif">Customer Onboarding Flow</text>
    <!-- mini progress bar -->
    <rect x="36" y="406" width="240" height="4" rx="2" fill="${BORDER}"/>
    <rect x="36" y="406" width="168" height="4" rx="2" fill="url(#runBar)"/>
    <text x="36" y="422" font-size="10" fill="${MUTED}" font-family="Inter, sans-serif">Step 7 of 12 · 4 agents assigned</text>
    <text x="${W-56}" y="394" font-size="12" fill="${ACCENT2}" font-weight="600" font-family="'SF Mono', monospace">70%</text>

    <!-- Recent agents -->
    <text x="20" y="456" font-size="12" fill="${MUTED}" font-weight="600" font-family="Inter, sans-serif" letter-spacing="1">RECENT ACTIVITY</text>

    ${[
      { name: 'scout-01', task: 'Scraping product catalog', status: 'running', col: GREEN, ago: '12s' },
      { name: 'writer-03', task: 'Drafting outreach emails', status: 'running', col: GREEN, ago: '1m' },
      { name: 'verify-02', task: 'KYC document check', status: 'idle', col: AMBER, ago: '3m' },
    ].map((ag, i) => {
      const y = 468 + i * 66;
      return `
        <rect x="20" y="${y}" width="${W-40}" height="58" rx="12" fill="${SURFACE}"/>
        <circle cx="44" cy="${y+29}" r="14" fill="${ag.col}22" stroke="${ag.col}44" stroke-width="1"/>
        <circle cx="44" cy="${y+29}" r="5" fill="${ag.col}"/>
        <text x="66" y="${y+22}" font-size="13" fill="${TEXT}" font-weight="600" font-family="'SF Mono', monospace">${ag.name}</text>
        <text x="66" y="${y+38}" font-size="11" fill="${MUTED}" font-family="Inter, sans-serif">${ag.task}</text>
        <text x="${W-36}" y="${y+38}" font-size="10" fill="${MUTED}" text-anchor="end" font-family="Inter, sans-serif">${ag.ago}</text>
        ${pill(W-76, y+12, 52, 18, ag.col+'22', ag.status, ag.col)}
      `;
    }).join('')}

    ${navBar('command')}
  </svg>`;
}

// ─── SCREEN 2: AGENTS ROSTER ────────────────────────────────────────────
function screenAgents() {
  const agents = [
    { name: 'scout-01', role: 'Web Researcher',     tasks: 142, status: 'running', uptime: '99.2%', col: GREEN },
    { name: 'writer-03', role: 'Content Generator', tasks: 87,  status: 'running', uptime: '97.8%', col: GREEN },
    { name: 'verify-02', role: 'KYC Validator',     tasks: 61,  status: 'idle',    uptime: '100%',  col: AMBER },
    { name: 'router-01', role: 'Task Dispatcher',   tasks: 305, status: 'running', uptime: '99.9%', col: GREEN },
    { name: 'outbox-04', role: 'Email Sender',      tasks: 44,  status: 'error',   uptime: '89.1%', col: ACCENT3 },
    { name: 'audit-01',  role: 'Compliance Check',  tasks: 22,  status: 'idle',    uptime: '100%',  col: AMBER },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <defs>
      <linearGradient id="hdrGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${SURFACE}"/>
        <stop offset="100%" stop-color="${BG}"/>
      </linearGradient>
    </defs>
    ${statusBar()}

    <text x="20" y="68" font-size="11" fill="${MUTED}" font-family="'SF Mono', monospace" letter-spacing="2">25 AGENTS TOTAL</text>
    <text x="20" y="92" font-size="26" fill="${TEXT}" font-weight="700" font-family="Inter, sans-serif">Agent Roster</text>
    <rect x="20" y="102" width="50" height="3" rx="1.5" fill="${ACCENT}"/>

    <!-- Filter pills -->
    ${['All', 'Running', 'Idle', 'Error'].map((label, i) => {
      const isActive = i === 0;
      const x = 20 + i * 78;
      return `
        <rect x="${x}" y="115" width="68" height="28" rx="14"
          fill="${isActive ? ACCENT : SURFACE}" stroke="${isActive ? 'none' : BORDER}" stroke-width="1"/>
        <text x="${x+34}" y="133" font-size="11.5" fill="${isActive ? '#fff' : MUTED}"
          text-anchor="middle" font-family="Inter, sans-serif" font-weight="${isActive?'600':'400'}">${label}</text>
      `;
    }).join('')}

    ${agents.map((ag, i) => {
      const y = 160 + i * 96;
      const initials = ag.name.slice(0,2).toUpperCase();
      return `
        <rect x="20" y="${y}" width="${W-40}" height="84" rx="16" fill="${SURFACE}"/>
        <rect x="20" y="${y}" width="${W-40}" height="84" rx="16" fill="none" stroke="${ag.col}22" stroke-width="1"/>

        <!-- Avatar ring -->
        <circle cx="56" cy="${y+42}" r="22" fill="${ag.col}15"/>
        <circle cx="56" cy="${y+42}" r="22" fill="none" stroke="${ag.col}55" stroke-width="1.5"/>
        <circle cx="56" cy="${y+42}" r="5" fill="${ag.col}"/>
        <text x="56" y="${y+38}" font-size="10" fill="${ag.col}" font-weight="700" text-anchor="middle" font-family="'SF Mono', monospace">${initials}</text>

        <text x="90" y="${y+27}" font-size="14" fill="${TEXT}" font-weight="600" font-family="'SF Mono', monospace">${ag.name}</text>
        <text x="90" y="${y+44}" font-size="11.5" fill="${MUTED}" font-family="Inter, sans-serif">${ag.role}</text>

        <!-- Status pill -->
        ${pill(W-95, y+14, 65, 20, ag.col+'22', ag.status.toUpperCase(), ag.col)}

        <!-- Bottom stats -->
        <text x="90" y="${y+64}" font-size="10.5" fill="${MUTED}" font-family="Inter, sans-serif">${ag.tasks} tasks</text>
        <text x="170" y="${y+64}" font-size="10.5" fill="${MUTED}" font-family="Inter, sans-serif">·  uptime ${ag.uptime}</text>
      `;
    }).join('')}

    ${navBar('agents')}
  </svg>`;
}

// ─── SCREEN 3: FLOW BUILDER ─────────────────────────────────────────────
function screenFlow() {
  const nodes = [
    { x: 155, y: 150, label: 'Trigger', sub: 'New Lead', col: ACCENT2, icon: '⚡' },
    { x: 80,  y: 270, label: 'scout-01', sub: 'Research', col: GREEN, icon: '🔍' },
    { x: 260, y: 270, label: 'router-01', sub: 'Dispatch', col: ACCENT, icon: '⇢' },
    { x: 80,  y: 400, label: 'writer-03', sub: 'Draft', col: GREEN, icon: '✍' },
    { x: 260, y: 400, label: 'verify-02', sub: 'Validate', col: AMBER, icon: '✓' },
    { x: 155, y: 520, label: 'outbox-04', sub: 'Send', col: ACCENT3, icon: '✉' },
  ];

  const edges = [
    [0,1],[0,2],[1,3],[2,4],[3,5],[4,5]
  ];

  const edgePaths = edges.map(([a,b]) => {
    const from = nodes[a], to = nodes[b];
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    return `<path d="M${from.x} ${from.y+28} Q${mx} ${my} ${to.x} ${to.y-28}"
      fill="none" stroke="${BORDER}" stroke-width="1.5" stroke-dasharray="4 3"/>`;
  }).join('');

  const nodesSvg = nodes.map(n => `
    <rect x="${n.x-40}" y="${n.y-28}" width="80" height="56" rx="14"
      fill="${SURFACE2}" stroke="${n.col}44" stroke-width="1.5"/>
    <text x="${n.x}" y="${n.y-8}" font-size="16" text-anchor="middle" font-family="Apple Color Emoji, sans-serif">${n.icon}</text>
    <text x="${n.x}" y="${n.y+10}" font-size="11" fill="${TEXT}" font-weight="600" text-anchor="middle" font-family="'SF Mono', monospace">${n.label}</text>
    <text x="${n.x}" y="${n.y+25}" font-size="9.5" fill="${n.col}" text-anchor="middle" font-family="Inter, sans-serif">${n.sub}</text>
  `).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <defs>
      ${glowCircle(195, 350, 220, ACCENT, 0.06)}
    </defs>
    ${statusBar()}

    <text x="20" y="68" font-size="11" fill="${MUTED}" font-family="'SF Mono', monospace" letter-spacing="2">PIPELINE EDITOR</text>
    <text x="20" y="92" font-size="26" fill="${TEXT}" font-weight="700" font-family="Inter, sans-serif">Flow Builder</text>
    <rect x="20" y="102" width="50" height="3" rx="1.5" fill="${ACCENT}"/>

    <!-- Pipeline name badge -->
    <rect x="20" y="114" width="220" height="26" rx="8" fill="${SURFACE}"/>
    <text x="32" y="131" font-size="11.5" fill="${TEXT}" font-family="Inter, sans-serif" font-weight="500">Customer Onboarding Flow</text>

    <!-- Run button -->
    <rect x="${W-80}" y="114" width="60" height="26" rx="8" fill="${ACCENT}"/>
    <text x="${W-50}" y="131" font-size="11.5" fill="#fff" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600">▶ Run</text>

    <!-- Canvas area -->
    <rect x="0" y="148" width="${W}" height="${H-148-83}" fill="${BG}"/>
    <!-- Grid dots -->
    ${Array.from({length:12}, (_,row) =>
      Array.from({length:9}, (_,col) =>
        `<circle cx="${25+col*42}" cy="${165+row*55}" r="1" fill="${BORDER}" opacity="0.6"/>`
      ).join('')
    ).join('')}

    ${edgePaths}
    ${nodesSvg}

    <!-- Step count badge -->
    <rect x="20" y="${H-99}" width="${W-40}" height="10" rx="5" fill="${BORDER}"/>
    <rect x="20" y="${H-99}" width="${(W-40)*0.7}" height="10" rx="5" fill="${ACCENT}55"/>
    <text x="20" y="${H-86}" font-size="10" fill="${MUTED}" font-family="Inter, sans-serif">Step 7 of 12</text>

    ${navBar('flow')}
  </svg>`;
}

// ─── SCREEN 4: ACTIVITY LOG ─────────────────────────────────────────────
function screenLog() {
  const events = [
    { time: '09:41:02', agent: 'scout-01', event: 'Scraped 47 records from source', type: 'success', col: GREEN },
    { time: '09:41:00', agent: 'router-01', event: 'Dispatched task batch #1447', type: 'info', col: ACCENT2 },
    { time: '09:40:51', agent: 'writer-03', event: 'Draft ready: "Welcome to Acme"', type: 'success', col: GREEN },
    { time: '09:40:44', agent: 'outbox-04', event: 'SMTP timeout — retrying (2/3)', type: 'warn', col: AMBER },
    { time: '09:40:38', agent: 'verify-02', event: 'KYC passed: user_id 8821', type: 'success', col: GREEN },
    { time: '09:40:31', agent: 'outbox-04', event: 'SMTP connection refused', type: 'error', col: ACCENT3 },
    { time: '09:40:22', agent: 'scout-01', event: 'Rate limit hit — backing off 30s', type: 'warn', col: AMBER },
    { time: '09:40:14', agent: 'router-01', event: 'New run triggered by webhook', type: 'info', col: ACCENT2 },
    { time: '09:40:01', agent: 'writer-03', event: '3 email templates generated', type: 'success', col: GREEN },
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    ${statusBar()}

    <text x="20" y="68" font-size="11" fill="${MUTED}" font-family="'SF Mono', monospace" letter-spacing="2">LIVE · UPDATING</text>
    <text x="20" y="92" font-size="26" fill="${TEXT}" font-weight="700" font-family="Inter, sans-serif">Activity Log</text>
    <rect x="20" y="102" width="50" height="3" rx="1.5" fill="${ACCENT}"/>
    <!-- Live dot -->
    <circle cx="${W-30}" cy="80" r="5" fill="${GREEN}"/>
    <circle cx="${W-30}" cy="80" r="9" fill="${GREEN}22"/>
    <text x="${W-46}" y="84" font-size="10" fill="${GREEN}" text-anchor="end" font-family="Inter, sans-serif" font-weight="600">LIVE</text>

    <!-- Filter bar -->
    <rect x="20" y="114" width="${W-40}" height="32" rx="10" fill="${SURFACE}"/>
    <text x="38" y="134" font-size="11.5" fill="${MUTED}" font-family="Inter, sans-serif">Filter by agent or event type...</text>
    <text x="${W-36}" y="134" font-size="14" fill="${MUTED}">⌘</text>

    <!-- Log entries -->
    ${events.map((ev, i) => {
      const y = 160 + i * 68;
      return `
        <rect x="20" y="${y}" width="${W-40}" height="60" rx="10" fill="${SURFACE}"/>
        <!-- left accent bar -->
        <rect x="20" y="${y}" width="3" height="60" rx="1.5" fill="${ev.col}"/>
        <!-- timestamp mono -->
        <text x="32" y="${y+18}" font-size="9.5" fill="${MUTED}" font-family="'SF Mono', monospace">${ev.time}</text>
        <!-- agent badge -->
        <rect x="100" y="${y+7}" width="${ev.agent.length*7+10}" height="16" rx="8" fill="${ev.col}22"/>
        <text x="105" y="${y+18}" font-size="9" fill="${ev.col}" font-family="'SF Mono', monospace" font-weight="600">${ev.agent}</text>
        <!-- event text -->
        <text x="32" y="${y+38}" font-size="11.5" fill="${TEXT}" font-family="Inter, sans-serif">${ev.event}</text>
        <!-- type pill -->
        ${pill(W-82, y+39, 50, 16, ev.col+'22', ev.type.toUpperCase(), ev.col)}
      `;
    }).join('')}

    ${navBar('log')}
  </svg>`;
}

// ─── SCREEN 5: PULSE / METRICS ──────────────────────────────────────────
function screenPulse() {
  // Fake sparkline for task throughput
  const sparkPoints = [40, 65, 55, 80, 72, 90, 85, 110, 95, 130, 118, 142];
  const spW = W - 40, spH = 70;
  const spX = 20, spY = 280;
  const maxSp = Math.max(...sparkPoints);
  const pts = sparkPoints.map((v, i) => {
    const px = spX + (i / (sparkPoints.length - 1)) * spW;
    const py = spY + spH - (v / maxSp) * spH;
    return `${px},${py}`;
  }).join(' ');

  const areaPts = [
    `${spX},${spY+spH}`,
    ...sparkPoints.map((v, i) => {
      const px = spX + (i / (sparkPoints.length - 1)) * spW;
      const py = spY + spH - (v / maxSp) * spH;
      return `${px},${py}`;
    }),
    `${spX+spW},${spY+spH}`,
  ].join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${ACCENT2}"/>
        <stop offset="100%" stop-color="${ACCENT}"/>
      </linearGradient>
    </defs>
    ${statusBar()}

    <text x="20" y="68" font-size="11" fill="${MUTED}" font-family="'SF Mono', monospace" letter-spacing="2">LAST 24 HOURS</text>
    <text x="20" y="92" font-size="26" fill="${TEXT}" font-weight="700" font-family="Inter, sans-serif">Pulse</text>
    <rect x="20" y="102" width="50" height="3" rx="1.5" fill="${ACCENT}"/>

    <!-- Hero metric -->
    <rect x="20" y="116" width="${W-40}" height="100" rx="16" fill="${SURFACE}"/>
    <text x="36" y="140" font-size="11" fill="${MUTED}" font-family="Inter, sans-serif">Tasks Completed</text>
    <text x="36" y="185" font-size="48" fill="${TEXT}" font-weight="800" font-family="Inter, sans-serif">1,847</text>
    <text x="${W-44}" y="185" font-size="13" fill="${GREEN}" font-weight="600" font-family="Inter, sans-serif" text-anchor="end">↑ 23%</text>
    <text x="36" y="207" font-size="10.5" fill="${MUTED}" font-family="Inter, sans-serif">vs last 24h · avg 4.2s/task</text>

    <!-- Mini stats row -->
    ${[
      { label: 'Avg Latency', val: '4.2s', col: ACCENT2 },
      { label: 'Error Rate', val: '0.8%', col: ACCENT3 },
      { label: 'Cost', val: '$3.42', col: AMBER },
    ].map((s, i) => {
      const x = 20 + i * 118;
      return `
        <rect x="${x}" y="228" width="108" height="48" rx="10" fill="${SURFACE}"/>
        <text x="${x+12}" y="245" font-size="9.5" fill="${MUTED}" font-family="Inter, sans-serif">${s.label}</text>
        <text x="${x+12}" y="267" font-size="17" fill="${s.col}" font-weight="700" font-family="Inter, sans-serif">${s.val}</text>
      `;
    }).join('')}

    <!-- Throughput chart -->
    <text x="20" y="274" font-size="11" fill="${MUTED}" font-family="Inter, sans-serif" letter-spacing="1">TASK THROUGHPUT</text>
    <polygon points="${areaPts}" fill="url(#areaGrad)"/>
    <polyline points="${pts}" fill="none" stroke="url(#sparkLine)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Last point highlight -->
    <circle cx="${spX+spW}" cy="${spY+spH-(sparkPoints[sparkPoints.length-1]/maxSp)*spH}" r="4" fill="${ACCENT}"/>
    <circle cx="${spX+spW}" cy="${spY+spH-(sparkPoints[sparkPoints.length-1]/maxSp)*spH}" r="8" fill="${ACCENT}33"/>

    <!-- Top agents table -->
    <text x="20" y="376" font-size="11" fill="${MUTED}" font-family="Inter, sans-serif" letter-spacing="1">TOP PERFORMERS</text>
    ${[
      { name: 'router-01', tasks: 305, pct: 100, col: ACCENT },
      { name: 'scout-01', tasks: 142, pct: 47, col: GREEN },
      { name: 'writer-03', tasks: 87, pct: 29, col: ACCENT2 },
      { name: 'verify-02', tasks: 61, pct: 20, col: AMBER },
    ].map((ag, i) => {
      const y = 388 + i * 70;
      return `
        <rect x="20" y="${y}" width="${W-40}" height="60" rx="12" fill="${SURFACE}"/>
        <text x="36" y="${y+22}" font-size="12" fill="${TEXT}" font-weight="600" font-family="'SF Mono', monospace">${ag.name}</text>
        <text x="${W-36}" y="${y+22}" font-size="12" fill="${MUTED}" text-anchor="end" font-family="Inter, sans-serif">${ag.tasks} tasks</text>
        <!-- progress bar -->
        <rect x="36" y="${y+32}" width="${W-92}" height="6" rx="3" fill="${BORDER}"/>
        <rect x="36" y="${y+32}" width="${(W-92)*ag.pct/100}" height="6" rx="3" fill="${ag.col}"/>
        <text x="36" y="${y+52}" font-size="9.5" fill="${ag.col}" font-family="Inter, sans-serif">${ag.pct}% of top agent</text>
      `;
    }).join('')}

    ${navBar('pulse')}
  </svg>`;
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────
function makePen() {
  const screens = [
    { name: 'Command',      svg: screenCommand() },
    { name: 'Agent Roster', svg: screenAgents() },
    { name: 'Flow Builder', svg: screenFlow() },
    { name: 'Activity Log', svg: screenLog() },
    { name: 'Pulse',        svg: screenPulse() },
  ];

  const pen = {
    version: '2.8',
    name: 'HERD — Multi-Agent Orchestration OS',
    description: 'Inspired by herding.app (Godly) + Paperclip/JetBrains Air AI agent trends on Lapa.ninja. Dark terminal aesthetic meets ambient glow — a mobile OS for wrangling autonomous AI workflows.',
    theme: 'dark',
    backgroundColor: BG,
    accentColor: ACCENT,
    fontFamily: 'Inter',
    screens: screens.map(s => ({
      name: s.name,
      svg: s.svg,
    })),
    createdAt: new Date().toISOString(),
    tags: ['ai', 'agents', 'dark-mode', 'dashboard', 'orchestration', 'saas'],
  };

  return pen;
}

const pen = makePen();
fs.writeFileSync('/workspace/group/design-studio/herd.pen', JSON.stringify(pen, null, 2));
console.log('✓ herd.pen written');
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Theme: ${pen.theme}`);
