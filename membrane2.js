#!/usr/bin/env node
// Membrane 2 Mobile App — .pen file generator
// 8 screens covering all 4 UX focus areas

const fs = require('fs');
const path = require('path');

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  BG:        '#0a0d14',
  CARD:      '#111827',
  CARD2:     '#1a2236',
  BORDER:    '#1e2a3a',
  BLUE:      '#3B82F6',
  BLUE_DIM:  '#1d4ed8',
  GREEN:     '#10B981',
  PURPLE:    '#8B5CF6',
  RED:       '#EF4444',
  YELLOW:    '#F59E0B',
  TEXT:      '#F9FAFB',
  MUTED:     '#6B7280',
  SUBTLE:    '#374151',
  W:         390,
  H:         844,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const frame = (name, children, extra = {}) => ({
  type: 'frame', name,
  x: 0, y: 0, width: T.W, height: T.H,
  fill: T.BG,
  clipsContent: true,
  layout: 'vertical', gap: 0,
  ...extra,
  children,
});

const rect = (name, props) => ({ type: 'rectangle', name, ...props });

const text = (name, content, props) => ({
  type: 'text', name, content,
  fill: T.TEXT, fontSize: 14, fontWeight: 400,
  ...props,
});

const statusBar = () => rect('status-bar', {
  x: 0, y: 0, width: T.W, height: 44,
  fill: { type: 'color', color: T.BG, opacity: 0.95 },
});

const navBar = (title, hasBack = false) => ({
  type: 'frame', name: 'nav-bar',
  x: 0, y: 44, width: T.W, height: 56,
  fill: { type: 'color', color: T.BG, opacity: 0.98 },
  layout: 'horizontal', gap: 0, padding: [0, 20, 0, 20],
  alignItems: 'center', justifyContent: 'start',
  children: [
    ...(hasBack ? [text('back', '← Back', { fontSize: 15, fill: T.BLUE, width: 70 })] : []),
    text('title', title, {
      fontSize: 18, fontWeight: 700, fill: T.TEXT,
      width: hasBack ? T.W - 90 - 40 : T.W - 40,
    }),
    text('icon', '⋮', { fontSize: 22, fill: T.MUTED, width: 30 }),
  ],
});

const pill = (label, color, bg) => ({
  type: 'frame', name: 'pill',
  layout: 'horizontal', gap: 4,
  padding: [4, 10, 4, 10],
  fill: bg || { type: 'color', color, opacity: 0.15 },
  cornerRadius: 20,
  children: [text('label', label, { fontSize: 11, fill: color, fontWeight: 600 })],
});

const card = (name, children, extra = {}) => ({
  type: 'frame', name,
  x: 20, width: T.W - 40,
  fill: T.CARD, cornerRadius: 14,
  layout: 'vertical', gap: 12, padding: [16, 16, 16, 16],
  ...extra,
  children,
});

const divider = () => rect('divider', {
  width: T.W - 40, height: 1,
  fill: T.BORDER, x: 20,
});

const sectionLabel = (label) => text('section', label.toUpperCase(), {
  x: 20, fontSize: 11, fontWeight: 700,
  fill: T.MUTED,
});

const btn = (label, color = T.BLUE, full = true) => ({
  type: 'frame', name: 'btn',
  x: 20, width: full ? T.W - 40 : undefined,
  fill: color, cornerRadius: 12,
  padding: [14, 20, 14, 20],
  layout: 'horizontal', gap: 0,
  justifyContent: 'center',
  children: [text('label', label, { fontSize: 15, fontWeight: 700, fill: '#fff' })],
});

const ghostBtn = (label) => ({
  type: 'frame', name: 'btn-ghost',
  x: 20, width: T.W - 40,
  fill: { type: 'color', color: T.BLUE, opacity: 0.1 },
  cornerRadius: 12,
  padding: [14, 20, 14, 20],
  layout: 'horizontal', gap: 0,
  justifyContent: 'center',
  children: [text('label', label, { fontSize: 15, fontWeight: 600, fill: T.BLUE })],
});

