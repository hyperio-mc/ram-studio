import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GLOAM',
  tagline:   'sleep where the light goes soft',
  archetype: 'health-sleep',
  palette: {
    bg:      '#090B12',
    surface: '#0F1220',
    text:    '#EEF0F6',
    accent:  '#F59E0B',
    accent2: '#2DD4BF',
    muted:   'rgba(128,144,180,0.4)',
  },
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#D97706',
    accent2: '#0D9488',
    muted:   'rgba(26,22,20,0.38)',
  },
  screens: [
    {
      id: 'tonight',
      label: 'Tonight',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '82', sub: 'Sunday, April 12' },
        { type: 'metric-row', items: [
          { label: 'Bedtime', value: '10:30 PM' },
          { label: 'Wake', value: '6:30 AM' },
          { label: 'Duration', value: '8h 0m' },
        ]},
        { type: 'text', label: 'Sleep Window', value: 'Opens in 2h 14m — your circadian window is approaching.' },
        { type: 'progress', items: [
          { label: 'No caffeine', pct: 100 },
          { label: 'Exercise done', pct: 75 },
          { label: 'Screen-free', pct: 40 },
        ]},
        { type: 'tags', label: 'Last Night', items: ['7h 12m', 'Good', 'Score 78', 'REM 28%'] },
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'Mood Check-in', value: 'Calm', sub: 'Tap to change your mood' },
        { type: 'progress', items: [
          { label: 'Energy level', pct: 35 },
        ]},
        { type: 'text', label: 'Notes', value: 'Feeling a bit restless after the late meeting. Need to wind down earlier.' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Caffeine after 2pm', sub: 'This affects sleep onset', badge: 'Off' },
          { icon: 'zap',   title: 'Exercise today',     sub: '30 min cardio',           badge: 'On'  },
          { icon: 'eye',   title: 'Screen-free hour',   sub: 'Before bed',              badge: 'On'  },
        ]},
      ],
    },
    {
      id: 'schedule',
      label: 'Schedule',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Duration', value: '7h 37m' },
          { label: 'Consistency', value: '86%' },
          { label: 'Sleep Debt', value: '−22m' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon  7.2h', pct: 72 },
          { label: 'Tue  6.5h', pct: 65 },
          { label: 'Wed  7.8h', pct: 78 },
          { label: 'Thu  8.1h', pct: 81 },
          { label: 'Fri  6.0h', pct: 60 },
          { label: 'Sat  9.2h', pct: 92 },
          { label: 'Sun  8.4h', pct: 84 },
        ]},
        { type: 'tags', label: 'This Week', items: ['Apr 6–12', '7 nights', 'Good streak'] },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Duration', value: '7h 41m' },
          { label: 'Quality',      value: '84 pts' },
          { label: 'Consistency',  value: '79%' },
        ]},
        { type: 'progress', items: [
          { label: 'Awake  8%',  pct: 8  },
          { label: 'Light  30%', pct: 30 },
          { label: 'Deep   22%', pct: 22 },
          { label: 'REM    40%', pct: 40 },
        ]},
        { type: 'text', label: 'Top Insight', value: 'Your best nights follow a 9pm wind-down start. Try moving your routine 30 min earlier.' },
        { type: 'list', items: [
          { icon: 'star',  title: 'Best night',  sub: 'Apr 8 · 9h 12m',  badge: '96' },
          { icon: 'alert', title: 'Worst night', sub: 'Apr 3 · 5h 44m',  badge: '54' },
        ]},
      ],
    },
    {
      id: 'winddown',
      label: 'Wind Down',
      content: [
        { type: 'metric', label: 'Routine Progress', value: '40%', sub: '42 min total · 17 min done' },
        { type: 'text', label: 'Now Active', value: 'Dim your lights — switch to warm bulbs or candlelight. 8 minutes.' },
        { type: 'list', items: [
          { icon: 'check',   title: 'Put your phone away',      sub: '10 min', badge: '2' },
          { icon: 'activity',title: 'Breathing exercise',       sub: '5 min',  badge: '3' },
          { icon: 'heart',   title: 'Read a physical book',     sub: '15 min', badge: '4' },
          { icon: 'bell',    title: 'Final screen check',       sub: '2 min',  badge: '5' },
        ]},
        { type: 'tags', label: 'Streak', items: ['14 nights', 'On track', 'Keep going'] },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      content: [
        { type: 'metric', label: 'Alex Rivera', value: 'Premium', sub: '14-day streak 🔥' },
        { type: 'list', items: [
          { icon: 'clock',    title: 'Target duration',  sub: 'Sleep goal',        badge: '8h'       },
          { icon: 'moon',     title: 'Bedtime target',   sub: 'Wind down at 9:45', badge: '10:30 PM' },
          { icon: 'sun',      title: 'Wake target',      sub: 'Smart alarm ±20min',badge: '6:30 AM'  },
          { icon: 'settings', title: 'Wind-down length', sub: 'Pre-sleep routine', badge: '42 min'   },
        ]},
        { type: 'tags', label: 'Smart Features', items: ['Smart Alarm', 'Gloam Score', 'Wind-down Alert'] },
      ],
    },
  ],
  nav: [
    { id: 'tonight',  label: 'Tonight',   icon: 'moon'     },
    { id: 'log',      label: 'Log',        icon: 'edit'     },
    { id: 'schedule', label: 'Schedule',   icon: 'calendar' },
    { id: 'insights', label: 'Insights',   icon: 'chart'    },
    { id: 'winddown', label: 'Wind Down',  icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'gloam-mock', 'GLOAM — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/gloam-mock`);
