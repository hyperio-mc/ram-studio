import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'ONYX',
  tagline:   'Rare spirits, collected.',
  archetype: 'spirits-discovery',
  palette: {
    bg:      '#09090A',
    surface: '#1A1A1D',
    text:    '#F0E6D0',
    accent:  '#C9873A',
    accent2: '#E8AA5A',
    muted:   'rgba(240,230,208,0.4)',
  },
  lightPalette: {
    bg:      '#F8F3EC',
    surface: '#FFFFFF',
    text:    '#1A1410',
    accent:  '#A0602A',
    accent2: '#C9873A',
    muted:   'rgba(26,20,16,0.45)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'Featured', value: 'Balvenie 21yr', sub: 'PortWood Finish · Speyside' },
        { type: 'metric-row', items: [{ label: 'Score', value: '98' }, { label: 'ABV', value: '40%' }, { label: 'Age', value: '21yr' }] },
        { type: 'list', items: [
          { icon: 'star', title: 'Macallan 18yr', sub: 'Speyside · Score: 96', badge: '£320' },
          { icon: 'star', title: 'Hibiki 21yr', sub: 'Japan · Score: 94', badge: '£280' },
          { icon: 'star', title: 'Redbreast 27yr', sub: 'Ireland · Score: 97', badge: '£450' },
        ]},
        { type: 'text', label: 'Last Tasting', value: 'Lagavulin 16yr — 3 days ago' },
      ],
    },
    {
      id: 'cellar', label: 'Cellar',
      content: [
        { type: 'metric', label: 'Portfolio Value', value: '£12,480', sub: '+£840 · +7.2% this year' },
        { type: 'metric-row', items: [{ label: 'Bottles', value: '28' }, { label: 'Avg Score', value: '93.4' }] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Balvenie 21yr', sub: 'PortWood · +12%', badge: '£320' },
          { icon: 'layers', title: 'Hennessy Paradis', sub: 'Cognac · +18%', badge: '£560' },
          { icon: 'layers', title: 'Macallan 18yr', sub: 'Sherry Oak · +8%', badge: '£290' },
          { icon: 'layers', title: 'Rémy XO', sub: 'Excellence · -2%', badge: '£210' },
        ]},
      ],
    },
    {
      id: 'market', label: 'Market',
      content: [
        { type: 'metric', label: 'Macallan 18yr · 12mo', value: '£292', sub: '+£22 · +8.2% vs last year' },
        { type: 'progress', items: [
          { label: 'Macallan 18 vs 12mo ago', pct: 82 },
          { label: 'Hibiki 21 vs 12mo ago', pct: 65 },
          { label: 'Balvenie 21 vs 12mo ago', pct: 92 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Karuizawa 1980', sub: 'Ends in 2h · HOT', badge: '£8,400' },
          { icon: 'activity', title: 'Springbank 30yr', sub: 'Ends in 6h · +12%', badge: '£2,100' },
          { icon: 'activity', title: 'Dalmore Luminary', sub: 'Ends in 1d · +7%', badge: '£1,650' },
        ]},
      ],
    },
    {
      id: 'tasting', label: 'Tasting',
      content: [
        { type: 'metric', label: 'Lagavulin 16yr · Islay', value: '4.5★ / 5', sub: 'Tasted 3 days ago' },
        { type: 'tags', label: 'Nose', items: ['Peat smoke', 'Sea salt', 'Iodine', 'Dried fruit'] },
        { type: 'tags', label: 'Palate', items: ['Sweet peat', 'Dark choc', 'Leather', 'Pepper'] },
        { type: 'progress', items: [
          { label: 'Smokiness', pct: 95 },
          { label: 'Sweetness', pct: 45 },
          { label: 'Maritime', pct: 88 },
          { label: 'Spice', pct: 70 },
        ]},
        { type: 'text', label: 'My Note', value: '"Classic Lagavulin — peat hits immediately but there\'s surprising sweetness. The maritime finish lingers beautifully."' },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'ONYX Reserve · Member #00847', value: 'James W.', sub: 'Member since 2021' },
        { type: 'metric-row', items: [{ label: 'Bottles', value: '28' }, { label: 'Tastings', value: '143' }, { label: 'Rank', value: '#284' }] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Added to cellar', sub: 'Springbank 25yr · 2h ago', badge: '▣' },
          { icon: 'star', title: 'Tasting logged', sub: 'Lagavulin 16yr — 4.5★ · 3d ago', badge: '✦' },
          { icon: 'activity', title: 'Auction bid', sub: 'Karuizawa 1980 — £8,200 · 5d ago', badge: '◎' },
          { icon: 'chart', title: 'Portfolio valued', sub: 'Collection +7.2% · 1w ago', badge: '↑' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'cellar', label: 'Cellar', icon: 'layers' },
    { id: 'market', label: 'Market', icon: 'chart' },
    { id: 'tasting', label: 'Tasting', icon: 'star' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'onyx-mock', 'ONYX — Interactive Mock');
console.log('Mock live at:', result.url);
