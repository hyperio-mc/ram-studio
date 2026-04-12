import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'TORCH',
  tagline:   'Intelligence. Illuminated.',
  archetype: 'ai-research-intelligence',

  palette: {                         // Dark theme (required)
    bg:      '#07060F',
    surface: '#16132B',
    text:    '#EDE9FF',
    accent:  '#8B5CF6',
    accent2: '#F59E0B',
    muted:   'rgba(157,147,204,0.45)',
  },
  lightPalette: {                    // Light theme (optional)
    bg:      '#F5F3FF',
    surface: '#FFFFFF',
    text:    '#1E1B2E',
    accent:  '#7C3AED',
    accent2: '#D97706',
    muted:   'rgba(30,27,46,0.4)',
  },

  screens: [
    {
      id: 'command',
      label: 'Command Center',
      content: [
        { type: 'metric', label: 'Active Signals', value: '247', sub: '+12 today · monitoring pulse active' },
        { type: 'metric-row', items: [
          { label: 'Intel Score', value: '94' },
          { label: 'New Insights', value: '31' },
          { label: 'Alerts', value: '3' },
        ]},
        { type: 'list', items: [
          { icon: 'zap', title: 'GPT-5 API now in public beta', sub: '4m ago · AI · Score 98', badge: '🔴' },
          { icon: 'chart', title: 'NVIDIA Q1 earnings beat by 18%', sub: '12m ago · Markets · Score 87', badge: '🟡' },
          { icon: 'alert', title: 'EU AI Act enforcement Q3 2026', sub: '1h ago · Policy · Score 74', badge: '🟢' },
        ]},
        { type: 'progress', items: [
          { label: 'Weekly Pulse', pct: 78 },
          { label: 'AI Topic', pct: 89 },
          { label: 'Markets', pct: 64 },
        ]},
      ],
    },
    {
      id: 'feed',
      label: 'Signal Feed',
      content: [
        { type: 'tags', label: 'Filter', items: ['All', 'AI', 'Markets', 'Policy', 'Tech', 'Space'] },
        { type: 'list', items: [
          { icon: 'zap',      title: 'GPT-5 multimodal API in public beta', sub: '4m · TechCrunch · 98', badge: '🔴' },
          { icon: 'chart',    title: 'NVIDIA Q1 beats consensus by 18%', sub: '12m · Reuters · 87', badge: '🟡' },
          { icon: 'activity', title: 'EU AI Act enforcement moves to Q3', sub: '1h · Politico · 74', badge: '🟢' },
          { icon: 'star',     title: 'Apple Intelligence expands to 40 langs', sub: '2h · The Verge · 61', badge: '✓' },
          { icon: 'eye',      title: 'SpaceX Starship V4 orbital success', sub: '3h · Space.com · 55', badge: '✓' },
        ]},
        { type: 'text', label: 'Load More', value: '↓ 42 more signals waiting' },
      ],
    },
    {
      id: 'topics',
      label: 'Topic Map',
      content: [
        { type: 'metric', label: 'Monitored Topics', value: '14', sub: 'Across 7 domains' },
        { type: 'list', items: [
          { icon: 'zap',      title: 'AI & Machine Learning', sub: '89 signals · 4 critical', badge: '#8B5CF6' },
          { icon: 'chart',    title: 'Financial Markets', sub: '45 signals · 1 critical', badge: '#F59E0B' },
          { icon: 'activity', title: 'Tech Policy & Regulation', sub: '31 signals · 2 medium', badge: '#22D3EE' },
          { icon: 'code',     title: 'Developer Tools', sub: '27 signals · 0 critical', badge: '#10B981' },
          { icon: 'heart',    title: 'Health & Biotech', sub: '18 signals · 1 medium', badge: '#F472B6' },
        ]},
        { type: 'progress', items: [
          { label: 'AI', pct: 100 },
          { label: 'Markets', pct: 51 },
          { label: 'Policy', pct: 35 },
          { label: 'Tech', pct: 30 },
        ]},
      ],
    },
    {
      id: 'insight',
      label: 'Insight Detail',
      content: [
        { type: 'metric', label: 'Relevance Score', value: '98', sub: 'Critical · AI · TechCrunch · 4m ago' },
        { type: 'text', label: 'Headline', value: 'GPT-5 multimodal API now in public beta — real-time vision and audio in one unified endpoint.' },
        { type: 'text', label: 'AI Summary', value: 'OpenAI has released GPT-5 into public beta with full multimodal capabilities. Developers report a significant capability leap over GPT-4o, particularly in agentic tasks and real-time vision.' },
        { type: 'text', label: 'Key Quote', value: '"This changes the entire agentic stack." — Andrej Karpathy' },
        { type: 'list', items: [
          { icon: 'star',    title: 'Claude 4 Opus benchmarks surface', sub: '1h ago · AI', badge: '87' },
          { icon: 'activity', title: 'Gemini Ultra 2 pricing cut 40%', sub: '3h ago · AI', badge: '61' },
        ]},
      ],
    },
    {
      id: 'brief',
      label: 'Brief Builder',
      content: [
        { type: 'tags', label: 'Time Range', items: ['Today', '7 Days', '30 Days', 'Custom'] },
        { type: 'tags', label: 'Topics', items: ['AI ✓', 'Markets ✓', 'Tech ✓', 'Policy', 'Health'] },
        { type: 'metric-row', items: [
          { label: 'Signals', value: '31' },
          { label: 'Critical', value: '3' },
          { label: 'High', value: '8' },
        ]},
        { type: 'text', label: 'Executive Summary', value: 'AI landscape shift underway as GPT-5 enters beta. Markets rally on chip demand surge. EU enforcement timeline confirmed for Q3.' },
        { type: 'text', label: 'Top Insight', value: 'GPT-5 multimodal API signals agent-first development paradigm shift by H2 2026.' },
        { type: 'text', label: 'Trending', value: 'Agentic AI development up 340% vs Q1 2026 across monitored developer forums.' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      content: [
        { type: 'metric-row', items: [
          { label: 'Signals', value: '2.4K' },
          { label: 'Briefs', value: '37' },
          { label: 'Topics', value: '14' },
          { label: 'Streak', value: '21d' },
        ]},
        { type: 'list', items: [
          { icon: 'bell',     title: 'Alert Sensitivity', sub: 'High — all critical signals', badge: '→' },
          { icon: 'zap',      title: 'AI Model', sub: 'Torch-Ultra (latest)', badge: '→' },
          { icon: 'calendar', title: 'Daily Digest', sub: '8:00 AM — enabled', badge: '✓' },
          { icon: 'settings', title: 'Auto-brief Generation', sub: 'Every 24 hours', badge: '✓' },
        ]},
        { type: 'text', label: 'Plan', value: '⚡ Pro — Unlimited signals, unlimited briefs, team sharing' },
      ],
    },
  ],

  nav: [
    { id: 'command', label: 'Command', icon: 'grid' },
    { id: 'feed',    label: 'Signals', icon: 'activity' },
    { id: 'topics',  label: 'Topics',  icon: 'layers' },
    { id: 'brief',   label: 'Briefs',  icon: 'list' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'torch-mock', 'TORCH — Interactive Mock');
console.log(`Mock: ${result.status} → https://ram.zenbin.org/torch-mock`);
