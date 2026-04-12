// stratum-mock.mjs — Svelte 5 interactive mock for STRATUM

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'STRATUM',
  tagline:   'AI-Powered Design System Intelligence',
  archetype: 'studio',
  palette: {
    bg:      '#0F0F12',
    surface: '#1E1E22',
    text:    '#F0F0F4',
    accent:  '#B4FF4C',
    accent2: '#9D7FFF',
    muted:   'rgba(92,92,110,0.7)',
  },
  screens: [
    {
      id: 'tokens', label: 'Token Library',
      content: [
        { type: 'metric', label: 'Total Tokens', value: '187', sub: 'Across 8 categories · 98% valid' },
        { type: 'metric-row', items: [
          { label: 'Color', value: '42' },
          { label: 'Spacing', value: '18' },
          { label: 'Type', value: '24' },
        ]},
        { type: 'list', items: [
          { icon: 'eye',   title: '--color-accent',   sub: '#B4FF4C · color',      badge: 'valid' },
          { icon: 'eye',   title: '--color-bg',       sub: '#0F0F12 · color',      badge: 'valid' },
          { icon: 'eye',   title: '--color-fg',       sub: '#F0F0F4 · color',      badge: 'valid' },
          { icon: 'layers',title: '--space-md',       sub: '16px · spacing',       badge: 'valid' },
          { icon: 'layers',title: '--space-sm',       sub: '8px · spacing',        badge: 'valid' },
          { icon: 'code',  title: '--text-heading',   sub: '18px/700 · typography',badge: 'valid' },
        ]},
        { type: 'tags', label: 'Categories', items: ['Color', 'Spacing', 'Typography', 'Shadow', 'Border', 'Motion'] },
      ],
    },
    {
      id: 'audit', label: 'Component Audit',
      content: [
        { type: 'metric-row', items: [
          { label: 'Healthy', value: '7' },
          { label: 'Warning', value: '3' },
          { label: 'Critical', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Button',    sub: '412 uses · 0 issues',  badge: '97 Healthy' },
          { icon: 'alert', title: 'Card',      sub: '238 uses · 3 issues',  badge: '81 Warning' },
          { icon: 'check', title: 'Input',     sub: '156 uses · 1 issue',   badge: '94 Healthy' },
          { icon: 'alert', title: 'Modal',     sub: '89 uses · 7 issues',   badge: '52 Critical'},
          { icon: 'check', title: 'Badge',     sub: '334 uses · 0 issues',  badge: '99 Healthy' },
          { icon: 'alert', title: 'Dropdown',  sub: '102 uses · 4 issues',  badge: '76 Warning' },
          { icon: 'alert', title: 'DataTable', sub: '67 uses · 11 issues',  badge: '43 Critical'},
        ]},
        { type: 'progress', items: [
          { label: 'Button health', pct: 97 },
          { label: 'Card health', pct: 81 },
          { label: 'Input health', pct: 94 },
          { label: 'Modal health', pct: 52 },
          { label: 'Badge health', pct: 99 },
        ]},
      ],
    },
    {
      id: 'history', label: 'Change History',
      content: [
        { type: 'metric', label: 'Current Version', value: 'v3.2.1', sub: '38 total releases on main' },
        { type: 'list', items: [
          { icon: 'check', title: 'v3.2.1 patch',  sub: 'Today 14:32 · maya.k',  badge: 'PATCH' },
          { icon: 'zap',   title: 'v3.2.0 minor',  sub: 'Yesterday · alex.t',    badge: 'MINOR' },
          { icon: 'star',  title: 'v3.1.5 patch',  sub: 'Mar 19 · ram.ai',       badge: 'AI' },
          { icon: 'zap',   title: 'v3.1.0 minor',  sub: 'Mar 15 · sarah.m',      badge: 'MINOR' },
          { icon: 'alert', title: 'v3.0.0 MAJOR',  sub: 'Mar 01 · alex.t',       badge: 'MAJOR' },
          { icon: 'check', title: 'v2.9.2 patch',  sub: 'Feb 24 · maya.k',       badge: 'PATCH' },
        ]},
        { type: 'text', label: 'Latest change', value: 'Button: fix focus ring opacity · Token --space-xs corrected to 4px · Badge accessibility audit pass' },
      ],
    },
    {
      id: 'deps', label: 'Dep Map',
      content: [
        { type: 'metric-row', items: [
          { label: 'Nodes', value: '13' },
          { label: 'Deps', value: '16' },
          { label: 'Cycles', value: '0' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Tokens (Core)',     sub: '12 dependants',      badge: 'CORE' },
          { icon: 'grid',   title: 'Button',            sub: 'depends on Tokens',  badge: 'COMPOSITE' },
          { icon: 'grid',   title: 'Input',             sub: 'depends on Tokens',  badge: 'COMPOSITE' },
          { icon: 'grid',   title: 'Badge',             sub: 'depends on Tokens',  badge: 'COMPOSITE' },
          { icon: 'map',    title: 'Form (Page)',       sub: 'depends on Button, Input', badge: 'PAGE' },
          { icon: 'map',    title: 'Modal (Page)',      sub: 'depends on Button',  badge: 'PAGE' },
        ]},
        { type: 'text', label: 'No circular deps', value: 'Dependency graph is acyclic. All 13 component nodes resolve cleanly to the central Tokens hub.' },
      ],
    },
    {
      id: 'ai', label: 'AI Insights',
      content: [
        { type: 'metric', label: 'AI Recommendations', value: '6', sub: 'Scanned 2 min ago · 3 quick wins' },
        { type: 'list', items: [
          { icon: 'zap',   title: 'Merge duplicate spacing tokens', sub: '4 tokens resolve to 8px — HIGH impact',      badge: 'HIGH' },
          { icon: 'alert', title: 'Fix low-contrast Badge text',    sub: 'WCAG AA fails at 3.2:1 — HIGH impact',       badge: 'HIGH' },
          { icon: 'star',  title: 'Unify border-radius scale',      sub: '6 values in use — standardize to 4/8/12/24', badge: 'MED' },
          { icon: 'zap',   title: 'DataTable: add mobile variant',  sub: '67 usages on small screens',                 badge: 'HIGH' },
          { icon: 'check', title: 'Remove 34 unused icon exports',  sub: 'Saves ~12KB from bundle',                    badge: 'MED' },
          { icon: 'check', title: 'Standardize focus ring token',   sub: '3 different colors — centralize',            badge: 'MED' },
        ]},
        { type: 'progress', items: [
          { label: 'Token consistency', pct: 88 },
          { label: 'A11y compliance', pct: 74 },
          { label: 'Performance score', pct: 91 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'tokens',  label: 'Tokens',  icon: 'layers' },
    { id: 'audit',   label: 'Audit',   icon: 'check' },
    { id: 'history', label: 'History', icon: 'activity' },
    { id: 'deps',    label: 'Deps',    icon: 'grid' },
    { id: 'ai',      label: 'AI',      icon: 'zap' },
  ],
};

const svelteSource = generateSvelteComponent(design);
console.log('Building Svelte 5 mock for STRATUM...');
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
console.log('Compiled:', Math.round(html.length / 1024) + 'KB');

// Delete old mock slot first if needed
import https from 'https';
await new Promise((resolve) => {
  const req = https.request({
    hostname: 'zenbin.org', path: '/v1/pages/stratum-mock', method: 'DELETE',
    headers: { 'X-Subdomain': 'ram' }
  }, res => { res.resume(); res.on('end', resolve); });
  req.end();
});

const result = await publishMock(html, 'stratum-mock', 'STRATUM — Interactive Mock');
console.log('Mock live at:', result.url);
console.log('Status:', result.status);
