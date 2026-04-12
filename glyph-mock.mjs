// glyph-mock.mjs — Svelte interactive mock for GLYPH
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GLYPH',
  tagline:   'Shape your day. Own your output.',
  archetype: 'daily-rhythm-tracker',

  palette: {           // DARK theme (required)
    bg:      '#1A1714',
    surface: '#242018',
    text:    '#F2EDE6',
    accent:  '#4B6BFF',
    accent2: '#E8510A',
    muted:   'rgba(242,237,230,0.38)',
  },
  lightPalette: {      // LIGHT theme (primary design)
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#141210',
    accent:  '#1D3AF5',
    accent2: '#E8510A',
    muted:   'rgba(20,18,16,0.40)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric-row', items: [
          { label: 'Focus',  value: '3h 12m' },
          { label: 'Streak', value: '14 days' },
          { label: 'Score',  value: '82' },
        ]},
        { type: 'text', label: 'Active Block', value: 'Flow Block — Main project · 1h 22m elapsed · 48m remaining' },
        { type: 'progress', items: [
          { label: 'Flow Block', pct: 74 },
          { label: 'Daily Target', pct: 82 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Finish design prototype v2', sub: 'Design',  badge: '✓' },
          { icon: 'check', title: 'Weekly review writeup',      sub: 'Writing', badge: '✓' },
          { icon: 'code',  title: 'Review PR comments',         sub: 'Code',    badge: '→' },
          { icon: 'message', title: "Prep tomorrow's standup",  sub: 'Comms',   badge: '→' },
          { icon: 'star',  title: 'Read 20 pages',              sub: 'Learn',   badge: '→' },
        ]},
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Session Timer', value: '25:38', sub: '57% complete · 45 min session' },
        { type: 'progress', items: [
          { label: 'Session Progress', pct: 57 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Words',   value: '843' },
          { label: 'Distractions', value: '2' },
          { label: 'Flow',    value: '94/100' },
        ]},
        { type: 'text', label: 'Streak', value: '14-day streak — personal best. Keep it alive.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Monday',    sub: 'Session complete', badge: '✓' },
          { icon: 'check', title: 'Tuesday',   sub: 'Session complete', badge: '✓' },
          { icon: 'check', title: 'Wednesday', sub: 'Session complete', badge: '✓' },
          { icon: 'check', title: 'Thursday',  sub: 'Session complete', badge: '✓' },
          { icon: 'check', title: 'Friday',    sub: 'Session complete', badge: '✓' },
          { icon: 'check', title: 'Saturday',  sub: 'Session complete', badge: '✓' },
          { icon: 'play',  title: 'Sunday',    sub: 'In progress',      badge: '…' },
        ]},
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'tags', label: 'Period', items: ['Week','Month','Quarter','Year'] },
        { type: 'progress', items: [
          { label: 'Mar 10 — 18h focus', pct: 60 },
          { label: 'Mar 17 — 22h focus', pct: 73 },
          { label: 'Mar 24 — 16h focus', pct: 53 },
          { label: 'Apr 1  — 26h focus', pct: 87 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Deep Work',       sub: '10/14 days complete',  badge: '71%' },
          { icon: 'heart',    title: 'Morning Routine', sub: '13/14 days complete',  badge: '93%' },
          { icon: 'star',     title: 'Reading',         sub: '10/14 days complete',  badge: '71%' },
          { icon: 'zap',      title: 'Exercise',        sub: '7/14 days complete',   badge: '50%' },
        ]},
        { type: 'text', label: 'Top Insight', value: 'Best focus days: Tues and Thurs mornings. Schedule deep work on these days.' },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'text', label: 'Weekly Summary', value: 'Your rhythm is getting stronger. Week of March 31 – April 5.' },
        { type: 'list', items: [
          { icon: 'eye',      title: 'Focus',  sub: 'Deep work windows grew 34%. Longest: 2h 41m Thursday.',         badge: '↑' },
          { icon: 'activity', title: 'Energy', sub: 'Maintained flow despite 3 interruptions. Recovery: 8 min avg.',  badge: '→' },
          { icon: 'chart',    title: 'Growth', sub: '14-day streak is a personal best. Morning routines driving it.', badge: '★' },
        ]},
        { type: 'text', label: 'Reflection', value: 'Write your weekly reflection — 3 min · guided prompts →' },
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Books',    value: '1.4' },
          { label: 'Articles', value: '12' },
          { label: 'Min/Day',  value: '94' },
          { label: 'Streak',   value: '9d' },
        ]},
        { type: 'text', label: 'Currently Reading', value: 'Deep Work — Cal Newport · 62% complete' },
        { type: 'progress', items: [
          { label: 'Deep Work (Cal Newport)', pct: 62 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'The Craft of Consistent Output',    sub: 'Ness Labs · 6m',        badge: '✓' },
          { icon: 'star', title: 'On Attention Residue',              sub: 'Maggie Appleton · 9m',  badge: '✓' },
          { icon: 'heart',title: 'Evidence-Based Rest Cycles',        sub: 'Dawn Research · 4m',    badge: '✓' },
          { icon: 'eye',  title: 'Typography as Emotional Interface', sub: 'PW Magazine · 7m',      badge: '✓' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'focus',    label: 'Focus',    icon: 'play'     },
    { id: 'patterns', label: 'Patterns', icon: 'chart'    },
    { id: 'reflect',  label: 'Reflect',  icon: 'eye'      },
    { id: 'library',  label: 'Library',  icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'glyph-mock', 'GLYPH — Interactive Mock');
console.log('Mock live at:', result.url);
