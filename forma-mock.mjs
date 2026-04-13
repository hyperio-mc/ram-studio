import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FORMA',
  tagline:   'Variable Type Studio',
  archetype: 'type-foundry',
  palette: {
    bg:      '#1A1714',
    surface: '#231F1B',
    text:    '#FAF8F5',
    accent:  '#C8441A',
    accent2: '#4B6A8D',
    muted:   'rgba(250,248,245,0.42)',
  },
  lightPalette: {
    bg:      '#FAF8F5',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#C8441A',
    accent2: '#4B6A8D',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'featured', label: 'Featured',
      content: [
        { type: 'metric', label: 'Featured Face', value: 'Haas Grotesk', sub: 'Linotype · 1961 · 2023 revival · 18 styles' },
        { type: 'metric-row', items: [
          { label: 'Foundry', value: 'Linotype' },
          { label: 'Styles', value: '18' },
          { label: 'Saved', value: '1.2K' },
        ]},
        { type: 'text', label: 'Specimen · 28px Regular', value: 'The quick brown fox jumps over the lazy dog. ABCDEFGHIJKLM 0123456789 !@#$' },
        { type: 'tags', label: 'Weight Range', items: ['Thin','Light','Regular','Medium','Bold','ExtraBold','Black'] },
        { type: 'metric-row', items: [
          { label: 'Price', value: '$49' },
          { label: 'License', value: 'Personal' },
          { label: 'Format', value: 'Variable' },
        ]},
      ],
    },
    {
      id: 'catalog', label: 'Catalog',
      content: [
        { type: 'metric', label: 'Typeface Library', value: '1,247', sub: 'Searchable · filterable by category, variable, price' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Inter',        sub: 'Sans-serif · 14 styles',  badge: 'Free' },
          { icon: 'layers', title: 'Söhne',        sub: 'Sans-serif · 16 styles',  badge: '$120' },
          { icon: 'layers', title: 'Canela Deck',  sub: 'Serif · 12 styles',       badge: '$89' },
          { icon: 'code',   title: 'Geist Mono',   sub: 'Monospace · 9 styles',    badge: 'Free' },
          { icon: 'layers', title: 'Fraunces',     sub: 'Serif · 18 styles',       badge: '$69' },
          { icon: 'code',   title: 'Fragment',     sub: 'Monospace · 6 styles',    badge: '$49' },
        ]},
        { type: 'tags', label: 'Categories', items: ['All','Sans','Serif','Mono','Display','Script'] },
      ],
    },
    {
      id: 'specimen', label: 'Specimen',
      content: [
        { type: 'metric', label: 'Söhne · by Klim Type Foundry', value: 'Sans-serif', sub: 'Variable · 16 styles · $120 per style' },
        { type: 'text', label: 'Live Tester · 28px', value: 'Typography is the art of making words readable.' },
        { type: 'progress', items: [
          { label: 'Weight (wght): 700', pct: 70 },
          { label: 'Size: 28px', pct: 50 },
          { label: 'Tracking: -1em', pct: 35 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Thin',       sub: '100 · wght axis',  badge: 'Aa' },
          { icon: 'check', title: 'Light',      sub: '300 · wght axis',  badge: 'Aa' },
          { icon: 'star',  title: 'Bold',       sub: '700 · wght axis',  badge: 'Aa' },
          { icon: 'check', title: 'ExtraBold',  sub: '800 · wght axis',  badge: 'Aa' },
        ]},
      ],
    },
    {
      id: 'axes', label: 'Variable Axes',
      content: [
        { type: 'metric', label: 'Variable Font Explorer', value: '4 Axes', sub: 'Adjust weight, width, italic angle, optical size' },
        { type: 'progress', items: [
          { label: 'wght — Weight (100–900): 700', pct: 70 },
          { label: 'wdth — Width (75–125): 100', pct: 50 },
          { label: 'ital — Italic Angle (0–1): 0', pct: 0 },
          { label: 'opsz — Optical Size (6–144): 28', pct: 19 },
        ]},
        { type: 'text', label: 'Weight Spectrum', value: 'Thin · ExtraLight · Light · Regular · Medium · SemiBold · Bold · ExtraBold · Black' },
        { type: 'tags', label: 'Supported Formats', items: ['WOFF2','TTF','OTF','Variable TTF','Web CSS'] },
      ],
    },
    {
      id: 'license', label: 'License',
      content: [
        { type: 'metric', label: 'Choose Your License', value: 'Söhne', sub: '3 tiers · Personal, Studio, Enterprise' },
        { type: 'list', items: [
          { icon: 'user',   title: 'Personal',   sub: '1 user · 5 projects · Non-commercial',   badge: '$49' },
          { icon: 'star',   title: 'Studio',     sub: '5 users · Unlimited · Commercial',         badge: '$149' },
          { icon: 'layers', title: 'Enterprise', sub: 'Unlimited · Custom terms · SLA support',   badge: 'Custom' },
        ]},
        { type: 'tags', label: 'Included in all tiers', items: ['Web embed','Print','E-book','PDF','Perpetual'] },
        { type: 'metric-row', items: [
          { label: 'Starting at', value: '$49' },
          { label: 'Per style', value: '/' },
          { label: 'Perpetual', value: '✓' },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric', label: 'My Library', value: '4 Typefaces', sub: '22 styles owned across 2 active licenses' },
        { type: 'metric-row', items: [
          { label: 'Owned', value: '4' },
          { label: 'Styles', value: '22' },
          { label: 'Projects', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Inter',          sub: 'Sans-serif · 14 styles',  badge: 'Free' },
          { icon: 'star',     title: 'Söhne',          sub: 'Sans-serif · 5 styles',   badge: 'Studio' },
          { icon: 'check',    title: 'Canela Deck',    sub: 'Serif · 2 styles',        badge: 'Personal' },
          { icon: 'code',     title: 'Fragment Mono',  sub: 'Monospace · 1 style',     badge: 'Free' },
        ]},
        { type: 'text', label: 'Upgrade Nudge', value: 'Upgrade Söhne to Enterprise — unlock broadcast & app rights' },
      ],
    },
  ],
  nav: [
    { id: 'featured',  label: 'Featured', icon: 'star' },
    { id: 'catalog',   label: 'Catalog',  icon: 'grid' },
    { id: 'specimen',  label: 'Studio',   icon: 'eye' },
    { id: 'library',   label: 'Library',  icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'forma-mock', 'FORMA — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/forma-mock`);
