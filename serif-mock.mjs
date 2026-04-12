#!/usr/bin/env node
// SERIF — Svelte Interactive Mock
// Brand intelligence, typeset beautifully

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const SLUG = 'serif';

const design = {
  appName:   'SERIF',
  tagline:   'Brand intelligence, typeset beautifully',
  archetype: 'brand-intelligence',
  palette: {
    // Dark mode
    bg:      '#0E0C0A',
    surface: '#191714',
    text:    '#F0EAE0',
    accent:  '#C94B2A',
    accent2: '#4A7FA5',
    muted:   'rgba(240,234,224,0.40)',
  },
  lightPalette: {
    // Light mode — primary (warm editorial paper)
    bg:      '#F2EDE4',
    surface: '#FAF7F2',
    text:    '#0D0B09',
    accent:  '#B83A1E',
    accent2: '#24507A',
    muted:   'rgba(13,11,9,0.42)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'BRAND SCORE', value: '87', sub: '+6 pts vs Q4 2025' },
        { type: 'metric-row', items: [
          { label: 'ASSETS LIVE', value: '218' },
          { label: 'OPEN ISSUES', value: '59' },
          { label: 'CHANNELS', value: '7' }
        ]},
        { type: 'progress', items: [
          { label: 'VISUAL CONSISTENCY', pct: 91 },
          { label: 'TONE OF VOICE',      pct: 84 },
          { label: 'MARKET RECOGNITION', pct: 78 },
          { label: 'DIGITAL COHESION',   pct: 88 },
          { label: 'ASSET COMPLIANCE',   pct: 95 },
          { label: 'CAMPAIGN RECALL',    pct: 72 }
        ]},
        { type: 'text', label: 'REF: BRD-0001', value: 'QUARTERLY REVIEW — Q1 2026. Overall brand health at record high. Visual consistency leads all dimensions.' },
      ],
    },
    {
      id: 'assets', label: 'Assets',
      content: [
        { type: 'metric', label: 'TOTAL ASSETS', value: '218', sub: '+14 this week' },
        { type: 'list', items: [
          { icon: 'layers', title: 'Primary Wordmark',      sub: 'REF: LOG-0001 · v4.0 · 1,204 uses',  badge: '✓' },
          { icon: 'layers', title: 'Icon Mark — Reversed',  sub: 'REF: LOG-0004 · v2.1 · 387 uses',    badge: '✓' },
          { icon: 'eye',    title: 'Primary Palette',       sub: 'REF: COL-0001 · v3.0 · 4,511 uses',  badge: '✓' },
          { icon: 'star',   title: 'Display Typeface',      sub: 'REF: TYP-0001 · v1.5 · REVIEW',      badge: '!' },
          { icon: 'play',   title: 'Transition System',     sub: 'REF: MOT-0003 · v1.0 · 156 uses',    badge: '✓' },
          { icon: 'list',   title: 'Business Card',         sub: 'REF: PRT-0011 · v2.0 · 43 uses',     badge: '✓' }
        ]},
        { type: 'tags', label: 'FILTER BY TYPE', items: ['ALL', 'LOGO', 'COLOUR', 'TYPE', 'MOTION', 'PRINT'] },
      ],
    },
    {
      id: 'channels', label: 'Channels',
      content: [
        { type: 'metric-row', items: [
          { label: 'AUDITED', value: '7' },
          { label: 'ISSUES', value: '59' },
          { label: 'AVG SCORE', value: '82%' }
        ]},
        { type: 'progress', items: [
          { label: 'WEBSITE',         pct: 94 },
          { label: 'EMAIL / COMMS',   pct: 91 },
          { label: 'SOCIAL — IG',     pct: 88 },
          { label: 'PRINT / OOH',     pct: 83 },
          { label: 'SOCIAL — LI',     pct: 76 },
          { label: 'EVENTS / DECK',   pct: 79 },
          { label: 'PARTNER / CO-MK', pct: 64 }
        ]},
        { type: 'text', label: 'REF: INS-0034 · KEY FINDING', value: 'PARTNER CO-MARKETING at 64% — critical threshold. Implement asset lock on REF: LOG-0001 for all external campaigns.' },
      ],
    },
    {
      id: 'identity', label: 'Identity',
      content: [
        { type: 'text', label: 'DISPLAY — DM SERIF DISPLAY / 52pt', value: 'Bold Thinking As A Basis' },
        { type: 'text', label: 'BODY — DM SANS / 14pt / 1.6 leading', value: 'We never settle for a brief if we detect other opportunities.' },
        { type: 'text', label: 'MONO — IBM PLEX MONO / 11pt', value: 'REF: BRD-0001 · v3.2 · COMPLIANCE 91%' },
        { type: 'list', items: [
          { icon: 'heart', title: 'PRIMARY · #B83A1E',   sub: 'REF: COL-0001 · CTAs, Accent, Alert', badge: '' },
          { icon: 'heart', title: 'INK · #0D0B09',       sub: 'REF: COL-0002 · Body text, Headers',  badge: '' },
          { icon: 'heart', title: 'PAPER · #F2EDE4',     sub: 'REF: COL-0003 · Background, Canvas',  badge: '' },
          { icon: 'heart', title: 'BLUE · #24507A',      sub: 'REF: COL-0004 · Links, Secondary CTA',badge: '' },
        ]},
      ],
    },
    {
      id: 'reports', label: 'Reports',
      content: [
        { type: 'metric-row', items: [
          { label: 'BRAND SCORE', value: '87' },
          { label: 'ISSUES', value: '59' },
          { label: 'ASSETS', value: '218' }
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'VISUAL CONSISTENCY REACHES NEW HIGH',    sub: 'REF: FND-0041 · 91% compliance — highest on record', badge: '▲' },
          { icon: 'alert', title: 'PARTNER CHANNEL CRITICAL THRESHOLD',     sub: 'REF: FND-0042 · 64% compliance · 21 flagged instances', badge: '!' },
          { icon: 'alert', title: 'LINKEDIN DECLINING — ACTION REQUIRED',   sub: 'REF: FND-0043 · Dropped 4pts · Tone guide refresh needed', badge: '▼' },
        ]},
        { type: 'list', items: [
          { icon: 'calendar', title: 'Lock partner asset pack to v3.2', sub: 'REF: ACT-0021 · Brand Ops · APR 2', badge: '' },
          { icon: 'calendar', title: 'LinkedIn tone audit (12 posts)',   sub: 'REF: ACT-0022 · Content · APR 4',   badge: '' },
          { icon: 'calendar', title: 'Type system v1.5 review sign-off', sub: 'REF: ACT-0023 · Design Lead · APR 6', badge: '' },
        ]},
        { type: 'text', label: 'WK 13 · MAR 30, 2026', value: 'Brand Intelligence Digest — week of record consistency score. 59 issues resolved, 14 new assets added.' },
      ],
    },
  ],
  nav: [
    { id: 'overview',  label: 'Overview',  icon: 'chart' },
    { id: 'assets',    label: 'Assets',    icon: 'layers' },
    { id: 'channels',  label: 'Channels',  icon: 'grid' },
    { id: 'identity',  label: 'Identity',  icon: 'eye' },
    { id: 'reports',   label: 'Reports',   icon: 'list' },
  ],
};

try {
  const svelteSource = generateSvelteComponent(design);
  const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
  const result = await publishMock(html, `${SLUG}-mock`, `${design.appName} — Interactive Mock`);
  console.log('Mock live at:', result.url);
} catch (err) {
  console.error('Mock build error:', err.message);
  process.exit(1);
}
