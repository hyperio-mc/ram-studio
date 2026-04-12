import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CACHE',
  tagline:   'pull reference. build vision.',
  archetype: 'design-tool-creative',
  palette: {
    bg:      '#0A0A0E',
    surface: '#141418',
    text:    '#F4F0E8',
    accent:  '#7C5CF6',
    accent2: '#F7913A',
    muted:   'rgba(244,240,232,0.45)',
  },
  lightPalette: {
    bg:      '#F7F5F2',
    surface: '#FFFFFF',
    text:    '#141418',
    accent:  '#6B46F5',
    accent2: '#E8800A',
    muted:   'rgba(20,20,24,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Today\'s Pulls', value: '12', sub: 'across 4 collections' },
        { type: 'metric-row', items: [
          { label: 'Branding', value: '47' },
          { label: 'Type', value: '31' },
          { label: 'Motion', value: '18' },
        ]},
        { type: 'tags', label: 'Quick Access', items: ['Branding', 'Type', 'Motion', 'Editorial', 'UI/UX', 'Product'] },
        { type: 'text', label: 'Featured Pull', value: 'Cactus Club identity system — restrained luxury through negative space' },
        { type: 'list', items: [
          { icon: 'star', title: 'Acid Sans specimen', sub: 'Branding · 30m ago', badge: '↗' },
          { icon: 'play', title: 'Scroll transition reel', sub: 'Motion · 1h ago', badge: '↗' },
          { icon: 'eye', title: 'Kinfolk vol.52 spreads', sub: 'Editorial · 3h ago', badge: '↗' },
        ]},
      ],
    },
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'Branding', 'Type', 'Motion', 'Editorial'] },
        { type: 'text', label: 'Trending', value: 'Top references pulled by designers in your network this week' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Acid Sans type specimen', sub: 'Branding', badge: '1.2k' },
          { icon: 'zap', title: 'Display clash: Canela + Neue Haas', sub: 'Type', badge: '847' },
          { icon: 'play', title: 'Scroll-driven text reveal', sub: 'Motion', badge: '622' },
          { icon: 'heart', title: 'Printed Matter 2025 covers', sub: 'Editorial', badge: '1.1k' },
          { icon: 'grid', title: 'Glass morphism 2.0', sub: 'UI/UX', badge: '389' },
        ]},
        { type: 'progress', items: [
          { label: 'Branding', pct: 68 },
          { label: 'Type', pct: 52 },
          { label: 'Motion', pct: 41 },
        ]},
      ],
    },
    {
      id: 'pull-detail', label: 'Pull',
      content: [
        { type: 'metric', label: 'Cactus Club — Identity', value: 'Branding', sub: 'Saved 2h ago via Muzli' },
        { type: 'tags', label: 'Tags', items: ['identity', 'luxury', 'negative space', 'wordmark', 'sans-serif'] },
        { type: 'text', label: 'Notes', value: 'The restraint here is what makes it work. No decorative elements — the logo is just Helvetica kerned to perfection.' },
        { type: 'list', items: [
          { icon: 'eye', title: '847 views in network', sub: 'High engagement', badge: '↑' },
          { icon: 'layers', title: 'Similar: Byredo identity', sub: 'Branding', badge: '→' },
          { icon: 'star', title: 'Similar: Aesop rebrand 2024', sub: 'Branding', badge: '→' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Saves', value: '214' },
          { label: 'Shares', value: '38' },
        ]},
      ],
    },
    {
      id: 'collection', label: 'Collections',
      content: [
        { type: 'metric', label: 'DARK BRAND REFS', value: '47', sub: 'pulls · updated 2h ago' },
        { type: 'metric-row', items: [
          { label: 'Branding', value: '28' },
          { label: 'Type', value: '12' },
          { label: 'Other', value: '7' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'DARK BRAND REFS', sub: '47 pulls · Branding', badge: '→' },
          { icon: 'zap', title: 'TYPE EXPERIMENTS', sub: '31 pulls · Type', badge: '→' },
          { icon: 'play', title: 'MOTION INSPO', sub: '18 pulls · Motion', badge: '→' },
          { icon: 'eye', title: 'EDITORIAL ARCHIVE', sub: '24 pulls · Editorial', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'DARK BRAND REFS', pct: 62 },
          { label: 'TYPE EXPERIMENTS', pct: 41 },
          { label: 'MOTION INSPO', pct: 24 },
        ]},
      ],
    },
    {
      id: 'add-pull', label: 'Add Pull',
      content: [
        { type: 'text', label: 'New Pull', value: 'Drop a URL or paste an image to pull reference into your cache' },
        { type: 'metric', label: 'Detected', value: 'Cactus Club rebrand', sub: 'via Muzli · Brand identity' },
        { type: 'tags', label: 'Tags Added', items: ['identity', 'luxury', 'negative space'] },
        { type: 'list', items: [
          { icon: 'check', title: 'DARK BRAND REFS', sub: '47 pulls · selected', badge: '●' },
          { icon: 'layers', title: 'TYPE EXPERIMENTS', sub: '31 pulls', badge: '○' },
          { icon: 'layers', title: 'MOTION INSPO', sub: '18 pulls', badge: '○' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Collection', value: '1' },
          { label: 'Tags', value: '3' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Maya Kurosawa', value: '847', sub: 'total pulls this year' },
        { type: 'metric-row', items: [
          { label: 'Collections', value: '12' },
          { label: 'Following', value: '38' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'DARK BRAND REFS', sub: '47 pulls · 2h ago', badge: '→' },
          { icon: 'zap', title: 'TYPE EXPERIMENTS', sub: '31 pulls · 1d ago', badge: '→' },
          { icon: 'play', title: 'MOTION INSPO', sub: '18 pulls · 3d ago', badge: '→' },
        ]},
        { type: 'progress', items: [
          { label: 'Branding', pct: 72 },
          { label: 'Type', pct: 58 },
          { label: 'Motion', pct: 34 },
          { label: 'Editorial', pct: 45 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',       label: 'Home',   icon: 'home' },
    { id: 'discover',   label: 'Find',   icon: 'search' },
    { id: 'add-pull',   label: 'Pull',   icon: 'plus' },
    { id: 'collection', label: 'Cache',  icon: 'layers' },
    { id: 'profile',    label: 'Profile',icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'cache-mock', 'CACHE — Interactive Mock');
console.log('Mock live at:', result.url);
