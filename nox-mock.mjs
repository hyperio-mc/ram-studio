/**
 * NOX — Svelte Interactive Mock
 * Dark: midnight navy + periwinkle + coral + teal-mint
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Nox',
  tagline: 'AI sleep intelligence, decoded nightly',
  archetype: 'sleep-health-dark',
  palette: {           // DARK theme
    bg:      '#070B14',
    surface: '#0D1426',
    text:    '#E4E9F5',
    accent:  '#6C7EFF',
    accent2: '#FF8A6B',
    muted:   'rgba(138,148,181,0.5)',
  },
  lightPalette: {      // LIGHT theme
    bg:      '#F5F0EB',
    surface: '#FFFFFF',
    text:    '#1A1818',
    accent:  '#4A56CC',
    accent2: '#D4643A',
    muted:   'rgba(26,24,24,0.45)',
  },
  screens: [
    {
      id: 'tonight',
      label: 'Tonight',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '84', sub: 'Excellent readiness tonight' },
        { type: 'metric-row', items: [
          { label: 'Bedtime', value: '10:45 PM' },
          { label: 'Wake', value: '6:45 AM' },
          { label: 'Debt', value: '−23m' },
        ]},
        { type: 'text', label: '✦ AI Insight', value: 'Your HRV recovered well today. Blue light exposure is low — ideal for deep sleep tonight.' },
        { type: 'tags', label: 'Contributing factors', items: ['↑ HRV High', '8,204 steps', 'No caffeine after 2pm'] },
        { type: 'progress', items: [
          { label: 'Sleep readiness', pct: 84 },
          { label: 'Recovery quality', pct: 78 },
        ]},
      ],
    },
    {
      id: 'analysis',
      label: 'Analysis',
      content: [
        { type: 'metric', label: 'Last Night · 7h 44m', value: '91%', sub: 'Sleep efficiency — excellent' },
        { type: 'metric-row', items: [
          { label: 'Deep', value: '1h 33m' },
          { label: 'REM', value: '2h 19m' },
          { label: 'Light', value: '3h 29m' },
          { label: 'Awake', value: '23m' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep Sleep  20%', pct: 20 },
          { label: 'REM         30%', pct: 30 },
          { label: 'Light Sleep 45%', pct: 45 },
          { label: 'Awake        5%', pct: 5 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Resting HR', value: '52 bpm' },
          { label: 'HR Range', value: '46–61' },
          { label: 'Interrupts', value: '2' },
        ]},
      ],
    },
    {
      id: 'insights',
      label: 'Insights',
      content: [
        { type: 'metric', label: '7-day average', value: '78', sub: 'Sleep score trend ↑ improving' },
        { type: 'list', items: [
          { icon: 'moon', title: 'Consistent bedtime = deeper sleep', sub: 'On 4 nights before 11pm, deep sleep avg 22% — 8pts above baseline', badge: '◑' },
          { icon: 'activity', title: 'Evening exercise shortens REM', sub: 'Workouts after 7pm correlate with 14% less REM on average', badge: '◐' },
          { icon: 'star', title: 'Weekend recovery is working', sub: 'Saturday sleep quality improved 3 weeks running', badge: '✦' },
        ]},
        { type: 'tags', label: 'Your sleep type', items: ['Night Owl', 'Deep Sleeper', 'REM Rich'] },
      ],
    },
    {
      id: 'routine',
      label: 'Routine',
      content: [
        { type: 'metric', label: 'Wind-Down · Start 60–90 min before bed', value: '3/6', sub: 'Routine items complete tonight' },
        { type: 'progress', items: [{ label: 'Tonight\'s progress', pct: 50 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Dim lights to 20%', sub: 'Blue light filter on', badge: '✓' },
          { icon: 'check', title: 'No screens after 10pm', sub: 'Reminder set', badge: '✓' },
          { icon: 'check', title: '5-min breathing exercise', sub: '4-7-8 technique', badge: '✓' },
          { icon: 'eye', title: 'Body temperature drop', sub: 'Cool room to 67°F' },
          { icon: 'bell', title: 'Sleep sounds on', sub: 'White noise or rain' },
          { icon: 'heart', title: 'Gratitude journal', sub: '3 things from today' },
        ]},
        { type: 'text', label: '✦ Nox tip', value: 'Your HRV drops fastest when you skip the breathing exercise. It matters most.' },
      ],
    },
    {
      id: 'history',
      label: 'History',
      content: [
        { type: 'metric', label: 'March 2026 · 30 days', value: '78', sub: 'Monthly average sleep score' },
        { type: 'metric-row', items: [
          { label: 'Avg sleep', value: '7h 21m' },
          { label: 'Best night', value: '92' },
          { label: 'Worst night', value: '54' },
          { label: 'Trend', value: '↑ +6pts' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Longest streak of 80+ nights', sub: '5 days in a row', badge: '★' },
          { icon: 'moon', title: 'Most deep sleep in one night', sub: '2 hours 4 minutes', badge: '◑' },
          { icon: 'activity', title: 'Best HRV recovery', sub: '94ms', badge: '◐' },
        ]},
        { type: 'progress', items: [
          { label: 'Sleep score trend', pct: 78 },
          { label: 'Consistency score', pct: 72 },
          { label: 'Recovery efficiency', pct: 85 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'tonight', label: 'Tonight', icon: 'moon' },
    { id: 'analysis', label: 'Analysis', icon: 'activity' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'routine', label: 'Routine', icon: 'check' },
    { id: 'history', label: 'History', icon: 'calendar' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nox-mock', 'Nox — Interactive Mock');
console.log('Mock live at:', result.url);
