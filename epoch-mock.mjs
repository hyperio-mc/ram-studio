import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'EPOCH',
  tagline:   'Your year, rendered.',
  archetype: 'analytics-wrapped',
  palette: {
    bg:      '#09090E',
    surface: '#131320',
    text:    '#EBE8F7',
    accent:  '#F5A623',
    accent2: '#7C6FFF',
    muted:   'rgba(235,232,247,0.4)',
  },
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#D4891A',
    accent2: '#5B4FD6',
    muted:   'rgba(26,24,24,0.45)',
  },
  screens: [
    {
      id: 'screen1', label: 'Year Wrapped',
      content: [
        { type: 'metric', label: 'Focus Score', value: '94', sub: 'Top 3% globally · +11pts from 2024' },
        { type: 'metric-row', items: [
          { label: 'Tasks Shipped', value: '394' },
          { label: 'Focus Hours', value: '2.8K' },
          { label: 'Best Streak', value: '47d' }
        ]},
        { type: 'progress', items: [
          { label: 'Annual goal progress', pct: 87 }
        ]},
        { type: 'tags', label: 'Achievements', items: ['🏆 Best Year Yet', 'Top 3% Focus', '47-day streak'] },
        { type: 'text', label: 'Summary', value: '2,847 hours of focused work. 394 tasks shipped. Your year in one score.' },
      ],
    },
    {
      id: 'screen2', label: 'Timeline',
      content: [
        { type: 'metric', label: 'Peak Month', value: 'July', sub: '312 hrs · 48 tasks · highest output month' },
        { type: 'metric-row', items: [
          { label: 'Deep Work Avg', value: '6.2h' },
          { label: 'Daily', value: 'Top 25%' }
        ]},
        { type: 'progress', items: [
          { label: 'Jan → Mar', pct: 35 },
          { label: 'Apr → Jun', pct: 68 },
          { label: 'Jul → Sep', pct: 95 },
          { label: 'Oct → Dec', pct: 52 },
        ]},
        { type: 'text', label: 'Trend', value: 'You hit peak momentum mid-year and sustained it through September — a rare consistent arc.' },
      ],
    },
    {
      id: 'screen3', label: 'Moments',
      content: [
        { type: 'list', items: [
          { icon: 'zap', title: 'Shipped v2.0 launch', sub: 'July 14 · 14h deep focus · 3 PRs · 0 bugs', badge: '#1' },
          { icon: 'activity', title: '47-day streak hit', sub: 'March 3 · Personal record broken', badge: '#2' },
          { icon: 'check', title: '100 tasks in a week', sub: 'Sep 22 · Top 1% that week globally', badge: '#3' },
        ]},
        { type: 'progress', items: [
          { label: 'Engineering', pct: 62 },
          { label: 'Design', pct: 21 },
          { label: 'Meetings', pct: 11 },
          { label: 'Planning', pct: 6 },
        ]},
      ],
    },
    {
      id: 'screen4', label: 'Network',
      content: [
        { type: 'metric', label: 'Collaborators', value: '47', sub: '18 new this year · 29 returning' },
        { type: 'list', items: [
          { icon: 'user', title: 'Alex Chen', sub: 'Engineering · 284h together', badge: '#1' },
          { icon: 'user', title: 'Sam Park', sub: 'Design · 176h together', badge: '#2' },
          { icon: 'user', title: 'Jordan Lee', sub: 'Product · 142h together', badge: '#3' },
          { icon: 'user', title: 'Casey Kim', sub: 'Engineering · 98h together', badge: '#4' },
        ]},
        { type: 'tags', label: 'Strength', items: ['Strong ties: 8', 'Weak ties: 39', 'New: 18'] },
      ],
    },
    {
      id: 'screen5', label: 'Insights',
      content: [
        { type: 'list', items: [
          { icon: 'star', title: 'Best work days: Tuesday & Wednesday', sub: '78% of high-output days — schedule creative work then', badge: '✦' },
          { icon: 'activity', title: 'Deep focus ↑ 34% vs 2024', sub: 'From 45min → 6.2h average blocks', badge: '↑' },
          { icon: 'chart', title: 'Momentum compound effect detected', sub: 'Each streak week boosted next week by +12% avg', badge: '◈' },
        ]},
        { type: 'metric-row', items: [
          { label: '2026 Focus', value: '3.2K' },
          { label: 'Tasks Goal', value: '500' },
          { label: 'New Collabs', value: '+12' }
        ]},
        { type: 'text', label: 'Your Year', value: 'Top 3% focus globally. Best streak ever. Most tasks shipped. 2025 was your year.' },
      ],
    },
  ],
  nav: [
    { id: 'screen1', label: 'Home', icon: 'home' },
    { id: 'screen2', label: 'Timeline', icon: 'calendar' },
    { id: 'screen3', label: 'Moments', icon: 'star' },
    { id: 'screen4', label: 'Network', icon: 'share' },
    { id: 'screen5', label: 'Insights', icon: 'eye' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'epoch-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