const agentRow = (name, type, status, memories) => ({
  type: 'frame', name: `agent-${name}`,
  layout: 'horizontal', gap: 12, padding: [12, 16, 12, 16],
  fill: T.CARD, cornerRadius: 12,
  x: 20, width: T.W - 40,
  alignItems: 'center',
  children: [
    rect('avatar', {
      width: 44, height: 44, cornerRadius: 22,
      fill: { type: 'color', color: T.PURPLE, opacity: 0.2 },
    }),
    {
      type: 'frame', name: 'info', layout: 'vertical', gap: 4, width: T.W - 40 - 44 - 12 - 32 - 16 - 16,
      children: [
        text('name', name, { fontSize: 14, fontWeight: 600 }),
        text('type', type, { fontSize: 12, fill: T.MUTED }),
      ],
    },
    { type: 'frame', name: 'meta', layout: 'vertical', gap: 4, alignItems: 'end',
      children: [
        pill(status, status === 'Active' ? T.GREEN : T.YELLOW),
        text('count', `${memories} mem`, { fontSize: 11, fill: T.MUTED }),
      ],
    },
  ],
});

const memRow = (title, preview, type, time) => ({
  type: 'frame', name: `mem-${title}`,
  layout: 'vertical', gap: 6, padding: [14, 16, 14, 16],
  fill: T.CARD, cornerRadius: 12,
  x: 20, width: T.W - 40,
  children: [
    {
      type: 'frame', name: 'row-top', layout: 'horizontal', gap: 8, alignItems: 'center',
      children: [
        text('icon', type === 'private' ? '🔒' : '🌐', { fontSize: 14, width: 20 }),
        text('title', title, { fontSize: 13, fontWeight: 600, width: T.W - 40 - 20 - 80 - 16 }),
        text('time', time, { fontSize: 11, fill: T.MUTED, width: 60 }),
      ],
    },
    text('preview', preview, { fontSize: 12, fill: T.MUTED }),
  ],
});

const toggleRow = (label, sub, on, color = T.GREEN) => ({
  type: 'frame', name: `toggle-${label}`,
  layout: 'horizontal', gap: 12, padding: [14, 16, 14, 16],
  fill: T.CARD, cornerRadius: 12,
  x: 20, width: T.W - 40,
  alignItems: 'center',
  children: [
    {
      type: 'frame', name: 'text', layout: 'vertical', gap: 3,
      width: T.W - 40 - 52 - 12 - 16 - 16,
      children: [
        text('label', label, { fontSize: 14, fontWeight: 600 }),
        text('sub', sub, { fontSize: 12, fill: T.MUTED }),
      ],
    },
    rect('toggle-track', {
      width: 48, height: 28, cornerRadius: 14,
      fill: on ? color : T.SUBTLE,
    }),
  ],
});

