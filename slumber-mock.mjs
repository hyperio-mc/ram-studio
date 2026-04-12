import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SLUMBER',
  tagline:   'AI Sleep & Recovery',
  archetype: 'health-wellness',
  palette: {
    bg:      '#080C14',
    surface: '#0F1726',
    text:    '#E2E8F0',
    accent:  '#34D399',
    accent2: '#818CF8',
    muted:   'rgba(148,163,184,0.5)',
  },
  lightPalette: {
    bg:      '#F0F4F8',
    surface: '#FFFFFF',
    text:    '#0F172A',
    accent:  '#059669',
    accent2: '#6366F1',
    muted:   'rgba(15,23,42,0.45)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Sleep Score',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '84', sub: 'EXCELLENT · last night' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '7h 46m' },
          { label: 'Efficiency', value: '94%' },
          { label: 'Cycles', value: '5' },
        ]},
        { type: 'progress', items: [
          { label: 'REM Sleep', pct: 44 },
          { label: 'Deep Sleep', pct: 24 },
          { label: 'Light Sleep', pct: 28 },
          { label: 'Awake', pct: 4 },
        ]},
        { type: 'list', items: [
          { icon: 'heart', title: 'HRV', sub: '62ms · above baseline', badge: '↑ 8ms' },
          { icon: 'activity', title: 'Resting HR', sub: '52 bpm · optimal range', badge: 'Optimal' },
          { icon: 'eye', title: 'SpO₂', sub: 'Blood oxygen stable all night', badge: '98%' },
        ]},
        { type: 'text', label: 'Smart Alarm', value: 'Caught at 6:28 AM during light sleep phase — gentlest possible wake.' },
      ],
    },
    {
      id: 'body',
      label: 'Body Metrics',
      content: [
        { type: 'metric', label: 'Overall Recovery', value: '91', sub: '/ 100 · Ready to train' },
        { type: 'metric-row', items: [
          { label: 'HRV', value: '62ms' },
          { label: 'Heart Rate', value: '52bpm' },
          { label: 'SpO₂', value: '98%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Breathing', value: '14.2' },
          { label: 'Skin Temp', value: '+0.3°C' },
          { label: 'Movement', value: '3' },
        ]},
        { type: 'progress', items: [
          { label: 'Recovery Score', pct: 91 },
          { label: 'HRV vs Goal (65ms)', pct: 95 },
          { label: 'Sleep Efficiency', pct: 94 },
        ]},
        { type: 'tags', label: 'Biometric Status', items: ['HRV Normal', 'HR Optimal', 'SpO₂ Normal', 'Temp +0.3°', 'Low Movement'] },
      ],
    },
    {
      id: 'insights',
      label: 'AI Insights',
      content: [
        { type: 'text', label: 'SLUMBER AI · just now', value: 'Your sleep was exceptional tonight. Your REM duration hit a 30-day high, and your HRV of 62ms signals strong autonomic recovery. You\'re ready for high-intensity training today.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Train Hard Today', sub: 'Recovery metrics support intensity. Ideal window: 10am–2pm.', badge: 'PERFORMANCE' },
          { icon: 'check', title: 'Maintain Bedtime', sub: '10:42 PM is your optimal bedtime. Consistency strengthens circadian rhythm.', badge: 'CONSISTENCY' },
          { icon: 'alert', title: 'Hydrate Early', sub: 'Slight skin temp rise detected. Drink 500ml within first hour of waking.', badge: 'WELLNESS' },
        ]},
        { type: 'tags', label: 'AI Confidence', items: ['High HRV data', '30-day baseline', '5 sleep cycles', 'Stable SpO₂'] },
        { type: 'text', label: 'Next Insight', value: 'Maintain your current sleep schedule for 3 more nights to hit a new 14-day streak and unlock deep sleep analysis.' },
      ],
    },
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric', label: '7-Day Average', value: '79', sub: '↑ 5 pts vs prior week' },
        { type: 'metric-row', items: [
          { label: 'Best Night', value: '84' },
          { label: 'Worst Night', value: '68' },
          { label: 'Streak', value: '12 days' },
        ]},
        { type: 'progress', items: [
          { label: 'Mon · 74', pct: 74 },
          { label: 'Tue · 68', pct: 68 },
          { label: 'Wed · 72', pct: 72 },
          { label: 'Thu · 80', pct: 80 },
          { label: 'Fri · 76', pct: 76 },
          { label: 'Sat · 77', pct: 77 },
          { label: 'Sun · 84', pct: 84 },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: '🔥 12-Night Streak', sub: '75+ score every night — personal best', badge: 'Best Ever' },
          { icon: 'chart', title: 'Avg REM', sub: '3h 12m — above recommended 3h+', badge: '✓ Good' },
          { icon: 'chart', title: 'Avg Deep Sleep', sub: '1h 44m — approaching 2h target', badge: '~Near' },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric', label: 'Sleep Level', value: 'Expert', sub: 'Day 34 · Premium account' },
        { type: 'metric-row', items: [
          { label: 'Avg Score', value: '79' },
          { label: 'Best Sleep', value: '91' },
          { label: 'Streak', value: '12d' },
        ]},
        { type: 'progress', items: [
          { label: 'Duration Goal (8h)', pct: 97 },
          { label: 'Bedtime Goal (10:30)', pct: 92 },
          { label: 'REM Target (3h 30m)', pct: 91 },
          { label: 'HRV Goal (65ms)', pct: 95 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Apple Watch Ultra 2', sub: 'Connected · syncing continuously', badge: 'Active' },
          { icon: 'check', title: 'Oura Ring Gen 4', sub: 'Connected · primary sleep sensor', badge: 'Active' },
        ]},
        { type: 'tags', label: 'Achievements', items: ['Early Riser', '10-Night Streak', 'Deep Sleeper', 'HRV Improver', 'Cycle Master'] },
      ],
    },
  ],
  nav: [
    { id: 'dashboard', label: 'Sleep', icon: 'eye' },
    { id: 'body', label: 'Body', icon: 'activity' },
    { id: 'insights', label: 'AI', icon: 'zap' },
    { id: 'trends', label: 'Trends', icon: 'chart' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'slumber-mock', 'SLUMBER — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/slumber-mock`);
