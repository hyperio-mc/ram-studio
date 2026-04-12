import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'GRAFT',
  tagline:   'Branch, test & trace AI workflows',
  archetype: 'ai-observability-dev-tool',
  palette: {
    bg:      '#0D0F14',
    surface: '#151821',
    text:    '#E6E3DE',
    accent:  '#1ACA8A',
    accent2: '#6B48FF',
    muted:   'rgba(230,227,222,0.42)',
  },
  lightPalette: {
    bg:      '#F4F2EF',
    surface: '#FFFFFF',
    text:    '#1C1A17',
    accent:  '#1ACA8A',
    accent2: '#6B48FF',
    muted:   'rgba(28,26,23,0.45)',
  },
  screens: [
    {
      id: 'overview', label: 'Overview',
      content: [
        { type: 'metric', label: 'Runs This Week', value: '2,841', sub: '+18% vs last week' },
        { type: 'metric-row', items: [
          { label: 'Success Rate', value: '97.3%' },
          { label: 'Avg Latency', value: '1.4s' },
          { label: 'Cost / Week', value: '$24.80' },
        ]},
        { type: 'progress', items: [
          { label: 'main (GPT-4o)', pct: 65 },
          { label: 'exp/chain-of-thought', pct: 15 },
          { label: 'exp/gemini-flash', pct: 12 },
          { label: 'fix/retry-logic', pct: 8 },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'main', sub: 'Production -- 98.2% success', badge: 'active' },
          { icon: 'layers', title: 'exp/chain-of-thought', sub: 'Testing CoT -- 96.8% success', badge: 'test' },
          { icon: 'zap', title: 'exp/gemini-flash', sub: 'Gemini Flash -- 0.8s latency', badge: 'test' },
          { icon: 'alert', title: 'fix/retry-logic', sub: 'Retry logic -- 99.1% success', badge: 'stage' },
        ]},
      ],
    },
    {
      id: 'runs', label: 'Runs',
      content: [
        { type: 'metric-row', items: [
          { label: 'Total Runs', value: '2,841' },
          { label: 'Running Now', value: '4' },
          { label: 'Failed', value: '62' },
        ]},
        { type: 'list', items: [
          { icon: 'check', title: 'RUN-9041', sub: 'main -- GPT-4o -- 1.18s -- $0.011', badge: 'ok' },
          { icon: 'play',  title: 'RUN-9040', sub: 'exp/chain-of-thought -- running...', badge: '...' },
          { icon: 'check', title: 'RUN-9039', sub: 'main -- 1.24s -- 1,380 tokens', badge: 'ok' },
          { icon: 'check', title: 'RUN-9038', sub: 'exp/gemini-flash -- 0.79s -- $0.003', badge: 'ok' },
          { icon: 'alert', title: 'RUN-9036', sub: 'main -- FAILED -- timeout 4.02s', badge: '!' },
          { icon: 'check', title: 'RUN-9035', sub: 'exp/chain-of-thought -- 2.11s -- $0.017', badge: 'ok' },
        ]},
        { type: 'tags', label: 'Quick Filters', items: ['All', 'main', 'failed', 'running', 'Gemini'] },
      ],
    },
    {
      id: 'trace', label: 'Trace',
      content: [
        { type: 'metric', label: 'RUN-9041 -- Total Duration', value: '1,184ms', sub: 'main -- GPT-4o -- success' },
        { type: 'metric-row', items: [
          { label: 'Input Tokens', value: '842' },
          { label: 'Output Tokens', value: '578' },
          { label: 'Cost', value: '$0.011' },
        ]},
        { type: 'progress', items: [
          { label: 'LLM Inference (GPT-4o)', pct: 75 },
          { label: 'Context Retrieval (RAG)', pct: 10 },
          { label: 'Result Storage', pct: 6 },
          { label: 'Prompt Assembly', pct: 2 },
          { label: 'Output Parsing', pct: 3 },
          { label: 'Webhook Dispatch', pct: 4 },
        ]},
        { type: 'text', label: 'Input Preview', value: 'Summarize the following customer feedback in 3 bullet points, focusing on actionable insights...' },
        { type: 'text', label: 'Output Preview', value: '- Onboarding improvement is recognized -- much clearer now. - Pricing page remains a friction point. - Support engaged but should not be needed for pricing.' },
      ],
    },
    {
      id: 'compare', label: 'Compare',
      content: [
        { type: 'metric', label: 'A/B: main vs exp/chain-of-thought', value: 'A wins', sub: 'Over 100 runs -- B costs 2x more for +0.4% accuracy' },
        { type: 'list', items: [
          { icon: 'check', title: 'Success Rate', sub: 'main: 98.2% -- CoT: 96.8%', badge: 'A' },
          { icon: 'zap',   title: 'Avg Latency', sub: 'main: 1.2s -- CoT: 2.1s', badge: 'A' },
          { icon: 'chart', title: 'Avg Tokens', sub: 'main: 1,380 -- CoT: 2,210', badge: 'A' },
          { icon: 'star',  title: 'LLM Accuracy', sub: 'main: 92.1% -- CoT: 92.5%', badge: 'B' },
          { icon: 'filter',title: 'Avg Cost/Run', sub: 'main: $0.009 -- CoT: $0.017', badge: 'A' },
        ]},
        { type: 'tags', label: 'Verdict', items: ['main wins on speed', 'main wins on cost', 'CoT: +0.4% accuracy'] },
        { type: 'text', label: 'Recommendation', value: 'CoT variant is not worth promoting. 2x cost for marginal accuracy gain. Close exp/chain-of-thought branch.' },
      ],
    },
    {
      id: 'cost', label: 'Cost',
      content: [
        { type: 'metric', label: 'April 2026 Spend', value: '$24.80', sub: '+$3.10 vs March -- projected $31.20' },
        { type: 'metric-row', items: [
          { label: 'Budget', value: '$50.00' },
          { label: 'Remaining', value: '$25.20' },
          { label: 'Avg/Day', value: '$3.54' },
        ]},
        { type: 'progress', items: [
          { label: 'GPT-4o (main) -- $16.56', pct: 67 },
          { label: 'GPT-4o (CoT exp) -- $7.00', pct: 28 },
          { label: 'Gemini Flash -- $0.72', pct: 3 },
          { label: 'GPT-4o (retry) -- $0.52', pct: 2 },
        ]},
        { type: 'list', items: [
          { icon: 'zap',   title: 'Switch to Gemini Flash', sub: '3x cheaper with only -2.7% accuracy loss', badge: 'HIGH' },
          { icon: 'alert', title: 'Close CoT branch', sub: '2x cost for +0.4% accuracy -- not worth it', badge: 'MED' },
          { icon: 'check', title: 'Promote retry logic', sub: 'Eliminates expensive failed runs', badge: 'LOW' },
        ]},
      ],
    },
  ],
  nav: [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'runs',     label: 'Runs',     icon: 'list' },
    { id: 'trace',    label: 'Trace',    icon: 'activity' },
    { id: 'compare',  label: 'Compare',  icon: 'layers' },
    { id: 'cost',     label: 'Cost',     icon: 'chart' },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'graft-mock', 'GRAFT -- Interactive Mock');
console.log('Mock live at:', result.url);