// ── Screen 1: Home Dashboard ───────────────────────────────────────────────────
const screen1 = frame('Home Dashboard', [
  statusBar(),
  navBar('Membrane 2'),
  // Hero greeting
  {
    type: 'frame', name: 'greeting', layout: 'vertical', gap: 4,
    x: 20, y: 100, padding: [20, 0, 8, 0],
    children: [
      text('hello', 'Good morning, Rakis', { fontSize: 13, fill: T.MUTED }),
      text('headline', 'Your Agents', { fontSize: 26, fontWeight: 800 }),
    ],
  },
  // Stats row
  {
    type: 'frame', name: 'stats', layout: 'horizontal', gap: 10,
    x: 20, width: T.W - 40, padding: [0, 0, 0, 0],
    children: [
      { type: 'frame', name: 'stat-1', layout: 'vertical', gap: 4, padding: [14, 0, 14, 16],
        fill: T.CARD, cornerRadius: 12, width: (T.W - 50) / 3,
        children: [
          text('val', '4', { fontSize: 24, fontWeight: 800, fill: T.BLUE }),
          text('lbl', 'Agents', { fontSize: 12, fill: T.MUTED }),
        ]},
      { type: 'frame', name: 'stat-2', layout: 'vertical', gap: 4, padding: [14, 0, 14, 16],
        fill: T.CARD, cornerRadius: 12, width: (T.W - 50) / 3,
        children: [
          text('val', '1.2k', { fontSize: 24, fontWeight: 800, fill: T.PURPLE }),
          text('lbl', 'Memories', { fontSize: 12, fill: T.MUTED }),
        ]},
      { type: 'frame', name: 'stat-3', layout: 'vertical', gap: 4, padding: [14, 0, 14, 16],
        fill: T.CARD, cornerRadius: 12, width: (T.W - 50) / 3,
        children: [
          text('val', '89%', { fontSize: 24, fontWeight: 800, fill: T.GREEN }),
          text('lbl', 'Private', { fontSize: 12, fill: T.MUTED }),
        ]},
    ],
  },
  // Agent list
  { type: 'frame', name: 'spacer', height: 20 },
  sectionLabel('Connected Agents'),
  { type: 'frame', name: 'spacer', height: 8 },
  agentRow('RAM', 'Design Agent · Claude', 'Active', 247),
  { type: 'frame', name: 'spacer', height: 8 },
  agentRow('Scout', 'Dev Agent · GPT-4o', 'Active', 893),
  { type: 'frame', name: 'spacer', height: 8 },
  agentRow('Clu', 'Orchestrator · Claude', 'Active', 62),
  { type: 'frame', name: 'spacer', height: 8 },
  agentRow('MCP-01', 'Tool Agent · Local', 'Idle', 14),
  // Bottom tab bar
  rect('tab-bar-bg', { x: 0, y: T.H - 80, width: T.W, height: 80, fill: T.CARD2 }),
  {
    type: 'frame', name: 'tab-bar', layout: 'horizontal', gap: 0,
    x: 0, y: T.H - 76, width: T.W, height: 56,
    justifyContent: 'space_between', padding: [0, 30, 0, 30],
    alignItems: 'center',
    children: [
      { type: 'frame', name: 'tab-home', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [
          text('ico', '⬡', { fontSize: 22, fill: T.BLUE }),
          text('lbl', 'Agents', { fontSize: 10, fill: T.BLUE }),
        ]},
      { type: 'frame', name: 'tab-mem', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [
          text('ico', '◎', { fontSize: 22, fill: T.MUTED }),
          text('lbl', 'Memories', { fontSize: 10, fill: T.MUTED }),
        ]},
      { type: 'frame', name: 'tab-priv', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [
          text('ico', '⊕', { fontSize: 22, fill: T.MUTED }),
          text('lbl', 'Privacy', { fontSize: 10, fill: T.MUTED }),
        ]},
      { type: 'frame', name: 'tab-settings', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [
          text('ico', '◈', { fontSize: 22, fill: T.MUTED }),
          text('lbl', 'Settings', { fontSize: 10, fill: T.MUTED }),
        ]},
    ],
  },
]);

// ── Screen 2: Agent Discovery ───────────────────────────────────────────────────
const screen2 = frame('Agent Discovery', [
  statusBar(),
  navBar('Connect Agent'),
  // Search bar
  {
    type: 'frame', name: 'search-wrap',
    x: 20, width: T.W - 40,
    fill: T.CARD, cornerRadius: 12,
    layout: 'horizontal', gap: 10, padding: [12, 16, 12, 16],
    alignItems: 'center',
    children: [
      text('icon', '🔍', { fontSize: 16, width: 20 }),
      text('placeholder', 'Search agents by name or type…', { fontSize: 14, fill: T.MUTED }),
    ],
  },
  { type: 'frame', name: 'spacer', height: 8 },
  // Category pills
  {
    type: 'frame', name: 'categories',
    layout: 'horizontal', gap: 8,
    x: 20,
    children: [
      pill('All', T.BLUE),
      pill('Claude', T.PURPLE),
      pill('GPT', T.GREEN),
      pill('Local', T.YELLOW),
    ],
  },
  { type: 'frame', name: 'spacer', height: 16 },
  sectionLabel('Suggested Agents'),
  { type: 'frame', name: 'spacer', height: 8 },
  // Agent discovery cards
  ...[
    ['Perplexity Search', 'Research · Web', T.BLUE],
    ['Code Reviewer', 'Engineering · GPT-4o', T.GREEN],
    ['Email Drafter', 'Productivity · Claude', T.PURPLE],
    ['Data Analyst', 'Analytics · Gemini', T.YELLOW],
  ].map(([name, type, color]) => ({
    type: 'frame', name: `disc-${name}`,
    layout: 'horizontal', gap: 12, padding: [14, 16, 14, 16],
    fill: T.CARD, cornerRadius: 12,
    x: 20, width: T.W - 40,
    alignItems: 'center',
    children: [
      rect('avatar', { width: 44, height: 44, cornerRadius: 22, fill: { type: 'color', color, opacity: 0.18 } }),
      {
        type: 'frame', name: 'info', layout: 'vertical', gap: 4,
        width: T.W - 40 - 44 - 12 - 80 - 16 - 16,
        children: [
          text('name', name, { fontSize: 14, fontWeight: 600 }),
          text('type', type, { fontSize: 12, fill: T.MUTED }),
        ],
      },
      {
        type: 'frame', name: 'cta',
        fill: T.BLUE, cornerRadius: 8,
        padding: [7, 14, 7, 14],
        layout: 'horizontal',
        justifyContent: 'center',
        children: [text('label', 'Connect', { fontSize: 12, fontWeight: 700, fill: '#fff' })],
      },
    ],
  })),
  { type: 'frame', name: 'spacer', height: 16 },
  btn('+ Register Custom Agent', T.PURPLE),
]);

