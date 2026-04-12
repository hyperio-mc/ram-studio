import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CANOPY',
  tagline:   'Know your carbon. Prove your progress.',
  archetype: 'sustainability',
  palette: {           // DARK mode
    bg:      '#1A2E20',
    surface: '#243B2B',
    text:    '#F0EDE4',
    accent:  '#4AE87C',
    accent2: '#E8855A',
    muted:   'rgba(240,237,228,0.42)',
  },
  lightPalette: {      // LIGHT mode — warm ivory (Relace.ai inspired)
    bg:      '#FAF8F2',
    surface: '#F5F2EA',
    text:    '#1C1A14',
    accent:  '#1C3D2B',
    accent2: '#C25C2A',
    muted:   'rgba(28,26,20,0.44)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Carbon Score · Q1 2026', value: '74', sub: 'Grade B+ · Top 18% of peers · ↓ 4.2% vs last quarter' },
        { type: 'metric-row', items: [
          { label: 'Scope 1',  value: '1,240' },
          { label: 'Scope 2',  value: '3,880' },
          { label: 'Scope 3',  value: '5,080' },
        ]},
        { type: 'progress', items: [
          { label: 'Scope 1 — Direct emissions', pct: 12 },
          { label: 'Scope 2 — Purchased energy', pct: 38 },
          { label: 'Scope 3 — Value chain',      pct: 50 },
        ]},
        { type: 'list', items: [
          { icon: 'check',    title: 'Data import complete',   sub: 'Scope 3 — 1,240 records',   badge: '2h ago' },
          { icon: 'star',     title: 'Offset certificate',     sub: 'VCS-1842 · 200 tCO₂e',     badge: '1d ago' },
          { icon: 'alert',    title: 'Supplier flagged',       sub: 'Nexus Freight — high risk', badge: '2d ago' },
        ]},
      ],
    },
    {
      id: 'supply', label: 'Supply',
      content: [
        { type: 'metric', label: 'Supply Chain', value: '24', sub: '3 suppliers at-risk · 10.2K tCO₂e total' },
        { type: 'list', items: [
          { icon: 'alert', title: 'Global Ports Inc',     sub: 'Shipping · 4,210 tCO₂e',    badge: '🔴 CRIT' },
          { icon: 'alert', title: 'Nexus Freight',        sub: 'Logistics · 2,140 tCO₂e',  badge: '⚠ HIGH' },
          { icon: 'activity', title: 'Acme Components',   sub: 'Manufacturing · 1,560 tCO₂e', badge: '○ MED' },
          { icon: 'check', title: 'Verdant Packaging',    sub: 'Materials · 890 tCO₂e',    badge: '✓ LOW'  },
          { icon: 'check', title: 'SolarFab Ltd',         sub: 'Energy · 310 tCO₂e',       badge: '✓ LOW'  },
        ]},
        { type: 'tags', label: 'Filter By Risk', items: ['All', 'Critical', 'High', 'Medium', 'Low'] },
      ],
    },
    {
      id: 'scopes', label: 'Scopes',
      content: [
        { type: 'metric', label: 'Scope 1 — Direct Emissions', value: '1,240', sub: 'tCO₂e · Target: 1,100 · +140 over budget' },
        { type: 'progress', items: [
          { label: 'Combustion (fleet)',   pct: 55 },
          { label: 'Fugitive emissions',  pct: 27 },
          { label: 'On-site heating',     pct: 12 },
          { label: 'Process emissions',   pct:  6 },
        ]},
        { type: 'metric-row', items: [
          { label: '2024',     value: '1,640' },
          { label: '2025',     value: '1,380' },
          { label: '2026 Q1',  value: '1,240' },
        ]},
        { type: 'text', label: 'YoY Trend', value: 'Scope 1 emissions have fallen 24.4% since 2024. Fleet combustion remains the largest single contributor at 55% of total direct emissions.' },
      ],
    },
    {
      id: 'offsets', label: 'Offsets',
      content: [
        { type: 'metric', label: 'Offset Budget', value: '$24K', sub: '3,200 tCO₂e outstanding to neutralise' },
        { type: 'list', items: [
          { icon: 'heart', title: 'Amazon Reforestation',  sub: 'Nature-Based · Brazil · VCS · ★ 4.8',    badge: '$18.40/t' },
          { icon: 'star',  title: 'Kenyan Cookstoves',     sub: 'Community · Kenya · Gold Std · ★ 4.9',  badge: '$12.20/t' },
          { icon: 'zap',   title: 'Wind Farm Rajasthan',   sub: 'Renewable · India · VCS · ★ 4.5',       badge: '$8.60/t'  },
        ]},
        { type: 'tags', label: 'Filter Credits', items: ['All', 'Nature', 'Community', 'Renewable'] },
        { type: 'metric-row', items: [
          { label: 'Budget Remaining', value: '$24K' },
          { label: 'Need',  value: '3.2K t' },
        ]},
      ],
    },
    {
      id: 'report', label: 'Report',
      content: [
        { type: 'metric', label: 'Report Builder', value: 'GHG', sub: 'Protocol · Q1 2026 · ISO 14064 Verified' },
        { type: 'metric-row', items: [
          { label: 'Total',   value: '10.2K' },
          { label: 'Scope 1', value: '1,240' },
          { label: 'Scope 3', value: '5,080' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Third-party verified',         sub: 'Bureau Veritas · ISO 14064-3',  badge: '✓ LIVE' },
          { icon: 'check', title: 'GHG Protocol Full Report',     sub: 'PDF · Excel · CDP XML · JSON',  badge: 'READY'  },
          { icon: 'check', title: 'CSRD Compliance Export',       sub: 'EU regulation · Q1 2026',       badge: 'READY'  },
        ]},
        { type: 'text', label: 'Note', value: 'Your Q1 2026 report is ready for submission. Third-party verified by Bureau Veritas under ISO 14064-3. Suitable for CDP Disclosure and CSRD compliance.' },
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home'     },
    { id: 'supply',   label: 'Supply',   icon: 'layers'   },
    { id: 'scopes',   label: 'Scopes',   icon: 'chart'    },
    { id: 'offsets',  label: 'Offsets',  icon: 'heart'    },
    { id: 'report',   label: 'Report',   icon: 'check'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for CANOPY...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');
const result = await publishMock(html, 'canopy-mock', 'CANOPY — Enterprise Carbon Intelligence · Interactive Mock');
console.log('Mock live at:', result.url);
