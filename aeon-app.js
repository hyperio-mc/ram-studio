// AEON — Persistent memory inspector for production AI agents
// Inspired by:
//   • Letta (minimal.gallery / AI category) — "designed for deeply personalized agents",
//     "persistent agents", "consistent memory" — dark minimal agent-infra UI
//   • Linear (darkmodedesign.com) — data-dense dark product UI, subtle depth layers,
//     monospace data elements mixed with clean sans-serif headings
//   • Sanity "Structure powers intelligence" (land-book.com) — "operating system" metaphor,
//     structured content as infra primitive
// Theme: DARK — near-black blue-tinted bg + indigo + cyan-teal
// Pencil.dev format v2.8

'use strict';
const fs = require('fs');

const P = {
  bg:         '#08090E',
  surface:    '#0F1118',
  surfaceAlt: '#161926',
  border:     'rgba(88,101,244,0.14)',
  borderSub:  'rgba(210,216,240,0.07)',
  text:       '#D2D8F0',
  textMuted:  'rgba(210,216,240,0.38)',
  accent:     '#5865F4',
  accentDim:  'rgba(88,101,244,0.14)',
  accentBdr:  'rgba(88,101,244,0.28)',
  cyan:       '#22D3C8',
  cyanDim:    'rgba(34,211,200,0.12)',
  green:      '#34D399',
  greenDim:   'rgba(52,211,153,0.12)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.12)',
  red:        '#F43F5E',
  redDim:     'rgba(244,63,94,0.12)',
  white:      '#FFFFFF',
};

// ── Helper ─────────────────────────────────────────────────────────────────────
const t = (text, x, y, size, weight, color, opts = {}) => ({
  type: 'text', text,
  position: { x, y },
  style: {
    fontSize: size, fontWeight: weight, color,
    letterSpacing: opts.ls ?? 0,
    textTransform: opts.tt ?? 'none',
    lineHeight: opts.lh ?? 1.3,
    fontFamily: opts.mono ? "'SF Mono','Fira Code','Courier New',monospace" : undefined,
    opacity: opts.opacity ?? 1,
  },
});

const card = (x, y, w, h, bg, radius = 16, border) => ({
  type: 'card',
  position: { x, y },
  size: { width: w, height: h },
  style: {
    backgroundColor: bg,
    borderRadius: radius,
    border: border ?? `1px solid ${P.borderSub}`,
  },
});

const row = (x, y, w, h, bg = 'transparent') => ({
  type: 'card',
  position: { x, y },
  size: { width: w, height: h },
  style: { backgroundColor: bg, borderRadius: 0, border: 'none' },
});

const dot = (x, y, r, color) => ({
  type: 'shape', shape: 'circle',
  position: { x, y },
  size: { width: r * 2, height: r * 2 },
  style: { backgroundColor: color, borderRadius: r },
});

