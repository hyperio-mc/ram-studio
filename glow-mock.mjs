// glow-mock.mjs — Svelte interactive mock for Glow
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import https from 'https';
import fs from 'fs';

const SLUG = 'glow';

const design = {
  appName:   'Glow',
  tagline:   'Your morning energy OS',
  archetype: 'wellness-productivity',
  palette: {           // DARK theme
    bg:      '#1A1612',
    surface: '#242018',
    text:    '#F5F0EA',
    accent:  '#E8713C',
    accent2: '#7AAD83',
    muted:   'rgba(245,240,234,0.42)',
  },
  lightPalette: {      // LIGHT theme — primary
    bg:      '#FBF7F3',
    surface: '#FFFFFF',
    text:    '#1C1815',
    accent:  '#E8713C',
    accent2: '#7AAD83',
    muted:   'rgba(28,24,21,0.45)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Energy Score', value: '78', sub: 'Thursday · Good rhythm' },
        { type: 'metric-row', items: [
          { label: 'Focus', value: '92%' },
          { label: 'Mood', value: '↑ Great' },
          { label: 'Body', value: '84%' },
        ]},
        { type: 'tags', label: 'Today\'s Status', items: ['⚡ On track', '🎯 3 intentions set', '🔥 8-day streak'] },
        { type: 'list', items: [
          { icon: 'check', title: '10 min meditation', sub: '7:30 AM · Done', badge: '✓' },
          { icon: 'star', title: 'Journal entry', sub: 'Write 3 gratitudes' },
          { icon: 'zap', title: 'Hydration goal', sub: '4 of 8 glasses' },
        ]},
        { type: 'text', label: '✦ Glow insight', value: 'Your energy peaks at 10am. Block 2 hrs for deep work before lunch.' },
      ],
    },
    {
      id: 'focus',
      label: 'Focus',
      content: [
        { type: 'metric', label: 'Active Session', value: '47:22', sub: 'Deep Work · Design sprint' },
        { type: 'tags', label: 'Session Type', items: ['⚡ Deep work', '● Recording'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Email & Comms', sub: '8:00 · 25 min complete', badge: 'light' },
          { icon: 'check', title: 'Strategy Planning', sub: '8:40 · 50 min complete', badge: 'deep' },
          { icon: 'check', title: 'Review & Notes', sub: '9:42 · 25 min complete', badge: 'light' },
        ]},
        { type: 'progress', items: [
          { label: 'Daily focus goal (4h)', pct: 67 },
          { label: 'Deep work quota', pct: 80 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '3' },
          { label: 'Total focused', value: '2h 40m' },
          { label: 'Goal', value: '4h' },
        ]},
      ],
    },
    {
      id: 'patterns',
      label: 'Patterns',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Energy', value: '76%' },
          { label: 'Focus hrs', value: '14.5h' },
          { label: 'Streak', value: '8 days' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon energy', pct: 72 },
          { label: 'Tue energy', pct: 85 },
          { label: 'Wed energy', pct: 91 },
          { label: 'Thu energy', pct: 88 },
          { label: 'Fri energy', pct: 78 },
          { label: 'Sat energy', pct: 55 },
          { label: 'Sun energy', pct: 62 },
        ]},
        { type: 'tags', label: 'This Week', items: ['Best: Wed 91', 'Lowest: Sat 55', '+4% vs last week'] },
        { type: 'metric-row', items: [
          { label: 'Best day', value: 'Wed' },
          { label: 'Best streak', value: '8d' },
          { label: 'Avg focus', value: '2h/day' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'AI Analysis', value: '3', sub: 'New insights this week · 14 days of data' },
        { type: 'text', label: '⏰ Peak window found', value: 'You consistently hit 90%+ energy between 9–11am. Schedule your hardest tasks then.' },
        { type: 'text', label: '😴 Sleep correlation', value: 'On days you sleep 7.5h+, focus time increases by 38%. Last 3 nights averaged 6.2h.' },
        { type: 'text', label: '🌿 Afternoon slump', value: 'Energy dips 2–3:30pm daily. A 10-min walk during this window boosted energy by 22% twice this week.' },
        { type: 'tags', label: 'Insight Categories', items: ['Timing', 'Sleep', 'Recovery', 'Nutrition'] },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'Active Streak', value: '🔥 12', sub: 'Days — best run yet!' },
        { type: 'progress', items: [
          { label: 'Deep Work (4h/day)', pct: 68 },
          { label: 'Hydration (8 glasses)', pct: 50 },
          { label: 'Movement (30 min)', pct: 100 },
          { label: 'Journaling (daily)', pct: 87 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Deep Work', sub: '2h 40m of 4h · 🔥 8d streak', badge: '68%' },
          { icon: 'heart', title: 'Movement', sub: '30 min complete · 🔥 12d streak', badge: '✓' },
          { icon: 'star', title: 'Journaling', sub: 'Done today · 🔥 6d streak', badge: '✓' },
        ]},
        { type: 'tags', label: 'Quick Add', items: ['+ Sleep goal', '+ Reading goal', '+ Nutrition goal'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'focus',    label: 'Focus',    icon: 'zap' },
    { id: 'patterns', label: 'Patterns', icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'goals',    label: 'Goals',    icon: 'check' },
  ],
};

console.log('Generating Svelte component...');
const svelteSource = generateSvelteComponent(design);

console.log('Building mock...');
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});

console.log('Publishing mock...');
const result = await publishMock(html, SLUG + '-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
