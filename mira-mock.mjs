import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Mira',
  tagline:   'Think clearly, feel grounded',
  archetype: 'wellness-productivity',
  palette: {
    bg:      '#1A1F1C',
    surface: '#242B26',
    text:    '#F0EDE8',
    accent:  '#5FA370',
    accent2: '#D4845A',
    muted:   'rgba(240,237,232,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#4A7C5A',
    accent2: '#C4704A',
    muted:   'rgba(28,25,23,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'CLARITY SCORE', value: '78', sub: '↑ 12 pts from yesterday' },
        { type: 'metric-row', items: [
          { label: 'Sleep', value: '7h 20m' },
          { label: 'Cog. Load', value: 'Medium' },
          { label: 'Recovery', value: '3 / 5' },
        ]},
        { type: 'tags', label: 'How are you feeling?', items: ['😔 Rough', '😐 Meh', '🙂 Good ✓', '😄 Great', '🤩 Peak'] },
        { type: 'text', label: "Today's Focus", value: '3 sessions · 4h 10m total' },
        { type: 'list', items: [
          { icon: 'zap', title: '8:00 AM — Deep work', sub: '90 min · Score 91', badge: '●' },
          { icon: 'activity', title: '10:30 AM — Meetings', sub: '60 min · Score 62', badge: '●' },
          { icon: 'star', title: '12:00 PM — Flow state', sub: '160 min · Score 88', badge: '●' },
        ]},
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'text', label: 'Check In', value: 'Be honest — no judgment here' },
        { type: 'tags', label: 'Feeling', items: ['😔 Rough', '😐 Meh', '🙂 Good ✓', '😄 Great', '🤩 Peak'] },
        { type: 'progress', items: [
          { label: 'Energy Level', pct: 70 },
          { label: 'Cognitive Load', pct: 50 },
        ]},
        { type: 'tags', label: "What's contributing?", items: ['🧘 Rested', '💻 Deep work', '☕ Caffeine', '🏃 Exercise', '📵 Digital break'] },
        { type: 'text', label: '🔒 Private note', value: 'Had a productive morning, the deep work session on the API redesign really clicked.' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'AVG CLARITY SCORE', value: '71', sub: 'Mar 20 – Mar 26' },
        { type: 'progress', items: [
          { label: 'Mon', pct: 42 },
          { label: 'Tue', pct: 60 },
          { label: 'Wed', pct: 55 },
          { label: 'Thu', pct: 72 },
          { label: 'Fri', pct: 35 },
          { label: 'Sat', pct: 58 },
          { label: 'Sun', pct: 78 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Morning peak performance', sub: 'Clarity 34% higher before 11 AM', badge: '🌅' },
          { icon: 'eye', title: 'Sleep drives everything', sub: '7h+: avg 82. Below 6h: avg 54', badge: '😴' },
          { icon: 'eye', title: 'Exercise boosts afternoon', sub: '+22% focus on exercise days', badge: '🏃' },
        ]},
        { type: 'text', label: '🌿 Mira suggests', value: 'Schedule API design session for tomorrow 8–10 AM — your optimal window.' },
      ],
    },
    {
      id: 'focus',
      label: 'Focus',
      content: [
        { type: 'metric', label: 'DEEP WORK — POMODORO', value: '42:18', sub: 'remaining' },
        { type: 'metric-row', items: [
          { label: 'Flow', value: 'HIGH' },
          { label: 'Distractions', value: '2' },
          { label: 'Score', value: '88' },
        ]},
        { type: 'text', label: 'Working on', value: 'API Redesign — Authentication Module' },
        { type: 'tags', label: 'Controls', items: ['⏸ Pause', '⏵ Resume', '↺ Restart'] },
        { type: 'text', label: 'Status', value: "🌿 You're in a flow state. Keep going." },
      ],
    },
    {
      id: 'review',
      label: 'Review',
      content: [
        { type: 'metric', label: 'SUSTAINABLE PACE', value: '74', sub: '↑ 8 pts from last week' },
        { type: 'metric-row', items: [
          { label: 'Focus hrs', value: '22h 40m' },
          { label: 'Check-ins', value: '18 / 21' },
          { label: 'Recovery', value: '2 days' },
        ]},
        { type: 'progress', items: [
          { label: '🌅 Morning routine', pct: 90 },
          { label: '🏃 Exercise', pct: 60 },
          { label: '📵 Digital sunset', pct: 40 },
        ]},
        { type: 'text', label: 'Next week intention', value: 'Protect morning focus blocks and add one more exercise session mid-week.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'calendar' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
    { id: 'log',      label: 'Log',      icon: 'plus' },
    { id: 'focus',    label: 'Focus',    icon: 'zap' },
    { id: 'review',   label: 'Review',   icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'mira-mock', 'Mira — Interactive Mock');
console.log('Mock live at:', result.url);