// ── Screen 3: Agent Connection Flow ───────────────────────────────────────────
const screen3 = frame('Agent Connection Flow', [
  statusBar(),
  navBar('Connecting Agent', true),
  { type: 'frame', name: 'spacer', height: 24 },
  // Big agent icon
  {
    type: 'frame', name: 'agent-hero', layout: 'vertical', gap: 12,
    x: 0, width: T.W, alignItems: 'center',
    children: [
      rect('big-avatar', { width: 80, height: 80, cornerRadius: 40, fill: { type: 'color', color: T.BLUE, opacity: 0.18 } }),
      text('agent-name', 'Perplexity Search', { fontSize: 20, fontWeight: 700 }),
      text('agent-type', 'Research Agent · Web browsing + summarization', { fontSize: 13, fill: T.MUTED }),
    ],
  },
  { type: 'frame', name: 'spacer', height: 24 },
  sectionLabel('Permissions Requested'),
  { type: 'frame', name: 'spacer', height: 10 },
  // Permission list
  ...['Read episodic memories', 'Write semantic memories', 'Access public memory index'].map((p, i) => ({
    type: 'frame', name: `perm-${i}`,
    layout: 'horizontal', gap: 12, padding: [12, 16, 12, 16],
    fill: T.CARD, cornerRadius: 10,
    x: 20, width: T.W - 40,
    alignItems: 'center',
    children: [
      text('check', '✓', { fontSize: 16, fill: T.GREEN, width: 20 }),
      text('label', p, { fontSize: 14 }),
    ],
  })),
  { type: 'frame', name: 'spacer', height: 8 },
  {
    type: 'frame', name: 'perm-private',
    layout: 'horizontal', gap: 12, padding: [12, 16, 12, 16],
    fill: T.CARD, cornerRadius: 10,
    x: 20, width: T.W - 40,
    alignItems: 'center',
    children: [
      text('check', '✗', { fontSize: 16, fill: T.RED, width: 20 }),
      text('label', 'Read private/encrypted memories', { fontSize: 14, fill: T.MUTED }),
    ],
  },
  { type: 'frame', name: 'spacer', height: 28 },
  btn('Approve & Connect', T.GREEN),
  { type: 'frame', name: 'spacer', height: 10 },
  ghostBtn('Deny Connection'),
]);

