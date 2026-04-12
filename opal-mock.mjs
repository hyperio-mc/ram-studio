// opal-mock.mjs — OPAL Svelte 5 interactive mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'OPAL',
  tagline:   'Creative vitals for makers',
  archetype: 'creative-tracker',

  // DARK theme (required by builder)
  palette: {
    bg:      '#1C1714',
    surface: '#26211D',
    text:    '#F8F4EE',
    accent:  '#C85A0A',
    accent2: '#2A4BAB',
    muted:   'rgba(248,244,238,0.40)',
  },

  // LIGHT theme (primary — this is a light design)
  lightPalette: {
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1C1714',
    accent:  '#C85A0A',
    accent2: '#2A4BAB',
    muted:   'rgba(28,23,20,0.45)',
  },

  screens: [
    {
      id: 'vitals',
      label: 'Vitals',
      content: [
        { type: 'metric', label: 'Creative Score', value: '84', sub: '↑ 6 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Words', value: '1,840' },
          { label: 'Focus', value: '3.5h' },
          { label: 'Designs', value: '7' },
        ]},
        { type: 'progress', items: [
          { label: 'Today\'s activity peak', pct: 87 },
          { label: 'Weekly output goal', pct: 64 },
        ]},
        { type: 'text', label: 'Insight', value: 'Peak creative window: 9–11am. 60% of your best work happens then.' },
      ],
    },
    {
      id: 'output',
      label: 'Output',
      content: [
        { type: 'metric', label: 'Today\'s Output', value: '1,840 words', sub: '73% of 2,500 daily goal' },
        { type: 'progress', items: [
          { label: 'Writing — 1,840 words', pct: 73 },
          { label: 'Design — 7 frames', pct: 88 },
          { label: 'Code — 142 lines', pct: 47 },
          { label: 'Reading — 28 pages', pct: 56 },
          { label: 'Deep focus — 3.5h', pct: 87 },
        ]},
        { type: 'tags', label: 'Disciplines', items: ['Writing', 'Design', 'Code', 'Reading', 'Focus'] },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '5' },
          { label: 'On Track', value: '4' },
          { label: 'At Risk', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Essay: On Creative Burnout', sub: 'Writing · 72% · Due Apr 11', badge: '●' },
          { icon: 'check', title: 'Brand Identity — Studio K', sub: 'Design · 88% · Due Apr 9', badge: '●' },
          { icon: 'alert', title: 'Short Story: The Cartographer', sub: 'Writing · 31% · Due Apr 15', badge: '⚠' },
          { icon: 'check', title: 'Personal Site Redesign', sub: 'Code · 55% · Due Apr 19', badge: '●' },
          { icon: 'check', title: 'Photography Zine, Vol.3', sub: 'Design · 64% · Due Apr 13', badge: '●' },
        ]},
      ],
    },
    {
      id: 'streaks',
      label: 'Streaks',
      content: [
        { type: 'metric', label: '🔥 Current Streak', value: '12 days', sub: 'Personal best: 21 days' },
        { type: 'list', items: [
          { icon: 'star', title: 'Morning write', sub: '6:30am · 12 days', badge: '12d' },
          { icon: 'star', title: 'Design review', sub: '11am · 5 days', badge: '5d' },
          { icon: 'star', title: 'Evening read', sub: '9pm · 9 days', badge: '9d' },
          { icon: 'star', title: 'Deep work block', sub: '2pm · 3 days', badge: '3d' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly ritual completion', pct: 82 },
        ]},
      ],
    },
    {
      id: 'insight',
      label: 'Insight',
      content: [
        { type: 'metric', label: 'Weekly Output', value: '9,200 words', sub: '↑ 18% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Focus hrs', value: '17.5h' },
          { label: 'Designs', value: '18' },
          { label: 'Projects', value: '4' },
        ]},
        { type: 'text', label: 'AI Reflection', value: 'You wrote 9,200 words this week — your highest since February. Focus blocks averaged 2.1h. Design dipped mid-week but recovered strongly Friday.' },
        { type: 'text', label: '💡 Next week\'s focus', value: 'Protect your 9–11am window. Try no-meetings on Tuesday and Thursday — that\'s when your deep work peaks.' },
      ],
    },
  ],

  nav: [
    { id: 'vitals',   label: 'Vitals',   icon: 'home' },
    { id: 'output',   label: 'Output',   icon: 'activity' },
    { id: 'projects', label: 'Projects', icon: 'grid' },
    { id: 'streaks',  label: 'Streaks',  icon: 'zap' },
    { id: 'insight',  label: 'Insight',  icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'opal-vitals-mock', 'OPAL — Interactive Creative Vitals Tracker');
console.log('Mock live at:', result.url);