const pill = (x, y, text, bg, color, w = 60) => ({
  type: 'badge',
  position: { x, y },
  size: { width: w, height: 22 },
  text,
  style: {
    backgroundColor: bg,
    color,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.8,
    borderRadius: 11,
    textTransform: 'uppercase',
    textAlign: 'center',
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const bar = (x, y, w, h, pct, bg, fill) => ({
  type: 'progress-bar',
  position: { x, y },
  size: { width: w, height: h },
  progress: pct,
  style: { backgroundColor: bg, borderRadius: h / 2, overflow: 'hidden' },
  fillStyle: { backgroundColor: fill, borderRadius: h / 2 },
});

const divider = (x, y, w) => ({
  type: 'shape', shape: 'rect',
  position: { x, y },
  size: { width: w, height: 1 },
  style: { backgroundColor: P.borderSub },
});

const icon = (name, x, y, size, color) => ({
  type: 'icon', name,
  position: { x, y },
  size: { width: size, height: size },
  style: { color },
});

// ── STATUS BAR ────────────────────────────────────────────────────────────────
const statusBar = (bg = P.bg) => ({
  type: 'statusbar',
  position: { x: 0, y: 0 },
  size: { width: 390, height: 44 },
  style: { backgroundColor: bg, time: '09:41', color: P.text },
});

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
const bottomNav = (active) => {
  const tabs = [
    { id: 'agents',   label: 'Agents',   icon: 'layers' },
    { id: 'memory',   label: 'Memory',   icon: 'code' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'health',   label: 'Health',   icon: 'heart' },
    { id: 'inject',   label: 'Inject',   icon: 'zap' },
  ];
  const tabW = 78;
  const children = [];
  tabs.forEach((tab, i) => {
    const isActive = tab.id === active;
    const cx = i * tabW + tabW / 2;
    children.push({
      type: 'icon', name: tab.icon,
      position: { x: cx - 11, y: 10 },
      size: { width: 22, height: 22 },
      style: { color: isActive ? P.accent : P.textMuted },
    });
    children.push(t(tab.label, cx - 20, 36, 9, isActive ? 700 : 400,
      isActive ? P.accent : P.textMuted, { ls: 0.3, tt: 'none' }));
    if (isActive) {
      children.push({
        type: 'shape', shape: 'rect',
        position: { x: cx - 20, y: 54 },
        size: { width: 40, height: 2 },
        style: { backgroundColor: P.accent, borderRadius: 1 },
      });
    }
  });
  return {
    type: 'card',
    position: { x: 0, y: 786 },
    size: { width: 390, height: 58 },
    style: {
      backgroundColor: P.surface,
      borderTop: `1px solid ${P.borderSub}`,
      borderRadius: 0,
    },
    children,
  };
};

// ── SCREEN 1: AGENTS ─────────────────────────────────────────────────────────
const agentItems = [
  { name: 'Aria', role: 'Customer Support', status: 'ACTIVE', memPct: 72, color: P.cyan,   lastSeen: '12s ago',   tokens: '94.2k' },
  { name: 'Rex',  role: 'Code Review',      status: 'ACTIVE', memPct: 48, color: P.green,  lastSeen: '1m ago',    tokens: '61.1k' },
  { name: 'Luma', role: 'Research Digest',  status: 'IDLE',   memPct: 31, color: P.accent, lastSeen: '22m ago',   tokens: '39.7k' },
  { name: 'Volt', role: 'Ops Automation',   status: 'ACTIVE', memPct: 88, color: P.amber,  lastSeen: '5s ago',    tokens: '112.4k' },
  { name: 'Iris', role: 'Data Extraction',  status: 'ERROR',  memPct: 15, color: P.red,    lastSeen: '3h ago',    tokens: '18.3k' },
];

const screen1 = {
  id: 'agents',
  label: 'Agents',
  backgroundColor: P.bg,
  elements: [
    statusBar(),
    // Header
    t('AEON', 20, 52, 13, 800, P.accent, { ls: 3, tt: 'uppercase' }),
    t('Agent Fleet', 76, 52, 13, 400, P.text),
    icon('bell', 340, 50, 20, P.textMuted),
    icon('user', 364, 50, 22, P.textMuted),

    // Stats row
    card(20, 84, 107, 68, P.surfaceAlt, 14),
    t('AGENTS', 32, 96, 8, 700, P.textMuted, { ls: 1.5, tt: 'uppercase' }),
    t('5', 32, 112, 28, 800, P.text),
    t('3 active', 32, 144, 10, 400, P.cyan),

    card(141, 84, 107, 68, P.surfaceAlt, 14),
    t('MEMORY', 153, 96, 8, 700, P.textMuted, { ls: 1.5, tt: 'uppercase' }),
    t('325k', 153, 112, 28, 800, P.text),
    t('tokens total', 153, 144, 10, 400, P.textMuted),

    card(262, 84, 107, 68, P.surfaceAlt, 14),
    t('ALERTS', 274, 96, 8, 700, P.textMuted, { ls: 1.5, tt: 'uppercase' }),
    t('1', 274, 112, 28, 800, P.red),
    t('Iris · error', 274, 144, 10, 400, P.red),

    // Section label
    t('ALL AGENTS', 20, 166, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),

    // Agent list cards
    ...agentItems.flatMap((a, i) => {
      const y = 183 + i * 108;
      const statusColor = a.status === 'ACTIVE' ? P.green : a.status === 'IDLE' ? P.amber : P.red;
      const statusBg = a.status === 'ACTIVE' ? P.greenDim : a.status === 'IDLE' ? P.amberDim : P.redDim;
      return [
        card(20, y, 350, 96, P.surface, 16),
        // Avatar ring
        { type: 'shape', shape: 'circle', position: { x: 36, y: y + 18 }, size: { width: 40, height: 40 },
          style: { backgroundColor: a.color + '22', border: `2px solid ${a.color}55`, borderRadius: 20 } },
        t(a.name[0], 51, y + 30, 16, 700, a.color),
        // Name & role
        t(a.name, 88, y + 18, 15, 700, P.text),
        t(a.role, 88, y + 37, 11, 400, P.textMuted),
        // Status pill
        pill(240, y + 18, a.status, statusBg, statusColor, 56),
        // Token count
        t(a.tokens, 310, y + 18, 11, 600, P.textMuted, { mono: true }),
        t('tokens', 310, y + 32, 9, 400, P.textMuted),
        // Memory bar
        t('MEM', 36, y + 68, 8, 700, P.textMuted, { ls: 1.5, tt: 'uppercase' }),
        bar(66, y + 72, 200, 4, a.memPct, P.surfaceAlt, a.color),
        t(`${a.memPct}%`, 274, y + 68, 9, 600, a.color, { mono: true }),
        t(a.lastSeen, 310, y + 68, 9, 400, P.textMuted),
      ];
    }),

    bottomNav('agents'),
  ],
};

// ── SCREEN 2: MEMORY ─────────────────────────────────────────────────────────
const memFragments = [
  { type: 'PERSONA',    content: 'You are Aria, a warm and precise customer support specialist for Acme SaaS. Respond concisely, always verify account status before escalating.', tags: ['core', 'identity'], age: '14d', size: '0.8k', color: P.cyan },
  { type: 'PREFERENCE', content: 'User prefers formal tone. Avoids jargon. Last escalation: billing issue resolved via account credit on 2026-03-10.', tags: ['user', 'tone'], age: '6d', size: '0.4k', color: P.accent },
  { type: 'CONTEXT',    content: 'Current open ticket #4892: Pro plan downgrade request. Customer has been on Pro for 2 years. Retention script attached.', tags: ['ticket', 'active'], age: '2h', size: '1.2k', color: P.amber },
  { type: 'LEARNING',   content: 'Billing-related queries spike Mondays 9–11am UTC. Pre-load billing FAQ. Avg resolution time: 4.2 min.', tags: ['pattern', 'billing'], age: '3d', size: '0.6k', color: P.green },
];

const screen2 = {
  id: 'memory',
  label: 'Memory',
  backgroundColor: P.bg,
  elements: [
    statusBar(),
    // Header with back
    icon('layers', 20, 52, 18, P.accent),
    t('Aria', 46, 52, 15, 700, P.text),
    t('· Memory Bank', 88, 52, 14, 400, P.textMuted),
    icon('search', 338, 50, 20, P.textMuted),
    icon('plus', 362, 50, 20, P.accent),

    // Agent mini summary
    card(20, 80, 350, 52, P.surfaceAlt, 12),
    dot(36, 95, 6, P.cyan),
    t('ACTIVE · Customer Support', 50, 91, 9, 700, P.cyan, { ls: 1.2, tt: 'uppercase' }),
    t('4 memory blocks · 3.0k tokens · Last write 12s ago', 50, 107, 10, 400, P.textMuted),

    // Memory context used
    t('CONTEXT WINDOW', 20, 145, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    bar(20, 157, 262, 6, 72, P.surfaceAlt, P.cyan),
    t('72% · 94.2k / 128k', 290, 153, 10, 600, P.cyan, { mono: true }),

    // Fragment cards
    ...memFragments.flatMap((m, i) => {
      const y = 178 + i * 138;
      return [
        card(20, y, 350, 126, P.surface, 14, `1px solid ${m.color}28`),
        // Type tag
        { type: 'shape', shape: 'rect', position: { x: 20, y }, size: { width: 3, height: 126 },
          style: { backgroundColor: m.color, borderRadius: '2px 0 0 2px' } },
        t(m.type, 32, y + 12, 8, 700, m.color, { ls: 1.5, tt: 'uppercase' }),
        t(m.age + ' ago', 320, y + 12, 9, 400, P.textMuted),
        t(m.content, 32, y + 30, 11, 400, P.text, { lh: 1.55 }),
        // Tags row
        ...m.tags.map((tag, ti) => ({
          type: 'badge',
          position: { x: 32 + ti * 64, y: y + 96 },
          size: { width: 56, height: 20 },
          text: tag,
          style: { backgroundColor: m.color + '18', color: m.color, fontSize: 9, fontWeight: 600,
            letterSpacing: 0.5, borderRadius: 10, textAlign: 'center' },
        })),
        t(m.size + ' tokens', 300, y + 97, 9, 500, P.textMuted, { mono: true }),
      ];
    }),

    bottomNav('memory'),
  ],
};

// ── SCREEN 3: ACTIVITY ───────────────────────────────────────────────────────
const activities = [
  { time: '09:41:02', type: 'WRITE',  agent: 'Aria',  desc: 'Context block updated — ticket #4892 status changed to open', icon: 'code',   color: P.accent },
  { time: '09:38:54', type: 'READ',   agent: 'Volt',  desc: 'Ops runbook retrieved — incident playbook #7 loaded into context', icon: 'eye',    color: P.cyan },
  { time: '09:35:11', type: 'INJECT', agent: 'Rex',   desc: 'Manual injection — PR #2041 diff injected by @devadmin', icon: 'zap',    color: P.amber },
  { time: '09:31:40', type: 'PRUNE',  agent: 'Luma',  desc: 'Memory compaction — 12 stale fragments pruned, freed 8.4k tokens', icon: 'filter', color: P.textMuted },
  { time: '09:28:07', type: 'ERROR',  agent: 'Iris',  desc: 'Memory write failed — context window overflow at 128k limit', icon: 'alert',  color: P.red },
  { time: '09:22:50', type: 'WRITE',  agent: 'Aria',  desc: 'Learning fragment appended — billing spike pattern detected', icon: 'code',   color: P.accent },
  { time: '09:18:30', type: 'READ',   agent: 'Rex',   desc: 'Code style guide retrieved — eslint config v3 loaded', icon: 'eye',    color: P.cyan },
];

const screen3 = {
  id: 'activity',
  label: 'Activity',
  backgroundColor: P.bg,
  elements: [
    statusBar(),
    t('Activity', 20, 52, 18, 700, P.text),
    t('Live', 110, 52, 12, 600, P.green),
    dot(128, 57, 4, P.green),
    icon('filter', 338, 50, 20, P.textMuted),
    icon('search', 362, 50, 20, P.textMuted),

    // Filter chips
    ...['All', 'Write', 'Read', 'Inject', 'Error'].map((label, i) => ({
      type: 'badge',
      position: { x: 20 + i * 68, y: 78 },
      size: { width: 60, height: 26 },
      text: label,
      style: {
        backgroundColor: i === 0 ? P.accent : P.surfaceAlt,
        color: i === 0 ? P.white : P.textMuted,
        fontSize: 10, fontWeight: i === 0 ? 700 : 400,
        borderRadius: 13, textAlign: 'center',
      },
    })),

    // Timeline
    ...activities.flatMap((a, i) => {
      const y = 118 + i * 88;
      return [
        // Timeline dot + line
        { type: 'shape', shape: 'circle', position: { x: 28, y: y + 14 }, size: { width: 10, height: 10 },
          style: { backgroundColor: a.color, borderRadius: 5 } },
        ...(i < activities.length - 1 ? [{
          type: 'shape', shape: 'rect', position: { x: 32, y: y + 26 }, size: { width: 2, height: 60 },
          style: { backgroundColor: P.borderSub },
        }] : []),

        // Event card
        card(48, y, 322, 76, P.surface, 12),
        // Type + time row
        t(a.type, 60, y + 10, 8, 700, a.color, { ls: 1.5, tt: 'uppercase' }),
        t('·', 112, y + 10, 9, 400, P.textMuted),
        t(a.agent, 120, y + 10, 10, 600, P.text),
        t(a.time, 270, y + 10, 9, 400, P.textMuted, { mono: true }),
        t(a.desc, 60, y + 30, 10, 400, P.textMuted, { lh: 1.5 }),
        icon(a.icon, 340, y + 10, 14, a.color),
      ];
    }),

    bottomNav('activity'),
  ],
};

// ── SCREEN 4: HEALTH ─────────────────────────────────────────────────────────
const screen4 = {
  id: 'health',
  label: 'Health',
  backgroundColor: P.bg,
  elements: [
    statusBar(),
    t('System Health', 20, 52, 18, 700, P.text),
    icon('settings', 360, 50, 20, P.textMuted),

    // Overall score
    card(20, 80, 350, 80, P.surfaceAlt, 16),
    t('FLEET STATUS', 36, 92, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    t('NOMINAL', 36, 110, 22, 800, P.green),
    t('4/5 agents healthy · 1 error state', 36, 140, 10, 400, P.textMuted),
    { type: 'shape', shape: 'circle', position: { x: 292, y: 90 }, size: { width: 60, height: 60 },
      style: { backgroundColor: P.greenDim, border: `3px solid ${P.green}`, borderRadius: 30 } },
    t('96%', 305, 112, 14, 800, P.green),

    // Metrics grid
    t('AGENT METRICS', 20, 176, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    ...[
      { label: 'Avg Memory Use', value: '55%', sub: 'across fleet', color: P.cyan, x: 20, y: 192 },
      { label: 'Write Ops/min', value: '284', sub: 'last 5 min', color: P.accent, x: 195, y: 192 },
      { label: 'Injections Today', value: '12', sub: '3 manual', color: P.amber, x: 20, y: 270 },
      { label: 'Prune Events', value: '7', sub: 'last 24h', color: P.textMuted, x: 195, y: 270 },
    ].flatMap(m => [
      card(m.x, m.y, 155, 68, P.surface, 14),
      t(m.label, m.x + 14, m.y + 12, 8, 700, P.textMuted, { ls: 1, tt: 'uppercase' }),
      t(m.value, m.x + 14, m.y + 28, 22, 800, m.color),
      t(m.sub, m.x + 14, m.y + 54, 9, 400, P.textMuted),
    ]),

    // Per-agent health table
    t('AGENT HEALTH TABLE', 20, 352, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    ...agentItems.flatMap((a, i) => {
      const y = 368 + i * 62;
      const statusColor = a.status === 'ACTIVE' ? P.green : a.status === 'IDLE' ? P.amber : P.red;
      return [
        i % 2 === 0 ? card(20, y, 350, 52, P.surface, 10) : card(20, y, 350, 52, P.surfaceAlt, 10),
        dot(36, y + 20, 5, statusColor),
        t(a.name, 50, y + 14, 12, 600, P.text),
        t(a.role, 50, y + 30, 9, 400, P.textMuted),
        bar(140, y + 21, 100, 4, a.memPct, P.surfaceAlt, statusColor),
        t(`${a.memPct}%`, 248, y + 17, 9, 600, statusColor, { mono: true }),
        t(a.tokens, 300, y + 17, 9, 500, P.textMuted, { mono: true }),
        t(a.lastSeen, 300, y + 31, 9, 400, P.textMuted),
      ];
    }),

    bottomNav('health'),
  ],
};

// ── SCREEN 5: INJECT ─────────────────────────────────────────────────────────
const screen5 = {
  id: 'inject',
  label: 'Inject',
  backgroundColor: P.bg,
  elements: [
    statusBar(),
    t('Context Inject', 20, 52, 18, 700, P.text),
    t('Manual', 163, 52, 12, 500, P.accent),

    // Target agent selector
    t('TARGET AGENT', 20, 88, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    card(20, 104, 350, 52, P.surface, 12),
    dot(36, 124, 6, P.cyan),
    t('Aria', 52, 115, 14, 700, P.text),
    t('Customer Support · 94.2k tokens active', 52, 133, 10, 400, P.textMuted),
    icon('chevron-down', 348, 120, 18, P.textMuted),

    // Fragment type
    t('MEMORY TYPE', 20, 168, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    ...[
      { label: 'Context', color: P.accent, x: 20 },
      { label: 'Persona', color: P.cyan, x: 100 },
      { label: 'Learning', color: P.green, x: 184 },
      { label: 'Instruction', color: P.amber, x: 264 },
    ].map((b, i) => ({
      type: 'badge',
      position: { x: b.x, y: 184 },
      size: { width: 72, height: 28 },
      text: b.label,
      style: {
        backgroundColor: i === 0 ? P.accent : P.surfaceAlt,
        color: i === 0 ? P.white : P.textMuted,
        fontSize: 10, fontWeight: i === 0 ? 700 : 400,
        borderRadius: 14, textAlign: 'center',
        border: i === 0 ? 'none' : `1px solid ${P.borderSub}`,
      },
    })),

    // Textarea
    t('CONTENT', 20, 226, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    card(20, 242, 350, 140, P.surface, 12, `1px solid ${P.accentBdr}`),
    t('The user has been flagged as a VIP enterprise customer (ARR $120k+). Always acknowledge their premium status and escalate to Level-2 support if unresolved in 2 exchanges.', 34, 254, 11, 400, P.text, { lh: 1.65 }),

    // Metadata row
    t('TTL (hours)', 20, 396, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    t('PRIORITY', 180, 396, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    card(20, 412, 140, 40, P.surface, 10),
    t('24', 36, 422, 16, 700, P.text, { mono: true }),
    t('hours', 64, 422, 10, 400, P.textMuted),
    icon('chevron-up', 140, 422, 16, P.textMuted),
    card(180, 412, 190, 40, P.surface, 10),
    t('HIGH', 196, 418, 12, 700, P.amber),
    dot(238, 427, 4, P.amber),
    t('Overrides base persona', 250, 418, 9, 400, P.textMuted),

    // Warning notice
    card(20, 466, 350, 44, P.amberDim, 10, `1px solid ${P.amber}30`),
    icon('alert', 34, 480, 14, P.amber),
    t('Injected context persists until TTL expires or manually cleared.', 56, 479, 10, 500, P.amber, { lh: 1.4 }),

    // Submit button
    {
      type: 'button',
      position: { x: 20, y: 524 },
      size: { width: 350, height: 52 },
      text: 'Inject Memory Fragment',
      style: {
        backgroundColor: P.accent,
        color: P.white,
        fontSize: 14, fontWeight: 700,
        borderRadius: 16,
        letterSpacing: 0.3,
      },
    },

    // Recent injections
    t('RECENT INJECTIONS', 20, 592, 8, 700, P.textMuted, { ls: 2, tt: 'uppercase' }),
    ...[
      { agent: 'Rex', type: 'Context', time: '09:35', by: '@devadmin', color: P.amber },
      { agent: 'Luma', type: 'Instruction', time: 'Yesterday', by: '@ops-bot', color: P.accent },
    ].flatMap((r, i) => [
      card(20, 608 + i * 64, 350, 52, P.surface, 12),
      dot(34, 628 + i * 64, 5, r.color),
      t(r.agent, 48, 620 + i * 64, 12, 600, P.text),
      t('·', 79, 620 + i * 64, 10, 400, P.textMuted),
      t(r.type, 88, 620 + i * 64, 11, 500, r.color),
      t(r.by, 48, 636 + i * 64, 9, 400, P.textMuted),
      t(r.time, 326, 620 + i * 64, 9, 400, P.textMuted),
    ]),

    bottomNav('inject'),
  ],
};

// ── PEN ASSEMBLY ─────────────────────────────────────────────────────────────
const pen = {
  name: 'AEON',
  version: '2.8',
  metadata: {
    description: 'AEON — Persistent memory inspector for production AI agents. 5 screens: Agents · Memory · Activity · Health · Inject.',
    theme: 'dark',
    palette: `bg ${P.bg}, surface ${P.surface}, text ${P.text}, accent ${P.accent} indigo, cyan ${P.cyan}`,
    archetype: 'ai-devtools',
    created: new Date().toISOString(),
    inspiration: 'Letta (minimal.gallery AI category) · Linear (darkmodedesign.com) · Sanity (land-book.com)',
  },
  settings: {
    viewport: { width: 390, height: 844 },
    fontFamily: 'Inter',
    borderRadius: 14,
    theme: {
      bg: P.bg,
      surface: P.surface,
      surfaceAlt: P.surfaceAlt,
      border: P.border,
      text: P.text,
      textMuted: P.textMuted,
      accent: P.accent,
      accentDim: P.accentDim,
      success: P.green,
      successDim: P.greenDim,
      warning: P.amber,
      warningDim: P.amberDim,
      danger: P.red,
      dangerDim: P.redDim,
    },
  },
  screens: [screen1, screen2, screen3, screen4, screen5],
};

fs.writeFileSync('aeon.pen', JSON.stringify(pen, null, 2));
console.log('✓ aeon.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.label).join(', '));