// ── Screen 4: Memory Browser ──────────────────────────────────────────────────
const screen4 = frame('Memory Browser', [
  statusBar(),
  navBar('Memories'),
  // Search + filter
  {
    type: 'frame', name: 'search-wrap',
    x: 20, width: T.W - 40,
    fill: T.CARD, cornerRadius: 12,
    layout: 'horizontal', gap: 10, padding: [12, 16, 12, 16],
    alignItems: 'center',
    children: [
      text('icon', '🔍', { fontSize: 16, width: 20 }),
      text('placeholder', 'Search memories…', { fontSize: 14, fill: T.MUTED }),
      text('filter', '⚙', { fontSize: 18, fill: T.BLUE, width: 24 }),
    ],
  },
  { type: 'frame', name: 'spacer', height: 8 },
  // Filter tabs
  {
    type: 'frame', name: 'filter-tabs',
    layout: 'horizontal', gap: 8, x: 20,
    children: [
      pill('All', T.BLUE),
      pill('Episodic 🕐', T.PURPLE),
      pill('Semantic 📚', T.GREEN),
      pill('Procedural ⚙', T.YELLOW),
    ],
  },
  { type: 'frame', name: 'spacer', height: 16 },
  sectionLabel('Recent Memories'),
  { type: 'frame', name: 'spacer', height: 8 },
  memRow('Designed ScoutClaw landing page', 'Used Scout OS tokens, Inter font, dark-first approach…', 'public', '2h ago'),
  { type: 'frame', name: 'spacer', height: 8 },
  memRow('API key for Stripe production', 'sk_live_••••••••••••••••••••••', 'private', '5h ago'),
  { type: 'frame', name: 'spacer', height: 8 },
  memRow('User prefers dark mode dashboards', 'Observed from 12 design sessions across Q1 2026', 'public', '1d ago'),
  { type: 'frame', name: 'spacer', height: 8 },
  memRow('Anthropic account credentials', 'Username + encrypted password hash', 'private', '3d ago'),
  { type: 'frame', name: 'spacer', height: 8 },
  memRow('Preferred color palette: Scout OS', 'BG #0e0e14, Blue #85A0FF, Green #85FFD3…', 'public', '5d ago'),
  // Bottom tab bar
  rect('tab-bar-bg', { x: 0, y: T.H - 80, width: T.W, height: 80, fill: T.CARD2 }),
  {
    type: 'frame', name: 'tab-bar', layout: 'horizontal', gap: 0,
    x: 0, y: T.H - 76, width: T.W, height: 56,
    justifyContent: 'space_between', padding: [0, 30, 0, 30],
    alignItems: 'center',
    children: [
      { type: 'frame', name: 'tab-home', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [text('ico', '⬡', { fontSize: 22, fill: T.MUTED }), text('lbl', 'Agents', { fontSize: 10, fill: T.MUTED })]},
      { type: 'frame', name: 'tab-mem', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [text('ico', '◎', { fontSize: 22, fill: T.BLUE }), text('lbl', 'Memories', { fontSize: 10, fill: T.BLUE })]},
      { type: 'frame', name: 'tab-priv', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [text('ico', '⊕', { fontSize: 22, fill: T.MUTED }), text('lbl', 'Privacy', { fontSize: 10, fill: T.MUTED })]},
      { type: 'frame', name: 'tab-settings', layout: 'vertical', gap: 3, alignItems: 'center',
        children: [text('ico', '◈', { fontSize: 22, fill: T.MUTED }), text('lbl', 'Settings', { fontSize: 10, fill: T.MUTED })]},
    ],
  },
]);

