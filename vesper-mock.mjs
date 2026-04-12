// vesper-mock.mjs — VESPER Svelte Interactive Mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VESPER',
  tagline:   'End each day with clarity',
  archetype: 'personal-clarity-glass',

  palette: {           // DARK glassmorphism
    bg:      '#060412',
    surface: '#0D0920',
    text:    '#EDE9FF',
    accent:  '#9B6DFF',
    accent2: '#00D4BF',
    muted:   'rgba(237,233,255,0.40)',
  },

  lightPalette: {      // LIGHT fallback
    bg:      '#F0ECFF',
    surface: '#FFFFFF',
    text:    '#1A1530',
    accent:  '#7B4DFF',
    accent2: '#00A896',
    muted:   'rgba(26,21,48,0.45)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',       label: 'Intention',   value: 'Build depth, not noise.' },
        { type: 'metric-row', items: [
          { label: 'Focus',  value: '4h 20m' },
          { label: 'Streak', value: '18 days' },
          { label: 'Clarity',value: '9.2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Morning pages',  sub: '6:30 AM', badge: '✓' },
          { icon: 'check', title: 'Meditation',     sub: '7:00 AM', badge: '✓' },
          { icon: 'star',  title: 'Evening review', sub: '9:00 PM', badge: '…' },
        ]},
        { type: 'tags', label: 'Today\'s focus', items: ['deep work', 'no meetings', 'ship'] },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric',     label: 'Session Timer', value: '47:23', sub: 'Deep Work · Session 2' },
        { type: 'progress',   items: [{ label: 'Session progress', pct: 61 }] },
        { type: 'text',       label: 'Current task', value: 'Design system tokens — VESPER' },
        { type: 'list', items: [
          { icon: 'zap',   title: 'Entered flow state', sub: '10:12', badge: '✓' },
          { icon: 'check', title: 'Token map v1 done',  sub: '10:28', badge: '✓' },
          { icon: 'star',  title: 'In component specs', sub: 'Now',   badge: '→' },
        ]},
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'text',  label: 'Tonight\'s prompt', value: 'What gave you energy today? What drained it?' },
        { type: 'metric',label: 'Words written', value: '284', sub: 'Evening review entry' },
        { type: 'list',  items: [
          { icon: 'star',  title: 'Mon Mar 30', sub: 'Shipped relay. Felt clean.', badge: '↑' },
          { icon: 'heart', title: 'Sun Mar 29', sub: 'Rest. Good silence.',        badge: '~' },
          { icon: 'alert', title: 'Sat Mar 28', sub: 'Overcomplicated things.',    badge: '↓' },
        ]},
        { type: 'tags', label: 'Themes', items: ['energy', 'time-blocking', 'design'] },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'metric-row', items: [
          { label: 'Focus / week', value: '28h 40m' },
          { label: 'Avg clarity',  value: '8.5 / 10' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 78 },
          { label: 'Tue', pct: 84 },
          { label: 'Wed', pct: 69 },
          { label: 'Thu', pct: 91 },
          { label: 'Fri', pct: 88 },
          { label: 'Sat', pct: 72 },
          { label: 'Sun', pct: 94 },
        ]},
        { type: 'text', label: 'VESPER Insight', value: 'Your sharpest thinking clusters 8–11am across 6 of 7 days. You\'ve been scheduling 62% of meetings in that window.' },
        { type: 'tags', label: 'Patterns', items: ['morning peak', 'meeting overload', 'evening dip'] },
      ],
    },
    {
      id: 'rituals', label: 'Rituals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Complete today', value: '2 of 4' },
          { label: 'Best streak',    value: '18 days' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Meditation',  sub: '20 min · 18-day streak', badge: '✓' },
          { icon: 'check', title: 'Journal',     sub: '1 entry · 18-day streak', badge: '✓' },
          { icon: 'activity', title: 'Move',     sub: '0 of 30 min',             badge: '○' },
          { icon: 'star',  title: 'Read',        sub: '12 of 30 pages',          badge: '40%' },
        ]},
        { type: 'progress', items: [
          { label: 'Meditation', pct: 100 },
          { label: 'Journal',    pct: 100 },
          { label: 'Move',       pct: 0   },
          { label: 'Read',       pct: 40  },
        ]},
        { type: 'text', label: 'Streak', value: '18 days — keep the chain alive.' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Days active', value: '367' },
          { label: 'Entries',     value: '214' },
          { label: 'Focus hours', value: '623' },
        ]},
        { type: 'list', items: [
          { icon: 'layers',   title: 'Appearance',       sub: 'Dark Glass',       badge: '›' },
          { icon: 'bell',     title: 'Notifications',    sub: 'Smart',            badge: '›' },
          { icon: 'zap',      title: 'Haptic feedback',  sub: 'On',               badge: '●' },
          { icon: 'lock',     title: 'Local encryption', sub: 'Enabled',          badge: '✓' },
        ]},
        { type: 'tags', label: 'Theme', items: ['Dark Glass', 'Light'] },
        { type: 'text', label: 'Version', value: 'VESPER 1.0.0 · built with intention.' },
      ],
    },
  ],

  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'focus',   label: 'Focus',   icon: 'zap' },
    { id: 'journal', label: 'Journal', icon: 'edit' },
    { id: 'reflect', label: 'Reflect', icon: 'chart' },
    { id: 'rituals', label: 'Rituals', icon: 'activity' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vesper-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
