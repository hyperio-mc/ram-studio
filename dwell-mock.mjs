import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DWELL',
  tagline:   'Your deep work, made visible.',
  archetype: 'productivity-wellness',
  palette: {
    bg:      '#1A1714',
    surface: '#252220',
    text:    '#F4F1EC',
    accent:  '#0E7A6C',
    accent2: '#C4713A',
    muted:   'rgba(244,241,236,0.4)',
  },
  lightPalette: {
    bg:      '#F4F1EC',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#0E7A6C',
    accent2: '#C4713A',
    muted:   'rgba(26,23,20,0.42)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Deep Work Today', value: '3.4h', sub: '68% of 5h goal · 7-day streak 🔥 · In flow state' },
        { type: 'metric-row', items: [
          { label: 'Sessions', value: '4' },
          { label: 'Streak', value: '7d' },
          { label: 'Flow', value: '2×' },
          { label: 'Quality', value: '88' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'API Architecture · Active', sub: '47:12 elapsed · In flow', badge: '●' },
          { icon: 'check', title: 'Code Review — Auth PR', sub: '2:00 PM', badge: 'Up next' },
          { icon: 'calendar', title: 'Design Sync', sub: '4:00 PM', badge: 'Later' },
        ]},
        { type: 'progress', items: [
          { label: 'Focus Goal (5h)', pct: 68 },
          { label: 'Morning block used', pct: 85 },
        ]},
        { type: 'text', label: 'AI Nudge', value: 'Your best work happens before 11am. You have 14 minutes left in your peak window.' },
      ],
    },
    {
      id: 'sessions', label: 'Sessions',
      content: [
        { type: 'metric', label: 'Today · 4 Sessions', value: '3h 27m', sub: 'Total focus · 76% deep work ratio · Quality avg 82' },
        { type: 'list', items: [
          { icon: 'zap', title: 'API Architecture · 1h 42m', sub: '8:12 – 9:54 AM · Quality 92', badge: 'Deep' },
          { icon: 'zap', title: 'Code Review · 45m', sub: '10:20 – 11:05 AM · Quality 78', badge: 'Deep' },
          { icon: 'eye', title: 'Email / Slack · 20m', sub: '11:30 – 11:50 AM · Quality 40', badge: 'Shallow' },
          { icon: 'zap', title: 'System Design · 1h', sub: '1:00 – 2:00 PM · Quality 88', badge: 'Deep' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Deep Work', 'Shallow', 'Breaks'] },
        { type: 'progress', items: [
          { label: 'Session 1 — Quality', pct: 92 },
          { label: 'Session 2 — Quality', pct: 78 },
          { label: 'Session 3 — Quality', pct: 40 },
          { label: 'Session 4 — Quality', pct: 88 },
        ]},
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'metric', label: 'This Week', value: '18.4h', sub: 'Deep work total · Mon–Sun · ↑ 8% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Mon', value: '4.2h' },
          { label: 'Tue', value: '3.8h' },
          { label: 'Wed', value: '5.0h' },
          { label: 'Thu', value: '2.5h' },
        ]},
        { type: 'progress', items: [
          { label: 'Monday', pct: 84 },
          { label: 'Tuesday', pct: 76 },
          { label: 'Wednesday', pct: 100 },
          { label: 'Thursday', pct: 50 },
          { label: 'Friday (today)', pct: 68 },
        ]},
        { type: 'text', label: 'Peak Focus Hours', value: 'Best focus windows: 9–11am and 2–3pm. Afternoon sessions are 34% shorter on average.' },
        { type: 'tags', label: 'Best Days', items: ['Wednesday', 'Monday', 'Friday'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: '✦ AI Weekly Pattern', value: '+34%', sub: 'Better work in morning sessions before 11am · Based on 23 sessions' },
        { type: 'metric-row', items: [
          { label: 'Focus trend', value: '+12%' },
          { label: 'Avg session', value: '58m' },
          { label: 'Deep ratio', value: '76%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Protect morning blocks', sub: 'Schedule deep work before 11am for max output', badge: 'High' },
          { icon: 'activity', title: 'Shorten break gaps', sub: 'Your 20–30m breaks break flow momentum', badge: 'Med' },
          { icon: 'check', title: 'End with a capture', sub: '3 lines post-session boosts next recall by 40%', badge: 'Habit' },
        ]},
        { type: 'text', label: 'Streak Analysis', value: '7-day streak active. Your longest was 12 days in January. Keep it going through the weekend.' },
      ],
    },
    {
      id: 'focus', label: 'Focus',
      content: [
        { type: 'metric', label: 'API Architecture · Focus Mode', value: '47:12', sub: 'of 90 min · ● IN FLOW STATE · Quality: Excellent' },
        { type: 'progress', items: [
          { label: 'Session progress', pct: 52 },
          { label: 'Focus quality', pct: 92 },
          { label: 'Flow depth', pct: 85 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Elapsed', value: '47m' },
          { label: 'Remaining', value: '43m' },
          { label: 'Distractions', value: '0' },
        ]},
        { type: 'text', label: 'Session note', value: 'Designing endpoint versioning strategy for API v2. Currently exploring path-based vs header-based approaches.' },
        { type: 'tags', label: 'Controls', items: ['Pause', 'End Session', 'Note', 'Extend +15m'] },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'home' },
    { id: 'sessions', label: 'Sessions', icon: 'list' },
    { id: 'patterns', label: 'Patterns', icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'focus',    label: 'Focus',    icon: 'play' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'dwell-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
