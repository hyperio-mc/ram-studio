import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KOJI',
  tagline:   'Fermentation Culture Companion',
  archetype: 'fermentation-lifestyle',

  palette: {
    bg:      '#0A1208',
    surface: '#111C0F',
    text:    '#EEF0E8',
    accent:  '#D97706',
    accent2: '#6B8F65',
    muted:   'rgba(140,168,130,0.5)',
  },
  lightPalette: {
    bg:      '#F5F3ED',
    surface: '#FFFFFF',
    text:    '#1A1F14',
    accent:  '#C26A00',
    accent2: '#4A7044',
    muted:   'rgba(26,31,20,0.4)',
  },

  screens: [
    {
      id: 'cultures',
      label: 'Cultures',
      content: [
        { type: 'metric', label: 'YOUR CULTURES — Monday, Apr 13', value: '3 active', sub: 'Levain · Rye · Kefir' },
        { type: 'list', items: [
          { icon: 'activity',  title: 'Levain — 78% active', sub: 'Day 14 · Fed 6h ago · Rising well · pH 3.9', badge: '●●●' },
          { icon: 'activity',  title: 'Rye — 55% active',   sub: 'Day 7 · Fed 12h ago · Moderate · pH 4.2',   badge: '●●○' },
          { icon: 'activity',  title: 'Kefir — 90% active', sub: 'Day 3 · Ready to strain · Very active',      badge: '★' },
        ]},
        { type: 'text', label: 'TODAY', value: 'Levain is ready to bake with. Rye needs a feed. Kefir is ready to strain.' },
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric', label: 'LEVAIN — 14-DAY STORY', value: 'Chapter 14', sub: 'Strong and consistent. Your best starter yet.' },
        { type: 'list', items: [
          { icon: 'sun',      title: 'Day 14 — Fed 1:2:2, 72°F',  sub: 'Peaked at 7h, strong dome, tangy aroma', badge: 'Today' },
          { icon: 'moon',     title: 'Day 13 — Skip fed',          sub: 'Busy day. Culture held fine at room temp', badge: 'Day 13' },
          { icon: 'droplets', title: 'Day 12 — Fed 1:3:3, rye',   sub: 'More vigorous than usual — rye boost works', badge: 'Day 12' },
          { icon: 'activity', title: 'Day 10 — Sluggish, pH 4.6', sub: 'Too cold. Moved to top of fridge. Recovered Day 11', badge: 'Day 10' },
        ]},
        { type: 'text', label: 'SPARKLINE (7-DAY RISE)', value: '42% → 58% → 61% → 47% → 70% → 74% → 78% · Trending up' },
      ],
    },
    {
      id: 'feed',
      label: 'Feed',
      content: [
        { type: 'metric', label: 'LOG A FEED — LEVAIN', value: '1 : 2 : 2', sub: 'Starter : Flour : Water · Standard ratio' },
        { type: 'list', items: [
          { icon: 'check-circle', title: '1:1:1 — Same weight',    sub: 'Mild, slower rise',           badge: '' },
          { icon: 'check-circle', title: '1:2:2 — Standard',       sub: 'Selected · Balanced',          badge: '✓' },
          { icon: 'circle',       title: '1:3:3 — High feed',      sub: 'Dilutes, more vigorous later', badge: '' },
          { icon: 'circle',       title: '1:5:5 — Retard / fridge', sub: 'Very slow, overnight',        badge: '' },
        ]},
        { type: 'text', label: 'FLOUR', value: 'Bread flour 80% + Rye 20% · Water temp: 72°F' },
        { type: 'text', label: 'SENSORY', value: 'Aroma: tangy, slightly nutty. Texture: smooth, slight bubble. Color: cream.' },
      ],
    },
    {
      id: 'science',
      label: 'Science',
      content: [
        { type: 'metric', label: 'PH TREND — LEVAIN', value: 'pH 3.9', sub: 'Optimal zone 3.5–4.5 · Healthy acidity' },
        { type: 'progress', items: [
          { label: 'Day 10 — pH 4.6 (above zone)', pct: 92 },
          { label: 'Day 11 — pH 4.3',              pct: 86 },
          { label: 'Day 12 — pH 4.1',              pct: 82 },
          { label: 'Day 13 — pH 4.0',              pct: 80 },
          { label: 'Day 14 — pH 3.9 ✓',           pct: 78 },
        ]},
        { type: 'text', label: 'RISE TIMELINE (TODAY)', value: '0h: 100% → 3h: 135% → 5h: 162% → 7h: 178% (peak) → 9h: 168%' },
        { type: 'text', label: 'KOJI EXPLAINS', value: 'Lactic acid bacteria produce both lactic and acetic acid as they consume flour. pH below 4.5 keeps unwanted bacteria out. Your culture is in the healthy zone.' },
      ],
    },
    {
      id: 'diagnose',
      label: 'Diagnose',
      content: [
        { type: 'metric', label: 'SOMETHING\'S OFF?', value: 'Slow to rise', sub: 'Select what you\'re seeing' },
        { type: 'list', items: [
          { icon: 'check-circle', title: 'Slower than usual rise',  sub: 'Selected',                          badge: '✓' },
          { icon: 'circle',       title: 'Liquid layer on top',     sub: 'Hooch — signs of hunger',           badge: '' },
          { icon: 'circle',       title: 'Pink or orange streaks',  sub: 'Contamination warning',             badge: '' },
          { icon: 'circle',       title: 'Flat, no bubbles at all', sub: 'Culture may be too cold or dormant', badge: '' },
        ]},
        { type: 'text', label: 'DIAGNOSIS', value: 'Slow rise usually means temperature. Below 68°F, fermentation slows significantly. Move your culture somewhere warmer — top of the refrigerator, near the oven, or use warm water in next feed.' },
      ],
    },
    {
      id: 'bake',
      label: 'Bake',
      content: [
        { type: 'metric', label: 'BAKE WITH LEVAIN', value: 'Peak condition', sub: 'Culture at 78% activity · Best window: now–4h' },
        { type: 'list', items: [
          { icon: 'star',     title: 'Country loaf (levain)',   sub: '75% hydration · 4h bulk · Overnight proof', badge: 'Best now' },
          { icon: 'activity', title: 'Focaccia (high hydration)', sub: '85% hydration · 3h same-day bake',       badge: 'Quick' },
          { icon: 'wind',     title: 'Sourdough pizza dough',   sub: '65% hydration · 2h + cold proof',          badge: '12h' },
          { icon: 'moon',     title: 'Discard crackers',        sub: 'Use discarded starter · No wait needed',   badge: 'Anytime' },
        ]},
        { type: 'text', label: 'RECIPE TIP', value: 'For the country loaf: use 20% preferment (levain : total flour). Autolyse 30 min before adding levain. Score deep — your culture is gassy.' },
      ],
    },
  ],

  nav: [
    { id: 'cultures', label: 'Cultures', icon: 'activity' },
    { id: 'timeline', label: 'Timeline', icon: 'clock' },
    { id: 'feed',     label: 'Feed',     icon: 'droplets' },
    { id: 'science',  label: 'Science',  icon: 'bar-chart-2' },
    { id: 'bake',     label: 'Bake',     icon: 'zap' },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, 'koji');
const result = await publishMock(built, 'koji');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/koji-mock`);
