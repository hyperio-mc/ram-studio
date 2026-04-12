import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'AURA',
  tagline:   'Design Trend Intelligence',
  archetype: 'design-intelligence',
  palette: {
    bg:      '#0C0A14',
    surface: '#14111F',
    text:    '#E8E4F8',
    accent:  '#9B7FF8',
    accent2: '#F09060',
    muted:   'rgba(232,228,248,0.4)',
  },
  lightPalette: {
    bg:      '#FAF8F4',
    surface: '#FFFFFF',
    text:    '#1A1714',
    accent:  '#7B5CF0',
    accent2: '#F07840',
    muted:   'rgba(26,23,20,0.45)',
  },
  screens: [
    {
      id: 'trends',
      label: 'Trends',
      content: [
        { type: 'metric', label: 'Aurora Mesh Gradients', value: '↑ Rising', sub: 'Seen on Orbi, Champions For Good — aurora glow across dark & light' },
        { type: 'metric-row', items: [
          { label: 'Sites tracked', value: '2,847' },
          { label: 'New this week', value: '134' },
          { label: 'Trend shifts', value: '↑ 12' },
        ]},
        { type: 'list', items: [
          { icon: 'zap',    title: 'Editorial Type Scale',   sub: 'Oversized letterforms as hero visuals',     badge: '+23%' },
          { icon: 'layers', title: 'Aurora Mesh Gradients',  sub: 'Multi-color blob gradients on any bg',      badge: '+19%' },
          { icon: 'eye',    title: 'Product UI as Hero',     sub: 'SaaS dark interfaces in hero sections',     badge: '+18%' },
          { icon: 'star',   title: '3D Floating Objects',    sub: 'Sculptural objects on white/dark',           badge: '+14%' },
          { icon: 'chart',  title: 'Y2K / Retro OS Revival', sub: 'Pixel art & OS metaphors trending',         badge: '+11%' },
        ]},
        { type: 'tags', label: 'Sources monitored', items: ['Awwwards', 'Minimal Gallery', 'Dark Mode Design', 'Land-book'] },
      ],
    },
    {
      id: 'explore',
      label: 'Explore',
      content: [
        { type: 'text', label: 'Discover', value: 'Browse patterns, sites, and interaction design across the curated web.' },
        { type: 'tags', label: 'Categories', items: ['All', 'AI', 'Typography', 'Dark Mode', 'Gradients', 'Minimal', 'SaaS', '3D', 'Y2K'] },
        { type: 'list', items: [
          { icon: 'eye',    title: 'Orbi Studio',       sub: 'Aurora gradient hero · SOTD March 2026',    badge: '↗' },
          { icon: 'layers', title: 'KOMETA Typefaces',  sub: 'Type foundry · bold specimen letterforms',  badge: '↗' },
          { icon: 'grid',   title: 'Retro OS by Chus',  sub: 'Pixel art OS aesthetic · Y2K revival',      badge: '↗' },
          { icon: 'chart',  title: 'Old Tom Capital',   sub: 'Dark editorial photography · finance',      badge: '↗' },
        ]},
        { type: 'progress', items: [
          { label: 'Hover arrow reveal', pct: 78 },
          { label: 'Aurora glow effect', pct: 64 },
          { label: 'Type as hero visual', pct: 59 },
          { label: 'Product UI as hero', pct: 55 },
        ]},
      ],
    },
    {
      id: 'saved',
      label: 'Saved',
      content: [
        { type: 'metric', label: 'Your Library', value: '5 saved', sub: 'Bookmarked trends, sites, and color stories' },
        { type: 'list', items: [
          { icon: 'star', title: 'Aurora Mesh on Dark',     sub: 'Dark Mode Design · March 2026',    badge: '★' },
          { icon: 'star', title: 'KOMETA Type Foundry',     sub: 'Minimal Gallery · April 2026',     badge: '★' },
          { icon: 'star', title: 'Editorial Whitespace',    sub: 'Minimal Gallery · April 2026',     badge: '★' },
          { icon: 'star', title: 'Retro OS Aesthetic',      sub: 'Minimal Gallery · March 2026',     badge: '★' },
          { icon: 'star', title: 'Product UI Hero Pattern', sub: 'Dark Mode Design · April 2026',    badge: '★' },
        ]},
        { type: 'tags', label: 'Your tags', items: ['Gradient', 'Dark UI', 'Typography', 'Y2K', 'Minimal', 'SaaS'] },
      ],
    },
    {
      id: 'colors',
      label: 'Colors',
      content: [
        { type: 'metric', label: 'Palette of the Week', value: 'Aurora · 2026', sub: '★ 2,411 saves — Violet · Orchid · Amber · Gold · Mint' },
        { type: 'metric-row', items: [
          { label: 'Violet',  value: '#7B5CF0' },
          { label: 'Orchid',  value: '#E0508F' },
          { label: 'Amber',   value: '#F07840' },
        ]},
        { type: 'list', items: [
          { icon: 'grid', title: 'Purples & Violets', sub: '124 palettes · #7B5CF0 family', badge: '→' },
          { icon: 'grid', title: 'Warm Ambers',       sub: '98 palettes  · #F07840 family', badge: '→' },
          { icon: 'grid', title: 'Aurora Greens',     sub: '76 palettes  · #2DB87A family', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'Warm cream & near-black', pct: 82 },
          { label: 'Aurora violet + orange',  pct: 74 },
          { label: 'Pure black backgrounds',  pct: 68 },
          { label: 'Y2K primaries',           pct: 42 },
        ]},
        { type: 'text', label: 'WCAG Contrast', value: 'All featured palettes pass AAA contrast for body text. Warm cream #FAF8F4 on #1A1714 achieves 16.8:1 ratio.' },
      ],
    },
    {
      id: 'spotlight',
      label: 'Spotlight',
      content: [
        { type: 'metric', label: 'Site Spotlight', value: 'Orbi Studio', sub: 'Design & Technology Studio · SOTD March 2026 · Awwwards' },
        { type: 'tags', label: 'Tags', items: ['Aurora UI', 'Dark Mode', 'Motion Design', 'SOTD', 'Agency'] },
        { type: 'list', items: [
          { icon: 'layers', title: 'Typography',    sub: 'Custom display + Neue Haas Unica', badge: '✓' },
          { icon: 'grid',   title: 'Color Palette', sub: '#1A0A2E + Aurora gradient overlay', badge: '✓' },
          { icon: 'zap',    title: 'Key Pattern',   sub: 'Mesh gradient blob composition',   badge: '✓' },
          { icon: 'eye',    title: 'Animation',     sub: 'Subtle parallax, gradient shift',  badge: '✓' },
        ]},
        { type: 'text', label: 'Why it works', value: 'Orbi layers 4+ gradient colors organically — violet, orchid, ember, arctic — creating depth without rigidity. The aurora aesthetic feels alive rather than designed.' },
        { type: 'metric-row', items: [
          { label: 'Score', value: '9.4/10' },
          { label: 'Jury', value: '100%' },
          { label: 'Dev', value: 'SOTD' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'trends',    label: 'Trends',    icon: 'zap'    },
    { id: 'explore',   label: 'Explore',   icon: 'search' },
    { id: 'saved',     label: 'Saved',     icon: 'star'   },
    { id: 'colors',    label: 'Colors',    icon: 'grid'   },
    { id: 'spotlight', label: 'Spotlight', icon: 'eye'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'aura-mock', 'AURA — Interactive Mock');
console.log('Mock live at:', result.url);
