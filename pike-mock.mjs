import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'PIKE',
  tagline:   'Know your body daily',
  archetype: 'health-biometrics',
  palette: {
    bg:      '#0A1A0E',
    surface: '#112016',
    text:    '#C9F53A',
    accent:  '#C9F53A',
    accent2: '#6ED98A',
    muted:   'rgba(201,245,58,0.35)',
  },
  lightPalette: {
    bg:      '#FAF9F3',
    surface: '#FFFFFF',
    text:    '#1C1C18',
    accent:  '#2D3A1E',
    accent2: '#C9F53A',
    muted:   'rgba(28,28,24,0.4)',
  },
  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Body Score', value: '82', sub: 'Good — above your 7-day avg' },
        { type: 'metric-row', items: [
          { label: 'Sleep', value: '7h 32m' },
          { label: 'Steps', value: '8,241' },
          { label: 'Calories', value: '1,847' },
        ]},
        { type: 'progress', items: [
          { label: 'Steps to goal', pct: 82 },
          { label: 'Active calories', pct: 72 },
          { label: 'Hydration', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning run', sub: '3.2 km · 24 min · 286 cal', badge: 'Done' },
          { icon: 'heart', title: 'Resting HR', sub: '68 bpm · Low zone', badge: '✓' },
          { icon: 'star', title: 'Sleep quality', sub: '7h 32m · Score 84', badge: '+12m' },
        ]},
        { type: 'text', label: 'Coach Nudge', value: 'You\'re 1,759 steps away from your daily goal. A 15-min walk will get you there.' },
      ],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      content: [
        { type: 'metric', label: 'Last Night', value: '7h 32m', sub: '↑ 12 min above your average' },
        { type: 'metric-row', items: [
          { label: 'Score', value: '84' },
          { label: 'REM', value: '20%' },
          { label: 'Deep', value: '30%' },
        ]},
        { type: 'progress', items: [
          { label: 'REM cycles', pct: 80 },
          { label: 'Deep sleep', pct: 75 },
          { label: 'Consistency', pct: 62 },
        ]},
        { type: 'tags', label: 'Sleep Stages', items: ['Awake 5%', 'REM 20%', 'Light 45%', 'Deep 30%'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Sleep Score', sub: '84 — Excellent', badge: '↑' },
          { icon: 'activity', title: 'Restlessness', sub: 'Low · 3 movements', badge: 'Low' },
          { icon: 'heart', title: 'Resting HR', sub: '58 bpm avg during sleep', badge: '↓' },
        ]},
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      content: [
        { type: 'metric', label: 'Active Calories', value: '520', sub: 'of 720 cal goal · 72% complete' },
        { type: 'metric-row', items: [
          { label: 'Steps', value: '8,241' },
          { label: 'Distance', value: '2.4 km' },
          { label: 'Workouts', value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'Move goal (720 cal)', pct: 72 },
          { label: 'Exercise (30 min)', pct: 80 },
          { label: 'Stand goal (12 hr)', pct: 75 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning Run', sub: '24 min · 3.2 km · 286 cal', badge: '7:00 AM' },
          { icon: 'star', title: 'Yoga Flow', sub: '35 min · Flexibility · 110 cal', badge: '12:15 PM' },
          { icon: 'map', title: 'Evening Walk', sub: '18 min · 1.4 km · 68 cal', badge: '6:30 PM' },
        ]},
      ],
    },
    {
      id: 'vitals',
      label: 'Vitals',
      content: [
        { type: 'metric', label: 'Heart Rate', value: '68 bpm', sub: 'Resting · Low zone · ↓ from 72 last week' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '54 ms' },
          { label: 'SpO₂', value: '98%' },
          { label: 'Stress', value: 'Low' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Heart Rate', sub: '68 bpm · Resting', badge: '↓2' },
          { icon: 'activity', title: 'HRV', sub: '54 ms · Good recovery', badge: '↑8' },
          { icon: 'check', title: 'Blood Oxygen', sub: '98% · Normal range', badge: 'OK' },
          { icon: 'zap', title: 'Resp Rate', sub: '14 brpm · Normal', badge: 'OK' },
        ]},
        { type: 'tags', label: 'HR Zones Today', items: ['Zone 1: 52%', 'Zone 2: 31%', 'Zone 3: 12%', 'Zone 4: 5%'] },
        { type: 'text', label: 'Device', value: 'Apple Watch Ultra 2 · Connected · 84% battery · Live readings active' },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '4' },
          { label: 'Done', value: '12' },
          { label: 'Streak', value: '18d' },
        ]},
        { type: 'progress', items: [
          { label: '10K Steps Daily', pct: 82 },
          { label: '8 Hours Sleep', pct: 62 },
          { label: 'Resting HR < 60', pct: 87 },
          { label: '2.5L Hydration', pct: 72 },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: '10K Steps Daily', sub: '14-day streak · 82% today', badge: '82%' },
          { icon: 'star', title: '8 Hours Sleep', sub: '5 of 7 days this week', badge: '62%' },
          { icon: 'heart', title: 'Resting HR < 60', sub: 'Best: 58 bpm achieved', badge: '87%' },
        ]},
        { type: 'text', label: 'Insight', value: 'You\'re on a strong 18-day health streak. Your resting HR goal is closest to completion — keep up cardio this week.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'sleep',    label: 'Sleep',    icon: 'eye' },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'vitals',   label: 'Vitals',   icon: 'heart' },
    { id: 'goals',    label: 'Goals',    icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'pike-mock', 'PIKE — Interactive Mock');
console.log('Mock live at:', result.url);
