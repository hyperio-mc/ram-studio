import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'SPLICE',
  tagline: 'Motion Design Review',
  archetype: 'productivity',
  palette: {
    bg:      '#0B0C0F',
    surface: '#12141A',
    text:    '#F0F0F2',
    accent:  '#00B2FF',
    accent2: '#F0FF50',
    muted:   'rgba(136,146,170,0.6)',
  },
  lightPalette: {
    bg:      '#F5F7FA',
    surface: '#FFFFFF',
    text:    '#0F1117',
    accent:  '#0090CC',
    accent2: '#C0A800',
    muted:   'rgba(15,17,23,0.45)',
  },
  screens: [
    {
      id: 'projects',
      label: 'Projects',
      content: [
        { type: 'metric-row', items: [
          { label: 'Active', value: '4' },
          { label: 'In Review', value: '2' },
          { label: 'Approved', value: '1' },
        ]},
        { type: 'list', items: [
          { icon: 'play', title: 'Brand Refresh — Hero', sub: 'Neon Studio · In Review · 180f', badge: 'REVIEW' },
          { icon: 'play', title: 'Product Launch Loop', sub: 'Orchard Labs · Approved · 360f', badge: 'DONE' },
          { icon: 'play', title: 'Social Kit — Reels', sub: 'Vast.space · In Review · 90f', badge: 'REVIEW' },
          { icon: 'play', title: 'Explainer — V3', sub: 'Parity Systems · Drafting · 540f', badge: 'DRAFT' },
        ]},
        { type: 'progress', items: [
          { label: 'Brand Refresh Hero', pct: 65 },
          { label: 'Product Launch Loop', pct: 100 },
          { label: 'Social Kit Reels', pct: 40 },
          { label: 'Explainer V3', pct: 20 },
        ]},
      ],
    },
    {
      id: 'review',
      label: 'Review',
      content: [
        { type: 'metric-row', items: [
          { label: 'Version', value: 'v4' },
          { label: 'Frames', value: '180' },
          { label: 'Duration', value: '0:06' },
        ]},
        { type: 'text', label: 'Brand Refresh — Hero', value: 'Neon Studio · In Review · 3 annotations open · Frame 72 of 180' },
        { type: 'list', items: [
          { icon: 'message', title: 'Annotation 1 · Frame 32', sub: 'Mara K — Transition feels abrupt here', badge: 'Open' },
          { icon: 'message', title: 'Annotation 2 · Frame 54', sub: 'Juno T — Logo entrance is clean ✓', badge: 'Done' },
          { icon: 'message', title: 'Annotation 3 · Frame 72', sub: 'Alex P — Grid shift feels off-brand', badge: 'Open' },
        ]},
        { type: 'progress', items: [
          { label: 'Review progress', pct: 40 },
          { label: 'Annotations resolved', pct: 33 },
        ]},
      ],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      content: [
        { type: 'metric-row', items: [
          { label: 'Frame', value: '72' },
          { label: 'Total', value: '180' },
          { label: 'FPS', value: '24' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'Logo Mark', sub: 'Shape · Frames 0–180 · 2 keyframes', badge: 'VIS' },
          { icon: 'layers', title: 'Headline Text', sub: 'Text · Frames 20–160 · 2 keyframes', badge: 'VIS' },
          { icon: 'layers', title: 'Background Grid', sub: 'Shape · Frames 0–180 · Locked', badge: 'LOCK' },
          { icon: 'layers', title: 'Noise Overlay', sub: 'FX · Frames 0–180 · Hidden', badge: 'HID' },
          { icon: 'layers', title: 'Camera Pan', sub: 'Camera · Frames 40–140', badge: 'VIS' },
        ]},
        { type: 'progress', items: [
          { label: 'Playhead position', pct: 40 },
        ]},
      ],
    },
    {
      id: 'feedback',
      label: 'Feedback',
      content: [
        { type: 'metric-row', items: [
          { label: 'Open', value: '5' },
          { label: 'Resolved', value: '3' },
          { label: 'Mine', value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'chat', title: 'Frame 32 · Mara Kowalski', sub: 'Transition feels abrupt — spring ease?', badge: 'Open' },
          { icon: 'chat', title: 'Frame 72 · Alex Petrov', sub: 'Grid alignment off by 4px', badge: 'Open' },
          { icon: 'chat', title: 'Frame 54 · Juno Tran', sub: 'Logo entrance is perfect ✓', badge: 'Done' },
          { icon: 'chat', title: 'Frame 108 · Sam Liu', sub: 'Background should be darker charcoal', badge: 'Open' },
        ]},
        { type: 'tags', label: 'Filters', items: ['All (8)', 'Open (5)', 'Mine (2)', 'Resolved (3)'] },
      ],
    },
    {
      id: 'assets',
      label: 'Assets',
      content: [
        { type: 'metric-row', items: [
          { label: 'Colors', value: '9' },
          { label: 'Fonts', value: '3' },
          { label: 'Motions', value: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'circle', title: 'TWK Lausanne · 800', sub: 'Display headings · Brand font', badge: 'Font' },
          { icon: 'circle', title: 'Inter Variable · 400–700', sub: 'Body + UI', badge: 'Font' },
          { icon: 'circle', title: 'Spring Bounce · 0.4s', sub: 'spring(1,80,10,0)', badge: 'Ease' },
          { icon: 'circle', title: 'Ease In Expo · 0.6s', sub: 'cubic-bezier(.9,0,1,1)', badge: 'Ease' },
        ]},
        { type: 'tags', label: 'Asset Types', items: ['All', 'Colors', 'Fonts', 'Motions', 'Sounds'] },
      ],
    },
    {
      id: 'team',
      label: 'Team',
      content: [
        { type: 'metric-row', items: [
          { label: 'Members', value: '5' },
          { label: 'Projects', value: '12' },
          { label: 'Storage', value: '4.2GB' },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Alex Petrov', sub: 'Creative Lead · online · 4 projects', badge: 'Lead' },
          { icon: 'user', title: 'Mara Kowalski', sub: 'Art Director · online · 3 projects', badge: '' },
          { icon: 'user', title: 'Juno Tran', sub: 'Motion Designer · idle · 5 projects', badge: '' },
          { icon: 'user', title: 'Sam Liu', sub: 'Client Contact · offline · 2 projects', badge: '' },
          { icon: 'user', title: 'Priya Nair', sub: 'Designer · online · 3 projects', badge: '' },
        ]},
        { type: 'progress', items: [
          { label: 'Storage (4.2 of 10 GB)', pct: 42 },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'projects',  label: 'Projects',  icon: '▣' },
    { id: 'review',    label: 'Review',     icon: '▶' },
    { id: 'timeline',  label: 'Timeline',   icon: '⊟' },
    { id: 'assets',    label: 'Assets',     icon: '◈' },
    { id: 'team',      label: 'Team',       icon: '◉' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'splice-mock', 'SPLICE — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/splice-mock`);