// ── Screen 5: Memory Detail ────────────────────────────────────────────────────
const screen5 = frame('Memory Detail', [
  statusBar(),
  navBar('Memory Detail', true),
  { type: 'frame', name: 'spacer', height: 16 },
  // Memory type badge + title
  {
    type: 'frame', name: 'mem-header', layout: 'vertical', gap: 10,
    x: 20, width: T.W - 40,
    children: [
      {
        type: 'frame', name: 'badges', layout: 'horizontal', gap: 8,
        children: [
          pill('🌐 Public', T.GREEN),
          pill('Semantic', T.PURPLE),
          pill('RAM', T.BLUE),
        ],
      },
      text('title', 'Preferred color palette: Scout OS', { fontSize: 20, fontWeight: 700 }),
      text('meta', 'Stored 5 days ago · Last accessed 2h ago', { fontSize: 12, fill: T.MUTED }),
    ],
  },
  divider(),
  { type: 'frame', name: 'spacer', height: 4 },
  sectionLabel('Content'),
  { type: 'frame', name: 'spacer', height: 8 },
  card('content-card', [
    text('body', 'Background: #0e0e14\nPrimary Blue: #85A0FF\nAccent Green: #85FFD3\nPurple: #9B8FF5\nFont: Inter\nApproach: dark-first, minimal borders, glow effects', {
      fontSize: 13, fill: T.TEXT,
    }),
  ]),
  { type: 'frame', name: 'spacer', height: 16 },
  sectionLabel('Agent Access Log'),
  { type: 'frame', name: 'spacer', height: 8 },
  ...['RAM — read · 2h ago', 'Scout — read · 1d ago', 'Clu — write · 5d ago'].map(entry => ({
    type: 'frame', name: `log-${entry}`,
    layout: 'horizontal', gap: 10, padding: [10, 16, 10, 16],
    fill: T.CARD, cornerRadius: 10,
    x: 20, width: T.W - 40,
    alignItems: 'center',
    children: [
      text('dot', '•', { fontSize: 20, fill: T.GREEN, width: 16 }),
      text('entry', entry, { fontSize: 13, fill: T.MUTED }),
    ],
  })),
  { type: 'frame', name: 'spacer', height: 20 },
  ghostBtn('🔒 Make Private'),
  { type: 'frame', name: 'spacer', height: 8 },
  btn('Delete Memory', T.RED),
]);

// ── Screen 6: Privacy Controls ─────────────────────────────────────────────────
const screen6 = frame('Privacy Controls', [
  statusBar(),
  navBar('Privacy Controls'),
  { type: 'frame', name: 'spacer', height: 8 },
  // Encryption status banner
  {
    type: 'frame', name: 'enc-banner',
    x: 20, width: T.W - 40,
    fill: { type: 'color', color: T.GREEN, opacity: 0.1 },
    cornerRadius: 12, padding: [14, 16, 14, 16],
    layout: 'horizontal', gap: 12,
    alignItems: 'center',
    children: [
      text('icon', '🔐', { fontSize: 22, width: 30 }),
      {
        type: 'frame', name: 'text', layout: 'vertical', gap: 3,
        children: [
          text('title', 'End-to-end encryption active', { fontSize: 14, fontWeight: 700, fill: T.GREEN }),
          text('sub', 'Private memories are AES-256 encrypted', { fontSize: 12, fill: T.MUTED }),
        ],
      },
    ],
  },
  { type: 'frame', name: 'spacer', height: 20 },
  sectionLabel('Memory Visibility'),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Episodic Memories', 'Store experiences and events', true, T.GREEN),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Semantic Knowledge', 'Facts and preferences', true, T.GREEN),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Procedural Patterns', 'How-to knowledge and workflows', true, T.BLUE),
  { type: 'frame', name: 'spacer', height: 20 },
  sectionLabel('Agent Permissions'),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Allow cross-agent reading', 'Agents can share public memories', true, T.BLUE),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Allow cross-agent writing', 'Other agents can store memories', false, T.GREEN),
  { type: 'frame', name: 'spacer', height: 8 },
  toggleRow('Encrypt all new memories', 'Default private for new entries', false, T.GREEN),
  { type: 'frame', name: 'spacer', height: 20 },
  sectionLabel('Data Retention'),
  { type: 'frame', name: 'spacer', height: 8 },
  card('retention-card', [
    text('lbl', 'Auto-delete after', { fontSize: 13, fill: T.MUTED }),
    { type: 'frame', name: 'options', layout: 'horizontal', gap: 8,
      children: [
        { type: 'frame', name: 'opt-never', fill: T.BLUE, cornerRadius: 8, padding: [7, 14, 7, 14],
          children: [text('l', 'Never', { fontSize: 12, fontWeight: 700, fill: '#fff' })]},
        { type: 'frame', name: 'opt-90', fill: T.CARD2, cornerRadius: 8, padding: [7, 14, 7, 14],
          children: [text('l', '90 days', { fontSize: 12, fill: T.MUTED })]},
        { type: 'frame', name: 'opt-1y', fill: T.CARD2, cornerRadius: 8, padding: [7, 14, 7, 14],
          children: [text('l', '1 year', { fontSize: 12, fill: T.MUTED })]},
      ],
    },
  ]),
]);

