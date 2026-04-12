import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'VITRO',
  tagline:   'know your biology. own your future.',
  archetype: 'longevity-health-tracker',

  // Dark palette (required)
  palette: {
    bg:      '#1A1208',
    surface: '#231A0E',
    text:    '#F5EFE6',
    accent:  '#E07840',
    accent2: '#52B788',
    muted:   'rgba(245,239,230,0.42)',
  },

  // Light palette (strongly recommended — matches the actual .pen design)
  lightPalette: {
    bg:      '#FAF7F2',
    surface: '#FFFFFF',
    text:    '#1C1917',
    accent:  '#C8622A',
    accent2: '#2D6A4F',
    muted:   'rgba(28,25,23,0.45)',
  },

  screens: [
    {
      id: 'vitality', label: 'Vitality',
      content: [
        { type: 'metric', label: 'Longevity Score', value: '82', sub: '↑ +14 pts this week — Biological age 34.2 yrs' },
        { type: 'metric-row', items: [
          { label: 'Bio Age',  value: '34.2' },
          { label: 'HRV',     value: '58ms' },
          { label: 'Glucose', value: '94' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Full blood panel',     sub: 'Mar 18 · 42 markers',      badge: '✓' },
          { icon: 'heart',    title: 'VO₂ Max',              sub: 'Mar 10 · 51 mL/kg/min',    badge: '✓' },
          { icon: 'alert',    title: 'DEXA body comp.',      sub: 'Feb 28 · 15.2% fat',        badge: '!' },
        ]},
        { type: 'text', label: 'Alert', value: '⚠ ApoB elevated (112 mg/dL) — review blood panel. Last tested Mar 18 · Action recommended.' },
      ],
    },
    {
      id: 'blood', label: 'Blood',
      content: [
        { type: 'metric-row', items: [
          { label: 'Optimal',    value: '34' },
          { label: 'Borderline', value: '5' },
          { label: 'Risk',       value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'alert',  title: 'ApoB',      sub: '112 mg/dL · Range <90 · ↑',         badge: 'RISK' },
          { icon: 'alert',  title: 'LDL-C',     sub: '118 mg/dL · Range <100 · →',        badge: '!' },
          { icon: 'check',  title: 'HDL-C',     sub: '68 mg/dL · Range >60 · ↑',          badge: '✓' },
          { icon: 'check',  title: 'Trig',      sub: '82 mg/dL · Range <150 · ↓',         badge: '✓' },
          { icon: 'alert',  title: 'hsCRP',     sub: '1.2 mg/L · Range <1.0 · →',         badge: '!' },
          { icon: 'check',  title: 'HbA1c',     sub: '5.3% · Range <5.7% · ↓',            badge: '✓' },
          { icon: 'check',  title: 'Glucose',   sub: '94 mg/dL · Range 70–99 · →',        badge: '✓' },
        ]},
      ],
    },
    {
      id: 'recovery', label: 'Recovery',
      content: [
        { type: 'metric', label: 'Recovery Score', value: '74', sub: 'Last night · Oura Ring' },
        { type: 'metric-row', items: [
          { label: 'HRV',        value: '58ms'  },
          { label: 'Rest HR',    value: '52bpm' },
          { label: 'Sleep',      value: '7h42m' },
        ]},
        { type: 'progress', items: [
          { label: 'Previous day activity', pct: 88 },
          { label: 'Sleep efficiency',      pct: 92 },
          { label: 'Recovery index',        pct: 74 },
          { label: 'Body temperature',      pct: 55 },
        ]},
        { type: 'tags', label: 'Sleep Stages', items: ['Awake 5%', 'REM 22%', 'Light 52%', 'Deep 21%'] },
      ],
    },
    {
      id: 'stack', label: 'Stack',
      content: [
        { type: 'metric', label: "Today's Adherence", value: '9/11', sub: '2 remaining — evening window' },
        { type: 'list', items: [
          { icon: 'check', title: 'Omega-3 (EPA/DHA)',       sub: 'Morning · 2g · taken',         badge: '✓' },
          { icon: 'check', title: 'Vitamin D3 + K2',         sub: 'Morning · 5000 IU · taken',    badge: '✓' },
          { icon: 'check', title: 'Magnesium glycinate',     sub: 'Morning · 400mg · taken',      badge: '✓' },
          { icon: 'check', title: 'Creatine monohydrate',    sub: 'Pre-workout · 5g · taken',     badge: '✓' },
          { icon: 'check', title: 'NMN',                     sub: 'Pre-workout · 500mg · taken',  badge: '✓' },
          { icon: 'bell',  title: 'Apigenin',                sub: 'Evening · 50mg · remaining',   badge: '○' },
          { icon: 'bell',  title: 'Glycine',                 sub: 'Evening · 3g · remaining',     badge: '○' },
        ]},
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'list', items: [
          { icon: 'alert',    title: 'ApoB reduction protocol',    sub: 'Consider red yeast rice + reduce sat fat <10g/day. Retest in 8 weeks.',    badge: 'URGENT' },
          { icon: 'activity', title: 'Zone 2 cardio for HRV',      sub: '150 min/week Zone 2 has strongest evidence for sustained HRV gains.',       badge: 'MED' },
          { icon: 'star',     title: 'Glucose control improving',  sub: 'HbA1c 5.5% → 5.3% in 90 days. Berberine + TRE working.',                   badge: 'GOOD' },
          { icon: 'eye',      title: 'Body temp disrupting sleep', sub: 'Higher temp on 4 of 7 nights. Try room temp 67°F. Monitor patterns.',       badge: 'INFO' },
        ]},
        { type: 'tags', label: 'Focus Areas', items: ['Lipids', 'Cardio', 'Metabolic', 'Sleep', 'Inflammation'] },
      ],
    },
  ],

  nav: [
    { id: 'vitality',  label: 'Vitality',  icon: 'star'     },
    { id: 'blood',     label: 'Blood',     icon: 'activity' },
    { id: 'recovery',  label: 'Recovery',  icon: 'heart'    },
    { id: 'stack',     label: 'Stack',     icon: 'layers'   },
    { id: 'insights',  label: 'Insights',  icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'vitro-mock', 'VITRO — Interactive Mock');
console.log('Mock live at:', result.url);
