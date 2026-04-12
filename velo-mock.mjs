import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VELO',
  tagline:   'Your ride. Perfected.',
  archetype: 'fitness-cycling',
  palette: {
    bg:      '#1A2018',
    surface: '#242B21',
    text:    '#E8F0E4',
    accent:  '#4CAF6A',
    accent2: '#D4A847',
    muted:   'rgba(232,240,228,0.4)',
  },
  lightPalette: {
    bg:      '#F8F5F0',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#2E5E3E',
    accent2: '#C17A2E',
    muted:   'rgba(26,21,16,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      content: [
        { type: 'metric', label: 'This Week', value: '247 km', sub: '8h 42m ride time · 3,840 kcal' },
        { type: 'metric-row', items: [
          { label: 'Power Zone', value: '234W' },
          { label: 'Recovery', value: '87/100' },
          { label: 'Weekly TSS', value: '482' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning Climb', sub: '6:30 AM · 42 km · ▲ 620m', badge: 'Done' },
          { icon: 'zap', title: 'Interval Session', sub: 'Tomorrow · 90 min · FTP +5%', badge: 'Planned' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly TSS Goal', pct: 80 },
        ]},
        { type: 'text', label: 'Insight', value: 'Recovery score is excellent. You\'re primed for hard effort tomorrow.' },
      ],
    },
    {
      id: 'training',
      label: 'Training',
      content: [
        { type: 'metric', label: 'April 2026', value: 'Week 15 / 20', sub: 'Build Phase · ↑ 12% load increase' },
        { type: 'list', items: [
          { icon: 'zap', title: 'VO₂ Max Repeats', sub: 'Thu · 90 min · 95 TSS', badge: 'Hard' },
          { icon: 'activity', title: 'Z2 Base Ride', sub: 'Fri · 2h 30m · 80 TSS', badge: 'Mod' },
          { icon: 'chart', title: 'Tempo Blocks', sub: 'Sat · 2h · 110 TSS', badge: 'V.Hard' },
          { icon: 'heart', title: 'Active Spin', sub: 'Sun · 45 min · 30 TSS', badge: 'Easy' },
        ]},
        { type: 'tags', label: 'Session Types', items: ['Interval', 'Endurance', 'Race Sim', 'Recovery'] },
      ],
    },
    {
      id: 'stats',
      label: 'Stats',
      content: [
        { type: 'metric', label: 'FTP', value: '287 W', sub: '4.1 W/kg · ↑ 10.4% since January' },
        { type: 'metric-row', items: [
          { label: 'Distance', value: '1,240 km' },
          { label: 'Time', value: '38h' },
          { label: 'Climbing', value: '3,200m' },
        ]},
        { type: 'progress', items: [
          { label: 'Z1 Recovery (8%)', pct: 8 },
          { label: 'Z2 Aerobic (42%)', pct: 42 },
          { label: 'Z3 Tempo (28%)', pct: 28 },
          { label: 'Z4 Threshold (16%)', pct: 16 },
          { label: 'Z5 VO₂ Max (6%)', pct: 6 },
        ]},
        { type: 'text', label: 'Power Curve', value: 'Peak 5s: 900W · 1min: 550W · 5min: 450W · FTP: 287W' },
      ],
    },
    {
      id: 'goals',
      label: 'Goals',
      content: [
        { type: 'metric', label: 'A-Race', value: "Alpe d'Huez Gran Fondo", sub: 'June 14, 2026 · 66 days away · 73% ready' },
        { type: 'progress', items: [
          { label: 'Monthly Distance (1,500 km)', pct: 83 },
          { label: 'FTP 300W target', pct: 96 },
          { label: 'Everesting — Complete ✓', pct: 100 },
          { label: 'Century Ride — Complete ✓', pct: 100 },
        ]},
        { type: 'tags', label: 'Readiness', items: ['FTP ✓', 'Climbing ↗', 'Endurance ✓', 'Race Sim Next'] },
        { type: 'text', label: 'Coach Note', value: 'Threshold power is race-ready. Focus on climbing volume over the next 4 weeks.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Marcus Reinholt', value: 'Cat 3 Racer', sub: 'Paris, France · Riding since 2021' },
        { type: 'metric-row', items: [
          { label: 'Season km', value: '4,820' },
          { label: 'Moving', value: '142h' },
          { label: 'Climbing', value: '38,200m' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Everesting', sub: 'Climbed 8,848m in one ride — Mar 2026', badge: '⛰' },
          { icon: 'zap', title: 'Power PR', sub: 'New 5-min power: 385W — Feb 2026', badge: '⚡' },
          { icon: 'check', title: '30-Day Streak', sub: '30 consecutive riding days — Jan 2026', badge: '🔥' },
          { icon: 'heart', title: 'Gran Fondo Finisher', sub: 'Marmotte 2025 — 7h 12m', badge: '🏆' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Ride',    icon: 'activity' },
    { id: 'training',  label: 'Train',   icon: 'calendar' },
    { id: 'stats',     label: 'Stats',   icon: 'chart' },
    { id: 'goals',     label: 'Goals',   icon: 'star' },
    { id: 'profile',   label: 'Profile', icon: 'user' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'velo');
const result = await publishMock(built, 'velo-mock', 'VELO — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/velo-mock`);
