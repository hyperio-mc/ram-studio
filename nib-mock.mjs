import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'NIB',
  tagline:   'Rare manuscript catalogue for serious collectors',
  archetype: 'collector-catalogue',
  palette: {
    bg:      '#1C1915',
    surface: '#2A2520',
    text:    '#F5F0E8',
    accent:  '#C8A068',
    accent2: '#B05C2E',
    muted:   'rgba(245,240,232,0.45)',
  },
  lightPalette: {
    bg:      '#FAF7F1',
    surface: '#FFFFFF',
    text:    '#1C1915',
    accent:  '#4A3728',
    accent2: '#B05C2E',
    muted:   'rgba(28,25,21,0.45)',
  },
  screens: [
    {
      id: 'collection',
      label: 'Collection',
      content: [
        { type: 'metric-row', items: [
          { label: 'Items',     value: '48'    },
          { label: 'Portfolio', value: '£1.2M' },
          { label: 'Acquired',  value: '23'    },
        ]},
        { type: 'text', label: 'Featured', value: 'Gutenberg Bible Fragment — c. 1455, Mainz · Condition: Fine' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Gutenberg Bible Fragment',  sub: 'LOT 001 · c. 1455 · Mainz',        badge: 'Fine'  },
          { icon: 'layers', title: 'Herbal Manuscript',         sub: 'LOT 003 · c. 1430 · Unknown',      badge: 'Fine'  },
          { icon: 'layers', title: 'Map of Jerusalem',          sub: 'LOT 008 · 1482 · Venice',          badge: 'Good'  },
          { icon: 'layers', title: 'Book of Hours',             sub: 'LOT 011 · c. 1450 · Paris',        badge: 'V.Gd'  },
          { icon: 'layers', title: 'Arabic Astrolabe Manual',   sub: 'LOT 019 · c. 1200 · Baghdad',      badge: 'Fair'  },
        ]},
        { type: 'tags', label: 'Script Types', items: ['Textura', 'Carolingian', 'Humanist', 'Insular', 'Nashī'] },
      ],
    },
    {
      id: 'detail',
      label: 'Item Detail',
      content: [
        { type: 'metric', label: 'Gutenberg Bible Fragment', value: '$24,000', sub: 'Estimated value · LOT 001' },
        { type: 'list', items: [
          { icon: 'map',      title: 'Origin',     sub: 'Mainz, Germany',       badge: '1455' },
          { icon: 'code',     title: 'Script',     sub: 'Textura Quadrata',      badge: '—'   },
          { icon: 'layers',   title: 'Material',   sub: 'Vellum',               badge: '—'   },
          { icon: 'check',    title: 'Condition',  sub: 'Fine / 9.2',           badge: '✓'   },
          { icon: 'user',     title: 'Provenance', sub: 'Eton College Library', badge: '—'   },
        ]},
        { type: 'tags', label: 'Annotations', items: ['RUBRICATION', 'BICOLUMNAR', 'GOTHIC TEXTURA', 'VELLUM LEAF'] },
        { type: 'text', label: 'Notes', value: 'Partial leaf from the 42-line Bible. Rubrication by hand in red. Ink remarkably stable — minimal foxing. Unrecorded variant in the Haebler census.' },
      ],
    },
    {
      id: 'browse',
      label: 'Browse',
      content: [
        { type: 'progress', items: [
          { label: 'Gothic Textura',        pct: 95 },
          { label: 'Carolingian Minuscule', pct: 72 },
          { label: 'Humanist Italic',       pct: 55 },
          { label: 'Insular Script',        pct: 33 },
          { label: 'Nashī Arabic',          pct: 44 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Medieval',   value: '312' },
          { label: 'Islamic',    value: '203' },
          { label: 'Byzantine',  value: '89'  },
          { label: 'Other',      value: '157' },
        ]},
        { type: 'tags', label: 'Filter by Era', items: ['Early Medieval', 'High Medieval', 'Late Medieval', 'Renaissance'] },
      ],
    },
    {
      id: 'origins',
      label: 'Origins',
      content: [
        { type: 'metric', label: 'Provenance Locations', value: '8', sub: 'Cities of origin in collection' },
        { type: 'progress', items: [
          { label: 'German-speaking', pct: 58 },
          { label: 'Italian',         pct: 25 },
          { label: 'Islamic',         pct: 10 },
          { label: 'British',         pct: 6  },
          { label: 'Byzantine',       pct: 4  },
        ]},
        { type: 'list', items: [
          { icon: 'map', title: 'Mainz, Germany',    sub: 'Gutenberg · Early Printing',  badge: '14' },
          { icon: 'map', title: 'Paris, France',     sub: 'Books of Hours · Psalters',   badge: '9'  },
          { icon: 'map', title: 'Florence, Italy',   sub: 'Humanist manuscripts',        badge: '8'  },
          { icon: 'map', title: 'Toledo, Spain',     sub: 'Islamic + Latin hybrids',     badge: '4'  },
        ]},
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Items',     value: '48'    },
          { label: 'Portfolio', value: '£1.2M' },
          { label: 'Acquired',  value: '23'    },
          { label: 'Sold',      value: '8'     },
        ]},
        { type: 'list', items: [
          { icon: 'activity', title: 'Acquired Gutenberg Fragment',   sub: '2 Apr 2026',  badge: '↑' },
          { icon: 'activity', title: 'Provenance update: Herbal MS',  sub: '28 Mar 2026', badge: '◎' },
          { icon: 'check',    title: 'Condition report: Papal Bull',  sub: '21 Mar 2026', badge: '✓' },
          { icon: 'share',    title: 'Shared Persian Poem with IRG',  sub: '14 Mar 2026', badge: '⊕' },
        ]},
        { type: 'tags', label: 'Specialisations', items: ['Early Printing', 'Illuminated MSS', 'Maps & Atlases', 'Biblical', 'Germanic'] },
      ],
    },
  ],
  nav: [
    { id: 'collection', label: 'Collection', icon: 'layers'  },
    { id: 'detail',     label: 'Detail',     icon: 'search'  },
    { id: 'browse',     label: 'Browse',     icon: 'filter'  },
    { id: 'origins',    label: 'Origins',    icon: 'map'     },
    { id: 'profile',    label: 'Profile',    icon: 'user'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'nib-mock', 'NIB — Interactive Mock');
console.log('Mock:', result.status, '→ https://ram.zenbin.org/nib-mock');