// ── Screen 7: Registration Approval ───────────────────────────────────────────
const screen7 = frame('Registration Approval', [
  statusBar(),
  navBar('Approve Agent'),
  { type: 'frame', name: 'spacer', height: 16 },
  // New badge
  {
    type: 'frame', name: 'new-badge', layout: 'horizontal', gap: 6,
    x: 20, alignItems: 'center',
    children: [
      rect('dot', { width: 8, height: 8, cornerRadius: 4, fill: T.YELLOW }),
      text('label', 'New registration request', { fontSize: 12, fill: T.YELLOW, fontWeight: 600 }),
    ],
  },
  { type: 'frame', name: 'spacer', height: 12 },
  // Agent detail card
  card('agent-detail', [
    {
      type: 'frame', name: 'top', layout: 'horizontal', gap: 14, alignItems: 'center',
      children: [
        rect('avatar', { width: 56, height: 56, cornerRadius: 28, fill: { type: 'color', color: T.PURPLE, opacity: 0.2 } }),
        {
          type: 'frame', name: 'info', layout: 'vertical', gap: 6,
          children: [
            text('name', 'DataSync Pro', { fontSize: 18, fontWeight: 700 }),
            text('sub', 'Analytics Agent · External service', { fontSize: 13, fill: T.MUTED }),
            pill('Unverified', T.YELLOW),
          ],
        },
      ],
    },
    divider(),
    {
      type: 'frame', name: 'details', layout: 'vertical', gap: 8,
      children: [
        { type: 'frame', name: 'row', layout: 'horizontal', gap: 8,
          children: [text('k', 'Source:', { fontSize: 12, fill: T.MUTED, width: 70 }), text('v', 'datasync.io/agent', { fontSize: 12 })]},
        { type: 'frame', name: 'row', layout: 'horizontal', gap: 8,
          children: [text('k', 'Requested:', { fontSize: 12, fill: T.MUTED, width: 70 }), text('v', 'Read semantic memories', { fontSize: 12 })]},
        { type: 'frame', name: 'row', layout: 'horizontal', gap: 8,
          children: [text('k', 'From:', { fontSize: 12, fill: T.MUTED, width: 70 }), text('v', 'agent@datasync.io', { fontSize: 12 })]},
      ],
    },
  ]),
  { type: 'frame', name: 'spacer', height: 16 },
  sectionLabel('Risk Assessment'),
  { type: 'frame', name: 'spacer', height: 8 },
  ...['Unknown external domain', 'No prior interaction history', 'Requesting broad read access'].map((risk, i) => ({
    type: 'frame', name: `risk-${i}`,
    layout: 'horizontal', gap: 10, padding: [10, 16, 10, 16],
    fill: { type: 'color', color: T.YELLOW, opacity: 0.08 },
    cornerRadius: 10, x: 20, width: T.W - 40,
    alignItems: 'center',
    children: [
      text('icon', '⚠', { fontSize: 14, fill: T.YELLOW, width: 20 }),
      text('label', risk, { fontSize: 13, fill: T.TEXT }),
    ],
  })),
  { type: 'frame', name: 'spacer', height: 20 },
  btn('✓ Approve Registration', T.GREEN),
  { type: 'frame', name: 'spacer', height: 10 },
  btn('✗ Deny & Block', T.RED),
  { type: 'frame', name: 'spacer', height: 10 },
  ghostBtn('Request More Info'),
]);

