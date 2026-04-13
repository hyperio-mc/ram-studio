import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Dawn',
  tagline:   'Your morning, by design',
  archetype: 'wellness-ritual',
  palette: {           // dark theme (required)
    bg:      '#1E1A14',
    surface: '#2A2418',
    text:    '#F0EAE0',
    accent:  '#6E9B72',
    accent2: '#C17B72',
    muted:   'rgba(240,234,224,0.45)',
  },
  lightPalette: {      // light theme (the primary intent)
    bg:      '#F9F4EC',
    surface: '#FFFFFF',
    text:    '#2A2118',
    accent:  '#6E9B72',
    accent2: '#C17B72',
    muted:   'rgba(42,33,24,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Morning Dashboard',
      content: [
        { type: 'metric',     label: 'Energy Score', value: '78', sub: '↑ +6 vs yesterday' },
        { type: 'metric-row', items: [
          { label: 'Sleep',   value: '7h 24m' },
          { label: 'Mood',    value: '😄 Great' },
          { label: 'Streak',  value: '22 days' },
        ]},
        { type: 'tags',  label: "Today's Rituals", items: ['Morning Pages', 'Cold Shower', 'Walk 20min', 'Meditate', 'Read'] },
        { type: 'progress', items: [
          { label: 'Morning Pages', pct: 100 },
          { label: 'Cold Shower',   pct: 100 },
          { label: 'Walk 20 min',   pct: 100 },
          { label: 'Meditate',      pct: 0   },
          { label: 'Read 30 min',   pct: 0   },
        ]},
        { type: 'text', label: 'Insight', value: 'You complete rituals 40% more consistently on Sundays.' },
      ],
    },
    {
      id: 'journal',
      label: 'Morning Journal',
      content: [
        { type: 'text', label: "Today's Prompt", value: '"What would make today feel truly complete?"' },
        { type: 'text', label: 'Entry', value: 'Today I want to finish the proposal draft and finally get that 30-min walk in before noon. Feeling restless but the morning pages helped clear my head. Grateful for quiet mornings...' },
        { type: 'metric', label: 'Words Written', value: '142', sub: '3 min read' },
        { type: 'tags', label: 'Themes', items: ['Clarity', 'Productivity', 'Gratitude'] },
        { type: 'text', label: '◈ Pattern Detected', value: 'You write most productively on Sundays.' },
      ],
    },
    {
      id: 'energy',
      label: 'Energy Tracker',
      content: [
        { type: 'metric', label: "This Week's Average", value: '71', sub: '↑ +4 vs last week' },
        { type: 'progress', items: [
          { label: 'Monday',    pct: 65 },
          { label: 'Tuesday',   pct: 72 },
          { label: 'Wednesday', pct: 58 },
          { label: 'Thursday',  pct: 80 },
          { label: 'Friday',    pct: 74 },
          { label: 'Saturday',  pct: 68 },
          { label: 'Sunday',    pct: 78 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sleep',     value: '82' },
          { label: 'Nutrition', value: '74' },
          { label: 'Movement',  value: '91' },
          { label: 'Mindset',   value: '65' },
        ]},
        { type: 'text', label: '✦ Best Window', value: '9–11 AM on movement days (+18 avg)' },
      ],
    },
    {
      id: 'rituals',
      label: 'Ritual Builder',
      content: [
        { type: 'metric', label: 'Current Streak', value: '22 days', sub: 'Best: 34 days' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Morning Pages',  sub: '20 min · 22 day streak', badge: '94%' },
          { icon: 'activity', title: 'Cold Shower',    sub: '5 min · 18 day streak',  badge: '82%' },
          { icon: 'map',      title: 'Walk 20 min',    sub: '20 min · 22 day streak', badge: '94%' },
          { icon: 'eye',      title: 'Meditate',       sub: '10 min · 12 day streak', badge: '68%' },
          { icon: 'heart',    title: 'Read 30 min',    sub: '30 min · 8 day streak',  badge: '52%' },
        ]},
        { type: 'tags', label: 'Evening Stack', items: ['Wind-down Read', 'No-screen 9 PM'] },
      ],
    },
    {
      id: 'review',
      label: 'Weekly Review',
      content: [
        { type: 'metric-row', items: [
          { label: 'Energy',  value: '74' },
          { label: 'Rituals', value: '86%' },
          { label: 'Focus',   value: '68' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning rituals 6/7 days', sub: 'Consistency win',   badge: '✓' },
          { icon: 'check', title: 'Best energy in 3 weeks',   sub: 'Score: 78',         badge: '✓' },
          { icon: 'check', title: '1,200 words journalled',   sub: 'Weekly total',       badge: '✓' },
          { icon: 'alert', title: 'Evening screen cutoff',    sub: 'Needs improvement',  badge: '→' },
          { icon: 'alert', title: 'Meditation consistency',   sub: 'Below 70%',          badge: '→' },
        ]},
        { type: 'text', label: 'Next Week\'s Intention', value: '"Prioritise deep focus in the first two hours."' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Streak',  value: '22 days' },
          { label: 'Entries', value: '247' },
          { label: 'Best Wk', value: '94%' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Wake-up time',      sub: 'Daily alarm',        badge: '6:45 AM' },
          { icon: 'bell',     title: 'Reminder style',    sub: 'Notification type',  badge: 'Gentle' },
          { icon: 'eye',      title: 'Theme',             sub: 'App appearance',     badge: 'Warm ☀' },
          { icon: 'star',     title: 'Review day',        sub: 'Weekly cadence',     badge: 'Sunday' },
        ]},
        { type: 'tags', label: 'Data', items: ['Export PDF', 'Export CSV', 'Backup'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Home',    icon: 'home'     },
    { id: 'journal',   label: 'Journal', icon: 'heart'    },
    { id: 'energy',    label: 'Energy',  icon: 'activity' },
    { id: 'rituals',   label: 'Rituals', icon: 'star'     },
    { id: 'review',    label: 'Review',  icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'dawn-mock', `${design.appName} — Interactive Mock`);
console.log('Mock:', result.status, '→ https://ram.zenbin.org/dawn-mock');
