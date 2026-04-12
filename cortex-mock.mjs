// CORTEX — Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CORTEX',
  tagline:   'Train your focus. Own your mind.',
  archetype: 'mental-performance-tracker',

  // DARK theme
  palette: {
    bg:      '#07070F',
    surface: '#0E0E1C',
    text:    '#EAE8FF',
    accent:  '#7B61FF',
    accent2: '#00E5FF',
    muted:   'rgba(234,232,255,0.40)',
  },

  lightPalette: {
    bg:      '#F4F3FF',
    surface: '#FFFFFF',
    text:    '#0F0B2E',
    accent:  '#5B3FE0',
    accent2: '#007ACC',
    muted:   'rgba(15,11,46,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Focus Score', value: '84', sub: 'Strong day — top 12% this week' },
        { type: 'metric-row', items: [
          { label: 'Deep Work', value: '3h 24m' },
          { label: 'Sessions', value: '5' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'progress', items: [
          { label: 'Morning Focus Block', pct: 100 },
          { label: 'Product Strategy Session', pct: 47 },
          { label: 'API Refactor — 4:30 PM', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Deep Work · Product Strategy', sub: 'Active — 42:17 elapsed', badge: '●' },
          { icon: 'code', title: 'Deep Coding · API Refactor', sub: '4:30 PM · 90 min', badge: '▷' },
          { icon: 'book', title: 'Reading · Pragmatic Programmer', sub: '7:00 PM · 45 min', badge: '▷' },
        ]},
        { type: 'tags', label: 'Ambience', items: ['Rain', 'Lo-fi', 'Forest', 'Café', 'Silence'] },
      ],
    },
    {
      id: 'session',
      label: 'Session',
      content: [
        { type: 'metric', label: 'Focus Session Active', value: '00:42:17', sub: 'Deep Work · Product Strategy · 90 min target' },
        { type: 'progress', items: [
          { label: 'Session Progress (47%)', pct: 47 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Target', value: '90 min' },
          { label: 'Elapsed', value: '42 min' },
          { label: 'Remaining', value: '48 min' },
        ]},
        { type: 'text', label: 'Session Note', value: 'Reconsidering the onboarding flow — simpler entry point, fewer steps to first value moment.' },
        { type: 'tags', label: 'Ambience Active', items: ['🌧 Rain', '🎵 Lo-fi', '🌲 Forest', '☕ Café', '○ Silence'] },
        { type: 'list', items: [
          { icon: 'check', title: 'End Session', sub: 'Save progress and log outcome', badge: '→' },
          { icon: 'activity', title: 'Take a Break', sub: '5 min rest then continue', badge: '⏸' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'Total Deep Work — 30 Days', value: '87.4h', sub: '+18% vs previous 30 days' },
        { type: 'metric-row', items: [
          { label: 'Avg Daily', value: '2h 55m' },
          { label: 'Best Day', value: '6h 12m' },
          { label: 'Consistency', value: '91%' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Work (42%)', pct: 42 },
          { label: 'Reading (26%)', pct: 26 },
          { label: 'Learning (19%)', pct: 19 },
          { label: 'Planning (13%)', pct: 13 },
        ]},
        { type: 'text', label: 'Peak Focus Window', value: '9:00 – 11:30 AM · 83% of your highest-score sessions start here' },
        { type: 'list', items: [
          { icon: 'chart', title: 'Mon–Fri average', sub: '3.4h / day deep work', badge: '↑' },
          { icon: 'star', title: 'Best session ever', sub: 'Dec 14 — 6h 12m uninterrupted', badge: '🏆' },
          { icon: 'zap', title: 'Current rank', sub: 'Top 12% globally this week', badge: '⚡' },
        ]},
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Week 14 Progress', value: '14h 50m', sub: '4 of 5 weekdays met 3h target' },
        { type: 'progress', items: [
          { label: '100h Deep Work in April — 72%', pct: 72 },
          { label: '21-Day Streak — 67%', pct: 67 },
          { label: 'Read 2 Books in April — 50%', pct: 50 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Mon 3.2h', value: '✓' },
          { label: 'Tue 4.1h', value: '✓' },
          { label: 'Wed 2.3h', value: '~' },
          { label: 'Thu 3.8h', value: '✓' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: '100h Deep Work in April', sub: '72.4 / 100h · On track', badge: '72%' },
          { icon: 'star', title: '21-Day Focus Streak', sub: '14 / 21 days · 7 more to badge', badge: '14d' },
          { icon: 'book', title: 'Read 2 Books in April', sub: '1 / 2 · Pragmatic Programmer', badge: '50%' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Chen — Focus Architect · Level 8', value: '412', sub: 'Total sessions logged since Jan 2025' },
        { type: 'metric-row', items: [
          { label: 'Total Hours', value: '618h' },
          { label: 'Best Streak', value: '28d' },
          { label: 'Avg Score', value: '81/100' },
        ]},
        { type: 'text', label: 'Cognitive Archetype', value: 'The Deep Diver — You excel in long, uninterrupted blocks. 78% of your best work happens in sessions over 60 minutes.' },
        { type: 'tags', label: 'Earned Badges', items: ['🔥 28-Day Streak', '⚡ 100h Club', '🌅 Early Riser', '🧠 Deep Thinker', '🏆 Top 10%'] },
        { type: 'list', items: [
          { icon: 'bell', title: 'Focus Reminders', sub: '9:00 AM daily', badge: '→' },
          { icon: 'zap', title: 'Default Session Length', sub: '90 minutes', badge: '→' },
          { icon: 'eye', title: 'Dark Mode', sub: 'Enabled', badge: '●' },
          { icon: 'lock', title: 'Data Privacy', sub: 'Local storage only', badge: '→' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'session',  label: 'Session',  icon: 'zap' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'goals',    label: 'Goals',    icon: 'star' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cortex-mock', 'CORTEX — Interactive Mock');
console.log('Mock live at:', result.url);
