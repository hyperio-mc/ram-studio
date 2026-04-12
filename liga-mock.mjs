import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LIGA',
  tagline:   'Independent type. Human-made.',
  archetype: 'type-tool',

  palette: {              // dark theme
    bg:      '#0E0C0A',
    surface: '#181410',
    text:    '#F5F2EC',
    accent:  '#C49A5A',
    accent2: '#7A9B6C',
    muted:   'rgba(245,242,236,0.4)',
  },
  lightPalette: {         // light theme — warm cream paper
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#141210',
    accent:  '#9B7A45',
    accent2: '#2D7D46',
    muted:   'rgba(20,18,16,0.4)',
  },

  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric-row', items: [
          { label: 'Typefaces', value: '247' },
          { label: 'Foundries', value: '38' },
          { label: 'New',       value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'star',     title: 'Attila Display',   sub: 'KOMETA · 18 styles · Display Grotesque', badge: 'NEW' },
          { icon: 'layers',   title: 'Uniforma Variable', sub: 'KOMETA · 18 styles · Sans Variable',     badge: '' },
          { icon: 'eye',      title: 'Victor Serif',      sub: 'RETYPE · 12 styles · Transitional',      badge: '' },
          { icon: 'code',     title: 'Stabil Grotesk',    sub: 'KOMETA · 7 styles · Geometric Mono',     badge: 'NEW' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Display', 'Serif', 'Mono', 'Variable', 'Script'] },
      ],
    },
    {
      id: 'specimen', label: 'Specimen',
      content: [
        { type: 'metric', label: 'Attila Display', value: '18', sub: 'KOMETA Typefaces · styles available' },
        { type: 'progress', items: [
          { label: 'Thin · 100',  pct: 10  },
          { label: 'Light · 300', pct: 30  },
          { label: 'Regular · 400', pct: 40 },
          { label: 'Bold · 700',  pct: 70  },
          { label: 'Black · 900', pct: 90  },
        ]},
        { type: 'text', label: 'Foundry Note', value: '"We make fonts that AI couldn\'t invent." — KOMETA Typefaces, Basel' },
        { type: 'tags', label: 'Character Tags', items: ['Radical', 'High-End', 'Contrasted', 'Display', 'Latin'] },
      ],
    },
    {
      id: 'collections', label: 'Collections',
      content: [
        { type: 'list', items: [
          { icon: 'layers', title: 'For the Editorial Page', sub: '14 families · Serifs and display types', badge: '14' },
          { icon: 'code',   title: 'Precision Instruments',  sub: '9 families · Mono and technical',        badge: '9'  },
          { icon: 'star',   title: 'Radical Forms',          sub: '11 families · Experimental display',     badge: '11' },
          { icon: 'grid',   title: 'The Invisible Hand',     sub: '18 families · Interface grotesques',     badge: '18' },
        ]},
        { type: 'text', label: 'About Collections', value: 'Curated by foundry editors and independent typographers. Updated monthly.' },
      ],
    },
    {
      id: 'my-type', label: 'My Type',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved',    value: '12' },
          { label: 'Licensed', value: '3'  },
          { label: 'In Use',   value: '2'  },
          { label: 'Wishlist', value: '7'  },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Attila Display',  sub: 'Web · Desktop · App · $240',     badge: '✓' },
          { icon: 'check',    title: 'Victor Serif',    sub: 'Web only · $180',                badge: '✓' },
          { icon: 'check',    title: 'Stabil Mono',     sub: 'Desktop only · $90',             badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'Wishlist budget used', pct: 62 },
          { label: 'Storage used',          pct: 23 },
        ]},
      ],
    },
    {
      id: 'license', label: 'License',
      content: [
        { type: 'metric', label: 'Attila Display — Bundle', value: '$240', sub: 'Web + Desktop + App · one-time' },
        { type: 'list', items: [
          { icon: 'globe',    title: 'Web License',     sub: 'Unlimited pageviews · 1 domain',  badge: '$60' },
          { icon: 'user',     title: 'Desktop License', sub: 'Unlimited users · 1 studio',      badge: '$90' },
          { icon: 'activity', title: 'App License',     sub: 'iOS & Android · 1 app',           badge: '$120' },
          { icon: 'zap',      title: 'Bundle — Best',   sub: 'Web + Desktop + App',             badge: '$240' },
        ]},
        { type: 'text', label: 'License Terms', value: 'Perpetual license · Updates included · Invoice provided · Instant delivery' },
        { type: 'tags', label: 'Features', items: ['Perpetual', 'Updates', 'Invoice', 'Instant'] },
      ],
    },
  ],

  nav: [
    { id: 'discover',    label: 'Discover',    icon: 'search'   },
    { id: 'collections', label: 'Collections', icon: 'layers'   },
    { id: 'my-type',     label: 'My Type',     icon: 'heart'    },
    { id: 'license',     label: 'License',     icon: 'star'     },
  ],
};

const svelte = generateSvelteComponent(design);
const built  = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(built, 'liga-mock', `${design.appName} — Interactive Mock`);
console.log(`Mock: ${result.status} → https://ram.zenbin.org/liga-mock`);
