// folio-mock.mjs — Svelte interactive mock for FOLIO

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'FOLIO',
  tagline:   'Content intelligence for editorial teams',
  archetype: 'editorial-analytics',

  palette: {
    // Dark interpretation (unused in light app but required by builder)
    bg:      '#1C1510',
    surface: '#261E17',
    text:    '#F6F3EE',
    accent:  '#B85C38',
    accent2: '#3D6B8E',
    muted:   'rgba(246,243,238,0.40)',
  },
  lightPalette: {
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1C1510',
    accent:  '#B85C38',
    accent2: '#3D6B8E',
    muted:   'rgba(28,21,16,0.40)',
  },

  screens: [
    {
      id: 'pulse', label: 'Pulse',
      content: [
        { type: 'text',   label: 'Issue No. 47  ·  April 2026', value: '' },
        { type: 'metric', label: 'Health Score', value: '94', sub: '+3 pts this week' },
        { type: 'metric-row', items: [
          { label: 'Avg Read', value: '4:23' },
          { label: 'Full Reads', value: '38%' },
          { label: 'Signals', value: '7' },
        ]},
        { type: 'tags', label: 'Status', items: ['+18% readers', '12 published', 'A− grade'] },
        { type: 'list', items: [
          { icon: 'star', title: 'REF–0041', sub: 'The quiet revolution in ambient computing', badge: '97' },
          { icon: 'star', title: 'REF–0038', sub: 'Five design systems worth studying in 2026', badge: '91' },
          { icon: 'alert', title: 'REF–0035', sub: 'What happens when AI writes the brief?', badge: '84' },
        ]},
        { type: 'text', label: 'Signal Alert', value: '7 articles need attention — readability, pacing, SEO issues detected.' },
      ],
    },
    {
      id: 'articles', label: 'Articles',
      content: [
        { type: 'text',  label: 'Article Catalog — 148 total', value: '' },
        { type: 'tags', label: 'Filter', items: ['All 148', 'Flagged 7', 'Top 25', 'This Week'] },
        { type: 'list', items: [
          { icon: 'check', title: 'REF–0041', sub: 'The quiet revolution in ambient computing — 12.4K reads', badge: '97' },
          { icon: 'check', title: 'REF–0040', sub: 'Notes from the edge of machine perception — 8.1K reads', badge: '93' },
          { icon: 'check', title: 'REF–0039', sub: 'Against the tyranny of perfectly readable prose', badge: '88' },
          { icon: 'check', title: 'REF–0038', sub: 'Five design systems worth studying in 2026 — 9.8K', badge: '91' },
          { icon: 'alert', title: 'REF–0037', sub: 'How newsletters learned to compete with search', badge: '76' },
          { icon: 'alert', title: 'REF–0036', sub: 'Building in public: a one-year retrospective', badge: '82' },
          { icon: 'alert', title: 'REF–0034', sub: 'Spatial computing for the rest of us — 2.1K', badge: '61' },
        ]},
      ],
    },
    {
      id: 'clarity', label: 'Clarity',
      content: [
        { type: 'text', label: 'REF–0041', value: 'The quiet revolution in ambient computing' },
        { type: 'metric', label: 'Editorial Grade', value: 'A−', sub: 'Publish-ready · minor pacing note' },
        { type: 'progress', items: [
          { label: 'Readability Grade',   pct: 94 },
          { label: 'Sentence Variance',   pct: 78 },
          { label: 'Vocabulary Richness', pct: 91 },
          { label: 'Structural Clarity',  pct: 88 },
          { label: 'Passive Voice Rate',  pct: 15 },
        ]},
        { type: 'text', label: 'Pacing', value: 'Section-by-section: Intro 70% · Act I 90% · Act II 55% · Act III 85% · Close 40%' },
        { type: 'text', label: '⚠ Act II Drop-off', value: 'Readers leave between sections 2–3 at 52% above average. Consider a visual pull-quote.' },
      ],
    },
    {
      id: 'audience', label: 'Audience',
      content: [
        { type: 'metric', label: 'Unique Readers (30d)', value: '47,320', sub: '+18% vs last period' },
        { type: 'metric-row', items: [
          { label: 'Full Read',  value: '38%' },
          { label: 'Deep Read', value: '27%' },
          { label: 'Skimmers',  value: '14%' },
        ]},
        { type: 'progress', items: [
          { label: 'Full read (>80%)',    pct: 38 },
          { label: 'Deep read (50–80%)', pct: 27 },
          { label: 'Mid read (25–50%)',  pct: 21 },
          { label: 'Skim (<25%)',         pct: 14 },
        ]},
        { type: 'list', items: [
          { icon: 'user', title: 'Design & Product', sub: 'Largest segment', badge: '34%' },
          { icon: 'code', title: 'Engineering',      sub: 'Growing +8%',     badge: '28%' },
          { icon: 'star', title: 'Founders',         sub: 'High full-read',  badge: '19%' },
          { icon: 'heart', title: 'Writers & Editors', sub: 'Most loyal',    badge: '12%' },
        ]},
      ],
    },
    {
      id: 'signals', label: 'Signals',
      content: [
        { type: 'metric-row', items: [
          { label: 'Urgent',  value: '2' },
          { label: 'Medium',  value: '3' },
          { label: 'Low',     value: '2' },
        ]},
        { type: 'list', items: [
          { icon: 'alert', title: 'REF–0037 · URGENT · SEO',         sub: 'Missing meta description — est. 12% click loss', badge: '!' },
          { icon: 'alert', title: 'REF–0034 · URGENT · READABILITY', sub: 'Flesch 38 — grade 16, target is grade 9–11',     badge: '!' },
          { icon: 'alert', title: 'REF–0036 · MEDIUM · PACING',      sub: 'Act II drop-off at 52% above average',           badge: '⚠' },
          { icon: 'alert', title: 'REF–0035 · MEDIUM · HEADLINE',    sub: 'CTR 1.8% vs 4.2% average — sharpen the hook',   badge: '⚠' },
          { icon: 'check', title: 'REF–0032 · LOW · FRESHNESS',      sub: 'Stats are 18 months stale — update for evergreen', badge: '↻' },
        ]},
        { type: 'text', label: 'Next up', value: 'After fixing urgent items, health score will rise to ~97.' },
      ],
    },
  ],

  nav: [
    { id: 'pulse',    label: 'Pulse',    icon: 'activity' },
    { id: 'articles', label: 'Articles', icon: 'list'     },
    { id: 'clarity',  label: 'Clarity',  icon: 'eye'      },
    { id: 'audience', label: 'Audience', icon: 'user'     },
    { id: 'signals',  label: 'Signals',  icon: 'alert'    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'folio-editorial-mock', 'FOLIO — Interactive Mock');
console.log('Mock live at:', result.url);
