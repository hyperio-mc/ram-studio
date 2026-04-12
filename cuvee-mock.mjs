// cuvee-mock.mjs — Cuvée interactive Svelte mock
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'Cuvée',
  tagline:   'Wine discovery with an editorial eye',
  archetype: 'wine-discovery-cellar',
  palette: {           // DARK fallback
    bg:      '#1A1815',
    surface: '#231F1B',
    text:    '#F9F6F1',
    accent:  '#8B2635',
    accent2: '#C4956A',
    muted:   'rgba(249,246,241,0.40)',
  },
  lightPalette: {
    bg:      '#F9F6F1',
    surface: '#FFFFFF',
    text:    '#1A1815',
    accent:  '#8B2635',
    accent2: '#C4956A',
    muted:   'rgba(26,24,21,0.42)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'Featured Wine', value: 'Barolo', sub: 'Giacomo Conterno · 2019' },
        { type: 'metric-row', items: [
          { label: 'Critic Score', value: '97' },
          { label: 'Price', value: '£186' },
          { label: 'Vintage', value: '2019' },
        ]},
        { type: 'tags', label: 'Filter', items: ['All', 'Red', 'White', 'Sparkling', 'Rosé'] },
        { type: 'list', items: [
          { icon: 'star', title: 'Barolo — Conterno', sub: 'Piedmont, 2019 · 97pts', badge: '£186' },
          { icon: 'star', title: 'Puligny-Montrachet', sub: 'Burgundy, 2021 · 94pts', badge: '£94' },
          { icon: 'star', title: 'Amarone della Val.', sub: 'Veneto, 2016 · 96pts', badge: '£128' },
        ]},
        { type: 'text', label: 'Curated by sommeliers', value: 'Weekly selections from leading sommeliers worldwide — wines worth seeking out.' },
      ],
    },
    {
      id: 'profile', label: 'Wine Detail',
      content: [
        { type: 'metric', label: 'Barolo 2019', value: '97 pts', sub: 'Giacomo Conterno · Piedmont, Italy' },
        { type: 'progress', items: [
          { label: 'Tar & Roses', pct: 90 },
          { label: 'Dark Cherry', pct: 80 },
          { label: 'Leather', pct: 70 },
          { label: 'Dried Herbs', pct: 55 },
          { label: 'Violet', pct: 45 },
        ]},
        { type: 'text', label: 'Winery Notes', value: 'Giacomo Conterno is one of the greatest estates in the Langhe, producing Barolos of extraordinary longevity and complexity.' },
        { type: 'metric-row', items: [
          { label: 'Price', value: '£186' },
          { label: 'Region', value: 'Piedmont' },
          { label: 'Grape', value: 'Nebbiolo' },
        ]},
      ],
    },
    {
      id: 'cellar', label: 'Cellar',
      content: [
        { type: 'metric-row', items: [
          { label: 'Bottles', value: '48' },
          { label: 'Value', value: '£4.2k' },
          { label: 'Varieties', value: '12' },
          { label: 'Vintages', value: '6' },
        ]},
        { type: 'progress', items: [
          { label: 'Burgundy', pct: 29 },
          { label: 'Piedmont', pct: 21 },
          { label: 'Bordeaux', pct: 19 },
          { label: 'Loire', pct: 15 },
          { label: 'Other', pct: 16 },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'Meursault 1er Cru 2017', sub: 'Coche-Dury · Drink soon', badge: '×3' },
          { icon: 'alert', title: 'Côte-Rôtie La Mouline', sub: 'Guigal · 2015 · Ready', badge: '×2' },
          { icon: 'alert', title: 'Priorat Terroir 2018', sub: 'Álvaro Palacios', badge: '×6' },
        ]},
      ],
    },
    {
      id: 'log', label: 'Tasting Log',
      content: [
        { type: 'metric', label: 'Tastings recorded', value: '23', sub: 'Since joining Cuvée' },
        { type: 'list', items: [
          { icon: 'check', title: 'Barolo Cascina Francia', sub: 'Conterno · Mar 26 · 97pts', badge: '97' },
          { icon: 'check', title: 'Chambolle-Musigny 1er', sub: 'Roumier · Mar 24 · 95pts', badge: '95' },
          { icon: 'check', title: 'Grüner Veltliner Vinothek', sub: 'Knoll · Mar 21 · 93pts', badge: '93' },
          { icon: 'check', title: 'Priorat Les Terrasses', sub: 'Palacios · Mar 19 · 91pts', badge: '91' },
        ]},
        { type: 'text', label: 'Your average score', value: '93.4 points across 23 recorded wines.' },
      ],
    },
    {
      id: 'pairing', label: 'Pairings',
      content: [
        { type: 'metric', label: 'Paired with Barolo 2019', value: 'AI Sommelier', sub: 'Personalised food matches' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Braised Short Rib', sub: 'Rich fat mirrors tannin depth', badge: '98%' },
          { icon: 'heart', title: 'Aged Parmigiano', sub: 'Savory crystalline umami', badge: '94%' },
          { icon: 'heart', title: 'Black Truffle Risotto', sub: 'Earthy complexity in harmony', badge: '92%' },
          { icon: 'heart', title: 'Roast Lamb with Herbs', sub: 'Classic Piedmontese tradition', badge: '90%' },
        ]},
        { type: 'text', label: 'Sommelier Tip', value: 'Decant this Barolo for at least 3 hours. It opens dramatically, revealing dark plum and dried rose petals.' },
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'profile',  label: 'Wine',     icon: 'star'   },
    { id: 'cellar',   label: 'Cellar',   icon: 'layers' },
    { id: 'log',      label: 'Log',      icon: 'list'   },
    { id: 'pairing',  label: 'Pairing',  icon: 'heart'  },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, 'cuvee-mock', 'Cuvée — Interactive Mock');
  console.log('Mock live at:', result.url);
} catch (e) {
  console.error('Mock build/publish error:', e.message);
  process.exit(1);
}
