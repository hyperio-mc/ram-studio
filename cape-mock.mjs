import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CAPE',
  tagline:   'Your launchpad for everything that matters.',
  archetype: 'personal-productivity',
  palette: {
    bg:      '#0D1B3E',
    surface: '#162342',
    text:    '#E8EBF4',
    accent:  '#FF6B35',
    accent2: '#00B4A0',
    muted:   'rgba(232,235,244,0.45)',
  },
  lightPalette: {
    bg:      '#FAFAF8',
    surface: '#FFFFFF',
    text:    '#0D1B3E',
    accent:  '#FF6B35',
    accent2: '#00B4A0',
    muted:   'rgba(13,27,62,0.45)',
  },
  screens: [
    {
      id: 'control', label: 'Control',
      content: [
        { type: 'metric', label: 'Active Missions', value: '3', sub: '1 launching soon' },
        { type: 'metric-row', items: [
          { label: 'Phases Hit', value: '11' },
          { label: 'On Track', value: '87%' },
          { label: 'Streak', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Marathon Training', sub: 'Phase 2 · 68%', badge: '▲' },
          { icon: 'star',     title: 'Launch Side Project', sub: 'Phase 1 · 35%', badge: '→' },
          { icon: 'zap',      title: 'Learn Portuguese', sub: 'Phase 3 · 52%', badge: '◆' },
        ]},
        { type: 'text', label: 'Alert', value: '⚡ Marathon Training — Phase 2 launches in 3 days.' },
      ],
    },
    {
      id: 'mission', label: 'Mission',
      content: [
        { type: 'metric', label: 'Marathon Training', value: '68%', sub: 'Phase 2 of 4 · Build' },
        { type: 'tags', label: 'Phases', items: ['✓ PREP', '● BUILD', '○ PEAK', '○ RACE'] },
        { type: 'progress', items: [
          { label: 'Phase 2 — Base Mileage', pct: 68 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: '5km easy run 3x/week', sub: 'Target: 3 sessions', badge: '✓' },
          { icon: 'check', title: '12km long run', sub: 'Completed Apr 1', badge: '✓' },
          { icon: 'alert', title: '16km long run', sub: 'Due Apr 6', badge: '!' },
          { icon: 'calendar', title: 'Tempo intervals', sub: 'Thu routine', badge: '→' },
        ]},
      ],
    },
    {
      id: 'launch', label: 'Phase Launch',
      content: [
        { type: 'metric', label: 'Phase 3 — Peak', value: '3', sub: 'days until launch' },
        { type: 'text', label: 'Mission', value: 'Marathon Training · Launching Phase 3: Peak' },
        { type: 'list', items: [
          { icon: 'check', title: 'Phase 2 milestones cleared', sub: 'Required · Ready', badge: '✓' },
          { icon: 'check', title: 'Recovery week completed', sub: 'Required · Ready', badge: '✓' },
          { icon: 'check', title: 'Nutrition plan updated', sub: 'Optional · Done', badge: '✓' },
          { icon: 'check', title: 'Gear check — race shoes', sub: 'Optional · Done', badge: '✓' },
          { icon: 'alert', title: 'Peak week schedule', sub: 'Required · Pending', badge: '!' },
          { icon: 'alert', title: 'Rest day protocol', sub: 'Optional · Pending', badge: '○' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Mission Log',
      content: [
        { type: 'metric-row', items: [
          { label: 'Missions', value: '4' },
          { label: 'Phases', value: '11' },
          { label: 'Rate', value: '87%' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Marathon · Phase 1 — Prep', sub: 'Mar 22 · All 6 milestones cleared', badge: '✓' },
          { icon: 'check', title: 'Portuguese · Phase 2', sub: 'Mar 18 · First conversation achieved', badge: '✓' },
          { icon: 'activity', title: 'Side Project · Phase 1', sub: 'Mar 10 · User interviews ongoing', badge: '…' },
          { icon: 'alert', title: 'Books · Phase 2 Q2', sub: 'Mar 5 · Fell behind by 2 books', badge: '✗' },
        ]},
      ],
    },
    {
      id: 'new', label: 'New Mission',
      content: [
        { type: 'text', label: 'Mission Name', value: 'Run a marathon' },
        { type: 'tags', label: 'Category', items: ['● Fitness', '▲ Career', '◆ Growth', '★ Creative'] },
        { type: 'metric', label: 'Phases', value: '4', sub: 'Prep · Build · Peak · Race' },
        { type: 'tags', label: 'Preview', items: ['1 Prep', '2 Build', '3 Peak', '4 Race'] },
        { type: 'text', label: 'Action', value: 'INITIATE MISSION →' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Overall Launch Rate', value: '78%', sub: 'missions on track' },
        { type: 'tags', label: 'Breakdown', items: ['78% On Track', '14% Delayed', '8% Missed'] },
        { type: 'list', items: [
          { icon: 'zap',    title: 'Phase completion streak', sub: 'Consecutive phases hit', badge: '7' },
          { icon: 'eye',    title: 'Days since last miss', sub: 'Longest clean run', badge: '34' },
          { icon: 'layers', title: 'Missions this year', sub: 'Total launched', badge: '4' },
        ]},
        { type: 'text', label: 'Settings', value: 'Mission settings →' },
      ],
    },
  ],
  nav: [
    { id: 'control', label: 'Control', icon: 'home' },
    { id: 'mission', label: 'Mission', icon: 'layers' },
    { id: 'launch',  label: 'Launch',  icon: 'zap' },
    { id: 'log',     label: 'Log',     icon: 'list' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cape-mock', 'CAPE — Interactive Mock');
console.log('Mock live at:', result.url);
