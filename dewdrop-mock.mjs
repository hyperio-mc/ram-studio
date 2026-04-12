import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DEWDROP',
  tagline:   'daily mood & micro-journal',
  archetype: 'emotional-wellness-journal',
  palette: {           // DARK mode
    bg:      '#1C1A18',
    surface: '#252220',
    text:    '#F9F6F1',
    accent:  '#7B9E87',
    accent2: '#D4856A',
    muted:   'rgba(249,246,241,0.4)',
  },
  lightPalette: {      // LIGHT mode (primary)
    bg:      '#F9F6F1',
    surface: '#EDE9E0',
    text:    '#1A1817',
    accent:  '#7B9E87',
    accent2: '#D4856A',
    muted:   'rgba(26,24,23,0.38)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Today\'s Mood', value: '7', sub: 'Feeling good today ✦' },
        { type: 'tags', label: 'Right now', items: ['Calm', 'Focused', 'Rested'] },
        { type: 'metric-row', items: [
          { label: 'Week avg', value: '7.2' },
          { label: 'Streak', value: '3🔥' },
          { label: 'Logs', value: '18' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 60 },
          { label: 'Tue', pct: 60 },
          { label: 'Wed', pct: 80 },
          { label: 'Thu', pct: 70 },
        ]},
        { type: 'text', label: 'Last entry', value: '"Felt tired after long calls but the sunset walk helped a lot."' },
      ],
    },
    {
      id: 'log', label: 'Log',
      content: [
        { type: 'metric', label: 'How are you feeling?', value: '7', sub: 'Tap to adjust 1–10' },
        { type: 'tags', label: 'Emotions', items: ['✓ Calm', 'Energized', '✓ Focused', 'Tired', 'Anxious', 'Grateful'] },
        { type: 'text', label: 'What\'s on your mind', value: 'Morning coffee + focus session. Calls felt manageable today.' },
        { type: 'tags', label: 'Context', items: ['🌅 Morning', '💼 Work', '🚶 Exercise'] },
        { type: 'text', label: 'One thing I\'m grateful for', value: 'The quiet 10 minutes with coffee this morning ✨' },
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'metric', label: 'Monthly Average', value: '7.2', sub: '↑ 0.8 from last month' },
        { type: 'metric-row', items: [
          { label: 'Logs', value: '18' },
          { label: 'Best', value: '9' },
          { label: 'Streak', value: '3🔥' },
        ]},
        { type: 'progress', items: [
          { label: 'Calm', pct: 68 },
          { label: 'Focused', pct: 54 },
          { label: 'Tired', pct: 42 },
          { label: 'Anxious', pct: 28 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Morning avg', value: '7.8' },
          { label: 'Afternoon', value: '6.2' },
          { label: 'Evening', value: '7.4' },
        ]},
      ],
    },
    {
      id: 'journal', label: 'Journal',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'Today · 7/10', sub: 'Calm · Focused — Morning coffee + focus session. Calls felt manageable.', badge: '7' },
          { icon: 'activity', title: 'Yesterday · 6/10', sub: 'Tired · Calm — Sunset walk at 7pm was a lifesaver.', badge: '6' },
          { icon: 'zap', title: 'Monday · 8/10', sub: 'Energized · Joyful — Crushed goals by noon. Pure flow state.', badge: '8' },
          { icon: 'alert', title: 'Sunday · 5/10', sub: 'Tired · Anxious — Pre-week dread. Journaling helped name it.', badge: '5' },
          { icon: 'heart', title: 'Saturday · 9/10', sub: 'Joyful · Rested — Farmers market + long lunch with friends.', badge: '9' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: '✦ Dewdrop Summary', value: 'Best week in a month. Morning routines drove higher scores — 7.8 avg before noon vs 6.2 in the afternoon. Exercise days were your emotional peak.' },
        { type: 'metric', label: 'Week Score', value: '7.4', sub: '↑ from 6.8 last week' },
        { type: 'list', items: [
          { icon: 'star', title: 'Peak day', sub: 'Monday · 9/10 — flow state afternoon', badge: '⭐' },
          { icon: 'alert', title: 'Low point', sub: 'Thursday · 5/10 — high meeting load', badge: '↓' },
          { icon: 'activity', title: 'Pattern found', sub: 'Walks raised mood avg by +1.4 points', badge: '🚶' },
        ]},
        { type: 'text', label: 'This week, try', value: 'Morning movement — physical activity before 10am correlates with a +1.6 mood lift by afternoon.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'log',      label: 'Log',      icon: 'plus' },
    { id: 'patterns', label: 'Patterns', icon: 'chart' },
    { id: 'journal',  label: 'Journal',  icon: 'list' },
    { id: 'insights', label: 'Insights', icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'dewdrop-mock', 'DEWDROP — Interactive Mock');
console.log('Mock live at:', result.url);
