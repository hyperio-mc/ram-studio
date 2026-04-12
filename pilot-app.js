// PILOT — AI Agent Fleet Manager
// Trend: agent-native SaaS + warm cream editorial (Minimal Gallery: Factory, Folk, Sort)
// Light theme, warm cream palette, editorial type moments

const fs = require('fs');

const W = 390, H = 844;
const PAL = {
  bg:      '#F5F1EB',
  surface: '#FFFFFF',
  card:    '#FDFCFA',
  border:  '#E8E3DA',
  text:    '#1A1714',
  muted:   '#8C8580',
  accent:  '#2D5BFF',
  accent2: '#FF4F1A',
  green:   '#1A9E6A',
  amber:   '#F59E0B',
  red:     '#EF4444',
  purple:  '#7C3AED',
};

function rect(x, y, w, h, fill, opts={}) {
  const r = opts.r || 0;
  const stroke = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw||1}"` : '';
  const op = opts.opacity ? ` opacity="${opts.opacity}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke}${op}/>`;
}

function text(x, y, content, size, fill, opts={}) {
  const weight = opts.weight || '400';
  const anchor = opts.anchor || 'start';
  const family = opts.family || 'Inter, -apple-system, sans-serif';
  const ls = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const op = opts.opacity ? ` opacity="${opts.opacity}"` : '';
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" font-family="${family}"${ls}${op}>${content}</text>`;
}

function circle(cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

function line(x1, y1, x2, y2, stroke, sw=1, opts={}) {
  const op = opts.opacity ? ` opacity="${opts.opacity}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${op}/>`;
}

function pill(x, y, w, h, fill, label, labelColor, size=11) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}"/>
          <text x="${x+w/2}" y="${y+h/2+4}" font-size="${size}" fill="${labelColor}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600">${label}</text>`;
}

// Status dot
function dot(cx, cy, color) {
  return `${circle(cx, cy, 4, color)}
          <circle cx="${cx}" cy="${cy}" r="4" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.35"/>`;
}

// Agent card (fleet row)
function agentCard(x, y, w, name, role, status, tasks, color, runtime) {
  const statusColors = { running: PAL.green, idle: PAL.muted, error: PAL.red, paused: PAL.amber };
  const statusFills = { running: '#E8F7F1', idle: '#F0EFED', error: '#FEE2E2', paused: '#FEF3C7' };
  const sc = statusColors[status] || PAL.muted;
  const sf = statusFills[status] || '#F0EFED';
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  return `
    ${rect(x, y, w, 84, PAL.card, {r:12, stroke: PAL.border, sw:1})}
    ${circle(x+20, y+20, 14, color)}
    ${text(x+20, y+25, name.charAt(0), 14, '#fff', {weight:'700', anchor:'middle'})}
    ${text(x+42, y+19, name, 14, PAL.text, {weight:'600'})}
    ${text(x+42, y+35, role, 11, PAL.muted)}
    ${rect(x+w-88, y+12, 68, 22, sf, {r:11})}
    ${dot(x+w-82, y+23, sc)}
    ${text(x+w-72, y+27, statusLabel, 11, sc, {weight:'600'})}
    ${text(x+20, y+62, `${tasks} tasks`, 11, PAL.muted)}
    ${text(x+20+58, y+62, '·', 11, PAL.muted)}
    ${text(x+20+68, y+62, runtime, 11, PAL.muted)}
  `;
}

// Mini bar chart
function miniBar(x, y, values, w, h, color) {
  const max = Math.max(...values);
  const bw = (w - (values.length - 1) * 3) / values.length;
  return values.map((v, i) => {
    const bh = max > 0 ? (v / max) * h : 2;
    return rect(x + i * (bw + 3), y + h - bh, bw, bh, color, {r: 2});
  }).join('');
}

