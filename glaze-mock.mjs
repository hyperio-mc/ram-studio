// glaze-mock.mjs — GLAZE Svelte 5 interactive mock
// Light parchment material specification platform
// Inspired by fluid.glass (Awwwards SOTD March 30 2026)

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';
import fs from 'fs';

const design = {
  appName:   'GLAZE',
  tagline:   'material specification platform for architects',
  archetype: 'professional-tool',

  palette: {           // Dark fallback palette
    bg:      '#1C1814',
    surface: '#252118',
    text:    '#F5F2EC',
    accent:  '#C4956A',
    accent2: '#9B7B5C',
    muted:   'rgba(245,242,236,0.45)',
  },

  lightPalette: {      // Primary — warm light
    bg:      '#F5F2EC',
    surface: '#FFFFFF',
    text:    '#1C1814',
    accent:  '#9B7B5C',
    accent2: '#6B7C6E',
    muted:   'rgba(28,24,20,0.45)',
  },

  screens: [
    {
      id: 'projects',
      label: 'Projects',
      content: [
        {
          type: 'metric',
          label: 'Glaze — Material Specification',
          value: 'Good morning, Anya.',
          sub: 'MON 30 MARCH 2026 · 3 active projects · 7 total · £12k pending quotes',
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Projects', value: '7'    },
            { label: 'Specs',    value: '24'   },
            { label: 'Pending',  value: '£12k' },
          ],
        },
        {
          type: 'list',
          items: [
            { icon: 'layers', title: 'Kensington Residence',  sub: 'Structural Glazing · R. Ashford Architects · 72% complete',  badge: '72%'  },
            { icon: 'layers', title: 'EC1 Office Complex',    sub: 'Curtain Wall System · Paloma Studio · 45% complete',         badge: '45%'  },
            { icon: 'layers', title: 'Shoreditch Pavilion',   sub: 'Bespoke Doors · Harrow + Partners · 18% complete',           badge: 'NEW'  },
          ],
        },
        {
          type: 'tags',
          label: 'Quick Actions',
          items: ['+ New Project', '⬡ Browse Library', '◉ Saved Specs'],
        },
        {
          type: 'text',
          label: 'Recent',
          value: 'Added SL-7 to Kensington Residence 2h ago\nViewed CW-3 Curtain Wall System 5h ago\nCreated EC1 Office Complex yesterday',
        },
      ],
    },
    {
      id: 'library',
      label: 'Library',
      content: [
        {
          type: 'metric',
          label: 'Material Library',
          value: '48 Systems',
          sub: 'Glass · Steel · Stone · Filter: All · Search glazing systems…',
        },
        {
          type: 'tags',
          label: 'Categories',
          items: ['All', 'Structural', 'Curtain Wall', 'Doors', 'Windows'],
        },
        {
          type: 'list',
          items: [
            { icon: 'grid',   title: 'SL-7 Structural Glass',  sub: 'Toughened laminate · GL-SL-7 · 16mm · Lead time 6–8wk', badge: '16mm'  },
            { icon: 'grid',   title: 'CW-3 Curtain Wall',      sub: 'Aluminium frame system · CW-003 · 12mm · 8–10wk',       badge: '12mm'  },
            { icon: 'grid',   title: 'BD-1 Bespoke Door',      sub: 'Pivot frameless entry · BD-001 · 10mm · 10–12wk',       badge: '10mm'  },
            { icon: 'grid',   title: 'WD-4 Slim Window',       sub: 'Thermally broken sash · WD-004 · 8mm · 5–7wk',          badge: '8mm'   },
          ],
        },
        {
          type: 'text',
          label: 'About Library',
          value: '48 curated glazing systems from verified UK suppliers. Filter by U-value, fire rating, max pane size, and lead time. All systems BSEN/ISO certified.',
        },
      ],
    },
    {
      id: 'detail',
      label: 'Detail',
      content: [
        {
          type: 'metric',
          label: 'SL-7 Structural Glass · GL-SL-7',
          value: 'Structural Glass',
          sub: 'Toughened laminate · Tags: STRUCTURAL · LAMINATED · FIRE-RATED',
        },
        {
          type: 'list',
          items: [
            { icon: 'check', title: 'Thickness',      sub: '16mm laminate',      badge: 'SPEC' },
            { icon: 'check', title: 'Max pane size',  sub: '3000 × 2400mm',      badge: 'SPEC' },
            { icon: 'check', title: 'U-value',        sub: '1.0 W/m²K',          badge: 'PERF' },
            { icon: 'check', title: 'Light trans.',   sub: '72%',                badge: 'PERF' },
            { icon: 'check', title: 'Fire rating',    sub: 'EI 30 (30 min)',     badge: 'CERT' },
            { icon: 'check', title: 'Lead time',      sub: '6–8 weeks',          badge: 'LEAD' },
          ],
        },
        {
          type: 'tags',
          label: 'Tags',
          items: ['STRUCTURAL', 'LAMINATED', 'FIRE-RATED', 'UK SUPPLIER'],
        },
        {
          type: 'text',
          label: 'Actions',
          value: '→ Specify for Project\n→ Save to Library',
        },
      ],
    },
    {
      id: 'specify',
      label: 'Specify',
      content: [
        {
          type: 'metric',
          label: 'Specify — Kensington Residence · SL-7',
          value: '£ 8,640',
          sub: '12 × SL-7 Structural · 1800 × 2400mm · inc. VAT · Lead time: 6–8 weeks',
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Width',    value: '1800mm'    },
            { label: 'Height',   value: '2400mm'    },
            { label: 'Qty',      value: '12'        },
          ],
        },
        {
          type: 'tags',
          label: 'Options',
          items: ['Toughened ✓', 'Laminated ✓', 'Low-E coat', 'Tinted'],
        },
        {
          type: 'progress',
          items: [
            { label: 'Spec progress',  pct: 72 },
            { label: 'Budget used',    pct: 48 },
            { label: 'Lead time risk', pct: 28 },
          ],
        },
        {
          type: 'text',
          label: 'Pricing',
          value: 'Estimate: £8,640 for 12 panes at 1800×2400mm (GL-SL-7 Structural, toughened + laminated)\nUnit price: £720/pane · inc. VAT · Ex-factory Watford',
        },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        {
          type: 'metric',
          label: 'Anya Sorensen · Principal Architect',
          value: 'AS',
          sub: 'RIBA · Sorensen + Shaw Studio · London',
        },
        {
          type: 'metric-row',
          items: [
            { label: 'Projects', value: '23' },
            { label: 'Specs',    value: '147' },
            { label: 'Saved',    value: '38'  },
          ],
        },
        {
          type: 'list',
          items: [
            { icon: 'layers', title: 'Added SL-7 to Kensington',     sub: 'Specify · 2h ago',        badge: 'SPEC'  },
            { icon: 'eye',    title: 'Viewed CW-3 Curtain Wall',      sub: 'Library · 5h ago',        badge: 'VIEW'  },
            { icon: 'plus',   title: 'Created EC1 Office Complex',    sub: 'Projects · Yesterday',    badge: 'NEW'   },
            { icon: 'star',   title: 'Saved BD-1 to library',         sub: 'Library · 2d ago',        badge: 'SAVE'  },
            { icon: 'share',  title: 'Submitted Shoreditch quote',    sub: 'Specify · 3d ago',        badge: 'QUOTE' },
          ],
        },
        {
          type: 'tags',
          label: 'Settings',
          items: ['⚙ Preferences', '🔔 Notifications', 'Sign Out'],
        },
      ],
    },
  ],

  nav: [
    { id: 'projects', label: 'Projects', icon: 'layers' },
    { id: 'library',  label: 'Library',  icon: 'grid'   },
    { id: 'detail',   label: 'Detail',   icon: 'eye'    },
    { id: 'specify',  label: 'Specify',  icon: 'check'  },
    { id: 'profile',  label: 'Profile',  icon: 'user'   },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
  slug: 'glaze-mock',
});

fs.writeFileSync('/workspace/group/design-studio/glaze-mock.html', html);
console.log('✓ glaze-mock.html built');

const result = await publishMock(html, 'glaze-mock', 'GLAZE — Interactive Prototype');
console.log('Mock live at:', result.url);
