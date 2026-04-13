import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'EASE',
  tagline:   'Recovery-Aware Training Companion',
  archetype: 'fitness-recovery',

  palette: {
    bg:      '#2A211A',
    surface: '#342A22',
    text:    '#F6F0E8',
    accent:  '#C4623C',
    accent2: '#5C7A5E',
    muted:   'rgba(181,169,154,0.5)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1E1914',
    accent:  '#C4623C',
    accent2: '#5C7A5E',
    muted:   'rgba(30,25,20,0.4)',
  },

  screens: [
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'BODY READINESS — Monday, Apr 13', value: '72 / 100', sub: 'Moderate — train light today · Based on sleep, HRV & yesterday\'s load' },
        { type: 'metric-row', items: [
          { label: 'SLEEP', value: '7h 22m' },
          { label: 'HRV', value: '52 ms' },
          { label: 'RESTING HR', value: '58 bpm' },
        ]},
        { type: 'progress', items: [
          { label: 'Sleep Quality', pct: 78 },
          { label: 'HRV Score', pct: 65 },
          { label: 'Resting HR', pct: 82 },
        ]},
        { type: 'text', label: 'REST IS DATA', value: 'Not a gap in your log. Your recovery window is part of the plan.' },
        { type: 'list', items: [
          { icon: 'activity',  title: 'Today\'s plan: Easy Zone 2 Run', sub: '30 min · Heart rate below 140 bpm', badge: '→' },
        ]},
      ],
    },
    {
      id: 'log',
      label: 'Log',
      content: [
        { type: 'metric', label: 'CHECK-IN · STEP 2 OF 5', value: 'How did you sleep?', sub: 'One question at a time' },
        { type: 'list', items: [
          { icon: 'check-circle', title: 'Deep and uninterrupted', sub: '●●●',  badge: '' },
          { icon: 'check-circle', title: 'Mostly good, few wake-ups', sub: '●●○ — selected', badge: '✓' },
          { icon: 'circle',       title: 'Restless, woke often',     sub: '●○○', badge: '' },
          { icon: 'circle',       title: 'Terrible — barely slept',  sub: '○○○', badge: '' },
        ]},
        { type: 'text', label: 'NOTE (OPTIONAL)', value: 'Felt a bit warm last night, window open…' },
        { type: 'text', label: 'PREVIOUS ANSWER', value: 'Energy level: 6 / 10 — moderate' },
      ],
    },
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric-row', items: [
          { label: 'AVG LOAD', value: '68%' },
          { label: 'AVG RECOVERY', value: '74%' },
          { label: 'REST DAYS', value: '2' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday — Load 82, Recovery 68', pct: 82 },
          { label: 'Tuesday — Load 74, Recovery 72', pct: 74 },
          { label: 'Wednesday — Load 88, Recovery 58 ⚠', pct: 88 },
          { label: 'Thursday — REST DAY', pct: 0 },
          { label: 'Friday — Load 65, Recovery 80', pct: 65 },
          { label: 'Saturday — Load 78, Recovery 71', pct: 78 },
          { label: 'Sunday (today) — Load 45', pct: 45 },
        ]},
        { type: 'text', label: 'HRV 7-DAY', value: '54 → 50 → 48 → 58 → 62 → 55 → 52 ms · Peak Friday after rest day' },
        { type: 'text', label: 'EASE INSIGHT', value: 'Wednesday pushed you into the red. Thursday\'s rest brought HRV back up by Friday — the recovery worked. Keep this week lighter.' },
      ],
    },
    {
      id: 'train',
      label: 'Train',
      content: [
        { type: 'metric', label: 'ADJUSTED FOR READINESS: 72', value: 'Easy Zone 2 Run', sub: '30 min · Heart rate below 140 bpm · Warm-up 5m → Easy 20m → Cool-down 5m' },
        { type: 'list', items: [
          { icon: 'wind',     title: 'Yoga flow',       sub: '45 min · Mobility',      badge: '45m' },
          { icon: 'sun',      title: 'Walk in nature',  sub: '60 min · Active rest',    badge: '60m' },
          { icon: 'droplets', title: 'Swim (easy)',     sub: '30 min · Low impact',     badge: '30m' },
          { icon: 'moon',     title: 'Full rest day',   sub: 'All day · Recovery',       badge: '★' },
        ]},
      ],
    },
    {
      id: 'body',
      label: 'Body',
      content: [
        { type: 'metric', label: 'MUSCLE RECOVERY MAP', value: 'Quads: still recovering', sub: '24–36h needed after Saturday tempo run' },
        { type: 'progress', items: [
          { label: 'Quads — Still recovering', pct: 32 },
          { label: 'Calves — Moderate', pct: 55 },
          { label: 'Core — Fresh', pct: 88 },
          { label: 'Shoulders — Fresh', pct: 92 },
          { label: 'Back — Not trained', pct: 100 },
        ]},
        { type: 'text', label: 'LAST SESSION', value: 'Saturday — 5km tempo run · 28:44 · Avg HR 162 bpm · Load 82' },
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: 'PATTERN INSIGHT', value: 'Thursdays: readiness 81 avg', sub: 'vs 68 overall average — your best recovery day' },
        { type: 'list', items: [
          { icon: 'moon',      title: 'Sleep < 7h → HRV drops next day', sub: '12 data points over 30 days',                     badge: 'Sleep' },
          { icon: 'zap',       title: 'Tempo runs hit you for 36 hours', sub: 'Quads take 10h longer than average to recover',    badge: 'Load' },
          { icon: 'sun',       title: 'Zone 2 after rest = best sessions', sub: 'Friday post-Thursday score 18% higher',          badge: 'Timing' },
          { icon: 'activity',  title: 'You overtrain in 3-week cycles', sub: 'Load spikes every 21 days. Planned deload needed.',  badge: 'Pattern' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'activity' },
    { id: 'log',      label: 'Log',      icon: 'edit-3' },
    { id: 'trends',   label: 'Trends',   icon: 'bar-chart-2' },
    { id: 'train',    label: 'Train',    icon: 'zap' },
    { id: 'insights', label: 'Insights', icon: 'compass' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'ease');
const result = await publishMock(built, 'ease');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/ease-mock`);
