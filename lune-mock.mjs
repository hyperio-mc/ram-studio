import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Lune',
  tagline:   'Sleep intelligence, felt not tracked.',
  archetype: 'wellness-ai',

  // Dark palette (required by builder — moonlit night variant)
  palette: {
    bg:      '#120E0A',
    surface: '#1E1710',
    text:    '#F0E8DC',
    accent:  '#C4622D',
    accent2: '#7B9E87',
    muted:   'rgba(240,232,220,0.40)',
  },

  // Light palette (PRIMARY — warm cream earth tones)
  lightPalette: {
    bg:      '#FAF4ED',
    surface: '#F3EAE0',
    text:    '#2B1A0C',
    accent:  '#C4622D',
    accent2: '#7B9E87',
    muted:   'rgba(43,26,12,0.45)',
  },

  screens: [
    {
      id: 'tonight', label: 'Tonight',
      content: [
        { type: 'metric', label: "Tonight's Window", value: '10:45 pm', sub: '→ 6:30 am · 7h 45m' },
        { type: 'metric-row', items: [
          { label: 'Readiness', value: '86' },
          { label: 'HRV Avg', value: '58ms' },
          { label: 'Deficit', value: '-0.4h' },
        ]},
        { type: 'progress', items: [
          { label: 'Circadian confidence', pct: 74 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Last caffeine before 2 pm',  sub: 'Completed',               badge: '✓' },
          { icon: 'check', title: 'Blue light filter on at 8pm', sub: 'Completed',               badge: '✓' },
          { icon: 'bell',  title: 'Magnesium glycinate (400mg)', sub: 'Reminder set for 10:20',  badge: '○' },
          { icon: 'bell',  title: 'Room temp below 67°F',        sub: 'Check thermostat',        badge: '○' },
          { icon: 'bell',  title: 'Phone outside bedroom',       sub: 'Before sleep window',     badge: '○' },
        ]},
        { type: 'text', label: 'Wind Down', value: 'Start your ritual in 2h 18m. Circadian confidence is 74% — good conditions tonight.' },
      ],
    },
    {
      id: 'review', label: 'Last Night',
      content: [
        { type: 'metric', label: 'Sleep Score', value: '82', sub: 'Good Sleep · Mon Apr 6' },
        { type: 'metric-row', items: [
          { label: 'Duration', value: '7h 55m' },
          { label: 'Efficiency', value: '93%' },
          { label: 'Woke Up', value: '1×' },
        ]},
        { type: 'progress', items: [
          { label: 'Deep (38%)', pct: 38 },
          { label: 'REM (32%)', pct: 32 },
          { label: 'Light (25%)', pct: 25 },
          { label: 'Awake (5%)', pct: 5 },
        ]},
        { type: 'text', label: 'Lune noticed', value: 'Deep sleep peaked in the first 3 hours — classic pattern when you skip late screens. Your HRV was 62ms, above your 30-day average.' },
        { type: 'metric-row', items: [
          { label: 'Deep %', value: '38%' },
          { label: 'REM %', value: '32%' },
          { label: 'HRV', value: '62ms' },
        ]},
      ],
    },
    {
      id: 'patterns', label: 'Patterns',
      content: [
        { type: 'metric', label: '30-Night Average', value: '78', sub: '+6 vs last month' },
        { type: 'progress', items: [
          { label: 'Alcohol (-12pts)', pct: 12 },
          { label: 'Exercise before 6pm (+9pts)', pct: 72 },
          { label: 'Late screens (-7pts)', pct: 20 },
          { label: 'Consistent bedtime (+11pts)', pct: 87 },
        ]},
        { type: 'tags', label: 'Best streak', items: ['7 nights 80+', 'Apr 1–7', 'Current'] },
        { type: 'text', label: 'Rhythm Score', value: 'Bedtime within ±22 min for 26 of 30 nights — top 15% of Lune users. Your circadian anchor is strong.' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Best sleep day',   sub: 'Thursday',  badge: '88' },
          { icon: 'alert',    title: 'Worst sleep day',  sub: 'Saturday',  badge: '61' },
          { icon: 'star',     title: 'Most consistent',  sub: 'Weekdays',  badge: '±18m' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric', label: 'Week of Apr 1–7', value: 'Returning rhythm', sub: 'Lune weekly digest' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Chronotype shifting', sub: 'Sleep onset 22min later · spring drift', badge: '→' },
          { icon: 'heart',    title: 'HRV improving',       sub: 'Dip resolves by midnight now',           badge: '↑' },
          { icon: 'zap',      title: 'Caffeine sensitivity', sub: '-18% deep sleep after 1pm coffee',      badge: '!' },
          { icon: 'calendar', title: 'Weekend anchor effect', sub: '1.4 days recovery after Sat nights',   badge: '⚠' },
        ]},
        { type: 'text', label: 'This week', value: 'You averaged 7h 50m with only 2 disrupted nights. Your HRV trended upward all week — a signal your nervous system is finding its cadence again.' },
        { type: 'tags', label: 'Trending', items: ['Deep sleep ↑', 'HRV ↑', 'Rhythm stable', 'Spring shift'] },
      ],
    },
    {
      id: 'winddown', label: 'Wind Down',
      content: [
        { type: 'metric', label: 'Box Breathing', value: '4', sub: 'Breathe in · Round 1 of 4' },
        { type: 'progress', items: [
          { label: 'Protocol progress', pct: 40 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Dim lights',        sub: '9:30 pm · Done',          badge: '✓' },
          { icon: 'check', title: 'Tech wind-down',    sub: '9:45 pm · Done',          badge: '✓' },
          { icon: 'play',  title: 'Warm shower',       sub: '10:00 pm · Active now',   badge: '▶' },
          { icon: 'bell',  title: 'Magnesium + read',  sub: '10:20 pm · Coming up',    badge: '○' },
          { icon: 'eye',   title: 'Sleep window opens', sub: '10:45 pm · Almost there', badge: '◐' },
        ]},
        { type: 'text', label: 'Lune says', value: 'Your body temperature is dropping — a good sign. The shower exit will accelerate this. Lights are already dimmed. You\'re on track.' },
      ],
    },
  ],

  nav: [
    { id: 'tonight',  label: 'Tonight',  icon: 'home' },
    { id: 'review',   label: 'Review',   icon: 'eye' },
    { id: 'patterns', label: 'Patterns', icon: 'chart' },
    { id: 'insights', label: 'Insights', icon: 'star' },
    { id: 'winddown', label: 'Ritual',   icon: 'activity' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'lune-mock',
});

const result = await publishMock(html, 'lune-mock', 'Lune — Interactive Mock');
console.log('Mock live at:', result.url);
