/**
 * DEPOT — Motion assets, shipped fresh
 * Dark retail-catalog UX for digital motion assets
 * Inspired by: 108.supply (godly.website) — retail product catalog pattern
 * applied to digital creative goods. Lot numbers, rolling counters, inventory meters.
 * Theme: DARK — bg #0A0908 warm near-black, electric amber (#FF6B1A) accent
 */

const fs   = require('fs');
const path = require('path');

const P = {
  bg:          '#0A0908',
  bgDeep:      '#060504',
  surface:     '#141210',
  surfaceUp:   '#1C1915',
  surfaceHigh: '#242119',
  border:      'rgba(255,205,150,0.07)',
  borderUp:    'rgba(255,205,150,0.13)',
  borderAct:   'rgba(255,107,26,0.35)',
  text:        '#F2EDE6',
  textMuted:   'rgba(242,237,230,0.42)',
  textFaint:   'rgba(242,237,230,0.20)',
  accent:      '#FF6B1A',
  accentSoft:  'rgba(255,107,26,0.12)',
  accentMid:   'rgba(255,107,26,0.22)',
  accent2:     '#FFD166',
  accent2Soft: 'rgba(255,209,102,0.10)',
  green:       '#3DDC84',
  greenSoft:   'rgba(61,220,132,0.10)',
  red:         '#FF5757',
  redSoft:     'rgba(255,87,87,0.10)',
  purple:      '#C084FC',
  purpleSoft:  'rgba(192,132,252,0.10)',
  mono:        '#A89F96',
  monoFaint:   'rgba(168,159,150,0.30)',
};

const LP = {
  bg:          '#F5F0E8',
  bgDeep:      '#EDE6D8',
  surface:     '#FFFFFF',
  surfaceUp:   '#F9F5EF',
  surfaceHigh: '#EEE7DA',
  border:      'rgba(30,20,10,0.08)',
  borderUp:    'rgba(30,20,10,0.14)',
  borderAct:   'rgba(255,107,26,0.30)',
  text:        '#1A1510',
  textMuted:   'rgba(26,21,16,0.45)',
  textFaint:   'rgba(26,21,16,0.22)',
  accent:      '#E85D04',
  accentSoft:  'rgba(232,93,4,0.10)',
  accentMid:   'rgba(232,93,4,0.20)',
  accent2:     '#B45309',
  accent2Soft: 'rgba(180,83,9,0.10)',
  green:       '#1A9E5C',
  greenSoft:   'rgba(26,158,92,0.10)',
  red:         '#DC2626',
  redSoft:     'rgba(220,38,38,0.10)',
  purple:      '#7C3AED',
  purpleSoft:  'rgba(124,58,237,0.10)',
  mono:        '#8C7B6A',
  monoFaint:   'rgba(140,123,106,0.28)',
};

