import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'ACTA',
  tagline: 'Creative sprint velocity for studios',
  archetype: 'studio-sprint-tracker',
  palette: {
    bg:      '#070A10',
    surface: '#161C2C',
    text:    '#EEF0FF',
    accent:  '#4B6CF7',
    accent2: '#7C5AF7',
    muted:   'rgba(139,150,180,0.4)',
  },
  lightPalette: {
    bg:      '#F0F2FF',
    surface: '#FFFFFF',
    text:    '#0D1233',
    accent:  '#3B5CF6',
    accent2: '#6A4AF5',
    muted:   'rgba(13,18,51,0.4)',
  },
  screens: [
    {
      id: 'acts', label: 'Acts Overview',
      content: [
        { type: 'metric', label: 'Active Acts', value: '3', sub: 'Across 3 clients' },
        { type: 'metric-row', items: [{ label: 'Sprints Running', value: '3' }, { label: 'Tasks Open', value: '34' }, { label: 'Due This Week', value: '7' }] },
        { type: 'list', items: [
          { icon: 'zap', title: 'Brand Identity Overhaul', sub: 'Meridian Co. · Sprint 3/5 · 58%', badge: 'LIVE' },
          { icon: 'alert', title: 'Mobile App Launch', sub: 'Crestline Digital · Sprint 1/4 · 22%', badge: 'RISK' },
          { icon: 'check', title: 'Campaign Assets Q2', sub: 'Novo Group · Sprint 4/4 · 91%', badge: '91%' },
        ]},
        { type: 'tags', label: 'Status', items: ['Live', 'At Risk', 'On Track', 'Pending'] },
      ],
    },
    {
      id: 'active', label: 'Active Act',
      content: [
        { type: 'metric', label: 'Act 01 — Brand Identity', value: 'Sprint 3', sub: '7 days remaining · Execution phase' },
        { type: 'progress', items: [
          { label: 'Overall completion', pct: 58 },
          { label: 'Sprint 3 progress', pct: 45 },
        ]},
        { type: 'list', items: [
          { icon: 'eye', title: 'Primary wordmark vector', sub: 'JL · In Review', badge: '⊙' },
          { icon: 'alert', title: 'Color system documentation', sub: 'MK · Open', badge: '○' },
          { icon: 'star', title: 'Type specimen sheet', sub: 'JL · Open', badge: '○' },
          { icon: 'layers', title: 'Icon grid system', sub: 'MK · In Review', badge: '⊙' },
        ]},
        { type: 'metric-row', items: [{ label: 'Open', value: '12' }, { label: 'Review', value: '4' }, { label: 'Done', value: '18' }] },
      ],
    },
    {
      id: 'brief', label: 'Creative Brief',
      content: [
        { type: 'metric', label: 'Act 01 Objective', value: 'Brand Identity Overhaul', sub: 'Complete visual rebrand for Meridian Co. — identity to full asset library' },
        { type: 'list', items: [
          { icon: 'check', title: 'Wordmark + lockup variations', sub: 'Primary deliverable', badge: '1' },
          { icon: 'check', title: 'Brand color system (12 tokens)', sub: 'Design token export', badge: '2' },
          { icon: 'check', title: 'Typography specimen', sub: 'Type system document', badge: '3' },
          { icon: 'check', title: 'Icon set (48 glyphs)', sub: 'SVG + Lottie', badge: '4' },
        ]},
        { type: 'tags', label: 'Tone', items: ['Modern', 'Premium', 'Minimal', 'Trustworthy', 'Bold'] },
        { type: 'metric-row', items: [{ label: 'Budget', value: '$18.4K' }, { label: 'Timeline', value: '6 wks' }, { label: 'Rounds', value: '2 max' }] },
      ],
    },
    {
      id: 'team', label: 'Team Pulse',
      content: [
        { type: 'metric', label: 'Team Status', value: '3 Working', sub: '4 members total · Live tracking' },
        { type: 'list', items: [
          { icon: 'user', title: 'Jordan Lee', sub: 'Wordmark refinement v4 · 2h 14m', badge: '●' },
          { icon: 'user', title: 'Maya Kim', sub: 'Color palette docs · 45m', badge: '●' },
          { icon: 'user', title: 'Raj Singh', sub: 'Icon animation tests · Away', badge: '○' },
          { icon: 'user', title: 'Priya Tan', sub: 'Act 02 brief review · 1h 8m', badge: '●' },
        ]},
        { type: 'metric-row', items: [{ label: 'Act 01', value: '3' }, { label: 'Act 02', value: '2' }, { label: 'Act 03', value: '1' }] },
      ],
    },
    {
      id: 'timeline', label: 'Act Timeline',
      content: [
        { type: 'metric', label: 'Act 01 Arc', value: 'Mar 17 – Apr 28', sub: '42 days total · Sprint 3 of 5 active' },
        { type: 'progress', items: [
          { label: 'Discovery', pct: 100 },
          { label: 'Concepts', pct: 100 },
          { label: 'Execution (Now)', pct: 55 },
          { label: 'Refinement', pct: 0 },
          { label: 'Delivery', pct: 0 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'Wordmark approved', sub: 'Apr 4', badge: '✓' },
          { icon: 'zap', title: 'Color system locked', sub: 'Apr 11 · Due', badge: '→' },
          { icon: 'calendar', title: 'Full system review', sub: 'Apr 20', badge: '○' },
          { icon: 'star', title: 'Client delivery', sub: 'Apr 28', badge: '○' },
        ]},
      ],
    },
    {
      id: 'deliver', label: 'Deliver & Handoff',
      content: [
        { type: 'metric', label: 'Act 03 — Ready to Ship', value: '91% Done', sub: '1 item pending before delivery' },
        { type: 'progress', items: [{ label: 'Handoff completion', pct: 91 }] },
        { type: 'list', items: [
          { icon: 'check', title: 'Final files exported', sub: '.AI, .SVG, .PNG', badge: '✓' },
          { icon: 'check', title: 'Brand guidelines PDF (v3)', sub: 'Document complete', badge: '✓' },
          { icon: 'check', title: 'Font licenses attached', sub: 'All typefaces cleared', badge: '✓' },
          { icon: 'check', title: 'CSS variables exported', sub: 'Design tokens', badge: '✓' },
          { icon: 'check', title: 'Icon set (48 glyphs)', sub: 'SVG + Lottie', badge: '✓' },
          { icon: 'zap', title: 'Lottie animations', sub: 'In progress', badge: '…' },
          { icon: 'play', title: 'Client walkthrough video', sub: 'Pending', badge: '○' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'acts',     label: 'Acts',    icon: 'grid' },
    { id: 'active',   label: 'Active',  icon: 'zap' },
    { id: 'team',     label: 'Team',    icon: 'user' },
    { id: 'deliver',  label: 'Files',   icon: 'layers' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'acta-mock', 'ACTA — Interactive Mock');
console.log('Mock live at:', result.url);
