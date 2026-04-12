import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NURA',
  tagline:   'Neural state, in focus',
  archetype: 'cognitive-performance',
  palette: {
    bg:      '#070B12',
    surface: '#111A2E',
    text:    '#E2EBF9',
    accent:  '#00F5C3',
    accent2: '#A855F7',
    muted:   'rgba(107,127,166,0.5)',
  },
  lightPalette: {
    bg:      '#F0F4FF',
    surface: '#FFFFFF',
    text:    '#0C1220',
    accent:  '#00A67E',
    accent2: '#7C3AED',
    muted:   'rgba(12,18,32,0.4)',
  },
  screens: [
    {
      id: 'state', label: 'Neural State',
      content: [
        { type: 'metric', label: 'Focus Score', value: '87', sub: 'Excellent — Top 12%' },
        { type: 'metric-row', items: [
          { label: 'Cognition', value: '91%' },
          { label: 'Energy', value: '74%' },
          { label: 'Stress', value: 'Low' },
        ]},
        { type: 'text', label: 'Active Session', value: 'Deep Work · Design Review — 1h 24m' },
        { type: 'progress', items: [
          { label: 'Deep Work Today', pct: 75 },
          { label: 'Recovery Target', pct: 60 },
          { label: 'Flow Goal', pct: 80 },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Your peak focus hits at 10–11am. Schedule deep work then.' },
      ],
    },
    {
      id: 'focus', label: 'Focus Session',
      content: [
        { type: 'metric', label: 'Session Timer', value: '24:18', sub: 'Interval 2 of 4 · 90-min block' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '58ms' },
          { label: 'Flow', value: '94%' },
          { label: 'Drift', value: 'Low' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Phone pickup', sub: '10:14am · 8 seconds', badge: '!' },
          { icon: 'alert', title: 'Tab switch', sub: '10:31am · 22 seconds', badge: '!' },
          { icon: 'alert', title: 'Notification glance', sub: '10:47am · 3 seconds', badge: '!' },
        ]},
        { type: 'progress', items: [
          { label: 'Focus Intensity', pct: 91 },
          { label: 'Session Depth', pct: 84 },
        ]},
      ],
    },
    {
      id: 'rest', label: 'Rest & Recovery',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '82', sub: 'Good · +4 above average' },
        { type: 'metric-row', items: [
          { label: 'Deep Sleep', value: '1h 48m' },
          { label: 'REM', value: '1h 56m' },
          { label: 'HRV Avg', value: '58' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Sleep', pct: 24 },
          { label: 'REM', pct: 26 },
          { label: 'Light Sleep', pct: 42 },
          { label: 'Awake', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: '20-min power nap at 2pm', sub: 'Today · Recommended', badge: '✓' },
          { icon: 'bell', title: 'Wind-down by 10pm', sub: 'Tonight · Sleep hygiene', badge: '→' },
          { icon: 'activity', title: 'Hydrate +500ml', sub: 'Now · Pre-deep-work', badge: '→' },
        ]},
      ],
    },
    {
      id: 'flow', label: 'Flow Intelligence',
      content: [
        { type: 'metric', label: 'Flow Frequency', value: '3.2×', sub: 'flow states / week · Top 8% of users' },
        { type: 'list', items: [
          { icon: 'star', title: '10–11am sessions', sub: '94% correlation with flow', badge: '#1' },
          { icon: 'play', title: 'Music on, no notifications', sub: '88% correlation', badge: '#2' },
          { icon: 'activity', title: 'After 20-min warm-up', sub: '82% correlation', badge: '#3' },
          { icon: 'clock', title: '90-min blocks only', sub: '76% correlation', badge: '#4' },
        ]},
        { type: 'text', label: 'AI Insight', value: 'Schedule deep work at 10am with music and 90-min blocks for maximum flow probability (91%).' },
        { type: 'tags', label: 'Flow Conditions', items: ['Morning', 'Music', 'Long Block', 'No Interrupts'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Cognitive Athlete', value: 'Level 7', sub: '42 sessions · 164h logged' },
        { type: 'progress', items: [
          { label: 'Deep Work (11.2h of 15h)', pct: 75 },
          { label: 'Flow Sessions (3 of 4)', pct: 75 },
          { label: 'Sleep Score (79 of 85)', pct: 93 },
          { label: 'Stress-free Days (4 of 5)', pct: 80 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Focus Streak', value: '14 days' },
          { label: 'Flow Weeks', value: '4 weeks' },
          { label: 'Sleep', value: '6 days' },
        ]},
        { type: 'tags', label: 'Settings', items: ['Integrations', 'Notifications', 'Data Export', 'About'] },
      ],
    },
  ],
  nav: [
    { id: 'state',   label: 'State',   icon: 'activity' },
    { id: 'focus',   label: 'Focus',   icon: 'zap' },
    { id: 'rest',    label: 'Rest',    icon: 'heart' },
    { id: 'flow',    label: 'Flow',    icon: 'star' },
    { id: 'profile', label: 'You',     icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nura-mock', 'NURA — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/nura-mock`);
