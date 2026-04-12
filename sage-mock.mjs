import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'SAGE',
  tagline:   'Research intelligence, distilled',
  archetype: 'ai-research',
  palette: {           // DARK theme
    bg:      '#171714',
    surface: '#21211D',
    text:    '#E8E5DC',
    accent:  '#6BA882',
    accent2: '#E0A55A',
    muted:   'rgba(232,229,220,0.38)',
  },
  lightPalette: {      // LIGHT theme — warm parchment (primary design)
    bg:      '#F6F3EE',
    surface: '#FFFFFF',
    text:    '#1A1916',
    accent:  '#4B7A5E',
    accent2: '#C4853A',
    muted:   'rgba(26,25,22,0.42)',
  },
  screens: [
    {
      id: 'discover', label: 'Discover',
      content: [
        { type: 'metric', label: 'Active Research', value: '4', sub: 'Threads in progress this week' },
        { type: 'metric-row', items: [
          { label: 'Sources', value: '56' },
          { label: 'Notes', value: '12' },
          { label: 'Topics', value: '4' },
        ]},
        { type: 'tags', label: 'Popular Topics', items: ['Climate tech', 'LLM evals', 'Biotech', 'Markets', 'AI Safety'] },
        { type: 'list', items: [
          { icon: 'search', title: 'Constitutional AI training', sub: '14 sources · 12m ago', badge: 'AI' },
          { icon: 'search', title: 'Rust vs Go API services', sub: '9 sources · 2h ago', badge: 'Eng' },
          { icon: 'search', title: 'Mediterranean diet meta-analysis', sub: '22 sources · Yesterday', badge: 'Health' },
          { icon: 'search', title: 'Lithium reserves — Fermi estimation', sub: '11 sources · 3d ago', badge: 'Science' },
        ]},
      ],
    },
    {
      id: 'research', label: 'Research',
      content: [
        { type: 'metric', label: 'Confidence Score', value: '94%', sub: 'Based on 14 peer-reviewed sources' },
        { type: 'metric-row', items: [
          { label: 'Papers', value: '8' },
          { label: 'Docs', value: '4' },
          { label: 'Reviews', value: '2' },
        ]},
        { type: 'text', label: 'Synthesis', value: 'Constitutional AI trains models to be helpful, harmless, and honest by having them critique and revise their own outputs against a written "constitution" of principles. The key insight: instead of relying solely on human feedback for harmful outputs, the AI learns to self-identify and correct problematic responses.' },
        { type: 'list', items: [
          { icon: 'eye', title: 'arxiv.org', sub: 'Constitutional AI: Harmlessness from AI Feedback', badge: '98%' },
          { icon: 'eye', title: 'anthropic.com', sub: "Claude's Constitution — Official Docs", badge: '95%' },
          { icon: 'eye', title: 'nature.com', sub: 'Value alignment in LLMs: systematic review', badge: '88%' },
          { icon: 'eye', title: 'openai.com', sub: 'RLHF: Aligning language models', badge: '82%' },
        ]},
        { type: 'tags', label: 'Dig Deeper', items: ['How is the constitution written?', 'CAI vs RLHF results', 'Real-world failures'] },
      ],
    },
    {
      id: 'sources', label: 'Sources',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Sources', value: '14' },
          { label: 'Citations', value: '5.2K' },
          { label: 'Avg Rel.', value: '87%' },
        ]},
        { type: 'list', items: [
          { icon: 'star', title: 'arxiv.org — Constitutional AI', sub: '2022 · 1,840 citations · Primary', badge: '98%' },
          { icon: 'star', title: "anthropic.com — Claude's Constitution", sub: '2023 · Official docs · Primary', badge: '95%' },
          { icon: 'check', title: 'nature.com — Value Alignment Review', sub: '2024 · 342 citations · Review', badge: '88%' },
          { icon: 'check', title: 'openai.com — RLHF Alignment Paper', sub: '2022 · 2,910 citations · Paper', badge: '82%' },
          { icon: 'check', title: 'deepmind.com — Scalable Oversight', sub: '2024 · 189 citations · Paper', badge: '74%' },
        ]},
        { type: 'progress', items: [
          { label: 'AI / ML', pct: 72 },
          { label: 'Safety & Alignment', pct: 58 },
          { label: 'Empirical Studies', pct: 44 },
        ]},
      ],
    },
    {
      id: 'library', label: 'Library',
      content: [
        { type: 'metric-row', items: [
          { label: 'Collections', value: '2' },
          { label: 'Threads', value: '20' },
          { label: 'Notes', value: '12' },
        ]},
        { type: 'list', items: [
          { icon: 'layers', title: 'AI Safety & Alignment', sub: '12 threads · Updated today', badge: '12' },
          { icon: 'layers', title: 'Engineering Deep Dives', sub: '8 threads · Updated yesterday', badge: '8' },
        ]},
        { type: 'list', items: [
          { icon: 'search', title: 'Constitutional AI: a deep synthesis', sub: '14 sources · 12m ago', badge: '★' },
          { icon: 'search', title: 'Rust async runtime internals', sub: '9 sources · 2h ago', badge: '' },
          { icon: 'search', title: 'Mediterranean diet: what the evidence says', sub: '22 sources · Yesterday', badge: '★' },
          { icon: 'search', title: 'Lithium supply constraints 2025–2035', sub: '11 sources · 3d ago', badge: '' },
        ]},
      ],
    },
    {
      id: 'synthesis', label: 'Synthesis',
      content: [
        { type: 'metric', label: 'Week in Review — Mar 17–24', value: '56', sub: 'Sources researched across 4 threads' },
        { type: 'metric-row', items: [
          { label: 'Threads', value: '4' },
          { label: 'Saved Notes', value: '2' },
          { label: 'Avg. Confidence', value: '89%' },
        ]},
        { type: 'progress', items: [
          { label: 'AI / ML', pct: 48 },
          { label: 'Engineering', pct: 22 },
          { label: 'Health & Science', pct: 18 },
          { label: 'Markets', pct: 12 },
        ]},
        { type: 'text', label: 'Key Insight', value: '"Constitutional AI represents a shift from external to internal alignment — the model learns to police itself, reducing dependency on adversarial red-teaming."' },
        { type: 'list', items: [
          { icon: 'star', title: 'arxiv.org', sub: '14 references this week', badge: '#1' },
          { icon: 'star', title: 'anthropic.com', sub: '9 references this week', badge: '#2' },
          { icon: 'star', title: 'nature.com', sub: '8 references this week', badge: '#3' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'discover', label: 'Discover', icon: 'search' },
    { id: 'research', label: 'Research', icon: 'eye' },
    { id: 'sources',  label: 'Sources',  icon: 'layers' },
    { id: 'library',  label: 'Library',  icon: 'star' },
    { id: 'synthesis',label: 'Synthesis',icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'sage-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
