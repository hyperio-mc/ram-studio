import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KELP',
  tagline:   'grow quietly, one habit at a time',
  archetype: 'habit-tracker',
  palette: {           // dark fallback
    bg:      '#1A1F1A',
    surface: '#232823',
    text:    '#EAE8E1',
    accent:  '#3DB88A',
    accent2: '#D4824E',
    muted:   'rgba(234,232,225,0.45)',
  },
  lightPalette: {      // primary light theme
    bg:      '#F4F1EC',
    surface: '#FFFFFF',
    text:    '#1A1915',
    accent:  '#1B6B5C',
    accent2: '#C97B3C',
    muted:   'rgba(26,25,21,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: '🔥 Current streak', value: '18 days', sub: 'Personal best: 24 days' },
        { type: 'metric-row', items: [
          { label: 'Habits done', value: '4/6' },
          { label: 'Completion', value: '67%' },
          { label: 'Focus', value: '2h 14m' },
        ]},
        { type: 'progress', items: [
          { label: 'Today\'s score', pct: 67 },
          { label: 'Water · 6/8 glasses', pct: 75 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning meditation', sub: '10 min · done', badge: '✓' },
          { icon: 'check', title: 'Read 20 pages',      sub: '25 min · done', badge: '✓' },
          { icon: 'star',  title: 'Evening walk',       sub: 'pending' },
        ]},
        { type: 'tags', label: 'Mood today', items: ['😔 Low', '😐 Meh', '😌 Calm ✓', '🤩 Great'] },
      ],
    },
    {
      id: 'habits',
      label: 'Habits',
      content: [
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning meditation', sub: '18 day streak · Daily', badge: '✓' },
          { icon: 'check',    title: 'Read 20 pages',      sub: '7 day streak · Daily',  badge: '✓' },
          { icon: 'heart',    title: 'Drink 8 glasses',    sub: '12 day streak · Daily' },
          { icon: 'map',      title: 'Evening walk',       sub: '5 day streak · Daily' },
          { icon: 'edit',     title: 'Journal entry',      sub: '3 day streak · Daily' },
          { icon: 'zap',      title: 'Cold shower',        sub: '21 day streak · Daily', badge: '✓' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Active habits', value: '8' },
          { label: 'Best streak', value: '21d' },
          { label: 'Done today', value: '4' },
        ]},
      ],
    },
    {
      id: 'reflect',
      label: 'Reflect',
      content: [
        { type: 'metric', label: '✦ Today\'s prompt', value: 'What did your future self thank you for?', sub: 'Tap to respond' },
        { type: 'text', label: 'Journal', value: 'I meditated for the 18th day in a row… Even though I almost skipped it, I showed up for 10 minutes. That\'s what matters.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Sunlight through the window', sub: 'grateful for' },
          { icon: 'star', title: 'A productive morning',        sub: 'grateful for' },
          { icon: 'star', title: 'Good tea ☕',                 sub: 'grateful for' },
        ]},
        { type: 'tags', label: 'Tags', items: ['clarity', 'growth', 'energy'] },
      ],
    },
    {
      id: 'progress',
      label: 'Progress',
      content: [
        { type: 'metric', label: 'Monthly score', value: '81%', sub: '↑ 12% from last month' },
        { type: 'progress', items: [
          { label: 'Cold shower · 21d streak', pct: 97 },
          { label: 'Morning meditation',        pct: 93 },
          { label: 'Drink water',               pct: 87 },
          { label: 'Read 20 pages',             pct: 79 },
          { label: 'Evening walk',              pct: 71 },
          { label: 'Journal entry',             pct: 60 },
        ]},
        { type: 'metric-row', items: [
          { label: '🏆 Best habit', value: 'Cold shower' },
          { label: '📈 Needs work', value: 'Journal' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Me',
      content: [
        { type: 'metric', label: 'Alex Chen', value: 'Growing since Jan 2026', sub: '4 months in' },
        { type: 'metric-row', items: [
          { label: '🔥 Streak', value: '18 days' },
          { label: '🏆 Best', value: '24 days' },
          { label: '⭐ Done', value: '156' },
        ]},
        { type: 'list', items: [
          { icon: 'user',     title: 'Edit profile',      sub: 'Account settings' },
          { icon: 'bell',     title: 'Notifications',     sub: 'Reminders & alerts' },
          { icon: 'settings', title: 'App settings',      sub: 'Theme, widgets' },
          { icon: 'share',    title: 'Share progress',    sub: 'Challenge a friend' },
          { icon: 'filter',   title: 'Export data',       sub: 'CSV / JSON' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'habits',   label: 'Habits',   icon: 'check' },
    { id: 'reflect',  label: 'Reflect',  icon: 'edit' },
    { id: 'progress', label: 'Progress', icon: 'chart' },
    { id: 'profile',  label: 'Me',       icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kelp-mock', 'KELP — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/kelp-mock`);
