import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'MEND',
  tagline: 'Recovery intelligence for smart wearables',
  archetype: 'health-wearable-light',

  palette: {             // DARK theme
    bg:      '#1A1F2E',
    surface: '#242938',
    text:    '#F0EDE8',
    accent:  '#5A9E6A',
    accent2: '#D4876A',
    muted:   'rgba(240,237,232,0.4)',
  },

  lightPalette: {        // LIGHT theme (primary — this is a light-first design)
    bg:      '#F5F2EC',
    surface: '#FDFCFA',
    text:    '#1C1A17',
    accent:  '#3E6B4A',
    accent2: '#C4714A',
    muted:   'rgba(28,26,24,0.4)',
  },

  screens: [
    {
      id: 'welcome',
      label: 'Welcome',
      content: [
        { type: 'metric', label: 'Good morning', value: 'Alex.', sub: 'MEND Ring synced 2 min ago' },
        { type: 'text', label: 'Today', value: 'Your recovery score is ready. 14-day streak active.' },
        { type: 'metric-row', items: [
          { label: 'Last sleep', value: '7.4h' },
          { label: 'HRV', value: '62ms' },
          { label: 'Streak', value: '14d' },
        ]},
      ],
    },
    {
      id: 'today',
      label: 'Today',
      content: [
        { type: 'metric', label: 'Recovery Score', value: '84', sub: '↑ Good · +6 points from yesterday' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '62ms' },
          { label: 'Sleep', value: '7.4h' },
          { label: 'Resting', value: '58bpm' },
        ]},
        { type: 'text', label: "Today's Focus", value: 'Body primed for deep cognitive work. Peak window: 10am–1pm.' },
        { type: 'progress', items: [
          { label: 'Recovery', pct: 84 },
          { label: 'Sleep quality', pct: 88 },
          { label: 'Readiness', pct: 91 },
        ]},
        { type: 'tags', label: 'Today', items: ['Peak 10–1pm', 'HRV ↑', 'Well rested', 'Low stress'] },
      ],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      content: [
        { type: 'metric', label: 'Last night', value: '7h 24m', sub: 'Deep 22% · REM 19% · Light 59%' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '88' },
          { label: 'Efficiency', value: '91%' },
          { label: 'Timing', value: '74' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep sleep', pct: 22 },
          { label: 'REM', pct: 19 },
          { label: 'Light', pct: 59 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'HRV during sleep', sub: 'avg 62ms — healthy baseline', badge: '↑' },
          { icon: 'activity', title: 'Sleep efficiency', sub: '91% — excellent', badge: '✓' },
          { icon: 'alert', title: 'Timing score', sub: 'Fell asleep 40min earlier than avg', badge: '74' },
        ]},
      ],
    },
    {
      id: 'focus',
      label: 'Focus',
      content: [
        { type: 'metric', label: 'Peak window today', value: '10–1pm', sub: 'Deep work · Strategy · Learning' },
        { type: 'list', items: [
          { icon: 'star', title: 'Morning Reset', sub: '7:00 – 8:30am', badge: '○' },
          { icon: 'zap', title: 'Peak Cognitive', sub: '10:00am – 1:00pm', badge: '→' },
          { icon: 'eye', title: 'Creative Flow', sub: '2:00 – 3:30pm', badge: '○' },
          { icon: 'activity', title: 'Physical Prime', sub: '5:00 – 6:30pm', badge: '○' },
        ]},
        { type: 'progress', items: [
          { label: 'Sleep quality driver', pct: 84 },
          { label: 'HRV readiness', pct: 91 },
          { label: 'Activity balance', pct: 72 },
          { label: 'Stress load', pct: 68 },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg recovery', value: '84' },
          { label: 'Avg sleep', value: '7.2h' },
          { label: 'HRV trend', value: '↑12%' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'HRV trending up 5 days', sub: 'Nervous system responding well to lighter load', badge: '↑' },
          { icon: 'star', title: 'Sleep timing shifted earlier', sub: 'Correlates with improved morning HRV', badge: '✓' },
          { icon: 'alert', title: 'Cortisol spike Wed 2–4pm', sub: 'Consider 10-min breathing session', badge: '!' },
          { icon: 'zap', title: 'Focus window stable 9 days', sub: '10am–1pm consistently peak cognitive', badge: '✓' },
        ]},
        { type: 'tags', label: 'This week', items: ['On track', 'Sleep ↑', 'HRV best week', 'Streak 14d'] },
      ],
    },
  ],

  nav: [
    { id: 'welcome', label: 'Home', icon: 'home' },
    { id: 'today', label: 'Today', icon: 'activity' },
    { id: 'sleep', label: 'Sleep', icon: 'eye' },
    { id: 'focus', label: 'Focus', icon: 'zap' },
    { id: 'insights', label: 'Insights', icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'mend-mock', 'MEND — Interactive Mock');
console.log('Mock live at:', result.url);
