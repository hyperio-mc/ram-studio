import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VOLT',
  tagline:   'Know Your Energy',
  archetype: 'athlete-biometrics',
  palette: {
    bg:      '#0B0C12',
    surface: '#13141E',
    text:    '#F0F0FA',
    accent:  '#CAFF00',
    accent2: '#FF4C60',
    muted:   'rgba(240,240,250,0.4)',
  },
  lightPalette: {
    bg:      '#F5F5F0',
    surface: '#FFFFFF',
    text:    '#111218',
    accent:  '#6B9200',
    accent2: '#E02040',
    muted:   'rgba(17,18,24,0.45)',
  },
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Readiness Score', value: '88', sub: 'Peak — Ready to push' },
        { type: 'metric-row', items: [{ label: 'HRV', value: '68 ms' }, { label: 'Sleep', value: '7h42m' }, { label: 'Strain', value: '11.2' }] },
        { type: 'text', label: 'Recommendation', value: 'HRV 14% above baseline. Ideal for a high-intensity session or race simulation.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Morning run', sub: '8.2 km · 52:10 · HR avg 152', badge: '9.8' },
          { icon: 'activity', title: 'Mobility session', sub: '22 min · stretching focus', badge: '2.1' },
          { icon: 'activity', title: 'Walking', sub: '4,230 steps', badge: '1.4' },
        ]},
      ],
    },
    {
      id: 'train', label: 'Train',
      content: [
        { type: 'metric', label: 'Live Strain', value: '14.7', sub: 'High — 70% of session complete' },
        { type: 'metric-row', items: [{ label: 'Heart Rate', value: '172 bpm' }, { label: 'Duration', value: '48:22' }, { label: 'Distance', value: '9.4 km' }] },
        { type: 'progress', items: [
          { label: 'Z1 Recovery', pct: 5 },
          { label: 'Z2 Aerobic', pct: 17 },
          { label: 'Z3 Tempo', pct: 42 },
          { label: 'Z4 Threshold', pct: 80 },
          { label: 'Z5 VO2max', pct: 60 },
        ]},
        { type: 'metric-row', items: [{ label: 'Pace', value: '5:08/km' }, { label: 'Elevation', value: '142 m' }, { label: 'Calories', value: '620 kcal' }] },
      ],
    },
    {
      id: 'recovery', label: 'Recovery',
      content: [
        { type: 'metric', label: 'Recovery Score', value: '76%', sub: 'Green zone — trending up' },
        { type: 'metric-row', items: [{ label: 'Resting HR', value: '48 bpm' }, { label: 'HRV', value: '68 ms' }, { label: 'Breathing', value: '14.3/min' }] },
        { type: 'progress', items: [
          { label: 'REM sleep', pct: 78 },
          { label: 'Deep sleep', pct: 85 },
          { label: 'Sleep consistency', pct: 92 },
        ]},
        { type: 'text', label: 'Tomorrow Forecast', value: 'If sleep hits 7h30m+ you will wake green. Avoid alcohol and late training to protect HRV gains.' },
      ],
    },
    {
      id: 'body', label: 'Body',
      content: [
        { type: 'metric', label: 'Weight', value: '81.2 kg', sub: '↓ 1.2 kg this month · Goal: 79.5 kg' },
        { type: 'progress', items: [
          { label: 'Body fat (14.2%)', pct: 14 },
          { label: 'Muscle mass (65.8 kg)', pct: 72 },
          { label: 'Hydration (61%)', pct: 61 },
        ]},
        { type: 'tags', label: 'Muscle Activation', items: ['Quads 92%', 'Hamstrings 74%', 'Calves 88%', 'Core 60%', 'Shoulders 32%', 'Back 45%'] },
        { type: 'metric-row', items: [{ label: 'BMI', value: '23.4' }, { label: 'Fat mass', value: '11.5 kg' }, { label: 'Bone density', value: 'Normal' }] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [{ label: 'Active Streak', value: '14 days' }, { label: 'This week', value: '4 / 5' }] },
        { type: 'list', items: [
          { icon: 'zap', title: 'HRV — 3-week high', sub: 'HRV risen 18% over 21 days. Periodization paying off.', badge: '↑' },
          { icon: 'moon', title: 'Sleep consistency improving', sub: 'Bed time ±18 min — down from ±52 min last month.', badge: '✓' },
          { icon: 'alert', title: 'Strain:Recovery at limit', sub: 'Avg strain 13.4 vs recovery 71%. Watch tomorrow session.', badge: '!' },
        ]},
        { type: 'text', label: 'Next Milestone', value: '21-day streak in 7 days · HRV personal best within reach' },
      ],
    },
  ],
  nav: [
    { id: 'today',    label: 'Today',    icon: 'zap' },
    { id: 'train',    label: 'Train',    icon: 'activity' },
    { id: 'recovery', label: 'Recovery', icon: 'heart' },
    { id: 'body',     label: 'Body',     icon: 'user' },
    { id: 'insights', label: 'Insights', icon: 'star' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'volt-energy-mock', 'VOLT — Interactive Mock');
console.log('Mock live at:', result.url);
