import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LUX',
  tagline:   'Your creative portfolio studio',
  archetype: 'portfolio-studio',
  palette: {
    bg:      '#1A1620',
    surface: '#242030',
    text:    '#F0EDE8',
    accent:  '#6B5CE7',
    accent2: '#E74C85',
    muted:   'rgba(240,237,232,0.4)',
  },
  lightPalette: {
    bg:      '#F3F0EA',
    surface: 'rgba(255,255,255,0.88)',
    text:    '#17131D',
    accent:  '#6B5CE7',
    accent2: '#E74C85',
    muted:   'rgba(23,19,29,0.42)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: 'Featured Project', value: 'Nova Health', sub: 'Brand Identity · 14 assets' },
        { type: 'metric-row', items: [
          { label: 'Views', value: '2.4K' },
          { label: 'Projects', value: '48' },
          { label: 'Followers', value: '12K' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Pulse App', sub: 'UI Design · 2.4K views', badge: '●' },
          { icon: 'layers', title: '3D Titles', sub: 'Motion · 1.8K views', badge: '●' },
          { icon: 'heart', title: 'Bloom Co.', sub: 'Branding · 4.1K views', badge: '✓' },
        ]},
        { type: 'tags', label: 'Categories', items: ['UI/UX', 'Motion', 'Branding', 'Web', '3D'] },
      ],
    },
    {
      id: 'project', label: 'Project',
      content: [
        { type: 'metric', label: 'Nova Health Rebrand', value: 'Brand Identity', sub: 'Q1 2025 · 3 months · Active' },
        { type: 'metric-row', items: [
          { label: 'Assets', value: '14' },
          { label: 'Revisions', value: '3' },
          { label: 'Views', value: '2.4K' },
        ]},
        { type: 'progress', items: [
          { label: 'Research', pct: 100 },
          { label: 'Identity', pct: 90 },
          { label: 'UI Kit', pct: 70 },
          { label: 'Motion', pct: 40 },
        ]},
        { type: 'text', label: 'Description', value: 'Complete visual identity overhaul — logo system, UI component kit, motion guidelines, and full brand manual.' },
      ],
    },
    {
      id: 'share', label: 'Share',
      content: [
        { type: 'metric', label: 'Share Link', value: 'lux.io/z/nXb94a2', sub: 'Public — anyone with link can view' },
        { type: 'list', items: [
          { icon: 'share', title: 'Dribbble', sub: 'Post to portfolio feed', badge: '→' },
          { icon: 'share', title: 'Behance', sub: 'Sync project case study', badge: '→' },
          { icon: 'share', title: 'LinkedIn', sub: 'Share to network', badge: '→' },
        ]},
        { type: 'tags', label: 'Options', items: ['Public', 'Password', 'Draft', 'Archived'] },
      ],
    },
    {
      id: 'explore', label: 'Explore',
      content: [
        { type: 'metric', label: 'Creator of the Week', value: 'Maya Rivera', sub: 'Visual Director · São Paulo · 12.4K followers' },
        { type: 'list', items: [
          { icon: 'eye', title: 'Organic UI System', sub: 'J. Park · 892 likes', badge: '♡' },
          { icon: 'eye', title: 'Type in Motion', sub: 'A. Reyes · 1.2K likes', badge: '♡' },
          { icon: 'eye', title: 'Glassmorphism Kit', sub: 'S. Chen · 3.4K likes', badge: '★' },
        ]},
        { type: 'tags', label: 'Trending', items: ['Trending', 'UI/UX', 'Motion', 'Branding'] },
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Zara Kim', value: 'Visual Designer', sub: 'Seoul · Visual Creator since 2019' },
        { type: 'metric-row', items: [
          { label: 'Projects', value: '48' },
          { label: 'Followers', value: '12.4K' },
          { label: 'Following', value: '3.2K' },
        ]},
        { type: 'list', items: [
          { icon: 'grid', title: 'Nova Health', sub: 'Brand Identity · 2025', badge: '✓' },
          { icon: 'grid', title: 'Pulse App', sub: 'UI Design · 2024', badge: '✓' },
          { icon: 'grid', title: 'Bloom Co.', sub: 'Branding · 2024', badge: '✓' },
        ]},
        { type: 'progress', items: [
          { label: 'UI/UX', pct: 90 },
          { label: 'Branding', pct: 75 },
          { label: 'Motion', pct: 60 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',    label: 'Home',    icon: 'home' },
    { id: 'project', label: 'Work',    icon: 'layers' },
    { id: 'share',   label: 'Share',   icon: 'share' },
    { id: 'explore', label: 'Explore', icon: 'search' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lux-mock', 'LUX — Interactive Mock');
console.log('Mock live at:', result.url);
