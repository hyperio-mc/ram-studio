import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HELIX',
  tagline:   'Deep sleep intelligence',
  archetype: 'health',
  palette: {
    bg:      '#070710',
    surface: '#0F0F1E',
    text:    '#E4E4F0',
    accent:  '#7B5CFF',
    accent2: '#2EE5C8',
    muted:   'rgba(228,228,240,0.4)',
  },
  lightPalette: {
    bg:      '#F4F2FA',
    surface: '#FFFFFF',
    text:    '#1A1830',
    accent:  '#6B4FF0',
    accent2: '#1DB89E',
    muted:   'rgba(26,24,48,0.45)',
  },
  screens: [
    {
      id: 'tonight', label: 'Tonight',
      content: [
        { type: 'metric', label: 'Readiness Score', value: '78', sub: 'Based on HRV, sleep debt & recovery' },
        { type: 'metric-row', items: [
          { label: 'Bedtime in', value: '47m' },
          { label: 'Target', value: '7h 30m' },
          { label: 'Last night', value: '7h 14m' },
        ]},
        { type: 'tags', label: 'Sleep Rituals', items: ['📵 Screen-free ✓', '🌡️ Room 18°C ✓', '🍵 No caffeine', '🧘 Breathwork'] },
        { type: 'progress', items: [
          { label: 'Ritual completion', pct: 50 },
        ]},
        { type: 'text', label: 'Tonight\'s Recommendation', value: 'Readiness is good. Stick to your 10:30 PM bedtime for an optimal 4-cycle night.' },
      ],
    },
    {
      id: 'live', label: 'Live Session',
      content: [
        { type: 'metric', label: 'Current Stage', value: 'REM', sub: 'Rapid Eye Movement · Cycle 2 of 4' },
        { type: 'metric-row', items: [
          { label: 'Elapsed', value: '4h 23m' },
          { label: 'Heart Rate', value: '58 bpm' },
          { label: 'HRV', value: '42 ms' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Awake', sub: '12 min at start', badge: '5%' },
          { icon: 'activity', title: 'Light Sleep', sub: 'Easy entry phase', badge: '38m' },
          { icon: 'star', title: 'Deep Sleep', sub: 'Peak restorative', badge: '72m' },
          { icon: 'zap', title: 'REM', sub: 'Memory + dreaming — NOW', badge: '31m' },
        ]},
        { type: 'progress', items: [
          { label: 'Goal progress (7h 30m target)', pct: 59 },
        ]},
      ],
    },
    {
      id: 'wake', label: 'Wake',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '82', sub: 'Mon 7 Apr  ·  10:38 PM – 6:52 AM' },
        { type: 'metric-row', items: [
          { label: 'Total Sleep', value: '7h 14m' },
          { label: 'Efficiency', value: '91%' },
          { label: 'Cycles', value: '4' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Deep Sleep', sub: '1h 49m', badge: '▲ On target' },
          { icon: 'zap', title: 'REM Sleep', sub: '1h 58m', badge: '▲ +14%' },
          { icon: 'heart', title: 'Resting HR', sub: '58 bpm avg', badge: '✓ Good' },
          { icon: 'star', title: 'HRV Score', sub: '42ms overnight', badge: '↗ Better' },
        ]},
        { type: 'text', label: '💡 Sleep Insight', value: 'Your REM was 14% above average — great for memory consolidation. Consistent bedtime contributed to this.' },
      ],
    },
    {
      id: 'trends', label: 'Trends',
      content: [
        { type: 'metric', label: 'Weekly Average', value: '78.3', sub: 'Mar 31 – Apr 6 · 7 nights tracked' },
        { type: 'metric-row', items: [
          { label: 'Best Night', value: 'Thu 88' },
          { label: 'vs Last Week', value: '+3.1' },
          { label: 'Streak', value: '14 nights' },
        ]},
        { type: 'progress', items: [
          { label: 'Avg Deep Sleep (1h 42m)', pct: 68 },
          { label: 'Avg REM (1h 51m)', pct: 74 },
          { label: 'Consistency (±18 min)', pct: 82 },
          { label: 'Sleep Efficiency', pct: 89 },
        ]},
        { type: 'tags', label: 'This Week\'s Pattern', items: ['Mon 74', 'Tue 81', 'Wed 69', 'Thu 88', 'Fri 76', 'Sat 82', 'Sun 78'] },
      ],
    },
    {
      id: 'goals', label: 'Goals',
      content: [
        { type: 'metric', label: 'Sleep Duration Goal', value: '7h 30m', sub: 'Recommended for your age group' },
        { type: 'metric-row', items: [
          { label: 'Bedtime', value: '10:30 PM' },
          { label: 'Wake Time', value: '6:00 AM' },
          { label: 'Window', value: '7.5h' },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'Heart Rate Monitor', sub: 'Continuous overnight tracking', badge: '●' },
          { icon: 'activity', title: 'HRV Analysis', sub: 'Recovery and stress index', badge: '●' },
          { icon: 'bell', title: 'Snore Detection', sub: 'Audio pattern analysis', badge: '○' },
          { icon: 'zap', title: 'Smart Wake Window', sub: '±20 min of target wake time', badge: '●' },
        ]},
        { type: 'text', label: '🔥 14-Night Streak', value: 'You\'ve hit your sleep goal for 14 consecutive nights. Best ever: 21 nights.' },
      ],
    },
  ],
  nav: [
    { id: 'tonight',  label: 'Tonight', icon: 'moon' },
    { id: 'live',     label: 'Live',    icon: 'activity' },
    { id: 'wake',     label: 'Wake',    icon: 'eye' },
    { id: 'trends',   label: 'Trends',  icon: 'chart' },
    { id: 'goals',    label: 'Goals',   icon: 'star' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, 'helix-mock', 'HELIX — Deep Sleep Intelligence · Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (err) {
  console.error('Mock build failed:', err.message);
  process.exit(1);
}
