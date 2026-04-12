// olia-mock.mjs — Svelte 5 interactive mock for OLIA
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'OLIA',
  tagline:   'Skincare Intelligence & Ritual Companion',
  archetype: 'health-beauty',

  palette: {          // DARK variant
    bg:      '#2A1F1A',
    surface: '#3A2C26',
    text:    '#FAF7F4',
    accent:  '#C4826A',
    accent2: '#D4A89A',
    muted:   'rgba(250,247,244,0.45)',
  },

  lightPalette: {     // LIGHT variant (primary)
    bg:      '#FAF7F4',
    surface: '#FFFFFF',
    text:    '#2A1F1A',
    accent:  '#C4826A',
    accent2: '#8B6B5C',
    muted:   'rgba(42,31,26,0.42)',
  },

  screens: [
    {
      id: 'today', label: "Today's Ritual",
      content: [
        { type: 'metric', label: 'Morning Routine', value: '75%', sub: '3 of 4 steps complete' },
        { type: 'metric-row', items: [
          { label: 'Hydration', value: '74%' },
          { label: 'Barrier',   value: '62%' },
          { label: 'Glow',      value: '81%' },
        ]},
        { type: 'progress', items: [
          { label: 'Cleanse ✓',    pct: 100 },
          { label: 'Vitamin C ✓',  pct: 100 },
          { label: 'Moisturise',   pct: 55  },
          { label: 'SPF 50+',      pct: 0   },
        ]},
        { type: 'text', label: 'OLIA Insight', value: 'Barrier slightly stressed — wind exposure noted. Try a richer moisturiser this evening.' },
      ],
    },
    {
      id: 'diary', label: 'Skin Diary',
      content: [
        { type: 'metric', label: '21-Day Log', value: '70', sub: 'Average skin score · 9-day streak' },
        { type: 'progress', items: [
          { label: 'Today  ·  72', pct: 72 },
          { label: 'Fri 21 ·  68', pct: 68 },
          { label: 'Thu 20 ·  75', pct: 75 },
          { label: 'Wed 19 ·  61', pct: 61 },
          { label: 'Mon 17 ·  70', pct: 70 },
        ]},
        { type: 'tags', label: 'Patterns', items: ['Mid-week peaks', '+9% Vitamin C streak', 'Wind = -6pts', 'Rest days boost'] },
        { type: 'text', label: 'Weekly Trend', value: '+4 points this week vs. last week. Keep up the morning SPF habit.' },
      ],
    },
    {
      id: 'products', label: 'Product Lab',
      content: [
        { type: 'metric', label: 'My Shelf', value: '6', sub: 'Products · AM & PM sorted' },
        { type: 'list', items: [
          { icon: 'star', title: 'C E Ferulic',  sub: 'Skinceuticals · Vitamin C',    badge: 'AM' },
          { icon: 'star', title: 'Toleriane',    sub: 'La Roche-Posay · Moisturiser', badge: 'AM' },
          { icon: 'star', title: 'Gentle Foam',  sub: 'Cetaphil · Cleanser',          badge: 'AM/PM' },
          { icon: 'star', title: 'Sunrise Oil',  sub: 'Ultra Violette · SPF 50+',     badge: 'AM' },
          { icon: 'star', title: 'B5 Gel',       sub: 'The Ordinary · Hydration',     badge: 'PM' },
          { icon: 'star', title: 'Peptide Mist', sub: 'Augustinus Bader · Treatment', badge: 'PM' },
        ]},
        { type: 'tags', label: 'Ingredient Profile', items: ['Vitamin C', 'Niacinamide', 'HA', 'Retinol', 'Peptides'] },
      ],
    },
    {
      id: 'insights', label: 'Insights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Avg Score', value: '72' },
          { label: 'vs Last Mo', value: '+7' },
          { label: 'Streak',    value: '21d' },
        ]},
        { type: 'progress', items: [
          { label: 'Vitamin C  88%',      pct: 88 },
          { label: 'Niacinamide  71%',    pct: 71 },
          { label: 'Hyaluronic  64%',     pct: 64 },
          { label: 'Retinol  32%',        pct: 32 },
        ]},
        { type: 'tags', label: 'Trends', items: ['Best score: 80', 'Peak: mid-week', 'Wind impact: -6pts'] },
        { type: 'text', label: 'OLIA Suggests', value: 'Add retinol 2× per week to reach 45%+ coverage. View recommended products.' },
      ],
    },
    {
      id: 'routine', label: 'Routine',
      content: [
        { type: 'metric', label: 'AM Routine', value: '8 min', sub: '6 steps · Score 8.4 / 10' },
        { type: 'list', items: [
          { icon: 'check', title: '01  Cleanse',    sub: 'Cetaphil Gentle Foam',       badge: '✓' },
          { icon: 'check', title: '02  Tone',       sub: 'Optional · skip if rushed',  badge: '—' },
          { icon: 'check', title: '03  Vitamin C',  sub: 'Skinceuticals C E Ferulic',  badge: '✓' },
          { icon: 'check', title: '04  Eye Cream',  sub: 'RoC Retinol Correxion',      badge: '○' },
          { icon: 'check', title: '05  Moisturise', sub: 'La Roche-Posay Toleriane',   badge: '○' },
          { icon: 'check', title: '06  SPF',        sub: 'Ultra Violette Sunrise',     badge: '○' },
        ]},
        { type: 'text', label: 'OLIA Note', value: 'Layering order is correct. Consider adding retinol 2×/week in your PM routine.' },
      ],
    },
  ],

  nav: [
    { id: 'today',    label: 'Today',    icon: 'home'     },
    { id: 'diary',    label: 'Diary',    icon: 'calendar' },
    { id: 'products', label: 'Products', icon: 'grid'     },
    { id: 'insights', label: 'Insights', icon: 'chart'    },
    { id: 'routine',  label: 'Routine',  icon: 'list'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline:  design.tagline,
});
const result = await publishMock(html, 'olia-mock', 'OLIA — Interactive Mock');
console.log('Mock live at:', result.url);
