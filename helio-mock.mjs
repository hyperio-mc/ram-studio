import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'HELIO',
  tagline:   'Know yourself. Extend yourself.',
  archetype: 'longevity-tracker-light',

  palette: {           // DARK fallback
    bg:      '#1A1614',
    surface: '#2A2320',
    text:    '#F8F4EE',
    accent:  '#E8853A',
    accent2: '#4E8C6A',
    muted:   'rgba(248,244,238,0.4)',
  },

  lightPalette: {      // LIGHT — primary for this design
    bg:      '#F8F4EE',
    surface: '#FFFFFF',
    text:    '#1A1614',
    accent:  '#E8853A',
    accent2: '#4E8C6A',
    muted:   'rgba(26,22,20,0.42)',
  },

  screens: [
    {
      id: 'today', label: 'Today',
      content: [
        { type: 'text',       label: 'Good morning, Marcus.',    value: 'Monday · March 31 · All systems optimal' },
        { type: 'metric',     label: 'Health Score',             value: '84', sub: '↑ +3 from yesterday · Trending upward' },
        { type: 'metric-row', items: [
          { label: 'Steps',   value: '8,241' },
          { label: 'Active',  value: '47 min' },
        ]},
        { type: 'metric-row', items: [
          { label: 'HRV',     value: '62 ms' },
          { label: 'Sleep',   value: '7h 22m' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'Morning Protocol',  sub: 'Hydration · Sunlight · Cold exposure',   badge: '6:00 AM' },
          { icon: 'heart', title: 'Zone 2 Cardio',     sub: '45 min target · Fasted recommended',     badge: '7:30 AM' },
          { icon: 'star',  title: 'Evening Wind-down', sub: 'No screens · Dim light · Magnesium',     badge: '9:30 PM' },
        ]},
      ],
    },
    {
      id: 'vitals', label: 'Vitals',
      content: [
        { type: 'metric',     label: 'HRV',              value: '62 ms',  sub: 'Heart Rate Variability · Optimal range 55–75ms' },
        { type: 'metric-row', items: [
          { label: 'Resting HR',  value: '58 bpm' },
          { label: 'SpO₂',        value: '98%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Skin Temp',   value: '+0.2°C' },
          { label: 'Resp Rate',   value: '14 br/m' },
        ]},
        { type: 'progress', items: [
          { label: 'HRV vs baseline',     pct: 82 },
          { label: 'Resting HR vs goal',  pct: 95 },
          { label: 'SpO₂ health range',   pct: 98 },
        ]},
        { type: 'tags', label: 'Readiness Signals', items: ['Recovery: High', 'Stress: Low', 'Strain: Moderate', 'Trend: ↑'] },
      ],
    },
    {
      id: 'sleep', label: 'Sleep',
      content: [
        { type: 'metric',     label: 'Recovery Score',   value: '94%',   sub: 'Fully recovered · Great basis for a hard session' },
        { type: 'metric-row', items: [
          { label: 'Duration',    value: '7h 22m' },
          { label: 'Efficiency',  value: '94%' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Bedtime',     value: '10:47 PM' },
          { label: 'Wake',        value: '6:09 AM' },
        ]},
        { type: 'progress', items: [
          { label: 'Awake   (22 min)',  pct: 12 },
          { label: 'Light   (2h 48m)', pct: 38 },
          { label: 'Deep    (2h 12m)', pct: 30 },
          { label: 'REM     (2h 00m)', pct: 27 },
        ]},
        { type: 'text', label: 'Insight', value: 'Deep sleep improved 18% vs last week. Early dinner and no screens before 10 PM are likely contributors.' },
      ],
    },
    {
      id: 'nutrition', label: 'Nutrition',
      content: [
        { type: 'metric',     label: 'Calories',         value: '1,842',  sub: '/ 2,200 kcal · 358 remaining' },
        { type: 'progress', items: [
          { label: 'Protein  146g / 187g',  pct: 78 },
          { label: 'Carbs    186g / 300g',  pct: 62 },
          { label: 'Fat       62g / 69g',   pct: 90 },
          { label: 'Hydration 2.1L / 3.0L', pct: 70 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Breakfast', sub: 'Oats · Berries · Protein shake',       badge: '480 kcal' },
          { icon: 'heart',    title: 'Lunch',     sub: 'Salmon · Quinoa · Greens',              badge: '620 kcal' },
          { icon: 'star',     title: 'Snack',     sub: 'Almonds · Greek yogurt',                badge: '310 kcal' },
          { icon: 'activity', title: 'Dinner',    sub: 'Chicken · Sweet potato · Broccoli',     badge: '432 kcal' },
        ]},
        { type: 'tags', label: 'On track today', items: ['Protein ✓', 'Fat ✓', 'Fiber goal', 'Omega-3'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric',     label: 'Weekly Average',   value: '81',    sub: '↑ Up from 76 last week · +6.5% improvement' },
        { type: 'progress', items: [
          { label: 'Mon  74', pct: 74 },
          { label: 'Tue  76', pct: 76 },
          { label: 'Wed  72', pct: 72 },
          { label: 'Thu  79', pct: 79 },
          { label: 'Fri  80', pct: 80 },
          { label: 'Sat  78', pct: 78 },
          { label: 'Sun  84', pct: 84 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',      title: 'Morning Protocol',  sub: '14-day streak',       badge: '🔥 14d' },
          { icon: 'heart',    title: 'HRV Goal Hit',      sub: '7-day streak',        badge: '🔥 7d'  },
          { icon: 'eye',      title: '7h+ Sleep',         sub: '5-day streak',        badge: '🔥 5d'  },
          { icon: 'star',     title: 'Protein Target',    sub: '10-day streak',       badge: '🔥 10d' },
        ]},
        { type: 'text', label: 'Helio AI', value: 'Recovery is high and training load is low. Today is ideal for a strength session or Zone 2 run. Your cortisol window opens at 7:30 AM.' },
      ],
    },
  ],

  nav: [
    { id: 'today',     label: 'Today',    icon: 'eye'      },
    { id: 'vitals',    label: 'Vitals',   icon: 'heart'    },
    { id: 'sleep',     label: 'Sleep',    icon: 'moon'     },
    { id: 'nutrition', label: 'Nutrition',icon: 'grid'     },
    { id: 'insights',  label: 'Insights', icon: 'chart'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'helio-mock', 'HELIO — Interactive Mock');
console.log('Mock live at:', result.url);
