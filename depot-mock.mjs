// DEPOT — Svelte 5 interactive mock
// Retail-catalog dark UX for motion assets
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'DEPOT',
  tagline:   'Motion assets, shipped fresh',
  archetype: 'creative-asset-marketplace',

  palette: {              // DARK (primary)
    bg:      '#0A0908',
    surface: '#1C1915',
    text:    '#F2EDE6',
    accent:  '#FF6B1A',
    accent2: '#FFD166',
    muted:   'rgba(242,237,230,0.40)',
  },

  lightPalette: {         // LIGHT (toggle)
    bg:      '#F5F0E8',
    surface: '#FFFFFF',
    text:    '#1A1510',
    accent:  '#E85D04',
    accent2: '#B45309',
    muted:   'rgba(26,21,16,0.42)',
  },

  screens: [
    {
      id: 'storefront', label: 'Shop',
      content: [
        { type: 'metric',
          label: 'TEMPLATES IN DEPOT',
          value: '283',
          sub:   'Updated weekly · Jitter · After Effects · Lottie' },
        { type: 'tags',
          label: 'CATEGORY',
          items: ['ALL 283', 'KINETIC 74', 'DATA VIZ 31', 'TRANSITIONS 52', 'TYPE 48', 'FREE 19'] },
        { type: 'text',
          label: 'FEATURED DROP — LOT-024',
          value: 'Kinetic Type Vol.3 · 24 expression-driven type animations · $38 (was $55) · 47 of 100 licenses remaining' },
        { type: 'progress',
          items: [{ label: 'LOT-024 license stock', pct: 47 }] },
        { type: 'metric-row',
          items: [
            { label: 'TEMPLATES', value: '283' },
            { label: 'BUILDERS',  value: '12K+' },
            { label: 'RATING',    value: '4.9★' },
          ]},
      ]
    },
    {
      id: 'catalog', label: 'Catalog',
      content: [
        { type: 'metric',
          label: 'CATALOG',
          value: '283 Items',
          sub:   'Sorted by newest · All formats' },
        { type: 'list',
          items: [
            { icon: 'zap',      title: 'LOT-024 · Kinetic Type Vol.3',  sub: 'KINETIC · $38 · 47 left',    badge: 'NEW'  },
            { icon: 'chart',    title: 'LOT-023 · Data Motion Pack',     sub: 'DATA VIZ · $44 · 89 left',  badge: '4.8★' },
            { icon: 'play',     title: 'LOT-022 · Scroll Transitions',   sub: 'TRANSITIONS · $29 · 12 left',badge: '⚠'   },
            { icon: 'activity', title: 'LOT-021 · Loader Collective',    sub: 'LOADERS · $19 · ∞',          badge: '★'   },
            { icon: 'layers',   title: 'LOT-020 · Gradient Morph',       sub: 'TRANSITIONS · $33 · 61 left',badge: '4.6★' },
            { icon: 'star',     title: 'LOT-019 · Free Starter Pack',    sub: 'FREE · 8 templates',         badge: 'FREE' },
          ]},
      ]
    },
    {
      id: 'product', label: 'Detail',
      content: [
        { type: 'metric',
          label: 'LOT-024 · KINETIC TYPE',
          value: 'Kinetic Type Vol.3',
          sub:   '4.9★ from 312 ratings · By DEPOT Studio' },
        { type: 'metric-row',
          items: [
            { label: 'PRICE',    value: '$38' },
            { label: 'ORIGINAL', value: '$55' },
            { label: 'SAVE',     value: '31%' },
          ]},
        { type: 'list',
          items: [
            { icon: 'code',     title: 'FORMAT',   sub: 'Jitter · After Effects · Lottie JSON' },
            { icon: 'grid',     title: 'CONTAINS', sub: '24 animated components' },
            { icon: 'check',    title: 'LICENSE',  sub: 'Commercial · 1 seat' },
            { icon: 'calendar', title: 'UPDATED',  sub: 'March 2026' },
          ]},
        { type: 'progress',
          items: [{ label: 'LICENSES REMAINING — 47 of 100', pct: 47 }] },
        { type: 'text',
          label: 'REVIEWS',
          value: '"Exactly the expressions I needed — saved hours on a product launch." — MT, Mar 2026' },
      ]
    },
    {
      id: 'collections', label: 'Sets',
      content: [
        { type: 'metric',
          label: 'SET-001 · COMPLETE COLLECTION',
          value: 'The Full DEPOT',
          sub:   '283 assets · All formats · Lifetime updates + future drops' },
        { type: 'metric-row',
          items: [
            { label: 'PRICE',    value: '$149' },
            { label: 'ORIGINAL', value: '$344' },
            { label: 'SAVE',     value: '$195' },
          ]},
        { type: 'list',
          items: [
            { icon: 'zap',    title: 'SET-002 · Builder Essentials', sub: '7 templates · $59 (was $98)' },
            { icon: 'chart',  title: 'SET-003 · Data Viz Edition',   sub: '5 templates · $49 (was $76)' },
            { icon: 'star',   title: 'SET-004 · Type in Motion',     sub: '3 volumes · 72 animations · $79' },
            { icon: 'layers', title: 'SET-005 · Page Transitions',   sub: '4 templates · 32 transitions · $44' },
          ]},
        { type: 'text',
          label: 'FREE',
          value: 'LOT-019 · Free Starter Pack — 8 templates, no account required. Download now.' },
      ]
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric',
          label: 'MY LIBRARY',
          value: '4 Templates',
          sub:   '3 formats · Last download 2 days ago' },
        { type: 'metric-row',
          items: [
            { label: 'OWNED',   value: '4' },
            { label: 'FORMATS', value: '3' },
            { label: 'UPDATES', value: '1 !' },
          ]},
        { type: 'tags',
          label: 'FORMAT',
          items: ['ALL', 'JITTER', 'AE', 'LOTTIE'] },
        { type: 'list',
          items: [
            { icon: 'zap',    title: 'LOT-024 · Kinetic Type Vol.3', sub: 'Jitter · AE · Mar 28, 2026',    badge: 'UPDATE' },
            { icon: 'activity',title:'LOT-021 · Loader Collective',  sub: 'Jitter · Lottie · Mar 12, 2026',badge: '↓'     },
            { icon: 'star',   title: 'LOT-019 · Free Starter Pack',  sub: 'Jitter · AE · Lottie · Feb 22', badge: 'FREE'  },
            { icon: 'layers', title: 'SET-002 · Builder Essentials', sub: '7 items · Jitter · AE · Jan 5',  badge: 'BUNDLE'},
          ]},
      ]
    },
  ],

  nav: [
    { id: 'storefront',  label: 'Shop',    icon: 'home'     },
    { id: 'catalog',     label: 'Catalog', icon: 'grid'     },
    { id: 'product',     label: 'Detail',  icon: 'eye'      },
    { id: 'collections', label: 'Sets',    icon: 'layers'   },
    { id: 'library',     label: 'Library', icon: 'download' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, {
  appName: design.appName,
  tagline: design.tagline,
});
const result = await publishMock(html, 'depot-mock', 'DEPOT — Interactive Mock');
console.log('Mock live at:', result.url);
