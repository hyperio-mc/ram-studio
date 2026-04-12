// lane-mock.mjs — Svelte 5 interactive mock for LANE
import { buildMock, generateSvelteComponent, publishMock } from './svelte-mock-builder.mjs';

const design = {
  appName:   'LANE',
  tagline:   'AI workflow builder & run scheduler for production agent pipelines.',
  archetype: 'developer-tools',
  palette: {           // dark theme
    bg:      '#1A1714',
    surface: '#231F1B',
    text:    '#F0EDE8',
    accent:  '#C94A14',
    accent2: '#3B6FD4',
    muted:   'rgba(240,237,232,0.35)',
  },
  lightPalette: {      // light theme (primary)
    bg:      '#F4F2ED',
    surface: '#FFFFFF',
    text:    '#1B1916',
    accent:  '#C94A14',
    accent2: '#1E40AF',
    muted:   'rgba(27,25,22,0.42)',
  },
  screens: [
    {
      id: 'lanes', label: 'Lanes',
      content: [
        { type: 'metric', label: 'Total Runs (Month)', value: '2.2K', sub: '+18% vs last month' },
        { type: 'metric-row', items: [{ label: 'Avg Success', value: '93%' }, { label: 'Active Lanes', value: '4' }] },
        { type: 'list', items: [
          { icon: 'activity', title: 'content-writer',  sub: '342 runs · 97% success · claude-3.5', badge: '▶' },
          { icon: 'check',    title: 'lead-classifier', sub: '1,204 runs · 99% · gpt-4o-mini',       badge: '✓' },
          { icon: 'alert',    title: 'doc-ingestion',   sub: '78 runs · 81% success · ERROR',        badge: '!' },
          { icon: 'play',     title: 'support-triage',  sub: '561 runs · 94% · queued',              badge: '○' },
        ]},
      ],
    },
    {
      id: 'builder', label: 'Build',
      content: [
        { type: 'metric', label: 'Pipeline: content-writer', value: '4 steps', sub: 'Research → Outline → Draft → Validate' },
        { type: 'tags', label: 'Step Types', items: ['LLM × 3', 'TOOL × 1', 'claude-3.5', 'validator'] },
        { type: 'list', items: [
          { icon: 'star',  title: 'S1 · research',      sub: 'LLM · claude-3.5 → research_notes',  badge: '①' },
          { icon: 'star',  title: 'S2 · outline',       sub: 'LLM · claude-3.5 → outline',         badge: '②' },
          { icon: 'star',  title: 'S3 · draft',         sub: 'LLM · claude-3.5 → draft_html',      badge: '③' },
          { icon: 'check', title: 'S4 · quality-check', sub: 'TOOL · validator → report',          badge: '④' },
        ]},
        { type: 'text', label: 'Flow', value: 'Inputs: topic, context → research_notes → outline → draft_html → report (OUTPUT)' },
      ],
    },
    {
      id: 'runs', label: 'Runs',
      content: [
        { type: 'metric', label: 'Throughput', value: '16 / hr', sub: 'Current hour · Live' },
        { type: 'list', items: [
          { icon: 'activity', title: 'content-writer — run_f9a2',   sub: 'RUNNING · 3.2s+ · 6.1K tokens · now',    badge: '▶' },
          { icon: 'check',    title: 'lead-classifier — run_e8b1',  sub: 'SUCCESS · 0.4s · 820 tokens · 4m ago',   badge: '✓' },
          { icon: 'alert',    title: 'doc-ingestion — run_c6d9',    sub: 'ERROR · 1.1s · 2.4K tokens · 28m ago',   badge: '!' },
          { icon: 'check',    title: 'content-writer — run_b5e8',   sub: 'SUCCESS · 8.7s · 9.2K tokens · 35m ago', badge: '✓' },
          { icon: 'play',     title: 'support-triage — run_a4f7',   sub: 'QUEUED · —',                             badge: '○' },
        ]},
      ],
    },
    {
      id: 'analytics', label: 'Analytics',
      content: [
        { type: 'metric-row', items: [{ label: 'Success Rate', value: '93.4%' }, { label: 'Week Cost', value: '$91.15' }] },
        { type: 'progress', items: [
          { label: 'lead-classifier (99%)',  pct: 99 },
          { label: 'content-writer (97%)',   pct: 97 },
          { label: 'support-triage (94%)',   pct: 94 },
          { label: 'doc-ingestion (81%)',    pct: 81 },
        ]},
        { type: 'list', items: [
          { icon: 'chart', title: 'content-writer',  sub: '342 calls · $48.20 · 97% success', badge: '▌' },
          { icon: 'chart', title: 'support-triage',  sub: '561 calls · $18.60 · 94%',          badge: '▌' },
          { icon: 'chart', title: 'lead-classifier', sub: '892 calls · $6.40 · 99%',           badge: '▌' },
        ]},
      ],
    },
    {
      id: 'team', label: 'Team',
      content: [
        { type: 'metric', label: 'Acme Corp — Pro Plan', value: '4 members', sub: '2,193 of 5,000 runs used this month' },
        { type: 'list', items: [
          { icon: 'user', title: 'Ava Nakamura',  sub: 'Admin · ava@acme.io',   badge: '✓' },
          { icon: 'user', title: 'Dani Reyes',    sub: 'Developer · active',     badge: '✓' },
          { icon: 'user', title: 'Priya Sharma',  sub: 'Developer · active',     badge: '✓' },
          { icon: 'user', title: 'Lena Brückner', sub: 'Viewer · pending invite', badge: '○' },
        ]},
        { type: 'tags', label: 'Integrations', items: ['OpenAI ✓', 'Anthropic ✓', 'Slack ✓', 'Datadog…'] },
        { type: 'text', label: 'API Keys', value: 'Production: lane_live_k9x2… (used 1m ago) · Staging: lane_test_4m7r… (3h ago)' },
      ],
    },
  ],
  nav: [
    { id: 'lanes',     label: 'Lanes',     icon: 'grid'     },
    { id: 'builder',   label: 'Build',     icon: 'layers'   },
    { id: 'runs',      label: 'Runs',      icon: 'activity' },
    { id: 'analytics', label: 'Analytics', icon: 'chart'    },
    { id: 'team',      label: 'Team',      icon: 'user'     },
  ],
};

const svelteSource = generateSvelteComponent(design);
const html = await buildMock(svelteSource, { appName: design.appName, tagline: design.tagline });
const result = await publishMock(html, 'lane-mock', 'LANE — Interactive Mock');
console.log('Mock live at:', result.url);
