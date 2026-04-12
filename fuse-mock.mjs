/**
 * FUSE — Svelte Interactive Mock
 */
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FUSE',
  tagline:   'Motion templates for obsessive creators',
  archetype: 'creative-marketplace-dark',
  palette: {
    bg:      '#090909',
    surface: '#181818',
    text:    '#F0EBE2',
    accent:  '#CDFF47',
    accent2: '#8B6EFF',
    muted:   'rgba(240,235,226,0.38)',
  },
  lightPalette: {
    bg:      '#F5F3EE',
    surface: '#FFFFFF',
    text:    '#0E0D0A',
    accent:  '#6B9B00',
    accent2: '#5B3FCC',
    muted:   'rgba(14,13,10,0.42)',
  },
  screens: [
    {
      id: 'browse', label: 'Browse',
      content: [
        { type: 'text', label: 'New this week', value: '14 fresh templates dropped. Jitter, Framer, and AE formats.' },
        { type: 'metric-row', items: [
          { label: 'Templates', value: '247' },
          { label: 'Creators', value: '84' },
          { label: 'Downloads', value: '12K' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Carousel', 'Stack', 'Sequence', 'Grid', 'Reveal', 'Loop', 'Scroll'] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Depth Carousel', sub: 'by Mika Ono · 2,441 uses', badge: 'FREE' },
          { icon: 'layers', title: 'Magnetic Stack', sub: 'by Leon Haas · 1,872 uses', badge: 'PRO' },
          { icon: 'grid', title: 'Reveal Sequence', sub: 'by Ana Torres · 3,107 uses', badge: 'FREE' },
          { icon: 'activity', title: 'Noise Grid', sub: 'by Yuki Ando · 912 uses', badge: 'PRO' },
        ]},
      ],
    },
    {
      id: 'trending', label: 'Trending',
      content: [
        { type: 'metric', label: 'Most Used This Week', value: 'Depth Carousel', sub: 'Carousel · 2,441 downloads · +340%' },
        { type: 'progress', items: [
          { label: 'Depth Carousel', pct: 91 },
          { label: 'Reveal Sequence', pct: 87 },
          { label: 'Magnetic Stack', pct: 74 },
          { label: 'Liquid Stack', pct: 62 },
          { label: 'Pan & Scale', pct: 54 },
        ]},
        { type: 'metric-row', items: [
          { label: 'Trending↑', value: '+34%' },
          { label: 'New Today', value: '8' },
          { label: 'Top Format', value: 'Jitter' },
        ]},
      ],
    },
    {
      id: 'detail', label: 'Detail',
      content: [
        { type: 'metric', label: 'Depth Carousel', value: '4.8 ★', sub: 'by Mika Ono · 2,441 uses · Carousel' },
        { type: 'metric-row', items: [
          { label: 'Downloads', value: '2.4K' },
          { label: 'Saves', value: '891' },
          { label: 'Rating', value: '4.8' },
        ]},
        { type: 'text', label: 'Description', value: 'Depth-layered carousel with perspective distortion and elastic spring physics. 8 variants with full Jitter source files. Built for obsessively smooth scroll interactions.' },
        { type: 'tags', label: 'Compatible with', items: ['Jitter', 'Framer', 'After Effects', 'Rive'] },
        { type: 'list', items: [
          { icon: 'check', title: '8 template variants', sub: 'Carousel, Swipe, Stack, Peek, Full, Fade, Blur, Elastic' },
          { icon: 'check', title: 'Jitter source included', sub: 'Fully editable, annotated layers' },
          { icon: 'check', title: 'Framer component', sub: 'Drop-in ready, props exposed' },
        ]},
      ],
    },
    {
      id: 'saved', label: 'Saved',
      content: [
        { type: 'metric-row', items: [
          { label: 'Saved', value: '6' },
          { label: 'Collections', value: '2' },
          { label: 'Downloads', value: '14' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'Depth Carousel', sub: 'Saved today · FREE', badge: '↓' },
          { icon: 'star', title: 'Magnetic Stack', sub: 'Yesterday · PRO', badge: '↓' },
          { icon: 'star', title: 'Reveal Sequence', sub: 'Mar 24 · FREE', badge: '↓' },
          { icon: 'star', title: 'Noise Grid', sub: 'Mar 22 · PRO', badge: '↓' },
          { icon: 'star', title: 'Liquid Stack', sub: 'Mar 21 · FREE', badge: '↓' },
        ]},
      ],
    },
    {
      id: 'profile', label: 'Profile',
      content: [
        { type: 'metric', label: 'Mika Ono', value: '12.4K', sub: 'total uses · 14 templates published · ✦ Creator Pro' },
        { type: 'metric-row', items: [
          { label: 'Published', value: '14' },
          { label: 'Total Uses', value: '12.4K' },
          { label: 'Earned', value: '$2,840' },
        ]},
        { type: 'progress', items: [
          { label: 'Depth Carousel', pct: 91 },
          { label: 'Depth Loop', pct: 74 },
          { label: 'Stack Echo', pct: 58 },
          { label: 'Grid Flow', pct: 44 },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'Creator Pro', sub: 'Active · 70% revenue share', badge: '✓' },
          { icon: 'bell', title: 'Notifications', sub: 'Download + review alerts' },
          { icon: 'settings', title: 'Settings', sub: 'Account, payout, tools' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'browse',   label: 'Browse',   icon: 'grid' },
    { id: 'trending', label: 'Trending', icon: 'zap' },
    { id: 'detail',   label: 'Detail',   icon: 'layers' },
    { id: 'saved',    label: 'Saved',    icon: 'star' },
    { id: 'profile',  label: 'Profile',  icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'fuse-mock', 'FUSE — Interactive Mock');
console.log('Mock live at:', result.url);
