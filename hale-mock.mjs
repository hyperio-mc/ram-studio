import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HALE',
  tagline:   'Mindful health, beautifully kept',
  archetype: 'health-wellness',

  // Dark palette (required)
  palette: {
    bg:      '#1C1412',
    surface: '#2A201C',
    text:    '#F5EFE4',
    accent:  '#C4843C',
    accent2: '#7B9B6B',
    muted:   'rgba(245,239,228,0.45)',
  },

  // Light palette (the hero theme — Aesop/Kinfolk warm ivory)
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1714',
    accent:  '#5C4033',
    accent2: '#7B9B6B',
    muted:   'rgba(28,23,20,0.45)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Resting HR', value: '58 bpm', sub: 'Well within your baseline' },
        { type: 'metric-row', items: [
          { label: 'Sleep', value: '7h 42m' },
          { label: 'HRV', value: '64ms' },
          { label: 'Streak', value: '24 days' },
        ]},
        { type: 'text', label: "Today's intention", value: '"Rest is not idleness, but the pause that sharpens the blade." — John Lubbock' },
        { type: 'progress', items: [
          { label: 'Movement', pct: 72 },
          { label: 'Mindfulness', pct: 45 },
          { label: 'Nourishment', pct: 88 },
          { label: 'Rest', pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning walk', sub: '7:12 AM · 28 min', badge: 'Move' },
          { icon: 'heart',    title: 'Matcha + overnight oats', sub: '8:30 AM', badge: 'Eat' },
          { icon: 'star',     title: '10 min breathing exercise', sub: '9:15 AM', badge: 'Mind' },
        ]},
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'tags', label: 'Category', items: ['Move', 'Eat', 'Mind', 'Rest', 'Body'] },
        { type: 'text', label: 'What did you have?', value: 'Avocado toast with poached eggs and a side of sliced fruit' },
        { type: 'tags', label: 'Quick tags', items: ['Homemade', 'Protein-rich', 'Balanced', 'Slow-food'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Energised', sub: 'How it made you feel', badge: '✓' },
          { icon: 'check', title: 'Medium portion', sub: 'Serving size', badge: '○' },
        ]},
        { type: 'text', label: 'Note', value: 'Felt really nourishing. Took time to eat slowly and enjoy.' },
      ],
    },
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg steps', value: '6,357' },
          { label: 'vs last wk', value: '+12%' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon 6,200 steps', pct: 62 },
          { label: 'Tue 9,200 steps', pct: 92 },
          { label: 'Wed 8,400 steps', pct: 84 },
          { label: 'Thu 7,800 steps', pct: 78 },
          { label: 'Fri 6,100 steps', pct: 61 },
          { label: 'Sat 5,600 steps', pct: 56 },
          { label: 'Sun 3,200 steps', pct: 32 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg sleep', value: '7h 18m' },
          { label: 'Avg HRV', value: '62ms' },
          { label: 'Best sleep', value: '92/100' },
        ]},
        { type: 'text', label: 'Weekly insight', value: 'Your HRV peaks mid-week — consider harder workouts on Tuesday & Wednesday.' },
      ],
    },
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'text', label: 'April 12, 2026', value: 'A morning of unhurried things' },
        { type: 'text', label: 'Entry', value: 'Woke at 6:42 without the alarm. The light through the curtains was soft and unhurried.\n\nI made matcha slowly today — the kind of slowness that feels like a decision, not an accident. There\'s something to that.\n\nBody felt rested. HRV says 64ms. The numbers sometimes confirm what we already know but haven\'t named yet.' },
        { type: 'tags', label: 'Tags', items: ['Mindful', 'Low-intensity', 'Reflective'] },
        { type: 'metric', label: 'Mood', value: '😌 Content & grounded', sub: '72% — above your weekly average' },
        { type: 'list', items: [
          { icon: 'calendar', title: 'April 11', sub: 'On effort and its cousin, rest', badge: '😊' },
          { icon: 'calendar', title: 'April 10', sub: 'Rainy evening, unexpected calm', badge: '😌' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total entries', value: '312' },
          { label: 'Day streak', value: '24' },
          { label: 'Active days', value: '91%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Avg sleep', value: '7h 18m' },
          { label: 'Best HRV', value: '72ms' },
          { label: 'Member', value: 'Jan 2026' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily movement goal', pct: 83 },
          { label: 'Mindfulness sessions', pct: 60 },
          { label: 'Journal consistency', pct: 92 },
          { label: 'Sleep quality target', pct: 76 },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'Notification schedule', sub: 'Daily at 7am & 9pm', badge: '›' },
          { icon: 'activity', title: 'Connected devices', sub: 'Apple Watch · Oura Ring', badge: '›' },
          { icon: 'lock',     title: 'Data & privacy', sub: 'Local-first, encrypted', badge: '›' },
          { icon: 'settings', title: 'Appearance', sub: 'Light theme · Large text', badge: '›' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'log',     label: 'Log',     icon: 'plus' },
    { id: 'trends',  label: 'Trends',  icon: 'chart' },
    { id: 'journal', label: 'Journal', icon: 'eye' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'hale-mock', 'HALE — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/hale-mock');