// ── Screen 8: Email Approval ───────────────────────────────────────────────────
const screen8 = frame('Email Approval View', [
  statusBar(),
  navBar('Inbox', true),
  { type: 'frame', name: 'spacer', height: 16 },
  // Email preview card
  card('email-card', [
    {
      type: 'frame', name: 'email-header', layout: 'horizontal', gap: 10, alignItems: 'center',
      children: [
        rect('avatar-e', { width: 40, height: 40, cornerRadius: 20, fill: { type: 'color', color: T.BLUE, opacity: 0.18 } }),
        {
          type: 'frame', name: 'meta-e', layout: 'vertical', gap: 3,
          children: [
            text('from', 'Membrane 2 · no-reply@membrane.ai', { fontSize: 12, fill: T.MUTED }),
            text('subj', 'Agent Registration Request', { fontSize: 14, fontWeight: 700 }),
            text('time', 'Just now', { fontSize: 11, fill: T.MUTED }),
          ],
        },
      ],
    },
    divider(),
    text('body', 'Hi Rakis,\n\nA new agent has requested to connect to your Membrane 2 account:\n\nAgent: DataSync Pro\nSource: datasync.io\nRequests: Read access to semantic memories\n\nPlease review and approve or deny below.', {
      fontSize: 13, fill: T.MUTED,
    }),
  ]),
  { type: 'frame', name: 'spacer', height: 20 },
  // In-email action buttons
  {
    type: 'frame', name: 'email-actions', layout: 'horizontal', gap: 12,
    x: 20, width: T.W - 40,
    children: [
      {
        type: 'frame', name: 'approve-btn',
        fill: T.GREEN, cornerRadius: 12,
        padding: [14, 0, 14, 0],
        layout: 'horizontal', justifyContent: 'center',
        width: (T.W - 40 - 12) / 2,
        children: [text('l', '✓ Approve', { fontSize: 15, fontWeight: 700, fill: '#fff' })],
      },
      {
        type: 'frame', name: 'deny-btn',
        fill: T.RED, cornerRadius: 12,
        padding: [14, 0, 14, 0],
        layout: 'horizontal', justifyContent: 'center',
        width: (T.W - 40 - 12) / 2,
        children: [text('l', '✗ Deny', { fontSize: 15, fontWeight: 700, fill: '#fff' })],
      },
    ],
  },
  { type: 'frame', name: 'spacer', height: 16 },
  // Notification setting
  card('notif-card', [
    text('title', 'Notification Preferences', { fontSize: 14, fontWeight: 700 }),
    toggleRow('Email approvals', 'Get email for every registration request', true, T.BLUE),
    toggleRow('Push notifications', 'Instant alerts on your device', true, T.BLUE),
    toggleRow('Auto-approve known agents', 'Skip approval for trusted sources', false, T.GREEN),
  ]),
]);

// ── Assemble Document ──────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  name: 'Membrane 2 — Mobile App',
  themes: { mode: ['light', 'dark'] },
  variables: {
    'color.bg':     { type: 'color', value: T.BG },
    'color.blue':   { type: 'color', value: T.BLUE },
    'color.green':  { type: 'color', value: T.GREEN },
    'color.purple': { type: 'color', value: T.PURPLE },
    'color.card':   { type: 'color', value: T.CARD },
    'color.text':   { type: 'color', value: T.TEXT },
    'color.muted':  { type: 'color', value: T.MUTED },
  },
  children: [screen1, screen2, screen3, screen4, screen5, screen6, screen7, screen8],
};

// ── Normalize: ensure every frame has a width ──────────────────────────────────
function normalize(node, parentLayout) {
  if (!node || typeof node !== 'object') return node;
  if (node.type === 'frame' || node.type === 'rectangle') {
    if (node.width === undefined) {
      if (node.x === 20) node.width = T.W - 40;
      else if (parentLayout === 'horizontal') node.width = 0;
      else node.width = T.W;
    }
    if (node.height === undefined && !node.layout && (!node.children || !node.children.length)) {
      node.height = 0;
    }
  }
  if (Array.isArray(node.children)) {
    node.children = node.children.map(c => normalize(c, node.layout));
  }
  return node;
}
doc.children = doc.children.map(s => normalize(s, null));

// ── Position screens side by side (like pencil.dev expects) ───────────────────
const GAP = 80;
doc.children.forEach((s, i) => { s.x = i * (T.W + GAP); s.y = 0; });

// ── Output ─────────────────────────────────────────────────────────────────────
const outPath = process.argv[2] || '/tmp/membrane2.pen';
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✅ Generated: ${outPath} (${size} KB)`);
console.log(`📱 Screens: ${doc.children.length}`);
doc.children.forEach((s, i) => console.log(`   ${i + 1}. ${s.name}`));