// Sparkline
function sparkline(x, y, values, w, h, color) {
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const px = x + (i / (values.length - 1)) * w;
    const py = y + h - ((v - min) / range) * h;
    return `${px},${py}`;
  }).join(' ');
  return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>`;
}

// Progress bar
function progress(x, y, w, pct, color) {
  const filled = (pct / 100) * w;
  return `
    ${rect(x, y, w, 4, PAL.border, {r:2})}
    ${rect(x, y, filled, 4, color, {r:2})}
  `;
}

// ── SCREEN 1: Fleet Dashboard ──────────────────────────────────────────────
function screen1() {
  return `
    ${rect(0, 0, W, H, PAL.bg)}

    <!-- Status bar -->
    ${text(20, 22, '9:41', 13, PAL.text, {weight:'600'})}
    ${text(W-20, 22, '●●● 100%', 11, PAL.text, {anchor:'end', opacity:'0.5'})}

    <!-- Header -->
    ${text(20, 58, 'PILOT', 22, PAL.text, {weight:'800', ls:'0.06em', family:'Georgia, serif'})}
    ${text(20, 76, 'Fleet Dashboard', 13, PAL.muted)}

    <!-- Deploy btn -->
    ${rect(W-88, 52, 72, 30, PAL.accent, {r:15})}
    ${text(W-52, 72, '+ Deploy', 12, '#fff', {weight:'600', anchor:'middle'})}

    <!-- Summary row -->
    ${line(0, 96, W, 96, PAL.border)}
    ${text(20, 120, '6', 28, PAL.text, {weight:'700'})}
    ${text(20, 136, 'Agents', 11, PAL.muted)}

    ${line(W/3, 100, W/3, 142, PAL.border)}
    ${text(W/3+16, 120, '23', 28, PAL.accent, {weight:'700'})}
    ${text(W/3+16, 136, 'Running', 11, PAL.muted)}

    ${line(2*W/3, 100, 2*W/3, 142, PAL.border)}
    ${text(2*W/3+16, 120, '847', 28, PAL.text, {weight:'700'})}
    ${text(2*W/3+16, 136, 'Done today', 11, PAL.muted)}

    ${line(0, 148, W, 148, PAL.border)}

    <!-- Section label -->
    ${text(20, 172, 'ACTIVE AGENTS', 10, PAL.muted, {weight:'700', ls:'0.08em'})}

    <!-- Agent cards -->
    ${agentCard(16, 184, W-32, 'Scout', 'Web Research Agent', 'running', 12, '#2D5BFF', '2h 14m')}
    ${agentCard(16, 280, W-32, 'Forge', 'Code Generation', 'running', 8, '#7C3AED', '45m')}
    ${agentCard(16, 376, W-32, 'Herald', 'Email & Outreach', 'paused', 3, '#F59E0B', '—')}
    ${agentCard(16, 472, W-32, 'Ledger', 'Data Pipeline', 'running', 31, '#1A9E6A', '6h 02m')}
    ${agentCard(16, 568, W-32, 'Cipher', 'Security Scanner', 'idle', 0, '#8C8580', 'Standby')}

    <!-- Bottom nav -->
    ${rect(0, H-72, W, 72, PAL.surface, {stroke:PAL.border, sw:1})}
    ${text(W/5, H-40, '⌂', 18, PAL.accent, {anchor:'middle'})}
    ${text(W/5, H-22, 'Fleet', 10, PAL.accent, {weight:'600', anchor:'middle'})}
    ${text(2*W/5, H-40, '≡', 18, PAL.muted, {anchor:'middle'})}
    ${text(2*W/5, H-22, 'Tasks', 10, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-40, '◎', 18, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-22, 'Outcomes', 10, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-40, '⚙', 18, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-22, 'Settings', 10, PAL.muted, {anchor:'middle'})}
  `;
}

// ── SCREEN 2: Agent Detail (Scout) ─────────────────────────────────────────
function screen2() {
  return `
    ${rect(0, 0, W, H, PAL.bg)}

    <!-- Status bar -->
    ${text(20, 22, '9:41', 13, PAL.text, {weight:'600'})}
    ${text(W-20, 22, '●●● 100%', 11, PAL.text, {anchor:'end', opacity:'0.5'})}

    <!-- Back -->
    ${text(20, 56, '← Fleet', 13, PAL.accent, {weight:'500'})}

    <!-- Agent hero -->
    ${rect(0, 72, W, 120, PAL.surface, {stroke:PAL.border, sw:1})}
    ${circle(32, 132, 22, PAL.accent)}
    ${text(32, 139, 'S', 18, '#fff', {weight:'800', anchor:'middle'})}
    ${dot(48, 118, PAL.green)}

    ${text(66, 118, 'Scout', 20, PAL.text, {weight:'700'})}
    ${text(66, 136, 'Web Research Agent', 13, PAL.muted)}
    ${text(66, 155, 'v2.3 · GPT-4o · 128k ctx', 11, PAL.muted)}

    <!-- Running badge -->
    ${rect(W-96, 116, 76, 24, '#E8F7F1', {r:12})}
    ${dot(W-85, 128, PAL.green)}
    ${text(W-74, 132, 'Running', 11, PAL.green, {weight:'600'})}

    <!-- Current task -->
    ${rect(16, 208, W-32, 72, PAL.card, {r:12, stroke:PAL.border, sw:1})}
    ${text(32, 230, 'CURRENT TASK', 10, PAL.muted, {weight:'700', ls:'0.07em'})}
    ${text(32, 250, 'Scrape competitor pricing — Notion, Linear, Asana', 13, PAL.text, {weight:'500'})}
    ${text(32, 268, 'Started 14 min ago · ~8 min remaining', 11, PAL.muted)}
    ${progress(32, 274, W-64, 65, PAL.accent)}

    <!-- Stats grid -->
    ${text(20, 310, 'PERFORMANCE', 10, PAL.muted, {weight:'700', ls:'0.07em'})}

    ${rect(16, 322, (W-48)/2, 80, PAL.surface, {r:12, stroke:PAL.border, sw:1})}
    ${text(28, 346, '847', 24, PAL.text, {weight:'700'})}
    ${text(28, 362, 'Tasks completed', 11, PAL.muted)}
    ${sparkline(28, 368, [20,35,28,42,38,52,47,60,55,65], (W-48)/2-24, 24, PAL.accent)}

    ${rect(W/2+8, 322, (W-48)/2, 80, PAL.surface, {r:12, stroke:PAL.border, sw:1})}
    ${text(W/2+20, 346, '98.2%', 24, PAL.green, {weight:'700'})}
    ${text(W/2+20, 362, 'Success rate', 11, PAL.muted)}
    ${sparkline(W/2+20, 368, [96,97,95,98,99,97,98,99,98,99], (W-48)/2-24, 24, PAL.green)}

    <!-- Activity log -->
    ${text(20, 424, 'RECENT ACTIVITY', 10, PAL.muted, {weight:'700', ls:'0.07em'})}

    ${[
      { time:'09:41', msg:'Navigating to asana.com/pricing', color: PAL.muted },
      { time:'09:38', msg:'Extracted 12 data points from linear.app', color: PAL.green },
      { time:'09:35', msg:'Opened Notion pricing page', color: PAL.muted },
      { time:'09:31', msg:'Task assigned by Orchestrator', color: PAL.accent },
      { time:'09:28', msg:'Agent woke from standby', color: PAL.muted },
    ].map((item, i) => `
      ${rect(16, 438 + i*58, W-32, 50, PAL.card, {r:10, stroke:PAL.border, sw:1})}
      ${circle(36, 463 + i*58, 4, item.color)}
      ${text(50, 458 + i*58, item.time, 10, PAL.muted)}
      ${text(50, 474 + i*58, item.msg, 12, PAL.text)}
    `).join('')}

    <!-- Bottom nav -->
    ${rect(0, H-72, W, 72, PAL.surface, {stroke:PAL.border, sw:1})}
    ${text(W/5, H-40, '⌂', 18, PAL.accent, {anchor:'middle'})}
    ${text(W/5, H-22, 'Fleet', 10, PAL.accent, {weight:'600', anchor:'middle'})}
    ${text(2*W/5, H-40, '≡', 18, PAL.muted, {anchor:'middle'})}
    ${text(2*W/5, H-22, 'Tasks', 10, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-40, '◎', 18, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-22, 'Outcomes', 10, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-40, '⚙', 18, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-22, 'Settings', 10, PAL.muted, {anchor:'middle'})}
  `;
}

// ── SCREEN 3: Task Queue ────────────────────────────────────────────────────
function screen3() {
  const tasks = [
    { agent:'S', color: PAL.accent,  name:'Scout',  task:'Research AI pricing trends Q1 2025',     status:'running', pri:'High',  eta:'~12m' },
    { agent:'F', color: PAL.purple,  name:'Forge',  task:'Generate TypeScript types from OpenAPI',  status:'running', pri:'High',  eta:'~4m'  },
    { agent:'L', color: PAL.green,   name:'Ledger', task:'Sync Stripe webhooks → Postgres',         status:'running', pri:'Med',   eta:'~2m'  },
    { agent:'S', color: PAL.accent,  name:'Scout',  task:'Scrape top 50 ProductHunt launches',     status:'queued',  pri:'Med',   eta:'—'    },
    { agent:'F', color: PAL.purple,  name:'Forge',  task:'Write unit tests for auth module',        status:'queued',  pri:'Low',   eta:'—'    },
    { agent:'H', color: PAL.amber,   name:'Herald', task:'Draft cold outreach for SaaS leads',     status:'paused',  pri:'Low',   eta:'—'    },
    { agent:'C', color: PAL.muted,   name:'Cipher', task:'OWASP scan on staging environment',      status:'pending', pri:'Med',   eta:'—'    },
  ];

  const statusPal = { running:'#E8F7F1', queued:'#EEF2FF', paused:'#FEF3C7', pending:'#F0EFED' };
  const statusText = { running: PAL.green, queued: PAL.accent, paused: PAL.amber, pending: PAL.muted };

  return `
    ${rect(0, 0, W, H, PAL.bg)}

    ${text(20, 22, '9:41', 13, PAL.text, {weight:'600'})}
    ${text(W-20, 22, '●●● 100%', 11, PAL.text, {anchor:'end', opacity:'0.5'})}

    ${text(20, 58, 'Task Queue', 22, PAL.text, {weight:'700'})}
    ${text(20, 76, '7 tasks · 3 running', 13, PAL.muted)}

    <!-- Filter tabs -->
    ${rect(16, 88, 58, 28, PAL.accent, {r:14})}
    ${text(45, 107, 'All', 12, '#fff', {weight:'600', anchor:'middle'})}
    ${rect(82, 88, 62, 28, PAL.card, {r:14, stroke:PAL.border, sw:1})}
    ${text(113, 107, 'Running', 12, PAL.muted, {anchor:'middle'})}
    ${rect(152, 88, 58, 28, PAL.card, {r:14, stroke:PAL.border, sw:1})}
    ${text(181, 107, 'Queued', 12, PAL.muted, {anchor:'middle'})}
    ${rect(218, 88, 56, 28, PAL.card, {r:14, stroke:PAL.border, sw:1})}
    ${text(246, 107, 'Done', 12, PAL.muted, {anchor:'middle'})}

    ${line(0, 124, W, 124, PAL.border)}

    <!-- Task list -->
    ${tasks.map((t, i) => {
      const y = 136 + i * 93;
      const sf = statusPal[t.status] || '#F0EFED';
      const sc = statusText[t.status] || PAL.muted;
      const priColor = t.pri === 'High' ? PAL.accent2 : t.pri === 'Med' ? PAL.amber : PAL.muted;
      return `
        ${rect(16, y, W-32, 82, PAL.card, {r:12, stroke:PAL.border, sw:1})}
        ${circle(36, y+20, 10, t.color)}
        ${text(36, y+25, t.agent, 11, '#fff', {weight:'700', anchor:'middle'})}
        ${text(54, y+22, t.name, 12, PAL.muted, {weight:'500'})}
        ${rect(W-64, y+10, 40, 20, sf, {r:10})}
        ${text(W-44, y+24, t.status, 10, sc, {weight:'600', anchor:'middle'})}
        ${text(32, y+42, t.task, 12, PAL.text, {weight:'500'})}
        ${text(32, y+60, `ETA ${t.eta}`, 11, PAL.muted)}
        ${rect(W-80, y+50, 40, 18, t.pri==='High'?'#FFF0EB':t.pri==='Med'?'#FEF3C7':'#F0EFED', {r:9})}
        ${text(W-60, y+63, t.pri, 10, priColor, {weight:'600', anchor:'middle'})}
      `;
    }).join('')}

    <!-- Bottom nav -->
    ${rect(0, H-72, W, 72, PAL.surface, {stroke:PAL.border, sw:1})}
    ${text(W/5, H-40, '⌂', 18, PAL.muted, {anchor:'middle'})}
    ${text(W/5, H-22, 'Fleet', 10, PAL.muted, {anchor:'middle'})}
    ${text(2*W/5, H-40, '≡', 18, PAL.accent, {anchor:'middle'})}
    ${text(2*W/5, H-22, 'Tasks', 10, PAL.accent, {weight:'600', anchor:'middle'})}
    ${text(3*W/5, H-40, '◎', 18, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-22, 'Outcomes', 10, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-40, '⚙', 18, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-22, 'Settings', 10, PAL.muted, {anchor:'middle'})}
  `;
}

// ── SCREEN 4: Outcomes / Results ────────────────────────────────────────────
function screen4() {
  return `
    ${rect(0, 0, W, H, PAL.bg)}

    ${text(20, 22, '9:41', 13, PAL.text, {weight:'600'})}
    ${text(W-20, 22, '●●● 100%', 11, PAL.text, {anchor:'end', opacity:'0.5'})}

    ${text(20, 58, 'Outcomes', 22, PAL.text, {weight:'700'})}
    ${text(20, 76, 'What your fleet accomplished', 13, PAL.muted)}

    <!-- Today's summary card -->
    ${rect(16, 90, W-32, 100, PAL.accent, {r:16})}
    ${text(32, 116, 'TODAY', 10, 'rgba(255,255,255,0.65)', {weight:'700', ls:'0.08em'})}
    ${text(32, 144, '847', 36, '#fff', {weight:'800'})}
    ${text(32, 164, 'tasks completed', 13, 'rgba(255,255,255,0.75)')}

    <!-- mini bar chart -->
    ${miniBar(W-120, 114, [48,62,71,55,80,90,85,92,88,98,95,847].map(v=>Math.min(v,100)), 90, 52, 'rgba(255,255,255,0.35)')}
    ${text(W-76, 178, 'vs 634 yesterday', 10, 'rgba(255,255,255,0.6)', {anchor:'middle'})}

    <!-- Category breakdown -->
    ${text(20, 214, 'BY CATEGORY', 10, PAL.muted, {weight:'700', ls:'0.07em'})}

    ${[
      { label:'Research', count:312, pct:37, color:PAL.accent },
      { label:'Code gen', count:228, pct:27, color:PAL.purple },
      { label:'Data sync', count:189, pct:22, color:PAL.green },
      { label:'Outreach',  count: 84, pct:10, color:PAL.amber },
      { label:'Security',  count: 34, pct: 4, color:PAL.muted },
    ].map((c, i) => `
      ${rect(16, 228 + i*48, W-32, 40, PAL.card, {r:10, stroke:PAL.border, sw:1})}
      ${circle(34, 248 + i*48, 7, c.color)}
      ${text(50, 252 + i*48, c.label, 13, PAL.text, {weight:'500'})}
      ${text(W-20, 252 + i*48, `${c.count}`, 13, PAL.text, {weight:'600', anchor:'end'})}
      ${progress(50, 256 + i*48, W-80, c.pct, c.color)}
    `).join('')}

    <!-- Notable outcomes -->
    ${text(20, 474, 'NOTABLE RESULTS', 10, PAL.muted, {weight:'700', ls:'0.07em'})}

    ${[
      { icon:'↓', bg:'#EEF2FF', col:PAL.accent,  msg:'Scout found 6 competitor price changes — Notion raised by 20%' },
      { icon:'✓', bg:'#E8F7F1', col:PAL.green,   msg:'Forge generated 1,240 lines of tested TypeScript in 3.2 min' },
      { icon:'◈', bg:'#FEF3C7', col:PAL.amber,   msg:'Herald queued 42 personalised outreach emails, 78% open rate' },
    ].map((item, i) => `
      ${rect(16, 488 + i*72, W-32, 64, PAL.card, {r:12, stroke:PAL.border, sw:1})}
      ${rect(30, 504 + i*72, 28, 28, item.bg, {r:8})}
      ${text(44, 523 + i*72, item.icon, 14, item.col, {anchor:'middle'})}
      ${text(70, 512 + i*72, item.msg, 12, PAL.text)}
    `).join('')}

    <!-- Bottom nav -->
    ${rect(0, H-72, W, 72, PAL.surface, {stroke:PAL.border, sw:1})}
    ${text(W/5, H-40, '⌂', 18, PAL.muted, {anchor:'middle'})}
    ${text(W/5, H-22, 'Fleet', 10, PAL.muted, {anchor:'middle'})}
    ${text(2*W/5, H-40, '≡', 18, PAL.muted, {anchor:'middle'})}
    ${text(2*W/5, H-22, 'Tasks', 10, PAL.muted, {anchor:'middle'})}
    ${text(3*W/5, H-40, '◎', 18, PAL.accent, {anchor:'middle'})}
    ${text(3*W/5, H-22, 'Outcomes', 10, PAL.accent, {weight:'600', anchor:'middle'})}
    ${text(4*W/5, H-40, '⚙', 18, PAL.muted, {anchor:'middle'})}
    ${text(4*W/5, H-22, 'Settings', 10, PAL.muted, {anchor:'middle'})}
  `;
}

// ── SCREEN 5: Deploy New Agent ──────────────────────────────────────────────
function screen5() {
  const models = ['GPT-4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro', 'Mistral Large'];
  const tools = ['Web Browse', 'Code Exec', 'Email', 'Postgres', 'File I/O', 'Slack', 'GitHub', 'Stripe'];

  return `
    ${rect(0, 0, W, H, PAL.bg)}

    ${text(20, 22, '9:41', 13, PAL.text, {weight:'600'})}
    ${text(W-20, 22, '●●● 100%', 11, PAL.text, {anchor:'end', opacity:'0.5'})}

    <!-- Back -->
    ${text(20, 56, '← Fleet', 13, PAL.accent, {weight:'500'})}

    ${text(20, 82, 'Deploy Agent', 22, PAL.text, {weight:'700'})}
    ${text(20, 100, 'Configure your new team member', 13, PAL.muted)}

    ${line(0, 116, W, 116, PAL.border)}

    <!-- Name input -->
    ${text(20, 140, 'Agent Name', 11, PAL.muted, {weight:'600', ls:'0.04em'})}
    ${rect(16, 152, W-32, 44, PAL.surface, {r:10, stroke:PAL.accent, sw:1.5})}
    ${text(30, 180, 'Phantom', 15, PAL.text, {weight:'500'})}
    ${text(W-28, 180, '|', 15, PAL.accent, {anchor:'end'})}

    <!-- Role -->
    ${text(20, 216, 'Role Description', 11, PAL.muted, {weight:'600', ls:'0.04em'})}
    ${rect(16, 228, W-32, 56, PAL.surface, {r:10, stroke:PAL.border, sw:1})}
    ${text(30, 252, 'Monitor Hacker News for product mentions', 13, PAL.text)}
    ${text(30, 270, 'and summarise daily...', 13, PAL.muted)}

    <!-- Model select -->
    ${text(20, 306, 'Model', 11, PAL.muted, {weight:'600', ls:'0.04em'})}
    ${models.map((m, i) => {
      const row = Math.floor(i / 2), col = i % 2;
      const x = 16 + col * ((W-44)/2 + 12);
      const y = 318 + row * 42;
      const selected = i === 0;
      return `
        ${rect(x, y, (W-44)/2, 34, selected ? '#EEF2FF' : PAL.surface, {r:10, stroke: selected ? PAL.accent : PAL.border, sw: selected ? 1.5 : 1})}
        ${text(x + (W-44)/4, y+22, m, 11, selected ? PAL.accent : PAL.text, {anchor:'middle', weight: selected ? '600' : '400'})}
      `;
    }).join('')}

    <!-- Tools -->
    ${text(20, 410, 'Tools & Permissions', 11, PAL.muted, {weight:'600', ls:'0.04em'})}
    ${tools.map((t, i) => {
      const x = 16 + (i % 4) * ((W-44)/4 + 4);
      const y = 422 + Math.floor(i / 4) * 40;
      const on = [0,1,4].includes(i);
      return `
        ${rect(x, y, (W-44)/4, 30, on ? '#EEF2FF' : PAL.surface, {r:8, stroke: on ? PAL.accent : PAL.border, sw: on ? 1.5 : 1})}
        ${text(x + (W-44)/8, y+20, t, 10, on ? PAL.accent : PAL.muted, {anchor:'middle', weight: on ? '600' : '400'})}
      `;
    }).join('')}

    <!-- Schedule -->
    ${text(20, 512, 'Schedule', 11, PAL.muted, {weight:'600', ls:'0.04em'})}
    ${rect(16, 524, W-32, 44, PAL.surface, {r:10, stroke:PAL.border, sw:1})}
    ${text(30, 551, 'Every 2 hours', 14, PAL.text)}
    ${text(W-28, 551, '▾', 14, PAL.muted, {anchor:'end'})}

    <!-- Deploy button -->
    ${rect(16, 586, W-32, 52, PAL.accent, {r:26})}
    ${text(W/2, 618, 'Deploy Phantom →', 16, '#fff', {weight:'700', anchor:'middle'})}

    <!-- Credit note -->
    ${text(W/2, 652, 'Consumes ~4 credits/run · Est. $0.08/day', 11, PAL.muted, {anchor:'middle'})}
  `;
}

// ── ASSEMBLE PEN FILE ───────────────────────────────────────────────────────
const screens = [
  { id:'fleet',     label:'Fleet',   svg: screen1() },
  { id:'agent',     label:'Agent',   svg: screen2() },
  { id:'tasks',     label:'Tasks',   svg: screen3() },
  { id:'outcomes',  label:'Results', svg: screen4() },
  { id:'deploy',    label:'Deploy',  svg: screen5() },
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'PILOT — AI Agent Fleet Manager',
    description: 'Orchestrate, monitor, and deploy AI agents from a single warm-toned dashboard. Inspired by the agent-native SaaS trend on Minimal Gallery.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['ai', 'agents', 'saas', 'dashboard', 'light-theme', 'warm', 'editorial'],
  },
  canvas: { width: W, height: H, theme: 'light', background: PAL.bg },
  screens: screens.map((s, i) => ({
    id: s.id,
    label: s.label,
    order: i,
    canvas: { width: W, height: H, background: PAL.bg },
    layers: [{
      id: `layer-${s.id}`,
      type: 'frame',
      name: s.label,
      x: 0, y: 0, width: W, height: H,
      content: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${s.svg}</svg>`,
    }],
  })),
  flows: [
    { from:'fleet',    to:'agent',    trigger:'tap-card' },
    { from:'fleet',    to:'tasks',    trigger:'tap-nav' },
    { from:'tasks',    to:'outcomes', trigger:'tap-nav' },
    { from:'fleet',    to:'deploy',   trigger:'tap-deploy' },
    { from:'deploy',   to:'fleet',    trigger:'tap-back' },
  ],
  palette: PAL,
};

fs.writeFileSync('pilot.pen', JSON.stringify(pen, null, 2));
console.log('✓ pilot.pen written —', screens.length, 'screens');
console.log('  Fleet Dashboard, Agent Detail, Task Queue, Outcomes, Deploy');
