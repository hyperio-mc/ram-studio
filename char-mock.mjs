// char-mock.mjs — CHAR: Code analytics, distilled
// Svelte 5 interactive mock with light/dark toggle

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CHAR',
  tagline:   'your codebase, distilled',
  archetype: 'developer-analytics',

  palette: {           // DARK theme — burnt orange + near-black
    bg:      '#0C0D0D',
    surface: '#161818',
    text:    '#F2EDE6',
    accent:  '#FF4401',
    accent2: '#3DCC8A',
    muted:   'rgba(242,237,230,0.42)',
  },
  lightPalette: {      // LIGHT theme — warm paper + charcoal
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1A1610',
    accent:  '#E03800',
    accent2: '#2BA870',
    muted:   'rgba(26,22,16,0.45)',
  },

  screens: [
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'text',   label: 'Greeting',       value: 'Morning, Ryo.' },
        { type: 'text',   label: 'Context',         value: "Here's your codebase this week." },
        { type: 'metric', label: 'Weekly Digest',   value: '287',  sub: 'commits · 14 PRs merged · zero regressions' },
        { type: 'metric-row', items: [
          { label: 'Commits/wk', value: '41' },
          { label: 'Review Cycle', value: '4.2h' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Coverage', value: '78%' },
          { label: 'Debt Score', value: '24' },
        ]},
        { type: 'text',   label: '✦ Ask CHAR',      value: 'Why did review time drop last Tuesday?' },
        { type: 'list',   items: [
          { icon: 'code',  title: 'feat: add webhook retry logic',        sub: '2h ago · Ryo',  badge: 'feat' },
          { icon: 'alert', title: 'fix: race condition in auth flow',     sub: '5h ago · Kaz',  badge: 'fix' },
          { icon: 'code',  title: 'chore: update deps to latest',         sub: '8h ago · Ryo',  badge: 'chore' },
        ]},
      ],
    },
    {
      id: 'commits', label: 'Commits',
      content: [
        { type: 'metric', label: 'This Week',  value: '287', sub: '1,204 this month' },
        { type: 'metric-row', items: [
          { label: 'Mon', value: '52' }, { label: 'Tue', value: '38' },
          { label: 'Wed', value: '67' }, { label: 'Thu', value: '71' },
        ]},
        { type: 'text', label: 'Heatmap', value: '7-week contribution heatmap — Thu peak intensity' },
        { type: 'progress', items: [
          { label: 'src/auth/middleware.ts',       pct: 85 },
          { label: 'src/api/webhooks.ts',          pct: 70 },
          { label: 'src/components/Table.tsx',     pct: 48 },
          { label: 'tests/integration/auth.spec',  pct: 40 },
        ]},
        { type: 'tags', label: 'Commit Types', items: ['feat ×8', 'fix ×5', 'refactor ×4', 'chore ×6', 'test ×3'] },
      ],
    },
    {
      id: 'reviews', label: 'Reviews',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open',   value: '3' },
          { label: 'Merged', value: '14' },
          { label: 'Cycle',  value: '4.2h' },
        ]},
        { type: 'metric', label: 'Cycle Time Trend', value: '4.2', sub: 'hrs — ↓ 12% vs last week' },
        { type: 'list', items: [
          { icon: 'activity', title: 'feat: real-time dashboard updates',    sub: '6h · +142/-18',  badge: 'review' },
          { icon: 'alert',    title: 'fix: memory leak in WebSocket',        sub: '1d · +23/-67',   badge: 'open' },
          { icon: 'code',     title: 'refactor: unify error boundaries',     sub: '2d · +88/-32',   badge: 'draft' },
        ]},
        { type: 'progress', items: [
          { label: 'Ryo — avg review 1.8h',   pct: 82 },
          { label: 'Kaz — avg review 2.1h',   pct: 72 },
          { label: 'Lin — avg review 6.4h',   pct: 38 },
        ]},
      ],
    },
    {
      id: 'debt', label: 'Debt',
      content: [
        { type: 'metric', label: 'Debt Score', value: '24', sub: '/ 100 — Manageable range' },
        { type: 'progress', items: [
          { label: 'Code Smells (8/30)',    pct: 27 },
          { label: 'Complexity (7/30)',     pct: 23 },
          { label: 'Coverage Gaps (5/20)', pct: 25 },
          { label: 'Duplication (4/20)',   pct: 20 },
        ]},
        { type: 'text', label: 'Trend', value: 'Down 3 points from last sprint. On track for clean Q2.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'src/store/globalState.ts',  sub: '7 issues · High heat',  badge: '90°' },
          { icon: 'code',  title: 'src/utils/formatters.ts',   sub: '4 issues · Med heat',   badge: '60°' },
          { icon: 'code',  title: 'src/api/legacy/v1.ts',      sub: '3 issues · Low heat',   badge: '45°' },
        ]},
      ],
    },
    {
      id: 'insight', label: 'Insight',
      content: [
        { type: 'text',   label: 'WK 13 INSIGHT', value: 'Your best week in six months.' },
        { type: 'text',   label: 'Summary',        value: 'Auth shipped clean. One debt hotspot before Sprint 14.' },
        { type: 'metric', label: 'Velocity',       value: '+18%', sub: 'commits above 6-week average' },
        { type: 'list', items: [
          { icon: 'activity', title: '↑ Velocity Spike',   sub: '+18% commits, auth cluster, all tests passing',            badge: '✓' },
          { icon: 'alert',    title: '◎ Debt Alert',       sub: 'globalState.ts — 7 new smells, refactor recommended',      badge: '⚠' },
          { icon: 'check',    title: '◈ Review Health',    sub: 'Cycle time ↓12% to 4.2h. Ryo + Kaz reviewing within 2h.', badge: '✓' },
        ]},
        { type: 'text',   label: '✦ Sprint 14 Recommendation',
          value: 'Refactor globalState.ts before new state work. ~2h. Unlocks clean Sprint 15 delivery.' },
        { type: 'tags',   label: 'Focus Areas', items: ['Tech Debt', 'Auth', 'Reviews', 'Coverage'] },
      ],
    },
  ],

  nav: [
    { id: 'pulse',   label: 'Pulse',   icon: 'activity' },
    { id: 'commits', label: 'Commits', icon: 'code' },
    { id: 'reviews', label: 'Reviews', icon: 'layers' },
    { id: 'debt',    label: 'Debt',    icon: 'alert' },
    { id: 'insight', label: 'Insight', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug:    'char-mock',
});
const result = await publishMock(html, 'char-mock', 'CHAR — Interactive Mock');
console.log('✓ Mock live at:', result.url);
