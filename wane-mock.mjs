import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'WANE',
  tagline:   'Wind down. Find your rhythm.',
  archetype: 'ai-circadian-wellness',
  palette: {
    bg:      '#080B18',
    surface: '#0F1326',
    text:    '#E8E6FF',
    accent:  '#7C5CFC',
    accent2: '#00D4C8',
    muted:   'rgba(232,230,255,0.38)',
  },
  lightPalette: {
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1A1530',
    accent:  '#6344E8',
    accent2: '#0099B8',
    muted:   'rgba(26,21,48,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Focus Score', value: '84', sub: '+6 pts from yesterday' },
        { type: 'metric-row', items: [
          { label: 'Focused', value: '2h 40m' },
          { label: 'Sessions', value: '3' },
          { label: 'Sleep', value: '94%' },
        ]},
        { type: 'tags', label: 'Quick Start', items: ['Deep Work', 'Flow State', 'Wind Down'] },
        { type: 'list', items: [
          { icon: 'zap', title: '12-day streak', sub: 'Personal best', badge: '🔥' },
          { icon: 'moon', title: 'Evening Reflection', sub: 'Not logged yet', badge: '→' },
        ]},
        { type: 'text', label: "Tonight's Ritual", value: '9:30 Meditation  ·  10:00 Screens off  ·  10:30 Sleep mode' },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'Active Session', value: '14:32', sub: 'remaining · Cosmos ambient' },
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '2 done' },
          { label: 'Flow', value: '91' },
          { label: 'Streak', value: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Session progress', pct: 60 },
        ]},
        { type: 'tags', label: 'Ambient Mode', items: ['Forest', 'Rain', '● Cosmos', 'Silence'] },
        { type: 'text', label: 'Focus task', value: 'Q2 strategy deck — section 3' },
      ],
    },
    {
      id: 'reflect', label: 'Reflect',
      content: [
        { type: 'metric', label: 'Session Complete', value: '45m', sub: 'Deep Work · 3:30 PM' },
        { type: 'tags', label: 'How did it feel?', items: ['😞', '😐', '😊', '● 😄', '🤩'] },
        { type: 'progress', items: [
          { label: 'Energy level', pct: 70 },
        ]},
        { type: 'tags', label: 'Focus quality', items: ['Scattered', 'Moderate', 'Good', '● Deep flow'] },
        { type: 'text', label: 'Note', value: '"Finished the financial section faster than expected. The Cosmos ambient really helped me lock in."' },
        { type: 'text', label: '✦ WANE insight', value: 'Your best deep focus happens 3–5 PM on Wednesdays. Your next session is right in that window.' },
      ],
    },
    {
      id: 'sleep', label: 'Sleep',
      content: [
        { type: 'metric', label: 'Sleep Readiness', value: '78', sub: 'Good sleep likely tonight' },
        { type: 'list', items: [
          { icon: 'check', title: 'Body scan meditation', sub: '8 min', badge: '✓' },
          { icon: 'check', title: 'Screens off', sub: 'Done', badge: '✓' },
          { icon: 'eye', title: 'Gratitude journal', sub: '5 min', badge: '→' },
          { icon: 'settings', title: 'Room temp: 66°F', sub: 'Adjust', badge: '→' },
          { icon: 'play', title: 'Sleep sounds: Rainfall', sub: 'Start', badge: '→' },
        ]},
        { type: 'text', label: 'Countdown', value: 'Sleep in 1h 22min · On track for your 8-hour goal' },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg focus/day', value: '2h 51m' },
          { label: 'Sleep quality', value: '81' },
          { label: 'Streak', value: '12 days' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon', pct: 50 },
          { label: 'Tue', pct: 62 },
          { label: 'Wed', pct: 84 },
          { label: 'Thu', pct: 56 },
          { label: 'Fri', pct: 72 },
          { label: 'Sat', pct: 24 },
        ]},
        { type: 'text', label: 'Peak window', value: 'Wednesdays 3–5 PM is your highest performance slot — protect it.' },
        { type: 'text', label: '✦ Weekly pattern', value: 'You focus 40% better after your wind-down ritual. Sleep readiness rises when screens off by 10 PM.' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'focus',    label: 'Focus',    icon: 'zap'      },
    { id: 'reflect',  label: 'Reflect',  icon: 'heart'    },
    { id: 'sleep',    label: 'Sleep',    icon: 'eye'      },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'wane-mock', 'WANE — Interactive Mock');
console.log('Mock live at:', result.url);
