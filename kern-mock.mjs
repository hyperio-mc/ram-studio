// kern-mock.mjs — Kern Svelte 5 interactive mock
// Dark theme: deep-black violet+teal knowledge tool
// RAM Design Heartbeat — 2026-03-28

import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName: 'Kern',
  tagline: 'Read deep. Think wider.',
  archetype: 'knowledge-tool',
  palette: {               // primary dark theme
    bg:      '#0C0C10',
    surface: '#131318',
    text:    '#E8E4F0',
    accent:  '#9B7EC8',
    accent2: '#3ECFCF',
    muted:   'rgba(200,192,228,0.45)',
  },
  lightPalette: {          // light fallback
    bg:      '#F5F4F8',
    surface: '#FFFFFF',
    text:    '#1A1820',
    accent:  '#6B4E9A',
    accent2: '#1AAFAF',
    muted:   'rgba(26,24,32,0.45)',
  },
  screens: [
    {
      id: 'home', label: 'Home',
      content: [
        { type: 'metric', label: '🔥 Reading Streak', value: '14', sub: 'days in a row' },
        { type: 'metric-row', items: [
          { label: 'Highlights', value: '127' },
          { label: 'AI Links', value: '27' },
          { label: 'Retention', value: '91%' },
        ]},
        { type: 'text', label: 'AI Resurfaced', value: '"The map is not the territory" — your Korzybski highlight now links to 3 notes on LLM hallucination.' },
        { type: 'list', items: [
          { icon: 'eye', title: 'Effectiveness of RNNs', sub: 'karpathy.github.io · 0%', badge: 'AI' },
          { icon: 'star', title: "Against Metrics — Goodhart's Law", sub: 'aeon.co · 62%', badge: '●' },
          { icon: 'check', title: 'How to Read a Book (Adler)', sub: 'Book · Annotated · 100%', badge: '✓' },
        ]},
      ],
    },
    {
      id: 'reader', label: 'Reader',
      content: [
        { type: 'text', label: 'Reading Progress', value: '38% complete — The Unreasonable Effectiveness of RNNs' },
        { type: 'text', label: 'Active Highlight', value: '"...the results were so immediately interesting, I felt compelled to investigate them further."' },
        { type: 'text', label: '◈ Kern Connection', value: 'Connected to "Wonder as epistemic signal" from 3 days ago — both explore curiosity as navigational signal.' },
        { type: 'list', items: [
          { icon: 'star', title: 'Highlight saved', sub: 'Added to Epistemology cluster', badge: '↑' },
          { icon: 'activity', title: 'New connection found', sub: 'Links to Goodhart\'s Law note', badge: '◈' },
        ]},
      ],
    },
    {
      id: 'highlights', label: 'Highlights',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total', value: '127' },
          { label: 'Connected', value: '43' },
          { label: 'Orphaned', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: '"The map is not the territory"', sub: 'Against Metrics — Aeon · 3 connections', badge: '3' },
          { icon: 'zap', title: '"Wonder is an epistemic signal"', sub: 'Personal note · 2 connections', badge: '2' },
          { icon: 'star', title: '"Spaced rep is a discipline of attention"', sub: 'How to Read a Book · 1 connection', badge: '1' },
        ]},
        { type: 'tags', label: 'Active Clusters', items: ['Epistemology', 'LLMs', 'Memory', 'Attention'] },
      ],
    },
    {
      id: 'graph', label: 'Graph',
      content: [
        { type: 'metric-row', items: [
          { label: 'Concepts', value: '14' },
          { label: 'Links', value: '27' },
          { label: 'Orphans', value: '3' },
        ]},
        { type: 'text', label: 'Selected Node', value: 'Epistemology — 8 highlights, 5 connections, 3 orphaned notes. Largest node in your graph.' },
        { type: 'progress', items: [
          { label: 'Epistemology', pct: 80 },
          { label: 'LLMs', pct: 65 },
          { label: 'Wonder', pct: 45 },
          { label: 'Memory', pct: 38 },
          { label: 'Models & Maps', pct: 30 },
        ]},
        { type: 'tags', label: 'Clusters', items: ['Epistemology', 'LLMs', 'RNNs', 'Wonder', 'Memory', 'Attention'] },
      ],
    },
    {
      id: 'review', label: 'Review',
      content: [
        { type: 'metric-row', items: [
          { label: 'Due Today', value: '5' },
          { label: 'Reviewed', value: '2' },
          { label: 'Streak', value: '14d' },
        ]},
        { type: 'progress', items: [{ label: 'Session Progress', pct: 40 }] },
        { type: 'text', label: 'Current Card', value: '"The map is not the territory. The word is not the thing it represents." — Korzybski' },
        { type: 'text', label: '◈ Kern Connection', value: "Aligns with your 3 highlights on Goodhart's Law — all explore how representations diverge from reality." },
        { type: 'metric-row', items: [
          { label: 'Again', value: '↺' },
          { label: 'Hard', value: '⚡' },
          { label: 'Good', value: '✓' },
          { label: 'Easy', value: '★' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'home',      label: 'Home',   icon: 'home'     },
    { id: 'reader',    label: 'Read',   icon: 'eye'      },
    { id: 'highlights',label: 'Notes',  icon: 'star'     },
    { id: 'graph',     label: 'Graph',  icon: 'activity' },
    { id: 'review',    label: 'Review', icon: 'zap'      },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'kern-mock', 'Kern — Interactive Mock');
console.log('Mock live at:', result.url);
