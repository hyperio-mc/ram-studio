import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Pulse',
  tagline:   'Your day, in your voice',
  archetype: 'voice-journal',
  palette: {
    bg:      '#0C0909',
    surface: '#181212',
    text:    '#F0EBE3',
    accent:  '#F5A623',
    accent2: '#FF6B35',
    muted:   'rgba(240,235,227,0.35)',
  },
  lightPalette: {
    bg:      '#FBF8F3',
    surface: '#FFFFFF',
    text:    '#1A1515',
    accent:  '#D4880A',
    accent2: '#E05025',
    muted:   'rgba(26,21,21,0.4)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: "Today's Voice", value: '3 entries', sub: 'AI title: "Productive morning, uncertain afternoon"' },
        { type: 'metric-row', items: [{ label: 'Total', value: '14m' }, { label: 'Words', value: '2.4K' }, { label: 'Mood', value: '↑72%' }] },
        { type: 'list', items: [
          { icon: 'play', title: '8:14 AM — Morning intentions', sub: '2m 07s · focused', badge: '●' },
          { icon: 'play', title: '12:33 PM — Lunch thoughts', sub: '6m 42s · reflective', badge: '●' },
          { icon: 'play', title: '5:51 PM — Tomorrow planning', sub: '5m 33s · resolved', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'record', label: 'Record',
      content: [
        { type: 'metric', label: 'Recording', value: '02:47', sub: 'Live — tap to stop' },
        { type: 'tags', label: 'Topics Detected', items: ['Project scope', 'Timeline', 'Q2', 'Deadline'] },
        { type: 'text', label: 'Live Transcription', value: '"...I\'ve been thinking about the project scope and honestly the timeline feels off. We need to push back on the Q2 deadline — three weeks isn\'t enough..."' },
      ],
    },
    {
      id: 'digest', label: 'Daily Digest',
      content: [
        { type: 'metric', label: 'AI Audio Summary', value: '4:12', sub: 'Synthesised from 3 entries · tap to play' },
        { type: 'progress', items: [
          { label: 'Morning energy', pct: 90 },
          { label: 'Afternoon focus', pct: 45 },
          { label: 'Evening clarity', pct: 85 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'High energy window', sub: '8–10 AM — most clarity today', badge: '⚡' },
          { icon: 'alert', title: 'Tension point', sub: 'Uncertainty re: Q2 deadline', badge: '!' },
          { icon: 'check', title: 'Resolved intent', sub: 'Will push back on timeline', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'timeline', label: 'Timeline',
      content: [
        { type: 'metric', label: 'March 2026', value: '21 entries', sub: '🔥 18 day streak' },
        { type: 'metric-row', items: [
          { label: 'This week', value: '6/7' },
          { label: 'Total', value: '1h 42m' },
          { label: 'Avg', value: '4.9m' },
          { label: 'Month', value: '21' },
        ]},
        { type: 'tags', label: 'Active Days', items: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri','Mon','Tue'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'text', label: 'Last 30 days', value: 'Your most expressive month yet — 21 entries, 1h 42m recorded.' },
        { type: 'progress', items: [
          { label: 'Focused', pct: 72 },
          { label: 'Reflective', pct: 58 },
          { label: 'Grateful', pct: 45 },
          { label: 'Anxious', pct: 31 },
        ]},
        { type: 'tags', label: 'Top Topics', items: ['Work', 'Ideas', 'Relationships', 'Health', 'Goals', 'Finance'] },
        { type: 'text', label: 'Peak Recording Time', value: 'You record most between 8–10 AM. Your morning voice carries the most detail and emotion.' },
      ],
    },
  ],
  nav: [
    { id: 'today',   label: 'Today',   icon: 'home' },
    { id: 'record',  label: 'Record',  icon: 'plus' },
    { id: 'digest',  label: 'Digest',  icon: 'list' },
    { id: 'timeline',label: 'Timeline',icon: 'calendar' },
    { id: 'insights',label: 'Insights',icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pulse-voice-mock', 'Pulse — Interactive Mock');
console.log('Mock live at:', result.url);
