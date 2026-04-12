import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'CARTE',
  tagline:   'Think in layers',
  archetype: 'research-notebook',

  palette: {
    bg:      '#1C1714',
    surface: '#241F1B',
    text:    '#F5EFE8',
    accent:  '#D4775A',
    accent2: '#6A9E54',
    muted:   'rgba(245,239,232,0.45)',
  },

  lightPalette: {
    bg:      '#FBF8F3',
    surface: '#FFFFFF',
    text:    '#1C1714',
    accent:  '#B85C38',
    accent2: '#4E7C3A',
    muted:   'rgba(28,23,20,0.40)',
  },

  screens: [
    {
      id: 'journal',
      label: 'Journal',
      content: [
        { type: 'metric', label: 'Day Streak', value: '12', sub: 'Keep it going' },
        { type: 'metric-row', items: [
          { label: 'Entries', value: '147' },
          { label: 'Threads', value: '23' },
          { label: 'Sources', value: '84' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'On the seriality of thought', sub: 'Philosophy · 8:43 AM', badge: '✦' },
          { icon: 'activity', title: 'Notes on distributed attention', sub: 'Research · 2h ago', badge: '70%' },
          { icon: 'layers', title: 'Marginal gains — a synthesis', sub: 'Synthesis · Yesterday', badge: '✓' },
        ]},
        { type: 'text', label: "Today's Prompt", value: 'What did you notice today that you hadn\'t expected to notice?' },
      ],
    },
    {
      id: 'new-entry',
      label: 'Write',
      content: [
        { type: 'metric', label: 'Writing Now', value: '312', sub: 'words so far' },
        { type: 'tags', label: 'Tags', items: ['Philosophy', 'Writing', 'Cognition'] },
        { type: 'text', label: 'Entry', value: 'There is a quality to the gaps between thoughts — the white space in a notebook, the pause in conversation — that we treat as absence. But absence is itself a kind of presence.' },
        { type: 'list', items: [
          { icon: 'zap', title: 'Ask CARTE to continue…', sub: 'AI writing assistant', badge: '→' },
        ]},
      ],
    },
    {
      id: 'thread',
      label: 'Threads',
      content: [
        { type: 'metric', label: 'Distributed Attention', value: '14', sub: 'notes in this thread' },
        { type: 'metric-row', items: [
          { label: 'Notes', value: '14' },
          { label: 'Sources', value: '6' },
          { label: 'Syntheses', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'The cost of switching — Mark 2004', sub: 'Note · Apr 7', badge: '✓' },
          { icon: 'star', title: 'Attention and Effort — Kahneman', sub: 'Source · Apr 6', badge: '◆' },
          { icon: 'layers', title: 'Synthesis: myth of multitasking', sub: 'Synthesis · Apr 5', badge: '✦' },
        ]},
        { type: 'progress', items: [
          { label: 'Thread completeness', pct: 72 },
          { label: 'Source coverage', pct: 88 },
        ]},
      ],
    },
    {
      id: 'synthesis',
      label: 'AI',
      content: [
        { type: 'metric', label: 'CARTE Synthesis', value: '3', sub: 'insights generated' },
        { type: 'list', items: [
          { icon: 'activity', title: 'Attention is not diminished by distribution', sub: '92% confidence', badge: '01' },
          { icon: 'alert', title: 'The 23-minute myth needs context', sub: '85% confidence', badge: '02' },
          { icon: 'eye', title: 'Calm interfaces as practical design', sub: '78% confidence', badge: '03' },
        ]},
        { type: 'progress', items: [
          { label: 'Insight 01 confidence', pct: 92 },
          { label: 'Insight 02 confidence', pct: 85 },
          { label: 'Insight 03 confidence', pct: 78 },
        ]},
        { type: 'text', label: 'Based on', value: '14 notes · 6 sources · 3 threads analysed' },
      ],
    },
    {
      id: 'export',
      label: 'Export',
      content: [
        { type: 'metric', label: 'Export Ready', value: '178', sub: 'pages to compile' },
        { type: 'tags', label: 'Format', items: ['PDF', 'Markdown', 'Notion'] },
        { type: 'list', items: [
          { icon: 'check', title: 'Journal entries', sub: '147 included', badge: '✓' },
          { icon: 'check', title: 'Research threads', sub: '23 included', badge: '✓' },
          { icon: 'check', title: 'AI syntheses', sub: '8 included', badge: '✓' },
          { icon: 'list', title: 'Source bibliography', sub: 'Not included', badge: '○' },
        ]},
        { type: 'metric-row', items: [
          { label: 'Total pages', value: '178' },
          { label: 'Sources cited', value: '84' },
        ]},
      ],
    },
  ],

  nav: [
    { id: 'journal',    label: 'Journal',  icon: 'home' },
    { id: 'new-entry',  label: 'Write',    icon: 'plus' },
    { id: 'thread',     label: 'Threads',  icon: 'layers' },
    { id: 'synthesis',  label: 'AI',       icon: 'zap' },
    { id: 'export',     label: 'Export',   icon: 'share' },
  ],
};

const svelte = generateSvelteComponent(design);
const html   = await buildMock(svelte, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'carte-mock', 'CARTE — Interactive Mock');

console.log(`Mock: ${result.status} → https://ram.zenbin.org/carte-mock`);
