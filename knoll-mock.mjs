import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KNOLL',
  tagline:   'Research, connected',
  archetype: 'knowledge-management',
  palette: {           // dark theme
    bg:      '#1C1917',
    surface: '#262220',
    text:    '#F5F0EA',
    accent:  '#C4522A',
    accent2: '#2E4A3A',
    muted:   'rgba(245,240,234,0.45)',
  },
  lightPalette: {      // light theme (warm cream editorial)
    bg:      '#F9F6F2',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C4522A',
    accent2: '#2E4A3A',
    muted:   'rgba(28,25,23,0.42)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Focus Today', value: '2h 14m', sub: '🔥 14-day streak' },
        { type: 'metric-row', items: [
          { label: 'Notes', value: '47' },
          { label: 'Links', value: '128' },
          { label: 'Words', value: '3.2K' },
        ]},
        { type: 'text', label: 'Daily Brief', value: '"The pattern recognition gap between experts and novices is not knowledge — it is the habit of noticing." — Epstein' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Reading Queue', sub: 'The Architecture of Trust · Range · Notes on Taste', badge: '3' },
          { icon: 'check', title: 'Review AI governance notes', sub: 'Done', badge: '✓' },
          { icon: 'star', title: 'Write weekly synthesis', sub: 'In progress', badge: '…' },
        ]},
        { type: 'tags', label: 'Recent Topics', items: ['Attention Economics', 'Network Design', 'Fermentation', 'Sleep Science'] },
      ],
    },
    {
      id: 'explore',
      label: 'Explore',
      content: [
        { type: 'metric', label: 'Featured Topic', value: 'Attention', sub: '12 notes · 8 links · 3h reading' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Network Effects', sub: 'Economics · 23 notes', badge: '⬡' },
          { icon: 'eye', title: 'Deep Work', sub: 'Productivity · 18 notes', badge: '◎' },
          { icon: 'heart', title: 'Fermentation', sub: 'Science · 9 notes', badge: '◉' },
          { icon: 'layers', title: 'Sleep & Memory', sub: 'Neuroscience · 31 notes', badge: '◈' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Science', 'Economics', 'Culture', 'Tech', 'Philosophy'] },
      ],
    },
    {
      id: 'write',
      label: 'Write',
      content: [
        { type: 'metric', label: 'Weekly Synthesis #14', value: '1,247', sub: 'words · Goal: 1,500' },
        { type: 'progress', items: [
          { label: 'Word count goal', pct: 83 },
          { label: 'Research coverage', pct: 72 },
          { label: 'Linked notes', pct: 60 },
        ]},
        { type: 'text', label: 'Current Draft', value: 'This week I found myself returning to a question first encountered in Epstein\'s Range: what do the best generalists actually do with their breadth? The deeper answer seems to be about a different kind of attention.' },
        { type: 'list', items: [
          { icon: 'share', title: 'Linked: Attention Economics', sub: '12 notes · last edited 2 days ago', badge: '🔗' },
        ]},
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Collections', value: '6' },
          { label: 'Notes', value: '47' },
          { label: 'Links', value: '128' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Attention & Focus', sub: '23 items · Active', badge: '◎' },
          { icon: 'layers', title: 'Network Theory', sub: '18 items · Active', badge: '⬡' },
          { icon: 'heart', title: 'Food Science', sub: '14 items', badge: '◉' },
          { icon: 'code', title: 'Writing Craft', sub: '31 items · Active', badge: '✎' },
          { icon: 'search', title: 'Philosophy', sub: '9 items', badge: '◈' },
          { icon: 'map', title: 'Ecology', sub: '22 items', badge: '◉' },
        ]},
        { type: 'text', label: 'Recently Added', value: 'The Overstory — notes · Network Effects primer · Weil on attention — extract' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Best Streak', value: '14d' },
          { label: 'Avg / Day', value: '47m' },
          { label: 'This Week', value: '5.2h' },
        ]},
        { type: 'progress', items: [
          { label: 'Attention & Focus', pct: 82 },
          { label: 'Network Theory', pct: 64 },
          { label: 'Writing Craft', pct: 48 },
          { label: 'Ecology', pct: 32 },
          { label: 'Philosophy', pct: 20 },
        ]},
        { type: 'metric', label: 'Weekly Writing', value: '3,247', sub: 'words written this week' },
        { type: 'tags', label: 'Active Streaks', items: ['Daily reading', 'Weekly synthesis', 'Link capture'] },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Alex Meridian', value: '14d', sub: 'Generalist · Researcher · Writer' },
        { type: 'metric-row', items: [
          { label: 'Notes', value: '47' },
          { label: 'Streak', value: '14d' },
          { label: 'Links', value: '128' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly goal (5.2h of 7h)', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Reading font', sub: 'Georgia', badge: '›' },
          { icon: 'bell', title: 'Daily reminder', sub: '8:00 AM', badge: '›' },
          { icon: 'calendar', title: 'Weekly digest', sub: 'Sunday', badge: '›' },
          { icon: 'activity', title: 'Sync frequency', sub: 'Real-time', badge: '›' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',   icon: 'home' },
    { id: 'explore',  label: 'Explore', icon: 'search' },
    { id: 'write',    label: 'Write',   icon: 'code' },
    { id: 'library',  label: 'Library', icon: 'layers' },
    { id: 'insights', label: 'Insights',icon: 'chart' },
    { id: 'profile',  label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'knoll-mock', 'KNOLL — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
