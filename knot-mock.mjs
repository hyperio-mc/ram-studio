import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'KNOT',
  tagline:   'Where ideas connect.',
  archetype: 'personal-knowledge-graph-dark',
  palette: {
    bg:      '#09090F',
    surface: '#121219',
    text:    '#E9EDF6',
    accent:  '#7C6EF2',
    accent2: '#34D399',
    muted:   'rgba(233,237,246,0.4)',
  },
  lightPalette: {
    bg:      '#F5F4FF',
    surface: '#FFFFFF',
    text:    '#0F0E1A',
    accent:  '#5B4DE0',
    accent2: '#16A066',
    muted:   'rgba(15,14,26,0.45)',
  },
  nav: [
    { id: 'graph',   label: '◉ Graph' },
    { id: 'notes',   label: '✎ Notes' },
    { id: 'capture', label: '⊕ Capture' },
    { id: 'search',  label: '⌕ Search' },
    { id: 'daily',   label: '☀ Daily' },
  ],
  screens: [
    {
      id: 'graph',
      label: 'Knowledge Graph',
      hero: {
        eyebrow: '◉ KNOWLEDGE GRAPH',
        title:   'Knowledge Graph',
        subtitle: '247 notes · 89 connections · 12 AI insights',
        tag:     '◈ AI Insight active',
      },
      metrics: [
        { label: 'NOTES',       value: '247', delta: '+3',  up: true },
        { label: 'CONNECTIONS', value: '89',  delta: '+7',  up: true },
        { label: 'AI INSIGHTS', value: '12',  delta: 'today', up: true },
      ],
      alerts: [
        { icon: '◈', msg: 'AI in 2026 connects 12 notes. Strongest: Agentic UX → Eval loops', tag: 'Insight', urgent: false },
        { icon: '→', msg: 'Suggested: link Memory + Reflection — 82% semantic overlap', tag: 'Suggest', urgent: false },
        { icon: '✦', msg: 'New connection found: Product Sync capture → API rate limits', tag: 'New', urgent: false },
      ],
    },
    {
      id: 'notes',
      label: 'Note',
      hero: {
        eyebrow: '// NOTE',
        title:   'AI agents need iterative evaluation loops',
        subtitle: 'Apr 3, 2026 · #ai-agents · #eval · #nngroup · 3 backlinks',
        tag:     '◈ 3 connections suggested',
      },
      items: [
        { label: 'An AI agent pursues a goal by iteratively taking actions', sub: 'evaluating progress, and deciding next steps.', tag: 'body' },
        { label: '1. Observe  2. Reason  3. Act  4. Evaluate', sub: 'The eval loop is the hardest. Without it, agents hallucinate.', tag: 'list' },
        { label: 'BACKLINKS (3)', sub: 'Dispatch: AI agent UX patterns · LLM limits · KNOT principles', tag: 'backlinks' },
        { label: 'AI SUGGESTION', sub: 'Connect to: Dispatch patterns, Copilot UX — strong semantic overlap', tag: 'ai' },
      ],
    },
    {
      id: 'capture',
      label: 'Capture',
      hero: {
        eyebrow: '⏺ REC · CAPTURE',
        title:   'Product Sync',
        subtitle: 'Apr 4, 2026 · 9:00 AM · Sarah, Marco, Lena, you · 12 min',
        tag:     '◉ AI extracting in real-time',
      },
      items: [
        { label: 'Sarah: Q2 roadmap sign-off',           sub: 'this week',  tag: 'action' },
        { label: 'Marco: Escalate API rate limit to eng', sub: 'today',      tag: 'action' },
        { label: 'Lena: Share UX research deck',          sub: 'async',      tag: 'action' },
        { label: 'DECISION: Dispatch integration → P1',   sub: 'next sprint', tag: 'decision' },
        { label: 'LINK TO: Dispatch · API rate limits',   sub: 'Agentic UX', tag: 'link' },
      ],
    },
    {
      id: 'search',
      label: 'Semantic Search',
      hero: {
        eyebrow: '// SEARCH',
        title:   'Semantic Search',
        subtitle: 'Query: "eval loop AI agents" · 4 notes · AI synthesis ready',
        tag:     '◉ 98% top match',
      },
      items: [
        { label: 'AI agents need iterative evaluation loops',  sub: 'Apr 3 · 98% match · #ai-agents #eval', tag: '98%' },
        { label: 'Dispatch: AI agent UX patterns',             sub: 'Apr 2 · 91% match · #dispatch',        tag: '91%' },
        { label: 'LLM limits in practice',                     sub: 'Mar 30 · 84% match · #llm',            tag: '84%' },
        { label: 'Tool use and grounding',                     sub: 'Mar 28 · 72% match · #grounding',      tag: '72%' },
      ],
    },
    {
      id: 'daily',
      label: 'Daily',
      hero: {
        eyebrow: '☀ DAILY · APR 4',
        title:   'Good morning.',
        subtitle: '247 notes · 89 threads · 12 captures this month',
        tag:     '3 ideas to connect today',
      },
      items: [
        { label: 'AI agents + Eval loops — ready to synthesize?',     sub: '3 notes written this week on this cluster', tag: 'connect' },
        { label: 'Agentic UX → Dispatch patterns',                    sub: 'Not yet linked — strong overlap detected',  tag: 'new' },
        { label: 'Unresolved: "How do agents know when done?"',        sub: 'From Mar 28 — still open',                  tag: 'open' },
        { label: 'Meeting: Product Sync → API rate limits',            sub: 'New connection from yesterday',             tag: 'new' },
      ],
    },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'knot-mock', design.appName + ' — Interactive Mock');
console.log('Mock live at:', result.url);
