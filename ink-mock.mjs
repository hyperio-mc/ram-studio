// ink-mock.mjs — INK Svelte interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'INK',
  tagline:   'Write less. Mean more.',
  archetype: 'editorial-dark',

  palette: {
    bg:      '#09090B',
    surface: '#18181B',
    text:    '#FAFAFA',
    accent:  '#A78BFA',
    accent2: '#7C3AED',
    muted:   'rgba(250,250,250,0.4)',
  },

  lightPalette: {
    bg:      '#F8F6F2',
    surface: '#FFFFFF',
    text:    '#18181B',
    accent:  '#7C3AED',
    accent2: '#A78BFA',
    muted:   'rgba(24,24,27,0.42)',
  },

  screens: [
    {
      id: 'write',
      label: 'Write',
      content: [
        { type: 'text',    label: 'Current piece', value: 'On the quiet art of noticing' },
        { type: 'metric-row', items: [
          { label: 'Words',    value: '312' },
          { label: 'Read time', value: '2 min' },
          { label: 'Status',   value: 'Saved ✦' },
        ]},
        { type: 'text', label: 'Opening', value: 'There is a kind of attention that asks nothing of the world — no answers, no resolution, only the willingness to sit with what is.' },
        { type: 'tags', label: 'Format tools', items: ['Bold', 'Italic', 'H1', 'Quote', 'Divider', 'Link'] },
        { type: 'text', label: 'Draft status', value: 'Auto-saved 2 minutes ago' },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        { type: 'metric', label: 'Library', value: '23', sub: 'pieces total' },
        { type: 'tags', label: 'Filter', items: ['All', 'Essays', 'Notes', 'Drafts'] },
        { type: 'list', items: [
          { icon: 'star', title: 'On the quiet art of noticing', sub: 'Apr 4 · 312 words', badge: 'Essay' },
          { icon: 'eye',  title: 'Notes from a delayed flight', sub: 'Mar 28 · 89 words', badge: 'Note' },
          { icon: 'star', title: 'The architecture of small rituals', sub: 'Mar 22 · 1.4k words', badge: 'Essay' },
          { icon: 'star', title: 'In defence of walking slowly', sub: 'Feb 14 · 980 words', badge: 'Essay' },
        ]},
      ],
    },
    {
      id: 'publish',
      label: 'Publish',
      content: [
        { type: 'text', label: 'Ready to publish', value: 'On the quiet art of noticing' },
        { type: 'metric-row', items: [
          { label: 'Words',    value: '312' },
          { label: 'Status',   value: '● Ready' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',    title: 'Newsletter', sub: '847 subscribers', badge: 'On' },
          { icon: 'share',   title: 'Personal Blog', sub: 'ink-essays.com', badge: 'On' },
          { icon: 'layers',  title: 'Medium', sub: 'Connect account', badge: '—' },
          { icon: 'zap',     title: 'Substack', sub: '1.2k subscribers', badge: '—' },
        ]},
        { type: 'text', label: 'Schedule', value: 'Publish now or schedule for later' },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric', label: 'Total readers', value: '4,821', sub: '↑ 23% vs last month' },
        { type: 'metric-row', items: [
          { label: 'Open rate', value: '68%' },
          { label: 'Clicks',    value: '12%' },
          { label: 'Shares',    value: '318' },
        ]},
        { type: 'progress', items: [
          { label: 'The architecture of small rituals', pct: 38 },
          { label: 'In defence of walking slowly',      pct: 25 },
          { label: 'On the quiet art of noticing',      pct: 18 },
          { label: 'Notes from a delayed flight',       pct: 11 },
        ]},
        { type: 'text', label: 'Top channel', value: 'Newsletter · 847 active readers' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Your voice', value: 'alex.writer', sub: 'Member since Jan 2025' },
        { type: 'metric-row', items: [
          { label: 'Pieces',  value: '23' },
          { label: 'Readers', value: '847' },
          { label: 'Streak',  value: '14d ✦' },
        ]},
        { type: 'list', items: [
          { icon: 'settings', title: 'Writing mode', sub: 'Focus', badge: '✓' },
          { icon: 'settings', title: 'Default font', sub: 'Georgia serif', badge: '✓' },
          { icon: 'bell',     title: 'Newsletter domain', sub: 'ink-essays.com', badge: '✓' },
          { icon: 'calendar', title: 'Send schedule', sub: 'Sunday 9am', badge: '✓' },
        ]},
        { type: 'tags', label: 'Account', items: ['Export All', 'Writing Stats', 'Sign Out'] },
      ],
    },
  ],

  nav: [
    { id: 'write',   label: 'Write',   icon: 'check' },
    { id: 'library', label: 'Library', icon: 'list' },
    { id: 'publish', label: 'Publish', icon: 'share' },
    { id: 'stats',   label: 'Stats',   icon: 'chart' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'ink-mock', 'INK — Interactive Mock');
console.log('Mock live at:', result.url);
