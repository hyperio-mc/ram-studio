import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SPROUT',
  tagline:   'Your herbs, thriving',
  archetype: 'home-gardening',
  palette: {
    bg:      '#080C07',
    surface: '#0F1510',
    text:    '#E2DFCF',
    accent:  '#5EC945',
    accent2: '#D4A94A',
    muted:   'rgba(154,152,132,0.45)',
  },
  lightPalette: {
    bg:      '#F5F5EF',
    surface: '#FFFFFF',
    text:    '#1A1E17',
    accent:  '#3D8E28',
    accent2: '#B8881A',
    muted:   'rgba(26,30,23,0.4)',
  },
  screens: [
    {
      id: 'dashboard',
      label: 'Garden',
      content: [
        { type: 'metric-row', items: [
          { label: 'Plants', value: '12' },
          { label: 'Watering Due', value: '3' },
          { label: 'Harvest Soon', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Basil — Genovese', sub: 'Day 12 · Health 92% · Thriving', badge: '🌿' },
          { icon: 'activity', title: 'Mint — Spearmint', sub: 'Day 28 · Health 78% · Good', badge: '🌱' },
          { icon: 'alert', title: 'Lavender — Hidcote', sub: 'Day 67 · Health 61% · Needs water', badge: '💧' },
          { icon: 'activity', title: 'Thyme — Common', sub: 'Day 45 · Health 95% · Thriving', badge: '🍃' },
        ]},
        { type: 'tags', label: "Today's Tasks", items: ['Water Lavender', 'Prune Basil', 'Fertilise Mint ✓'] },
        { type: 'text', label: 'Seasonal Tip', value: 'Longer days ahead — increase watering for sun-loving herbs like basil.' },
      ],
    },
    {
      id: 'plant-detail',
      label: 'Plant',
      content: [
        { type: 'metric', label: 'Basil — Genovese', value: '92%', sub: 'Health score · Day 12 of growing' },
        { type: 'progress', items: [
          { label: 'Water', pct: 85 },
          { label: 'Light', pct: 72 },
          { label: 'Nutrients', pct: 90 },
          { label: 'Humidity', pct: 58 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Age', value: '12d' },
          { label: 'Temp', value: '18°C' },
          { label: 'Soil pH', value: '6.5' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Water', sub: 'Tomorrow · 7am', badge: '💧' },
          { icon: 'eye', title: 'Prune Tips', sub: 'In 3 days', badge: '✂' },
          { icon: 'zap', title: 'Fertilise', sub: 'Next week', badge: '🌱' },
        ]},
        { type: 'text', label: 'Last Journal', value: '"Noticed new growth at the third node — looking vigorous. Added mulch layer today."' },
      ],
    },
    {
      id: 'watering',
      label: 'Log',
      content: [
        { type: 'metric', label: 'Watering Streak', value: '11', sub: 'days · personal best: 18' },
        { type: 'tags', label: 'This Week', items: ['Mon ✓', 'Tue ✓', 'Wed ✓', 'Thu ✗', 'Fri ✓', 'Sat ✓', 'Sun'] },
        { type: 'list', items: [
          { icon: 'activity', title: 'Basil', sub: 'Today · 8:12am · 180ml', badge: '📷' },
          { icon: 'activity', title: 'Thyme', sub: 'Today · 8:14am · 80ml', badge: '✓' },
          { icon: 'activity', title: 'Mint', sub: 'Yesterday · 7:45am · 160ml · Added feed', badge: '📷' },
          { icon: 'activity', title: 'Lavender', sub: 'Thursday · 100ml · Soil very dry', badge: '⚠' },
          { icon: 'activity', title: 'Chives', sub: 'Wednesday · 140ml', badge: '📷' },
        ]},
      ],
    },
    {
      id: 'harvest',
      label: 'Harvest',
      content: [
        { type: 'metric', label: 'Season Total', value: '847g', sub: 'across 5 herbs this season' },
        { type: 'progress', items: [
          { label: 'Jan', pct: 0 },
          { label: 'Feb', pct: 14 },
          { label: 'Mar', pct: 45 },
          { label: 'Apr', pct: 41 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Basil — Ready soon', sub: 'In 2 days · est. 60g', badge: '🌿' },
          { icon: 'zap', title: 'Chives', sub: 'In 5 days · est. 30g', badge: '🌱' },
          { icon: 'zap', title: 'Mint', sub: 'In 8 days · est. 80g', badge: '🍃' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Mint — 60g', sub: 'Mon 6 Apr · Tea & cooking', badge: '✓' },
          { icon: 'check', title: 'Basil — 45g', sub: 'Sat 28 Mar · Pesto batch', badge: '✓' },
          { icon: 'check', title: 'Thyme — 18g', sub: 'Thu 17 Mar · Roast chicken', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'discover',
      label: 'Discover',
      content: [
        { type: 'text', label: 'Spring 2026 Guide', value: 'Best herbs to plant right now — warm days ahead mean ideal conditions for basil, coriander, and summer savory.' },
        { type: 'tags', label: 'Browse', items: ['All', 'Herbs', 'Vegetables', 'Flowers', 'Care'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Coriander', sub: '21–28 days · Sow direct, hates transplanting', badge: 'Easy' },
          { icon: 'star', title: 'Dill', sub: '10–14 days · Full sun, grows tall', badge: 'Easy' },
          { icon: 'star', title: 'Summer Savory', sub: '14–21 days · Warm germination needed', badge: 'Medium' },
          { icon: 'star', title: 'Lemon Balm', sub: '7–14 days · Spreads quickly, use containers', badge: 'Easy' },
        ]},
        { type: 'text', label: 'Tip of the Week', value: 'Longer days ahead — increase watering frequency for sun-loving herbs. Consider a south-facing windowsill for maximum yield.' },
      ],
    },
  ],
  nav: [
    { id: 'dashboard',    label: 'Garden',   icon: 'home' },
    { id: 'watering',     label: 'Log',      icon: 'list' },
    { id: 'harvest',      label: 'Harvest',  icon: 'star' },
    { id: 'discover',     label: 'Discover', icon: 'search' },
    { id: 'plant-detail', label: 'Plant',    icon: 'eye' },
  ],
};

console.log('Building Svelte component...');
const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Publishing mock...');
const result = await publishMock(html, 'sprout-mock', 'SPROUT — Interactive Mock');
console.log('Mock live at:', result.url || `https://ram.zenbin.org/sprout-mock`);
console.log('Status:', result.status);