const pen = {
  version: '2.8',
  meta: {
    name:        'DEPOT',
    tagline:     'Motion assets, shipped fresh',
    archetype:   'creative-asset-marketplace',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    theme:       'dark',
    inspiration: '108.supply (via godly.website) — retail catalog UX applied to digital motion goods. Lot numbers, odometer counters, inventory meters, "COMPLETE COLLECTION" bundle vocabulary.',
  },
  palette:      P,
  lightPalette: LP,
  typography: {
    display:  { family: 'Helvetica Neue, system-ui', weight: 800, tracking: '-0.05em' },
    heading:  { family: 'Helvetica Neue, system-ui', weight: 700, tracking: '-0.03em' },
    mono:     { family: 'IBM Plex Mono, Courier New, monospace', weight: 400 },
    monoMed:  { family: 'IBM Plex Mono, Courier New, monospace', weight: 500 },
    body:     { family: 'Helvetica Neue, system-ui', weight: 400 },
    label:    { family: 'Helvetica Neue, system-ui', weight: 600, tracking: '0.10em', size: '9px', uppercase: true },
  },

  screens: [

    /* ─────────────────────────────────────────────────────────────────
       SCREEN 1 — STOREFRONT
       Hero counter · ticker bar · featured drop · category strip
    ──────────────────────────────────────────────────────────────────── */
    {
      id: 'storefront', label: 'Storefront',
      description: 'Landing screen — rolling template counter, ticker, featured drop, category strip',
      bgColor: '#0A0908',
      components: [

        {
          type: 'depot-topbar',
          logo: 'DEPOT',
          logoStyle: 'mono-caps',
          right: [
            { type: 'icon-btn', icon: 'search'  },
            { type: 'icon-btn', icon: 'cart', badge: '2', badgeColor: '#FF6B1A' },
          ],
          transparent: true,
        },

        {
          type: 'depot-ticker',
          items: [
            '✦ NEW: KINETIC TYPE VOL.3 — LOT-024',
            '★ FREE STARTER PACK — DOWNLOAD NOW',
            '✦ DATA MOTION PACK — 44 ANIMATIONS',
            '⊡ 4.9 / 5.0 FROM 2,400+ BUILDERS',
            '✦ NEW: KINETIC TYPE VOL.3 — LOT-024',
          ],
          speed: 'normal',
          bg:    '#141210',
          fg:    '#FFD166',
          mono:  true,
          size:  'xs',
        },

        {
          type: 'depot-counter-hero',
          eyebrow: { text: 'TEMPLATES IN DEPOT', mono: true, color: P.accent },
          counter: {
            value:    '283',
            digits:   [2, 8, 3],
            style:    'odometer',
            fontSize: 88,
            weight:   800,
            color:    '#F2EDE6',
            mono:     true,
            gap:      2,
          },
          sub:      'Updated weekly · Jitter · After Effects · Lottie JSON',
          subColor: P.textMuted,
          tagline:  'Motion tools trusted by 12,400+ designers',
          tagColor: P.textFaint,
        },

        {
          type: 'depot-category-strip',
          scrollable: true,
          gap: 6,
          items: [
            { label: 'ALL',          active: true,  count: '283' },
            { label: 'KINETIC',      active: false, count: '74'  },
            { label: 'DATA VIZ',     active: false, count: '31'  },
            { label: 'TRANSITIONS',  active: false, count: '52'  },
            { label: 'TYPE',         active: false, count: '48'  },
            { label: 'LOADERS',      active: false, count: '22'  },
            { label: 'FREE',         active: false, count: '19'  },
          ],
          style: {
            pillBg:      P.surfaceUp,
            pillText:    P.textMuted,
            activeBg:    P.accent,
            activeText:  '#0A0908',
            radius:      2,
            mono:        true,
            fontSize:    9,
            tracking:    '0.10em',
          },
        },

        {
          type: 'depot-featured-card',
          lotLabel:  'LOT-024',
          badge:     { text: 'NEW DROP',  color: '#FF6B1A', bg: P.accentSoft },
          title:     'Kinetic Type Vol.3',
          sub:       '24 expression-driven type animations for Jitter & After Effects',
          tags:      ['KINETIC', 'TYPE', 'EXPRESSIONS', 'JITTER'],
          price: {
            current:   '$38',
            original:  '$55',
            pct:       '−31%',
            saveColor: P.green,
          },
          inventory: {
            remaining: 47,
            total:     100,
            label:     '47 of 100 licenses remaining',
            urgency:   'medium',
          },
          previewFrames: [
            { bg: '#1E1A14', accentBar: '#FF6B1A', label: 'BOLD SLAM' },
            { bg: '#14120F', accentBar: '#FFD166', label: 'ELASTIC POP' },
            { bg: '#1A1711', accentBar: '#F2EDE6', label: 'GLIDE REVEAL' },
          ],
          actions: [
            { label: 'ADD TO CART', style: 'primary', accent: '#FF6B1A' },
            { label: 'PREVIEW',     style: 'ghost'   },
          ],
        },

        {
          type: 'depot-bottom-nav',
          items: [
            { id: 'storefront',  icon: 'home',     label: 'SHOP',    active: true  },
            { id: 'catalog',     icon: 'grid',     label: 'CATALOG', active: false },
            { id: 'collections', icon: 'layers',   label: 'SETS',    active: false },
            { id: 'library',     icon: 'download', label: 'LIBRARY', active: false },
          ],
          bg:     '#060504',
          border: P.border,
          mono:   true,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────────────────
       SCREEN 2 — CATALOG GRID
       2-col product cards with lot#, inventory badges, price tags
    ──────────────────────────────────────────────────────────────────── */
    {
      id: 'catalog', label: 'Catalog',
      description: '2-column product grid with lot numbers, inventory badges, price tags',
      bgColor: '#0A0908',
      components: [

        {
          type: 'depot-topbar',
          title: { text: 'CATALOG', mono: true, size: 'sm' },
          sub:   '283 ITEMS',
          left:  { icon: 'back' },
          right: [{ type: 'icon-btn', icon: 'search' }, { type: 'icon-btn', icon: 'filter' }],
          transparent: false,
          border: true,
        },

        {
          type: 'depot-sort-bar',
          activeSortId: 'newest',
          sorts: [
            { id: 'newest',   label: 'NEWEST'   },
            { id: 'popular',  label: 'POPULAR'  },
            { id: 'price-lo', label: 'PRICE ↑'  },
            { id: 'price-hi', label: 'PRICE ↓'  },
          ],
          filterLabel: 'FILTER',
          mono: true,
        },

        {
          type: 'depot-product-grid',
          columns: 2,
          items: [
            {
              lot:      'LOT-024',
              title:    'Kinetic Type Vol.3',
              cat:      'KINETIC',
              price:    '$38',
              origPrice:'$55',
              rating:   '4.9',
              inventory: { n: 47, limited: true },
              badge:    { text: 'NEW', color: '#FF6B1A' },
              preview:  { bg1: '#1E1A14', bg2: '#14120F', accent: '#FF6B1A' },
            },
            {
              lot:      'LOT-023',
              title:    'Data Motion Pack',
              cat:      'DATA VIZ',
              price:    '$44',
              rating:   '4.8',
              inventory: { n: 89, limited: false },
              badge:    null,
              preview:  { bg1: '#0E1914', bg2: '#0A1510', accent: '#3DDC84' },
            },
            {
              lot:      'LOT-022',
              title:    'Scroll Transitions',
              cat:      'TRANSITIONS',
              price:    '$29',
              rating:   '5.0',
              inventory: { n: 12, limited: true },
              badge:    { text: 'LOW STOCK', color: '#FFD166' },
              preview:  { bg1: '#180D24', bg2: '#120A1E', accent: '#C084FC' },
            },
            {
              lot:      'LOT-021',
              title:    'Loader Collective',
              cat:      'LOADERS',
              price:    '$19',
              rating:   '4.7',
              inventory: { n: 200, limited: false },
              badge:    { text: 'BESTSELLER', color: '#3DDC84' },
              preview:  { bg1: '#141414', bg2: '#0F0F0F', accent: '#F2EDE6' },
            },
            {
              lot:      'LOT-020',
              title:    'Gradient Morph',
              cat:      'TRANSITIONS',
              price:    '$33',
              rating:   '4.6',
              inventory: { n: 61, limited: false },
              badge:    null,
              preview:  { bg1: '#0C1520', bg2: '#0A1028', accent: '#60A5FA' },
            },
            {
              lot:      'LOT-019',
              title:    'Free Starter Pack',
              cat:      'FREE',
              price:    'FREE',
              priceColor: '#3DDC84',
              rating:   '4.5',
              inventory: { n: null, limited: false },
              badge:    { text: 'FREE', color: '#3DDC84' },
              preview:  { bg1: '#0D1710', bg2: '#0A1209', accent: '#3DDC84' },
            },
          ],
        },

        {
          type: 'depot-bottom-nav',
          items: [
            { id: 'storefront',  icon: 'home',     label: 'SHOP',    active: false },
            { id: 'catalog',     icon: 'grid',     label: 'CATALOG', active: true  },
            { id: 'collections', icon: 'layers',   label: 'SETS',    active: false },
            { id: 'library',     icon: 'download', label: 'LIBRARY', active: false },
          ],
          bg:     '#060504',
          border: P.border,
          mono:   true,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────────────────
       SCREEN 3 — PRODUCT DETAIL
       Full template page — preview reel, specs table, inventory meter,
       reviews, CTA
    ──────────────────────────────────────────────────────────────────── */
    {
      id: 'product-detail', label: 'Product Detail',
      description: 'Template detail — preview reel, spec table, inventory meter, reviews, CTA',
      bgColor: '#0A0908',
      components: [

        {
          type: 'depot-topbar',
          left:  { icon: 'back' },
          right: [{ type: 'icon-btn', icon: 'heart' }, { type: 'icon-btn', icon: 'share' }],
          transparent: true,
          border: false,
        },

        {
          type: 'depot-preview-reel',
          lotNumber: 'LOT-024',
          title:     'Kinetic Type Vol.3',
          badge:     { text: 'NEW', color: '#FF6B1A' },
          frames: [
            { label: 'BOLD SLAM',   bg: '#1E1A14', accent: '#FF6B1A',  active: true  },
            { label: 'ELASTIC POP', bg: '#14120F', accent: '#FFD166',  active: false },
            { label: 'GLIDE REVEAL',bg: '#1A1711', accent: '#F2EDE6',  active: false },
            { label: 'SHATTER',     bg: '#181218', accent: '#C084FC',  active: false },
          ],
          indicators: 'dots',
        },

        {
          type: 'depot-product-meta',
          lotNumber: 'LOT-024',
          category:  'KINETIC TYPE',
          title:     'Kinetic Type Vol.3',
          byline:    'By DEPOT Studio',
          rating:    { score: '4.9', count: '312', starsColor: '#FFD166' },
          price: {
            current:   '$38',
            original:  '$55',
            save:      '31% OFF',
            saveColor: '#3DDC84',
          },
        },

        {
          type: 'depot-spec-table',
          label: 'SPECIFICATIONS',
          mono: true,
          rows: [
            { k: 'FORMAT',    v: 'Jitter · After Effects · Lottie JSON' },
            { k: 'CONTAINS',  v: '24 animated components' },
            { k: 'REQUIRES',  v: 'Jitter 2.0+ or AE 2024+' },
            { k: 'LICENSE',   v: 'Commercial, 1 seat' },
            { k: 'LOT #',     v: 'LOT-024' },
            { k: 'UPDATED',   v: 'March 2026' },
          ],
        },

        {
          type: 'depot-inventory-meter',
          label:     'LICENSES REMAINING',
          current:   47,
          total:     100,
          pct:       47,
          fillColor: '#FFD166',
          bgColor:   P.surfaceUp,
          note:      '53 of 100 claimed — limited run',
          noteColor: P.textMuted,
          mono:      true,
        },

        {
          type: 'depot-cta-block',
          primary:   { label: 'ADD TO CART  $38', accent: '#FF6B1A', fg: '#0A0908' },
          secondary: { label: 'PREVIEW LIVE',     ghost: true },
          footnote:  '14-day refund policy · Instant download · Lifetime access',
          footnoteColor: P.textFaint,
        },

        {
          type: 'depot-reviews',
          overall: '4.9',
          count:   312,
          items: [
            { initials: 'MT', text: 'Exactly the expressions I needed — saved me hours on a product launch.', stars: 5, date: 'Mar 2026' },
            { initials: 'JK', text: 'Clean, variable, pairs perfectly with Framer components.', stars: 5, date: 'Feb 2026' },
          ],
          showAllLabel: 'SEE ALL 312 REVIEWS',
        },

        {
          type: 'depot-bottom-nav',
          items: [
            { id: 'storefront',  icon: 'home',     label: 'SHOP',    active: false },
            { id: 'catalog',     icon: 'grid',     label: 'CATALOG', active: true  },
            { id: 'collections', icon: 'layers',   label: 'SETS',    active: false },
            { id: 'library',     icon: 'download', label: 'LIBRARY', active: false },
          ],
          bg:     '#060504',
          border: P.border,
          mono:   true,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────────────────
       SCREEN 4 — COLLECTIONS
       Complete Collection hero + thematic set list + freebie banner
    ──────────────────────────────────────────────────────────────────── */
    {
      id: 'collections', label: 'Collections',
      description: 'Curated bundles — COMPLETE COLLECTION hero, thematic packs, freebie banner',
      bgColor: '#0A0908',
      components: [

        {
          type: 'depot-topbar',
          title: { text: 'COLLECTIONS', mono: true, size: 'sm' },
          sub:   '8 CURATED SETS',
          left:  { icon: 'back' },
          border: true,
        },

        {
          type: 'depot-collection-hero',
          badge:   { text: '✦ COMPLETE COLLECTION', color: '#FFD166', bg: 'rgba(255,209,102,0.09)', mono: true },
          lotLabel:'SET-001',
          title:   'The Full DEPOT',
          sub:     'Every template in the catalog — 283 assets, all formats, lifetime updates + future drops',
          price:   { current: '$149', original: '$344', save: 'SAVE $195', saveColor: '#3DDC84' },
          cells:   ['#FF6B1A','#FFD166','#3DDC84','#C084FC','#60A5FA','#F2EDE6','#FF5757','#A89F96'],
          cta:     { label: 'GET EVERYTHING', accent: '#FF6B1A', fg: '#0A0908' },
        },

        {
          type: 'depot-sets-label',
          text:  'THEMATIC PACKS',
          mono:  true,
          color: P.textMuted,
        },

        {
          type: 'depot-set-list',
          items: [
            {
              lot:   'SET-002',
              title: 'Builder Essentials',
              sub:   '7 must-have motion kits for product teams',
              count: '7 templates',
              price: { current: '$59', original: '$98' },
              accent: '#FF6B1A',
              cells:  ['#1E1A14','#141210','#1C1915'],
            },
            {
              lot:   'SET-003',
              title: 'Data Viz Edition',
              sub:   'Charts, counters, loaders for data-driven UIs',
              count: '5 templates · 44 animations',
              price: { current: '$49', original: '$76' },
              accent: '#3DDC84',
              cells:  ['#0E1914','#0A1510','#111A13'],
            },
            {
              lot:   'SET-004',
              title: 'Type in Motion',
              sub:   'All 3 Kinetic Type volumes — 72 animations',
              count: '3 templates · 72 animations',
              price: { current: '$79', original: '$114' },
              accent: '#FFD166',
              cells:  ['#181210','#14100E','#1C1812'],
            },
            {
              lot:   'SET-005',
              title: 'Page Transitions',
              sub:   'Scroll, swipe, morph — 32 curated transitions',
              count: '4 templates · 32 transitions',
              price: { current: '$44', original: '$62' },
              accent: '#C084FC',
              cells:  ['#0D1020','#0A0C1A','#111424'],
            },
          ],
        },

        {
          type: 'depot-freebie-banner',
          badge:  '★ FREE',
          title:  'Starter Pack · LOT-019',
          sub:    '8 templates — no account required',
          cta:    { label: 'DOWNLOAD FREE', icon: 'download' },
          bg:     'rgba(61,220,132,0.05)',
          border: 'rgba(61,220,132,0.15)',
          accent: '#3DDC84',
        },

        {
          type: 'depot-bottom-nav',
          items: [
            { id: 'storefront',  icon: 'home',     label: 'SHOP',    active: false },
            { id: 'catalog',     icon: 'grid',     label: 'CATALOG', active: false },
            { id: 'collections', icon: 'layers',   label: 'SETS',    active: true  },
            { id: 'library',     icon: 'download', label: 'LIBRARY', active: false },
          ],
          bg:     '#060504',
          border: P.border,
          mono:   true,
        },
      ],
    },

    /* ─────────────────────────────────────────────────────────────────
       SCREEN 5 — LIBRARY
       User's purchased templates — format filter, download items,
       update badge, re-download
    ──────────────────────────────────────────────────────────────────── */
    {
      id: 'library', label: 'Library',
      description: 'Personal template library — format filter, update badges, download actions',
      bgColor: '#0A0908',
      components: [

        {
          type: 'depot-topbar',
          title: { text: 'MY LIBRARY', mono: true, size: 'sm' },
          sub:   '4 TEMPLATES',
          left:  { icon: 'back' },
          right: [{ type: 'icon-btn', icon: 'settings' }],
          border: true,
        },

        {
          type: 'depot-library-stats',
          items: [
            { label: 'OWNED',   value: '4',  mono: true },
            { label: 'FORMATS', value: '3',  mono: true },
            { label: 'LAST DL', value: '2d', mono: true },
            { label: 'UPDATES', value: '1',  mono: true, alert: true, alertColor: '#FFD166' },
          ],
          bg:     P.surface,
          border: P.borderUp,
          radius: 4,
        },

        {
          type: 'depot-format-filter',
          activeId: 'all',
          items: [
            { id: 'all',    label: 'ALL'  },
            { id: 'jitter', label: 'JITTER' },
            { id: 'ae',     label: 'AE'  },
            { id: 'lottie', label: 'LOTTIE' },
          ],
          mono: true,
        },

        {
          type: 'depot-library-list',
          items: [
            {
              lot:       'LOT-024',
              title:     'Kinetic Type Vol.3',
              formats:   ['Jitter', 'AE'],
              acquired:  'Mar 28, 2026',
              hasUpdate: true,
              updateLabel:'v1.1 available',
              updateColor:'#FFD166',
              actions:   ['DOWNLOAD', 'CHANGELOG'],
              preview:   { bg: '#1E1A14', accent: '#FF6B1A' },
            },
            {
              lot:       'LOT-021',
              title:     'Loader Collective',
              formats:   ['Jitter', 'Lottie'],
              acquired:  'Mar 12, 2026',
              hasUpdate: false,
              actions:   ['DOWNLOAD'],
              preview:   { bg: '#141414', accent: '#F2EDE6' },
            },
            {
              lot:       'LOT-019',
              title:     'Free Starter Pack',
              formats:   ['Jitter', 'AE', 'Lottie'],
              acquired:  'Feb 22, 2026',
              hasUpdate: false,
              badge:     { text: 'FREE', color: '#3DDC84' },
              actions:   ['DOWNLOAD'],
              preview:   { bg: '#0D1710', accent: '#3DDC84' },
            },
            {
              lot:       'SET-002',
              title:     'Builder Essentials',
              formats:   ['Jitter', 'AE', 'Lottie'],
              acquired:  'Jan 5, 2026',
              hasUpdate: false,
              badge:     { text: 'BUNDLE', color: '#FF6B1A' },
              isBundle:  true,
              bundleCount: 7,
              actions:   ['DOWNLOAD ALL', 'CONTENTS'],
              preview:   { bg: '#1A1815', accent: '#FF6B1A', multi: true },
            },
          ],
        },

        {
          type: 'depot-library-footer',
          text:  'All purchases are permanent · Re-download any time',
          link:  { label: 'BROWSE CATALOG →', target: 'catalog' },
          mono:  true,
          color: P.textFaint,
        },

        {
          type: 'depot-bottom-nav',
          items: [
            { id: 'storefront',  icon: 'home',     label: 'SHOP',    active: false },
            { id: 'catalog',     icon: 'grid',     label: 'CATALOG', active: false },
            { id: 'collections', icon: 'layers',   label: 'SETS',    active: false },
            { id: 'library',     icon: 'download', label: 'LIBRARY', active: true  },
          ],
          bg:     '#060504',
          border: P.border,
          mono:   true,
        },
      ],
    },

  ], // end screens
};

const outPath = path.join(__dirname, 'depot.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ depot.pen written — ${kb} KB`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(' · ')}`);
