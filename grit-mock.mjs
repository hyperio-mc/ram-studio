import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GRIT',
  tagline:   'Strength, stripped down',
  archetype: 'fitness-tracker',

  // ── DARK palette (primary) ──────────────────────────────────────────────
  palette: {
    bg:      '#0B0B0B',
    surface: '#161616',
    text:    '#EDEDED',
    accent:  '#FF4500',   // ember orange-red
    accent2: '#FFB800',   // amber gold
    muted:   'rgba(237,237,237,0.38)',
  },

  // ── LIGHT palette ───────────────────────────────────────────────────────
  lightPalette: {
    bg:      '#F5F2EE',
    surface: '#FFFFFF',
    text:    '#111111',
    accent:  '#E03800',   // slightly deeper ember for readability on light
    accent2: '#CC8F00',   // deeper gold on light
    muted:   'rgba(17,17,17,0.42)',
  },

  // ── screens ─────────────────────────────────────────────────────────────
  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'metric', label: 'Push Day A · Set 3 of 5', value: '102.5 kg', sub: 'Bench Press · Previous best: 100 kg × 5 · +2.5 kg PR climb' },
        { type: 'metric-row', items: [
          { label: 'Volume', value: '4,850 kg' },
          { label: 'Intensity', value: '84% 1RM' },
          { label: 'Sets Done', value: '8 / 20' },
        ]},
        { type: 'text', label: '✦ Session Status', value: 'Strong start. You\'re on pace for a volume PR today. Incline DB press and cable fly still ahead.' },
        { type: 'list', items: [
          { icon: 'check', title: 'Bench Press', sub: 'Set 3 of 5 · In progress', badge: '60%' },
          { icon: 'activity', title: 'Incline DB Press', sub: '4 × 8 · Up next', badge: '—' },
          { icon: 'activity', title: 'Cable Fly', sub: '3 × 12 · Queued', badge: '—' },
          { icon: 'activity', title: 'Tricep Pushdown', sub: '3 × 15 · Queued', badge: '—' },
        ]},
      ],
    },
    {
      id: 'programs', label: 'Programs',
      content: [
        { type: 'metric', label: 'Active Program · Progress', value: '76%', sub: 'StrongLifts 5×5 · Week 12 of 16 · Linear progression' },
        { type: 'progress', items: [
          { label: 'Bench Press progression', pct: 78 },
          { label: 'Squat progression', pct: 82 },
          { label: 'Deadlift progression', pct: 85 },
          { label: 'Overhead Press progression', pct: 65 },
          { label: 'Barbell Row progression', pct: 71 },
        ]},
        { type: 'tags', label: 'Other Programs', items: ['GZCLP · Paused', 'Wendler 5/3/1 · Saved', 'Tactical · Saved'] },
        { type: 'text', label: 'Programme Intelligence', value: 'Current load: 48 sessions, 412 sets, 284,000 kg lifetime volume. Estimated completion in 4 weeks.' },
      ],
    },
    {
      id: 'history', label: 'History',
      content: [
        { type: 'metric', label: '30-Day Consistency', value: '87%', sub: '19 of 22 planned sessions completed · 5 new PRs set' },
        { type: 'metric-row', items: [
          { label: 'Total Sessions', value: '124' },
          { label: 'Lifetime Vol.', value: '284K kg' },
          { label: 'Avg Duration', value: '61 min' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Push Day A', sub: 'Today · 58 min · 4,850 kg', badge: '↑PR' },
          { icon: 'check', title: 'Pull Day B', sub: 'Sat Mar 22 · 62 min · 5,120 kg', badge: '✓' },
          { icon: 'check', title: 'Leg Day C', sub: 'Thu Mar 20 · 71 min · 8,400 kg', badge: '✓' },
          { icon: 'zap', title: 'Pull Day B', sub: 'Sat Mar 15 · 60 min · 4,980 kg', badge: '↑PR' },
        ]},
      ],
    },
    {
      id: 'records', label: 'Records',
      content: [
        { type: 'text', label: '✦ Personal Records', value: 'All-time bests calculated from best sets. Updated after every session.' },
        { type: 'metric-row', items: [
          { label: 'Bench · 1RM Est.', value: '115 kg' },
          { label: 'Squat · 1RM Est.', value: '145 kg' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Deadlift · 1RM', value: '185 kg' },
          { label: 'OHP · 1RM Est.', value: '72 kg' },
        ]},
        { type: 'progress', items: [
          { label: 'Bench: 90-day improvement', pct: 85 },
          { label: 'Squat: 90-day improvement', pct: 91 },
          { label: 'Deadlift: 90-day improvement', pct: 94 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Body Weight', value: '84.2 kg' },
          { label: 'Body Fat Est.', value: '14.8%' },
        ]},
      ],
    },
    {
      id: 'recovery', label: 'Recovery',
      content: [
        { type: 'metric', label: 'Readiness Index · Today', value: '87 / 100', sub: 'Good · Ready to train hard · All signals in range' },
        { type: 'progress', items: [
          { label: 'Sleep Quality', pct: 82 },
          { label: 'HRV Score', pct: 74 },
          { label: 'Muscle Soreness (inverse)', pct: 90 },
          { label: 'Energy Level', pct: 88 },
        ]},
        { type: 'text', label: '✦ Recovery Recommendation', value: 'High readiness. Run Push Day A as planned. Target bench PR at 105 kg. Prioritise compound lifts. Sleep 30 min earlier tonight.' },
        { type: 'metric-row', items: [
          { label: 'Sleep Duration', value: '7h 24m' },
          { label: 'Resting HR', value: '52 bpm' },
          { label: 'Days Since Rest', value: '1' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'zap' },
    { id: 'programs', label: 'Programs', icon: 'list' },
    { id: 'history',  label: 'History',  icon: 'calendar' },
    { id: 'records',  label: 'Records',  icon: 'star' },
    { id: 'recovery', label: 'Recovery', icon: 'heart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'grit-mock', 'GRIT — Interactive Mock');

if (result.status === 403 && result.body?.includes('maximum')) {
  console.error('⚠ ZenBin 100-page cap hit. Delete stale pages then retry.');
  process.exit(1);
}

console.log('Mock live at:', result.url);
